import { useState, useRef, useCallback, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { getContacts } from '../services/contactsService';
import { getSettings } from '../services/settingsService';
import { getLocation, dispatchSOS, LocationResult } from '../services/sosService';
import { addRecord } from '../services/historyService';
import type { SOSPhase } from '../services/sosService';

export interface SOSHookState {
  phase: SOSPhase;
  message: string;
  countdown: number;
  triggerSOS: () => void;
  cancelSOS: () => void;
  resetSOS: () => void;
}

export function useSOS(): SOSHookState {
  const [phase, setPhase] = useState<SOSPhase>('idle');
  const [message, setMessage] = useState('Hazır');
  const [countdown, setCountdown] = useState(5);

  const cancelledRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function clearTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  // KADES: İptal butonu
  const cancelSOS = useCallback(() => {
    cancelledRef.current = true;
    clearTimer();
    setPhase('cancelled');
    setMessage('İptal edildi');
    setTimeout(() => {
      setPhase('idle');
      setMessage('Hazır');
    }, 2000);
  }, []);

  const resetSOS = useCallback(() => {
    cancelledRef.current = true;
    clearTimer();
    setPhase('idle');
    setMessage('Hazır');
  }, []);

  // KADES: Geri sayım sonrası SOS gönder
  async function runSOS() {
    if (cancelledRef.current) return;

    try {
      setPhase('locating');
      setMessage('Konum alınıyor...');
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      const contacts = await getContacts();
      if (cancelledRef.current) return;

      if (contacts.length === 0) {
        setPhase('error');
        setMessage('SOS kişisi eklenmemiş!');
        setTimeout(() => { setPhase('idle'); setMessage('Hazır'); }, 3000);
        return;
      }

      const location: LocationResult | null = await getLocation();
      if (cancelledRef.current) return;

      setPhase('sending');
      setMessage(`${contacts.length} kişiye gönderiliyor...`);

      const result = await dispatchSOS(location, contacts);
      if (cancelledRef.current) return;

      if (result.success) {
        setPhase('done');
        setMessage(`✓ SOS gönderildi — ${contacts.length} kişi`);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // 15 sn sonra idle
        setTimeout(() => {
          if (!cancelledRef.current) {
            setPhase('idle');
            setMessage('Hazır');
          }
        }, 15000);
      } else {
        setPhase('error');
        setMessage(result.error || 'Gönderme başarısız');
        setTimeout(() => { setPhase('idle'); setMessage('Hazır'); }, 4000);
      }
    } catch (err) {
      if (!cancelledRef.current) {
        setPhase('error');
        setMessage('Bir hata oluştu');
        setTimeout(() => { setPhase('idle'); setMessage('Hazır'); }, 4000);
      }
    }
  }

  const triggerSOS = useCallback(async () => {
    if (phase !== 'idle') return;

    cancelledRef.current = false;
    const settings = await getSettings();
    const totalSecs = settings.countdownSeconds;

    setCountdown(totalSecs);
    setPhase('countdown');
    setMessage(`İptal etmek için ${totalSecs} saniyeniz var...`);

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    let remaining = totalSecs;
    timerRef.current = setInterval(async () => {
      remaining -= 1;
      setCountdown(remaining);
      setMessage(remaining > 0 ? `İptal etmek için ${remaining} saniyeniz var...` : 'Gönderiliyor...');

      if (remaining <= 0) {
        clearTimer();
        if (!cancelledRef.current) {
          await runSOS();
        }
      }
    }, 1000);
  }, [phase]);

  useEffect(() => {
    return () => clearTimer();
  }, []);

  return { phase, message, countdown, triggerSOS, cancelSOS, resetSOS };
}
