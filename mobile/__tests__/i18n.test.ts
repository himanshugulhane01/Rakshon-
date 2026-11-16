import en from '../src/i18n/locales/en.json';
import hi from '../src/i18n/locales/hi.json';
import mr from '../src/i18n/locales/mr.json';

describe('Localization & Trilingual Support (Phase 1)', () => {
  const languages = [
    { code: 'en', name: 'English', dict: en },
    { code: 'hi', name: 'Hindi', dict: hi },
    { code: 'mr', name: 'Marathi', dict: mr },
  ];

  it.each(languages)(
    'contains all required safety and emergency keys for $name',
    ({ dict }) => {
      expect(dict.common.appName).toBeDefined();
      expect(dict.common.safe).toBeDefined();
      expect(dict.common.caution).toBeDefined();
      expect(dict.common.danger).toBeDefined();

      expect(dict.home.emergencyMode).toBeDefined();
      expect(dict.emergency.helplineButton).toContain('1930');
      expect(dict.callGuardian.title).toBeDefined();
    }
  );

  it('provides native script characters for Hindi and Marathi', () => {
    // Hindi check (Devanagari)
    expect(hi.common.safe).toBe('सुरक्षित');
    expect(hi.common.danger).toBe('बड़ा खतरा');

    // Marathi check (Devanagari)
    expect(mr.common.safe).toBe('सुरक्षित');
    expect(mr.common.danger).toBe('मोठा धोका');
  });
});

