import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// @ts-ignore
import { Auth, initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDXbAtc4nSOeExsGAS3h55mBGYXxI7vzH4",
  authDomain: "social-media-app-a3a22.firebaseapp.com",
  projectId: "social-media-app-a3a22",
  storageBucket: "social-media-app-a3a22.firebasestorage.app",
  messagingSenderId: "738545988926",
  appId: "1:738545988926:web:c82d558186211503ba286f"
};

// Initialize Firebase safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services with persistence

let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
} catch (error) {
  auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);
// Export a placeholder for messaging. If you need push notifications on native,
// use `expo-notifications` (already used in the app) or configure FCM with a native
// module. Do NOT initialize `getMessaging` here in the React Native app.
export const messaging = null;

export default app;