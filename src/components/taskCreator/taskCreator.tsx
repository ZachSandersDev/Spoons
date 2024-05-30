import { Accessor, JSX, ParentProps, Show, createSignal } from "solid-js";

import { RangeSelector } from "../rangeSelector";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";

import { DatePicker } from "./datePicker";
import styles from "./taskCreator.module.scss";

import { Button } from "~/components/ui/button";

import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

import { useDb } from "~/lib/api/db";
import { TaskEvent, newTaskEvent } from "~/lib/types/TaskEvent";
import { classes } from "~/lib/utils";

export type TaskFormProps = {
  task: TaskEvent;
  setTask: (task: TaskEvent) => void;
  onSubmit: () => void;
  headerText?: string;
  submitText?: string;
};

export function TaskForm(props: TaskFormProps) {
  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    props.onSubmit();
  }

  return (
    <form class={styles.taskForm} onSubmit={handleSubmit}>
      <header class={styles.formHeader}>
        <h2 class={styles.headerText}>{props.headerText}</h2>

        <Button
          class={styles.submitButton}
          size="sm"
          variant="secondary"
          type="submit"
        >
          {props.submitText || "Create Task"}
        </Button>
      </header>

      <div class={styles.taskField}>
        <Input
          id="task-title"
          placeholder="Task"
          value={props.task.title}
          onInput={(e) =>
            props.setTask({ ...props.task, title: e.target.value })
          }
        />
      </div>

      <div class={styles.taskField}>
        <Label>Spoons needed</Label>
        <RangeSelector
          value={props.task.spoons}
          options={new Array(5)
            .fill(0)
            .map((_, i) => ({ value: i + 1, label: `${i + 1}` }))}
          onChange={(value) => props.setTask({ ...props.task, spoons: value })}
        />
      </div>

      <div class={styles.taskField}>
        <Label for="task-targetDate">Scheduled for</Label>
        <DatePicker task={props.task} setTask={props.setTask} />
      </div>

      <div class={styles.taskField}>
        <Label>Priority</Label>
        <RangeSelector
          value={props.task.priority}
          options={[
            { value: 2, label: "Low" },
            { value: 1, label: "Medium" },
            { value: 0, label: "High" },
          ]}
          onChange={(priority) => props.setTask({ ...props.task, priority })}
          selectedClass={
            styles[`priorityOptionSelected-${props.task.priority}`]
          }
        />
      </div>
    </form>
  );
}

export function TaskCreator(
  props: ParentProps<{
    class?: string;
    anchorRef?: Accessor<HTMLElement>;
    preview?: (task: TaskEvent | null) => JSX.Element;
    onNewTask?: (task: TaskEvent) => void;
  }>
) {
  const db = useDb();
  const [task, setTask] = createSignal<TaskEvent | null>(null);
  const [isOpen, setIsOpen] = createSignal(false);

  function handleOpenChange(shouldOpen: boolean) {
    setIsOpen(shouldOpen);

    if (!shouldOpen) {
      setTask(null);
      return;
    }

    setTask(newTaskEvent());
  }

  async function handleSubmit() {
    db().addTask(task()!);
    props.onNewTask?.(task()!);
    setIsOpen(false);
    setTask(null);
  }

  return (
    <>
      {props.preview?.(task())}
      <Sheet onOpenChange={handleOpenChange} open={isOpen()}>
        <SheetTrigger class={classes(styles.taskPopoverTrigger, props.class)}>
          {props.children}
        </SheetTrigger>
        <SheetContent class={styles.taskPopover} position="bottom">
          <Show when={task()}>
            <TaskForm
              task={task()!}
              setTask={setTask}
              onSubmit={handleSubmit}
              headerText="New Task"
              submitText="Create"
            />
          </Show>
        </SheetContent>
      </Sheet>
    </>
  );
}

export function TaskEditor(
  props: ParentProps<{
    class?: string;
    anchorRef?: Accessor<HTMLElement>;
    task: TaskEvent;
    setTask: (task: TaskEvent) => void;
    onUpdate?: () => void;
    onClose?: () => void;
    innerHTML?: string;
  }>
) {
  const [isOpen, setIsOpen] = createSignal(false);

  function handleOpenChange(shouldOpen: boolean) {
    setIsOpen(shouldOpen);
    props.onClose?.();
  }

  async function handleSubmit() {
    setIsOpen(false);
    props.onUpdate?.();
  }

  return (
    <Sheet
      // placement="bottom"
      // anchorRef={props.anchorRef}
      onOpenChange={handleOpenChange}
      open={isOpen()}
    >
      <SheetTrigger
        class={classes(styles.taskPopoverTrigger, props.class)}
        data-priority={props.task.priority}
        innerHTML={props.innerHTML}
      >
        {props.children}
      </SheetTrigger>
      <SheetContent class={styles.taskPopover} position="bottom">
        {/* <KPopover.Arrow /> */}
        <TaskForm
          task={props.task}
          setTask={props.setTask}
          onSubmit={handleSubmit}
          headerText="Details"
          submitText="Save"
        />
      </SheetContent>
      {/* <Show when={isOpen()}>
        <div class={styles.taskPopOverCover} />
      </Show> */}
    </Sheet>
  );
}
