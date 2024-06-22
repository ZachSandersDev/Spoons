import { DateTime } from "luxon";
import { Match, Switch } from "solid-js";

import { Mode } from "../types";
import { getRange } from "../utils";

const MONTH_DAY = "MMM dd";
const MONTH_DAY_YEAR = "MMM dd, yyyy";
const MONTH_YEAR = "MMM yyyy";
const DAY_YEAR = "dd, yyyy";

export function DateRangeTitle(props: { mode: Mode; currentDate: DateTime }) {
  const currentDateRange = () => getRange(props.mode, props.currentDate);

  return (
    <>
      <Switch>
        <Match when={props.mode === "month"}>
          {currentDateRange().startDate.toFormat(MONTH_YEAR)}
        </Match>

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
