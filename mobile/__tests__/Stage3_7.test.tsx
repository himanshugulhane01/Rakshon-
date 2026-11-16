import React from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import '../src/i18n';
import i18n from '../src/i18n';
import { StorageService, SecureKeys } from '../src/services/storage';
import { VoiceGuardianService } from '../src/services/voiceGuardianService';
import { AnalysisApiService, MessageAnalysisResponse } from '../src/services/analysisApi';
import { VoiceGuardianScreen } from '../src/screens/VoiceGuardianScreen';
import { App } from '../src/App';

const MOCK_HIGH_RISK_RESPONSE: MessageAnalysisResponse = {
  risk_level: 'HIGH_RISK',
  risk_score: 92,
  detected_indicators: [
    {
      category: 'ELECTRICITY_CUTOFF',
      indicator_name: 'electricity_disconnection_threat',
      severity: 'HIGH',
      description: 'Threat of power cut at night.',
      evidence: 'power will be cut tonight at 9:30 PM',
    },
  ],
  explanation: 'This message threatens electricity disconnection to coerce payment.',
  recommended_actions: ['Do not call the phone number.', 'Verify bill on the official discom app.'],
  language: 'en',
  disclaimer: 'Automated heuristic rule score.',
};

const MOCK_SAFE_RESPONSE: MessageAnalysisResponse = {
  risk_level: 'SAFE',
  risk_score: 10,
  detected_indicators: [],
  explanation: 'Ordinary conversational message with no fraud patterns.',
  recommended_actions: ['No action required.'],
  language: 'en',
  disclaimer: 'Automated heuristic rule score.',
};

describe('Stage 3.7: Voice Guardian – Multilingual Voice Assistance', () => {
  const originalPlatform = Platform.OS;

  beforeEach(async () => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    (Platform as any).OS = 'android';
    StorageService._resetAllForTesting();
    VoiceGuardianService._resetForTesting();
    await act(async () => {
      await i18n.changeLanguage('en');
    });
    // Mock Android Permissions
    jest.spyOn(PermissionsAndroid, 'check').mockResolvedValue(true);
    jest.spyOn(PermissionsAndroid, 'request').mockResolvedValue(PermissionsAndroid.RESULTS.GRANTED);
  });

  afterEach(() => {
    (Platform as any).OS = originalPlatform;
    act(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });
    jest.restoreAllMocks();
  });

  describe('VoiceGuardianScreen Core Features', () => {
    it('renders microphone button, status badge, and privacy guarantees', async () => {
      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<VoiceGuardianScreen onBack={jest.fn()} />);
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      const root = tree!.root;

      // Title & Subtitle
      expect(root.findByProps({ children: 'Voice Guardian' })).toBeDefined();
      expect(
        root.findByProps({
          children: 'Speak Suspicious Messages & Listen to Safety Advice',
        })
      ).toBeDefined();

      // Large mic button
      expect(
        root.findByProps({ accessibilityLabel: '🎤 Tap to Speak' })
      ).toBeDefined();

      // Privacy guarantees
      expect(
        root.findByProps({ children: '🛡️ ScamShield Voice Privacy Guarantee' })
      ).toBeDefined();
      expect(
        root.findByProps({
          children:
            '• Speech-to-text turns your voice into text. Scam detection is performed by our deterministic rule-based engine.',
        })
      ).toBeDefined();
      expect(
        root.findByProps({
          children:
            '• NOTE: ScamShield does not listen to incoming telephone calls. We do not claim cloned-voice or deepfake audio detection.',
        })
      ).toBeDefined();
    });

    it('handles microphone permission granted and toggles listening state', async () => {
      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<VoiceGuardianScreen onBack={jest.fn()} />);
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      const root = tree!.root;

      // Tap mic to start listening
      const micBtn = root.findByProps({ accessibilityLabel: '🎤 Tap to Speak' });
      await act(async () => {
        micBtn.props.onPress();
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });

      // State is listening
      expect(
        root.findByProps({ children: 'LISTENING... SPEAK YOUR MESSAGE CLEARLY' })
      ).toBeDefined();
      expect(
        root.findByProps({ accessibilityLabel: '⏹️ Stop Listening' })
      ).toBeDefined();

      // Tap again to stop
      const stopBtn = root.findByProps({ accessibilityLabel: '⏹️ Stop Listening' });
      act(() => {
        stopBtn.props.onPress();
      });

      expect(
        root.findByProps({ children: 'READY TO LISTEN' })
      ).toBeDefined();
    });

    it('handles microphone permission denied and informs senior of text fallback', async () => {
      // Mock permission denied
      jest.spyOn(PermissionsAndroid, 'check').mockResolvedValue(false);
      jest
        .spyOn(PermissionsAndroid, 'request')
        .mockResolvedValue(PermissionsAndroid.RESULTS.DENIED);

      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<VoiceGuardianScreen onBack={jest.fn()} />);
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      const root = tree!.root;

      // Tap mic
      const micBtn = root.findByProps({ accessibilityLabel: '🎤 Tap to Speak' });
      await act(async () => {
        micBtn.props.onPress();
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });

      // Dialog opens explaining rationale
      expect(
        root.findByProps({ children: 'Microphone Access Required' })
      ).toBeDefined();

      // Confirm in dialog to trigger request
      const confirmDialogBtn = root.findByProps({ accessibilityLabel: 'Allow Microphone' });
      await act(async () => {
        confirmDialogBtn.props.onPress();
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });

      // Error banner displays plain explanation without crashing
      expect(
        root.findByProps({
          children:
            '⚠️ Microphone permission is required to speak your message. You can also type or paste your message below.',
        })
      ).toBeDefined();
    });

    it('simulates quick voice samples and allows manual text editing fallback', async () => {
      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<VoiceGuardianScreen onBack={jest.fn()} />);
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      const root = tree!.root;

      // Tap electricity threat sample
      const sampleBtn = root.findByProps({
        accessibilityLabel: '⚡ Electricity Cutoff Threat',
      });
      await act(async () => {
        sampleBtn.props.onPress();
      });

      // Advance simulated STT speech processing timer
      await act(async () => {
        jest.advanceTimersByTime(700);
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });

      // Transcribed text area populated
      const textInput = root.findByProps({
        placeholder:
          'Your spoken words will appear here. You can review and edit before analyzing.',
      });
      expect(textInput.props.value).toContain('Urgent: Your electricity bill was not paid');

      // Manual edit fallback: user edits the transcription before submitting
      act(() => {
        textInput.props.onChangeText('Custom typed suspicious message from bank');
      });
      expect(textInput.props.value).toBe('Custom typed suspicious message from bank');
    });

    it('validates empty submission before calling backend analysis', async () => {
      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<VoiceGuardianScreen onBack={jest.fn()} />);
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      const root = tree!.root;

      // Tap analyze with empty text
      const analyzeBtn = root.findByProps({
        accessibilityLabel: '🔍 Analyze Spoken Message',
      });
      act(() => {
        analyzeBtn.props.onPress();
      });

      expect(
        root.findByProps({ children: '⚠️ Please speak or enter a message before analyzing.' })
      ).toBeDefined();
    });

    it('analyzes reviewed voice message, displays result, and triggers TTS spoken advice', async () => {
      jest
        .spyOn(AnalysisApiService, 'analyzeMessage')
        .mockResolvedValueOnce(MOCK_HIGH_RISK_RESPONSE);
      const speakSpy = jest.spyOn(VoiceGuardianService, 'speak');

      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<VoiceGuardianScreen onBack={jest.fn()} onNavigateToEmergency={jest.fn()} />);
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      const root = tree!.root;

      // Populate text
      const textInput = root.findByProps({
        placeholder:
          'Your spoken words will appear here. You can review and edit before analyzing.',
      });
      act(() => {
        textInput.props.onChangeText('Electricity power will be cut tonight at 9:30 PM call 9876543210');
      });

      // Tap analyze
      const analyzeBtn = root.findByProps({
        accessibilityLabel: '🔍 Analyze Spoken Message',
      });
      await act(async () => {
        analyzeBtn.props.onPress();
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });

      expect(AnalysisApiService.analyzeMessage).toHaveBeenCalledWith({
        text: 'Electricity power will be cut tonight at 9:30 PM call 9876543210',
        language: 'en',
      });

      // Result displayed
      expect(root.findByProps({ children: '🚨 High Scam Risk Detected' })).toBeDefined();
      expect(root.findByProps({ children: 'SCORE: 92/100' })).toBeDefined();
      expect(
        root.findByProps({
          children: 'This message threatens electricity disconnection to coerce payment.',
        })
      ).toBeDefined();

      // Voice advice auto-triggered
      expect(speakSpy).toHaveBeenCalled();

      // Stop reading button allows stopping TTS playback
      const stopTtsBtn = root.findByProps({ accessibilityLabel: '⏹️ Stop Reading' });
      act(() => {
        stopTtsBtn.props.onPress();
      });

      expect(VoiceGuardianService.getCurrentState()).toBe('idle');
    });

    it('handles network error gracefully without crashing', async () => {
      jest
        .spyOn(AnalysisApiService, 'analyzeMessage')
        .mockRejectedValueOnce(new Error('Network error'));

      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<VoiceGuardianScreen onBack={jest.fn()} />);
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      const root = tree!.root;

      const textInput = root.findByProps({
        placeholder:
          'Your spoken words will appear here. You can review and edit before analyzing.',
      });
      act(() => {
        textInput.props.onChangeText('Some suspicious message text');
      });

      const analyzeBtn = root.findByProps({
        accessibilityLabel: '🔍 Analyze Spoken Message',
      });
      await act(async () => {
        analyzeBtn.props.onPress();
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });

      expect(
        root.findByProps({
          children:
            '⚠️ Could not connect to analysis service. Please check your network connection and try again.',
        })
      ).toBeDefined();
    });

    it('clears transcribed text and active analysis when Clear Text is tapped', async () => {
      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<VoiceGuardianScreen onBack={jest.fn()} />);
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      const root = tree!.root;

      const textInput = root.findByProps({
        placeholder:
          'Your spoken words will appear here. You can review and edit before analyzing.',
      });
      act(() => {
        textInput.props.onChangeText('Test message to be cleared');
      });

      const clearBtn = root.findByProps({ accessibilityLabel: '✕ Clear Text' });
      act(() => {
        clearBtn.props.onPress();
      });

      expect(textInput.props.value).toBe('');
    });
  });

  describe('Multilingual Voice Guardian (Hindi & Marathi)', () => {
    it('renders Voice Guardian in Hindi with Devanagari labels and spoken summary', async () => {
      await act(async () => {
        await i18n.changeLanguage('hi');
      });

      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<VoiceGuardianScreen onBack={jest.fn()} />);
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      const root = tree!.root;

      expect(root.findByProps({ children: 'वॉइस गार्डियन' })).toBeDefined();
      expect(
        root.findByProps({ accessibilityLabel: '🎤 बोलने के लिए टैप करें' })
      ).toBeDefined();
      expect(
        root.findByProps({ children: '⚡ बिजली काटने की धमकी' })
      ).toBeDefined();

      // Test Hindi TTS spoken summary generator
      const spokenSummaryHi = VoiceGuardianService.generateSpokenSummary(
        MOCK_HIGH_RISK_RESPONSE,
        'hi'
      );
      expect(spokenSummaryHi).toContain('सावधान!');
      expect(spokenSummaryHi).toContain('ओटीपी');
    });

    it('renders Voice Guardian in Marathi with Devanagari labels and spoken summary', async () => {
      await act(async () => {
        await i18n.changeLanguage('mr');
      });

      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<VoiceGuardianScreen onBack={jest.fn()} />);
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      const root = tree!.root;

      expect(root.findByProps({ children: 'व्हॉइस गार्डियन' })).toBeDefined();
      expect(
        root.findByProps({ accessibilityLabel: '🎤 बोलण्यासाठी टॅप करा' })
      ).toBeDefined();
      expect(
        root.findByProps({ children: '⚡ वीज तोडण्याची धमकी' })
      ).toBeDefined();

      // Test Marathi TTS spoken summary generator
      const spokenSummaryMr = VoiceGuardianService.generateSpokenSummary(
        MOCK_HIGH_RISK_RESPONSE,
        'mr'
      );
      expect(spokenSummaryMr).toContain('सावधान!');
      expect(spokenSummaryMr).toContain('फसवणुकीचा');
    });
  });

  describe('App Navigation Integration', () => {
    it('navigates from HomeScreen to VoiceGuardianScreen and returns cleanly', async () => {
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

      // Log in
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

      // On HomeScreen, tap Voice Guardian card
      const voiceCard = tree!.root.findByProps({ accessibilityLabel: 'Voice Guardian' });
      await act(async () => {
        voiceCard.props.onPress();
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });

      // Voice Guardian screen rendered
      expect(tree!.root.findByProps({ children: 'Voice Guardian' })).toBeDefined();
      expect(tree!.root.findByProps({ children: 'READY TO LISTEN' })).toBeDefined();

      // Tap back button
      const backBtn = tree!.root.findByProps({ accessibilityLabel: 'Go back' });
      await act(async () => {
        backBtn.props.onPress();
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });

      // Back on HomeScreen
      expect(tree!.root.findByProps({ children: 'Protection Modules' })).toBeDefined();
    });
  });
});
