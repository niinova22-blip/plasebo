import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../components/Screen';
import PressableScale from '../components/PressableScale';
import TransparencyPill from '../components/TransparencyPill';
import { fonts } from '../constants/typography';
import { useT, useTheme } from '../context/SettingsContext';
import { usePremium } from '../context/PremiumContext';
import { CONTENT_PACKS, PLAN_TIERS } from '../constants/plans';
import { packCounts, packExamples } from '../constants/packs';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Plans'>;

/**
 * Plan ekranı — şu an bir **tanıtım** ekranı.
 *
 * Premium ve içerik paketleri henüz satılmıyor: Play faturalandırması
 * bağlanmadan satın alma düğmesi göstermek, basıldığında hiçbir şey
 * yapamayacağı için kullanıcıyı yanıltır. Bu yüzden ekran ne olduğunu
 * anlatıyor ve "yakında" diyor; kilitli özellikler ücretsiz kademede
 * kilitli kalmaya devam ediyor.
 *
 * Faturalandırma bağlandığında (bkz. `store/RELEASE.md`) buradaki
 * "yakında" rozetleri satın alma düğmeleriyle değişecek; `PremiumContext`
 * içindeki `buyPlan` / `buyPack` / `restore` o gün için hazır duruyor.
 */
export default function PlansScreen({ navigation }: Props) {
  const theme = useTheme();
  const t = useT();
  const { plan } = usePremium();

  return (
    <Screen background={theme.bg}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <PressableScale
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          style={styles.back}
        >
          <Text style={[styles.backText, { color: theme.sub }]}>{t('‹ Geri')}</Text>
        </PressableScale>

        <Text style={[styles.title, { color: theme.text }]}>{t('Plan')}</Text>
        <Text style={[styles.sub, { color: theme.sub }]}>
          {t(
            'Premium daha fazla içerik açar. Etkiyi değiştirmez — çünkü değiştirecek bir etki yok.'
          )}
        </Text>

        <View
          style={[
            styles.notice,
            { backgroundColor: theme.accentSoft, borderColor: theme.pulse },
          ]}
        >
          <Text style={[styles.noticeTitle, { color: theme.pulse }]}>
            {t('Premium henüz açık değil')}
          </Text>
          <Text style={[styles.noticeText, { color: theme.sub }]}>
            {t(
              'Aşağıdakiler ilerideki bir güncellemede açılacak. Şimdilik satın alınacak bir şey yok; ücretsiz kademe bugün tam çalışıyor — dört hedefin günlük formülü ve sınırsız tekrar dahil.'
            )}
          </Text>
        </View>

        {PLAN_TIERS.map((tier) => {
          const current = plan === tier.id;
          const highlight = tier.id === 'premium';
          return (
            <View
              key={tier.id}
              style={[
                styles.card,
                {
                  backgroundColor: theme.surface,
                  borderColor: current ? theme.pulse : theme.border,
                },
              ]}
            >
              <View style={styles.cardHead}>
                <Text style={[styles.cardName, { color: theme.text }]}>
                  {t(tier.name)}
                </Text>
                {/* Fiyat, satış açıldığında Play'den okunacak; şimdiden
                    bir tutar yazmak yanıltıcı olur. */}
                {tier.id === 'free' ? (
                  <Text style={[styles.price, { color: theme.text }]}>{tier.price}</Text>
                ) : (
                  <Text style={[styles.priceSoon, { color: theme.sub }]}>
                    {t('yakında')}
                  </Text>
                )}
              </View>
              <Text style={[styles.tagline, { color: theme.sub }]}>{t(tier.tagline)}</Text>

              <View style={styles.features}>
                {tier.features.map((f) => (
                  <Text key={f} style={[styles.feature, { color: theme.sub }]}>
                    · {t(f)}
                  </Text>
                ))}
              </View>

              {current ? (
                <Text style={[styles.currentTag, { color: theme.pulse }]}>
                  {t('Şu anki planın')}
                </Text>
              ) : highlight ? (
                <View style={[styles.soon, { borderColor: theme.border }]}>
                  <Text style={[styles.soonText, { color: theme.sub }]}>
                    {t('🔒 Yakında')}
                  </Text>
                </View>
              ) : null}
            </View>
          );
        })}

        <Text style={[styles.section, { color: theme.sub }]}>
          {t('İÇERİK PAKETLERİ')}
        </Text>
        <Text style={[styles.sectionHint, { color: theme.faint }]}>
          {t(
            'Tek seferlik, aboneliğe gerek yok. Bir paket, günün formülünün seçildiği havuza yeni renk, ses, nefes tekniği, kelime ve bulgu ekler — mevcut içeriğin yerine geçmez, üstüne biner. Yani paket alınca ritüel değişmez; formüllerde çıkabilecek seçenek sayısı artar. Formülünde paketten bir öğe çıktığında ana ekrandaki kartta adının yanında paketin adı yazar.'
          )}
        </Text>

        {CONTENT_PACKS.map((pack) => {
          return (
            <View key={pack.id}>
              <View
                style={[
                  styles.packRow,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                <View style={styles.packText}>
                  <Text style={[styles.packName, { color: theme.text }]}>
                    {t(pack.name)}
                  </Text>
                  <Text style={[styles.packDesc, { color: theme.sub }]}>
                    {t(pack.description)}
                  </Text>
                  <Text style={[styles.packCounts, { color: theme.pulse }]}>
                    + {packCounts(pack.id, t)}
                  </Text>
                  <Text style={[styles.packExamples, { color: theme.faint }]}>
                    {packExamples(pack.id, t)}
                  </Text>
                </View>
                <Text style={[styles.packPrice, { color: theme.faint }]}>
                  {t('yakında')}
                </Text>
              </View>
            </View>
          );
        })}

        <TransparencyPill
          light
          style={styles.pill}
          text={t(
            '⚗️ Ücretsiz kademe de tam bir ritüel çalıştırır. Premium yalnızca çeşit ekler.'
          )}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 60 },
  notice: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginTop: 16,
  },
  noticeTitle: { fontFamily: fonts.sansBold, fontSize: 13 },
  noticeText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
  priceSoon: { fontFamily: fonts.sansMedium, fontSize: 13 },
  soon: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  soonText: { fontFamily: fonts.sansMedium, fontSize: 13 },
  back: { alignSelf: 'flex-start', paddingVertical: 6, paddingRight: 12 },
  backText: { fontFamily: fonts.sansMedium, fontSize: 13 },
  title: { fontFamily: fonts.serif, fontSize: 30, marginTop: 6 },
  sub: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 18, marginTop: 4 },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    marginTop: 16,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  cardName: { fontFamily: fonts.sansBold, fontSize: 16 },
  price: { fontFamily: fonts.serif, fontSize: 26 },
  period: { fontFamily: fonts.sans, fontSize: 12 },
  tagline: { fontFamily: fonts.sans, fontSize: 12, marginTop: 2 },
  features: { marginTop: 14 },
  feature: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 22 },
  currentTag: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    marginTop: 14,
  },
  cta: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  ctaText: { fontFamily: fonts.sansBold, fontSize: 14 },
  section: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 32,
  },
  sectionHint: {
    fontFamily: fonts.sans,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6,
    marginBottom: 12,
  },
  packRow: {
    flexDirection: 'row',
    // İçerik dökümü eklendikten sonra satır uzadı; fiyat üstte hizalı durmalı.
    alignItems: 'flex-start',
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 8,
  },
  packText: { flex: 1, paddingRight: 12 },
  packName: { fontFamily: fonts.sansMedium, fontSize: 14 },
  packDesc: { fontFamily: fonts.sans, fontSize: 11, lineHeight: 16, marginTop: 3 },
  packCounts: { fontFamily: fonts.sansMedium, fontSize: 11, marginTop: 6 },
  packExamples: { fontFamily: fonts.sans, fontSize: 10, lineHeight: 15, marginTop: 3 },
  packOwned: { fontFamily: fonts.sans, fontSize: 10, lineHeight: 15, marginTop: 6 },
  packPrice: { fontFamily: fonts.sansBold, fontSize: 14 },
  restore: { alignSelf: 'center', marginTop: 22, paddingVertical: 8 },
  restoreText: { fontFamily: fonts.sans, fontSize: 12, textDecorationLine: 'underline' },
  pill: { marginTop: 26 },
});
