import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Reveal from './Reveal';
import SlideShell from './SlideShell';
import { colors } from '../../constants/colors';
import { fonts } from '../../constants/typography';
import { useT } from '../../context/SettingsContext';

const ROWS = [
  '😰  Bugün ne hissediyorsun?',
  '⚗️  Reçeten hazırlanıyor...',
  '🌀  Renk · Ses · Nefes · 4dk',
  '📊  Önce: 8/10 → Sonra: 3/10',
];

/**
 * Telefon maketi: akışın dört adımı, ekranın içinde birer birer beliriyor.
 * Maket bilerek çok sade — köşesi yuvarlatılmış bir çerçeve ve üstte
 * hoparlör çizgisi; amaç cihazı taklit etmek değil, "bu uygulamanın içinde
 * olacak" demek.
 */
export default function SlideFour({ width, active }: { width: number; active: boolean }) {
  const t = useT();

  return (
    <SlideShell
      active={active}
      width={width}
      art={
        <View style={styles.phone}>
          <View style={styles.notch} />
          {ROWS.map((row, i) => (
            <View key={row}>
              {i > 0 ? (
                <Reveal active={active} delay={i * 600 - 250} offsetY={-6}>
                  <Text style={styles.arrow}>↓</Text>
                </Reveal>
              ) : null}
              <Reveal active={active} delay={i * 600} offsetY={14}>
                <View style={styles.row}>
                  <Text style={styles.rowText}>{t(row)}</Text>
                </View>
              </Reveal>
            </View>
          ))}
        </View>
      }
      title={t('Günde 4 dakika.')}
      body={t(
        'Önce bugün ne hissettiğini söylüyorsun.\n\nSonra sana özel bir protokol hazırlanıyor.\n\n4 dakika uyguluyorsun.\n\nÖncesi ve sonrasını ölçüyoruz.\n\nHepsi bu.'
      )}
    />
  );
}

const styles = StyleSheet.create({
  phone: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: colors.haze,
    borderRadius: 26,
    paddingHorizontal: 14,
    paddingTop: 18,
    paddingBottom: 16,
    opacity: 0.95,
  },
  notch: {
    alignSelf: 'center',
    width: 54,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.haze,
    opacity: 0.4,
    marginBottom: 14,
  },
  row: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  rowText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.white,
  },
  arrow: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: colors.pulse,
    textAlign: 'center',
  },
});
