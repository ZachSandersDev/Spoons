import { DateTime } from "luxon";
import { createSignal } from "solid-js";

import styles from "./calendarPage.module.css";
import {
  InfiniteSnapScroller,
  useInfiniteSnapScroller,
} from "./infiniteSnapScroller";
import { MonthView } from "./month";
import { DateRangeTitle } from "./nav/dateRangeTitle";
import { ModeSelect } from "./nav/modeSelect";

import { WeekView } from "./week";

import { PageHeader } from "~/components/pageHeader";
import { Button } from "~/components/ui/button";
import { createAllTasksQuery } from "~/lib/api/db";

export type Mode = "week" | "month" | "3day";

export const [mode, setMode] = createSignal<Mode>("3day");

function getStartOfRange(mode: Mode, date: DateTime) {
  if (mode === "3day") {
    return date.startOf("day");
  }
  if (mode === "week") {
    // Luxon weeks start on Monday, so we start at -1 to get the first day of the week
    return date.plus({ days: 1 }).startOf("week").plus({ days: -1 });
  }

  return date.startOf("month");
}

export default function CalendarPage() {
  const tasks = createAllTasksQuery();

  const startingPoint = () => getStartOfRange(mode(), DateTime.now());
  const [currentDate, setCurrentDate] = createSignal<DateTime>(startingPoint());

  const getPage = (offset: number) => {
    if (mode() === "week") {
      return startingPoint().plus({ weeks: offset });
    }

    if (mode() === "3day") {
      return startingPoint().plus({ days: offset * 3 });
    }

    return startingPoint().plus({ months: offset });
  };

  const { props, resetToCenter } = useInfiniteSnapScroller<DateTime>({
    getPage,
    setPage: setCurrentDate,
  });

  return (
    <>
      <PageHeader title={"Planning"}>
        <Button onClick={resetToCenter}>Today</Button>
        <ModeSelect />
      </PageHeader>

      <h2 class={styles.dateRange}>
        <DateRangeTitle currentDate={currentDate()} />
      </h2>

      <InfiniteSnapScroller<DateTime> {...props}>
        {(date) => {
          if (mode() === "week") {
            return (
              <WeekView startingDate={date} numDays={7} tasks={tasks.data} />
            );
          }

          if (mode() === "3day") {
            return (
              <WeekView startingDate={date} numDays={3} tasks={tasks.data} />
            );
          }

          return <MonthView startingDate={date} tasks={tasks.data} />;
        }}
      </InfiniteSnapScroller>
    </>
  );
}
