import { For } from "solid-js";

import styles from "./rangeSelector.module.css";
import { Button } from "./ui/button";

import { classes } from "~/lib/utils";

export function RangeSelector<T>(props: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  selectedClass?: string;
}) {
  return (
    <div class={styles.rangeOptionContainer}>
      <For each={props.options}>
        {({ value, label }) => (
          <Button
            class={classes(
              styles.rangeOption,
              props.value === value &&
                (props.selectedClass || styles.rangeOptionSelected)
            )}
            variant="outline"
            onClick={() => props.onChange(value)}
          >
            {label}
          </Button>
        )}
      </For>
    </div>
  );
}
