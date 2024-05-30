import { QueryFunctionContext, createQuery } from "@tanstack/solid-query";

import { queryClient } from "../state/queryClient";
import { isLoginCheckComplete, user } from "../state/user";

import { DayProgress } from "../types/DayProgress";

import { FireSpoonsDb } from "./firebase/firedb";

export function createDbListener() {
  // Auto-remove subscriptions when all observing components have unmounted
  queryClient.getQueryCache().subscribe(({ type, query }) => {
    const anyQuery = query as any;
    if (
      type === "observerRemoved" &&
      query.getObserversCount() === 0 &&
      anyQuery.__unsubscribe
    ) {
      anyQuery.__unsubscribe();
      delete anyQuery.__unsubscribe;
    }
  });
}

export function useDb() {
  return () => {
    // if (!user()) {
    //   return LocalSpoonsDb;
    // }

    return FireSpoonsDb;
  };
}

export function createAllTasksQuery() {
  const db = useDb();

  return createQuery(
    () => ({
      queryKey: ["allTasks", user()?.uid],
      queryFn: createSnapshotQuery(db().onAllTasks),
    }),
    () => queryClient
  );
}

export function createTodayTasksQuery() {
  const db = useDb();

  return createQuery(
    () => ({
      queryKey: ["todayTasks", user()?.uid],
      queryFn: createSnapshotQuery(db().onTodayTasks),
    }),
    () => queryClient
  );
}

export function createPreferencesQuery() {
  const db = useDb();

  return createQuery(
    () => ({
      queryKey: ["preferences", user()?.uid],
      queryFn: createSnapshotQuery(db().onPreferences),
    }),
    () => queryClient
  );
}

export function createDayProgressQuery(date: () => string) {
  const db = useDb();

  return createQuery(
    () => ({
      queryKey: ["dayProgress", date()],
      queryFn: createSnapshotQuery<DayProgress>((cb) =>
        db().dayProgress.onDayProgress(date(), cb)
      ),
    }),
    () => queryClient
  );
}

export function createSnapshotQuery<V>(
  runner: (callback: (value: V) => void) => () => void
) {
  return async (context: QueryFunctionContext) => {
    let isFirstCallback = true;
    let unsubscribe: () => void = () => undefined;

    const initialValue = await new Promise<V | undefined>((resolve, reject) => {
      if (!isLoginCheckComplete()) {
        reject(new Error("User not logged in"));
        return;
      }

      unsubscribe = runner((value) => {
        if (isFirstCallback) {
          resolve(value);
          isFirstCallback = false;
          return;
        }

        queryClient.setQueryData(context.queryKey, value);
      });
    });

    const cacheEntry: any = queryClient
      .getQueryCache()
      .find({ queryKey: context.queryKey });
    if (!cacheEntry) {
      return initialValue;
    }

    cacheEntry.__unsubscribe?.();
    cacheEntry.__unsubscribe = unsubscribe;

    return initialValue;
  };
}
