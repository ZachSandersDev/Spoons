import { v4 as uuidv4 } from "uuid";

export interface TaskEvent {
  id: string;
  title: string;

  /** Target date for getting the task done */
  targetDate: string;

  /** Target time for getting the task done */
  targetTime: string;

  /** Number of effort a task should take */
  spoons: number;

  priority: number;
  createdAt: number;
}

export function newTaskEvent(initial?: Partial<TaskEvent>): TaskEvent {
  return {
    id: uuidv4(),
    title: "",
    targetDate: "",
    targetTime: "",
    spoons: 1,
    priority: 2,
    createdAt: Date.now(),
    ...initial,
  };
}
