import { DateTime } from "luxon";
import { Match, Switch } from "solid-js";

import { mode } from "~/pages/calendar/calendarPage";

const MONTH_DAY = "MMM dd";
const MONTH_DAY_YEAR = "MMM dd, yyyy";
const MONTH_YEAR = "MMM yyyy";
const DAY_YEAR = "dd, yyyy";

export function DateRangeTitle(props: { currentDate: DateTime }) {
  const currentDate = () => props.currentDate;

  const currentDateRange = () => {
    const currentMode = mode();

    if (currentMode === "3day") {
      return {
        startDate: currentDate(),
        endDate: currentDate().endOf("day").plus({ days: 2 }),
      };
    }

    if (currentMode === "week") {
      return {
        startDate: currentDate(),
        endDate: currentDate()
          .plus({ days: 1 })
          .endOf("week")
          .plus({ days: -1 }),
      };
    }

    return {
      startDate: currentDate(),
      endDate: currentDate().endOf("month"),
    };
  };

  return (
    <>
      <Switch>
        <Match when={mode() === "month"}>
          {currentDateRange().startDate.toFormat(MONTH_YEAR)}
        </Match>

        {/* <Match when={mode() === "day"}>
          {currentDateRange().startDate.toFormat(MONTH_DAY_YEAR)}
        </Match> */}

        <Match
          when={
            !currentDateRange().startDate.hasSame(
              currentDateRange().endDate,
              "year"
            )
          }
        >
          {currentDateRange().startDate.toFormat(MONTH_DAY_YEAR)}
          {" - "}
          {currentDateRange().endDate.toFormat(MONTH_DAY_YEAR)}
        </Match>

        <Match
          when={
            !currentDateRange().startDate.hasSame(
              currentDateRange().endDate,
              "month"
            )
          }
        >
          {currentDateRange().startDate.toFormat(MONTH_DAY)}
          {" - "}
          {currentDateRange().endDate.toFormat(MONTH_DAY_YEAR)}
        </Match>

        <Match when>
          {currentDateRange().startDate.toFormat(MONTH_DAY)}
          {" - "}
          {currentDateRange().endDate.toFormat(DAY_YEAR)}
        </Match>
      </Switch>
    </>
  );
}
