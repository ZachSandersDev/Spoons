import { JSX } from "solid-js";

import CalTodayIcon from "../assets/icons/cal_today.svg?raw";
import CalWeekIcon from "../assets/icons/cal_week.svg?raw";
import SettingsIcon from "../assets/icons/settings.svg?raw";
import TasksIcon from "../assets/icons/tasks.svg?raw";

import styles from "./appNav.module.scss";

import { location, setLocation } from "~/lib/state/location";
import { classes } from "~/lib/utils";

function A(props: {
  class?: string;
  activeClass?: string;
  href: string;
  children: JSX.Element;
}) {
  function handleClick(event: MouseEvent) {
    event.preventDefault();
    setLocation(props.href);
  }

  return (
    <a
      class={classes(
        props.class,
        props.href === location() && props.activeClass
      )}
      href={props.href}
      onClick={handleClick}
    >
      {props.children}
    </a>
  );
}

export function AppNav() {
  return (
    <nav class={styles.appNav}>
      <A class={styles.navLink} activeClass={styles.activeLink} href="/">
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
