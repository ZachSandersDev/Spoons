import { DateTime } from "luxon";
import { Show, createEffect, createMemo, createSignal } from "solid-js";

import styles from "./task.module.scss";

import { TaskEditor } from "./taskCreator/taskCreator";

import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";

import InfoIcon from "~/assets/icons/info.svg?raw";
import MoreIcon from "~/assets/icons/more.svg?raw";
import { useDb } from "~/lib/api/db";
import { TaskEvent } from "~/lib/types/TaskEvent";
import { classes, dateTimeFrom } from "~/lib/utils";

export function Task(props: {
  task: TaskEvent;
  size: "small" | "medium" | "large";
  onComplete?: (task: TaskEvent) => void;
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

  let deleteTimeout: NodeJS.Timeout | undefined;
  createEffect(() => {
    // Remove timeout if the task is not completed
    if (!task().completed) {
      clearTimeout(deleteTimeout);
      deleteTimeout = undefined;
      return;
    }

    // Don't start a new timeout if one is already running
    if (deleteTimeout) {
      return;
    }

    deleteTimeout = setTimeout(() => {
      const cTask = task();
      if (cTask.repeat?.unit) {
        const now = DateTime.now();
        const nextAssignedTime = now.plus({
          [cTask.repeat.unit]: cTask.repeat.frequency || 1,
        });

        setTask({
          ...cTask,
          completed: false,
          targetDate: nextAssignedTime.toFormat("yyyy-MM-dd"),
        });

        // Only set a time if there's already a target time, or if the repeat unit is hours
        if (cTask.targetTime || cTask.repeat?.unit === "hours") {
          setTask({
            ...task(),
            targetTime: nextAssignedTime.toFormat("HH:mm"),
          });
        }

        props.onComplete?.(task());
        handleSaveIfDirty();
        return;
      }

      db().deleteTask(task());
      props.onComplete?.(task());
    }, 2_000);
  });

  function handleSaveIfDirty() {
    const isDirty = (Object.keys(task()) as (keyof TaskEvent)[]).some(
      (key: keyof TaskEvent) => task()[key] !== props.task[key]
    );

    if (!isDirty) {
      return;
    }

    db().updateTask(JSON.parse(JSON.stringify(task())));
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
  }

  return (
    <>
      <Show when={props.size === "large"}>
        <div
          class={classes(
            styles.task,
            task().completed && styles.deleting,
            styles[`task-size-${props.size}`],
            styles[`task-priority${task().priority}`]
          )}
        >
          <Checkbox
            class={styles.checkbox}
            checked={task().completed}
            onClick={(e: MouseEvent) => e.stopPropagation()}
            onChange={(completed) => {
              setTask({ ...task(), completed });
              handleSaveIfDirty();
            }}
          />

          <div class={styles.taskDescription}>
            <span
              contentEditable
              class={styles.titleInput}
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
            task={task()}
            setTask={setTask}
            onUpdate={handleSaveIfDirty}
            onClose={handleSaveIfDirty}
          >
            <Button variant="ghost" size="icon" innerHTML={MoreIcon} />
          </TaskEditor>
        </div>
      </Show>

      <Show when={props.size !== "large"}>
        <TaskEditor
          class={classes(
            styles.task,
            task().completed && styles.deleting,
            styles[`task-size-${props.size}`],
            styles[`task-priority${task().priority}`]
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
