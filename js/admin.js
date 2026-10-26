var db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
var BUCKET = "product-images";
var items = [], editing = null, newFile = null;
function $(id) { return document.getElementById(id); }
function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
}
function toast(msg, bad) {
    var t = $("toast");
    t.textContent = msg;
    t.className = "toast show" + (bad ? " bad" : "");
    clearTimeout(toast.t);
    toast.t = setTimeout(function () { t.className = "toast"; }, 3500);
}
function show(id) {
    ["login", "denied", "list", "editor"].forEach(function (x) { $(x).hidden = x !== id; });
    window.scrollTo(0, 0);
}

/* ---------- sign in / out ---------- */
db.auth.getSession().then(function (r) { r.data.session ? enter() : show("login"); });

$("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var btn = $("loginBtn");
    btn.disabled = true; btn.textContent = "Signing in…"; $("loginErr").textContent = "";
    db.auth.signInWithPassword({ email: $("l_email").value.trim(), password: $("l_pass").value }).then(function (r) {
        btn.disabled = false; btn.textContent = "Sign in";
        if (r.error) { $("loginErr").textContent = "Wrong email or password."; return; }
        $("l_pass").value = "";
        enter();
    });
});
function signOut() { db.auth.signOut().then(function () { show("login"); }); }
$("outBtn").addEventListener("click", signOut);
$("deniedOut").addEventListener("click", signOut);

function enter() {
    db.rpc("is_admin").then(function (r) {
        if (r.error || r.data !== true) show("denied");
        else loadList();
    });
}

/* ---------- list ---------- */
function loadList() {
    db.from("products").select("*").order("created_at", { ascending: false }).then(function (r) {
        if (r.error) { toast("Could not load products: " + r.error.message, true); return; }
        items = r.data || [];
        renderList();
        show("list");
    });
}
function renderList() {
    $("count").textContent = items.length ? items.length + " product" + (items.length === 1 ? "" : "s") : "No products yet. Tap the button above to add your first one.";
    $("items").innerHTML = items.map(function (x) {
        var img = x.image_url ? '<img class="th" src="' + esc(x.image_url) + '" alt="" loading="lazy">' : '<div class="th"></div>';
        var badges = (x.is_new ? '<span class="badge">New</span>' : "") + (x.in_stock ? "" : '<span class="badge sold">Sold out</span>');
        return '<article class="item">' + img +
            '<div class="meta"><b>' + esc(x.name) + '</b><span>₹' + esc(x.price) + ' · ' + esc(x.category) + '</span><span>' + badges + '</span></div>' +
            '<div class="acts">' +
            '<button class="btn" data-act="edit" data-id="' + esc(x.id) + '">Edit</button>' +
            '<button class="btn" data-act="stock" data-id="' + esc(x.id) + '">' + (x.in_stock ? "Mark sold out" : "Back in stock") + '</button>' +
            '<button class="btn danger" data-act="del" data-id="' + esc(x.id) + '">Delete</button>' +
            '</div></article>';
    }).join("");
}
function find(id) { return items.filter(function (x) { return x.id === id; })[0]; }

$("items").addEventListener("click", function (e) {
    var b = e.target.closest("button[data-act]");
    if (!b) return;
    var x = find(b.getAttribute("data-id")), act = b.getAttribute("data-act");
    if (!x) return;
    if (act === "edit") openEditor(x);
    if (act === "stock") {
        db.from("products").update({ in_stock: !x.in_stock }).eq("id", x.id).then(function (r) {
            if (r.error) toast("Could not update: " + r.error.message, true);
            else { toast(x.in_stock ? "Marked sold out" : "Back in stock"); loadList(); }
        });
    }
    if (act === "del") {
        if (!confirm('Delete "' + x.name + '"? This cannot be undone.')) return;
        db.from("products").delete().eq("id", x.id).then(function (r) {
            if (r.error) { toast("Could not delete: " + r.error.message, true); return; }
            removeFile(x.image_url);
            toast("Deleted");
            loadList();
        });
    }
});

/* ---------- add / edit ---------- */
function openEditor(x) {
    editing = x || null;
    newFile = null;
    $("f_photo").value = "";
    $("edTitle").textContent = x ? "Edit product" : "Add new product";
    $("f_name").value = x ? x.name : "";
    $("f_price").value = x ? x.price : "";
    $("f_cat").value = x ? x.category : "";
    $("f_new").checked = x ? !!x.is_new : false;
    $("f_stock").checked = x ? !!x.in_stock : true;
    setPreview(x && x.image_url ? x.image_url : "");
    $("saveBtn").textContent = x ? "Save changes" : "Publish";
    show("editor");
}
function setPreview(src) {
    var p = $("f_prev");
    p.hidden = !src;
    if (src) p.src = src;
    $("photoLabel").textContent = src ? "Change photo" : "Take or choose photo";
}
$("addBtn").addEventListener("click", function () { openEditor(null); });
$("cancelBtn").addEventListener("click", function () { show("list"); });
$("f_photo").addEventListener("change", function () {
    var f = this.files && this.files[0];
    if (!f) return;
    newFile = f;
    setPreview(URL.createObjectURL(f));
});

function upload(blob) {
    var path = Date.now() + "-" + Math.random().toString(36).slice(2, 8) + ".jpg";
    return db.storage.from(BUCKET).upload(path, blob, { contentType: "image/jpeg", cacheControl: "31536000" }).then(function (r) {
        if (r.error) throw r.error;
        return db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    });
}
function removeFile(url) {
    if (!url) return;
    var i = url.indexOf("/" + BUCKET + "/");
    if (i < 0) return;
    db.storage.from(BUCKET).remove([decodeURIComponent(url.slice(i + BUCKET.length + 2))]);
}

$("saveBtn").addEventListener("click", function () {
    var name = $("f_name").value.trim();
    var price = parseInt($("f_price").value, 10);
    var cat = $("f_cat").value;
    if (!editing && !newFile) return toast("Please add a photo", true);
    if (!name) return toast("Please enter the product name", true);
    if (isNaN(price) || price < 0) return toast("Please enter a valid price", true);
    if (!cat) return toast("Please choose a category", true);

    var btn = $("saveBtn");
    btn.disabled = true; btn.textContent = "Saving…";
    var oldUrl = editing ? editing.image_url : null;
    var urlP = newFile ? compressImage(newFile).then(upload) : Promise.resolve(oldUrl);

    urlP.then(function (url) {
        var row = { name: name, price: price, category: cat, is_new: $("f_new").checked, in_stock: $("f_stock").checked, image_url: url };
        return editing ? db.from("products").update(row).eq("id", editing.id) : db.from("products").insert(row);
    }).then(function (r) {
        if (r.error) throw r.error;
        if (newFile && oldUrl) removeFile(oldUrl);
        toast(editing ? "Changes saved" : "Published. It is now on the website.");
        loadList();
    }).catch(function (err) {
        toast("Could not save: " + (err.message || err), true);
    }).then(function () {
        btn.disabled = false;
        btn.textContent = editing ? "Save changes" : "Publish";
    });
});