// Shrinks a phone photo in the browser before upload (about 900px wide, under 200 KB).
function compressImage(file, maxSide, maxBytes) {
  maxSide = maxSide || 900;
  maxBytes = maxBytes || 200 * 1024;
  return loadBitmap(file).then(function (bmp) {
    var s = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
    var w = Math.round(bmp.width * s), h = Math.round(bmp.height * s);
    var cv = document.createElement("canvas");
    cv.width = w; cv.height = h;
    var ctx = cv.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bmp, 0, 0, w, h);
    if (bmp.close) bmp.close();
    return jpegUnder(cv, 0.85, maxBytes);
  });
}
function jpegUnder(cv, q, max) {
  return new Promise(function (resolve, reject) {
    cv.toBlob(function (b) {
      if (!b) return reject(new Error("Could not process the photo"));
      if (b.size <= max || q <= 0.45) resolve(b);
      else resolve(jpegUnder(cv, q - 0.08, max));
    }, "image/jpeg", q);
  });
}
function loadBitmap(file) {
  if (window.createImageBitmap) {
    return createImageBitmap(file, { imageOrientation: "from-image" }).catch(function () { return viaImage(file); });
  }
  return viaImage(file);
}
function viaImage(file) {
  return new Promise(function (resolve, reject) {
    var u = URL.createObjectURL(file), i = new Image();
    i.onload = function () { URL.revokeObjectURL(u); resolve(i); };
    i.onerror = function () { reject(new Error("This file is not a valid photo")); };
    i.src = u;
  });
}