import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Icon, { type IconName } from './Icon';
import { colors } from '../constants/colors';
import { fonts } from '../constants/typography';

interface Props {
  /**
   * Soldaki kutunun rengi.
   *
   * Yalnızca `icon` verilmediğinde, yani renk adımında kullanılıyor: o
   * satırda kutu bir ikon taşımıyor, doğrudan ritüelin rengini
   * gösteriyor.
   */
  swatch: string;
  /**
   * Kutunun içindeki çizgi ikon. Verilmezse kutu dolu bir renk örneği
   * olarak çiziliyor.
   */
  icon?: IconName;
  label: string;
  detail: string;
  duration: string;
  last?: boolean;
  /** Öğe bir içerik paketinden geliyorsa paketin adı. */
  tag?: string;
}

export default function FormulaStep({
  swatch,
  icon,
  label,
  detail,
  duration,
  last,
  tag,
}: Props) {
  return (
    <View style={[styles.row, last && styles.rowLast]}>
      {/* İki tür kutu var. Renk adımında kutu dolu ve rengin kendisi —
          örnek, sembol değil. Diğer adımlarda kutu yalnızca bir çerçeve,
          içinde çizgi ikon. Boyut ve köşe yarıçapı ikisinde de aynı, o
          yüzden satırlar hizadan çıkmıyor.

          Eskiden hepsi doluydu ve üstlerinde emoji vardı: dolgu rengi
          ses ve nefes adımlarında hiçbir şey anlatmıyordu (sabit birer
          vurgu tonuydu), emoji de kendi paletini getiriyordu. Kartta
          dört ayrı renk yan yana duruyor ve hiçbiri bilgi taşımıyordu. */}
      {icon ? (
        <View style={[styles.box, styles.boxOutlined]}>
          <Icon name={icon} size={17} color={colors.haze} strokeWidth={1.5} />
        </View>
      ) : (
        <View style={[styles.box, { backgroundColor: swatch }]} />
      )}
      <View style={styles.texts}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {/* Satın alınan paketin gerçekten bir karşılığı olduğu ancak
              burada görünüyor — içerik havuza karıştığı için başka yerde
              belli olmuyordu. */}
          {tag ? <Text style={styles.tag}>{tag}</Text> : null}
        </View>
        <Text style={styles.detail} numberOfLines={1}>
          {detail}
        </Text>
      </View>
      <Text style={styles.duration}>{duration}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  rowLast: { borderBottomWidth: 0 },
  box: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  boxOutlined: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  texts: { flex: 1 },
  labelRow: { flexDirection: 'row', alignItems: 'center' },
  label: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.white,
  },
  tag: {
    fontFamily: fonts.sansMedium,
    fontSize: 9,
    color: colors.ink,
    backgroundColor: colors.glow,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    overflow: 'hidden',
    marginLeft: 8,
  },
  detail: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.haze,
    marginTop: 2,
  },
  duration: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.glow,
    marginLeft: 10,
  },
});
