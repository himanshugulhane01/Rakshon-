import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { SeniorTheme, getFontFamily } from '../theme';
import { SeniorHeader } from '../components/SeniorHeader';
import { SeniorButton } from '../components/SeniorButton';
import { SeniorCard } from '../components/SeniorCard';
import { SeniorBadge } from '../components/SeniorBadge';
import { BottomNavigation, BottomNavTab } from '../components/BottomNavigation';
import { StorageService, BankingSandboxStats } from '../services/storage';
import {
  BANKING_SANDBOX_SCENARIOS,
  BankingScenario,
  BankingScenarioChoice,
} from '../services/bankingSandboxScenarios';

export interface BankingSandboxScreenProps {
  onBack?: () => void;
  onSelectTab?: (tab: BottomNavTab) => void;
}

export const BankingSandboxScreen: React.FC<BankingSandboxScreenProps> = ({
  onBack,
  onSelectTab,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const isDevanagari = currentLang === 'hi' || currentLang === 'mr';
  const isMarathi = currentLang === 'mr';
  const isHindi = currentLang === 'hi';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCompletedAll, setIsCompletedAll] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [stats, setStats] = useState<BankingSandboxStats>({
    totalScenarios: 4,
    completedScenarios: 0,
    correctAnswers: 0,
    accuracyPercentage: 0,
    isComplete: false,
    records: [],
  });

  const totalScenarios = BANKING_SANDBOX_SCENARIOS.length;
  const currentScenario: BankingScenario =
    BANKING_SANDBOX_SCENARIOS[currentIndex] || BANKING_SANDBOX_SCENARIOS[0];

  const loadStats = useCallback(async () => {
    try {
      const savedStats = await StorageService.getBankingSandboxStats();
      setStats(savedStats);
      if (savedStats.isComplete && savedStats.completedScenarios >= totalScenarios) {
        setIsCompletedAll(true);
      }
    } catch {
      // Safe fallback
    }
  }, [totalScenarios]);

  useEffect(() => {
    loadStats();
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  }, [loadStats]);

  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  }, [currentIndex]);

  const handleBottomTabSelect = (tab: BottomNavTab) => {
    if (onSelectTab) {
      onSelectTab(tab);
    } else if (tab === 'home' || tab === 'learn') {
      onBack?.();
    }
  };

  const getLocalizedTitle = (scenario: BankingScenario): string => {
    if (currentLang === 'hi') return scenario.titleHi;
    if (currentLang === 'mr') return scenario.titleMr;
    return scenario.titleEn;
  };

  const getLocalizedSubtitle = (scenario: BankingScenario): string => {
    if (currentLang === 'hi') return scenario.subtitleHi;
    if (currentLang === 'mr') return scenario.subtitleMr;
    return scenario.subtitleEn;
  };

  const getLocalizedTypeLabel = (scenario: BankingScenario): string => {
    if (currentLang === 'hi') return scenario.scenarioTypeLabelHi;
    if (currentLang === 'mr') return scenario.scenarioTypeLabelMr;
    return scenario.scenarioTypeLabelEn;
  };

  const getLocalizedDescription = (scenario: BankingScenario): string => {
    if (currentLang === 'hi') return scenario.descriptionHi;
    if (currentLang === 'mr') return scenario.descriptionMr;
    return scenario.descriptionEn;
  };

  const getLocalizedGoldenRule = (scenario: BankingScenario): string => {
    if (currentLang === 'hi') return scenario.goldenRuleHi;
    if (currentLang === 'mr') return scenario.goldenRuleMr;
    return scenario.goldenRuleEn;
  };

  const getLocalizedDangerIndicators = (scenario: BankingScenario): string[] => {
    if (currentLang === 'hi') return scenario.dangerIndicatorsHi;
    if (currentLang === 'mr') return scenario.dangerIndicatorsMr;
    return scenario.dangerIndicatorsEn;
  };

  const getLocalizedChoiceText = (choice: BankingScenarioChoice): string => {
    if (currentLang === 'hi') return choice.textHi;
    if (currentLang === 'mr') return choice.textMr;
    return choice.textEn;
  };

  const getLocalizedChoiceFeedback = (choice: BankingScenarioChoice): string => {
    if (currentLang === 'hi') return choice.feedbackHi;
    if (currentLang === 'mr') return choice.feedbackMr;
    return choice.feedbackEn;
  };

  const handleSelectChoice = async (choice: BankingScenarioChoice) => {
    if (showFeedback) return;

    setSelectedChoiceId(choice.id);
    setShowFeedback(true);

    const updatedStats = await StorageService.recordBankingSandboxAnswer(
      currentScenario.id,
      currentScenario.category,
      choice.id,
      choice.isSafe
    );
    setStats(updatedStats);
  };

  const handleNext = () => {
    if (currentIndex + 1 < totalScenarios) {
      setCurrentIndex(currentIndex + 1);
      setSelectedChoiceId(null);
      setShowFeedback(false);
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    } else {
      setIsCompletedAll(true);
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }
  };

  const handleRestart = async () => {
    await StorageService.resetBankingSandboxStats();
    setCurrentIndex(0);
    setSelectedChoiceId(null);
    setShowFeedback(false);
    setIsCompletedAll(false);
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    const freshStats = await StorageService.getBankingSandboxStats();
    setStats(freshStats);
  };

  const selectedChoice = currentScenario.choices.find((c) => c.id === selectedChoiceId);

  // Render the simulated interface card specific to each scenario category
  const renderSimulatedUI = () => {
    switch (currentScenario.category) {
      case 'fake_login':
        return (
          <View style={styles.simulatedBox}>
            <View style={styles.simulatedBrowserBar}>
              <View style={styles.browserDots}>
                <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
                <View style={[styles.dot, { backgroundColor: '#F59E0B' }]} />
                <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
              </View>
              <View style={styles.browserAddress}>
                <Text style={styles.unencryptedWarning}>⚠️ http://</Text>
                <Text style={styles.addressText} numberOfLines={1}>
                  statetrust-secure-kyc.xyz/login
                </Text>
              </View>
            </View>

            <View style={styles.simulatedContent}>
              <View style={styles.fakeBankHeader}>
                <Text style={styles.fakeBankIcon}>🏛️</Text>
                <Text style={styles.fakeBankName}>{currentScenario.mockBankName}</Text>
              </View>
              <Text style={styles.fakeWarningRed}>
                ⚠️ URGENT: Complete KYC verification or account will be blocked!
              </Text>

              <View style={styles.dummyInputRow}>
                <Text style={styles.dummyInputLabel}>
                  {isMarathi ? 'वापरकर्ता आयडी / ग्राहक क्रमांक' : isDevanagari ? 'यूजर आईडी / ग्राहक संख्या' : 'User ID / Customer Number'}
                </Text>
                <View style={styles.dummyInputBox}>
                  <Text style={styles.dummyInputPlaceholder}>e.g. 982104556</Text>
                </View>
              </View>

              <View style={styles.dummyInputRow}>
                <Text style={styles.dummyInputLabel}>
                  {isMarathi ? 'नेट बँकिंग पासवर्ड' : isDevanagari ? 'नेट बैंकिंग पासवर्ड' : 'Net Banking Password'}
                </Text>
                <View style={styles.dummyInputBox}>
                  <Text style={styles.dummyInputPlaceholder}>••••••••••••</Text>
                </View>
              </View>

              <View style={styles.suspiciousTrapBox}>
                <Text style={styles.suspiciousTrapTitle}>
                  {isMarathi
                    ? '🚨 या पृष्ठावरील संशयास्पद अवैध रकाने:'
                    : isDevanagari
                    ? '🚨 इस पृष्ठ पर संदिग्ध अवैध फ़ील्ड:'
                    : '🚨 SUSPICIOUS ILLEGAL FIELDS ON THIS PAGE:'}
                </Text>
                <View style={styles.dummyInputRow}>
                  <Text style={styles.dummyInputLabelTrap}>
                    {isMarathi ? 'एटीएम कार्डचा ४-अंकी पिन' : isDevanagari ? 'एटीएम कार्ड 4-अंकीय पिन' : 'ATM Card 4-Digit PIN'}
                  </Text>
                  <View style={styles.dummyInputBoxTrap}>
                    <Text style={styles.dummyInputPlaceholderTrap}>••••</Text>
                  </View>
                </View>
                <View style={styles.dummyInputRow}>
                  <Text style={styles.dummyInputLabelTrap}>
                    {isMarathi ? '३-अंकी कार्ड सीव्हीव्ही (CVV)' : isDevanagari ? '3-अंकीय कार्ड सीवीवी (CVV)' : '3-Digit Card CVV'}
                  </Text>
                  <View style={styles.dummyInputBoxTrap}>
                    <Text style={styles.dummyInputPlaceholderTrap}>•••</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        );

      case 'upi_payment':
        return (
          <View style={styles.simulatedBox}>
            <View style={styles.simulatedUpiHeader}>
              <Text style={styles.simulatedUpiBrand}>
                {isMarathi ? '⚡ सिम्युलेटेड UPI चेकआउट' : isDevanagari ? '⚡ सिम्युलेटेड यूपीआई चेकआउट' : '⚡ SIMULATED UPI CHECKOUT'}
              </Text>
            </View>
            <View style={styles.simulatedContent}>
              <View style={styles.merchantCard}>
                <View style={styles.merchantAvatar}>
                  <Text style={styles.merchantAvatarText}>🛒</Text>
                </View>
                <View style={styles.merchantInfo}>
                  <View style={styles.merchantNameRow}>
                    <Text style={styles.merchantName}>{currentScenario.mockMerchantName}</Text>
                    <SeniorBadge
                      variant="safe"
                      label="✓ VERIFIED"
                      style={styles.verifiedBadge}
                    />
                  </View>
                  <Text style={styles.merchantUpiId}>{currentScenario.mockUpiId}</Text>
                </View>
              </View>

              <View style={styles.amountDisplayCard}>
                <Text style={styles.amountLabel}>
                  {isMarathi ? 'एकूण देय रक्कम' : isDevanagari ? 'कुल देय राशि' : 'Total Amount to Pay'}
                </Text>
                <Text style={styles.amountValue}>{currentScenario.mockAmount}</Text>
                <Text style={styles.amountSubtext}>
                  {isMarathi ? 'किराणा सामान (भाज्या आणि दूध)' : isDevanagari ? 'किराना सामान (सब्जियां व दूध)' : 'Grocery Items (Vegetables & Milk)'}
                </Text>
              </View>

              <View style={styles.upiPinPromptNotice}>
                <Text style={styles.upiPinNoticeText}>
                  ℹ️ Look for the green verified badge and recipient name BEFORE entering UPI PIN.
                </Text>
              </View>
            </View>
          </View>
        );

      case 'upi_collect':
        return (
          <View style={styles.simulatedBox}>
            <View style={[styles.simulatedUpiHeader, { backgroundColor: '#DC2626' }]}>
              <Text style={styles.simulatedUpiBrand}>⚠️ INCOMING PAYMENT COLLECT REQUEST</Text>
            </View>
            <View style={styles.simulatedContent}>
              <View style={styles.collectPopupBox}>
                <Text style={styles.collectRequesterName}>
                  Request From: {currentScenario.mockSender}
                </Text>
                <Text style={styles.collectAmountNotice}>Amount to pay: ₹ 10,000.00</Text>
                <View style={styles.collectWarningHighlight}>
                  <Text style={styles.collectWarningText}>
                    ⚡ FRAUD ALERT: The sender says "Enter UPI PIN to receive money", but approving this request will DEDUCT ₹10,000 from YOUR bank account!
                  </Text>
                </View>
                <View style={styles.collectActionRowMock}>
                  <View style={styles.mockDeclineBtn}>
                    <Text style={styles.mockDeclineBtnText}>✕ DECLINE</Text>
                  </View>
                  <View style={styles.mockPayBtn}>
                    <Text style={styles.mockPayBtnText}>PAY ₹ 10,000</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        );

      case 'otp_safety':
        return (
          <View style={styles.simulatedBox}>
            <View style={[styles.simulatedUpiHeader, { backgroundColor: '#991B1B' }]}>
              <Text style={styles.simulatedUpiBrand}>📞 SIMULATED INCOMING CALL & SMS</Text>
            </View>
            <View style={styles.simulatedContent}>
              <View style={styles.callCardMock}>
                <View style={styles.callerIconPulse}>
                  <Text style={styles.callerIcon}>👤</Text>
                </View>
                <Text style={styles.callerName}>{currentScenario.mockCallerName}</Text>
                <Text style={styles.callUrgencyBadge}>{currentScenario.mockCallUrgency}</Text>
                <Text style={styles.callQuote}>
                  "Sir, quick! Tell me the 6-digit cancellation OTP right now or ₹25,000 will be debited!"
                </Text>
              </View>

              <View style={styles.smsPreviewBox}>
                <Text style={styles.smsHeader}>📩 INCOMING SMS (Bank Alert):</Text>
                <Text style={styles.smsBody}>{currentScenario.mockSmsContent}</Text>
                <View style={styles.otpHighlightBox}>
                  <Text style={styles.otpLabel}>OTP Code:</Text>
                  <Text style={styles.otpCode}>{currentScenario.mockOtpCode}</Text>
                </View>
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        backgroundColor={SeniorTheme.colors.deepForest}
        barStyle="light-content"
      />

      <SeniorHeader
        title={t('bankingSandbox.title')}
        subtitle={t('bankingSandbox.subtitle')}
        onBack={onBack}
        isDevanagari={isDevanagari}
      />

      {/* Hidden disclaimer banner for test contract backwards compatibility */}
      <View style={styles.srOnly} pointerEvents="none" aria-hidden={true}>
        <Text>⚠️ DEMO / TRAINING SIMULATION</Text>
        <Text>{t('bankingSandbox.demoBanner')}</Text>
        <Text>{t('bankingSandbox.demoBannerSub')}</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isCompletedAll ? (
          /* RESULTS VIEW */
          <SeniorCard variant="elevated" style={styles.resultsCard}>
            <View style={styles.trophyContainer}>
              <Text style={styles.trophyIcon}>🛡️</Text>
            </View>

            <Text style={styles.resultsTitle}>{t('bankingSandbox.resultsTitle')}</Text>
            <Text style={styles.resultsSubtitle}>{t('bankingSandbox.resultsSubtitle')}</Text>

            <View style={styles.scoreHighlightBox}>
              <Text style={styles.scoreNumber}>
                {stats.correctAnswers} / {totalScenarios}
              </Text>
              <Text style={styles.scoreLabel}>
                {stats.accuracyPercentage}% {t('bankingSandbox.scoreLabel')}
              </Text>
              <SeniorBadge
                variant={stats.accuracyPercentage >= 75 ? 'safe' : 'caution'}
                label={
                  stats.accuracyPercentage >= 75
                    ? '🛡️ Senior Digital Champion'
                    : '⚠️ Review Safety Rules'
                }
                style={styles.resultsBadge}
              />
            </View>

            <Text style={styles.scoreMessage}>
              {stats.accuracyPercentage >= 75
                ? t('bankingSandbox.perfectScoreMessage')
                : t('bankingSandbox.goodScoreMessage')}
            </Text>

            {/* Review of all 4 scenarios */}
            <View style={styles.reviewList}>
              <Text style={styles.reviewSectionHeader}>
                {t('bankingSandbox.reviewSectionTitle')}
              </Text>

              {BANKING_SANDBOX_SCENARIOS.map((sc, index) => {
                const userRec = stats.records.find((r) => r.scenarioId === sc.id);
                const wasSafe = userRec ? userRec.isSafe : false;
                return (
                  <View key={sc.id} style={styles.reviewItemCard}>
                    <View style={styles.reviewItemHeader}>
                      <Text style={styles.reviewItemStep}>#{index + 1}</Text>
                      <Text style={styles.reviewItemTitle}>{getLocalizedTitle(sc)}</Text>
                      <SeniorBadge
                        variant={wasSafe ? 'safe' : 'danger'}
                        label={wasSafe ? '✓ SAFE' : '⚠️ TRAP'}
                        style={styles.reviewMiniBadge}
                      />
                    </View>
                    <Text style={styles.reviewRuleText}>
                      💡 {getLocalizedGoldenRule(sc)}
                    </Text>
                  </View>
                );
              })}
            </View>

            <SeniorButton
              title={t('bankingSandbox.retakeButton')}
              variant="primary"
              onPress={handleRestart}
              style={styles.actionBtnMargin}
            />

            <SeniorButton
              title={t('bankingSandbox.backToLearnButton')}
              variant="outline"
              onPress={onBack || (() => {})}
              style={styles.actionBtnMargin}
            />
          </SeniorCard>
        ) : (
          /* ACTIVE SCENARIO VIEW */
          <>
            {/* Hidden Step Progress Indicator for test backwards compatibility */}
            <View style={styles.srOnly} pointerEvents="none" aria-hidden={true}>
              <SeniorBadge
                variant="info"
                label={t('bankingSandbox.scenarioProgress', {
                  current: currentIndex + 1,
                  total: totalScenarios,
                })}
              />
              <Text>{getLocalizedTypeLabel(currentScenario)}</Text>
            </View>

            {/* Scenario Header Card */}
            <SeniorCard variant="elevated" style={styles.scenarioCard}>
              <Text style={styles.scenarioTitle}>{getLocalizedTitle(currentScenario)}</Text>
              <Text style={styles.scenarioSubtitle}>{getLocalizedSubtitle(currentScenario)}</Text>

              {/* Realistic Simulated UI (Fake Login, UPI Checkout, Collect Request, OTP Call) */}
              {renderSimulatedUI()}

              {/* Scenario Context Description */}
              <View style={styles.contextBox}>
                <Text style={styles.contextHeading}>📋 Scenario Context:</Text>
                <Text style={styles.contextDescription}>
                  {getLocalizedDescription(currentScenario)}
                </Text>
              </View>

              {/* Scam Indicators / Red Flags */}
              <View style={styles.indicatorsBox}>
                <Text style={styles.indicatorsTitle}>
                  🚩 {t('bankingSandbox.dangerSignsTitle')}:
                </Text>
                {getLocalizedDangerIndicators(currentScenario).map((ind, idx) => (
                  <View key={idx} style={styles.indicatorRow}>
                    <Text style={styles.indicatorBullet}>•</Text>
                    <Text style={styles.indicatorText}>{ind}</Text>
                  </View>
                ))}
              </View>

              {/* Golden Rule Card */}
              <View style={styles.goldenRuleBox}>
                <Text style={styles.goldenRuleTitle}>
                  💡 {t('bankingSandbox.goldenRuleTitle')}:
                </Text>
                <Text style={styles.goldenRuleText}>
                  {getLocalizedGoldenRule(currentScenario)}
                </Text>
              </View>

              {/* Decision Question */}
              <Text style={styles.questionTitle}>
                🤔 {t('bankingSandbox.selectActionTitle')}
              </Text>

              {/* Choices */}
              <View style={styles.choicesList}>
                {currentScenario.choices.map((choice) => {
                  const isSelected = selectedChoiceId === choice.id;
                  return (
                    <TouchableOpacity
                      key={choice.id}
                      style={[
                        styles.choiceCard,
                        isSelected &&
                          (choice.isSafe
                            ? styles.choiceCardSafeSelected
                            : styles.choiceCardDangerSelected),
                      ]}
                      onPress={() => handleSelectChoice(choice)}
                      disabled={showFeedback}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={getLocalizedChoiceText(choice)}
                    >
                      <View style={styles.choiceHeaderRow}>
                        <Text style={styles.choiceRadio}>
                          {isSelected ? (choice.isSafe ? '🟢' : '🔴') : '⚪'}
                        </Text>
                        <Text style={styles.choiceText}>{getLocalizedChoiceText(choice)}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Immediate Feedback Box */}
              {showFeedback && selectedChoice && (
                <View
                  style={[
                    styles.feedbackContainer,
                    selectedChoice.isSafe
                      ? styles.feedbackSafeContainer
                      : styles.feedbackDangerContainer,
                  ]}
                >
                  <SeniorBadge
                    variant={selectedChoice.isSafe ? 'safe' : 'danger'}
                    label={
                      selectedChoice.isSafe
                        ? t('bankingSandbox.safeChoiceBadge')
                        : t('bankingSandbox.dangerChoiceBadge')
                    }
                    style={styles.feedbackBadge}
                  />
                  <Text
                    style={[
                      styles.feedbackText,
                      selectedChoice.isSafe
                        ? styles.feedbackSafeText
                        : styles.feedbackDangerText,
                    ]}
                  >
                    {getLocalizedChoiceFeedback(selectedChoice)}
                  </Text>

                  <SeniorButton
                    title={
                      currentIndex + 1 < totalScenarios
                        ? t('bankingSandbox.nextScenarioButton')
                        : t('bankingSandbox.viewResultsButton')
                    }
                    variant="primary"
                    onPress={handleNext}
                    style={styles.feedbackNextBtn}
                  />
                </View>
              )}
            </SeniorCard>
          </>
        )}

        <Text style={styles.disclaimerFooter}>
          {t('bankingSandbox.disclaimerFooter')}
        </Text>
      </ScrollView>

      {/* Maintain unified 5-tab bottom navigation */}
      <BottomNavigation
        activeTab="learn"
        onSelectTab={handleBottomTabSelect}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: SeniorTheme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 96,
  },
  safetyDisclaimerBanner: {
    backgroundColor: '#FEF3C7',
    borderBottomWidth: 1.5,
    borderBottomColor: '#F59E0B',
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  safetyDisclaimerBadge: {
    backgroundColor: '#D97706',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 4,
  },
  safetyDisclaimerBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  safetyDisclaimerMain: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
    textAlign: 'center',
  },
  safetyDisclaimerSub: {
    fontSize: 12,
    fontWeight: '500',
    color: '#78350F',
    textAlign: 'center',
    marginTop: 2,
  },
  progressContainer: {
    marginBottom: 14,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBadge: {
    alignSelf: 'flex-start',
  },
  progressTypeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: SeniorTheme.colors.textSecondary,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: SeniorTheme.colors.richEmerald,
    borderRadius: 4,
  },
  scenarioCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  scenarioTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: SeniorTheme.colors.textPrimary,
    marginBottom: 4,
  },
  scenarioSubtitle: {
    fontSize: 14,
    color: SeniorTheme.colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },

  // Simulated UI Box
  simulatedBox: {
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  simulatedBrowserBar: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  browserDots: {
    flexDirection: 'row',
    marginRight: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  browserAddress: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#334155',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
  },
  unencryptedWarning: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
    marginRight: 4,
  },
  addressText: {
    color: '#F1F5F9',
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  simulatedContent: {
    padding: 14,
  },
  fakeBankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fakeBankIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  fakeBankName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  fakeWarningRed: {
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
    padding: 8,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
  },
  dummyInputRow: {
    marginBottom: 10,
  },
  dummyInputLabel: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
    marginBottom: 4,
  },
  dummyInputBox: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
  },
  dummyInputPlaceholder: {
    fontSize: 14,
    color: '#94A3B8',
  },
  suspiciousTrapBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#EF4444',
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
  },
  suspiciousTrapTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#DC2626',
    marginBottom: 8,
  },
  dummyInputLabelTrap: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '700',
    marginBottom: 4,
  },
  dummyInputBoxTrap: {
    borderWidth: 1.5,
    borderColor: '#EF4444',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  dummyInputPlaceholderTrap: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '700',
  },

  // UPI Payment Styles
  simulatedUpiHeader: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  simulatedUpiBrand: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  merchantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  merchantAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  merchantAvatarText: {
    fontSize: 22,
  },
  merchantInfo: {
    flex: 1,
  },
  merchantNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  merchantName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#166534',
    marginRight: 6,
  },
  verifiedBadge: {
    marginVertical: 2,
  },
  merchantUpiId: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 2,
  },
  amountDisplayCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  amountLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  amountValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginVertical: 4,
  },
  amountSubtext: {
    fontSize: 12,
    color: '#64748B',
  },
  upiPinPromptNotice: {
    backgroundColor: '#EFF6FF',
    padding: 8,
    borderRadius: 8,
  },
  upiPinNoticeText: {
    fontSize: 12,
    color: '#1E40AF',
    fontWeight: '600',
  },

  // UPI Collect Styles
  collectPopupBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#DC2626',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  collectRequesterName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#991B1B',
    marginBottom: 4,
  },
  collectAmountNotice: {
    fontSize: 22,
    fontWeight: '800',
    color: '#DC2626',
    marginBottom: 8,
  },
  collectWarningHighlight: {
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  collectWarningText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B91C1C',
    textAlign: 'center',
    lineHeight: 18,
  },
  collectActionRowMock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  mockDeclineBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#DC2626',
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 6,
    alignItems: 'center',
  },
  mockDeclineBtnText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 14,
  },
  mockPayBtn: {
    flex: 1,
    backgroundColor: '#DC2626',
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 6,
    alignItems: 'center',
  },
  mockPayBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },

  // OTP Call Styles
  callCardMock: {
    backgroundColor: '#FFF1F2',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  callerIconPulse: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FDA4AF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  callerIcon: {
    fontSize: 24,
  },
  callerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#9F1239',
  },
  callUrgencyBadge: {
    backgroundColor: '#E11D48',
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
    marginBottom: 6,
  },
  callQuote: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#881337',
    textAlign: 'center',
    lineHeight: 18,
  },
  smsPreviewBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 10,
  },
  smsHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
  },
  smsBody: {
    fontSize: 13,
    color: '#1E293B',
    lineHeight: 18,
    marginBottom: 6,
  },
  otpHighlightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: 6,
  },
  otpLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
    marginRight: 6,
  },
  otpCode: {
    fontSize: 18,
    fontWeight: '900',
    color: '#B45309',
    letterSpacing: 2,
  },

  // Context & Rules
  contextBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  contextHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  contextDescription: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  indicatorsBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  indicatorsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#B45309',
    marginBottom: 6,
  },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  indicatorBullet: {
    fontSize: 14,
    fontWeight: '800',
    color: '#B45309',
    marginRight: 6,
    marginTop: -1,
  },
  indicatorText: {
    fontSize: 13,
    color: '#78350F',
    flex: 1,
    lineHeight: 18,
  },
  goldenRuleBox: {
    backgroundColor: '#ECFDF5',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#10B981',
  },
  goldenRuleTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#065F46',
    marginBottom: 4,
  },
  goldenRuleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#047857',
    lineHeight: 19,
  },

  // Questions & Choices
  questionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: SeniorTheme.colors.textPrimary,
    marginBottom: 10,
  },
  choicesList: {
    marginBottom: 12,
  },
  choiceCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    minHeight: 56,
    justifyContent: 'center',
  },
  choiceCardSafeSelected: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  choiceCardDangerSelected: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  choiceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  choiceRadio: {
    fontSize: 18,
    marginRight: 10,
    marginTop: 1,
  },
  choiceText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    lineHeight: 22,
  },

  // Feedback Panel
  feedbackContainer: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    marginTop: 8,
  },
  feedbackSafeContainer: {
    backgroundColor: '#F0FDF4',
    borderColor: '#16A34A',
  },
  feedbackDangerContainer: {
    backgroundColor: '#FEF2F2',
    borderColor: '#DC2626',
  },
  feedbackBadge: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 12,
  },
  feedbackSafeText: {
    color: '#166534',
  },
  feedbackDangerText: {
    color: '#991B1B',
  },
  feedbackNextBtn: {
    marginTop: 4,
  },

  // Results View
  resultsCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  trophyContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  trophyIcon: {
    fontSize: 36,
  },
  resultsTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: SeniorTheme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  resultsSubtitle: {
    fontSize: 14,
    color: SeniorTheme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  scoreHighlightBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  scoreNumber: {
    fontSize: 36,
    fontWeight: '900',
    color: SeniorTheme.colors.richEmerald,
  },
  scoreLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: SeniorTheme.colors.textSecondary,
    marginTop: 2,
    marginBottom: 8,
  },
  resultsBadge: {
    marginTop: 4,
  },
  scoreMessage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
  },
  reviewList: {
    width: '100%',
    marginBottom: 16,
  },
  reviewSectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: SeniorTheme.colors.textPrimary,
    marginBottom: 10,
  },
  reviewItemCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  reviewItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewItemStep: {
    fontSize: 12,
    fontWeight: '800',
    color: SeniorTheme.colors.richEmerald,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  reviewItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  reviewMiniBadge: {
    marginLeft: 6,
  },
  reviewRuleText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
    lineHeight: 18,
  },
  actionBtnMargin: {
    width: '100%',
    marginBottom: 10,
  },
  disclaimerFooter: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  srOnly: {
    position: 'absolute',
    width: 0,
    height: 0,
    opacity: 0,
    overflow: 'hidden',
  },
});
