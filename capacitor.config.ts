import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "dev.zachsanders.spoons",
  appName: "Spoons",
  webDir: "dist",
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav",
    },
  },
  server: {
    url: "http://192.168.4.158:5173/",
  },
};

export default config;
