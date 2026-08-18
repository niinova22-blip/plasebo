import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '../../constants/colors';
import { fonts } from '../../constants/typography';

export interface QuoteBoxProps {
  children: React.ReactNode;
  /** Alıntının altındaki kaynak satırı. */
  source?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Alıntı kutusu — birine söylenen sözü metnin geri kalanından ayırır.
 *
 * Sol kenardaki kalın çizgi ve mor zemin, kutuyu "anlatıcının sesi"
 * olmaktan çıkarıp "o gün gerçekten söylenen cümle" hâline getiriyor.
 * Ayrı bir bileşen: aynı biçim başka slaytlarda da gerekecek.
 */
export default function QuoteBox({ children, source, style }: QuoteBoxProps) {
  return (
    <View style={[styles.box, style]}>
      <Text style={styles.mark}>“</Text>
      <View style={styles.body}>{children}</View>
      {source ? <Text style={styles.source}>{source}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: 'rgba(123,110,246,0.1)',
    borderLeftWidth: 3,
    borderLeftColor: colors.pulse,
    borderRadius: 12,
    padding: 20,
    paddingTop: 26,
  },
  mark: {
    position: 'absolute',
    top: -8,
    left: 12,
    fontFamily: fonts.serif,
    fontSize: 48,
    color: colors.pulse,
    opacity: 0.4,
  },
  body: {},
  source: {
    fontFamily: fonts.serifItalic,
    fontSize: 10,
    color: colors.haze,
    opacity: 0.5,
    marginTop: 12,
  },
});
