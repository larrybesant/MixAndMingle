// Service Worker for Push Notifications (MVP)
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Mix & Mingle';
  const options = {
    body: data.body,
    icon: '/favicon.ico',
    data: data.url ? { url: data.url } : undefined
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  }
});
