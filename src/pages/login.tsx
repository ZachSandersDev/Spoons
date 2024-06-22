import { Show, createEffect, createSignal } from "solid-js";

import styles from "./login.module.scss";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

import { Toaster, showToastPromise } from "~/components/ui/toast";
import {
  loginWithEmailAndPassword,
  loginAnonymously,
  loginWithGoogle,
  registerWithEmailAndPassword,
} from "~/lib/api/auth";

type Mode = "Login" | "Register";

export default function LoginPage() {
  const [promise, setPromise] = createSignal<Promise<void> | null>(null);

  createEffect(() => {
    const prom = promise();
    if (!prom) {
      return;
    }

    showToastPromise(prom, {
      loading: "Logging in...",
      success: () => "Logged in!",
      error: (error) => `Error: '${error?.message || "Unknown error"}'`,
    });
  });

  const [mode, setMode] = createSignal<Mode>("Register");
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");

  const handleGoogleLogin = async () => {
    setPromise(loginWithGoogle());
  };

  const handleAnonymousLogin = async () => {
    setPromise(loginAnonymously());
  };

  const handleLogin = async (e: Event) => {
    e.preventDefault();

    if (mode() === "Register") {
      setPromise(registerWithEmailAndPassword(email(), password()));
      return;
    }

    setPromise(loginWithEmailAndPassword(email(), password()));
  };

  return (
    <section class={`view ${styles.loginPage}`}>
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

      <Toaster />
    </section>
  );
}
