import { Platform } from 'react-native';

export type RiskLevel = 'SAFE' | 'CAUTION' | 'HIGH_RISK';

export type IndicatorCategory =
  | 'KYC_FRAUD'
  | 'OTP_DEMAND'
  | 'UPI_COLLECT'
  | 'APK_DOWNLOAD'
  | 'ELECTRICITY_CUTOFF'
  | 'DIGITAL_ARREST'
  | 'ACCOUNT_BLOCK'
  | 'SUSPICIOUS_LINK'
  | 'URGENT_PRESSURE'
  | 'BENIGN_TRANSACTION';

export interface DetectedIndicator {
  category: IndicatorCategory | string;
  indicator_name: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW' | 'BENIGN' | string;
  description: string;
  evidence: string;
}

export interface MessageAnalysisRequest {
  text: string;
  sender?: string;
  language?: 'en' | 'hi' | 'mr';
}

export interface MessageAnalysisResponse {
  risk_level: RiskLevel;
  risk_score: number;
  detected_indicators: DetectedIndicator[];
  explanation: string;
  recommended_actions: string[];
  language: string;
  disclaimer: string;
}

export class AnalysisApiError extends Error {
  constructor(
    message: string,
    public readonly code: 'NETWORK_ERROR' | 'VALIDATION_ERROR' | 'SERVER_ERROR' | 'TIMEOUT_ERROR'
  ) {
    super(message);
    this.name = 'AnalysisApiError';
  }
}

// Default base URL: Android Emulator uses 10.0.2.2 for host machine; localhost for iOS / Web / Node
let customApiBaseUrl: string | null = null;

export const AnalysisApiService = {
  getBaseUrl(): string {
    if (customApiBaseUrl) return customApiBaseUrl;
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:8000';
    }
    return 'http://localhost:8000';
  },

  setBaseUrl(url: string | null): void {
    customApiBaseUrl = url;
  },

  /**
   * Submits message text to FastAPI backend /api/v1/analyze/message
   * Includes strict pre-validation, timeout abort controller, and typed error handling.
   */
  async analyzeMessage(
    request: MessageAnalysisRequest,
    timeoutMs: number = 8000
  ): Promise<MessageAnalysisResponse> {
    const trimmed = request.text?.trim() ?? '';

    // 1. Client-Side Input Pre-Validation
    if (!trimmed) {
      throw new AnalysisApiError(
        'Please enter or paste a message to analyze.',
        'VALIDATION_ERROR'
      );
    }

    if (trimmed.length > 2000) {
      throw new AnalysisApiError(
        'Message exceeds the maximum limit of 2,000 characters. Please shorten the text.',
        'VALIDATION_ERROR'
      );
    }

    const endpoint = `${this.getBaseUrl()}/api/v1/analyze/message`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          text: trimmed,
          sender: request.sender || undefined,
          language: request.language || undefined,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorDetail = `Backend server responded with status ${response.status}`;
        try {
          const errorJson = await response.json();
          if (errorJson?.detail) {
            errorDetail = typeof errorJson.detail === 'string'
              ? errorJson.detail
              : JSON.stringify(errorJson.detail);
          }
        } catch {
          // Keep default message
        }

        if (response.status >= 500) {
          throw new AnalysisApiError(
            'The ScamShield analysis server encountered a temporary error. Please try again.',
            'SERVER_ERROR'
          );
        }

        throw new AnalysisApiError(errorDetail, 'VALIDATION_ERROR');
      }

      const data = await response.json();

      // 2. Response Structure Validation
      if (!data || typeof data.risk_score !== 'number' || !data.risk_level) {
        throw new AnalysisApiError(
          'Received an invalid response from the scam detection server.',
          'SERVER_ERROR'
        );
      }

      return {
        risk_level: data.risk_level,
        risk_score: Math.min(100, Math.max(0, data.risk_score)),
        detected_indicators: Array.isArray(data.detected_indicators) ? data.detected_indicators : [],
        explanation: data.explanation || 'No detailed explanation provided.',
        recommended_actions: Array.isArray(data.recommended_actions) ? data.recommended_actions : [],
        language: data.language || 'en',
        disclaimer:
          data.disclaimer ||
          'Notice: This score is an automated rule-based heuristic designed to assist your judgement. It is not a statistical guarantee.',
      };
    } catch (err: any) {
      clearTimeout(timeoutId);

      if (err instanceof AnalysisApiError) {
        throw err;
      }

      if (err.name === 'AbortError') {
        throw new AnalysisApiError(
          'Analysis timed out. Please check your internet connection and try again.',
          'TIMEOUT_ERROR'
        );
      }

      throw new AnalysisApiError(
        'Unable to reach ScamShield server. Please ensure the backend service is running or check your network.',
        'NETWORK_ERROR'
      );
    }
  },
};

