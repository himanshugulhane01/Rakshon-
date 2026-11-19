/**
 * ScamShield / Rakshon Senior-Friendly Accessibility Theme
 * 
 * CORE APPROVED SIX-COLOUR PALETTE:
 * - Deep Forest:   #152720 (Headings, primary high-contrast text)
 * - Rich Emerald:  #2d6b51 (Brand identity, primary buttons, major CTA)
 * - Emerald Light: #4a9a79 (Accents, active indicators, interactive links)
 * - Background Main: #f8f9fa (Clean, glare-free light canvas background)
 * - Text Dim:      #939e99 (Subtle borders, dividers, secondary metadata)
 * - White:         #FFFFFF (Card surfaces, modals, button text)
 *
 * SEPARATE DOCUMENTED SEMANTIC RISK PALETTE (Exclusively for threat/risk communication):
 * - Danger:  #C62828 / #DC2626 on #FFEBEE / #FEF2F2 (High risk / scam alert / emergency)
 * - Warning: #B23B00 / #D97706 on #FFF3E0 / #FFFBEB (Caution / unverified callers)
 * - Safe:    #1B5E20 / #16A34A on #E8F5E9 / #F0FDF4 (Protected / verified legitimate)
 * - Structural Borders: #E2E8F0 / #CBD5E1 (Subtle component framing)
 */

export const Fonts = {
  english: {
    regular: 'PlusJakartaSans-Regular',
    medium: 'PlusJakartaSans-Medium',
    semiBold: 'PlusJakartaSans-SemiBold',
    bold: 'PlusJakartaSans-Bold',
  },
  devanagari: {
    regular: 'NotoSansDevanagari-Regular',
    medium: 'NotoSansDevanagari-Medium',
    semiBold: 'NotoSansDevanagari-SemiBold',
    bold: 'NotoSansDevanagari-Bold',
  },
};

/**
 * Returns the appropriate font family based on script and font weight.
 * Supports Android system fallback gracefully.
 */
export function getFontFamily(
  weight: '400' | '500' | '600' | '700' = '400',
  isDevanagari: boolean = false
): string {
  if (isDevanagari) {
    switch (weight) {
      case '700':
        return Fonts.devanagari.bold;
      case '600':
        return Fonts.devanagari.semiBold;
      case '500':
        return Fonts.devanagari.medium;
      default:
        return Fonts.devanagari.regular;
    }
  }
  switch (weight) {
    case '700':
      return Fonts.english.bold;
    case '600':
      return Fonts.english.semiBold;
    case '500':
      return Fonts.english.medium;
    default:
      return Fonts.english.regular;
  }
}

export const SeniorTheme = {
  colors: {
    // Approved Core Six-Colour Palette
    deepForest: '#152720',
    richEmerald: '#2d6b51',
    emeraldLight: '#4a9a79',
    backgroundMain: '#f8f9fa',
    textDim: '#939e99',
    white: '#FFFFFF',

    // Functional Semantic Mappings to Core Palette
    background: '#f8f9fa',
    surface: '#f8f9fa',
    screenBackground: '#f8f9fa',
    cardBackground: '#FFFFFF',
    textPrimary: '#152720',
    textSecondary: '#2d6b51',
    textTertiary: '#939e99',
    primaryButton: '#2d6b51',
    primaryButtonText: '#FFFFFF',
    border: '#E2E8F0',
    borderSubtle: '#CBD5E1',
    accent: '#4a9a79',

    // Documented Semantic Risk Palette (Risk communication only)
    riskDanger: '#C62828',
    riskDangerLight: '#DC2626',
    riskDangerSurface: '#FFEBEE',
    riskDangerBorder: '#EF5350',

    riskWarning: '#B23B00',
    riskWarningLight: '#D97706',
    riskWarningSurface: '#FFF3E0',
    riskWarningBorder: '#FFB74D',

    riskSafe: '#1B5E20',
    riskSafeLight: '#16A34A',
    riskSafeSurface: '#E8F5E9',
    riskSafeBorder: '#81C784',

    // Emergency Panic Button
    emergencyRed: '#B71C1C',
    emergencyText: '#FFFFFF',
  },

  typography: {
    // Standardized Refined Type Scale (sp)
    display: 30,       // 30sp, weight 700
    mainHeading: 26,   // 26sp, weight 700
    screenTitle: 22,   // 22sp, weight 600
    sectionTitle: 18,  // 18sp, weight 600
    cardTitle: 17,     // 17sp, weight 600
    button: 16,        // 16sp, weight 600
    helper: 14,        // 14sp, weight 400
    metadata: 13,      // 13sp, weight 500

    // Body scales with system font scaling support
    bodyRegular: 16,   // 16sp, weight 400
    body: 18,          // Senior default readable body
    bodySmall: 16,
    bodyLarge: 20,

    // Aliases for backwards compatibility with tests and screens
    caption: 14,
    titleSmall: 22,
    titleMedium: 26,
    titleLarge: 30,
    headerLarge: 34,
  },

  spacing: {
    xs: 4,
    sm: 8,
    base12: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },

  radii: {
    sm: 8,
    md: 12,
    lg: 16,
    input: 14,
    button: 16,
    card: 20,
    full: 9999,
  },

  shadows: {
    subtle: {
      shadowColor: '#152720',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 1,
    },
    card: {
      shadowColor: '#152720',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    button: {
      shadowColor: '#152720',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 4,
      elevation: 3,
    },
  },

  dimensions: {
    // Touch targets strictly >= 48dp
    minTouchTarget: 48,
    buttonHeight: 54,
    inputHeight: 56,
    headerHeight: 60,
    screenPadding: 20,
    cardRadius: 20,
    buttonRadius: 16,
  },
} as const;

export type ThemeColors = typeof SeniorTheme.colors;
export type ThemeTypography = typeof SeniorTheme.typography;
