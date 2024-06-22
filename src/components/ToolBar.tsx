import { ParentProps } from "solid-js";

import styles from "./ToolBar.module.css";

export function ToolBar(props: ParentProps) {
  return <div class={styles.toolbar}>{props.children}</div>;
}
