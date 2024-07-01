import { createQuery } from "@tanstack/solid-query";
import { For, Show, createSignal } from "solid-js";

import styles from "./calendarMenu.module.css";

import MoreIcon from "~/assets/icons/more.svg?raw";
import { Icon } from "~/components/Icon";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Label } from "~/components/ui/label";
import { createPreferencesQuery, useDb } from "~/lib/api/db";
import { FireSpoonsDb } from "~/lib/api/firebase/firedb";
import { authorizeGoogleCalendar } from "~/lib/api/google";

export function CalendarMenu() {
  const [isManageCalendarsOpen, setIsManageCalendarsOpen] = createSignal(false);

  const preferencesQuery = createPreferencesQuery();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="ghost" size="icon">
            <Icon innerHTML={MoreIcon} />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <Show when={preferencesQuery.data?.googleAuthStatus !== "success"}>
            <DropdownMenuItem onClick={() => authorizeGoogleCalendar()}>
              Connect with Google Calendar
            </DropdownMenuItem>
          </Show>

          <Show when={preferencesQuery.data?.googleAuthStatus === "success"}>
            <DropdownMenuItem onClick={() => setIsManageCalendarsOpen(true)}>
              Manage Calendars
            </DropdownMenuItem>
          </Show>
        </DropdownMenuContent>
      </DropdownMenu>

      <CalendarSetDialog
        isOpen={isManageCalendarsOpen()}
        setIsOpen={setIsManageCalendarsOpen}
      />
    </>
  );
}

function CalendarSetDialog(props: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const db = useDb();

  const calendarQuery = createQuery(() => ({
    queryKey: ["calendars"],
    queryFn: () => FireSpoonsDb.calendars.getCalendars(),
    retry: false,
  }));

  const preferencesQuery = createPreferencesQuery();

  function handleToggleCalendar(calendarId: string) {
    if (!preferencesQuery.data) {
      return;
    }

    if (preferencesQuery.data.enabledCalendars?.includes(calendarId)) {
      const enabledCalendars = preferencesQuery.data.enabledCalendars.filter(
        (c) => c !== calendarId
      );
      db().updatePreferences({ enabledCalendars });
      return;
    }

    const enabledCalendars = [
      ...(preferencesQuery.data.enabledCalendars || []),
      calendarId,
    ];
    db().updatePreferences({ enabledCalendars });
  }

  function isChecked(calendarId: string) {
    return (
      !preferencesQuery.data?.enabledCalendars ||
      preferencesQuery.data?.enabledCalendars?.includes(calendarId)
    );
  }

  return (
    <Dialog open={props.isOpen} onOpenChange={() => props.setIsOpen(false)}>
      <DialogContent>
        <DialogTitle>Show events from:</DialogTitle>

        <ul class={styles.calendarList}>
          <For each={calendarQuery.data}>
            {(calendar, i) => (
              <li class={styles.calendarItem}>
                <Checkbox
                  id={"calendar-" + i()}
                  checked={isChecked(calendar.id)}
                  onChange={() => handleToggleCalendar(calendar.id)}
                />
                <Label for={"calendar-" + i() + "-input"}>
                  {calendar.summary}
                </Label>
              </li>
            )}
          </For>
        </ul>
      </DialogContent>
    </Dialog>
  );
}
