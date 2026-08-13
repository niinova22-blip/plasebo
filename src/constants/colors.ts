export const colors = {
  ink: '#0E0E12',
  ghost: '#F7F6F2',
  mist: '#E8E6DF',
  haze: '#C5C2B8',
  pulse: '#7B6EF6',
  pulseSoft: '#EAE8FF',
  glow: '#A8FF78',
  warn: '#FF6B6B',
  text: '#2C2C35',
  sub: '#6B6B7A',
  white: '#FFFFFF',
} as const;

export type ColorName = keyof typeof colors;
