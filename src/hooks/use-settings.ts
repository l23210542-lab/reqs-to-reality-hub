import { useSyncExternalStore } from "react";
import { DEFAULT_SETTINGS, getSettings, subscribeSettings } from "@/lib/settings";

export function useSettings() {
  return useSyncExternalStore(subscribeSettings, getSettings, () => DEFAULT_SETTINGS);
}
