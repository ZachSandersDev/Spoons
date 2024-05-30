import {
  DocumentReference,
  DocumentSnapshot,
  Query,
  doc,
  getFirestore,
  onSnapshot,
} from "firebase/firestore";

import { app } from "../firebase";

import { user } from "~/lib/state/user";

export const db = getFirestore(app);

export type FireType = { id: string };

export function resolveWithIds<T extends FireType>(doc: DocumentSnapshot): T {
  return { id: doc.id, ...doc.data() } as T;
}

export function stripId<T extends FireType>(doc: T): Omit<T, "id">[] {
  const fireDoc: any = structuredClone(doc);
  delete fireDoc.id;
  return fireDoc;
}

export function onCollectionChange<T extends FireType>(
  query: () => Query,
  callback: (snapshot: T[]) => void
) {
  const unsubscribe = onSnapshot(query(), (snapshot) => {
    callback(snapshot.docs.map(resolveWithIds<T>));
  });

  return unsubscribe;
}

export function onDocumentChange<T extends FireType>(
  query: () => DocumentReference,
  formatter: (doc: DocumentSnapshot) => T,
  callback: (snapshot: T) => void
) {
  return onSnapshot(query(), (snapshot) => {
    callback(formatter(snapshot));
  });
}

export function getUserRef() {
  if (!user()) {
    throw new Error("User not logged in");
  }

  return doc(db, "users", user()!.uid);
}
