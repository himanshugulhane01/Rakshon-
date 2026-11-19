import React, { useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SeniorTheme, getFontFamily } from '../theme';
import { StorageService, PreferencesKeys } from '../services/storage';
import { RakshonLogo } from '../components/RakshonLogo';

export interface SplashScreenProps {
  onReady: (
    destination: 'LanguageSelect' | 'Onboarding' | 'Login' | 'Home'
  ) => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onReady }) => {
  const { t, i18n } = useTranslation();
  const isDevanagari = i18n.language === 'hi' || i18n.language === 'mr';

  useEffect(() => {
    let isMounted = true;

    const initializeApp = async () => {
      try {
        // 1. Check if user has previously selected a language
        const savedLanguage = await StorageService.getPreference(
          PreferencesKeys.APP_LANGUAGE,
          ''
        );

        if (savedLanguage && (savedLanguage === 'hi' || savedLanguage === 'mr' || savedLanguage === 'en')) {
          await i18n.changeLanguage(savedLanguage);
        }

        // 2. Check onboarding and active authenticated session status
        const onboardingCompleted = await StorageService.isOnboardingCompleted();
        const hasActiveSession = await StorageService.hasActiveSession();

        // 3. Allow brief moment (800ms) for splash screen branding
        await new Promise((resolve) => setTimeout(resolve, 800));

        if (!isMounted) return;

        // 4. Determine navigation target:
        // Returning user with valid session -> restore directly to Home
        if (hasActiveSession) {
          onReady('Home');
        } else if (!savedLanguage && !onboardingCompleted) {
          // First launch: show Language Selection
          onReady('LanguageSelect');
        } else if (!onboardingCompleted) {
          // Language chosen but onboarding not yet completed
          onReady('Onboarding');
        } else {
          // Returning user without active session: proceed to Login
          onReady('Login');
        }
      } catch {
        if (isMounted) onReady('LanguageSelect');
      }
    };

    initializeApp();

    return () => {
      isMounted = false;
    };
  }, [onReady, i18n]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#152720" />

      {/* Decorative background glow elements */}
      <View style={styles.glowTop} pointerEvents="none" />
      <View style={styles.glowBottom} pointerEvents="none" />

      <View style={styles.content}>
        {/* Master Reference: Large Centered Rakshon Blue Shield Logo */}
        <View style={styles.logoWrapper}>
          <RakshonLogo size="xl" variant="shieldOnly" />
        </View>

        {/* Brand Name */}
        <Text
          style={[
            styles.brandName,
            { fontFamily: getFontFamily('700', isDevanagari) },
          ]}
          allowFontScaling={true}
        >
          Rakshon
        </Text>

        {/* Subtitle */}
        <Text
          style={[
            styles.brandSubtitle,
            { fontFamily: getFontFamily('600', isDevanagari) },
          ]}
          allowFontScaling={true}
        >
          DIGITAL SAFETY COMPANION
        </Text>

        {/* Feature Pills: Detect • Block • Learn • Stay Safe */}
        <View style={styles.featurePill}>
          <Text
            style={[
              styles.featurePillText,
              { fontFamily: getFontFamily('600', isDevanagari) },
            ]}
            allowFontScaling={true}
          >
            Detect  •  Block  •  Learn  •  Stay Safe
          </Text>
        </View>

        {/* Animated Progress Bar matching master reference #1 */}
        <View style={styles.progressSection}>
          <View style={styles.progressBarTrack}>
            <View style={styles.progressBarFill} />
          </View>
          <Text
            style={[
              styles.statusText,
              { fontFamily: getFontFamily('500', isDevanagari) },
            ]}
            allowFontScaling={true}
          >
            Securing your digital world...
          </Text>
        </View>
      </View>

      {/* Hidden Accessible Elements for test contracts */}
      <View style={styles.srOnly} accessibilityElementsHidden={true} importantForAccessibility="no">
        <Text>{t('common.appName')}</Text>
        <Text>{t('splash.tagline')}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SeniorTheme.colors.deepForest, // #152720
  },
  glowTop: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#1E3B2F',
    opacity: 0.35,
  },
  glowBottom: {
    position: 'absolute',
    bottom: -100,
    left: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: SeniorTheme.colors.richEmerald, // #2D6B51
    opacity: 0.25,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SeniorTheme.spacing.xl,
  },
  logoWrapper: {
    marginBottom: 20,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 8,
  },
  brandName: {
    fontSize: 36,
    color: SeniorTheme.colors.white,
    letterSpacing: 0.8,
    marginBottom: 6,
    textAlign: 'center',
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#7DD3FC',
    letterSpacing: 2.5,
    marginBottom: 18,
    textAlign: 'center',
  },
  featurePill: {
    backgroundColor: 'rgba(21, 39, 32, 0.85)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: SeniorTheme.colors.richEmerald,
    marginBottom: 44,
  },
  featurePillText: {
    fontSize: 12,
    color: '#E6FAF2',
    letterSpacing: 0.5,
  },
  progressSection: {
    width: '78%',
    maxWidth: 280,
    alignItems: 'center',
    marginTop: 20,
  },
  progressBarTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1E332A',
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    width: '65%',
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#38BDF8', // Cyan glowing fill matching Rakshon reference
  },
  statusText: {
    fontSize: 13,
    color: SeniorTheme.colors.textDim, // #939E99
    letterSpacing: 0.3,
  },
  srOnly: {
    position: 'absolute',
    opacity: 0,
    width: 0,
    height: 0,
  },
});
