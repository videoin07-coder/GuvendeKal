import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSOS } from '../hooks/useSOS';
import SOSButton from '../components/SOSButton';
import StatusBadge from '../components/StatusBar';
import EmergencyPanel from '../components/EmergencyPanel';
import { Colors } from '../theme';

export default function HomeScreen() {
  const { phase, message, countdown, triggerSOS, cancelSOS } = useSOS();

  const isActive = phase !== 'idle';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!isActive}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appName}>GüvendeKal</Text>
            <Text style={styles.appSub}>Kişisel Güvenlik</Text>
          </View>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>PRO</Text>
          </View>
        </View>

        {/* Status badge */}
        <StatusBadge phase={phase} message={message} />

        {/* SOS Button */}
        <View style={styles.buttonSection}>
          <SOSButton
            phase={phase}
            countdown={countdown}
            onPress={phase === 'idle' ? triggerSOS : phase === 'countdown' ? cancelSOS : () => {}}
            onCancel={cancelSOS}
          />
        </View>

        {/* KADES notu */}
        {phase === 'idle' && (
          <Text style={styles.hint}>
            SOS butonuna basıldığında {'\u2022'} {`5 saniyelik iptal süresi`} {'\u2022'} kayıtlı kişilere konum gönderilir
          </Text>
        )}

        {/* Acil hatlar */}
        {phase === 'idle' && <EmergencyPanel />}

        {/* Info cards */}
        {phase === 'idle' && (
          <View style={styles.infoRow}>
            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>📍</Text>
              <Text style={styles.infoLabel}>GPS Konum</Text>
              <Text style={styles.infoDesc}>Yüksek hassasiyet</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>💬</Text>
              <Text style={styles.infoLabel}>Anlık SMS</Text>
              <Text style={styles.infoDesc}>Tüm kişilere</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>⏱️</Text>
              <Text style={styles.infoLabel}>5 Sn İptal</Text>
              <Text style={styles.infoDesc}>Yanlış basma koruması</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg1,
  },
  scroll: { flex: 1 },
  content: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  appName: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  appSub: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 1,
  },
  versionBadge: {
    backgroundColor: Colors.redFaint,
    borderWidth: 1,
    borderColor: `${Colors.red}40`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  versionText: {
    color: Colors.red,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  buttonSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  hint: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 28,
    paddingHorizontal: 24,
    lineHeight: 18,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  infoCard: {
    flex: 1,
    backgroundColor: Colors.bg2,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  infoLabel: {
    color: Colors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  infoDesc: {
    color: Colors.textMuted,
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
});
