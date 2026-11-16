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
import { StorageService, SimulatorLearningStats } from '../services/storage';
import {
  SIMULATOR_SCENARIOS,
  SimulatorScenario,
  SimulatorChoice,
} from '../services/scamScenarios';

export interface ScamSimulatorScreenProps {
  onBack?: () => void;
}

export const ScamSimulatorScreen: React.FC<ScamSimulatorScreenProps> = ({ onBack }) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

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
            <View style={styles.progressHeaderRow}>
              <SeniorBadge
                variant="info"
                label={t('scamSimulator.progressCount', {
                  current: currentIndex + 1,
                  total: totalScenarios,
                })}
              />
              <SeniorBadge
                variant={completedIds.length >= totalScenarios ? 'safe' : 'caution'}
                label={t('scamSimulator.scoreLabel', {
                  completed: completedIds.length,
                  total: totalScenarios,
                })}
              />
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

                {/* Suspicious Situation Box */}
                <Text style={styles.situationLabel}>
                  {t('scamSimulator.scenarioDescriptionLabel')}
                </Text>
                <View style={styles.messageBox}>
                  <Text style={styles.messageText}>{getLocalizedMessage(currentScenario)}</Text>
                </View>

                {/* Question */}
                <Text style={styles.questionText}>
                  {`❓ ${getLocalizedQuestion(currentScenario)}`}
                </Text>

                {/* Choices */}
                <View style={styles.choicesList}>
                  {currentScenario.choices.map((choice) => {
                    const isSelected = selectedChoiceId === choice.id;
                    let choiceCardStyle: any = styles.choiceButton;
                    let choiceTextStyle: any = styles.choiceText;

                    if (showExplanation && isSelected) {
                      if (choice.isSafe) {
                        choiceCardStyle = [styles.choiceButton, styles.choiceSafeSelected];
                        choiceTextStyle = [styles.choiceText, styles.choiceSafeText];
                      } else {
                        choiceCardStyle = [styles.choiceButton, styles.choiceDangerSelected];
                        choiceTextStyle = [styles.choiceText, styles.choiceDangerText];
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
                      >
                        <Text style={styles.choiceIcon}>
                          {showExplanation && isSelected
                            ? choice.isSafe
                              ? '✓'
                              : '⚠️'
                            : '👉'}
                        </Text>
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
    borderRadius: SeniorTheme.radii.md,
    backgroundColor: SeniorTheme.colors.backgroundMain,
    borderWidth: 1.5,
    borderColor: SeniorTheme.colors.borderSubtle,
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
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: SeniorTheme.spacing.sm,
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
    marginBottom: 6,
  },
  messageBox: {
    backgroundColor: '#FFF9C4', // Soft warning yellow
    padding: SeniorTheme.spacing.md,
    borderRadius: SeniorTheme.radii.md,
    borderLeftWidth: 5,
    borderLeftColor: '#FBC02D',
    marginBottom: SeniorTheme.spacing.md,
  },
  messageText: {
    fontSize: SeniorTheme.typography.body,
    color: SeniorTheme.colors.deepForest,
    fontWeight: '600',
    lineHeight: 24,
  },
  questionText: {
    fontSize: SeniorTheme.typography.bodyLarge,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
    marginBottom: SeniorTheme.spacing.md,
  },
  choicesList: {
    gap: SeniorTheme.spacing.sm,
    marginBottom: SeniorTheme.spacing.md,
  },
  choiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SeniorTheme.spacing.md,
    borderRadius: SeniorTheme.radii.md,
    backgroundColor: SeniorTheme.colors.backgroundMain,
    borderWidth: 1.5,
    borderColor: SeniorTheme.colors.borderSubtle,
    minHeight: 56,
  },
  choiceSafeSelected: {
    borderColor: SeniorTheme.colors.riskSafe,
    backgroundColor: SeniorTheme.colors.riskSafeSurface,
  },
  choiceDangerSelected: {
    borderColor: SeniorTheme.colors.riskDanger,
    backgroundColor: SeniorTheme.colors.riskDangerSurface,
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
  },
  choiceSafeText: {
    color: SeniorTheme.colors.riskSafe,
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
    borderRadius: SeniorTheme.radii.md,
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
    borderRadius: SeniorTheme.radii.md,
    borderWidth: 1,
    borderColor: SeniorTheme.colors.borderSubtle,
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
    borderRadius: SeniorTheme.radii.sm,
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
  },
  trophyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF9C4',
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
    backgroundColor: SeniorTheme.colors.riskSafeSurface,
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
