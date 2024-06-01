import { DateTime } from "luxon";
import { Show, createEffect, createMemo, createSignal } from "solid-js";

import styles from "./task.module.scss";

import { TaskEditor } from "./taskCreator/taskCreator";

import { Checkbox } from "./ui/checkbox";

import InfoIcon from "~/assets/icons/info.svg?raw";
import MoreIcon from "~/assets/icons/more.svg?raw";
import { useDb } from "~/lib/api/db";
import { TaskEvent } from "~/lib/types/TaskEvent";
import { classes, dateTimeFrom } from "~/lib/utils";

export function Task(props: {
  task: TaskEvent;
  size: "small" | "medium" | "large";

  onUpdate?: (task: TaskEvent) => void;
  onDelete?: (task: TaskEvent) => void;
  onNewTask?: (task: TaskEvent) => void;

  focused?: boolean;
}) {
  const db = useDb();
  const [task, setTask] = createSignal<TaskEvent>(props.task);

  // Keep the editable task in sync with the props
  createEffect(() => {
    setTask(props.task);
  });

  const timeText = createMemo(() => {
    const { targetTime = "" } = task();
    if (!targetTime) {
      return "";
    }

    const time = DateTime.fromFormat(task().targetTime, "HH:mm");

    if (!time.isValid) {
      return "";
    }

    return time.toFormat("h:mm a");
  });

  const dateText = createMemo(() => {
    const { targetDate = "" } = task();
    if (!targetDate) {
      return "";
    }

    const date = DateTime.fromFormat(task().targetDate, "yyyy-MM-dd");

    if (!date.isValid) {
      return "";
    }

    return date.toFormat("MMM d");
  });

  const taskDescription = createMemo(() => {
    const time = timeText();
    const date = dateText();

    if (props.size === "small") {
      return "";
    }

    if (props.size === "medium") {
      return timeText();
    }

    return [date, time].filter(Boolean).join(" at ");
  });

  const [isDeleting, setIsDeleting] = createSignal(false);

  function handleCheckboxChange(checked: boolean) {
    setTask({ ...task(), pending: !checked });
    setIsDeleting(checked);
  }

  let deleteTimeout: NodeJS.Timeout;
  createEffect(() => {
    if (!isDeleting()) {
      clearTimeout(deleteTimeout);
      return;
    }

    deleteTimeout = setTimeout(() => {
      db().deleteTask(task());
      props.onDelete?.(task());
    }, 2_000);
  });

  function handleSaveIfDirty() {
    const isDirty = (Object.keys(task()) as (keyof TaskEvent)[]).some(
      (key: keyof TaskEvent) => task()[key] !== props.task[key]
    );

    if (!isDirty) {
      return;
    }

    db().updateTask(task());
    props.onUpdate?.(task());
  }

  function handleTitleChange(e: { currentTarget: HTMLSpanElement }) {
    setTask({ ...task(), title: e.currentTarget.innerText });
    handleSaveIfDirty();
  }

  async function handleTitleKeyPress(
    e: KeyboardEvent & { currentTarget: HTMLSpanElement }
  ) {
    if (e.key === "Enter") {
      e.preventDefault();
    }

    if (e.key === "Backspace" && e.currentTarget.innerText.length === 0) {
      db().deleteTask(task());
      props.onDelete?.(task());
    }
  }

  let titleInput: HTMLSpanElement;
  createEffect(() => {
    if (props.focused && titleInput) {
      titleInput.focus();
    }
  });

  return (
    <>
      <Show when={props.size === "large"}>
        <div
          class={classes(
            styles.task,
            isDeleting() && styles.deleting,
            styles[`task-size-${props.size}`]
          )}
          data-priority={props.task.priority}
        >
          <Checkbox
            class={styles.checkbox}
            onClick={(e: MouseEvent) => e.stopPropagation()}
            onChange={handleCheckboxChange}
          />

          <div class={styles.taskDescription}>
            <span
              contentEditable
              class={styles.titleInput}
              ref={(e) => (titleInput = e)}
              onBlur={handleTitleChange}
              onKeyDown={handleTitleKeyPress}
            >
              {task().title}
            </span>

            <Show when={taskDescription().length > 0}>
              <div class={styles.description}>
                <Show
                  when={
                    dateTimeFrom(task().targetDate, task().targetTime).diffNow(
                      "minutes"
                    ).minutes < 0
                  }
                >
                  <span innerHTML={InfoIcon} />
                </Show>
                <span>{taskDescription()}</span>
              </div>
            </Show>
          </div>

          <span class={styles.spoons}>{task().spoons}</span>

          <TaskEditor
            class={classes()}
            task={task()}
            setTask={setTask}
            onUpdate={handleSaveIfDirty}
            onClose={handleSaveIfDirty}
            innerHTML={MoreIcon}
          />
        </div>
      </Show>

      <Show when={props.size !== "large"}>
        <TaskEditor
          class={classes(
            styles.task,
            isDeleting() && styles.deleting,
            styles[`task-size-${props.size}`]
          )}
          task={task()}
          setTask={setTask}
          onUpdate={handleSaveIfDirty}
          onClose={handleSaveIfDirty}
        >
          <div class={styles.taskDescription}>
            <span class={styles.title}>{task().title}</span>

            <Show when={taskDescription().length > 0}>
              <span class={styles.description}>{taskDescription()}</span>
            </Show>
          </div>

          <Show when={props.size !== "small"}>
            <span class={styles.spoons}>{task().spoons}</span>
          </Show>
        </TaskEditor>
      </Show>
    </>
  );
}
