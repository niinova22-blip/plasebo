import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../components/Screen';
import TransparencyPill from '../components/TransparencyPill';
import { colors } from '../constants/colors';
import { fonts } from '../constants/typography';
import { LEGAL_DOCS } from '../constants/legal';
import { useT } from '../context/SettingsContext';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Legal'>;

/**
 * Gizlilik politikası ve veri silme metnini uygulama içinde gösterir.
 *
 * Önceden bu satırlar tarayıcıda GitHub Pages adresini açıyordu; sayfa
 * yayımlanmadığı için kullanıcı 404 görüyordu. Metin artık uygulamanın
 * içinde duruyor ve internet bağlantısı gerektirmiyor.
 */
export default function LegalScreen({ navigation, route }: Props) {
  const doc = LEGAL_DOCS[route.params.doc];
  const t = useT();

  return (
    <Screen background={colors.ink}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          style={styles.back}
        >
          <Text style={styles.backText}>{t('← Geri')}</Text>
        </Pressable>

        <Text style={styles.title}>{t(doc.title)}</Text>
        <Text style={styles.meta}>{t(doc.meta)}</Text>
        <Text style={styles.lede}>{t(doc.lede)}</Text>

        {doc.sections.map((section) => (
          <View key={section.heading} style={styles.section}>
            <Text style={styles.heading}>{t(section.heading)}</Text>

            {section.bullets?.map((bullet) => (
              <View key={bullet} style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{t(bullet)}</Text>
              </View>
            ))}

            {section.body?.map((paragraph) => (
              <Text key={paragraph} style={styles.body}>
                {t(paragraph)}
              </Text>
            ))}

            {section.callout ? (
              <View style={styles.callout}>
                <Text style={styles.calloutText}>{t(section.callout)}</Text>
              </View>
            ) : null}
          </View>
        ))}

        <TransparencyPill
          style={styles.pill}
          text={t('⚗️ Plasebo bir tedavi değildir ve hiçbir tıbbi desteğin yerine geçmez.')}
        />
        <Text style={styles.footer}>{t(doc.footer)}</Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, paddingBottom: 60 },
  back: { alignSelf: 'flex-start', paddingVertical: 6, paddingRight: 12 },
  backText: { fontFamily: fonts.sans, fontSize: 13, color: colors.haze },
  title: {
    fontFamily: fonts.serif,
    fontSize: 28,
    color: colors.white,
    marginTop: 18,
  },
  meta: {
    fontFamily: fonts.sans,
    fontSize: 10,
    color: colors.haze,
    opacity: 0.7,
    marginTop: 6,
  },
  lede: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 21,
    color: colors.mist,
    marginTop: 16,
  },
  section: { marginTop: 26 },
  heading: {
    fontFamily: fonts.sansBold,
    fontSize: 13,
    color: colors.white,
  },
  body: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 21,
    color: colors.haze,
    marginTop: 8,
  },
  bulletRow: { flexDirection: 'row', marginTop: 8 },
  bulletDot: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 21,
    color: colors.glow,
    marginRight: 8,
  },
  bulletText: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 21,
    color: colors.haze,
  },
  callout: {
    marginTop: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 14,
    padding: 14,
  },
  calloutText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 19,
    color: colors.mist,
  },
  pill: { marginTop: 32 },
  footer: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.haze,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 18,
  },
});
