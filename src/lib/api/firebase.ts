import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDI6ZBz1raCb2Hm3BIuJPg7nm6l0KlkiDI",
  authDomain: "adhd-time-897ea.firebaseapp.com",
  projectId: "adhd-time-897ea",
  storageBucket: "adhd-time-897ea.appspot.com",
  messagingSenderId: "325287074111",
  appId: "1:325287074111:web:b7c9f67ce1e30bf9405b8a",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);