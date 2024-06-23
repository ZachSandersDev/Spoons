import { createQuery } from "@tanstack/solid-query";
import { DateTime } from "luxon";
import { Show, createEffect, createSignal } from "solid-js";

import styles from "./calendarPage.module.css";
import { MonthView } from "./month";
import { CalendarNavigation } from "./nav/calendarNavigation";
import { DateRangeTitle } from "./nav/dateRangeTitle";
import { ModeSelect } from "./nav/modeSelect";

import { Mode } from "./types";
import { getRange } from "./utils";
import { WeekView } from "./week";

import { PageHeader } from "~/components/pageHeader";
import { ToolBar } from "~/components/ToolBar";
import { Button } from "~/components/ui/button";
import { Toaster, showToast } from "~/components/ui/toast";
import { loginWithGoogle } from "~/lib/api/auth";
import { createAllTasksQuery } from "~/lib/api/db";
import { getAllCalendarEvents } from "~/lib/api/google";
import { googleAccessToken } from "~/lib/state/user";
import { CalendarEvent } from "~/lib/types/Calendars";
import { useIsDesktop } from "~/lib/utils";

export default function CalendarPage() {
  const tasks = createAllTasksQuery();
  const isDesktop = useIsDesktop();

  const [mode, setMode] = createSignal<Mode>(!isDesktop() ? "3day" : "week");
  const [currentDate, setCurrentDate] = createSignal<DateTime>(DateTime.now());
  const range = () => getRange(mode(), currentDate());

  const calendarEventsQuery = createQuery(() => ({
    queryKey: [
      "calendarEvents",
      googleAccessToken(),
      currentDate().startOf("month"),
      currentDate().endOf("month"),
    ],
    queryFn: () =>
      getAllCalendarEvents(
        currentDate().startOf("month"),
        currentDate().endOf("month")
      ),
    retry: false,
  }));

  createEffect(() => {
    if (!googleAccessToken()) {
      return;
    }

    if (calendarEventsQuery.isLoading) {
      showToast({
        title: "Loading calendar events...",
      });
    }

    if (calendarEventsQuery.isSuccess) {
      showToast({
        title: "Loaded calendar events!",
      });
    }

    if (calendarEventsQuery.error) {
      showToast({
        title: "Could not load calendar events",
        description: calendarEventsQuery.error.message,
        action: (
          <Button onClick={loginWithGoogle}>Authorize Google Calendar</Button>
        ),
      });
    }
  });

  // createEffect(() => {
  //   if (calendarEventsQuery.error) {
  //     showToast({
  //       title: "Error",
  //       description:
  //         "Could not load calendar events, please grant access again",
  //       action: (
  //         <Button
  //           onClick={async () => {
  //             const result = await FirebaseAuthentication.signInWithGoogle({
  //               scopes: [
  //                 "https://www.googleapis.com/auth/calendar.events.readonly",
  //                 "https://www.googleapis.com/auth/calendar.readonly",
  //               ],
  //             });

  //             if (!result) {
  //               showToast({ description: "Google sign in failed..." });
  //               return;
  //             }

  //             const credential = GoogleAuthProvider.credential(
  //               result.credential?.idToken
  //             );

  //             if (result.credential?.accessToken) {
  //               localStorage.setItem(
  //                 "googleIdToken",
  //                 result.credential.accessToken
  //               );
  //             }

  //             await signInWithCredential(auth, credential);
  //           }}
  //         >
  //           Authorize Google Calendar
  //         </Button>
  //       ),
  //     });
  //   }
  // });

  const allDayCalendarEvents = () => {
    const eventsMap = new Map<string, CalendarEvent[]>();
    const events = calendarEventsQuery.data ?? [];
    const allDayEvents = events.filter(
      (event) => !!event.start && !event.start.dateTime
    );

    for (const event of allDayEvents) {
      const startDate = DateTime.fromISO(event.start.date ?? "");
      const endDate = DateTime.fromISO(event.end.date ?? "");

      for (
        let i = 0;
        Math.floor(startDate.plus({ days: i }).diff(endDate, "days").days) < 0;
        i++
      ) {
        const currentDate = startDate.plus({ days: i });
        const remainingDays = Math.floor(
          endDate.diff(currentDate, "days").days
        );

        const date = currentDate.toFormat("yyyy-MM-dd");
        const existingEvents = eventsMap.get(date) ?? [];

        const clonedEvent = { ...event };

        if (i !== 0 && clonedEvent.start.date) {
          clonedEvent.end = {
            date: currentDate.plus({ days: 1 }).toISODate()!,
            timeZone: clonedEvent.end.timeZone,
          };
        }

        if (remainingDays > 0 && clonedEvent.end.date) {
          clonedEvent.end = {
            date: currentDate.endOf("day").toISODate()!,
            timeZone: clonedEvent.end.timeZone,
          };
        }

        existingEvents.push(clonedEvent);
        eventsMap.set(date, existingEvents);
      }
    }

    return eventsMap;
  };

  const timedCalendarEvents = () => {
    const eventsMap = new Map<string, CalendarEvent[]>();
    const events = calendarEventsQuery.data ?? [];
    const timedEvents = events.filter((event) => !!event.start?.dateTime);

    for (const event of timedEvents) {
      const startDate = DateTime.fromISO(event.start.dateTime ?? "");
      const endDate = DateTime.fromISO(event.end.dateTime ?? "");

      for (
        let i = 0;
        Math.floor(startDate.plus({ days: i }).diff(endDate, "days").days) < 0;
        i++
      ) {
        const currentDate = startDate.plus({ days: i });
        const remainingDays = Math.floor(
          endDate.diff(currentDate, "days").days
        );

        const date = currentDate.toFormat("yyyy-MM-dd");
        const existingEvents = eventsMap.get(date) ?? [];

        const clonedEvent = { ...event };

        if (i !== 0 && clonedEvent.start.dateTime) {
          clonedEvent.start = {
            dateTime: currentDate.toISO()!,
            timeZone: clonedEvent.start.timeZone,
          };
        }

        if (remainingDays > 0 && clonedEvent.end.dateTime) {
          clonedEvent.end = {
            dateTime: currentDate.endOf("day").toISO()!,
            timeZone: clonedEvent.end.timeZone,
          };
        }

        existingEvents.push(clonedEvent);
        eventsMap.set(date, existingEvents);
      }
    }

    return eventsMap;
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
