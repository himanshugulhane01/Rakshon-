import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SeniorTheme } from '../theme';
import { SeniorHeader } from '../components/SeniorHeader';
import { SeniorButton } from '../components/SeniorButton';
import { SeniorCard } from '../components/SeniorCard';
import { SeniorBadge } from '../components/SeniorBadge';
import { SeniorInput } from '../components/SeniorInput';
import { SeniorDialog } from '../components/SeniorDialog';
import {
  VoiceGuardianService,
  VoiceState,
  VoiceLanguage,
  VoiceError,
} from '../services/voiceGuardianService';
import { AnalysisApiService, MessageAnalysisResponse } from '../services/analysisApi';

export interface VoiceGuardianScreenProps {
  onBack?: () => void;
  onNavigateToEmergency?: () => void;
}

export const VoiceGuardianScreen: React.FC<VoiceGuardianScreenProps> = ({
  onBack,
  onNavigateToEmergency,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language as VoiceLanguage) || 'en';

  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcribedText, setTranscribedText] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<MessageAnalysisResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Permission rationale dialog state
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState<boolean>(false);

  // Samples for quick voice practice/evaluation in senior's language
  const quickSamples = {
    en: {
      electricity:
        'Urgent: Your electricity bill was not paid. Power will be disconnected tonight at 9:30 PM. Call officer at 9876543210 immediately.',
      police:
        'Attention: This is Crime Branch. A parcel with drugs was seized in your name. You are placed under Digital Arrest.',
      otp: 'Your SBI OTP is 492018 for login. Never share this OTP with anyone, including bank staff.',
    },
    hi: {
      electricity:
        'प्रिय ग्राहक आपका बिजली बिल अपडेट नहीं हुआ है आज रात 9:30 बजे कनेक्शन काट दिया जाएगा। तुरंत 9876543210 पर संपर्क करें।',
      police:
        'सावधान यह क्राइम ब्रांच है। आपके आधार पर पार्सल में ड्रग्स मिले हैं। आप डिजिटल अरेस्ट हैं।',
      otp: 'आपका एसबीआई ओटीपी 492018 है। इसे किसी के साथ साझा न करें। बैंक कभी ओटीपी नहीं मांगता।',
    },
    mr: {
      electricity:
        'प्रिय ग्राहक तुमचे मागील वीज बिल भरले नाही. आज रात्री ९:३० वाजता वीज खंडित केली जाईल. संपर्क 9876543210.',
      police:
        'सावधान मी क्राईम ब्रँचमधून बोलत आहे. तुमच्या पार्सलमध्ये बेकायदेशीर वस्तू सापडल्या आहेत. तुम्हाला डिजिटल अटक केली आहे.',
      otp: 'आपला बँक ओटीपी 492018 आहे. कोणालाही सांगू नका. बँक कधीही ओटीपी मागत नाही.',
    },
  };

  const activeSamples = quickSamples[currentLang] || quickSamples.en;

  // Cleanup active audio/recording when leaving screen
  useEffect(() => {
    return () => {
      VoiceGuardianService.stopListening();
      VoiceGuardianService.stopSpeaking();
    };
  }, []);

  const handleToggleListening = async () => {
    setErrorMessage(null);

    if (voiceState === 'listening') {
      VoiceGuardianService.stopListening();
      setVoiceState('idle');
      return;
    }

    if (isSpeaking) {
      VoiceGuardianService.stopSpeaking();
      setIsSpeaking(false);
    }

    const hasPermission = await VoiceGuardianService.checkMicrophonePermission();
    if (!hasPermission) {
      setIsPermissionDialogOpen(true);
      return;
    }

    startRecordingFlow();
  };

  const startRecordingFlow = async () => {
    setIsPermissionDialogOpen(false);
    await VoiceGuardianService.startListening({
      language: currentLang,
      onResult: (text) => {
        setTranscribedText(text);
        setVoiceState('idle');
      },
      onError: (err: VoiceError) => {
        setVoiceState('error');
        setErrorMessage(err.message);
      },
      onStateChange: (state) => {
        setVoiceState(state);
      },
    });
  };

  const handleSimulateSample = (sampleText: string) => {
    setErrorMessage(null);
    setAnalysisResult(null);
    if (isSpeaking) {
      VoiceGuardianService.stopSpeaking();
      setIsSpeaking(false);
    }

    VoiceGuardianService.simulateSpeechResult(
      sampleText,
      (state) => setVoiceState(state),
      (text) => setTranscribedText(text)
    );
  };

  const handleAnalyzeSpokenMessage = async () => {
    if (!transcribedText || transcribedText.trim().length === 0) {
      setErrorMessage(t('voiceGuardian.errorEmpty'));
      return;
    }

    try {
      setIsAnalyzing(true);
      setErrorMessage(null);
      if (isSpeaking) {
        VoiceGuardianService.stopSpeaking();
        setIsSpeaking(false);
      }

      const result = await AnalysisApiService.analyzeMessage({
        text: transcribedText.trim(),
        language: currentLang,
      });
      setAnalysisResult(result);

      // Auto-narrate safety summary aloud to assist seniors
      const spokenSummary = VoiceGuardianService.generateSpokenSummary(result, currentLang);
      VoiceGuardianService.speak(spokenSummary, {
        language: currentLang,
        onStart: () => setIsSpeaking(true),
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    } catch {
      setErrorMessage(t('voiceGuardian.errorNetwork'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleToggleSpeakAdvice = () => {
    if (isSpeaking) {
      VoiceGuardianService.stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    if (!analysisResult) return;

    const spokenSummary = VoiceGuardianService.generateSpokenSummary(
      analysisResult,
      currentLang
    );

    VoiceGuardianService.speak(spokenSummary, {
      language: currentLang,
      onStart: () => setIsSpeaking(true),
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleClear = () => {
    VoiceGuardianService.stopListening();
    VoiceGuardianService.stopSpeaking();
    setTranscribedText('');
    setAnalysisResult(null);
    setErrorMessage(null);
    setIsSpeaking(false);
    setVoiceState('idle');
  };

  const getStatusBadge = () => {
    switch (voiceState) {
      case 'listening':
        return { variant: 'danger' as const, label: t('voiceGuardian.stateListening') };
      case 'processing':
        return { variant: 'caution' as const, label: t('voiceGuardian.stateProcessing') };
      case 'speaking':
        return { variant: 'safe' as const, label: t('voiceGuardian.stateSpeaking') };
      case 'error':
        return { variant: 'danger' as const, label: t('voiceGuardian.stateError') };
      default:
        return { variant: 'info' as const, label: t('voiceGuardian.stateIdle') };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={SeniorTheme.colors.backgroundMain} />

      <SeniorHeader title={t('voiceGuardian.title')} onBack={onBack} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* SECTION 1: Voice Input Microphone Center */}
        <SeniorCard variant="elevated" style={styles.micCard}>
          <Text style={styles.micSubtitle}>{t('voiceGuardian.subtitle')}</Text>

          {/* Status Badge */}
          <View style={styles.statusBadgeRow}>
            <SeniorBadge variant={statusBadge.variant} label={statusBadge.label} />
          </View>

          {/* Large Senior-Friendly Microphone Button */}
          <View style={styles.micButtonContainer}>
            <TouchableOpacity
              onPress={handleToggleListening}
              style={[
                styles.largeMicButton,
                voiceState === 'listening' && styles.largeMicButtonActive,
                voiceState === 'speaking' && styles.largeMicButtonSpeaking,
              ]}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={
                voiceState === 'listening'
                  ? t('voiceGuardian.micButtonStop')
                  : t('voiceGuardian.micButtonStart')
              }
              accessibilityHint="Starts or stops recording your voice"
            >
              <Text style={styles.micIcon}>
                {voiceState === 'listening' ? '⏹️' : voiceState === 'speaking' ? '🔊' : '🎤'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.micButtonLabel}>
            {voiceState === 'listening'
              ? t('voiceGuardian.micButtonStop')
              : voiceState === 'speaking'
              ? t('voiceGuardian.stopAdviceButton')
              : t('voiceGuardian.micButtonStart')}
          </Text>

          {/* Quick Voice Practice Samples */}
          <Text style={styles.samplesTitle}>{t('voiceGuardian.quickSamplesTitle')}</Text>
          <View style={styles.samplesRow}>
            <TouchableOpacity
              style={styles.sampleChip}
              onPress={() => handleSimulateSample(activeSamples.electricity)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={t('voiceGuardian.sampleElectricity')}
            >
              <Text style={styles.sampleChipText}>{t('voiceGuardian.sampleElectricity')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sampleChip}
              onPress={() => handleSimulateSample(activeSamples.police)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={t('voiceGuardian.samplePolice')}
            >
              <Text style={styles.sampleChipText}>{t('voiceGuardian.samplePolice')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sampleChip}
              onPress={() => handleSimulateSample(activeSamples.otp)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={t('voiceGuardian.sampleOtp')}
            >
              <Text style={styles.sampleChipText}>{t('voiceGuardian.sampleOtp')}</Text>
            </TouchableOpacity>
          </View>
        </SeniorCard>

        {/* SECTION 2: Transcribed Text & Review Area */}
        <SeniorCard variant="elevated" style={styles.transcriptionCard}>
          <Text style={styles.sectionTitle}>{t('voiceGuardian.transcriptionSectionTitle')}</Text>

          <SeniorInput
            label=""
            value={transcribedText}
            onChangeText={setTranscribedText}
            placeholder={t('voiceGuardian.transcriptionPlaceholder')}
            multiline={true}
            numberOfLines={4}
            accessibilityLabel={t('voiceGuardian.transcriptionSectionTitle')}
          />

          <Text style={styles.reviewInstructionText}>
            {`ℹ️ ${t('voiceGuardian.reviewInstruction')}`}
          </Text>

          {/* Validation & Network Error Banner */}
          {Boolean(errorMessage) && (
            <View style={styles.errorContainer} accessible={true} accessibilityRole="alert">
              <Text style={styles.errorText}>{`⚠️ ${errorMessage}`}</Text>
            </View>
          )}

          {/* Action Buttons: Analyze & Clear */}
          <View style={styles.actionsRow}>
            <SeniorButton
              title={
                isAnalyzing ? t('voiceGuardian.analyzing') : t('voiceGuardian.analyzeButton')
              }
              variant="primary"
              onPress={handleAnalyzeSpokenMessage}
              loading={isAnalyzing}
              disabled={voiceState === 'listening'}
              accessibilityLabel={t('voiceGuardian.analyzeButton')}
              accessibilityHint="Submits reviewed text to the Scam Intelligence Engine"
              style={styles.actionBtn}
            />

            {Boolean(transcribedText) && (
              <SeniorButton
                title={t('voiceGuardian.clearText')}
                variant="outline"
                onPress={handleClear}
                accessibilityLabel={t('voiceGuardian.clearText')}
                style={styles.clearBtn}
              />
            )}
          </View>
        </SeniorCard>

        {/* SECTION 3: Spoken Analysis Result & TTS Voice Safety Guidance */}
        {Boolean(analysisResult) && (
          <SeniorCard variant="elevated" style={styles.resultCard}>
            <View style={styles.resultHeaderRow}>
              <Text style={styles.resultHeaderTitle}>
                {analysisResult?.risk_level === 'HIGH_RISK'
                  ? `🚨 ${t('analysisResult.dangerTitle')}`
                  : analysisResult?.risk_level === 'CAUTION'
                  ? `⚠️ ${t('analysisResult.cautionTitle')}`
                  : `🛡️ ${t('analysisResult.safeTitle')}`}
              </Text>
              <SeniorBadge
                variant={
                  analysisResult?.risk_level === 'HIGH_RISK'
                    ? 'danger'
                    : analysisResult?.risk_level === 'CAUTION'
                    ? 'caution'
                    : 'safe'
                }
                label={`Score: ${analysisResult?.risk_score}/100`}
              />
            </View>

            <Text style={styles.explanationText}>{analysisResult?.explanation}</Text>

            {analysisResult?.recommended_actions && analysisResult.recommended_actions.length > 0 && (
              <View style={styles.actionsBox}>
                <Text style={styles.actionsHeader}>
                  {`📌 ${t('analysisResult.actionsSectionTitle')}:`}
                </Text>
                {analysisResult.recommended_actions.map((actItem, idx) => (
                  <Text key={idx} style={styles.actionItemText}>{`• ${actItem}`}</Text>
                ))}
              </View>
            )}

            {/* TTS Speech Controls */}
            <View style={styles.ttsButtonRow}>
              <SeniorButton
                title={
                  isSpeaking
                    ? t('voiceGuardian.stopAdviceButton')
                    : t('voiceGuardian.listenAdviceButton')
                }
                variant={isSpeaking ? 'danger' : 'primary'}
                onPress={handleToggleSpeakAdvice}
                accessibilityLabel={
                  isSpeaking
                    ? t('voiceGuardian.stopAdviceButton')
                    : t('voiceGuardian.listenAdviceButton')
                }
                style={styles.ttsBtn}
              />
            </View>

            {/* Quick Emergency Action if High Risk */}
            {analysisResult?.risk_level === 'HIGH_RISK' && Boolean(onNavigateToEmergency) && (
              <SeniorButton
                title={t('analysisResult.emergencyButton')}
                variant="danger"
                onPress={() => onNavigateToEmergency?.()}
                accessibilityLabel={t('analysisResult.emergencyButton')}
                style={styles.emergencyBtnMargin}
              />
            )}
          </SeniorCard>
        )}

        {/* SECTION 4: Senior Privacy & Zero Secret Recording Notice */}
        <SeniorCard variant="outlined" style={styles.privacyCard}>
          <Text style={styles.privacyHeading}>🛡️ ScamShield Voice Privacy Guarantee</Text>
          <Text style={styles.privacyBody}>{`• ${t('voiceGuardian.speechVsScamNotice')}`}</Text>
          <Text style={styles.privacyBody}>{`• ${t('voiceGuardian.noAudioCallNotice')}`}</Text>
          <Text style={styles.privacyBody}>
            • Voice data is never retained, uploaded to marketing clouds, or used to build voice profiles.
          </Text>
        </SeniorCard>
      </ScrollView>

      {/* Permission Rationale Explanation Dialog */}
      <SeniorDialog
        visible={isPermissionDialogOpen}
        title={t('voiceGuardian.permissionRationaleTitle')}
        message={t('voiceGuardian.permissionRationaleDesc')}
        confirmText="Allow Microphone"
        cancelText={t('common.cancel')}
        isDestructive={false}
        onConfirm={startRecordingFlow}
        onCancel={() => setIsPermissionDialogOpen(false)}
      />
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
    paddingBottom: SeniorTheme.spacing.xxl,
  },
  micCard: {
    alignItems: 'center',
    marginBottom: SeniorTheme.spacing.xl,
    paddingVertical: SeniorTheme.spacing.xl,
  },
  micSubtitle: {
    fontSize: SeniorTheme.typography.body,
    color: SeniorTheme.colors.deepForest,
    textAlign: 'center',
    marginBottom: SeniorTheme.spacing.md,
    lineHeight: 22,
  },
  statusBadgeRow: {
    marginBottom: SeniorTheme.spacing.lg,
  },
  micButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SeniorTheme.spacing.md,
  },
  largeMicButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: SeniorTheme.colors.richEmerald,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#E8F5E9',
    elevation: 4,
  },
  largeMicButtonActive: {
    backgroundColor: SeniorTheme.colors.riskDanger,
    borderColor: '#FFEBEE',
  },
  largeMicButtonSpeaking: {
    backgroundColor: SeniorTheme.colors.emeraldLight,
    borderColor: '#E8F5E9',
  },
  micIcon: {
    fontSize: 40,
  },
  micButtonLabel: {
    fontSize: SeniorTheme.typography.bodyLarge,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
    marginBottom: SeniorTheme.spacing.lg,
    textAlign: 'center',
  },
  samplesTitle: {
    fontSize: SeniorTheme.typography.bodySmall,
    fontWeight: '700',
    color: SeniorTheme.colors.textDim,
    marginBottom: SeniorTheme.spacing.sm,
  },
  samplesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SeniorTheme.spacing.xs,
  },
  sampleChip: {
    backgroundColor: SeniorTheme.colors.backgroundMain,
    borderWidth: 1.5,
    borderColor: SeniorTheme.colors.borderSubtle,
    borderRadius: SeniorTheme.radii.full,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  sampleChipText: {
    fontSize: SeniorTheme.typography.bodySmall,
    color: SeniorTheme.colors.deepForest,
    fontWeight: '600',
  },
  transcriptionCard: {
    marginBottom: SeniorTheme.spacing.xl,
  },
  sectionTitle: {
    fontSize: SeniorTheme.typography.titleSmall,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
    marginBottom: SeniorTheme.spacing.xs,
  },
  reviewInstructionText: {
    fontSize: SeniorTheme.typography.bodySmall,
    color: SeniorTheme.colors.deepForest,
    opacity: 0.85,
    lineHeight: 20,
    marginBottom: SeniorTheme.spacing.md,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: SeniorTheme.spacing.md,
    borderRadius: SeniorTheme.radii.md,
    marginBottom: SeniorTheme.spacing.md,
  },
  errorText: {
    fontSize: SeniorTheme.typography.bodySmall,
    color: SeniorTheme.colors.riskDanger,
    fontWeight: '600',
  },
  actionsRow: {
    gap: SeniorTheme.spacing.sm,
  },
  actionBtn: {
    marginTop: SeniorTheme.spacing.xs,
  },
  clearBtn: {
    marginTop: 4,
  },
  resultCard: {
    marginBottom: SeniorTheme.spacing.xl,
    borderLeftWidth: 6,
    borderLeftColor: SeniorTheme.colors.richEmerald,
  },
  resultHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SeniorTheme.spacing.md,
  },
  resultHeaderTitle: {
    fontSize: SeniorTheme.typography.titleMedium,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
    flex: 1,
    marginRight: SeniorTheme.spacing.xs,
  },
  explanationText: {
    fontSize: SeniorTheme.typography.body,
    color: SeniorTheme.colors.deepForest,
    lineHeight: 24,
    marginBottom: SeniorTheme.spacing.md,
  },
  actionsBox: {
    backgroundColor: SeniorTheme.colors.backgroundMain,
    padding: SeniorTheme.spacing.md,
    borderRadius: SeniorTheme.radii.md,
    marginBottom: SeniorTheme.spacing.md,
  },
  actionsHeader: {
    fontSize: SeniorTheme.typography.bodySmall,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
    marginBottom: 6,
  },
  actionItemText: {
    fontSize: SeniorTheme.typography.bodySmall,
    color: SeniorTheme.colors.deepForest,
    lineHeight: 22,
    marginBottom: 4,
  },
  ttsButtonRow: {
    marginTop: SeniorTheme.spacing.xs,
  },
  ttsBtn: {
    minHeight: SeniorTheme.dimensions.minTouchTarget,
  },
  emergencyBtnMargin: {
    marginTop: SeniorTheme.spacing.md,
  },
  privacyCard: {
    backgroundColor: '#F8FAFC',
    borderColor: SeniorTheme.colors.borderSubtle,
    marginBottom: SeniorTheme.spacing.xl,
  },
  privacyHeading: {
    fontSize: SeniorTheme.typography.bodyLarge,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
    marginBottom: SeniorTheme.spacing.xs,
  },
  privacyBody: {
    fontSize: SeniorTheme.typography.bodySmall,
    color: SeniorTheme.colors.deepForest,
    opacity: 0.9,
    lineHeight: 22,
    marginBottom: 6,
  },
});
