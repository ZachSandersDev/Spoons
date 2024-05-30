import { DateTime } from "luxon";
import { For, Show, createMemo } from "solid-js";

import { DayCell } from "./dayCell";
import styles from "./month.module.scss";

import { TaskList } from "~/components/taskList";
import { createPreferencesQuery } from "~/lib/api/db";
import { chunkTasks } from "~/lib/taskChunker";
import { TaskEvent } from "~/lib/types/TaskEvent";
import { classes } from "~/lib/utils";

export function MonthView(props: {
  tasks?: TaskEvent[];
  isLoading?: boolean;
  startingDate: DateTime;
}) {
  const prefs = createPreferencesQuery();

  const month = () => props.startingDate.startOf("month");

  const taskChunks = createMemo(() => {
    if (!prefs.data?.spoonsPerDay) return [];

    return chunkTasks(props.tasks || [], prefs.data.spoonsPerDay);
  });

  const today = () => DateTime.now().startOf("day");

  return (
    <section class={styles.monthContainer}>
      <For each={["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]}>
        {(day) => <span class={styles.dayOfWeek}>{day}</span>}
      </For>

      <For each={[0, 1, 2, 3, 4, 5]}>
        {(weekOffset) => (
          <For each={[0, 1, 2, 3, 4, 5, 6]}>
            {(dateOffset) => {
              const day = () =>
                month()
                  .plus({ week: weekOffset })
                  .startOf("week")
                  .plus({ days: dateOffset - 1 });

              const offsetFromToday = () =>
                Math.floor(day().diff(today(), "days").days);

              return (
                <Show
                  when={
                    weekOffset === 0 ||
                    props.startingDate.hasSame(
                      month()
                        .plus({ week: weekOffset })
                        .startOf("week")
                        .plus({ days: -1 }),
                      "month"
                    )
                  }
                >
                  <DayCell
                    class={classes(
                      styles.monthCell,
                      !props.startingDate.hasSame(day(), "month") &&
                        styles.monthCellNotInMonth
                    )}
                    day={day()}
                    size="small"
                  >
                    <TaskList
                      tasks={taskChunks()[offsetFromToday()]?.tasks}
                      isLoading={props.isLoading}
                      size="small"
                    />
                  </DayCell>
                </Show>
              );
            }}
          </For>
        )}
      </For>
    </section>
  );
}
