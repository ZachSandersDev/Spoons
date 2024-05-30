import { GoogleAuthProvider, signInWithEmailAndPassword } from "@firebase/auth";

import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { For, createSignal } from "solid-js";

import styles from "./login.module.scss";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

import {
  RadioGroup,
  RadioGroupItem,
  RadioGroupItemLabel,
} from "~/components/ui/radio-group";
import { auth } from "~/lib/api/firebase";

type Mode = "Login" | "Register";

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    const googleProvider = new GoogleAuthProvider();
    signInWithPopup(auth, googleProvider);
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
      <h2>Log in with socials</h2>
      <Button onClick={handleGoogleLogin}>Google</Button>

      <h2>Log in with email</h2>
      <form class={styles.loginForm} onSubmit={handleLogin}>
        <RadioGroup onChange={(e) => setMode(e as Mode)} value={mode()}>
          <For each={["Register", "Login"] satisfies Mode[]}>
            {(mode) => (
              <RadioGroupItem value={mode}>
                <RadioGroupItemLabel>{mode}</RadioGroupItemLabel>
              </RadioGroupItem>
            )}
          </For>
        </RadioGroup>

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
    </section>
  );
}
