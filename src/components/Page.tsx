import { ParentProps } from "solid-js";

import styles from "./Page.module.scss";

export function Page(props: ParentProps) {
  return <div class={styles.page}>{props.children}</div>;
}
