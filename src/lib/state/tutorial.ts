const TUTORIAL_KEY = "tutorial_complete";

export function isTutorialComplete() {
  return localStorage.getItem(TUTORIAL_KEY) === "true";
}

export function setTutorialComplete() {
  localStorage.setItem(TUTORIAL_KEY, "true");
}
