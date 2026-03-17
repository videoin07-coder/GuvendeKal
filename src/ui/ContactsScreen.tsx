import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SOSContact, getContacts, addContact, removeContact } from '../services/contactsService';
import { Colors, Radius, Shadow } from '../theme';

const EMOJIS = ['👤','👩','👨','🧑','👴','👵','🧒','🧑‍🦱','🧑‍🦰','🧑‍🦳','🧑‍🦲','🫂'];

export default function ContactsScreen() {
  const [contacts, setContacts] = useState<SOSContact[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [emoji, setEmoji] = useState('👤');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setContacts(await getContacts());
  }

  async function handleAdd() {
    const trimName = name.trim();
    const trimPhone = phone.replace(/\s/g, '');

    if (!trimName || !trimPhone) {
      Alert.alert('Eksik Bilgi', 'İsim ve telefon numarası zorunludur.');
      return;
    }
    if (!/^\+?\d{10,13}$/.test(trimPhone)) {
      Alert.alert('Geçersiz Numara', 'Lütfen ülke kodu ile girin.\nÖrn: +905551234567');
      return;
    }
    if (contacts.length >= 10) {
      Alert.alert('Limit', 'En fazla 10 SOS kişisi ekleyebilirsiniz.');
      return;
    }

    const updated = await addContact({ name: trimName, phone: trimPhone, emoji });
    setContacts(updated);
    setName(''); setPhone(''); setEmoji('👤'); setShowForm(false);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  async function handleRemove(id: string, contactName: string) {
    Alert.alert(
      'Kişiyi Kaldır',
      `${contactName} kişisini SOS listesinden çıkarmak istiyor musunuz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Kaldır',
          style: 'destructive',
          onPress: async () => {
            const updated = await removeContact(id);
            setContacts(updated);
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>SOS Kişileri</Text>
            <Text style={styles.subtitle}>{contacts.length}/10 kişi kayıtlı</Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setShowForm((v) => !v)}
            activeOpacity={0.8}
          >
            <Text style={styles.addBtnText}>{showForm ? '✕' : '+'}</Text>
          </TouchableOpacity>
        </View>

        {/* Add form */}
        {showForm && (
          <View style={styles.form}>
            {/* Emoji seçici */}
            <View style={styles.emojiRow}>
              {EMOJIS.map((e) => (
                <TouchableOpacity
                  key={e}
                  style={[styles.emojiBtn, emoji === e && styles.emojiBtnActive]}
                  onPress={() => setEmoji(e)}
                >
                  <Text style={styles.emojiText}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder="İsim (örn: Annem)"
              placeholderTextColor={Colors.textMuted}
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="+905551234567"
              placeholderTextColor={Colors.textMuted}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <TouchableOpacity style={styles.saveBtn} onPress={handleAdd} activeOpacity={0.85}>
              <Text style={styles.saveBtnText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Contacts list */}
        {contacts.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyTitle}>Henüz kişi eklenmedi</Text>
            <Text style={styles.emptySub}>SOS butonuna basıldığında bu kişilere mesaj gönderilir</Text>
          </View>
        ) : (
          <FlatList
            data={contacts}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarEmoji}>{item.emoji}</Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.contactName}>{item.name}</Text>
                  <Text style={styles.contactPhone}>{item.phone}</Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleRemove(item.id, item.name)}
                >
                  <Text style={styles.deleteIcon}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg1 },
  flex: { flex: 1 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: { fontSize: 26, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.redFaint,
    borderWidth: 1,
    borderColor: `${Colors.red}50`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: { color: Colors.red, fontSize: 22, fontWeight: '300', lineHeight: 26 },

  form: {
    marginHorizontal: 20,
    backgroundColor: Colors.bg2,
    borderRadius: Radius.lg,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  emojiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  emojiBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bg3,
  },
  emojiBtnActive: { backgroundColor: Colors.redFaint, borderWidth: 1, borderColor: Colors.red },
  emojiText: { fontSize: 18 },

  input: {
    backgroundColor: Colors.bg3,
    borderRadius: Radius.md,
    padding: 13,
    color: Colors.textPrimary,
    fontSize: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  saveBtn: {
    backgroundColor: Colors.red,
    borderRadius: Radius.md,
    padding: 14,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  list: { paddingHorizontal: 20, paddingBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg2,
    borderRadius: Radius.lg,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.bg3,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarEmoji: { fontSize: 22 },
  info: { flex: 1 },
  contactName: { color: Colors.textPrimary, fontSize: 15, fontWeight: '600' },
  contactPhone: { color: Colors.textMuted, fontSize: 13, marginTop: 2 },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${Colors.red}18`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: { color: Colors.red, fontSize: 12, fontWeight: '700' },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 60, marginBottom: 16 },
  emptyTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptySub: { color: Colors.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 20 },
});
