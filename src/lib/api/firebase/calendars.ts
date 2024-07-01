import {
  QueryFieldFilterConstraint,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { DateTime } from "luxon";

import { getUserRef, onCollectionChange, resolveWithIds } from "./db";

import { Calendar, CalendarEvent } from "~/lib/types/Calendars";

function calendarsQuery() {
  return query(collection(getUserRef(), "calendars"));
}

async function getCalendars() {
  const snapshot = await getDocs(calendarsQuery());
  return snapshot.docs.map(resolveWithIds<Calendar>);
}

function onCalendars(callback: (snapshot: Calendar[]) => void) {
  return onCollectionChange(calendarsQuery, callback);
}

function calendarEventsQuery(
  start: DateTime,
  end: DateTime,
  includedCalendars?: string[]
) {
  return query(
    collection(getUserRef(), "calendarEvents"),
    ...[
      where("startTime", ">=", start.toMillis()),
      where("endTime", "<=", end.toMillis()),
      includedCalendars && where("calendarId", "in", includedCalendars || []),
    ].filter((i): i is QueryFieldFilterConstraint => !!i)
  );
}

async function getCalendarEvents(
  start: DateTime,
  end: DateTime,
  includedCalendars?: string[]
) {
  const snapshot = await getDocs(
    calendarEventsQuery(start, end, includedCalendars)
  );
  return snapshot.docs.map(resolveWithIds<CalendarEvent>);
}

export const FireCalendarsAPI = {
  getCalendars,
  onCalendars,
  getCalendarEvents,
};
