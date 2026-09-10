/**
 * Mağaza ekran görüntüsü kipi — yalnızca geliştirme derlemesinde.
 *
 * App Store ve Play listelemesindeki kareler uygulamanın kendisinden
 * alınmalı. İki engel vardı: giriş zorunlu (emülatörde Google hesabı
 * yok) ve yeni kurulmuş bir uygulamada gösterilecek geçmiş yok — seri,
 * ısı haritası ve istatistik ekranları boş çıkıyor.
 *
 * Bu kip ikisini de çözüyor: depoya sahte bir hesap, kurulum işareti ve
 * üç haftalık bir seans geçmişi yazıyor. Yazılan veri uygulamanın kendi
 * biçimlerinde; ekranlar gerçek kodla, gerçek formül motoruyla çiziliyor.
 * Yani kare "çizim" değil, uygulamanın kendisi.
 *
 * Açmak için `.env` dosyasına:
 *
 *   EXPO_PUBLIC_SCREENSHOT_MODE=1
 *
 * `__DEV__` koşulu yüzünden yayın derlemesinde **her zaman** kapalıdır;
 * TestFlight, App Store ve Play derlemeleri `__DEV__` içermez. Aynı
 * gerekçe `src/constants/devTier.ts` içindeki bayrak için de geçerli.
 *
 * Kip açıkken depo **her açılışta sıfırlanıp** yeniden yazılır: kareler
 * arasında uygulamayı kurcalamak (ritüel bitirmek, ayar değiştirmek)
 * geçmişi bozmasın, her seferinde aynı ekran çıksın diye.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateDailyFormula } from './formulaEngine';
import { toISODate } from './storage';
import type { Session, UserData } from '../types';

export const SCREENSHOT_MODE =
  __DEV__ && process.env.EXPO_PUBLIC_SCREENSHOT_MODE === '1';

/**
 * Karelerin Plus kademesinden mi alınacağı.
 *
 * Altı karttan dördü ücretsiz kademede çekilebiliyor; nefes analizi ve
 * ertesi sabah raporu Plus'a bağlı, satın alma ekranı ise ancak üyelik
 * *yokken* görünüyor. İkisi tek açılışta çekilemez, o yüzden kip iki
 * turlu: `.env` içindeki bu değer 1 yapılıp Metro yeniden başlatılınca
 * uygulama üyeliği açık bir kullanıcı gibi davranır.
 *
 * Yazılan yetki yalnızca yerel önbelleğe gider; mağaza cevap verirse söz
 * yine mağazanındır (bkz. `src/context/PremiumContext.tsx`). Emülatörde
 * mağaza yok, bu yüzden yazılan değer duruyor.
 */
const SCREENSHOT_PLUS = process.env.EXPO_PUBLIC_SCREENSHOT_PLUS === '1';

const ACCOUNT_KEY = '@plasebo/account';
const USER_KEY = '@plasebo/user';
const ONBOARDED_KEY = '@plasebo/onboarded';
const ENTITLEMENT_KEY = '@plasebo/entitlement';
const SETTINGS_KEY = '@plasebo/settings';

/** Karelerde görünecek ad. Gerçek bir kişiye ait değil. */
const NAME = 'Deniz';

/**
 * Ritüel yapılmayan günler (bugünden geriye kaç gün önce).
 *
 * Kesintisiz bir geçmiş ısı haritasını tek renk bir blok yapardı ve
 * gerçekçi olmazdı; boşluklar hem haritayı okunur kılıyor hem de seriyi
 * (dünden geriye dokuz gün) anlamlı bir sayıya oturtuyor.
 */
const GAPS = [10, 14, 17];

/** Kör testte "sahte" olarak işaretlenen günler. */
const SHAM = [3, 8, 13, 18];

/** Dört hedef sırayla dönüyor; arşiv tek hedefli görünmesin diye. */
const GOALS = ['focus', 'anxiety', 'sleep', 'energy'] as const;

function dateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return toISODate(d);
}

/**
 * Şikayet şiddeti (1-10, yüksek = kötü). Ritüel sonrası düşüyor ve
 * haftalar içinde iyileşme eğilimi var; sahte günlerde fark küçük
 * kalıyor — kör testin bir şey söyleyebilmesi için.
 */
function severities(offset: number, sham: boolean) {
  const wave = [7, 6, 8, 7, 6, 7, 8, 6][offset % 8];
  const before = Math.min(10, Math.max(3, wave));
  // Son haftada fark biraz açılıyor: istatistik ekranı iki dönemi
  // karşılaştırıyor ve düz bir seri orada "%9 düşüş" gibi rastgele bir
  // yöne savruluyordu. Sahte günlerde fark bilerek küçük kalıyor — kör
  // testin gerçek ile sahteyi ayırabilmesi buna bağlı.
  const drop = sham ? 1 : offset <= 7 ? 4 : 2;
  const after = Math.min(10, Math.max(1, before - drop));
  return { before, after };
}

function buildSessions(): Session[] {
  const out: Session[] = [];
  for (let offset = 20; offset >= 1; offset -= 1) {
    if (GAPS.includes(offset)) continue;
    const date = dateOffset(offset);
    const goal = GOALS[offset % GOALS.length];
    const sham = SHAM.includes(offset);
    const formula = generateDailyFormula(goal, date);
    const { before, after } = severities(offset, sham);
    out.push({
      id: `screenshot-${date}`,
      date,
      formulaId: formula.id,
      goal,
      score: Math.max(1, Math.min(10, 11 - after)),
      steps: formula.stepOrder,
      formulaName: formula.name,
      colorHex: formula.color.hex,
      sham,
      scoreBefore: before,
      scoreAfter: after,
      scoreAfterFromCamera: true,
      faceMoodBefore: before,
      faceMoodAfter: after,
      breathRegularity: 0.62 + (offset % 5) * 0.05,
      breathsPerMinute: 7 + (offset % 3),
      breathDepth: 0.55 + (offset % 4) * 0.06,
      durationSeconds: 130 + (offset % 7) * 6,
    });
  }
  return out;
}

/**
 * Depoyu ekran görüntüsü durumuna getirir. Sağlayıcılar depodan okumadan
 * önce, `App.tsx` içinde bir kez çağrılır.
 */
export async function seedScreenshotData(): Promise<void> {
  if (!SCREENSHOT_MODE) return;

  const sessions = buildSessions();
  const user: UserData = {
    name: NAME,
    goals: ['focus', 'sleep', 'anxiety', 'energy'],
    activeGoal: 'focus',
    // Dünden geriye kesintisiz dokuz gün (ilk boşluk 10 gün önce).
    streak: 9,
    lastRitualDate: dateOffset(1),
    sessions,
    freezeDates: [],
  };

  const YEAR_MS = 365 * 24 * 60 * 60 * 1000;
  await AsyncStorage.multiSet([
    [
      ACCOUNT_KEY,
      JSON.stringify({ mode: 'google', id: 'screenshot', name: NAME }),
    ],
    [ONBOARDED_KEY, '1'],
    [USER_KEY, JSON.stringify(user)],
    /*
     * Arayüz dili karede Türkçe olmalı. Varsayılan `system` cihazı
     * izliyor ve emülatör İngilizce; ayarı kipin kendisi sabitliyor ki
     * kare almadan önce elle Ayarlar'a girmek gerekmesin. Gün içi ölçüm
     * döngüsü de Plus turunda açılıyor — sabah raporu ekranı ona bağlı.
     */
    [
      SETTINGS_KEY,
      JSON.stringify({ language: 'tr', dailyCycle: SCREENSHOT_PLUS }),
    ],
    [
      ENTITLEMENT_KEY,
      JSON.stringify(
        SCREENSHOT_PLUS
          ? {
              plan: 'premium',
              packs: [],
              option: 'yearly',
              expiresAt: Date.now() + YEAR_MS,
            }
          : { plan: 'free', packs: [] }
      ),
    ],
  ]);
}
