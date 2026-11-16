import React from 'react';
import renderer, { act } from 'react-test-renderer';
import '../src/i18n';
import i18n from '../src/i18n';
import { StorageService, SecureKeys } from '../src/services/storage';
import { SplashScreen } from '../src/screens/SplashScreen';
import { LanguageSelectionScreen } from '../src/screens/LanguageSelectionScreen';
import { LoginScreen } from '../src/screens/LoginScreen';
import { App } from '../src/App';

const flushAsyncTimers = async (ms: number = 1000) => {
  await act(async () => {
    for (let i = 0; i < 10; i++) {
      await Promise.resolve();
    }
    jest.advanceTimersByTime(ms);
    for (let i = 0; i < 10; i++) {
      await Promise.resolve();
    }
  });
};

describe('Stage 3.2: Splash, Light Login, and Language Selection', () => {
  beforeEach(async () => {
    jest.useFakeTimers();
    StorageService._resetAllForTesting();
    await act(async () => {
      await i18n.changeLanguage('en');
    });
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });
  });

  describe('SplashScreen', () => {
    it('renders logo, app name, and tagline', () => {
      let tree: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(<SplashScreen onReady={jest.fn()} />);
      });
      const root = tree!.root;

      expect(root.findByProps({ children: 'ScamShield' })).toBeDefined();
      expect(root.findByProps({ children: 'Pause. Verify. Stay Safe.' })).toBeDefined();
    });

    it('navigates to LanguageSelect if no saved language exists', async () => {
      const onReadyMock = jest.fn();
      let tree: renderer.ReactTestRenderer;

      act(() => {
        tree = renderer.create(<SplashScreen onReady={onReadyMock} />);
      });

      await flushAsyncTimers(1000);

      expect(onReadyMock).toHaveBeenCalledWith('LanguageSelect');
    });

    it('navigates to Onboarding or Login if saved language is found', async () => {
      await StorageService.setLanguage('hi');
      await StorageService.setOnboardingCompleted(true);
      const onReadyMock = jest.fn();
      let tree: renderer.ReactTestRenderer;

      act(() => {
        tree = renderer.create(<SplashScreen onReady={onReadyMock} />);
      });

      await flushAsyncTimers(1000);

      expect(onReadyMock).toHaveBeenCalledWith('Login');
      expect(i18n.language).toBe('hi');
    });
  });

  describe('LanguageSelectionScreen', () => {
    it('renders English, Hindi, and Marathi options with native labels', () => {
      let tree: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(
          <LanguageSelectionScreen onLanguageSelected={jest.fn()} isInitialSetup={true} />
        );
      });
      const root = tree!.root;

      expect(root.findAllByProps({ children: 'English' }).length).toBeGreaterThanOrEqual(1);
      expect(root.findByProps({ children: 'हिंदी' })).toBeDefined();
      expect(root.findByProps({ children: 'मराठी' })).toBeDefined();
    });

    it('switches language and persists choice on confirm', async () => {
      const onLanguageSelectedMock = jest.fn();
      let tree: renderer.ReactTestRenderer;

      act(() => {
        tree = renderer.create(
          <LanguageSelectionScreen
            onLanguageSelected={onLanguageSelectedMock}
            isInitialSetup={true}
          />
        );
      });
      const root = tree!.root;

      // Tap Hindi option
      const hindiCard = root.findByProps({ accessibilityLabel: 'हिंदी (Hindi)' });
      await act(async () => {
        hindiCard.props.onPress();
      });

      expect(i18n.language).toBe('hi');

      // Tap Confirm button
      const confirmButton = root.findByProps({
        accessibilityLabel: 'चुनी हुई भाषा के साथ आगे बढ़ें',
      });
      await act(async () => {
        confirmButton.props.onPress();
      });

      expect(onLanguageSelectedMock).toHaveBeenCalledWith('hi');
      const savedLang = await StorageService.getLanguage();
      expect(savedLang).toBe('hi');
    });
  });

  describe('LoginScreen', () => {
    it('renders light theme login card, +91 country badge, and input fields', () => {
      let tree: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(
          <LoginScreen onLoginSuccess={jest.fn()} onChangeLanguage={jest.fn()} />
        );
      });
      const root = tree!.root;

      expect(root.findByProps({ children: 'Welcome to ScamShield' })).toBeDefined();
      expect(root.findByProps({ children: '+91' })).toBeDefined();
      expect(root.findByProps({ label: 'Senior Security Demo' })).toBeDefined();
    });

    it('displays error if submitted with empty phone number', async () => {
      const onLoginSuccessMock = jest.fn();
      let tree: renderer.ReactTestRenderer;

      act(() => {
        tree = renderer.create(
          <LoginScreen onLoginSuccess={onLoginSuccessMock} />
        );
      });
      const root = tree!.root;

      const continueBtn = root.findByProps({ accessibilityLabel: 'Continue' });
      await act(async () => {
        continueBtn.props.onPress();
      });

      expect(onLoginSuccessMock).not.toHaveBeenCalled();
      expect(
        root.findByProps({ children: '⚠️ Please enter your 10-digit mobile number.' })
      ).toBeDefined();
    });

    it('displays error if phone number is invalid (not 10 digits starting with 6-9)', async () => {
      const onLoginSuccessMock = jest.fn();
      let tree: renderer.ReactTestRenderer;

      act(() => {
        tree = renderer.create(
          <LoginScreen onLoginSuccess={onLoginSuccessMock} />
        );
      });
      const root = tree!.root;

      const input = root.findByProps({ placeholder: 'Enter 10-digit mobile number' });
      act(() => {
        input.props.onChangeText('5123456789');
      });

      const continueBtn = root.findByProps({ accessibilityLabel: 'Continue' });
      await act(async () => {
        continueBtn.props.onPress();
      });

      expect(onLoginSuccessMock).not.toHaveBeenCalled();
      expect(
        root.findByProps({
          children:
            '⚠️ Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.',
        })
      ).toBeDefined();
    });

    it('succeeds for valid 10-digit Indian mobile number and stores masked phone safely', async () => {
      const onLoginSuccessMock = jest.fn();
      let tree: renderer.ReactTestRenderer;

      act(() => {
        tree = renderer.create(
          <LoginScreen onLoginSuccess={onLoginSuccessMock} />
        );
      });
      const root = tree!.root;

      const input = root.findByProps({ placeholder: 'Enter 10-digit mobile number' });
      act(() => {
        input.props.onChangeText('9876543210');
      });

      const continueBtn = root.findByProps({ accessibilityLabel: 'Continue' });
      await act(async () => {
        continueBtn.props.onPress();
      });

      await act(async () => {
        jest.advanceTimersByTime(500);
      });

      expect(onLoginSuccessMock).toHaveBeenCalledWith('+91 98765 43210');

      const savedPhone = await StorageService.getSecureCredential(SecureKeys.USER_PHONE_HASH);
      expect(savedPhone).toBe('+91 98765 43210');
    });
  });

  describe('App Navigation Flow', () => {
    it('boots into SplashScreen initially and transitions to LanguageSelect', async () => {
      let tree: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(<App />);
      });
      const root = tree!.root;
      expect(root.findByProps({ children: 'ScamShield' })).toBeDefined();

      await flushAsyncTimers(1000);

      expect(root.findByProps({ children: 'Choose Your Language' })).toBeDefined();
    });
  });
});
