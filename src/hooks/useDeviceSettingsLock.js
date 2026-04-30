import { useState, useEffect, useCallback } from 'react';
import { database } from '../config/firebase';
import { ref, onValue, update, get } from 'firebase/database';

/**
 * useDeviceSettingsLock
 *
 * Manages the "Device Settings Lock" feature for the parent's account.
 * When enabled it:
 *   1. Writes `deviceLocked: true` on every linked child (Android app signal)
 *   2. Blocks the Settings app in each child's apps list so the existing
 *      app-blocking mechanism immediately enforces the restriction
 *
 * Mirrors the useAppLock pattern so the UI is consistent.
 */
export function useDeviceSettingsLock(parentUid) {
  const [isLockEnabled, setIsLockEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  // ── Listen in real-time to the parent's deviceSettingsLocked flag ──────────
  useEffect(() => {
    if (!parentUid) {
      setLoading(false);
      return;
    }

    const parentRef = ref(database, `users/parents/${parentUid}/deviceSettingsLocked`);
    const unsubscribe = onValue(
      parentRef,
      (snapshot) => {
        setIsLockEnabled(snapshot.val() === true);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return unsubscribe;
  }, [parentUid]);

  // ── Known Settings package names across major Android brands ──────────────
  const SETTINGS_PACKAGES = new Set([
    'com.android.settings',
    'com.vivo.settings',
    'com.miui.settings',
    'com.samsung.android.settings',
    'com.huawei.systemmanager',
    'com.oppo.settings',
    'com.realme.settings',
  ]);

  // ── Cascade deviceLocked + block/unblock Settings app ─────────────────────
  const cascadeToChildren = useCallback(async (uid, locked) => {
    const childsRef = ref(database, 'users/childs');
    const snapshot  = await get(childsRef);
    if (!snapshot.exists()) return;

    const allChildren = snapshot.val();
    const emailSnap   = await get(ref(database, `users/parents/${uid}/email`));
    const parentEmail = emailSnap.val();

    const updates = {};

    Object.keys(allChildren).forEach((childId) => {
      const child = allChildren[childId];
      if (child.parentEmail !== parentEmail) return;

      // 1. Set the deviceLocked flag (read by the Android companion app)
      updates[`users/childs/${childId}/deviceLocked`] = locked;

      // 2. Block / unblock the Settings app via the existing app-block field
      if (child.apps) {
        Object.keys(child.apps).forEach((appIndex) => {
          const app = child.apps[appIndex];
          if (app && SETTINGS_PACKAGES.has(app.packageName)) {
            updates[`users/childs/${childId}/apps/${appIndex}/blocked`] = locked;
          }
        });
      }
    });

    if (Object.keys(updates).length > 0) {
      await update(ref(database), updates);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Enable ────────────────────────────────────────────────────────────────
  const enableLock = useCallback(async (uid) => {
    try {
      await update(ref(database, `users/parents/${uid}`), { deviceSettingsLocked: true });
      await cascadeToChildren(uid, true);
      return { success: true };
    } catch (error) {
      console.error('Error enabling device settings lock:', error);
      return { success: false, error };
    }
  }, [cascadeToChildren]);

  // ── Disable ───────────────────────────────────────────────────────────────
  const disableLock = useCallback(async (uid) => {
    try {
      await update(ref(database, `users/parents/${uid}`), { deviceSettingsLocked: false });
      await cascadeToChildren(uid, false);
      return { success: true };
    } catch (error) {
      console.error('Error disabling device settings lock:', error);
      return { success: false, error };
    }
  }, [cascadeToChildren]);

  return { isLockEnabled, loading, enableLock, disableLock };
}
