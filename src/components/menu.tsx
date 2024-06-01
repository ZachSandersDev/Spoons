import { JSX, ParentProps } from "solid-js";

import styles from "./menu.module.css";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";

import { classes } from "~/lib/utils";

export function Menu(
  props: ParentProps<{
    class?: string;
    trigger?: JSX.Element;
  }>
) {
  return (
    <Dialog>
      <DialogTrigger>{props.trigger}</DialogTrigger>
      <DialogContent>{props.children}</DialogContent>
    </Dialog>
  );
}

export function MenuItem(
  props: ParentProps<{
    class?: string;
    onClick?: () => void;
  }>
) {
  return (
    <Button
      class={classes(styles.menuItem, props.class)}
      variant="secondary"
      onClick={props.onClick}
    >
      {props.children}
    </Button>
  );
}
