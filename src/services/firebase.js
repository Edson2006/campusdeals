// Fichier: src/services/firebase.js
// C'est notre point de connexion central à Firebase.

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// 1. On lit les clés secrètes depuis ton fichier .env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// 2. On initialise Firebase
const app = initializeApp(firebaseConfig);

// 3. On exporte les "services" que notre application va utiliser
export const auth = getAuth(app);
export const db = getFirestore(app);

if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db).catch((error) => {
    if (import.meta.env.DEV) {
      console.warn("[Firebase] IndexedDB persistence non activée", error);
    }
  });
}
export const storage = getStorage(app);

export default app;