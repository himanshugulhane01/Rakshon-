import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { UnifiedSafeCheckerScreen } from '../src/screens/UnifiedSafeCheckerScreen';
import { UnifiedCheckerService } from '../src/services/unifiedCheckerService';
import { StorageService } from '../src/services/storage';
import i18n from '../src/i18n';

describe('Feature 5: Unified "Is This Safe?" Checker', () => {
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

  it('1. Analyzes suspicious message and detects high-risk patterns', async () => {
    const result = await UnifiedCheckerService.checkMessage(
      'Urgent Notice: Electricity bill unpaid. Power disconnected tonight. Call 9876543210.'
    );
    expect(result.inputType).toBe('message');
    expect(result.riskLevel).toBe('DANGER');
    expect(result.riskScore).toBeGreaterThanOrEqual(80);
    expect(result.warningSigns.en.length).toBeGreaterThan(0);
    expect(result.recommendedActions.en.length).toBeGreaterThan(0);
  });

  it('2. Analyzes phishing URL and identifies lookalike domain', () => {
    const phishingResult = UnifiedCheckerService.checkWebsiteUrl(
      'http://onlinesbi.login-portal.xyz/netbanking'
    );
    expect(phishingResult.inputType).toBe('url');
    expect(phishingResult.riskLevel).toBe('DANGER');
    expect(phishingResult.warningSigns.en.some((w) => w.includes('.xyz') || w.includes('impersonation'))).toBe(true);

    const govResult = UnifiedCheckerService.checkWebsiteUrl(
      'https://eportal.incometax.gov.in/'
    );
    expect(govResult.riskLevel).toBe('SAFE');
  });

  it('3. Analyzes phone number and detects international scam caller prefix', () => {
    const foreignScam = UnifiedCheckerService.checkPhoneNumber('+923001234567');
    expect(foreignScam.inputType).toBe('phone');
    expect(foreignScam.riskLevel).toBe('DANGER');

    const telemarketer = UnifiedCheckerService.checkPhoneNumber('1409876543');
    expect(telemarketer.riskLevel).toBe('CAUTION');
  });

  it('4. Renders Unified Checker screen with all 4 input tabs', async () => {
    let tree: any;
    await act(async () => {
      tree = renderer.create(<UnifiedSafeCheckerScreen onBack={jest.fn()} />);
    });

    const str = JSON.stringify(tree.toJSON());
    expect(str).toContain('Is This Safe? Unified Checker');
    expect(str).toContain('Message');
    expect(str).toContain('Website');
    expect(str).toContain('Phone');
    expect(str).toContain('Screenshot');
    expect(str).toContain('Check If This Is Safe');
  });

  it('5. Supports English, Hindi, and Marathi translations', async () => {
    let tree: any;
    await act(async () => {
      await i18n.changeLanguage('hi');
      tree = renderer.create(<UnifiedSafeCheckerScreen onBack={jest.fn()} />);
    });
    expect(JSON.stringify(tree.toJSON())).toContain('क्या यह सुरक्षित है? यूनिफाइड चेकर');

    await act(async () => {
      await i18n.changeLanguage('mr');
      tree = renderer.create(<UnifiedSafeCheckerScreen onBack={jest.fn()} />);
    });
    expect(JSON.stringify(tree.toJSON())).toContain('हे सुरक्षित आहे का? युनिफाइड चेकर');
  });
});

