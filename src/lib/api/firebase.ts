import { Capacitor } from "@capacitor/core";
import { FirebaseApp, initializeApp } from "firebase/app";
import {
  getAuth,
  indexedDBLocalPersistence,
  initializeAuth,
} from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyDI6ZBz1raCb2Hm3BIuJPg7nm6l0KlkiDI",
  authDomain: "adhd-time-897ea.firebaseapp.com",
  projectId: "adhd-time-897ea",
  storageBucket: "adhd-time-897ea.appspot.com",
  messagingSenderId: "325287074111",
  appId: "1:325287074111:web:b7c9f67ce1e30bf9405b8a",
};

export const app = initializeApp(firebaseConfig);

function createAuth(app: FirebaseApp) {
  if (Capacitor.isNativePlatform()) {
    return initializeAuth(app, {
      persistence: indexedDBLocalPersistence,
    });
  }

  return getAuth(app);
}

export const auth = createAuth(app);
