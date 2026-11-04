/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * LeadDesk Service Worker for Push Notifications
 */

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// Handle incoming Web Push notifications
self.addEventListener('push', event => {
  let data = {
    title: 'LeadDesk Reminder',
    body: 'You have a scheduled lead follow-up due!',
    icon: '/logo.webp',
    badge: '/logo.webp',
    tag: 'follow-up-reminder',
    data: {},
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/logo.webp',
    badge: data.badge || '/logo.webp',
    vibrate: [200, 100, 200],
    data: data.data || {},
    requireInteraction: true,
    actions: [
      { action: 'open', title: 'Open Lead' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification click to navigate to the CRM
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const leadId = event.notification.data?.leadId;
  const targetUrl = leadId ? `/#lead/${leadId}` : '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if ('focus' in client) {
          if (leadId && client.navigate) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
