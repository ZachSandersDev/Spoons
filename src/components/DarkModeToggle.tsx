import styles from "./DarkModeToggle.module.scss";

import DarkModeIcon from "~/assets/icons/dark_mode.svg?raw";
import LightModeIcon from "~/assets/icons/light_mode.svg?raw";

import { useTheme } from "~/lib/state/theme";
import { classes } from "~/lib/utils";

export function DarkModeToggle() {
  const { toggleTheme, isDarkMode } = useTheme();

  return (
    <button
      class={classes(
        styles.toggleContainer,
        isDarkMode() && styles.toggleActive
      )}
      onClick={toggleTheme}
    >
      <div
        innerHTML={LightModeIcon}
        class={classes(styles.modeIcon, styles.lightModeIcon)}
      ></div>
      <div
        innerHTML={DarkModeIcon}
        class={classes(styles.modeIcon, styles.darkModeIcon)}
      ></div>

      <div class={styles.toggle}></div>
    </button>
  );
}
