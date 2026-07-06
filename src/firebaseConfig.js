// ============================================================
// FIREBASE CONFIGURATION
// ============================================================
// 1. Go to https://console.firebase.google.com → Create project
// 2. Add a Web App (</> icon) → copy the config object it shows
// 3. Paste the values below, replacing the PASTE_... placeholders
// 4. In the console: Build → Firestore Database → Create database
//    → Start in test mode (or use the rules from README)
//
// Until real values are pasted here, the app automatically runs
// in offline mode (localStorage only — no cross-device sync).
// ============================================================

export const firebaseConfig = {
  apiKey: "PASTE_API_KEY",
  authDomain: "PASTE_PROJECT_ID.firebaseapp.com",
  projectId: "PASTE_PROJECT_ID",
  storageBucket: "PASTE_PROJECT_ID.appspot.com",
  messagingSenderId: "PASTE_SENDER_ID",
  appId: "PASTE_APP_ID",
};
