import { DateTime } from "luxon";

import { Show } from "solid-js";

import styles from "./calendarEventItem.module.scss";

import { CalendarEvent } from "~/lib/types/Calendars";

export function CalendarEventItem(props: {
  event: CalendarEvent;
  size?: "small" | "medium";
}) {
  const start = DateTime.fromISO(props.event.start.dateTime ?? "");
  const end = DateTime.fromISO(props.event.end.dateTime ?? "");

  const startingRow = Math.round(start.hour * 4 + start.minute / 15);
  const rowDiff = Math.round(end.diff(start, "minutes").minutes / 15);

  return (
    <div
      class={styles.calendarEvent}
      classList={{
        [styles[`calendarEvent--${props.event.colorId || "default"}`]]: true,
      }}
      style={{
        "grid-row": `${startingRow} / span ${rowDiff}`,
      }}
    >
      {/* <i class={styles.calendarEventIcon} innerHTML={CalendarIcon} /> */}
      <span>{props.event.summary}</span>
      <Show
        when={
          props.event.start.dateTime && (!props.size || props.size === "medium")
        }
      >
        <span class={styles.duration}>{`${start.toFormat(
          "h:mm a"
        )} - ${end.toFormat("h:mm a")}`}</span>
      </Show>
    </div>
  );
}
