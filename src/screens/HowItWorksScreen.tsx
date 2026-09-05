import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../components/Screen';
import { colors } from '../constants/colors';
import { fonts } from '../constants/typography';
import { useT } from '../context/SettingsContext';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'HowItWorks'>;

const BLOCKS: { title: string; body: string }[] = [
  {
    title: 'Açık etiketli plasebo nedir?',
    body: 'Katılımcılara "bu bir plasebo" denildiği halde etkinin ortaya çıktığı çalışma türüne açık etiketli plasebo deniyor. Harvard Medical School bünyesindeki Program in Placebo Studies bu alandaki çalışmalarıyla biliniyor.',
  },
  {
    title: 'Plasebo ne yapar?',
    body: 'Ritüelin kendisi bir çerçeve kurar: durursun, bir şeye bakarsın, nefesini sayarsın. Uygulama bunun ötesinde bir şey iddia etmiyor.',
  },
  {
    title: 'Uygulama ne yapmaz?',
    body: 'Plasebo bir tedavi değildir, hiçbir şeyi iyileştirmez ve hiçbir tıbbi desteğin yerine geçmez. Bir rahatsızlığın varsa hekimine danış.',
  },
  {
    title: 'Formül nereden geliyor?',
    body: 'İki girdi var: günün tarihi ve seçtiğin aktif hedef. Tarihin karakterleri sayıya çevrilip toplanır, hedefin karakterleri de eklenir; çıkan tek sayı havuzlardan renk, ses, nefes tekniği, kelime ve o günkü uydurma bulguyu seçer. Hedef ayrıca adım sırasını belirler — kaygıda nefes başa geçer, uykuda ses başa geçer. Bilimsel bir hesap değil, sadece deterministik: aynı gün + aynı hedef her zaman aynı formülü verir.',
  },
  {
    title: 'Hedefi değiştirince ne oluyor?',
    body: 'Dört hedefin (odak, uyku, kaygı, enerji) her biri için her gün ayrı bir formül üretilir ve dördü de her zaman açıktır. Ana ekrandaki şeritten birine dokunduğunda o hedefin bugünkü formülü gelir; istediğin kadar geçiş yapabilir, aynı formülü istediğin kadar tekrar oynatabilirsin.',
  },
  {
    title: 'Kör test nedir?',
    body: 'Ayarlardan açarsan bazı günler sana renk, ses ya da nefes verilmez — sadece aynı süre beklersin. Hangi günün sahte olduğu ancak ritüel bittikten sonra söylenir. İstatistik ekranı gerçek ve sahte günlerin puan ortalamalarını karşılaştırır. Aradaki fark küçük çıkarsa bu da bir sonuçtur.',
  },
  {
    title: 'Nocebo: ters yönü de var',
    body: 'Beklenti iki yönlü çalışır. Bir şeyin sana kötü geleceğini düşünmek de gerçek şikâyet üretebilir; buna nocebo deniyor. Bu yüzden burada hiçbir şey "kötü gün" olarak etiketlenmiyor ve düşük puan bir başarısızlık gibi sunulmuyor.',
  },
  {
    title: 'Yüz ve nefes analizi ne yapıyor?',
    body: 'İki isteğe bağlı ölçüm var. Birincisi: durum bilgisi ekranında bir fotoğraf çekersen, telefonunda çalışan bir yapay zeka modeli yüz ifadeni yedi duyguya dağıtıyor ve reçeten buna göre yazılıyor. İkincisi: nefes adımında mikrofon, nefes verişlerinin ritmini dinleyip ne kadar düzenli olduğunu ölçüyor. İkisi de tamamen isteğe bağlı; kullanmazsan akış aynı şekilde işler.',
  },
  {
    title: 'Bu analizler ne kadar güvenilir?',
    body: 'Yüz modeli AffectNet adlı bir veri kümesiyle eğitildi ve tek bir kareden tahmin yapıyor — ışık, açı ve ifadenin belirginliği sonucu ciddi biçimde değiştirir; klinik bir teşhis değil. Nefes ölçümü ise ses seviyesinin ritmine bakar, nefes duyulmayacak kadar sessizse ya da ortamda başka ses varsa sayı uydurmak yerine "sinyal yakalanamadı" der. Nefes ölçümü puanın yerine geçmez, yanına konur.',
  },
  {
    title: 'Fotoğrafım ve sesim nereye gidiyor?',
    body: 'Hiçbir yere. Fotoğraf ve ses telefonun içinde işlenir, buluta gönderilmez ve saklanmaz; yalnızca çıkan sayı seansın kaydına yazılır. Model de uygulamanın içinde gömülü, çalışmak için internet gerekmiyor.',
  },
  {
    title: 'Verilerim nerede?',
    body: 'Ritüel geçmişin, puanların ve ölçümlerin telefonunda, yerel depolamada duruyor — sunucuya gönderilmiyor. Uygulamaya giriş için bir Google ya da Apple hesabı kullanılıyor; bu hesap yalnızca kimliğini doğrulamak için, ritüel verilerin oraya yüklenmiyor.',
  },
];

/**
 * Gerçek, açık etiketli plasebo çalışmaları.
 *
 * Uygulamanın uydurma "bulgularından" kesin biçimde ayrı tutulur:
 * kaynağıyla, neyi ölçtüğüyle ve **sınırlarıyla** birlikte verilir.
 * Sınır satırı bilerek var — bir çalışmayı olduğundan güçlü göstermek,
 * uygulamanın tüm iddiasını (hiçbir şey vaat etmemek) çürütürdü.
 */
const STUDIES: {
  title: string;
  meta: string;
  body: string;
  /** Çalışmanın göstermediği şey. */
  limit: string;
}[] = [
  {
    title: 'Huzursuz bağırsak sendromunda açık etiketli plasebo',
    meta: 'Kaptchuk ve ark. · PLoS ONE · 2010 · 80 katılımcı · 3 hafta',
    body: 'Alanın başlangıç noktası sayılan çalışma. Katılımcılara verilen hapın "etkin maddesi olmayan bir plasebo" olduğu açıkça söylendi; üstelik plasebonun nasıl işlediği de anlatıldı. Üç hafta sonunda bu grubun belirti puanları, hiçbir şey almayan bekleme listesi grubuna göre belirgin biçimde daha iyiydi.',
    limit: 'Karşılaştırma "hap yok" grubuyla yapıldı; yani ritüelin, ilgi görmenin ve beklentinin payı ayrıştırılamıyor.',
  },
  {
    title: 'Kronik bel ağrısında açık etiketli plasebo',
    meta: 'Carvalho ve ark. · PAIN · 2016 · 97 katılımcı · 3 hafta',
    body: 'Olağan tedavisine devam eden hastalara ek olarak, plasebo olduğu açıkça söylenen bir hap verildi. Üç hafta sonunda ağrı ve engellilik puanlarında yalnız olağan tedaviyi sürdüren gruba göre düşüş bildirildi. Aynı ekibin beş yıl sonraki takibi, hapı bırakanlarda etkinin sürmediğini gösterdi.',
    limit: 'Ağrı öz bildirimle ölçüldü ve katılımcılar hangi grupta olduklarını biliyordu; kör bir tasarım değil.',
  },
  {
    title: 'Kronik bel ağrısında yineleme',
    meta: 'Kleine-Borgmann ve ark. · PAIN · 2019 · 127 katılımcı · 3 hafta',
    body: 'Bağımsız bir ekip, Almanya\'da benzer bir tasarımı tekrarladı ve ağrı puanlarında küçük ama istatistiksel olarak anlamlı bir iyileşme buldu. Bir bulgunun başka bir ülkede, başka bir ekipçe tekrarlanabilmesi, tek bir çalışmadan çok daha değerlidir.',
    limit: 'Etki büyüklüğü küçüktü ve işlev/hareket ölçütlerinde anlamlı bir fark çıkmadı.',
  },
  {
    title: 'Alerjik nezlede açık etiketli plasebo',
    meta: 'Schaefer ve ark. · PLoS ONE · 2016 (ve 2018 yinelemesi)',
    body: 'Mevsimsel alerji belirtileri olan katılımcılara, plasebo olduğu söylenen bir hap verildi. Belirti şiddetinde tedavi görmeyen gruba kıyasla azalma bildirildi; ikinci çalışmada plasebonun mantığı anlatıldığında etkinin daha belirgin olduğu görüldü.',
    limit: 'Katılımcı sayısı azdı ve ölçüm tamamen öz bildirime dayanıyordu; alerjinin kendisi ölçülmedi.',
  },
  {
    title: 'Kanser sonrası yorgunlukta açık etiketli plasebo',
    meta: 'Hoenemeyer ve ark. · Scientific Reports · 2018 · 74 katılımcı',
    body: 'Kanser tedavisi bitmiş ama yorgunluğu süren kişilerde, plasebo olduğu açıkça söylenen hap üç hafta kullanıldı; yorgunluk puanlarında ve yorgunluğun günlük yaşamı etkileme derecesinde iyileşme bildirildi. Hapı bıraktıktan sonra da fark bir süre korundu.',
    limit: 'Yorgunluk öznel bir ölçüt; ayrıca katılımcılar çalışmaya gönüllü olarak katıldı, yani beklentileri baştan yüksek olabilir.',
  },
  {
    title: 'Etiketin kendisi bir etken: migren çalışması',
    meta: 'Kam-Hansen ve ark. · Science Translational Medicine · 2014 · 66 hasta, 459 atak',
    body: 'Aynı hap kutusuna farklı etiketler konarak denendi. "Plasebo" yazılı bir plasebo bile ağrıyı azaltırken, gerçek ilacın "plasebo" etiketiyle verilmesi etkisini düşürdü. Yani bir tedavinin nasıl sunulduğu, ne olduğu kadar sonuca karışıyor.',
    limit: 'Sonuç ilacın plasebo olduğunu değil, beklentinin ilacın etkisine eklendiğini gösterir.',
  },
  {
    title: 'Toplu değerlendirme: ne kadar, ne için?',
    meta: 'Meta-analizler · 2021 ve sonrası',
    body: 'Açık etiketli plasebo çalışmalarını bir araya getiren derlemeler, ağrı, yorgunluk, alerji ve bağırsak belirtileri gibi öz bildirimle ölçülen şikâyetlerde küçük–orta düzeyde bir etki bulur. Etki tutarlı ama küçüktür ve çalışmalar birbirine benzemez.',
    limit: 'Kan basıncı, kan şekeri, tümör boyutu gibi nesnel ölçütlerde bir yarar gösterilmiş değildir.',
  },
  {
    title: 'Nocebo: beklentinin ters yönü',
    meta: 'Barsky ve ark. · JAMA · 2002 · ve sonraki derlemeler',
    body: 'Kötü bir şey olacağı beklentisi, gerçek ve ölçülebilir şikâyet üretebilir: yan etki listesi okutulan plasebo gruplarında baş ağrısı, bulantı ve yorgunluk bildirimleri artar. Beklenti tek yönlü çalışmayan bir mekanizmadır.',
    limit: 'Bu yüzden bu uygulamada hiçbir gün "kötü" diye etiketlenmez ve düşük puan bir başarısızlık olarak sunulmaz.',
  },
  {
    title: 'Program in Placebo Studies',
    meta: 'Harvard Medical School / Beth Israel Deaconess Medical Center',
    body: 'Plasebo yanıtını inceleyen akademik program; yukarıdaki çalışmaların birçoğu bu çevreden çıktı. Uygulamanın "Harvard çalışması" diye andığı şey bu literatüre işaret eder — tek bir mucize çalışmaya değil.',
    limit: 'Bir programın varlığı bir kanıt değildir; kanıt tek tek çalışmalardadır ve yukarıda sınırlarıyla duruyor.',
  },
];

export default function HowItWorksScreen({ navigation }: Props) {
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

        <Text style={styles.title}>{t('Nasıl çalışır?')}</Text>
        <Text style={styles.lede}>{t('Kısa cevap: çalışmıyor. Uzun cevap aşağıda.')}</Text>

        {BLOCKS.map((block) => (
          <View key={block.title} style={styles.block}>
            <Text style={styles.blockTitle}>{t(block.title)}</Text>
            <Text style={styles.blockBody}>{t(block.body)}</Text>
          </View>
        ))}

        <Text style={styles.libraryTitle}>{t('Gerçek çalışmalar')}</Text>
        <Text style={styles.libraryIntro}>
          {t(
            'Uygulamanın içindeki "bulgular" uydurma. Aşağıdakiler değil — açık etiketli plasebo literatüründen gerçek çalışmalar. Her birinin altında neyi göstermediği de yazıyor; bir çalışmayı olduğundan güçlü anlatmak, bu uygulamanın tüm iddiasını çürütürdü.'
          )}
        </Text>

        {STUDIES.map((study) => (
          <View key={study.title} style={styles.study}>
            <Text style={styles.studyTitle}>{t(study.title)}</Text>
            <Text style={styles.studyMeta}>{t(study.meta)}</Text>
            <Text style={styles.studyBody}>{t(study.body)}</Text>
            <Text style={styles.studyLimit}>
              {t('Göstermediği:')} {t(study.limit)}
            </Text>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, paddingBottom: 60 },
  back: { alignSelf: 'flex-start', paddingVertical: 6, paddingRight: 12 },
  backText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.haze,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 30,
    color: colors.white,
    marginTop: 18,
  },
  lede: {
    fontFamily: fonts.serifItalic,
    fontSize: 14,
    color: colors.glow,
    marginTop: 8,
  },
  block: { marginTop: 26 },
  blockTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 13,
    color: colors.white,
  },
  blockBody: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 21,
    color: colors.haze,
    marginTop: 7,
  },
  libraryTitle: {
    fontFamily: fonts.serif,
    fontSize: 22,
    color: colors.white,
    marginTop: 40,
  },
  libraryIntro: {
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 19,
    color: colors.haze,
    marginTop: 8,
  },
  study: {
    marginTop: 18,
    borderLeftWidth: 2,
    borderLeftColor: colors.glow,
    paddingLeft: 12,
  },
  studyTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 12,
    color: colors.white,
  },
  studyMeta: {
    fontFamily: fonts.sans,
    fontSize: 10,
    color: colors.glow,
    marginTop: 3,
  },
  studyBody: {
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 19,
    color: colors.haze,
    marginTop: 6,
  },
  studyLimit: {
    fontFamily: fonts.sans,
    fontSize: 11,
    lineHeight: 17,
    color: colors.haze,
    opacity: 0.75,
    marginTop: 6,
  },
  pill: { marginTop: 34 },
});
