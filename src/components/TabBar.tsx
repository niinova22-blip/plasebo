import React, { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Icon, { type IconName } from './Icon';
import { fonts } from '../constants/typography';
import { useT, useTheme } from '../context/SettingsContext';
import { useMotion } from '../hooks/useMotion';

/**
 * Sekme ikonları. Emoji değil çizgi ikon: emoji kendi çok renkli
 * paletini getiriyor, tema rengini alamıyor ve her platformda başka
 * çiziliyordu. Ayrıntı için `components/Icon.tsx`.
 */
const ICONS: Record<string, IconName> = {
  Home: 'flask',
  Stats: 'chart',
  Archive: 'archive',
  Settings: 'sliders',
};

const LABELS: Record<string, string> = {
  Home: 'Formül',
  Stats: 'İstatistik',
  Archive: 'Arşiv',
  Settings: 'Ayarlar',
};

interface TabItemProps {
  focused: boolean;
  name: string;
  onPress: () => void;
  onLongPress: () => void;
}

function TabItem({ focused, name, onPress, onLongPress }: TabItemProps) {
  const motion = useMotion();
  const theme = useTheme();
  const t = useT();
  const iconScale = useSharedValue(1);
  const dotWidth = useSharedValue(focused ? 4 : 0);
  const dim = useSharedValue(1);

  useEffect(() => {
    if (motion.reduced) {
      dotWidth.value = focused ? 4 : 0;
      iconScale.value = 1;
      dim.value = 1;
      return;
    }

    if (focused) {
      // Aktif ikon bir kez büyüyüp yerine oturur.
      iconScale.value = withSequence(
        withTiming(1.2, { duration: 120, easing: Easing.out(Easing.quad) }),
        withSpring(1, { damping: 10, stiffness: 220 })
      );
      // Nokta 4 → 16 → 4 genişleyip toparlanır.
      dotWidth.value = withSequence(
        withTiming(16, { duration: 200, easing: Easing.out(Easing.quad) }),
        withTiming(4, { duration: 220, easing: Easing.inOut(Easing.quad) })
      );
    } else {
      dotWidth.value = withTiming(0, { duration: 160 });
      // Pasif sekmeler kısa bir sönümlenme yapar.
      dim.value = withSequence(
        withTiming(0.5, { duration: 100 }),
        withTiming(1, { duration: 200 })
      );
    }
  }, [focused, motion.reduced, iconScale, dotWidth, dim]);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: (focused ? 1 : 0.55) * dim.value,
    transform: [{ scale: iconScale.value }],
  }));

  const dotStyle = useAnimatedStyle(() => ({
    width: dotWidth.value,
    opacity: dotWidth.value > 0 ? 1 : 0,
  }));

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={t(LABELS[name] ?? name)}
      style={styles.item}
    >
      <Animated.View style={[styles.itemContent, contentStyle]}>
        <Icon
          name={ICONS[name] ?? 'flask'}
          size={22}
          color={focused ? theme.text : theme.sub}
          // Aktif sekme yalnızca renkle değil çizgi ağırlığıyla da
          // ayrılıyor; opaklık farkı tek başına küçük ekranda zayıf
          // kalıyordu.
          strokeWidth={focused ? 1.8 : 1.4}
        />
        <Text
          style={[
            styles.label,
            { color: theme.sub },
            focused && { fontFamily: fonts.sansMedium, color: theme.text },
          ]}
        >
          {t(LABELS[name] ?? name)}
        </Text>
      </Animated.View>
      <Animated.View style={[styles.dot, { backgroundColor: theme.pulse }, dotStyle]} />
    </Pressable>
  );
}

export default function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <View
      style={[styles.wrap, { backgroundColor: theme.tabBar, borderTopColor: theme.border }]}
    >
      <BlurView
        intensity={Platform.OS === 'android' ? 30 : 40}
        tint={theme.blurTint}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.row, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          return (
            <TabItem
              key={route.key}
              name={route.name}
              focused={focused}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    paddingTop: 10,
  },
  item: { flex: 1, alignItems: 'center' },
  itemContent: { alignItems: 'center' },
  label: {
    fontFamily: fonts.sans,
    fontSize: 10,
    marginTop: 3,
  },
  dot: {
    height: 5,
    borderRadius: 3,
    marginTop: 5,
  },
});
