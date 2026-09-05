import React, { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Constants from 'expo-constants';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import Screen from '../components/Screen';
import SettingRow from '../components/SettingRow';
import {
  HEALTH_SUPPORTED,
  connectHealth,
  healthAvailable,
  isHealthEnabled,
  setHealthEnabled,
} from '../utils/health';
import SegmentedControl from '../components/SegmentedControl';
import PressableScale from '../components/PressableScale';
import TransparencyPill from '../components/TransparencyPill';
import { fonts } from '../constants/typography';
import { useUser } from '../context/UserContext';
import { useSettings, useT, useTheme } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { usePremium } from '../context/PremiumContext';
import { PLAN_NAME, PREMIUM_ENABLED } from '../constants/plans';
import { FORCE_FREE_TIER } from '../constants/devTier';
import { resetFaceScanQuota } from '../utils/faceScanQuota';
import {
  cancelDailyCycle,
  cancelNudges,
  cancelReminder,
  formatTime,
  requestPermission,
  scheduleDailyCycle,
  scheduleDailyReminder,
  scheduleNudges,
} from '../utils/reminders';
import { haptics } from '../utils/haptics';
import { adsPrivacyOptionsRequired, showAdsPrivacyOptions } from '../utils/ads';
import type { ThemeMode } from '../theme/theme';
import { LANGUAGE_LABELS, type LanguagePref } from '../i18n';
import type { RootStackParamList } from '../navigation/types';

/** Mağaza sürümüyle uyumlu kalması için app config'ten okunur. */
const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'dawn', label: 'Şafak' },
  { value: 'mist', label: 'Sis' },
  { value: 'light', label: 'Açık' },
];

/** Dil seçimi: cihazı izle ya da bir dile sabitle. */
const LANGUAGE_OPTIONS: { value: LanguagePref; label: string }[] = [
  { value: 'system', label: LANGUAGE_LABELS.system },
  { value: 'tr', label: LANGUAGE_LABELS.tr },
  { value: 'en', label: LANGUAGE_LABELS.en },
];

const VOLUME_OPTIONS = [
  { value: '0', label: 'Kapalı' },
  { value: '0.3', label: 'Kısık' },
  { value: '0.6', label: 'Normal' },
  { value: '1', label: 'Yüksek' },
];

const DOSE_OPTIONS = [
  { value: '1', label: 'Tek doz' },
  { value: '2', label: 'Çift doz' },
];

/** Akıllı hatırlatıcının gün başına kaç kez düşeceği. */
const NUDGE_OPTIONS = [
  { value: '1', label: 'Günde 1' },
  { value: '2', label: 'Günde 2' },
  { value: '3', label: 'Günde 3' },
];

export default function SettingsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, update, reset } = useUser();
  const { settings, update: updateSettings, reset: resetSettings } = useSettings();
  const { account, appleAvailable, signOut } = useAuth();
  const { isPremium, limits, packs, reset: resetPremium } = usePremium();
  const theme = useTheme();
  const t = useT();
  const [name, setName] = useState(user.name);

  // Ad hesaptan sonradan doldurulabiliyor (girişin hemen ardından, ya da
  // uygulama kökünde adı boş bulan tohumlama). Bu ekran o sırada zaten
  // açıksa yerel kopya eskimiş kalıyordu: kutu boş görünüyor, kaydedilen
  // değer başka oluyordu. Yalnızca kutu boşken tazeleniyor — kullanıcı
  // yazmaya başladıysa üzerine yazmak olmaz.
  useEffect(() => {
    if (!name.trim() && user.name.trim()) setName(user.name);
  }, [user.name, name]);
  /** Saat seçici açık mı? Android'de sistem penceresi olarak açılır. */
  const [pickingTime, setPickingTime] = useState(false);
  // iOS'ta seçici, kullanıcı çarkı çevirdikçe onChange yolluyor. Saat
  // onaylanana kadar burada bekletiliyor; ayar ve bildirim yalnızca
  // "Tamam"a basılınca bir kez kuruluyor.
  const [draftTime, setDraftTime] = useState<Date | null>(null);

  /**
   * Sağlık verisi anahtarı. Tercih HealthKit'te değil yerelde duruyor:
   * Apple, okuma izninin sonucunu uygulamaya söylemiyor, o yüzden
   * "açık mı" sorusunun tek güvenilir kaynağı bu kayıt.
   */
  const [healthOn, setHealthOn] = useState(false);

  /**
   * Reklam rızası tercihleri. Düğme yalnız UMP gerektirdiğinde görünüyor —
   * AB/İngiltere/İsviçre kullanıcısında rıza sonradan değiştirilebilmeli,
   * Türkiye'deki kullanıcı ise rıza ekranıyla hiç karşılaşmadığı için
   * ayarlarında o satırın işi yok.
   */
  const [adsPrivacyOn, setAdsPrivacyOn] = useState(false);
  useEffect(() => {
    // Hemen altındaki sağlık denetiminde olduğu gibi iptal koruması var:
    // ekran cevap gelmeden kapatılırsa sökülmüş bileşene yazılmıyor.
    let alive = true;
    void adsPrivacyOptionsRequired().then((required) => {
      if (alive) setAdsPrivacyOn(required);
    });
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    let alive = true;
    void isHealthEnabled().then((v) => {
      if (alive) setHealthOn(v);
    });
    return () => {
      alive = false;
    };
  }, []);

  const onHealthToggle = async (next: boolean) => {
    if (!next) {
      setHealthOn(false);
      await setHealthEnabled(false);
      return;
    }
    // Önce açılıyor: izin diyaloğu ancak tercih açıkken anlamlı.
    await setHealthEnabled(true);
    const { ok, hasData } = await connectHealth();
    if (!ok) {
      // Diyalog hiç açılamadı (cihazda HealthKit yok ya da hata) — bu
      // durumda anahtar açık kalırsa kullanıcı çalıştığını sanır.
      await setHealthEnabled(false);
      setHealthOn(false);
      Alert.alert(
        t('Sağlık verisi kullanılamıyor'),
        t('Bu cihazda Sağlık verisi okunamıyor.')
      );
      return;
    }
    setHealthOn(true);
    if (!hasData) {
      // Anahtar bilerek açık bırakılıyor: izin verilmiş olabilir, sadece
      // okunacak kayıt yok. Eskiden burada anahtar sessizce kapanıyordu ve
      // izin veren kullanıcı düğmenin bozuk olduğunu sanıyordu.
      Alert.alert(
        t('Şimdilik okunacak veri yok'),
        t(
          'Bağlantı açıldı ama Sağlık uygulamasında dün geceye ait uyku ya da dinlenme nabzı kaydı bulunamadı. Bu genelde saat/uyku takibi olmadığında olur. Kayıt oluştuğunda reçeten kendiliğinden ona göre ayarlanır.'
        )
      );
    }
  };

  /**
   * 24 saatlik döngü anahtarı.
   *
   * Bildirim izni yoksa döngünün hiçbir parçası çalışmaz (davetler
   * bildirimle geliyor), o yüzden izin burada isteniyor ve verilmezse
   * anahtar açılmıyor — açık görünüp iş görmeyen bir ayar bırakmıyoruz.
   */
  const onDailyCycleToggle = async (next: boolean) => {
    if (!next) {
      updateSettings({ dailyCycle: false });
      await cancelDailyCycle();
      return;
    }
    const granted = await requestPermission();
    if (!granted) {
      Alert.alert(
        t('Bildirim izni yok'),
        t('Ölçüm davetleri bildirimle geliyor; izin vermeden bu döngü çalışmaz.')
      );
      return;
    }
    updateSettings({ dailyCycle: true });
    await scheduleDailyCycle(t);
  };

  const onReminderToggle = async (enabled: boolean) => {
    if (!enabled) {
      updateSettings({ reminderEnabled: false });
      await cancelReminder();
      return;
    }
    const granted = await requestPermission();
    if (!granted) {
      // İzin bir kez reddedildikten sonra sistem aynı soruyu bir daha
      // sormaz; tek yol ayarlar ekranıdır, o yüzden oraya bir kısayol
      // veriliyor.
      Alert.alert(
        t('Bildirim izni yok'),
        t('Hatırlatıcı için telefon ayarlarından bildirimlere izin vermen gerekiyor.'),
        [
          { text: t('Vazgeç'), style: 'cancel' },
          { text: t('Ayarları aç'), onPress: () => void Linking.openSettings() },
        ]
      );
      return;
    }
    const ok = await scheduleDailyReminder(
      settings.reminderHour,
      settings.reminderMinute,
      t
    );
    if (!ok) {
      Alert.alert(
        t('Hatırlatıcı kurulamadı'),
        t('Telefonun bildirim ayarlarını kontrol edip tekrar dene.')
      );
      return;
    }
    updateSettings({ reminderEnabled: true });
  };

  /**
   * Hatırlatma saati.
   *
   * Önceden beş sabit saat arasında dönüyordu (7, 9, 12, 18, 21) ve
   * arada bir saat isteyen kullanıcının yapabileceği bir şey yoktu.
   * Artık sistemin kendi saat seçicisi açılıyor: istenen saat ve dakika
   * doğrudan giriliyor.
   */
  const applyTime = async (date: Date) => {
    const hour = date.getHours();
    const minute = date.getMinutes();
    updateSettings({ reminderHour: hour, reminderMinute: minute });
    if (settings.reminderEnabled) {
      await scheduleDailyReminder(hour, minute, t);
    }
  };

  /** Android: seçici bir sistem penceresidir, sonucu tek seferde döner. */
  const onTimePicked = async (event: DateTimePickerEvent, date?: Date) => {
    setPickingTime(false);
    // Kullanıcı vazgeçtiyse ayara dokunulmaz.
    if (event.type !== 'set' || !date) return;
    await applyTime(date);
  };

  const openTimePicker = () => {
    setDraftTime(reminderDate());
    setPickingTime(true);
  };

  /**
   * Akıllı hatırlatıcı: günün rastgele saatlerinde düşen kısa dürtmeler.
   * Bildirim izni günlük hatırlatıcıyla ortak.
   */
  const onNudgeToggle = async (enabled: boolean) => {
    if (!enabled) {
      updateSettings({ smartNudges: false });
      await cancelNudges();
      return;
    }
    const granted = await requestPermission();
    if (!granted) {
      Alert.alert(
        t('Bildirim izni yok'),
        t('Hatırlatıcı için telefon ayarlarından bildirimlere izin vermen gerekiyor.'),
        [
          { text: t('Vazgeç'), style: 'cancel' },
          { text: t('Ayarları aç'), onPress: () => void Linking.openSettings() },
        ]
      );
      return;
    }
    const ok = await scheduleNudges(settings.nudgesPerDay, t);
    if (!ok) {
      Alert.alert(
        t('Hatırlatıcı kurulamadı'),
        t('Telefonun bildirim ayarlarını kontrol edip tekrar dene.')
      );
      return;
    }
    updateSettings({ smartNudges: true });
  };

  const onNudgeCountChange = async (value: string) => {
    const perDay = Number(value);
    updateSettings({ nudgesPerDay: perDay });
    if (settings.smartNudges) await scheduleNudges(perDay, t);
  };

  /** Seçiciye verilecek başlangıç değeri — bugünün tarihi + kayıtlı saat. */
  const reminderDate = () => {
    const d = new Date();
    d.setHours(settings.reminderHour, settings.reminderMinute, 0, 0);
    return d;
  };

  const confirmSignOut = () => {
    Alert.alert(
      t('Oturumu kapat'),
      t('Ritüel kayıtların telefonunda kalmaya devam eder.'),
      [
      { text: t('Vazgeç'), style: 'cancel' },
      {
        text: t('Kapat'),
        style: 'destructive',
        onPress: () => {
          signOut();
          navigation.reset({ index: 0, routes: [{ name: 'SignIn' }] });
        },
      },
      ]
    );
  };

  const confirmReset = () => {
    Alert.alert(
      t('Hesap ve veriler silinsin mi?'),
      t(
        'Hesap bağlantın, adın, hedeflerin, serin, ayarların ve tüm ritüel kayıtların telefonundan silinir. Sunucuda kopyası yok. Geri alınamaz.'
      ),
      [
        { text: t('Vazgeç'), style: 'cancel' },
        {
          text: t('Sil'),
          style: 'destructive',
          onPress: async () => {
            await cancelReminder();
            await cancelNudges();
            await cancelDailyCycle();
            // Günlük ölçüm sayacı da kullanıcıya ait bir kayıt: hesap
            // silindiğinde cihazda kalmamalı.
            await resetFaceScanQuota();
            reset();
            resetSettings();
            resetPremium();
            signOut();
            setName('');
            navigation.reset({ index: 0, routes: [{ name: 'Splash' }] });
          },
        },
      ]
    );
  };

  return (
    <Screen background={theme.bg}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: theme.text }]}>{t('Ayarlar')}</Text>
        <Text style={[styles.sub, { color: theme.sub }]}>
          {t('Ritüel verilerin yalnızca bu cihazda tutulur.')}
        </Text>

        {/* ---------------- Hesap ---------------- */}
        <Text style={[styles.section, { color: theme.sub }]}>{t('HESAP')}</Text>
        {account ? (
          <>
            <SettingRow
              label={account.name}
              // Apple girişinde e-posta ikinci girişten sonra gelmez;
              // satır boş kalmasın diye hangi hesapla girildiği yazılır.
              hint={
                account.email ??
                (account.mode === 'apple'
                  ? t('Apple ile giriş yapıldı')
                  : t('Google ile giriş yapıldı'))
              }
            />
            <SettingRow label={t('Oturumu kapat')} destructive onPress={confirmSignOut} />
          </>
        ) : (
          <SettingRow
            label={appleAvailable ? t('Hesabınla giriş yap') : t('Google ile giriş yap')}
            hint={t('Devam etmek için gerekli.')}
            onPress={() => navigation.navigate('SignIn')}
          />
        )}

        {/* Plan satırı yalnızca satın alma açıkken görünür. Kapalıyken
            gösterilecek bir kademe yok: herkes tam sürümü kullanıyor. */}
        {PREMIUM_ENABLED || FORCE_FREE_TIER ? (
          <SettingRow
            label={t('Plan')}
            value={isPremium ? PLAN_NAME : t('Ücretsiz')}
            hint={
              isPremium
                ? packs.length
                  ? t('Tüm özellikler açık · {adet} içerik paketi', { adet: packs.length })
                  : t('Tüm özellikler açık.')
                : t('Dört hedef, temel formül havuzu, 7 günlük geçmiş.')
            }
            onPress={() => navigation.navigate('Plans')}
          />
        ) : null}

        {/* ---------------- Profil ----------------
            Ad hesaptan otomatik geliyor ama kilitli değil: sağlayıcının
            verdiği ad (ya da e-postadan türetilen karşılığı) her zaman
            kişinin kendini çağırdığı ad olmuyor. */}
        <Text style={[styles.section, { color: theme.sub }]}>{t('ADIN')}</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          // Kutu boşaltılırsa "Misafir" değil, hesaptan gelen ada
          // dönülüyor: kullanıcı adı silmekle misafir olmuyor.
          onBlur={() =>
            update({ name: name.trim() || account?.name?.trim() || 'Misafir' })
          }
          placeholder={t('Adın')}
          placeholderTextColor={theme.faint}
          style={[
            styles.input,
            { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text },
          ]}
          maxLength={24}
        />
        <Text style={[styles.hint, { color: theme.faint }]}>
          {t('Hesabından alındı; dilediğin gibi değiştirebilirsin.')}
        </Text>

        {/* Hedef seçimi burada değil, ana ekrandaki şeritte yapılır:
            aynı seçimin iki yerde durması, hangisinin geçerli olduğunu
            belirsizleştiriyordu. */}

        {/* ---------------- Görünüm ---------------- */}
        <Text style={[styles.section, { color: theme.sub }]}>{t('GÖRÜNÜM')}</Text>
        <SegmentedControl
          options={THEME_OPTIONS.map((o) => ({ ...o, label: t(o.label) }))}
          value={settings.themeMode}
          onChange={(mode) => {
            haptics.tap();
            updateSettings({ themeMode: mode });
          }}
        />
        <Text style={[styles.hint, { color: theme.faint }]}>
          {t('Vurgu rengi üç temada da aynı; değişen zemin, yüzey ve metin tonları.')}
        </Text>

        <Text style={[styles.miniLabel, styles.spaced, { color: theme.sub }]}>
          {t('Dil')}
        </Text>
        <SegmentedControl
          options={LANGUAGE_OPTIONS.map((o) => ({ ...o, label: t(o.label) }))}
          value={settings.language}
          onChange={(language) => {
            haptics.tap();
            updateSettings({ language });
          }}
        />
        <Text style={[styles.hint, { color: theme.faint }]}>
          {t(
            '“Sistem” seçiliyken uygulama telefonunun dilini izler; Türkçe değilse İngilizce açılır.'
          )}
        </Text>

        {/* ---------------- Ritüel ---------------- */}
        <Text style={[styles.section, { color: theme.sub }]}>{t('RİTÜEL')}</Text>
        <Text style={[styles.miniLabel, { color: theme.sub }]}>{t('Ses seviyesi')}</Text>
        <SegmentedControl
          options={VOLUME_OPTIONS.map((o) => ({ ...o, label: t(o.label) }))}
          value={`${settings.soundVolume}`}
          onChange={(v) => updateSettings({ soundVolume: Number(v) })}
        />

        <View style={styles.spacer} />
        {limits.customDose ? (
          <>
            <Text style={[styles.miniLabel, { color: theme.sub }]}>{t('Doz')}</Text>
            <SegmentedControl
              options={DOSE_OPTIONS.map((o) => ({ ...o, label: t(o.label) }))}
              value={`${settings.dose}`}
              onChange={(v) => updateSettings({ dose: Number(v) })}
            />
            <Text style={[styles.hint, { color: theme.faint }]}>
              {t(
                'Çift doz adım sürelerini ikiye katlar. Dozu artırmanın ölçülmüş bir etkisi yok — sadece daha uzun sürüyor.'
              )}
            </Text>
          </>
        ) : (
          <SettingRow
            label={t('Doz')}
            value={t('Tek doz')}
            hint={t('Ritüel süresini kendin ayarlamak {plan} ile açılır.', { plan: PLAN_NAME })}
            onPress={() => navigation.navigate('Plans')}
          />
        )}

        <View style={styles.spacer} />
        <SettingRow
          label={t('Kör test')}
          hint={t(
            "Bazı günler ritüel yerine eşit süreli bir bekleme gelir. Hangi gün olduğu ancak bittikten sonra söylenir; puanlar İstatistik'te karşılaştırılır."
          )}
          switchValue={settings.blindTest}
          onSwitchChange={(v) => updateSettings({ blindTest: v })}
        />

        {/* Sağlık verisi: varsayılan kapalı, tek dokunuşla açılıp
            kapanıyor. Açılırken izin diyaloğu çıkıyor; kullanıcı
            reddederse anahtar kendiliğinden geri kapanıyor, çünkü
            "açık ama veri yok" durumu yanıltıcı olurdu. */}
        {HEALTH_SUPPORTED && healthAvailable() ? (
          <SettingRow
            label={t('Sağlık verisi (Apple Sağlık)')}
            hint={
              healthOn
                ? t(
                    'Dün geceki uyku süren ve dinlenme nabzın okunuyor; az uyunmuş bir gecede reçeteye fazladan bir sakinleştirme turu ekleniyor. Sağlık uygulamasına hiçbir şey yazılmaz.'
                  )
                : t(
                    'Kapalı. Açarsan dün geceki uyku süren okunup reçeteni etkiler. Veri cihazından çıkmaz, hiçbir şey geri yazılmaz.'
                  )
            }
            switchValue={healthOn}
            onSwitchChange={(v) => void onHealthToggle(v)}
          />
        ) : null}

        <SettingRow
          label={t('Titreşimli geri bildirim')}
          switchValue={settings.haptics}
          onSwitchChange={(v) => updateSettings({ haptics: v })}
        />

        <SettingRow
          label={t('Günlük hatırlatıcı')}
          hint={
            settings.reminderEnabled
              ? t('Her gün {saat}', {
                  saat: formatTime(settings.reminderHour, settings.reminderMinute),
                })
              : t('Kapalı')
          }
          switchValue={settings.reminderEnabled}
          onSwitchChange={(v) => void onReminderToggle(v)}
        />
        {settings.reminderEnabled ? (
          <SettingRow
            label={t('Hatırlatma saati')}
            value={formatTime(settings.reminderHour, settings.reminderMinute)}
            hint={t('Dokunarak istediğin saati seç.')}
            onPress={openTimePicker}
          />
        ) : null}
        <SettingRow
          label={t('Akıllı hatırlatıcı')}
          hint={t(
            'Gün içinde değişen saatlerde kısa bir hatırlatma gönderir; her seferinde başka bir cümle. Sabit saatli günlük hatırlatıcıdan ayrıdır.'
          )}
          switchValue={settings.smartNudges}
          onSwitchChange={(v) => void onNudgeToggle(v)}
        />
        {settings.smartNudges ? (
          <>
            <View style={styles.spacer} />
            <SegmentedControl
              options={NUDGE_OPTIONS.map((o) => ({ ...o, label: t(o.label) }))}
              value={`${settings.nudgesPerDay}`}
              onChange={(v) => void onNudgeCountChange(v)}
            />
            <Text style={[styles.hint, { color: theme.faint }]}>
              {t('Hatırlatmalar 10:00 ile 21:00 arasına dağıtılır; saatleri her hafta değişir.')}
            </Text>
          </>
        ) : null}

        {/* 24 saatlik döngü. Mikrofon kullandığı için varsayılan kapalı ve
            ne yaptığı açıkça yazıyor: arka planda dinleyen hiçbir şey yok.

            Plus'a ait, çünkü sattığımız şey ölçüm: gün içi nefes ölçümü ve
            sabah raporu bu katmanın en pahalı parçası. Kapalı kademede
            anahtar hiç görünmüyor, yerine ne olduğunu anlatan bir satır
            duruyor — kilitli bir anahtar göstermek, dokunulduğunda hiçbir
            şey olmayan bir anahtar demek. */}
        {limits.dailyReport ? (
          <SettingRow
            label={t('24 saatlik döngü')}
            hint={t(
              'Gün içinde üç kez 45 saniyelik nefes ölçümü önerilir; ertesi sabah hepsi tek bir raporda toplanır. Mikrofon yalnızca ölçüm ekranı açıkken çalışır, arka planda hiçbir şey dinlenmez.'
            )}
            switchValue={settings.dailyCycle}
            onSwitchChange={(v) => void onDailyCycleToggle(v)}
          />
        ) : (
          <SettingRow
            label={t('24 saatlik döngü')}
            value={t('Kapalı')}
            hint={t(
              'Gün içinde üç kısa nefes ölçümü ve ertesi sabah tek bir rapor. {plan} ile açılır.',
              { plan: PLAN_NAME }
            )}
            onPress={() => navigation.navigate('Plans')}
          />
        )}
        {limits.dailyReport && settings.dailyCycle ? (
          <PressableScale
            onPress={() => {
              haptics.tap();
              navigation.navigate('DailyReport');
            }}
            accessibilityRole="button"
            style={styles.reportLink}
          >
            <Text style={[styles.reportLinkText, { color: theme.pulse }]}>
              {t('📊 Son 24 saatin raporunu aç')}
            </Text>
          </PressableScale>
        ) : null}

        {/*
          iOS ve Android'de seçici tamamen farklı davranıyor. Android'de
          sistem penceresi açılır ve sonucu bir kez döner. iOS'ta ise
          bileşen ağaca gömülü küçük bir alan olarak çizilir (ekranın
          ortasında beliren gri kutu buydu) ve çark çevrildikçe onChange
          yollar — her seferinde bildirimi yeniden kurmak, aynı saate
          birden fazla hatırlatıcı kalmasına yol açıyordu.
        */}
        {pickingTime && Platform.OS === 'android' ? (
          <DateTimePicker
            value={reminderDate()}
            mode="time"
            is24Hour
            display="default"
            onChange={(event, date) => void onTimePicked(event, date)}
          />
        ) : null}

        <Modal
          visible={pickingTime && Platform.OS === 'ios'}
          transparent
          animationType="fade"
          onRequestClose={() => setPickingTime(false)}
        >
          <Pressable style={styles.backdrop} onPress={() => setPickingTime(false)}>
            <Pressable
              style={[styles.sheet, { backgroundColor: theme.surface }]}
              onPress={() => {}}
            >
              <Text style={[styles.sheetTitle, { color: theme.text }]}>
                {t('Hatırlatma saati')}
              </Text>
              <DateTimePicker
                value={draftTime ?? reminderDate()}
                mode="time"
                is24Hour
                display="spinner"
                themeVariant={theme.blurTint}
                onChange={(_event, date) => {
                  if (date) setDraftTime(date);
                }}
              />
              <View style={styles.sheetRow}>
                <Text
                  style={[styles.sheetAction, { color: theme.sub }]}
                  accessibilityRole="button"
                  onPress={() => setPickingTime(false)}
                >
                  {t('Vazgeç')}
                </Text>
                <Text
                  style={[styles.sheetAction, { color: theme.pulse }]}
                  accessibilityRole="button"
                  onPress={() => {
                    const picked = draftTime ?? reminderDate();
                    setPickingTime(false);
                    haptics.tap();
                    void applyTime(picked);
                  }}
                >
                  {t('Tamam')}
                </Text>
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        {/* ---------------- Veri ---------------- */}
        <Text style={[styles.section, { color: theme.sub }]}>{t('VERİ')}</Text>
        <SettingRow
          label={t('Nasıl çalışır?')}
          onPress={() => navigation.navigate('HowItWorks')}
        />
        <SettingRow
          label={t('Hesabı ve tüm verileri sil')}
          hint={t(
            'Cihazdaki her kayıt silinir. Sunucu olmadığı için başka bir yerde kopyası yoktur.'
          )}
          destructive
          onPress={confirmReset}
        />

        {/* ---------------- Yasal ---------------- */}
        <Text style={[styles.section, { color: theme.sub }]}>{t('YASAL')}</Text>
        <SettingRow
          label={t('Gizlilik politikası')}
          onPress={() => navigation.navigate('Legal', { doc: 'privacy' })}
        />
        <SettingRow
          label={t('Hesap ve veri silme')}
          hint={t('Silme adımları ve kapsamı.')}
          onPress={() => navigation.navigate('Legal', { doc: 'dataDeletion' })}
        />
        {adsPrivacyOn ? (
          <SettingRow
            label={t('Reklam gizlilik tercihleri')}
            hint={t('Reklamlar için verdiğin rızayı değiştir.')}
            onPress={() => void showAdsPrivacyOptions()}
          />
        ) : null}

        <TransparencyPill
          light
          style={styles.pill}
          text={t('⚗️ Plasebo bir tedavi değildir ve hiçbir tıbbi desteğin yerine geçmez.')}
        />
        <Text style={[styles.version, { color: theme.faint }]}>
          {t('Plasebo · v{surum}', { surum: APP_VERSION })}
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 130 },
  title: { fontFamily: fonts.serif, fontSize: 30 },
  sub: { fontFamily: fonts.sans, fontSize: 12, marginTop: 4 },
  section: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 28,
    marginBottom: 10,
  },
  miniLabel: {
    fontFamily: fonts.sans,
    fontSize: 11,
    marginBottom: 8,
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: fonts.sans,
    fontSize: 15,
  },
  hint: { fontFamily: fonts.sans, fontSize: 11, lineHeight: 16, marginTop: 6 },
  spaced: { marginTop: 16 },
  spacer: { height: 14 },
  /* Rapor bağlantısı bir zamanlar `spacer` (sabit 14px) içindeydi ve
     yazı kutuya sığmadığı için yarısı kırpılıyordu. Yükseklik artık
     içeriğe bırakılıyor; dikey dolgu aynı zamanda dokunma alanını
     parmak boyuna çıkarıyor. */
  reportLink: { marginTop: 10, paddingVertical: 8 },
  reportLinkText: { fontFamily: fonts.sansMedium, fontSize: 13, lineHeight: 18 },
  pill: { marginTop: 24 },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  sheet: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    paddingTop: 18,
    paddingHorizontal: 18,
    paddingBottom: 8,
  },
  sheetTitle: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    textAlign: 'center',
  },
  sheetRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 24,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  sheetAction: {
    fontFamily: fonts.sansBold,
    fontSize: 14,
  },
  version: {
    fontFamily: fonts.sans,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 18,
  },
});
