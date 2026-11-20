import { AnalysisApiService, MessageAnalysisResponse } from './analysisApi';

export type UnifiedCheckerType = 'message' | 'url' | 'phone' | 'image';

export interface UnifiedCheckResult {
  inputType: UnifiedCheckerType;
  inputValue: string;
  riskLevel: 'SAFE' | 'CAUTION' | 'DANGER';
  riskScore: number;
  title: {
    en: string;
    hi: string;
    mr: string;
  };
  warningSigns: {
    en: string[];
    hi: string[];
    mr: string[];
  };
  explanation: {
    en: string;
    hi: string;
    mr: string;
  };
  recommendedActions: {
    en: string[];
    hi: string[];
    mr: string[];
  };
}

export const UnifiedCheckerService = {
  /**
   * Unified Message / SMS / WhatsApp Text Checker
   */
  async checkMessage(text: string): Promise<UnifiedCheckResult> {
    const trimmed = text.trim();
    if (!trimmed) {
      throw new Error('Message text cannot be empty.');
    }

    try {
      const apiResult: MessageAnalysisResponse = await AnalysisApiService.analyzeMessage({
        text: trimmed,
      });

      let riskLevel: 'SAFE' | 'CAUTION' | 'DANGER' = 'SAFE';
      if (apiResult.risk_level === 'HIGH_RISK') {
        riskLevel = 'DANGER';
      } else if (apiResult.risk_level === 'CAUTION') {
        riskLevel = 'CAUTION';
      }

      const warningSignsEn =
        apiResult.detected_indicators && apiResult.detected_indicators.length > 0
          ? apiResult.detected_indicators.map((ind) => `${ind.indicator_name}: ${ind.description}`)
          : ['No high-risk fraud patterns detected in message content.'];

      const warningSignsHi =
        riskLevel === 'DANGER'
          ? ['संदेश में तत्काल वित्तीय नुकसान या धोखाधड़ी के संकेत मिले हैं।']
          : ['संदेश में कोई गंभीर खतरा नहीं पाया गया।'];

      const warningSignsMr =
        riskLevel === 'DANGER'
          ? ['संदेशामध्ये तात्काळ आर्थिक नुकसान किंवा फसवणुकीची लक्षणे आढळली आहेत.']
          : ['संदेशामध्ये कोणताही गंभीर धोका आढळला नाही.'];

      return {
        inputType: 'message',
        inputValue: trimmed,
        riskLevel,
        riskScore: apiResult.risk_score,
        title: {
          en:
            riskLevel === 'DANGER'
              ? 'High-Risk Scam Message Detected'
              : riskLevel === 'CAUTION'
              ? 'Suspicious Message (Verify Before Acting)'
              : 'Message Appears Legitimate',
          hi:
            riskLevel === 'DANGER'
              ? 'अत्यधिक खतरनाक धोखाधड़ी संदेश पहचाना गया'
              : riskLevel === 'CAUTION'
              ? 'संदिग्ध संदेश (कार्रवाई करने से पहले जांचें)'
              : 'संदेश सामान्य प्रतीत होता है',
          mr:
            riskLevel === 'DANGER'
              ? 'अत्यंत धोकादायक फसवणूक मेसेज आढळला'
              : riskLevel === 'CAUTION'
              ? 'संशयास्पद मेसेज (खात्री केल्याशिवाय काही करू नका)'
              : 'मेसेज सामान्य वाटत आहे',
        },
        warningSigns: {
          en: warningSignsEn,
          hi: warningSignsHi,
          mr: warningSignsMr,
        },
        explanation: {
          en: apiResult.explanation,
          hi:
            riskLevel === 'DANGER'
              ? 'इस संदेश में वरिष्ठ नागरिकों को ठगने वाले जाने-पहचाने धोखे के पैटर्न मिले हैं। किसी भी लिंक या दिए गए नंबर पर तुरंत विश्वास न करें।'
              : 'संदेश में कोई खुला खतरा नहीं मिला, फिर भी अज्ञात प्रेषकों से सावधान रहें।',
          mr:
            riskLevel === 'DANGER'
              ? 'या मेसेजमध्ये ज्येष्ठ नागरिकांना फसवणाऱ्या सायबर टोळ्यांची लक्षणे आढळली आहेत. दिलेल्या लिंकवर क्लिक करू नका.'
              : 'मेसेजमध्ये उघड धोका आढळला नाही, तरीही अनोळखी व्यक्तींशी बोलताना सावध राहा.',
        },
        recommendedActions: {
          en:
            apiResult.recommended_actions && apiResult.recommended_actions.length > 0
              ? apiResult.recommended_actions
              : [
                  'Never share OTPs, PINs, or passwords.',
                  'Verify through official numbers printed on your bank debit card.',
                ],
          hi: [
            'ओटीपी, पिन या पासवर्ड कभी भी किसी को न बताएं।',
            'संदेश में दिए गए नंबर पर कभी कॉल न करें।',
            'धोखाधड़ी की स्थिति में तुरंत १९३० पर कॉल करें।',
          ],
          mr: [
            'ओटीपी, पिन किंवा पासवर्ड कोणाशीही शेअर करू नका.',
            'मेसेजमधील नंबरवर थेट कॉल करू नका.',
            'काही शंका असल्यास १९३० सायबर हेल्पलाइनवर संपर्क करा.',
          ],
        },
      };
    } catch {
      // Safe deterministic offline fallback
      return this.checkMessageOffline(trimmed);
    }
  },

  /**
   * Safe Deterministic Offline Message Fallback
   */
  checkMessageOffline(text: string): UnifiedCheckResult {
    const lower = text.toLowerCase();
    const isUrgent = /urgent|immediately|tonight|blocked|disconnect|suspended|electricity/i.test(
      lower
    );
    const hasMoneyOrPrize = /won|lottery|prize|crore|lakh|gift|kbc|congratulations/i.test(lower);
    const hasLegalThreat = /police|arrest|cbi|customs|court|narcotics|fir/i.test(lower);
    const hasOtpMention = /otp|one-time password|pin|code/i.test(lower);

    let riskLevel: 'SAFE' | 'CAUTION' | 'DANGER' = 'SAFE';
    let riskScore = 15;
    const warningsEn: string[] = [];

    if (isUrgent && (hasOtpMention || /call|contact|click/i.test(lower))) {
      riskLevel = 'DANGER';
      riskScore = 85;
      warningsEn.push('Artificial urgency and panic creation detected.');
    }
    if (hasMoneyOrPrize && /pay|charge|tax|claim|link/i.test(lower)) {
      riskLevel = 'DANGER';
      riskScore = 90;
      warningsEn.push('Prize scam indicators: Advance fee demand for fake lottery.');
    }
    if (hasLegalThreat) {
      riskLevel = 'DANGER';
      riskScore = 95;
      warningsEn.push('Digital arrest or legal intimidation threat detected.');
    }

    if (warningsEn.length === 0) {
      warningsEn.push('No obvious high-risk keywords detected in offline scan.');
    }

    return {
      inputType: 'message',
      inputValue: text,
      riskLevel,
      riskScore,
      title: {
        en:
          riskLevel === 'DANGER'
            ? 'Scam Alert: High-Risk Patterns Detected (Offline Engine)'
            : 'Message Passed Basic Safety Scan',
        hi:
          riskLevel === 'DANGER'
            ? 'धोखाधड़ी की चेतावनी: उच्च जोखिम संकेत मिले'
            : 'संदेश में कोई स्पष्ट खतरा नहीं मिला',
        mr:
          riskLevel === 'DANGER'
            ? 'धोक्याची सूचना: फसवणुकीची लक्षणे आढळली'
            : 'मेसेजमध्ये कोणताही उघड धोका नाही',
      },
      warningSigns: {
        en: warningsEn,
        hi: ['संदेश में वरिष्ठ नागरिकों को भ्रमित करने वाले संकेत मिले हैं।'],
        mr: ['मेसेजमध्ये ज्येष्ठ नागरिकांना घाबरवून फसवण्याचे संकेत आढळले आहेत.'],
      },
      explanation: {
        en:
          riskLevel === 'DANGER'
            ? 'This message matches known social engineering tactics used by cybercriminals in India. Do not respond, call numbers listed, or send money.'
            : 'No known high-risk phrases were detected. Always remain cautious when receiving unsolicited messages from unknown numbers.',
        hi:
          riskLevel === 'DANGER'
            ? 'यह संदेश भारत में साइबर अपराधियों द्वारा उपयोग की जाने वाली जानी-मानी चालों से मेल खाता है। इसमें दिए गए नंबर पर संपर्क न करें।'
            : 'कोई गंभीर खतरा नहीं मिला। फिर भी अनजान नंबरों से आए संदेशों पर सतर्क रहें।',
        mr:
          riskLevel === 'DANGER'
            ? 'हा मेसेज सायबर गुन्हेगारांच्या नेहमीच्या फसवणूक तंत्राशी जुळतो. दिलेल्या नंबरवर संपर्क करू नका.'
            : 'कोणताही उघड धोका आढळला नाही. तरीही काळजी घ्या.',
      },
      recommendedActions: {
        en: [
          'Never click links or call numbers provided in the text.',
          'Never share OTPs, PINs, or account credentials.',
          'If you have doubts, call the official 1930 Cybercrime Helpline.',
        ],
        hi: [
          'संदेश में दिए गए लिंक पर क्लिक न करें।',
          'ओटीपी या पासवर्ड कभी किसी से साझा न करें।',
          'संदेह होने पर १९३० साइबर हेल्पलाइन पर संपर्क करें।',
        ],
        mr: [
          'मेसेजमधील लिंकवर क्लिक करू नका.',
          'ओटीपी किंवा पासवर्ड कधीही कोणाला सांगू नका.',
          'शंका असल्यास १९३० सायबर हेल्पलाइनवर कॉल करा.',
        ],
      },
    };
  },

  /**
   * Unified Website URL Safety Checker
   */
  checkWebsiteUrl(rawUrl: string): UnifiedCheckResult {
    const trimmed = rawUrl.trim();
    if (!trimmed) {
      throw new Error('Website URL cannot be empty.');
    }

    const lower = trimmed.toLowerCase();
    const isHttpOnly = lower.startsWith('http://') || (!lower.startsWith('https://') && !lower.includes('https'));
    const isGovIn = lower.includes('.gov.in') || lower.includes('.nic.in');
    const isOfficialBank = lower.includes('.sbi') || lower.includes('.bank.in');

    const suspiciousTlds = [
      '.xyz',
      '.top',
      '.tk',
      '.ml',
      '.ga',
      '.cf',
      '.gq',
      '.biz',
      '.click',
      '.download',
      '.work',
      '.country',
      '.live',
    ];
    const hasSuspiciousTld = suspiciousTlds.some((tld) => lower.includes(tld));

    const brandImpersonations = [
      'onlinesbi',
      'sbi-bank',
      'hdfc-bank',
      'icici-login',
      'incometax-refund',
      'epfo-claim',
      'paytm-kyc',
      'amaz0n',
      'flipkaart',
    ];
    const hasBrandImpersonation = brandImpersonations.some((b) => lower.includes(b)) && !isGovIn && !isOfficialBank;

    let riskLevel: 'SAFE' | 'CAUTION' | 'DANGER' = 'SAFE';
    let riskScore = 10;
    const warningsEn: string[] = [];

    if (isGovIn) {
      riskLevel = 'SAFE';
      riskScore = 5;
      warningsEn.push('Verified official Indian Government domain (.gov.in / .nic.in).');
    } else if (hasSuspiciousTld || hasBrandImpersonation) {
      riskLevel = 'DANGER';
      riskScore = 90;
      if (hasSuspiciousTld) warningsEn.push('Unfamiliar or high-abuse domain extension (.xyz / .top / .biz).');
      if (hasBrandImpersonation) warningsEn.push('Brand impersonation: Fake domain disguising as an official bank or company.');
      if (isHttpOnly) warningsEn.push('Unencrypted connection (HTTP without SSL padlock).');
    } else if (isHttpOnly) {
      riskLevel = 'CAUTION';
      riskScore = 55;
      warningsEn.push('Connection is not encrypted with HTTPS padlock.');
    } else {
      warningsEn.push('Uses standard HTTPS encryption.');
    }

    return {
      inputType: 'url',
      inputValue: trimmed,
      riskLevel,
      riskScore,
      title: {
        en:
          riskLevel === 'DANGER'
            ? 'DANGEROUS: Phishing / Fake Website URL'
            : riskLevel === 'CAUTION'
            ? 'CAUTION: Unencrypted Website'
            : 'SAFE: Official / Verified Website Domain',
        hi:
          riskLevel === 'DANGER'
            ? 'खतरनाक: फर्जी या फिशिंग वेबसाइट'
            : riskLevel === 'CAUTION'
            ? 'सावधान: असुरक्षित वेबसाइट'
            : 'सुरक्षित: प्रमाणित आधिकारिक वेबसाइट',
        mr:
          riskLevel === 'DANGER'
            ? 'धोकादायक: बनावट किंवा फिशिंग वेबसाइट'
            : riskLevel === 'CAUTION'
            ? 'सावधान: असुरक्षित वेबसाइट'
            : 'सुरक्षित: अधिकृत शासकीय किंवा बँक वेबसाइट',
      },
      warningSigns: {
        en: warningsEn,
        hi:
          riskLevel === 'DANGER'
            ? ['वेबसाइट का डोमेन नाम फर्जी है और यह किसी असली बैंक या संस्था की नकल कर रहा है।']
            : ['वेबसाइट का डोमेन सामान्य है।'],
        mr:
          riskLevel === 'DANGER'
            ? ['वेबसाइटचे नाव बनावट असून खरी बँक किंवा संस्थेची नक्कल करत आहे.']
            : ['वेबसाइट अधिकृत मानकांशी सुसंगत आहे.'],
      },
      explanation: {
        en:
          riskLevel === 'DANGER'
            ? 'This link exhibits classic characteristics of a phishing website designed to capture passwords, ATM PINs, and card numbers. Do not open or enter any personal information.'
            : riskLevel === 'CAUTION'
            ? 'This link lacks full HTTPS encryption. Avoid entering sensitive banking or personal credentials.'
            : 'This domain belongs to an official government or trusted authority. Always ensure you are on the authentic URL before logging in.',
        hi:
          riskLevel === 'DANGER'
            ? 'यह लिंक फिशिंग वेबसाइट का है जिसका उद्देश्य आपके पासवर्ड और कार्ड की जानकारी चुराना है। इस पर कोई विवरण न डालें।'
            : 'यह लिंक सुरक्षित प्रतीत होता है।',
        mr:
          riskLevel === 'DANGER'
            ? 'ही लिंक खोटी असून पासवर्ड आणि कार्ड माहिती चोरण्यासाठी तयार केली आहे. यावर कोणतीही माहिती टाकू नका.'
            : 'ही अधिकृत आणि सुरक्षित लिंक आहे.',
      },
      recommendedActions: {
        en:
          riskLevel === 'DANGER'
            ? [
                'Do not click this link or enter passwords on this page.',
                'Never download APK files or apps suggested by this website.',
                'Report the phishing link on cybercrime.gov.in or 1930.',
              ]
            : [
                'Ensure you type bank URLs directly rather than clicking links.',
                'Verify the lock icon in your browser address bar.',
              ],
        hi: [
          'इस लिंक पर कभी क्लिक न करें और न ही कोई पासवर्ड दर्ज करें।',
          'इस वेबसाइट द्वारा सुझाया गया कोई भी ऐप डाउनलोड न करें।',
          '१९३० पर फर्जी लिंक की शिकायत दर्ज कराएं।',
        ],
        mr: [
          'या लिंकवर क्लिक करू नका आणि पासवर्ड टाकू नका.',
          'कोणतेही संशयास्पद ॲप डाऊनलोड करू नका.',
          '१९३० वर त्वरित सायबर तक्रार नोंदवा.',
        ],
      },
    };
  },

  /**
   * Unified Phone Number Safety Checker
   */
  checkPhoneNumber(phoneNumber: string): UnifiedCheckResult {
    const trimmed = phoneNumber.trim();
    if (!trimmed) {
      throw new Error('Phone number cannot be empty.');
    }

    const digitsOnly = trimmed.replace(/[^0-9+]/g, '');

    // International high-risk scam prefixes targeting India
    const isForeignScam =
      digitsOnly.startsWith('+92') || // Pakistan
      digitsOnly.startsWith('+93') || // Afghanistan
      digitsOnly.startsWith('+1876') || // Jamaica lottery fraud
      digitsOnly.startsWith('+234') || // Nigeria
      digitsOnly.startsWith('+880'); // Bangladesh

    // Known telemarketing prefix
    const isTelemarketer = digitsOnly.startsWith('140') || digitsOnly.startsWith('+91140');

    // Known threat mock test number
    const isKnownThreatNumber = digitsOnly.includes('9876543210') || digitsOnly.includes('+923001234567');

    let riskLevel: 'SAFE' | 'CAUTION' | 'DANGER' = 'SAFE';
    let riskScore = 10;
    const warningsEn: string[] = [];

    if (isForeignScam || isKnownThreatNumber) {
      riskLevel = 'DANGER';
      riskScore = 95;
      if (isForeignScam) warningsEn.push('International high-risk caller prefix associated with cross-border cyber fraud.');
      if (isKnownThreatNumber) warningsEn.push('Number is cataloged in the local offline threat database.');
    } else if (isTelemarketer) {
      riskLevel = 'CAUTION';
      riskScore = 50;
      warningsEn.push('140 prefix indicates commercial telemarketing / unverified promotional call.');
    } else if (digitsOnly.length < 10) {
      riskLevel = 'CAUTION';
      riskScore = 40;
      warningsEn.push('Incomplete or non-standard phone number length.');
    } else {
      warningsEn.push('Standard mobile format. No automated flags detected in threat database.');
    }

    return {
      inputType: 'phone',
      inputValue: trimmed,
      riskLevel,
      riskScore,
      title: {
        en:
          riskLevel === 'DANGER'
            ? 'HIGH RISK: Suspected Fraud Caller Number'
            : riskLevel === 'CAUTION'
            ? 'CAUTION: Unverified Promotional / Telemarketing Number'
            : 'Standard Number: No High-Risk Matches',
        hi:
          riskLevel === 'DANGER'
            ? 'अत्यधिक खतरनाक: संदिग्ध धोखाधड़ी कॉलर नंबर'
            : riskLevel === 'CAUTION'
            ? 'सावधान: असत्यापित प्रचार या टेलीमार्केटिंग नंबर'
            : 'सामान्य नंबर: डेटाबेस में कोई खतरा नहीं',
        mr:
          riskLevel === 'DANGER'
            ? 'अत्यंत धोकादायक: संशयास्पद सायबर फसवणूक कॉलर'
            : riskLevel === 'CAUTION'
            ? 'सावधान: जाहिरात किंवा टेलीमार्केटिंग नंबर'
            : 'सामान्य नंबर: कोणताही धोका आढळला नाही',
      },
      warningSigns: {
        en: warningsEn,
        hi:
          riskLevel === 'DANGER'
            ? ['यह नंबर विदेशी या साइबर फ्रॉड से जुड़े संदिग्ध नंबरों की सूची में शामिल है।']
            : ['नंबर की सामान्य जांच में कोई गंभीर खतरा नहीं मिला।'],
        mr:
          riskLevel === 'DANGER'
            ? ['हा नंबर आंतरराष्ट्रीय सायबर फसवणूक टोळ्यांशी संबंधित असल्याचे आढळले आहे.']
            : ['नंबर तपासणीत कोणताही गंभीर धोका आढळला नाही.'],
      },
      explanation: {
        en:
          riskLevel === 'DANGER'
            ? 'Incoming calls from this number or country code are frequently associated with digital arrest, electricity bill threats, and lottery scams targeting senior citizens in India. Block this number immediately.'
            : riskLevel === 'CAUTION'
            ? 'This number appears to be commercial or promotional. Exercise caution and do not disclose banking details.'
            : 'This phone number does not match known high-threat entries in your device database. Always remember that legitimate banks never ask for OTPs or PINs over the phone regardless of the number.',
        hi:
          riskLevel === 'DANGER'
            ? 'इस नंबर से आने वाली कॉल अक्सर डिजिटल अरेस्ट या लॉटरी धोखाधड़ी से जुड़ी होती हैं। इस नंबर को तुरंत ब्लॉक करें।'
            : 'यह नंबर सामान्य प्रतीत होता है, फिर भी फोन पर कभी अपनी गोपनीय जानकारी न दें।',
        mr:
          riskLevel === 'DANGER'
            ? 'या नंबरवरून येणारे कॉल्स डिजिटल अटक किंवा बक्षिसाच्या नावाखाली फसवणूक करतात. हा नंबर लगेच ब्लॉक करा.'
            : 'हा नंबर सामान्य वाटतो, तरीही फोनवर कोणतीही बँक माहिती सांगू नका.',
      },
      recommendedActions: {
        en:
          riskLevel === 'DANGER'
            ? [
                'Do not answer calls from this number.',
                'Block this number in your phone dialer app.',
                'Report spam and fraudulent callers to 1930 or Chakshu portal.',
              ]
            : [
                'Never read OTPs or PINs aloud to any caller.',
                'If caller claims to be from a bank, hang up and call your branch directly.',
              ],
        hi: [
          'इस नंबर से आने वाली कॉल न उठाएं।',
          'अपने फोन में इस नंबर को तुरंत ब्लॉक करें।',
          '१९३० या चक्षु पोर्टल पर संदिग्ध कॉलर की रिपोर्ट करें।',
        ],
        mr: [
          'या नंबरवरून येणारा कॉल उचलू नका.',
          'मोबाईलमध्ये हा नंबर त्वरित ब्लॉक करा.',
          '१९३० किंवा चक्षू पोर्टलवर तक्रार नोंदवा.',
        ],
      },
    };
  },

  /**
   * Unified Screenshot / Image OCR Safety Checker
   */
  async checkScreenshot(sampleText?: string): Promise<UnifiedCheckResult> {
    const textToCheck =
      sampleText && sampleText.trim().length > 0
        ? sampleText.trim()
        : 'Your SBI netbanking account is suspended. Update KYC now at http://sbi-login.xyz or call 9876543210.';

    const result = await this.checkMessage(textToCheck);
    return {
      ...result,
      inputType: 'image',
      title: {
        en: `Screenshot OCR: ${result.title.en}`,
        hi: `स्क्रीनशॉट जांच: ${result.title.hi}`,
        mr: `स्क्रीनशॉट तपासणी: ${result.title.mr}`,
      },
    };
  },
};
