import { DateTime } from "luxon";

import { Show } from "solid-js";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

import styles from "./datePicker.module.scss";

import { RepeatPicker } from "./repeatPicker";

import CloseIcon from "~/assets/icons/close.svg?raw";
import { Button } from "~/components/ui/button";

import { TaskEvent } from "~/lib/types/TaskEvent";
import { classes } from "~/lib/utils";

export type DatePickerProps = {
  task: TaskEvent;
  setTask: (task: TaskEvent) => void;
};

function formatDate(date: string) {
  return DateTime.fromFormat(date, "yyyy-MM-dd").toLocaleString(
    DateTime.DATE_SHORT
  );
}

function formatTime(time: string) {
  return DateTime.fromFormat(time, "HH:mm").toLocaleString(
    DateTime.TIME_SIMPLE
  );
}

export function DatePicker(props: DatePickerProps) {
  let datePicker: HTMLInputElement;
  let timePicker: HTMLInputElement;

  function handleShowPicker(element: HTMLInputElement) {
    element.click();
    element.focus();
    element.showPicker();
  }

  const dateText = () =>
    props.task.targetDate ? formatDate(props.task.targetDate) : "Date";

  const timeText = () =>
    props.task.targetTime ? formatTime(props.task.targetTime) : "Time";

  return (
    <Accordion multiple collapsible>
      <AccordionItem value="date">
        <AccordionTrigger>Date and Time</AccordionTrigger>
        <AccordionContent>
          <div class={styles.datePicker}>
            <div class={styles.datePickerField}>
              <Button
                onClick={() => handleShowPicker(datePicker)}
                variant="outline"
                class={classes(
                  !props.task.targetDate && styles.buttonPlaceholder
                )}
              >
                {dateText()}
              </Button>

              <input
                type="date"
                placeholder="Date"
                ref={(el) => (datePicker = el)}
                value={props.task.targetDate}
                onChange={(e) =>
                  props.setTask({ ...props.task, targetDate: e.target.value })
                }
              />
            </div>

            <div class={styles.datePickerField}>
              <Button
                onClick={() => handleShowPicker(timePicker)}
                variant="outline"
                class={classes(
                  !props.task.targetTime && styles.buttonPlaceholder
                )}
              >
                {timeText()}
              </Button>

              <input
                type="time"
                placeholder="Time"
                ref={(el) => (timePicker = el)}
                value={props.task.targetTime || "Time"}
                onChange={(e) => {
                  const newTask = { ...props.task, targetTime: e.target.value };

                  if (!newTask.targetDate) {
                    newTask.targetDate = DateTime.now().toFormat("yyyy-MM-dd");
                  }

                  props.setTask(newTask);
                }}
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                props.setTask({ ...props.task, targetDate: "", targetTime: "" })
              }
              innerHTML={CloseIcon}
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      <Show when={props.task.targetDate || props.task.targetTime}>
        <AccordionItem value="repeat">
          <AccordionTrigger>Repeat</AccordionTrigger>
          <AccordionContent>
            <RepeatPicker task={props.task} setTask={props.setTask} />
          </AccordionContent>
        </AccordionItem>
      </Show>
    </Accordion>
  );
}
