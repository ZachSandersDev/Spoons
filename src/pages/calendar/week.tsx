import { DateTime } from "luxon";
import { For, Show, createMemo } from "solid-js";

import { CalendarEventItem } from "./calendarEventItem";
import { DayCell } from "./dayCell";
import styles from "./week.module.scss";

import { TaskCreator } from "~/components/taskCreator/taskCreator";
import { TaskList } from "~/components/taskList";
import { createPreferencesQuery } from "~/lib/api/db";
import { chunkTasks } from "~/lib/taskChunker";
import { CalendarEvent } from "~/lib/types/Calendars";
import { TaskEvent } from "~/lib/types/TaskEvent";
import { useIsDesktop } from "~/lib/utils";

export function WeekView(props: {
  startingDate: DateTime;
  numDays: number;
  tasks?: TaskEvent[];
  allDayCalendarEvents?: Map<string, CalendarEvent[]>;
  timedCalendarEvents?: Map<string, CalendarEvent[]>;
  mutateTasks?: (mutator: (tasks: TaskEvent[]) => TaskEvent[]) => void;
  isLoading?: boolean;
}) {
  const isDesktop = useIsDesktop();
  const dateOffsets = () => new Array(props.numDays).fill(0).map((_, i) => i);
  const today = () => DateTime.now().startOf("day");

  const prefs = createPreferencesQuery();

  const taskChunks = createMemo(() => {
    if (!prefs.data?.spoonsPerDay) return [];

    return chunkTasks(props.tasks || [], prefs.data.spoonsPerDay, {
      preserveLateTasks: true,
    });
  });

  return (
    <section class={styles.weekView}>
      <div
        class={styles.taskContainer}
        style={{
          "grid-template-columns": !isDesktop()
            ? `3ch repeat(${props.numDays}, 1fr)`
            : `5ch repeat(${props.numDays}, 1fr)`,
        }}
      >
        <div class={styles.taskIndicatorSpacer}></div>
        <For each={dateOffsets()}>
          {(dateOffset) => {
            const day = () => props.startingDate.plus({ days: dateOffset });
            const offsetFromToday = () =>
              Math.floor(day().diff(today(), "days").days);

            return (
              <DayCell
                day={day()}
                size={props.numDays > 5 ? "medium" : "large"}
                indicatorContainer={(props) => (
                  <TaskCreator
                    initialTask={{ targetDate: day().toFormat("yyyy-MM-dd") }}
                    {...props}
                  />
                )}
              >
                <Show when={!!taskChunks()[offsetFromToday()]?.tasks?.length}>
                  <TaskList
                    tasks={taskChunks()[offsetFromToday()]!.tasks}
                    isLoading={props.isLoading}
                    size={props.numDays > 5 ? "small" : "medium"}
                  />
                </Show>
              </DayCell>
            );
          }}
        </For>

        <div
          classList={{
            [styles.taskIndicatorSpacer]: true,
            [styles["taskIndicatorSpacer--allDay"]]: true,
          }}
        ></div>
        <For each={dateOffsets()}>
          {(dateOffset) => {
            const day = () => props.startingDate.plus({ days: dateOffset });

            return (
              <div
                class={styles.calendarAllDay}
                style={`${
                  !props.allDayCalendarEvents?.get(day().toFormat("yyyy-MM-dd"))
                    ?.length && "padding: 0"
                }`}
              >
                <For
                  each={
                    props.allDayCalendarEvents?.get(
                      day().toFormat("yyyy-MM-dd")
                    ) || []
                  }
                >
                  {(event) => <CalendarEventItem event={event} />}
                </For>
              </div>
            );
          }}
        </For>
      </div>

      <div
        class={styles.calendarContainer}
        style={{
          "grid-template-columns": !isDesktop()
            ? `3ch repeat(${props.numDays}, 1fr)`
            : `5ch repeat(${props.numDays}, 1fr)`,
        }}
      >
        <div class={styles.indicatorContainer}>
          <For each={new Array(24).fill(0).map((_, i) => i)}>
            {(i) => {
              if (i === 0) {
                return <div class={styles.indicator}></div>;
              }

              return (
                <div class={styles.indicator}>
                  <Show when={!isDesktop()}>
                    <span>
                      {i === 12 || i === 0 ? "12" : i % 12}
                      {i > 11 ? "p" : "a"}
                    </span>
                  </Show>
                  <Show when={isDesktop()}>
                    <span>
                      {i === 12 || i === 0 ? "12" : i % 12}{" "}
                      {i > 11 ? "PM" : "AM"}
                    </span>
                  </Show>
                </div>
              );
            }}
          </For>
        </div>

        <For each={dateOffsets()}>
          {(dateOffset) => {
            const day = () => props.startingDate.plus({ days: dateOffset });

            return (
              <div class={styles.calendarDay}>
                <For
                  each={
                    props.timedCalendarEvents?.get(
                      day().toFormat("yyyy-MM-dd")
                    ) || []
                  }
                >
                  {(event) => <CalendarEventItem event={event} />}
                </For>
              </div>
            );
          }}
        </For>
      </div>
    </section>
  );
}
