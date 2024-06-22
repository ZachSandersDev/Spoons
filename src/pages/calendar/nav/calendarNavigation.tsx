import { DateTime } from "luxon";

import { Mode } from "../types";

import styles from "./calendarNavigation.module.css";

import LeftIcon from "~/assets/icons/chevron_left_icon.svg?raw";
import RightIcon from "~/assets/icons/chevron_right_icon.svg?raw";

import { Button } from "~/components/ui/button";

export function CalendarNavigation(props: {
  mode: Mode;
  currentDate: DateTime;
  setCurrentDate: (date: DateTime) => void;
}) {
  function handleNavigate(forwards: boolean) {
    if (props.mode === "week") {
      const offset = 1 * (forwards ? 1 : -1);
      props.setCurrentDate(props.currentDate.plus({ weeks: offset }));
    }

    if (props.mode === "3day") {
      const offset = 3 * (forwards ? 1 : -1);
      props.setCurrentDate(props.currentDate.plus({ days: offset }));
    }

    if (props.mode === "month") {
      const offset = 1 * (forwards ? 1 : -1);
      props.setCurrentDate(props.currentDate.plus({ months: offset }));
    }
  }

  return (
    <div class={styles.calendarNavigation}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleNavigate(false)}
        innerHTML={LeftIcon}
      />

      <Button onClick={() => props.setCurrentDate(DateTime.now())}>
        Today
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleNavigate(true)}
        innerHTML={RightIcon}
      />
    </div>
  );
}
