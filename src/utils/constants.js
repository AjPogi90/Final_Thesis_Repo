// Centralized constants and helpers for status/time calculations
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Never';
  const date = new Date(Number(timestamp));
  return date.toLocaleString();
};

export const firebaseErrorMessages = {
  'auth/user-not-found': 'No account found with this email',
  'auth/wrong-password': 'Incorrect password',
  'auth/invalid-email': 'Invalid email address',
  'auth/user-disabled': 'This account has been disabled',
  'auth/too-many-requests': 'Too many login attempts. Please try again later',
};

export const getFirebaseErrorMessage = (code) => {
  return firebaseErrorMessages[code] || 'An error occurred. Please try again.';
};
