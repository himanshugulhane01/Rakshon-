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
import { SeniorTheme } from '../theme';
import { SeniorButton } from '../components/SeniorButton';
import { SeniorCard } from '../components/SeniorCard';
import { StorageService } from '../services/storage';

export interface OnboardingScreenProps {
  onComplete: () => void;
}

interface SlideContent {
  id: number;
  icon: string;
  titleKey: string;
  subtitleKey: string;
  descKey: string;
  featureBadge: string;
}

const ONBOARDING_SLIDES: SlideContent[] = [
  {
    id: 1,
    icon: '💬',
    titleKey: 'onboarding.slide1Title',
    subtitleKey: 'onboarding.slide1Subtitle',
    descKey: 'onboarding.slide1Desc',
    featureBadge: 'ZERO SMS PERMISSIONS',
  },
  {
    id: 2,
    icon: '📞',
    titleKey: 'onboarding.slide2Title',
    subtitleKey: 'onboarding.slide2Subtitle',
    descKey: 'onboarding.slide2Desc',
    featureBadge: 'OFFLINE THREAT SCREENING',
  },
  {
    id: 3,
    icon: '🚨',
    titleKey: 'onboarding.slide3Title',
    subtitleKey: 'onboarding.slide3Subtitle',
    descKey: 'onboarding.slide3Desc',
    featureBadge: 'NATIONAL HELPLINE 1930',
  },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const { t } = useTranslation();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);

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
      <StatusBar barStyle="dark-content" backgroundColor={SeniorTheme.colors.backgroundMain} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header Row with Skip Button */}
        <View style={styles.topRow}>
          <Text style={styles.appName}>{t('common.appName')}</Text>
          {!isLastSlide ? (
            <TouchableOpacity
              onPress={handleSkip}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={t('onboarding.skip')}
              accessibilityHint="Skips onboarding and continues to login"
              style={styles.skipButton}
            >
              <Text style={styles.skipText}>{t('onboarding.skip')}</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.skipPlaceholder} />
          )}
        </View>

        {/* Slide Card */}
        <SeniorCard variant="elevated" style={styles.slideCard}>
          {/* Large Senior-Friendly Icon Emblem */}
          <View style={styles.iconCircle}>
            <Text style={styles.slideIcon}>{currentSlide.icon}</Text>
          </View>

          {/* Feature Highlight Pill */}
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{currentSlide.featureBadge}</Text>
          </View>

          {/* Title */}
          <Text
            style={styles.slideTitle}
            accessible={true}
            accessibilityRole="header"
          >
            {t(currentSlide.titleKey)}
          </Text>

          {/* Subtitle */}
          <Text style={styles.slideSubtitle}>
            {t(currentSlide.subtitleKey)}
          </Text>

          {/* Description */}
          <Text style={styles.slideDesc}>
            {t(currentSlide.descKey)}
          </Text>
        </SeniorCard>

        {/* Bottom Navigation Area */}
        <View style={styles.bottomArea}>
          {/* Accessible Step Indicator Dots */}
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

          {/* Action Button: Continue or Get Started */}
          <SeniorButton
            title={isLastSlide ? t('onboarding.getStarted') : t('onboarding.continue')}
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
    backgroundColor: SeniorTheme.colors.backgroundMain,
  },
  scrollContent: {
    paddingHorizontal: SeniorTheme.spacing.lg,
    paddingVertical: SeniorTheme.spacing.md,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SeniorTheme.spacing.md,
  },
  appName: {
    fontSize: SeniorTheme.typography.titleMedium,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
    letterSpacing: 0.5,
  },
  skipButton: {
    minHeight: 48,
    minWidth: 64,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SeniorTheme.spacing.md,
  },
  skipPlaceholder: {
    minHeight: 48,
    minWidth: 64,
  },
  skipText: {
    fontSize: SeniorTheme.typography.body,
    fontWeight: '700',
    color: SeniorTheme.colors.textDim,
  },
  slideCard: {
    backgroundColor: SeniorTheme.colors.white,
    borderRadius: SeniorTheme.radii.lg,
    padding: SeniorTheme.spacing.xl,
    alignItems: 'center',
    marginVertical: SeniorTheme.spacing.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F0F9F5',
    borderWidth: 2.5,
    borderColor: SeniorTheme.colors.emeraldLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SeniorTheme.spacing.md,
  },
  slideIcon: {
    fontSize: 48,
  },
  badgeContainer: {
    backgroundColor: SeniorTheme.colors.backgroundMain,
    paddingHorizontal: SeniorTheme.spacing.md,
    paddingVertical: 4,
    borderRadius: SeniorTheme.radii.sm,
    borderWidth: 1,
    borderColor: SeniorTheme.colors.emeraldLight,
    marginBottom: SeniorTheme.spacing.md,
  },
  badgeText: {
    fontSize: SeniorTheme.typography.caption,
    fontWeight: '800',
    color: SeniorTheme.colors.richEmerald,
    letterSpacing: 0.8,
  },
  slideTitle: {
    fontSize: SeniorTheme.typography.titleLarge,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
    textAlign: 'center',
    marginBottom: SeniorTheme.spacing.xs,
  },
  slideSubtitle: {
    fontSize: SeniorTheme.typography.titleSmall,
    fontWeight: '700',
    color: SeniorTheme.colors.richEmerald,
    textAlign: 'center',
    marginBottom: SeniorTheme.spacing.md,
  },
  slideDesc: {
    fontSize: SeniorTheme.typography.body,
    color: SeniorTheme.colors.deepForest,
    opacity: 0.85,
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 320,
  },
  bottomArea: {
    marginTop: SeniorTheme.spacing.xl,
    paddingBottom: SeniorTheme.spacing.md,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SeniorTheme.spacing.lg,
  },
  dot: {
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeDot: {
    width: 28,
    backgroundColor: SeniorTheme.colors.richEmerald,
  },
  inactiveDot: {
    width: 10,
    backgroundColor: '#CBD5E1',
  },
  actionButton: {
    minHeight: SeniorTheme.dimensions.minTouchTarget + 8,
  },
});

