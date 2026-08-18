import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { toISODate } from '../utils/storage';

/**
 * Bugünün tarihi — gün dönünce kendini tazeler.
 *
 * `toISODate()` doğrudan render içinde çağrıldığında tarih yalnızca bir
 * yeniden çizim olduğunda güncelleniyordu. Uygulamayı açık bırakıp ertesi
 * gün geri dönen kullanıcı, dünün formülünü ve "bugün tamamlandı"
 * durumunu görmeye devam ediyordu; seri çubuğu da dünkü hâlinde kalıyordu.
 *
 * Burada iki tetikleyici var: uygulama arka plandan öne geldiğinde
 * (`AppState`) ve ekran yeniden odaklandığında (sekme değişimi). İkisi de
 * yalnızca tarih gerçekten değiştiyse durum güncelliyor, yani gereksiz
 * çizim yapılmıyor.
 */
export function useToday(): string {
  const [today, setToday] = useState(toISODate);

  const sync = useCallback(() => {
    setToday((prev) => {
      const now = toISODate();
      return now === prev ? prev : now;
    });
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') sync();
    });
    return () => sub.remove();
  }, [sync]);

  useFocusEffect(sync);

  return today;
}
