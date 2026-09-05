import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../constants/colors';
import { withAlpha } from '../utils/color';
import { fonts } from '../constants/typography';
import { translateFormulaName, type TranslateFn } from '../i18n';
import type { Formula } from '../types';

/** Belgenin ölçüsü — yakalayan taraf da aynı ölçüyü kullanıyor. */
export const RECEIPT_CARD_WIDTH = 340;
export const RECEIPT_CARD_HEIGHT = 500;

export interface ReceiptCardProps {
  formula: Formula;
  score: number;
  streak: number;
  date: string;
  name: string;
  t: TranslateFn;
  /** Ritüel öncesi/sonrası puanlar — varsa belgeye bir "etki" satırı ekler. */
  scoreBefore?: number;
  scoreAfter?: number;
}

/** Belgedeki "etiket · değer" satırı. */
function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

/**
 * Paylaşılan başarı belgesi.
 *
 * Ekranda gösterilmiyor: ekranın dışında çiziliyor ve `react-native-view-shot`
 * ile PNG'ye alınıyor. Bu yüzden ölçüler sabit — esnek bir düzen, ekran
 * genişliğine göre her cihazda başka oranda bir görsel üretirdi.
 *
 * Metin, makbuzun kendisiyle aynı sözü veriyor: hiçbir iyileşme iddiası
 * yok, yalnızca ne yapıldığının kaydı ve "etkin madde: yok" satırı.
 */
export default function ReceiptCard({
  formula,
  score,
  streak,
  date,
  name,
  t,
  scoreBefore,
  scoreAfter,
}: ReceiptCardProps) {
  /**
   * Belge, günün formülünün rengini giyiyor.
   *
   * Önceki sürümde degrade sabit mordu; her gün başka bir renk üreten bir
   * uygulamada bütün belgeler birbirinin aynısı çıkıyordu. Renk artık
   * formülden geliyor, yani paylaşılan iki belge asla aynı görünmüyor.
   */
  const tint = formula.color.hex;
  const effect =
    scoreBefore != null && scoreAfter != null && scoreBefore > 0
      ? Math.round(((scoreBefore - scoreAfter) / scoreBefore) * 100)
      : null;

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={[withAlpha(tint, 0.32), withAlpha(tint, 0.06), 'rgba(14,14,18,0)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.72 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Alt köşeden gelen ikinci bir ışık: belgenin düz bir dikdörtgen
          yerine derinliği olan bir nesne gibi durmasını sağlıyor. */}
      <LinearGradient
        colors={['rgba(14,14,18,0)', withAlpha(tint, 0.16)]}
        start={{ x: 0.1, y: 0.6 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.frame, { borderColor: withAlpha(tint, 0.4) }]}>
        <View style={[styles.halo, { backgroundColor: withAlpha(tint, 0.22) }]} />
        <Text style={styles.mark}>⚗️</Text>
        <Text style={styles.brand}>Plasebo</Text>
        <Text style={styles.sub}>{t('ZİHİN PROTOKOLÜ')}</Text>

        <View style={styles.divider} />

        <Text style={styles.kicker}>{t('PROTOKOL BELGESİ')}</Text>
        <Text style={styles.name} numberOfLines={1}>
          {name || t('Misafir')}
        </Text>
        <Text style={styles.date}>{date}</Text>

        <View style={styles.divider} />

        <Row
          label={t('Formül')}
          value={translateFormulaName(formula.name, t)}
        />
        {formula.sham ? (
          <Row label={t('İçerik')} value={t('— (sahte ritüel, kör test)')} />
        ) : (
          <>
            <Row label={t('Renk')} value={t(formula.color.name)} />
            <Row label={t('Ses')} value={t(formula.sound.label)} />
            <Row label={t('Nefes')} value={t(formula.breath.label)} />
          </>
        )}
        <Row
          label={t('Doz')}
          value={formula.dose && formula.dose > 1 ? `${formula.dose}x` : t('tek')}
        />

        {/* Ölçüm satırları yalnızca gerçekten ölçüldüyse basılıyor —
            boş bir "—" satırı belgenin iddiasını zayıflatıyor. */}
        {scoreBefore != null && scoreAfter != null ? (
          <Row
            label={t('Ölçülen puan')}
            value={`${scoreBefore} → ${scoreAfter}`}
          />
        ) : null}

        <View style={styles.divider} />

        <View style={styles.scoreRow}>
          <View style={styles.scoreBlock}>
            <Text style={styles.scoreValue}>{score}</Text>
            <Text style={styles.scoreLabel}>{t('/10 hissettim')}</Text>
          </View>
          <View style={styles.scoreBlock}>
            <Text style={[styles.streakValue, { color: tint }]}>{streak}</Text>
            <Text style={styles.scoreLabel}>{t('gün seri')}</Text>
          </View>
          {effect != null ? (
            <View style={styles.scoreBlock}>
              <Text style={styles.scoreValue}>{`%${Math.max(0, effect)}`}</Text>
              <Text style={styles.scoreLabel}>{t('etki')}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.stamp}>
          <Text style={styles.stampText}>{t('ETKİN MADDE: YOK')}</Text>
        </View>

        <Text style={styles.footer}>
          {t('Bugün hiçbir şey yapmadım. İşe yaradı.')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: RECEIPT_CARD_WIDTH,
    height: RECEIPT_CARD_HEIGHT,
    backgroundColor: colors.ink,
    overflow: 'hidden',
  },
  frame: {
    flex: 1,
    margin: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    borderRadius: 18,
    paddingHorizontal: 22,
    paddingVertical: 20,
    alignItems: 'center',
  },
  mark: { fontSize: 30 },
  /** Amblemin arkasındaki renk halesi — belgenin "canlı" duran kısmı. */
  halo: {
    position: 'absolute',
    top: 2,
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  brand: {
    fontFamily: fonts.serif,
    fontSize: 30,
    color: colors.white,
    marginTop: 4,
  },
  sub: {
    fontFamily: fonts.sansMedium,
    fontSize: 8,
    letterSpacing: 3,
    color: colors.haze,
    marginTop: 3,
  },
  divider: {
    height: 1,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginVertical: 12,
  },
  kicker: {
    fontFamily: fonts.sansMedium,
    fontSize: 8,
    letterSpacing: 2.5,
    color: colors.pulse,
  },
  name: {
    fontFamily: fonts.serif,
    fontSize: 22,
    color: colors.white,
    marginTop: 2,
  },
  date: {
    fontFamily: fonts.sans,
    fontSize: 10,
    color: colors.haze,
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  rowLabel: {
    fontFamily: fonts.sans,
    fontSize: 10,
    color: colors.haze,
  },
  rowValue: {
    flex: 1,
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    color: colors.white,
    textAlign: 'right',
    marginLeft: 10,
  },
  scoreRow: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'space-around',
  },
  scoreBlock: { alignItems: 'center' },
  scoreValue: {
    fontFamily: fonts.serif,
    fontSize: 34,
    color: colors.glow,
    includeFontPadding: false,
  },
  streakValue: {
    fontFamily: fonts.serif,
    fontSize: 34,
    color: colors.pulse,
    includeFontPadding: false,
  },
  scoreLabel: {
    fontFamily: fonts.sans,
    fontSize: 9,
    color: colors.haze,
    marginTop: 2,
  },
  stamp: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.glow,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    // Mühür hafif eğik: elle basılmış hissi versin.
    transform: [{ rotate: '-4deg' }],
  },
  stampText: {
    fontFamily: fonts.sansBold,
    fontSize: 9,
    letterSpacing: 1.5,
    color: colors.glow,
  },
  footer: {
    fontFamily: fonts.serifItalic,
    fontSize: 11,
    color: colors.mist,
    textAlign: 'center',
    marginTop: 'auto',
  },
});
