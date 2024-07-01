import { FireSpoonsDb } from "./firebase/firedb";

export async function authorizeGoogleCalendar() {
  await FireSpoonsDb.updatePreferences({
    googleAuthURL: "client," + window.location.href,
  });

  const unsubscribe = FireSpoonsDb.onPreferences((prefs) => {
    if (!prefs.googleAuthURL || prefs.googleAuthURL.startsWith("client,")) {
      return;
    }

    unsubscribe();
    location.href = prefs.googleAuthURL;
  });
}
