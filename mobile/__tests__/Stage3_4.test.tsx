import React from 'react';
import { Clipboard } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import '../src/i18n';
import i18n from '../src/i18n';
import {
  AnalysisApiService,
  AnalysisApiError,
  MessageAnalysisResponse,
} from '../src/services/analysisApi';
import { MessageGuardianScreen } from '../src/screens/MessageGuardianScreen';
import { AnalysisResultScreen } from '../src/screens/AnalysisResultScreen';

// High risk scam response fixture (Digital Arrest / Extortion)
const MOCK_HIGH_RISK_RESPONSE: MessageAnalysisResponse = {
  risk_level: 'HIGH_RISK',
  risk_score: 85,
  detected_indicators: [
    {
      category: 'DIGITAL_ARREST',
      indicator_name: 'cbi_digital_arrest',
      severity: 'HIGH',
      description: 'Impending digital arrest threat impersonating law enforcement.',
      evidence: 'CBI cyber police warrant issued against your Aadhaar',
    },
    {
      category: 'URGENT_PRESSURE',
      indicator_name: 'urgent_deadline',
      severity: 'HIGH',
      description: 'Demanding immediate video call compliance within 15 minutes.',
      evidence: 'Join video call in 15 minutes or face immediate arrest',
    },
  ],
  explanation:
    'This message falsely claims to be from law enforcement or police threatening "digital arrest". Official police and CBI officers never conduct arrests over Skype or WhatsApp video calls.',
  recommended_actions: [
    'Do not join any video call or Skype call.',
    'Do not transfer money or share banking details.',
    'Immediately report this extortion attempt to the Cyber Helpline 1930.',
  ],
  language: 'en',
  disclaimer:
    'Notice: This score is an automated rule-based heuristic designed to assist your judgement. It is not a statistical guarantee.',
};

// Safe legitimate bank OTP response fixture
const MOCK_SAFE_OTP_RESPONSE: MessageAnalysisResponse = {
  risk_level: 'SAFE',
  risk_score: 0,
  detected_indicators: [
    {
      category: 'BENIGN_TRANSACTION',
      indicator_name: 'bank_otp_advisory',
      severity: 'BENIGN',
      description: 'Legitimate transactional alert containing standard safety warning.',
      evidence: 'Never share OTP with anyone',
    },
  ],
  explanation:
    'This message appears to be a legitimate banking alert. It includes standard security warnings advising you never to share OTP codes.',
  recommended_actions: [
    'Verify that you initiated this transaction.',
    'Never share your OTP with anyone calling you, even if they claim to be a bank manager.',
  ],
  language: 'en',
  disclaimer:
    'Notice: This score is an automated rule-based heuristic designed to assist your judgement. It is not a statistical guarantee.',
};

describe('Stage 3.4: Message Guardian – User Interface & Backend Integration', () => {
  beforeEach(async () => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    await act(async () => {
      await i18n.changeLanguage('en');
    });
    jest.spyOn(Clipboard, 'getString').mockResolvedValue('Urgent: Your electricity will be disconnected tonight. Call 9876543210');
    jest.spyOn(Clipboard, 'setString').mockImplementation(() => {});
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });
    jest.restoreAllMocks();
  });

  describe('MessageGuardianScreen', () => {
    it('renders text input, paste button, privacy pill, and analyze button', () => {
      let tree: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(
          <MessageGuardianScreen
            onBack={jest.fn()}
            onAnalysisSuccess={jest.fn()}
          />
        );
      });
      const root = tree!.root;

      expect(root.findByProps({ children: 'Message Guardian' })).toBeDefined();
      expect(root.findByProps({ label: 'ZERO SMS PERMISSIONS' })).toBeDefined();
      expect(root.findByProps({ placeholder: 'Paste or type the suspicious message here...' })).toBeDefined();
      expect(root.findByProps({ accessibilityLabel: '📋 Paste Message' })).toBeDefined();
      expect(root.findByProps({ accessibilityLabel: '🔍 Analyze Message' })).toBeDefined();
    });

    it('populates message from clipboard when Paste Message is tapped', async () => {
      let tree: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(
          <MessageGuardianScreen
            onBack={jest.fn()}
            onAnalysisSuccess={jest.fn()}
          />
        );
      });
      const root = tree!.root;

      const pasteBtn = root.findByProps({ accessibilityLabel: '📋 Paste Message' });
      await act(async () => {
        pasteBtn.props.onPress();
        await Promise.resolve();
      });

      expect(Clipboard.getString).toHaveBeenCalled();
      const input = root.findByProps({ placeholder: 'Paste or type the suspicious message here...' });
      expect(input.props.value).toContain('electricity will be disconnected');
    });

    it('clears message when Clear Text is tapped', async () => {
      let tree: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(
          <MessageGuardianScreen
            onBack={jest.fn()}
            onAnalysisSuccess={jest.fn()}
          />
        );
      });
      const root = tree!.root;

      // Type some text
      const input = root.findByProps({ placeholder: 'Paste or type the suspicious message here...' });
      act(() => {
        input.props.onChangeText('Test message content');
      });

      // Clear button appears
      const clearBtn = root.findByProps({ accessibilityLabel: '✕ Clear Text' });
      act(() => {
        clearBtn.props.onPress();
      });

      expect(input.props.value).toBe('');
    });

    it('shows error banner when empty message is analyzed', async () => {
      let tree: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(
          <MessageGuardianScreen
            onBack={jest.fn()}
            onAnalysisSuccess={jest.fn()}
          />
        );
      });
      const root = tree!.root;

      // Analyze button is pressed with empty text
      const analyzeBtn = root.findByProps({ accessibilityLabel: '🔍 Analyze Message' });
      await act(async () => {
        analyzeBtn.props.onPress();
      });

      expect(root.findByProps({ children: '⚠️ Please enter or paste a message before analyzing.' })).toBeDefined();
    });

    it('successfully calls AnalysisApiService and invokes onAnalysisSuccess', async () => {
      const onAnalysisSuccessMock = jest.fn();
      jest
        .spyOn(AnalysisApiService, 'analyzeMessage')
        .mockResolvedValueOnce(MOCK_HIGH_RISK_RESPONSE);

      let tree: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(
          <MessageGuardianScreen
            onBack={jest.fn()}
            onAnalysisSuccess={onAnalysisSuccessMock}
          />
        );
      });
      const root = tree!.root;

      // Enter suspicious extortion text
      const input = root.findByProps({ placeholder: 'Paste or type the suspicious message here...' });
      act(() => {
        input.props.onChangeText('CBI cyber police warrant issued against your Aadhaar');
      });

      // Press analyze
      const analyzeBtn = root.findByProps({ accessibilityLabel: '🔍 Analyze Message' });
      await act(async () => {
        analyzeBtn.props.onPress();
        await Promise.resolve();
      });

      expect(AnalysisApiService.analyzeMessage).toHaveBeenCalledWith({
        text: 'CBI cyber police warrant issued against your Aadhaar',
        language: 'en',
      });
      expect(onAnalysisSuccessMock).toHaveBeenCalledWith(
        MOCK_HIGH_RISK_RESPONSE,
        'CBI cyber police warrant issued against your Aadhaar'
      );
    });

    it('handles network error gracefully and offers retry button', async () => {
      jest
        .spyOn(AnalysisApiService, 'analyzeMessage')
        .mockRejectedValueOnce(
          new AnalysisApiError('Unable to reach ScamShield server.', 'NETWORK_ERROR')
        );

      let tree: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(
          <MessageGuardianScreen
            onBack={jest.fn()}
            onAnalysisSuccess={jest.fn()}
          />
        );
      });
      const root = tree!.root;

      const input = root.findByProps({ placeholder: 'Paste or type the suspicious message here...' });
      act(() => {
        input.props.onChangeText('Test message');
      });

      const analyzeBtn = root.findByProps({ accessibilityLabel: '🔍 Analyze Message' });
      await act(async () => {
        analyzeBtn.props.onPress();
        for (let i = 0; i < 5; i++) {
          await Promise.resolve();
        }
      });

      expect(root.findByProps({ children: '⚠️ Unable to reach ScamShield server.' })).toBeDefined();
      expect(root.findByProps({ title: '🔄 Try Again' })).toBeDefined();
    });
  });

  describe('AnalysisResultScreen', () => {
    it('renders High Risk result with score, indicators, explanation, and helpline button', () => {
      const onHelplineMock = jest.fn();
      let tree: renderer.ReactTestRenderer;

      act(() => {
        tree = renderer.create(
          <AnalysisResultScreen
            result={MOCK_HIGH_RISK_RESPONSE}
            originalMessage="Warrant issued"
            onAnalyzeAnother={jest.fn()}
            onReturnHome={jest.fn()}
            onCallHelpline={onHelplineMock}
          />
        );
      });
      const root = tree!.root;

      // Risk level and score
      expect(root.findByProps({ children: '85 / 100' })).toBeDefined();
      expect(root.findByProps({ children: 'Notice: This score is an automated rule-based heuristic designed to assist your judgement. It is not a statistical guarantee.' })).toBeDefined();

      // Explanation
      expect(root.findByProps({ children: MOCK_HIGH_RISK_RESPONSE.explanation })).toBeDefined();

      // Detected indicators
      expect(root.findByProps({ children: 'cbi digital arrest' })).toBeDefined();

      // Recommended actions
      expect(root.findByProps({ children: 'Do not join any video call or Skype call.' })).toBeDefined();

      // Emergency Helpline 1930 button rendered for high risk
      expect(root.findByProps({ accessibilityLabel: '🚨 Call Cyber Helpline (1930)' })).toBeDefined();
    });

    it('renders Safe result for legitimate bank OTP without emergency button', () => {
      let tree: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(
          <AnalysisResultScreen
            result={MOCK_SAFE_OTP_RESPONSE}
            originalMessage="Your bank OTP is 492011"
            onAnalyzeAnother={jest.fn()}
            onReturnHome={jest.fn()}
          />
        );
      });
      const root = tree!.root;

      expect(root.findByProps({ children: '0 / 100' })).toBeDefined();
      expect(root.findByProps({ children: MOCK_SAFE_OTP_RESPONSE.explanation })).toBeDefined();

      // OTP safety disclaimer is present
      expect(
        root.findByProps({
          children:
            'Safety Note: An OTP was mentioned, but no malicious demand was found. Never share your OTP with anyone who calls or messages you.',
        })
      ).toBeDefined();

      // Emergency button should NOT be present for safe message
      expect(() =>
        root.findByProps({ accessibilityLabel: '🚨 Call Cyber Helpline (1930)' })
      ).toThrow();
    });

    it('copies safety advice to clipboard when Copy Safety Advice is pressed', async () => {
      let tree: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(
          <AnalysisResultScreen
            result={MOCK_HIGH_RISK_RESPONSE}
            originalMessage="Warrant issued"
            onAnalyzeAnother={jest.fn()}
            onReturnHome={jest.fn()}
          />
        );
      });
      const root = tree!.root;

      const copyBtn = root.findByProps({ accessibilityLabel: '📋 Copy Safety Advice' });
      act(() => {
        copyBtn.props.onPress();
      });

      expect(Clipboard.setString).toHaveBeenCalled();
      expect(root.findByProps({ children: 'Safety advice copied to clipboard!' })).toBeDefined();
    });
  });

  describe('AnalysisApiService Client Validation', () => {
    it('throws VALIDATION_ERROR without making network call if text is empty', async () => {
      await expect(AnalysisApiService.analyzeMessage({ text: '   ' })).rejects.toThrow(
        'Please enter or paste a message to analyze.'
      );
    });

    it('throws VALIDATION_ERROR if text exceeds 2000 characters', async () => {
      const longText = 'A'.repeat(2005);
      await expect(AnalysisApiService.analyzeMessage({ text: longText })).rejects.toThrow(
        'Message exceeds the maximum limit of 2,000 characters.'
      );
    });
  });

  describe('Multilingual Message Guardian Rendering', () => {
    it('renders Message Guardian in Hindi and Marathi properly', async () => {
      // Hindi
      await act(async () => {
        await i18n.changeLanguage('hi');
      });

      let tree: renderer.ReactTestRenderer;
      act(() => {
        tree = renderer.create(
          <MessageGuardianScreen
            onBack={jest.fn()}
            onAnalysisSuccess={jest.fn()}
          />
        );
      });
      let root = tree!.root;

      expect(root.findByProps({ children: 'मैसेज गार्डियन' })).toBeDefined();
      expect(root.findByProps({ label: 'शून्य एसएमएस अनुमति' })).toBeDefined();

      // Marathi
      await act(async () => {
        await i18n.changeLanguage('mr');
      });

      act(() => {
        tree = renderer.create(
          <MessageGuardianScreen
            onBack={jest.fn()}
            onAnalysisSuccess={jest.fn()}
          />
        );
      });
      root = tree!.root;

      expect(root.findByProps({ children: 'मेसेज गार्डियन' })).toBeDefined();
      expect(root.findByProps({ label: 'शून्य एसएमएस परवानगी' })).toBeDefined();
    });
  });
});
