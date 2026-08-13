import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  children: React.ReactNode;
  background: string;
  style?: ViewStyle;
  /** Üst güvenli alanı uygula (varsayılan: evet). */
  topInset?: boolean;
  /**
   * Alt güvenli alanı uygula (varsayılan: evet).
   *
   * Android artık uçtan uca çiziyor; üç tuşlu gezinme çubuğu olan
   * telefonlarda ekranın alt kenarına yapışan butonlar çubuğun altında
   * kalıyordu. Alt boşluk cihazdan okunuyor: çubuk yoksa 0, jest
   * çubuğunda birkaç piksel, üç tuşlu çubukta çubuğun tam yüksekliği.
   */
  bottomInset?: boolean;
}

/**
 * Ekran geçiş sarmalayıcısı: mount'ta fade + 20px yukarı translateY.
 */
export default function Screen({
  children,
  background,
  style,
  topInset = true,
  bottomInset = true,
}: Props) {
  const insets = useSafeAreaInsets();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, { duration: 320, easing: Easing.out(Easing.cubic) });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: 20 * (1 - progress.value) }],
  }));

  return (
    <View style={[styles.root, { backgroundColor: background }]}>
      <Animated.View
        style={[
          styles.inner,
          {
            paddingTop: topInset ? insets.top : 0,
            paddingBottom: bottomInset ? insets.bottom : 0,
          },
          animatedStyle,
          style,
        ]}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  inner: { flex: 1 },
});
