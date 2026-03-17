import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme';
import type { SOSPhase } from '../services/sosService';

interface Props {
  phase: SOSPhase;
  message: string;
}

const PHASE_CONFIG: Record<SOSPhase, { color: string; bg: string; dot: string }> = {
  idle:      { color: Colors.green,  bg: `${Colors.green}15`,  dot: Colors.green },
  countdown: { color: Colors.orange, bg: `${Colors.orange}15`, dot: Colors.orange },
  locating:  { color: Colors.blue,   bg: `${Colors.blue}15`,   dot: Colors.blue },
  sending:   { color: Colors.red,    bg: `${Colors.red}15`,     dot: Colors.red },
  done:      { color: Colors.green,  bg: `${Colors.green}15`,  dot: Colors.green },
  cancelled: { color: Colors.orange, bg: `${Colors.orange}15`, dot: Colors.orange },
  error:     { color: Colors.orange, bg: `${Colors.orange}15`, dot: Colors.orange },
};

export default function StatusBar({ phase, message }: Props) {
  const cfg = PHASE_CONFIG[phase];

  return (
    <View style={[styles.container, { backgroundColor: cfg.bg }]}>
      <View style={[styles.dot, { backgroundColor: cfg.dot }]} />
      <Text style={[styles.text, { color: cfg.color }]} numberOfLines={1}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
    gap: 8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
});
