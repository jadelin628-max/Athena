/*
 * Service Worker：缓存应用与 KaTeX，实现离线可用
 * 说明：仅在 http(s) 环境下生效（file:// 下浏览器不注册 SW）。
 */
const VERSION = 'ms3-v4';
const APP_CACHE = VERSION + '-app';
const KATEX_CACHE = VERSION + '-katex';

const APP_ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './data/math3.js',
  './data/econ.js',
  './data/stats.js',
  './manifest.webmanifest',
  './katex/katex.min.js',
  './katex/katex.min.css',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(APP_CACHE).then(function (cache) {
      return cache.addAll(APP_ASSETS);
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k.indexOf(VERSION) === -1; })
          .map(function (k) { return caches.delete(k); })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // KaTeX（本地或 CDN）：缓存优先 + 后台更新（首次联网加载后即可离线）
  if (/katex/i.test(url.href)) {
    e.respondWith(
      caches.match(req).then(function (cached) {
        const network = fetch(req).then(function (resp) {
          if (resp && (resp.status === 200 || resp.type === 'opaque')) {
            const clone = resp.clone();
            caches.open(KATEX_CACHE).then(function (c) { c.put(req, clone); });
          }
          return resp;
        }).catch(function () { return cached; });
        return cached || network;
      })
    );
    return;
  }

  // 页面导航：网络优先，回退缓存
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(function (resp) {
        const clone = resp.clone();
        caches.open(APP_CACHE).then(function (c) { c.put('./index.html', clone); });
        return resp;
      }).catch(function () {
        return caches.match('./index.html').then(function (cached) {
          return cached || caches.match(req);
        });
      })
    );
    return;
  }

  // 其他静态资源（app.js / style.css / 图标等）：网络优先，回退缓存
  // 这样上传新版本后，在线刷新即可看到更新，无需手动清缓存
  e.respondWith(
    fetch(req).then(function (resp) {
      if (resp && resp.status === 200) {
        const clone = resp.clone();
        caches.open(APP_CACHE).then(function (c) { c.put(req, clone); });
      }
      return resp;
    }).catch(function () {
      return caches.match(req);
    })
  );
});
