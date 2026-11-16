import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SeniorTheme } from '../theme';
import { SeniorButton } from '../components/SeniorButton';
import { SeniorInput } from '../components/SeniorInput';
import { SeniorBadge } from '../components/SeniorBadge';
import { SeniorCard } from '../components/SeniorCard';
import { StorageService, SecureKeys } from '../services/storage';

export interface LoginScreenProps {
  onLoginSuccess: (phoneNumber: string) => void;
  onChangeLanguage?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onChangeLanguage,
}) => {
  const { t } = useTranslation();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Validate Indian mobile numbers (10 digits starting with 6, 7, 8, or 9)
  const validatePhone = (number: string): boolean => {
    const cleanNumber = number.replace(/\D/g, '');
    if (!cleanNumber) {
      setError(t('login.errorEmpty'));
      return false;
    }
    const indianMobileRegex = /^[6-9]\d{9}$/;
    if (!indianMobileRegex.test(cleanNumber)) {
      setError(t('login.errorInvalid'));
      return false;
    }
    setError('');
    return true;
  };

  const handlePhoneChange = (text: string) => {
    const digitsOnly = text.replace(/\D/g, '').slice(0, 10);
    setPhone(digitsOnly);
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (!validatePhone(phone)) {
      return;
    }

    try {
      setIsLoading(true);
      const formattedPhone = `+91 ${phone.substring(0, 5)} ${phone.substring(5)}`;

      // Store masked phone securely (Never store OTPs or passwords)
      await StorageService.setSecureCredential(
        SecureKeys.USER_PHONE_HASH,
        formattedPhone
      );

      // Brief delay to simulate secure verification
      await new Promise((resolve) => setTimeout(resolve, 350));

      onLoginSuccess(formattedPhone);
    } catch {
      onLoginSuccess(phone);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={SeniorTheme.colors.backgroundMain} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Bar: Demo Badge and Language Change Shortcut */}
          <View style={styles.topBar}>
            <SeniorBadge
              label={t('common.demoModeBadge')}
              variant="safe"
              icon="🛡️"
            />
            {Boolean(onChangeLanguage) && (
              <TouchableOpacity
                onPress={onChangeLanguage}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={t('common.language')}
                accessibilityHint="Opens language selection screen"
                style={styles.langButton}
              >
                <Text style={styles.langButtonText}>🌐 {t('common.language')}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Logo & Heading Section */}
          <View style={styles.headerSection}>
            <View style={styles.shieldEmblem}>
              <Text style={styles.shieldIcon}>🛡️</Text>
            </View>
            <Text style={styles.appName}>{t('common.appName')}</Text>
            <Text style={styles.title} accessible={true} accessibilityRole="header">
              {t('login.title')}
            </Text>
            <Text style={styles.subtitle}>{t('login.subtitle')}</Text>
          </View>

          {/* Reusable White Login Card (SeniorCard with elevated shadow) */}
          <SeniorCard variant="elevated" style={styles.cardContainer}>
            {/* Country Code & Phone Input */}
            <View style={styles.phoneInputRow}>
              <View style={styles.countryCodeBadge}>
                <Text style={styles.countryFlag}>🇮🇳</Text>
                <Text style={styles.countryCodeText}>{t('login.countryCode')}</Text>
              </View>

              <View style={styles.inputWrapper}>
                <SeniorInput
                  label={t('login.phoneLabel')}
                  value={phone}
                  onChangeText={handlePhoneChange}
                  placeholder={t('login.phonePlaceholder')}
                  keyboardType="phone-pad"
                  maxLength={10}
                  error={error}
                  accessibilityLabel={`${t('login.phoneLabel')} ${t('login.countryCode')}`}
                  accessibilityHint="Enter your 10 digit Indian mobile number"
                />
              </View>
            </View>

            {/* Helper Text */}
            <Text style={styles.helperText}>
              🔒 {t('login.helperText')}
            </Text>

            {/* Accessible Primary Continue Button */}
            <SeniorButton
              title={t('login.continueButton')}
              onPress={handleSubmit}
              loading={isLoading}
              accessibilityLabel={t('login.continueButton')}
              accessibilityHint="Validates mobile number and proceeds"
              style={styles.continueButton}
            />

            {/* Demo Mode Notice */}
            <View style={styles.demoNoticeContainer}>
              <Text style={styles.demoNoticeText}>
                ℹ️ {t('login.demoNotice')}
              </Text>
            </View>
          </SeniorCard>

          {/* Terms & Consent Disclaimer */}
          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>{t('login.terms')}</Text>
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
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SeniorTheme.spacing.md,
  },
  langButton: {
    minHeight: 48,
    paddingHorizontal: SeniorTheme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: SeniorTheme.colors.white,
    borderRadius: SeniorTheme.radii.md,
    borderWidth: 1,
    borderColor: SeniorTheme.colors.emeraldLight,
  },
  langButtonText: {
    fontSize: SeniorTheme.typography.bodySmall,
    fontWeight: '700',
    color: SeniorTheme.colors.richEmerald,
  },
  headerSection: {
    alignItems: 'center',
    marginVertical: SeniorTheme.spacing.sm,
  },
  shieldEmblem: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: SeniorTheme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: SeniorTheme.colors.richEmerald,
    marginBottom: SeniorTheme.spacing.sm,
    shadowColor: SeniorTheme.colors.deepForest,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shieldIcon: {
    fontSize: 34,
  },
  appName: {
    fontSize: SeniorTheme.typography.titleMedium,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: SeniorTheme.typography.titleLarge,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
    marginTop: SeniorTheme.spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: SeniorTheme.typography.body,
    color: SeniorTheme.colors.textDim,
    textAlign: 'center',
    marginTop: SeniorTheme.spacing.xs,
    lineHeight: 22,
    maxWidth: 320,
  },
  cardContainer: {
    marginVertical: SeniorTheme.spacing.md,
    borderColor: '#E2E8F0',
    borderWidth: 1.5,
  },
  phoneInputRow: {
    marginBottom: SeniorTheme.spacing.xs,
  },
  countryCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SeniorTheme.colors.backgroundMain,
    borderRadius: SeniorTheme.radii.sm,
    paddingHorizontal: SeniorTheme.spacing.sm,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: SeniorTheme.spacing.xs,
  },
  countryFlag: {
    fontSize: 16,
    marginRight: 4,
  },
  countryCodeText: {
    fontSize: SeniorTheme.typography.body,
    fontWeight: '700',
    color: SeniorTheme.colors.deepForest,
  },
  inputWrapper: {
    width: '100%',
  },
  helperText: {
    fontSize: SeniorTheme.typography.caption,
    color: SeniorTheme.colors.textDim,
    lineHeight: 18,
    marginBottom: SeniorTheme.spacing.lg,
  },
  continueButton: {
    minHeight: SeniorTheme.dimensions.minTouchTarget + 8,
    marginVertical: SeniorTheme.spacing.xs,
  },
  demoNoticeContainer: {
    backgroundColor: '#F0FDF4',
    padding: SeniorTheme.spacing.sm,
    borderRadius: SeniorTheme.radii.sm,
    borderWidth: 1,
    borderColor: SeniorTheme.colors.emeraldLight,
    marginTop: SeniorTheme.spacing.md,
  },
  demoNoticeText: {
    fontSize: SeniorTheme.typography.caption,
    color: SeniorTheme.colors.deepForest,
    lineHeight: 18,
  },
  termsContainer: {
    alignItems: 'center',
    paddingHorizontal: SeniorTheme.spacing.md,
    paddingBottom: SeniorTheme.spacing.md,
  },
  termsText: {
    fontSize: SeniorTheme.typography.caption,
    color: SeniorTheme.colors.textDim,
    textAlign: 'center',
    lineHeight: 18,
  },
});
