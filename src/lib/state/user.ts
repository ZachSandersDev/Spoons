import { User } from "@firebase/auth";

import { useLocation, useNavigate } from "@solidjs/router";
import { createEffect, createSignal } from "solid-js";

import { isTutorialComplete, setTutorialComplete } from "./tutorial";

import { auth } from "~/lib/api/firebase";

export const [isLoginCheckComplete, setIsLoginCheckComplete] =
  createSignal(false);
export const [user, setUser] = createSignal<User | null>(null);

export function createLoginListener() {
  const navigate = useNavigate();
  const location = useLocation();

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
      navigate("/tutorial");
      return;
    }

    if (!user()) {
      navigate("/login");
      return;
    }

    // If the user logged in, the tutorial is complete
    setTutorialComplete();

    // Navigate to the home page if the user is logged in
    if (location.pathname === "/tutorial" || location.pathname === "/login") {
      navigate("/");
    }
  });
}
