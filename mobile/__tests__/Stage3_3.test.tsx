import React from 'react';
import { Linking, Platform } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import '../src/i18n';
import i18n from '../src/i18n';
import { StorageService } from '../src/services/storage';
import { GuardianStatusService } from '../src/services/guardianStatus';
import { OnboardingScreen } from '../src/screens/OnboardingScreen';
import { HomeScreen } from '../src/screens/HomeScreen';
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

describe('Stage 3.3: Onboarding & Home Dashboard (Live Activation State)', () => {
  const originalOS = Platform.OS;

  beforeEach(async () => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    StorageService._resetAllForTesting();
    // Set to Android by default to test CallScreeningService integration
    Platform.OS = 'android';
    await act(async () => {
      await i18n.changeLanguage('en');
    });
    jest.spyOn(Linking, 'openURL').mockImplementation(() => Promise.resolve(true as any));
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });
    Platform.OS = originalOS;
    jest.restoreAllMocks();
  });

  describe('OnboardingScreen', () => {
    it('renders Slide 1 (Message Guardian) with Skip and Continue buttons', () => {
      let tree: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(<OnboardingScreen onComplete={jest.fn()} />);
      });
      const root = tree!.root;

      // Slide 1 elements
      expect(root.findByProps({ children: 'Message Guardian' })).toBeDefined();
      expect(root.findByProps({ children: 'ZERO SMS PERMISSIONS' })).toBeDefined();
      expect(root.findByProps({ accessibilityLabel: 'Skip' })).toBeDefined();
      expect(root.findByProps({ accessibilityLabel: 'Continue' })).toBeDefined();
    });

    it('advances through slides 1 -> 2 -> 3 and completes onboarding on Get Started', async () => {
      const onCompleteMock = jest.fn();
      let tree: renderer.ReactTestRenderer;

      act(() => {
        tree = renderer.create(<OnboardingScreen onComplete={onCompleteMock} />);
      });
      const root = tree!.root;

      // 1. From Slide 1 -> Slide 2 (Call Guardian)
      const continueBtn1 = root.findByProps({ accessibilityLabel: 'Continue' });
      act(() => {
        continueBtn1.props.onPress();
      });
      expect(root.findByProps({ children: 'Call Guardian' })).toBeDefined();
      expect(root.findByProps({ children: 'OFFLINE THREAT SCREENING' })).toBeDefined();

      // 2. From Slide 2 -> Slide 3 (Emergency Helpline 1930)
      const continueBtn2 = root.findByProps({ accessibilityLabel: 'Continue' });
      act(() => {
        continueBtn2.props.onPress();
      });
      expect(root.findByProps({ children: 'Emergency Helpline 1930' })).toBeDefined();
      expect(root.findByProps({ children: 'NATIONAL HELPLINE 1930' })).toBeDefined();

      // On last slide, action button is "Get Started"
      const getStartedBtn = root.findByProps({ accessibilityLabel: 'Get Started' });
      await act(async () => {
        getStartedBtn.props.onPress();
      });

      expect(onCompleteMock).toHaveBeenCalledTimes(1);

      // Verify onboarding persistence in storage
      const completed = await StorageService.isOnboardingCompleted();
      expect(completed).toBe(true);
    });

    it('persists completion and calls onComplete when Skip is tapped on Slide 1', async () => {
      const onCompleteMock = jest.fn();
      let tree: renderer.ReactTestRenderer;

      act(() => {
        tree = renderer.create(<OnboardingScreen onComplete={onCompleteMock} />);
      });
      const root = tree!.root;

      const skipBtn = root.findByProps({ accessibilityLabel: 'Skip' });
      await act(async () => {
        skipBtn.props.onPress();
      });

      expect(onCompleteMock).toHaveBeenCalledTimes(1);
      const completed = await StorageService.isOnboardingCompleted();
      expect(completed).toBe(true);
    });
  });

  describe('HomeScreen (Live Activation State)', () => {
    it('renders real initial status: Call Screening Setup Required & Database Not Synchronized', async () => {
      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<HomeScreen />);
        for (let i = 0; i < 5; i++) {
          await Promise.resolve();
        }
      });
      const root = tree!.root;

      // Should display Setup Required and Not Yet Synchronized
      expect(root.findByProps({ children: 'SETUP REQUIRED' })).toBeDefined();
      expect(root.findByProps({ children: 'NOT YET SYNCHRONIZED' })).toBeDefined();
      expect(root.findByProps({ children: 'Never synchronized' })).toBeDefined();

      // Core emergency and message guardian cards
      expect(root.findByProps({ children: 'Emergency Assistance' })).toBeDefined();
      expect(root.findByProps({ children: 'Call 1930 Helpline' })).toBeDefined();
      expect(root.findByProps({ children: 'Visit cybercrime.gov.in' })).toBeDefined();
    });

    it('activates call screening when Enable Call Screening is tapped', async () => {
      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<HomeScreen />);
        for (let i = 0; i < 5; i++) {
          await Promise.resolve();
        }
      });
      const root = tree!.root;

      // Tap enable call screening
      const enableBtn = root.findByProps({ title: 'Enable Call Screening' });
      await act(async () => {
        enableBtn.props.onPress();
        for (let i = 0; i < 5; i++) {
          await Promise.resolve();
        }
      });

      // Role is now granted; badge updates to active
      expect(root.findByProps({ children: 'ACTIVE & SCREENING CALLS' })).toBeDefined();
      const granted = await StorageService.getCallScreeningRoleGranted();
      expect(granted).toBe(true);
    });

    it('updates threat database status when Check for Updates is tapped', async () => {
      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<HomeScreen />);
        for (let i = 0; i < 5; i++) {
          await Promise.resolve();
        }
      });
      const root = tree!.root;

      const updateBtn = root.findByProps({ title: 'Check for Updates' });
      await act(async () => {
        updateBtn.props.onPress();
        for (let i = 0; i < 5; i++) {
          await Promise.resolve();
        }
      });

      // Status updates to synced
      expect(root.findByProps({ children: 'DATABASE UP TO DATE' })).toBeDefined();
      const dbInfo = await StorageService.getThreatDatabaseInfo();
      expect(dbInfo.lastSync).not.toBeNull();
      expect(dbInfo.version).toBeGreaterThan(0);
    });

    it('handles outdated database state correctly (>24 hours old)', async () => {
      // Set timestamp 30 hours in past
      const oldTime = new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString();
      await StorageService.setLastThreatSync(oldTime, 1, 100);

      const status = await GuardianStatusService.getThreatDatabaseStatus();
      expect(status.status).toBe('outdated');

      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<HomeScreen />);
        for (let i = 0; i < 5; i++) {
          await Promise.resolve();
        }
      });
      const root = tree!.root;

      expect(root.findByProps({ children: 'DATABASE OUTDATED (SYNC REQUIRED)' })).toBeDefined();
    });

    it('requires confirmation dialog before dialing 1930', async () => {
      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<HomeScreen />);
        for (let i = 0; i < 5; i++) {
          await Promise.resolve();
        }
      });
      const root = tree!.root;

      // 1. Tap Emergency 1930 button -> opens dialog
      const call1930Btn = root.findByProps({ title: 'Call 1930 Helpline' });
      act(() => {
        call1930Btn.props.onPress();
      });

      expect(Linking.openURL).not.toHaveBeenCalled();

      // 2. Confirm in dialog -> triggers Linking.openURL('tel:1930')
      const confirmBtn = root.findByProps({ accessibilityLabel: 'Call 1930' });
      act(() => {
        confirmBtn.props.onPress();
      });

      expect(Linking.openURL).toHaveBeenCalledWith('tel:1930');
    });

    it('requires confirmation dialog before opening cybercrime.gov.in portal', async () => {
      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<HomeScreen />);
        for (let i = 0; i < 5; i++) {
          await Promise.resolve();
        }
      });
      const root = tree!.root;

      // Tap portal button
      const portalBtn = root.findByProps({ title: 'Visit cybercrime.gov.in' });
      act(() => {
        portalBtn.props.onPress();
      });

      expect(Linking.openURL).not.toHaveBeenCalled();

      // Confirm in dialog
      const openPortalBtn = root.findByProps({ accessibilityLabel: 'Open Portal' });
      act(() => {
        openPortalBtn.props.onPress();
      });

      expect(Linking.openURL).toHaveBeenCalledWith('https://cybercrime.gov.in');
    });

    it('renders translated strings in Hindi and Marathi correctly', async () => {
      // Test in Hindi
      await act(async () => {
        await i18n.changeLanguage('hi');
      });

      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<HomeScreen />);
        for (let i = 0; i < 5; i++) {
          await Promise.resolve();
        }
      });
      let root = tree!.root;

      expect(root.findByProps({ children: 'धोखाधड़ी से सुरक्षा डैशबोर्ड' })).toBeDefined();
      expect(root.findByProps({ label: 'सेटअप आवश्यक है' })).toBeDefined();

      // Test in Marathi
      await act(async () => {
        await i18n.changeLanguage('mr');
      });

      await act(async () => {
        tree = renderer.create(<HomeScreen />);
        for (let i = 0; i < 5; i++) {
          await Promise.resolve();
        }
      });
      root = tree!.root;

      expect(root.findByProps({ children: 'फसवणूक संरक्षण डॅशबोर्ड' })).toBeDefined();
      expect(root.findByProps({ label: 'सेटअप आवश्यक आहे' })).toBeDefined();
    });
  });

  describe('App Navigation Flow with Onboarding', () => {
    it('navigates from Splash to Onboarding if language is set but onboarding not completed', async () => {
      await StorageService.setLanguage('en');
      await StorageService.setOnboardingCompleted(false);

      let tree: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(<App />);
      });
      const root = tree!.root;

      await flushAsyncTimers(1000);

      expect(root.findByProps({ children: 'Message Guardian' })).toBeDefined();
      expect(root.findByProps({ children: 'ZERO SMS PERMISSIONS' })).toBeDefined();
    });

    it('skips Onboarding and navigates directly to Login if onboarding is already completed', async () => {
      await StorageService.setLanguage('en');
      await StorageService.setOnboardingCompleted(true);

      let tree: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(<App />);
      });
      const root = tree!.root;

      await flushAsyncTimers(1000);

      expect(root.findByProps({ children: 'Welcome to ScamShield' })).toBeDefined();
    });
  });
});
