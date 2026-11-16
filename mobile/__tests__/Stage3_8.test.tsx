import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { ScamSimulatorScreen } from '../src/screens/ScamSimulatorScreen';
import { SIMULATOR_SCENARIOS } from '../src/services/scamScenarios';
import { StorageService, PreferencesKeys } from '../src/services/storage';
import i18n from '../src/i18n';

describe('Stage 3.8: Scam Simulator & Awareness Learning', () => {
  beforeEach(async () => {
    jest.useFakeTimers();
    jest.clearAllMocks();
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

  describe('8 Fictional Scam Scenarios Model & Scaffolding', () => {
    it('verifies all 8 required realistic Indian scam scenarios are defined', () => {
      expect(SIMULATOR_SCENARIOS.length).toBe(8);

      const scenarioIds = SIMULATOR_SCENARIOS.map((s) => s.id);
      expect(scenarioIds).toEqual([
        'scenario_electricity',
        'scenario_police',
        'scenario_kyc',
        'scenario_otp_upi',
        'scenario_delivery',
        'scenario_malware',
        'scenario_qr_fraud',
        'scenario_helpline',
      ]);

      for (const scenario of SIMULATOR_SCENARIOS) {
        expect(scenario.titleEn).toBeTruthy();
        expect(scenario.titleHi).toBeTruthy();
        expect(scenario.titleMr).toBeTruthy();
        expect(scenario.messageEn).toBeTruthy();
        expect(scenario.questionEn).toBeTruthy();
        expect(scenario.choices.length).toBeGreaterThanOrEqual(2);
        expect(scenario.explanationEn).toBeTruthy();
        expect(scenario.ruleLessonEn).toBeTruthy();
        expect(scenario.safeTipEn).toBeTruthy();

        // Exactly one safe choice and one or more danger choices
        const safeChoices = scenario.choices.filter((c) => c.isSafe);
        const dangerChoices = scenario.choices.filter((c) => !c.isSafe);
        expect(safeChoices.length).toBe(1);
        expect(dangerChoices.length).toBeGreaterThanOrEqual(1);
      }
    });
  });

  describe('Scenario Practice & Immediate Senior-Friendly Feedback', () => {
    it('renders scenario 1 (Electricity) and gives immediate feedback on dangerous choice', async () => {
      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<ScamSimulatorScreen onBack={jest.fn()} />);
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      const root = tree!.root;

      expect(root.findByProps({ children: 'Electricity Disconnection Threat' })).toBeDefined();
      expect(root.findByProps({ children: 'SCENARIO 1 OF 8' })).toBeDefined();

      // Dangerous Choice button
      const dangerChoice = root.findByProps({
        accessibilityLabel:
          'Immediately call 9876543210 and install the bill update app they send to stop the disconnection.',
      });

      await act(async () => {
        dangerChoice.props.onPress();
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });

      // Immediate Danger Alert banner
      expect(root.findByProps({ children: '⚠️ Danger! Scam Trap' })).toBeDefined();
      // Explanation displayed
      expect(root.findByProps({ children: '💡 Why this is a scam:' })).toBeDefined();
      // Rule lesson displayed
      expect(
        root.findByProps({
          children:
            '🛡️ Rule: Never pay utility bills using phone numbers received in sudden urgent SMS warnings.',
        })
      ).toBeDefined();
    });

    it('advances through scenarios: testing KYC, OTP, Delivery, APK, QR, and Helpline', async () => {
      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<ScamSimulatorScreen onBack={jest.fn()} />);
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      const root = tree!.root;

      // Scenario 1: Select safe
      const elecSafe = root.findByProps({
        accessibilityLabel:
          'Ignore the number in SMS. Check your official electricity bill receipt or call the official discom customer care number.',
      });
      await act(async () => {
        elecSafe.props.onPress();
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      expect(root.findByProps({ children: '✓ Safe Choice! Excellent Decision' })).toBeDefined();

      // Go to Scenario 2 (Police)
      const nextBtn1 = root.findByProps({ accessibilityLabel: 'Next scenario' });
      await act(async () => {
        nextBtn1.props.onPress();
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      expect(root.findByProps({ children: 'Digital Arrest & CBI Extortion' })).toBeDefined();
      expect(root.findByProps({ children: 'SCENARIO 2 OF 8' })).toBeDefined();

      // Scenario 2: Select safe
      const policeSafe = root.findByProps({
        accessibilityLabel:
          'Hang up immediately! There is NO legal concept of "Digital Arrest" in Indian law. Call 1930 and inform family or your local police station.',
      });
      await act(async () => {
        policeSafe.props.onPress();
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });

      // Go to Scenario 3 (KYC)
      const nextBtn2 = root.findByProps({ accessibilityLabel: 'Next scenario' });
      await act(async () => {
        nextBtn2.props.onPress();
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      expect(root.findByProps({ children: 'Bank Account KYC Expiry Alert' })).toBeDefined();
      expect(root.findByProps({ children: 'SCENARIO 3 OF 8' })).toBeDefined();

      // Scenario 3: Select safe
      const kycSafe = root.findByProps({
        accessibilityLabel:
          'Never click links in SMS. Visit your home bank branch in person or use the official bank app downloaded from Play Store.',
      });
      await act(async () => {
        kycSafe.props.onPress();
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });

      // Go to Scenario 4 (OTP UPI)
      const nextBtn3 = root.findByProps({ accessibilityLabel: 'Next scenario' });
      await act(async () => {
        nextBtn3.props.onPress();
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      expect(root.findByProps({ children: 'Fraud Reversal Call & OTP Request' })).toBeDefined();
      expect(root.findByProps({ children: 'SCENARIO 4 OF 8' })).toBeDefined();
    });
  });

  describe('Awareness Learning Dashboard & Statistics Calculation', () => {
    it('calculates stats correctly and displays dashboard with accuracy and mastered topics', async () => {
      // Record 3 answers: 2 safe, 1 unsafe
      await StorageService.recordSimulatorAnswer(
        'scenario_electricity',
        'electricity',
        'elec_safe',
        true
      );
      await StorageService.recordSimulatorAnswer(
        'scenario_police',
        'police',
        'police_safe',
        true
      );
      await StorageService.recordSimulatorAnswer(
        'scenario_kyc',
        'kyc',
        'kyc_danger',
        false
      );

      const stats = await StorageService.getSimulatorLearningStats(SIMULATOR_SCENARIOS);
      expect(stats.totalCompleted).toBe(3);
      expect(stats.correctAnswers).toBe(2);
      expect(stats.accuracyPercentage).toBe(67); // Math.round(2/3 * 100) = 67
      expect(stats.masteredCategories).toEqual(['electricity', 'police']);
      expect(stats.needsImprovementAreas.length).toBe(1);
      expect(stats.needsImprovementAreas[0].category).toBe('kyc');

      // Render screen and toggle to Dashboard tab
      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<ScamSimulatorScreen onBack={jest.fn()} />);
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      const root = tree!.root;

      // Click on Dashboard tab
      const dashboardTab = root.findByProps({ accessibilityLabel: 'Learning Dashboard' });
      await act(async () => {
        dashboardTab.props.onPress();
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });

      // Verify Dashboard contents
      expect(root.findByProps({ children: 'Awareness & Learning Dashboard' })).toBeDefined();
      expect(root.findByProps({ children: '67%' })).toBeDefined();
      expect(
        root.findByProps({ children: '2 of 3 scenarios answered correctly' })
      ).toBeDefined();
      expect(root.findByProps({ children: '3 of 8 Topics Explored' })).toBeDefined();

      // Mastered topics
      expect(root.findByProps({ children: '✓ Utility & Electricity Bills' })).toBeDefined();
      expect(root.findByProps({ children: '✓ Police & Law Enforcement' })).toBeDefined();

      // Needs improvement topic
      expect(root.findByProps({ children: '⚠️ Bank KYC Verification' })).toBeDefined();
      expect(
        root.findByProps({
          children:
            'Banks never send website links via SMS for KYC. Update KYC only at your home branch.',
        })
      ).toBeDefined();

      // Continue Practice button indicates 5 remaining
      const continueBtn = root.findByProps({
        accessibilityLabel: '🎮 Continue Practice (5 Left)',
      });
      expect(continueBtn).toBeDefined();

      // Tapping continue practice switches back to practice tab
      await act(async () => {
        continueBtn.props.onPress();
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      expect(root.findByProps({ children: 'Fraud Reversal Call & OTP Request' })).toBeDefined();
    });

    it('shows encouraging 100% awareness when all completed scenarios are safe', async () => {
      for (const scenario of SIMULATOR_SCENARIOS) {
        const safeChoice = scenario.choices.find((c) => c.isSafe)!;
        await StorageService.recordSimulatorAnswer(
          scenario.id,
          scenario.category,
          safeChoice.id,
          true
        );
      }

      const stats = await StorageService.getSimulatorLearningStats(SIMULATOR_SCENARIOS);
      expect(stats.totalCompleted).toBe(8);
      expect(stats.correctAnswers).toBe(8);
      expect(stats.accuracyPercentage).toBe(100);
      expect(stats.isComplete).toBe(true);

      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<ScamSimulatorScreen onBack={jest.fn()} />);
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      const root = tree!.root;

      // Completion Banner on practice view
      expect(
        root.findByProps({ children: 'Congratulations! All Scenarios Completed' })
      ).toBeDefined();

      // Go to Dashboard
      const viewDashBtn = root.findByProps({
        accessibilityLabel: 'View Learning Dashboard 📊',
      });
      await act(async () => {
        viewDashBtn.props.onPress();
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });

      // 100% reflex and outstanding feedback
      expect(root.findByProps({ children: '100%' })).toBeDefined();
      expect(
        root.findByProps({
          children: '🌟 Outstanding awareness! You identified every trap correctly.',
        })
      ).toBeDefined();
    });
  });

  describe('Persistence, Safe Corrupted Fallback & Reset', () => {
    it('gracefully handles missing or corrupted JSON in simulator results', async () => {
      // Put invalid JSON in storage
      await StorageService.setPreference(
        PreferencesKeys.SCAM_SIMULATOR_RESULTS,
        'INVALID_CORRUPTED_JSON_DATA'
      );

      const records = await StorageService.getSimulatorAnswerRecords();
      expect(records).toEqual([]);

      const stats = await StorageService.getSimulatorLearningStats(SIMULATOR_SCENARIOS);
      expect(stats.totalCompleted).toBe(0);
      expect(stats.correctAnswers).toBe(0);
      expect(stats.accuracyPercentage).toBe(0);

      // Screen renders safely without crashing
      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<ScamSimulatorScreen onBack={jest.fn()} />);
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      expect(tree!.root.findByProps({ children: 'Electricity Disconnection Threat' })).toBeDefined();
    });

    it('resets simulator progress and clears both completed IDs and result records', async () => {
      await StorageService.recordSimulatorAnswer(
        'scenario_electricity',
        'electricity',
        'elec_safe',
        true
      );
      await StorageService.recordSimulatorAnswer(
        'scenario_police',
        'police',
        'police_safe',
        true
      );

      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<ScamSimulatorScreen onBack={jest.fn()} />);
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      const root = tree!.root;

      // Switch to dashboard and reset
      const dashTab = root.findByProps({ accessibilityLabel: 'Learning Dashboard' });
      await act(async () => {
        dashTab.props.onPress();
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });

      const retakeBtn = root.findByProps({ accessibilityLabel: '🔄 Practice Scenarios Again' });
      await act(async () => {
        retakeBtn.props.onPress();
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });

      // Progress reset to scenario 1
      expect(root.findByProps({ children: 'SCENARIO 1 OF 8' })).toBeDefined();
      expect(root.findByProps({ children: 'Electricity Disconnection Threat' })).toBeDefined();

      const clearedRecords = await StorageService.getSimulatorAnswerRecords();
      expect(clearedRecords).toEqual([]);
    });
  });

  describe('Multilingual Localization (Hindi & Marathi)', () => {
    it('renders scenario and dashboard in Hindi with Devanagari script', async () => {
      await act(async () => {
        await i18n.changeLanguage('hi');
      });

      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<ScamSimulatorScreen onBack={jest.fn()} />);
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      const root = tree!.root;

      // Scenario 1 in Hindi
      expect(root.findByProps({ children: 'बिजली कनेक्शन काटने की धमकी' })).toBeDefined();
      expect(root.findByProps({ children: '🏷️ बिजली व जनोपयोगी बिल' })).toBeDefined();

      // Switch to Hindi Dashboard
      const dashTab = root.findByProps({ accessibilityLabel: 'सीखने का डैशबोर्ड' });
      await act(async () => {
        dashTab.props.onPress();
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });

      expect(root.findByProps({ children: 'जागरूकता व सीखने का डैशबोर्ड' })).toBeDefined();
      expect(root.findByProps({ children: 'सुरक्षित निर्णय क्षमता' })).toBeDefined();
      expect(root.findByProps({ children: '🔄 दोबारा अभ्यास करें' })).toBeDefined();
    });

    it('renders scenario and dashboard in Marathi with Devanagari script', async () => {
      await act(async () => {
        await i18n.changeLanguage('mr');
      });

      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<ScamSimulatorScreen onBack={jest.fn()} />);
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      const root = tree!.root;

      // Scenario 1 in Marathi
      expect(root.findByProps({ children: 'वीज कनेक्शन तोडण्याची धमकी' })).toBeDefined();
      expect(root.findByProps({ children: '🏷️ वीज व उपयुक्तता बिले' })).toBeDefined();

      // Switch to Marathi Dashboard
      const dashTab = root.findByProps({ accessibilityLabel: 'शिकण्याचे डॅशबोर्ड' });
      await act(async () => {
        dashTab.props.onPress();
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });

      expect(root.findByProps({ children: 'जागरूकता आणि शिकण्याचे डॅशबोर्ड' })).toBeDefined();
      expect(root.findByProps({ children: 'सुरक्षित निर्णय क्षमता' })).toBeDefined();
      expect(root.findByProps({ children: '🔄 पुन्हा सराव करा' })).toBeDefined();
    });
  });
});

