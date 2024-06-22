import styles from "./Icon.module.scss";

export function Icon(props: {
  variant?: "primary" | "default";
  innerHTML: string;
}) {
  return (
    <i
      classList={{
        [styles.icon]: !props.variant || props.variant === "default",
        [styles.iconPrimary]: props.variant === "primary",
      }}
      innerHTML={props.innerHTML}
    />
  );
}
