import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { SafeBrowsingSimulatorScreen } from '../src/screens/SafeBrowsingSimulatorScreen';
import { SAFE_BROWSING_SCENARIOS, SafeBrowsingScenario } from '../src/services/safeBrowsingScenarios';
import { StorageService } from '../src/services/storage';
import i18n from '../src/i18n';

describe('Feature 3: Safe-Browsing Simulator', () => {
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

  it('1. Provides exactly 4 safe browsing scenarios with phishing and authentic examples', () => {
    expect(SAFE_BROWSING_SCENARIOS.length).toBe(4);
    const pageTypes = SAFE_BROWSING_SCENARIOS.map((s) => s.pageType);
    expect(pageTypes).toEqual([
      'bank_login',
      'government_portal',
      'prize_typo',
      'utility_bill',
    ]);

    SAFE_BROWSING_SCENARIOS.forEach((scenario: SafeBrowsingScenario) => {
      expect(scenario.displayedUrl).toBeTruthy();
      expect(scenario.domain).toBeTruthy();
      expect(scenario.title.en).toBeTruthy();
      expect(scenario.title.hi).toBeTruthy();
      expect(scenario.title.mr).toBeTruthy();
      expect(scenario.choices.length).toBeGreaterThanOrEqual(2);
      expect(scenario.choices.some((c) => c.isSafe)).toBe(true);
      expect(scenario.choices.some((c) => !c.isSafe)).toBe(true);
    });
  });

  it('2. Displays the permanent training disclaimer banner', async () => {
    let tree: any;
    await act(async () => {
      tree = renderer.create(<SafeBrowsingSimulatorScreen onBack={jest.fn()} />);
    });

    const str = JSON.stringify(tree.toJSON());
    expect(str).toContain('DEMO / TRAINING SIMULATION — NO REAL WEBSITES VISITED');
    expect(str).toContain('Safe Browser Sandbox — Practice Identifying Phishing Domains');
  });

  it('3. Renders address bar with protocol, padlock and domain', async () => {
    let tree: any;
    await act(async () => {
      tree = renderer.create(<SafeBrowsingSimulatorScreen onBack={jest.fn()} />);
    });

    const str = JSON.stringify(tree.toJSON());
    expect(str).toContain('login-portal.xyz');
    expect(str).toContain('INSECURE');
    expect(str).toContain('Would you trust and enter details on this website?');
  });

  it('4. Records answer safely in StorageService', async () => {
    const stats = await StorageService.recordSafeBrowsingAnswer(
      'sbi_phishing',
      'login-portal.xyz',
      'safe_reject',
      true
    );
    expect(stats.completedScenarios).toBe(1);
    expect(stats.correctAnswers).toBe(1);
    expect(stats.accuracyPercentage).toBe(100);
  });

  it('5. Supports English, Hindi, and Marathi translations', async () => {
    let tree: any;
    await act(async () => {
      await i18n.changeLanguage('hi');
      tree = renderer.create(<SafeBrowsingSimulatorScreen onBack={jest.fn()} />);
    });
    expect(JSON.stringify(tree.toJSON())).toContain('सुरक्षित ब्राउज़िंग सिम्युलेटर');

    await act(async () => {
      await i18n.changeLanguage('mr');
      tree = renderer.create(<SafeBrowsingSimulatorScreen onBack={jest.fn()} />);
    });
    expect(JSON.stringify(tree.toJSON())).toContain('सुरक्षित ब्राउझिंग सिम्युलेटर');
  });
});
