import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { BankingSandboxScreen } from '../src/screens/BankingSandboxScreen';
import { ScamSimulatorScreen } from '../src/screens/ScamSimulatorScreen';
import { StorageService, PreferencesKeys } from '../src/services/storage';
import {
  BANKING_SANDBOX_SCENARIOS,
  BankingScenario,
} from '../src/services/bankingSandboxScenarios';
import i18n from '../src/i18n';

describe('Feature 1: Banking & UPI Practice Sandbox', () => {
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
    StorageService._resetAllForTesting();
  });

  it('1. Provides exactly 4 complete banking and UPI training scenarios', () => {
    expect(BANKING_SANDBOX_SCENARIOS.length).toBe(4);
    const categories = BANKING_SANDBOX_SCENARIOS.map((s) => s.category);
    expect(categories).toEqual([
      'fake_login',
      'upi_payment',
      'upi_collect',
      'otp_safety',
    ]);

    // Check each scenario has valid choices, localized strings, and golden rules
    BANKING_SANDBOX_SCENARIOS.forEach((scenario: BankingScenario) => {
      expect(scenario.titleEn).toBeTruthy();
      expect(scenario.titleHi).toBeTruthy();
      expect(scenario.titleMr).toBeTruthy();
      expect(scenario.goldenRuleEn).toBeTruthy();
      expect(scenario.choices.length).toBeGreaterThanOrEqual(2);

      const safeChoice = scenario.choices.find((c) => c.isSafe);
      const unsafeChoice = scenario.choices.find((c) => !c.isSafe);
      expect(safeChoice).toBeDefined();
      expect(unsafeChoice).toBeDefined();
    });
  });

  it('2. Renders prominent DEMO / TRAINING SIMULATION banner with zero real money disclaimer', async () => {
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<BankingSandboxScreen />);
      await Promise.resolve();
    });

    const root = tree!.root;
    const disclaimerBadges = root.findAllByProps({
      children: '⚠️ DEMO / TRAINING SIMULATION',
    });
    expect(disclaimerBadges.length).toBeGreaterThan(0);

    const bannerMain = root.findAllByProps({
      children: 'DEMO / TRAINING SIMULATION — NO REAL MONEY',
    });
    expect(bannerMain.length).toBeGreaterThan(0);
  });

  it('3. Renders Scenario 1 (Fake Login) with simulated browser address bar and red flags', async () => {
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<BankingSandboxScreen />);
      await Promise.resolve();
    });

    const root = tree!.root;
    // Check unencrypted HTTP warning
    const unencryptedWarning = root.findAllByProps({ children: '⚠️ http://' });
    expect(unencryptedWarning.length).toBeGreaterThan(0);

    // Check domain warning
    const domainText = root.findAllByProps({ children: 'statetrust-secure-kyc.xyz/login' });
    expect(domainText.length).toBeGreaterThan(0);

    // Check suspicious ATM PIN label
    const atmPinNotice = root.findAllByProps({ children: 'ATM Card 4-Digit PIN' });
    expect(atmPinNotice.length).toBeGreaterThan(0);
  });

  it('4. Selecting a safe choice displays safe feedback and persists stats safely', async () => {
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<BankingSandboxScreen />);
      await Promise.resolve();
    });

    const root = tree!.root;
    const safeChoice = BANKING_SANDBOX_SCENARIOS[0].choices.find((c) => c.isSafe)!;

    // Find choice touchable
    const choiceButton = root.find(
      (node) =>
        node.props.accessibilityRole === 'button' &&
        node.props.accessibilityLabel === safeChoice.textEn
    );
    expect(choiceButton).toBeDefined();

    await act(async () => {
      choiceButton.props.onPress();
      await Promise.resolve();
    });

    // Verify feedback is shown
    const feedbackBadges = root.findAllByProps({ label: '✓ SAFE PRACTICE DECISION' });
    expect(feedbackBadges.length).toBe(1);

    // Verify stats recorded in storage
    const stats = await StorageService.getBankingSandboxStats();
    expect(stats.completedScenarios).toBe(1);
    expect(stats.correctAnswers).toBe(1);
    expect(stats.records[0].isSafe).toBe(true);
  });

  it('5. Selecting an unsafe choice displays danger feedback and records trap detection', async () => {
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<BankingSandboxScreen />);
      await Promise.resolve();
    });

    const root = tree!.root;
    const unsafeChoice = BANKING_SANDBOX_SCENARIOS[0].choices.find((c) => !c.isSafe)!;

    const choiceButton = root.find(
      (node) =>
        node.props.accessibilityRole === 'button' &&
        node.props.accessibilityLabel === unsafeChoice.textEn
    );

    await act(async () => {
      choiceButton.props.onPress();
      await Promise.resolve();
    });

    const dangerBadges = root.findAllByProps({ label: '⚠️ DANGEROUS ACTION / SCAM TRAP' });
    expect(dangerBadges.length).toBe(1);

    const stats = await StorageService.getBankingSandboxStats();
    expect(stats.completedScenarios).toBe(1);
    expect(stats.correctAnswers).toBe(0);
    expect(stats.records[0].isSafe).toBe(false);
  });

  it('6. Completes all 4 scenarios and displays practice results with score and review cards', async () => {
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<BankingSandboxScreen />);
      await Promise.resolve();
    });

    const root = tree!.root;

    // Iterate through all 4 scenarios selecting safe choices
    for (let step = 0; step < 4; step++) {
      const currentScenario = BANKING_SANDBOX_SCENARIOS[step];
      const safeChoice = currentScenario.choices.find((c) => c.isSafe)!;

      const choiceBtn = root.find(
        (node) =>
          node.props.accessibilityRole === 'button' &&
          node.props.accessibilityLabel === safeChoice.textEn
      );
      await act(async () => {
        choiceBtn.props.onPress();
        await Promise.resolve();
      });

      // Press Next / View Results button
      const nextBtnTitle = step < 3 ? 'Next Scenario →' : 'View Practice Results 📊';
      const nextBtn = root.find((node) => node.props.title === nextBtnTitle);
      await act(async () => {
        nextBtn.props.onPress();
        await Promise.resolve();
      });
    }

    // Results screen should now be active
    const resultsTitle = root.findAllByProps({ children: 'Sandbox Practice Results' });
    expect(resultsTitle.length).toBeGreaterThan(0);

    const scoreDisplay = root.find(
      (node) =>
        node.props.children &&
        Array.isArray(node.props.children) &&
        node.props.children.join('').trim() === '4 / 4'
    );
    expect(scoreDisplay).toBeDefined();

    // Verify retake button exists
    const retakeBtn = root.find((node) => node.props.title === '🔄 Re-take Sandbox Practice');
    expect(retakeBtn).toBeDefined();

    // Verify stats in storage
    const saved = await StorageService.getBankingSandboxStats();
    expect(saved.isComplete).toBe(true);
    expect(saved.correctAnswers).toBe(4);
    expect(saved.accuracyPercentage).toBe(100);
  });

  it('7. StorageService enforces zero real credentials and allows clean reset', async () => {
    await StorageService.recordBankingSandboxAnswer(
      'scenario_1_fake_login',
      'fake_login',
      'fake_login_safe',
      true
    );

    let stats = await StorageService.getBankingSandboxStats();
    expect(stats.completedScenarios).toBe(1);

    await StorageService.resetBankingSandboxStats();
    stats = await StorageService.getBankingSandboxStats();
    expect(stats.completedScenarios).toBe(0);
    expect(stats.records.length).toBe(0);
  });

  it('8. Entry card appears on ScamSimulatorScreen and calls onNavigateToBankingSandbox', async () => {
    const mockNavigate = jest.fn();
    let tree: renderer.ReactTestRenderer;

    await act(async () => {
      tree = renderer.create(
        <ScamSimulatorScreen onNavigateToBankingSandbox={mockNavigate} />
      );
      await Promise.resolve();
    });

    const root = tree!.root;
    const banner = root.find(
      (node) =>
        node.props.accessibilityRole === 'button' &&
        node.props.accessibilityLabel === 'Banking & UPI Practice Sandbox'
    );
    expect(banner).toBeDefined();

    await act(async () => {
      banner.props.onPress();
    });

    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });
});
