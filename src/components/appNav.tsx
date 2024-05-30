import { A } from "@solidjs/router";

import CalTodayIcon from "../assets/icons/cal_today.svg?raw";
import CalWeekIcon from "../assets/icons/cal_week.svg?raw";
import SettingsIcon from "../assets/icons/settings.svg?raw";
import TasksIcon from "../assets/icons/tasks.svg?raw";

import styles from "./appNav.module.scss";

export function AppNav() {
  return (
    <nav class={styles.appNav}>
      <A class={styles.navLink} activeClass={styles.activeLink} href="/" end>
        <span innerHTML={CalTodayIcon} />
        Today
      </A>
      <A
        class={styles.navLink}
        activeClass={styles.activeLink}
        href="/all-tasks"
      >
        <span innerHTML={TasksIcon} />
        Tasks
      </A>
      <A
        class={styles.navLink}
        activeClass={styles.activeLink}
        href="/calendar"
      >
        <span innerHTML={CalWeekIcon} />
        Planning
      </A>
      <A
        class={styles.navLink}
        activeClass={styles.activeLink}
        href="/settings"
      >
        <span innerHTML={SettingsIcon} />
        Settings
      </A>
    </nav>
  );
}
