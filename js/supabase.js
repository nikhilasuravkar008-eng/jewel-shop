// Supabase connection (public showroom only reads products).
// The publishable key is safe to keep in public code. Never put the service_role key here.
var SUPABASE_URL = "https://ghtczukmgawoaukgcrnz.supabase.co";
var SUPABASE_KEY = "sb_publishable_d23dS-qGYpc6uBICRzaRFA_ZxA0bXQt";

function loadProducts() {
  return fetch(SUPABASE_URL + "/rest/v1/products?select=*&order=created_at.desc", {
    headers: { apikey: SUPABASE_KEY }
  })
    .then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(function (rows) {
      return rows.map(function (r) {
        return { n: r.name, c: r.category, p: r.price, nw: r.is_new, s: r.in_stock, img: r.image_url };
      });
    });
}
