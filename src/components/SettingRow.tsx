import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { fonts } from '../constants/typography';
import { useTheme } from '../context/SettingsContext';
import PressableScale from './PressableScale';

export interface SettingRowProps {
  label: string;
  /** Sağda görünen değer ya da açıklama. */
  value?: string;
  hint?: string;
  onPress?: () => void;
  /** Verilirse satır bir anahtar (switch) olarak çizilir. */
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  destructive?: boolean;
}

export default function SettingRow({
  label,
  value,
  hint,
  onPress,
  switchValue,
  onSwitchChange,
  destructive,
}: SettingRowProps) {
  const theme = useTheme();
  const isSwitch = typeof switchValue === 'boolean';

  const content = (
    <View style={[styles.row, { backgroundColor: theme.surface }]}>
      <View style={styles.textWrap}>
        <Text
          style={[
            styles.label,
            { color: destructive ? theme.warn : theme.text },
          ]}
        >
          {label}
        </Text>
        {hint ? (
          <Text style={[styles.hint, { color: theme.sub }]}>{hint}</Text>
        ) : null}
      </View>

      {isSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: theme.border, true: theme.pulse }}
          thumbColor={theme.white}
        />
      ) : (
        <>
          {value ? (
            <Text style={[styles.value, { color: theme.sub }]}>{value}</Text>
          ) : null}
          {onPress ? (
            <Text style={[styles.chevron, { color: theme.faint }]}>›</Text>
          ) : null}
        </>
      )}
    </View>
  );

  if (!onPress || isSwitch) return content;

  return (
    <PressableScale onPress={onPress} pressedScale={0.98} accessibilityRole="button">
      {content}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    minHeight: 56,
  },
  textWrap: { flex: 1, paddingRight: 12 },
  label: { fontFamily: fonts.sansMedium, fontSize: 14 },
  hint: { fontFamily: fonts.sans, fontSize: 11, lineHeight: 16, marginTop: 3 },
  value: { fontFamily: fonts.sans, fontSize: 13 },
  chevron: { fontSize: 20, marginLeft: 8 },
});
