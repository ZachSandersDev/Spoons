import { v4 as uuidv4 } from "uuid";

export interface TaskEvent {
  id: string;
  title: string;
  completed: boolean;

  /** Target date for getting the task done */
  targetDate: string;

  /** Target time for getting the task done */
  targetTime: string;

  /** Number of effort a task should take */
  spoons: number;

  priority: number;
  createdAt: number;

  repeat?: {
    frequency?: number;
    unit?: RepeatUnit;
  };
}

export type RepeatUnit = "hours" | "days" | "weeks" | "months" | "years";

export function newTaskEvent(initial?: Partial<TaskEvent>): TaskEvent {
  return {
    id: uuidv4(),
    title: "",
    targetDate: "",
    targetTime: "",
    completed: false,
    spoons: 1,
    priority: 2,
    createdAt: Date.now(),
    ...initial,
  };
}
