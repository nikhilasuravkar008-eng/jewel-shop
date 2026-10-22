var CATS = ["All", "Earrings", "Bangles", "Necklaces", "Rings"];
var BUD = [49, 99, 199, 299, 499];
var P = [];
var sel = "All";
var bsel = 49;
var state = "loading"; // loading | ready | failed

function esc(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

// Drawn placeholder, used when a product has no photo yet
function art(c) {
  var g = "#B58E45", s = "";
  if (c === "Earrings") s = '<circle cx="38" cy="36" r="4" fill="' + g + '"/><circle cx="62" cy="36" r="4" fill="' + g + '"/><path d="M38 40v12M62 40v12" stroke="' + g + '" stroke-width="1.6"/><circle cx="38" cy="62" r="9" fill="none" stroke="' + g + '" stroke-width="2.4"/><circle cx="62" cy="62" r="9" fill="none" stroke="' + g + '" stroke-width="2.4"/>';
  if (c === "Bangles") s = '<circle cx="50" cy="50" r="26" fill="none" stroke="' + g + '" stroke-width="5"/><circle cx="50" cy="50" r="17" fill="none" stroke="' + g + '" stroke-width="2" stroke-dasharray="1.5 5"/>';
  if (c === "Necklaces") s = '<path d="M22 28Q50 82 78 28" fill="none" stroke="' + g + '" stroke-width="2.2"/><circle cx="50" cy="66" r="6.5" fill="' + g + '"/><circle cx="36" cy="55" r="2.8" fill="' + g + '"/><circle cx="64" cy="55" r="2.8" fill="' + g + '"/>';
  if (c === "Rings") s = '<circle cx="50" cy="58" r="20" fill="none" stroke="' + g + '" stroke-width="4"/><path d="M42 36l8-10 8 10-8 8z" fill="' + g + '"/>';
  return '<svg class="pic" viewBox="0 0 100 100" role="img" aria-label="' + esc(c) + '"><rect width="100" height="100" fill="rgba(127,127,127,.08)"/>' + s + '</svg>';
}

function card(x) {
  var msg = encodeURIComponent("Hi, I’m interested in " + x.n + " (₹" + x.p + "). Is it available?");
  var pic = x.img ? '<img class="pic" src="' + esc(x.img) + '" alt="' + esc(x.n) + '" loading="lazy">' : art(x.c);
  var tag = !x.s ? '<span class="tag sold">Sold out</span>' : (x.nw ? '<span class="tag">New</span>' : '');
  var btn = x.s
    ? '<a class="ask" href="https://wa.me/917276566218?text=' + msg + '">Ask on WhatsApp</a>'
    : '<span class="ask off">Sold out</span>';
  return '<article class="card' + (x.s ? '' : ' soldout') + '"><div style="position:relative">' + pic + tag + '</div><div class="info"><h3>' + esc(x.n) + '</h3><span class="price">₹' + esc(x.p) + '</span>' + btn + '</div></article>';
}

function list(items, emptyMsg) {
  if (state === "loading") return '<p class="empty">Loading designs…</p>';
  if (state === "failed") return '<p class="empty">Could not load designs right now. Please check your internet and refresh.</p>';
  var h = items.map(card).join("");
  return h || '<p class="empty">' + emptyMsg + '</p>';
}

function drawBudget() {
  document.getElementById("bchips").innerHTML = BUD.map(function (b) {
    return '<button class="chip" aria-pressed="' + (b === bsel) + '" data-b="' + b + '">Under ₹' + b + '</button>';
  }).join("");
  document.getElementById("bgrid").innerHTML = list(P.filter(function (x) { return x.p <= bsel; }), "No designs in this budget right now.");
}

function draw() {
  drawBudget();
  document.getElementById("new").innerHTML = list(P.filter(function (x) { return x.nw && x.s; }), "New designs are coming soon. Visit the shop or message us on WhatsApp.");
  document.getElementById("grid").innerHTML = list(P.filter(function (x) { return sel === "All" || x.c === sel; }), "No designs in this category right now.");
  document.getElementById("chips").innerHTML = CATS.map(function (c) {
    return '<button class="chip" aria-pressed="' + (c === sel) + '" data-c="' + c + '">' + c + '</button>';
  }).join("");
}

document.getElementById("chips").addEventListener("click", function (e) {
  var c = e.target.getAttribute("data-c");
  if (c) { sel = c; draw(); }
});
document.getElementById("bchips").addEventListener("click", function (e) {
  var b = e.target.getAttribute("data-b");
  if (b) { bsel = +b; drawBudget(); }
});

draw();
loadProducts()
  .then(function (rows) { P = rows; state = "ready"; draw(); })
  .catch(function () { state = "failed"; draw(); });
