import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { Colors, Shadow } from '../theme';
import type { SOSPhase } from '../services/sosService';

interface Props {
  phase: SOSPhase;
  countdown: number;
  onPress: () => void;
  onCancel: () => void;
}

export default function SOSButton({ phase, countdown, onPress, onCancel }: Props) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(1)).current;

  // Idle pulse
  useEffect(() => {
    if (phase === 'idle') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [phase]);

  // Countdown ring ripple
  useEffect(() => {
    if (phase === 'countdown') {
      const ripple = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(ringScale, { toValue: 1.4, duration: 800, useNativeDriver: true }),
            Animated.timing(ringOpacity, { toValue: 0.6, duration: 200, useNativeDriver: true }),
          ]),
          Animated.timing(ringOpacity, { toValue: 0, duration: 600, useNativeDriver: true }),
        ])
      );
      ripple.start();
      return () => { ripple.stop(); ringOpacity.setValue(0); ringScale.setValue(1); };
    }
  }, [phase]);

  const isCountdown = phase === 'countdown';
  const isLoading   = phase === 'locating' || phase === 'sending';
  const isDone      = phase === 'done';
  const isError     = phase === 'error';
  const isCancelled = phase === 'cancelled';

  const btnColor = isDone ? Colors.green
    : isError || isCancelled ? Colors.orange
    : Colors.red;

  const label = isDone ? '✓' : isError ? '!' : isCancelled ? '✕' : isLoading ? '···' : 'SOS';
  const sub = isDone ? 'Gönderildi' : isLoading ? 'Lütfen bekleyin' : isCountdown ? `${countdown}` : 'Acil Yardım';

  return (
    <View style={styles.wrapper}>
      {/* Ripple halkaları */}
      {(phase === 'idle' || isCountdown) && (
        <>
          <Animated.View style={[
            styles.ring,
            { borderColor: btnColor, opacity: ringOpacity, transform: [{ scale: ringScale }] }
          ]} />
          <Animated.View style={[
            styles.ring,
            styles.ring2,
            { borderColor: btnColor, opacity: 0.15 }
          ]} />
        </>
      )}

      {/* Ana buton */}
      <Animated.View style={{ transform: [{ scale: isLoading ? 1 : pulseAnim }] }}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: btnColor }, isCountdown && styles.btnCountdown]}
          onPress={onPress}
          disabled={isLoading || isDone}
          activeOpacity={0.88}
        >
          {/* İç parlaklık */}
          <View style={[styles.btnInner, { borderColor: `${btnColor}60` }]}>
            <Text style={[styles.label, isCountdown && styles.labelCountdown]}>
              {isCountdown ? countdown.toString() : label}
            </Text>
            <Text style={styles.sub}>{isCountdown ? 'İptal için dokun' : sub}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* KADES: İptal butonu — geri sayım sırasında görünür */}
      {isCountdown && (
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} activeOpacity={0.8}>
          <Text style={styles.cancelText}>✕  İPTAL ET</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const SIZE = 190;
const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: SIZE + 120,
  },
  ring: {
    position: 'absolute',
    width: SIZE + 40,
    height: SIZE + 40,
    borderRadius: (SIZE + 40) / 2,
    borderWidth: 1.5,
  },
  ring2: {
    width: SIZE + 70,
    height: SIZE + 70,
    borderRadius: (SIZE + 70) / 2,
    opacity: 0.12,
  },
  btn: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.sosButton,
  },
  btnCountdown: {
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  btnInner: {
    width: SIZE - 20,
    height: SIZE - 20,
    borderRadius: (SIZE - 20) / 2,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    color: '#fff',
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: 3,
  },
  labelCountdown: {
    fontSize: 58,
    letterSpacing: 0,
  },
  sub: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  cancelBtn: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: Colors.red,
    backgroundColor: Colors.redFaint,
  },
  cancelText: {
    color: Colors.red,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
  },
});
