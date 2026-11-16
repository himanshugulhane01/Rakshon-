import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  Clipboard,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SeniorTheme } from '../theme';
import { SeniorHeader } from '../components/SeniorHeader';
import { SeniorCard } from '../components/SeniorCard';
import { SeniorButton } from '../components/SeniorButton';
import { SeniorInput } from '../components/SeniorInput';
import { SeniorBadge } from '../components/SeniorBadge';
import {
  AnalysisApiService,
  AnalysisApiError,
  MessageAnalysisResponse,
} from '../services/analysisApi';

export interface MessageGuardianScreenProps {
  onBack: () => void;
  onAnalysisSuccess: (result: MessageAnalysisResponse, originalText: string) => void;
  onOpenEmergency?: () => void;
}

export const MessageGuardianScreen: React.FC<MessageGuardianScreenProps> = ({
  onBack,
  onAnalysisSuccess,
  onOpenEmergency,
}) => {
  const { t, i18n } = useTranslation();
  const [messageText, setMessageText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [screenshotStatus, setScreenshotStatus] = useState<string | null>(null);

  const handlePaste = async () => {
    try {
      const clipboardContent = await Clipboard.getString();
      if (clipboardContent && clipboardContent.trim().length > 0) {
        setMessageText(clipboardContent.trim().slice(0, 2000));
        setErrorMessage(null);
      }
    } catch {
      // Handle clipboard read gracefully
    }
  };

  const handleClear = () => {
    setMessageText('');
    setErrorMessage(null);
    setScreenshotStatus(null);
  };

  const handleAnalyze = async () => {
    const trimmed = messageText.trim();
    if (!trimmed) {
      setErrorMessage(t('messageGuardian.errorEmpty'));
      return;
    }

    if (trimmed.length > 2000) {
      setErrorMessage(t('messageGuardian.errorTooLong'));
      return;
    }

    try {
      setIsAnalyzing(true);
      setErrorMessage(null);

      const userLang = (i18n.language as 'en' | 'hi' | 'mr') || 'en';
      const result = await AnalysisApiService.analyzeMessage({
        text: trimmed,
        language: userLang,
      });

      onAnalysisSuccess(result, trimmed);
    } catch (err: any) {
      if (err instanceof AnalysisApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage(
          'Unable to complete analysis. Please verify your connection and try again.'
        );
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectScreenshot = () => {
    // In Stage 3.4, native photo picker / OCR notice provides senior guidance
    setScreenshotStatus(t('messageGuardian.ocrPreparationNotice'));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={SeniorTheme.colors.backgroundMain} />

      <SeniorHeader
        title={t('messageGuardian.title')}
        subtitle={t('messageGuardian.subtitle')}
        onBack={onBack}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Privacy First Pill */}
          <View style={styles.privacyRow}>
            <SeniorBadge
              label={t('messageGuardian.privacyPill')}
              variant="safe"
              icon="🔒"
            />
          </View>

          {/* Main Input Card */}
          <SeniorCard variant="elevated" style={styles.inputCard}>
            <SeniorInput
              label={t('messageGuardian.inputLabel')}
              value={messageText}
              onChangeText={(text) => {
                setMessageText(text);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder={t('messageGuardian.inputPlaceholder')}
              multiline={true}
              numberOfLines={5}
              maxLength={2000}
              accessibilityLabel={t('messageGuardian.inputLabel')}
              accessibilityHint="Type or paste the suspicious message here"
            />

            {/* Quick Action Button Row: Paste & Clear */}
            <View style={styles.inputToolsRow}>
              <TouchableOpacity
                onPress={handlePaste}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={t('messageGuardian.pasteButton')}
                accessibilityHint="Pastes copied text from your clipboard into the input"
                style={styles.toolButton}
              >
                <Text style={styles.toolButtonText}>
                  {t('messageGuardian.pasteButton')}
                </Text>
              </TouchableOpacity>

              {messageText.length > 0 && (
                <TouchableOpacity
                  onPress={handleClear}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={t('messageGuardian.clearButton')}
                  accessibilityHint="Clears the entered message text"
                  style={styles.toolButtonClear}
                >
                  <Text style={styles.toolButtonClearText}>
                    {t('messageGuardian.clearButton')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Character Count */}
            <Text style={styles.charCountText}>
              {messageText.length} / 2,000
            </Text>

            {/* Error Banner with Retry */}
            {Boolean(errorMessage) && (
              <View
                style={styles.errorBanner}
                accessible={true}
                accessibilityLiveRegion="polite"
              >
                <Text style={styles.errorBannerText}>{`⚠️ ${errorMessage}`}</Text>
                <SeniorButton
                  title={t('messageGuardian.retryButton')}
                  variant="outline"
                  onPress={handleAnalyze}
                  style={styles.retryButton}
                />
              </View>
            )}

            {/* Primary Action Button */}
            <SeniorButton
              title={
                isAnalyzing
                  ? t('messageGuardian.analyzing')
                  : t('messageGuardian.analyzeButton')
              }
              variant="primary"
              onPress={handleAnalyze}
              loading={isAnalyzing}
              disabled={isAnalyzing}
              accessibilityLabel={t('messageGuardian.analyzeButton')}
              accessibilityHint="Sends the message for rule-based scam analysis"
              style={styles.analyzeButton}
            />
          </SeniorCard>

          {/* Screenshot & Android Sharesheet Guidance Card */}
          <SeniorCard variant="outlined" style={styles.guidanceCard}>
            <View style={styles.guidanceHeaderRow}>
              <Text style={styles.guidanceIcon}>📸</Text>
              <Text style={styles.guidanceTitle}>
                {t('messageGuardian.screenshotNoticeTitle')}
              </Text>
            </View>
            <Text style={styles.guidanceDesc}>
              {t('messageGuardian.screenshotNoticeDesc')}
            </Text>

            <SeniorButton
              title={t('messageGuardian.pickScreenshotButton')}
              variant="outline"
              onPress={handleSelectScreenshot}
              accessibilityLabel={t('messageGuardian.pickScreenshotButton')}
              accessibilityHint="Select a screenshot of a suspicious message"
              style={styles.screenshotBtn}
            />

            {Boolean(screenshotStatus) && (
              <Text style={styles.screenshotStatusText}>
                ℹ️ {screenshotStatus}
              </Text>
            )}
          </SeniorCard>

          {/* Privacy Transparency Footer */}
          <View style={styles.privacyFooter}>
            <Text style={styles.privacyFooterText}>
              🛡️ {t('messageGuardian.privacyNote')}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SeniorTheme.colors.backgroundMain,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SeniorTheme.spacing.lg,
    paddingVertical: SeniorTheme.spacing.md,
  },
  privacyRow: {
    marginBottom: SeniorTheme.spacing.sm,
  },
  inputCard: {
    padding: SeniorTheme.spacing.lg,
    marginBottom: SeniorTheme.spacing.lg,
  },
  inputToolsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: SeniorTheme.spacing.xs,
  },
  toolButton: {
    minHeight: 48,
    paddingHorizontal: SeniorTheme.spacing.md,
    backgroundColor: '#F0F9F5',
    borderRadius: SeniorTheme.radii.sm,
    borderWidth: 1.5,
    borderColor: SeniorTheme.colors.emeraldLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolButtonText: {
    fontSize: SeniorTheme.typography.bodySmall,
    fontWeight: '700',
    color: SeniorTheme.colors.richEmerald,
  },
  toolButtonClear: {
    minHeight: 48,
    paddingHorizontal: SeniorTheme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolButtonClearText: {
    fontSize: SeniorTheme.typography.bodySmall,
    fontWeight: '700',
    color: SeniorTheme.colors.textDim,
  },
  charCountText: {
    fontSize: SeniorTheme.typography.caption,
    color: SeniorTheme.colors.textDim,
    textAlign: 'right',
    marginBottom: SeniorTheme.spacing.md,
  },
  errorBanner: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1.5,
    borderColor: SeniorTheme.colors.riskDangerBorder,
    borderRadius: SeniorTheme.radii.md,
    padding: SeniorTheme.spacing.md,
    marginBottom: SeniorTheme.spacing.md,
  },
  errorBannerText: {
    fontSize: SeniorTheme.typography.bodySmall,
    color: SeniorTheme.colors.riskDanger,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: SeniorTheme.spacing.sm,
  },
  retryButton: {
    minHeight: 44,
  },
  analyzeButton: {
    minHeight: SeniorTheme.dimensions.minTouchTarget + 8,
  },
  guidanceCard: {
    padding: SeniorTheme.spacing.lg,
    marginBottom: SeniorTheme.spacing.lg,
  },
  guidanceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SeniorTheme.spacing.xs,
  },
  guidanceIcon: {
    fontSize: 22,
    marginRight: SeniorTheme.spacing.xs,
  },
  guidanceTitle: {
    fontSize: SeniorTheme.typography.bodyLarge,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
  },
  guidanceDesc: {
    fontSize: SeniorTheme.typography.bodySmall,
    color: SeniorTheme.colors.textDim,
    lineHeight: 22,
    marginBottom: SeniorTheme.spacing.md,
  },
  screenshotBtn: {
    minHeight: 48,
  },
  screenshotStatusText: {
    fontSize: SeniorTheme.typography.caption,
    color: SeniorTheme.colors.deepForest,
    marginTop: SeniorTheme.spacing.sm,
    lineHeight: 18,
  },
  privacyFooter: {
    alignItems: 'center',
    paddingVertical: SeniorTheme.spacing.md,
  },
  privacyFooterText: {
    fontSize: SeniorTheme.typography.caption,
    color: SeniorTheme.colors.textDim,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 300,
  },
});
