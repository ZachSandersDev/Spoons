import { For, Show } from "solid-js";

import styles from "./taskList.module.scss";

import { Skeleton } from "./ui/skeleton";

import { Task } from "~/components/task";
import { TaskEvent } from "~/lib/types/TaskEvent";
import { classes } from "~/lib/utils";

export function TaskList(props: {
  tasks?: TaskEvent[];
  isLoading?: boolean;
  size?: "small" | "medium" | "large";
  onTaskComplete?: (task: TaskEvent) => void;
}) {
  const size = () => props.size || "large";

  function handleTaskDelete(task: TaskEvent) {
    props.onTaskComplete?.(task);
  }

  return (
    <>
      <Show when={props.isLoading}>
        <div class={styles.taskList}>
          <Skeleton height={50} />
          <Skeleton height={50} />
          <Skeleton height={50} />
        </div>
      </Show>

      <ul class={classes(styles.taskList, styles[`taskList-size-${size()}`])}>
        <For each={props.tasks}>
          {(task) => (
            <li>
              <Task task={task} size={size()} onComplete={handleTaskDelete} />
            </li>
          )}
        </For>
      </ul>
    </>
  );
}
