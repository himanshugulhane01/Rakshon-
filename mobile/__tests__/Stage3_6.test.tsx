import React from 'react';
import { Clipboard, Linking } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import '../src/i18n';
import i18n from '../src/i18n';
import { StorageService, SecureKeys } from '../src/services/storage';
import { EmergencyScreen } from '../src/screens/EmergencyScreen';
import { FamilyCircleScreen } from '../src/screens/FamilyCircleScreen';
import { ScamSimulatorScreen } from '../src/screens/ScamSimulatorScreen';
import { App } from '../src/App';
import { INDIAN_BANKS } from '../src/services/bankDirectory';
import { SIMULATOR_SCENARIOS } from '../src/services/scamScenarios';

describe('Stage 3.6: Emergency Mode, Family Safety Circle & Scam Simulator', () => {
  beforeEach(async () => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    StorageService._resetAllForTesting();
    await act(async () => {
      await i18n.changeLanguage('en');
    });
    jest.spyOn(Linking, 'openURL').mockResolvedValue(true as any);
    jest.spyOn(Clipboard, 'setString').mockImplementation(() => {});
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });
    jest.restoreAllMocks();
  });

  describe('EmergencyScreen', () => {
    it('renders 1930 Cyber Helpline and cybercrime.gov.in emergency buttons', async () => {
      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<EmergencyScreen onBack={jest.fn()} />);
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      const root = tree!.root;

      expect(root.findByProps({ children: 'National Cyber Crime Helpline (1930)' })).toBeDefined();
      expect(
        root.findByProps({ accessibilityLabel: '🚨 Call 1930 Helpline' })
      ).toBeDefined();
      expect(
        root.findByProps({ accessibilityLabel: '🌐 Open cybercrime.gov.in' })
      ).toBeDefined();
    });

    it('confirms and triggers telephone dialer for 1930 upon user confirmation', async () => {
      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<EmergencyScreen onBack={jest.fn()} />);
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      const root = tree!.root;

      // Tap 1930 button
      const call1930Btn = root.findByProps({ accessibilityLabel: '🚨 Call 1930 Helpline' });
      act(() => {
        call1930Btn.props.onPress();
      });

      // Dialog opens
      expect(
        root.findByProps({ children: 'Call National Cyber Helpline (1930)?' })
      ).toBeDefined();

      // Confirm dial action
      const confirmBtn = root.findByProps({ accessibilityLabel: 'Call 1930 Now' });
      act(() => {
        confirmBtn.props.onPress();
      });

      expect(Linking.openURL).toHaveBeenCalledWith('tel:1930');
    });

    it('confirms and opens official cybercrime portal link', async () => {
      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<EmergencyScreen onBack={jest.fn()} />);
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      const root = tree!.root;

      const portalBtn = root.findByProps({ accessibilityLabel: '🌐 Open cybercrime.gov.in' });
      act(() => {
        portalBtn.props.onPress();
      });

      // Dialog opens
      expect(root.findByProps({ children: 'Open Cybercrime Portal?' })).toBeDefined();

      // Confirm open portal
      const confirmBtn = root.findByProps({ accessibilityLabel: 'Open Portal' });
      act(() => {
        confirmBtn.props.onPress();
      });

      expect(Linking.openURL).toHaveBeenCalledWith('https://cybercrime.gov.in');
    });

    it('renders verified Indian bank fraud helpline directory and confirms calling bank', async () => {
      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<EmergencyScreen onBack={jest.fn()} />);
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      const root = tree!.root;

      // Verifies SBI and HDFC are in directory
      expect(root.findByProps({ children: 'State Bank of India (SBI)' })).toBeDefined();
      expect(root.findByProps({ children: '📞 1800 11 1109' })).toBeDefined();
      expect(root.findByProps({ children: 'HDFC Bank' })).toBeDefined();

      // Tap call on SBI
      const callSbiBtn = root.findByProps({
        accessibilityLabel: 'Call State Bank of India (SBI) helpline 1800 11 1109',
      });
      act(() => {
        callSbiBtn.props.onPress();
      });

      // Dialog confirms calling SBI
      expect(
        root.findByProps({ children: 'Call State Bank of India (SBI) Fraud Helpline?' })
      ).toBeDefined();

      const confirmCallBankBtn = root.findByProps({ accessibilityLabel: 'Call Bank Now' });
      act(() => {
        confirmCallBankBtn.props.onPress();
      });

      expect(Linking.openURL).toHaveBeenCalledWith('tel:1800111109');
    });

    it('generates standardized bank freeze notice and copies it with zero silent SMS guarantee', async () => {
      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<EmergencyScreen onBack={jest.fn()} />);
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      const root = tree!.root;

      // Check guarantee note
      expect(
        root.findByProps({
          children:
            '🛡️ GUARANTEE: ScamShield never sends silent SMS or interacts with your bank. You review and send the notice yourself.',
        })
      ).toBeDefined();

      // Validation test: trigger without filling bank name
      const generateBtn = root.findByProps({
        accessibilityLabel: '📝 Generate Bank Freeze Notice',
      });
      act(() => {
        generateBtn.props.onPress();
      });
      expect(
        root.findByProps({ children: '⚠️ Please enter or select your bank name.' })
      ).toBeDefined();

      // Quick chip select SBI
      const sbiChip = root.findByProps({ accessibilityLabel: 'State Bank of India (SBI)' });
      act(() => {
        sbiChip.props.onPress();
      });

      // Enter last 4 digits
      const digitsInput = root.findByProps({
        placeholder: 'e.g., 4321',
      });
      act(() => {
        digitsInput.props.onChangeText('9876');
      });

      // Generate notice
      act(() => {
        generateBtn.props.onPress();
      });

      // Standardized Notice Header appears
      expect(root.findByProps({ children: 'Standardized Bank Freeze Notice' })).toBeDefined();

      // Copy notice
      const copyBtn = root.findByProps({
        accessibilityLabel: '📋 Copy Notice to Clipboard',
      });
      act(() => {
        copyBtn.props.onPress();
      });

      expect(Clipboard.setString).toHaveBeenCalled();
      const copiedText = (Clipboard.setString as jest.Mock).mock.calls[0][0];
      expect(copiedText).toContain('URGENT NOTICE TO STATE BANK OF INDIA (SBI) FRAUD MONITORING TEAM');
      expect(copiedText).toContain('ending in ****9876');
      expect(copiedText).toContain('1930 / cybercrime.gov.in');

      // Copied feedback banner displayed
      expect(
        root.findByProps({
          children:
            '✓ Notice copied to clipboard! Paste it into your email, SMS, or bank support ticket.',
        })
      ).toBeDefined();
    });
  });

  describe('FamilyCircleScreen', () => {
    it('renders initial NOT_PAIRED state and generates 6-digit consent code', async () => {
      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<FamilyCircleScreen onBack={jest.fn()} />);
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      const root = tree!.root;

      // Status badge
      expect(
        root.findByProps({ children: 'NOT CONNECTED TO A FAMILY MEMBER' })
      ).toBeDefined();

      // Generate code button
      const genBtn = root.findByProps({
        accessibilityLabel: '🔑 Generate 6-Digit Pairing Code',
      });
      await act(async () => {
        genBtn.props.onPress();
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });

      // Status updates to PENDING
      expect(
        root.findByProps({ children: 'PAIRING CODE ACTIVE (WAITING FOR CAREGIVER)' })
      ).toBeDefined();
      expect(
        root.findByProps({
          children: 'Valid for 15 minutes. Share this code with your trusted caregiver.',
        })
      ).toBeDefined();

      // 6-digit code exists and can be copied
      const copyCodeBtn = root.findByProps({ accessibilityLabel: 'Copy pairing code' });
      act(() => {
        copyCodeBtn.props.onPress();
      });
      expect(Clipboard.setString).toHaveBeenCalled();
      const code = (Clipboard.setString as jest.Mock).mock.calls[0][0];
      expect(code).toMatch(/^[0-9]{6}$/);
    });

    it('simulates caregiver pairing and allows explicit revocation with confirmation', async () => {
      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<FamilyCircleScreen onBack={jest.fn()} />);
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      const root = tree!.root;

      // Generate code to get into PENDING
      const genBtn = root.findByProps({
        accessibilityLabel: '🔑 Generate 6-Digit Pairing Code',
      });
      await act(async () => {
        genBtn.props.onPress();
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });

      // Simulate pairing
      const simBtn = root.findByProps({
        accessibilityLabel: 'Simulate Caregiver Connection (Demo)',
      });
      await act(async () => {
        simBtn.props.onPress();
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });

      // State is ACTIVE
      expect(
        root.findByProps({ children: 'CONNECTED & GUARDED BY CAREGIVER' })
      ).toBeDefined();
      expect(root.findByProps({ children: 'Rohit Sharma (Son)' })).toBeDefined();

      // Tap revoke
      const revokeBtn = root.findByProps({
        accessibilityLabel: '✕ Revoke Caregiver Access',
      });
      act(() => {
        revokeBtn.props.onPress();
      });

      // Revoke dialog opens
      expect(root.findByProps({ children: 'Revoke Caregiver Access?' })).toBeDefined();

      // Confirm revoke
      const confirmRevokeBtn = root.findByProps({
        accessibilityLabel: 'Disconnect Caregiver',
      });
      await act(async () => {
        confirmRevokeBtn.props.onPress();
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });

      // Restored to NOT_PAIRED
      expect(
        root.findByProps({ children: 'NOT CONNECTED TO A FAMILY MEMBER' })
      ).toBeDefined();
    });

    it('displays comprehensive senior privacy guarantees (what caregiver can vs cannot see)', async () => {
      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<FamilyCircleScreen onBack={jest.fn()} />);
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      const root = tree!.root;

      expect(
        root.findByProps({ children: '🛡️ Strict Senior Privacy Guarantee' })
      ).toBeDefined();
      expect(
        root.findByProps({
          children: '• Never sees your private SMS, WhatsApp messages, or conversations.',
        })
      ).toBeDefined();
      expect(
        root.findByProps({
          children: '• Never sees your OTPs, PINs, passwords, or bank balances.',
        })
      ).toBeDefined();
      expect(
        root.findByProps({
          children: '• Never tracks your location or private telephone calls.',
        })
      ).toBeDefined();
    });
  });

  describe('ScamSimulatorScreen', () => {
    it('renders electricity cutoff scenario and gives immediate senior-friendly feedback on dangerous choice', async () => {
      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<ScamSimulatorScreen onBack={jest.fn()} />);
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      const root = tree!.root;

      // Scenario 1: Electricity
      expect(root.findByProps({ children: 'Electricity Disconnection Threat' })).toBeDefined();
      expect(
        root.findByProps({ children: `SCENARIO 1 OF ${SIMULATOR_SCENARIOS.length}` })
      ).toBeDefined();

      // Select Dangerous Choice
      const dangerChoiceBtn = root.findByProps({
        accessibilityLabel:
          'Immediately call 9876543210 and install the bill update app they send to stop the disconnection.',
      });
      await act(async () => {
        dangerChoiceBtn.props.onPress();
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });

      // Immediate danger feedback shown
      expect(
        root.findByProps({ children: '⚠️ Danger! Scam Trap' })
      ).toBeDefined();

      // Explanation shown
      expect(
        root.findByProps({
          children:
            'Government and state electricity boards (like MSEDCL, BSES, BESCOM, UPPCL) never send personal mobile numbers for bill payments and never disconnect electricity without formal written statutory notice. Scammers use fear and urgency to make seniors install malicious screen-sharing APK apps.',
        })
      ).toBeDefined();

      // Rule lesson
      expect(
        root.findByProps({
          children:
            '🛡️ Rule: Never pay utility bills using phone numbers received in sudden urgent SMS warnings.',
        })
      ).toBeDefined();
    });

    it('advances to next scenario and gives immediate safe feedback on safe choice', async () => {
      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<ScamSimulatorScreen onBack={jest.fn()} />);
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      const root = tree!.root;

      // Pick choice on scenario 1
      const choice1 = root.findByProps({
        accessibilityLabel:
          'Ignore the number in SMS. Check your official electricity bill receipt or call the official discom customer care number.',
      });
      await act(async () => {
        choice1.props.onPress();
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });

      // Next scenario
      const nextBtn = root.findByProps({ accessibilityLabel: 'Next scenario' });
      act(() => {
        nextBtn.props.onPress();
      });

      // Scenario 2: Digital Arrest & CBI
      expect(root.findByProps({ children: 'Digital Arrest & CBI Extortion' })).toBeDefined();
      expect(
        root.findByProps({ children: `SCENARIO 2 OF ${SIMULATOR_SCENARIOS.length}` })
      ).toBeDefined();

      // Select Safe Choice
      const safeChoiceBtn = root.findByProps({
        accessibilityLabel:
          'Hang up immediately! There is NO legal concept of "Digital Arrest" in Indian law. Call 1930 and inform family or your local police station.',
      });
      await act(async () => {
        safeChoiceBtn.props.onPress();
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });

      // Safe feedback shown
      expect(
        root.findByProps({ children: '✓ Safe Choice! Excellent Decision' })
      ).toBeDefined();
      expect(
        root.findByProps({
          children:
            '🛡️ Rule: No police or court will ever arrest you on video call or demand bank transfers to clear your name.',
        })
      ).toBeDefined();
    });

    it('resets simulator practice back to scenario 1', async () => {
      // Mark all scenarios as completed in storage
      for (const scenario of SIMULATOR_SCENARIOS) {
        await StorageService.recordSimulatorScenarioCompleted(scenario.id);
      }

      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<ScamSimulatorScreen onBack={jest.fn()} />);
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      const root = tree!.root;

      // Trophy banner shown
      expect(
        root.findByProps({ children: 'Congratulations! All Scenarios Completed' })
      ).toBeDefined();

      // Restart button
      const restartBtn = root.findByProps({
        accessibilityLabel: '🔄 Practice Again from Beginning',
      });
      await act(async () => {
        restartBtn.props.onPress();
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });

      // Returns to scenario 1
      expect(root.findByProps({ children: 'Electricity Disconnection Threat' })).toBeDefined();
      expect(
        root.findByProps({ children: `SCENARIO 1 OF ${SIMULATOR_SCENARIOS.length}` })
      ).toBeDefined();
    });
  });

  describe('Multilingual Stage 3.6 Rendering (Hindi & Marathi)', () => {
    it('renders EmergencyScreen in Hindi and Marathi with Devanagari labels', async () => {
      await act(async () => {
        await i18n.changeLanguage('hi');
      });

      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<EmergencyScreen onBack={jest.fn()} />);
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      let root = tree!.root;

      expect(root.findByProps({ children: 'राष्ट्रीय साइबर अपराध हेल्पलाइन (1930)' })).toBeDefined();
      expect(root.findByProps({ children: 'बैंकों के आधिकारिक आपातकालीन नंबर' })).toBeDefined();

      // Marathi
      await act(async () => {
        await i18n.changeLanguage('mr');
      });
      await act(async () => {
        tree = renderer.create(<EmergencyScreen onBack={jest.fn()} />);
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      root = tree!.root;

      expect(root.findByProps({ children: 'राष्ट्रीय सायबर गुन्हे हेल्पलाइन (१९३०)' })).toBeDefined();
      expect(root.findByProps({ children: 'बँकांचे अधिकृत आपत्कालीन हेल्पलाइन नंबर' })).toBeDefined();
    });

    it('renders FamilyCircleScreen and ScamSimulatorScreen in Hindi with Devanagari', async () => {
      await act(async () => {
        await i18n.changeLanguage('hi');
      });

      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<FamilyCircleScreen onBack={jest.fn()} />);
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      let root = tree!.root;

      expect(root.findByProps({ children: 'सहमति-प्रथम परिजन सुरक्षा' })).toBeDefined();

      await act(async () => {
        tree = renderer.create(<ScamSimulatorScreen onBack={jest.fn()} />);
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      root = tree!.root;

      expect(root.findByProps({ children: 'बिजली कनेक्शन काटने की धमकी' })).toBeDefined();
    });
  });

  describe('App Navigation Integration', () => {
    it('navigates from HomeScreen to EmergencyScreen, FamilyCircleScreen and ScamSimulatorScreen', async () => {
      await StorageService.setLanguage('en');
      await StorageService.setOnboardingCompleted(true);
      await StorageService.setSecureCredential(SecureKeys.AUTH_SESSION_TOKEN, 'demo_session');

      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<App />);
      });

      // Advance splash timer
      await act(async () => {
        for (let i = 0; i < 10; i++) await Promise.resolve();
        jest.advanceTimersByTime(1000);
        for (let i = 0; i < 10; i++) await Promise.resolve();
      });

      // App is on LoginScreen. Log in to reach HomeScreen:
      const phoneInput = tree!.root.findByProps({ placeholder: 'Enter 10-digit mobile number' });
      act(() => {
        phoneInput.props.onChangeText('9876543210');
      });
      const continueBtn = tree!.root.findByProps({ accessibilityLabel: 'Continue' });
      await act(async () => {
        continueBtn.props.onPress();
      });
      await act(async () => {
        jest.advanceTimersByTime(600);
        for (let i = 0; i < 10; i++) await Promise.resolve();
      });

      // Now on HomeScreen!
      // Test Navigation to Emergency:
      const emergencyBtn = tree!.root.findByProps({
        accessibilityLabel: 'Navigate to Bank Freeze and Helpline Directory',
      });
      await act(async () => {
        emergencyBtn.props.onPress();
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      expect(tree!.root.findByProps({ children: 'National Cyber Crime Helpline (1930)' })).toBeDefined();

      // Go back to Home
      const backFromEmergency = tree!.root.findByProps({ accessibilityLabel: 'Go back' });
      await act(async () => {
        backFromEmergency.props.onPress();
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });

      // Test Navigation to Family Circle:
      const familyCircleCard = tree!.root.findByProps({ accessibilityLabel: 'Family Safety Circle' });
      await act(async () => {
        familyCircleCard.props.onPress();
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      expect(tree!.root.findByProps({ children: 'Consent-First Family Protection' })).toBeDefined();

      // Go back to Home
      const backFromFamily = tree!.root.findByProps({ accessibilityLabel: 'Go back' });
      await act(async () => {
        backFromFamily.props.onPress();
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });

      // Test Navigation to Scam Simulator:
      const scamSimCard = tree!.root.findByProps({ accessibilityLabel: 'Scam Simulator' });
      await act(async () => {
        scamSimCard.props.onPress();
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      expect(tree!.root.findByProps({ children: 'Electricity Disconnection Threat' })).toBeDefined();
    });
  });
});
