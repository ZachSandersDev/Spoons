import styles from "./modeSelect.module.css";

import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "~/components/ui/select";

import { type Mode, mode, setMode } from "~/pages/calendar/calendarPage";

export function ModeSelect() {
  const modeText: Record<Mode, string> = {
    month: "Month",
    week: "Week",
    "3day": "3-Day",
  };

  return (
    <Select<Mode>
      options={["month", "week", "3day"]}
      value={mode()}
      onChange={setMode}
      itemComponent={({ item }) => (
        <SelectItem item={item}>{modeText[item.rawValue]}</SelectItem>
      )}
    >
      <SelectTrigger class={styles.modeSelect}>
        <SelectValue>{modeText[mode()]}</SelectValue>
      </SelectTrigger>

      <SelectContent />
    </Select>
  );
}
