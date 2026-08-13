import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { fonts } from '../constants/typography';
import { useT, useTheme } from '../context/SettingsContext';
import type { Badge } from '../utils/storage';

export interface BadgeGridProps {
  badges: Badge[];
}

/** Kilometre taşları. Hiçbiri bir sağlık kazanımı değil — sadece devamlılık. */
export default function BadgeGrid({ badges }: BadgeGridProps) {
  const theme = useTheme();
  const t = useT();

  return (
    <View style={styles.wrap}>
      {badges.map((badge) => (
        <View
          key={badge.id}
          style={[
            styles.badge,
            {
              backgroundColor: badge.earned ? theme.accentSoft : theme.surface,
              borderColor: badge.earned ? theme.pulse : theme.border,
            },
          ]}
        >
          <Text
            style={[
              styles.label,
              { color: badge.earned ? theme.pulse : theme.sub },
            ]}
          >
            {t(badge.label)}
          </Text>
          <Text style={[styles.hint, { color: theme.faint }]} numberOfLines={2}>
            {t(badge.hint)}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: {
    width: '48%',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  label: { fontFamily: fonts.sansBold, fontSize: 13 },
  hint: { fontFamily: fonts.sans, fontSize: 10, lineHeight: 15, marginTop: 3 },
});
