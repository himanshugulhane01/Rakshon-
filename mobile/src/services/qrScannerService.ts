export type QrPayloadType = 'UPI_PAYMENT' | 'WEB_URL' | 'PLAIN_TEXT';

export interface UpiDetails {
  payeeAddress: string;
  payeeName?: string;
  amount?: string;
  transactionNote?: string;
  currency?: string;
}

export interface QrAnalysisResult {
  payloadType: QrPayloadType;
  rawPayload: string;
  isSuspicious: boolean;
  riskSeverity: 'SAFE' | 'CAUTION' | 'HIGH_RISK';
  title: string;
  summary: string;
  upiDetails?: UpiDetails;
  flaggedReasons: string[];
  safetyWarnings: string[];
}

// Known URL shortener domains commonly used in phishing
const URL_SHORTENERS = [
  'bit.ly',
  'tinyurl.com',
  'is.gd',
  't.co',
  'cutt.ly',
  'rb.gy',
  'shorturl.at',
  'goo.gl',
];

// High-risk brand keywords in domain names
const PHISHING_DOMAIN_KEYWORDS = [
  'kyc',
  'sbi',
  'hdfc',
  'icici',
  'paytm',
  'mahavitaran',
  'electricity',
  'bill',
  'police',
  'cbi',
  'aadhaar',
  'pan-card',
];

export const QrScannerService = {
  /**
   * Analyzes decoded QR payload for fraud patterns.
   * NEVER opens URLs automatically and NEVER triggers payments.
   */
  inspectQrPayload(rawContent: string): QrAnalysisResult {
    const trimmed = rawContent?.trim() ?? '';

    if (!trimmed) {
      return {
        payloadType: 'PLAIN_TEXT',
        rawPayload: '',
        isSuspicious: false,
        riskSeverity: 'SAFE',
        title: 'Empty QR Code',
        summary: 'No text or destination detected in this QR code.',
        flaggedReasons: [],
        safetyWarnings: ['Ensure the QR code image is clear and well-lit.'],
      };
    }

    // 1. Detect UPI Payment URI (e.g. upi://pay?pa=recipient@bank&pn=Name&am=100)
    if (trimmed.toLowerCase().startsWith('upi://pay')) {
      return this._analyzeUpiPayload(trimmed);
    }

    // 2. Detect Web URL (http:// or https://)
    if (trimmed.toLowerCase().startsWith('http://') || trimmed.toLowerCase().startsWith('https://')) {
      return this._analyzeUrlPayload(trimmed);
    }

    // 3. Fallback: Plain Text or Non-URL string
    return {
      payloadType: 'PLAIN_TEXT',
      rawPayload: trimmed,
      isSuspicious: false,
      riskSeverity: 'SAFE',
      title: 'Informational Text QR',
      summary: 'This QR code contains plain informational text rather than a payment request or website link.',
      flaggedReasons: [],
      safetyWarnings: [
        'Review the text carefully before taking any action.',
        'Never send money or share OTPs based on QR code instructions.',
      ],
    };
  },

  _analyzeUpiPayload(upiUri: string): QrAnalysisResult {
    const flaggedReasons: string[] = [];
    const safetyWarnings: string[] = [
      'CRITICAL: Scanning a QR code only SENDS money out of your account. You NEVER need to scan a QR code to receive money.',
      'Always verify the recipient name with someone you trust before entering any UPI PIN.',
    ];

    let payeeAddress = '';
    let payeeName = '';
    let amount = '';
    let transactionNote = '';
    let currency = 'INR';

    try {
      const queryStart = upiUri.indexOf('?');
      if (queryStart !== -1) {
        const queryString = upiUri.substring(queryStart + 1);
        const params = new URLSearchParams(queryString);

        payeeAddress = params.get('pa') || '';
        payeeName = params.get('pn') || '';
        amount = params.get('am') || '';
        transactionNote = params.get('tn') || '';
        currency = params.get('cu') || 'INR';
      }
    } catch {
      flaggedReasons.push('Malformed UPI payload structure.');
    }

    // Evaluation rules for UPI payloads
    if (!payeeName) {
      flaggedReasons.push('Payee name is missing from QR code. The real recipient is hidden.');
    }

    if (amount) {
      flaggedReasons.push(`Pre-set payment request of ₹${amount} automatically configured.`);
    }

    if (transactionNote) {
      const lowerNote = transactionNote.toLowerCase();
      if (
        lowerNote.includes('refund') ||
        lowerNote.includes('cashback') ||
        lowerNote.includes('lottery') ||
        lowerNote.includes('prize')
      ) {
        flaggedReasons.push(
          `Deceptive note ("${transactionNote}") pretending to offer a refund or reward.`
        );
      }
    }

    const isSuspicious = flaggedReasons.length > 0;
    const riskSeverity = flaggedReasons.some((r) => r.includes('Deceptive') || r.includes('hidden'))
      ? 'HIGH_RISK'
      : isSuspicious
      ? 'CAUTION'
      : 'SAFE';

    return {
      payloadType: 'UPI_PAYMENT',
      rawPayload: upiUri,
      isSuspicious,
      riskSeverity,
      title: isSuspicious ? 'Suspicious UPI Payment QR' : 'UPI Payment QR Detected',
      summary: payeeName
        ? `This QR code prepares a UPI transfer to "${payeeName}" (${payeeAddress || 'Hidden VPA'}).`
        : `This QR code prepares a UPI transfer to address: ${payeeAddress || 'Hidden Payee'}.`,
      upiDetails: {
        payeeAddress,
        payeeName,
        amount,
        transactionNote,
        currency,
      },
      flaggedReasons,
      safetyWarnings,
    };
  },

  _analyzeUrlPayload(urlStr: string): QrAnalysisResult {
    const flaggedReasons: string[] = [];
    const safetyWarnings: string[] = [
      'ScamShield does NOT automatically open this link. Inspect the destination address below.',
      'Never enter your bank passwords, ATM PINs, or OTPs on unverified websites.',
    ];

    let hostname = '';
    let pathname = '';
    let isHttpOnly = false;

    try {
      const url = new URL(urlStr);
      hostname = url.hostname.toLowerCase();
      pathname = url.pathname.toLowerCase();
      isHttpOnly = url.protocol === 'http:';
    } catch {
      flaggedReasons.push('Malformed or deceptive URL structure.');
    }

    // 1. Insecure HTTP Check
    if (isHttpOnly) {
      flaggedReasons.push('Website uses unencrypted HTTP instead of secure HTTPS.');
    }

    // 2. Direct IP Address Hostname
    const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
    if (isIpAddress) {
      flaggedReasons.push(`Direct IP address destination (${hostname}) frequently used in phishing.`);
    }

    // 3. URL Shortener Detection
    const isShortener = URL_SHORTENERS.some((short) => hostname.includes(short));
    if (isShortener) {
      flaggedReasons.push(`Uses URL shortener (${hostname}) to conceal the real destination address.`);
    }

    // 4. Direct APK Download Link
    if (pathname.endsWith('.apk') || urlStr.toLowerCase().includes('.apk')) {
      flaggedReasons.push('Direct Android APK download link detected. Dangerous malware risk.');
    }

    // 5. Phishing Keywords in Domain
    const containsPhishBrand = PHISHING_DOMAIN_KEYWORDS.some(
      (keyword) => hostname.includes(keyword) && !hostname.endsWith('.gov.in')
    );
    if (containsPhishBrand) {
      flaggedReasons.push(
        `Domain contains high-risk brand keyword ("${hostname}") but is not an official government or verified portal.`
      );
    }

    const isSuspicious = flaggedReasons.length > 0;
    const hasCriticalThreat = flaggedReasons.some(
      (r) => r.includes('APK') || r.includes('Direct IP') || r.includes('high-risk brand')
    );

    const riskSeverity = hasCriticalThreat ? 'HIGH_RISK' : isSuspicious ? 'CAUTION' : 'SAFE';

    return {
      payloadType: 'WEB_URL',
      rawPayload: urlStr,
      isSuspicious,
      riskSeverity,
      title: isSuspicious ? 'Suspicious Web Link QR' : 'Standard Web Link QR',
      summary: `This QR code directs to web address: ${hostname || urlStr}`,
      flaggedReasons,
      safetyWarnings,
    };
  },
};

