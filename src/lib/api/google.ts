import { DateTime } from "luxon";

import { googleAccessToken } from "../state/user";

import { FireSpoonsDb } from "./firebase/firedb";

export async function initializeGoogleApiIfNeeded() {
  // If the Google API isn't loaded at all, error
  if (typeof gapi === "undefined") {
    throw new Error("Google API not loaded");
  }

  // Make sure we load the auth and calendar APIs
  if (!gapi.client?.calendar) {
    await new Promise((res) => gapi.load("client:auth2", res));
    await new Promise<void>((res) => gapi.client.load("calendar", "v3", res));
  }

  const accessToken = googleAccessToken();
  if (!accessToken) {
    throw new Error("No Google access token found");
  }

  // Make sure the access token is the latest
  if (gapi.client.getToken()?.access_token !== accessToken) {
    gapi.client.setToken({ access_token: accessToken });
  }
}

export async function getCalendars() {
  await initializeGoogleApiIfNeeded();

  const calendars = await gapi.client.calendar.calendarList.list();
  return calendars.result.items;
}

export async function getAllCalendarEvents(
  startTime: DateTime,
  endTime: DateTime
) {
  await initializeGoogleApiIfNeeded();

  const calendars = await gapi.client.calendar.calendarList.list();

  if (!calendars.status || calendars.status >= 300 || calendars.status < 200) {
    throw new Error("Could not get calendar list");
  }

  const results = await Promise.all(
    calendars.result.items.map((calendar) =>
      getCalendarEvents(calendar.id, startTime, endTime)
    )
  );

  return results.flat();
}

export async function getCalendarEvents(
  calendarId: string,
  startTime: DateTime,
  endTime: DateTime
) {
  if (!calendarId || !googleAccessToken()) {
    return [];
  }

  await initializeGoogleApiIfNeeded();

  const timeMin = startTime.toISO() ?? "";
  const timeMax = endTime.toISO() ?? "";

  const events = await gapi.client.calendar.events.list({
    calendarId,
    timeMin,
    timeMax,
  });

  return events.result.items;
}

export async function authorizeGoogleCalendar() {
  await FireSpoonsDb.updatePreferences({
    googleAuthURL: "client," + window.location.href,
  });

  const unsubscribe = FireSpoonsDb.onPreferences((prefs) => {
    if (!prefs.googleAuthURL || prefs.googleAuthURL.startsWith("client,")) {
      return;
    }

    unsubscribe();
    window.open(prefs.googleAuthURL);
  });

  // const client = google.accounts.oauth2.initCodeClient({
  //   client_id:
  //     "325287074111-vtmclq1f4kjnl5jh5nj7p3chh1moa82g.apps.googleusercontent.com",
  //   scope: "https://www.googleapis.com/auth/calendar.events.readonly",
  //   access_type: "offline",
  //   callback: (result) => {
  //     FireSpoonsDb.updatePreferences({
  //       googleCalendarAccessCode: result.code,
  //     });
  //   },
  // });

  // client.requestCode();
}
