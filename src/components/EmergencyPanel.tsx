import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Radius, Shadow } from '../theme';
import { call112, call155, call156, call110 } from '../services/sosService';

interface EmergencyLine {
  number: string;
  label: string;
  icon: string;
  color: string;
  action: () => void;
}

const LINES: EmergencyLine[] = [
  { number: '112', label: 'Acil',      icon: '🚑', color: '#ff3b55', action: call112 },
  { number: '155', label: 'Polis',     icon: '🚔', color: '#3b82f6', action: call155 },
  { number: '156', label: 'Jandarma',  icon: '⚔️', color: '#8b5cf6', action: call156 },
  { number: '110', label: 'İtfaiye',   icon: '🚒', color: '#f97316', action: call110 },
];

export default function EmergencyPanel() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Acil Hatlar</Text>
      <View style={styles.grid}>
        {LINES.map((line) => (
          <TouchableOpacity
            key={line.number}
            style={styles.card}
            onPress={line.action}
            activeOpacity={0.75}
          >
            <View style={[styles.iconBg, { backgroundColor: `${line.color}18` }]}>
              <Text style={styles.icon}>{line.icon}</Text>
            </View>
            <Text style={styles.number}>{line.number}</Text>
            <Text style={styles.label}>{line.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    gap: 10,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.bg2,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  iconBg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  icon: {
    fontSize: 18,
  },
  number: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
  },
});
