/* eslint-disable indent */
import { For, Show } from "solid-js";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Label } from "../ui/label";

import styles from "./repeatPicker.module.scss";

import CloseIcon from "~/assets/icons/close.svg?raw";
import { Button } from "~/components/ui/button";

import { RepeatUnit, TaskEvent } from "~/lib/types/TaskEvent";

export type RepeatPickerProps = {
  task: TaskEvent;
  setTask: (task: TaskEvent) => void;
};

function getUnitSelectorText(unit: RepeatUnit) {
  switch (unit) {
    case "hours":
      return "Hourly";
    case "days":
      return "Daily";
    case "weeks":
      return "Weekly";
    case "months":
      return "Monthly";
    case "years":
      return "Yearly";
  }
}

function getUnitText(unit: RepeatUnit) {
  switch (unit) {
    case "hours":
      return "hour";
    case "days":
      return "day";
    case "weeks":
      return "week";
    case "months":
      return "month";
    case "years":
      return "year";
  }
}

function getUnitDisplayText(amount: number, unit: RepeatUnit) {
  if (amount > 1) {
    return `${getUnitText(unit)}s`;
  }

  return getUnitText(unit);
}

export function RepeatPicker(props: RepeatPickerProps) {
  return (
    <Show when={props.task.targetDate || props.task.targetTime}>
      <Accordion class={styles.repeatPickerAccordion} multiple collapsible>
        <AccordionItem value="repeat">
          <AccordionTrigger>Repeat</AccordionTrigger>
          <AccordionContent>
            <div class={styles.repeatPicker}>
              <Label for="repeat-unit">Frequency</Label>

              <select
                id="repeat-unit"
                class={styles.selector}
                value={props.task?.repeat?.unit || ""}
                onChange={(e) =>
                  props.setTask({
                    ...props.task,
                    repeat: {
                      ...props.task.repeat,
                      unit: e.target.value as RepeatUnit,
                    },
                  })
                }
              >
                <option value="" selected></option>
                <For
                  each={["hours", "days", "weeks", "months", "years"] as const}
                >
                  {(unit) => (
                    <option value={unit}>{getUnitSelectorText(unit)}</option>
                  )}
                </For>
              </select>

              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  props.setTask({
                    ...props.task,
                    repeat: {},
                  })
                }
                innerHTML={CloseIcon}
              />

              <Label for="repeat-frequency">Every</Label>

              <select
                class={styles.selector}
                value={
                  props.task?.repeat?.frequency ||
                  (props.task.repeat?.unit ? 1 : 0)
                }
                onChange={(e) =>
                  props.setTask({
                    ...props.task,
                    repeat: {
                      ...props.task.repeat,
                      frequency: parseInt(e.target.value),
                    },
                  })
                }
              >
                <For each={new Array(999).fill(1).map((_, i) => i + 1)}>
                  {(frequency) => (
                    <option value={frequency}>
                      {frequency}{" "}
                      {props.task.repeat?.unit &&
                        getUnitDisplayText(
                          frequency,
                          props.task?.repeat?.unit || ""
                        )}
                    </option>
                  )}
                </For>
              </select>

              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  props.setTask({
                    ...props.task,
                    repeat: {
                      ...props.task.repeat,
                      frequency: props.task.repeat?.unit ? 1 : 0,
                    },
                  })
                }
                innerHTML={CloseIcon}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Show>
  );
}
