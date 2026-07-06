import { initializeApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { firebaseConfig } from './firebaseConfig';

// Firebase is "enabled" only once real credentials are pasted into
// firebaseConfig.js — otherwise the app falls back to localStorage.
export const isFirebaseEnabled =
  !!firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith('PASTE');

let db = null;
if (isFirebaseEnabled) {
  try {
    db = getFirestore(initializeApp(firebaseConfig));
  } catch (e) {
    console.error('Firebase init failed — running in offline mode.', e);
  }
}

// The entire app state lives in one small Firestore document.
const stateDoc = () => doc(db, 'campus-bus-tracker', 'state');

/**
 * Live-subscribe to the shared state document.
 * callback(data | null) — null means the document doesn't exist yet.
 * Returns an unsubscribe function.
 */
export const subscribeToState = (callback) => {
  if (!db) return () => {};
  return onSnapshot(
    stateDoc(),
    (snap) => callback(snap.exists() ? snap.data() : null),
    (err) => console.error('Firestore subscribe error:', err)
  );
};

/** Write the shared state document (last write wins). */
export const saveState = (data) => {
  if (!db) return;
  setDoc(stateDoc(), data).catch((e) =>
    console.error('Firestore save error:', e)
  );
};
