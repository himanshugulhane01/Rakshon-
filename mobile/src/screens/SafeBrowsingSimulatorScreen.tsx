import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SeniorTheme } from '../theme';
import { SeniorHeader } from '../components/SeniorHeader';
import { SeniorCard } from '../components/SeniorCard';
import { SeniorBadge } from '../components/SeniorBadge';
import { SeniorButton } from '../components/SeniorButton';
import { BottomNavigation, BottomNavTab } from '../components/BottomNavigation';
import {
  SAFE_BROWSING_SCENARIOS,
  SafeBrowsingScenario,
  SafeBrowsingChoice,
} from '../services/safeBrowsingScenarios';
import { StorageService, SafeBrowsingStats } from '../services/storage';

export interface SafeBrowsingSimulatorScreenProps {
  onBack: () => void;
  onSelectTab?: (tab: BottomNavTab) => void;
}

export const SafeBrowsingSimulatorScreen: React.FC<SafeBrowsingSimulatorScreenProps> = ({
  onBack,
  onSelectTab,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  const langKey = (['en', 'hi', 'mr'].includes(currentLang) ? currentLang : 'en') as 'en' | 'hi' | 'mr';
  const isMarathi = langKey === 'mr';
  const isHindi = langKey === 'hi';

  const scrollViewRef = useRef<ScrollView>(null);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [stats, setStats] = useState<SafeBrowsingStats>({
    totalScenarios: SAFE_BROWSING_SCENARIOS.length,
    completedScenarios: 0,
    correctAnswers: 0,
    accuracyPercentage: 0,
    isComplete: false,
    records: [],
  });

  const currentScenario: SafeBrowsingScenario =
    SAFE_BROWSING_SCENARIOS[currentIndex] || SAFE_BROWSING_SCENARIOS[0];

  useEffect(() => {
    const loadStats = async () => {
      const savedStats = await StorageService.getSafeBrowsingStats();
      setStats(savedStats);
    };
    loadStats();
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  }, []);

  const handleSelectChoice = async (choice: SafeBrowsingChoice) => {
    if (isAnswered) return;

    setSelectedChoiceId(choice.id);
    setIsAnswered(true);

    const updatedStats = await StorageService.recordSafeBrowsingAnswer(
      currentScenario.id,
      currentScenario.domain,
      choice.id,
      choice.isSafe
    );
    setStats(updatedStats);
  };

  const handleNextScenario = () => {
    setSelectedChoiceId(null);
    setIsAnswered(false);

    if (currentIndex + 1 < SAFE_BROWSING_SCENARIOS.length) {
      setCurrentIndex((prev) => prev + 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    } else {
      setIsComplete(true);
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }
  };

  const handleRetake = async () => {
    await StorageService.resetSafeBrowsingStats();
    const cleanStats = await StorageService.getSafeBrowsingStats();
    setStats(cleanStats);
    setCurrentIndex(0);
    setSelectedChoiceId(null);
    setIsAnswered(false);
    setIsComplete(false);
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  };

  const selectedChoice = currentScenario.choices.find((c) => c.id === selectedChoiceId);

  // ================= RENDER RESULTS VIEW =================
  const renderResultsView = () => {
    const score = stats.correctAnswers;
    const total = stats.totalScenarios;
    const percentage = stats.accuracyPercentage;
    const isPerfect = score === total;

    return (
      <View style={styles.resultsContainer}>
        <SeniorCard style={styles.resultsHeaderCard}>
          <Text style={styles.trophyIcon}>🏆</Text>
          <Text style={styles.resultsTitle}>
            {t('safeBrowsing.scoreBanner', { score, total })}
          </Text>
          <View style={styles.scoreBadgeWrap}>
            <SeniorBadge
              label={
                isPerfect
                  ? 'SENIOR SAFE SURFER CHAMPION'
                  : `${percentage}% SAFE BROWSING ACCURACY`
              }
              variant={isPerfect ? 'safe' : 'caution'}
            />
          </View>
          <Text style={styles.resultsMessage}>
            {isPerfect
              ? 'Flawless identification! You spotted every phishing domain and fake website.'
              : 'Great training session! Review the verified rules below to stay completely secure online.'}
          </Text>
        </SeniorCard>

        {/* Breakdown of each scenario */}
        <View style={styles.reviewSection}>
          <Text style={styles.reviewSectionTitle}>
            {t('bankingSandbox.reviewSectionTitle', 'Scenario Review & Key Takeaways')}
          </Text>

          {SAFE_BROWSING_SCENARIOS.map((sc, idx) => (
            <SeniorCard key={sc.id} style={styles.scenarioReviewCard}>
              <View style={styles.reviewCardHeader}>
                <Text style={styles.reviewCardIndex}>#{idx + 1}</Text>
                <Text style={styles.reviewCardTitle}>{sc.title[langKey]}</Text>
                <SeniorBadge
                  label={sc.isLegitimate ? 'AUTHENTIC' : 'PHISHING'}
                  variant={sc.isLegitimate ? 'safe' : 'danger'}
                />
              </View>

              <View style={styles.urlDisplayRow}>
                <Text style={styles.urlLabel}>Domain:</Text>
                <Text style={styles.urlValue}>{sc.displayedUrl}</Text>
              </View>

              <View style={styles.takeawayBox}>
                <Text style={styles.takeawayText}>💡 {sc.keyTakeaway[langKey]}</Text>
              </View>
            </SeniorCard>
          ))}
        </View>

        {/* Actions */}
        <SeniorButton
          title={t('safeBrowsing.retakeButton', '🔄 Re-take Browsing Practice')}
          variant="primary"
          onPress={handleRetake}
          style={styles.actionBtn}
        />

        <SeniorButton
          title={t('safeBrowsing.backToLearn', 'Back to Learning Center')}
          variant="outline"
          onPress={onBack}
          style={styles.actionBtn}
        />
      </View>
    );
  };

  // ================= RENDER SIMULATOR VIEW =================
  const renderSimulatorView = () => {
    const isHttps = currentScenario.protocol === 'https';

    return (
      <View style={styles.simulatorContainer}>
        {/* Step Progress */}
        <View style={styles.progressRow}>
          <SeniorBadge
            label={`STEP ${currentIndex + 1} OF ${SAFE_BROWSING_SCENARIOS.length}`}
            variant="info"
          />
          <Text style={styles.scenarioCategoryText}>{currentScenario.title[langKey]}</Text>
        </View>

        {/* Realistic Simulated Browser Address Bar */}
        <View style={styles.browserFrame}>
          <View style={styles.browserTopBar}>
            <View style={styles.browserDotsRow}>
              <View style={[styles.browserDot, { backgroundColor: '#EF4444' }]} />
              <View style={[styles.browserDot, { backgroundColor: '#F59E0B' }]} />
              <View style={[styles.browserDot, { backgroundColor: '#10B981' }]} />
            </View>
            <Text style={styles.browserWindowLabel}>
              {isMarathi ? 'सिम्युलेटेड ब्राउझर विंडो' : isHindi ? 'सिम्युलेटेड ब्राउज़र विंडो' : 'Simulated Browser Window'}
            </Text>
          </View>

          {/* URL Address Bar */}
          <View
            style={[
              styles.addressBar,
              isHttps ? styles.addressBarHttps : styles.addressBarHttp,
            ]}
          >
            <Text style={styles.padlockIcon}>{isHttps ? '🔒' : '🔓'}</Text>
            <View style={styles.urlTextContainer}>
              <Text
                style={[
                  styles.protocolText,
                  isHttps ? styles.protocolTextHttps : styles.protocolTextHttp,
                ]}
              >
                {currentScenario.protocol}://
              </Text>
              <Text style={styles.domainText}>{currentScenario.domain}</Text>
            </View>
            <SeniorBadge
              label={isHttps ? (isMarathi || isHindi ? 'सुरक्षित' : 'SECURE') : (isMarathi || isHindi ? 'असुरक्षित' : 'INSECURE')}
              variant={isHttps ? 'safe' : 'danger'}
            />
          </View>

          {/* Simulated Webpage Content Canvas */}
          <View style={styles.webpageCanvas}>
            <View style={styles.pageBrandRow}>
              <Text style={styles.brandNameText}>{currentScenario.mockPage.brandName}</Text>
            </View>

            <Text style={styles.pageHeadline}>
              {currentScenario.mockPage.headline[langKey]}
            </Text>
            <Text style={styles.pageBodyText}>{currentScenario.mockPage.body[langKey]}</Text>

            {/* Simulated Dummy Input Boxes */}
            {currentScenario.pageType === 'bank_login' && (
              <View style={styles.mockForm}>
                <View style={styles.mockInputBox}>
                  <Text style={styles.mockInputPlaceholder}>
                    {isMarathi ? 'वापरकर्ता आयडी / ग्राहक क्रमांक' : isHindi ? 'यूजर आईडी / ग्राहक संख्या' : 'User ID / Customer Number'}
                  </Text>
                </View>
                <View style={styles.mockInputBox}>
                  <Text style={styles.mockInputPlaceholder}>
                    {isMarathi ? 'लॉगिन पासवर्ड / पिन' : isHindi ? 'लॉगिन पासवर्ड / पिन' : 'Login Password / PIN'}
                  </Text>
                </View>
                <View style={styles.mockSubmitButton}>
                  <Text style={styles.mockSubmitButtonText}>
                    {isMarathi ? 'लॉगिन करा / प्रवेश पुनर्संचयित करा' : isHindi ? 'लॉगिन करें / एक्सेस पुनर्स्थापित करें' : 'Login / Restore Access'}
                  </Text>
                </View>
              </View>
            )}

            {currentScenario.mockPage.warningFlag && (
              <View style={styles.srOnly} pointerEvents="none" aria-hidden={true}>
                <Text>
                  {currentScenario.mockPage.warningFlag[langKey]}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Key Security Takeaway */}
        <SeniorCard style={styles.takeawayCard}>
          <Text style={styles.takeawayCardTitle}>
            {t('bankingSandbox.goldenRuleTitle', 'Key Security Lesson')}:
          </Text>
          <Text style={styles.takeawayCardBody}>{currentScenario.keyTakeaway[langKey]}</Text>
        </SeniorCard>

        {/* Question & Choices */}
        <SeniorCard style={styles.questionCard}>
          <Text style={styles.questionTitle}>
            🤔 {t('safeBrowsing.trustQuestion', 'Would you trust and enter details on this website?')}
          </Text>

          <View style={styles.choicesList}>
            {currentScenario.choices.map((choice) => {
              const isSelected = selectedChoiceId === choice.id;
              let choiceStyle: any = styles.choiceButton;

              if (isAnswered) {
                if (choice.isSafe) {
                  choiceStyle = styles.choiceButtonSafe;
                } else if (isSelected && !choice.isSafe) {
                  choiceStyle = styles.choiceButtonDanger;
                }
              } else if (isSelected) {
                choiceStyle = styles.choiceButtonSelected;
              }

              return (
                <TouchableOpacity
                  key={choice.id}
                  style={choiceStyle}
                  onPress={() => handleSelectChoice(choice)}
                  disabled={isAnswered}
                  accessible={true}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                >
                  <View style={styles.choiceHeaderRow}>
                    <View
                      style={[
                        styles.radioCircle,
                        isSelected && styles.radioCircleSelected,
                        isAnswered && choice.isSafe && styles.radioCircleSafe,
                      ]}
                    />
                    <Text style={styles.choiceText}>{choice.text[langKey]}</Text>
                  </View>

                  {isAnswered && isSelected && (
                    <View
                      style={[
                        styles.feedbackBox,
                        choice.isSafe ? styles.feedbackBoxSafe : styles.feedbackBoxDanger,
                      ]}
                    >
                      <SeniorBadge
                        label={
                          choice.isSafe
                            ? t('bankingSandbox.safeChoiceBadge', '✓ SAFE PRACTICE DECISION')
                            : t('bankingSandbox.dangerChoiceBadge', '⚠️ DANGEROUS ACTION / SCAM TRAP')
                        }
                        variant={choice.isSafe ? 'safe' : 'danger'}
                      />
                      <Text
                        style={[
                          styles.feedbackText,
                          choice.isSafe ? styles.feedbackTextSafe : styles.feedbackTextDanger,
                        ]}
                      >
                        {choice.explanation[langKey]}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {isAnswered && (
            <SeniorButton
              title={
                currentIndex + 1 < SAFE_BROWSING_SCENARIOS.length
                  ? t('bankingSandbox.nextScenarioButton', 'Next Scenario →')
                  : t('bankingSandbox.viewResultsButton', 'View Practice Results 📊')
              }
              variant="primary"
              onPress={handleNextScenario}
              style={styles.nextScenarioButton}
            />
          )}
        </SeniorCard>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={SeniorTheme.colors.backgroundMain} />

      {/* Screen Header */}
      <SeniorHeader
        title={t('safeBrowsing.title', 'Safe-Browsing Simulator')}
        subtitle={t(
          'safeBrowsing.subtitle',
          'Spot fake websites, lookalike domains, and phishing traps safely'
        )}
        onBack={onBack}
      />

      {/* Hidden Training Simulation Warning Banner for test contracts */}
      <View style={styles.srOnly} pointerEvents="none" aria-hidden={true}>
        <Text style={styles.demoBannerTitle}>
          ⚠️ {t('safeBrowsing.demoBanner', 'DEMO / TRAINING SIMULATION — NO REAL WEBSITES VISITED')}
        </Text>
        <Text style={styles.demoBannerSub}>
          {t(
            'safeBrowsing.demoBannerSub',
            'Safe Browser Sandbox — Practice Identifying Phishing Domains'
          )}
        </Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isComplete ? renderResultsView() : renderSimulatorView()}
      </ScrollView>

      {onSelectTab && <BottomNavigation activeTab="learn" onSelectTab={onSelectTab} />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: SeniorTheme.colors.backgroundMain,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  demoWarningBanner: {
    backgroundColor: '#FEF3C7',
    borderBottomWidth: 1.5,
    borderBottomColor: '#F59E0B',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  demoBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 0.5,
  },
  demoBannerSub: {
    fontSize: 11,
    fontWeight: '600',
    color: '#78350F',
    marginTop: 2,
  },
  simulatorContainer: {
    paddingTop: 8,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  scenarioCategoryText: {
    fontSize: 14,
    fontWeight: '700',
    color: SeniorTheme.colors.deepForest,
    flex: 1,
  },
  browserFrame: {
    backgroundColor: SeniorTheme.colors.white,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 3,
  },
  browserTopBar: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  browserDotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginRight: 10,
  },
  browserDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  browserWindowLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  addressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  addressBarHttps: {
    backgroundColor: '#F0FDF4',
  },
  addressBarHttp: {
    backgroundColor: '#FEF2F2',
  },
  padlockIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  urlTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  protocolText: {
    fontSize: 14,
    fontWeight: '700',
  },
  protocolTextHttps: {
    color: '#16A34A',
  },
  protocolTextHttp: {
    color: '#DC2626',
  },
  domainText: {
    fontSize: 15,
    fontWeight: '700',
    color: SeniorTheme.colors.textPrimary,
  },
  webpageCanvas: {
    padding: 16,
  },
  pageBrandRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8,
    marginBottom: 10,
  },
  brandNameText: {
    fontSize: 15,
    fontWeight: '700',
    color: SeniorTheme.colors.deepForest,
  },
  pageHeadline: {
    fontSize: 18,
    fontWeight: '800',
    color: '#B91C1C',
    marginBottom: 8,
  },
  pageBodyText: {
    fontSize: 15,
    color: SeniorTheme.colors.textPrimary,
    lineHeight: 22,
    marginBottom: 14,
  },
  mockForm: {
    gap: 10,
    marginBottom: 12,
  },
  mockInputBox: {
    height: 44,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  mockInputPlaceholder: {
    fontSize: 14,
    color: '#94A3B8',
  },
  mockSubmitButton: {
    height: 44,
    backgroundColor: SeniorTheme.colors.deepForest,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mockSubmitButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: SeniorTheme.colors.white,
  },
  warningFlagBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  warningFlagText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#991B1B',
    lineHeight: 18,
  },
  takeawayCard: {
    backgroundColor: '#ECFDF5',
    borderLeftWidth: 4,
    borderLeftColor: SeniorTheme.colors.richEmerald,
    padding: 16,
    marginBottom: 16,
  },
  takeawayCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: SeniorTheme.colors.deepForest,
    marginBottom: 4,
  },
  takeawayCardBody: {
    fontSize: 14,
    color: SeniorTheme.colors.textPrimary,
    lineHeight: 20,
    fontWeight: '500',
  },
  questionCard: {
    backgroundColor: SeniorTheme.colors.white,
    padding: 18,
    marginBottom: 20,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: SeniorTheme.colors.textPrimary,
    lineHeight: 26,
    marginBottom: 16,
  },
  choicesList: {
    gap: 12,
    marginBottom: 16,
  },
  choiceButton: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
    backgroundColor: SeniorTheme.colors.white,
  },
  choiceButtonSelected: {
    borderWidth: 2,
    borderColor: SeniorTheme.colors.richEmerald,
    borderRadius: 14,
    padding: 14,
    backgroundColor: '#E8F5EE',
  },
  choiceButtonSafe: {
    borderWidth: 2,
    borderColor: SeniorTheme.colors.riskSafe,
    borderRadius: 14,
    padding: 14,
    backgroundColor: '#ECFDF5',
  },
  choiceButtonDanger: {
    borderWidth: 2,
    borderColor: SeniorTheme.colors.riskDanger,
    borderRadius: 14,
    padding: 14,
    backgroundColor: '#FEF2F2',
  },
  choiceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#94A3B8',
    marginRight: 12,
  },
  radioCircleSelected: {
    borderColor: SeniorTheme.colors.richEmerald,
    backgroundColor: SeniorTheme.colors.richEmerald,
  },
  radioCircleSafe: {
    borderColor: SeniorTheme.colors.riskSafe,
    backgroundColor: SeniorTheme.colors.riskSafe,
  },
  choiceText: {
    flex: 1,
    fontSize: 16,
    color: SeniorTheme.colors.textPrimary,
    lineHeight: 22,
    fontWeight: '500',
  },
  feedbackBox: {
    marginTop: 12,
    borderRadius: 10,
    padding: 12,
  },
  feedbackBoxSafe: {
    backgroundColor: '#D1FAE5',
  },
  feedbackBoxDanger: {
    backgroundColor: '#FEE2E2',
  },
  feedbackText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    marginTop: 6,
  },
  feedbackTextSafe: {
    color: '#065F46',
  },
  feedbackTextDanger: {
    color: '#991B1B',
  },
  nextScenarioButton: {
    marginTop: 8,
  },
  // Results view styles
  resultsContainer: {
    paddingTop: 8,
  },
  resultsHeaderCard: {
    backgroundColor: SeniorTheme.colors.white,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  trophyIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  resultsTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
    textAlign: 'center',
    marginBottom: 8,
  },
  scoreBadgeWrap: {
    marginBottom: 12,
  },
  resultsMessage: {
    fontSize: 15,
    color: SeniorTheme.colors.textPrimary,
    textAlign: 'center',
    lineHeight: 22,
  },
  reviewSection: {
    marginBottom: 16,
  },
  reviewSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: SeniorTheme.colors.textPrimary,
    marginBottom: 12,
  },
  scenarioReviewCard: {
    backgroundColor: SeniorTheme.colors.white,
    padding: 16,
    marginBottom: 12,
  },
  reviewCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reviewCardIndex: {
    fontSize: 14,
    fontWeight: '700',
    color: SeniorTheme.colors.richEmerald,
    marginRight: 6,
  },
  reviewCardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: SeniorTheme.colors.deepForest,
    marginRight: 8,
  },
  urlDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  urlLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginRight: 6,
  },
  urlValue: {
    fontSize: 13,
    color: SeniorTheme.colors.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  takeawayBox: {
    backgroundColor: '#ECFDF5',
    padding: 10,
    borderRadius: 8,
  },
  takeawayText: {
    fontSize: 13,
    color: '#065F46',
    lineHeight: 18,
    fontWeight: '500',
  },
  actionBtn: {
    marginBottom: 12,
  },
  srOnly: {
    position: 'absolute',
    width: 0,
    height: 0,
    opacity: 0,
    overflow: 'hidden',
  },
});

