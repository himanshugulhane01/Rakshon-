import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  TextInput,
  TouchableOpacity,
  Clipboard,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SeniorTheme } from '../theme';
import { SeniorHeader } from '../components/SeniorHeader';
import { SeniorCard } from '../components/SeniorCard';
import { SeniorBadge } from '../components/SeniorBadge';
import { SeniorButton } from '../components/SeniorButton';
import { BottomNavigation, BottomNavTab } from '../components/BottomNavigation';
import {
  UnifiedCheckerService,
  UnifiedCheckerType,
  UnifiedCheckResult,
} from '../services/unifiedCheckerService';

export interface UnifiedSafeCheckerScreenProps {
  onBack: () => void;
  onSelectTab?: (tab: BottomNavTab) => void;
  onNavigateToEmergency?: () => void;
  initialTab?: UnifiedCheckerType;
}

export const UnifiedSafeCheckerScreen: React.FC<UnifiedSafeCheckerScreenProps> = ({
  onBack,
  onSelectTab,
  onNavigateToEmergency,
  initialTab = 'message',
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  const langKey = (['en', 'hi', 'mr'].includes(currentLang) ? currentLang : 'en') as 'en' | 'hi' | 'mr';

  const [activeTab, setActiveTab] = useState<UnifiedCheckerType>(initialTab);
  const [inputText, setInputText] = useState<string>('');
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [checkResult, setCheckResult] = useState<UnifiedCheckResult | null>(null);
  const [copiedNotice, setCopiedNotice] = useState<boolean>(false);
  const [inputError, setInputError] = useState<string | null>(null);

  // Senior practice samples for 1-tap testing
  const samplePrompts = {
    message: [
      {
        label: '⚡ Electricity Scam',
        text: 'Urgent Notice: Your electricity bill unpaid. Power disconnected tonight at 9:30 PM. Call manager at 9876543210 immediately.',
      },
      {
        label: '🎁 KBC Lottery Prize',
        text: 'Congratulations! You won Rs 25,00,000 in KBC Lucky Draw. Pay Rs 4,500 tax to claim prize money immediately.',
      },
    ],
    url: [
      {
        label: '🏦 Fake SBI Login',
        text: 'http://onlinesbi.login-portal.xyz/netbanking',
      },
      {
        label: '🏛️ Authentic Tax Portal',
        text: 'https://eportal.incometax.gov.in/iec/foservices/',
      },
    ],
    phone: [
      {
        label: '🚨 Foreign Scam Caller',
        text: '+923001234567',
      },
      {
        label: '📞 Telemarketer Number',
        text: '1409876543',
      },
    ],
    image: [
      {
        label: '🖼️ Sample Suspicious SMS',
        text: 'Your SBI netbanking is blocked. Update KYC at http://sbi-login.xyz or call 9876543210.',
      },
    ],
  };

  const handleTabChange = (tab: UnifiedCheckerType) => {
    setActiveTab(tab);
    setInputText('');
    setCheckResult(null);
    setInputError(null);
    setCopiedNotice(false);
  };

  const handleRunCheck = async () => {
    if (!inputText.trim()) {
      setInputError('Please enter or paste content to check.');
      return;
    }

    setInputError(null);
    setIsChecking(true);
    setCopiedNotice(false);

    try {
      let result: UnifiedCheckResult;
      if (activeTab === 'message') {
        result = await UnifiedCheckerService.checkMessage(inputText);
      } else if (activeTab === 'url') {
        result = UnifiedCheckerService.checkWebsiteUrl(inputText);
      } else if (activeTab === 'phone') {
        result = UnifiedCheckerService.checkPhoneNumber(inputText);
      } else {
        result = await UnifiedCheckerService.checkScreenshot(inputText);
      }
      setCheckResult(result);
    } catch (err: any) {
      setInputError(err?.message || 'Error checking item.');
    } finally {
      setIsChecking(false);
    }
  };

  const handlePaste = async () => {
    try {
      const clip = await Clipboard.getString();
      if (clip) {
        setInputText(clip);
        setInputError(null);
      }
    } catch {
      // Ignored
    }
  };

  const handleCopyReport = () => {
    if (!checkResult) return;
    const reportText =
      `Rakshon Safety Check Report\n` +
      `Status: ${checkResult.riskLevel} (Score: ${checkResult.riskScore}/100)\n` +
      `Item: ${checkResult.inputValue}\n` +
      `Details: ${checkResult.explanation[langKey]}\n` +
      `Recommended: ${checkResult.recommendedActions[langKey].join('; ')}\n` +
      `Helpline: 1930`;

    Clipboard.setString(reportText);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 3000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={SeniorTheme.colors.backgroundMain} />

      <SeniorHeader
        title={t('unifiedChecker.title', 'Is This Safe? Unified Checker')}
        subtitle={t(
          'unifiedChecker.subtitle',
          'Check messages, websites, phone numbers, or screenshots in one place'
        )}
        onBack={onBack}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Input Selector Tabs */}
        <View style={styles.tabSelectorRow}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'message' && styles.tabButtonActive]}
            onPress={() => handleTabChange('message')}
            accessible={true}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'message' }}
          >
            <Text style={[styles.tabText, activeTab === 'message' && styles.tabTextActive]}>
              {t('unifiedChecker.tabMessage', '💬 Message')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'url' && styles.tabButtonActive]}
            onPress={() => handleTabChange('url')}
            accessible={true}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'url' }}
          >
            <Text style={[styles.tabText, activeTab === 'url' && styles.tabTextActive]}>
              {t('unifiedChecker.tabUrl', '🌐 Website')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'phone' && styles.tabButtonActive]}
            onPress={() => handleTabChange('phone')}
            accessible={true}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'phone' }}
          >
            <Text style={[styles.tabText, activeTab === 'phone' && styles.tabTextActive]}>
              {t('unifiedChecker.tabPhone', '📞 Phone')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'image' && styles.tabButtonActive]}
            onPress={() => handleTabChange('image')}
            accessible={true}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'image' }}
          >
            <Text style={[styles.tabText, activeTab === 'image' && styles.tabTextActive]}>
              {t('unifiedChecker.tabImage', '🖼️ Screenshot')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Input Form Card */}
        <SeniorCard style={styles.inputCard}>
          <View style={styles.inputHeaderRow}>
            <Text style={styles.inputLabel}>
              {activeTab === 'message'
                ? 'Enter or Paste Message Content'
                : activeTab === 'url'
                ? 'Enter Website URL to Verify'
                : activeTab === 'phone'
                ? 'Enter Caller Phone Number'
                : 'Screenshot / Image Text OCR'}
            </Text>
            <TouchableOpacity onPress={handlePaste} style={styles.pasteButton}>
              <Text style={styles.pasteButtonText}>📋 Paste</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={[
              styles.textInput,
              activeTab === 'message' || activeTab === 'image'
                ? styles.textInputMultiline
                : styles.textInputSingle,
            ]}
            placeholder={
              activeTab === 'message'
                ? t(
                    'unifiedChecker.inputPlaceholderMessage',
                    'Paste SMS, WhatsApp text, or suspicious message...'
                  )
                : activeTab === 'url'
                ? t(
                    'unifiedChecker.inputPlaceholderUrl',
                    'Enter website link (e.g. sbi-login.xyz or incometax.gov.in)...'
                  )
                : activeTab === 'phone'
                ? t(
                    'unifiedChecker.inputPlaceholderPhone',
                    'Enter 10-digit caller number or +91 number...'
                  )
                : 'Paste text or inspect simulated screenshot...'
            }
            placeholderTextColor="#94A3B8"
            value={inputText}
            onChangeText={(val) => {
              setInputText(val);
              setInputError(null);
            }}
            multiline={activeTab === 'message' || activeTab === 'image'}
            numberOfLines={activeTab === 'message' || activeTab === 'image' ? 4 : 1}
            autoCapitalize="none"
            keyboardType={activeTab === 'phone' ? 'phone-pad' : activeTab === 'url' ? 'url' : 'default'}
          />

          {inputError && <Text style={styles.errorText}>⚠️ {inputError}</Text>}

          {/* Quick Practice Samples */}
          <View style={styles.samplePromptSection}>
            <Text style={styles.samplePromptLabel}>
              {t('unifiedChecker.samplePrompt', 'Try a Senior Practice Sample:')}
            </Text>
            <View style={styles.samplePillsRow}>
              {samplePrompts[activeTab]?.map((sample, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.samplePill}
                  onPress={() => {
                    setInputText(sample.text);
                    setInputError(null);
                  }}
                >
                  <Text style={styles.samplePillText}>{sample.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Run Check Button */}
          <SeniorButton
            title={
              isChecking
                ? t('unifiedChecker.checkingButton', 'Analyzing for Fraud Patterns...')
                : t('unifiedChecker.checkButton', 'Check If This Is Safe →')
            }
            variant="primary"
            onPress={handleRunCheck}
            disabled={isChecking}
            style={styles.checkButton}
          />
        </SeniorCard>

        {/* RESULTS CARD */}
        {checkResult && (
          <SeniorCard style={styles.resultCard}>
            <View style={styles.resultHeaderRow}>
              <SeniorBadge
                label={
                  checkResult.riskLevel === 'DANGER'
                    ? 'HIGH FRAUD RISK'
                    : checkResult.riskLevel === 'CAUTION'
                    ? 'CAUTION REQUIRED'
                    : 'SAFE / VERIFIED'
                }
                variant={
                  checkResult.riskLevel === 'DANGER'
                    ? 'danger'
                    : checkResult.riskLevel === 'CAUTION'
                    ? 'caution'
                    : 'safe'
                }
              />
              <Text style={styles.riskScoreBadge}>Risk Score: {checkResult.riskScore} / 100</Text>
            </View>

            <Text style={styles.resultHeading}>{checkResult.title[langKey]}</Text>

            {/* Warning Signs */}
            <View style={styles.warningSignsBox}>
              <Text style={styles.warningSignsHeading}>
                {t('unifiedChecker.warningSignsTitle', 'Detected Red Flags & Warning Signs')}
              </Text>
              {checkResult.warningSigns[langKey].map((sign, idx) => (
                <Text key={idx} style={styles.warningSignItem}>
                  • {sign}
                </Text>
              ))}
            </View>

            {/* Explanation */}
            <View style={styles.explanationSection}>
              <Text style={styles.sectionSubHeading}>Plain Language Explanation:</Text>
              <Text style={styles.explanationBodyText}>{checkResult.explanation[langKey]}</Text>
            </View>

            {/* Recommended Actions */}
            <View style={styles.actionsSection}>
              <Text style={styles.sectionSubHeading}>
                {t('unifiedChecker.recommendedActionsTitle', 'Recommended Protective Actions')}
              </Text>
              {checkResult.recommendedActions[langKey].map((action, idx) => (
                <View key={idx} style={styles.actionItemRow}>
                  <Text style={styles.actionCheckIcon}>🛡️</Text>
                  <Text style={styles.actionItemText}>{action}</Text>
                </View>
              ))}
            </View>

            {/* Action Buttons */}
            <View style={styles.resultButtonsCol}>
              <SeniorButton
                title={
                  copiedNotice
                    ? t('unifiedChecker.reportCopied', 'Safety report copied to clipboard!')
                    : t('unifiedChecker.copyReportButton', '📋 Copy Safety Summary')
                }
                variant="outline"
                onPress={handleCopyReport}
                style={styles.resultActionBtn}
              />

              {checkResult.riskLevel === 'DANGER' && (
                <SeniorButton
                  title="🚨 Call 1930 Cybercrime Helpline"
                  variant="danger"
                  onPress={() => onNavigateToEmergency?.()}
                  style={styles.resultActionBtn}
                />
              )}

              <SeniorButton
                title={t('unifiedChecker.checkAnotherButton', 'Check Another Item')}
                variant="secondary"
                onPress={() => {
                  setCheckResult(null);
                  setInputText('');
                }}
                style={styles.resultActionBtn}
              />
            </View>
          </SeniorCard>
        )}
      </ScrollView>

      {onSelectTab && <BottomNavigation activeTab="protect" onSelectTab={onSelectTab} />}
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
  tabSelectorRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  tabButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabButtonActive: {
    backgroundColor: SeniorTheme.colors.deepForest,
    borderColor: SeniorTheme.colors.deepForest,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: SeniorTheme.colors.textSecondary,
  },
  tabTextActive: {
    color: SeniorTheme.colors.white,
  },
  inputCard: {
    backgroundColor: SeniorTheme.colors.white,
    padding: 16,
    marginBottom: 16,
  },
  inputHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: SeniorTheme.colors.deepForest,
  },
  pasteButton: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pasteButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: SeniorTheme.colors.richEmerald,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: SeniorTheme.colors.textPrimary,
  },
  textInputSingle: {
    height: 52,
  },
  textInputMultiline: {
    minHeight: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '600',
    marginTop: 6,
  },
  samplePromptSection: {
    marginTop: 14,
    marginBottom: 14,
  },
  samplePromptLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  samplePillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  samplePill: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  samplePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  checkButton: {
    minHeight: 52,
  },
  // Result card
  resultCard: {
    backgroundColor: SeniorTheme.colors.white,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  resultHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  riskScoreBadge: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  resultHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
    lineHeight: 28,
    marginBottom: 14,
  },
  warningSignsBox: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
    padding: 12,
    borderRadius: 8,
    marginBottom: 14,
  },
  warningSignsHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#991B1B',
    marginBottom: 6,
  },
  warningSignItem: {
    fontSize: 13,
    color: '#7F1D1D',
    lineHeight: 18,
    marginBottom: 4,
    fontWeight: '500',
  },
  explanationSection: {
    marginBottom: 14,
  },
  sectionSubHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: SeniorTheme.colors.deepForest,
    marginBottom: 6,
  },
  explanationBodyText: {
    fontSize: 15,
    color: SeniorTheme.colors.textPrimary,
    lineHeight: 22,
  },
  actionsSection: {
    marginBottom: 16,
  },
  actionItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  actionCheckIcon: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  actionItemText: {
    flex: 1,
    fontSize: 14,
    color: SeniorTheme.colors.textPrimary,
    lineHeight: 20,
    fontWeight: '500',
  },
  resultButtonsCol: {
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 14,
  },
  resultActionBtn: {
    minHeight: 48,
  },
});

