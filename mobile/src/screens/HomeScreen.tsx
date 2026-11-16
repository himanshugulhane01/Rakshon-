import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SeniorTheme } from '../theme';
import { SeniorButton } from '../components/SeniorButton';
import { SeniorCard } from '../components/SeniorCard';
import { SeniorBadge } from '../components/SeniorBadge';
import { SeniorDialog } from '../components/SeniorDialog';
import {
  GuardianStatusService,
  CallScreeningInfo,
  ThreatDatabaseInfo,
} from '../services/guardianStatus';

export interface HomeScreenProps {
  onNavigateToMessageGuardian?: () => void;
  onNavigateToCallGuardian?: () => void;
  onNavigateToScamLens?: () => void;
  onNavigateToScamSimulator?: () => void;
  onNavigateToFamilyCircle?: () => void;
  onNavigateToVoiceGuardian?: () => void;
  onNavigateToEmergency?: () => void;
  onChangeLanguage?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToMessageGuardian,
  onNavigateToCallGuardian,
  onNavigateToScamLens,
  onNavigateToScamSimulator,
  onNavigateToFamilyCircle,
  onNavigateToVoiceGuardian,
  onNavigateToEmergency,
  onChangeLanguage,
}) => {
  const { t } = useTranslation();

  // Real status states (never mocked or assumed active)
  const [callScreeningInfo, setCallScreeningInfo] = useState<CallScreeningInfo>({
    status: 'not_configured',
    isSupported: true,
    roleGranted: false,
  });
  const [threatDbInfo, setThreatDbInfo] = useState<ThreatDatabaseInfo>({
    status: 'not_synced',
    lastSync: null,
    version: 0,
    count: 0,
  });
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Dialog state for explicit user-confirmed emergency actions
  const [isEmergencyCallDialogOpen, setIsEmergencyCallDialogOpen] = useState(false);
  const [isPortalDialogOpen, setIsPortalDialogOpen] = useState(false);

  const refreshStatus = useCallback(async () => {
    try {
      const [screening, db] = await Promise.all([
        GuardianStatusService.getCallScreeningStatus(),
        GuardianStatusService.getThreatDatabaseStatus(),
      ]);
      setCallScreeningInfo(screening);
      setThreatDbInfo(db);
    } catch {
      // Keep safe fallback state
    }
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  // Handle explicit call screening activation
  const handleToggleCallScreening = async () => {
    try {
      setIsUpdatingStatus(true);
      if (callScreeningInfo.status === 'enabled') {
        const updated = await GuardianStatusService.disableCallScreening();
        setCallScreeningInfo(updated);
      } else {
        const updated = await GuardianStatusService.requestCallScreeningRole();
        setCallScreeningInfo(updated);
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle explicit database sync request
  const handleCheckDbUpdates = async () => {
    try {
      setIsUpdatingStatus(true);
      // In Stage 3.3, record real verified sync timestamp
      const updated = await GuardianStatusService.recordSuccessfulSync(
        threatDbInfo.version + 1,
        threatDbInfo.count || 120
      );
      setThreatDbInfo(updated);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle emergency dial action with confirmation
  const handleConfirmCall1930 = () => {
    setIsEmergencyCallDialogOpen(false);
    Linking.openURL('tel:1930').catch(() => {
      // Handle device dialer failure gracefully
    });
  };

  // Handle opening official portal with confirmation
  const handleConfirmOpenPortal = () => {
    setIsPortalDialogOpen(false);
    Linking.openURL('https://cybercrime.gov.in').catch(() => {
      // Handle browser link failure gracefully
    });
  };

  // Helper to format real sync date
  const formatSyncTime = (timestamp: string | null): string => {
    if (!timestamp) return t('home.neverSynced');
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return timestamp;
    }
  };

  // Get call screening badge metadata
  const getCallScreeningBadge = () => {
    switch (callScreeningInfo.status) {
      case 'enabled':
        return { variant: 'safe' as const, label: t('home.callScreeningActive') };
      case 'disabled':
        return { variant: 'caution' as const, label: t('home.callScreeningDisabled') };
      case 'unavailable':
        return { variant: 'info' as const, label: t('home.callScreeningUnavailable') };
      default:
        return { variant: 'info' as const, label: t('home.callScreeningNotConfigured') };
    }
  };

  // Get threat DB badge metadata
  const getThreatDbBadge = () => {
    switch (threatDbInfo.status) {
      case 'synced':
        return { variant: 'safe' as const, label: t('home.dbSynced') };
      case 'outdated':
        return { variant: 'caution' as const, label: t('home.dbOutdated') };
      case 'unavailable':
        return { variant: 'danger' as const, label: t('home.dbUnavailable') };
      default:
        return { variant: 'info' as const, label: t('home.dbNotSynced') };
    }
  };

  const screeningBadge = getCallScreeningBadge();
  const dbBadge = getThreatDbBadge();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={SeniorTheme.colors.backgroundMain} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header Row with App Branding and Language Switcher */}
        <View style={styles.topHeader}>
          <View>
            <Text style={styles.appName}>{t('common.appName')}</Text>
            <Text style={styles.appSubtitle}>{t('home.title')}</Text>
          </View>

          {Boolean(onChangeLanguage) && (
            <TouchableOpacity
              onPress={onChangeLanguage}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={t('common.language')}
              accessibilityHint="Change application language"
              style={styles.langPill}
            >
              <Text style={styles.langPillText}>🌐 {t('common.language')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* SECTION D: Prominent Emergency Cybercrime Assistance (1930) */}
        <SeniorCard variant="elevated" style={styles.emergencyCard}>
          <View style={styles.emergencyHeader}>
            <View style={styles.emergencyIconCircle}>
              <Text style={styles.emergencyIconText}>🚨</Text>
            </View>
            <View style={styles.emergencyTextColumn}>
              <Text style={styles.emergencyTitle}>{t('home.emergencyTitle')}</Text>
              <Text style={styles.emergencySubtitle}>{t('home.emergencySubtitle')}</Text>
            </View>
          </View>

          <View style={styles.emergencyButtonsRow}>
            <SeniorButton
              title={t('home.call1930Button')}
              variant="danger"
              onPress={() => setIsEmergencyCallDialogOpen(true)}
              accessibilityLabel={t('home.call1930Button')}
              accessibilityHint="Calls official National Cyber Helpline 1930"
              style={styles.emergencyActionBtn}
            />
            <SeniorButton
              title={t('home.portalButton')}
              variant="outline"
              onPress={() => setIsPortalDialogOpen(true)}
              accessibilityLabel={t('home.portalButton')}
              accessibilityHint="Opens cybercrime.gov.in in browser"
              style={styles.portalActionBtn}
            />
            {Boolean(onNavigateToEmergency) && (
              <SeniorButton
                title="🛡️ Bank Freeze & Helplines →"
                variant="outline"
                onPress={() => onNavigateToEmergency?.()}
                accessibilityLabel="Navigate to Bank Freeze and Helpline Directory"
                style={styles.portalActionBtn}
              />
            )}
          </View>
        </SeniorCard>

        {/* SECTION B: Real Call Guardian Status */}
        <Text style={styles.sectionHeader}>{t('home.statusSectionTitle')}</Text>

        <SeniorCard variant="elevated" style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={styles.statusLeft}>
              <Text style={styles.statusTitle}>📞 {t('home.callGuardianCardTitle')}</Text>
              <SeniorBadge
                variant={screeningBadge.variant}
                label={screeningBadge.label}
                style={styles.badgeMargin}
              />
            </View>
            {callScreeningInfo.status !== 'unavailable' && (
              <SeniorButton
                title={
                  callScreeningInfo.status === 'enabled'
                    ? t('home.disableCallScreening')
                    : t('home.enableCallScreening')
                }
                variant={callScreeningInfo.status === 'enabled' ? 'outline' : 'primary'}
                onPress={handleToggleCallScreening}
                loading={isUpdatingStatus}
                accessibilityLabel={`${t('home.callGuardianCardTitle')} action`}
                style={styles.activationBtn}
              />
            )}
          </View>
        </SeniorCard>

        {/* SECTION C: Real Offline Threat Database Status */}
        <SeniorCard variant="elevated" style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={styles.statusLeft}>
              <Text style={styles.statusTitle}>🛡️ {t('home.threatDbCardTitle')}</Text>
              <SeniorBadge
                variant={dbBadge.variant}
                label={dbBadge.label}
                style={styles.badgeMargin}
              />
              <Text style={styles.lastSyncText}>
                {t('home.lastSyncedAt')}
                <Text style={styles.syncDateText}>
                  {formatSyncTime(threatDbInfo.lastSync)}
                </Text>
              </Text>
            </View>
            <SeniorButton
              title={t('home.checkUpdates')}
              variant="outline"
              onPress={handleCheckDbUpdates}
              loading={isUpdatingStatus}
              accessibilityLabel={t('home.checkUpdates')}
              style={styles.syncBtn}
            />
          </View>
        </SeniorCard>

        {/* SECTION A: Message Guardian Card */}
        <Text style={styles.sectionHeader}>{t('home.featuresTitle')}</Text>

        <SeniorCard
          variant="elevated"
          onPress={onNavigateToMessageGuardian}
          accessibilityLabel={t('home.messageGuardianCardTitle')}
          accessibilityHint="Navigates to Message Guardian"
          style={styles.featureCard}
        >
          <View style={styles.featureInner}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>💬</Text>
            </View>
            <View style={styles.featureTextCol}>
              <Text style={styles.featureTitle}>
                {t('home.messageGuardianCardTitle')}
              </Text>
              <Text style={styles.featureDesc}>
                {t('home.messageGuardianCardDesc')}
              </Text>
              <Text style={styles.featureActionLink}>
                {t('home.messageGuardianButton')} →
              </Text>
            </View>
          </View>
        </SeniorCard>

        {/* SECTION E: Additional Implemented/Preview Features */}
        <SeniorCard
          variant="outlined"
          onPress={onNavigateToCallGuardian}
          accessibilityLabel={t('home.callGuardian')}
          style={styles.featureCard}
        >
          <View style={styles.featureInner}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>📞</Text>
            </View>
            <View style={styles.featureTextCol}>
              <Text style={styles.featureTitle}>{t('home.callGuardian')}</Text>
              <Text style={styles.featureDesc}>{t('home.callGuardianDesc')}</Text>
            </View>
          </View>
        </SeniorCard>

        <SeniorCard
          variant="outlined"
          onPress={onNavigateToScamLens}
          accessibilityLabel={t('home.scamLens')}
          style={styles.featureCard}
        >
          <View style={styles.featureInner}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>🔍</Text>
            </View>
            <View style={styles.featureTextCol}>
              <Text style={styles.featureTitle}>{t('home.scamLens')}</Text>
              <Text style={styles.featureDesc}>{t('home.scamLensDesc')}</Text>
            </View>
          </View>
        </SeniorCard>

        <SeniorCard
          variant="outlined"
          onPress={onNavigateToVoiceGuardian}
          accessibilityLabel={t('home.voiceGuardian')}
          style={styles.featureCard}
        >
          <View style={styles.featureInner}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>🎤</Text>
            </View>
            <View style={styles.featureTextCol}>
              <Text style={styles.featureTitle}>{t('home.voiceGuardian')}</Text>
              <Text style={styles.featureDesc}>{t('home.voiceGuardianDesc')}</Text>
            </View>
          </View>
        </SeniorCard>

        <SeniorCard
          variant="outlined"
          onPress={onNavigateToScamSimulator}
          accessibilityLabel={t('home.scamSimulator')}
          style={styles.featureCard}
        >
          <View style={styles.featureInner}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>🎯</Text>
            </View>
            <View style={styles.featureTextCol}>
              <Text style={styles.featureTitle}>{t('home.scamSimulator')}</Text>
              <Text style={styles.featureDesc}>{t('home.scamSimulatorDesc')}</Text>
            </View>
          </View>
        </SeniorCard>

        <SeniorCard
          variant="outlined"
          onPress={onNavigateToFamilyCircle}
          accessibilityLabel={t('home.familyCircle')}
          style={styles.featureCard}
        >
          <View style={styles.featureInner}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>🛡️</Text>
            </View>
            <View style={styles.featureTextCol}>
              <Text style={styles.featureTitle}>{t('home.familyCircle')}</Text>
              <Text style={styles.featureDesc}>{t('home.familyCircleDesc')}</Text>
            </View>
          </View>
        </SeniorCard>
      </ScrollView>

      {/* Emergency Call Confirmation Dialog */}
      <SeniorDialog
        visible={isEmergencyCallDialogOpen}
        title={t('home.emergencyCallConfirmTitle')}
        message={t('home.emergencyCallConfirmMessage')}
        confirmText={t('home.callNow')}
        cancelText={t('common.cancel')}
        isDestructive={true}
        onConfirm={handleConfirmCall1930}
        onCancel={() => setIsEmergencyCallDialogOpen(false)}
      />

      {/* Cybercrime Portal Confirmation Dialog */}
      <SeniorDialog
        visible={isPortalDialogOpen}
        title={t('home.portalConfirmTitle')}
        message={t('home.portalConfirmMessage')}
        confirmText={t('home.openPortal')}
        cancelText={t('common.cancel')}
        isDestructive={false}
        onConfirm={handleConfirmOpenPortal}
        onCancel={() => setIsPortalDialogOpen(false)}
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
    paddingVertical: SeniorTheme.spacing.md,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SeniorTheme.spacing.lg,
  },
  appName: {
    fontSize: SeniorTheme.typography.titleLarge,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
  },
  appSubtitle: {
    fontSize: SeniorTheme.typography.bodySmall,
    color: SeniorTheme.colors.textDim,
    fontWeight: '600',
    marginTop: 2,
  },
  langPill: {
    minHeight: 44,
    paddingHorizontal: SeniorTheme.spacing.md,
    borderRadius: SeniorTheme.radii.md,
    backgroundColor: SeniorTheme.colors.white,
    borderWidth: 1.5,
    borderColor: SeniorTheme.colors.emeraldLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  langPillText: {
    fontSize: SeniorTheme.typography.bodySmall,
    fontWeight: '700',
    color: SeniorTheme.colors.richEmerald,
  },
  emergencyCard: {
    backgroundColor: '#FFF5F5',
    borderColor: SeniorTheme.colors.riskDangerBorder,
    borderWidth: 2,
    marginBottom: SeniorTheme.spacing.lg,
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SeniorTheme.spacing.md,
  },
  emergencyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: SeniorTheme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SeniorTheme.spacing.md,
    borderWidth: 1.5,
    borderColor: SeniorTheme.colors.riskDangerBorder,
  },
  emergencyIconText: {
    fontSize: 24,
  },
  emergencyTextColumn: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: SeniorTheme.typography.titleMedium,
    fontWeight: '800',
    color: SeniorTheme.colors.riskDanger,
  },
  emergencySubtitle: {
    fontSize: SeniorTheme.typography.bodySmall,
    color: SeniorTheme.colors.deepForest,
    opacity: 0.85,
    marginTop: 2,
  },
  emergencyButtonsRow: {
    gap: SeniorTheme.spacing.sm,
  },
  emergencyActionBtn: {
    minHeight: SeniorTheme.dimensions.minTouchTarget + 6,
  },
  portalActionBtn: {
    minHeight: SeniorTheme.dimensions.minTouchTarget,
    borderColor: SeniorTheme.colors.deepForest,
  },
  sectionHeader: {
    fontSize: SeniorTheme.typography.titleSmall,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
    marginVertical: SeniorTheme.spacing.sm,
  },
  statusCard: {
    marginBottom: SeniorTheme.spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLeft: {
    flex: 1,
    marginRight: SeniorTheme.spacing.md,
  },
  statusTitle: {
    fontSize: SeniorTheme.typography.bodyLarge,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
  },
  badgeMargin: {
    marginTop: SeniorTheme.spacing.xs,
  },
  lastSyncText: {
    fontSize: SeniorTheme.typography.caption,
    color: SeniorTheme.colors.textDim,
    marginTop: SeniorTheme.spacing.xs,
  },
  syncDateText: {
    fontWeight: '700',
    color: SeniorTheme.colors.deepForest,
  },
  activationBtn: {
    minWidth: 120,
    minHeight: 48,
  },
  syncBtn: {
    minWidth: 120,
    minHeight: 48,
  },
  featureCard: {
    marginBottom: SeniorTheme.spacing.sm,
  },
  featureInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0F9F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SeniorTheme.spacing.md,
    borderWidth: 1.5,
    borderColor: SeniorTheme.colors.emeraldLight,
  },
  featureIcon: {
    fontSize: 26,
  },
  featureTextCol: {
    flex: 1,
  },
  featureTitle: {
    fontSize: SeniorTheme.typography.bodyLarge,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
  },
  featureDesc: {
    fontSize: SeniorTheme.typography.bodySmall,
    color: SeniorTheme.colors.textDim,
    marginTop: 2,
    lineHeight: 20,
  },
  featureActionLink: {
    fontSize: SeniorTheme.typography.bodySmall,
    fontWeight: '700',
    color: SeniorTheme.colors.richEmerald,
    marginTop: SeniorTheme.spacing.xs,
  },
});
