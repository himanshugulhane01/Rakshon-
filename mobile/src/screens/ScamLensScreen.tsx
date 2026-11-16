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
  QrScannerService,
  QrAnalysisResult,
} from '../services/qrScannerService';
import {
  AnalysisApiService,
  MessageAnalysisResponse,
} from '../services/analysisApi';

export interface ScamLensScreenProps {
  onBack: () => void;
  onNavigateToEmergency?: () => void;
}

type InspectionTab = 'QR' | 'DOCUMENT';

// Safe samples for senior learning
const SAMPLE_SUSPICIOUS_UPI =
  'upi://pay?pa=refund9823@okhdfcbank&pn=&am=4999&tn=Lottery_Cashback_Refund';
const SAMPLE_PHISHING_URL =
  'http://45.33.32.156/sbi-kyc-update/download/sbi-security.apk';
const SAMPLE_ELECTRICITY_LETTER =
  'Dear consumer, your electricity power will be cut tonight at 9:30 PM due to unpaid bill. Immediately contact power officer on 9876543210.';

export const ScamLensScreen: React.FC<ScamLensScreenProps> = ({
  onBack,
  onNavigateToEmergency,
}) => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<InspectionTab>('QR');

  // QR State
  const [qrInput, setQrInput] = useState('');
  const [qrResult, setQrResult] = useState<QrAnalysisResult | null>(null);

  // Document State
  const [docInput, setDocInput] = useState('');
  const [docResult, setDocResult] = useState<MessageAnalysisResponse | null>(null);
  const [isAnalyzingDoc, setIsAnalyzingDoc] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);

  // --- QR Handlers ---
  const handlePasteQr = async () => {
    try {
      const text = await Clipboard.getString();
      if (text) {
        setQrInput(text.trim());
      }
    } catch {
      // Handle gracefully
    }
  };

  const handleInspectQr = () => {
    const trimmed = qrInput.trim();
    if (!trimmed) {
      return;
    }
    const result = QrScannerService.inspectQrPayload(trimmed);
    setQrResult(result);
  };

  // --- Document Handlers ---
  const handlePasteDoc = async () => {
    try {
      const text = await Clipboard.getString();
      if (text) {
        setDocInput(text.trim());
        setDocError(null);
      }
    } catch {
      // Handle gracefully
    }
  };

  const handleInspectDocument = async () => {
    const trimmed = docInput.trim();
    if (!trimmed) {
      setDocError(t('scamLens.errorEmpty'));
      return;
    }

    try {
      setIsAnalyzingDoc(true);
      setDocError(null);

      const userLang = (i18n.language as 'en' | 'hi' | 'mr') || 'en';
      const result = await AnalysisApiService.analyzeMessage({
        text: trimmed,
        language: userLang,
      });
      setDocResult(result);
    } catch (err: any) {
      setDocError(err.message || 'Unable to analyze document. Please check connection.');
    } finally {
      setIsAnalyzingDoc(false);
    }
  };

  const getRiskBadgeScheme = (severity: 'SAFE' | 'CAUTION' | 'HIGH_RISK') => {
    switch (severity) {
      case 'HIGH_RISK':
        return {
          bg: SeniorTheme.colors.riskDangerSurface,
          border: SeniorTheme.colors.riskDangerBorder,
          text: SeniorTheme.colors.riskDanger,
          variant: 'danger' as const,
        };
      case 'CAUTION':
        return {
          bg: SeniorTheme.colors.riskWarningSurface,
          border: SeniorTheme.colors.riskWarningBorder,
          text: SeniorTheme.colors.riskWarning,
          variant: 'caution' as const,
        };
      default:
        return {
          bg: SeniorTheme.colors.riskSafeSurface,
          border: SeniorTheme.colors.riskSafeBorder,
          text: SeniorTheme.colors.riskSafe,
          variant: 'safe' as const,
        };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={SeniorTheme.colors.backgroundMain} />

      <SeniorHeader
        title={t('scamLens.title')}
        subtitle={t('scamLens.subtitle')}
        onBack={onBack}
      />

      {/* Mode Navigation Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          onPress={() => setActiveTab('QR')}
          accessible={true}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'QR' }}
          accessibilityLabel={t('scamLens.tabQr')}
          style={[styles.tabButton, activeTab === 'QR' && styles.tabButtonActive]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'QR' && styles.tabTextActive,
            ]}
          >
            🏁 {t('scamLens.tabQr')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('DOCUMENT')}
          accessible={true}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'DOCUMENT' }}
          accessibilityLabel={t('scamLens.tabDocument')}
          style={[
            styles.tabButton,
            activeTab === 'DOCUMENT' && styles.tabButtonActive,
          ]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'DOCUMENT' && styles.tabTextActive,
            ]}
          >
            📄 {t('scamLens.tabDocument')}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* TAB 1: QR CODE INSPECTOR */}
          {activeTab === 'QR' && (
            <View>
              <SeniorCard variant="elevated" style={styles.card}>
                <SeniorInput
                  label={t('scamLens.qrInputLabel')}
                  value={qrInput}
                  onChangeText={(text) => {
                    setQrInput(text);
                    if (qrResult) setQrResult(null);
                  }}
                  placeholder={t('scamLens.qrInputPlaceholder')}
                  multiline={true}
                  numberOfLines={3}
                  accessibilityLabel={t('scamLens.qrInputLabel')}
                />

                {/* Tool Buttons */}
                <View style={styles.toolsRow}>
                  <TouchableOpacity
                    onPress={handlePasteQr}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={t('scamLens.pasteQrButton')}
                    style={styles.toolBtn}
                  >
                    <Text style={styles.toolBtnText}>
                      {t('scamLens.pasteQrButton')}
                    </Text>
                  </TouchableOpacity>

                  {qrInput.length > 0 && (
                    <TouchableOpacity
                      onPress={() => {
                        setQrInput('');
                        setQrResult(null);
                      }}
                      accessible={true}
                      accessibilityRole="button"
                      style={styles.clearBtn}
                    >
                      <Text style={styles.clearBtnText}>
                        {t('scamLens.clearButton')}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Educational Sample Shortcuts */}
                <View style={styles.sampleContainer}>
                  <Text style={styles.sampleTitle}>Practice Examples:</Text>
                  <View style={styles.sampleBtnRow}>
                    <TouchableOpacity
                      onPress={() => {
                        setQrInput(SAMPLE_SUSPICIOUS_UPI);
                        setQrResult(null);
                      }}
                      style={styles.samplePill}
                    >
                      <Text style={styles.samplePillText}>
                        {t('scamLens.sampleUpiButton')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setQrInput(SAMPLE_PHISHING_URL);
                        setQrResult(null);
                      }}
                      style={styles.samplePill}
                    >
                      <Text style={styles.samplePillText}>
                        {t('scamLens.sampleUrlButton')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Inspect Button */}
                <SeniorButton
                  title={t('scamLens.inspectQrButton')}
                  variant="primary"
                  onPress={handleInspectQr}
                  disabled={qrInput.trim().length === 0}
                  accessibilityLabel={t('scamLens.inspectQrButton')}
                  style={styles.primaryActionBtn}
                />
              </SeniorCard>

              {/* QR Safety Inspection Result Card */}
              {qrResult && (
                <SeniorCard
                  variant="elevated"
                  style={[
                    styles.resultCard,
                    {
                      backgroundColor: getRiskBadgeScheme(qrResult.riskSeverity).bg,
                      borderColor: getRiskBadgeScheme(qrResult.riskSeverity).border,
                    },
                  ]}
                >
                  <View style={styles.resultHeaderRow}>
                    <SeniorBadge
                      variant={getRiskBadgeScheme(qrResult.riskSeverity).variant}
                      label={qrResult.riskSeverity}
                    />
                    <Text
                      style={[
                        styles.resultTitle,
                        { color: getRiskBadgeScheme(qrResult.riskSeverity).text },
                      ]}
                    >
                      {qrResult.title}
                    </Text>
                  </View>

                  <Text style={styles.resultSummary}>{qrResult.summary}</Text>

                  {/* UPI Details Table if detected */}
                  {qrResult.upiDetails && (
                    <View style={styles.detailsBox}>
                      {Boolean(qrResult.upiDetails.payeeName) && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>
                            {t('scamLens.upiNameLabel')}:
                          </Text>
                          <Text style={styles.detailValue}>
                            {qrResult.upiDetails.payeeName}
                          </Text>
                        </View>
                      )}
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>
                          {t('scamLens.upiRecipientLabel')}:
                        </Text>
                        <Text style={styles.detailValue}>
                          {qrResult.upiDetails.payeeAddress || 'Not specified'}
                        </Text>
                      </View>
                      {Boolean(qrResult.upiDetails.amount) && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>
                            {t('scamLens.upiAmountLabel')}:
                          </Text>
                          <Text style={styles.detailValuePrice}>
                            {`₹${qrResult.upiDetails.amount}`}
                          </Text>
                        </View>
                      )}
                      {Boolean(qrResult.upiDetails.transactionNote) && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>
                            {t('scamLens.upiNoteLabel')}:
                          </Text>
                          <Text style={styles.detailValue}>
                            {qrResult.upiDetails.transactionNote}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Flagged Warning Reasons */}
                  {qrResult.flaggedReasons.length > 0 && (
                    <View style={styles.warningsBox}>
                      <Text style={styles.warningBoxTitle}>
                        ⚠️ Detected Red Flags:
                      </Text>
                      {qrResult.flaggedReasons.map((reason, idx) => (
                        <Text key={idx} style={styles.warningItemText}>
                          • {reason}
                        </Text>
                      ))}
                    </View>
                  )}

                  {/* Mandatory Safety Advices */}
                  <View style={styles.criticalNoticeBox}>
                    <Text style={styles.criticalNoticeText}>
                      🛑 {t('scamLens.noPaymentWarning')}
                    </Text>
                    <Text style={styles.safeNoticeText}>
                      🔒 {t('scamLens.noAutoOpenNotice')}
                    </Text>
                  </View>
                </SeniorCard>
              )}
            </View>
          )}

          {/* TAB 2: PAPER DOCUMENT INSPECTOR */}
          {activeTab === 'DOCUMENT' && (
            <View>
              {/* OCR Availability Notice */}
              <SeniorCard variant="outlined" style={styles.noticeCard}>
                <Text style={styles.noticeText}>
                  ℹ️ {t('scamLens.ocrUnavailableNotice')}
                </Text>
              </SeniorCard>

              <SeniorCard variant="elevated" style={styles.card}>
                <SeniorInput
                  label={t('scamLens.documentInputLabel')}
                  value={docInput}
                  onChangeText={(text) => {
                    setDocInput(text);
                    if (docResult) setDocResult(null);
                    if (docError) setDocError(null);
                  }}
                  placeholder={t('scamLens.documentInputPlaceholder')}
                  multiline={true}
                  numberOfLines={5}
                  accessibilityLabel={t('scamLens.documentInputLabel')}
                />

                {/* Paste & Sample Buttons */}
                <View style={styles.toolsRow}>
                  <TouchableOpacity
                    onPress={handlePasteDoc}
                    accessible={true}
                    accessibilityRole="button"
                    style={styles.toolBtn}
                  >
                    <Text style={styles.toolBtnText}>📋 Paste Text</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setDocInput(SAMPLE_ELECTRICITY_LETTER);
                      setDocResult(null);
                    }}
                    style={styles.samplePill}
                  >
                    <Text style={styles.samplePillText}>
                      {t('scamLens.sampleNoticeButton')}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Error Banner */}
                {Boolean(docError) && (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>⚠️ {docError}</Text>
                  </View>
                )}

                {/* Inspect Action */}
                <SeniorButton
                  title={
                    isAnalyzingDoc
                      ? 'Analyzing Document Patterns...'
                      : t('scamLens.inspectDocumentButton')
                  }
                  variant="primary"
                  onPress={handleInspectDocument}
                  loading={isAnalyzingDoc}
                  disabled={isAnalyzingDoc || docInput.trim().length === 0}
                  accessibilityLabel={t('scamLens.inspectDocumentButton')}
                  style={styles.primaryActionBtn}
                />
              </SeniorCard>

              {/* Document Analysis Result Card */}
              {docResult && (
                <SeniorCard
                  variant="elevated"
                  style={[
                    styles.resultCard,
                    {
                      backgroundColor:
                        docResult.risk_level === 'HIGH_RISK'
                          ? '#FFF5F5'
                          : docResult.risk_level === 'CAUTION'
                          ? '#FFFBEB'
                          : '#F0FDF4',
                    },
                  ]}
                >
                  <View style={styles.resultHeaderRow}>
                    <SeniorBadge
                      variant={
                        docResult.risk_level === 'HIGH_RISK'
                          ? 'danger'
                          : docResult.risk_level === 'CAUTION'
                          ? 'caution'
                          : 'safe'
                      }
                      label={docResult.risk_level}
                    />
                    <Text style={styles.resultTitle}>
                      {t('scamLens.documentResultTitle')}
                    </Text>
                  </View>

                  <Text style={styles.explanationBody}>
                    {docResult.explanation}
                  </Text>

                  {/* Warning Indicators */}
                  {docResult.detected_indicators &&
                    docResult.detected_indicators.length > 0 && (
                      <View style={styles.warningsBox}>
                        <Text style={styles.warningBoxTitle}>
                          Detected Warning Patterns:
                        </Text>
                        {docResult.detected_indicators.map((ind, i) => (
                          <Text key={i} style={styles.warningItemText}>
                            {`• ${ind.description}`}
                          </Text>
                        ))}
                      </View>
                    )}

                  {/* Actions */}
                  {docResult.recommended_actions && (
                    <View style={styles.actionsBox}>
                      <Text style={styles.actionsTitle}>
                        Senior Safety Advice:
                      </Text>
                      {docResult.recommended_actions.map((act, i) => (
                        <Text key={i} style={styles.actionItemText}>
                          {i + 1}. {act}
                        </Text>
                      ))}
                    </View>
                  )}

                  {/* Emergency Helpline Shortcut if high threat */}
                  {Boolean(onNavigateToEmergency) &&
                    docResult.risk_level === 'HIGH_RISK' && (
                      <SeniorButton
                        title="🚨 Call Cyber Helpline 1930"
                        variant="danger"
                        onPress={() => onNavigateToEmergency?.()}
                        style={styles.emergencyBtn}
                      />
                    )}
                </SeniorCard>
              )}
            </View>
          )}
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
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: SeniorTheme.spacing.lg,
    marginBottom: SeniorTheme.spacing.sm,
    gap: SeniorTheme.spacing.sm,
  },
  tabButton: {
    flex: 1,
    minHeight: 48,
    backgroundColor: SeniorTheme.colors.white,
    borderRadius: SeniorTheme.radii.md,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SeniorTheme.spacing.sm,
  },
  tabButtonActive: {
    backgroundColor: SeniorTheme.colors.richEmerald,
    borderColor: SeniorTheme.colors.richEmerald,
  },
  tabText: {
    fontSize: SeniorTheme.typography.bodySmall,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
  },
  tabTextActive: {
    color: SeniorTheme.colors.white,
  },
  card: {
    padding: SeniorTheme.spacing.lg,
    marginBottom: SeniorTheme.spacing.lg,
  },
  toolsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: SeniorTheme.spacing.xs,
  },
  toolBtn: {
    minHeight: 44,
    paddingHorizontal: SeniorTheme.spacing.md,
    backgroundColor: '#F0F9F5',
    borderRadius: SeniorTheme.radii.sm,
    borderWidth: 1.5,
    borderColor: SeniorTheme.colors.emeraldLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolBtnText: {
    fontSize: SeniorTheme.typography.bodySmall,
    fontWeight: '700',
    color: SeniorTheme.colors.richEmerald,
  },
  clearBtn: {
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SeniorTheme.spacing.sm,
  },
  clearBtnText: {
    fontSize: SeniorTheme.typography.bodySmall,
    fontWeight: '700',
    color: SeniorTheme.colors.textDim,
  },
  sampleContainer: {
    marginTop: SeniorTheme.spacing.sm,
    marginBottom: SeniorTheme.spacing.md,
  },
  sampleTitle: {
    fontSize: SeniorTheme.typography.caption,
    fontWeight: '700',
    color: SeniorTheme.colors.textDim,
    marginBottom: 4,
  },
  sampleBtnRow: {
    flexDirection: 'row',
    gap: SeniorTheme.spacing.sm,
    flexWrap: 'wrap',
  },
  samplePill: {
    backgroundColor: SeniorTheme.colors.backgroundMain,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: SeniorTheme.radii.sm,
    paddingHorizontal: SeniorTheme.spacing.sm,
    paddingVertical: 6,
  },
  samplePillText: {
    fontSize: SeniorTheme.typography.caption,
    fontWeight: '700',
    color: SeniorTheme.colors.deepForest,
  },
  primaryActionBtn: {
    minHeight: SeniorTheme.dimensions.minTouchTarget + 6,
    marginTop: SeniorTheme.spacing.xs,
  },
  resultCard: {
    padding: SeniorTheme.spacing.lg,
    marginBottom: SeniorTheme.spacing.xl,
    borderWidth: 2,
  },
  resultHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SeniorTheme.spacing.sm,
  },
  resultTitle: {
    fontSize: SeniorTheme.typography.titleMedium,
    fontWeight: '800',
    marginLeft: SeniorTheme.spacing.sm,
    flex: 1,
  },
  resultSummary: {
    fontSize: SeniorTheme.typography.body,
    color: SeniorTheme.colors.deepForest,
    lineHeight: 24,
    marginBottom: SeniorTheme.spacing.md,
  },
  detailsBox: {
    backgroundColor: SeniorTheme.colors.white,
    borderRadius: SeniorTheme.radii.md,
    padding: SeniorTheme.spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: SeniorTheme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  detailLabel: {
    fontSize: SeniorTheme.typography.bodySmall,
    fontWeight: '700',
    color: SeniorTheme.colors.deepForest,
  },
  detailValue: {
    fontSize: SeniorTheme.typography.bodySmall,
    color: SeniorTheme.colors.deepForest,
    maxWidth: 200,
  },
  detailValuePrice: {
    fontSize: SeniorTheme.typography.bodyLarge,
    fontWeight: '800',
    color: SeniorTheme.colors.riskDanger,
  },
  warningsBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: SeniorTheme.radii.sm,
    padding: SeniorTheme.spacing.md,
    marginBottom: SeniorTheme.spacing.md,
    borderWidth: 1,
    borderColor: SeniorTheme.colors.riskWarningBorder,
  },
  warningBoxTitle: {
    fontSize: SeniorTheme.typography.bodySmall,
    fontWeight: '800',
    color: SeniorTheme.colors.riskWarning,
    marginBottom: 4,
  },
  warningItemText: {
    fontSize: SeniorTheme.typography.caption,
    color: SeniorTheme.colors.deepForest,
    lineHeight: 20,
    marginTop: 2,
  },
  criticalNoticeBox: {
    backgroundColor: '#FFF5F5',
    borderRadius: SeniorTheme.radii.sm,
    padding: SeniorTheme.spacing.md,
    borderWidth: 1.5,
    borderColor: SeniorTheme.colors.riskDangerBorder,
  },
  criticalNoticeText: {
    fontSize: SeniorTheme.typography.bodySmall,
    fontWeight: '800',
    color: SeniorTheme.colors.riskDanger,
    lineHeight: 22,
  },
  safeNoticeText: {
    fontSize: SeniorTheme.typography.caption,
    fontWeight: '600',
    color: SeniorTheme.colors.deepForest,
    marginTop: 4,
  },
  noticeCard: {
    padding: SeniorTheme.spacing.md,
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
    marginBottom: SeniorTheme.spacing.md,
  },
  noticeText: {
    fontSize: SeniorTheme.typography.caption,
    color: SeniorTheme.colors.textDim,
    lineHeight: 20,
  },
  errorBox: {
    backgroundColor: '#FFF5F5',
    padding: SeniorTheme.spacing.md,
    borderRadius: SeniorTheme.radii.sm,
    marginBottom: SeniorTheme.spacing.md,
    borderWidth: 1,
    borderColor: SeniorTheme.colors.riskDangerBorder,
  },
  errorText: {
    fontSize: SeniorTheme.typography.bodySmall,
    color: SeniorTheme.colors.riskDanger,
    fontWeight: '700',
  },
  explanationBody: {
    fontSize: SeniorTheme.typography.body,
    color: SeniorTheme.colors.deepForest,
    lineHeight: 24,
    marginBottom: SeniorTheme.spacing.md,
  },
  actionsBox: {
    backgroundColor: SeniorTheme.colors.white,
    padding: SeniorTheme.spacing.md,
    borderRadius: SeniorTheme.radii.md,
    marginBottom: SeniorTheme.spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionsTitle: {
    fontSize: SeniorTheme.typography.bodySmall,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
    marginBottom: 4,
  },
  actionItemText: {
    fontSize: SeniorTheme.typography.caption,
    color: SeniorTheme.colors.deepForest,
    lineHeight: 20,
    marginTop: 2,
  },
  emergencyBtn: {
    marginTop: SeniorTheme.spacing.sm,
    minHeight: 48,
  },
});
