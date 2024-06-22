import { DateTime } from "luxon";

import { Mode } from "./types";

export function getRange(mode: Mode, date: DateTime) {
  if (mode === "3day") {
    return {
      startDate: date.startOf("day"),
      endDate: date.endOf("day").plus({ days: 2 }),
    };
  }

  if (mode === "week") {
    return {
      startDate: date.plus({ days: 1 }).startOf("week").plus({ days: -1 }),
      endDate: date.plus({ days: 1 }).endOf("week").plus({ days: -1 }),
    };
  }

  return {
    startDate: date.startOf("month"),
    endDate: date.endOf("month"),
  };
}
