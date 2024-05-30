import { createSignal, onCleanup } from "solid-js";

export function createMediaQuery(query: string) {
  const mediaQuery = window.matchMedia(query);

  const [matches, setMatches] = createSignal(mediaQuery.matches);

  function handleChange(event: MediaQueryListEvent) {
    setMatches(event.matches);
  }

  mediaQuery.addEventListener("change", handleChange);

  onCleanup(() => {
    mediaQuery.removeEventListener("change", handleChange);
  });

  return matches;
}
