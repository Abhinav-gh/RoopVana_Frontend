import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase configuration from environment variables
// These must be set in your .env file (prefixed with VITE_ for Vite)
//
// Login works as before: every page except /login needs a signed-in user.
// If the VITE_FIREBASE_* keys are missing from .env, placeholder values stop
// Firebase from crashing the whole page (a blank screen); the login page then
// shows a note that the keys are missing, and signing in will fail until
// they are added.
export const HAS_FIREBASE_CONFIG = Boolean(import.meta.env.VITE_FIREBASE_API_KEY);
if (!HAS_FIREBASE_CONFIG) {
  console.warn("[RoopVana] VITE_FIREBASE_* are not set in .env: login will not work until they are added.");
}

/** Local testing only: VITE_SKIP_AUTH=true in .env skips the login screen under
 *  `npm run dev`. Off by default; never applies to a production build. */
export const SKIP_AUTH = import.meta.env.DEV && import.meta.env.VITE_SKIP_AUTH === "true";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "missing-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "missing.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "missing-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:0:web:0",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
