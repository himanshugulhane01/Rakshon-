import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SeniorTheme, getFontFamily } from '../theme';
import { SeniorButton } from '../components/SeniorButton';
import { StorageService, SecureKeys } from '../services/storage';

export interface SignUpScreenProps {
  onSignUpSuccess: (phoneNumber: string) => void;
  onNavigateToLogin: () => void;
}

export const SignUpScreen: React.FC<SignUpScreenProps> = ({
  onSignUpSuccess,
  onNavigateToLogin,
}) => {
  const { t, i18n } = useTranslation();
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isDevanagari = i18n.language === 'hi' || i18n.language === 'mr';

  // OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  const validate = (): boolean => {
    if (!fullName.trim() || fullName.trim().length < 2) {
      setError('Please enter your full name (at least 2 letters).');
      return false;
    }
    const cleanMobile = mobile.replace(/\D/g, '');
    if (!cleanMobile) {
      setError('Please enter your mobile number.');
      return false;
    }
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return false;
    }
    if (!agreedToTerms) {
      setError('Please agree to the Terms & Privacy Policy to continue.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSignUpPress = async () => {
    if (!validate()) return;
    setIsLoading(true);
    // Simulate SMS OTP dispatch
    setTimeout(() => {
      setIsLoading(false);
      setOtpDigits(['1', '2', '3', '4', '5', '6']);
      setShowOtpModal(true);
      setResendTimer(30);
    }, 400);
  };

  const handleVerifyOtp = async () => {
    let entered = otpDigits.join('');
    if (!entered || entered.length < 6) {
      entered = '123456';
      setOtpDigits(['1', '2', '3', '4', '5', '6']);
    }
    setIsVerifyingOtp(true);
    setOtpError('');
    try {
      const formatted = `+91 ${mobile.substring(0, 5)} ${mobile.substring(5)}`;
      await StorageService.setUserFullName(fullName.trim());
      await StorageService.setSecureCredential(
        SecureKeys.USER_PHONE_HASH,
        formatted
      );
      setTimeout(() => {
        setIsVerifyingOtp(false);
        setShowOtpModal(false);
        onSignUpSuccess(formatted);
      }, 400);
    } catch {
      setIsVerifyingOtp(false);
      setShowOtpModal(false);
      onSignUpSuccess(mobile);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Shield Badge matching Mockup #5 */}
          <View style={styles.headerSection}>
            <View style={styles.badgeShield}>
              <Text style={styles.badgeShieldIcon}>✓</Text>
            </View>

            <Text
              style={[
                styles.title,
                { fontFamily: getFontFamily('700', isDevanagari) },
              ]}
              accessible={true}
              accessibilityRole="header"
              allowFontScaling={true}
            >
              Create Account
            </Text>
            <Text
              style={[
                styles.subtitle,
                { fontFamily: getFontFamily('400', isDevanagari) },
              ]}
              allowFontScaling={true}
            >
              Join Rakshon and stay protected
            </Text>
          </View>

          {/* Error Banner */}
          {Boolean(error) && (
            <View style={styles.errorBanner}>
              <Text
                style={[
                  styles.errorText,
                  { fontFamily: getFontFamily('600', isDevanagari) },
                ]}
                allowFontScaling={true}
              >
                ⚠️ {error}
              </Text>
            </View>
          )}

          {/* Input Fields Form */}
          <View style={styles.formContainer}>
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <View style={styles.inputIconWrapper}>
                <Text style={styles.inputIcon}>👤</Text>
              </View>
              <TextInput
                value={fullName}
                onChangeText={(t) => { setFullName(t); setError(''); }}
                placeholder="Enter your full name"
                placeholderTextColor={SeniorTheme.colors.textDim}
                autoCapitalize="words"
                style={[
                  styles.textInput,
                  { fontFamily: getFontFamily('500', false) },
                ]}
                accessibilityLabel="Full Name"
                allowFontScaling={true}
              />
            </View>

            {/* Mobile Number */}
            <View style={styles.inputGroup}>
              <View style={styles.inputIconWrapper}>
                <Text style={styles.inputIcon}>📞</Text>
              </View>
              <TextInput
                value={mobile}
                onChangeText={(t) => { setMobile(t.replace(/\D/g, '').slice(0, 10)); setError(''); }}
                placeholder="Mobile Number"
                placeholderTextColor={SeniorTheme.colors.textDim}
                keyboardType="phone-pad"
                maxLength={10}
                style={[
                  styles.textInput,
                  { fontFamily: getFontFamily('500', false) },
                ]}
                accessibilityLabel="Mobile Number"
                allowFontScaling={true}
              />
            </View>

            {/* Email (Optional) */}
            <View style={styles.inputGroup}>
              <View style={styles.inputIconWrapper}>
                <Text style={styles.inputIcon}>✉️</Text>
              </View>
              <TextInput
                value={email}
                onChangeText={(t) => { setEmail(t); setError(''); }}
                placeholder="Email (Optional)"
                placeholderTextColor={SeniorTheme.colors.textDim}
                keyboardType="email-address"
                autoCapitalize="none"
                style={[
                  styles.textInput,
                  { fontFamily: getFontFamily('500', false) },
                ]}
                accessibilityLabel="Email Optional"
                allowFontScaling={true}
              />
            </View>

            {/* Create Password */}
            <View style={styles.inputGroup}>
              <View style={styles.inputIconWrapper}>
                <Text style={styles.inputIcon}>🔒</Text>
              </View>
              <TextInput
                value={password}
                onChangeText={(t) => { setPassword(t); setError(''); }}
                placeholder="Create Password"
                placeholderTextColor={SeniorTheme.colors.textDim}
                secureTextEntry={!showPassword}
                style={[
                  styles.textInput,
                  { flex: 1, fontFamily: getFontFamily('500', false) },
                ]}
                accessibilityLabel="Create Password"
                allowFontScaling={true}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeToggle}
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              >
                <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>

            {/* Terms and Privacy Policy Checkbox */}
            <TouchableOpacity
              onPress={() => setAgreedToTerms(!agreedToTerms)}
              style={styles.termsRow}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, agreedToTerms && styles.checkboxActive]}>
                {agreedToTerms && <Text style={styles.checkboxCheck}>✓</Text>}
              </View>
              <Text
                style={[
                  styles.termsText,
                  { fontFamily: getFontFamily('400', isDevanagari) },
                ]}
                allowFontScaling={true}
              >
                I agree to the{' '}
                <Text
                  style={[
                    styles.termsLink,
                    { fontFamily: getFontFamily('700', isDevanagari) },
                  ]}
                >
                  Terms & Privacy Policy
                </Text>
              </Text>
            </TouchableOpacity>

            {/* Sign Up CTA */}
            <SeniorButton
              title="Sign Up"
              onPress={handleSignUpPress}
              loading={isLoading}
              style={styles.signUpBtn}
            />

            {/* Already have an account link */}
            <View style={styles.loginRow}>
              <Text
                style={[
                  styles.alreadyText,
                  { fontFamily: getFontFamily('400', isDevanagari) },
                ]}
                allowFontScaling={true}
              >
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={onNavigateToLogin}>
                <Text
                  style={[
                    styles.loginLink,
                    { fontFamily: getFontFamily('700', isDevanagari) },
                  ]}
                  allowFontScaling={true}
                >
                  Login
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 6-Digit OTP Verification Modal */}
      <Modal
        visible={showOtpModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowOtpModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.otpCard}>
            <Text
              style={[
                styles.otpTitle,
                { fontFamily: getFontFamily('700', isDevanagari) },
              ]}
              allowFontScaling={true}
            >
              Verify Your Number
            </Text>
            <Text
              style={[
                styles.otpSubtitle,
                { fontFamily: getFontFamily('400', isDevanagari) },
              ]}
              allowFontScaling={true}
            >
              Enter the 6-digit code sent to +91 {mobile}
            </Text>

            <TouchableOpacity
              onPress={() => setOtpDigits(['1', '2', '3', '4', '5', '6'])}
              style={styles.demoChip}
              activeOpacity={0.7}
              accessibilityLabel="Fill demo OTP"
            >
              <Text
                style={[
                  styles.demoChipText,
                  { fontFamily: getFontFamily('600', false) },
                ]}
                allowFontScaling={true}
              >
                ⚡ Demo Code: 123456 (Tap to fill)
              </Text>
            </TouchableOpacity>

            {Boolean(otpError) && (
              <Text
                style={[
                  styles.otpErrorText,
                  { fontFamily: getFontFamily('600', isDevanagari) },
                ]}
                allowFontScaling={true}
              >
                ⚠️ {otpError}
              </Text>
            )}

            <View style={styles.otpInputsRow}>
              {[0, 1, 2, 3, 4, 5].map((idx) => (
                <TextInput
                  key={idx}
                  value={otpDigits[idx]}
                  onChangeText={(val) => {
                    const newDigits = [...otpDigits];
                    newDigits[idx] = val.slice(-1);
                    setOtpDigits(newDigits);
                  }}
                  keyboardType="number-pad"
                  maxLength={1}
                  style={[
                    styles.otpBox,
                    { fontFamily: getFontFamily('700', false) },
                  ]}
                  allowFontScaling={true}
                />
              ))}
            </View>

            <SeniorButton
              title="Verify & Continue"
              onPress={handleVerifyOtp}
              loading={isVerifyingOtp}
              style={styles.verifyBtn}
            />

            <View style={styles.resendRow}>
              <Text
                style={[
                  styles.resendText,
                  { fontFamily: getFontFamily('400', isDevanagari) },
                ]}
                allowFontScaling={true}
              >
                Didn't receive code?{' '}
                <Text
                  style={[
                    styles.resendLink,
                    { fontFamily: getFontFamily('700', isDevanagari) },
                  ]}
                >
                  Resend {resendTimer > 0 ? `(${resendTimer}s)` : ''}
                </Text>
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setShowOtpModal(false)}
              style={styles.cancelBtn}
            >
              <Text
                style={[
                  styles.cancelText,
                  { fontFamily: getFontFamily('600', isDevanagari) },
                ]}
                allowFontScaling={true}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SeniorTheme.colors.white,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    flexGrow: 1,
  },
  headerSection: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  badgeShield: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: SeniorTheme.colors.richEmerald, // #2D6B51
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: SeniorTheme.colors.richEmerald,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  badgeShieldIcon: {
    color: SeniorTheme.colors.white,
    fontSize: 28,
    fontWeight: '900',
  },
  title: {
    fontSize: 26,
    color: SeniorTheme.colors.deepForest,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    color: SeniorTheme.colors.textDim, // #939E99
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },
  formContainer: {
    gap: 14,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    minHeight: 56,
  },
  inputIconWrapper: {
    marginRight: 10,
  },
  inputIcon: {
    fontSize: 18,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: SeniorTheme.colors.deepForest,
  },
  eyeToggle: {
    padding: 8,
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeIcon: {
    fontSize: 18,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    minHeight: 48,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxActive: {
    backgroundColor: SeniorTheme.colors.richEmerald,
    borderColor: SeniorTheme.colors.richEmerald,
  },
  checkboxCheck: {
    color: SeniorTheme.colors.white,
    fontSize: 14,
    fontWeight: '900',
  },
  termsText: {
    fontSize: 13,
    color: SeniorTheme.colors.textDim,
  },
  termsLink: {
    color: SeniorTheme.colors.richEmerald,
  },
  signUpBtn: {
    minHeight: 54,
    borderRadius: 16,
    marginTop: 8,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
    paddingBottom: 20,
    minHeight: 48,
  },
  alreadyText: {
    fontSize: 14,
    color: SeniorTheme.colors.textDim,
  },
  loginLink: {
    fontSize: 14,
    color: SeniorTheme.colors.richEmerald,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  otpCard: {
    backgroundColor: SeniorTheme.colors.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: SeniorTheme.colors.deepForest,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  otpTitle: {
    fontSize: 22,
    color: SeniorTheme.colors.deepForest,
    textAlign: 'center',
    marginBottom: 6,
  },
  otpSubtitle: {
    fontSize: 14,
    color: SeniorTheme.colors.textDim,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  otpErrorText: {
    color: '#DC2626',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
  },
  demoChip: {
    alignSelf: 'center',
    backgroundColor: '#E8F5EE',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#C8E6D8',
    marginBottom: 16,
    minHeight: 36,
    justifyContent: 'center',
  },
  demoChipText: {
    color: SeniorTheme.colors.richEmerald,
    fontSize: 13,
  },
  otpInputsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  otpBox: {
    width: 44,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    textAlign: 'center',
    fontSize: 22,
    color: SeniorTheme.colors.deepForest,
  },
  verifyBtn: {
    minHeight: 54,
    borderRadius: 16,
  },
  resendRow: {
    alignItems: 'center',
    marginVertical: 14,
    minHeight: 36,
    justifyContent: 'center',
  },
  resendText: {
    fontSize: 13,
    color: SeniorTheme.colors.textDim,
  },
  resendLink: {
    color: SeniorTheme.colors.richEmerald,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 8,
    minHeight: 48,
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 14,
    color: SeniorTheme.colors.textDim,
  },
});
