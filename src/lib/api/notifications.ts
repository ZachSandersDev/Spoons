import {
  LocalNotificationSchema,
  LocalNotifications,
} from "@capacitor/local-notifications";

import { DateTime } from "luxon";
import { createEffect } from "solid-js";
import stringHash from "string-hash";

import { createAllTasksQuery, createPreferencesQuery } from "./db";

export function createNotificationListener() {
  const tasks = createAllTasksQuery();
  const prefs = createPreferencesQuery();

  createEffect(async () => {
    const notifications: LocalNotificationSchema[] = [];

    if (!tasks.data?.length || !prefs.data?.notificationsEnabled) {
      return;
    }

    for (const task of tasks.data) {
      if (!task.targetDate) {
        continue;
      }

      const date = DateTime.fromFormat(task.targetDate, "yyyy-MM-dd");
      const time = DateTime.fromFormat(task.targetTime || "09:00", "HH:mm");

      const dateTime = DateTime.fromObject({
        year: date.year,
        month: date.month,
        day: date.day,
        hour: time.hour,
        minute: time.minute,
      });

      // Skip tasks in the past
      if (!task.targetDate || dateTime.diffNow("seconds").seconds < 0) {
        continue;
      }

      notifications.push({
        id: stringHash(task.id),
        title: "Spoons reminder",
        body: `${task.title} is due`,
        schedule: {
          at: dateTime.toJSDate(),
        },
      });
    }

    if (notifications.length === 0) {
      return;
    }

    const { notifications: pendingNotifications } =
      await LocalNotifications.getPending();
    const notifsToCancel = pendingNotifications.filter((notif) =>
      notifications.some((notif2) => notif.id === notif2.id)
    );
    if (notifsToCancel.length > 0) {
      await LocalNotifications.cancel({ notifications: notifsToCancel });
    }

    await LocalNotifications.schedule({
      notifications,
    });
  });
}

export async function areNotificationsAllowed() {
  const permissions = await LocalNotifications.checkPermissions();
  return permissions.display === "granted";
}

export async function requestNotificationPermission() {
  const permissions = await LocalNotifications.requestPermissions();
  return permissions.display === "granted";
}
