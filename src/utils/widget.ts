import { File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';
import WidgetBridgeModule from '../../modules/widget-bridge/src/WidgetBridgeModule';
import type { StepKind } from '../types';

/**
 * Ana ekran widget'ının okuduğu özet.
 *
 * Widget'ın kendi formül mantığı yok: uygulama, her açılışında bugünün
 * özetini yazıyor, widget da yalnızca onu okuyor. Böylece formül motoru
 * tek bir yerde kalıyor — üç dilde üç kopya tutmak, üçünün zamanla
 * ayrışması demek olurdu.
 *
 * İki platformun paylaşım yolu farklı:
 *   Android → `files/widget.json` (bkz. `plugins/widget/PlaseboWidget.kt`)
 *   iOS     → App Group içindeki `UserDefaults` (bkz. `modules/widget-bridge`)
 * iOS'ta dosya kullanılamıyor, çünkü uygulama ile uzantı ayrı kum
 * havuzlarında çalışıyor ve birbirlerinin dosyalarını göremiyor.
 */
export interface WidgetSnapshot {
  /** Günün formülünün adı — widget'ın başlığı. */
  formula: string;
  /** Durum satırı: "Bugün tamamlandı" / "Bugün formülün hazır". */
  state: string;
  streak: number;
  /** Seri metni, çeviriden geçmiş hâliyle. */
  streakLabel: string;
  /**
   * Aşağıdaki alanlar widget'ın yeni düzeni için (halka + son 7 gün).
   * Hepsi ekranda gösterilecek hâliyle, çeviriden geçmiş olarak
   * gönderiliyor: widget'ın kendi mantığı ve kendi sözlüğü yok.
   */
  /** Bugünün ritüeli tamamlandı mı — halkanın dolu görünmesi buna bağlı. */
  doneToday: boolean;
  /** Adımlar tek satır: "renk · ses · nefes". */
  steps: string;
  /** Son 7 gün, eskiden yeniye; o gün ritüel yapıldıysa `true`. */
  last7: boolean[];
  /** "Gün" gibi halkanın altındaki kısa etiket. */
  dayLabel: string;
  /** Son seansın sonucu için hazır cümle; yoksa gönderilmiyor. */
  deltaLabel?: string;
}

const FILE_NAME = 'widget.json';

/**
 * Adımların widget'a sığan tek kelimelik adları.
 *
 * Ekranlardaki adım satırları renk adı, süre ve paket etiketi de
 * taşıyor; widget'ta bunların hiçbiri sığmıyor ve gerekmiyor — orada
 * yalnızca "bugün ne var" sorusunun cevabı duruyor.
 */
export const STEP_SHORT: Record<StepKind, string> = {
  color: 'renk',
  sound: 'ses',
  breath: 'nefes',
  word: 'kelime',
};

/**
 * Özeti diske yazar. Hata durumunda sessizce geçilir: widget bir kolaylık,
 * uygulamanın çalışmasının koşulu değil.
 */
export async function writeWidgetSnapshot(snapshot: WidgetSnapshot): Promise<void> {
  const json = JSON.stringify(snapshot);

  if (Platform.OS === 'ios') {
    try {
      WidgetBridgeModule?.writeSnapshot(json);
    } catch {
      // yoksay
    }
    return;
  }

  if (Platform.OS !== 'android') return;
  try {
    const file = new File(Paths.document, FILE_NAME);
    if (!file.exists) file.create({ intermediates: true });
    file.write(json);
  } catch {
    // yoksay
  }
}
