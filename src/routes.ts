import { RouteDefinition } from "@solidjs/router";
import { lazy } from "solid-js";

export const routes: RouteDefinition[] = [
  { path: "/", component: lazy(() => import("./pages/today")) },
  { path: "/all-tasks", component: lazy(() => import("./pages/allTasks")) },
  { path: "/settings", component: lazy(() => import("./pages/settings")) },
  {
    path: "/calendar",
    component: lazy(() => import("./pages/calendar/calendarPage")),
  },
  { path: "/login", component: lazy(() => import("./pages/login")) },
  { path: "/tutorial", component: lazy(() => import("./pages/tutorial")) },
];
