import { DateTime } from "luxon";

import { Component, ParentProps, Show } from "solid-js";

import styles from "./dayCell.module.scss";

import { classes } from "~/lib/utils";

export function DayCell(
  props: ParentProps<{
    day: DateTime;
    class?: string;
    classList?: Record<string, boolean>;
    size?: "small" | "medium" | "large";
    indicatorContainer?: Component;
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

    return day().toFormat("EEE d");
  };

  return (
    <div
      class={props.class}
      classList={{
        [styles.dayCell]: true,
        [styles[`dayCell-size-${props.size}`]]: true,
        ...(props.classList || {}),
      }}
    >
      <Show when={props.indicatorContainer}>
        {/* @ts-expect-error It's a component, but ts doesn't think so... */}
        <props.indicatorContainer
          class={classes(
            styles.dateIndicator,
            isToday() && styles.dateIndicatorToday
          )}
        >
          <span innerHTML={dateIndicator()} />
        </props.indicatorContainer>
      </Show>
      <Show when={!props.indicatorContainer}>
        <span
          class={classes(
            styles.dateIndicator,
            isToday() && styles.dateIndicatorToday
          )}
          innerHTML={dateIndicator()}
        />
      </Show>
      {props.children}
    </div>
  );
}
