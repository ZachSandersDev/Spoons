import { ParentProps } from "solid-js";

import styles from "./secondaryMessage.module.css";

export function SecondaryMessage(props: ParentProps) {
  return <div class={styles.secondaryMessage}>{props.children}</div>;
}
