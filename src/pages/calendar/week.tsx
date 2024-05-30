import { DateTime } from "luxon";
import { For, createMemo } from "solid-js";

import { DayCell } from "./dayCell";
import styles from "./week.module.scss";

import { TaskList } from "~/components/taskList";
import { Separator } from "~/components/ui/separator";
import { createPreferencesQuery } from "~/lib/api/db";
import { chunkTasks } from "~/lib/taskChunker";
import { TaskEvent } from "~/lib/types/TaskEvent";

export function WeekView(props: {
  startingDate: DateTime;
  numDays: number;
  tasks?: TaskEvent[];
  mutateTasks?: (mutator: (tasks: TaskEvent[]) => TaskEvent[]) => void;
  isLoading?: boolean;
}) {
  const dateOffsets = () => new Array(props.numDays).fill(0).map((_, i) => i);
  const today = () => DateTime.now().startOf("day");

  const prefs = createPreferencesQuery();

  const taskChunks = createMemo(() => {
    if (!prefs.data?.spoonsPerDay) return [];

    return chunkTasks(props.tasks || [], prefs.data.spoonsPerDay);
  });

  return (
    <section class={styles.weekContainer}>
      <For each={dateOffsets()}>
        {(dateOffset) => {
          const day = () => props.startingDate.plus({ days: dateOffset });
          const offsetFromToday = () =>
            Math.floor(day().diff(today(), "days").days);

          return (
            <>
              <DayCell day={day()} size="medium">
                <TaskList
                  tasks={taskChunks()[offsetFromToday()]?.tasks}
                  isLoading={props.isLoading}
                  size={props.numDays > 5 ? "small" : "medium"}
                />
              </DayCell>
              <Separator orientation="vertical" />
            </>
          );
        }}
      </For>
    </section>
  );
}
