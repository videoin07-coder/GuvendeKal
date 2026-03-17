import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Linking,
} from 'react-native';
import { getHistory, clearHistory, formatRelativeTime, SOSRecord } from '../services/historyService';
import { Colors, Radius, Shadow } from '../theme';

const RESULT_CONFIG = {
  sent:      { color: Colors.red,    icon: '🆘', label: 'SOS Gönderildi' },
  cancelled: { color: Colors.orange, icon: '✕',  label: 'İptal Edildi' },
  error:     { color: Colors.orange, icon: '⚠️', label: 'Hata' },
};

export default function HistoryScreen() {
  const [records, setRecords] = useState<SOSRecord[]>([]);

  useEffect(() => { load(); }, []);

  async function load() {
    setRecords(await getHistory());
  }

  function handleClear() {
    Alert.alert(
      'Geçmişi Sil',
      'Tüm SOS geçmişi silinecek. Emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            await clearHistory();
            setRecords([]);
          },
        },
      ]
    );
  }

  function openMap(lat: number, lng: number) {
    Linking.openURL(`https://maps.google.com/?q=${lat},${lng}`);
  }

  function formatDate(ts: number): string {
    const d = new Date(ts);
    return d.toLocaleDateString('tr-TR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Geçmiş</Text>
          <Text style={styles.subtitle}>{records.length} ihbar kaydı</Text>
        </View>
        {records.length > 0 && (
          <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
            <Text style={styles.clearText}>Temizle</Text>
          </TouchableOpacity>
        )}
      </View>

      {records.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>Henüz kayıt yok</Text>
          <Text style={styles.emptySub}>SOS gönderimleriniz burada görünecek</Text>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const cfg = RESULT_CONFIG[item.result];
            return (
              <View style={styles.card}>
                <View style={[styles.iconBox, { backgroundColor: `${cfg.color}18` }]}>
                  <Text style={styles.iconText}>{cfg.icon}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={[styles.cardLabel, { color: cfg.color }]}>{cfg.label}</Text>
                  <Text style={styles.cardDate}>{formatDate(item.timestamp)}</Text>
                  <Text style={styles.cardMeta}>
                    {item.contactCount} kişi  ·  {formatRelativeTime(item.timestamp)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.mapBtn}
                  onPress={() => openMap(item.latitude, item.longitude)}
                >
                  <Text style={styles.mapText}>📍</Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg1 },
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
  clearBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: `${Colors.red}50`,
    backgroundColor: Colors.redFaint,
  },
  clearText: { color: Colors.red, fontSize: 13, fontWeight: '600' },

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
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: { fontSize: 20 },
  cardInfo: { flex: 1 },
  cardLabel: { fontSize: 14, fontWeight: '700' },
  cardDate: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  cardMeta: { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
  mapBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.bg3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapText: { fontSize: 16 },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 60, marginBottom: 16 },
  emptyTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptySub: { color: Colors.textMuted, fontSize: 13, textAlign: 'center' },
});
