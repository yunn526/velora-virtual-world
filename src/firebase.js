import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

// Firebase Web App settings are supplied through Vite environment variables.
// For GitHub Pages, add the matching VITE_FIREBASE_* values under:
// Repository → Settings → Secrets and variables → Actions → Variables.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

const requiredConfig = ['apiKey', 'authDomain', 'projectId', 'appId'];
export const configured = requiredConfig.every((key) => Boolean(firebaseConfig[key]));

let auth = null;
if (configured) {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
}

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

export { auth, provider, signInWithPopup, signOut, onAuthStateChanged };
