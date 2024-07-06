import { initializeApp, cert } from "firebase-admin/app";

import { WriteBatch, getFirestore } from "firebase-admin/firestore";
import { calendar_v3, google, type Auth } from "googleapis";

import isEqual from "lodash/isEqual.js";

import { DateTime } from "luxon";

import type { Preferences } from "../../src/lib/types/Preferences.ts";

const app = initializeApp({
  credential: cert({
    projectId: process.env.project_id,
    privateKey: process.env.private_key,
    clientEmail: process.env.client_email,
  }),

  databaseURL: "https://adhd-time-897ea.firebaseio.com",
});

const firestore = getFirestore(app);

const oauthClient = new google.auth.OAuth2(
  process.env.google_client_id,
  process.env.google_client_secret
);

interface Tokens {
  id: string;
  googleTokens?: Auth.Credentials;
}

const userRedirectURLs = new Map<string, string>();

const googleTokens = new Map<string, Auth.Credentials>();
const googleAuthClients = new Map<string, Auth.OAuth2Client>();
const googleCalendarClients = new Map<string, calendar_v3.Calendar>();

firestore.collection("users").onSnapshot(async (snapshot) => {
  for (const userDoc of snapshot.docs) {
    const user: Preferences = { id: userDoc.id, ...userDoc.data() };

    // Handle client auth requests
    if (user.googleAuthURL && user.googleAuthURL.startsWith("client,")) {
      const authURL = oauthClient.generateAuthUrl({
        access_type: "offline",
        scope: "https://www.googleapis.com/auth/calendar.readonly",
        prompt: "consent",
        redirect_uri: user.googleAuthURL.replace("client,", ""),
      });

      userRedirectURLs.set(
        userDoc.id,
        user.googleAuthURL.replace("client,", "")
      );

      firestore.collection("users").doc(userDoc.id).update({
        googleAuthURL: authURL,
      });
    }

    // When auth flow completes, get our access tokens
    // and wipe auth stuff from the user doc
    if (user.googleAuthCode) {
      try {
        const { tokens } = await oauthClient.getToken({
          code: user.googleAuthCode,
          redirect_uri: userRedirectURLs.get(userDoc.id),
        });

        await firestore.collection("tokens").doc(userDoc.id).set({
          googleTokens: tokens,
        });

        await firestore.collection("users").doc(userDoc.id).update({
          googleAuthURL: null,
          googleAuthCode: null,
          googleAuthStatus: "success",
        });
      } catch (e) {
        console.error(e);
        firestore.collection("users").doc(userDoc.id).update({
          googleAuthURL: null,
          googleAuthCode: null,
          googleAuthStatus: "failure",
        });
        continue;
      }
    }
  }
});

firestore.collection("tokens").onSnapshot(async (snapshot) => {
  for (const tokenDoc of snapshot.docs) {
    const tokens: Tokens = { id: tokenDoc.id, ...tokenDoc.data() };
    if (!tokens.googleTokens) {
      continue;
    }

    const cachedTokens = googleTokens.get(tokens.id);
    if (cachedTokens && isEqual(cachedTokens, tokens.googleTokens)) {
      continue;
    }

    const googleAuthClient = new google.auth.OAuth2(
      process.env.google_client_id,
      process.env.google_client_secret
    );

    googleAuthClient.setCredentials(tokens.googleTokens);
    googleAuthClient.on("tokens", (tokens) => {
      if (!tokens.refresh_token) return;
      firestore.collection("tokens").doc(tokenDoc.id).set(
        {
          googleTokens: tokens,
        },
        { merge: true }
      );
    });

    const calendarAPI = google.calendar({
      version: "v3",
      auth: googleAuthClient,
    });

    googleTokens.set(tokens.id, tokens.googleTokens);

    googleAuthClients.get(tokens.id)?.removeAllListeners();
    googleAuthClients.set(tokens.id, googleAuthClient);

    googleCalendarClients.set(tokens.id, calendarAPI);

    getCalendarsForUser(tokens.id);
  }
});

async function getCalendarsForUser(userId: string) {
  const calendarAPI = googleCalendarClients.get(userId);
  if (!calendarAPI) return;

  const calendars = await calendarAPI.calendarList.list();

  const batch = firestore.batch();

  for (const calendar of calendars.data?.items ?? []) {
    if (!calendar.id) continue;

    batch.set(
      firestore
        .collection("users")
        .doc(userId)
        .collection("calendars")
        .doc(calendar.id),
      calendar
    );

    await getCalendarEventsForUser(userId, calendar.id, batch);
  }

  await batch.commit();
}

async function getCalendarEventsForUser(
  userId: string,
  calendarId: string,
  batch: WriteBatch
) {
  const calendarAPI = googleCalendarClients.get(userId);
  if (!calendarAPI) return;

  const events = await calendarAPI.events.list({
    calendarId,
    timeMin: DateTime.now().startOf("year").toISO(),
    timeMax: DateTime.now().endOf("year").toISO(),
  });

  for (const calendarEvent of events.data?.items ?? []) {
    const event = calendarEvent as typeof calendarEvent & {
      startTime?: number;
      endTime?: number;
      calendarId: string;
    };

    if (!event.id) {
      continue;
    }

    if (event.start?.dateTime) {
      event.startTime = DateTime.fromISO(event.start.dateTime).toMillis();
    } else if (event.start?.date) {
      event.startTime = DateTime.fromISO(event.start.date)
        .startOf("day")
        .toMillis();
    }

    if (event.end?.dateTime) {
      event.endTime = DateTime.fromISO(event.end.dateTime).toMillis();
    } else if (event.end?.date) {
      event.endTime = DateTime.fromISO(event.end.date).endOf("day").toMillis();
    }

    event.calendarId = calendarId;

    batch.set(
      firestore
        .collection("users")
        .doc(userId)
        .collection("calendarEvents")
        .doc(event.id),
      event
    );
  }
}
