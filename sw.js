// Sangbum App 서비스 워커: 앱을 한 번 열면 오프라인에서도 화면이 열리게 합니다.
// 앱 파일을 수정해 다시 올린 뒤에는 아래 버전 숫자를 올리면 폰에 새 버전이 반영됩니다.
const C = 'sangbum-v1';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin === location.origin) {
    // 내 파일: 인터넷이 되면 최신본, 안 되면 저장본
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)); return res; })
      .catch(() => caches.match(r).then(m => m || caches.match('index.html'))));
  } else if (/jsdelivr\.net|fonts\.(googleapis|gstatic)\.com/.test(u.host)) {
    // 글자 인식 라이브러리와 폰트: 저장본 우선
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)); return res; })));
  }
});
