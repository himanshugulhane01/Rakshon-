/**
 * Rakshon Banking & UPI Practice Sandbox Scenarios
 *
 * STRICT SAFETY ASSURANCE:
 * - Completely fake, isolated training environment.
 * - Zero real banking integrations, payment gateways, or UPI SDKs.
 * - Zero real credentials requested, handled, or stored.
 * - All bank names, amounts, URLs, phone numbers, and UPI IDs are fictional.
 */

export interface BankingScenarioChoice {
  id: string;
  textEn: string;
  textHi: string;
  textMr: string;
  isSafe: boolean;
  feedbackEn: string;
  feedbackHi: string;
  feedbackMr: string;
}

export interface BankingScenario {
  id: string;
  stepNumber: number;
  category: 'fake_login' | 'upi_payment' | 'upi_collect' | 'otp_safety';
  titleEn: string;
  titleHi: string;
  titleMr: string;
  subtitleEn: string;
  subtitleHi: string;
  subtitleMr: string;
  scenarioTypeLabelEn: string;
  scenarioTypeLabelHi: string;
  scenarioTypeLabelMr: string;

  // Mock UI context elements
  mockUrl?: string;
  mockBankName?: string;
  mockMerchantName?: string;
  mockAmount?: string;
  mockUpiId?: string;
  mockSender?: string;
  mockCallerName?: string;
  mockCallerRole?: string;
  mockCallUrgency?: string;
  mockSmsContent?: string;
  mockOtpCode?: string;

  descriptionEn: string;
  descriptionHi: string;
  descriptionMr: string;

  goldenRuleEn: string;
  goldenRuleHi: string;
  goldenRuleMr: string;

  dangerIndicatorsEn: string[];
  dangerIndicatorsHi: string[];
  dangerIndicatorsMr: string[];

  choices: BankingScenarioChoice[];
}

export const BANKING_SANDBOX_SCENARIOS: BankingScenario[] = [
  {
    id: 'scenario_1_fake_login',
    stepNumber: 1,
    category: 'fake_login',
    titleEn: 'Fake Bank Login & Suspicious Website',
    titleHi: 'नकली बैंक लॉगिन और संदिग्ध वेबसाइट',
    titleMr: 'बनावट बँक लॉगिन आणि संशयास्पद वेबसाइट',
    subtitleEn: 'Learn how to detect fraudulent banking links and illegal password requests',
    subtitleHi: 'फर्जी बैंकिंग लिंक और अवैध पासवर्ड अनुरोधों को पहचानना सीखें',
    subtitleMr: 'फसव्या बँकिंग लिंक्स आणि अनधिकृत पासवर्ड मागण्या ओळखायला शिका',
    scenarioTypeLabelEn: 'Scenario 1: Web Banking Security',
    scenarioTypeLabelHi: 'परिदृश्य 1: नेट बैंकिंग सुरक्षा',
    scenarioTypeLabelMr: 'परिदृश्य १: नेट बँकिंग सुरक्षा',

    mockUrl: 'http://statetrust-secure-kyc.xyz/netbanking/login',
    mockBankName: 'State Trust Bank of India (Simulated)',
    descriptionEn:
      'You receive an SMS warning your bank account will be blocked unless KYC is updated within 2 hours. Tapping the link opens this web page asking for your User ID, Net Banking Password, and ATM Card PIN with CVV.',
    descriptionHi:
      'आपको एक संदेश मिलता है कि यदि 2 घंटे में केवाईसी अपडेट नहीं किया गया तो आपका बैंक खाता बंद हो जाएगा। लिंक खोलने पर यह पेज आपका यूजर आईडी, नेट बैंकिंग पासवर्ड और एटीएम पिन व सीवीवी मांगता है।',
    descriptionMr:
      'तुम्हाला एक मेसेज येतो की २ तासांत केवायसी अपडेट न केल्यास बँक खाते बंद होईल. लिंक उघडल्यावर हे पेज तुमचा यूजर आयडी, नेट बँकिंग पासवर्ड आणि एटीएम पिन व सीव्हीव्ही मागत आहे.',

    goldenRuleEn:
      'Golden Rule: Legitimate banks NEVER ask for your ATM PIN or CVV on a login page. Genuine bank sites always use encrypted https:// with official bank domains (never .xyz or unfamiliar extensions).',
    goldenRuleHi:
      'स्वर्ण नियम: असली बैंक कभी भी लॉगिन पेज पर आपका एटीएम पिन या सीवीवी नहीं मांगते। आधिकारिक बैंक वेबसाइट हमेशा https:// और वैध बैंक डोमेन पर होती हैं (कभी .xyz नहीं)।',
    goldenRuleMr:
      'सुवर्ण नियम: खरी बँक कधीही लॉगिन पेजवर तुमचा एटीएम पिन किंवा सीव्हीव्ही मागत नाही. अधिकृत बँक वेबसाइट नेहमी https:// आणि अधिकृत डोमेनवर असते (.xyz कधीही नाही).',

    dangerIndicatorsEn: [
      'Insecure protocol: Uses unencrypted "http://" instead of secure "https://"',
      'Suspicious web domain ending in ".xyz" instead of official ".bank.in" or ".co.in"',
      'Dangerous credential trap: Asking for ATM PIN and CVV on a website login form',
      'Artificial urgency: Threatening to block account in 2 hours to cause panic',
    ],
    dangerIndicatorsHi: [
      'असुरक्षित प्रोटोकॉल: सुरक्षित "https://" के बजाय असुरक्षित "http://" का उपयोग',
      'संदिग्ध डोमेन: आधिकारिक ".co.in" के बजाय फर्जी ".xyz" एक्सटेंशन',
      'खतरनाक मांग: वेब लॉगिन पर एटीएम कार्ड पिन और सीवीवी मांगना',
      'झूठी घबराहट: 2 घंटे में खाता बंद करने की फर्जी धमकी देना',
    ],
    dangerIndicatorsMr: [
      'असुरक्षित प्रोटोकॉल: सुरक्षित "https://" ऐवजी असुरक्षित "http://"',
      'संशयास्पद डोमेन: अधिकृत ".co.in" ऐवजी बनावट ".xyz" एक्सटेंशन',
      'धोकादायक मागणी: वेब लॉगिनवर एटीएम पिन आणि सीव्हीव्ही विचारणे',
      'खोट्या भीतीचा वापर: २ तासांत खाते बंद करण्याची धमकी देऊन घाबरवणे',
    ],

    choices: [
      {
        id: 'fake_login_safe',
        textEn:
          'Close the browser immediately. Real banks never ask for ATM PIN/CVV on login, and official URLs use secure https://.',
        textHi:
          'ब्राउज़र तुरंत बंद करें। असली बैंक कभी लॉगिन पर एटीएम पिन/सीवीवी नहीं मांगते, और आधिकारिक वेबसाइट हमेशा सुरक्षित https:// पर होती हैं।',
        textMr:
          'ब्राउझर तात्काळ बंद करा. खरी बँक लॉगिनवर कधीही एटीएम पिन/सीव्हीव्ही मागत नाही आणि अधिकृत वेबसाइट नेहमी सुरक्षित https:// वर असते.',
        isSafe: true,
        feedbackEn:
          'Excellent! You correctly identified the fake domain, unencrypted connection, and the illegal request for an ATM PIN and CVV.',
        feedbackHi:
          'शाबाश! आपने फर्जी डोमेन, असुरक्षित लिंक और एटीएम पिन की गैरकानूनी मांग को सही पहचाना।',
        feedbackMr:
          'उत्कृष्ट! तुम्ही बनावट डोमेन, असुरक्षित लिंक आणि एटीएम पिनची बेकायदेशीर मागणी अचूक ओळखली.',
      },
      {
        id: 'fake_login_unsafe',
        textEn:
          'Enter User ID, password, and ATM PIN quickly to avoid account blockage.',
        textHi:
          'खाता बंद होने से बचाने के लिए जल्दी से यूजर आईडी, पासवर्ड और एटीएम पिन दर्ज करें।',
        textMr:
          'खाते बंद होण्यापासून वाचवण्यासाठी त्वरित यूजर आयडी, पासवर्ड आणि एटीएम पिन भरा.',
        isSafe: false,
        feedbackEn:
          'Danger! This was a phishing clone. Submitting your ATM PIN or password on an unofficial page allows criminals to empty your account.',
        feedbackHi:
          'खतरा! यह एक फर्जी क्लोन वेबसाइट थी। अनधिकृत पेज पर अपना पिन या पासवर्ड दर्ज करने से धोखेबाज आपका खाता खाली कर सकते हैं।',
        feedbackMr:
          'धोका! ही एक बनावट क्लोन वेबसाइट होती. अनधिकृत पेजवर तुमचा पिन किंवा पासवर्ड टाकल्यास सायबर गुन्हेगार तुमचे बँक खाते रिकामे करू शकतात.',
      },
    ],
  },
  {
    id: 'scenario_2_upi_payment',
    stepNumber: 2,
    category: 'upi_payment',
    titleEn: 'Simulated UPI Merchant Payment',
    titleHi: 'सिम्युलेटेड यूपीआई व्यापारी भुगतान',
    titleMr: 'सिम्युलेटेड UPI व्यापारी पेमेंट सराव',
    subtitleEn: 'Learn how to verify recipient identity and merchant badges before paying',
    subtitleHi: 'भुगतान करने से पहले प्राप्तकर्ता का नाम और सत्यापित बैज जांचना सीखें',
    subtitleMr: 'पैसे पाठवण्यापूर्वी प्राप्तकर्त्याचे नाव आणि अधिकृत बॅज तपासणे शिका',
    scenarioTypeLabelEn: 'Scenario 2: UPI Payment Verification',
    scenarioTypeLabelHi: 'परिदृश्य 2: यूपीआई भुगतान सत्यापन',
    scenarioTypeLabelMr: 'परिदृश्य २: UPI पेमेंट पडताळणी',

    mockMerchantName: 'Green Valley Fresh Groceries',
    mockUpiId: 'greenvalley.retail@okhdfcbank',
    mockAmount: '₹ 150.00',
    descriptionEn:
      'You are at a local grocery store paying ₹150 for vegetables using a UPI app. You scan the store QR code. Before entering your UPI PIN, how do you verify that the payment is going to the authentic store?',
    descriptionHi:
      'आप सब्जी की दुकान पर ₹150 का भुगतान यूपीआई से कर रहे हैं। आपने दुकान का क्यूआर कोड स्कैन किया है। अपना यूपीआई पिन डालने से पहले आप कैसे पुष्टि करेंगे कि भुगतान सही दुकान को जा रहा है?',
    descriptionMr:
      'तुम्ही भाजीपाल्याच्या दुकानात UPI द्वारे ₹१५० चे पेमेंट करत आहात. तुम्ही दुकानाचा QR कोड स्कॅन केला आहे. तुमचा UPI पिन टाकण्यापूर्वी पैसे योग्य दुकानदाराला जात आहेत हे तुम्ही कसे तपासाल?',

    goldenRuleEn:
      'Golden Rule: Always verify that the displayed merchant name matches the physical store and shows a verified merchant tick mark. Never pay an unverified personal UPI ID for store purchases.',
    goldenRuleHi:
      'स्वर्ण नियम: हमेशा जांचें कि स्क्रीन पर दिख रहा नाम असली दुकान से मेल खाता है और उस पर सत्यापित टिक मार्क है। दुकान की खरीदारी के लिए किसी अज्ञात व्यक्तिगत आईडी पर भुगतान न करें।',
    goldenRuleMr:
      'सुवर्ण नियम: स्क्रीनवर दिसणारे नाव प्रत्यक्ष दुकानाशी जुळते का आणि त्यावर अधिकृत टिक मार्क आहे का ते नेहमी तपासा. दुकानातील खरेदीसाठी अनोळखी खाजगी आयडीवर पैसे पाठवू नका.',

    dangerIndicatorsEn: [
      'Scammers often paste fake paper QR codes over real shop QR stands',
      'Always confirm recipient name on screen before entering your UPI PIN',
      'Look for the verified merchant icon on business QR codes',
      'Never send advance booking money via UPI to unknown personal numbers',
    ],
    dangerIndicatorsHi: [
      'धोखेबाज कभी-कभी असली क्यूआर कोड पर अपना फर्जी क्यूआर चिपका देते हैं',
      'यूपीआई पिन दर्ज करने से पहले स्क्रीन पर दिखने वाला नाम अवश्य पढ़ें',
      'व्यापारियों के क्यूआर कोड पर सत्यापित मर्चेंट आइकन जरूर देखें',
      'अज्ञात व्यक्तिगत नंबरों पर कभी भी अग्रिम रकम ट्रांसफर न करें',
    ],
    dangerIndicatorsMr: [
      'गुन्हेगार अनेकदा मूळ QR कोडवर स्वतःचा बनावट QR कोड चिकटवून फसवणूक करतात',
      'UPI पिन टाकण्यापूर्वी स्क्रीनवर दिसणारे नाव प्रत्यक्ष दुकानदाराशी जुळते का ते पहा',
      'व्यापारी QR कोडवर अधिकृत मर्चंट चिन्ह नक्की तपासा',
      'अनोळखी खाजगी नंबरवर कधीही आगाऊ रक्कम पाठवू नका',
    ],

    choices: [
      {
        id: 'upi_pay_safe',
        textEn:
          'Verify that "Green Valley Fresh Groceries" and verified badge appear on screen, and the amount is exactly ₹150 before entering PIN.',
        textHi:
          'पुष्टि करें कि स्क्रीन पर "Green Valley Fresh Groceries" और सत्यापित बैज दिख रहा है तथा राशि ठीक ₹150 है, उसके बाद ही पिन डालें।',
        textMr:
          'पडताळणी करा की स्क्रीनवर "Green Valley Fresh Groceries" आणि अधिकृत बॅज दिसत आहे तसेच रक्कम तंतोतंत ₹१५० आहे, मगच पिन टाका.',
        isSafe: true,
        feedbackEn:
          'Safe Decision! Checking the payee name and verified business badge protects you from tampered QR codes and wrong transfers.',
        feedbackHi:
          'सुरक्षित निर्णय! प्राप्तकर्ता का नाम और सत्यापित बैज जांचने से आप बदले हुए क्यूआर कोड और गलत ट्रांसफर से बचते हैं।',
        feedbackMr:
          'सुरक्षित निर्णय! प्राप्तकर्त्याचे नाव आणि अधिकृत बॅज तपासल्याने तुम्ही बदललेल्या QR कोड आणि चुकीच्या ट्रान्सफरपासून सुरक्षित राहता.',
      },
      {
        id: 'upi_pay_unsafe',
        textEn:
          'Quickly enter the UPI PIN without looking at the recipient name or amount.',
        textHi:
          'प्राप्तकर्ता का नाम या राशि देखे बिना तुरंत अपना यूपीआई पिन दर्ज कर दें।',
        textMr:
          'प्राप्तकर्त्याचे नाव किंवा रक्कम न पाहता घाईघाईने UPI पिन टाका.',
        isSafe: false,
        feedbackEn:
          'Risky habit! If a scammer had swapped the QR sticker with their own, your money would be permanently sent to a fraudster.',
        feedbackHi:
          'जोखिम भरा कदम! यदि किसी ने क्यूआर स्टीकर बदल दिया होता, तो आपके पैसे सीधे धोखेबाज के खाते में चले जाते।',
        feedbackMr:
          'धोकादायक सवय! जर कोणी दुकानातील QR स्टिकर बदलला असेल, तर तुमचे पैसे थेट सायबर भामट्याकडे जातील.',
      },
    ],
  },
  {
    id: 'scenario_3_upi_collect',
    stepNumber: 3,
    category: 'upi_collect',
    titleEn: 'UPI Collect Request: Receiving Money',
    titleHi: 'यूपीआई कलेक्ट रिक्वेस्ट: पैसे प्राप्त करना',
    titleMr: 'UPI कलेक्ट रिक्वेस्ट: पैसे मिळवणे',
    subtitleEn: 'The #1 UPI scam in India: Entering your PIN pays money, NEVER receives money',
    subtitleHi: 'भारत का सबसे आम यूपीआई स्कैम: पिन डालने से पैसे कटते हैं, कभी मिलते नहीं',
    subtitleMr: 'भारतातील सर्वात मोठा UPI स्कॅम: पिन टाकल्याने पैसे कापले जातात, कधीही मिळत नाहीत',
    scenarioTypeLabelEn: 'Scenario 3: Money Receiving Trap',
    scenarioTypeLabelHi: 'परिदृश्य 3: पैसे प्राप्त करने का जाल',
    scenarioTypeLabelMr: 'परिदृश्य ३: पैसे मिळवण्याचा सापळा',

    mockSender: 'Ramesh Kumar (OLX Buyer for Sofa)',
    mockAmount: '₹ 10,000.00',
    descriptionEn:
      'A buyer on OLX agrees to buy your old sofa for ₹10,000. He tells you: "I am sending a payment request on Google Pay/PhonePe. Accept it and enter your 4-digit UPI PIN to receive ₹10,000 into your bank account immediately!" A notification pops up saying: "Collect Request from Ramesh: ₹10,000".',
    descriptionHi:
      'ओएलएक्स पर एक खरीदार आपका सोफा ₹10,000 में खरीदने को तैयार होता है। वह फोन पर कहता है: "मैंने गूगल पे पर ₹10,000 की रिक्वेस्ट भेजी है। उसे स्वीकार करें और अपने खाते में पैसे पाने के लिए अपना 4 अंकों का यूपीआई पिन डालें!" स्क्रीन पर दिखता है: "Collect Request from Ramesh: ₹10,000".',
    descriptionMr:
      'OLX वरील एक ग्राहक तुमचा सोफा ₹१०,००० मध्ये विकत घेण्यास तयार होतो. तो म्हणतो: "मी PhonePe वर ₹१०,००० ची रिक्वेस्ट पाठवली आहे. ती स्वीकारा आणि तुमच्या खात्यात पैसे मिळवण्यासाठी तुमचा ४-अंकी UPI पिन टाका!" स्क्रीनवर दिसते: "Collect Request from Ramesh: ₹10,000".',

    goldenRuleEn:
      'CRITICAL GOLDEN RULE: You NEVER enter a UPI PIN to receive money! Entering your UPI PIN ALWAYS transfers money OUT of your bank account. To receive money, the sender only needs your mobile number or UPI ID.',
    goldenRuleHi:
      'अत्यंत महत्वपूर्ण नियम: पैसे प्राप्त करने के लिए कभी भी यूपीआई पिन दर्ज नहीं करना पड़ता! यूपीआई पिन डालने से हमेशा आपके खाते से पैसे कटते हैं। पैसे लेने के लिए केवल आपका नंबर या यूपीआई आईडी काफी है।',
    goldenRuleMr:
      'अत्यंत महत्त्वाचा सुवर्ण नियम: पैसे मिळवण्यासाठी कधीही UPI पिन टाकावा लागत नाही! UPI पिन टाकल्याने नेहमी तुमच्या खात्यातून पैसे कापले जातात. पैसे स्वीकारण्यासाठी फक्त तुमचा मोबाईल नंबर किंवा UPI ID पुरेसा असतो.',

    dangerIndicatorsEn: [
      'Fraudsters claim "Enter PIN to receive money" — this is completely false in all banking apps',
      'A "Collect Request" is a DEMAND for you to pay them ₹10,000',
      'Entering your UPI PIN authorizes an outgoing debit transaction',
      'Official bank rule: Receiving money requires ZERO actions and ZERO PIN entries from you',
    ],
    dangerIndicatorsHi: [
      'धोखेबाज कहते हैं "पैसे पाने के लिए पिन डालें" — यह पूरी तरह से एक सफेद झूठ है',
      '"Collect Request" का अर्थ है कि वे आपके खाते से ₹10,000 मांग रहे हैं',
      'यूपीआई पिन डालते ही आपके बैंक खाते से तुरंत पैसे कट जाएंगे',
      'बैंक का नियम: पैसे आने के लिए आपको कभी भी कोई पिन नहीं डालना होता',
    ],
    dangerIndicatorsMr: [
      'भामटे सांगतात "पैसे मिळवण्यासाठी पिन टाका" — हे १००% धादांत खोटे आहे',
      '"Collect Request" चा अर्थ ते तुमच्या खात्यातून ₹१०,००० काढण्याची मागणी करत आहेत',
      'UPI पिन टाकताच तुमच्या बँक खात्यातून रक्कम तात्काळ कापली जाईल',
      'बँकेचा नियम: खात्यात पैसे जमा होण्यासाठी कधीही कोणताही पिन टाकावा लागत नाही',
    ],

    choices: [
      {
        id: 'upi_collect_safe',
        textEn:
          'Decline the request immediately! You NEVER enter a UPI PIN to receive money. Entering a PIN will deduct ₹10,000 from your account.',
        textHi:
          'रिक्वेस्ट तुरंत अस्वीकार (Decline) करें! पैसे पाने के लिए कभी पिन नहीं डाला जाता। पिन डालने से आपके खाते से ₹10,000 कट जाएंगे।',
        textMr:
          'रिक्वेस्ट तात्काळ नाकारा (Decline)! पैसे मिळवण्यासाठी कधीही पिन टाकला जात नाही. पिन टाकल्यास तुमच्या खात्यातून ₹१०,००० कापले जातील.',
        isSafe: true,
        feedbackEn:
          'Spot on! You remembered the golden rule: Entering your UPI PIN always sends money, never receives it. Declining saved you from losing ₹10,000.',
        feedbackHi:
          'बिल्कुल सही! आपने सुनहरा नियम याद रखा: यूपीआई पिन केवल पैसे भेजने के लिए होता है, पाने के लिए नहीं। रिक्वेस्ट ठुकराकर आपने ₹10,000 बचाए।',
        feedbackMr:
          'अगदी अचूक! तुम्ही सुवर्ण नियम लक्षात ठेवला: UPI पिन फक्त पैसे देण्यासाठी असतो, मिळवण्यासाठी नाही. विनंती नाकारून तुम्ही तुमचे ₹१०,००० वाचवले.',
      },
      {
        id: 'upi_collect_unsafe',
        textEn:
          'Tap "Pay / Approve" and enter your UPI PIN to claim the ₹10,000 deposit.',
        textHi:
          '"Pay / Approve" दबाएं और ₹10,000 जमा करने के लिए अपना यूपीआई पिन डालें।',
        textMr:
          '"Pay / Approve" दाबा आणि ₹१०,००० मिळवण्यासाठी तुमचा UPI पिन टाका.',
        isSafe: false,
        feedbackEn:
          'CRITICAL LOSS! You were debited ₹10,000. Never enter your UPI PIN when someone promises to send you money.',
        feedbackHi:
          'बड़ा नुकसान! आपके खाते से ₹10,000 कट गए। जब कोई पैसे भेजने का वादा करे, तो कभी भी अपना यूपीआई पिन न डालें।',
        feedbackMr:
          'मोठे नुकसान! तुमच्या खात्यातून ₹१०,००० कापले गेले. कोणी पैसे पाठवण्याचे आमिष दाखवल्यास कधीही UPI पिन टाकू नका.',
      },
    ],
  },
  {
    id: 'scenario_4_otp_safety',
    stepNumber: 4,
    category: 'otp_safety',
    titleEn: 'Fake Bank Manager Call & OTP Trap',
    titleHi: 'नकली बैंक मैनेजर की कॉल और ओटीपी जाल',
    titleMr: 'बनावट बँक व्यवस्थापकाचा कॉल आणि OTP सापळा',
    subtitleEn: 'Recognize high-pressure calls demanding your OTP to "cancel" a transaction',
    subtitleHi: 'लेनदेन "रद्द" करने के नाम पर ओटीपी मांगने वाली कॉलों को पहचानें',
    subtitleMr: 'व्यवहार "रद्द" करण्याच्या बहाण्याने OTP मागणारे फसवे कॉल ओळखा',
    scenarioTypeLabelEn: 'Scenario 4: Urgent Phone Call Trap',
    scenarioTypeLabelHi: 'परिदृश्य 4: फर्जी फोन कॉल का खतरा',
    scenarioTypeLabelMr: 'परिदृश्य ४: बनावट फोन कॉलचा धोका',

    mockCallerName: 'Rajesh Sharma (Claims: Bank Anti-Fraud Officer)',
    mockCallUrgency: 'HIGH URGENCY — 60 Seconds Left to Stop Fraud',
    mockOtpCode: '8 4 9 2 0 1',
    mockSmsContent:
      '849201 is your OTP for purchase of Rs 25,000 at OnlineShop. NEVER share your OTP with anyone, including bank staff.',
    descriptionEn:
      'A stressed caller claiming to be "Chief Manager Sharma from Bank Fraud Cell" calls your phone: "Sir, an unauthorized debit of ₹25,000 was just attempted on your account! We are trying to stop it. An SMS with a 6-digit cancellation code has been sent to your phone. Tell me the OTP immediately to block this transaction!"',
    descriptionHi:
      'एक घबराया हुआ कॉलर जो खुद को "बैंक फ्रॉड सेल का चीफ मैनेजर शर्मा" बताता है, आपको कॉल करता है: "सर, आपके खाते से ₹25,000 का फर्जी ट्रांसफर हो रहा है! हम इसे रोकने की कोशिश कर रहे हैं। आपके फोन पर 6 अंकों का कैंसिलेशन कोड भेजा गया है। इसे तुरंत मुझे बताएं ताकि हम इस फ्रॉड को रोक सकें!"',
    descriptionMr:
      'स्वतःला "बँक फ्रॉड सेलचे मुख्य व्यवस्थापक शर्मा" सांगणारा एक व्यक्ती तुम्हाला कॉल करतो: "सर, तुमच्या खात्यातून ₹२५,००० चा व्यवहार होत आहे! आम्ही तो थांबवण्याचा प्रयत्न करत आहोत. तुमच्या फोनवर ६-अंकी कोड पाठवला आहे. हा व्यवहार रद्द करण्यासाठी मला तात्काळ तो OTP सांगा!"',

    goldenRuleEn:
      'Golden Rule: Legitimate bank officials, RBI officers, or police will NEVER ask for your OTP over phone, SMS, or WhatsApp. The OTP message clearly states it is FOR a purchase, not to cancel one.',
    goldenRuleHi:
      'स्वर्ण नियम: असली बैंक अधिकारी, आरबीआई या पुलिस कभी भी फोन, एसएमएस या व्हाट्सएप पर आपका ओटीपी नहीं मांगते। एसएमएस स्पष्ट रूप से कहता है कि यह खरीदारी के लिए है, रद्द करने के लिए नहीं।',
    goldenRuleMr:
      'सुवर्ण नियम: बँकेचे खरे अधिकारी, रिझर्व्ह बँक किंवा पोलीस कधीही फोनवर OTP मागत नाहीत. मेसेजमध्ये स्पष्ट लिहिले असते की हा व्यवहार पूर्ण करण्यासाठी आहे, रद्द करण्यासाठी नाही.',

    dangerIndicatorsEn: [
      'Creating false panic to rush you into acting without thinking',
      'Claiming an OTP is needed to "cancel" or "reverse" a transaction (OTPs only AUTHORIZE transactions)',
      'The actual SMS text clearly warns: "NEVER share your OTP with anyone, including bank staff"',
      'No genuine banking system requires verbal disclosure of one-time passwords',
    ],
    dangerIndicatorsHi: [
      'सोचने का मौका दिए बिना घबराहट पैदा करके जल्दबाजी करवाना',
      'यह दावा करना कि लेनदेन "रद्द" करने के लिए ओटीपी चाहिए (ओटीपी केवल भुगतान को मंजूरी देता है)',
      'एसएमएस में स्पष्ट चेतावनी: "बैंक कर्मचारियों सहित किसी के साथ भी अपना ओटीपी साझा न करें"',
      'कोई भी वैध बैंक प्रणाली मौखिक रूप से ओटीपी नहीं मांगती',
    ],
    dangerIndicatorsMr: [
      'विचार करण्याची संधी न देता घबराट निर्माण करून घाई करायला लावणे',
      'व्यवहार "रद्द" करण्यासाठी OTP हवा असल्याचा खोटा दावा (OTP मुळे व्यवहार मंजूर होतो)',
      'मेसेजमधील स्पष्ट इशारा: "बँक कर्मचाऱ्यांसह कोणाशीही आपला OTP शेअर करू नका"',
      'कोणतीही खरी बँक यंत्रणा तोंडी OTP विचारत नाही',
    ],

    choices: [
      {
        id: 'otp_safe',
        textEn:
          'Hang up immediately! Never share your OTP with anyone. Call the official 1930 Cybercrime Helpline or your bank branch directly.',
        textHi:
          'तुरंत फोन काट दें! अपना ओटीपी किसी के साथ साझा न करें। सीधे आधिकारिक 1930 साइबर हेल्पलाइन या अपनी बैंक शाखा से संपर्क करें।',
        textMr:
          'तात्काळ फोन कट करा! कोणालाही आपला OTP सांगू नका. थेट अधिकृत १९३० सायबर हेल्पलाइन किंवा आपल्या बँक शाखेशी संपर्क साधा.',
        isSafe: true,
        feedbackEn:
          'Outstanding! You refused to fall for social engineering panic. Bank employees never need your OTP, and hanging up preserved your funds.',
        feedbackHi:
          'शानदार! आप घबराहट और झांसे में नहीं आए। बैंक कर्मचारियों को कभी आपके ओटीपी की जरूरत नहीं होती। फोन काटकर आपने अपना पैसा बचाया।',
        feedbackMr:
          'उत्कृष्ट! तुम्ही खोट्या भीतीला बळी पडला नाहीत. बँक कर्मचाऱ्यांना कधीही तुमच्या OTP ची गरज नसते. फोन कट करून तुम्ही तुमचे पैसे सुरक्षित ठेवले.',
      },
      {
        id: 'otp_unsafe',
        textEn:
          'Read out the 6-digit OTP code to the caller so they can stop the ₹25,000 debit.',
        textHi:
          'कॉलर को 6 अंकों का ओटीपी बता दें ताकि वह ₹25,000 का लेनदेन रोक सके।',
        textMr:
          'कॉलरला ६-अंकी OTP सांगा जेणेकरून तो ₹२५,००० चा व्यवहार थांबवू शकेल.',
        isSafe: false,
        feedbackEn:
          'DISASTER! You handed the keys to the fraudster. Giving the OTP authorized the criminals to complete the ₹25,000 withdrawal instantly.',
        feedbackHi:
          'गंभीर गलती! आपने धोखेबाज को अनुमति दे दी। ओटीपी बताते ही अपराधियों ने तुरंत आपके खाते से ₹25,000 निकाल लिए।',
        feedbackMr:
          'गंभीर चूक! तुम्ही सायबर गुन्हेगाराला मंजुरी दिली. OTP सांगताच भामट्यांनी तुमच्या खात्यातून ₹२५,००० लगेच काढून घेतले.',
      },
    ],
  },
];

