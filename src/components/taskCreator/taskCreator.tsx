import { Popover as KPopover } from "@kobalte/core/popover";
import { JSX, ParentProps, Show, createSignal } from "solid-js";

import { RangeSelector } from "../rangeSelector";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";

import { DatePicker } from "./datePicker";
import styles from "./taskCreator.module.scss";

import { Button } from "~/components/ui/button";

import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

import { useDb } from "~/lib/api/db";
import { TaskEvent, newTaskEvent } from "~/lib/types/TaskEvent";
import { useIsDesktop } from "~/lib/utils";

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

        <Button class={styles.submitButton} size="sm" type="submit">
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
        <DatePicker task={props.task} setTask={props.setTask} />
      </div>

      <div class={styles.taskField}>
        <Label>Spoons needed</Label>
        <RangeSelector
          value={props.task.spoons}
          options={new Array(5)
            .fill(0)
            .map((_, i) => ({ value: i + 1, label: `${i + 1}` }))}
          onChange={(value) => props.setTask({ ...props.task, spoons: value })}
          selectedClass={styles[`spoonOptionSelected-${props.task.spoons}`]}
        />
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
    preview?: (task: TaskEvent | null) => JSX.Element;
    onNewTask?: (task: TaskEvent) => void;

    initialTask?: Partial<TaskEvent>;
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

    setTask({ ...newTaskEvent(), ...props.initialTask });
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
      <TaskPopup
        isOpen={isOpen()}
        onOpenChange={handleOpenChange}
        class={props.class}
        popupContent={
          <Show when={task()}>
            <TaskForm
              task={task()!}
              setTask={setTask}
              onSubmit={handleSubmit}
              headerText="New Task"
              submitText="Create"
            />
          </Show>
        }
      >
        {props.children}
      </TaskPopup>
    </>
  );
}

export function TaskEditor(
  props: ParentProps<{
    class?: string;

    task: TaskEvent;
    setTask: (task: TaskEvent) => void;
    onUpdate?: () => void;
    onClose?: () => void;
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
    <TaskPopup
      class={props.class}
      isOpen={isOpen()}
      onOpenChange={handleOpenChange}
      popupContent={
        <TaskForm
          task={props.task}
          setTask={props.setTask}
          onSubmit={handleSubmit}
          headerText="Details"
          submitText="Save"
        />
      }
    >
      {props.children}
    </TaskPopup>
  );
}

export function TaskPopup(
  props: ParentProps<{
    class?: string;

    isOpen?: boolean;
    onOpenChange?: (isOpen: boolean) => void;

    popupContent?: JSX.Element;
  }>
) {
  const isDesktop = useIsDesktop();

  return (
    <>
      <Show when={isDesktop()}>
        <Popover
          placement="bottom"
          onOpenChange={props.onOpenChange}
          open={props.isOpen}
        >
          <PopoverTrigger class={props.class}>{props.children}</PopoverTrigger>
          <PopoverContent class={styles.taskPopover}>
            <KPopover.Arrow />
            {props.popupContent}
          </PopoverContent>
        </Popover>
      </Show>

      <Show when={!isDesktop()}>
        <Sheet onOpenChange={props.onOpenChange} open={props.isOpen}>
          <SheetTrigger class={props.class}>{props.children}</SheetTrigger>
          <SheetContent class={styles.taskSheet} position="bottom">
            {props.popupContent}
          </SheetContent>
        </Sheet>
      </Show>
    </>
  );
}
