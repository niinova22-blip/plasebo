import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';
import { fonts } from '../constants/typography';

interface Props {
  /** Sol taraftaki renkli ikon kutusunun rengi. */
  swatch: string;
  icon: string;
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
      <View style={[styles.swatch, { backgroundColor: swatch }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
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
  swatch: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: { fontSize: 15 },
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
