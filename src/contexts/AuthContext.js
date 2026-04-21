import React, { createContext, useState, useEffect, useCallback } from 'react';
import { descriptorToArray } from '../utils/faceRecognition';
import { auth, database } from '../config/firebase';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';
import { ref, set, onValue, update, remove } from 'firebase/database';
import { compressImageToBase64 } from '../utils/imageCompressor';
import {
  requestAndSaveToken,
  removeCurrentDeviceToken,
  onForegroundMessage,
  getNotificationPermission,
} from '../utils/pushNotifications';

export const AuthContext = createContext();

// ── Single hardcoded admin account ──────────────────────────────────────────
// Only this email address is allowed to access the Admin Panel.
// No user can be promoted to admin via the UI.
export const ADMIN_EMAIL = 'admin@aegistnet.com';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [foregroundAlert, setForegroundAlert] = useState(null);

  // ── Auto-register FCM token when permission is already granted ──────────
  const initPushNotifications = useCallback(async (uid) => {
    try {
      const permission = getNotificationPermission();
      if (permission === 'granted') {
        // Silently refresh/register the token
        await requestAndSaveToken(uid);
      }

      // Listen for foreground messages (tab is open)
      const unsubForeground = await onForegroundMessage((payload) => {
        const notification = payload.notification || payload.data || {};
        setForegroundAlert({
          title: notification.title || '⚠️ NSFW Alert',
          body: notification.body || 'New incident detected.',
          timestamp: Date.now(),
        });
      });

      return unsubForeground;
    } catch (error) {
      console.warn('[Auth] Push notification init failed:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    let unsubForeground = null;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Admin is determined by email only — cannot be set via database
        const adminByEmail = currentUser.email === ADMIN_EMAIL;
        setIsAdmin(adminByEmail);

        if (adminByEmail) {
          // Admin account — no verification status needed
          setVerificationStatus('approved');
          setIsDisabled(false);
          setLoading(false);
          return;
        }

        const parentRef = ref(database, `users/parents/${currentUser.uid}`);
        const unsub = onValue(parentRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            setVerificationStatus(data.idVerification?.status || 'pending_verification');
            setIsDisabled(data.disabled === true);
          } else {
            setVerificationStatus(null);
            setIsDisabled(false);
          }
          setLoading(false);
        });

        // Initialize push notifications for this parent
        initPushNotifications(currentUser.uid).then((unsub) => {
          unsubForeground = unsub;
        });

        return () => {
          unsub();
          if (typeof unsubForeground === 'function') unsubForeground();
        };
      } else {
        setVerificationStatus(null);
        setIsAdmin(false);
        setIsDisabled(false);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (typeof unsubForeground === 'function') unsubForeground();
    };
  }, [initPushNotifications]);

  /**
   * STEP 1 — Create the Firebase Auth account and write the parent profile.
   * Does NOT touch Firebase Storage at all, so CORS issues cannot block
   * account creation. The idFile is uploaded separately in Step 2.
   */
  const signup = async (email, password, nameData, dateOfBirth) => {
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const createdUser = userCred.user;
      
      const { firstName = '', middleName = '', lastName = '' } = nameData || {};
      const fullNameParts = [firstName, middleName, lastName].filter(Boolean);
      const fullName = fullNameParts.join(' ');

      if (fullName) {
        await updateProfile(createdUser, { displayName: fullName });
      }

      await set(ref(database, `users/parents/${createdUser.uid}`), {
        uid: createdUser.uid,
        email: createdUser.email,
        name: fullName || '',
        firstName,
        middleName,
        lastName,
        createdAt: Date.now(),
        role: 'parent',
        isAdmin: false,
        idVerification: {
          dateOfBirth: dateOfBirth || '',
          idFileUrl: '',
          idFileName: '',
          idUploadPending: true,
          status: 'pending_verification',
          submittedAt: Date.now(),
          reviewedAt: null,
          reviewedBy: null,
        },
      });

      let verificationSent = false;
      try {
        await sendEmailVerification(createdUser);
        verificationSent = true;
      } catch (e) {
        console.warn('sendEmailVerification failed:', e);
      }

      return { success: true, user: createdUser, verificationSent };
    } catch (error) {
      return { success: false, error };
    }
  };

  /**
   * STEP 2 — Compress the image client-side and store it as base64 in
   * Realtime Database. Completely bypasses Firebase Storage, so there are
   * zero CORS issues and no Storage rule changes are needed.
   */
  const uploadVerificationId = async (idFile) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return { success: false, error: new Error('Not authenticated') };
    if (!idFile) return { success: false, error: new Error('No file provided') };

    try {
      const idBase64 = await compressImageToBase64(idFile);

      await update(ref(database, `users/parents/${currentUser.uid}/idVerification`), {
        idBase64,
        idFileName: idFile.name,
        idUploadPending: false,
        submittedAt: Date.now(),
        status: 'pending_verification', // reset status so admin re-reviews the new submission
      });

      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  /**
   * Delete the currently logged-in user's account.
   * Requires the user's current password to re-authenticate before deletion.
   */
  const deleteAccount = async (password) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return { success: false, error: 'Not logged in' };
    try {
      // Re-authenticate first (required by Firebase before sensitive operations)
      const credential = EmailAuthProvider.credential(currentUser.email, password);
      await reauthenticateWithCredential(currentUser, credential);
      // Remove database records
      await remove(ref(database, `users/parents/${currentUser.uid}`));
      // Delete the Firebase Auth account
      await deleteUser(currentUser);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  /**
   * Change the currently logged-in user's password.
   * Requires the current password to re-authenticate before the change.
   */
  const changePassword = async (currentPassword, newPassword) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return { success: false, error: { code: 'auth/no-user', message: 'Not logged in' } };
    try {
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  /**
   * Store the face recognition descriptor vector in Firebase.
   * matchScore: Euclidean distance from the comparison (lower = better match).
   * selfieBase64: The captured selfie to store in the database for admin review.
   */
  const storeFaceDescriptor = async (descriptor, matchScore = null, selfieBase64 = null) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return { success: false, error: new Error('Not authenticated') };
    try {
      const updateData = {
        descriptorVector: descriptorToArray(descriptor), // plain array, safe for Firebase
        verifiedAt: Date.now(),
        matchScore: matchScore !== null ? Math.round(matchScore * 10000) / 10000 : null,
        livenessConfirmed: true,
      };
      if (selfieBase64) {
        updateData.selfieBase64 = selfieBase64;
      }
      await update(ref(database, `users/parents/${currentUser.uid}/faceVerification`), updateData);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  // Admin action: approve or reject a user's ID verification
  const reviewUser = async (targetUid, decision) => {
    if (!user) return { success: false, error: 'Not logged in' };
    try {
      await update(ref(database, `users/parents/${targetUid}/idVerification`), {
        status: decision,
        reviewedAt: Date.now(),
        reviewedBy: user.uid,
      });
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, verificationStatus, isAdmin, isDisabled, foregroundAlert, signup, uploadVerificationId, storeFaceDescriptor, reviewUser, deleteAccount, changePassword, removeCurrentDeviceToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
