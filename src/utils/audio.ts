import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import type { SoundId } from '../constants/formulaPools';

/**
 * Ses adımı için 5 saniyelik döngü dosyaları (scripts/generate-tones.js ile
 * üretiliyor). Loop açık olduğu için formülün istediği süre kadar çalar.
 */
const SOURCES: Record<SoundId, number> = {
  '40hz_gamma': require('../../assets/audio/40hz_gamma.wav'),
  '528hz_solfeggio': require('../../assets/audio/528hz_solfeggio.wav'),
  handpan: require('../../assets/audio/handpan.wav'),
  binaural_alpha: require('../../assets/audio/binaural_alpha.wav'),
  tibetan_bowl: require('../../assets/audio/tibetan_bowl.wav'),
  kalimba: require('../../assets/audio/kalimba.wav'),
  '432hz_verdi': require('../../assets/audio/432hz_verdi.wav'),
  wind_chimes: require('../../assets/audio/wind_chimes.wav'),
  warm_pad: require('../../assets/audio/warm_pad.wav'),
  binaural_theta: require('../../assets/audio/binaural_theta.wav'),
  deep_drone: require('../../assets/audio/deep_drone.wav'),
  crystal_chime: require('../../assets/audio/crystal_chime.wav'),
};

/** Arayüz sesleri — döngüsüz, tek atımlık. */
const UI_SOURCES = {
  tap: require('../../assets/audio/ui_tap.wav'),
} as const;

export type UiSound = keyof typeof UI_SOURCES;

let current: AudioPlayer | null = null;
/** Çalıp bitmeyi bekleyen tek atımlık sesler. */
const oneShots = new Set<AudioPlayer>();
const fades = new Set<ReturnType<typeof setInterval>>();
/** Sönümü süren, henüz kapatılmamış oynatıcılar. */
const fadingOut = new Set<AudioPlayer>();

const FADE_IN_MS = 500;
const FADE_OUT_MS = 350;
const STEP_MS = 25;

/**
 * Ses seviyesini yumuşakça değiştirir.
 *
 * Ton tam seviyeden başlatıldığında ya da anında kesildiğinde hoparlörde
 * "pat" diye bir tık duyuluyordu: dalga sıfırdan farklı bir noktadayken
 * bıçak gibi kesiliyor, bu da kulakta tıklama olarak algılanan ani bir
 * basınç sıçraması üretiyor. Başlangıçta ve bitişte kısa bir rampa bunu
 * tamamen ortadan kaldırıyor.
 */
function ramp(
  player: AudioPlayer,
  from: number,
  to: number,
  ms: number,
  onDone?: () => void
): void {
  const steps = Math.max(1, Math.round(ms / STEP_MS));
  let i = 0;
  try {
    player.volume = from;
  } catch {
    // Oynatıcı kapandıysa rampaya gerek yok.
  }
  const timer = setInterval(() => {
    i += 1;
    const t = Math.min(1, i / steps);
    try {
      player.volume = from + (to - from) * t;
    } catch {
      // yoksay
    }
    if (t >= 1) {
      clearInterval(timer);
      fades.delete(timer);
      onDone?.();
    }
  }, STEP_MS);
  fades.add(timer);
}

export async function prepareAudioMode(): Promise<void> {
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
    });
  } catch {
    // Ses modu ayarlanamazsa çalmayı yine de deneriz.
  }
}

/**
 * Kısa arayüz sesi çalar (düğme tıklaması gibi).
 *
 * Ritüel tonundan bağımsız çalışır: ritüel sesi çalarken de araya
 * girebilir, birbirlerini kesmezler. Ses seviyesi ayarlardan gelir —
 * "Kapalı" seçiliyse hiç çalmaz, çünkü kullanıcı sessiz istemiştir.
 */
export function playUiSound(name: UiSound, volume = 0.5): void {
  if (volume <= 0) return;
  try {
    const player = createAudioPlayer(UI_SOURCES[name]);
    player.volume = volume;
    player.play();
    oneShots.add(player);
    // Tek atımlık sesin bittiğini dinlemek yerine süresinden biraz
    // uzun bir süre sonra kapatıyoruz; dosya 0.25 saniye.
    setTimeout(() => {
      oneShots.delete(player);
      try {
        player.remove();
      } catch {
        // yoksay
      }
    }, 1200);
  } catch {
    // Ses açılamazsa arayüz sessiz çalışmaya devam eder.
  }
}

/** Verilen tonu döngüde başlatır. Önceki ses varsa yumuşakça kapatılır. */
export function playTone(type: SoundId, volume = 0.6): void {
  stopTone();
  try {
    const player = createAudioPlayer(SOURCES[type]);
    player.loop = true;
    player.volume = 0;
    player.play();
    current = player;
    ramp(player, 0, volume, FADE_IN_MS);
  } catch {
    // Ses cihazda açılamazsa ritüel sessiz devam eder.
    current = null;
  }
}

/**
 * Tonu kapatır. Varsayılan olarak kısa bir sönümle — `immediate` yalnızca
 * ekran tamamen kapanırken (unmount) kullanılır, orada rampayı bekletecek
 * bir bileşen kalmıyor.
 */
export function stopTone(immediate = false): void {
  const player = current;
  current = null;

  for (const timer of fades) clearInterval(timer);
  fades.clear();
  // Zamanlayıcıları iptal etmek, sönümü yarıda kalan oynatıcıyı açık
  // bırakırdı; onları burada elle kapatıyoruz.
  for (const stale of fadingOut) {
    try {
      stale.pause();
      stale.remove();
    } catch {
      // yoksay
    }
  }
  fadingOut.clear();

  if (!player) return;

  const finish = () => {
    fadingOut.delete(player);
    try {
      player.pause();
      player.remove();
    } catch {
      // yoksay
    }
  };

  if (immediate) {
    finish();
    return;
  }

  fadingOut.add(player);

  let from = 0.6;
  try {
    from = player.volume;
  } catch {
    // yoksay
  }
  ramp(player, from, 0, FADE_OUT_MS, finish);
}
