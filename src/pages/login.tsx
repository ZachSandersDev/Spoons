import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithCredential,
} from "@firebase/auth";

import { signInAnonymously } from "firebase/auth";
import { Show, createSignal } from "solid-js";

import styles from "./login.module.scss";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

import { auth } from "~/lib/api/firebase";

type Mode = "Login" | "Register";

export default function LoginPage() {
  const [error, setError] = createSignal<string | null>(null);

  const handleGoogleLogin = async () => {
    const result = await FirebaseAuthentication.signInWithGoogle();
    if (!result) {
      setError("Google sign in failed");
      return;
    }

    const credential = GoogleAuthProvider.credential(
      result.credential?.idToken
    );

    await signInWithCredential(auth, credential);
  };

  const handleAnonymousLogin = async () => {
    await signInAnonymously(auth);
  };

  const [mode, setMode] = createSignal<Mode>("Register");
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");

  const handleLogin = async (e: Event) => {
    e.preventDefault();

    if (mode() === "Register") {
      try {
        await createUserWithEmailAndPassword(auth, email(), password());
      } catch (error) {
        console.error(error);
      }

      return;
    }

    signInWithEmailAndPassword(auth, email(), password());
  };

  return (
    <section class={`view ${styles.loginPage}`}>
      <span>{error()}</span>

      <form class={styles.loginForm} onSubmit={handleLogin}>
        <Input
          type="text"
          placeholder="Username"
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button type="submit">{mode()}</Button>
      </form>

      <Button variant="secondary" onClick={handleGoogleLogin}>
        Sign in with Google
      </Button>

      <Button variant="secondary" onClick={handleAnonymousLogin}>
        Skip sign in
      </Button>

      <Show when={mode() === "Register"}>
        <span class={styles.accountCallout}>
          Already have an account?{" "}
          <a
            onClick={(e) => {
              e.preventDefault();
              setMode("Login");
            }}
          >
            Login
          </a>
        </span>
      </Show>

      <Show when={mode() === "Login"}>
        <span class={styles.accountCallout}>
          Don&rsquo;t have an account?{" "}
          <a
            onClick={(e) => {
              e.preventDefault();
              setMode("Register");
            }}
          >
            Register
          </a>
        </span>
      </Show>
    </section>
  );
}
