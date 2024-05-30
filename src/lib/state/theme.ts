import { createEffect, createSignal } from "solid-js";

import { createMediaQuery } from "~/lib/createMediaQuery";

const DARK_MODE_KEY = "darkMode";

const [darkMode, setDarkMode] = createSignal(false);

export function createThemeListener() {
  const systemPrefersDark = createMediaQuery("(prefers-color-scheme: dark)");

  function setPageTheme(dark: boolean) {
    setDarkMode(dark);
    document.body.classList.toggle("theme-light", !dark);
    document.body.classList.toggle("theme-dark", dark);
  }

  createEffect(() => {
    const userDarkModeOverride = localStorage.getItem(DARK_MODE_KEY);
    if (userDarkModeOverride !== null) {
      setPageTheme(userDarkModeOverride === "true");
      return;
    }

    if (systemPrefersDark()) {
      setPageTheme(true);
    }
  });
}

export function useTheme() {
  function setPageTheme(dark: boolean) {
    setDarkMode(dark);
    document.body.classList.toggle("theme-light", !dark);
    document.body.classList.toggle("theme-dark", dark);
  }

  function handleToggleClick() {
    localStorage.setItem(DARK_MODE_KEY, !darkMode() ? "true" : "false");
    setPageTheme(!darkMode());
  }

  return { toggleTheme: handleToggleClick, isDarkMode: darkMode };
}
