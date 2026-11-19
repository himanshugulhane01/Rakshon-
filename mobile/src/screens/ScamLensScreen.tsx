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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#152720" />

      {/* Dark Forest Header matching Master Reference #9 */}
      <SeniorHeader
        title={t('scamLens.title')}
        onBack={onBack}
        accessibilityLabel="Scam Lens screen header"
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
          {/* Master Reference #9: Scan & Verify Hero Card */}
          <View style={styles.heroCard}>
            {/* Viewfinder Graphic with Corner Brackets */}
            <View style={styles.viewfinderFrame}>
              <View style={[styles.cornerBracket, styles.bracketTopLeft]} />
              <View style={[styles.cornerBracket, styles.bracketTopRight]} />
              <View style={[styles.cornerBracket, styles.bracketBottomLeft]} />
              <View style={[styles.cornerBracket, styles.bracketBottomRight]} />
              <View style={styles.viewfinderCenter}>
                <Text style={styles.viewfinderIcon}>🔲</Text>
              </View>
            </View>

            <Text style={styles.heroHeadline}>Scan & Verify</Text>
            <Text style={styles.heroSubtitle}>
              Check QR codes, documents and payment links for safety
            </Text>
          </View>

          {/* Master Reference #9: Two Primary Feature Cards */}
          <View style={styles.featureCardsRow}>
            {/* 1. Scan QR Code Card */}
            <TouchableOpacity
              onPress={() => setActiveTab('QR')}
              style={[
                styles.featureCard,
                activeTab === 'QR' && styles.featureCardSelected,
              ]}
              accessible={true}
              accessibilityRole="tab"
              accessibilityLabel="QR Code Inspector"
              activeOpacity={0.8}
            >
              <View style={styles.cardLeftCol}>
                <View style={styles.featureIconBadge}>
                  <Text style={styles.featureIcon}>🔲</Text>
                </View>
                <View style={styles.featureTextCol}>
                  <Text style={styles.featureTitle}>Scan QR Code</Text>
                  <Text style={styles.featureSub}>Check payment or login QRs</Text>
                </View>
              </View>
              <Text style={styles.featureArrow}>→</Text>
            </TouchableOpacity>

            {/* 2. Inspect Document Card */}
            <TouchableOpacity
              onPress={() => setActiveTab('DOCUMENT')}
              style={[
                styles.featureCard,
                activeTab === 'DOCUMENT' && styles.featureCardSelected,
              ]}
              accessible={true}
              accessibilityRole="tab"
              accessibilityLabel="Paper Letter / Notice"
              activeOpacity={0.8}
            >
              <View style={styles.cardLeftCol}>
                <View style={styles.featureIconBadge}>
                  <Text style={styles.featureIcon}>📄</Text>
                </View>
                <View style={styles.featureTextCol}>
                  <Text style={styles.featureTitle}>Inspect Document</Text>
                  <Text style={styles.featureSub}>Analyze bills, screenshots, and notices</Text>
                </View>
              </View>
              <Text style={styles.featureArrow}>→</Text>
            </TouchableOpacity>
          </View>

          {/* TAB 1: QR CODE INSPECTION PANEL */}
          {activeTab === 'QR' && (
            <View style={styles.panelCard}>
              <Text style={styles.panelTitle}>QR Code Inspector</Text>
              <TextInput
                value={qrInput}
                onChangeText={(text) => {
                  setQrInput(text);
                  if (qrResult) setQrResult(null);
                }}
                placeholder="Paste or enter decoded QR text (UPI link or website URL)..."
                placeholderTextColor="#94A3B8"
                multiline={true}
                numberOfLines={3}
                style={styles.panelTextInput}
                accessibilityLabel={t('scamLens.qrInputLabel')}
              />

              <View style={styles.toolsRow}>
                <TouchableOpacity
                  onPress={handlePasteQr}
                  style={styles.toolBtn}
                  accessibilityRole="button"
                  accessibilityLabel="📋 Paste Decoded QR"
                >
                  <Text style={styles.toolBtnText}>📋 Paste Text</Text>
                </TouchableOpacity>

                {qrInput.length > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      setQrInput('');
                      setQrResult(null);
                    }}
                    style={styles.clearBtn}
                  >
                    <Text style={styles.clearBtnText}>✕ Clear</Text>
                  </TouchableOpacity>
                )}
              </View>

              <SeniorButton
                title="🔍 Inspect QR Safety"
                onPress={handleInspectQr}
                accessibilityLabel="🔍 Inspect QR Safety"
                style={styles.inspectBtn}
              />

              {/* QR Safety Result */}
              {Boolean(qrResult) && (
                <View style={styles.resultContainer}>
                  <View
                    style={[
                      styles.resultCard,
                      qrResult?.riskSeverity === 'HIGH_RISK'
                        ? styles.resultCardDanger
                        : styles.resultCardSafe,
                    ]}
                  >
                    <View style={styles.resultHeader}>
                      <Text style={styles.resultTitle}>
                        {qrResult?.title || 'Suspicious UPI Payment QR'}
                      </Text>
                      <SeniorBadge
                        variant={qrResult?.riskSeverity === 'HIGH_RISK' ? 'danger' : 'safe'}
                        label={qrResult?.riskSeverity === 'HIGH_RISK' ? 'HIGH RISK' : 'SAFE'}
                      />
                    </View>

                    {Boolean(qrResult?.upiDetails?.amount) && (
                      <View style={styles.amountBox}>
                        <Text style={styles.amountLabel}>Preset Debit Amount: </Text>
                        <Text style={styles.amountVal}>
                          {`₹${qrResult?.upiDetails?.amount}`}
                        </Text>
                      </View>
                    )}

                    <Text style={styles.resultExplain}>{qrResult?.summary}</Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* TAB 2: DOCUMENT INSPECTION PANEL */}
          {activeTab === 'DOCUMENT' && (
            <View style={styles.panelCard}>
              <Text style={styles.panelTitle}>Document Fraud Inspector</Text>
              <TextInput
                value={docInput}
                onChangeText={(text) => {
                  setDocInput(text);
                  if (docResult) setDocResult(null);
                }}
                placeholder="Type or paste text from the physical letter, electricity notice, or court summon..."
                placeholderTextColor="#94A3B8"
                multiline={true}
                numberOfLines={4}
                style={styles.panelTextInput}
                accessibilityLabel={t('scamLens.docInputLabel')}
              />

              <View style={styles.toolsRow}>
                <TouchableOpacity
                  onPress={handlePasteDoc}
                  style={styles.toolBtn}
                  accessibilityRole="button"
                  accessibilityLabel="📋 Paste Document Text"
                >
                  <Text style={styles.toolBtnText}>📋 Paste Text</Text>
                </TouchableOpacity>

                {docInput.length > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      setDocInput('');
                      setDocResult(null);
                    }}
                    style={styles.clearBtn}
                  >
                    <Text style={styles.clearBtnText}>✕ Clear</Text>
                  </TouchableOpacity>
                )}
              </View>

              {Boolean(docError) && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>⚠️ {docError}</Text>
                </View>
              )}

              <SeniorButton
                title="🔍 Inspect Document for Scam Patterns"
                onPress={handleInspectDocument}
                loading={isAnalyzingDoc}
                accessibilityLabel="🔍 Inspect Document for Scam Patterns"
                style={styles.inspectBtn}
              />

              {/* Document Result */}
              {Boolean(docResult) && (
                <View style={styles.resultContainer}>
                  <View style={[styles.resultCard, styles.resultCardDanger]}>
                    <Text style={styles.resultTitle}>Document Fraud Analysis</Text>
                    <Text style={styles.resultExplain}>{docResult?.explanation}</Text>

                    {docResult?.detected_indicators?.map((ind, i) => (
                      <Text key={i} style={styles.indicatorBullet}>
                        {`• ${ind.description}`}
                      </Text>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Master Reference #9: Recent Scans Section */}
          <View style={styles.recentSectionHeader}>
            <Text style={styles.recentSectionTitle}>Recent Scans</Text>
            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.recentScanItem}>
            <View style={styles.recentScanLeft}>
              <View style={styles.recentScanIconCircle}>
                <Text style={styles.recentScanIcon}>🔲</Text>
              </View>
              <View style={styles.recentScanTextCol}>
                <Text style={styles.recentScanTitle}>QR • UPI Payment</Text>
                <View style={styles.recentScanBadgeRow}>
                  <Text style={styles.recentSafeBadge}>Safe</Text>
                  <Text style={styles.recentTimeText}>• 3h ago</Text>
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
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#152720',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  viewfinderFrame: {
    width: 80,
    height: 80,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  cornerBracket: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderColor: '#2D6B51',
  },
  bracketTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 6,
  },
  bracketTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 6,
  },
  bracketBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 6,
  },
  bracketBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 6,
  },
  viewfinderCenter: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E8F5EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewfinderIcon: {
    fontSize: 22,
  },
  heroHeadline: {
    fontSize: 22,
    fontWeight: '800',
    color: '#152720',
    marginBottom: 6,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 280,
  },
  featureCardsRow: {
    gap: 12,
    marginBottom: 18,
  },
  featureCard: {
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
  featureCardSelected: {
    borderColor: '#2D6B51',
    backgroundColor: '#F7FCF9',
    borderWidth: 2,
  },
  cardLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  featureIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#E8F5EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 22,
  },
  featureTextCol: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#152720',
  },
  featureSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  featureArrow: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2D6B51',
    marginLeft: 8,
  },
  panelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    shadowColor: '#152720',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#152720',
    marginBottom: 12,
  },
  panelTextInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 14,
    minHeight: 90,
    fontSize: 15,
    color: '#152720',
    textAlignVertical: 'top',
  },
  toolsRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 12,
    alignItems: 'center',
  },
  toolBtn: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  toolBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  clearBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  clearBtnText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  inspectBtn: {
    minHeight: 50,
    borderRadius: 14,
    marginTop: 4,
  },
  resultContainer: {
    marginTop: 16,
  },
  resultCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
  },
  resultCardDanger: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  resultCardSafe: {
    backgroundColor: '#EBF7F2',
    borderColor: '#A8D9C5',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#152720',
  },
  amountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 6,
  },
  amountLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  amountVal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#DC2626',
  },
  resultExplain: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginTop: 4,
  },
  indicatorBullet: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '600',
    marginTop: 4,
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '600',
  },
  recentSectionHeader: {
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
  recentScanItem: {
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
  recentScanLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recentScanIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#E8F5EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentScanIcon: {
    fontSize: 22,
  },
  recentScanTextCol: {
    justifyContent: 'center',
  },
  recentScanTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#152720',
    marginBottom: 4,
  },
  recentScanBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recentSafeBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2D6B51',
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
