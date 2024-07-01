export type Preferences = {
  id: string;
  spoonsPerDay?: number;
  notificationsEnabled?: boolean;

  enabledCalendars?: string[];

  googleAuthURL?: string;
  googleAuthCode?: string;
  googleAuthStatus?: "pending" | "success" | "failure";
};
