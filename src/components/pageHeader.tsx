import { JSX, ParentProps } from "solid-js";

import styles from "./pageHeader.module.css";

export function PageHeader(
  props: ParentProps<{ title: string | JSX.Element }>
) {
  return (
    <header class={styles.pageHeader}>
      <h1>{props.title}</h1>
      <div class={styles.actions}>{props.children}</div>
    </header>
  );
}
