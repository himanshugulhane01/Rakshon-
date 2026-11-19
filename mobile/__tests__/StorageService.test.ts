import { StorageService, SecurityViolationError, PreferencesKeys } from '../src/services/storage';

describe('StorageService (Phase 3)', () => {
  beforeEach(() => {
    StorageService._resetAllForTesting();
  });

  it('manages language preferences with default fallback to English', async () => {
    expect(await StorageService.getLanguage()).toBe('en');

    await StorageService.setLanguage('hi');
    expect(await StorageService.getLanguage()).toBe('hi');

    await StorageService.setLanguage('mr');
    expect(await StorageService.getLanguage()).toBe('mr');
  });

  it('tracks onboarding completion flag', async () => {
    expect(await StorageService.isOnboardingCompleted()).toBe(false);

    await StorageService.setOnboardingCompleted(true);
    expect(await StorageService.isOnboardingCompleted()).toBe(true);
  });

  it('securely stores and retrieves non-sensitive session credentials', async () => {
    const key = 'user_session_token';
    const token = 'jwt_bearer_xyz123';

    await StorageService.setSecureCredential(key, token);
    const retrieved = await StorageService.getSecureCredential(key);
    expect(retrieved).toBe(token);
  });

  it('HARDENED GUARDRAIL: rejects storing OTP, PIN, or password with SecurityViolationError', async () => {
    // Attempting to store OTP
    await expect(
      StorageService.setSecureCredential('user_otp_code', '492011')
    ).rejects.toThrow(SecurityViolationError);

    // Attempting to store ATM/UPI PIN
    await expect(
      StorageService.setSecureCredential('account_pin', '1234')
    ).rejects.toThrow(SecurityViolationError);

    // Attempting to store Password
    await expect(
      StorageService.setSecureCredential('user_password', 'MySecretPass123')
    ).rejects.toThrow(SecurityViolationError);
  });

  it('manages dynamic user full name without hardcoded fallbacks', async () => {
    expect(await StorageService.getUserFullName()).toBe('');

    await StorageService.setUserFullName('Ramesh Kumar');
    expect(await StorageService.getUserFullName()).toBe('Ramesh Kumar');

    // Trims whitespace
    await StorageService.setUserFullName('  Sunita Patil  ');
    expect(await StorageService.getUserFullName()).toBe('Sunita Patil');
  });

  it('manages active session state and session clearance', async () => {
    expect(await StorageService.hasActiveSession()).toBe(false);

    await StorageService.setSecureCredential('scamshield_sec_user_phone_hash', '+91 98765 43210');
    await StorageService.setUserFullName('Vikram Rao');
    expect(await StorageService.hasActiveSession()).toBe(true);
    expect(await StorageService.getUserFullName()).toBe('Vikram Rao');

    await StorageService.clearUserSession();
    expect(await StorageService.hasActiveSession()).toBe(false);
    expect(await StorageService.getUserFullName()).toBe('');
  });
});

