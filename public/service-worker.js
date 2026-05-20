/* WordPop Service Worker — push notifications + click-through to the quiz */

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data;
  try { data = event.data.json(); }
  catch { data = { title: 'WordPop', body: event.data.text() }; }

  event.waitUntil(
    self.registration.showNotification(data.title || 'WordPop — Quiz Time!', {
      body: data.body || 'Tap to take your quiz!',
      icon: '/icon.svg',
      badge: '/icon.svg',
      data: { url: data.url || '/' },
      requireInteraction: true,
      tag: 'wordpop-quiz',
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of all) {
      if ('focus' in client) {
        if ('navigate' in client) await client.navigate(targetUrl).catch(() => {});
        return client.focus();
      }
    }
    return self.clients.openWindow(targetUrl);
  })());
});
