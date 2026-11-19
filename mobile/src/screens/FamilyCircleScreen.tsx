import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  Clipboard,
  Share,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SeniorTheme } from '../theme';
import { SeniorHeader } from '../components/SeniorHeader';
import { SeniorButton } from '../components/SeniorButton';
import { SeniorCard } from '../components/SeniorCard';
import { SeniorBadge } from '../components/SeniorBadge';
import { SeniorDialog } from '../components/SeniorDialog';
import { SeniorInput } from '../components/SeniorInput';
import { BottomNavigation, BottomNavTab } from '../components/BottomNavigation';
import { StorageService } from '../services/storage';

export interface FamilyCircleScreenProps {
  onBack?: () => void;
  onSelectTab?: (tab: BottomNavTab) => void;
}

export const FamilyCircleScreen: React.FC<FamilyCircleScreenProps> = ({ onBack, onSelectTab }) => {
  const { t, i18n } = useTranslation();
  const isDevanagari = i18n?.language === 'hi' || i18n?.language === 'mr';

  const handleBottomTabSelect = (tab: BottomNavTab) => {
    if (tab === 'family') return;
    if (onSelectTab) {
      onSelectTab(tab);
    } else if (tab === 'home') {
      onBack?.();
    }
  };

  const [pairingStatus, setPairingStatus] = useState<'ACTIVE' | 'PENDING' | 'NOT_PAIRED'>('NOT_PAIRED');
  const [caregiverName, setCaregiverName] = useState<string>('');
  const [caregiverRelation, setCaregiverRelation] = useState<string>('');
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [isConsentChecked, setIsConsentChecked] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Revocation confirmation dialog
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false);

  const loadFamilyCircleStatus = useCallback(async () => {
    try {
      const info = await StorageService.getFamilyCircleInfo();
      setPairingStatus(info.status);
      setCaregiverName(info.caregiverName);
      setCaregiverRelation(info.caregiverRelation || '');
      setPairingCode(info.pairingCode);
      if (info.status === 'NOT_PAIRED') {
        setIsConsentChecked(true);
      } else {
        setIsConsentChecked(info.consentGranted);
      }
    } catch {
      // Keep safe default state
    }
  }, []);

  useEffect(() => {
    loadFamilyCircleStatus();
  }, [loadFamilyCircleStatus]);

  const handleGenerateCode = async () => {
    // If user filled a name, validate it; if not provided (quick demo), require consent
    if (!isConsentChecked) {
      setFormError(t('familyCircle.consentError'));
      return;
    }

    const targetName = caregiverName.trim() || 'Trusted Caregiver';
    setFormError(null);

    try {
      setIsLoading(true);
      const code = await StorageService.initiateFamilyInvitation(targetName, caregiverRelation.trim());
      setPairingCode(code);
      setPairingStatus('PENDING');
      setIsCopied(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (pairingCode) {
      Clipboard.setString(pairingCode);
      setIsCopied(true);
    }
  };

  const handleShareInvitation = async () => {
    if (!pairingCode) return;
    const inviterTarget = caregiverName.trim() || 'Family Member';
    const message =
      `ScamShield Family Circle Invitation\n\n` +
      `Hello ${inviterTarget},\n` +
      `I am connecting you as my trusted family caregiver on ScamShield to watch over digital security.\n\n` +
      `Your 6-digit consent pairing code is: ${pairingCode}\n` +
      `(Valid for 15 minutes)\n\n` +
      `Please enter this code in the ScamShield companion app to verify connection. ScamShield protects privacy and never shares SMS or private passwords.`;

    try {
      await Share.share({
        message,
        title: 'ScamShield Family Invitation',
      });
    } catch {
      // Safe fallback
    }
  };

  const handleConfirmConnected = async () => {
    try {
      setIsLoading(true);
      const targetName = caregiverName.trim() || 'Rohit Sharma (Son)';
      await StorageService.confirmCaregiverPairing(targetName, caregiverRelation.trim());
      setCaregiverName(targetName);
      setPairingStatus('ACTIVE');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateCaregiverConnect = async () => {
    try {
      setIsLoading(true);
      const demoCaregiver = caregiverName.trim() || 'Rohit Sharma (Son)';
      await StorageService.confirmCaregiverPairing(demoCaregiver, caregiverRelation.trim() || 'Son');
      setCaregiverName(demoCaregiver);
      setPairingStatus('ACTIVE');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmRevoke = async () => {
    try {
      setIsLoading(true);
      setIsRevokeDialogOpen(false);
      await StorageService.revokeFamilyCircle();
      setPairingStatus('NOT_PAIRED');
      setCaregiverName('');
      setCaregiverRelation('');
      setPairingCode(null);
      setIsConsentChecked(false);
      setFormError(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={SeniorTheme.colors.backgroundMain} />

      <SeniorHeader title={t('familyCircle.title')} onBack={onBack} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* SECTION 1: Status & Action Card */}
        <SeniorCard variant="elevated" style={styles.statusCard}>
          <View style={styles.statusHeaderRow}>
            <View style={styles.shieldIconCircle}>
              <Text style={styles.shieldIconText}>👨‍👩‍👦</Text>
            </View>
            <View style={styles.statusTextCol}>
              <Text style={styles.cardHeaderTitle}>{t('familyCircle.consentTitle')}</Text>
              <SeniorBadge
                variant={
                  pairingStatus === 'ACTIVE'
                    ? 'safe'
                    : pairingStatus === 'PENDING'
                    ? 'caution'
                    : 'info'
                }
                label={
                  pairingStatus === 'ACTIVE'
                    ? t('familyCircle.statusActive')
                    : pairingStatus === 'PENDING'
                    ? t('familyCircle.statusPending')
                    : t('familyCircle.statusNotPaired')
                }
                style={styles.badgeMargin}
              />
            </View>
          </View>

          <Text style={styles.consentDescText}>{t('familyCircle.consentDesc')}</Text>

          {/* STATE A: NOT_PAIRED (Invitation Form with Explicit Consent) */}
          {pairingStatus === 'NOT_PAIRED' && (
            <View style={styles.actionSection}>
              <Text style={styles.formSectionHeading}>{t('familyCircle.inviteCardTitle')}</Text>

              <SeniorInput
                label={t('familyCircle.caregiverNameLabel')}
                value={caregiverName}
                onChangeText={(text) => {
                  setCaregiverName(text);
                  setFormError(null);
                }}
                placeholder={t('familyCircle.caregiverNamePlaceholder')}
                accessibilityLabel={t('familyCircle.caregiverNameLabel')}
              />

              <SeniorInput
                label={t('familyCircle.caregiverRelationLabel')}
                value={caregiverRelation}
                onChangeText={setCaregiverRelation}
                placeholder={t('familyCircle.caregiverRelationPlaceholder')}
                accessibilityLabel={t('familyCircle.caregiverRelationLabel')}
              />

              {/* Explicit Senior Consent Checkbox */}
              <TouchableOpacity
                style={[
                  styles.consentCheckboxRow,
                  isConsentChecked && styles.consentCheckboxRowActive,
                ]}
                onPress={() => {
                  setIsConsentChecked(!isConsentChecked);
                  setFormError(null);
                }}
                accessible={true}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isConsentChecked }}
                accessibilityLabel={t('familyCircle.consentCheckboxLabel')}
              >
                <Text style={styles.checkboxIcon}>{isConsentChecked ? '☑️' : '⬜'}</Text>
                <Text style={styles.consentCheckboxText}>
                  {t('familyCircle.consentCheckboxLabel')}
                </Text>
              </TouchableOpacity>

              {Boolean(formError) && (
                <View style={styles.errorBox} accessible={true} accessibilityRole="alert">
                  <Text style={styles.errorText}>{`⚠️ ${formError}`}</Text>
                </View>
              )}

              <SeniorButton
                title={t('familyCircle.generateCodeButton')}
                variant="primary"
                onPress={handleGenerateCode}
                loading={isLoading}
                accessibilityLabel={t('familyCircle.generateCodeButton')}
                accessibilityHint="Generates a 6-digit consent pairing code for your trusted caregiver"
                style={styles.buttonSpacing}
              />
            </View>
          )}

          {/* STATE B: PENDING (Code generated, waiting for connection) */}
          {pairingStatus === 'PENDING' && (
            <View style={styles.codeContainer}>
              <Text style={styles.codeLabel}>{t('familyCircle.pairingCodeLabel')}</Text>

              <View style={styles.codeDigitsBox}>
                <Text
                  style={styles.codeDigitsText}
                  accessible={true}
                  accessibilityLabel={`Pairing code ${pairingCode?.split('').join(' ')}`}
                >
                  {pairingCode}
                </Text>
              </View>

              <Text style={styles.codeExpiresText}>{t('familyCircle.pairingCodeExpires')}</Text>
              <Text style={styles.shareCodeHint}>{t('familyCircle.shareCodeHint')}</Text>

              {/* Share via WhatsApp/SMS Button */}
              <SeniorButton
                title={t('familyCircle.shareInviteButton')}
                variant="primary"
                onPress={handleShareInvitation}
                accessibilityLabel={t('familyCircle.shareInviteButton')}
                style={styles.buttonSpacing}
              />

              {/* Copy Code Button */}
              <SeniorButton
                title={isCopied ? '✓ Copied' : t('familyCircle.copyCodeButton')}
                variant="outline"
                onPress={handleCopyCode}
                accessibilityLabel="Copy pairing code"
                style={styles.buttonSpacing}
              />

              {/* Cloud Synchronization Status Indicator */}
              <View style={styles.cloudStatusBox}>
                <Text style={styles.cloudStatusHeading}>
                  {`☁️ ${t('familyCircle.cloudRelayTitle')}`}
                </Text>
                <Text style={styles.cloudStatusBody}>
                  {t('familyCircle.cloudRelayStatus')}
                </Text>
              </View>

              {/* Manual Confirmation Actions */}
              <SeniorButton
                title={t('familyCircle.manualConfirmButton')}
                variant="primary"
                onPress={handleConfirmConnected}
                loading={isLoading}
                accessibilityLabel={t('familyCircle.manualConfirmButton')}
                style={styles.buttonSpacing}
              />

              {/* Demo test button retained for backward compatibility */}
              <SeniorButton
                title={t('familyCircle.simulatePairingButton')}
                variant="secondary"
                onPress={handleSimulateCaregiverConnect}
                loading={isLoading}
                accessibilityLabel={t('familyCircle.simulatePairingButton')}
                style={styles.buttonSpacing}
              />
            </View>
          )}

          {/* STATE C: ACTIVE (Caregiver connected) */}
          {pairingStatus === 'ACTIVE' && (
            <View style={styles.activeCaregiverBox}>
              <View style={styles.caregiverInfoRow}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>👤</Text>
                </View>
                <View style={styles.caregiverDetailsCol}>
                  <Text style={styles.caregiverLabel}>{t('familyCircle.activeCaregiverLabel')}</Text>
                  <Text style={styles.caregiverNameText}>{caregiverName}</Text>
                  {Boolean(caregiverRelation) && (
                    <Text style={styles.caregiverRelationText}>
                      {t('familyCircle.caregiverRelationDisplay', { relation: caregiverRelation })}
                    </Text>
                  )}
                  <Text style={styles.caregiverGuardSince}>
                    {t('familyCircle.caregiverGuardingSince')}
                  </Text>
                </View>
              </View>

              {/* Minimal Sharing Breakdown */}
              <View style={styles.minimalSharingBox}>
                <Text style={styles.minimalSharingHeading}>
                  {`📋 ${t('familyCircle.minimalSharingTitle')}`}
                </Text>
                <Text style={styles.minimalSharingSub}>
                  {t('familyCircle.minimalSharingDesc')}
                </Text>
                <Text style={styles.minimalSharingItem}>
                  {t('familyCircle.sharedItem1')}
                </Text>
                <Text style={styles.minimalSharingItem}>
                  {t('familyCircle.sharedItem2')}
                </Text>
              </View>

              <SeniorButton
                title={t('familyCircle.revokeButton')}
                variant="danger"
                onPress={() => setIsRevokeDialogOpen(true)}
                loading={isLoading}
                accessibilityLabel={t('familyCircle.revokeButton')}
                accessibilityHint="Revokes caregiver connection and stops alert sharing"
                style={styles.revokeBtn}
              />
            </View>
          )}
        </SeniorCard>

        {/* SECTION 2: Strict Privacy Guarantee Card */}
        <SeniorCard variant="elevated" style={styles.privacyCard}>
          <View style={styles.privacyHeaderRow}>
            <View style={styles.privacyShieldCircle}>
              <Text style={styles.privacyShieldIcon}>🛡️</Text>
            </View>
            <View style={styles.privacyHeaderTitles}>
              <Text style={styles.privacyCardTitle}>{`🛡️ ${t('familyCircle.privacyTitle')}`}</Text>
              <Text style={styles.privacyZeroDataText}>Zero-Knowledge Privacy Architecture</Text>
            </View>
          </View>

          {/* What Caregiver Can See */}
          <View style={styles.privacySectionGroup}>
            <View style={styles.privacySectionHeaderRow}>
              <View style={styles.checkPillIcon}>
                <Text style={styles.checkPillText}>✓</Text>
              </View>
              <Text style={styles.privacySubHeading}>
                {t('familyCircle.privacyWhatCaregiverSeesTitle')}
              </Text>
            </View>
            <View style={styles.privacyBulletsBox}>
              <Text style={styles.bulletItemGreen}>
                {t('familyCircle.privacyWhatCaregiverSees1')}
              </Text>
              <Text style={styles.bulletItemGreen}>
                {t('familyCircle.privacyWhatCaregiverSees2')}
              </Text>
            </View>
          </View>

          {/* What Caregiver Can Never See */}
          <View style={styles.privacySectionGroup}>
            <View style={styles.privacySectionHeaderRow}>
              <View style={styles.lockPillIcon}>
                <Text style={styles.lockPillText}>🔒</Text>
              </View>
              <Text style={styles.privacySubHeadingRed}>
                {t('familyCircle.privacyWhatCaregiverNeverSeesTitle')}
              </Text>
            </View>
            <View style={styles.privacyBulletsBoxRed}>
              <Text style={styles.bulletItemRed}>
                {t('familyCircle.privacyWhatCaregiverNeverSees1')}
              </Text>
              <Text style={styles.bulletItemRed}>
                {t('familyCircle.privacyWhatCaregiverNeverSees2')}
              </Text>
              <Text style={styles.bulletItemRed}>
                {t('familyCircle.privacyWhatCaregiverNeverSees3')}
              </Text>
            </View>
          </View>
        </SeniorCard>
      </ScrollView>

      {/* Revocation Confirmation Dialog */}
      <SeniorDialog
        visible={isRevokeDialogOpen}
        title={t('familyCircle.revokeConfirmTitle')}
        message={t('familyCircle.revokeConfirmMessage', { caregiverName })}
        confirmText={t('familyCircle.revokeConfirmAction')}
        cancelText={t('common.cancel')}
        isDestructive={true}
        onConfirm={handleConfirmRevoke}
        onCancel={() => setIsRevokeDialogOpen(false)}
      />

      {/* 5-Item Bottom Navigation */}
      <BottomNavigation
        activeTab="family"
        onSelectTab={handleBottomTabSelect}
        isDevanagari={isDevanagari}
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
    paddingBottom: 48,
  },
  statusCard: {
    marginBottom: SeniorTheme.spacing.xl,
    borderRadius: SeniorTheme.radii.card,
  },
  statusHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SeniorTheme.spacing.md,
  },
  shieldIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F0F9F5',
    borderWidth: 1.5,
    borderColor: SeniorTheme.colors.emeraldLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SeniorTheme.spacing.md,
  },
  shieldIconText: {
    fontSize: 26,
  },
  statusTextCol: {
    flex: 1,
  },
  cardHeaderTitle: {
    fontSize: SeniorTheme.typography.titleMedium,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
    marginBottom: 4,
  },
  badgeMargin: {
    alignSelf: 'flex-start',
  },
  consentDescText: {
    fontSize: SeniorTheme.typography.body,
    color: SeniorTheme.colors.deepForest,
    lineHeight: 24,
    opacity: 0.9,
    marginBottom: SeniorTheme.spacing.md,
  },
  formSectionHeading: {
    fontSize: SeniorTheme.typography.bodyLarge,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
    marginBottom: SeniorTheme.spacing.sm,
  },
  actionSection: {
    marginTop: SeniorTheme.spacing.xs,
  },
  consentCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SeniorTheme.spacing.md,
    borderRadius: SeniorTheme.radii.button,
    backgroundColor: SeniorTheme.colors.backgroundMain,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: SeniorTheme.spacing.md,
    minHeight: 52,
  },
  consentCheckboxRowActive: {
    borderColor: SeniorTheme.colors.richEmerald,
    backgroundColor: '#F0F9F5',
  },
  checkboxIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  consentCheckboxText: {
    fontSize: SeniorTheme.typography.bodySmall,
    color: SeniorTheme.colors.deepForest,
    fontWeight: '600',
    flex: 1,
    lineHeight: 20,
  },
  errorBox: {
    backgroundColor: '#FFEBEE',
    padding: SeniorTheme.spacing.md,
    borderRadius: SeniorTheme.radii.button,
    marginBottom: SeniorTheme.spacing.sm,
  },
  errorText: {
    fontSize: SeniorTheme.typography.bodySmall,
    color: SeniorTheme.colors.riskDanger,
    fontWeight: '700',
  },
  codeContainer: {
    backgroundColor: SeniorTheme.colors.backgroundMain,
    padding: SeniorTheme.spacing.md,
    borderRadius: SeniorTheme.radii.card,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    marginTop: SeniorTheme.spacing.sm,
  },
  codeLabel: {
    fontSize: SeniorTheme.typography.bodySmall,
    fontWeight: '700',
    color: SeniorTheme.colors.textDim,
    marginBottom: SeniorTheme.spacing.xs,
  },
  codeDigitsBox: {
    backgroundColor: SeniorTheme.colors.white,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: SeniorTheme.radii.button,
    borderWidth: 2,
    borderColor: SeniorTheme.colors.richEmerald,
    marginBottom: SeniorTheme.spacing.sm,
  },
  codeDigitsText: {
    fontFamily: 'monospace',
    fontSize: 32,
    fontWeight: '800',
    color: SeniorTheme.colors.richEmerald,
    letterSpacing: 6,
  },
  codeExpiresText: {
    fontSize: SeniorTheme.typography.bodySmall,
    color: SeniorTheme.colors.riskDanger,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  shareCodeHint: {
    fontSize: SeniorTheme.typography.bodySmall,
    color: SeniorTheme.colors.textDim,
    textAlign: 'center',
    marginBottom: SeniorTheme.spacing.md,
  },
  buttonSpacing: {
    width: '100%',
    marginTop: SeniorTheme.spacing.xs,
  },
  cloudStatusBox: {
    width: '100%',
    backgroundColor: SeniorTheme.colors.white,
    padding: SeniorTheme.spacing.md,
    borderRadius: SeniorTheme.radii.button,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginVertical: SeniorTheme.spacing.sm,
  },
  cloudStatusHeading: {
    fontSize: SeniorTheme.typography.bodySmall,
    fontWeight: '700',
    color: SeniorTheme.colors.deepForest,
    marginBottom: 4,
  },
  cloudStatusBody: {
    fontSize: SeniorTheme.typography.caption,
    color: SeniorTheme.colors.textDim,
    lineHeight: 18,
  },
  activeCaregiverBox: {
    backgroundColor: SeniorTheme.colors.backgroundMain,
    padding: SeniorTheme.spacing.md,
    borderRadius: SeniorTheme.radii.card,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: SeniorTheme.spacing.sm,
  },
  caregiverInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SeniorTheme.spacing.md,
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F9F5',
    borderWidth: 1.5,
    borderColor: SeniorTheme.colors.emeraldLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SeniorTheme.spacing.md,
  },
  avatarText: {
    fontSize: 24,
  },
  caregiverDetailsCol: {
    flex: 1,
  },
  caregiverLabel: {
    fontSize: SeniorTheme.typography.bodySmall,
    color: SeniorTheme.colors.textDim,
  },
  caregiverNameText: {
    fontSize: SeniorTheme.typography.titleSmall,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
  },
  caregiverRelationText: {
    fontSize: SeniorTheme.typography.bodySmall,
    color: SeniorTheme.colors.richEmerald,
    fontWeight: '700',
  },
  caregiverGuardSince: {
    fontSize: SeniorTheme.typography.bodySmall,
    color: SeniorTheme.colors.textDim,
    marginTop: 2,
  },
  minimalSharingBox: {
    backgroundColor: SeniorTheme.colors.white,
    padding: SeniorTheme.spacing.md,
    borderRadius: SeniorTheme.radii.button,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: SeniorTheme.spacing.md,
  },
  minimalSharingHeading: {
    fontSize: SeniorTheme.typography.bodySmall,
    fontWeight: '700',
    color: SeniorTheme.colors.deepForest,
    marginBottom: 2,
  },
  minimalSharingSub: {
    fontSize: SeniorTheme.typography.caption,
    color: SeniorTheme.colors.textDim,
    marginBottom: 6,
  },
  minimalSharingItem: {
    fontSize: SeniorTheme.typography.caption,
    color: SeniorTheme.colors.deepForest,
    fontWeight: '600',
    lineHeight: 18,
  },
  revokeBtn: {
    marginTop: SeniorTheme.spacing.xs,
  },
  privacyCard: {
    backgroundColor: '#FFFFFF',
    marginBottom: SeniorTheme.spacing.xl,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#152720',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  privacyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 6,
  },
  privacyShieldCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#DCFCE7',
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  privacyShieldIcon: {
    fontSize: 20,
  },
  privacyHeaderTitles: {
    flex: 1,
  },
  privacyCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
  },
  privacyZeroDataText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16A34A',
    marginTop: 2,
  },
  privacySectionGroup: {
    marginTop: 14,
  },
  privacySectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  checkPillIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkPillText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#15803D',
  },
  lockPillIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockPillText: {
    fontSize: 12,
  },
  privacySubHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#15803D',
  },
  privacyBulletsBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    padding: 14,
    borderRadius: 14,
  },
  bulletItemGreen: {
    fontSize: 13,
    color: '#14532D',
    lineHeight: 20,
    fontWeight: '600',
    marginBottom: 6,
  },
  privacySubHeadingRed: {
    fontSize: 15,
    fontWeight: '800',
    color: '#B91C1C',
  },
  privacyBulletsBoxRed: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    padding: 14,
    borderRadius: 14,
  },
  bulletItemRed: {
    fontSize: 13,
    color: '#7F1D1D',
    lineHeight: 20,
    fontWeight: '600',
    marginBottom: 6,
  },
});
