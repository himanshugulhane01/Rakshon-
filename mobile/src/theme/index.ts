/**
 * ScamShield Senior-Friendly Accessibility Theme
 * 
 * CORE APPROVED SIX-COLOUR PALETTE:
 * - Deep Forest:   #152720 (Headings, primary high-contrast text)
 * - Rich Emerald:  #2d6b51 (Brand identity, primary buttons, major CTA)
 * - Emerald Light: #4a9a79 (Accents, active indicators, interactive links)
 * - Background Main: #f8f9fa (Clean, glare-free light canvas background)
 * - Text Dim:      #939e99 (Subtle borders, dividers, secondary metadata)
 * - White:         #FFFFFF (Card surfaces, modals, button text)
 *
 * SEPARATE SEMANTIC RISK PALETTE (Documented exclusively for risk communication):
 * - Danger:  #C62828 on #FFEBEE (High risk / scam alert / emergency)
 * - Warning: #B23B00 on #FFF3E0 (Caution / unverified callers)
 * - Safe:    #1B5E20 on #E8F5E9 (Protected / verified legitimate)
 */

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
    borderSubtle: '#939e99',
    accent: '#4a9a79',

    // Documented Semantic Risk Palette (Risk communication only)
    riskDanger: '#C62828',
    riskDangerSurface: '#FFEBEE',
    riskDangerBorder: '#EF5350',

    riskWarning: '#B23B00',
    riskWarningSurface: '#FFF3E0',
    riskWarningBorder: '#FFB74D',

    riskSafe: '#1B5E20',
    riskSafeSurface: '#E8F5E9',
    riskSafeBorder: '#81C784',

    // Emergency Panic Button
    emergencyRed: '#B71C1C',
    emergencyText: '#FFFFFF',
  },

  typography: {
    // Scalable senior typography scale (minimum 16sp, standard body 18sp+)
    caption: 14,
    bodySmall: 16,
    body: 18,
    bodyLarge: 20,
    titleSmall: 22,
    titleMedium: 26,
    titleLarge: 30,
    headerLarge: 34,
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },

  radii: {
    sm: 8,
    md: 12,
    lg: 16,
    full: 9999,
  },

  dimensions: {
    // Touch targets strictly >= 48dp (we use 52dp minimum)
    minTouchTarget: 52,
    buttonHeight: 56,
    inputHeight: 56,
    headerHeight: 64,
  },
} as const;

export type ThemeColors = typeof SeniorTheme.colors;
export type ThemeTypography = typeof SeniorTheme.typography;
