import Dexie, { liveQuery } from "dexie";
import { DateTime } from "luxon";

import { v4 as uuid } from "uuid";

import { Preferences } from "../types/Preferences";
import { TaskEvent } from "../types/TaskEvent";

class SpoonsDb extends Dexie {
  public tasks!: Dexie.Table<TaskEvent, string>;
  public prefs!: Dexie.Table<Preferences, string>;

  constructor() {
    super("tasks");
    this.version(1).stores({
      tasks: "id, priority, targetDate, targetTime, [priority+createdAt]",
      prefs: "id, notificationsEnabled, spoonsPerDay",
    });

    (async () => {
      const preferences = await this.prefs?.get({ id: "default" });
      if (!preferences) {
        await this.prefs.add({ id: "default", notificationsEnabled: false });
      }
    })();
  }
}

const spoonsDb = new SpoonsDb();

function allTasksQuery() {
  return spoonsDb.tasks.orderBy("[priority+createdAt]");
}

function getAllTasks() {
  return allTasksQuery().toArray();
}

function onAllTasks(callback: (value: TaskEvent[]) => void) {
  return onQueryChange(getAllTasks, callback);
}

function todayTasksQuery() {
  return spoonsDb.tasks
    .orderBy("[priority+createdAt]")
    .filter(
      (task) =>
        !task.targetDate ||
        task.targetDate <= DateTime.now().toFormat("yyyy-MM-dd")
    );
}

function getTodayTasks() {
  return todayTasksQuery().toArray();
}

function onTodayTasks(callback: (value: TaskEvent[]) => void) {
  return onQueryChange(getTodayTasks, callback);
}

async function addTask(task: TaskEvent) {
  const newTask = { ...task, id: task.id || uuid() };
  await spoonsDb.tasks.add(newTask);
}

async function updateTask(task: TaskEvent) {
  await spoonsDb.tasks.update(task.id, task);
}

async function deleteTask(task: TaskEvent) {
  await spoonsDb.tasks.delete(task.id);
}

async function setPreferences(preferences: Preferences) {
  await spoonsDb.prefs.update("default", preferences);
}

async function getPreferences(): Promise<Preferences> {
  return (await spoonsDb.prefs?.get({ id: "default" })) || { id: "default" };
}

function onPreferences(callback: (value: Preferences) => void) {
  return onQueryChange(getPreferences, callback);
}

function onQueryChange<T>(
  query: () => Promise<T>,
  callback: (value: T) => void
) {
  const observer = liveQuery(query);

  const subscription = observer.subscribe({
    next: callback,
    error: (error) => console.error(error),
  });

  return subscription.unsubscribe;
}

export const LocalSpoonsDb = {
  getAllTasks,
  onAllTasks,
  getTodayTasks,
  onTodayTasks,
  addTask,
  updateTask,
  deleteTask,
  setPreferences,
  getPreferences,
  onPreferences,
};
