import * as SecureStore from 'expo-secure-store';

const KEY = 'sos_contacts_v2';

export interface SOSContact {
  id: string;
  name: string;
  phone: string;
  emoji: string; // kişi avatarı
  addedAt: number;
}

export async function getContacts(): Promise<SOSContact[]> {
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    return raw ? (JSON.parse(raw) as SOSContact[]) : [];
  } catch {
    return [];
  }
}

export async function saveContacts(contacts: SOSContact[]): Promise<void> {
  await SecureStore.setItemAsync(KEY, JSON.stringify(contacts));
}

export async function addContact(
  data: Omit<SOSContact, 'id' | 'addedAt'>
): Promise<SOSContact[]> {
  const list = await getContacts();
  const contact: SOSContact = { ...data, id: Date.now().toString(), addedAt: Date.now() };
  const updated = [...list, contact];
  await saveContacts(updated);
  return updated;
}

export async function removeContact(id: string): Promise<SOSContact[]> {
  const list = await getContacts();
  const updated = list.filter((c) => c.id !== id);
  await saveContacts(updated);
  return updated;
}
