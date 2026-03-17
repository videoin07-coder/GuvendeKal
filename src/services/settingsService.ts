import * as SecureStore from 'expo-secure-store';

const KEY = 'app_settings_v2';

export interface AppSettings {
  customMessage: string;
  countdownSeconds: number; // KADES: yanlış basma önlemi geri sayımı
  sendLocationLink: boolean;
  vibrationEnabled: boolean;
  alarmSoundEnabled: boolean;
  shareWithPolice: boolean; // 155'e kopyala bilgisi
  safeWordEnabled: boolean;
  safeWord: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  customMessage: 'TEHLİKEDEYİM! Lütfen beni ara veya yardım gönder.',
  countdownSeconds: 5,
  sendLocationLink: true,
  vibrationEnabled: true,
  alarmSoundEnabled: true,
  shareWithPolice: true,
  safeWordEnabled: false,
  safeWord: '',
};

export async function getSettings(): Promise<AppSettings> {
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await SecureStore.setItemAsync(KEY, JSON.stringify(settings));
}
