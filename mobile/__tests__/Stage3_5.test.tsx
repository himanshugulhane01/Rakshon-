import React from 'react';
import { Clipboard, Linking } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import '../src/i18n';
import i18n from '../src/i18n';
import { StorageService } from '../src/services/storage';
import { GuardianStatusService } from '../src/services/guardianStatus';
import { QrScannerService } from '../src/services/qrScannerService';
import { AnalysisApiService, MessageAnalysisResponse } from '../src/services/analysisApi';
import { CallGuardianScreen } from '../src/screens/CallGuardianScreen';
import { ScamLensScreen } from '../src/screens/ScamLensScreen';

const MOCK_ELECTRICITY_DOC_RESPONSE: MessageAnalysisResponse = {
  risk_level: 'HIGH_RISK',
  risk_score: 90,
  detected_indicators: [
    {
      category: 'ELECTRICITY_CUTOFF',
      indicator_name: 'electricity_disconnection_threat',
      severity: 'HIGH',
      description: 'Urgent threat of power disconnection for unpaid bills.',
      evidence: 'electricity power will be cut tonight at 9:30 PM',
    },
  ],
  explanation:
    'This letter threatens immediate power disconnection unless an unauthorized phone number is called.',
  recommended_actions: [
    'Do not call the phone number printed on this notice.',
    'Verify your power bill status on the official electricity board website.',
  ],
  language: 'en',
  disclaimer:
    'Notice: This score is an automated rule-based heuristic designed to assist your judgement.',
};

describe('Stage 3.5: Call Guardian UI & Scam Lens', () => {
  beforeEach(async () => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    StorageService._resetAllForTesting();
    await act(async () => {
      await i18n.changeLanguage('en');
    });
    jest.spyOn(Linking, 'openURL').mockResolvedValue(true as any);
    jest.spyOn(Clipboard, 'getString').mockResolvedValue('upi://pay?pa=test@bank&pn=TestPayee&am=50');
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });
    jest.restoreAllMocks();
  });

  describe('CallGuardianScreen', () => {
    it('renders initial threat database status (Not Yet Synchronized) and safe-by-default policy', async () => {
      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<CallGuardianScreen onBack={jest.fn()} />);
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      const root = tree!.root;

      // Status badge and zero count
      expect(root.findByProps({ children: 'NOT YET SYNCHRONIZED' })).toBeDefined();
      expect(root.findByProps({ children: '0 verified threat signatures stored' })).toBeDefined();
      expect(root.findByProps({ children: 'Never synchronized' })).toBeDefined();

      // Safe-by-default policy card
      expect(root.findByProps({ children: 'Safe-By-Default Caller Policy' })).toBeDefined();
      expect(root.findByProps({ children: 'Caller ID Spoofing Warning' })).toBeDefined();
      expect(root.findByProps({ children: 'Zero Audio Interception' })).toBeDefined();
      expect(root.findByProps({ children: 'Call History Privacy' })).toBeDefined();
    });

    it('triggers manual sync and displays success feedback when sync completes', async () => {
      jest
        .spyOn(GuardianStatusService, 'syncThreatDatabaseWithBackend')
        .mockResolvedValueOnce({
          status: 'synced',
          lastSync: new Date().toISOString(),
          version: 1,
          count: 150,
        });

      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<CallGuardianScreen onBack={jest.fn()} />);
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      const root = tree!.root;

      // Press sync button
      const syncBtn = root.findByProps({ accessibilityLabel: '🔄 Sync Threat Database' });
      await act(async () => {
        syncBtn.props.onPress();
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });

      // Feedback banner appears
      expect(root.findByProps({ children: 'DATABASE UP TO DATE' })).toBeDefined();
      expect(root.findByProps({ children: '150 verified scam numbers active' })).toBeDefined();
      expect(
        root.findByProps({ children: '✓ Threat database successfully synchronized!' })
      ).toBeDefined();
    });

    it('displays error feedback when manual sync fails', async () => {
      jest
        .spyOn(GuardianStatusService, 'syncThreatDatabaseWithBackend')
        .mockRejectedValueOnce(new Error('Connection timed out'));

      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<CallGuardianScreen onBack={jest.fn()} />);
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      const root = tree!.root;

      const syncBtn = root.findByProps({ accessibilityLabel: '🔄 Sync Threat Database' });
      await act(async () => {
        syncBtn.props.onPress();
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });

      expect(
        root.findByProps({
          children: '⚠️ Synchronization failed: Connection timed out',
        })
      ).toBeDefined();
    });
  });

  describe('QrScannerService', () => {
    it('detects deceptive UPI refund QR code with hidden payee and preset amount', () => {
      const result = QrScannerService.inspectQrPayload(
        'upi://pay?pa=fake_refund@bank&pn=&am=5000&tn=Lottery_Cashback_Refund'
      );

      expect(result.payloadType).toBe('UPI_PAYMENT');
      expect(result.isSuspicious).toBe(true);
      expect(result.riskSeverity).toBe('HIGH_RISK');
      expect(result.flaggedReasons).toEqual(
        expect.arrayContaining([
          expect.stringContaining('Payee name is missing'),
          expect.stringContaining('Deceptive note'),
        ])
      );
    });

    it('detects suspicious URL with IP address and APK download link', () => {
      const result = QrScannerService.inspectQrPayload(
        'http://45.33.32.156/sbi-kyc/update.apk'
      );

      expect(result.payloadType).toBe('WEB_URL');
      expect(result.isSuspicious).toBe(true);
      expect(result.riskSeverity).toBe('HIGH_RISK');
      expect(result.flaggedReasons).toEqual(
        expect.arrayContaining([
          expect.stringContaining('Direct IP address'),
          expect.stringContaining('Direct Android APK download'),
        ])
      );
    });

    it('classifies standard benign text without false positive', () => {
      const result = QrScannerService.inspectQrPayload('Wi-Fi Network Name: SeniorCare');
      expect(result.payloadType).toBe('PLAIN_TEXT');
      expect(result.isSuspicious).toBe(false);
      expect(result.riskSeverity).toBe('SAFE');
    });
  });

  describe('ScamLensScreen', () => {
    it('switches between QR Code tab and Paper Document tab', () => {
      let tree: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(<ScamLensScreen onBack={jest.fn()} />);
      });
      const root = tree!.root;

      // Initially in QR Code tab
      expect(root.findByProps({ accessibilityLabel: 'QR Code Inspector' })).toBeDefined();
      expect(root.findByProps({ accessibilityLabel: 'Paper Letter / Notice' })).toBeDefined();

      // Switch to Document tab
      const docTab = root.findByProps({ accessibilityLabel: 'Paper Letter / Notice' });
      act(() => {
        docTab.props.onPress();
      });

      // Document inspector elements appear
      expect(
        root.findByProps({
          placeholder:
            'Type or paste text from the physical letter, electricity notice, or court summon...',
        })
      ).toBeDefined();
    });

    it('inspects suspicious UPI QR and verifies NO URL opening or payment execution', async () => {
      let tree: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(<ScamLensScreen onBack={jest.fn()} />);
      });
      const root = tree!.root;

      // Populate input with suspicious UPI payload
      const input = root.findByProps({
        placeholder: 'Paste or enter decoded QR text (UPI link or website URL)...',
      });
      act(() => {
        input.props.onChangeText(
          'upi://pay?pa=refund9823@okhdfcbank&pn=&am=4999&tn=Lottery_Cashback_Refund'
        );
      });

      // Press inspect
      const inspectBtn = root.findByProps({ accessibilityLabel: '🔍 Inspect QR Safety' });
      act(() => {
        inspectBtn.props.onPress();
      });

      // Result displays without opening link or payment
      expect(root.findByProps({ children: 'Suspicious UPI Payment QR' })).toBeDefined();
      expect(root.findByProps({ children: '₹4999' })).toBeDefined();
      expect(Linking.openURL).not.toHaveBeenCalled();
    });

    it('inspects paper document notice and detects electricity cutoff threats', async () => {
      jest
        .spyOn(AnalysisApiService, 'analyzeMessage')
        .mockResolvedValueOnce(MOCK_ELECTRICITY_DOC_RESPONSE);

      let tree: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(
          <ScamLensScreen onBack={jest.fn()} onNavigateToEmergency={jest.fn()} />
        );
      });
      const root = tree!.root;

      // Switch to Document Tab
      const docTab = root.findByProps({ accessibilityLabel: 'Paper Letter / Notice' });
      act(() => {
        docTab.props.onPress();
      });

      // Enter electricity disconnection text
      const docInput = root.findByProps({
        placeholder:
          'Type or paste text from the physical letter, electricity notice, or court summon...',
      });
      act(() => {
        docInput.props.onChangeText('Dear consumer, your electricity power will be cut tonight at 9:30 PM');
      });

      // Press inspect
      const inspectDocBtn = root.findByProps({
        accessibilityLabel: '🔍 Inspect Document for Scam Patterns',
      });
      await act(async () => {
        inspectDocBtn.props.onPress();
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });

      expect(AnalysisApiService.analyzeMessage).toHaveBeenCalled();
      expect(root.findByProps({ children: 'Document Fraud Analysis' })).toBeDefined();
      expect(root.findByProps({ children: MOCK_ELECTRICITY_DOC_RESPONSE.explanation })).toBeDefined();
      expect(
        root.findByProps({ children: '• Urgent threat of power disconnection for unpaid bills.' })
      ).toBeDefined();
    });
  });

  describe('Multilingual Call Guardian & Scam Lens Rendering', () => {
    it('renders Call Guardian in Hindi and Marathi with Devanagari labels', async () => {
      await act(async () => {
        await i18n.changeLanguage('hi');
      });

      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<CallGuardianScreen onBack={jest.fn()} />);
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      let root = tree!.root;

      expect(root.findByProps({ children: 'अज्ञात कॉल स्वतः सुरक्षित नीति' })).toBeDefined();
      expect(root.findByProps({ children: 'कॉलर आईडी क्लोनिंग की चेतावनी' })).toBeDefined();

      // Marathi
      await act(async () => {
        await i18n.changeLanguage('mr');
      });

      await act(async () => {
        tree = renderer.create(<CallGuardianScreen onBack={jest.fn()} />);
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      root = tree!.root;

      expect(root.findByProps({ children: 'अनोळखी कॉल सुरक्षित धोरण' })).toBeDefined();
      expect(root.findByProps({ children: 'कॉलर आयडी क्लोनिंग चेतावणी' })).toBeDefined();
    });
  });
});
