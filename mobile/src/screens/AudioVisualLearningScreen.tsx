import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import {
  AUDIO_VISUAL_MODULES,
  LearningModule,
  LearningModuleSlide,
} from '../services/learningCentreData';
import {
  StorageService,
  AudioVisualLearningStats,
  AudioVisualModuleProgress,
} from '../services/storage';
import { VoiceGuardianService, VoiceLanguage } from '../services/voiceGuardianService';

export interface AudioVisualLearningScreenProps {
  onBack: () => void;
  initialModuleId?: string;
}

export const AudioVisualLearningScreen: React.FC<AudioVisualLearningScreenProps> = ({
  onBack,
  initialModuleId,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language as VoiceLanguage) || 'en';
  const langKey = (['en', 'hi', 'mr'].includes(currentLang) ? currentLang : 'en') as 'en' | 'hi' | 'mr';
  const isMarathi = langKey === 'mr';
  const isHindi = langKey === 'hi';

  const scrollViewRef = useRef<ScrollView>(null);

  // Stats and Progress
  const [learningStats, setLearningStats] = useState<AudioVisualLearningStats>({
    totalModules: AUDIO_VISUAL_MODULES.length,
    completedCount: 0,
    modules: {},
  });

  // Active view: 'list' or 'detail'
  const [activeModule, setActiveModule] = useState<LearningModule | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);

  // Audio / TTS state
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // Quiz state in detail view
  const [isQuizMode, setIsQuizMode] = useState<boolean>(false);
  const [selectedQuizOptionId, setSelectedQuizOptionId] = useState<string | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // Load saved progress on mount
  useEffect(() => {
    let isMounted = true;
    const loadStats = async () => {
      const stats = await StorageService.getAudioVisualProgress();
      if (isMounted) {
        setLearningStats(stats);

        if (initialModuleId) {
          const mod = AUDIO_VISUAL_MODULES.find((m) => m.id === initialModuleId);
          if (mod) {
            openModule(mod, stats);
          }
        }
      }
    };
    loadStats();

    return () => {
      isMounted = false;
      VoiceGuardianService.stopSpeaking();
    };
  }, [initialModuleId]);

  const openModule = (mod: LearningModule, stats?: AudioVisualLearningStats) => {
    VoiceGuardianService.stopSpeaking();
    setIsPlayingAudio(false);

    const moduleStats = (stats || learningStats).modules[mod.id];
    setActiveModule(mod);
    setActiveSlideIndex(moduleStats?.lastSlideIndex || 0);
    setIsQuizMode(false);
    setSelectedQuizOptionId(null);
    setQuizSubmitted(false);

    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  };

  const closeModule = () => {
    VoiceGuardianService.stopSpeaking();
    setIsPlayingAudio(false);
    setActiveModule(null);
    setIsQuizMode(false);
    setSelectedQuizOptionId(null);
    setQuizSubmitted(false);

    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  };

  // Play audio narration for active slide
  const handlePlayAudio = useCallback(() => {
    if (!activeModule) return;

    if (isPlayingAudio) {
      VoiceGuardianService.stopSpeaking();
      setIsPlayingAudio(false);
      return;
    }

    const currentSlide = activeModule.slides[activeSlideIndex];
    const script = currentSlide?.speechScript[langKey] || currentSlide?.content[langKey] || '';

    setIsPlayingAudio(true);
    VoiceGuardianService.speak(script, {
      language: langKey,
      onDone: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false),
    });
  }, [activeModule, activeSlideIndex, isPlayingAudio, langKey]);

  const handleNextSlide = async () => {
    if (!activeModule) return;
    VoiceGuardianService.stopSpeaking();
    setIsPlayingAudio(false);

    const nextIndex = activeSlideIndex + 1;
    if (nextIndex < activeModule.slides.length) {
      setActiveSlideIndex(nextIndex);
      await StorageService.saveAudioVisualModuleProgress(activeModule.id, nextIndex, false);
      const updated = await StorageService.getAudioVisualProgress();
      setLearningStats(updated);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      // Reached quiz step
      setIsQuizMode(true);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const handleSelectQuizOption = (optionId: string) => {
    if (quizSubmitted) return;
    setSelectedQuizOptionId(optionId);
  };

  const handleSubmitQuiz = async () => {
    if (!activeModule || !selectedQuizOptionId) return;

    const chosen = activeModule.quiz.options.find((o) => o.id === selectedQuizOptionId);
    const score = chosen?.isCorrect ? 100 : 50;

    setQuizSubmitted(true);
    const updated = await StorageService.saveAudioVisualModuleProgress(
      activeModule.id,
      activeModule.slides.length - 1,
      true,
      score
    );
    setLearningStats(updated);
  };

  // ================= RENDER DETAIL VIEW =================
  const renderDetailView = () => {
    if (!activeModule) return null;

    const currentSlide: LearningModuleSlide | undefined = activeModule.slides[activeSlideIndex];
    const moduleProgress = learningStats.modules[activeModule.id];

    return (
      <View style={styles.contentContainer}>
        {/* Module Header Card */}
        <SeniorCard style={styles.moduleHeaderCard}>
          <View style={styles.moduleHeaderTop}>
            <Text style={styles.moduleIconLarge}>{activeModule.icon}</Text>
            <View style={styles.moduleHeaderTextWrap}>
              <View style={styles.badgeRow}>
                {moduleProgress?.isCompleted && (
                  <SeniorBadge
                    label={t('audioVisualLearning.completedBadge', 'COMPLETED')}
                    variant="safe"
                  />
                )}
              </View>
              <Text style={styles.moduleHeaderTitle}>{activeModule.title[langKey]}</Text>
            </View>
          </View>
        </SeniorCard>

        {!isQuizMode ? (
          <>
            {/* Slide Progress Indicator */}
            <View style={styles.stepIndicatorRow}>
              <Text style={styles.stepIndicatorText}>
                {t('audioVisualLearning.slideIndicator', {
                  current: activeSlideIndex + 1,
                  total: activeModule.slides.length,
                })}
              </Text>
              <View style={styles.slideDotsRow}>
                {activeModule.slides.map((_, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.slideDot,
                      idx === activeSlideIndex && styles.slideDotActive,
                    ]}
                  />
                ))}
              </View>
            </View>

            {/* Slide Content Card */}
            {currentSlide && (
              <SeniorCard style={styles.slideCard}>
                <Text style={styles.slideHeadline}>{currentSlide.headline[langKey]}</Text>
                <Text style={styles.slideBody}>{currentSlide.content[langKey]}</Text>

                <View style={styles.tipBox}>
                  <Text style={styles.tipTitle}>
                    {t('audioVisualLearning.tipLabel', '💡 Senior Protection Tip')}
                  </Text>
                  <Text style={styles.tipText}>{currentSlide.tip[langKey]}</Text>
                </View>
              </SeniorCard>
            )}

            {/* Audio Narration Bar */}
            <SeniorCard style={styles.audioBarCard}>
              <View style={styles.audioBarTop}>
                <Text style={styles.audioBarTitle}>
                  {isPlayingAudio
                    ? t('audioVisualLearning.pauseNarration', '⏸️ Pause Voice Narration')
                    : t('audioVisualLearning.listenNarration', '🔊 Listen to Voice Narration')}
                </Text>
                {isPlayingAudio && (
                  <View style={styles.speakingWave}>
                    <Text style={styles.speakingWaveText}>
                      {isMarathi ? '🎙️ आवाज सुरू आहे...' : isHindi ? '🎙️ बोल रहे हैं...' : '🎙️ Speaking...'}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.audioControlsRow}>
                <TouchableOpacity
                  style={[
                    styles.audioButton,
                    isPlayingAudio ? styles.audioButtonActive : styles.audioButtonPlay,
                  ]}
                  onPress={handlePlayAudio}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Toggle Voice Narration"
                >
                  <Text style={styles.audioButtonText}>
                    {isPlayingAudio
                      ? (isMarathi ? '⏸️ थांबवा' : isHindi ? '⏸️ रोकें' : '⏸️ Pause')
                      : (isMarathi ? '▶️ ऑडिओ ऐका' : isHindi ? '▶️ ऑडियो सुनें' : '▶️ Play Audio')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.audioButtonSecondary}
                  onPress={() => {
                    VoiceGuardianService.stopSpeaking();
                    setIsPlayingAudio(false);
                    setTimeout(() => handlePlayAudio(), 100);
                  }}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Replay Voice Narration"
                >
                  <Text style={styles.audioButtonSecondaryText}>
                    {isMarathi ? '🔄 पुन्हा ऐका' : isHindi ? '🔄 दोबारा सुनें' : '🔄 Replay'}
                  </Text>
                </TouchableOpacity>
              </View>
            </SeniorCard>

            {/* Advance Button */}
            <SeniorButton
              title={
                activeSlideIndex + 1 < activeModule.slides.length
                  ? t('audioVisualLearning.nextSlide', 'Next Step →')
                  : t('audioVisualLearning.startQuiz', 'Take 1-Minute Quiz →')
              }
              variant="primary"
              onPress={handleNextSlide}
              style={styles.nextSlideButton}
            />
          </>
        ) : (
          /* Quiz View */
          <View style={styles.quizContainer}>
            <SeniorCard style={styles.quizCard}>
              <View style={styles.quizHeader}>
                <Text style={styles.quizBadge}>
                  {t('audioVisualLearning.quizTitle', 'Quick Reflex Check')}
                </Text>
              </View>
              <Text style={styles.quizQuestion}>{activeModule.quiz.question[langKey]}</Text>

              <View style={styles.quizOptionsList}>
                {activeModule.quiz.options.map((opt) => {
                  const isSelected = selectedQuizOptionId === opt.id;
                  let borderStyle: any = styles.quizOption;
                  if (quizSubmitted) {
                    if (opt.isCorrect) {
                      borderStyle = styles.quizOptionCorrect;
                    } else if (isSelected && !opt.isCorrect) {
                      borderStyle = styles.quizOptionWrong;
                    }
                  } else if (isSelected) {
                    borderStyle = styles.quizOptionSelected;
                  }

                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={borderStyle}
                      onPress={() => handleSelectQuizOption(opt.id)}
                      disabled={quizSubmitted}
                      accessible={true}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: isSelected }}
                    >
                      <View style={styles.radioRow}>
                        <View
                          style={[
                            styles.radioCircle,
                            isSelected && styles.radioCircleActive,
                            quizSubmitted && opt.isCorrect && styles.radioCircleCorrect,
                          ]}
                        />
                        <Text style={styles.optionText}>{opt.text[langKey]}</Text>
                      </View>

                      {quizSubmitted && isSelected && (
                        <View
                          style={[
                            styles.explanationBox,
                            opt.isCorrect ? styles.explanationBoxSafe : styles.explanationBoxDanger,
                          ]}
                        >
                          <Text
                            style={[
                              styles.explanationText,
                              opt.isCorrect ? styles.explanationTextSafe : styles.explanationTextDanger,
                            ]}
                          >
                            {opt.explanation[langKey]}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {!quizSubmitted ? (
                <SeniorButton
                  title={t('common.submit', 'Submit Answer')}
                  variant="primary"
                  onPress={handleSubmitQuiz}
                  disabled={!selectedQuizOptionId}
                  style={styles.submitQuizButton}
                />
              ) : (
                <View style={styles.goldenRuleCard}>
                  <Text style={styles.goldenRuleHeading}>
                    {t('audioVisualLearning.goldenRuleLabel', '🌟 Key Golden Rule')}
                  </Text>
                  <Text style={styles.goldenRuleBody}>
                    {activeModule.goldenRule[langKey]}
                  </Text>
                </View>
              )}
            </SeniorCard>

            <SeniorButton
              title={t('audioVisualLearning.backToModules', 'All Learning Modules')}
              variant="outline"
              onPress={closeModule}
              style={styles.backButtonBottom}
            />
          </View>
        )}
      </View>
    );
  };

  // ================= RENDER LIST VIEW =================
  const renderListView = () => {
    const completedCount = learningStats.completedCount;
    const totalCount = AUDIO_VISUAL_MODULES.length;
    const progressPercent = Math.round((completedCount / totalCount) * 100);

    return (
      <View style={styles.contentContainer}>
        {/* Progress Tracker Card */}
        <SeniorCard style={styles.overviewCard}>
          <Text style={styles.overviewTitle}>
            {t('audioVisualLearning.moduleProgressHeader', {
              completed: completedCount,
              total: totalCount,
            })}
          </Text>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.max(progressPercent, 4)}%` },
              ]}
            />
          </View>
          <Text style={styles.progressPercentText}>
            {progressPercent}% {isMarathi || isHindi ? 'पूर्ण' : 'Mastered'}
          </Text>
        </SeniorCard>

        {/* Modules List */}
        <View style={styles.modulesList}>
          {AUDIO_VISUAL_MODULES.map((mod) => {
            const modProgress = learningStats.modules[mod.id];
            const isCompleted = Boolean(modProgress?.isCompleted);
            const inProgress = Boolean(modProgress && !isCompleted && modProgress.lastSlideIndex > 0);

            return (
              <SeniorCard key={mod.id} style={styles.moduleItemCard}>
                <View style={styles.moduleItemTop}>
                  <Text style={styles.moduleItemIcon}>{mod.icon}</Text>
                  <View style={styles.moduleItemInfo}>
                    {(isCompleted || inProgress) && (
                      <View style={styles.badgeRow}>
                        {isCompleted ? (
                          <SeniorBadge
                            label={t('audioVisualLearning.completedBadge', 'COMPLETED')}
                            variant="safe"
                          />
                        ) : inProgress ? (
                          <SeniorBadge
                            label={t('audioVisualLearning.inProgressBadge', 'IN PROGRESS')}
                            variant="caution"
                          />
                        ) : null}
                      </View>
                    )}
                    <Text style={styles.moduleItemTitle}>{mod.title[langKey]}</Text>
                    <Text style={styles.moduleItemSubtitle}>{mod.subtitle[langKey]}</Text>
                  </View>
                </View>

                <View style={styles.moduleItemFooter}>
                  <Text style={styles.durationText}>
                    ⏱️ {mod.estimatedMinutes} {isMarathi ? 'मिनिटे' : isHindi ? 'मिनट' : 'mins'}
                  </Text>
                  <SeniorButton
                    title={
                      isCompleted
                        ? t('common.review', 'Review')
                        : inProgress
                        ? t('audioVisualLearning.resumeButton', 'Resume')
                        : t('audioVisualLearning.startButton', 'Start')
                    }
                    variant={isCompleted ? 'outline' : 'primary'}
                    onPress={() => openModule(mod)}
                    style={styles.moduleActionButton}
                  />
                </View>
              </SeniorCard>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={SeniorTheme.colors.backgroundMain} />
      <SeniorHeader
        title={t('audioVisualLearning.title', 'Audio-Visual Learning Centre')}
        subtitle={t(
          'audioVisualLearning.subtitle',
          'Interactive multimedia lessons with voice narration and quizzes'
        )}
        onBack={activeModule ? closeModule : onBack}
      />
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeModule ? renderDetailView() : renderListView()}
      </ScrollView>
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
    paddingBottom: 40,
  },
  contentContainer: {
    paddingTop: 8,
  },
  overviewCard: {
    marginBottom: 16,
    backgroundColor: SeniorTheme.colors.white,
    padding: 16,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: SeniorTheme.colors.textPrimary,
    marginBottom: 12,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: SeniorTheme.colors.richEmerald,
    borderRadius: 6,
  },
  progressPercentText: {
    fontSize: 14,
    color: SeniorTheme.colors.textSecondary,
    fontWeight: '600',
  },
  modulesList: {
    gap: 12,
  },
  moduleItemCard: {
    backgroundColor: SeniorTheme.colors.white,
    padding: 16,
    marginBottom: 12,
  },
  moduleItemTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  moduleItemIcon: {
    fontSize: 32,
    marginRight: 14,
  },
  moduleItemInfo: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  moduleItemTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: SeniorTheme.colors.textPrimary,
    marginBottom: 4,
  },
  moduleItemSubtitle: {
    fontSize: 14,
    color: SeniorTheme.colors.textSecondary,
    lineHeight: 20,
  },
  moduleItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  durationText: {
    fontSize: 14,
    color: SeniorTheme.colors.textSecondary,
    fontWeight: '600',
  },
  moduleActionButton: {
    minWidth: 100,
    minHeight: 44,
  },
  // Detail View styles
  moduleHeaderCard: {
    backgroundColor: SeniorTheme.colors.white,
    padding: 16,
    marginBottom: 14,
  },
  moduleHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moduleIconLarge: {
    fontSize: 40,
    marginRight: 14,
  },
  moduleHeaderTextWrap: {
    flex: 1,
  },
  moduleHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: SeniorTheme.colors.textPrimary,
  },
  stepIndicatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  stepIndicatorText: {
    fontSize: 15,
    fontWeight: '700',
    color: SeniorTheme.colors.richEmerald,
  },
  slideDotsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  slideDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#CBD5E1',
  },
  slideDotActive: {
    width: 24,
    backgroundColor: SeniorTheme.colors.richEmerald,
  },
  slideCard: {
    backgroundColor: SeniorTheme.colors.white,
    padding: 18,
    marginBottom: 14,
  },
  slideHeadline: {
    fontSize: 18,
    fontWeight: '700',
    color: SeniorTheme.colors.textPrimary,
    marginBottom: 12,
  },
  slideBody: {
    fontSize: 16,
    color: SeniorTheme.colors.textPrimary,
    lineHeight: 24,
    marginBottom: 16,
  },
  tipBox: {
    backgroundColor: '#E8F5EE',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: SeniorTheme.colors.richEmerald,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: SeniorTheme.colors.deepForest,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: SeniorTheme.colors.textPrimary,
    lineHeight: 20,
  },
  audioBarCard: {
    backgroundColor: SeniorTheme.colors.white,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  audioBarTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  audioBarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: SeniorTheme.colors.deepForest,
  },
  speakingWave: {
    backgroundColor: '#E8F5EE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  speakingWaveText: {
    fontSize: 12,
    fontWeight: '700',
    color: SeniorTheme.colors.richEmerald,
  },
  audioControlsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  audioButton: {
    flex: 2,
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioButtonPlay: {
    backgroundColor: SeniorTheme.colors.deepForest,
  },
  audioButtonActive: {
    backgroundColor: SeniorTheme.colors.richEmerald,
  },
  audioButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: SeniorTheme.colors.white,
  },
  audioButtonSecondary: {
    flex: 1,
    minHeight: 48,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioButtonSecondaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: SeniorTheme.colors.textPrimary,
  },
  nextSlideButton: {
    marginBottom: 12,
  },
  // Quiz Styles
  quizContainer: {
    marginBottom: 20,
  },
  quizCard: {
    backgroundColor: SeniorTheme.colors.white,
    padding: 18,
    marginBottom: 16,
  },
  quizHeader: {
    marginBottom: 10,
  },
  quizBadge: {
    fontSize: 14,
    fontWeight: '700',
    color: SeniorTheme.colors.richEmerald,
    textTransform: 'uppercase',
  },
  quizQuestion: {
    fontSize: 18,
    fontWeight: '700',
    color: SeniorTheme.colors.textPrimary,
    lineHeight: 26,
    marginBottom: 16,
  },
  quizOptionsList: {
    gap: 12,
    marginBottom: 16,
  },
  quizOption: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
    backgroundColor: SeniorTheme.colors.white,
  },
  quizOptionSelected: {
    borderWidth: 2,
    borderColor: SeniorTheme.colors.richEmerald,
    borderRadius: 14,
    padding: 14,
    backgroundColor: '#E8F5EE',
  },
  quizOptionCorrect: {
    borderWidth: 2,
    borderColor: SeniorTheme.colors.riskSafe,
    borderRadius: 14,
    padding: 14,
    backgroundColor: '#ECFDF5',
  },
  quizOptionWrong: {
    borderWidth: 2,
    borderColor: SeniorTheme.colors.riskDanger,
    borderRadius: 14,
    padding: 14,
    backgroundColor: '#FEF2F2',
  },
  radioRow: {
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
  radioCircleActive: {
    borderColor: SeniorTheme.colors.richEmerald,
    backgroundColor: SeniorTheme.colors.richEmerald,
  },
  radioCircleCorrect: {
    borderColor: SeniorTheme.colors.riskSafe,
    backgroundColor: SeniorTheme.colors.riskSafe,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: SeniorTheme.colors.textPrimary,
    lineHeight: 22,
    fontWeight: '500',
  },
  explanationBox: {
    marginTop: 10,
    borderRadius: 8,
    padding: 10,
  },
  explanationBoxSafe: {
    backgroundColor: '#D1FAE5',
  },
  explanationBoxDanger: {
    backgroundColor: '#FEE2E2',
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  explanationTextSafe: {
    color: '#065F46',
  },
  explanationTextDanger: {
    color: '#991B1B',
  },
  submitQuizButton: {
    marginTop: 8,
  },
  goldenRuleCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#D97706',
    marginTop: 12,
  },
  goldenRuleHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 6,
  },
  goldenRuleBody: {
    fontSize: 15,
    color: '#78350F',
    lineHeight: 22,
    fontWeight: '500',
  },
  backButtonBottom: {
    marginBottom: 20,
  },
});
