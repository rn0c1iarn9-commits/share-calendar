const CACHE_NAME = "family-calendar-v8"; // ← 更新時は必ずバージョン変更

const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json"
];

/* インストール時：キャッシュ */
self.addEventListener("install", event => {
  self.skipWaiting(); // 新しいSWを即有効化
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

/* 有効化時：古いキャッシュ削除 */
self.addEventListener("activate", event => {
  self.clients.claim(); // すぐページに反映
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

/* フェッチ時：ネット優先（最新を常に取得） */
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 成功したらキャッシュ更新
        const resClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, resClone);
        });
        return response;
      })
      .catch(() => {
        // オフライン時はキャッシュを返す
        return caches.match(event.request);
      })
  );
});