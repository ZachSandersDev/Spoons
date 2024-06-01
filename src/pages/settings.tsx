import { signOut } from "firebase/auth";

import { Profile } from "./calendar/nav/profile";
import styles from "./settings.module.css";

import { DarkModeToggle } from "~/components/DarkModeToggle";
import { PageHeader } from "~/components/pageHeader";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { createPreferencesQuery, useDb } from "~/lib/api/db";
import { auth } from "~/lib/api/firebase";

import {
  areNotificationsAllowed,
  requestNotificationPermission,
} from "~/lib/api/notifications";
import { setLocation } from "~/lib/state/location";
import { user } from "~/lib/state/user";

export default function SettingsPage() {
  const db = useDb();
  const prefs = createPreferencesQuery();

  function handleLoginClick() {
    if (!user()) {
      setLocation("/login");
    }

    signOut(auth);
  }

  function handleSetSpoonsPerDay(spoonsPerDay: number) {
    if (!prefs.data) return;

    db().setPreferences({ ...prefs.data, spoonsPerDay });
  }

  async function handleToggleNotifications() {
    if (!prefs.data) return;

    if (prefs.data.notificationsEnabled) {
      db().setPreferences({ ...prefs.data, notificationsEnabled: false });
      return;
    }

    let hasNotifPermission = await areNotificationsAllowed();
    if (!hasNotifPermission) {
      hasNotifPermission = await requestNotificationPermission();
    }

    db().setPreferences({
      ...prefs.data,
      notificationsEnabled: hasNotifPermission,
    });
  }

  return (
    <>
      <PageHeader title="Settings">
        <DarkModeToggle />
      </PageHeader>
      <section class={styles.settingsContent}>
        <div class={styles.profileBanner}>
          <Profile />
        </div>

        {/* <h2>Preferences</h2> */}

        <div class={styles.field}>
          <Label for="name">Your spoons per day goal</Label>
          <Input
            type="number"
            placeholder="Your spoons per day goal"
            pattern="\d+"
            value={prefs.data?.spoonsPerDay}
            onChange={(e) => handleSetSpoonsPerDay(parseInt(e.target.value))}
          />
        </div>

        <Separator />

        {/* <h2>Actions</h2> */}

        <Button
          class={styles.settingsButton}
          variant="secondary"
          onClick={handleToggleNotifications}
        >
          {prefs.data?.notificationsEnabled
            ? "Disable Notifications"
            : "Enable Notifications"}
        </Button>

        <Button
          class={styles.settingsButton}
          variant="secondary"
          onClick={handleLoginClick}
        >
          {user() ? "Logout" : "Login"}
        </Button>
      </section>
    </>
  );
}
