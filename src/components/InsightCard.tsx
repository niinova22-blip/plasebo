import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { fonts } from '../constants/typography';
import { useTheme } from '../context/SettingsContext';

export interface InsightCardProps {
  text: string;
  /**
   * Kartın ne anlattığını söyleyen başlık.
   *
   * Başlıksız hâlde kart yalnızca bir cümleydi ve neyi ölçtüğü — hele
   * henüz veri yokken — anlaşılmıyordu. Başlık, kartın amacını veri
   * gelmeden önce de görünür kılıyor.
   */
  title?: string;
}

export default function InsightCard({ text, title }: InsightCardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.accentSoft, borderLeftColor: theme.pulse },
      ]}
    >
      {title ? (
        <Text style={[styles.title, { color: theme.sub }]}>{title}</Text>
      ) : null}
      <Text style={[styles.text, { color: theme.text }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderLeftWidth: 3,
    borderRadius: 14,
    padding: 16,
  },
  title: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  text: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 20,
  },
});
