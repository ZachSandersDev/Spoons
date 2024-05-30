import { DateTime } from "luxon";

import { ParentProps } from "solid-js";

import styles from "./dayCell.module.scss";

import { classes } from "~/lib/utils";

export function DayCell(
  props: ParentProps<{
    day: DateTime;
    class?: string;
    size?: "small" | "medium" | "large";
  }>
) {
  const day = () => props.day;

  const isToday = () =>
    day().hasSame(DateTime.now(), "day") &&
    day().hasSame(DateTime.now(), "month") &&
    day().hasSame(DateTime.now(), "year");

  const dateIndicator = () => {
    if (props.size === "small") {
      return day().toLocaleString({ day: "numeric" });
    }

    return day().toFormat("EEE<br/>d");
  };

  return (
    <div
      class={classes(
        styles.dayCell,
        styles[`dayCell-size-${props.size}`],
        props.class
      )}
    >
      <span
        class={classes(
          styles.dateIndicator,
          isToday() && styles.dateIndicatorToday
        )}
        innerHTML={dateIndicator()}
      />

      {props.children}
    </div>
  );
}
