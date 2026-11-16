import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SeniorTheme } from '../theme';
import { SeniorHeader } from '../components/SeniorHeader';
import { SeniorCard } from '../components/SeniorCard';
import { SeniorBadge } from '../components/SeniorBadge';
import { SeniorButton } from '../components/SeniorButton';
import {
  GuardianStatusService,
  ThreatDatabaseInfo,
} from '../services/guardianStatus';

export interface CallGuardianScreenProps {
  onBack: () => void;
}

export const CallGuardianScreen: React.FC<CallGuardianScreenProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const [dbInfo, setDbInfo] = useState<ThreatDatabaseInfo>({
    status: 'not_synced',
    lastSync: null,
    version: 0,
    count: 0,
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const loadStatus = useCallback(async () => {
    const status = await GuardianStatusService.getThreatDatabaseStatus();
    setDbInfo(status);
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const handleManualSync = async () => {
    try {
      setIsSyncing(true);
      setSyncFeedback(null);

      const updated = await GuardianStatusService.syncThreatDatabaseWithBackend();
      setDbInfo(updated);
      setSyncFeedback({
        type: 'success',
        message: t('callGuardian.syncSuccess'),
      });
    } catch (err: any) {
      setSyncFeedback({
        type: 'error',
        message: `${t('callGuardian.syncError')}${err.message || 'Server unavailable'}`,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const formatSyncTime = (timestamp: string | null): string => {
    if (!timestamp) return t('callGuardian.neverSynced');
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return timestamp;
    }
  };

  const getDbBadge = () => {
    switch (dbInfo.status) {
      case 'synced':
        return { variant: 'safe' as const, label: t('callGuardian.statusSynced') };
      case 'outdated':
        return { variant: 'caution' as const, label: t('callGuardian.statusOutdated') };
      case 'unavailable':
        return { variant: 'danger' as const, label: t('home.dbUnavailable') };
      default:
        return { variant: 'info' as const, label: t('callGuardian.statusNotSynced') };
    }
  };

  const badge = getDbBadge();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={SeniorTheme.colors.backgroundMain} />

      <SeniorHeader
        title={t('callGuardian.title')}
        subtitle={t('callGuardian.subtitle')}
        onBack={onBack}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Threat Database Live Status Card */}
        <SeniorCard variant="elevated" style={styles.statusCard}>
          <View style={styles.statusHeaderRow}>
            <View style={styles.statusIconCircle}>
              <Text style={styles.statusIconText}>🛡️</Text>
            </View>
            <View style={styles.statusTextCol}>
              <SeniorBadge variant={badge.variant} label={badge.label} />
              <Text style={styles.statusCardTitle}>
                {t('callGuardian.statusCardTitle')}
              </Text>
            </View>
          </View>

          {/* Genuine Threat Count from Room DB */}
          <View style={styles.metricContainer}>
            <Text style={styles.metricLabel}>
              {dbInfo.count > 0
                ? t('callGuardian.threatCount', { count: dbInfo.count })
                : t('callGuardian.zeroThreats')}
            </Text>
            <Text style={styles.syncDateText}>
              {t('callGuardian.lastSyncLabel')}
              <Text style={styles.syncDateValue}>{formatSyncTime(dbInfo.lastSync)}</Text>
            </Text>
          </View>

          {/* Sync Feedback Alert */}
          {Boolean(syncFeedback) && (
            <View
              style={[
                styles.feedbackBanner,
                syncFeedback?.type === 'success'
                  ? styles.feedbackSuccess
                  : styles.feedbackError,
              ]}
              accessible={true}
              accessibilityLiveRegion="polite"
            >
              <Text
                style={[
                  styles.feedbackText,
                  syncFeedback?.type === 'success'
                    ? styles.feedbackSuccessText
                    : styles.feedbackErrorText,
                ]}
              >
                {`${syncFeedback?.type === 'success' ? '✓' : '⚠️'} ${syncFeedback?.message}`}
              </Text>
            </View>
          )}

          {/* Manual Sync Trigger */}
          <SeniorButton
            title={
              isSyncing
                ? t('callGuardian.syncing')
                : t('callGuardian.syncButton')
            }
            variant="primary"
            onPress={handleManualSync}
            loading={isSyncing}
            accessibilityLabel={t('callGuardian.syncButton')}
            accessibilityHint="Fetches latest scam numbers from server into offline database"
            style={styles.syncButton}
          />
        </SeniorCard>

        {/* Section: Safe-by-Default Caller Policy */}
        <SeniorCard variant="elevated" style={styles.policyCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardIcon}>✅</Text>
            <Text style={styles.policyTitle}>
              {t('callGuardian.safeByDefaultTitle')}
            </Text>
          </View>
          <Text style={styles.policyDesc}>
            {t('callGuardian.safeByDefaultDesc')}
          </Text>
        </SeniorCard>

        {/* Section: Caller ID Spoofing Warning */}
        <SeniorCard variant="outlined" style={styles.warningCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardIcon}>⚠️</Text>
            <Text style={styles.warningTitle}>
              {t('callGuardian.spoofingWarningTitle')}
            </Text>
          </View>
          <Text style={styles.warningDesc}>
            {t('callGuardian.spoofingWarningDesc')}
          </Text>
        </SeniorCard>

        {/* Section: Zero Audio Interception Assurance */}
        <SeniorCard variant="outlined" style={styles.privacyCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardIcon}>🔒</Text>
            <Text style={styles.privacyTitle}>
              {t('callGuardian.noAudioListenTitle')}
            </Text>
          </View>
          <Text style={styles.privacyDesc}>
            {t('callGuardian.noAudioListenDesc')}
          </Text>
        </SeniorCard>

        {/* Section: Call History Privacy Status */}
        <SeniorCard variant="outlined" style={styles.privacyCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardIcon}>📵</Text>
            <Text style={styles.privacyTitle}>
              {t('callGuardian.callHistoryTitle')}
            </Text>
          </View>
          <Text style={styles.privacyDesc}>
            {t('callGuardian.callHistoryDesc')}
          </Text>
        </SeniorCard>
      </ScrollView>
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
  statusCard: {
    padding: SeniorTheme.spacing.lg,
    marginBottom: SeniorTheme.spacing.lg,
  },
  statusHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SeniorTheme.spacing.md,
  },
  statusIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0F9F5',
    borderWidth: 2,
    borderColor: SeniorTheme.colors.emeraldLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SeniorTheme.spacing.md,
  },
  statusIconText: {
    fontSize: 26,
  },
  statusTextCol: {
    flex: 1,
  },
  statusCardTitle: {
    fontSize: SeniorTheme.typography.titleMedium,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
    marginTop: SeniorTheme.spacing.xs,
  },
  metricContainer: {
    backgroundColor: SeniorTheme.colors.backgroundMain,
    borderRadius: SeniorTheme.radii.md,
    padding: SeniorTheme.spacing.md,
    marginVertical: SeniorTheme.spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricLabel: {
    fontSize: SeniorTheme.typography.bodyLarge,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
  },
  syncDateText: {
    fontSize: SeniorTheme.typography.caption,
    color: SeniorTheme.colors.textDim,
    marginTop: 4,
  },
  syncDateValue: {
    fontWeight: '700',
    color: SeniorTheme.colors.deepForest,
  },
  feedbackBanner: {
    padding: SeniorTheme.spacing.md,
    borderRadius: SeniorTheme.radii.sm,
    marginVertical: SeniorTheme.spacing.sm,
    borderWidth: 1.5,
  },
  feedbackSuccess: {
    backgroundColor: '#F0FDF4',
    borderColor: SeniorTheme.colors.riskSafeBorder,
  },
  feedbackError: {
    backgroundColor: '#FFF5F5',
    borderColor: SeniorTheme.colors.riskDangerBorder,
  },
  feedbackText: {
    fontSize: SeniorTheme.typography.bodySmall,
    fontWeight: '700',
    lineHeight: 20,
  },
  feedbackSuccessText: {
    color: SeniorTheme.colors.riskSafe,
  },
  feedbackErrorText: {
    color: SeniorTheme.colors.riskDanger,
  },
  syncButton: {
    marginTop: SeniorTheme.spacing.sm,
    minHeight: SeniorTheme.dimensions.minTouchTarget + 6,
  },
  policyCard: {
    padding: SeniorTheme.spacing.lg,
    marginBottom: SeniorTheme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: SeniorTheme.colors.richEmerald,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SeniorTheme.spacing.xs,
  },
  cardIcon: {
    fontSize: 22,
    marginRight: SeniorTheme.spacing.xs,
  },
  policyTitle: {
    fontSize: SeniorTheme.typography.bodyLarge,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
  },
  policyDesc: {
    fontSize: SeniorTheme.typography.body,
    color: SeniorTheme.colors.deepForest,
    lineHeight: 24,
    opacity: 0.9,
    marginTop: 4,
  },
  warningCard: {
    padding: SeniorTheme.spacing.lg,
    marginBottom: SeniorTheme.spacing.md,
    backgroundColor: '#FFFBEB',
    borderColor: SeniorTheme.colors.riskWarningBorder,
  },
  warningTitle: {
    fontSize: SeniorTheme.typography.bodyLarge,
    fontWeight: '800',
    color: SeniorTheme.colors.riskWarning,
  },
  warningDesc: {
    fontSize: SeniorTheme.typography.bodySmall,
    color: SeniorTheme.colors.deepForest,
    lineHeight: 22,
    opacity: 0.9,
    marginTop: 4,
  },
  privacyCard: {
    padding: SeniorTheme.spacing.lg,
    marginBottom: SeniorTheme.spacing.md,
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
  },
  privacyTitle: {
    fontSize: SeniorTheme.typography.bodyLarge,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
  },
  privacyDesc: {
    fontSize: SeniorTheme.typography.bodySmall,
    color: SeniorTheme.colors.textDim,
    lineHeight: 22,
    marginTop: 4,
  },
});
