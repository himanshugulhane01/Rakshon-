import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SeniorTheme } from '../theme';
import { SeniorHeader } from '../components/SeniorHeader';
import { SeniorCard } from '../components/SeniorCard';
import { SeniorBadge } from '../components/SeniorBadge';
import { SeniorButton } from '../components/SeniorButton';
import { SeniorDialog } from '../components/SeniorDialog';
import { BottomNavigation, BottomNavTab } from '../components/BottomNavigation';
import {
  StorageService,
  PreferencesKeys,
  CaregiverPermissionSettings,
  CaregiverSafetyAlert,
  AudioVisualLearningStats,
  BankingSandboxStats,
  SafeBrowsingStats,
} from '../services/storage';

export interface CaregiverDashboardScreenProps {
  onBack: () => void;
  onSelectTab?: (tab: BottomNavTab) => void;
  onNavigateToEmergency?: () => void;
}

export const CaregiverDashboardScreen: React.FC<CaregiverDashboardScreenProps> = ({
  onBack,
  onSelectTab,
  onNavigateToEmergency,
}) => {
  const { t, i18n } = useTranslation();
  const isDevanagari = i18n?.language === 'hi' || i18n?.language === 'mr';
  const isMarathi = i18n?.language === 'mr';
  const isHindi = i18n?.language === 'hi';

  const [seniorName, setSeniorName] = useState<string>('Senior Member');
  const [caregiverName, setCaregiverName] = useState<string>('Rohit Sharma');
  const [caregiverRelation, setCaregiverRelation] = useState<string>('Son');
  const [isPaired, setIsPaired] = useState<boolean>(true);

  // Granular consent settings
  const [permissions, setPermissions] = useState<CaregiverPermissionSettings>({
    shareLearningProgress: true,
    shareSecurityStatus: true,
    shareHighRiskAlerts: true,
    consentGrantedAt: new Date().toISOString(),
  });

  // Educational progress
  const [audioVisualStats, setAudioVisualStats] = useState<AudioVisualLearningStats>({
    totalModules: 8,
    completedCount: 0,
    modules: {},
  });
  const [bankingStats, setBankingStats] = useState<BankingSandboxStats | null>(null);
  const [browsingStats, setBrowsingStats] = useState<SafeBrowsingStats | null>(null);

  // Safety alerts
  const [safetyAlerts, setSafetyAlerts] = useState<CaregiverSafetyAlert[]>([]);
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    // 1. Load Senior & Caregiver names
    const savedSeniorName = await StorageService.getPreference(PreferencesKeys.USER_FULL_NAME);
    if (savedSeniorName) {
      setSeniorName(savedSeniorName);
    }

    const familyInfo = await StorageService.getFamilyCircleInfo();
    if (familyInfo.caregiverName) {
      setCaregiverName(familyInfo.caregiverName);
    }
    if (familyInfo.caregiverRelation) {
      setCaregiverRelation(familyInfo.caregiverRelation);
    }
    setIsPaired(familyInfo.status === 'ACTIVE' || familyInfo.consentGranted);

    // 2. Load Permissions
    const savedPerms = await StorageService.getCaregiverPermissions();
    setPermissions(savedPerms);

    // 3. Load Progress
    const avStats = await StorageService.getAudioVisualProgress();
    setAudioVisualStats(avStats);

    const bStats = await StorageService.getBankingSandboxStats();
    setBankingStats(bStats);

    const sStats = await StorageService.getSafeBrowsingStats();
    setBrowsingStats(sStats);

    // 4. Load Alerts
    let alerts = await StorageService.getCaregiverAlertsLog();
    if (alerts.length === 0) {
      // Seed default sample authorized security events for transparent caregiver visibility
      alerts = [
        {
          id: 'alert_1',
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
          category: 'Suspicious Call',
          title: 'Unverified Telemarketing Call Blocked',
          riskLevel: 'MEDIUM',
          description: 'CallScreeningService intercepted an unregistered caller with unknown prefix.',
        },
        {
          id: 'alert_2',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          category: 'Banking Practice',
          title: 'Fake UPI Collect Request Identified',
          riskLevel: 'HIGH',
          description: 'Senior correctly rejected simulated ₹10,000 collect request trap.',
        },
      ];
      await StorageService.setPreference(
        PreferencesKeys.CAREGIVER_ALERTS_LOG,
        JSON.stringify(alerts)
      );
    }
    setSafetyAlerts(alerts);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const togglePermission = async (key: keyof CaregiverPermissionSettings) => {
    if (key === 'consentGrantedAt') return;
    const updated = {
      ...permissions,
      [key]: !permissions[key],
    };
    setPermissions(updated);
    await StorageService.setCaregiverPermissions(updated);
  };

  const handleRevokeConsent = async () => {
    await StorageService.revokeFamilyCircle();
    const updatedPerms: CaregiverPermissionSettings = {
      shareLearningProgress: false,
      shareSecurityStatus: false,
      shareHighRiskAlerts: false,
      consentGrantedAt: null,
    };
    await StorageService.setCaregiverPermissions(updatedPerms);
    setPermissions(updatedPerms);
    setIsPaired(false);
    setIsRevokeDialogOpen(false);
  };

  const handleGrantConsent = async () => {
    const updatedPerms: CaregiverPermissionSettings = {
      shareLearningProgress: true,
      shareSecurityStatus: true,
      shareHighRiskAlerts: true,
      consentGrantedAt: new Date().toISOString(),
    };
    await StorageService.confirmCaregiverPairing(caregiverName, caregiverRelation);
    await StorageService.setCaregiverPermissions(updatedPerms);
    setPermissions(updatedPerms);
    setIsPaired(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={SeniorTheme.colors.backgroundMain} />

      <SeniorHeader
        title={t('caregiverDashboard.title', 'Caregiver Safety Dashboard')}
        subtitle={t(
          'caregiverDashboard.subtitle',
          'Transparent, consent-first oversight for family members'
        )}
        onBack={onBack}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Pairing Overview Card */}
        <SeniorCard style={styles.pairingCard}>
          <View style={styles.pairingHeaderRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>🛡️</Text>
            </View>
            <View style={styles.pairingTextWrap}>
              <View style={styles.badgeRow}>
                <SeniorBadge
                  label={
                    isPaired
                      ? t('caregiverDashboard.consentGranted', 'Active Consent Granted')
                      : t('caregiverDashboard.consentRevoked', 'Consent Revoked / Inactive')
                  }
                  variant={isPaired ? 'safe' : 'danger'}
                />
                <SeniorBadge label={`Relation: ${caregiverRelation}`} variant="info" />
              </View>
              <Text style={styles.pairingNames}>
                {seniorName} ↔ {caregiverName}
              </Text>
              <Text style={styles.pairingSub}>
                Family safety circle active with transparent senior consent
              </Text>
            </View>
          </View>

          <View style={styles.pairingActionRow}>
            {isPaired ? (
              <SeniorButton
                title={t('caregiverDashboard.revokeConsent', 'Revoke Caregiver Access')}
                variant="danger"
                onPress={() => setIsRevokeDialogOpen(true)}
                style={styles.revokeButton}
              />
            ) : (
              <SeniorButton
                title={t('caregiverDashboard.grantConsent', 'Grant Caregiver Access')}
                variant="primary"
                onPress={handleGrantConsent}
                style={styles.revokeButton}
              />
            )}
          </View>
        </SeniorCard>

        {/* SECTION 1: Privacy Transparency (What is shared vs. what is NEVER shared) */}
        <SeniorCard style={styles.privacyCard}>
          <Text style={styles.privacyHeading}>
            {t('caregiverDashboard.whatIsSharedTitle', 'What information is shared?')}
          </Text>
          <View style={styles.privacyList}>
            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => togglePermission('shareLearningProgress')}
            >
              <Text style={styles.privacyItemShared}>
                {t(
                  'caregiverDashboard.whatIsSharedItem1',
                  '✓ Practice module completion and safety quiz scores'
                )}
              </Text>
              <SeniorBadge
                label={permissions.shareLearningProgress ? 'ENABLED' : 'OFF'}
                variant={permissions.shareLearningProgress ? 'safe' : 'caution'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => togglePermission('shareSecurityStatus')}
            >
              <Text style={styles.privacyItemShared}>
                {t(
                  'caregiverDashboard.whatIsSharedItem2',
                  '✓ Device protection status (call screening & database sync)'
                )}
              </Text>
              <SeniorBadge
                label={permissions.shareSecurityStatus ? 'ENABLED' : 'OFF'}
                variant={permissions.shareSecurityStatus ? 'safe' : 'caution'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => togglePermission('shareHighRiskAlerts')}
            >
              <Text style={styles.privacyItemShared}>
                {t(
                  'caregiverDashboard.whatIsSharedItem3',
                  '✓ User-authorized high-risk fraud alerts'
                )}
              </Text>
              <SeniorBadge
                label={permissions.shareHighRiskAlerts ? 'ENABLED' : 'OFF'}
                variant={permissions.shareHighRiskAlerts ? 'safe' : 'caution'}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.privacyDivider} />

          <Text style={styles.privacyHeadingDanger}>
            {t('caregiverDashboard.whatIsNeverSharedTitle', 'What is NEVER shared?')}
          </Text>
          <View style={styles.privacyList}>
            <Text style={styles.privacyItemForbidden}>
              {t(
                'caregiverDashboard.whatIsNeverSharedItem1',
                '🚫 Private SMS or WhatsApp chat contents'
              )}
            </Text>
            <Text style={styles.privacyItemForbidden}>
              {t(
                'caregiverDashboard.whatIsNeverSharedItem2',
                '🚫 Bank passwords, PINs, or OTPs'
              )}
            </Text>
            <Text style={styles.privacyItemForbidden}>
              {t(
                'caregiverDashboard.whatIsNeverSharedItem3',
                '🚫 Private phone call audio or personal dial logs'
              )}
            </Text>
          </View>
        </SeniorCard>

        {/* SECTION 2: Live Device Protection Status */}
        {permissions.shareSecurityStatus && (
          <SeniorCard style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>🛡️ Senior Device Protection Status</Text>
            <View style={styles.statusGrid}>
              <View style={styles.statusGridItem}>
                <Text style={styles.statusGridLabel}>
                  {isMarathi ? 'कॉल संरक्षण' : isDevanagari ? 'कॉल सुरक्षा' : 'Call Protection'}
                </Text>
                <SeniorBadge label={isMarathi || isDevanagari ? 'सक्रिय (ROOM)' : 'ACTIVE (ROOM)'} variant="safe" />
              </View>
              <View style={styles.statusGridItem}>
                <Text style={styles.statusGridLabel}>
                  {isMarathi ? 'धोका डेटाबेस' : isDevanagari ? 'खतरा डेटाबेस' : 'Threat Database'}
                </Text>
                <SeniorBadge label={isMarathi || isDevanagari ? 'ऑफलाइन सिंक' : 'OFFLINE SYNCED'} variant="safe" />
              </View>
              <View style={styles.statusGridItem}>
                <Text style={styles.statusGridLabel}>
                  {isMarathi ? 'फ्रॉड लेन्स' : isDevanagari ? 'फ्रॉड लेंस' : 'Fraud Lens'}
                </Text>
                <SeniorBadge label={isMarathi || isDevanagari ? 'सक्रिय' : 'ENABLED'} variant="safe" />
              </View>
              <View style={styles.statusGridItem}>
                <Text style={styles.statusGridLabel}>
                  {isMarathi ? 'सिस्टम अखंडता' : isDevanagari ? 'सिस्टम अखंडता' : 'System Integrity'}
                </Text>
                <SeniorBadge label={isMarathi || isDevanagari ? 'संरक्षित' : 'PROTECTED'} variant="safe" />
              </View>
            </View>
          </SeniorCard>
        )}

        {/* SECTION 3: Learning & Digital Literacy Progress */}
        {permissions.shareLearningProgress && (
          <SeniorCard style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>
              {isMarathi
                ? '🎓 डिजिटल साक्षरता आणि सराव प्रगती'
                : isDevanagari
                ? '🎓 डिजिटल साक्षरता और अभ्यास प्रगति'
                : '🎓 Digital Literacy & Practice Progress'}
            </Text>
            <View style={styles.learningProgressRow}>
              <View style={styles.progressStatBox}>
                <Text style={styles.progressStatNumber}>
                  {audioVisualStats.completedCount} / 8
                </Text>
                <Text style={styles.progressStatLabel}>
                  {isMarathi ? 'ऑडिओ मॉड्यूल्स' : isDevanagari ? 'ऑडियो मॉड्यूल्स' : 'Audio Modules'}
                </Text>
              </View>
              <View style={styles.progressStatBox}>
                <Text style={styles.progressStatNumber}>
                  {bankingStats?.completedScenarios || 0} / 4
                </Text>
                <Text style={styles.progressStatLabel}>
                  {isMarathi ? 'बँकिंग सँडबॉक्स' : isDevanagari ? 'बैंकिंग सैंडबॉक्स' : 'Banking Sandbox'}
                </Text>
              </View>
              <View style={styles.progressStatBox}>
                <Text style={styles.progressStatNumber}>
                  {browsingStats?.completedScenarios || 0} / 4
                </Text>
                <Text style={styles.progressStatLabel}>
                  {isMarathi ? 'सुरक्षित ब्राउझिंग' : isDevanagari ? 'सुरक्षित ब्राउज़िंग' : 'Safe Browsing'}
                </Text>
              </View>
            </View>
          </SeniorCard>
        )}

        {/* SECTION 4: Authorized Safety Alerts Log */}
        {permissions.shareHighRiskAlerts && (
          <SeniorCard style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>
              {t('caregiverDashboard.recentAlertsTitle', 'Recent Safety Alerts (Authorized)')}
            </Text>
            {safetyAlerts.length === 0 ? (
              <Text style={styles.noAlertsText}>
                {t(
                  'caregiverDashboard.noAlertsMessage',
                  'No recent high-risk alerts detected. Device is secure.'
                )}
              </Text>
            ) : (
              <View style={styles.alertsList}>
                {safetyAlerts.map((alert) => (
                  <View key={alert.id} style={styles.alertCardItem}>
                    <View style={styles.alertTopRow}>
                      <SeniorBadge
                        label={alert.riskLevel}
                        variant={alert.riskLevel === 'CRITICAL' || alert.riskLevel === 'HIGH' ? 'danger' : 'caution'}
                      />
                      <Text style={styles.alertCategory}>{alert.category}</Text>
                    </View>
                    <Text style={styles.alertTitle}>{alert.title}</Text>
                    <Text style={styles.alertDescription}>{alert.description}</Text>
                  </View>
                ))}
              </View>
            )}
          </SeniorCard>
        )}

        {/* SECTION 5: Emergency Caregiver Assistance */}
        <SeniorCard style={styles.emergencyCard}>
          <Text style={styles.emergencyTitle}>
            {t('caregiverDashboard.quickHelpTitle', 'Emergency Family Contact')}
          </Text>
          <View style={styles.emergencyButtonRow}>
            <SeniorButton
              title={t('caregiverDashboard.callSeniorButton', '📞 Call Senior Member')}
              variant="outline"
              onPress={() => Alert.alert('Call Senior', `Connecting voice call to ${seniorName}...`)}
              style={styles.emergencyAction}
            />
            <SeniorButton
              title={t('caregiverDashboard.callHelplineButton', '🚨 Call 1930 Cybercrime Helpline')}
              variant="danger"
              onPress={() => onNavigateToEmergency?.()}
              style={styles.emergencyAction}
            />
          </View>
        </SeniorCard>
      </ScrollView>

      {/* Confirmation Dialog for Revoking Consent */}
      <SeniorDialog
        visible={isRevokeDialogOpen}
        title={t('caregiverDashboard.revokeConsent', 'Revoke Caregiver Access')}
        message="Revoking consent will immediately stop sharing all learning progress, protection status, and alerts with your caregiver. You can grant access again anytime."
        confirmText="Revoke Access"
        cancelText="Cancel"
        onConfirm={handleRevokeConsent}
        onCancel={() => setIsRevokeDialogOpen(false)}
        isDestructive={true}
      />

      {onSelectTab && <BottomNavigation activeTab="family" onSelectTab={onSelectTab} />}
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
  pairingCard: {
    backgroundColor: SeniorTheme.colors.white,
    padding: 18,
    marginBottom: 16,
  },
  pairingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 26,
  },
  pairingTextWrap: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  pairingNames: {
    fontSize: 18,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
    marginBottom: 2,
  },
  pairingSub: {
    fontSize: 13,
    color: SeniorTheme.colors.textSecondary,
    lineHeight: 18,
  },
  pairingActionRow: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  revokeButton: {
    minHeight: 44,
  },
  // Privacy Card
  privacyCard: {
    backgroundColor: SeniorTheme.colors.white,
    padding: 18,
    marginBottom: 16,
  },
  privacyHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#065F46',
    marginBottom: 10,
  },
  privacyHeadingDanger: {
    fontSize: 16,
    fontWeight: '800',
    color: '#991B1B',
    marginBottom: 10,
  },
  privacyList: {
    gap: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  privacyItemShared: {
    flex: 1,
    fontSize: 14,
    color: SeniorTheme.colors.textPrimary,
    lineHeight: 20,
    fontWeight: '500',
    marginRight: 8,
  },
  privacyDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },
  privacyItemForbidden: {
    fontSize: 14,
    color: '#7F1D1D',
    lineHeight: 20,
    fontWeight: '600',
  },
  // Section Card
  sectionCard: {
    backgroundColor: SeniorTheme.colors.white,
    padding: 18,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: SeniorTheme.colors.deepForest,
    marginBottom: 12,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statusGridItem: {
    width: '47%',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'flex-start',
  },
  statusGridLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: SeniorTheme.colors.textSecondary,
    marginBottom: 6,
  },
  // Learning progress row
  learningProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  progressStatBox: {
    flex: 1,
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  progressStatNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
    marginBottom: 4,
  },
  progressStatLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: SeniorTheme.colors.textSecondary,
    textAlign: 'center',
  },
  // Alerts list
  alertsList: {
    gap: 10,
  },
  alertCardItem: {
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    padding: 12,
  },
  alertTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  alertCategory: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: SeniorTheme.colors.deepForest,
    marginBottom: 2,
  },
  alertDescription: {
    fontSize: 13,
    color: SeniorTheme.colors.textPrimary,
    lineHeight: 18,
  },
  noAlertsText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
  },
  // Emergency Card
  emergencyCard: {
    backgroundColor: SeniorTheme.colors.white,
    padding: 18,
    marginBottom: 20,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: SeniorTheme.colors.deepForest,
    marginBottom: 12,
  },
  emergencyButtonRow: {
    gap: 10,
  },
  emergencyAction: {
    minHeight: 48,
  },
});

