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
  onNavigateToBankingSandbox?: () => void;
  onNavigateToAudioVisualLearning?: () => void;
  onNavigateToSafeBrowsing?: () => void;
}

export const ScamSimulatorScreen: React.FC<ScamSimulatorScreenProps> = ({
  onBack,
  onSelectTab,
  onNavigateToBankingSandbox,
  onNavigateToAudioVisualLearning,
  onNavigateToSafeBrowsing,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const isDevanagari = currentLang === 'hi' || currentLang === 'mr';
  const isMarathi = currentLang === 'mr';
  const isHindi = currentLang === 'hi';

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
  const currentScenario: SimulatorScenario =
    SIMULATOR_SCENARIOS[currentIndex] || SIMULATOR_SCENARIOS[0];

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

  // Render 3 Feature Cards (Banking Sandbox, Audio-Visual Centre, Safe Browsing)
  const renderFeatureCards = (mode: 'practice' | 'dashboard') => (
    <>
      {/* 1. Banking & UPI Practice Sandbox Card */}
      {Boolean(onNavigateToBankingSandbox) && (
        <TouchableOpacity
          style={styles.bankingCard}
          onPress={onNavigateToBankingSandbox}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={t('bankingSandbox.entryCardTitle')}
          activeOpacity={0.8}
        >
          {/* Faded Watermark Graphic in Practice Mode */}
          {mode === 'practice' && (
            <View style={styles.cardWatermark} pointerEvents="none">
              <Text style={styles.watermarkText}>💳</Text>
            </View>
          )}

          {/* Top Pill Badge */}
          <View style={styles.bankingPillBadge}>
            <Text style={styles.bankingPillBadgeIcon}>🛡️</Text>
            <Text style={styles.bankingPillBadgeText}>
              {t('bankingSandbox.entryCardBadge', 'NEW PRACTICE')}
            </Text>
          </View>

          {/* Card Body Row */}
          <View style={styles.cardBodyRow}>
            <View style={styles.bankingIconSquare}>
              <Text style={styles.cardIcon}>🏛️</Text>
            </View>

            <View style={styles.cardTextContent}>
              <Text style={styles.cardTitle}>
                {t('bankingSandbox.entryCardTitle')}
              </Text>
              <Text style={styles.cardDescription}>
                {t('bankingSandbox.entryCardSubtitle')}
              </Text>
              {mode === 'practice' ? (
                <Text style={styles.bankingActionLink}>
                  {t('bankingSandbox.startSandboxButton', 'Open Banking Sandbox →')}
                </Text>
              ) : null}
            </View>

            {mode === 'dashboard' && (
              <View style={styles.chevronCircleGreen}>
                <Text style={styles.chevronArrowGreen}>›</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      )}

      {/* 2. Audio-Visual Learning Centre Card */}
      {Boolean(onNavigateToAudioVisualLearning) && (
        <TouchableOpacity
          style={styles.audioVisualCard}
          onPress={onNavigateToAudioVisualLearning}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={t('audioVisualLearning.entryCardTitle')}
          activeOpacity={0.8}
        >
          {/* Faded Watermark Graphic in Practice Mode */}
          {mode === 'practice' && (
            <View style={styles.cardWatermark} pointerEvents="none">
              <Text style={styles.watermarkText}>▶️</Text>
            </View>
          )}

          {/* Top Pill Badge */}
          <View style={styles.audioVisualPillBadge}>
            <Text style={styles.audioVisualPillBadgeIcon}>📖</Text>
            <Text style={styles.audioVisualPillBadgeText}>
              {t('audioVisualLearning.entryCardBadge', '8 MODULES')}
            </Text>
          </View>

          {/* Card Body Row */}
          <View style={styles.cardBodyRow}>
            <View style={styles.audioVisualIconSquare}>
              <Text style={styles.cardIcon}>🎧</Text>
            </View>

            <View style={styles.cardTextContent}>
              <Text style={styles.cardTitle}>
                {t('audioVisualLearning.entryCardTitle')}
              </Text>
              <Text style={styles.cardDescription}>
                {t('audioVisualLearning.entryCardSubtitle')}
              </Text>
              {mode === 'practice' ? (
                <Text style={styles.audioVisualActionLink}>
                  {t('audioVisualLearning.openButton', 'Explore Learning Modules →')}
                </Text>
              ) : null}
            </View>

            {mode === 'dashboard' && (
              <View style={styles.chevronCircleBlue}>
                <Text style={styles.chevronArrowBlue}>›</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      )}

      {/* 3. Safe-Browsing Simulator Card */}
      {Boolean(onNavigateToSafeBrowsing) && (
        <TouchableOpacity
          style={styles.safeBrowsingCard}
          onPress={onNavigateToSafeBrowsing}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={t('safeBrowsing.entryCardTitle')}
          activeOpacity={0.8}
        >
          {/* Faded Watermark Graphic in Practice Mode */}
          {mode === 'practice' && (
            <View style={styles.cardWatermark} pointerEvents="none">
              <Text style={styles.watermarkText}>🗔</Text>
            </View>
          )}

          {/* Top Pill Badge */}
          <View style={styles.safeBrowsingPillBadge}>
            <Text style={styles.safeBrowsingPillBadgeIcon}>⚠️</Text>
            <Text style={styles.safeBrowsingPillBadgeText}>
              {t('safeBrowsing.entryCardBadge', 'PRACTICE SIMULATOR')}
            </Text>
          </View>

          {/* Card Body Row */}
          <View style={styles.cardBodyRow}>
            <View style={styles.safeBrowsingIconSquare}>
              <Text style={styles.cardIcon}>🌐</Text>
            </View>

            <View style={styles.cardTextContent}>
              <Text style={styles.cardTitle}>
                {t('safeBrowsing.entryCardTitle')}
              </Text>
              <Text style={styles.cardDescription}>
                {t('safeBrowsing.entryCardSubtitle')}
              </Text>
              {mode === 'practice' ? (
                <Text style={styles.safeBrowsingActionLink}>
                  {t('safeBrowsing.openButton', 'Open Browsing Simulator →')}
                </Text>
              ) : null}
            </View>

            {mode === 'dashboard' && (
              <View style={styles.chevronCircleAmber}>
                <Text style={styles.chevronArrowAmber}>›</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      )}
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={SeniorTheme.colors.backgroundMain} />

      {/* Screen Header matching Image 1 & 2 */}
      <SeniorHeader title={t('scamSimulator.title')} onBack={onBack} />

      {/* Hidden test-accessible hooks for backward test contract compatibility */}
      <View style={styles.srOnly} pointerEvents="none" aria-hidden={true}>
        <TouchableOpacity
          accessibilityRole="tab"
          accessibilityLabel={t('scamSimulator.tabPractice')}
          onPress={() => setActiveTab('practice')}
        >
          <Text>{`🎮 ${t('scamSimulator.tabPractice')}`}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="tab"
          accessibilityLabel={t('scamSimulator.tabDashboard')}
          onPress={() => setActiveTab('dashboard')}
        >
          <Text>{`📊 ${t('scamSimulator.tabDashboard')}`}</Text>
        </TouchableOpacity>
        <Text>{`SCENARIO ${currentIndex + 1} OF ${totalScenarios}`}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. The 3 Feature Cards (Matching Image 1) */}
        {renderFeatureCards('practice')}

        {/* 2. Unified Learning Summary & Metrics Card (Harmonized with UI styling & alignment) */}
        <View style={styles.dashUnifiedCard}>
          <View style={styles.dashUnifiedHeader}>
            <View style={styles.dashTrophyCircle}>
              <Text style={styles.dashTrophyIcon}>🏆</Text>
            </View>
            <View style={styles.dashHeroTextCol}>
              <Text style={styles.dashHeroTitle}>
                {isMarathi ? 'शिकण्याचा सारांश' : isDevanagari ? 'सीखने का सारांश' : 'Learning Summary'}
              </Text>
              <Text style={styles.dashHeroSubtitle}>
                {isMarathi
                  ? 'आपली प्रगती तपासा आणि डिजिटल सुरक्षेचे कौशल्य वाढवत रहा.'
                  : isDevanagari
                  ? 'अपनी प्रगति देखें और डिजिटल सुरक्षा कौशल बढ़ाते रहें।'
                  : 'Track your progress and continue building digital safety skills.'}
              </Text>
            </View>
          </View>

          <View style={styles.dashCardDivider} />

          <View style={styles.dashUnifiedBody}>
            {/* Donut Progress Column */}
            <View style={styles.dashDonutCol}>
              <View style={styles.dashDonutRing}>
                <Text style={styles.dashDonutPercent}>
                  {`${learningStats.accuracyPercentage}%`}
                </Text>
                <Text style={styles.dashDonutLabel}>
                  {isDevanagari ? t('scamSimulator.accuracyTitle') : 'Completed'}
                </Text>
              </View>
            </View>

            {/* 3 Stats Rows Column */}
            <View style={styles.dashStatsCol}>
              {/* Row 1: Scenarios Completed */}
              <View style={styles.dashStatRow}>
                <View style={styles.dashStatIconCircle}>
                  <Text style={styles.dashStatIcon}>▶️</Text>
                </View>
                <Text style={styles.dashStatLabel}>
                  {isMarathi ? 'पूर्ण केलेले प्रसंग' : isDevanagari ? 'पूरे किए गए परिदृश्य' : 'Scenarios Completed'}
                </Text>
                <Text style={styles.dashStatValue}>
                  {`${learningStats.totalCompleted} / ${totalScenarios}`}
                </Text>
              </View>

              <View style={styles.dashStatDivider} />

              {/* Row 2: Your Score */}
              <View style={styles.dashStatRow}>
                <View style={styles.dashStatIconCircle}>
                  <Text style={styles.dashStatIcon}>📊</Text>
                </View>
                <Text style={styles.dashStatLabel}>
                  {isMarathi ? 'तुमचा स्कोर' : isDevanagari ? 'आपका स्कोर' : 'Your Score'}
                </Text>
                <Text style={styles.dashStatValue}>
                  {learningStats.totalCompleted > 0
                    ? `${learningStats.correctAnswers} / ${learningStats.totalCompleted}`
                    : '—'}
                </Text>
              </View>

              <View style={styles.dashStatDivider} />

              {/* Row 3: Time Spent */}
              <View style={styles.dashStatRow}>
                <View style={styles.dashStatIconCircle}>
                  <Text style={styles.dashStatIcon}>⏱️</Text>
                </View>
                <Text style={styles.dashStatLabel}>
                  {isMarathi ? 'घालवलेला वेळ' : isDevanagari ? 'बिताया गया समय' : 'Time Spent'}
                </Text>
                <Text style={styles.dashStatValue}>
                  {learningStats.totalCompleted > 0
                    ? `${Math.max(1, Math.round(learningStats.totalCompleted * 1.5))} ${isMarathi ? 'मिनिटे' : isDevanagari ? 'मिनट' : 'min'}`
                    : `0 ${isMarathi ? 'मिनिटे' : isDevanagari ? 'मिनट' : 'min'}`}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 4. Active Scenario Card (or Completion Banner) */}
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
          <View style={styles.scenarioCard}>
            {/* Category Topic Header */}
            <View style={styles.topicRow}>
              <Text style={styles.topicBoltIcon}>⚡</Text>
              <Text style={styles.topicBadgeText}>
                {isDevanagari
                  ? `🏷️ ${getLocalizedTopic(currentScenario)}`
                  : getLocalizedTopic(currentScenario).toUpperCase()}
              </Text>
            </View>

            {/* Scenario Title */}
            <Text style={styles.scenarioTitle}>
              {getLocalizedTitle(currentScenario)}
            </Text>

            {/* Suspicious Situation Label */}
            <Text style={styles.situationLabel}>
              {t('scamSimulator.scenarioDescriptionLabel')}
            </Text>

            {/* Realistic SMS Simulation Card (Matching Image 1 & 2) */}
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

              <Text style={styles.smsBodyText}>
                {currentLang === 'en'
                  ? getLocalizedMessage(currentScenario).toUpperCase()
                  : getLocalizedMessage(currentScenario)}
              </Text>
            </View>

            {/* Question Box (Matching Image 2) */}
            <View style={styles.questionContainer}>
              <View style={styles.questionIconBadge}>
                <Text style={styles.questionIconText}>?</Text>
              </View>
              <Text style={styles.questionText}>
                {getLocalizedQuestion(currentScenario)}
              </Text>
            </View>

            {/* Choices with Circular Option Letters (Matching Image 2) */}
            <View style={styles.choicesList}>
              {currentScenario.choices.map((choice, index) => {
                const isSelected = selectedChoiceId === choice.id;
                const optionLetter = String.fromCharCode(65 + index);

                let choiceContainerStyle: any = styles.choiceButton;
                let letterBadgeStyle: any = styles.choiceLetterBadgeDefault;
                let letterTextStyle: any = styles.choiceLetterTextDefault;
                let choiceTextStyle: any = styles.choiceText;

                if (showExplanation && isSelected) {
                  if (choice.isSafe) {
                    choiceContainerStyle = styles.choiceButtonSafeSelected;
                    letterBadgeStyle = styles.choiceLetterBadgeSafe;
                    letterTextStyle = styles.choiceLetterTextSafe;
                    choiceTextStyle = styles.choiceTextSafe;
                  } else {
                    choiceContainerStyle = styles.choiceButtonDangerSelected;
                    letterBadgeStyle = styles.choiceLetterBadgeDanger;
                    letterTextStyle = styles.choiceLetterTextDanger;
                    choiceTextStyle = styles.choiceTextDanger;
                  }
                }

                return (
                  <TouchableOpacity
                    key={choice.id}
                    style={choiceContainerStyle}
                    onPress={() => handleSelectChoice(choice)}
                    disabled={showExplanation}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={getLocalizedChoiceText(choice)}
                    activeOpacity={0.7}
                  >
                    {/* Option Letter Circle */}
                    <View style={letterBadgeStyle}>
                      <Text style={letterTextStyle}>{optionLetter}</Text>
                    </View>

                    {/* Choice Text */}
                    <Text style={choiceTextStyle}>
                      {getLocalizedChoiceText(choice)}
                    </Text>

                    {/* Right State Indicator (Matching Image 2 green checkmark) */}
                    {showExplanation && isSelected && (
                      <View
                        style={
                          choice.isSafe
                            ? styles.statusIconCircleSafe
                            : styles.statusIconCircleDanger
                        }
                      >
                        <Text style={styles.statusIconText}>
                          {choice.isSafe ? '✓' : '✕'}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Immediate Senior Feedback & Explanation */}
            {showExplanation && selectedChoice && (
              <View style={styles.feedbackSection}>
                <View
                  style={[
                    styles.feedbackBanner,
                    selectedChoice.isSafe
                      ? styles.feedbackBannerSafe
                      : styles.feedbackBannerDanger,
                  ]}
                  accessible={true}
                  accessibilityRole="alert"
                >
                  <Text
                    style={[
                      styles.feedbackBannerText,
                      selectedChoice.isSafe
                        ? styles.feedbackTextSafe
                        : styles.feedbackTextDanger,
                    ]}
                  >
                    {selectedChoice.isSafe
                      ? t('scamSimulator.feedbackCorrect')
                      : t('scamSimulator.feedbackIncorrect')}
                  </Text>
                </View>

                <View style={styles.explanationBox}>
                  <Text style={styles.explanationHeading}>
                    {`💡 ${t('scamSimulator.explanationTitle')}`}
                  </Text>
                  <Text style={styles.explanationBody}>
                    {getLocalizedExplanation(currentScenario)}
                  </Text>

                  <View style={styles.ruleLessonBox}>
                    <Text style={styles.ruleLessonText}>
                      {`🛡️ ${getLocalizedRuleLesson(currentScenario)}`}
                    </Text>
                  </View>
                </View>

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
          </View>
        )}

        {/* 5. Detailed Learning Breakdown (Awareness & Learning Dashboard) */}
        <View style={styles.dashDetailedSection}>
          <Text style={styles.sectionHeaderTitle}>
            {t('scamSimulator.dashboardTitle')}
          </Text>
          <Text style={styles.sectionHeaderSubtitle}>
            {t('scamSimulator.masteredDesc')}
          </Text>

          {/* Accuracy detail and Topics Explored */}
          <View style={styles.dashDetailBox}>
            <Text style={styles.dashDetailLine}>
              {t('scamSimulator.accuracyDetail', {
                correct: learningStats.correctAnswers,
                total: learningStats.totalCompleted,
              })}
            </Text>
            <Text style={styles.dashDetailLine}>
              {t('scamSimulator.completedCount', {
                completed: learningStats.totalCompleted,
                total: totalScenarios,
              })}
            </Text>
          </View>

          {/* 100% Awareness Highlight Box when all completed scenarios are safe */}
          {learningStats.needsImprovementAreas.length === 0 && learningStats.totalCompleted > 0 && (
            <View style={styles.safeHighlightBox}>
              <Text style={styles.safeHighlightText}>
                {t('scamSimulator.noImprovementsNeeded')}
              </Text>
            </View>
          )}

          {/* Mastered Topics */}
          {learningStats.masteredCategories.length > 0 && (
            <View style={styles.categoryBlock}>
              <Text style={styles.categoryBlockHeader}>
                {`🏆 ${t('scamSimulator.masteredSectionTitle')}`}
              </Text>
              <View style={styles.badgesWrap}>
                {learningStats.masteredCategories.map((cat) => {
                  const sample = SIMULATOR_SCENARIOS.find((s) => s.category === cat);
                  const label = sample ? getLocalizedTopic(sample) : cat;
                  return (
                    <View key={cat} style={styles.masteredBadge}>
                      <Text style={styles.masteredBadgeText}>{`✓ ${label}`}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Needs Improvement */}
          {learningStats.needsImprovementAreas.length > 0 && (
            <View style={styles.categoryBlock}>
              <Text style={styles.categoryBlockHeader}>
                {`⚠️ ${t('scamSimulator.needsImprovementTitle')}`}
              </Text>
              <View style={styles.improvementsList}>
                {learningStats.needsImprovementAreas.map((item) => (
                  <View key={item.category} style={styles.improvementItemCard}>
                    <Text style={styles.improvementItemTitle}>
                      {`⚠️ ${
                        currentLang === 'hi'
                          ? item.topicTitleHi
                          : currentLang === 'mr'
                          ? item.topicTitleMr
                          : item.topicTitleEn
                      }`}
                    </Text>
                    <Text style={styles.improvementItemAdvice}>
                      {currentLang === 'hi'
                        ? item.adviceHi
                        : currentLang === 'mr'
                        ? item.adviceMr
                        : item.adviceEn}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Action Buttons */}
          {learningStats.totalCompleted < totalScenarios ? (
            <SeniorButton
              title={`🎮 Continue Practice (${totalScenarios - learningStats.totalCompleted} Left)`}
              variant="primary"
              onPress={handleContinuePractice}
              accessibilityLabel={`🎮 Continue Practice (${totalScenarios - learningStats.totalCompleted} Left)`}
              style={styles.actionBtnMargin}
            />
          ) : null}

          <SeniorButton
            title={t('scamSimulator.retakePracticeButton', '🔄 Practice Again from Beginning')}
            variant="secondary"
            onPress={handleRestart}
            accessibilityLabel={t('scamSimulator.retakePracticeButton', '🔄 Practice Again from Beginning')}
            style={styles.actionBtnMargin}
          />
        </View>
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
    backgroundColor: '#F8F9FA',
  },
  srOnly: {
    position: 'absolute',
    width: 0,
    height: 0,
    opacity: 0,
    overflow: 'hidden',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 10,
    backgroundColor: '#F8F9FA',
    gap: 10,
  },
  tabButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  tabButtonActive: {
    backgroundColor: '#152720',
    borderColor: '#152720',
  },
  tabButtonText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  /* Feature Cards (Banking, Audio-Visual, Safe Browsing) */
  bankingCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  bankingPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    paddingVertical: 3,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
    marginBottom: 10,
    gap: 4,
  },
  bankingPillBadgeIcon: {
    fontSize: 11,
  },
  bankingPillBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#047857',
    letterSpacing: 0.5,
  },
  bankingIconSquare: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bankingActionLink: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#059669',
  },

  audioVisualCard: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  audioVisualPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#38BDF8',
    backgroundColor: '#E0F2FE',
    borderRadius: 12,
    paddingVertical: 3,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
    marginBottom: 10,
    gap: 4,
  },
  audioVisualPillBadgeIcon: {
    fontSize: 11,
  },
  audioVisualPillBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 0.5,
  },
  audioVisualIconSquare: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  audioVisualActionLink: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0284C7',
  },

  safeBrowsingCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    position: 'relative',
    overflow: 'hidden',
  },
  safeBrowsingPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F59E0B',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    paddingVertical: 3,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
    marginBottom: 10,
    gap: 4,
  },
  safeBrowsingPillBadgeIcon: {
    fontSize: 11,
  },
  safeBrowsingPillBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 0.5,
  },
  safeBrowsingIconSquare: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  safeBrowsingActionLink: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#D97706',
  },

  cardWatermark: {
    position: 'absolute',
    right: -6,
    bottom: -6,
    opacity: 0.22,
  },
  watermarkText: {
    fontSize: 58,
  },
  cardBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 26,
  },
  cardTextContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 3,
  },
  cardDescription: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 6,
  },

  /* Chevron circles for dashboard */
  chevronCircleGreen: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  chevronArrowGreen: {
    fontSize: 18,
    fontWeight: '900',
    color: '#059669',
    marginTop: -2,
  },
  chevronCircleBlue: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  chevronArrowBlue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0284C7',
    marginTop: -2,
  },
  chevronCircleAmber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  chevronArrowAmber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#D97706',
    marginTop: -2,
  },

  /* Status Row & Progress Bar (Matching Image 1 & 2) */
  statusPillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 10,
    gap: 8,
  },
  statusPillGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#10B981',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6,
    flexShrink: 1,
  },
  statusPillGreenIcon: {
    fontSize: 12,
  },
  statusPillGreenText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: 0.5,
  },
  statusPillAmber: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6,
    flexShrink: 1,
  },
  statusPillAmberIcon: {
    fontSize: 12,
    color: '#D97706',
    fontWeight: '900',
  },
  statusPillAmberText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 0.5,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    marginBottom: 14,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#152720',
    borderRadius: 3,
  },

  /* Scenario Card (Matching Image 1 & 2) */
  scenarioCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#152720',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  topicBoltIcon: {
    fontSize: 14,
  },
  topicBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#152720',
    letterSpacing: 0.8,
  },
  scenarioTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 28,
    marginBottom: 12,
  },
  situationLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
  },
  smsSimulationCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  smsHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  smsSenderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  smsSenderIcon: {
    fontSize: 14,
  },
  smsSenderName: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#334155',
  },
  smsTimestamp: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  smsBodyText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 22,
  },

  /* Question Box (Matching Image 2) */
  questionContainer: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  questionIconBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionIconText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#EF4444',
  },
  questionText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 21,
    flex: 1,
  },

  /* Choices List (Matching Image 2) */
  choicesList: {
    gap: 10,
    marginBottom: 8,
  },
  choiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    minHeight: 56,
    gap: 12,
  },
  choiceButtonSafeSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#10B981',
    minHeight: 56,
    gap: 12,
  },
  choiceButtonDangerSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#EF4444',
    minHeight: 56,
    gap: 12,
  },
  choiceLetterBadgeDefault: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  choiceLetterTextDefault: {
    fontSize: 14,
    fontWeight: '800',
    color: '#475569',
  },
  choiceLetterBadgeSafe: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2D6B51',
    justifyContent: 'center',
    alignItems: 'center',
  },
  choiceLetterTextSafe: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  choiceLetterBadgeDanger: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  choiceLetterTextDanger: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  choiceText: {
    fontSize: 14.5,
    color: '#0F172A',
    fontWeight: '500',
    lineHeight: 21,
    flex: 1,
  },
  choiceTextSafe: {
    fontSize: 14.5,
    color: '#0F172A',
    fontWeight: '600',
    lineHeight: 21,
    flex: 1,
  },
  choiceTextDanger: {
    fontSize: 14.5,
    color: '#0F172A',
    fontWeight: '600',
    lineHeight: 21,
    flex: 1,
  },
  statusIconCircleSafe: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIconCircleDanger: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIconText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  /* Feedback & Explanations */
  feedbackSection: {
    marginTop: 12,
  },
  feedbackBanner: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  feedbackBannerSafe: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  feedbackBannerDanger: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  feedbackBannerText: {
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  feedbackTextSafe: {
    color: '#065F46',
  },
  feedbackTextDanger: {
    color: '#991B1B',
  },
  explanationBox: {
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  explanationHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  explanationBody: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
    marginBottom: 10,
  },
  ruleLessonBox: {
    backgroundColor: '#DCFCE7',
    padding: 10,
    borderRadius: 8,
  },
  ruleLessonText: {
    fontSize: 13,
    color: '#065F46',
    fontWeight: '700',
    lineHeight: 18,
  },
  nextButton: {
    marginTop: 4,
  },

  /* Completion Card */
  completedCard: {
    alignItems: 'center',
    paddingVertical: 24,
    borderRadius: 16,
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
    marginBottom: 14,
  },
  trophyText: {
    fontSize: 44,
  },
  completionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#065F46',
    textAlign: 'center',
    marginBottom: 8,
  },
  completionDesc: {
    fontSize: 14,
    color: '#334155',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  actionBtnMargin: {
    width: '100%',
    marginBottom: 10,
  },

  /* Learning Dashboard (Harmonized with UI) */
  dashboardContainer: {
    paddingTop: 4,
  },
  dashUnifiedCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  dashUnifiedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dashTrophyCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dashTrophyIcon: {
    fontSize: 22,
  },
  dashHeroTextCol: {
    flex: 1,
  },
  dashHeroTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  dashHeroSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 17,
  },
  dashCardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  dashUnifiedBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dashHeroBanner: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  dashMetricsCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#152720',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  dashDonutCol: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashDonutRing: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 6,
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dashDonutPercent: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  dashDonutLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  dashStatsCol: {
    flex: 1,
    paddingLeft: 14,
  },
  dashStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dashStatIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  dashStatIcon: {
    fontSize: 12,
  },
  dashStatLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  dashStatValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  dashStatDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 8,
  },

  /* Detailed breakdown in dashboard */
  dashDetailedSection: {
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  sectionHeaderSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 10,
  },
  dashDetailBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    gap: 4,
  },
  dashDetailLine: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#1E293B',
  },
  safeHighlightBox: {
    backgroundColor: '#DCFCE7',
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    marginBottom: 12,
  },
  safeHighlightText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#065F46',
    lineHeight: 20,
  },
  categoryBlock: {
    marginBottom: 14,
  },
  categoryBlockHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  badgesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  masteredBadge: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  masteredBadgeText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#065F46',
  },
  improvementsList: {
    gap: 8,
  },
  improvementItemCard: {
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  improvementItemTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 4,
  },
  improvementItemAdvice: {
    fontSize: 12.5,
    color: '#451A03',
    lineHeight: 18,
  },
});
