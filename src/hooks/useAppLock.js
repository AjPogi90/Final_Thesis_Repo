import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEYS = {
  ENABLED:  'aegistnet_lock_enabled',
  PIN_HASH: 'aegistnet_lock_pin_hash',
  LOCKED:   'aegistnet_lock_locked',
};

// Salt makes brute-force rainbow-table attacks harder
const SALT = 'aegistnet_v1_2024';

/** SHA-256 hash of pin+salt via Web Crypto API */
async function hashPin(pin) {
  const encoder = new TextEncoder();
  const data    = encoder.encode(pin + SALT);
  const buffer  = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * useAppLock
 *
 * Returns:
 *  isLockEnabled  – whether the parent has set up a PIN
 *  isLocked       – whether the lock screen is currently showing
 *  unlock(pin)    – validate PIN → resolves true/false
 *  enableLock(pin)– set a new PIN and enable lock
 *  disableLock(pin) – verify then remove PIN
 *  changPin(old, new) – verify old PIN then set new PIN
 *  lockNow()      – immediately show the lock screen
 */
export function useAppLock() {
  const [isLockEnabled, setIsLockEnabled] = useState(
    () => localStorage.getItem(STORAGE_KEYS.ENABLED) === 'true'
  );
  const [isLocked, setIsLocked] = useState(false);
  const bgTimestamp = useRef(null);

  // Auto-lock when the app goes to background and comes back after 30 seconds
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        bgTimestamp.current = Date.now();
      } else {
        const enabled = localStorage.getItem(STORAGE_KEYS.ENABLED) === 'true';
        if (enabled && bgTimestamp.current) {
          const away = Date.now() - bgTimestamp.current;
          // Lock if away for more than 30 seconds
          if (away > 30_000) {
            setIsLocked(true);
          }
        }
        bgTimestamp.current = null;
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Lock on first load if PIN is set
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEYS.ENABLED) === 'true') {
      setIsLocked(true);
    }
  }, []);

  const unlock = useCallback(async (pin) => {
    const stored = localStorage.getItem(STORAGE_KEYS.PIN_HASH);
    if (!stored) return false;
    const entered = await hashPin(pin);
    if (entered === stored) {
      setIsLocked(false);
      return true;
    }
    return false;
  }, []);

  const enableLock = useCallback(async (pin) => {
    const hashed = await hashPin(pin);
    localStorage.setItem(STORAGE_KEYS.ENABLED,  'true');
    localStorage.setItem(STORAGE_KEYS.PIN_HASH, hashed);
    setIsLockEnabled(true);
    setIsLocked(false); // Don't lock right away after setting up
  }, []);

  const disableLock = useCallback(async (pin) => {
    const stored  = localStorage.getItem(STORAGE_KEYS.PIN_HASH);
    const entered = await hashPin(pin);
    if (entered !== stored) return false;
    localStorage.removeItem(STORAGE_KEYS.ENABLED);
    localStorage.removeItem(STORAGE_KEYS.PIN_HASH);
    setIsLockEnabled(false);
    setIsLocked(false);
    return true;
  }, []);

  const changePin = useCallback(async (oldPin, newPin) => {
    const stored  = localStorage.getItem(STORAGE_KEYS.PIN_HASH);
    const entered = await hashPin(oldPin);
    if (entered !== stored) return false;
    const hashed = await hashPin(newPin);
    localStorage.setItem(STORAGE_KEYS.PIN_HASH, hashed);
    return true;
  }, []);

  const lockNow = useCallback(() => {
    if (localStorage.getItem(STORAGE_KEYS.ENABLED) === 'true') {
      setIsLocked(true);
    }
  }, []);

  return { isLockEnabled, isLocked, unlock, enableLock, disableLock, changePin, lockNow };
}
