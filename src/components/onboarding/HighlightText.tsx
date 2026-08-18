import React from 'react';
import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';
import { colors } from '../../constants/colors';
import { fonts } from '../../constants/typography';

/**
 * Vurgu türleri ve anlamları.
 *
 * Renk burada süs değil, anlam taşıyor: kırmızı hep şikâyetin kendisi,
 * yeşil hep sonucu, mor bilimsel terim. Aynı renk aynı işi yaptığı için
 * kullanıcı üç slayt sonra kelimeyi okumadan da ne olduğunu anlıyor.
 */
export type HighlightType = 'positive' | 'negative' | 'science' | 'key';

export const HIGHLIGHT_COLORS: Record<HighlightType, string> = {
  positive: colors.glow, // iyi sonuç, iyileşme
  negative: colors.warn, // ağrı, sorun, şikâyet
  science: colors.pulse, // bilimsel terim
  key: '#52D9A4', // kilit kavram
};

export interface HighlightTextProps {
  type: HighlightType;
  children: React.ReactNode;
  /** Kalın yazım — bilimsel terimlerde kullanılıyor. */
  bold?: boolean;
  /** Serif italik — alıntı ve sonuç cümlelerinde. */
  italic?: boolean;
  /** Üstü çizili — "hiçbir etken madde yok" gibi. */
  strike?: boolean;
  style?: StyleProp<TextStyle>;
}

/**
 * Metin içinde renkli vurgu.
 *
 * İç içe `Text` olarak çalışır; dolayısıyla akan bir paragrafın
 * ortasında satır kırmayı bozmadan kullanılabilir.
 */
export default function HighlightText({
  type,
  children,
  bold = false,
  italic = false,
  strike = false,
  style,
}: HighlightTextProps) {
  return (
    <Text
      style={[
        { color: HIGHLIGHT_COLORS[type] },
        bold && styles.bold,
        italic && styles.italic,
        strike && styles.strike,
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  bold: { fontFamily: fonts.sansBold },
  italic: { fontFamily: fonts.serifItalic },
  strike: { textDecorationLine: 'line-through' },
});
