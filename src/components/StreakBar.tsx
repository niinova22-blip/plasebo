import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { fonts } from '../constants/typography';
import { useT, useTheme } from '../context/SettingsContext';
import { useMotion } from '../hooks/useMotion';

/**
 * Seri şeridi.
 *
 * Solda bir 🔥 emojisi vardı. İki sebeple kaldırıldı: emoji kendi çok
 * renkli paletini getirip şeridin en gürültülü ögesi oluyordu, ve yerine
 * konacak çizgi ikon da işe yaramadı — alev silueti 22 pikselde damladan
 * ayrılmıyor, üstelik formül kartındaki renk adımı zaten damla ikonu
 * kullanıyor, yani iki ayrı şey aynı lekeye dönüşüyordu.
 *
 * Yerine gelen nokta bir süs değil, durum: bugün tamamlandıysa vurgu
 * renginde dolu, tamamlanmadıysa sönük. Yani kaldırılan ögenin yerini
 * dolduran şey, sağdaki cümlenin söylediğini bir bakışta gösteriyor.
 */

export interface StreakBarProps {
  streak: number;
  /** Bugünün ritüeli tamamlandı mı? */
  doneToday: boolean;
}

export default function StreakBar({ streak, doneToday }: StreakBarProps) {
  const motion = useMotion();
  const theme = useTheme();
  const t = useT();
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (motion.reduced) return;
    // Ekran açılınca nokta bir kez atar.
    pulse.value = withDelay(
      260,
      withSequence(
        withTiming(1.6, { duration: 220, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 320, easing: Easing.out(Easing.back(2.5)) })
      )
    );
  }, [motion.reduced, pulse]);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <View style={[styles.container, { backgroundColor: theme.accentSoft }]}>
      <Animated.View
        style={[
          styles.dot,
          { backgroundColor: doneToday ? theme.pulse : theme.border },
          dotStyle,
        ]}
      />
      <Text style={[styles.streak, { color: theme.pulse }]}>
        {t('{gun} gün serisi', { gun: streak })}
      </Text>
      <Text style={[styles.hint, { color: theme.sub }]}>
        {t(doneToday ? 'Bugün tamamlandı' : 'Bugün formülün hazır')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 10,
  },
  streak: {
    fontFamily: fonts.sansBold,
    fontSize: 13,
  },
  hint: {
    marginLeft: 'auto',
    fontFamily: fonts.sans,
    fontSize: 11,
  },
});
