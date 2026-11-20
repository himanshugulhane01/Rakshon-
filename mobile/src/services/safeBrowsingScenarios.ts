export interface SafeBrowsingChoice {
  id: string;
  text: {
    en: string;
    hi: string;
    mr: string;
  };
  isSafe: boolean;
  explanation: {
    en: string;
    hi: string;
    mr: string;
  };
}

export interface SafeBrowsingScenario {
  id: string;
  title: {
    en: string;
    hi: string;
    mr: string;
  };
  displayedUrl: string;
  protocol: 'https' | 'http';
  domain: string;
  realDomain?: string;
  isLegitimate: boolean;
  pageType: 'bank_login' | 'government_portal' | 'prize_typo' | 'utility_bill';
  mockPage: {
    brandName: string;
    headline: {
      en: string;
      hi: string;
      mr: string;
    };
    body: {
      en: string;
      hi: string;
      mr: string;
    };
    warningFlag?: {
      en: string;
      hi: string;
      mr: string;
    };
  };
  keyTakeaway: {
    en: string;
    hi: string;
    mr: string;
  };
  choices: SafeBrowsingChoice[];
}

export const SAFE_BROWSING_SCENARIOS: SafeBrowsingScenario[] = [
  {
    id: 'sbi_phishing',
    title: {
      en: 'Scenario 1: Fake Bank Login & Spoofed Subdomain',
      hi: 'परिदृश्य १: फर्जी बैंक लॉगिन और नकली सबडोमेन',
      mr: 'परिदृश्य १: बनावट बँक लॉगिन आणि खोटा सबडोमेन',
    },
    displayedUrl: 'http://onlinesbi.login-portal.xyz/netbanking',
    protocol: 'http',
    domain: 'login-portal.xyz',
    realDomain: 'onlinesbi.sbi',
    isLegitimate: false,
    pageType: 'bank_login',
    mockPage: {
      brandName: 'State Bank NetBanking (SIMULATION)',
      headline: {
        en: 'Urgent KYC Verification Notice',
        hi: 'महत्वपूर्ण केवाईसी सत्यापन सूचना',
        mr: 'महत्त्वाची केवायसी पडताळणी सूचना',
      },
      body: {
        en: 'Your account access has been restricted. Enter your NetBanking username and password below to immediately restore access.',
        hi: 'आपका खाता प्रतिबंधित कर दिया गया है। सेवाएं बहाल करने के लिए नीचे यूजरनेम और पासवर्ड दर्ज करें।',
        mr: 'तुमचे बँक खाते प्रतिबंधित करण्यात आले आहे. सेवा पूर्ववत करण्यासाठी खाली यूजरनेम आणि पासवर्ड टाका.',
      },
      warningFlag: {
        en: '🚨 RED FLAGS: Unencrypted HTTP connection + fake .xyz domain pretending to be State Bank.',
        hi: '🚨 खतरे के संकेत: असुरक्षित HTTP कनेक्शन और स्टेट बैंक का ढोंग करने वाला .xyz डोमेन।',
        mr: '🚨 धोक्याचे इशारे: असुरक्षित HTTP कनेक्शन आणि स्टेट बँकेची नक्कल करणारा बनावट .xyz डोमेन.',
      },
    },
    keyTakeaway: {
      en: 'Always look at the real domain right before the final slash. "onlinesbi" here is just a trick prefix; the real domain is "login-portal.xyz". Real banks use .sbi or .bank.in.',
      hi: 'हमेशा अंतिम स्लैश से ठीक पहले का मुख्य डोमेन देखें। यहाँ असली डोमेन "login-portal.xyz" है। असली बैंक .sbi या .bank.in का उपयोग करते हैं।',
      mr: 'नेहमी स्लॅशच्या आधीचे मुख्य नाव पहा. येथे मुख्य डोमेन "login-portal.xyz" आहे. खरी बँक .sbi किंवा .bank.in वापरते.',
    },
    choices: [
      {
        id: 'unsafe_trust',
        text: {
          en: 'Yes, this looks like the bank because it says "onlinesbi" in the URL.',
          hi: 'हाँ, यह बैंक जैसा लग रहा है क्योंकि यूआरएल में "onlinesbi" लिखा है।',
          mr: 'होय, ही बँक वाटते कारण पत्त्यामध्ये "onlinesbi" लिहिले आहे.',
        },
        isSafe: false,
        explanation: {
          en: 'Dangerous Trap: Scammers put authentic bank names as subdomains (onlinesbi.something.xyz) to fool unsuspecting seniors.',
          hi: 'खतरनाक जाल: ठग वरिष्ठ नागरिकों को धोखा देने के लिए असली बैंक के नाम का सबडोमेन बनाते हैं।',
          mr: 'धोकादायक सापळा: भामटे दिशाभूल करण्यासाठी खऱ्या बँकेचे नाव सुरुवातीला जोडतात.',
        },
      },
      {
        id: 'safe_reject',
        text: {
          en: 'No! This website is fake with an insecure HTTP connection and a .xyz domain.',
          hi: 'नहीं! यह वेबसाइट फर्जी है, इसमें असुरक्षित HTTP और .xyz डोमेन है।',
          mr: 'नाही! ही बनावट वेबसाइट आहे, यात असुरक्षित HTTP आणि .xyz डोमेन आहे.',
        },
        isSafe: true,
        explanation: {
          en: 'Spot on! You noticed both the absence of HTTPS and the fake .xyz domain.',
          hi: 'बिल्कुल सही! आपने असुरक्षित कनेक्शन और फर्जी .xyz डोमेन दोनों को सही पहचाना।',
          mr: 'अगदी बरोबर! तुम्ही असुरक्षित कनेक्शन आणि बनावट डोमेन अचूक ओळखले.',
        },
      },
    ],
  },
  {
    id: 'incometax_authentic',
    title: {
      en: 'Scenario 2: Authentic Government Portal Verification',
      hi: 'परिदृश्य २: असली सरकारी पोर्टल की पहचान',
      mr: 'परिदृश्य २: अधिकृत शासकीय पोर्टलची पडताळणी',
    },
    displayedUrl: 'https://eportal.incometax.gov.in/iec/foservices/',
    protocol: 'https',
    domain: 'incometax.gov.in',
    isLegitimate: true,
    pageType: 'government_portal',
    mockPage: {
      brandName: 'Income Tax Department | Government of India',
      headline: {
        en: 'e-Filing Portal Services',
        hi: 'ई-फाइलिंग पोर्टल सेवाएं',
        mr: 'ई-फायलिंग पोर्टल सेवा',
      },
      body: {
        en: 'Welcome to the official Income Tax e-Filing portal. Check ITR status, file returns, and verify PAN safely with Government security standards.',
        hi: 'आधिकारिक आयकर ई-फाइलिंग पोर्टल में आपका स्वागत है। सरकारी सुरक्षा मानकों के साथ सुरक्षित रूप से रिटर्न फाइल करें।',
        mr: 'अधिकृत आयकर ई-फायलिंग पोर्टलवर आपले स्वागत आहे. शासकीय सुरक्षा मानकांनुसार सुरक्षितपणे काम करा.',
      },
    },
    keyTakeaway: {
      en: 'All genuine Indian government departments strictly end in ".gov.in" or ".nic.in" with a secure padlock (HTTPS).',
      hi: 'सभी असली भारतीय सरकारी विभाग अनिवार्य रूप से ".gov.in" या ".nic.in" पर समाप्त होते हैं और उन पर सुरक्षित ताले का निशान होता है।',
      mr: 'सर्व अधिकृत भारतीय शासकीय वेबसाइट्स ".gov.in" किंवा ".nic.in" ने संपतात आणि त्यावर सुरक्षित कुलपाचे चिन्ह असते.',
    },
    choices: [
      {
        id: 'safe_trust_gov',
        text: {
          en: 'Yes, this is safe! It uses https:// and an official .gov.in Indian Government domain.',
          hi: 'हाँ, यह सुरक्षित है! इसमें https:// और आधिकारिक .gov.in भारतीय सरकारी डोमेन है।',
          mr: 'होय, हे सुरक्षित आहे! यात https:// आणि अधिकृत .gov.in शासकीय डोमेन आहे.',
        },
        isSafe: true,
        explanation: {
          en: 'Correct! The ".gov.in" domain is legally restricted to legitimate Indian government authorities.',
          hi: 'बिल्कुल सही! ".gov.in" डोमेन केवल भारत सरकार के विभागों के लिए आरक्षित है।',
          mr: 'अगदी बरोबर! ".gov.in" डोमेन केवळ अधिकृत भारतीय शासकीय विभागांनाच दिले जाते.',
        },
      },
      {
        id: 'unsafe_reject_gov',
        text: {
          en: 'No, all online government portals are unsafe to use.',
          hi: 'नहीं, इंटरनेट पर सभी सरकारी पोर्टल असुरक्षित होते हैं।',
          mr: 'नाही, इंटरनेटवरील सर्व शासकीय पोर्टल्स असुरक्षित असतात.',
        },
        isSafe: false,
        explanation: {
          en: 'Not quite: Verifying the .gov.in domain and HTTPS ensures you are using the genuine, protected government portal.',
          hi: 'गलत: .gov.in डोमेन और HTTPS की जांच आपको असली सरकारी सेवाओं का सुरक्षित उपयोग करने में मदद करती है।',
          mr: 'चूक: .gov.in आणि HTTPS तपासून तुम्ही अधिकृत शासकीय सेवा सुरक्षितपणे वापरू शकता.',
        },
      },
    ],
  },
  {
    id: 'amazon_typosquatting',
    title: {
      en: 'Scenario 3: Typo-Squatted Festival Prize Offer',
      hi: 'परिदृश्य ३: वर्तनी में हेरफेर कर बनाई गई फर्जी शॉपिंग साइट',
      mr: 'परिदृश्य ३: स्पेलिंगमध्ये बदल करून बनवलेली बनावट शॉपिंग साइट',
    },
    displayedUrl: 'http://amaz0n-festival-sale.co/free-iphone',
    protocol: 'http',
    domain: 'amaz0n-festival-sale.co',
    realDomain: 'amazon.in',
    isLegitimate: false,
    pageType: 'prize_typo',
    mockPage: {
      brandName: 'Great Indian Festival Lucky Draw (SIMULATION)',
      headline: {
        en: 'Congratulations! You Won an iPhone 16!',
        hi: 'बधाई हो! आपने आईफोन १६ जीता है!',
        mr: 'अभिनंदन! तुम्ही आयफोन १६ जिंकला आहे!',
      },
      body: {
        en: 'You are our 10,000th lucky visitor today! Enter your credit card or debit card details to pay ₹99 courier charges and claim your gift.',
        hi: 'आप हमारे १०,०००वें भाग्यशाली आगंतुक हैं! ९९ रुपये कूरियर शुल्क देने के लिए अपने कार्ड का विवरण दर्ज करें।',
        mr: 'तुम्ही आमचे १०,००० वे भाग्यवान विजेते आहात! ९९ रुपये कुरिअर शुल्क भरण्यासाठी तुमच्या कार्डचा तपशील टाका.',
      },
      warningFlag: {
        en: '🚨 RED FLAGS: "amaz0n" replaces "o" with zero "0", hyphenated name, unencrypted HTTP, advance fee demand.',
        hi: '🚨 खतरे के संकेत: "amaz0n" में अक्षर "o" की जगह शून्य "0" है, असुरक्षित HTTP और कार्ड विवरण की मांग।',
        mr: '🚨 धोक्याचे इशारे: "amaz0n" मध्ये "o" ऐवजी शून्य "0" आहे, असुरक्षित HTTP आणि कार्ड माहितीची मागणी.',
      },
    },
    keyTakeaway: {
      en: 'Fraudsters regularly register "typo" domains (amaz0n, flipkaart) that trick the quick eye. Always check spelling and never enter card numbers for "free" prizes.',
      hi: 'धोखेबाज स्पेलिंग में थोड़ा सा बदलाव (amaz0n, flipkaart) करके फर्जी साइट बनाते हैं। हमेशा स्पेलिंग ध्यान से देखें।',
      mr: 'भामटे स्पेलिंगमध्ये बारीक बदल करून डोमेन नोंदवतात. स्पेलिंग नेहमी काळजीपूर्वक तपासा.',
    },
    choices: [
      {
        id: 'unsafe_spin',
        text: {
          en: 'Yes, ₹99 is a small amount, so I will enter my card to get the phone.',
          hi: 'हाँ, ९९ रुपये बहुत कम हैं, इसलिए मैं फोन पाने के लिए कार्ड नंबर डालूंगा।',
          mr: 'होय, ९९ रुपये कमी आहेत, म्हणून मी फोन मिळवण्यासाठी कार्ड माहिती टाकेन.',
        },
        isSafe: false,
        explanation: {
          en: 'Severe Risk: The scammers will steal your full debit/credit card details and drain thousands from your bank.',
          hi: 'गंभीर खतरा: ठग आपके कार्ड का पूरा विवरण चुराकर खाते से हजारों रुपये निकाल लेंगे।',
          mr: 'मोठा धोका: भामटे तुमच्या कार्डची सर्व माहिती चोरून खात्यातील हजारो रुपये लंपास करतील.',
        },
      },
      {
        id: 'safe_spot_typo',
        text: {
          en: 'No! The address has a typo ("amaz0n" with a zero) and is completely fake.',
          hi: 'नहीं! पते में स्पेलिंग की गलती है ("amaz0n" में शून्य है) और यह फर्जी है।',
          mr: 'नाही! पत्त्यामध्ये स्पेलिंगची चूक आहे ("amaz0n" मध्ये शून्य आहे) आणि ही फसवणूक आहे.',
        },
        isSafe: true,
        explanation: {
          en: 'Excellent eyesight! You caught the zero "0" in the domain and refused to expose your card.',
          hi: 'बहुत खूब! आपने डोमेन में शून्य "0" को पहचान लिया और अपने कार्ड को सुरक्षित रखा।',
          mr: 'उत्कृष्ट नजर! तुम्ही डोमेन मधील शून्य "0" ओळखला आणि तुमचे कार्ड सुरक्षित ठेवले.',
        },
      },
    ],
  },
  {
    id: 'electricity_bill_phishing',
    title: {
      en: 'Scenario 4: Fake Electricity Bill Payment Gateway',
      hi: 'परिदृश्य ४: बिजली बिल भुगतान का फर्जी पोर्टल',
      mr: 'परिदृश्य ४: वीज बिल भरण्याचे बनावट पोर्टल',
    },
    displayedUrl: 'http://mahadiscom-billpay.biz/quickpay',
    protocol: 'http',
    domain: 'mahadiscom-billpay.biz',
    realDomain: 'mahadiscom.in',
    isLegitimate: false,
    pageType: 'utility_bill',
    mockPage: {
      brandName: 'Electricity QuickPay Portal (SIMULATION)',
      headline: {
        en: 'Disconnection Warning Notice',
        hi: 'बिजली कनेक्शन काटने की अंतिम चेतावनी',
        mr: 'वीज पुरवठा खंडित करण्याची अंतिम नोटीस',
      },
      body: {
        en: 'Unpaid Bill Amount: ₹1,420. Power will be disconnected at 8:00 PM tonight. Pay immediately using NetBanking or Debit Card.',
        hi: 'बकाया बिल राशि: १,४२० रुपये। आज रात ८:०० बजे बिजली काट दी जाएगी। नेट बैंकिंग या डेबिट कार्ड से तुरंत भुगतान करें।',
        mr: 'थकबाकी बिल रक्कम: १,४२० रुपये. आज रात्री ८:०० वाजता वीज खंडित केली जाईल. त्वरित पेमेंट करा.',
      },
      warningFlag: {
        en: '🚨 RED FLAGS: .biz domain, unencrypted connection, urgent night disconnection threat.',
        hi: '🚨 खतरे के संकेत: .biz डोमेन, असुरक्षित कनेक्शन, रात में बिजली काटने की झूठी धमकी।',
        mr: '🚨 धोक्याचे इशारे: .biz डोमेन, असुरक्षित कनेक्शन आणि रात्री वीज तोडण्याची धमकी.',
      },
    },
    keyTakeaway: {
      en: 'Never pay utility bills through links sent in SMS messages. Always pay inside your authorized electricity board app or trusted UPI app.',
      hi: 'एसएमएस में आए लिंक से कभी भी बिजली का बिल न भरें। हमेशा अपने अधिकृत बिजली बोर्ड ऐप से ही भुगतान करें।',
      mr: 'एसएमएसमधील लिंकवरून कधीही वीज बिल भरू नका. नेहमी अधिकृत वीज कंपनीच्या ॲपमधूनच बिल भरा.',
    },
    choices: [
      {
        id: 'unsafe_pay_bill',
        text: {
          en: 'Pay immediately on this page to prevent power from being cut tonight.',
          hi: 'बिजली कटने से बचने के लिए इस पेज पर तुरंत भुगतान करें।',
          mr: 'वीज जाऊ नये म्हणून या पेजवर त्वरित पेमेंट करा.',
        },
        isSafe: false,
        explanation: {
          en: 'Dangerous Trap: Electricity fraud is rampant in India. This fake site steals banking logins and card credentials.',
          hi: 'खतरनाक जाल: भारत में बिजली बिल के नाम पर बहुत धोखाधड़ी होती है। यह फर्जी साइट आपके बैंकिंग क्रेडेंशियल चुरा लेती है।',
          mr: 'धोकादायक सापळा: वीज बिलाच्या नावाखाली ही मोठी फसवणूक आहे. ही साइट तुमची बँक माहिती चोरते.',
        },
      },
      {
        id: 'safe_reject_bill',
        text: {
          en: 'Do not pay here. Check your bill in the official electricity app or physical bill.',
          hi: 'यहाँ भुगतान न करें। आधिकारिक बिजली ऐप या पिछले बिल की रसीद से जांच करें।',
          mr: 'येथे पैसे भरू नका. अधिकृत वीज ॲपवरून किंवा जुन्या बिलावरून खात्री करा.',
        },
        isSafe: true,
        explanation: {
          en: 'Outstanding judgment! You resisted the panic tactic and preserved your finances.',
          hi: 'शानदार निर्णय! आप डर के दबाव में नहीं आए और अपने पैसे सुरक्षित रखे।',
          mr: 'उत्तम निर्णय! तुम्ही भीतीपोटी निर्णय न घेता तुमचे पैसे सुरक्षित ठेवले.',
        },
      },
    ],
  },
];

