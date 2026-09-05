import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Reveal from './Reveal';
import SlideShell from './SlideShell';
import { colors } from '../../constants/colors';
import { fonts } from '../../constants/typography';
import { useT } from '../../context/SettingsContext';

const ROWS = [
  '😰  Bugün ne hissediyorsun?',
  '🤖  Yüzünü okuyup reçeteni yazıyor',
  '🌀  Renk · Ses · Nefes · 4dk',
  '🎙️  Nefes ritmini dinliyor',
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
        <View style={styles.art}>
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

          {/* Ölçek yönü burada bir kez, görsel olarak öğretiliyor.
              Uygulamanın her ölçüm ekranında "1 = hiç yok, 10 =
              dayanılmaz" yazıyor ama ters çalışan bir ölçek yazıyla
              anlaşılmıyordu: düşen sayının "iyi" olduğunu görmek
              gerekiyor. */}
          <Reveal active={active} delay={ROWS.length * 600} offsetY={14}>
            <View style={styles.scale}>
              <Text style={styles.scaleTitle}>{t('PUAN NASIL OKUNUR')}</Text>
              <View style={styles.scaleBarWrap}>
                <Text style={styles.scaleEnd}>1</Text>
                <View style={styles.scaleBar}>
                  <View style={[styles.scaleFill, styles.scaleGood]} />
                  <View style={[styles.scaleFill, styles.scaleBad]} />
                </View>
                <Text style={styles.scaleEnd}>10</Text>
              </View>
              <View style={styles.scaleLegend}>
                <Text style={styles.scaleGoodText}>{t('1 = hiç yok')}</Text>
                <Text style={styles.scaleBadText}>{t('10 = dayanılmaz')}</Text>
              </View>
              <Text style={styles.scaleNote}>
                {t('Ölçek ters: düşen sayı iyiye gidiyor demek.')}
              </Text>
            </View>
          </Reveal>
        </View>
      }
      title={t('Günde 4 dakika.')}
      body={t(
        'Bir fotoğraf çekiyorsun; yüz ifaden okunuyor, reçeten ona göre yazılıyor ve o okuma günün başlangıç puanı oluyor.\n\n4 dakika uyguluyorsun. Nefes adımında mikrofon ritmini dinliyor.\n\nRitüel bitince bir fotoğraf daha: öncesi ve sonrası aynı yöntemle ölçülmüş oluyor.\n\nHepsi bu — ve hepsi telefonunun içinde kalıyor.'
      )}
    />
  );
}

const styles = StyleSheet.create({
  art: { alignSelf: 'stretch' },
  scale: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  scaleTitle: {
    fontFamily: fonts.sansMedium,
    fontSize: 9,
    letterSpacing: 2,
    color: colors.haze,
    textAlign: 'center',
  },
  scaleBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  scaleBar: { flex: 1, flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden' },
  scaleFill: { flex: 1, height: '100%' },
  scaleGood: { backgroundColor: colors.glow },
  scaleBad: { backgroundColor: colors.warn },
  scaleEnd: { fontFamily: fonts.mono, fontSize: 11, color: colors.white },
  scaleLegend: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  scaleGoodText: { fontFamily: fonts.sans, fontSize: 10, color: colors.glow },
  scaleBadText: { fontFamily: fonts.sans, fontSize: 10, color: colors.warn },
  scaleNote: {
    fontFamily: fonts.sans,
    fontSize: 10,
    lineHeight: 15,
    color: colors.haze,
    textAlign: 'center',
    marginTop: 8,
  },
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
