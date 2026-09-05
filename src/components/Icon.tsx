import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import type { StyleProp, ViewStyle } from 'react-native';

/**
 * Arayüzün çizgi ikon seti.
 *
 * Uygulamanın kroniği (sekme çubuğu, formül adımları) daha önce emoji
 * kullanıyordu. Emoji üç yerde birden sorun çıkarıyordu:
 *
 *   1. **Renk.** Palet bilerek tek vurgu rengine indirilmişken emoji
 *      kendi çok renkli paletini getiriyor ve ekrandaki en gürültülü öge
 *      hâline geliyordu — göz önce onlara gidiyordu, oysa hiçbiri asıl
 *      içerik değil.
 *   2. **Tema.** Emoji rengi alamıyor; koyu ve aydınlık temada aynı
 *      kalıyor, ikisinde de yabancı duruyor.
 *   3. **Tutarlılık.** Glif her platformda (hatta iOS sürümleri arasında)
 *      farklı çiziliyor; boyu, ağırlığı ve dolgusu kontrol edilemiyor.
 *
 * Buradaki ikonlar 24×24 kutuda, dolgusuz, 1,5 birim kalınlıkta çizgiyle
 * çiziliyor ve rengini çağıran yerden alıyor. Böylece tema neyse ikon o
 * oluyor ve tipografiyle aynı ağırlıkta okunuyor.
 *
 * Yeni ikon eklerken: 24×24 kutuda kal, dolgu kullanma, uçları yuvarlat.
 */
export type IconName =
  | 'flask'
  | 'chart'
  | 'archive'
  | 'sliders'
  | 'droplet'
  | 'wave'
  | 'wind'
  | 'quote'
  | 'bolt'
  | 'camera'
  | 'chevronRight';

interface Props {
  name: IconName;
  /** Kenar uzunluğu. Varsayılan 22 — sekme çubuğu ve satır ikonları. */
  size?: number;
  color: string;
  /** Çizgi kalınlığı. 24'lük kutuya göre; büyük boyutta incelt. */
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
}

export default function Icon({
  name,
  size = 22,
  color,
  strokeWidth = 1.5,
  style,
}: Props) {
  const common: Common = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    fill: 'none',
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
      {paths(name, common)}
    </Svg>
  );
}

type Common = {
  stroke: string;
  strokeWidth: number;
  strokeLinecap: 'round';
  strokeLinejoin: 'round';
  fill: 'none';
};

function paths(name: IconName, c: Common) {
  switch (name) {
    // Formül sekmesi — imbik. Uygulamanın kendi işareti (⚗️) bu.
    case 'flask':
      return (
        <>
          <Path d="M9.5 3v6.2L5.1 17.6A2 2 0 0 0 6.9 20.6h10.2a2 2 0 0 0 1.8-3L14.5 9.2V3" {...c} />
          <Path d="M8 3h8" {...c} />
          <Path d="M7.4 14.4h9.2" {...c} />
        </>
      );

    // İstatistik — sütunlar ve taban çizgisi.
    case 'chart':
      return (
        <>
          <Path d="M4 20.5h16" {...c} />
          <Path d="M7.5 17.5V12" {...c} />
          <Path d="M12 17.5V5.5" {...c} />
          <Path d="M16.5 17.5V9" {...c} />
        </>
      );

    // Arşiv — kapaklı kutu.
    case 'archive':
      return (
        <>
          <Path d="M3.5 7.5h17v11a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" {...c} />
          <Path d="M2.8 3.5h18.4v4H2.8z" {...c} />
          <Path d="M10 12h4" {...c} />
        </>
      );

    // Ayarlar — sürgüler. Küçük boyutta dişli çarktan çok daha okunur:
    // dişlerin arası 22 pikselde kapanıp lekeye dönüşüyor.
    case 'sliders':
      return (
        <>
          <Path d="M4 7h16" {...c} />
          <Path d="M4 12h16" {...c} />
          <Path d="M4 17h16" {...c} />
          <Circle cx={9} cy={7} r={2.1} {...c} />
          <Circle cx={15} cy={12} r={2.1} {...c} />
          <Circle cx={8} cy={17} r={2.1} {...c} />
        </>
      );

    // Renk adımı — damla.
    case 'droplet':
      return <Path d="M12 3.6c0 0-5.8 6.1-5.8 10.1a5.8 5.8 0 0 0 11.6 0c0-4-5.8-10.1-5.8-10.1z" {...c} />;

    // Ses adımı — seviye çubukları.
    case 'wave':
      return (
        <>
          <Path d="M4 10.5v3" {...c} />
          <Path d="M8 7.5v9" {...c} />
          <Path d="M12 4.5v15" {...c} />
          <Path d="M16 8v8" {...c} />
          <Path d="M20 11v2" {...c} />
        </>
      );

    // Nefes adımı — rüzgâr.
    case 'wind':
      return (
        <>
          <Path d="M3.5 8.5h9a2.8 2.8 0 1 0-2.8-2.8" {...c} />
          <Path d="M3.5 13h11.5a2.8 2.8 0 1 1-2.8 2.8" {...c} />
          <Path d="M3.5 17.5h5" {...c} />
        </>
      );

    // Kelime adımı — tırnak.
    case 'quote':
      return (
        <>
          <Path d="M9.5 6.5C7 7.6 5.5 9.8 5.5 12.4v5.1h5v-5.1h-3" {...c} />
          <Path d="M18.5 6.5c-2.5 1.1-4 3.3-4 5.9v5.1h5v-5.1h-3" {...c} />
        </>
      );

    // Refleks — şimşek.
    case 'bolt':
      return <Path d="M13.2 2.8 5.5 13.4h5.6l-.3 7.8 7.7-10.6h-5.6z" {...c} />;

    case 'camera':
      return (
        <>
          <Path d="M3.5 8.5h3.2l1.6-2.4h7.4l1.6 2.4h3.2v10a1.6 1.6 0 0 1-1.6 1.6H5.1a1.6 1.6 0 0 1-1.6-1.6z" {...c} />
          <Circle cx={12} cy={13.6} r={3.4} {...c} />
        </>
      );

    case 'chevronRight':
      return <Path d="M9.5 5.5 16 12l-6.5 6.5" {...c} />;
  }
}
