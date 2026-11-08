// 오프라인에서도 열리게 페이지와 글꼴을 저장해 두는 서비스 워커
var C = "jtp-v12";
self.addEventListener("install", function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(C).then(function (c) { return c.addAll(["./", "./index.html"]); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (ks) {
      return Promise.all(ks.filter(function (k) { return k !== C; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});
self.addEventListener("fetch", function (e) {
  var r = e.request;
  if (r.method !== "GET") return;
  var u = new URL(r.url);
  var same = u.origin === location.origin;
  var font = /(^|\.)(fonts\.googleapis\.com|fonts\.gstatic\.com|unpkg\.com|tile\.openstreetmap\.org)$/.test(u.hostname);
  if (!same && !font) return;
  e.respondWith(
    fetch(r).then(function (res) {
      if (res && (res.ok || res.type === "opaque")) {
        var cp = res.clone();
        caches.open(C).then(function (c) { c.put(r, cp); });
      }
      return res;
    }).catch(function () {
      return caches.match(r, { ignoreSearch: true }).then(function (m) { return m || caches.match("./index.html"); });
    })
  );
});
