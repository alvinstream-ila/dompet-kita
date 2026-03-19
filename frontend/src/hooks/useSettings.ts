import { useSettingsStore } from '../context/settingsStore';

export const useSettings = () => {
  return useSettingsStore();
};
