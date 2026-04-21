/* eslint-disable no-restricted-globals */

// Firebase Messaging Service Worker
// This file MUST live at the root of the public directory so the browser
// can register it with the correct scope ("/").

// Import Firebase scripts (compat versions for service-worker context)
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Initialize Firebase inside the service worker.
// We only need the minimal config fields required for messaging.
firebase.initializeApp({
  apiKey: 'AIzaSyDnC0HvvB-7rQnWeFKV0ttH3mPeNY8AdSU',
  authDomain: 'aegistnet.firebaseapp.com',
  projectId: 'aegistnet',
  storageBucket: 'aegistnet.firebasestorage.app',
  messagingSenderId: '468468639315',
  appId: '1:468468639315:web:64a5197a2e99c7357388a6',
});

const messaging = firebase.messaging();

// Handle background messages (when the tab is closed or not in focus).
// NOTE: We always call showNotification() explicitly — even when payload.notification
// is present — because Android Chrome does NOT reliably auto-display notifications
// when only relying on the FCM SDK's built-in behaviour. Calling it ourselves
// guarantees the notification always appears in the system tray.
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background message received:', payload);

  // Prefer the server-sent notification fields; fall back to data fields
  const notification = payload.notification || {};
  const data = payload.data || {};

  const title = notification.title || data.title || '⚠️ AegisNet Alert';
  const options = {
    body: notification.body || data.body || 'New incident detected on a child device.',
    icon: notification.icon || '/Aegistnet_48x48.png',
    badge: '/Aegistnet_48x48.png',
    tag: 'nsfw-incident-' + (data.incidentId || Date.now()),
    data: {
      url: data.clickAction || data.link || '/incidents',
      incidentId: data.incidentId,
    },
    // Vibrate pattern for mobile browsers that support it
    vibrate: [200, 100, 200],
    // Keep the notification visible until the user interacts (desktop only; ignored on mobile)
    requireInteraction: true,
    // Renotify if a new incident arrives with the same tag
    renotify: true,
  };

  return self.registration.showNotification(title, options);
});

// Handle notification click — open the incidents page
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/incidents';

  // Focus an existing tab or open a new one
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If there's already a tab with our app open, focus it and navigate
      for (const client of clientList) {
        if (client.url.includes(self.location.origin)) {
          client.focus();
          client.navigate(targetUrl);
          return;
        }
      }
      // Otherwise open a new tab
      return self.clients.openWindow(targetUrl);
    })
  );
});
