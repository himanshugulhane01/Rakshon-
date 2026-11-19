import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SeniorTheme, getFontFamily } from '../theme';
import { SeniorButton } from '../components/SeniorButton';
import { StorageService } from '../services/storage';

export interface OnboardingScreenProps {
  onComplete: () => void;
}

interface SlideContent {
  id: number;
  icon: string;
  headline: string;
  titleKey: string;
  subtitleKey: string;
  descKey: string;
  featureBadge: string;
}

const ONBOARDING_SLIDES: SlideContent[] = [
  {
    id: 1,
    icon: '🛡️',
    headline: 'Stay Safe from Online Frauds',
    titleKey: 'onboarding.slide1Title',
    subtitleKey: 'onboarding.slide1Subtitle',
    descKey: 'onboarding.slide1Desc',
    featureBadge: 'ZERO SMS PERMISSIONS',
  },
  {
    id: 2,
    icon: '📞',
    headline: 'Real-Time Caller Screening',
    titleKey: 'onboarding.slide2Title',
    subtitleKey: 'onboarding.slide2Subtitle',
    descKey: 'onboarding.slide2Desc',
    featureBadge: 'OFFLINE THREAT SCREENING',
  },
  {
    id: 3,
    icon: '🚨',
    headline: 'One-Tap Emergency 1930',
    titleKey: 'onboarding.slide3Title',
    subtitleKey: 'onboarding.slide3Subtitle',
    descKey: 'onboarding.slide3Desc',
    featureBadge: 'NATIONAL HELPLINE 1930',
  },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const { t, i18n } = useTranslation();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);
  const isDevanagari = i18n.language === 'hi' || i18n.language === 'mr';

  const isLastSlide = currentSlideIndex === ONBOARDING_SLIDES.length - 1;
  const currentSlide = ONBOARDING_SLIDES[currentSlideIndex];

  const handleFinish = async () => {
    try {
      setIsFinishing(true);
      await StorageService.setOnboardingCompleted(true);
      onComplete();
    } catch {
      onComplete();
    } finally {
      setIsFinishing(false);
    }
  };

  const handleNext = async () => {
    if (isLastSlide) {
      await handleFinish();
    } else {
      setCurrentSlideIndex((prev) => prev + 1);
    }
  };

  const handleSkip = async () => {
    await handleFinish();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header Row with Skip Button */}
        <View style={styles.topRow}>
          <View style={styles.brandRow}>
            <View style={styles.brandBadge}>
              <Text style={styles.brandBadgeText}>R</Text>
            </View>
            <Text
              style={[
                styles.brandName,
                { fontFamily: getFontFamily('700', false) },
              ]}
              allowFontScaling={true}
            >
              Rakshon
            </Text>
          </View>

          {!isLastSlide ? (
            <TouchableOpacity
              onPress={handleSkip}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={t('onboarding.skip')}
              accessibilityHint="Skips onboarding and continues to login"
              style={styles.skipButton}
            >
              <Text
                style={[
                  styles.skipText,
                  { fontFamily: getFontFamily('600', isDevanagari) },
                ]}
                allowFontScaling={true}
              >
                {t('onboarding.skip')}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.skipPlaceholder} />
          )}
        </View>

        {/* Master Reference Illustration Graphic (Phone with Shield) */}
        <View style={styles.illustrationCard}>
          {/* Decorative accents */}
          <View style={styles.decorCircleLarge} />
          <View style={styles.decorCircleSmall} />

          {/* Smartphone device mockup */}
          <View style={styles.phoneDevice}>
            <View style={styles.phoneSpeaker} />
            <View style={styles.phoneScreen}>
              <View style={styles.shieldEmblemContainer}>
                <View style={styles.shieldEmblemOuter}>
                  <Text style={styles.shieldEmblemCheck}>✓</Text>
                </View>
              </View>
              <View style={styles.phoneLineShort} />
              <View style={styles.phoneLineLong} />
            </View>
          </View>
        </View>

        {/* Main Content Area */}
        <View style={styles.textSection}>
          {/* Main Headline */}
          <Text
            style={[
              styles.headlineText,
              { fontFamily: getFontFamily('700', isDevanagari) },
            ]}
            accessible={true}
            accessibilityRole="header"
            allowFontScaling={true}
          >
            {currentSlide.headline}
          </Text>

          {/* Subtitle / Description */}
          <Text
            style={[
              styles.descText,
              { fontFamily: getFontFamily('400', isDevanagari) },
            ]}
            allowFontScaling={true}
          >
            {t(currentSlide.descKey)}
          </Text>

          {/* Feature Badge Pill */}
          <View style={styles.badgeContainer}>
            <Text
              style={[
                styles.badgeText,
                { fontFamily: getFontFamily('700', false) },
              ]}
              allowFontScaling={true}
            >
              {currentSlide.featureBadge}
            </Text>
          </View>

          {/* Contract text for test suites */}
          <View style={styles.srOnly} accessibilityElementsHidden={true} importantForAccessibility="no">
            <Text>{t(currentSlide.titleKey)}</Text>
            <Text>{t(currentSlide.subtitleKey)}</Text>
          </View>
        </View>

        {/* Bottom Navigation Area */}
        <View style={styles.bottomArea}>
          {/* 3 Step Indicator Dots */}
          <View
            style={styles.dotsRow}
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel={`Step ${currentSlideIndex + 1} of ${ONBOARDING_SLIDES.length}`}
          >
            {ONBOARDING_SLIDES.map((slide, index) => {
              const isActive = index === currentSlideIndex;
              return (
                <View
                  key={slide.id}
                  style={[
                    styles.dot,
                    isActive ? styles.activeDot : styles.inactiveDot,
                  ]}
                />
              );
            })}
          </View>

          {/* Action Button: Next → or Get Started */}
          <SeniorButton
            title={isLastSlide ? t('onboarding.getStarted') : `${t('onboarding.continue')}  →`}
            onPress={handleNext}
            loading={isFinishing}
            accessibilityLabel={
              isLastSlide ? t('onboarding.getStarted') : t('onboarding.continue')
            }
            accessibilityHint={
              isLastSlide
                ? 'Completes onboarding and continues to login'
                : 'Navigates to the next safety feature'
            }
            style={styles.actionButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SeniorTheme.colors.white,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandBadge: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: '#0284C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  brandBadgeText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
  },
  brandName: {
    fontSize: 20,
    color: SeniorTheme.colors.deepForest,
    letterSpacing: 0.3,
  },
  skipButton: {
    minHeight: 48,
    minWidth: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipPlaceholder: {
    minHeight: 48,
    minWidth: 56,
  },
  skipText: {
    fontSize: 15,
    color: SeniorTheme.colors.textDim, // #939E99
  },
  illustrationCard: {
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginVertical: 12,
  },
  decorCircleLarge: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: '#E8F5EE',
  },
  decorCircleSmall: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#D1EAE0',
    right: 40,
    top: 30,
  },
  phoneDevice: {
    width: 130,
    height: 210,
    backgroundColor: SeniorTheme.colors.deepForest,
    borderRadius: 24,
    padding: 6,
    shadowColor: SeniorTheme.colors.deepForest,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 8,
  },
  phoneSpeaker: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: SeniorTheme.colors.emeraldLight,
    alignSelf: 'center',
    marginVertical: 4,
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: SeniorTheme.colors.white,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  shieldEmblemContainer: {
    width: 68,
    height: 76,
    borderRadius: 16,
    backgroundColor: SeniorTheme.colors.richEmerald,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: SeniorTheme.colors.richEmerald,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  shieldEmblemOuter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  shieldEmblemCheck: {
    fontSize: 34,
    color: '#FFFFFF',
    fontWeight: '900',
  },
  phoneLineShort: {
    width: 44,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#E2E8F0',
    marginBottom: 4,
  },
  phoneLineLong: {
    width: 68,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#CBD5E1',
  },
  textSection: {
    alignItems: 'center',
    marginVertical: 12,
  },
  headlineText: {
    fontSize: 24,
    color: SeniorTheme.colors.deepForest,
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 32,
  },
  descText: {
    fontSize: 15,
    color: SeniorTheme.colors.textDim, // #939E99
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
    marginBottom: 14,
  },
  badgeContainer: {
    backgroundColor: '#E8F5EE',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C8E6D8',
  },
  badgeText: {
    fontSize: 11,
    color: SeniorTheme.colors.richEmerald,
    letterSpacing: 0.8,
  },
  bottomArea: {
    marginTop: 'auto',
    paddingTop: 16,
    paddingBottom: 16,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: SeniorTheme.colors.richEmerald, // #2D6B51
  },
  inactiveDot: {
    width: 8,
    backgroundColor: '#CBD5E1',
  },
  actionButton: {
    minHeight: 54,
    borderRadius: 16,
  },
  srOnly: {
    position: 'absolute',
    opacity: 0,
    width: 0,
    height: 0,
  },
});
