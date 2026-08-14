import { File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

/**
 * Ana ekran widget'ının okuduğu özet.
 *
 * Widget'ın kendi formül mantığı yok: uygulama, her açılışında bugünün
 * özetini `files/widget.json` dosyasına yazıyor, Kotlin tarafı da yalnızca
 * onu okuyor (bkz. `plugins/widget/PlaseboWidget.kt`). Böylece formül
 * motoru tek bir yerde kalıyor — iki dilde iki kopya tutmak, ikisinin
 * zamanla ayrışması demek olurdu.
 */
export interface WidgetSnapshot {
  /** Günün formülünün adı — widget'ın başlığı. */
  formula: string;
  /** Durum satırı: "Bugün tamamlandı" / "Bugün formülün hazır". */
  state: string;
  streak: number;
  /** Seri metni, çeviriden geçmiş hâliyle. */
  streakLabel: string;
}

const FILE_NAME = 'widget.json';

/**
 * Özeti diske yazar. Hata durumunda sessizce geçilir: widget bir kolaylık,
 * uygulamanın çalışmasının koşulu değil.
 */
export async function writeWidgetSnapshot(snapshot: WidgetSnapshot): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    const file = new File(Paths.document, FILE_NAME);
    if (!file.exists) file.create({ intermediates: true });
    file.write(JSON.stringify(snapshot));
  } catch {
    // yoksay
  }
}
