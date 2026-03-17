// Renk paleti — GüvendeKal v2 Premium Dark Theme
export const Colors = {
  // Arka plan katmanları
  bg0: '#07070d',        // En derin arka plan
  bg1: '#0d0d18',        // Ana ekran arka planı
  bg2: '#13131f',        // Kart arka planı
  bg3: '#1a1a2e',        // Elevated kart
  bg4: '#22223a',        // Input / hover

  // Vurgu renkleri
  red:        '#ff3b55',   // Ana tehlike kırmızısı
  redDark:    '#c0152a',
  redGlow:    'rgba(255,59,85,0.25)',
  redFaint:   'rgba(255,59,85,0.10)',

  orange:     '#ff8c42',
  green:      '#34d399',
  greenDark:  '#059669',
  blue:       '#60a5fa',

  // Metin
  textPrimary:   '#f0f0ff',
  textSecondary: '#8888aa',
  textMuted:     '#4a4a6a',

  // Kenarlık
  border:     'rgba(255,255,255,0.07)',
  borderSoft: 'rgba(255,255,255,0.04)',

  // Efektler
  glassWhite: 'rgba(255,255,255,0.05)',
  glassBorder:'rgba(255,255,255,0.10)',
  shadow:     'rgba(0,0,0,0.6)',
};

export const Fonts = {
  bold:   'System',
  medium: 'System',
  regular:'System',
};

export const Radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  full: 999,
};

export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  sosButton: {
    shadowColor: '#ff3b55',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 20,
  },
};
