import { Mode } from "../types";

export function ModeSelect(props: {
  mode: Mode;
  setMode: (mode: Mode) => void;
}) {
  return (
    <select
      class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      value={props.mode}
      onChange={(e) => props.setMode(e.target.value as Mode)}
    >
      <option value="month">Month</option>
      <option value="week">Week</option>
      <option value="3day">3-Day</option>
    </select>
  );
}
