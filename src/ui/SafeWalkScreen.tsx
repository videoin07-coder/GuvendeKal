import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import * as SMS from 'expo-sms';
import { getContacts } from '../services/contactsService';
import { getLocation } from '../services/sosService';
import { Colors, Radius, Shadow } from '../theme';

type WalkPhase = 'setup' | 'active' | 'warning' | 'triggered' | 'completed';

const PRESETS = [5, 10, 15, 20, 30, 45, 60];

export default function SafeWalkScreen() {
  const [phase, setPhase] = useState<WalkPhase>('setup');
  const [durationMins, setDurationMins] = useState(15);
  const [destination, setDestination] = useState('');
  const [remainingSecs, setRemainingSecs] = useState(0);
  const [isCheckIn, setIsCheckIn] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  function formatTime(secs: number): string {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function getProgressPercent(): number {
    const total = durationMins * 60;
    return Math.max(0, Math.min(1, remainingSecs / total));
  }

  async function startWalk() {
    const contacts = await getContacts();
    if (contacts.length === 0) {
      Alert.alert('Kişi Yok', 'Önce SOS kişisi eklemelisiniz.');
      return;
    }

    cancelledRef.current = false;
    const totalSecs = durationMins * 60;
    setRemainingSecs(totalSecs);
    setPhase('active');

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Başlangıç mesajı gönder
    const loc = await getLocation();
    const locText = loc
      ? `https://maps.google.com/?q=${loc.latitude},${loc.longitude}`
      : 'Konum alınamadı';
    const destText = destination.trim() ? ` Hedefim: ${destination}.` : '';
    const msg = `🚶 Güvenli yürüyüş modu başladı.${destText} ${durationMins} dakikada varmazsam otomatik SOS alacaksın. Şu anki konum: ${locText}`;

    const phones = contacts.map((c) => c.phone);
    const avail = await SMS.isAvailableAsync();
    if (avail) {
      await SMS.sendSMSAsync(phones, msg);
    }

    let remaining = totalSecs;
    timerRef.current = setInterval(async () => {
      if (cancelledRef.current) return;

      remaining -= 1;
      setRemainingSecs(remaining);

      // Son 60 saniyede uyarı fazına geç
      if (remaining === 60 && !cancelledRef.current) {
        setPhase('warning');
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }

      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        if (!cancelledRef.current) {
          await triggerAutoSOS(contacts);
        }
      }
    }, 1000);
  }

  async function triggerAutoSOS(contacts: any[]) {
    setPhase('triggered');
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

    const loc = await getLocation();
    const locText = loc
      ? `https://maps.google.com/?q=${loc.latitude},${loc.longitude}`
      : 'Konum alınamadı';
    const msg = `🆘 OTOMATİK SOS! Güvenli yürüyüş süresi doldu, varış bildirimi gelmedi. Son konum: ${locText}`;
    const phones = contacts.map((c: any) => c.phone);
    const avail = await SMS.isAvailableAsync();
    if (avail) {
      await SMS.sendSMSAsync(phones, msg);
    }
  }

  async function checkIn() {
    if (timerRef.current) clearInterval(timerRef.current);
    cancelledRef.current = true;
    setIsCheckIn(true);
    setPhase('completed');

    const contacts = await getContacts();
    const loc = await getLocation();
    const locText = loc
      ? `https://maps.google.com/?q=${loc.latitude},${loc.longitude}`
      : '';
    const msg = `✅ Güvenle ulaştım! Güvenli yürüyüş modu tamamlandı.${locText ? ` Konum: ${locText}` : ''}`;
    const phones = contacts.map((c) => c.phone);
    const avail = await SMS.isAvailableAsync();
    if (avail) {
      await SMS.sendSMSAsync(phones, msg);
    }

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => {
      setPhase('setup');
      setIsCheckIn(false);
      setDestination('');
    }, 4000);
  }

  function cancelWalk() {
    if (timerRef.current) clearInterval(timerRef.current);
    cancelledRef.current = true;
    setPhase('setup');
  }

  const progress = getProgressPercent();
  const isLow = remainingSecs <= 60;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Güvenli Yürüyüş</Text>
          <Text style={styles.subtitle}>Timer sonunda otomatik SOS gönderilir</Text>
        </View>

        {phase === 'setup' && (
          <>
            {/* Hedef */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>HEDEF (isteğe bağlı)</Text>
              <TextInput
                style={styles.input}
                placeholder="örn: Eve gidiyorum"
                placeholderTextColor={Colors.textMuted}
                value={destination}
                onChangeText={setDestination}
              />
            </View>

            {/* Süre seçimi */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>SÜRE (DAKİKA)</Text>
              <View style={styles.presets}>
                {PRESETS.map((min) => (
                  <TouchableOpacity
                    key={min}
                    style={[styles.preset, durationMins === min && styles.presetActive]}
                    onPress={() => setDurationMins(min)}
                  >
                    <Text style={[styles.presetText, durationMins === min && styles.presetTextActive]}>
                      {min}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Başlat */}
            <TouchableOpacity style={styles.startBtn} onPress={startWalk} activeOpacity={0.85}>
              <Text style={styles.startIcon}>🚶</Text>
              <Text style={styles.startText}>Yürüyüşü Başlat — {durationMins} dk</Text>
            </TouchableOpacity>

            <Text style={styles.note}>
              Başladığında kişilerinize bilgilendirme mesajı gönderilir.{'\n'}
              Süre dolmadan «Vardım» butonuna basın.
            </Text>
          </>
        )}

        {(phase === 'active' || phase === 'warning') && (
          <>
            {/* Timer dairesi */}
            <View style={styles.timerSection}>
              <View style={[styles.timerRing, isLow && styles.timerRingWarning]}>
                <Text style={[styles.timerText, isLow && styles.timerTextWarning]}>
                  {formatTime(remainingSecs)}
                </Text>
                <Text style={styles.timerSub}>
                  {isLow ? '⚠️ Son 1 dakika!' : 'Kalan süre'}
                </Text>
              </View>
            </View>

            {/* Progress bar */}
            <View style={styles.progressBg}>
              <View style={[
                styles.progressFill,
                { width: `${progress * 100}%` as any },
                isLow && styles.progressFillWarning
              ]} />
            </View>

            {destination ? (
              <Text style={styles.destText}>📍 Hedef: {destination}</Text>
            ) : null}

            {/* Vardım butonu */}
            <TouchableOpacity style={styles.arrivedBtn} onPress={checkIn} activeOpacity={0.85}>
              <Text style={styles.arrivedText}>✅  Güvenle Vardım</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelWalkBtn} onPress={cancelWalk}>
              <Text style={styles.cancelWalkText}>Yürüyüşü İptal Et</Text>
            </TouchableOpacity>
          </>
        )}

        {phase === 'triggered' && (
          <View style={styles.triggeredBox}>
            <Text style={styles.triggeredIcon}>🆘</Text>
            <Text style={styles.triggeredTitle}>Otomatik SOS Gönderildi</Text>
            <Text style={styles.triggeredSub}>Kişilerinize acil mesaj iletildi</Text>
            <TouchableOpacity style={styles.startBtn} onPress={() => setPhase('setup')}>
              <Text style={styles.startText}>Yeni Yürüyüş</Text>
            </TouchableOpacity>
          </View>
        )}

        {phase === 'completed' && (
          <View style={styles.completedBox}>
            <Text style={styles.completedIcon}>✅</Text>
            <Text style={styles.completedTitle}>Güvenle Vardınız!</Text>
            <Text style={styles.completedSub}>Kişilerinize bilgi gönderildi</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.bg1 },
  content: { padding: 20, paddingBottom: 40 },
  header:  { marginBottom: 28 },
  title:   { fontSize: 26, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.5 },
  subtitle:{ fontSize: 13, color: Colors.textSecondary, marginTop: 4 },

  section: { marginBottom: 22 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  input: {
    backgroundColor: Colors.bg2,
    borderRadius: Radius.md,
    padding: 14,
    color: Colors.textPrimary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  preset: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: Radius.full,
    backgroundColor: Colors.bg2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  presetActive: { backgroundColor: Colors.redFaint, borderColor: Colors.red },
  presetText: { color: Colors.textSecondary, fontWeight: '600', fontSize: 14 },
  presetTextActive: { color: Colors.red },

  startBtn: {
    backgroundColor: Colors.red,
    borderRadius: Radius.lg,
    padding: 18,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    ...Shadow.card,
  },
  startIcon: { fontSize: 20 },
  startText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  note: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },

  // Timer
  timerSection: { alignItems: 'center', marginVertical: 24 },
  timerRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: Colors.green,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: `${Colors.green}10`,
  },
  timerRingWarning: { borderColor: Colors.orange, backgroundColor: `${Colors.orange}10` },
  timerText: { fontSize: 48, fontWeight: '900', color: Colors.green, letterSpacing: -1 },
  timerTextWarning: { color: Colors.orange },
  timerSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },

  progressBg: {
    height: 4,
    backgroundColor: Colors.bg3,
    borderRadius: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: Colors.green, borderRadius: 2 },
  progressFillWarning: { backgroundColor: Colors.orange },

  destText: { color: Colors.textSecondary, fontSize: 13, marginBottom: 20, textAlign: 'center' },

  arrivedBtn: {
    backgroundColor: Colors.green,
    borderRadius: Radius.lg,
    padding: 18,
    alignItems: 'center',
    marginBottom: 12,
    ...Shadow.card,
  },
  arrivedText: { color: '#fff', fontSize: 17, fontWeight: '700' },

  cancelWalkBtn: { alignItems: 'center', padding: 12 },
  cancelWalkText: { color: Colors.textMuted, fontSize: 14 },

  // Triggered
  triggeredBox: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  triggeredIcon: { fontSize: 60 },
  triggeredTitle: { fontSize: 22, fontWeight: '800', color: Colors.red },
  triggeredSub: { fontSize: 14, color: Colors.textSecondary },

  // Completed
  completedBox: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  completedIcon: { fontSize: 70 },
  completedTitle: { fontSize: 24, fontWeight: '800', color: Colors.green },
  completedSub: { fontSize: 14, color: Colors.textSecondary },
});
