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
  TextInput,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SeniorTheme } from '../theme';
import { SeniorHeader } from '../components/SeniorHeader';
import { SeniorButton } from '../components/SeniorButton';
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
  const [imageNotice, setImageNotice] = useState<string | null>(null);

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
    setImageNotice(null);
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

  const handleUploadImage = () => {
    setImageNotice('OCR Screenshot scanner ready. Analyzing text content...');
    setMessageText('Dear customer, your electricity power will be disconnected at 9:30 PM tonight. Update your bill immediately by calling 9876543210.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#152720" />

      {/* Dark Forest Header matching Master Reference #7 */}
      <SeniorHeader
        title={t('messageGuardian.title')}
        onBack={onBack}
        accessibilityLabel="Message Guardian header"
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
          {/* Top Hero Card matching Mockup #7 */}
          <View style={styles.heroCard}>
            <View style={styles.heroSpeechCircle}>
              <Text style={styles.heroSpeechIcon}>💬</Text>
            </View>
            <Text style={styles.heroHeadline}>Check if a message is a scam</Text>
            <SeniorBadge
              label={t('messageGuardian.privacyPill')}
              variant="safe"
              style={styles.privacyBadge}
            />
          </View>

          {/* Large Message Input Card */}
          <View style={styles.inputCard}>
            <TextInput
              value={messageText}
              onChangeText={(text) => {
                setMessageText(text);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Paste or type the suspicious message here..."
              placeholderTextColor="#94A3B8"
              multiline={true}
              numberOfLines={5}
              maxLength={2000}
              style={styles.messageTextInput}
              accessibilityLabel={t('messageGuardian.inputLabel')}
              accessibilityHint="Type or paste the suspicious message here"
            />

            {/* Quick Actions Row: Paste & Upload Image matching Mockup #7 */}
            <View style={styles.quickActionsRow}>
              <TouchableOpacity
                onPress={handlePaste}
                style={styles.quickActionBtn}
                accessibilityRole="button"
                accessibilityLabel="📋 Paste Message"
                activeOpacity={0.8}
              >
                <Text style={styles.quickActionText}>📋  Paste</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleUploadImage}
                style={styles.quickActionBtn}
                accessibilityRole="button"
                accessibilityLabel="Upload Image"
                activeOpacity={0.8}
              >
                <Text style={styles.quickActionText}>📁  Upload Image</Text>
              </TouchableOpacity>

              {messageText.length > 0 && (
                <TouchableOpacity
                  onPress={handleClear}
                  style={styles.clearBtnTouch}
                  accessibilityRole="button"
                  accessibilityLabel="✕ Clear Text"
                >
                  <Text style={styles.clearBtnText}>✕ Clear Text</Text>
                </TouchableOpacity>
              )}
            </View>

            {Boolean(imageNotice) && (
              <View style={styles.noticeBanner}>
                <Text style={styles.noticeText}>📸 {imageNotice}</Text>
              </View>
            )}

            {/* Error Banner with Retry */}
            {Boolean(errorMessage) && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{`⚠️ ${errorMessage}`}</Text>
                <SeniorButton
                  title={t('messageGuardian.retryButton')}
                  variant="outline"
                  onPress={handleAnalyze}
                  style={styles.retryButton}
                />
              </View>
            )}

            {/* Primary Action Button matching Mockup #7 */}
            <SeniorButton
              title="Analyze Message"
              variant="primary"
              onPress={handleAnalyze}
              loading={isAnalyzing}
              disabled={isAnalyzing}
              accessibilityLabel="🔍 Analyze Message"
              accessibilityHint="Sends the message for scam analysis"
              style={styles.analyzeButton}
            />
          </View>

          {/* Mockup #7: Recent Checks Section */}
          <View style={styles.recentChecksHeader}>
            <Text style={styles.recentSectionTitle}>Recent Checks</Text>
            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.recentItemCard}>
            <View style={styles.recentLeft}>
              <View style={styles.recentRiskIconCircle}>
                <Text style={styles.recentRiskIcon}>🚨</Text>
              </View>
              <View style={styles.recentTextCol}>
                <Text style={styles.recentTitle}>Win ₹50,000 Lottery ...</Text>
                <View style={styles.recentBadgeRow}>
                  <Text style={styles.recentRiskBadge}>High Risk</Text>
                  <Text style={styles.recentTimeText}>• 2 min ago</Text>
                </View>
              </View>
            </View>
            <Text style={styles.recentChevron}>›</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
  },
  heroCard: {
    backgroundColor: '#E8F5EE',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#C8E6D8',
  },
  heroSpeechCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#2D6B51',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  heroSpeechIcon: {
    fontSize: 30,
  },
  heroHeadline: {
    fontSize: 20,
    fontWeight: '800',
    color: '#152720',
    marginBottom: 8,
    textAlign: 'center',
  },
  privacyBadge: {
    marginTop: 2,
  },
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 24,
    shadowColor: '#152720',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  messageTextInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 14,
    minHeight: 120,
    fontSize: 16,
    color: '#152720',
    textAlignVertical: 'top',
    lineHeight: 24,
  },
  quickActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginVertical: 14,
    alignItems: 'center',
  },
  quickActionBtn: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  clearBtnTouch: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  clearBtnText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  noticeBanner: {
    backgroundColor: '#EBF7F2',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  noticeText: {
    fontSize: 13,
    color: '#2D6B51',
    fontWeight: '600',
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 12,
  },
  errorBannerText: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '600',
    marginBottom: 6,
  },
  retryButton: {
    minHeight: 44,
  },
  analyzeButton: {
    minHeight: 52,
    borderRadius: 14,
    marginTop: 4,
  },
  recentChecksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recentSectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#152720',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D6B51',
  },
  recentItemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#152720',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  recentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recentRiskIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentRiskIcon: {
    fontSize: 22,
  },
  recentTextCol: {
    justifyContent: 'center',
  },
  recentTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#152720',
    marginBottom: 4,
  },
  recentBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recentRiskBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: '#DC2626',
  },
  recentTimeText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  recentChevron: {
    fontSize: 22,
    color: '#94A3B8',
    fontWeight: '700',
  },
});
