import {
  DocumentReference,
  DocumentSnapshot,
  Query,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  or,
  orderBy,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { DateTime } from "luxon";

import { user } from "../../state/user";
import { Preferences } from "../../types/Preferences";
import { TaskEvent } from "../../types/TaskEvent";

import { FireDayProgressAPI } from "./dayProgress";
import { FireType, db, resolveWithIds, stripId } from "./db";

function allTasksQuery() {
  if (!user()) {
    throw new Error("User not logged in");
  }

  return query(
    collection(db, "users", user()!.uid, "tasks"),
    orderBy("priority"),
    orderBy("createdAt")
  );
}

async function getAllTasks() {
  if (!user()) {
    throw new Error("User not logged in");
  }

  const snapshot = await getDocs(allTasksQuery());
  return snapshot.docs.map(resolveWithIds) as TaskEvent[];
}

function onAllTasks(callback: (snapshot: TaskEvent[]) => void) {
  return onCollectionChange(allTasksQuery, callback);
}

function todayTasksQuery() {
  return query(
    collection(db, "users", user()!.uid, "tasks"),
    or(
      where("targetDate", "==", ""),
      where("targetDate", "<=", DateTime.now().toFormat("yyyy-MM-dd"))
    ),
    orderBy("priority"),
    orderBy("createdAt")
  );
}

async function getTodayTasks() {
  if (!user()) {
    throw new Error("User not logged in");
  }

  const snapshot = await getDocs(todayTasksQuery());
  return snapshot.docs.map(resolveWithIds) as TaskEvent[];
}

function onTodayTasks(callback: (snapshot: TaskEvent[]) => void) {
  return onCollectionChange(todayTasksQuery, callback);
}

async function addTask(task: TaskEvent) {
  if (!user()) {
    return;
  }

  const taskRef = collection(db, "users", user()!.uid, "tasks");
  await addDoc(taskRef, stripId(task));
}

async function updateTask(task: TaskEvent) {
  if (!user()) {
    return;
  }

  const taskRef = doc(db, "users", user()!.uid, "tasks", task.id);
  await setDoc(taskRef, stripId(task));
}

async function deleteTask(task: TaskEvent) {
  if (!user()) {
    return;
  }

  const taskRef = doc(db, "users", user()!.uid, "tasks", task.id);
  await deleteDoc(taskRef);
}

function preferencesQuery() {
  if (!user()) {
    throw new Error("User not logged in");
  }

  return doc(db, "users", user()!.uid);
}

async function getPreferences(): Promise<Preferences> {
  const snapshot = await getDoc(preferencesQuery());

  const prefs = snapshot.data();
  if (!prefs) {
    return { id: "default" };
  }

  return resolveWithIds(snapshot);
}

async function setPreferences(preferences: Preferences) {
  await setDoc(preferencesQuery(), stripId(preferences));
}

function onPreferences(callback: (snapshot: Preferences) => void) {
  return onDocumentChange(
    preferencesQuery,
    (prefSnapshot) => {
      const prefs = prefSnapshot.data();
      if (!prefs) {
        return { id: "default" };
      }

      return resolveWithIds(prefSnapshot);
    },
    callback
  );
}

function onCollectionChange<T extends FireType>(
  query: () => Query,
  callback: (snapshot: T[]) => void
) {
  const unsubscribe = onSnapshot(query(), (snapshot) => {
    callback(snapshot.docs.map(resolveWithIds<T>));
  });

  return unsubscribe;
}

function onDocumentChange<T extends FireType>(
  query: () => DocumentReference,
  formatter: (doc: DocumentSnapshot) => T,
  callback: (snapshot: T) => void
) {
  return onSnapshot(query(), (snapshot) => {
    callback(formatter(snapshot));
  });
}

export const FireSpoonsDb = {
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

  dayProgress: FireDayProgressAPI,
};
