import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../components/Screen';
import PressableScale from '../components/PressableScale';
import TransparencyPill from '../components/TransparencyPill';
import ParticleField from '../components/ParticleField';
import { colors } from '../constants/colors';
import { fonts } from '../constants/typography';
import { useUser } from '../context/UserContext';
import { useT } from '../context/SettingsContext';
import { haptics } from '../utils/haptics';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Name'>;

/** Kurulumun ilk adımı: uygulama önce adı sorar. */
export default function NameScreen({ navigation }: Props) {
  const { user, update } = useUser();
  const t = useT();
  const [name, setName] = useState(user.name);

  const trimmed = name.trim();

  const next = () => {
    haptics.tap();
    update({ name: trimmed });
    navigation.navigate('SignIn');
  };

  return (
    <Screen background={colors.ink} style={styles.container}>
      <ParticleField count={12} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.body}>
          <Text style={styles.eyebrow}>{t('KURULUM · 1/3')}</Text>
          <Text style={styles.title}>{t('Sana nasıl hitap edelim?')}</Text>
          <Text style={styles.sub}>
            {t(
              'Tek satırlık bir şey. Uygulama içinde seni bununla selamlayacak, başka hiçbir yere gitmeyecek.'
            )}
          </Text>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t('Örn. Deniz')}
            placeholderTextColor="rgba(255,255,255,0.28)"
            style={styles.input}
            maxLength={24}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={() => trimmed && next()}
          />

          <TransparencyPill
            style={styles.pill}
            text={t(
              '⚗️ Adın formülü değiştirmez. Hiçbir şey formülü değiştirmez — tarih hariç.'
            )}
          />
        </View>

        <PressableScale
          onPress={next}
          disabled={!trimmed}
          accessibilityRole="button"
          style={[styles.button, !trimmed && styles.buttonDisabled]}
        >
          <Text style={styles.buttonText}>{t('Devam')}</Text>
        </PressableScale>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 28 },
  flex: { flex: 1, justifyContent: 'center' },
  body: { flex: 1, justifyContent: 'center' },
  eyebrow: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    letterSpacing: 2,
    color: colors.haze,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 32,
    color: colors.white,
    marginTop: 10,
  },
  sub: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 21,
    color: colors.haze,
    marginTop: 12,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontFamily: fonts.sans,
    fontSize: 17,
    color: colors.white,
    marginTop: 28,
  },
  pill: { marginTop: 24 },
  button: {
    backgroundColor: colors.pulse,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    // Alt güvenli alan `Screen` tarafından ekleniyor.
    marginBottom: 20,
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: {
    fontFamily: fonts.sansBold,
    fontSize: 15,
    color: colors.white,
  },
});
