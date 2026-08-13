/**
 * Dışa açık yasal sayfalar.
 *
 * Kaynak dosyalar depodaki `docs/` klasöründedir. Bu adresler Google Play
 * konsolunda da birebir aynı şekilde girilir (Gizlilik politikası alanı ve
 * Veri güvenliği formundaki silme bağlantısı).
 *
 * Yayına almadan önce: GitHub deposunda Settings → Pages → Source = `main`
 * dalı / `docs` klasörü seçilmeli ve aşağıdaki adresler tarayıcıda
 * açıldığından emin olunmalıdır.
 */
const BASE = 'https://niinova22-blip.github.io/plasebo';

export const links = {
  privacy: `${BASE}/privacy.html`,
  dataDeletion: `${BASE}/data-deletion.html`,
  support: 'mailto:niinova22@gmail.com',
} as const;
