import React, { useState, useEffect, useCallback } from 'react';
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
import { SeniorButton } from '../components/SeniorButton';
import { SeniorCard } from '../components/SeniorCard';
import { SeniorBadge } from '../components/SeniorBadge';
import { BottomNavigation, BottomNavTab } from '../components/BottomNavigation';
import { StorageService, SimulatorLearningStats } from '../services/storage';
import {
  SIMULATOR_SCENARIOS,
  SimulatorScenario,
  SimulatorChoice,
} from '../services/scamScenarios';

export interface ScamSimulatorScreenProps {
  onBack?: () => void;
  onSelectTab?: (tab: BottomNavTab) => void;
}

export const ScamSimulatorScreen: React.FC<ScamSimulatorScreenProps> = ({ onBack, onSelectTab }) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const isDevanagari = currentLang === 'hi' || currentLang === 'mr';

  const handleBottomTabSelect = (tab: BottomNavTab) => {
    if (tab === 'learn') return;
    if (onSelectTab) {
      onSelectTab(tab);
    } else if (tab === 'home') {
      onBack?.();
    }
  };

  const [activeTab, setActiveTab] = useState<'practice' | 'dashboard'>('practice');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCompletedAll, setIsCompletedAll] = useState(false);
  const [learningStats, setLearningStats] = useState<SimulatorLearningStats>({
    totalScenarios: SIMULATOR_SCENARIOS.length,
    totalCompleted: 0,
    correctAnswers: 0,
    accuracyPercentage: 0,
    completedCategories: [],
    masteredCategories: [],
    needsImprovementAreas: [],
    isComplete: false,
  });

  const totalScenarios = SIMULATOR_SCENARIOS.length;
  const currentScenario: SimulatorScenario = SIMULATOR_SCENARIOS[currentIndex] || SIMULATOR_SCENARIOS[0];

  const loadProgress = useCallback(async () => {
    try {
      const completed = await StorageService.getCompletedSimulatorScenarios();
      setCompletedIds(completed);
      if (completed.length >= totalScenarios) {
        setIsCompletedAll(true);
      }
      const stats = await StorageService.getSimulatorLearningStats(SIMULATOR_SCENARIOS);
      setLearningStats(stats);
    } catch {
      // Safe fallback
    }
  }, [totalScenarios]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const getLocalizedTitle = (scenario: SimulatorScenario): string => {
    if (currentLang === 'hi') return scenario.titleHi;
    if (currentLang === 'mr') return scenario.titleMr;
    return scenario.titleEn;
  };

  const getLocalizedTopic = (scenario: SimulatorScenario): string => {
    if (currentLang === 'hi') return scenario.topicTitleHi;
    if (currentLang === 'mr') return scenario.topicTitleMr;
    return scenario.topicTitleEn;
  };

  const getLocalizedMessage = (scenario: SimulatorScenario): string => {
    if (currentLang === 'hi') return scenario.messageHi;
    if (currentLang === 'mr') return scenario.messageMr;
    return scenario.messageEn;
  };

  const getLocalizedQuestion = (scenario: SimulatorScenario): string => {
    if (currentLang === 'hi') return scenario.questionHi;
    if (currentLang === 'mr') return scenario.questionMr;
    return scenario.questionEn;
  };

  const getLocalizedExplanation = (scenario: SimulatorScenario): string => {
    if (currentLang === 'hi') return scenario.explanationHi;
    if (currentLang === 'mr') return scenario.explanationMr;
    return scenario.explanationEn;
  };

  const getLocalizedRuleLesson = (scenario: SimulatorScenario): string => {
    if (currentLang === 'hi') return scenario.ruleLessonHi;
    if (currentLang === 'mr') return scenario.ruleLessonMr;
    return scenario.ruleLessonEn;
  };

  const getLocalizedChoiceText = (choice: SimulatorChoice): string => {
    if (currentLang === 'hi') return choice.textHi;
    if (currentLang === 'mr') return choice.textMr;
    return choice.textEn;
  };

  const handleSelectChoice = async (choice: SimulatorChoice) => {
    if (showExplanation) return; // Prevent changing after revealing

    setSelectedChoiceId(choice.id);
    setShowExplanation(true);

    // Save choice and compute actual stats
    await StorageService.recordSimulatorAnswer(
      currentScenario.id,
      currentScenario.category,
      choice.id,
      choice.isSafe
    );

    const updatedCompleted = await StorageService.getCompletedSimulatorScenarios();
    setCompletedIds(updatedCompleted);

    const stats = await StorageService.getSimulatorLearningStats(SIMULATOR_SCENARIOS);
    setLearningStats(stats);
  };

  const handleNext = () => {
    if (currentIndex + 1 < totalScenarios) {
      setCurrentIndex(currentIndex + 1);
      setSelectedChoiceId(null);
      setShowExplanation(false);
    } else {
      setIsCompletedAll(true);
      setActiveTab('dashboard');
    }
  };

  const handleRestart = async () => {
    await StorageService.resetSimulatorProgress();
    setCompletedIds([]);
    setCurrentIndex(0);
    setSelectedChoiceId(null);
    setShowExplanation(false);
    setIsCompletedAll(false);
    const stats = await StorageService.getSimulatorLearningStats(SIMULATOR_SCENARIOS);
    setLearningStats(stats);
    setActiveTab('practice');
  };

  const handleContinuePractice = () => {
    // Find first scenario that has not been completed
    const uncompletedIdx = SIMULATOR_SCENARIOS.findIndex(
      (s) => !completedIds.includes(s.id)
    );
    if (uncompletedIdx !== -1) {
      setCurrentIndex(uncompletedIdx);
      setSelectedChoiceId(null);
      setShowExplanation(false);
    }
    setActiveTab('practice');
  };

  const selectedChoice = currentScenario.choices.find((c) => c.id === selectedChoiceId);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={SeniorTheme.colors.backgroundMain} />

      <SeniorHeader title={t('scamSimulator.title')} onBack={onBack} />

      {/* Senior-Friendly Tab Navigation */}
      <View style={styles.tabBar} accessibilityRole="tablist">
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'practice' && styles.tabButtonActive]}
          onPress={() => setActiveTab('practice')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'practice' }}
          accessibilityLabel={t('scamSimulator.tabPractice')}
        >
          <Text
            style={[styles.tabButtonText, activeTab === 'practice' && styles.tabButtonTextActive]}
          >
            {`🎮 ${t('scamSimulator.tabPractice')}`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'dashboard' && styles.tabButtonActive]}
          onPress={() => setActiveTab('dashboard')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'dashboard' }}
          accessibilityLabel={t('scamSimulator.tabDashboard')}
        >
          <Text
            style={[styles.tabButtonText, activeTab === 'dashboard' && styles.tabButtonTextActive]}
          >
            {`📊 ${t('scamSimulator.tabDashboard')}`}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'practice' ? (
          <>
            {/* Progress Bar & Badges */}
            <View style={styles.progressContainer}>
              <View style={styles.progressHeaderRow}>
                <SeniorBadge
                  variant="info"
                  label={t('scamSimulator.progressCount', {
                    current: currentIndex + 1,
                    total: totalScenarios,
                  })}
                  style={styles.compactBadge}
                />
                <SeniorBadge
                  variant={completedIds.length >= totalScenarios ? 'safe' : 'caution'}
                  label={t('scamSimulator.scoreLabel', {
                    completed: completedIds.length,
                    total: totalScenarios,
                  })}
                  style={styles.compactBadge}
                />
              </View>
              <View style={styles.progressBarTrack}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${((currentIndex + 1) / totalScenarios) * 100}%` },
                  ]}
                />
              </View>
            </View>

            {/* COMPLETION BANNER (when all scenarios completed) */}
            {isCompletedAll ? (
              <SeniorCard variant="elevated" style={styles.completedCard}>
                <View style={styles.trophyCircle}>
                  <Text style={styles.trophyText}>🏆</Text>
                </View>
                <Text style={styles.completionTitle}>
                  {t('scamSimulator.completionBannerTitle')}
                </Text>
                <Text style={styles.completionDesc}>
                  {t('scamSimulator.completionBannerDesc')}
                </Text>

                <SeniorButton
                  title={t('scamSimulator.viewDashboardButton')}
                  variant="primary"
                  onPress={() => setActiveTab('dashboard')}
                  accessibilityLabel={t('scamSimulator.viewDashboardButton')}
                  style={styles.actionBtnMargin}
                />

                <SeniorButton
                  title={t('scamSimulator.restartButton')}
                  variant="secondary"
                  onPress={handleRestart}
                  accessibilityLabel={t('scamSimulator.restartButton')}
                  style={styles.actionBtnMargin}
                />
              </SeniorCard>
            ) : (
              <SeniorCard variant="elevated" style={styles.scenarioCard}>
                {/* Topic Label */}
                <View style={styles.topicRow}>
                  <Text style={styles.topicBadgeText}>
                    {`🏷️ ${getLocalizedTopic(currentScenario)}`}
                  </Text>
                </View>

                {/* Scenario Title */}
                <Text style={styles.scenarioTitle}>{getLocalizedTitle(currentScenario)}</Text>

                {/* Suspicious Situation Box - Realistic SMS Preview */}
                <Text style={styles.situationLabel}>
                  {t('scamSimulator.scenarioDescriptionLabel')}
                </Text>
                <View style={styles.smsSimulationCard}>
                  <View style={styles.smsHeaderBar}>
                    <View style={styles.smsSenderBadge}>
                      <Text style={styles.smsSenderIcon}>💬</Text>
                      <Text style={styles.smsSenderName}>
                        {currentScenario.id === 'scenario_electricity'
                          ? 'SMS • VM-DISCOM'
                          : currentScenario.id === 'scenario_police'
                          ? 'CALL / NOTICE • CBI-CYBER'
                          : currentScenario.id === 'scenario_kyc'
                          ? 'SMS • SBI-KYC'
                          : currentScenario.id === 'scenario_otp_upi'
                          ? 'SMS • PAYTM-SECURE'
                          : currentScenario.id === 'scenario_delivery'
                          ? 'SMS • INDPOST'
                          : currentScenario.id === 'scenario_malware'
                          ? 'BROWSER • APK-INSTALL'
                          : currentScenario.id === 'scenario_qr_fraud'
                          ? 'QR CODE • UPI-PAY'
                          : 'SMS • HELPLINE-ALERT'}
                      </Text>
                    </View>
                    <Text style={styles.smsTimestamp}>8:00 PM</Text>
                  </View>
                  <View style={styles.smsDivider} />
                  <View style={styles.messageBox}>
                    <Text style={styles.messageText}>{getLocalizedMessage(currentScenario)}</Text>
                  </View>
                </View>

                {/* Question */}
                <Text style={styles.questionText}>
                  {`❓ ${getLocalizedQuestion(currentScenario)}`}
                </Text>

                {/* Choices with Circular Option Letters */}
                <View style={styles.choicesList}>
                  {currentScenario.choices.map((choice, index) => {
                    const isSelected = selectedChoiceId === choice.id;
                    const optionLetter = String.fromCharCode(65 + index); // 'A', 'B', 'C'
                    let choiceCardStyle: any = styles.choiceButton;
                    let choiceTextStyle: any = styles.choiceText;
                    let badgeStyle: any = styles.choiceLetterBadge;
                    let badgeTextStyle: any = styles.choiceLetterText;

                    if (showExplanation && isSelected) {
                      if (choice.isSafe) {
                        choiceCardStyle = [styles.choiceButton, styles.choiceSafeSelected];
                        choiceTextStyle = [styles.choiceText, styles.choiceSafeText];
                        badgeStyle = [styles.choiceLetterBadge, styles.badgeSafe];
                        badgeTextStyle = [styles.choiceLetterText, styles.badgeTextSafe];
                      } else {
                        choiceCardStyle = [styles.choiceButton, styles.choiceDangerSelected];
                        choiceTextStyle = [styles.choiceText, styles.choiceDangerText];
                        badgeStyle = [styles.choiceLetterBadge, styles.badgeDanger];
                        badgeTextStyle = [styles.choiceLetterText, styles.badgeTextDanger];
                      }
                    }

                    return (
                      <TouchableOpacity
                        key={choice.id}
                        style={choiceCardStyle}
                        onPress={() => handleSelectChoice(choice)}
                        disabled={showExplanation}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={getLocalizedChoiceText(choice)}
                        activeOpacity={0.7}
                      >
                        <View style={badgeStyle}>
                          <Text style={badgeTextStyle}>
                            {showExplanation && isSelected
                              ? choice.isSafe
                                ? '✓'
                                : '⚠️'
                              : optionLetter}
                          </Text>
                        </View>
                        <Text style={choiceTextStyle}>{getLocalizedChoiceText(choice)}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Immediate Senior Feedback & Explanation */}
                {showExplanation && selectedChoice && (
                  <View style={styles.feedbackSection}>
                    {/* Result Feedback Banner */}
                    <View
                      style={[
                        styles.feedbackBanner,
                        selectedChoice.isSafe ? styles.feedbackBannerSafe : styles.feedbackBannerDanger,
                      ]}
                      accessible={true}
                      accessibilityRole="alert"
                    >
                      <Text
                        style={[
                          styles.feedbackBannerText,
                          selectedChoice.isSafe ? styles.feedbackTextSafe : styles.feedbackTextDanger,
                        ]}
                      >
                        {selectedChoice.isSafe
                          ? t('scamSimulator.feedbackCorrect')
                          : t('scamSimulator.feedbackIncorrect')}
                      </Text>
                    </View>

                    {/* Explanation Details */}
                    <View style={styles.explanationBox}>
                      <Text style={styles.explanationHeading}>
                        {`💡 ${t('scamSimulator.explanationTitle')}`}
                      </Text>
                      <Text style={styles.explanationBody}>
                        {getLocalizedExplanation(currentScenario)}
                      </Text>

                      {/* Golden Rule Lesson */}
                      <View style={styles.ruleLessonBox}>
                        <Text style={styles.ruleLessonText}>
                          {`🛡️ ${getLocalizedRuleLesson(currentScenario)}`}
                        </Text>
                      </View>
                    </View>

                    {/* Next Scenario or Complete Button */}
                    <SeniorButton
                      title={
                        currentIndex + 1 < totalScenarios
                          ? t('scamSimulator.nextScenarioButton')
                          : t('scamSimulator.finishButton')
                      }
                      variant="primary"
                      onPress={handleNext}
                      accessibilityLabel="Next scenario"
                      style={styles.nextButton}
                    />
                  </View>
                )}
              </SeniorCard>
            )}
          </>
        ) : (
          /* ========================================================= */
          /* AWARENESS LEARNING DASHBOARD                              */
          /* ========================================================= */
          <View style={styles.dashboardContainer}>
            {/* Overall Score & Reflex Meter Card */}
            <SeniorCard variant="elevated" style={styles.dashboardHeroCard}>
              <Text style={styles.dashboardHeading}>
                {t('scamSimulator.dashboardTitle')}
              </Text>
              <Text style={styles.dashboardSubheading}>
                {t('scamSimulator.dashboardSubtitle')}
              </Text>

              <View style={styles.statsRow}>
                <View style={styles.accuracyCircle}>
                  <Text style={styles.accuracyNumber}>
                    {`${learningStats.accuracyPercentage}%`}
                  </Text>
                  <Text style={styles.accuracyLabel}>
                    {t('scamSimulator.accuracyTitle')}
                  </Text>
                </View>

                <View style={styles.statsSummaryColumn}>
                  <Text style={styles.statsDetailLine}>
                    {t('scamSimulator.accuracyDetail', {
                      correct: learningStats.correctAnswers,
                      total: learningStats.totalCompleted,
                    })}
                  </Text>
                  <Text style={styles.statsDetailLine}>
                    {t('scamSimulator.completedCount', {
                      completed: learningStats.totalCompleted,
                      total: totalScenarios,
                    })}
                  </Text>
                </View>
              </View>
            </SeniorCard>

            {/* Mastered Topics Section */}
            <SeniorCard variant="default" style={styles.dashboardSectionCard}>
              <Text style={styles.sectionHeaderTitle}>
                {`🏆 ${t('scamSimulator.masteredSectionTitle')}`}
              </Text>
              <Text style={styles.sectionHeaderSubtitle}>
                {t('scamSimulator.masteredDesc')}
              </Text>

              {learningStats.masteredCategories.length === 0 ? (
                <Text style={styles.emptyNoteText}>
                  {t('scamSimulator.practiceMorePrompt')}
                </Text>
              ) : (
                <View style={styles.badgesWrap}>
                  {learningStats.masteredCategories.map((category) => {
                    const scenario = SIMULATOR_SCENARIOS.find((s) => s.category === category);
                    const label = scenario ? getLocalizedTopic(scenario) : category;
                    return (
                      <View key={category} style={styles.masteredBadge}>
                        <Text style={styles.masteredBadgeText}>{`✓ ${label}`}</Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </SeniorCard>

            {/* Areas for Improvement / Strengthening Section */}
            <SeniorCard variant="default" style={styles.dashboardSectionCard}>
              <Text style={styles.sectionHeaderTitle}>
                {`🛡️ ${t('scamSimulator.improvementSectionTitle')}`}
              </Text>
              <Text style={styles.sectionHeaderSubtitle}>
                {t('scamSimulator.improvementDesc')}
              </Text>

              {learningStats.needsImprovementAreas.length === 0 ? (
                <View style={styles.safeHighlightBox}>
                  <Text style={styles.safeHighlightText}>
                    {t('scamSimulator.noImprovementsNeeded')}
                  </Text>
                </View>
              ) : (
                <View style={styles.improvementsList}>
                  {learningStats.needsImprovementAreas.map((item, idx) => {
                    const topicTitle =
                      currentLang === 'hi'
                        ? item.topicTitleHi
                        : currentLang === 'mr'
                        ? item.topicTitleMr
                        : item.topicTitleEn;
                    const advice =
                      currentLang === 'hi'
                        ? item.adviceHi
                        : currentLang === 'mr'
                        ? item.adviceMr
                        : item.adviceEn;

                    return (
                      <View key={`${item.category}_${idx}`} style={styles.improvementItemCard}>
                        <Text style={styles.improvementItemTitle}>{`⚠️ ${topicTitle}`}</Text>
                        <Text style={styles.improvementItemAdvice}>{advice}</Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </SeniorCard>

            {/* Action Buttons */}
            {learningStats.totalCompleted < totalScenarios ? (
              <SeniorButton
                title={t('scamSimulator.continuePracticeButton', {
                  remaining: totalScenarios - learningStats.totalCompleted,
                })}
                variant="primary"
                onPress={handleContinuePractice}
                accessibilityLabel={t('scamSimulator.continuePracticeButton', {
                  remaining: totalScenarios - learningStats.totalCompleted,
                })}
                style={styles.actionBtnMargin}
              />
            ) : null}

            <SeniorButton
              title={t('scamSimulator.retakePracticeButton')}
              variant="secondary"
              onPress={handleRestart}
              accessibilityLabel={t('scamSimulator.retakePracticeButton')}
              style={styles.actionBtnMargin}
            />
          </View>
        )}
      </ScrollView>

      {/* 5-Item Bottom Navigation */}
      <BottomNavigation
        activeTab="learn"
        onSelectTab={handleBottomTabSelect}
        isDevanagari={isDevanagari}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SeniorTheme.colors.backgroundMain,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: SeniorTheme.spacing.lg,
    paddingTop: SeniorTheme.spacing.xs,
    paddingBottom: SeniorTheme.spacing.sm,
    backgroundColor: SeniorTheme.colors.backgroundMain,
    gap: SeniorTheme.spacing.sm,
  },
  tabButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: SeniorTheme.radii.button,
    backgroundColor: SeniorTheme.colors.backgroundMain,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SeniorTheme.spacing.sm,
  },
  tabButtonActive: {
    backgroundColor: SeniorTheme.colors.richEmerald,
    borderColor: SeniorTheme.colors.richEmerald,
  },
  tabButtonText: {
    fontSize: SeniorTheme.typography.body,
    fontWeight: '700',
    color: SeniorTheme.colors.deepForest,
  },
  tabButtonTextActive: {
    color: SeniorTheme.colors.white,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: SeniorTheme.spacing.lg,
    paddingBottom: SeniorTheme.spacing.xxl,
  },
  progressContainer: {
    marginVertical: SeniorTheme.spacing.sm,
    gap: 8,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  compactBadge: {
    flexShrink: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: SeniorTheme.colors.richEmerald,
    borderRadius: 3,
  },
  topicRow: {
    marginBottom: SeniorTheme.spacing.xs,
  },
  topicBadgeText: {
    fontSize: SeniorTheme.typography.caption,
    fontWeight: '800',
    color: SeniorTheme.colors.richEmerald,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scenarioCard: {
    marginBottom: SeniorTheme.spacing.xl,
    borderRadius: SeniorTheme.radii.card,
  },
  scenarioTitle: {
    fontSize: SeniorTheme.typography.titleMedium,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
    marginBottom: SeniorTheme.spacing.sm,
  },
  situationLabel: {
    fontSize: SeniorTheme.typography.bodySmall,
    fontWeight: '700',
    color: SeniorTheme.colors.textDim,
    marginBottom: 8,
  },
  smsSimulationCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: SeniorTheme.spacing.md,
    shadowColor: '#152720',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  smsHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  smsSenderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  smsSenderIcon: {
    fontSize: 16,
  },
  smsSenderName: {
    fontSize: 12,
    fontWeight: '800',
    color: SeniorTheme.colors.richEmerald,
    letterSpacing: 0.5,
  },
  smsTimestamp: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  smsDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: 10,
  },
  messageBox: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  messageText: {
    fontSize: 15,
    color: SeniorTheme.colors.deepForest,
    fontWeight: '600',
    lineHeight: 22,
  },
  questionText: {
    fontSize: SeniorTheme.typography.bodyLarge,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
    marginBottom: SeniorTheme.spacing.md,
  },
  choicesList: {
    gap: 12,
    marginBottom: SeniorTheme.spacing.md,
  },
  choiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    minHeight: 60,
    shadowColor: '#152720',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
    gap: 12,
  },
  choiceSafeSelected: {
    borderColor: SeniorTheme.colors.richEmerald,
    backgroundColor: '#F0FDF4',
  },
  choiceDangerSelected: {
    borderColor: SeniorTheme.colors.riskDanger,
    backgroundColor: '#FEF2F2',
  },
  choiceLetterBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  choiceLetterText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#475569',
  },
  badgeSafe: {
    backgroundColor: '#DCFCE7',
    borderColor: SeniorTheme.colors.richEmerald,
  },
  badgeTextSafe: {
    color: SeniorTheme.colors.richEmerald,
    fontSize: 16,
    fontWeight: '900',
  },
  badgeDanger: {
    backgroundColor: '#FEE2E2',
    borderColor: SeniorTheme.colors.riskDanger,
  },
  badgeTextDanger: {
    color: SeniorTheme.colors.riskDanger,
    fontSize: 14,
    fontWeight: '900',
  },
  choiceIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  choiceText: {
    fontSize: SeniorTheme.typography.body,
    color: SeniorTheme.colors.deepForest,
    flex: 1,
    lineHeight: 22,
    fontWeight: '500',
  },
  choiceSafeText: {
    color: SeniorTheme.colors.richEmerald,
    fontWeight: '700',
  },
  choiceDangerText: {
    color: SeniorTheme.colors.riskDanger,
    fontWeight: '700',
  },
  feedbackSection: {
    marginTop: SeniorTheme.spacing.sm,
  },
  feedbackBanner: {
    padding: SeniorTheme.spacing.md,
    borderRadius: SeniorTheme.radii.button,
    marginBottom: SeniorTheme.spacing.md,
  },
  feedbackBannerSafe: {
    backgroundColor: SeniorTheme.colors.riskSafeSurface,
    borderWidth: 1,
    borderColor: SeniorTheme.colors.riskSafeBorder,
  },
  feedbackBannerDanger: {
    backgroundColor: SeniorTheme.colors.riskDangerSurface,
    borderWidth: 1,
    borderColor: SeniorTheme.colors.riskDangerBorder,
  },
  feedbackBannerText: {
    fontSize: SeniorTheme.typography.bodyLarge,
    fontWeight: '800',
    textAlign: 'center',
  },
  feedbackTextSafe: {
    color: SeniorTheme.colors.riskSafe,
  },
  feedbackTextDanger: {
    color: SeniorTheme.colors.riskDanger,
  },
  explanationBox: {
    backgroundColor: SeniorTheme.colors.backgroundMain,
    padding: SeniorTheme.spacing.md,
    borderRadius: SeniorTheme.radii.button,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: SeniorTheme.spacing.md,
  },
  explanationHeading: {
    fontSize: SeniorTheme.typography.bodyLarge,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
    marginBottom: 6,
  },
  explanationBody: {
    fontSize: SeniorTheme.typography.body,
    color: SeniorTheme.colors.deepForest,
    opacity: 0.9,
    lineHeight: 24,
    marginBottom: SeniorTheme.spacing.sm,
  },
  ruleLessonBox: {
    backgroundColor: SeniorTheme.colors.riskSafeSurface,
    padding: 10,
    borderRadius: SeniorTheme.radii.button,
  },
  ruleLessonText: {
    fontSize: SeniorTheme.typography.bodySmall,
    color: SeniorTheme.colors.riskSafe,
    fontWeight: '700',
    lineHeight: 20,
  },
  nextButton: {
    marginTop: SeniorTheme.spacing.xs,
  },
  completedCard: {
    alignItems: 'center',
    paddingVertical: SeniorTheme.spacing.xl,
    borderRadius: SeniorTheme.radii.card,
  },
  trophyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFBEB',
    borderWidth: 2,
    borderColor: '#FDE68A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SeniorTheme.spacing.md,
  },
  trophyText: {
    fontSize: 44,
  },
  completionTitle: {
    fontSize: SeniorTheme.typography.titleMedium,
    fontWeight: '800',
    color: SeniorTheme.colors.richEmerald,
    textAlign: 'center',
    marginBottom: SeniorTheme.spacing.sm,
  },
  completionDesc: {
    fontSize: SeniorTheme.typography.body,
    color: SeniorTheme.colors.deepForest,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SeniorTheme.spacing.lg,
  },
  actionBtnMargin: {
    width: '100%',
    marginBottom: SeniorTheme.spacing.sm,
  },
  /* Dashboard Styles */
  dashboardContainer: {
    paddingTop: SeniorTheme.spacing.sm,
  },
  dashboardHeroCard: {
    marginBottom: SeniorTheme.spacing.md,
    borderRadius: SeniorTheme.radii.card,
  },
  dashboardHeading: {
    fontSize: SeniorTheme.typography.titleMedium,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
    marginBottom: 4,
  },
  dashboardSubheading: {
    fontSize: SeniorTheme.typography.bodySmall,
    color: SeniorTheme.colors.textDim,
    marginBottom: SeniorTheme.spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SeniorTheme.spacing.lg,
  },
  accuracyCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#F0FDF4',
    borderWidth: 3,
    borderColor: SeniorTheme.colors.richEmerald,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accuracyNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: SeniorTheme.colors.richEmerald,
  },
  accuracyLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: SeniorTheme.colors.deepForest,
    textAlign: 'center',
  },
  statsSummaryColumn: {
    flex: 1,
    gap: 6,
  },
  statsDetailLine: {
    fontSize: SeniorTheme.typography.body,
    fontWeight: '600',
    color: SeniorTheme.colors.deepForest,
  },
  dashboardSectionCard: {
    marginBottom: SeniorTheme.spacing.md,
  },
  sectionHeaderTitle: {
    fontSize: SeniorTheme.typography.bodyLarge,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
    marginBottom: 4,
  },
  sectionHeaderSubtitle: {
    fontSize: SeniorTheme.typography.bodySmall,
    color: SeniorTheme.colors.textDim,
    marginBottom: SeniorTheme.spacing.sm,
  },
  emptyNoteText: {
    fontSize: SeniorTheme.typography.body,
    color: SeniorTheme.colors.textDim,
    fontStyle: 'italic',
    paddingVertical: SeniorTheme.spacing.xs,
  },
  badgesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SeniorTheme.spacing.xs,
  },
  masteredBadge: {
    backgroundColor: SeniorTheme.colors.riskSafeSurface,
    borderWidth: 1,
    borderColor: SeniorTheme.colors.riskSafe,
    paddingHorizontal: SeniorTheme.spacing.sm,
    paddingVertical: 6,
    borderRadius: SeniorTheme.radii.sm,
  },
  masteredBadgeText: {
    fontSize: SeniorTheme.typography.bodySmall,
    fontWeight: '700',
    color: SeniorTheme.colors.riskSafe,
  },
  safeHighlightBox: {
    backgroundColor: SeniorTheme.colors.riskSafeSurface,
    padding: SeniorTheme.spacing.md,
    borderRadius: SeniorTheme.radii.sm,
    borderLeftWidth: 4,
    borderLeftColor: SeniorTheme.colors.riskSafe,
  },
  safeHighlightText: {
    fontSize: SeniorTheme.typography.body,
    fontWeight: '700',
    color: SeniorTheme.colors.riskSafe,
    lineHeight: 22,
  },
  improvementsList: {
    gap: SeniorTheme.spacing.sm,
  },
  improvementItemCard: {
    backgroundColor: SeniorTheme.colors.backgroundMain,
    padding: SeniorTheme.spacing.md,
    borderRadius: SeniorTheme.radii.sm,
    borderLeftWidth: 4,
    borderLeftColor: SeniorTheme.colors.riskWarning,
    borderWidth: 1,
    borderColor: SeniorTheme.colors.borderSubtle,
  },
  improvementItemTitle: {
    fontSize: SeniorTheme.typography.body,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
    marginBottom: 4,
  },
  improvementItemAdvice: {
    fontSize: SeniorTheme.typography.bodySmall,
    color: SeniorTheme.colors.deepForest,
    lineHeight: 20,
    opacity: 0.9,
  },
});
