import { QueryClientProvider } from "@tanstack/solid-query";
import { ParentProps, Show } from "solid-js";

import styles from "./app.module.scss";
import { AppNav } from "./components/appNav";
import { createDbListener } from "./lib/api/db";
import { createNotificationListener } from "./lib/api/notifications";
import { location } from "./lib/state/location";
import { queryClient } from "./lib/state/queryClient";
import { createThemeListener } from "./lib/state/theme";
import { createLoginListener } from "./lib/state/user";

export function App(props: ParentProps) {
  createDbListener();
  createLoginListener();
  createThemeListener();
  createNotificationListener();

  return (
    <QueryClientProvider client={queryClient}>
      <main class={styles.main}>
        <section class={styles.content} id="content">
          {props.children}
        </section>
        <Show when={location() !== "/login" && location() !== "/tutorial"}>
          <AppNav class={styles.nav} />
        </Show>
      </main>
    </QueryClientProvider>
  );
}
