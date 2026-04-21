/**
 * Push Notification Utilities
 *
 * Handles FCM token lifecycle:
 *  1. Request browser notification permission
 *  2. Get/refresh the FCM device token
 *  3. Store/remove the token in Firebase Realtime Database
 *  4. Listen for foreground messages
 */

import { getToken, onMessage, deleteToken } from 'firebase/messaging';
import { ref, set, remove, get } from 'firebase/database';
import { database, messagingPromise } from '../config/firebase';

const VAPID_KEY = process.env.REACT_APP_FIREBASE_VAPID_KEY;

/**
 * Check if the browser supports push notifications.
 */
export const isPushSupported = () => {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
};

/**
 * Get the current notification permission state.
 * @returns {'granted' | 'denied' | 'default' | 'unsupported'}
 */
export const getNotificationPermission = () => {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission;
};

/**
 * Request notification permission and register the FCM token for a parent.
 *
 * @param {string} parentUid – The parent's Firebase Auth UID
 * @returns {Promise<{success: boolean, token?: string, error?: string}>}
 */
export const requestAndSaveToken = async (parentUid) => {
  if (!isPushSupported()) {
    return { success: false, error: 'Push notifications are not supported in this browser.' };
  }

  if (!VAPID_KEY) {
    console.error('VAPID key is not configured. Set REACT_APP_FIREBASE_VAPID_KEY in .env');
    return { success: false, error: 'Push notification configuration missing.' };
  }

  try {
    // Request permission (shows the browser "Allow notifications?" prompt)
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { success: false, error: 'Notification permission denied by user.' };
    }

    // Wait for messaging to initialise
    const messaging = await messagingPromise;
    if (!messaging) {
      return { success: false, error: 'Firebase Messaging is not supported in this browser.' };
    }

    // Register the service worker explicitly so we control which file is used.
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

    // Wait for the service worker to become active before requesting the token.
    // On mobile Chrome, calling getToken() before the SW is active silently fails.
    await waitForServiceWorkerActive(registration);

    // Get (or refresh) the FCM device token
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (!token) {
      return { success: false, error: 'Failed to get notification token.' };
    }

    // Save token to Realtime Database under the parent's record.
    // We use a simple hash of the token as the key so a parent with multiple
    // browsers/devices gets one entry per token.
    const tokenKey = simpleHash(token);
    await set(ref(database, `users/parents/${parentUid}/fcmTokens/${tokenKey}`), {
      token,
      createdAt: Date.now(),
      userAgent: navigator.userAgent,
    });

    console.log('[Push] FCM token registered:', token.slice(0, 20) + '…');
    return { success: true, token };
  } catch (error) {
    console.error('[Push] Error requesting notification permission:', error);
    return { success: false, error: error.message || 'Unknown error.' };
  }
};

/**
 * Remove all FCM tokens for a parent (call on logout).
 */
export const removeToken = async (parentUid) => {
  try {
    const messaging = await messagingPromise;
    if (messaging) {
      await deleteToken(messaging);
    }
    // Remove this browser's token from the database
    await remove(ref(database, `users/parents/${parentUid}/fcmTokens`));
    console.log('[Push] FCM tokens removed.');
  } catch (error) {
    console.error('[Push] Error removing token:', error);
  }
};

/**
 * Remove only the current device's FCM token (call on logout).
 * Keeps tokens from other devices intact.
 */
export const removeCurrentDeviceToken = async (parentUid) => {
  try {
    const messaging = await messagingPromise;
    if (!messaging) return;

    // Get the current token so we can identify which DB entry to remove
    const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
    if (!registration) return;

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      const tokenKey = simpleHash(token);
      await remove(ref(database, `users/parents/${parentUid}/fcmTokens/${tokenKey}`));
      await deleteToken(messaging);
      console.log('[Push] Current device FCM token removed.');
    }
  } catch (error) {
    console.error('[Push] Error removing current device token:', error);
  }
};

/**
 * Listen for foreground messages (when the tab is open and in focus).
 * Returns an unsubscribe function.
 *
 * @param {function} callback – Called with the message payload
 * @returns {Promise<function|null>} unsubscribe function, or null if unsupported
 */
export const onForegroundMessage = async (callback) => {
  const messaging = await messagingPromise;
  if (!messaging) return null;

  return onMessage(messaging, (payload) => {
    console.log('[Push] Foreground message received:', payload);
    callback(payload);
  });
};

/**
 * Check if the parent has any FCM tokens registered.
 */
export const hasRegisteredTokens = async (parentUid) => {
  try {
    const snapshot = await get(ref(database, `users/parents/${parentUid}/fcmTokens`));
    return snapshot.exists();
  } catch {
    return false;
  }
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Simple deterministic hash for use as a Firebase key.
 * We just need something short and consistent — not cryptographic.
 */
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit integer
  }
  // Return a positive hex string
  return (hash >>> 0).toString(16);
}

/**
 * Wait for a service worker registration to reach the 'activated' state.
 * On mobile Chrome, getToken() silently fails if called while the SW is
 * still in 'installing' or 'waiting' state.
 *
 * @param {ServiceWorkerRegistration} registration
 * @returns {Promise<void>}
 */
function waitForServiceWorkerActive(registration) {
  return new Promise((resolve) => {
    if (registration.active) {
      return resolve();
    }
    const sw = registration.installing || registration.waiting;
    if (!sw) return resolve();
    sw.addEventListener('statechange', function onStateChange() {
      if (sw.state === 'activated') {
        sw.removeEventListener('statechange', onStateChange);
        resolve();
      }
    });
  });
}
