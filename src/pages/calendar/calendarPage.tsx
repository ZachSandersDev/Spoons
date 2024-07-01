import { createQuery } from "@tanstack/solid-query";
import { DateTime } from "luxon";
import { Show, createSignal } from "solid-js";

import styles from "./calendarPage.module.css";
import { MonthView } from "./month";
import { CalendarMenu } from "./nav/calendarMenu";
import { CalendarNavigation } from "./nav/calendarNavigation";
import { DateRangeTitle } from "./nav/dateRangeTitle";
import { ModeSelect } from "./nav/modeSelect";

import { Mode } from "./types";
import { getEventDateMap, getRange } from "./utils";
import { WeekView } from "./week";

import { PageHeader } from "~/components/pageHeader";
import { ToolBar } from "~/components/ToolBar";
import { Toaster } from "~/components/ui/toast";
import { createAllTasksQuery, createPreferencesQuery } from "~/lib/api/db";
import { FireSpoonsDb } from "~/lib/api/firebase/firedb";
import { useIsDesktop } from "~/lib/utils";

export default function CalendarPage() {
  const tasks = createAllTasksQuery();
  const isDesktop = useIsDesktop();

  const [mode, setMode] = createSignal<Mode>(!isDesktop() ? "3day" : "week");
  const [currentDate, setCurrentDate] = createSignal<DateTime>(DateTime.now());
  const range = () => getRange(mode(), currentDate());

  const preferencesQuery = createPreferencesQuery();

  const calendarEventsQuery = createQuery(() => ({
    queryKey: [
      "calendarEvents",
      currentDate().startOf("month"),
      currentDate().endOf("month"),
      preferencesQuery.data?.enabledCalendars ?? undefined,
    ],
    queryFn: () =>
      FireSpoonsDb.calendars.getCalendarEvents(
        currentDate().startOf("month"),
        currentDate().endOf("month"),
        preferencesQuery.data?.enabledCalendars ?? undefined
      ),
    retry: false,
    enabled: !!preferencesQuery.isFetched,
  }));

  const allDayCalendarEvents = () => {
    const events = calendarEventsQuery.data ?? [];
    const allDayEvents = events.filter((event) => !!event.start?.date);
    return getEventDateMap(allDayEvents);
  };

  const timedCalendarEvents = () => {
    const events = calendarEventsQuery.data ?? [];
    const timedEvents = events.filter((event) => !!event.start?.dateTime);
    return getEventDateMap(timedEvents);
  };

  return (
    <>
      <PageHeader title={"Planning"}>
        <Show when={isDesktop()}>
          <CalendarNavigation
            mode={mode()}
            currentDate={currentDate()}
            setCurrentDate={setCurrentDate}
          />
          <ModeSelect mode={mode()} setMode={setMode} />
          <CalendarMenu />
        </Show>

        <Show when={!isDesktop()}>
          <h2 class={styles.dateRange}>
            <DateRangeTitle mode={mode()} currentDate={currentDate()} />
          </h2>
        </Show>
      </PageHeader>

      <Show when={mode() === "week" || mode() === "3day"}>
        <WeekView
          startingDate={range().startDate}
          numDays={mode() === "week" ? 7 : 3}
          tasks={tasks.data}
          allDayCalendarEvents={allDayCalendarEvents()}
          timedCalendarEvents={timedCalendarEvents()}
        />
      </Show>

      <Show when={mode() === "month"}>
        <MonthView
          startingDate={range().startDate}
          tasks={tasks.data}
          allDayCalendarEvents={allDayCalendarEvents()}
          timedCalendarEvents={timedCalendarEvents()}
        />
      </Show>

      <Toaster variant="toolbar" />

      <Show when={!isDesktop()}>
        <ToolBar>
          <ModeSelect mode={mode()} setMode={setMode} />

          <CalendarNavigation
            mode={mode()}
            currentDate={currentDate()}
            setCurrentDate={setCurrentDate}
          />
        </ToolBar>
      </Show>
    </>
  );
}
