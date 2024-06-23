import { DateTime } from "luxon";

import { Mode } from "./types";

import { CalendarEvent } from "~/lib/types/Calendars";

export function getRange(mode: Mode, date: DateTime) {
  if (mode === "3day") {
    return {
      startDate: date.startOf("day"),
      endDate: date.endOf("day").plus({ days: 2 }),
    };
  }

  if (mode === "week") {
    return {
      startDate: date.plus({ days: 1 }).startOf("week").plus({ days: -1 }),
      endDate: date.plus({ days: 1 }).endOf("week").plus({ days: -1 }),
    };
  }

  return {
    startDate: date.startOf("month"),
    endDate: date.endOf("month"),
  };
}

export function getEventDateMap(events: CalendarEvent[] = []) {
  const eventsMap = new Map<string, CalendarEvent[]>();

  for (const event of events) {
    const startDate = getCalendarEventTime(event, "start");
    const endDate = getCalendarEventTime(event, "end");

    let currentDate = startDate;
    let remainingDays = Math.floor(endDate.diff(currentDate, "days").days);

    do {
      const date = currentDate.toFormat("yyyy-MM-dd");
      const existingEvents = eventsMap.get(date) ?? [];

      const clonedEvent = { ...event };

      // If this isn't the first day of the event
      if (Math.floor(currentDate.diff(startDate, "days").days) !== 0) {
        // Make a new event with the start set to current
        clonedEvent.start = {
          ...clonedEvent.start,
          date: event.end.date ?? currentDate.toISODate()!,
          dateTime: event.end.dateTime ?? currentDate.toISO()!,
        };
      }

      // If this isn't the last day of the event
      if (remainingDays > 0) {
        // Make a new event with the end set to current day
        clonedEvent.end = {
          ...clonedEvent.end,
          date: event.end.date ?? currentDate.endOf("day").toISODate()!,
          dateTime: event.end.dateTime ?? currentDate.endOf("day").toISO()!,
        };
      }

      existingEvents.push(clonedEvent);
      eventsMap.set(date, existingEvents);

      currentDate = currentDate.plus({ days: 1 });
      remainingDays = Math.floor(endDate.diff(currentDate, "days").days);
    } while (remainingDays > 0);
  }

  return eventsMap;
}

export function getCalendarEventTime(
  event: CalendarEvent,
  key: "start" | "end"
) {
  if (event[key].dateTime) {
    return DateTime.fromISO(event[key].dateTime || "", {
      zone: event[key].timeZone,
    });
  }

  if (event[key].date) {
    return DateTime.fromISO(event[key].date || "", {
      zone: event[key].timeZone,
    });
  }

  throw new Error("No start date found");
}
