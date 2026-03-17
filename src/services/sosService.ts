import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import * as Haptics from 'expo-haptics';
import { Linking, Platform } from 'react-native';
import { getContacts, SOSContact } from './contactsService';
import { getSettings } from './settingsService';
import { addRecord } from './historyService';

export type SOSPhase =
  | 'idle'
  | 'countdown'   // KADES: geri sayım — yanlış basma önlemi
  | 'locating'
  | 'sending'
  | 'done'
  | 'cancelled'
  | 'error';

export interface SOSState {
  phase: SOSPhase;
  message: string;
  countdown?: number;
}

export interface LocationResult {
  latitude: number;
  longitude: number;
  accuracy: number | null;
}

export async function getLocation(): Promise<LocationResult | null> {
  const { status: permStatus } = await Location.requestForegroundPermissionsAsync();
  if (permStatus !== 'granted') return null;

  const loc = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });

  return {
    latitude: loc.coords.latitude,
    longitude: loc.coords.longitude,
    accuracy: loc.coords.accuracy,
  };
}

export async function dispatchSOS(
  location: LocationResult | null,
  contacts: SOSContact[]
): Promise<{ success: boolean; error?: string }> {
  const settings = await getSettings();

  const mapsLink = location
    ? `https://maps.google.com/?q=${location.latitude},${location.longitude}`
    : 'Konum alınamadı';

  const message = settings.sendLocationLink && location
    ? `🆘 ${settings.customMessage}\n📍 Konumum: ${mapsLink}`
    : `🆘 ${settings.customMessage}`;

  const isAvailable = await SMS.isAvailableAsync();
  if (!isAvailable) {
    return { success: false, error: 'SMS bu cihazda desteklenmiyor' };
  }

  const phones = contacts.map((c) => c.phone);
  await SMS.sendSMSAsync(phones, message);

  // Geçmişe kaydet
  if (location) {
    await addRecord({
      timestamp: Date.now(),
      latitude: location.latitude,
      longitude: location.longitude,
      contactCount: contacts.length,
      result: 'sent',
    });
  }

  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  return { success: true };
}

export function call112(): void {
  const url = Platform.OS === 'android' ? 'tel:112' : 'telprompt:112';
  Linking.openURL(url).catch(() => {});
}

export function call155(): void {
  const url = Platform.OS === 'android' ? 'tel:155' : 'telprompt:155';
  Linking.openURL(url).catch(() => {});
}

export function call156(): void {
  const url = Platform.OS === 'android' ? 'tel:156' : 'telprompt:156';
  Linking.openURL(url).catch(() => {});
}

export function call110(): void {
  const url = Platform.OS === 'android' ? 'tel:110' : 'telprompt:110';
  Linking.openURL(url).catch(() => {});
}
