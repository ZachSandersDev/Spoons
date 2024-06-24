import { ParentProps, createSignal } from "solid-js";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

import styles from "./taskDeleteDialog.module.css";

export function TaskDeleteDialog(
  props: ParentProps<{ onConfirm: () => void }>
) {
  const [isOpen, setIsOpen] = createSignal(false);

  function handleCancel() {
    setIsOpen(false);
  }

  function handleDelete() {
    props.onConfirm();
    setIsOpen(false);
  }

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen()}>
      <DialogTrigger>{props.children}</DialogTrigger>
      <DialogContent>
        <DialogTitle>Delete Task</DialogTitle>
        <p>Are you sure you want to delete this task?</p>
        <div class={styles.actions}>
          <Button variant="secondary" size="sm" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
