import React, { useEffect, useState } from 'react';
import {
  View, Text, Switch, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ScrollView, Alert,
} from 'react-native';
import { AppSettings, getSettings, saveSettings, DEFAULT_SETTINGS } from '../services/settingsService';
import { Colors, Radius, Shadow } from '../theme';

export default function SettingsScreen() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() { setSettings(await getSettings()); }

  async function handleSave() {
    await saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function update<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Ayarlar</Text>
        </View>

        {/* SOS Mesajı */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SOS MESAJI</Text>
          <TextInput
            style={styles.textArea}
            value={settings.customMessage}
            onChangeText={(v) => update('customMessage', v)}
            multiline
            numberOfLines={3}
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        {/* Geri sayım */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>YANLIŞ BASMA GERİ SAYIMI</Text>
          <View style={styles.countdownRow}>
            {[3, 5, 10].map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.chip, settings.countdownSeconds === s && styles.chipActive]}
                onPress={() => update('countdownSeconds', s)}
              >
                <Text style={[styles.chipText, settings.countdownSeconds === s && styles.chipTextActive]}>
                  {s} sn
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Toggle'lar */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SEÇENEKLER</Text>
          <View style={styles.card}>
            {[
              { key: 'sendLocationLink', label: 'Konum linki gönder', icon: '📍' },
              { key: 'vibrationEnabled', label: 'Titreşim', icon: '📳' },
              { key: 'shareWithPolice',  label: '155 bilgilendirmesi ekle', icon: '🚔' },
            ].map((item, i, arr) => (
              <View key={item.key} style={[styles.row, i < arr.length - 1 && styles.rowBorder]}>
                <Text style={styles.rowIcon}>{item.icon}</Text>
                <Text style={styles.rowLabel}>{item.label}</Text>
                <Switch
                  value={settings[item.key as keyof AppSettings] as boolean}
                  onValueChange={(v) => update(item.key as keyof AppSettings, v as any)}
                  trackColor={{ false: Colors.bg4, true: Colors.red }}
                  thumbColor="#fff"
                />
              </View>
            ))}
          </View>
        </View>

        {/* Kaydet */}
        <TouchableOpacity
          style={[styles.saveBtn, saved && styles.saveBtnDone]}
          onPress={handleSave}
        >
          <Text style={styles.saveBtnText}>{saved ? '✓ Kaydedildi' : 'Kaydet'}</Text>
        </TouchableOpacity>

        <Text style={styles.version}>GüvendeKal v2.0 · Tüm veriler cihazda şifreli saklanır</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg1 },
  content: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 24 },
  title: { fontSize: 26, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.5 },
  section: { marginBottom: 22 },
  sectionLabel: { fontSize: 10, fontWeight: '700', color: Colors.textMuted, letterSpacing: 1.5, marginBottom: 10 },
  textArea: {
    backgroundColor: Colors.bg2, borderRadius: Radius.md, padding: 14,
    color: Colors.textPrimary, fontSize: 14, borderWidth: 1, borderColor: Colors.border,
    minHeight: 80, textAlignVertical: 'top',
  },
  countdownRow: { flexDirection: 'row', gap: 10 },
  chip: {
    paddingHorizontal: 22, paddingVertical: 10, borderRadius: Radius.full,
    backgroundColor: Colors.bg2, borderWidth: 1, borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.redFaint, borderColor: Colors.red },
  chipText: { color: Colors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: Colors.red },
  card: { backgroundColor: Colors.bg2, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, ...Shadow.card },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderSoft },
  rowIcon: { fontSize: 18, marginRight: 12 },
  rowLabel: { flex: 1, color: Colors.textPrimary, fontSize: 14 },
  saveBtn: {
    backgroundColor: Colors.red, borderRadius: Radius.lg, padding: 16,
    alignItems: 'center', marginTop: 4, ...Shadow.card,
  },
  saveBtnDone: { backgroundColor: Colors.green },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  version: { color: Colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: 20 },
});
