export interface LearningQuizOption {
  id: string;
  text: {
    en: string;
    hi: string;
    mr: string;
  };
  isCorrect: boolean;
  explanation: {
    en: string;
    hi: string;
    mr: string;
  };
}

export interface LearningModuleSlide {
  slideNumber: number;
  headline: {
    en: string;
    hi: string;
    mr: string;
  };
  content: {
    en: string;
    hi: string;
    mr: string;
  };
  tip: {
    en: string;
    hi: string;
    mr: string;
  };
  speechScript: {
    en: string;
    hi: string;
    mr: string;
  };
}

export interface LearningModule {
  id: string;
  icon: string;
  badge: string;
  estimatedMinutes: number;
  title: {
    en: string;
    hi: string;
    mr: string;
  };
  subtitle: {
    en: string;
    hi: string;
    mr: string;
  };
  slides: LearningModuleSlide[];
  goldenRule: {
    en: string;
    hi: string;
    mr: string;
  };
  quiz: {
    question: {
      en: string;
      hi: string;
      mr: string;
    };
    options: LearningQuizOption[];
  };
}

export const AUDIO_VISUAL_MODULES: LearningModule[] = [
  {
    id: 'kyc_update',
    icon: '💳',
    badge: 'Banking Safety',
    estimatedMinutes: 3,
    title: {
      en: 'KYC Update Scams',
      hi: 'केवाईसी अपडेट धोखाधड़ी',
      mr: 'केवायसी अपडेट फसवणूक',
    },
    subtitle: {
      en: 'Learn how scammers use fake KYC expiry warnings to drain bank accounts',
      hi: 'जानें कि धोखेबाज फर्जी केवाईसी समाप्ति की चेतावनी देकर खाते कैसे खाली करते हैं',
      mr: 'बनावट केवायसी समाप्तीची भीती दाखवून बँक खाते कसे लुटले जाते ते शिका',
    },
    goldenRule: {
      en: 'Banks NEVER update KYC through links in SMS or WhatsApp. Visit your official bank branch in person.',
      hi: 'बैंक कभी भी एसएमएस या व्हाट्सएप लिंक से केवाईसी अपडेट नहीं करते। हमेशा अपनी बैंक शाखा में जाएं।',
      mr: 'बँक कधीही एसएमएस किंवा व्हॉट्सॲप लिंकद्वारे केवायसी अपडेट करत नाही. प्रत्यक्ष बँकेच्या शाखेत जा.',
    },
    slides: [
      {
        slideNumber: 1,
        headline: {
          en: 'The Threat: Fake Account Deactivation Message',
          hi: 'धमकी: बैंक खाता बंद होने का फर्जी संदेश',
          mr: 'धमकी: बँक खाते बंद होण्याचा बनावट मेसेज',
        },
        content: {
          en: 'You receive an SMS: "Dear Customer, your bank account will be blocked within 24 hours due to pending KYC. Click link to update immediately."',
          hi: 'आपको एक एसएमएस मिलता है: "प्रिय ग्राहक, केवाईसी लंबित होने के कारण आपका बैंक खाता 24 घंटे में ब्लॉक कर दिया जाएगा। तुरंत अपडेट करने के लिए लिंक पर क्लिक करें।"',
          mr: 'तुम्हाला मेसेज येतो: "प्रिय ग्राहक, केवायसी प्रलंबित असल्याने तुमचे बँक खाते २४ तासांत ब्लॉक होईल. त्वरित अपडेटसाठी लिंकवर क्लिक करा."',
        },
        tip: {
          en: 'Notice the false urgency: Scammers give a 24-hour deadline to create panic and stop you from verifying.',
          hi: 'झूठी जल्दबाजी पर ध्यान दें: धोखेबाज घबराहट पैदा करने के लिए २४ घंटे की समय सीमा देते हैं।',
          mr: 'बनावट घाई लक्षात घ्या: घाबरवून विचार न करता निर्णय घेण्यासाठी भामटे २४ तासांची मुदत देतात.',
        },
        speechScript: {
          en: 'Lesson 1: KYC Update Scams. Scammers send messages claiming your bank account will be blocked within 24 hours. They want you to panic and tap an unsafe link. Real banks never block your account over an SMS.',
          hi: 'पाठ १: केवाईसी अपडेट धोखाधड़ी। ठग संदेश भेजते हैं कि आपका बैंक खाता चौबीस घंटे में बंद हो जाएगा। वे आपको डराकर गलत लिंक पर क्लिक करवाना चाहते हैं। असली बैंक कभी एसएमएस पर खाता ब्लॉक नहीं करते।',
          mr: 'धडा १: केवायसी अपडेट फसवणूक. फसवणूक करणारे तुमचे खाते २४ तासांत बंद होईल असा मेसेज पाठवून घाबरवतात. खरी बँक कधीही अशा मेसेजवरून खाते ब्लॉक करत नाही.',
        },
      },
      {
        slideNumber: 2,
        headline: {
          en: 'The Safe Habit: Always Visit Your Branch',
          hi: 'सुरक्षित आदत: हमेशा अपनी बैंक शाखा में जाएं',
          mr: 'सुरक्षित सवय: नेहमी अधिकृत बँक शाखेत जा',
        },
        content: {
          en: 'Never click links sent via SMS. If you are unsure about your KYC status, visit your nearest bank branch or call the official number on the back of your debit card.',
          hi: 'एसएमएस में आए लिंक पर कभी क्लिक न करें। यदि आपको संदेह है, तो अपनी नजदीकी बैंक शाखा में जाएं या अपने डेबिट कार्ड के पीछे दिए गए नंबर पर कॉल करें।',
          mr: 'एसएमएसमधील लिंकवर कधीही क्लिक करू नका. शंका असल्यास जवळच्या बँक शाखेत जा किंवा डेबिट कार्डच्या पाठीमागील नंबरवर संपर्क करा.',
        },
        tip: {
          en: 'Real bank managers will never ask you to download any app like AnyDesk or QuickSupport for KYC.',
          hi: 'असली बैंक कर्मचारी कभी भी केवाईसी के लिए एनीडेस्क जैसा कोई ऐप डाउनलोड करने को नहीं कहते।',
          mr: 'खरे बँक अधिकारी केवायसीसाठी AnyDesk सारखे ॲप डाऊनलोड करायला सांगत नाहीत.',
        },
        speechScript: {
          en: 'Slide 2: Safe habits. Never click links in SMS messages. If you receive a KYC notice, verify it in person at your bank branch or call the customer care number printed on your debit card.',
          hi: 'स्लाइड २: सुरक्षित आदत। संदेश में दिए लिंक पर कभी क्लिक न करें। अगर केवाईसी का मैसेज आए तो सीधे बैंक जाएं या डेबिट कार्ड पर लिखे नंबर पर बात करें।',
          mr: 'स्लाइड २: सुरक्षित सवय. मेसेजमधील लिंकवर क्लिक करू नका. केवायसीची नोटीस आल्यास थेट शाखेत जा किंवा डेबिट कार्डवरील नंबरवर कॉल करा.',
        },
      },
    ],
    quiz: {
      question: {
        en: 'You receive an SMS saying your bank account will be closed today unless you click a link to update KYC. What should you do?',
        hi: 'आपको एक एसएमएस मिलता है कि केवाईसी लिंक पर क्लिक न करने पर आपका खाता आज बंद हो जाएगा। आपको क्या करना चाहिए?',
        mr: 'केवायसी लिंकवर क्लिक न केल्यास खाते आज बंद होईल असा मेसेज आला तर तुम्ही काय कराल?',
      },
      options: [
        {
          id: 'opt1',
          text: {
            en: 'Ignore the link and check with your bank branch in person.',
            hi: 'लिंक को अनदेखा करें और स्वयं बैंक शाखा जाकर जांच करें।',
            mr: 'लिंककडे दुर्लक्ष करा आणि स्वतः बँक शाखेत जाऊन खात्री करा.',
          },
          isCorrect: true,
          explanation: {
            en: 'Correct! Banks never require instant online updates via unverified SMS links.',
            hi: 'बिल्कुल सही! बैंक कभी भी एसएमएस लिंक के माध्यम से तत्काल अपडेट की मांग नहीं करते।',
            mr: 'अगदी बरोबर! बँक कधीही अनोळखी मेसेज लिंकवरून त्वरित अपडेट मागत नाही.',
          },
        },
        {
          id: 'opt2',
          text: {
            en: 'Click the link immediately to prevent account suspension.',
            hi: 'खाता बंद होने से बचाने के लिए तुरंत लिंक पर क्लिक करें।',
            mr: 'खाते बंद होऊ नये म्हणून लगेच लिंकवर क्लिक करा.',
          },
          isCorrect: false,
          explanation: {
            en: 'Unsafe: Clicking the link opens a phishing website designed to steal your credentials.',
            hi: 'असुरक्षित: लिंक पर क्लिक करने से फर्जी वेबसाइट खुलती है जो आपकी जानकारी चुराती है।',
            mr: 'धोकादायक: ही बनावट वेबसाइट असते जी तुमची बँक खात्याची माहिती चोरते.',
          },
        },
      ],
    },
  },
  {
    id: 'otp_theft',
    icon: '🔐',
    badge: 'Credential Safety',
    estimatedMinutes: 3,
    title: {
      en: 'OTP & Password Safety',
      hi: 'ओटीपी और पासवर्ड सुरक्षा',
      mr: 'ओटीपी आणि पासवर्ड सुरक्षा',
    },
    subtitle: {
      en: 'Why One-Time Passwords are keys to your money and must never be shared verbally',
      hi: 'ओटीपी आपके धन की चाबी है, इसे कभी भी किसी को बोलकर न बताएं',
      mr: 'ओटीपी ही तुमच्या पैशांची चावी आहे, कोणाशीही शेअर करू नका',
    },
    goldenRule: {
      en: 'An OTP is strictly for YOUR eyes only. Bank staff, police, and family will never ask you to read it aloud.',
      hi: 'ओटीपी केवल आपकी आँखों के लिए है। बैंक कर्मचारी, पुलिस या कोई भी इसे पूछने का अधिकार नहीं रखता।',
      mr: 'ओटीपी फक्त तुमच्यासाठी असतो. बँक कर्मचारी किंवा पोलिस कधीही फोनवर ओटीपी मागत नाहीत.',
    },
    slides: [
      {
        slideNumber: 1,
        headline: {
          en: 'What is an OTP Really For?',
          hi: 'ओटीपी वास्तव में किसलिए होता है?',
          mr: 'ओटीपी नेमका कशासाठी असतो?',
        },
        content: {
          en: 'OTP stands for One-Time Password. It authorizes money to leave your account or changes your account password. An OTP is never needed to receive money.',
          hi: 'ओटीपी का अर्थ है वन-टाइम पासवर्ड। यह आपके खाते से पैसे भेजने या पासवर्ड बदलने की अनुमति देता है। पैसे प्राप्त करने के लिए ओटीपी की कभी आवश्यकता नहीं होती।',
          mr: 'ओटीपी म्हणजे वन-टाइम पासवर्ड. हा तुमच्या खात्यातून पैसे पाठवण्यासाठी किंवा पासवर्ड बदलण्यासाठी असतो. पैसे मिळण्यासाठी ओटीपी कधीच लागत नाही.',
        },
        tip: {
          en: 'Read the full SMS: The message always states the exact amount being debited.',
          hi: 'पूरा एसएमएस पढ़ें: संदेश में हमेशा कटने वाली सही राशि लिखी होती है।',
          mr: 'पूर्ण एसएमएस वाचा: मेसेजमध्ये नेहमी खात्यातून कट होणारी रक्कम स्पष्ट लिहिलेली असते.',
        },
        speechScript: {
          en: 'Lesson 2: OTP Safety. An OTP is a digital key that authorizes money to leave your account. Fraudsters will call asking for this code under various pretexts. Remember, sharing your OTP means giving away your money.',
          hi: 'पाठ २: ओटीपी सुरक्षा। ओटीपी एक डिजिटल चाबी है जिससे आपके खाते से पैसे कटते हैं। धोखेबाज बहाने बनाकर यह कोड मांगते हैं। याद रखें, ओटीपी बताना मतलब अपने पैसे गंवाना।',
          mr: 'धडा २: ओटीपी सुरक्षा. ओटीपी ही डिजिटल चावी आहे ज्याने तुमच्या खात्यातून पैसे बाहेर जातात. भामटे विविध कारणे सांगून हा कोड मागतात. ओटीपी कधीही कोणाला सांगू नका.',
        },
      },
    ],
    quiz: {
      question: {
        en: 'A caller claiming to be from your electricity company says they need your OTP to stop power disconnection. Should you share it?',
        hi: 'बिजली कंपनी का कर्मचारी बनकर कॉल करने वाला बिजली कटने से रोकने के लिए ओटीपी मांगता है। क्या आपको बताना चाहिए?',
        mr: 'वीज कंपनीचा अधिकारी बोलत असल्याचे सांगून वीज पुरवठा खंडित न होण्यासाठी ओटीपी मागितल्यास तुम्ही काय कराल?',
      },
      options: [
        {
          id: 'opt1',
          text: {
            en: 'Never share the OTP under any circumstances.',
            hi: 'किसी भी परिस्थिति में ओटीपी कभी साझा न करें।',
            mr: 'कोणत्याही परिस्थितीत ओटीपी कधीही शेअर करू नका.',
          },
          isCorrect: true,
          explanation: {
            en: 'Spot on! Utility companies never require OTPs over the phone to prevent disconnections.',
            hi: 'बिल्कुल सही! बिजली विभाग कभी भी फोन पर ओटीपी नहीं मांगता।',
            mr: 'अगदी बरोबर! वीज वितरण कार्यालय फोनवर असा ओटीपी मागत नाही.',
          },
        },
        {
          id: 'opt2',
          text: {
            en: 'Share it quickly so power is not cut off.',
            hi: 'जल्दी से बता दें ताकि बिजली न कटे।',
            mr: 'वीज जाऊ नये म्हणून पटकन सांगा.',
          },
          isCorrect: false,
          explanation: {
            en: 'Dangerous: Sharing the OTP allows the criminal to debit money from your account immediately.',
            hi: 'खतरनाक: ओटीपी साझा करने से धोखेबाज आपके खाते से पैसे निकाल लेगा।',
            mr: 'धोकादायक: ओटीपी सांगताच तुमच्या खात्यातून पैसे चोरी होतील.',
          },
        },
      ],
    },
  },
  {
    id: 'lottery_prize',
    icon: '🎁',
    badge: 'Fraud Awareness',
    estimatedMinutes: 2,
    title: {
      en: 'Lottery & Prize Scams',
      hi: 'लॉटरी और ईनाम धोखाधड़ी',
      mr: 'लॉटरी आणि बक्षीस फसवणूक',
    },
    subtitle: {
      en: 'Recognize fake KBC prizes, car lotteries, and advance-fee demands',
      hi: 'केबीसी लॉटरी और उपहार के नाम पर होने वाले धोखे को पहचानें',
      mr: 'केबीसी लॉटरी आणि बक्षीसांच्या नावाखाली होणाऱ्या फसवणुकीपासून सावध राहा',
    },
    goldenRule: {
      en: 'You cannot win a lottery you never bought a ticket for. Genuine prizes NEVER ask for advance processing fees.',
      hi: 'जिस लॉटरी का टिकट आपने नहीं खरीदा, उसे आप कभी नहीं जीत सकते। असली ईनाम में कोई अग्रिम शुल्क नहीं लगता।',
      mr: 'ज्याची लॉटरी तुम्ही खरेदीच केली नाही ती जिंकणे अशक्य आहे. खरी बक्षिसे कधीही आधी पैसे मागत नाहीत.',
    },
    slides: [
      {
        slideNumber: 1,
        headline: {
          en: 'The Golden Rule of Lotteries',
          hi: 'लॉटरी का सुनहरा नियम',
          mr: 'लॉटरीचा सुवर्ण नियम',
        },
        content: {
          en: 'Scammers send WhatsApp letters with official-looking logos claiming you won ₹25 Lakhs in KBC or a car lottery. They ask for ₹5,000 for "GST and processing charges".',
          hi: 'ठग व्हाट्सएप पर फर्जी लेटर भेजते हैं कि आपने केबीसी में २५ लाख जीते हैं। वे "जीएसटी और फाइल चार्ज" के नाम पर ५,००० रुपये मांगते हैं।',
          mr: 'भामटे व्हॉट्सॲपवर लेटर पाठवतात की तुम्ही केबीसीमध्ये २५ लाख जिंकले आहेत आणि जीएसटीसाठी ५,००० रुपये मागायला सांगतात.',
        },
        tip: {
          en: 'Any demand to pay money to receive a prize is 100% fraud.',
          hi: 'ईनाम पाने के लिए पहले पैसे देने की कोई भी मांग १००% धोखाधड़ी है।',
          mr: 'बक्षीस मिळवण्यासाठी आधी पैसे मागणे ही १००% फसवणूक असते.',
        },
        speechScript: {
          en: 'Lesson 3: Lottery Scams. If you receive an alert saying you won a lottery or car, ask yourself: Did I buy a ticket? No genuine organization asks for advance fees to release prize money.',
          hi: 'पाठ ३: लॉटरी धोखाधड़ी। अगर आपको लॉटरी जीतने का संदेश आए, तो सोचें: क्या मैंने टिकट खरीदा था? कोई भी असली संस्था ईनाम देने के लिए पहले पैसे नहीं मांगती।',
          mr: 'धडा ३: लॉटरी फसवणूक. जर तुम्हाला लॉटरी लागल्याचा मेसेज आला तर विचार करा: मी तिकीट खरेदी केले होते का? खरी बक्षिसे कधीही आधी पैसे मागत नाहीत.',
        },
      },
    ],
    quiz: {
      question: {
        en: 'A WhatsApp message with a KBC logo says you won ₹25 Lakhs, but you must pay ₹4,500 tax first. What should you do?',
        hi: 'व्हाट्सएप पर एक संदेश आता है कि आपने २५ लाख जीते हैं, लेकिन पहले ४,५०० रुपये टैक्स देना होगा। आप क्या करेंगे?',
        mr: 'व्हॉट्सॲपवर मेसेज आला की तुम्ही २५ लाख जिंकलेत, पण आधी ४,५०० रुपये टॅक्स भरावा लागेल. तुम्ही काय कराल?',
      },
      options: [
        {
          id: 'opt1',
          text: {
            en: 'Delete the message and block the sender. It is completely fake.',
            hi: 'संदेश हटाएं और नंबर ब्लॉक करें। यह पूरी तरह से फर्जी है।',
            mr: 'मेसेज डिलीट करा आणि नंबर ब्लॉक करा. ही पूर्णपणे फसवणूक आहे.',
          },
          isCorrect: true,
          explanation: {
            en: 'Correct! Advance fee fraud is among the most common scams targeting seniors.',
            hi: 'बिल्कुल सही! ईनाम के नाम पर पैसे मांगना वरिष्ठ नागरिकों को ठगने का आम तरीका है।',
            mr: 'अगदी बरोबर! आधी पैसे मागणे हा ज्येष्ठांना फसवण्याचा नेहमीचा मार्ग आहे.',
          },
        },
        {
          id: 'opt2',
          text: {
            en: 'Transfer ₹4,500 to claim the ₹25 Lakhs.',
            hi: '२५ लाख पाने के लिए ४,५०० रुपये ट्रांसफर करें।',
            mr: '२५ लाख मिळवण्यासाठी ४,५०० रुपये पाठवा.',
          },
          isCorrect: false,
          explanation: {
            en: 'Unsafe: You will lose the ₹4,500 and the scammer will demand even more money.',
            hi: 'असुरक्षित: आपके ४,५०० रुपये डूब जाएंगे और ठग और अधिक पैसों की मांग करेगा।',
            mr: 'धोकादायक: तुमचे ४,५०० रुपये जातील आणि भामटा आणखी पैसे मागेल.',
          },
        },
      ],
    },
  },
  {
    id: 'upi_fraud',
    icon: '⚡',
    badge: 'UPI Safety',
    estimatedMinutes: 3,
    title: {
      en: 'UPI Payment Fraud & Collect Requests',
      hi: 'यूपीआई भुगतान धोखाधड़ी',
      mr: 'यूपीआय पेमेंट फसवणूक',
    },
    subtitle: {
      en: 'Remember the golden rule: Entering your UPI PIN ALWAYS sends money',
      hi: 'याद रखें: यूपीआई पिन दर्ज करने से हमेशा पैसे कटते हैं, आते नहीं',
      mr: 'लक्षात ठेवा: यूपीआय पिन टाकल्याने नेहमी पैसे जातात, येत नाहीत',
    },
    goldenRule: {
      en: 'You NEVER enter a UPI PIN to receive money. To receive funds, you only share your mobile number or QR code.',
      hi: 'पैसे प्राप्त करने के लिए कभी भी यूपीआई पिन दर्ज नहीं किया जाता। केवल मोबाइल नंबर या क्यूआर कोड दिया जाता है।',
      mr: 'पैसे मिळण्यासाठी कधीही यूपीआय पिन टाकावा लागत नाही. फक्त तुमचा मोबाईल नंबर पुरेशा असतो.',
    },
    slides: [
      {
        slideNumber: 1,
        headline: {
          en: 'How the Collect Request Trap Works',
          hi: 'कलेक्ट रिक्वेस्ट का जाल कैसे काम करता है',
          mr: 'कलेक्ट रिक्वेस्टची फसवणूक कशी होते',
        },
        content: {
          en: 'A buyer on OLX agrees to buy your item and sends a payment request on PhonePe, GPay, or Paytm saying: "Accept this and enter PIN to receive money in your account."',
          hi: 'कोई खरीदार आपको फोनपे या गूगलपे पर कलेक्ट रिक्वेस्ट भेजता है और कहता है: "इसे स्वीकार करें और पैसे पाने के लिए अपना पिन डालें।"',
          mr: 'खरेदीदार फोनपे किंवा गुगलपेवर कलेक्ट रिक्वेस्ट पाठवून सांगतो: "ही रिक्वेस्ट स्वीकार करा आणि पैसे खात्यात येण्यासाठी पिन टाका."',
        },
        tip: {
          en: 'The moment you enter your 4 or 6-digit PIN, your bank transfers the money to the scammer.',
          hi: 'जैसे ही आप अपना ४ या ६ अंकों का पिन डालते हैं, पैसे आपके खाते से तुरंत कट जाते हैं।',
          mr: 'तुम्ही ४ किंवा ६ अंकी पिन टाकताच तुमच्या खात्यातून पैसे भामट्याच्या खात्यात जमा होतात.',
        },
        speechScript: {
          en: 'Lesson 4: UPI Collect Requests. The most common UPI trap in India involves fraudsters claiming you must enter your PIN to receive money. Always remember: You only enter your PIN when YOU want to PAY.',
          hi: 'पाठ ४: यूपीआई कलेक्ट रिक्वेस्ट। भारत में सबसे आम धोखा यह है कि पैसे पाने के लिए पिन डालने को कहा जाता है। हमेशा याद रखें: पिन केवल पैसे भेजते समय डाला जाता है।',
          mr: 'धडा ४: यूपीआय कलेक्ट रिक्वेस्ट. पैसे मिळवण्यासाठी पिन टाकावा लागतो हा मोठा गैरसमज आहे. लक्षात ठेवा: जेव्हा तुम्हाला स्वतः पैसे पाठवायचे असतात, तेव्हाच पिन टाकला जातो.',
        },
      },
    ],
    quiz: {
      question: {
        en: 'A person promises to send you ₹5,000 and asks you to enter your UPI PIN to accept it. What will happen if you enter your PIN?',
        hi: 'एक व्यक्ति आपको ५,००० रुपये भेजने का वादा करता है और स्वीकार करने के लिए पिन डालने को कहता है। पिन डालने पर क्या होगा?',
        mr: 'एका व्यक्तीने ५,००० पाठवण्याचे आश्वासन दिले आणि स्वीकारण्यासाठी यूपीआय पिन टाकण्यास सांगितले. पिन टाकल्यास काय होईल?',
      },
      options: [
        {
          id: 'opt1',
          text: {
            en: '₹5,000 will be DEDUCTED from your bank account.',
            hi: 'आपके खाते से ५,००० रुपये कट जाएंगे।',
            mr: 'तुमच्या बँक खात्यातून ५,००० रुपये कापले जातील.',
          },
          isCorrect: true,
          explanation: {
            en: 'Exactly right! Entering your PIN always authorizes a debit.',
            hi: 'बिल्कुल सही! पिन डालने का मतलब हमेशा पैसे कटना होता है।',
            mr: 'अगदी बरोबर! पिन टाकणे म्हणजे खात्यातून पैसे जाणे.',
          },
        },
        {
          id: 'opt2',
          text: {
            en: '₹5,000 will be credited safely into your account.',
            hi: '५,००० रुपये सुरक्षित रूप से आपके खाते में आ जाएंगे।',
            mr: '५,००० रुपये सुरक्षितपणे खात्यात जमा होतील.',
          },
          isCorrect: false,
          explanation: {
            en: 'Dangerous mistake: PIN stands for Personal Identification Number to spend money, never to receive it.',
            hi: 'गंभीर भूल: पिन खर्च करने के लिए होता है, प्राप्त करने के लिए नहीं।',
            mr: 'मोठी चूक: पिन पैसे खर्च करण्यासाठी असतो, मिळवण्यासाठी नाही.',
          },
        },
      ],
    },
  },
  {
    id: 'fake_officer',
    icon: '👮',
    badge: 'Impersonation',
    estimatedMinutes: 3,
    title: {
      en: 'Fake Bank Officer & Police Calls',
      hi: 'फर्जी बैंक अधिकारी और पुलिस कॉल',
      mr: 'बनावट बँक अधिकारी आणि पोलिस कॉल',
    },
    subtitle: {
      en: 'How to handle high-pressure callers claiming your account is under legal investigation',
      hi: 'खाते की जांच का दावा करने वाले फर्जी कॉलों से कैसे निपटें',
      mr: 'खात्यावर कारवाईची भीती दाखवणाऱ्या खोट्या कॉल्सपासून सावध राहा',
    },
    goldenRule: {
      en: 'Police and CBI officers NEVER demand money transfers or conduct criminal trials over phone or video calls.',
      hi: 'पुलिस या सीबीआई कभी भी फोन या वीडियो कॉल पर पैसे ट्रांसफर करने की मांग नहीं करती।',
      mr: 'पोलिस किंवा सीबीआय कधीही फोनवर पैसे ट्रान्सफर करायला सांगत नाहीत.',
    },
    slides: [
      {
        slideNumber: 1,
        headline: {
          en: 'The Threat: Legal Intimidation',
          hi: 'धमकी: कानूनी कार्रवाई का डर',
          mr: 'धमकी: कायदेशीर कारवाईची भीती',
        },
        content: {
          en: 'You get a phone call from a stern voice claiming to be an IPS Officer or CBI Director: "Your Aadhaar is tied to money laundering. You will be arrested unless you verify your funds by sending them to a secure RBI account."',
          hi: 'कॉल करने वाला खुद को आईपीएस या सीबीआई अधिकारी बताता है: "आपके आधार से मनी लॉन्ड्रिंग हुई है। गिरफ्तारी से बचने के लिए अपने पैसे आरबीआई के सुरक्षित खाते में ट्रांसफर करें।"',
          mr: 'कॉल करणारा स्वतःला पोलिस किंवा सीबीआय अधिकारी सांगतो: "तुमच्या आधारवर बेकायदेशीर व्यवहार झाले आहेत. अटकेपासून वाचण्यासाठी पैसे सुरक्षा खात्यात ट्रान्सफर करा."',
        },
        tip: {
          en: 'There is NO SUCH THING as a "Secure RBI Verification Account". All money sent goes straight to the scammer.',
          hi: '"आरबीआई सत्यापन खाता" जैसी कोई चीज नहीं होती। भेजा गया सारा पैसा ठग की जेब में जाता है।',
          mr: '"आरबीआय सिक्युरिटी खाते" असे काहीही अस्तित्वात नसते. सर्व पैसे भामट्याकडे जातात.',
        },
        speechScript: {
          en: 'Lesson 5: Fake Officer Calls. Scammers pretend to be high-ranking police officers or tax officials to scare you. Remember that genuine police never ask you to transfer money to prove your innocence.',
          hi: 'पाठ ५: फर्जी अधिकारी कॉल। ठग आपको डराने के लिए बड़े पुलिस अफसर बनते हैं। याद रखें, असली पुलिस कभी अपनी बेगुनाही साबित करने के लिए पैसे नहीं मांगती।',
          mr: 'धडा ५: खोटे अधिकारी कॉल्स. भामटे मोठे पोलिस अधिकारी असल्याचे भासवून घाबरवतात. खरे पोलिस कधीही फोनवर पैसे मागत नाहीत.',
        },
      },
    ],
    quiz: {
      question: {
        en: 'A caller claiming to be a CBI inspector tells you to transfer ₹50,000 to an "RBI verification account" to clear your name. What should you do?',
        hi: 'सीबीआई का नाम लेकर कोई व्यक्ति अपने नाम को बेदाग साबित करने के लिए ५०,००० रुपये ट्रांसफर करने को कहे तो आप क्या करेंगे?',
        mr: 'सीबीआय अधिकारी सांगून ५०,००० रुपये आरबीआय खात्यात ट्रान्सफर करायला सांगितले तर काय कराल?',
      },
      options: [
        {
          id: 'opt1',
          text: {
            en: 'Hang up immediately and call 1930 Cybercrime Helpline.',
            hi: 'तुरंत फोन काटें और १९३० साइबर हेल्पलाइन पर कॉल करें।',
            mr: 'त्वरित फोन कट करा आणि १९३० सायबर हेल्पलाइनवर तक्रार करा.',
          },
          isCorrect: true,
          explanation: {
            en: 'Excellent! Law enforcement never conducts financial audits over personal phone calls.',
            hi: 'बहुत बढ़िया! कानून प्रवर्तन एजेंसियां कभी फोन पर पैसे ट्रांसफर करने को नहीं कहतीं।',
            mr: 'उत्तम! कायद्यानुसार पोलिस फोनवरून असे पैसे ट्रान्सफर मागत नाहीत.',
          },
        },
        {
          id: 'opt2',
          text: {
            en: 'Transfer the money quickly to avoid police coming to your home.',
            hi: 'पुलिस से बचने के लिए तुरंत पैसे ट्रांसफर कर दें।',
            mr: 'पोलिस घरी येऊ नयेत म्हणून लगेच पैसे पाठवा.',
          },
          isCorrect: false,
          explanation: {
            en: 'Unsafe: This is extortion. Once sent, the fraudster will cut contact.',
            hi: 'असुरक्षित: यह जबरन वसूली है। पैसे भेजते ही ठग फोन बंद कर देगा।',
            mr: 'धोकादायक: ही खंडणी आहे. पैसे मिळताच भामटा गायब होईल.',
          },
        },
      ],
    },
  },
  {
    id: 'phishing_links',
    icon: '🔗',
    badge: 'Web Safety',
    estimatedMinutes: 2,
    title: {
      en: 'Phishing Links & Shortened URLs',
      hi: 'फिशिंग लिंक और संदिग्ध वेबसाइट',
      mr: 'फिशिंग लिंक्स आणि संशयास्पद वेबसाइट',
    },
    subtitle: {
      en: 'Spot suspicious links ending in .xyz, .top, or bit.ly disguised as official banks',
      hi: 'एसएमएस में आने वाले छोटे और संदिग्ध लिंक की पहचान करना सीखें',
      mr: 'मेसेजमधील संशयास्पद आणि खोट्या लिंक्स ओळखायला शिका',
    },
    goldenRule: {
      en: 'Never click links from unknown numbers. Always type official website addresses directly into your browser.',
      hi: 'अज्ञात नंबरों से आए लिंक पर कभी क्लिक न करें। हमेशा आधिकारिक वेबसाइट का पता खुद टाइप करें।',
      mr: 'अनोळखी नंबरवरून आलेल्या लिंकवर कधीही क्लिक करू नका. नेहमी अधिकृत पत्ता स्वतः टाईप करा.',
    },
    slides: [
      {
        slideNumber: 1,
        headline: {
          en: 'How to Spot a Fake Link',
          hi: 'फर्जी लिंक की पहचान कैसे करें',
          mr: 'खोटी लिंक कशी ओळखायची',
        },
        content: {
          en: 'Real Indian government and bank sites end in ".gov.in", ".bank.in", or official corporate domains like "sbi.co.in". Scammers use fake extensions like "sbi-rewards.xyz" or "incometax-refund.top".',
          hi: 'सरकारी और बैंक साइटों के अंत में ".gov.in" या ".co.in" होता है। ठग "sbi-rewards.xyz" जैसे फर्जी नामों का उपयोग करते हैं।',
          mr: 'शासकीय आणि बँक वेबसाइटच्या शेवटी ".gov.in" किंवा ".co.in" असते. भामटे ".xyz" किंवा ".top" सारखे खोटे पत्ते वापरतात.',
        },
        tip: {
          en: 'Look at the domain name carefully. Even a single changed letter indicates a dangerous imitation.',
          hi: 'डोमेन नाम ध्यान से देखें। एक अक्षर का भी बदलाव नकली वेबसाइट का संकेत है।',
          mr: 'स्पेलिंग काळजीपूर्वक तपासा. एका अक्षराचा फरकही फसवणुकीचे लक्षण असू शकतो.',
        },
        speechScript: {
          en: 'Lesson 6: Phishing Links. Fraudsters send SMS with links that look like your bank. Always examine the address. Genuine banks use .co.in or .bank.in, never random letters or unfamiliar extensions.',
          hi: 'पाठ ६: फिशिंग लिंक। धोखेबाज बैंक जैसे दिखने वाले लिंक भेजते हैं। हमेशा वेबसाइट का पता जांचें। असली बैंक कभी अज्ञात एक्सटेंशन का इस्तेमाल नहीं करते।',
          mr: 'धडा ६: फिशिंग लिंक्स. भामटे बँकेसारख्या दिसणाऱ्या लिंक पाठवतात. पत्ता नीट तपासा. खरी बँक कधीही अनोळखी नावे वापरत नाही.',
        },
      },
    ],
    quiz: {
      question: {
        en: 'Which of the following website links is safe for State Bank of India net banking?',
        hi: 'भारतीय स्टेट बैंक की नेट बैंकिंग के लिए इनमें से कौन सा लिंक सुरक्षित है?',
        mr: 'स्टेट बँक ऑफ इंडियाच्या नेट बँकिंगसाठी खालीलपैकी कोणती लिंक सुरक्षित आहे?',
      },
      options: [
        {
          id: 'opt1',
          text: {
            en: 'https://www.onlinesbi.sbi',
            hi: 'https://www.onlinesbi.sbi',
            mr: 'https://www.onlinesbi.sbi',
          },
          isCorrect: true,
          explanation: {
            en: 'Correct! The ".sbi" top-level domain is officially owned and protected by SBI.',
            hi: 'बिल्कुल सही! ".sbi" आधिकारिक और सुरक्षित डोमेन है।',
            mr: 'अगदी बरोबर! ".sbi" हे एसबीआयचे स्वतःचे अधिकृत आणि सुरक्षित डोमेन आहे.',
          },
        },
        {
          id: 'opt2',
          text: {
            en: 'http://sbi-banking-login.xyz',
            hi: 'http://sbi-banking-login.xyz',
            mr: 'http://sbi-banking-login.xyz',
          },
          isCorrect: false,
          explanation: {
            en: 'Dangerous: ".xyz" with unencrypted HTTP is an obvious phishing trap.',
            hi: 'असुरक्षित: ".xyz" और असुरक्षित HTTP साफ तौर पर फिशिंग का जाल है।',
            mr: 'धोकादायक: ".xyz" आणि HTTP ही उघडपणे खोटी लिंक आहे.',
          },
        },
      ],
    },
  },
  {
    id: 'digital_arrest',
    icon: '⚖️',
    badge: 'High Threat',
    estimatedMinutes: 3,
    title: {
      en: 'Digital Arrest Scams',
      hi: 'डिजिटल अरेस्ट धोखाधड़ी',
      mr: 'डिजिटल अटक फसवणूक',
    },
    subtitle: {
      en: 'Understand how scammers use Skype video calls in fake police setups to trap seniors',
      hi: 'नकली पुलिस स्टेशन और वीडियो कॉल द्वारा डराने वाले गिरोह से सावधान रहें',
      mr: 'व्हिडिओ कॉलवरून पोलिसांचे नाटक करून फसवणाऱ्या टोळीपासून सावध राहा',
    },
    goldenRule: {
      en: 'There is NO provision for "Digital Arrest" under Indian law. No court or police officer can arrest you via Skype or WhatsApp.',
      hi: 'भारतीय कानून में "डिजिटल अरेस्ट" का कोई प्रावधान नहीं है। कोई भी पुलिस फोन पर आपको अरेस्ट नहीं कर सकती।',
      mr: 'भारतीय कायद्यात "डिजिटल अटक" नावाची कोणतीही संकल्पना नाही. व्हॉट्सॲपवर कोणालाही अटक करता येत नाही.',
    },
    slides: [
      {
        slideNumber: 1,
        headline: {
          en: 'The Reality of Digital Arrest',
          hi: 'डिजिटल अरेस्ट की सच्चाई',
          mr: 'डिजिटल अटकेचे वास्तव',
        },
        content: {
          en: 'Scammers dress in fake police uniforms, sit in front of fake police station emblems, and force you to stay on video call for hours claiming you are under "Digital Arrest" until you empty your fixed deposits.',
          hi: 'ठग नकली पुलिस वर्दी पहनकर वीडियो कॉल करते हैं और कहते हैं कि आप "डिजिटल अरेस्ट" में हैं। वे आपकी जमा पूंजी खाली कराने तक कॉल काटने नहीं देते।',
          mr: 'भामटे पोलिसांचा गणवेश घालून व्हिडिओ कॉल करतात आणि डिजिटल अटकेची भीती दाखवून तुमची सर्व बचत लुटतात.',
        },
        tip: {
          en: 'Indian police NEVER conduct video call interrogations or demand fund transfers. Hang up immediately.',
          hi: 'भारतीय पुलिस कभी वीडियो कॉल पर पूछताछ नहीं करती और न ही पैसे मांगती है। तुरंत फोन काट दें।',
          mr: 'भारतीय पोलिस कधीही व्हिडिओ कॉलवरून चौकशी किंवा पैशांची मागणी करत नाहीत. त्वरित कॉल कट करा.',
        },
        speechScript: {
          en: 'Lesson 7: Digital Arrest Scams. Criminals use fake video calls with police logos to isolate seniors. Remember, Digital Arrest does not exist in Indian law. If anyone tries this, hang up and tell your family immediately.',
          hi: 'पाठ ७: डिजिटल अरेस्ट। अपराधी पुलिस वर्दी में वीडियो कॉल करके डराते हैं। याद रखें, भारतीय कानून में डिजिटल अरेस्ट जैसा कुछ नहीं है। ऐसा कॉल आने पर तुरंत फोन काटें और परिवार को बताएं।',
          mr: 'धडा ७: डिजिटल अटक. भामटे व्हिडिओ कॉलवर पोलिसांचे सोंग आणतात. कायद्यानुसार डिजिटल अटक अस्तित्वात नाही. असा कॉल आल्यास लगेच फोन बंद करा.',
        },
      },
    ],
    quiz: {
      question: {
        en: 'A person on a WhatsApp video call in a police uniform orders you not to leave your room because you are under "Digital Arrest". What should you do?',
        hi: 'वीडियो कॉल पर पुलिस वर्दी पहने व्यक्ति कहे कि आप "डिजिटल अरेस्ट" हैं और कमरा न छोड़ें। आप क्या करेंगे?',
        mr: 'व्हिडिओ कॉलवर पोलिसांच्या गणवेशातील व्यक्तीने तुम्हाला "डिजिटल अटक" झाल्याचे सांगून खोलीतून बाहेर न पडण्याचा हुकूम दिला. काय कराल?',
      },
      options: [
        {
          id: 'opt1',
          text: {
            en: 'Disconnect the video call immediately and report to 1930.',
            hi: 'तुरंत वीडियो कॉल काटें और १९३० पर शिकायत करें।',
            mr: 'त्वरित व्हिडिओ कॉल कट करा आणि १९३० वर तक्रार करा.',
          },
          isCorrect: true,
          explanation: {
            en: 'Correct! Digital arrest is completely fraudulent. Hanging up breaks their psychological grip.',
            hi: 'बिल्कुल सही! डिजिटल अरेस्ट पूरी तरह से फर्जी है। कॉल काटते ही उनका दबाव टूट जाता है।',
            mr: 'अगदी बरोबर! डिजिटल अटक ही केवळ फसवणूक आहे. कॉल कट केल्याने त्यांचे नियंत्रण सुटते.',
          },
        },
        {
          id: 'opt2',
          text: {
            en: 'Stay on the video call and transfer money as ordered.',
            hi: 'कॉल पर बने रहें और उनके कहे अनुसार पैसे ट्रांसफर करें।',
            mr: 'कॉल सुरू ठेवा आणि सांगितल्याप्रमाणे पैसे पाठवा.',
          },
          isCorrect: false,
          explanation: {
            en: 'Unsafe: They will intimidate you until all your life savings are stolen.',
            hi: 'असुरक्षित: वे आपकी जीवनभर की कमाई लूटने तक डराते रहेंगे।',
            mr: 'धोकादायक: ते तुमचे सर्व कष्टाचे पैसे लुटून घेतील.',
          },
        },
      ],
    },
  },
  {
    id: 'customer_support',
    icon: '📞',
    badge: 'Search Engine Trap',
    estimatedMinutes: 2,
    title: {
      en: 'Fake Customer Care Scams',
      hi: 'फर्जी कस्टमर केयर धोखाधड़ी',
      mr: 'बनावट ग्राहक सेवा फसवणूक',
    },
    subtitle: {
      en: 'Why you should never search Google for customer support phone numbers',
      hi: 'गूगल पर कस्टमर केयर नंबर खोजने का जोखिम समझें',
      mr: 'गुगलवर कस्टमर केअर नंबर शोधण्याचे धोके समजून घ्या',
    },
    goldenRule: {
      en: 'Never trust helpline numbers found on Google search. Always find official contacts inside your authentic bank or shopping app.',
      hi: 'गूगल सर्च पर मिले हेल्पलाइन नंबरों पर कभी भरोसा न करें। हमेशा अपने असली ऐप के भीतर सहायता अनुभाग में जाएं।',
      mr: 'गुगलवर दिसणाऱ्या कस्टमर केअर नंबरवर कधीही विश्वास ठेवू नका. नेहमी अधिकृत ॲपमधील नंबर वापरा.',
    },
    slides: [
      {
        slideNumber: 1,
        headline: {
          en: 'The Search Engine Trap',
          hi: 'सर्च इंजन का जाल',
          mr: 'सर्च इंजिनचा सापळा',
        },
        content: {
          en: 'Scammers pay to display fake toll-free numbers at the top of Google search results for banks, airlines, and courier services. When seniors call, they ask you to install AnyDesk or TeamViewer to "fix your issue".',
          hi: 'ठग गूगल पर अपने फर्जी नंबर ऊपर दिखाने के लिए विज्ञापन देते हैं। जब आप कॉल करते हैं, तो वे एनीडेस्क जैसा रिमोट ऐप डाउनलोड करने को कहते हैं।',
          mr: 'भामटे गुगलवर खोटे नंबर वर आणण्यासाठी जाहिराती देतात. तुम्ही कॉल केल्यावर ते मोबाईलमध्ये एनीडेस्क सारखे ॲप डाऊनलोड करायला सांगतात.',
        },
        tip: {
          en: 'Never install remote screen-sharing apps on instructions from unknown phone callers.',
          hi: 'अज्ञात कॉल करने वालों के कहने पर स्क्रीन-शेयरिंग ऐप कभी इंस्टॉल न करें।',
          mr: 'फोनवरील अनोळखी व्यक्तीच्या सांगण्यावरून स्क्रीन शेअरिंग ॲप कधीही इन्स्टॉल करू नका.',
        },
        speechScript: {
          en: 'Lesson 8: Fake Customer Support. When you need help with an app or delivery, never search random numbers on the internet. Fraudsters post their own numbers and ask you to install screen sharing tools to steal your money.',
          hi: 'पाठ ८: फर्जी कस्टमर सपोर्ट। किसी भी समस्या के समाधान के लिए इंटरनेट पर रैंडम नंबर न खोजें। धोखेबाज अपने नंबर डालते हैं और स्क्रीन-शेयरिंग ऐप से आपका फोन हैक कर लेते हैं।',
          mr: 'धडा ८: बनावट ग्राहक सेवा. कोणत्याही समस्येसाठी इंटरनेटवर नंबर शोधू नका. भामटे खोटे नंबर टाकून स्क्रीन शेअरिंग ॲपद्वारे फोन हॅक करतात.',
        },
      },
    ],
    quiz: {
      question: {
        en: 'You need customer support for a failed online purchase. How should you find the genuine customer care number?',
        hi: 'ऑनलाइन खरीदारी की समस्या के लिए सही कस्टमर केयर नंबर कैसे ढूंढना चाहिए?',
        mr: 'ऑनलाइन खरेदीच्या समस्येसाठी अधिकृत कस्टमर केअर नंबर कसा मिळवावा?',
      },
      options: [
        {
          id: 'opt1',
          text: {
            en: 'Open the official app directly and go to the built-in Help / Support section.',
            hi: 'सीधे आधिकारिक ऐप खोलें और उसमें दिए गए सहायता अनुभाग में जाएं।',
            mr: 'थेट अधिकृत ॲप उघडा आणि त्यातील मदत (Help) विभागात जा.',
          },
          isCorrect: true,
          explanation: {
            en: 'Correct! Contact details inside verified apps cannot be manipulated by outside scammers.',
            hi: 'बिल्कुल सही! ऐप के अंदर की जानकारी सुरक्षित और प्रमाणित होती है।',
            mr: 'अगदी बरोबर! अधिकृत ॲपमधील माहिती सुरक्षित आणि खरी असते.',
          },
        },
        {
          id: 'opt2',
          text: {
            en: 'Call the first toll-free number that appears on Google search results.',
            hi: 'गूगल सर्च पर सबसे ऊपर आने वाले टोल-फ्री नंबर पर कॉल करें।',
            mr: 'गुगल सर्चवर सर्वात वर दिसणाऱ्या नंबरवर कॉल करा.',
          },
          isCorrect: false,
          explanation: {
            en: 'Dangerous: Scammers regularly manipulate search results with fake numbers.',
            hi: 'असुरक्षित: धोखेबाज सर्च इंजन पर अपने फर्जी नंबर विज्ञापित कर देते हैं।',
            mr: 'धोकादायक: भामटे गुगलवर स्वतःचे खोटे नंबर जाहिरात म्हणून टाकतात.',
          },
        },
      ],
    },
  },
];

