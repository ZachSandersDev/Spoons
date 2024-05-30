import type { ClassValue } from "clsx";
import { clsx } from "clsx";
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
