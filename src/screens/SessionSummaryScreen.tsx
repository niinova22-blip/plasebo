import React, { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../components/Screen';
import PressableScale from '../components/PressableScale';
import TransparencyPill from '../components/TransparencyPill';
import { colors } from '../constants/colors';
import { fonts } from '../constants/typography';
import { resolveComplaint } from '../constants/complaints';
import { useT, useTheme } from '../context/SettingsContext';
import { useMotion } from '../hooks/useMotion';
import { translateFormulaName } from '../i18n';
import { shareReceiptImage } from '../utils/receipt';
import {
  REACTION_MEANINGFUL_PERCENT,
  reactionChangePercent,
} from '../utils/reaction';
import ReceiptCard, {
  RECEIPT_CARD_HEIGHT,
  RECEIPT_CARD_WIDTH,
} from '../components/ReceiptCard';
import { useUser } from '../context/UserContext';
import { usePremium } from '../context/PremiumContext';
import { showSessionEndAd } from '../utils/ads';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'SessionSummary'>;

/**
 * Seans özeti — akışın son ekranı.
 *
 * Önce/sonra ölçümü tek bakışta karşılaştırılıyor. Başlık üç durumdan
 * birini alıyor; kötüleşme de "yanlış" değil, bir sonuç olarak sunuluyor.
 * "Ana sayfaya dön" yığını sıfırlıyor, yani buradan geri gidilemiyor.
 */
export default function SessionSummaryScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const t = useT();
  const motion = useMotion();
  const { user } = useUser();
  const { limits } = usePremium();
  const {
    complaintId,
    customText,
    formula,
    scoreBefore,
    scoreAfter,
    durationSeconds,
    faceMoodScore,
    faceMoodAfter,
    scoreAfterFromCamera,
    breathRegularity,
    breathsPerMinute,
    reactionBeforeMs,
    reactionAfterMs,
  } = route.params;
  const complaint = resolveComplaint(complaintId, customText);

  const diff = scoreBefore - scoreAfter;
  const percent = scoreBefore > 0 ? Math.round((diff / scoreBefore) * 100) : 0;
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;

  /**
   * Ek ölçümler.
   *
   * Burada bir zamanlar iki satırlık bir tablo vardı: "kendi puanın" ve
   * "kameranın ölçtüğü". O tablo artık çizilemez, çünkü iki satır da aynı
   * sayıyı gösterirdi — önce/sonra puanlarının ikisi de kameradan
   * geliyor. Yukarıdaki büyük "önce → sonra" zaten o bilgiyi veriyor.
   *
   * Geriye gerçekten ayrı şeyler ölçen iki kayıt kalıyor: nefes
   * düzenliliği (yüzde) ve tepki süresi (milisaniye). İkisi de puan
   * ölçeğinde olmadığı için kendi satırlarında ve kendi birimlerinde
   * duruyor.
   */
  const breathPercent = breathRegularity != null ? Math.round(breathRegularity * 100) : null;
  const hasReactionRow = reactionBeforeMs != null || reactionAfterMs != null;
  /** Refleks farkı ancak iki ölçüm de varsa ve fark anlamlıysa yorumlanıyor. */
  const reactionChange =
    reactionBeforeMs != null && reactionAfterMs != null
      ? reactionChangePercent(reactionBeforeMs, reactionAfterMs)
      : null;
  const showLedger = breathPercent != null || hasReactionRow;

  const title =
    diff > 0 ? 'Etki Gözlemlendi ⚗️' : diff === 0 ? 'Veri Toplandı 📊' : 'Yarın Tekrar 🔄';

  const enter = useSharedValue(motion.reduced ? 1 : 0);
  useEffect(() => {
    if (motion.reduced) return;
    enter.value = withTiming(1, { duration: 480, easing: Easing.out(Easing.cubic) });
  }, [enter, motion.reduced]);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateY: (1 - enter.value) * 16 }],
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, enter.value * 1.3),
    transform: [{ translateY: (1 - enter.value) * 26 }],
  }));

  // Etki çubuğu: iyileşme yüzdesi kadar dolar.
  const bar = useSharedValue(0);
  useEffect(() => {
    const target = Math.max(0, Math.min(100, percent)) / 100;
    bar.value = motion.reduced
      ? target
      : withDelay(320, withTiming(target, { duration: 900, easing: Easing.out(Easing.cubic) }));
  }, [bar, percent, motion.reduced]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${bar.value * 100}%`,
  }));

  /** Ekran dışında duran belge — paylaşımda görüntüsü alınıyor. */
  const cardRef = useRef<View>(null);

  /**
   * Akışın çıkışı. Geçiş reklamı varsa önce o gösteriliyor, kapanınca ana
   * ekrana dönülüyor; reklam yoksa dönüş anında oluyor.
   *
   * Reklam gösterilecek tek yer burası: kullanıcı seansı bitirdi, iki iş
   * arasındaki doğal boşlukta. Sıra da bu yüzden böyle — önce ana ekrana
   * dönüp reklamı üstüne açmak, kullanıcıyı vardığı yerden geri iterdi.
   *
   * `showSessionEndAd` geri çağrıyı her yolda tam bir kez çalıştırıyor
   * (reklam yok, reklam kapandı, gösterim hata verdi); aksi hâlde ya bu
   * ekranda kilitlenirdik ya yığını iki kez sıfırlardık.
   */
  const goHome = () => {
    showSessionEndAd(limits.adFree, () =>
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] })
    );
  };

  const share = () => {
    void shareReceiptImage(
      cardRef,
      [
        t('Bugün "{sikayet}" için plasebo ritüeli yaptım.', {
          sikayet: t(complaint?.label ?? ''),
        }),
        diff > 0
          ? t('Etki: %{yuzde} azalma 🧪', { yuzde: percent })
          : t('Etki: değişim yok — o da veri 🧪'),
        t('— Plasebo · bilerek inan'),
      ].join('\n')
    );
  };

  return (
    <Screen background={theme.bg}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={titleStyle}>
          <Text style={[styles.title, { color: theme.text }]}>{t(title)}</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border },
            cardStyle,
          ]}
        >
          <Text style={[styles.cardLabel, { color: theme.sub }]}>
            {t('📋 SEANS ÖZETİ')}
          </Text>

          <Field label={t('Şikayet')} value={t(complaint?.label ?? '—')} />
          <Divider />
          <Field
            label={t('Reçete')}
            value={`${t(complaint?.prescriptionName ?? '—')} #${formula.id % 100}`}
          />
          <Field label={t('Formül')} value={translateFormulaName(formula.name, t)} />
          <Field
            label={t('Süre')}
            value={t('{dk} dakika {sn} saniye', { dk: minutes, sn: seconds })}
          />
          <Divider />

          <View style={styles.scores}>
            <View style={styles.scoreBox}>
              <Text style={[styles.scoreValue, { color: theme.sub }]}>{scoreBefore}</Text>
              <Text style={[styles.scoreLabel, { color: theme.faint }]}>{t('Önce')}</Text>
            </View>
            <Text style={[styles.arrow, { color: theme.faint }]}>→</Text>
            <View style={styles.scoreBox}>
              <Text style={[styles.scoreValue, { color: theme.pulse }]}>{scoreAfter}</Text>
              <Text style={[styles.scoreLabel, { color: theme.faint }]}>{t('Sonra')}</Text>
            </View>
          </View>

          {/* Sayıların kaynağı ekranda yazmalı; ikisi de aynı yöntemle
              ölçüldüğü için karşılaştırmanın anlamı buradan geliyor. */}
          <Text style={[styles.scoreSource, { color: theme.faint }]}>
            {t('İkisi de fotoğraf analiziyle ölçüldü')}
          </Text>

          <View style={[styles.barTrack, { backgroundColor: theme.border }]}>
            <Animated.View style={[styles.barFill, barStyle]} />
          </View>
          <Text style={[styles.barLabel, { color: theme.sub }]}>
            {diff > 0
              ? t('%{yuzde} etki gözlemlendi', { yuzde: percent })
              : diff === 0
                ? t('Değişim yok — bu da veri')
                : t('Bugün zordu. Yarın yeniden dene.')}
          </Text>

          {showLedger ? (
            <>
              <Divider />
              <Text style={[styles.compareLabel, { color: theme.faint }]}>
                {t('EK ÖLÇÜMLER')}
              </Text>
              <Text style={[styles.compareIntro, { color: theme.sub }]}>
                {t('Puan ölçeğine girmeyen, kendi birimleriyle duran kayıtlar.')}
              </Text>

              <View style={styles.ledgerHead}>
                <Text style={[styles.ledgerName, { color: theme.faint }]} />
                <Text style={[styles.ledgerHeadCell, { color: theme.faint }]}>
                  {t('Önce')}
                </Text>
                <Text style={[styles.ledgerHeadCell, { color: theme.faint }]}>
                  {t('Sonra')}
                </Text>
              </View>

              {/* Refleks ayrı bir ölçek (milisaniye) — tabloya karışmasın
                  diye kendi satırında ve kendi biriminde duruyor. */}
              {hasReactionRow ? (
                <>
                  <View style={styles.ledgerRow}>
                    <Text style={[styles.ledgerName, { color: theme.sub }]}>
                      {t('Tepki süren (ms)')}
                    </Text>
                    <Text
                      style={[
                        styles.ledgerCellSmall,
                        { color: reactionBeforeMs == null ? theme.faint : theme.text },
                      ]}
                    >
                      {reactionBeforeMs ?? '—'}
                    </Text>
                    <Text
                      style={[
                        styles.ledgerCellSmall,
                        { color: reactionAfterMs == null ? theme.faint : theme.pulse },
                      ]}
                    >
                      {reactionAfterMs ?? '—'}
                    </Text>
                  </View>
                  {reactionChange != null ? (
                    <Text style={[styles.compareNote, { color: theme.faint }]}>
                      {Math.abs(reactionChange) < REACTION_MEANINGFUL_PERCENT
                        ? t(
                            '⚡ Tepki süren neredeyse aynı kaldı. Bu ölçüm gün içinde kendiliğinden oynar; %{esik} altındaki farkı değişim saymıyoruz.',
                            { esik: REACTION_MEANINGFUL_PERCENT }
                          )
                        : reactionChange > 0
                          ? t('⚡ Tepki süren %{yuzde} hızlandı.', { yuzde: reactionChange })
                          : t('⚡ Tepki süren %{yuzde} yavaşladı.', {
                              yuzde: Math.abs(reactionChange),
                            })}
                    </Text>
                  ) : null}
                </>
              ) : null}

              {breathPercent != null ? (
                <Text style={[styles.compareNote, { color: theme.faint }]}>
                  {breathsPerMinute != null
                    ? t(
                        '🎙️ Nefesin ritüel sırasında %{yuzde} düzenliydi, dakikada {adet} nefes — bu ayrı bir ölçek, puanlarla toplanmaz.',
                        { yuzde: breathPercent, adet: breathsPerMinute.toFixed(1) }
                      )
                    : t(
                        '🎙️ Nefesin ritüel sırasında %{yuzde} düzenliydi — bu ayrı bir ölçek, puanlarla toplanmaz.',
                        { yuzde: breathPercent }
                      )}
                </Text>
              ) : null}

            </>
          ) : null}

          <Divider />
          <Text style={[styles.note, { color: theme.sub }]}>
            {t(
              '“Beklenti etkisi aktive edildi. Plasebo olduğunu bilmen etkiyi azaltmadı.”'
            )}
          </Text>
        </Animated.View>

        <TransparencyPill
          light
          style={styles.pill}
          text={t('⚗️ İki ölçüm arasındaki fark bir kanıt değil, bir kayıt. Zamanla anlam kazanır.')}
        />

        <PressableScale
          onPress={goHome}
          accessibilityRole="button"
          style={styles.primary}
        >
          <Text style={styles.primaryText}>{t('Ana Sayfaya Dön')}</Text>
        </PressableScale>

        <PressableScale
          onPress={share}
          accessibilityRole="button"
          style={[styles.ghost, { borderColor: theme.border }]}
        >
          <Text style={[styles.ghostText, { color: theme.sub }]}>{t('Paylaş')}</Text>
        </PressableScale>
        {/* Paylaşılacak belge: görünmez ama çizili olmak zorunda. */}
        <View style={styles.offscreen} pointerEvents="none">
          <View ref={cardRef} collapsable={false}>
            <ReceiptCard
              formula={formula}
              score={Math.max(1, Math.min(10, 11 - scoreAfter))}
              streak={user.streak}
              date={formula.generatedAt}
              name={user.name}
              t={t}
              scoreBefore={scoreBefore}
              scoreAfter={scoreAfter}
            />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: theme.faint }]}>{label}</Text>
      <Text style={[styles.fieldValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

function Divider() {
  const theme = useTheme();
  return <View style={[styles.divider, { backgroundColor: theme.border }]} />;
}

/**
 * Ölçüm defterinin bir satırı: ölçümün adı, öncesi ve sonrası.
 * O ana ait bir değer yoksa hücre "—" kalıyor — boş bırakmak yerine
 * ölçülmediğini açıkça söylüyor.
 */
function LedgerRow({
  name,
  before,
  after,
  tint,
}: {
  name: string;
  before: number | null;
  after: number | null;
  tint: string;
}) {
  const theme = useTheme();
  return (
    <View style={styles.ledgerRow}>
      <Text style={[styles.ledgerName, { color: theme.sub }]}>{name}</Text>
      <Text
        style={[styles.ledgerCell, { color: before == null ? theme.faint : theme.text }]}
      >
        {before ?? '—'}
      </Text>
      <Text style={[styles.ledgerCell, { color: after == null ? theme.faint : tint }]}>
        {after ?? '—'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Ölçü açıkça veriliyor: yakalama, görünümün ölçülmüş sınırlarını
  // kullanıyor ve boyutsuz bir sarmalayıcıda belgenin altı kesilebiliyor.
  offscreen: {
    position: 'absolute',
    left: -2000,
    top: 0,
    width: RECEIPT_CARD_WIDTH,
    height: RECEIPT_CARD_HEIGHT,
  },
  content: { padding: 20, paddingBottom: 40 },
  title: {
    fontFamily: fonts.serif,
    fontSize: 30,
    textAlign: 'center',
    marginTop: 20,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    marginTop: 20,
  },
  cardLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 14,
  },
  field: { marginBottom: 10 },
  fieldLabel: { fontFamily: fonts.sans, fontSize: 10, letterSpacing: 1 },
  fieldValue: { fontFamily: fonts.sans, fontSize: 14, marginTop: 2 },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 12 },
  scores: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
  },
  scoreBox: { alignItems: 'center', minWidth: 74 },
  scoreValue: { fontFamily: fonts.mono, fontSize: 38, includeFontPadding: false },
  scoreLabel: { fontFamily: fonts.sans, fontSize: 11, marginTop: 2 },
  arrow: { fontFamily: fonts.sans, fontSize: 20, marginHorizontal: 10 },
  compareLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  compareIntro: {
    fontFamily: fonts.sans,
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 8,
  },
  ledgerHead: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 2,
  },
  ledgerHeadCell: {
    width: 58,
    textAlign: 'center',
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    letterSpacing: 1,
  },
  ledgerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
  },
  ledgerName: { flex: 1, fontFamily: fonts.sans, fontSize: 12 },
  ledgerCell: {
    width: 58,
    textAlign: 'center',
    fontFamily: fonts.mono,
    fontSize: 20,
    includeFontPadding: false,
  },
  ledgerCellSmall: {
    width: 58,
    textAlign: 'center',
    fontFamily: fonts.mono,
    fontSize: 15,
    includeFontPadding: false,
  },
  ledgerScale: {
    fontFamily: fonts.sans,
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
    marginTop: 6,
  },
  scoreSource: {
    fontFamily: fonts.sans,
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
    marginTop: 6,
  },
  compareNote: {
    fontFamily: fonts.sans,
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
    marginTop: 8,
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 14,
  },
  barFill: { height: '100%', backgroundColor: colors.glow, borderRadius: 4 },
  barLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  note: {
    fontFamily: fonts.serifItalic,
    fontSize: 12,
    lineHeight: 19,
  },
  pill: { marginTop: 20 },
  primary: {
    backgroundColor: colors.pulse,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  primaryText: { fontFamily: fonts.sansBold, fontSize: 15, color: colors.white },
  ghost: {
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  ghostText: { fontFamily: fonts.sansMedium, fontSize: 13 },
});
