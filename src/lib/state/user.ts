import { User } from "@firebase/auth";

import { createEffect, createSignal } from "solid-js";

import { FireSpoonsDb } from "../api/firebase/firedb";

import { location, setLocation } from "./location";
import { isTutorialComplete, setTutorialComplete } from "./tutorial";

import { auth } from "~/lib/api/firebase";

export const [isLoginCheckComplete, setIsLoginCheckComplete] =
  createSignal(false);
export const [user, setUser] = createSignal<User | null>(null);

export function createLoginListener() {
  auth.onAuthStateChanged((firebaseUser) => {
    setUser(firebaseUser);
    setIsLoginCheckComplete(true);
  });

  createEffect(() => {
    if (!isLoginCheckComplete()) {
      return;
    }

    // Navigate to the tutorial if the user is not logged in and hasn't completed the tutorial
    if (!user() && !isTutorialComplete()) {
      setLocation("/tutorial");
      return;
    }

    if (!user()) {
      setLocation("/login");
      return;
    }

    // If the user logged in, the tutorial is complete
    setTutorialComplete();

    // Navigate to the home page if the user is logged in
    if (location() === "/tutorial" || location() === "/login") {
      setLocation("/");
    }
  });

  // Make sure to cache the user's Google access token in local storage
  createEffect(async () => {
    const searchParams = new URLSearchParams(window.location.search);

    const googleAuthCode = searchParams.get("code");
    if (!googleAuthCode) {
      return;
    }

    console.log("Google auth code", googleAuthCode);

    await FireSpoonsDb.updatePreferences({ googleAuthCode });
    window.location.search = "";
  });
}
