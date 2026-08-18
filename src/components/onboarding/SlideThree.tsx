import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Reveal from './Reveal';
import SlideShell from './SlideShell';
import HighlightText from './HighlightText';
import { colors } from '../../constants/colors';
import { fonts } from '../../constants/typography';
import { useT } from '../../context/SettingsContext';

interface Story {
  who: string;
  /** Cümle üç parçaya bölünüyor: şikâyet vurgusu ve sonuç vurgusu ayrı. */
  before: string;
  negative: string;
  middle: string;
  positive: string;
  after: string;
  accent: string;
}

/**
 * Temsili kullanıcı hikâyeleri.
 *
 * Bunlar gerçek kişiler değil, örnek senaryolardır — kartların altındaki
 * dipnot bunu söylüyor ve dipnot bilerek okunabilir boyutta tutuldu.
 */
const STORIES: Story[] = [
  {
    who: 'Mehmet, 34, İstanbul',
    before: 'Sınav öncesi ',
    negative: 'panik atak',
    middle: ' yaşıyordum. 3 hafta sonra sınav salonunda ',
    positive: 'sakin oturdum',
    after: '.',
    accent: colors.pulse,
  },
  {
    who: 'Ayşe, 28, Ankara',
    before: 'Sabahları yataktan kalkmak ',
    negative: 'çok zordu',
    middle: '. Şimdi 07:00’de gözlerim ',
    positive: 'kendiliğinden açılıyor',
    after: '.',
    accent: colors.glow,
  },
  {
    who: 'Can, 41, İzmir',
    before: 'Toplantı öncesi ellerim ',
    negative: 'titriyordu',
    middle: '. ',
    positive: 'Artık titremiyorlar',
    after: '.',
    accent: colors.warn,
  },
];

export default function SlideThree({ width, active }: { width: number; active: boolean }) {
  const t = useT();

  return (
    <SlideShell
      active={active}
      width={width}
      art={
        <View style={styles.art}>
          {STORIES.map((story, i) => (
            <Reveal
              key={story.who}
              active={active}
              delay={i * 200}
              offsetY={26}
              spring
              style={styles.cardWrap}
            >
              <View style={[styles.card, { borderColor: story.accent }]}>
                <Text style={styles.who}>👤 {t(story.who)}</Text>
                <View style={styles.rule} />
                <Text style={styles.text}>
                  {t(story.before)}
                  <HighlightText type="negative">{t(story.negative)}</HighlightText>
                  {t(story.middle)}
                  <HighlightText type="positive">{t(story.positive)}</HighlightText>
                  {story.after}
                </Text>
                <Text style={styles.noSubstance}>{t('⚗️ Etken madde kullanılmadı')}</Text>
              </View>
            </Reveal>
          ))}

          <Reveal active={active} delay={700} offsetY={10}>
            <Text style={styles.disclaimer}>{t('* Temsili kullanıcı hikâyeleri')}</Text>
          </Reveal>
        </View>
      }
      title={t('Böyle görünüyor.')}
      body={t('Mucize değil.\nBeyin kimyası.')}
    />
  );
}

const styles = StyleSheet.create({
  art: { alignSelf: 'stretch' },
  cardWrap: { marginBottom: 10 },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  who: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.white,
  },
  rule: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginVertical: 8,
  },
  text: {
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 19,
    color: colors.haze,
  },
  noSubstance: {
    fontFamily: fonts.sans,
    fontSize: 10,
    color: colors.haze,
    opacity: 0.7,
    marginTop: 8,
  },
  disclaimer: {
    fontFamily: fonts.sans,
    fontSize: 10,
    color: colors.haze,
    opacity: 0.6,
    marginTop: 2,
  },
});
