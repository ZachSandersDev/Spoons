import { deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";

import { getUserRef, onDocumentChange, resolveWithIds } from "./db";

import { DayProgress } from "~/lib/types/DayProgress";

function dayProgressQuery(date: string) {
  return doc(getUserRef(), "dayProgress", date);
}

async function getDayProgress(date: string) {
  const snapshot = await getDoc(dayProgressQuery(date));
  return resolveWithIds<DayProgress>(snapshot);
}

async function setDayProgress(progress: DayProgress) {
  await setDoc(dayProgressQuery(progress.id), progress);
}

async function deleteDayProgress(date: string) {
  await deleteDoc(dayProgressQuery(date));
}

function onDayProgress(
  date: string,
  callback: (snapshot: DayProgress) => void
) {
  return onDocumentChange(
    () => dayProgressQuery(date),
    resolveWithIds,
    callback
  );
}

export const FireDayProgressAPI = {
  getDayProgress,
  setDayProgress,
  deleteDayProgress,
  onDayProgress,
};
