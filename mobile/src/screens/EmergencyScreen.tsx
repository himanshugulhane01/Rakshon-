import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  Linking,
  TouchableOpacity,
  Clipboard,
  Share,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SeniorTheme } from '../theme';
import { SeniorHeader } from '../components/SeniorHeader';
import { SeniorButton } from '../components/SeniorButton';
import { SeniorCard } from '../components/SeniorCard';
import { SeniorInput } from '../components/SeniorInput';
import { SeniorDialog } from '../components/SeniorDialog';
import { SeniorBadge } from '../components/SeniorBadge';
import {
  INDIAN_BANKS,
  BankHelpline,
  generateBankFreezeNotice,
  generateFamilyEmergencyNotice,
  EmergencyFamilyMessageType,
} from '../services/bankDirectory';

export interface EmergencyScreenProps {
  onBack?: () => void;
}

export const EmergencyScreen: React.FC<EmergencyScreenProps> = ({ onBack }) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  // Confirmation dialog states
  const [isDial1930Open, setIsDial1930Open] = useState(false);
  const [isPortalOpen, setIsPortalOpen] = useState(false);
  const [selectedBankToCall, setSelectedBankToCall] = useState<BankHelpline | null>(null);

  // Bank Freeze Notice Generator States
  const [bankName, setBankName] = useState('');
  const [accountDigits, setAccountDigits] = useState('');
  const [selectedIncidentType, setSelectedIncidentType] = useState<string>('unauthorized_upi');
  const [generatedNotice, setGeneratedNotice] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Bank Directory Search State
  const [bankSearchQuery, setBankSearchQuery] = useState('');

  // Family Emergency Message Template States
  const [familyTemplateType, setFamilyTemplateType] =
    useState<EmergencyFamilyMessageType>('fraud_alert');
  const [familyCustomDetails, setFamilyCustomDetails] = useState('');
  const [familyNoticeCopied, setFamilyNoticeCopied] = useState(false);

  const incidentTypes = [
    { id: 'unauthorized_upi', label: t('emergency.incidentUnauthorizedUpi') },
    { id: 'shared_otp', label: t('emergency.incidentSharedOtp') },
    { id: 'clicked_link', label: t('emergency.incidentClickedLink') },
    { id: 'other', label: t('emergency.incidentOther') },
  ];

  const handleConfirmCall1930 = () => {
    setIsDial1930Open(false);
    Linking.openURL('tel:1930').catch(() => {});
  };

  const handleConfirmPortal = () => {
    setIsPortalOpen(false);
    Linking.openURL('https://cybercrime.gov.in').catch(() => {});
  };

  const handleConfirmBankCall = () => {
    if (selectedBankToCall) {
      const phone = selectedBankToCall.phone;
      setSelectedBankToCall(null);
      Linking.openURL(`tel:${phone}`).catch(() => {});
    }
  };

  const handleGenerateNotice = () => {
    if (!bankName.trim()) {
      setFormError(t('emergency.errorSelectBank'));
      return;
    }
    if (!accountDigits.trim() || accountDigits.trim().length !== 4) {
      setFormError(t('emergency.errorDigits'));
      return;
    }

    setFormError(null);
    const incidentLabel =
      incidentTypes.find((it) => it.id === selectedIncidentType)?.label || selectedIncidentType;

    const notice = generateBankFreezeNotice({
      bankName: bankName.trim(),
      accountLast4: accountDigits.trim(),
      incidentType: incidentLabel,
    });

    setGeneratedNotice(notice);
    setIsCopied(false);
  };

  const handleCopyNotice = () => {
    if (generatedNotice) {
      Clipboard.setString(generatedNotice);
      setIsCopied(true);
    }
  };

  const handleShareNotice = async () => {
    if (generatedNotice) {
      try {
        await Share.share({
          message: generatedNotice,
          title: t('emergency.preparedNoticeLabel'),
        });
      } catch {
        // Safe fallback
      }
    }
  };

  // Family Notice Generator
  const currentFamilyNotice = generateFamilyEmergencyNotice(
    familyTemplateType,
    familyCustomDetails.trim()
  );

  const handleCopyFamilyNotice = () => {
    Clipboard.setString(currentFamilyNotice);
    setFamilyNoticeCopied(true);
  };

  const handleShareFamilyNotice = async () => {
    try {
      await Share.share({
        message: currentFamilyNotice,
        title:
          familyTemplateType === 'fraud_alert'
            ? t('emergency.templateFraudAlert')
            : t('emergency.templateVerifyRequest'),
      });
    } catch {
      // Safe fallback
    }
  };

  const getBankDisplayName = (bank: BankHelpline): string => {
    if (currentLang === 'hi' && bank.nameHi) return bank.nameHi;
    if (currentLang === 'mr' && bank.nameMr) return bank.nameMr;
    return bank.name;
  };

  // Filter bank directory
  const filteredBanks = INDIAN_BANKS.filter((b) => {
    if (!bankSearchQuery.trim()) return true;
    const q = bankSearchQuery.toLowerCase().trim();
    return (
      b.name.toLowerCase().includes(q) ||
      (b.nameHi && b.nameHi.toLowerCase().includes(q)) ||
      (b.nameMr && b.nameMr.toLowerCase().includes(q)) ||
      b.displayPhone.includes(q)
    );
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={SeniorTheme.colors.backgroundMain} />

      <SeniorHeader title={t('emergency.title')} onBack={onBack} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* SECTION 1: TOP EMERGENCY CARD (Helpline 1930 & Portal) */}
        <SeniorCard variant="elevated" style={styles.helplineCard}>
          <View style={styles.helplineHeader}>
            <View style={styles.alertIconCircle}>
              <Text style={styles.alertIconText}>🚨</Text>
            </View>
            <View style={styles.helplineTextCol}>
              <Text style={styles.helplineTitle}>{t('emergency.helplineCardTitle')}</Text>
              <Text style={styles.helplineSubtitle}>{t('emergency.helplineCardDesc')}</Text>
            </View>
          </View>

          <SeniorButton
            title={t('emergency.call1930Button')}
            variant="danger"
            onPress={() => setIsDial1930Open(true)}
            accessibilityLabel={t('emergency.call1930Button')}
            accessibilityHint="Dials National Cyber Crime Helpline 1930"
            style={styles.actionButtonMargin}
          />

          <SeniorButton
            title={t('emergency.portalButton')}
            variant="outline"
            onPress={() => setIsPortalOpen(true)}
            accessibilityLabel={t('emergency.portalButton')}
            accessibilityHint="Opens cybercrime.gov.in official reporting portal"
            style={styles.actionButtonMargin}
          />
        </SeniorCard>

        {/* SECTION 2: IMMEDIATE FRAUD GUIDANCE (Golden Hour Steps) */}
        <SeniorCard variant="default" style={styles.guidanceCard}>
          <Text style={styles.guidanceTitle}>{`⚡ ${t('emergency.guidanceTitle')}`}</Text>
          <Text style={styles.guidanceSubtitle}>{t('emergency.guidanceSubtitle')}</Text>

          <View style={styles.stepsList}>
            <View style={styles.stepItem}>
              <Text style={styles.stepHeading}>{t('emergency.step1Title')}</Text>
              <Text style={styles.stepBody}>{t('emergency.step1Desc')}</Text>
            </View>

            <View style={styles.stepItem}>
              <Text style={styles.stepHeading}>{t('emergency.step2Title')}</Text>
              <Text style={styles.stepBody}>{t('emergency.step2Desc')}</Text>
            </View>

            <View style={styles.stepItem}>
              <Text style={styles.stepHeading}>{t('emergency.step3Title')}</Text>
              <Text style={styles.stepBody}>{t('emergency.step3Desc')}</Text>
            </View>

            <View style={styles.stepItem}>
              <Text style={styles.stepHeading}>{t('emergency.step4Title')}</Text>
              <Text style={styles.stepBody}>{t('emergency.step4Desc')}</Text>
            </View>
          </View>

          {/* CRITICAL WARNING NOTICE */}
          <View style={styles.warningBox}>
            <Text style={styles.warningBoxText}>{t('emergency.warningNeverShare')}</Text>
          </View>

          {/* NO AUTO FREEZE DISCLAIMER */}
          <View style={styles.disclaimerBox}>
            <Text style={styles.disclaimerText}>{t('emergency.noAutoFreezeDisclaimer')}</Text>
          </View>
        </SeniorCard>

        {/* SECTION 3: PREPARED EMERGENCY MESSAGE TEMPLATES FOR FAMILY */}
        <Text style={styles.sectionTitle}>{`👨‍👩‍👦 ${t('emergency.familyNoticeTitle')}`}</Text>
        <Text style={styles.sectionSubtitle}>{t('emergency.familyNoticeDesc')}</Text>

        <SeniorCard variant="elevated" style={styles.familyNoticeCard}>
          {/* Template Choice Tabs */}
          <View style={styles.templateTabRow}>
            <TouchableOpacity
              style={[
                styles.templateTab,
                familyTemplateType === 'fraud_alert' && styles.templateTabActive,
              ]}
              onPress={() => {
                setFamilyTemplateType('fraud_alert');
                setFamilyNoticeCopied(false);
              }}
              accessible={true}
              accessibilityRole="radio"
              accessibilityState={{ selected: familyTemplateType === 'fraud_alert' }}
              accessibilityLabel={t('emergency.templateFraudAlert')}
            >
              <Text
                style={[
                  styles.templateTabText,
                  familyTemplateType === 'fraud_alert' && styles.templateTabTextActive,
                ]}
              >
                {t('emergency.templateFraudAlert')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.templateTab,
                familyTemplateType === 'verify_request' && styles.templateTabActive,
              ]}
              onPress={() => {
                setFamilyTemplateType('verify_request');
                setFamilyNoticeCopied(false);
              }}
              accessible={true}
              accessibilityRole="radio"
              accessibilityState={{ selected: familyTemplateType === 'verify_request' }}
              accessibilityLabel={t('emergency.templateVerifyRequest')}
            >
              <Text
                style={[
                  styles.templateTabText,
                  familyTemplateType === 'verify_request' && styles.templateTabTextActive,
                ]}
              >
                {t('emergency.templateVerifyRequest')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Optional Details Input */}
          <SeniorInput
            label=""
            value={familyCustomDetails}
            onChangeText={(text) => {
              setFamilyCustomDetails(text);
              setFamilyNoticeCopied(false);
            }}
            placeholder={t('emergency.familyDetailsPlaceholder')}
            accessibilityLabel="Optional description of the situation"
          />

          {/* Pre-formatted Message Display Box */}
          <View style={styles.preparedNoticeBox}>
            <Text style={styles.noticeBodyText} selectable={true}>
              {currentFamilyNotice}
            </Text>

            <SeniorButton
              title={t('emergency.shareFamilyNoticeButton')}
              variant="primary"
              onPress={handleShareFamilyNotice}
              accessibilityLabel={t('emergency.shareFamilyNoticeButton')}
              style={styles.actionButtonMargin}
            />

            <SeniorButton
              title={t('emergency.copyFamilyNoticeButton')}
              variant="outline"
              onPress={handleCopyFamilyNotice}
              accessibilityLabel={t('emergency.copyFamilyNoticeButton')}
              style={styles.actionButtonMargin}
            />

            {familyNoticeCopied && (
              <View style={styles.copiedBanner} accessible={true} accessibilityRole="alert">
                <Text style={styles.copiedBannerText}>{`✓ ${t('emergency.familyNoticeCopied')}`}</Text>
              </View>
            )}
          </View>
        </SeniorCard>

        {/* SECTION 4: STANDARDIZED BANK FREEZE NOTICE GENERATOR */}
        <Text style={styles.sectionTitle}>{t('emergency.freezeNoticeTitle')}</Text>
        <Text style={styles.sectionSubtitle}>{t('emergency.freezeNoticeDesc')}</Text>

        <SeniorCard variant="elevated" style={styles.formCard}>
          {/* Quick Bank Chips */}
          <Text style={styles.fieldLabel}>{t('emergency.bankNameLabel')}</Text>
          <View style={styles.chipRow}>
            {INDIAN_BANKS.slice(0, 4).map((bank) => (
              <TouchableOpacity
                key={bank.id}
                style={[
                  styles.quickChip,
                  bankName === bank.name && styles.quickChipActive,
                ]}
                onPress={() => setBankName(bank.name)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={bank.name}
              >
                <Text
                  style={[
                    styles.quickChipText,
                    bankName === bank.name && styles.quickChipTextActive,
                  ]}
                >
                  {bank.name.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <SeniorInput
            label=""
            value={bankName}
            onChangeText={setBankName}
            placeholder={t('emergency.bankNamePlaceholder')}
            accessibilityLabel={t('emergency.bankNameLabel')}
          />

          <SeniorInput
            label={t('emergency.accountDigitsLabel')}
            value={accountDigits}
            onChangeText={(text) => setAccountDigits(text.replace(/[^0-9]/g, '').slice(0, 4))}
            placeholder={t('emergency.accountDigitsPlaceholder')}
            keyboardType="number-pad"
            maxLength={4}
            accessibilityLabel={t('emergency.accountDigitsLabel')}
          />

          <Text style={styles.fieldLabel}>{t('emergency.incidentTypeLabel')}</Text>
          <View style={styles.incidentColumn}>
            {incidentTypes.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.incidentOption,
                  selectedIncidentType === item.id && styles.incidentOptionActive,
                ]}
                onPress={() => setSelectedIncidentType(item.id)}
                accessible={true}
                accessibilityRole="radio"
                accessibilityState={{ selected: selectedIncidentType === item.id }}
                accessibilityLabel={item.label}
              >
                <Text style={styles.radioDot}>
                  {selectedIncidentType === item.id ? '🔘' : '⚪'}
                </Text>
                <Text
                  style={[
                    styles.incidentOptionText,
                    selectedIncidentType === item.id && styles.incidentOptionTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {Boolean(formError) && (
            <View style={styles.errorContainer} accessible={true} accessibilityRole="alert">
              <Text style={styles.errorText}>{`⚠️ ${formError}`}</Text>
            </View>
          )}

          <SeniorButton
            title={t('emergency.generateNoticeButton')}
            variant="primary"
            onPress={handleGenerateNotice}
            accessibilityLabel={t('emergency.generateNoticeButton')}
            style={styles.generateButton}
          />

          {/* Generated Notice Box */}
          {Boolean(generatedNotice) && (
            <View style={styles.generatedNoticeBox}>
              <Text style={styles.generatedNoticeHeader}>{t('emergency.preparedNoticeLabel')}</Text>
              <Text
                style={styles.noticeBodyText}
                selectable={true}
                accessibilityLabel={t('emergency.preparedNoticeLabel')}
              >
                {generatedNotice}
              </Text>

              <SeniorButton
                title={t('emergency.copyNoticeButton')}
                variant="outline"
                onPress={handleCopyNotice}
                accessibilityLabel={t('emergency.copyNoticeButton')}
                accessibilityHint="Copies notice to clipboard"
                style={styles.copyBtn}
              />

              <SeniorButton
                title={t('emergency.shareFamilyNoticeButton')}
                variant="outline"
                onPress={handleShareNotice}
                accessibilityLabel="Share notice with bank or family"
                style={styles.copyBtn}
              />

              {isCopied && (
                <View style={styles.copiedBanner} accessible={true} accessibilityRole="alert">
                  <Text style={styles.copiedBannerText}>{`✓ ${t('emergency.noticeCopied')}`}</Text>
                </View>
              )}
            </View>
          )}

          {/* Strict Senior Privacy & Zero Silent SMS Guarantee */}
          <View style={styles.guaranteeBox}>
            <Text style={styles.guaranteeText}>
              {`🛡️ ${t('emergency.privacyGuarantee')}`}
            </Text>
          </View>
        </SeniorCard>

        {/* SECTION 5: OFFICIAL BANK EMERGENCY HELPLINES DIRECTORY */}
        <Text style={styles.sectionTitle}>{t('emergency.bankDirectoryTitle')}</Text>
        <Text style={styles.sectionSubtitle}>{t('emergency.bankDirectoryDesc')}</Text>

        {/* Bank Search Input */}
        <SeniorInput
          label=""
          value={bankSearchQuery}
          onChangeText={setBankSearchQuery}
          placeholder={t('emergency.bankSearchPlaceholder')}
          accessibilityLabel="Search bank name"
        />

        <View style={styles.bankList}>
          {filteredBanks.map((bank) => (
            <SeniorCard key={bank.id} variant="elevated" style={styles.bankCard}>
              <View style={styles.bankInfoRow}>
                <View style={styles.bankTextCol}>
                  <Text style={styles.bankName}>{getBankDisplayName(bank)}</Text>
                  <Text style={styles.bankPhone}>{`📞 ${bank.displayPhone}`}</Text>
                  <SeniorBadge
                    variant={bank.category === 'public' ? 'safe' : 'info'}
                    label={bank.category === 'public' ? 'Public Sector' : 'Private Bank'}
                    style={styles.bankBadge}
                  />
                </View>
                <SeniorButton
                  title="Call Bank"
                  variant="outline"
                  onPress={() => setSelectedBankToCall(bank)}
                  accessibilityLabel={`Call ${bank.name} helpline ${bank.displayPhone}`}
                  style={styles.callBankBtn}
                />
              </View>
            </SeniorCard>
          ))}

          {/* Fallback for unlisted banks */}
          <SeniorCard variant="default" style={styles.bankNotFoundCard}>
            <Text style={styles.bankNotFoundHeading}>
              {`ℹ️ ${t('emergency.bankNotFoundTitle')}`}
            </Text>
            <Text style={styles.bankNotFoundBody}>
              {t('emergency.bankNotFoundDesc')}
            </Text>
          </SeniorCard>
        </View>
      </ScrollView>

      {/* Confirmation Dialog: Call 1930 */}
      <SeniorDialog
        visible={isDial1930Open}
        title={t('emergency.confirmDialTitle')}
        message={t('emergency.confirmDialMessage')}
        confirmText={t('emergency.confirmDialAction')}
        cancelText={t('common.cancel')}
        isDestructive={true}
        onConfirm={handleConfirmCall1930}
        onCancel={() => setIsDial1930Open(false)}
      />

      {/* Confirmation Dialog: Open cybercrime.gov.in */}
      <SeniorDialog
        visible={isPortalOpen}
        title={t('emergency.confirmPortalTitle')}
        message={t('emergency.confirmPortalMessage')}
        confirmText={t('emergency.confirmPortalAction')}
        cancelText={t('common.cancel')}
        isDestructive={false}
        onConfirm={handleConfirmPortal}
        onCancel={() => setIsPortalOpen(false)}
      />

      {/* Confirmation Dialog: Call Specific Bank */}
      <SeniorDialog
        visible={selectedBankToCall !== null}
        title={
          selectedBankToCall
            ? t('emergency.confirmBankDialTitle', { bankName: selectedBankToCall.name })
            : ''
        }
        message={
          selectedBankToCall
            ? t('emergency.confirmBankDialMessage', {
                bankName: selectedBankToCall.name,
                phoneNumber: selectedBankToCall.displayPhone,
              })
            : ''
        }
        confirmText={t('emergency.confirmBankDialAction')}
        cancelText={t('common.cancel')}
        isDestructive={true}
        onConfirm={handleConfirmBankCall}
        onCancel={() => setSelectedBankToCall(null)}
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
  helplineCard: {
    backgroundColor: SeniorTheme.colors.cardBackground,
    borderLeftWidth: 6,
    borderLeftColor: SeniorTheme.colors.riskDanger,
    marginBottom: SeniorTheme.spacing.xl,
  },
  helplineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SeniorTheme.spacing.md,
  },
  alertIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SeniorTheme.spacing.md,
  },
  alertIconText: {
    fontSize: 28,
  },
  helplineTextCol: {
    flex: 1,
  },
  helplineTitle: {
    fontSize: SeniorTheme.typography.titleMedium,
    fontWeight: '800',
    color: SeniorTheme.colors.riskDanger,
    marginBottom: SeniorTheme.spacing.xs,
  },
  helplineSubtitle: {
    fontSize: SeniorTheme.typography.bodySmall,
    color: SeniorTheme.colors.deepForest,
    lineHeight: 20,
  },
  actionButtonMargin: {
    marginTop: SeniorTheme.spacing.sm,
  },
  guidanceCard: {
    backgroundColor: SeniorTheme.colors.cardBackground,
    borderWidth: 1,
    borderColor: SeniorTheme.colors.borderSubtle,
    marginBottom: SeniorTheme.spacing.xl,
  },
  guidanceTitle: {
    fontSize: SeniorTheme.typography.titleSmall,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
    marginBottom: 4,
  },
  guidanceSubtitle: {
    fontSize: SeniorTheme.typography.bodySmall,
    color: SeniorTheme.colors.textDim,
    marginBottom: SeniorTheme.spacing.md,
    lineHeight: 20,
  },
  stepsList: {
    gap: SeniorTheme.spacing.sm,
    marginBottom: SeniorTheme.spacing.md,
  },
  stepItem: {
    backgroundColor: SeniorTheme.colors.backgroundMain,
    padding: SeniorTheme.spacing.md,
    borderRadius: SeniorTheme.radii.sm,
    borderLeftWidth: 4,
    borderLeftColor: SeniorTheme.colors.richEmerald,
  },
  stepHeading: {
    fontSize: SeniorTheme.typography.body,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
    marginBottom: 4,
  },
  stepBody: {
    fontSize: SeniorTheme.typography.bodySmall,
    color: SeniorTheme.colors.deepForest,
    lineHeight: 20,
    opacity: 0.9,
  },
  warningBox: {
    backgroundColor: SeniorTheme.colors.riskDangerSurface,
    padding: SeniorTheme.spacing.md,
    borderRadius: SeniorTheme.radii.sm,
    borderWidth: 1,
    borderColor: SeniorTheme.colors.riskDangerBorder,
    marginBottom: SeniorTheme.spacing.sm,
  },
  warningBoxText: {
    fontSize: SeniorTheme.typography.bodySmall,
    fontWeight: '700',
    color: SeniorTheme.colors.riskDanger,
    lineHeight: 20,
  },
  disclaimerBox: {
    backgroundColor: SeniorTheme.colors.backgroundMain,
    padding: 10,
    borderRadius: SeniorTheme.radii.sm,
    borderWidth: 1,
    borderColor: SeniorTheme.colors.borderSubtle,
  },
  disclaimerText: {
    fontSize: SeniorTheme.typography.caption,
    fontWeight: '600',
    color: SeniorTheme.colors.textDim,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: SeniorTheme.typography.titleSmall,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
    marginTop: SeniorTheme.spacing.md,
    marginBottom: SeniorTheme.spacing.xs,
  },
  sectionSubtitle: {
    fontSize: SeniorTheme.typography.bodySmall,
    color: SeniorTheme.colors.textDim,
    marginBottom: SeniorTheme.spacing.md,
    lineHeight: 20,
  },
  familyNoticeCard: {
    marginBottom: SeniorTheme.spacing.xl,
  },
  templateTabRow: {
    flexDirection: 'row',
    gap: SeniorTheme.spacing.xs,
    marginBottom: SeniorTheme.spacing.md,
  },
  templateTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: SeniorTheme.radii.md,
    backgroundColor: SeniorTheme.colors.backgroundMain,
    borderWidth: 1.5,
    borderColor: SeniorTheme.colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  templateTabActive: {
    backgroundColor: SeniorTheme.colors.riskSafeSurface,
    borderColor: SeniorTheme.colors.richEmerald,
  },
  templateTabText: {
    fontSize: SeniorTheme.typography.caption,
    fontWeight: '700',
    color: SeniorTheme.colors.deepForest,
    textAlign: 'center',
  },
  templateTabTextActive: {
    color: SeniorTheme.colors.richEmerald,
    fontWeight: '800',
  },
  preparedNoticeBox: {
    marginTop: SeniorTheme.spacing.sm,
  },
  formCard: {
    marginBottom: SeniorTheme.spacing.xl,
  },
  fieldLabel: {
    fontSize: SeniorTheme.typography.bodySmall,
    fontWeight: '700',
    color: SeniorTheme.colors.deepForest,
    marginBottom: SeniorTheme.spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SeniorTheme.spacing.sm,
    gap: SeniorTheme.spacing.xs,
  },
  quickChip: {
    backgroundColor: SeniorTheme.colors.backgroundMain,
    borderWidth: 1,
    borderColor: SeniorTheme.colors.borderSubtle,
    borderRadius: SeniorTheme.radii.full,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  quickChipActive: {
    backgroundColor: SeniorTheme.colors.richEmerald,
    borderColor: SeniorTheme.colors.richEmerald,
  },
  quickChipText: {
    fontSize: SeniorTheme.typography.bodySmall,
    color: SeniorTheme.colors.deepForest,
    fontWeight: '600',
  },
  quickChipTextActive: {
    color: SeniorTheme.colors.white,
  },
  incidentColumn: {
    marginBottom: SeniorTheme.spacing.md,
  },
  incidentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: SeniorTheme.colors.borderSubtle,
    borderRadius: SeniorTheme.radii.md,
    marginBottom: SeniorTheme.spacing.xs,
    backgroundColor: SeniorTheme.colors.backgroundMain,
    minHeight: 48,
  },
  incidentOptionActive: {
    borderColor: SeniorTheme.colors.richEmerald,
    backgroundColor: SeniorTheme.colors.riskSafeSurface,
  },
  radioDot: {
    fontSize: 18,
    marginRight: 10,
  },
  incidentOptionText: {
    fontSize: SeniorTheme.typography.body,
    color: SeniorTheme.colors.deepForest,
    flex: 1,
  },
  incidentOptionTextActive: {
    fontWeight: '700',
    color: SeniorTheme.colors.richEmerald,
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
  generateButton: {
    marginTop: SeniorTheme.spacing.xs,
  },
  generatedNoticeBox: {
    marginTop: SeniorTheme.spacing.lg,
    padding: SeniorTheme.spacing.md,
    backgroundColor: SeniorTheme.colors.backgroundMain,
    borderRadius: SeniorTheme.radii.md,
    borderWidth: 1,
    borderColor: SeniorTheme.colors.borderSubtle,
  },
  generatedNoticeHeader: {
    fontSize: SeniorTheme.typography.bodySmall,
    fontWeight: '700',
    color: SeniorTheme.colors.richEmerald,
    marginBottom: SeniorTheme.spacing.sm,
  },
  noticeBodyText: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: SeniorTheme.colors.deepForest,
    lineHeight: 18,
    backgroundColor: SeniorTheme.colors.white,
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: SeniorTheme.colors.borderSubtle,
    marginBottom: SeniorTheme.spacing.sm,
  },
  copyBtn: {
    marginTop: SeniorTheme.spacing.xs,
  },
  copiedBanner: {
    marginTop: SeniorTheme.spacing.sm,
    backgroundColor: SeniorTheme.colors.riskSafeSurface,
    padding: 10,
    borderRadius: SeniorTheme.radii.sm,
  },
  copiedBannerText: {
    fontSize: SeniorTheme.typography.bodySmall,
    color: SeniorTheme.colors.riskSafe,
    fontWeight: '700',
    textAlign: 'center',
  },
  guaranteeBox: {
    marginTop: SeniorTheme.spacing.md,
    padding: 10,
    backgroundColor: SeniorTheme.colors.riskSafeSurface,
    borderRadius: SeniorTheme.radii.sm,
  },
  guaranteeText: {
    fontSize: SeniorTheme.typography.bodySmall,
    color: SeniorTheme.colors.riskSafe,
    fontWeight: '600',
    lineHeight: 18,
  },
  bankList: {
    gap: SeniorTheme.spacing.md,
  },
  bankCard: {
    marginBottom: SeniorTheme.spacing.sm,
  },
  bankInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bankTextCol: {
    flex: 1,
    marginRight: SeniorTheme.spacing.sm,
  },
  bankName: {
    fontSize: SeniorTheme.typography.bodyLarge,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
    marginBottom: 4,
  },
  bankPhone: {
    fontSize: SeniorTheme.typography.body,
    color: SeniorTheme.colors.richEmerald,
    fontWeight: '700',
    marginBottom: 6,
  },
  bankBadge: {
    alignSelf: 'flex-start',
  },
  callBankBtn: {
    minWidth: 110,
  },
  bankNotFoundCard: {
    backgroundColor: SeniorTheme.colors.backgroundMain,
    borderWidth: 1,
    borderColor: SeniorTheme.colors.borderSubtle,
    padding: SeniorTheme.spacing.md,
    borderRadius: SeniorTheme.radii.md,
  },
  bankNotFoundHeading: {
    fontSize: SeniorTheme.typography.body,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
    marginBottom: 4,
  },
  bankNotFoundBody: {
    fontSize: SeniorTheme.typography.bodySmall,
    color: SeniorTheme.colors.textDim,
    lineHeight: 20,
  },
});
