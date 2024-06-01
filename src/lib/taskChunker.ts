import { DateTime } from "luxon";

import { TaskEvent } from "./types/TaskEvent";

export interface TaskChunk {
  spoons: number;
  tasks: TaskEvent[];
}

export function chunkTasks(tasks: TaskEvent[], chunkSize: number) {
  const tasksByDay: Record<number, TaskChunk | undefined> = {};

  const tasksWithDates = tasks.filter((t) => !!t.targetDate);
  let tasksWithoutDates = tasks.filter((t) => !t.targetDate);

  const today = DateTime.now().startOf("day");

  // Push scheduled tasks to the date they are scheduled for
  for (const task of tasksWithDates) {
    const taskDate = DateTime.fromFormat(task.targetDate, "yyyy-MM-dd");
    const dateOffset = taskDate.diff(today, "days").days;

    // For tasks that are scheduled in the past, but aren't done
    // consider them to be unscheduled, top priority tasks
    if (dateOffset < 0) {
      tasksWithoutDates.unshift(task);
      continue;
    }

    if (!tasksByDay[dateOffset]) {
      tasksByDay[dateOffset] = { spoons: 0, tasks: [] };
    }

    tasksByDay[dateOffset]!.spoons += task.spoons;
    tasksByDay[dateOffset]!.tasks.push(task);
  }

  // Remove any tasks that will never fit
  tasksWithoutDates = tasksWithoutDates.filter((t) => t.spoons <= chunkSize);

  // Push unscheduled tasks as needed
  let dateOffset = 0;
  while (tasksWithoutDates.length > 0) {
    // Advance the date offset until we find a day that has capacity
    while (
      tasksByDay[dateOffset] &&
      tasksByDay[dateOffset]!.spoons >= chunkSize
    ) {
      dateOffset++;
    }

    // Ensure the day exists
    if (!tasksByDay[dateOffset]) {
      tasksByDay[dateOffset] = { spoons: 0, tasks: [] };
    }

    // Advance the task index until we find one that will fit
    let taskIndex = 0;
    while (
      tasksWithoutDates[taskIndex] &&
      tasksByDay[dateOffset]!.spoons + tasksWithoutDates[taskIndex].spoons >
        chunkSize
    ) {
      taskIndex++;
    }

    // If we didn't find a task that will fit, shove the first one in
    if (!tasksWithoutDates[taskIndex]) {
      taskIndex = 0;
    }

    // Add the task to the day
    const task = tasksWithoutDates.splice(taskIndex, 1)[0];
    tasksByDay[dateOffset]!.spoons += task.spoons;
    tasksByDay[dateOffset]!.tasks.push(task);
  }

  // Make sure the tasks are sorted by priority
  for (const day of Object.values(tasksByDay)) {
    day?.tasks.sort((a, b) => {
      if (!a.targetTime && b.targetTime) {
        return 1;
      }

      if (a.targetTime && !b.targetTime) {
        return -1;
      }

      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }

      return a.createdAt - b.createdAt;
    });
  }

  return tasksByDay;
}
