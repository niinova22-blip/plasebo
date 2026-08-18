import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Reveal from './Reveal';
import { colors } from '../../constants/colors';
import { fonts } from '../../constants/typography';

export interface SlideShellProps {
  active: boolean;
  width: number;
  /** Üstteki illüstrasyon — ölçekle birlikte girer. */
  art: React.ReactNode;
  title: string;
  /**
   * Düz gövde metni. Vurgulu (parçalara bölünmüş) metin gerektiğinde
   * boş bırakılıp `children` kullanılır.
   */
  body?: string;
  /** Alt dipnot (yalnızca ilk slaytta var). */
  footnote?: string;
  /** Metinlerin altına eklenen serbest alan (son slayttaki isim girişi). */
  children?: React.ReactNode;
  /** Başlık boyutu — ilk slayt biraz daha büyük. */
  titleSize?: number;
  /** Metinler ortalansın mı? */
  centered?: boolean;
}

/**
 * Slaytların ortak iskeleti ve giriş koreografisi.
 *
 * Altı slaytın hepsi aynı ritmi izliyor: illüstrasyon ölçekle birlikte
 * hemen, başlık 100 ms sonra, alt metin 250 ms sonra. Bu zamanlamayı
 * altı dosyaya kopyalamak yerine tek yerde tutmak, sonradan ritmi
 * değiştirmek gerektiğinde tek dosyaya dokunmayı yetiyor.
 */
export default function SlideShell({
  active,
  width,
  art,
  title,
  body,
  footnote,
  children,
  titleSize = 28,
  centered = false,
}: SlideShellProps) {
  return (
    <View style={[styles.page, { width }]}>
      <Reveal active={active} scaleFrom={0.7} spring style={styles.art}>
        {art}
      </Reveal>

      <View style={styles.text}>
        <Reveal active={active} delay={100} offsetY={30}>
          <Text
            style={[styles.title, { fontSize: titleSize }, centered && styles.center]}
          >
            {title}
          </Text>
        </Reveal>

        {body ? (
          <Reveal active={active} delay={250} offsetY={20}>
            <Text style={[styles.body, centered && styles.center]}>{body}</Text>
          </Reveal>
        ) : null}

        {footnote ? (
          <Reveal active={active} delay={400} offsetY={16}>
            <Text style={[styles.footnote, centered && styles.center]}>{footnote}</Text>
          </Reveal>
        ) : null}

        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    // `flex: 1` YOK — sayfa dikey kaydırıcının içinde, yüksekliğini
    // içeriğinden alıyor. Bkz. OnboardingScreen'deki `Page`.
    paddingHorizontal: 28,
  },
  art: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
  },
  text: {},
  title: {
    fontFamily: fonts.serif,
    color: colors.white,
    lineHeight: 40,
  },
  body: {
    fontFamily: fonts.sans,
    fontSize: 15,
    lineHeight: 26,
    color: colors.haze,
    marginTop: 14,
  },
  footnote: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    letterSpacing: 0.5,
    color: colors.glow,
    marginTop: 24,
  },
  center: { textAlign: 'center' },
});
