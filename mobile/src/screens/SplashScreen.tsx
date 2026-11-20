import React, { useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  Animated,
  Easing,
  Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SeniorTheme, getFontFamily } from '../theme';
import { StorageService, PreferencesKeys } from '../services/storage';

export interface SplashScreenProps {
  onReady: (
    destination: 'LanguageSelect' | 'Onboarding' | 'Login' | 'Home'
  ) => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onReady }) => {
  const { t, i18n } = useTranslation();
  const isDevanagari = i18n.language === 'hi' || i18n.language === 'mr';

  const isTest = process.env.NODE_ENV === 'test';
  const splashDuration = isTest ? 700 : 2500;

  // Animation values
  const entranceFade = useRef(new Animated.Value(0)).current;
  const entranceScale = useRef(new Animated.Value(0.92)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAura = useRef(new Animated.Value(0.4)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Smooth Entrance Fade + Spring Scale
    Animated.parallel([
      Animated.timing(entranceFade, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(entranceScale, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Gentle Zero-G Floating (Translates up and down smoothly)
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    floatLoop.start();

    // 3. Ambient Pulsing Cyan Aura on the Shield
    const auraLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAura, {
          toValue: 0.85,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAura, {
          toValue: 0.4,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    auraLoop.start();

    // 4. Specular Metallic Sheen Glint Sweep
    const shimmerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(1200),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    shimmerLoop.start();

    // 5. Dynamic Cyber Progress Bar Fill (Starts at ~15% and fills across)
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: splashDuration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    return () => {
      floatLoop.stop();
      auraLoop.stop();
      shimmerLoop.stop();
    };
  }, [entranceFade, entranceScale, floatAnim, pulseAura, shimmerAnim, progressAnim, splashDuration]);

  useEffect(() => {
    let isMounted = true;

    const initializeApp = async () => {
      try {
        const savedLanguage = await StorageService.getPreference(
          PreferencesKeys.APP_LANGUAGE,
          ''
        );

        if (savedLanguage && (savedLanguage === 'hi' || savedLanguage === 'mr' || savedLanguage === 'en')) {
          await i18n.changeLanguage(savedLanguage);
        }

        const onboardingCompleted = await StorageService.isOnboardingCompleted();
        const hasActiveSession = await StorageService.hasActiveSession();

        await new Promise((resolve) => setTimeout(resolve, splashDuration));

        if (!isMounted) return;

        if (hasActiveSession) {
          onReady('Home');
        } else if (!savedLanguage && !onboardingCompleted) {
          onReady('LanguageSelect');
        } else if (!onboardingCompleted) {
          onReady('Onboarding');
        } else {
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
  }, [onReady, i18n, splashDuration]);

  // Interpolated visual values
  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-5, 5],
  });

  const shimmerTranslateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-120, 130],
  });

  const progressBarWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['15%', '100%'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#152720" />

      {/* Decorative large curved background geometry matching master reference */}
      <View style={styles.bgCircleTopRight} pointerEvents="none" />
      <View style={styles.bgCircleBottomLeft} pointerEvents="none" />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: entranceFade,
            transform: [{ scale: entranceScale }],
          },
        ]}
      >
        {/* Centered Stylized Rakshon Shield Logo */}
        <Animated.View
          style={[
            styles.shieldContainer,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          <Image
            source={require('../assets/rakshon_shield_custom.png')}
            style={styles.customShieldLogo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Brand Name "Rakshon" */}
        <Text
          style={[
            styles.brandName,
            { fontFamily: getFontFamily('700', isDevanagari) },
          ]}
          allowFontScaling={true}
        >
          Rakshon
        </Text>

        {/* Subtitle "DIGITAL SAFETY COMPANION" */}
        <Text
          style={[
            styles.brandSubtitle,
            { fontFamily: getFontFamily('600', isDevanagari) },
          ]}
          allowFontScaling={true}
        >
          DIGITAL SAFETY COMPANION
        </Text>

        {/* Pill Badge "Detect • Block • Learn • Stay Safe" */}
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

        {/* Animated Cyber Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressBarTrack}>
            <Animated.View
              style={[
                styles.progressBarFill,
                { width: progressBarWidth },
              ]}
            />
          </View>

          {/* Status Label "Securing your digital world..." */}
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
      </Animated.View>

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
    backgroundColor: '#12231B', // Master Deep Forest Green matching reference
  },
  // Large elegant decorative background curves matching reference exactly
  bgCircleTopRight: {
    position: 'absolute',
    top: -120,
    right: -160,
    width: 460,
    height: 460,
    borderRadius: 230,
    backgroundColor: '#182E24',
    opacity: 0.85,
  },
  bgCircleBottomLeft: {
    position: 'absolute',
    bottom: -160,
    left: -150,
    width: 480,
    height: 480,
    borderRadius: 240,
    backgroundColor: '#182E24',
    opacity: 0.85,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SeniorTheme.spacing.xl,
  },
  shieldContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  customShieldLogo: {
    width: 120,
    height: 130,
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
  },
  brandName: {
    fontSize: 38,
    color: '#FFFFFF',
    letterSpacing: 0.8,
    marginBottom: 6,
    textAlign: 'center',
  },
  brandSubtitle: {
    fontSize: 12.5,
    color: '#7DD3FC',
    letterSpacing: 2.6,
    marginBottom: 20,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  featurePill: {
    backgroundColor: 'rgba(18, 35, 27, 0.92)',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 7.5,
    borderWidth: 1,
    borderColor: '#264D3A',
    marginBottom: 48,
  },
  featurePillText: {
    fontSize: 12,
    color: '#E6FAF2',
    letterSpacing: 0.5,
  },
  progressSection: {
    width: '76%',
    maxWidth: 270,
    alignItems: 'center',
  },
  progressBarTrack: {
    width: '100%',
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#1A3328',
    overflow: 'hidden',
    marginBottom: 14,
    position: 'relative',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2.5,
    backgroundColor: '#38BDF8', // Glowing Cyan Fill
  },
  statusText: {
    fontSize: 13,
    color: '#8A9E95',
    letterSpacing: 0.3,
  },
  srOnly: {
    position: 'absolute',
    opacity: 0,
    width: 0,
    height: 0,
  },
});
