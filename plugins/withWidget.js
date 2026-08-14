/**
 * Ana ekran widget'ını Android projesine ekleyen Expo eklentisi.
 *
 * `android/` klasörü prebuild ile yeniden üretildiği için widget'ın
 * dosyaları depoda `plugins/widget/` altında duruyor; eklenti her
 * prebuild'de bunları yerine kopyalıyor ve manifeste alıcıyı (receiver)
 * yazıyor.
 *
 * Kopyalananlar:
 *   PlaseboWidget.kt            → app/src/main/java/com/plasebo/app/
 *   plasebo_widget.xml          → res/xml/            (widget tanımı)
 *   plasebo_widget_layout.xml   → res/layout/plasebo_widget.xml
 *   plasebo_widget_bg.xml       → res/drawable/       (zemin)
 * Ayrıca `res/values/strings.xml` içine varsayılan metinler eklenir.
 */
const {
  withAndroidManifest,
  withDangerousMod,
  withStringsXml,
  AndroidConfig,
} = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const SOURCE = 'plugins/widget';
const PACKAGE_DIR = path.join('app', 'src', 'main', 'java', 'com', 'plasebo', 'app');

function copy(from, toDir, toName) {
  fs.mkdirSync(toDir, { recursive: true });
  fs.copyFileSync(from, path.join(toDir, toName));
}

const withWidgetFiles = (config) =>
  withDangerousMod(config, [
    'android',
    (cfg) => {
      const root = cfg.modRequest.projectRoot;
      const android = cfg.modRequest.platformProjectRoot;
      const src = (name) => path.join(root, SOURCE, name);
      const res = path.join(android, 'app', 'src', 'main', 'res');

      copy(src('PlaseboWidget.kt'), path.join(android, PACKAGE_DIR), 'PlaseboWidget.kt');
      copy(src('plasebo_widget.xml'), path.join(res, 'xml'), 'plasebo_widget.xml');
      copy(
        src('plasebo_widget_layout.xml'),
        path.join(res, 'layout'),
        'plasebo_widget.xml'
      );
      copy(
        src('plasebo_widget_bg.xml'),
        path.join(res, 'drawable'),
        'plasebo_widget_bg.xml'
      );
      return cfg;
    },
  ]);

/** Widget'ın varsayılan metinleri — uygulama hiç açılmadıysa görünür. */
const withWidgetStrings = (config) =>
  withStringsXml(config, (cfg) => {
    const items = [
      { name: 'widget_default_title', value: 'Plasebo' },
      { name: 'widget_default_subtitle', value: 'Bugünün formülü için dokun' },
    ];
    for (const item of items) {
      cfg.modResults = AndroidConfig.Strings.setStringItem(
        [
          {
            _: item.value,
            $: { name: item.name, translatable: 'false' },
          },
        ],
        cfg.modResults
      );
    }
    return cfg;
  });

const withWidgetReceiver = (config) =>
  withAndroidManifest(config, (cfg) => {
    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(cfg.modResults);
    app.receiver = app.receiver ?? [];

    const exists = app.receiver.some(
      (r) => r.$?.['android:name'] === '.PlaseboWidget'
    );
    if (!exists) {
      app.receiver.push({
        $: {
          'android:name': '.PlaseboWidget',
          'android:exported': 'false',
          'android:label': 'Plasebo',
        },
        'intent-filter': [
          {
            action: [
              { $: { 'android:name': 'android.appwidget.action.APPWIDGET_UPDATE' } },
            ],
          },
        ],
        'meta-data': [
          {
            $: {
              'android:name': 'android.appwidget.provider',
              'android:resource': '@xml/plasebo_widget',
            },
          },
        ],
      });
    }
    return cfg;
  });

module.exports = (config) =>
  withWidgetReceiver(withWidgetStrings(withWidgetFiles(config)));
