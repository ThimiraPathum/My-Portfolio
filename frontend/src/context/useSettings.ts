import { createContext, useContext } from 'react';
interface SettingsContextType {
  settings: Record<string, string>;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);


export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be within SettingsProvider');
  return context;
}
