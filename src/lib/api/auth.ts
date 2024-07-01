import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signInWithCredential,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { auth } from "./firebase";

export async function loginWithGoogle() {
  const result = await FirebaseAuthentication.signInWithGoogle();

  if (!result) {
    throw new Error("Google sign in failed");
  }

  const credential = GoogleAuthProvider.credential(result.credential?.idToken);

  await signInWithCredential(auth, credential);
}

export async function loginAnonymously() {
  await signInAnonymously(auth);
}

export async function loginWithEmailAndPassword(
  email: string,
  password: string
) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    throw new Error(
      "Could not log in with provided credentials, please try again"
    );
  }
}

export async function registerWithEmailAndPassword(
  email: string,
  password: string
) {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    throw new Error(
      "Error registering user, an account with that email address may already exist"
    );
  }
}
