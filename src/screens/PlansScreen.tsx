import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../components/Screen';
import PressableScale from '../components/PressableScale';
import TransparencyPill from '../components/TransparencyPill';
import { fonts } from '../constants/typography';
import { useT, useTheme } from '../context/SettingsContext';
import { usePremium } from '../context/PremiumContext';
import Icon from '../components/Icon';
import {
  CONTENT_PACKS,
  FREE_FEATURES,
  MONTHLY_PRICE_TRY,
  PACKS_FOR_SALE,
  PLAN_NAME,
  PLUS_HIGHLIGHTS,
  PREMIUM_FEATURES,
  PURCHASE_OPTIONS,
  YEARLY_PRICE_TRY,
  optionById,
  parseDisplayPrice,
  yearlyDiscountPercent,
  yearlyPerMonth,
  type PurchaseOptionId,
} from '../constants/plans';
import { packCounts, packExamples } from '../constants/packs';
import {
  APPLE_EULA_URL,
  MANAGE_SUBSCRIPTIONS_URL,
  openManageSubscriptions,
} from '../utils/billing';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Plans'>;

/**
 * Plan ekranı — satın alma noktası.
 *
 * App Store, abonelik satan uygulamalarda şunların **satın alma
 * noktasında** görünmesini şart koşuyor (Guideline 3.1.2): aboneliğin
 * süresi, tutarı, kendiliğinden yenilendiği, nasıl durdurulacağı; ayrıca
 * "satın alımları geri yükle" düğmesi ile Kullanım Koşulları ve Gizlilik
 * Politikası bağlantıları. Eksik olan her madde tek başına red sebebi.
 *
 * Fiyatlar mağazadan okunuyor (`usePremium().prices`); koda gömülü tutar
 * yalnızca mağazaya ulaşılamadığında yedek olarak gösteriliyor.
 */
export default function PlansScreen({ navigation }: Props) {
  const theme = useTheme();
  const t = useT();
  const { isPremium, option, expiresAt, prices, busy, buy, restore, refresh } = usePremium();
  const [selected, setSelected] = useState<PurchaseOptionId>('yearly');

  // Ekran açılırken fiyatları ve yetkiyi tazele: kullanıcı başka bir
  // cihazda satın aldıysa burada görsün.
  useEffect(() => {
    void refresh();
  }, [refresh]);

  const priceFor = useCallback(
    (id: PurchaseOptionId) => prices.find((p) => p.option === id)?.price ?? optionById(id).fallbackPrice,
    [prices]
  );
  // "7 gün ücretsiz, sonra ₺129" cümlesi burada kuruluyor: parçaları çeviriden
  // geçirmek, cümlenin tamamını sözlükte aramaktan farklı. Fiyat ve süre
  // değişken olduğu için bütün cümlenin sözlükte bir karşılığı olamaz.
  const introFor = useCallback(
    (id: PurchaseOptionId) => {
      const info = prices.find((p) => p.option === id);
      if (!info?.introUnit || !info.introCount) return undefined;
      const units: Record<string, string> = {
        day: 'gün',
        week: 'hafta',
        month: 'ay',
        year: 'yıl',
      };
      return t('{sure} {birim} ücretsiz, sonra {fiyat}', {
        sure: info.introCount,
        birim: t(units[info.introUnit]),
        fiyat: info.price,
      });
    },
    [prices, t]
  );

  /**
   * Yıllık kartın "%36 indirim · ayda ₺96,67" satırı.
   *
   * Hesap **ekranda yazan** iki fiyattan yapılıyor. Mağazadan okunan
   * tutarlar çözülebiliyorsa onlardan, mağazaya ulaşılamadıysa (ve
   * ekranda zaten yedek tutarlar görünüyorsa) koddaki yedeklerden.
   * Çözülemeyen bir biçimde satır hiç görünmüyor: kullanıcıya gösterilen
   * fiyatlarla tutmayan bir yüzde, yanlış fiyat beyanı olurdu.
   */
  const yearlySaving = useCallback(() => {
    const storeMonthly = prices.find((p) => p.option === 'monthly')?.price;
    const storeYearly = prices.find((p) => p.option === 'yearly')?.price;

    let monthly: number | null = MONTHLY_PRICE_TRY;
    let yearly: number | null = YEARLY_PRICE_TRY;
    if (storeMonthly && storeYearly) {
      monthly = parseDisplayPrice(storeMonthly);
      yearly = parseDisplayPrice(storeYearly);
    }
    if (monthly == null || yearly == null) return undefined;

    const percent = yearlyDiscountPercent(monthly, yearly);
    if (percent <= 0) return undefined;
    return { percent, perMonth: yearlyPerMonth(yearly) };
  }, [prices]);

  const onBuy = useCallback(async () => {
    const result = await buy(selected);
    // Kullanıcı vazgeçtiyse hiçbir şey gösterme: kendi kapattığı pencere
    // için uyarı çıkarmak hata yapmış hissi verir.
    if (result.cancelled) return;
    if (result.message) {
      Alert.alert(
        result.ok ? t('{plan} açıldı', { plan: PLAN_NAME }) : t('Satın alma'),
        t(result.message)
      );
    }
  }, [buy, selected, t]);

  const onRestore = useCallback(async () => {
    const result = await restore();
    Alert.alert(t('Satın alımlar'), t(result.message));
  }, [restore, t]);

  const openLink = useCallback((url: string) => {
    void Linking.openURL(url).catch(() => {});
  }, []);

  const selectedOption = optionById(selected);
  const selectedIntro = introFor(selected);

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

        <Text style={[styles.title, { color: theme.text }]}>{PLAN_NAME}</Text>
        <Text style={[styles.sub, { color: theme.sub }]}>
          {t(
            'Ritüel ücretsiz ve öyle kalacak. Plus, ritüelin sende işe yarayıp yaramadığını sana ölçerek söyler.'
          )}
        </Text>

        {isPremium ? (
          <View
            style={[
              styles.notice,
              { backgroundColor: theme.accentSoft, borderColor: theme.pulse },
            ]}
          >
            <Text style={[styles.noticeTitle, { color: theme.pulse }]}>
              {t('{plan} üyeliğin etkin', { plan: PLAN_NAME })}
            </Text>
            <Text style={[styles.noticeText, { color: theme.sub }]}>
              {expiresAt
                ? t('{tarih} tarihinde yenilenecek.', {
                    tarih: new Date(expiresAt).toLocaleDateString(),
                  })
                : t('Tüm özellikler açık.')}
            </Text>
          </View>
        ) : null}

        {/* ---------------- Öne çıkan üç özellik ----------------
            Sekiz maddelik düz bir liste okunmuyor, göz üstünden kayıyor.
            Kararı verdiren şey ilk iki satır; o yüzden ölçümü anlatan iki
            özellik buraya, kendi ikonlarıyla kondu. Zaten satın almış
            kullanıcıya gösterilmiyor — ona satılacak bir şey kalmadı. */}
        {!isPremium
          ? PLUS_HIGHLIGHTS.map((h) => (
              <View
                key={h.title}
                style={[
                  styles.highlight,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                <View style={[styles.highlightIcon, { borderColor: theme.border }]}>
                  <Icon name={h.icon} size={18} color={theme.pulse} strokeWidth={1.5} />
                </View>
                <View style={styles.highlightText}>
                  <Text style={[styles.highlightTitle, { color: theme.text }]}>
                    {t(h.title)}
                  </Text>
                  <Text style={[styles.highlightDesc, { color: theme.sub }]}>
                    {t(h.description)}
                  </Text>
                </View>
              </View>
            ))
          : null}

        {/* ---------------- Satın alma seçenekleri ---------------- */}
        {!isPremium
          ? PURCHASE_OPTIONS.map((opt) => {
              const active = opt.id === selected;
              const intro = introFor(opt.id);
              // İndirim satırı yalnız yıllık kartta ve yalnız hesaplanabildiğinde.
              const saving = opt.best ? yearlySaving() : undefined;
              return (
                <PressableScale
                  key={opt.id}
                  accessibilityRole="button"
                  onPress={() => setSelected(opt.id)}
                  style={[
                    styles.card,
                    {
                      backgroundColor: theme.surface,
                      borderColor: active ? theme.pulse : theme.border,
                      borderWidth: active ? 2 : 1,
                    },
                  ]}
                >
                  <View style={styles.cardHead}>
                    <Text style={[styles.cardName, { color: theme.text }]}>
                      {t(opt.label)}
                    </Text>
                    <Text style={[styles.price, { color: theme.text }]}>
                      {priceFor(opt.id)}
                      <Text style={[styles.period, { color: theme.sub }]}>
                        {t(opt.suffix)}
                      </Text>
                    </Text>
                  </View>
                  {opt.best ? (
                    <Text style={[styles.badge, { color: theme.pulse }]}>
                      {saving
                        ? t('%{yuzde} indirim · ayda {aylik}', {
                            yuzde: saving.percent,
                            aylik: saving.perMonth.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }),
                          })
                        : t('En avantajlı')}
                    </Text>
                  ) : null}
                  <Text style={[styles.tagline, { color: theme.sub }]}>
                    {intro ?? t(opt.note)}
                  </Text>
                </PressableScale>
              );
            })
          : null}

        {!isPremium ? (
          <>
            <PressableScale
              accessibilityRole="button"
              disabled={busy}
              onPress={onBuy}
              style={[
                styles.cta,
                { backgroundColor: theme.pulse, opacity: busy ? 0.5 : 1 },
              ]}
            >
              <Text style={[styles.ctaText, { color: theme.bg }]}>
                {busy
                  ? t('Bekleniyor…')
                  : selectedIntro
                    ? t('Ücretsiz denemeyi başlat')
                    : t('Plus\'a geç')}
              </Text>
            </PressableScale>

            {/* Geri yükleme, abonelik satan her uygulamada zorunlu: telefon
                değiştiren ya da uygulamayı silip kuran kullanıcı üyeliğine
                parasını yeniden ödemeden kavuşabilmeli. */}
            <PressableScale
              accessibilityRole="button"
              disabled={busy}
              onPress={onRestore}
              style={styles.restore}
            >
              <Text style={[styles.restoreText, { color: theme.sub }]}>
                {t('Satın alımları geri yükle')}
              </Text>
            </PressableScale>
          </>
        ) : (
          <PressableScale
            accessibilityRole="button"
            onPress={() => {
              void openManageSubscriptions();
            }}
            style={[styles.manage, { borderColor: theme.border }]}
          >
            <Text style={[styles.manageText, { color: theme.text }]}>
              {t('Aboneliği yönet')}
            </Text>
          </PressableScale>
        )}

        {/* ---------------- Zorunlu abonelik metni ---------------- */}
        {!isPremium ? (
          <Text style={[styles.terms, { color: theme.faint }]}>
            {t(
              '{plan} — {fiyat}{donem}. {deneme}Bu bir aboneliktir ve dönem sonunda kendiliğinden yenilenir. Ödeme, satın almayı onayladığında hesabından tahsil edilir. Yenilemeyi durdurmak için dönem bitmeden en az 24 saat önce hesabının abonelik ayarlarına gitmen gerekir; uygulamayı silmek aboneliği iptal etmez.',
              {
                plan: t(selectedOption.label),
                fiyat: priceFor(selected),
                donem: t(selectedOption.suffix),
                deneme: selectedIntro ? `${selectedIntro} ${t('ücretlendirilir.')} ` : '',
              }
            )}
          </Text>
        ) : null}

        {/* İki bağlantı da satın alma noktasında bulunmak zorunda. */}
        <View style={styles.legalRow}>
          <PressableScale
            accessibilityRole="link"
            onPress={() => navigation.navigate('Legal', { doc: 'privacy' })}
          >
            <Text style={[styles.legalLink, { color: theme.sub }]}>
              {t('Gizlilik politikası')}
            </Text>
          </PressableScale>
          <Text style={[styles.legalSep, { color: theme.faint }]}>·</Text>
          <PressableScale accessibilityRole="link" onPress={() => openLink(APPLE_EULA_URL)}>
            <Text style={[styles.legalLink, { color: theme.sub }]}>
              {t('Kullanım koşulları')}
            </Text>
          </PressableScale>
          <Text style={[styles.legalSep, { color: theme.faint }]}>·</Text>
          <PressableScale
            accessibilityRole="link"
            onPress={() => openLink(MANAGE_SUBSCRIPTIONS_URL)}
          >
            <Text style={[styles.legalLink, { color: theme.sub }]}>
              {t('Abonelikler')}
            </Text>
          </PressableScale>
        </View>

        {/* ---------------- Ne açılıyor ---------------- */}
        <Text style={[styles.section, { color: theme.sub }]}>{t('PLUS İLE AÇILANLAR')}</Text>
        <View style={[styles.listBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {PREMIUM_FEATURES.map((f) => (
            <Text key={f} style={[styles.feature, { color: theme.text }]}>
              · {t(f)}
            </Text>
          ))}
        </View>

        <Text style={[styles.section, { color: theme.sub }]}>{t('ÜCRETSİZ KADEMEDE NE VAR')}</Text>
        <View style={[styles.listBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {FREE_FEATURES.map((f) => (
            <Text key={f} style={[styles.feature, { color: theme.sub }]}>
              · {t(f)}
            </Text>
          ))}
        </View>

        {/* ---------------- İçerik paketleri ----------------
            Satışa kapalıyken bile tanıtılıyorlar, çünkü içerikleri zaten
            premium havuzunun içinde ve kullanıcı formül kartında paket
            adını görüyor. Satın alınacak bir şey gibi sunulmuyor. */}
        {PACKS_FOR_SALE ? (
          <>
            <Text style={[styles.section, { color: theme.sub }]}>{t('İÇERİK PAKETLERİ')}</Text>
            {CONTENT_PACKS.map((pack) => (
              <View
                key={pack.id}
                style={[
                  styles.packRow,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                <View style={styles.packText}>
                  <Text style={[styles.packName, { color: theme.text }]}>{t(pack.name)}</Text>
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
              </View>
            ))}
          </>
        ) : null}

        <TransparencyPill
          light
          style={styles.pill}
          text={t(
            '⚗️ Ücretsiz kademe de tam bir ritüel çalıştırır. Plus ölçüm ekler, etki eklemez — çünkü eklenecek bir etki yok.'
          )}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  highlight: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  highlightIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  highlightText: { flex: 1 },
  highlightTitle: { fontFamily: fonts.sansBold, fontSize: 15, marginBottom: 4 },
  highlightDesc: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 18 },
  content: { padding: 20, paddingBottom: 60 },
  back: { alignSelf: 'flex-start', paddingVertical: 6, paddingRight: 12 },
  backText: { fontFamily: fonts.sansMedium, fontSize: 13 },
  title: { fontFamily: fonts.serif, fontSize: 30, marginTop: 6 },
  sub: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 18, marginTop: 4 },
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
  card: {
    borderRadius: 18,
    padding: 18,
    marginTop: 12,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  cardName: { fontFamily: fonts.sansBold, fontSize: 16 },
  price: { fontFamily: fonts.serif, fontSize: 24 },
  period: { fontFamily: fonts.sans, fontSize: 12 },
  badge: { fontFamily: fonts.sansMedium, fontSize: 10, letterSpacing: 1, marginTop: 6 },
  tagline: { fontFamily: fonts.sans, fontSize: 12, marginTop: 4 },
  cta: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  ctaText: { fontFamily: fonts.sansBold, fontSize: 14 },
  restore: { alignSelf: 'center', marginTop: 14, paddingVertical: 8 },
  restoreText: { fontFamily: fonts.sans, fontSize: 12, textDecorationLine: 'underline' },
  manage: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 18,
  },
  manageText: { fontFamily: fonts.sansMedium, fontSize: 13 },
  terms: {
    fontFamily: fonts.sans,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 16,
  },
  legalRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 12,
  },
  legalLink: { fontFamily: fonts.sans, fontSize: 11, textDecorationLine: 'underline' },
  legalSep: { fontFamily: fonts.sans, fontSize: 11, marginHorizontal: 8 },
  section: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 32,
    marginBottom: 10,
  },
  listBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  feature: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 22 },
  packRow: {
    flexDirection: 'row',
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
  pill: { marginTop: 26 },
});
