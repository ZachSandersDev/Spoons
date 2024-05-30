import { DateTime } from "luxon";

import styles from "./datePicker.module.scss";

import CloseIcon from "~/assets/icons/close.svg?raw";
import { Button } from "~/components/ui/button";

import { TaskEvent } from "~/lib/types/TaskEvent";
import { classes } from "~/lib/utils";

export type DatePickerProps = {
  task: TaskEvent;
  setTask: (task: TaskEvent) => void;
};

export function DatePicker(props: DatePickerProps) {
  let datePicker: HTMLInputElement;
  let timePicker: HTMLInputElement;

  function handleShowPicker(element: HTMLInputElement) {
    element.click();
    element.focus();
    element.showPicker();
  }

  const dateText = () =>
    props.task.targetDate
      ? DateTime.fromFormat(props.task.targetDate, "yyyy-MM-dd").toLocaleString(
          DateTime.DATE_SHORT
        )
      : "Date";

  const timeText = () =>
    props.task.targetTime
      ? DateTime.fromFormat(props.task.targetTime, "HH:mm").toLocaleString(
          DateTime.TIME_SIMPLE
        )
      : "Time";

  return (
    <div class={styles.datePicker}>
      <div class={styles.datePickerField}>
        <Button
          onClick={() => handleShowPicker(datePicker)}
          variant="outline"
          class={classes(!props.task.targetDate && styles.buttonPlaceholder)}
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
          class={classes(!props.task.targetTime && styles.buttonPlaceholder)}
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
  );
}
