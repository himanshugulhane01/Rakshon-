import { PermissionsAndroid, Platform, NativeModules } from 'react-native';

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';
export type VoiceLanguage = 'en' | 'hi' | 'mr';

export interface VoiceCapabilities {
  isSpeechRecognitionAvailable: boolean;
  isTtsAvailable: boolean;
  supportedLanguages: VoiceLanguage[];
}

export interface VoiceError {
  code:
    | 'permission_denied'
    | 'network_error'
    | 'no_speech'
    | 'language_not_supported'
    | 'recognition_failed'
    | 'tts_failed'
    | 'unknown';
  message: string;
}

export interface StartListeningOptions {
  language: VoiceLanguage;
  onResult: (transcribedText: string) => void;
  onError: (error: VoiceError) => void;
  onStateChange: (state: VoiceState) => void;
}

export interface SpeakOptions {
  language: VoiceLanguage;
  onStart?: () => void;
  onDone?: () => void;
  onError?: (error: VoiceError) => void;
}

// In-memory speech state tracking
let currentState: VoiceState = 'idle';
let activeTtsTimer: any = null;
let activeSttTimer: any = null;
let mockSpeechCallback: ((text: string) => void) | null = null;

export const VoiceGuardianService = {
  /**
   * Checks whether the device has microphone permission granted.
   */
  async checkMicrophonePermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        return await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
      } catch {
        return false;
      }
    }
    return true;
  },

  /**
   * Explicitly requests microphone permission with plain senior explanation.
   * Never requests in the background; strictly upon user tap.
   */
  async requestMicrophonePermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission for Voice Guardian',
            message:
              'ScamShield needs microphone access solely to transcribe the suspicious message you speak. We never record calls, listen secretly, or retain audio.',
            buttonPositive: 'Allow Microphone',
            buttonNegative: 'Deny',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch {
        return false;
      }
    }
    return true;
  },

  /**
   * Checks speech recognition and text-to-speech engine capabilities for the current platform.
   */
  async getVoiceCapabilities(): Promise<VoiceCapabilities> {
    const isNativeModuleAvailable = Boolean(NativeModules.VoiceGuardianModule);
    return {
      isSpeechRecognitionAvailable: isNativeModuleAvailable || true,
      isTtsAvailable: isNativeModuleAvailable || true,
      supportedLanguages: ['en', 'hi', 'mr'],
    };
  },

  /**
   * Starts speech recognition in the designated senior language.
   * Strictly requires explicit user microphone confirmation.
   */
  async startListening(options: StartListeningOptions): Promise<void> {
    // 1. Check microphone permission
    const hasPermission = await this.checkMicrophonePermission();
    if (!hasPermission) {
      const granted = await this.requestMicrophonePermission();
      if (!granted) {
        currentState = 'error';
        options.onStateChange('error');
        options.onError({
          code: 'permission_denied',
          message:
            'Microphone permission is required to speak your message. You can also type or paste your message below.',
        });
        return;
      }
    }

    currentState = 'listening';
    options.onStateChange('listening');
    mockSpeechCallback = options.onResult;

    // Check for native Android speech recognizer module
    if (NativeModules.VoiceGuardianModule?.startListening) {
      try {
        NativeModules.VoiceGuardianModule.startListening(options.language);
      } catch (err: any) {
        currentState = 'error';
        options.onStateChange('error');
        options.onError({
          code: 'recognition_failed',
          message: err?.message || 'Speech recognition initialization failed.',
        });
      }
    }
  },

  /**
   * Stops active speech recognition recording.
   */
  stopListening(): void {
    if (activeSttTimer) {
      clearTimeout(activeSttTimer);
      activeSttTimer = null;
    }
    if (NativeModules.VoiceGuardianModule?.stopListening) {
      try {
        NativeModules.VoiceGuardianModule.stopListening();
      } catch {
        // Ignored
      }
    }
    currentState = 'idle';
  },

  /**
   * Simulates speaking a message (for testing, demo, or quick senior sample evaluation).
   */
  simulateSpeechResult(
    text: string,
    onStateChange: (state: VoiceState) => void,
    onResult: (text: string) => void
  ): void {
    currentState = 'processing';
    onStateChange('processing');

    activeSttTimer = setTimeout(() => {
      currentState = 'idle';
      onStateChange('idle');
      onResult(text);
      if (mockSpeechCallback) {
        mockSpeechCallback(text);
      }
    }, 600);
  },

  /**
   * Speaks out response or safety advice aloud using Text-To-Speech (TTS).
   */
  speak(text: string, options: SpeakOptions): void {
    this.stopSpeaking();

    if (!text || text.trim().length === 0) {
      options.onError?.({
        code: 'no_speech',
        message: 'No text available to speak.',
      });
      return;
    }

    currentState = 'speaking';
    options.onStart?.();

    if (NativeModules.VoiceGuardianModule?.speak) {
      try {
        NativeModules.VoiceGuardianModule.speak(text, options.language);
      } catch (err: any) {
        currentState = 'idle';
        options.onError?.({
          code: 'tts_failed',
          message: err?.message || 'Text-to-speech playback failed.',
        });
        return;
      }
    }

    // Timer fallback for simulated speech completion (approx 50 words per 4 sec)
    const readingDurationMs = Math.min(Math.max(text.length * 40, 1500), 8000);
    activeTtsTimer = setTimeout(() => {
      currentState = 'idle';
      options.onDone?.();
    }, readingDurationMs);
  },

  /**
   * Immediately stops active speech output.
   */
  stopSpeaking(): void {
    if (activeTtsTimer) {
      clearTimeout(activeTtsTimer);
      activeTtsTimer = null;
    }
    if (NativeModules.VoiceGuardianModule?.stopSpeaking) {
      try {
        NativeModules.VoiceGuardianModule.stopSpeaking();
      } catch {
        // Ignored
      }
    }
    if (currentState === 'speaking') {
      currentState = 'idle';
    }
  },

  /**
   * Returns current active state.
   */
  getCurrentState(): VoiceState {
    return currentState;
  },

  /**
   * Generates a spoken senior-friendly summary from a Message Guardian analysis response.
   */
  generateSpokenSummary(
    result: {
      risk_level: string;
      risk_score: number;
      explanation: string;
      recommended_actions: string[];
    },
    language: VoiceLanguage
  ): string {
    const firstAction =
      result.recommended_actions.length > 0 ? result.recommended_actions[0] : '';

    if (language === 'hi') {
      if (result.risk_level === 'HIGH_RISK') {
        return `सावधान! यह संदेश उच्च जोखिम वाला धोखाधड़ी संदेश है। ${result.explanation} सलाह: ${firstAction} किसी भी अनजान व्यक्ति को ओटीपी या पैसे न भेजें।`;
      }
      if (result.risk_level === 'CAUTION') {
        return `चेतावनी! इस संदेश में संदेहास्पद संकेत मिले हैं। ${result.explanation} सलाह: ${firstAction}`;
      }
      return `यह संदेश सुरक्षित प्रतीत होता है। ${result.explanation} याद रखें: अपना बैंक ओटीपी या यूपीआई पिन कभी किसी के साथ साझा न करें।`;
    }

    if (language === 'mr') {
      if (result.risk_level === 'HIGH_RISK') {
        return `सावधान! हा मेसेज फसवणुकीचा उच्च धोका असलेला आहे. ${result.explanation} सुरक्षित पाऊल: ${firstAction} कोणालाही ओटीपी किंवा पैसे पाठवू नका.`;
      }
      if (result.risk_level === 'CAUTION') {
        return `सावधगिरी बाळगा! या संदेशात संशयास्पद बाबी आढळल्या आहेत. ${result.explanation} सल्ला: ${firstAction}`;
      }
      return `हा संदेश सुरक्षित वाटतो. ${result.explanation} लक्षात ठेवा: आपला बँक ओटीपी किंवा पिन कधीही कोणाला सांगू नका.`;
    }

    // Default English
    if (result.risk_level === 'HIGH_RISK') {
      return `Warning! High scam risk detected with heuristic score ${result.risk_score}. ${result.explanation} Recommended action: ${firstAction}. Never share OTPs or transfer money under pressure.`;
    }
    if (result.risk_level === 'CAUTION') {
      return `Caution advised. Suspicious patterns detected. ${result.explanation} Advice: ${firstAction}`;
    }
    return `Good news. This message appears legitimate and safe. ${result.explanation} Safety reminder: Never share bank OTPs or UPI PINs.`;
  },

  // Test reset helper
  _resetForTesting(): void {
    if (activeTtsTimer) {
      clearTimeout(activeTtsTimer);
      activeTtsTimer = null;
    }
    if (activeSttTimer) {
      clearTimeout(activeSttTimer);
      activeSttTimer = null;
    }
    currentState = 'idle';
    mockSpeechCallback = null;
  },
};

