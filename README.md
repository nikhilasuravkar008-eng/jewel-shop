# Suravkar Jewels - showroom

Structure
- index.html        : page structure and text (shop address, hours, phone)
- css/styles.css    : colours, fonts, layout (colours at the top under :root)
- js/supabase.js    : database connection (public read only)
- js/script.js      : showroom logic (categories, budget buttons, product cards)

Products now come from the Supabase "products" table. Add rows in Supabase
(Table Editor) until the admin panel is built.

Run locally: open the folder in VS Code and use the Live Server extension on index.html.

Placeholders still to replace in index.html: [Shop address...], [days], [opening time], [closing time], and the Google Maps link in the Directions button.

Admin panel (phase 3)
- admin/index.html : owner's admin page, opens at /admin on the live site
- css/admin.css    : admin styling
- js/admin.js      : sign in, add / edit / sold out / delete products, photo upload
- js/compress.js   : shrinks photos in the browser before upload
Login uses Supabase email and password. Only emails listed in the "admins" table can make changes.