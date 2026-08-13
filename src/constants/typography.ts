import { Platform } from 'react-native';

/**
 * Font aileleri tek yerden yönetiliyor: fontlar App.tsx içinde
 * useFonts ile yüklendiği için isimler birebir paket sabitleriyle aynı.
 */
export const fonts = {
  serif: 'DMSerifDisplay_400Regular',
  serifItalic: 'DMSerifDisplay_400Regular_Italic',
  sans: 'SpaceGrotesk_400Regular',
  sansMedium: 'SpaceGrotesk_500Medium',
  sansBold: 'SpaceGrotesk_700Bold',
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }) as string,
} as const;
