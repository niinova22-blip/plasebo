import { Share } from 'react-native';
import { translateFormulaName, type TranslateFn } from '../i18n';
import type { Formula } from '../types';

/**
 * Plasebo makbuzu.
 *
 * Ritüelin sonunda paylaşılabilen kısa metin. Uygulamanın tonuna sadık
 * kalır: hiçbir iyileşme iddiası yok, sadece ne yapıldığının kaydı.
 */
export function receiptText(params: {
  formula: Formula;
  score: number;
  streak: number;
  date: string;
  /** Makbuz da arayüzle aynı dilde paylaşılır. */
  t: TranslateFn;
}): string {
  const { formula, score, streak, date, t } = params;

  const lines = [
    t('⚗️ PLASEBO MAKBUZU'),
    '───────────────',
    t('Tarih:    {tarih}', { tarih: date }),
    t('Formül:   {formul}', { formul: translateFormulaName(formula.name, t) }),
  ];

  if (formula.sham) {
    lines.push(t('İçerik:   — (sahte ritüel, kör test)'));
  } else {
    lines.push(
      t('Renk:     {ad} · {sure} sn', {
        ad: t(formula.color.name),
        sure: formula.color.duration,
      }),
      t('Ses:      {ad} · {sure} sn', {
        ad: t(formula.sound.label),
        sure: formula.sound.duration,
      }),
      t('Nefes:    {ad} · {tur} tur', {
        ad: t(formula.breath.label),
        tur: formula.breath.rounds,
      }),
      t('Kelime:   {kelime}', { kelime: t(formula.word) })
    );
  }

  lines.push(
    t('Doz:      {doz}', {
      doz: formula.dose && formula.dose > 1 ? `${formula.dose}x` : t('tek'),
    }),
    '───────────────',
    t('Etkin madde: yok'),
    t('Hissettiğim: {puan}/10', { puan: score }),
    t('Seri:     {gun} gün', { gun: streak }),
    '',
    t('Bugün hiçbir şey yapmadım. İşe yaradı.'),
    t('— Plasebo · bilerek inan')
  );

  return lines.join('\n');
}

export async function shareReceipt(text: string): Promise<void> {
  try {
    await Share.share({ message: text });
  } catch {
    // Paylaşım penceresi açılamazsa sessizce geçilir.
  }
}
