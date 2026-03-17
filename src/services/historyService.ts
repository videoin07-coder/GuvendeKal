import * as SecureStore from 'expo-secure-store';

const KEY = 'sos_history_v2';

export type SOSResult = 'sent' | 'cancelled' | 'error';

export interface SOSRecord {
  id: string;
  timestamp: number;
  latitude: number;
  longitude: number;
  contactCount: number;
  result: SOSResult;
  note?: string;
}

export async function getHistory(): Promise<SOSRecord[]> {
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    return raw ? (JSON.parse(raw) as SOSRecord[]) : [];
  } catch {
    return [];
  }
}

export async function addRecord(record: Omit<SOSRecord, 'id'>): Promise<void> {
  const history = await getHistory();
  const newRecord: SOSRecord = { ...record, id: Date.now().toString() };
  // Son 50 kayıt
  const updated = [newRecord, ...history].slice(0, 50);
  await SecureStore.setItemAsync(KEY, JSON.stringify(updated));
}

export async function clearHistory(): Promise<void> {
  await SecureStore.deleteItemAsync(KEY);
}

export function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Az önce';
  if (mins < 60) return `${mins} dk önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  return `${days} gün önce`;
}
