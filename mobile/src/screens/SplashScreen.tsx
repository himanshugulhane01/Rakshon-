import React, { useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SeniorTheme } from '../theme';
import { StorageService, PreferencesKeys } from '../services/storage';

export interface SplashScreenProps {
  onReady: (destination: 'LanguageSelect' | 'Onboarding' | 'Login' | 'Home') => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onReady }) => {
  const { t, i18n } = useTranslation();

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

        // 2. Check onboarding status
        const onboardingCompleted = await StorageService.isOnboardingCompleted();

        // 3. Allow senior brief moment (800ms) to read reassuring logo & tagline
        await new Promise((resolve) => setTimeout(resolve, 800));

        if (!isMounted) return;

        // 4. Determine navigation target
        if (!savedLanguage) {
          // First launch: Prompt user to choose language
          onReady('LanguageSelect');
        } else if (!onboardingCompleted) {
          // Language chosen but onboarding not yet completed
          onReady('Onboarding');
        } else {
          // Returning user: Continue directly to Login
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
      <StatusBar barStyle="dark-content" backgroundColor={SeniorTheme.colors.backgroundMain} />

      <View style={styles.content}>
        {/* Shield Icon Emblem */}
        <View style={styles.emblemContainer}>
          <Text style={styles.emblemIcon}>🛡️</Text>
        </View>

        {/* Brand Name */}
        <Text style={styles.appName}>{t('common.appName')}</Text>

        {/* Tagline */}
        <Text style={styles.tagline}>{t('splash.tagline')}</Text>
        <Text style={styles.subTagline}>{t('splash.subTagline')}</Text>

        {/* Loading Indicator */}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={SeniorTheme.colors.richEmerald} />
          <Text style={styles.loadingText}>{t('splash.loading')}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SeniorTheme.colors.backgroundMain,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SeniorTheme.spacing.xl,
  },
  emblemContainer: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: SeniorTheme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SeniorTheme.spacing.lg,
    borderWidth: 3,
    borderColor: SeniorTheme.colors.emeraldLight,
    shadowColor: SeniorTheme.colors.deepForest,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  emblemIcon: {
    fontSize: 54,
  },
  appName: {
    fontSize: SeniorTheme.typography.headerLarge,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
    marginBottom: SeniorTheme.spacing.sm,
    textAlign: 'center',
  },
  tagline: {
    fontSize: SeniorTheme.typography.titleSmall,
    fontWeight: '700',
    color: SeniorTheme.colors.richEmerald,
    textAlign: 'center',
    marginBottom: SeniorTheme.spacing.xs,
  },
  subTagline: {
    fontSize: SeniorTheme.typography.bodySmall,
    color: SeniorTheme.colors.textDim,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  loadingContainer: {
    marginTop: SeniorTheme.spacing.xxl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: SeniorTheme.typography.bodySmall,
    color: SeniorTheme.colors.textDim,
    marginTop: SeniorTheme.spacing.sm,
    fontWeight: '600',
  },
});

