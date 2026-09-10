# Plasebo tanitim sitesi (Firebase Hosting)

Bu klasor `https://plasebo-zihin-protokolu.web.app` adresinde yayinlanan
statik sitenin kaynagidir. Site, Gelisim Takip ile ayni Firebase projesi
(`gelisim-takip-7f1e3`) icinde AYRI bir Hosting sitesi olarak durur.

Neden var: AdMob, app-ads.txt dosyasini App Store urun sayfasindaki
"Gelistirici Web Sitesi" (ASC'deki Marketing URL) alan adinin KOKUNDE arar.
Plasebo'nun eski adresi `niinova22-blip.github.io/plasebo` bir proje sayfasi
oldugu icin kok dizin bize ait degildi; ayrica o GitHub Pages sitesi su anda
tamamen kapali.

Yeniden yayinlama:

    cd D:\Plasebo\site
    firebase deploy --only hosting --project gelisim-takip-7f1e3

Icerik:
  public/app-ads.txt  -> AdMob dogrulama satiri (pub-8209061391650271)
  public/index.html   -> basit tanitim sayfasi

Tasima yapildi (09.09.2026): `docs/privacy.html` ve `docs/data-deletion.html`
`public/` icine kopyalandi, index.html'deki baglantilar goreli adrese
cevrildi ve site yeniden yayinlandi. Dort dosya da HTTP 200:

  /                    -> tanitim ve destek sayfasi
  /privacy.html        -> gizlilik politikasi
  /data-deletion.html  -> veri silme talebi
  /app-ads.txt         -> AdMob dogrulama satiri

App Store Connect'teki Destek URL'si, Gizlilik Politikasi URL'si ve
Kullanici Gizlilik Tercihleri URL'si de bu adreslere cevrildi.

`docs/` altindaki dosyalar kaynak kabul edilir; biri degisirse `public/`
altindaki kopyasi da guncellenip site yeniden yayinlanmali.
