import React, { createContext, useState, useEffect } from 'react';
import { auth, database, storage } from '../config/firebase';
import { onAuthStateChanged, createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { ref, set, get, onValue, update } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState(null); // 'pending_verification' | 'approved' | 'rejected' | null
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Listen to parent profile for verification status and admin flag
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

  // Signup: creates Firebase Auth user, uploads government ID, writes parent profile with pending status
  const signup = async (email, password, name, idFile, dateOfBirth) => {
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const createdUser = userCred.user;
      if (name) {
        await updateProfile(createdUser, { displayName: name });
      }

      // Upload government ID to Firebase Storage
      let idFileUrl = '';
      let idFileName = '';
      if (idFile) {
        const ext = idFile.name.split('.').pop();
        idFileName = `government_id_${Date.now()}.${ext}`;
        const fileRef = storageRef(storage, `id-verifications/${createdUser.uid}/${idFileName}`);
        const snapshot = await uploadBytes(fileRef, idFile);
        idFileUrl = await getDownloadURL(snapshot.ref);
      }

      // Write parent profile with pending verification status
      await set(ref(database, `users/parents/${createdUser.uid}`), {
        uid: createdUser.uid,
        email: createdUser.email,
        name: name || '',
        createdAt: Date.now(),
        role: 'parent',
        isAdmin: false,
        idVerification: {
          dateOfBirth: dateOfBirth || '',
          idFileUrl,
          idFileName,
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

  // Admin action: approve or reject a user's ID verification
  const reviewUser = async (targetUid, decision) => {
    // decision: 'approved' or 'rejected'
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
    <AuthContext.Provider value={{ user, loading, verificationStatus, isAdmin, signup, reviewUser }}>
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
