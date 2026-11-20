import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

// Replace these values with your Firebase Web App configuration.
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  appId: 'YOUR_APP_ID'
};
const configured = !Object.values(firebaseConfig).some(v => String(v).startsWith('YOUR_'));
let auth = null;
if (configured) auth = getAuth(initializeApp(firebaseConfig));
const provider = new GoogleAuthProvider();
export { auth, configured, provider, signInWithPopup, signOut, onAuthStateChanged };
