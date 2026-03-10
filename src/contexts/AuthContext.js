import React, { createContext, useState, useEffect } from 'react';
import { auth, database } from '../config/firebase';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from 'firebase/auth';
import { ref, set, onValue, update } from 'firebase/database';

/**
 * Compresses an image file using the browser Canvas API and returns a
 * base64-encoded data URL (JPEG, 80% quality, max 1200×900 px).
 * PDFs and non-image files are returned as-is via FileReader.
 */
const compressImageToBase64 = (file) =>
  new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      // Non-image (e.g. PDF) — just base64-encode the raw bytes
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const MAX_W = 1200;
        const MAX_H = 900;
        let w = img.width;
        let h = img.height;
        if (w > MAX_W) { h = Math.round((h * MAX_W) / w); w = MAX_W; }
        if (h > MAX_H) { w = Math.round((w * MAX_H) / h); h = MAX_H; }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const parentRef = ref(database, `users/parents/${currentUser.uid}`);
        const unsub = onValue(parentRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            setVerificationStatus(data.idVerification?.status || 'pending_verification');
            setIsAdmin(data.isAdmin === true);
          } else {
            setVerificationStatus(null);
            setIsAdmin(false);
          }
          setLoading(false);
        });
        return () => unsub();
      } else {
        setVerificationStatus(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  /**
   * STEP 1 — Create the Firebase Auth account and write the parent profile.
   * Does NOT touch Firebase Storage at all, so CORS issues cannot block
   * account creation. The idFile is uploaded separately in Step 2.
   */
  const signup = async (email, password, name, dateOfBirth) => {
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const createdUser = userCred.user;

      if (name) {
        await updateProfile(createdUser, { displayName: name });
      }

      await set(ref(database, `users/parents/${createdUser.uid}`), {
        uid: createdUser.uid,
        email: createdUser.email,
        name: name || '',
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
      });

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
      value={{ user, loading, verificationStatus, isAdmin, signup, uploadVerificationId, reviewUser }}
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
