import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { DateTime } from "luxon";
import { createSignal, onCleanup } from "solid-js";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function classes(...inputs: (string | boolean | undefined | null)[]) {
  return inputs
    .filter((i): i is string => !!i && typeof i === "string")
    .join(" ");
}

export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function dateTimeFrom(
  dateStr: string | undefined,
  timeStr: string | undefined
) {
  const date = DateTime.fromFormat(
    dateStr || DateTime.now().toFormat("yyyy-MM-dd"),
    "yyyy-MM-dd"
  );
  const time = DateTime.fromFormat(timeStr || "09:00", "HH:mm");

  const dateTime = DateTime.fromObject({
    year: date.year,
    month: date.month,
    day: date.day,
    hour: time.hour,
    minute: time.minute,
  });

  return dateTime;
}

export function useIsDesktop() {
  const query = window.matchMedia("(min-width: 768px)");

  const [isDesktop, setIsDesktop] = createSignal(query.matches);

  function onChange(e: MediaQueryListEvent) {
    setIsDesktop(e.matches);
  }
  query.addEventListener("change", onChange);
  onCleanup(() => query.removeEventListener("change", onChange));

  return isDesktop;
}
