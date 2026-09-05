import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../components/Screen';
import PressableScale from '../components/PressableScale';
import CameraMoodCapture from '../components/CameraMoodCapture';
import { colors } from '../constants/colors';
import { fonts } from '../constants/typography';
import { CUSTOM_COMPLAINT_ID, rememberTextGoal } from '../constants/complaints';
import { PLAN_NAME } from '../constants/plans';
import { useT, useTheme } from '../context/SettingsContext';
import { useUser } from '../context/UserContext';
import { usePremium } from '../context/PremiumContext';
import { haptics } from '../utils/haptics';
import { moodComplaintTextFor } from '../utils/faceMood';
import { consumeFaceScan, remainingFaceScans } from '../utils/faceScanQuota';
import { classifyComplaintGoal } from '../utils/localAI';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Complaint'>;

/**
 * Akışın ilk adımı: bugün ne şikayet var?
 *
 * İki yol var, üçüncüsü yok:
 *
 *   1. **Fotoğraf analiziyle otomatik reçete** — önerilen yol. Yüz
 *      ifadesinden çıkan ruh hali hem reçeteyi belirliyor hem de
 *      ritüelin başlangıç puanı oluyor.
 *   2. **Kendim anlatayım** — kendi cümlesi. Cihaz üstü model cümleyi
 *      bir hedefe bağlıyor.
 *
 * Arada bir de hazır şikayet listesi vardı (uykusuzluk, gerginlik…).
 * Kaldırıldı: liste, kişinin kendi durumunu on iki kutudan birine
 * sıkıştırmasını istiyordu ve seçtiği kutu ne fotoğraf kadar nesnel ne
 * kendi cümlesi kadar kişiseldi — iki iyi yolun arasında duran, ikisini
 * de gölgeleyen bir üçüncü yoldu.
 */
export default function ComplaintScreen({ navigation }: Props) {
  const theme = useTheme();
  const t = useT();
  const { user } = useUser();
  /** Fotoğraf yerine kendi cümlesini mi yazıyor? */
  const [custom, setCustom] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const [customText, setCustomText] = useState('');
  const [cameraOpen, setCameraOpen] = useState(false);

  /**
   * Bugün kaç yüz taraması hakkı kaldı? Plus'ta sonsuz.
   *
   * `null` "henüz okunmadı" demek; okunana kadar kart, hakkı varmış gibi
   * görünüyor. Tersi (hak yokmuş gibi başlayıp sonra açılmak) ekranın ilk
   * karesinde yanlış bir kilit gösterirdi.
   */
  const { limits } = usePremium();
  const [scansLeft, setScansLeft] = useState<number | null>(null);
  useEffect(() => {
    let alive = true;
    void remainingFaceScans(limits.faceScansPerDay).then((left) => {
      if (alive) setScansLeft(left);
    });
    return () => {
      alive = false;
    };
  }, [limits.faceScansPerDay]);
  const scanLocked = scansLeft != null && scansLeft <= 0;
  /** Model cümleyi sınıflandırırken buton bekliyor gibi görünsün. */
  const [classifying, setClassifying] = useState(false);

  const canContinue = custom && customText.trim().length >= 3;

  /**
   * Serbest metin yazıldıysa, akışa girmeden önce cihaz üstü modele
   * hangi hedefe ait olduğu soruluyor.
   *
   * Beklemek bilerek kısa tutuluyor ve sonuç gelmezse hiç beklenmiyor:
   * `classifyComplaintGoal` kendi zaman aşımına sahip ve `null` dönünce
   * anahtar kelime eşlemesi devreye giriyor. Yani model olmayan bir
   * cihazda bu adım görünmez biçimde atlanıyor.
   */
  const start = async () => {
    if (!canContinue || classifying) return;
    haptics.tap();
    const text = customText.trim();

    setClassifying(true);
    const goal = await classifyComplaintGoal(text);
    if (goal) rememberTextGoal(text, goal);
    setClassifying(false);

    navigation.navigate('Examination', {
      complaintId: CUSTOM_COMPLAINT_ID,
      customText: text,
    });
  };

  return (
    <Screen background={theme.bg}>
      {/* Klavye, yazılan cümlenin üstüne biniyordu: alan ekranın altına
          yakın, ScrollView ise klavyeyi hiç hesaba katmıyordu. iOS'ta
          `padding` davranışı görünür alanı klavye kadar kısaltıyor,
          `automaticallyAdjustKeyboardInsets` da kaydırma payını
          büyütüyor; Android zaten `adjustResize` ile aynı işi kendi
          yapıyor, o yüzden orada davranış verilmiyor. */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          automaticallyAdjustKeyboardInsets
        >
          <PressableScale
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            style={styles.back}
          >
            <Text style={[styles.backText, { color: theme.sub }]}>{t('‹ Geri')}</Text>
          </PressableScale>

          {/* Kurulumdan hemen sonra buraya düşüldüğü için ilk satır
              kişisel: beklenti etkisini adıyla başlatıyor. */}
          {user.name ? (
            <>
              <Text style={[styles.greeting, { color: theme.text }]}>
                {t('Merhaba {ad}.', { ad: user.name })}
              </Text>
              <Text style={[styles.question, { color: theme.sub }]}>
                {t('Bugün ne hissediyorsun?')}
              </Text>
            </>
          ) : (
            // Ad yoksa soru başlığın kendisi olur; ekran başsız kalmasın.
            <Text style={[styles.title, { color: theme.text }]}>
              {t('Bugün ne hissediyorsun?')}
            </Text>
          )}
          <Text style={[styles.sub, { color: theme.sub }]}>
            {t('Dürüst ol. Beklenti protokolü dürüstlükle daha iyi çalışır.')}
          </Text>

          <View style={styles.list}>
            {/* Fotoğraftan otomatik reçete listenin başında: asıl önerilen
                yol bu, aşağıdaki hazır şikayetler ise elle seçim. Sonuç ne
                olursa olsun (sakin ya da gergin) doğrudan bir reçeteye
                geçilir. */}
            <PressableScale
              onPress={() => {
                haptics.tap();
                // Günlük hak bittiyse kart kilitlenmiyor, plan ekranına
                // götürüyor: kullanıcı neyi kaybettiğini ve nereden
                // açacağını aynı dokunuşta öğreniyor. Sessizce çalışmayan
                // bir düğme, kilit olduğunu anlatmayan bir kilittir.
                if (scanLocked) navigation.navigate('Plans');
                else setCameraOpen(true);
              }}
              pressedScale={0.99}
              accessibilityRole="button"
              style={[
                styles.row,
                styles.cameraRow,
                { borderColor: scanLocked ? theme.border : theme.pulse },
              ]}
            >
              <Text style={styles.icon}>🤖</Text>
              <Text style={[styles.label, { color: theme.text }]}>
                {t('Fotoğraf analiziyle otomatik reçete')}
              </Text>
            </PressableScale>
            <Text style={[styles.cameraNote, { color: theme.faint }]}>
              {scanLocked
                ? t('Bugünkü ölçüm hakkın doldu. {plan} ile sınırsız.', { plan: PLAN_NAME })
                : t('Bir fotoğraf çek, reçeteni yüz ifaden belirlesin.')}
            </Text>

            <Text style={[styles.listDivider, { color: theme.faint }]}>
              {t('YA DA')}
            </Text>

            <PressableScale
              onPress={() => {
                haptics.tap();
                setCustom(true);
              }}
              pressedScale={0.99}
              accessibilityRole="button"
              accessibilityState={{ selected: custom }}
              style={[
                styles.row,
                {
                  backgroundColor: custom ? theme.accentSoft : theme.surface,
                  borderColor: custom ? theme.pulse : theme.border,
                },
              ]}
            >
              <Text style={styles.icon}>✍️</Text>
              <Text style={[styles.label, { color: theme.text }]}>
                {t('Kendim anlatayım')}
              </Text>
            </PressableScale>

            {custom ? (
              <View style={styles.customWrap}>
                <TextInput
                  value={customText}
                  onChangeText={setCustomText}
                  placeholder={t('Örn. Sabahları kalkmakta zorlanıyorum')}
                  placeholderTextColor={theme.faint}
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                      color: theme.text,
                    },
                  ]}
                  multiline
                  maxLength={120}
                  autoFocus
                  // Klavye açılırken düzen henüz yeni yüksekliğine
                  // oturmamış oluyor; kaydırma bir kare sonraya bırakılıyor.
                  onFocus={() =>
                    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120)
                  }
                />
                <Text style={[styles.inputHint, { color: theme.faint }]}>
                  {t(
                    'Kendi cümlen reçetenin adını ve formülün hedefini belirler. {kalan} karakter kaldı.',
                    { kalan: 120 - customText.length }
                  )}
                </Text>
              </View>
            ) : null}
          </View>

          <PressableScale
            onPress={() => void start()}
            disabled={!canContinue || classifying}
            accessibilityRole="button"
            style={[
              styles.cta,
              { backgroundColor: canContinue ? colors.pulse : theme.border },
            ]}
          >
            <Text
              style={[styles.ctaText, { color: canContinue ? colors.white : theme.faint }]}
            >
              {classifying ? t('Okunuyor…') : t('Devam Et')}
            </Text>
          </PressableScale>
        </ScrollView>
      </KeyboardAvoidingView>

      <CameraMoodCapture
        visible={cameraOpen}
        onCancel={() => setCameraOpen(false)}
        onResult={({ score, emotions }) => {
          setCameraOpen(false);
          // Hak yalnız başarılı ölçümde düşüyor.
          void consumeFaceScan();
          setScansLeft((left) => (left == null ? left : Math.max(0, left - 1)));
          // Sonuç ne olursa olsun (sakin ya da gergin) doğrudan bir
          // reçeteye geçilir — kullanıcıyı elle seçime geri göndermek
          // bu düğmenin bütün amacını (fotoğraftan otomatik reçete)
          // anlamsızlaştırıyordu.
          haptics.success();
          navigation.navigate('Examination', {
            complaintId: CUSTOM_COMPLAINT_ID,
            customText: moodComplaintTextFor(emotions),
            faceMoodScore: score,
          });
        }}
      />
    </Screen>
  );
}

/** Tek şikayet kartı — seçilince kısa bir yaylanma yapar. */
const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  back: { alignSelf: 'flex-start', paddingVertical: 6, paddingRight: 12 },
  backText: { fontFamily: fonts.sansMedium, fontSize: 13 },
  greeting: { fontFamily: fonts.serif, fontSize: 28, marginTop: 10 },
  question: { fontFamily: fonts.sans, fontSize: 16, marginTop: 4 },
  // Selamlama varken başlık ona yapışsın diye üst boşluk küçük.
  title: { fontFamily: fonts.serif, fontSize: 30, marginTop: 4 },
  sub: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 19, marginTop: 6 },
  list: { marginTop: 22 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  icon: {
    fontSize: 22,
    lineHeight: 28,
    marginRight: 14,
    includeFontPadding: false,
  },
  label: { flex: 1, fontFamily: fonts.sans, fontSize: 14, lineHeight: 20 },
  cameraRow: { borderWidth: 1.5 },
  listDivider: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    letterSpacing: 1.5,
    marginTop: 6,
    marginBottom: 10,
  },
  cameraNote: {
    fontFamily: fonts.sans,
    fontSize: 11,
    lineHeight: 16,
    marginTop: -2,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  customWrap: { marginTop: 2, marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    minHeight: 92,
    textAlignVertical: 'top',
  },
  inputHint: { fontFamily: fonts.sans, fontSize: 10, lineHeight: 15, marginTop: 6 },
  pill: { marginTop: 8 },
  cta: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  ctaText: { fontFamily: fonts.sansBold, fontSize: 15 },
});
