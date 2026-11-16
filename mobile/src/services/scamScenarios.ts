/**
 * ScamShield Scam Simulator Scenarios
 *
 * Provides 8 realistic, senior-focused Indian scam simulations:
 * 1. Electricity Disconnection Threat (Utilities)
 * 2. Fake Digital Arrest & Police Extortion (Law Enforcement)
 * 3. Fake Bank KYC Expiry Alert (Banking)
 * 4. Fraud Reversal Call & OTP Request (OTP & UPI PIN)
 * 5. Fake Parcel Delivery Payment Link (Delivery & Couriers)
 * 6. Malicious 5G Pension APK (Malware & Downloads)
 * 7. QR Code Payment Fraud / OLX Advance (QR Codes & Payments)
 * 8. Fake Customer Care Helpline & Remote Access (Helpline & Remote Access)
 */

export interface SimulatorChoice {
  id: string;
  textEn: string;
  textHi: string;
  textMr: string;
  isSafe: boolean;
}

export type ScenarioCategory =
  | 'electricity'
  | 'police'
  | 'kyc'
  | 'otp_upi'
  | 'delivery'
  | 'malware'
  | 'qr_fraud'
  | 'helpline'
  | 'upi'; // alias for backward compatibility

export interface SimulatorScenario {
  id: string;
  category: ScenarioCategory;
  topicTitleEn: string;
  topicTitleHi: string;
  topicTitleMr: string;
  titleEn: string;
  titleHi: string;
  titleMr: string;
  messageEn: string;
  messageHi: string;
  messageMr: string;
  questionEn: string;
  questionHi: string;
  questionMr: string;
  choices: SimulatorChoice[];
  explanationEn: string;
  explanationHi: string;
  explanationMr: string;
  ruleLessonEn: string;
  ruleLessonHi: string;
  ruleLessonMr: string;
  safeTipEn: string;
  safeTipHi: string;
  safeTipMr: string;
}

export const SIMULATOR_SCENARIOS: SimulatorScenario[] = [
  {
    id: 'scenario_electricity',
    category: 'electricity',
    topicTitleEn: 'Utility & Electricity Bills',
    topicTitleHi: 'बिजली व जनोपयोगी बिल',
    topicTitleMr: 'वीज व उपयुक्तता बिले',
    titleEn: 'Electricity Disconnection Threat',
    titleHi: 'बिजली कनेक्शन काटने की धमकी',
    titleMr: 'वीज कनेक्शन तोडण्याची धमकी',
    messageEn:
      'DEAR CONSUMER, YOUR ELECTRICITY POWER WILL BE DISCONNECTED TONIGHT AT 9:30 PM FROM ELECTRICITY OFFICE BECAUSE YOUR PREVIOUS MONTH BILL WAS NOT UPDATED. PLEASE IMMEDIATELY CONTACT OUR ELECTRICITY OFFICER MR. VERMA AT 9876543210. THANK YOU.',
    messageHi:
      'प्रिय ग्राहक, आपका बिजली कनेक्शन आज रात 9:30 बजे काट दिया जाएगा क्योंकि पिछले महीने का बिल अपडेट नहीं हुआ है। तुरंत हमारे बिजली अधिकारी श्री वर्मा से 9876543210 पर संपर्क करें।',
    messageMr:
      'प्रिय ग्राहक, मागील महिन्याचे बिल अपडेट न झाल्यामुळे आज रात्री ९:३० वाजता तुमचे वीज कनेक्शन तोडले जाईल. कृपया तात्काळ आमचे वीज अधिकारी श्री. वर्मा यांच्याशी 9876543210 वर संपर्क साधा.',
    questionEn: 'You receive this SMS at 8:00 PM. What is the safest action to take?',
    questionHi: 'आपको रात 8:00 बजे यह संदेश मिलता है। सबसे सुरक्षित कदम क्या है?',
    questionMr: 'तुम्हाला रात्री ८:०० वाजता हा मेसेज आला. सर्वात सुरक्षित पाऊल कोणते?',
    choices: [
      {
        id: 'elec_safe',
        textEn:
          'Ignore the number in SMS. Check your official electricity bill receipt or call the official discom customer care number.',
        textHi:
          'संदेश में दिए नंबर पर कॉल न करें। अपनी पुरानी आधिकारिक रसीद देखें या बिजली बोर्ड के आधिकारिक कस्टमर केयर पर बात करें।',
        textMr:
          'मेसेजमधील नंबर दुर्लक्षित करा. अधिकृत वीज बिलाची पावती तपासा किंवा वीज कंपनीच्या अधिकृत कस्टमर केअरशी संपर्क साधा.',
        isSafe: true,
      },
      {
        id: 'elec_danger',
        textEn:
          'Immediately call 9876543210 and install the bill update app they send to stop the disconnection.',
        textHi:
          'बिजली कटने के डर से तुरंत 9876543210 पर फोन करें और उनके द्वारा भेजा गया ऐप डाउनलोड करें।',
        textMr:
          'वीज जाण्याच्या भीतीने लगेच 9876543210 वर कॉल करा आणि त्यांनी सांगितलेले ॲप डाऊनलोड करा.',
        isSafe: false,
      },
    ],
    explanationEn:
      'Government and state electricity boards (like MSEDCL, BSES, BESCOM, UPPCL) never send personal mobile numbers for bill payments and never disconnect electricity without formal written statutory notice. Scammers use fear and urgency to make seniors install malicious screen-sharing APK apps.',
    explanationHi:
      'सरकारी या निजी बिजली बोर्ड कभी भी बिल भुगतान के लिए किसी कर्मचारी का व्यक्तिगत मोबाइल नंबर नहीं भेजते और न ही बिना लिखित नोटिस बिजली काटते हैं। ठग घबराहट पैदा करके रिमोट एक्सेस ऐप डाउनलोड करवा लेते हैं।',
    explanationMr:
      'सरकारी किंवा खाजगी वीज कंपन्या कधीही बिलासाठी कर्मचाऱ्यांचा वैयक्तिक मोबाईल नंबर देत नाहीत आणि लेखी नोटीस दिल्याशिवाय वीज तोडत नाहीत. भामटे भीती दाखवून मोबाईलचा ताबा घेणारे ॲप इन्स्टॉल करायला लावतात.',
    ruleLessonEn:
      'Rule: Never pay utility bills using phone numbers received in sudden urgent SMS warnings.',
    ruleLessonHi: 'नियम: अचानक आए एसएमएस में दिए व्यक्तिगत नंबरों पर कभी संपर्क या भुगतान न करें।',
    ruleLessonMr: 'नियम: मेसेजमध्ये आलेल्या अनोळखी फोन नंबरवर कधीही पैसे भरू नका किंवा संपर्क करू नका.',
    safeTipEn: 'State discoms never send personal mobile numbers for bill payments or cutoff notices.',
    safeTipHi: 'बिजली बोर्ड बिल भुगतान के लिए कभी व्यक्तिगत मोबाइल नंबर नहीं भेजते।',
    safeTipMr: 'वीज कंपन्या बिलासाठी कधीही कर्मचाऱ्यांचे वैयक्तिक मोबाईल नंबर पाठवत नाहीत.',
  },
  {
    id: 'scenario_police',
    category: 'police',
    topicTitleEn: 'Police & Law Enforcement',
    topicTitleHi: 'पुलिस व कानून प्रवर्तन',
    topicTitleMr: 'पोलीस व कायदेशीर कारवाई',
    titleEn: 'Digital Arrest & CBI Extortion',
    titleHi: 'फर्जी डिजिटल अरेस्ट और पुलिस धमकी',
    titleMr: 'बनावट डिजिटल अटक आणि धमकी',
    messageEn:
      'ATTENTION: This is Inspector Ajay Kumar from Mumbai Crime Branch / CBI. A FedEx parcel sent to Cambodia with your Aadhaar contains 5 fake passports and 200g MDMA narcotics. You are under immediate DIGITAL ARREST. Join Skype video call immediately and transfer security collateral to RBI verification escrow.',
    messageHi:
      'सावधान: यह मुंबई क्राइम ब्रांच / सीबीआई से इंस्पेक्टर अजय कुमार हैं। आपके आधार से कंबोडिया भेजे गए पार्सल में 5 जाली पासपोर्ट और नशीले पदार्थ मिले हैं। आपको तत्काल डिजिटल अरेस्ट किया गया है। तुरंत वीडियो कॉल पर आएं और सत्यापन खाते में पैसे ट्रांसफर करें।',
    messageMr:
      'सावधान: मी मुंबई क्राईम ब्रँच / सीबीआयमधून इन्स्पेक्टर अजय कुमार बोलत आहे. तुमच्या आधार कार्डवर परदेशात पाठवलेल्या पार्सलमध्ये बेकायदेशीर ड्रग्ज सापडले आहेत. तुम्हाला डिजिटल अटक करण्यात आली आहे. त्वरित व्हिडिओ कॉलवर या आणि सुरक्षेसाठी खात्यात पैसे पाठवा.',
    questionEn:
      'The caller wears a police uniform on video and demands you stay on the call. What should you do?',
    questionHi: 'फोन करने वाला वीडियो पर पुलिस की वर्दी पहने है और कॉल पर रहने को कह रहा है। आप क्या करेंगे?',
    questionMr: 'व्हिडिओ कॉलवरील व्यक्तीने पोलिसांचा गणवेश घातला असून फोन चालू ठेवण्यास सांगत आहे. तुम्ही काय कराल?',
    choices: [
      {
        id: 'police_safe',
        textEn:
          'Hang up immediately! There is NO legal concept of "Digital Arrest" in Indian law. Call 1930 and inform family or your local police station.',
        textHi:
          'तुरंत फोन काट दें! भारतीय कानून में "डिजिटल अरेस्ट" जैसी कोई चीज नहीं है। 1930 डायल करें और परिजनों व स्थानीय पुलिस को बताएं।',
        textMr:
          'लगेच फोन कट करा! भारतीय कायद्यात "डिजिटल अटक" नावाची कोणतीही कायदेशीर तरतूद नाही. १९३० वर तक्रार करा आणि स्थानिक पोलिसांना सांगा.',
        isSafe: true,
      },
      {
        id: 'police_danger',
        textEn:
          'Do not tell family, stay confined in your room, and transfer savings to prove your innocence to the CBI officer.',
        textHi:
          'परिवार को कुछ न बताएं, कमरे में बंद रहें और अपनी बेगुनाही साबित करने के लिए बताए गए खाते में पैसे ट्रांसफर कर दें।',
        textMr:
          'कुटुंबाला काहीही न सांगता खोलीत बसा आणि स्वतःची निष्पाप सुटका करण्यासाठी त्यांनी दिलेल्या खात्यावर पैसे पाठवा.',
        isSafe: false,
      },
    ],
    explanationEn:
      'The Supreme Court of India, Ministry of Home Affairs, and State Police have repeatedly clarified: Police, CBI, ED, and judges NEVER conduct arrests over WhatsApp, Skype, or phone calls, and NEVER ask citizens to transfer money to "escrow" or "security" accounts. Any threat of "digital arrest" is 100% fraud.',
    explanationHi:
      'गृह मंत्रालय और पुलिस ने स्पष्ट किया है कि भारत में "डिजिटल अरेस्ट" जैसी कोई कानूनी प्रक्रिया नहीं है। पुलिस, सीबीआई या अदालतें कभी भी व्हाट्सएप या स्काइप पर गिरफ्तारी नहीं करतीं और न ही पैसे मांगती हैं। यह पूरी तरह साइबर ठगी है।',
    explanationMr:
      'गृह मंत्रालय आणि पोलिसांनी स्पष्ट केले आहे की "डिजिटल अटक" पूर्णपणे बनावट आहे. पोलीस किंवा सीबीआय कधीही व्हॉट्सॲप किंवा स्काईपवर अटक करत नाहीत आणि कोणत्याही बँक खात्यात पैसे मागू शकत नाहीत.',
    ruleLessonEn:
      'Rule: No police or court will ever arrest you on video call or demand bank transfers to clear your name.',
    ruleLessonHi: 'नियम: कोई भी पुलिस या कोर्ट वीडियो कॉल पर गिरफ्तारी नहीं करता और न पैसे मांगता है।',
    ruleLessonMr: 'नियम: कोणतेही पोलीस किंवा न्यायालय व्हिडिओ कॉलवर अटक करत नाहीत किंवा पैसे मागत नाहीत.',
    safeTipEn: 'There is no concept of "Digital Arrest" in India. Police never demand bank transfers.',
    safeTipHi: 'भारतीय कानून में डिजिटल अरेस्ट नहीं होता। पुलिस कभी पैसे ट्रांसफर करने को नहीं कहती।',
    safeTipMr: 'कायद्यात डिजिटल अटक अस्तित्वात नाही. पोलीस कधीही पैसे पाठवण्यास सांगत नाहीत.',
  },
  {
    id: 'scenario_kyc',
    category: 'kyc',
    topicTitleEn: 'Bank KYC Verification',
    topicTitleHi: 'बैंक केवाईसी सत्यापन',
    topicTitleMr: 'बँक केवायसी पडताळणी',
    titleEn: 'Bank Account KYC Expiry Alert',
    titleHi: 'बैंक खाता केवाईसी बंद होने की चेतावनी',
    titleMr: 'बँक खाते केवायसी बंद होण्याची चेतावणी',
    messageEn:
      'URGENT SBI NOTICE: Your bank account has been suspended due to pending KYC Aadhaar verification. To restore banking services and avoid permanent blocking, click immediately: http://sbi-kyc-verify.vip/portal to submit OTP and PAN.',
    messageHi:
      'महत्वपूर्ण एसबीआई सूचना: आधार केवाईसी लंबित होने के कारण आपका बैंक खाता निलंबित कर दिया गया है। खाता पुनः चालू रखने के लिए तुरंत क्लिक करें: http://sbi-kyc-verify.vip/portal और ओटीपी व पैन दर्ज करें।',
    messageMr:
      'महत्त्वाची एसबीआय सूचना: प्रलंबित आधार केवायसीमुळे तुमचे बँक खाते स्थगित करण्यात आले आहे. सेवा सुरळीत ठेवण्यासाठी त्वरित क्लिक करा: http://sbi-kyc-verify.vip/portal आणि ओटीपी व पॅन टाका.',
    questionEn: 'You hold a savings account in SBI and worry your pension will stop. What should you do?',
    questionHi: 'आपका खाता एसबीआई में है और आपको पेंशन रुकने की चिंता है। आपको क्या करना चाहिए?',
    questionMr: 'तुमचे एसबीआयमध्ये खाते आहे आणि पेन्शन थांबण्याची भीती वाटते. तुम्ही काय करावे?',
    choices: [
      {
        id: 'kyc_safe',
        textEn:
          'Never click links in SMS. Visit your home bank branch in person or use the official bank app downloaded from Play Store.',
        textHi:
          'संदेश में दिए लिंक पर कभी क्लिक न करें। अपनी बैंक शाखा में स्वयं जाएं या आधिकारिक बैंक ऐप का उपयोग करें।',
        textMr:
          'मेसेजमधील लिंकवर कधीही क्लिक करू नका. स्वतः बँकेच्या शाखेत जा किंवा अधिकृत ॲप वापरा.',
        isSafe: true,
      },
      {
        id: 'kyc_danger',
        textEn:
          'Quickly open the link, enter your internet banking password, and submit the OTP you receive on SMS.',
        textHi:
          'जल्दी से लिंक खोलें, अपनी इंटरनेट बैंकिंग आईडी और पासवर्ड दर्ज करें और फोन पर आया ओटीपी डाल दें।',
        textMr:
          'घाईघाईने लिंक उघडून इंटरनेट बँकिंगचा पासवर्ड टाका आणि मोबाईलवर आलेला ओटीपी सबमिट करा.',
        isSafe: false,
      },
    ],
    explanationEn:
      'RBI strictly forbids banks from asking customers to update KYC via SMS links. Genuine banks never send links with unofficial domain extensions like .vip, .xyz, or .top. Clicking fake phishing links allows scammers to harvest your banking credentials and drain your funds.',
    explanationHi:
      'आरबीआई के नियमानुसार बैंक कभी भी एसएमएस में लिंक भेजकर केवाईसी अपडेट करने को नहीं कहते। .vip या .xyz जैसे लिंक फर्जी होते हैं। ऐसे लिंक पर पासवर्ड या ओटीपी डालते ही बैंक से पैसे कट जाते हैं।',
    explanationMr:
      'आरबीआयच्या नियमांनुसार बँका कधीही एसएमएस लिंकद्वारे केवायसी अपडेट करण्यास सांगत नाहीत. बनावट लिंकवर पासवर्ड किंवा ओटीपी दिल्यास खात्यातील सर्व पैसे चोरीला जाऊ शकतात.',
    ruleLessonEn:
      'Rule: Banks never send website links via SMS for KYC updates. Always update KYC at your home branch.',
    ruleLessonHi: 'नियम: बैंक कभी भी केवाईसी के लिए एसएमएस में वेबसाइट लिंक नहीं भेजते। हमेशा बैंक शाखा जाएं।',
    ruleLessonMr: 'नियम: केवायसी अपडेट करण्यासाठी बँका कधीही मेसेजमध्ये लिंक पाठवत नाहीत. थेट बँकेच्या शाखेत जा.',
    safeTipEn: 'Banks never send website links via SMS for KYC. Update KYC only at your home branch.',
    safeTipHi: 'केवाईसी के लिए बैंक कभी एसएमएस लिंक नहीं भेजते। हमेशा अपनी शाखा जाएं।',
    safeTipMr: 'केवायसीसाठी बँका कधीही लिंक पाठवत नाहीत. नेहमी प्रत्यक्ष शाखेत जा.',
  },
  {
    id: 'scenario_otp_upi',
    category: 'otp_upi',
    topicTitleEn: 'OTP & UPI PIN Protection',
    topicTitleHi: 'ओटीपी और यूपीआई पिन सुरक्षा',
    topicTitleMr: 'ओटीपी आणि युपीआय पिन सुरक्षा',
    titleEn: 'Fraud Reversal Call & OTP Request',
    titleHi: 'फ्रॉड कैंसलेशन कॉल और ओटीपी अनुरोध',
    titleMr: 'फ्रॉड रद्द कॉल आणि ओटीपी विनंती',
    messageEn:
      'CALLER CLAIMING TO BE BANK FRAUD DESK: "Sir, an unauthorized debit of ₹49,999 has just been initiated on your credit card at an electronics store. To block this transaction immediately and reverse the funds, please tell me the 6-digit OTP code sent to your mobile right now."',
    messageHi:
      'कॉल पर बैंक धोखाधड़ी रोकथाम अधिकारी: "सर, आपके क्रेडिट कार्ड से अभी ₹49,999 का अनधिकृत लेनदेन शुरू हुआ है। इसे तुरंत रोकने और पैसे वापस करने के लिए, कृपया आपके फोन पर आया 6-अंकों का ओटीपी तुरंत बताएं।"',
    messageMr:
      'कॉलवरील बँक अधिकारी: "सर, तुमच्या कार्डवरून ₹४९,९९९ चा अनधिकृत व्यवहार सुरू झाला आहे. हा व्यवहार त्वरित थांबवण्यासाठी आणि पैसे परत मिळवण्यासाठी तुमच्या मोबाईलवर आलेला ६-अंकी ओटीपी सांगा."',
    questionEn:
      'The caller urges that you only have 2 minutes before the money is permanently deducted. What should you do?',
    questionHi: 'कॉल करने वाला जोर देकर कह रहा है कि पैसे कटने से पहले आपके पास सिर्फ 2 मिनट हैं। आप क्या करेंगे?',
    questionMr: 'पैसे कट होण्यापूर्वी तुमच्याकडे फक्त २ मिनिटे आहेत असे सांगून कॉलर घाई करत आहे. तुम्ही काय कराल?',
    choices: [
      {
        id: 'otp_safe',
        textEn:
          'Disconnect immediately! OTP is a secret key to authorize payments. Legitimate bank staff never need your OTP to block a card or stop fraud.',
        textHi:
          'तुरंत फोन काट दें! ओटीपी पैसे काटने का गुप्त कोड है। बैंक कर्मचारी कभी भी कार्ड ब्लॉक करने या लेन-देन रोकने के लिए ओटीपी नहीं मांगते।',
        textMr:
          'लगेच फोन कट करा! ओटीपी हा पैसे वजा करण्याचा गुप्त कोड आहे. बँक कर्मचारी कार्ड ब्लॉक करण्यासाठी कधीही ओटीपी मागत नाहीत.',
        isSafe: true,
      },
      {
        id: 'otp_danger',
        textEn:
          'Quickly read out the 6-digit OTP code to the caller so they can cancel the ₹49,999 deduction.',
        textHi:
          'पैसे कटने से बचाने के लिए तुरंत फोन पर आया 6-अंकों का ओटीपी कॉलर को बता दें।',
        textMr:
          '₹४९,९९९ चे नुकसान टाळण्यासाठी कॉलरला मोबाईलवर आलेला ६-अंकी ओटीपी लगेच सांगा.',
        isSafe: false,
      },
    ],
    explanationEn:
      'An OTP (One-Time Password) is your electronic approval to withdraw or transfer money out of your account. Bank systems can block cards or freeze suspicious accounts internally without customer OTPs. Scammers invent fake fraudulent charges to cause panic and steal your OTP.',
    explanationHi:
      'ओटीपी आपके खाते से पैसे निकालने की इलेक्ट्रॉनिक स्वीकृति है। बैंक संदिग्ध लेनदेन रोकने या कार्ड ब्लॉक करने के लिए कभी ग्राहक से ओटीपी नहीं मांगते। ठग झूठा डर दिखाकर ओटीपी हासिल कर लेते हैं।',
    explanationMr:
      'ओटीपी म्हणजे तुमच्या खात्यातून पैसे काढण्याची इलेक्ट्रॉनिक परवानगी. संशयास्पद व्यवहार थांबवण्यासाठी बँकेला ग्राहकाकडून ओटीपी घेण्याची गरज नसते. भामटे भीती दाखवून ओटीपी मागतात.',
    ruleLessonEn:
      'Rule: Never share your OTP with anyone on call or message, even if they claim to be from bank security.',
    ruleLessonHi: 'नियम: बैंक सुरक्षा का दावा करने वाले किसी भी व्यक्ति को फोन पर कभी ओटीपी न बताएं।',
    ruleLessonMr: 'नियम: बँकेतून बोलत असल्याचा दावा करणाऱ्या कोणालाही फोनवर कधीही ओटीपी सांगू नका.',
    safeTipEn: 'OTP is strictly for approving payments. Bank employees never need your OTP to stop fraud.',
    safeTipHi: 'ओटीपी केवल भुगतान की अनुमति के लिए है। बैंक कभी धोखाधड़ी रोकने के लिए ओटीपी नहीं मांगते।',
    safeTipMr: 'ओटीपी फक्त पैसे देण्यासाठी असतो. व्यवहार थांबवण्यासाठी बँक कधीही ओटीपी मागत नाही.',
  },
  {
    id: 'scenario_delivery',
    category: 'delivery',
    topicTitleEn: 'Parcel Delivery & Couriers',
    topicTitleHi: 'पार्सल डिलीवरी और कूरियर',
    topicTitleMr: 'पार्सल डिलिव्हरी आणि कुरिअर',
    titleEn: 'Fake Parcel Delivery Payment Link',
    titleHi: 'फर्जी पार्सल डिलीवरी और पेमेंट लिंक',
    titleMr: 'बनावट पार्सल डिलिव्हरी आणि पेमेंट लिंक',
    messageEn:
      'India Post Alert: Package #IN-78219 arrived at terminal hub but cannot be delivered due to missing house number. Please update your address and pay ₹15 re-delivery charge within 12 hours at: http://indiapost-redelivery.top or parcel will be returned.',
    messageHi:
      'इंडिया पोस्ट सूचना: पार्सल #IN-78219 टर्मिनल पर आ गया है लेकिन अधूरा पता होने के कारण डिलीवर नहीं हो सका। कृपया अपना पता अपडेट करें और 12 घंटे में ₹15 शुल्क भरें: http://indiapost-redelivery.top अन्यथा पार्सल वापस भेज दिया जाएगा।',
    messageMr:
      'इंडिया पोस्ट सूचना: पार्सल #IN-78219 पोहोचले आहे परंतु घराचा पत्ता अपूर्ण असल्याने वितरित करता आले नाही. कृपया १२ तासांत पत्ता अपडेट करा आणि ₹१५ शुल्क भरा: http://indiapost-redelivery.top अन्यथा पार्सल परत पाठवले जाईल.',
    questionEn:
      'You were expecting a family package. The charge is only ₹15. What is the safest response?',
    questionHi: 'आप किसी पार्सल का इंतजार कर रहे थे और शुल्क सिर्फ ₹15 है। सबसे सुरक्षित प्रतिक्रिया क्या है?',
    questionMr: 'तुम्ही एखाद्या पार्सलची वाट पाहत होतात आणि शुल्क फक्त ₹१५ आहे. सर्वात सुरक्षित पाऊल कोणते?',
    choices: [
      {
        id: 'delivery_safe',
        textEn:
          'Do not click the link! Track your parcel only on official indiapost.gov.in using your original tracking number.',
        textHi:
          'लिंक पर क्लिक न करें! अपने मूल ट्रैकिंग नंबर से केवल आधिकारिक indiapost.gov.in वेबसाइट पर ही पार्सल ट्रैक करें।',
        textMr:
          'लिंकवर क्लिक करू नका! मूळ ट्रॅकिंग नंबर वापरून फक्त अधिकृत indiapost.gov.in वर पार्सल तपासा.',
        isSafe: true,
      },
      {
        id: 'delivery_danger',
        textEn:
          'Open the link, input your home address, and enter your debit card number, expiry, CVV, and OTP to pay ₹15.',
        textHi:
          'लिंक खोलें, अपना पता लिखें और ₹15 चुकाने के लिए डेबिट कार्ड नंबर, सीवीवी व ओटीपी दर्ज करें।',
        textMr:
          'लिंक उघडून पत्ता टाका आणि ₹१५ भरण्यासाठी डेबिट कार्ड नंबर, सीव्हीव्ही आणि ओटीपी सबमिट करा.',
        isSafe: false,
      },
    ],
    explanationEn:
      'Phishing websites use tiny charges (like ₹15 or ₹25) to lower your guard. When you enter card details and submit the OTP on the fake website, scammers initiate a major debit of thousands of rupees instead of ₹15. Genuine postal services use only .gov.in domains.',
    explanationHi:
      'फिशिंग वेबसाइट्स केवल ₹15 या ₹25 जैसी छोटी रकम का झांसा देती हैं ताकि आप बेफिक्र रहें। कार्ड विवरण और ओटीपी डालते ही खाते से हजारों रुपये कट जाते हैं। सरकारी डाक विभाग केवल .gov.in डोमेन का उपयोग करता है।',
    explanationMr:
      'फसव्या वेबसाइट्स फक्त ₹१५ किंवा ₹२५ सारख्या लहान रकमेचे आमिष दाखवतात. कार्डची माहिती आणि ओटीपी भरताच खात्यातून हजारो रुपये काढले जातात. पोस्टाची अधिकृत साईट नेहमी .gov.in असते.',
    ruleLessonEn:
      'Rule: Official postal services never send unofficial .top or .xyz links demanding payment for address correction.',
    ruleLessonHi: 'नियम: डाक विभाग कभी भी पता सुधारने या शुल्क के लिए अनधिकृत .top या .xyz लिंक नहीं भेजता।',
    ruleLessonMr: 'नियम: टपाल विभाग कधीही पत्ता बदलण्यासाठी किंवा शुल्कासाठी बनावट लिंक पाठवत नाही.',
    safeTipEn: 'Tiny re-delivery fees are traps to capture your debit card details and OTP.',
    safeTipHi: 'री-डिलीवरी के नाम पर ₹15 का छोटा शुल्क कार्ड विवरण चुराने का जाल है।',
    safeTipMr: 'पुन्हा डिलिव्हरीसाठी ₹१५ चे शुल्क हे कार्डची माहिती चोरण्यासाठी टाकलेला सापळा आहे.',
  },
  {
    id: 'scenario_malware',
    category: 'malware',
    topicTitleEn: 'Malicious APK & Downloads',
    topicTitleHi: 'दुर्भावनापूर्ण ऐप व डाउनलोड',
    topicTitleMr: 'घातक ॲप्स आणि डाऊनलोड्स',
    titleEn: 'Malicious APK Installation Request',
    titleHi: 'दुर्भावनापूर्ण एपीके ऐप डाउनलोड करने का अनुरोध',
    titleMr: 'घातक एपीके ॲप डाऊनलोड करण्याची विनंती',
    messageEn:
      'WHATSAPP MESSAGE FROM "SBI PENSION DESK": "Respected Pensioner, RBI has launched 5G Instant Pension Credit. To receive enhanced monthly interest, install our mandatory verified security module: SBI_Pension_Rewards_5G.apk (attached file). Open the file and tap Allow All Permissions."',
    messageHi:
      'व्हाट्सएप पर संदेश "एसबीआई पेंशन डेस्क": "आदरणीय पेंशनभोगी, आरबीआई ने 5G तुरंत पेंशन क्रेडिट शुरू किया है। बढ़ी हुई पेंशन पाने के लिए हमारा सुरक्षा मॉड्यूल इंस्टॉल करें: SBI_Pension_Rewards_5G.apk। फाइल खोलें और सभी अनुमतियां दें।"',
    messageMr:
      'व्हॉट्सॲपवर मेसेज "एसबीआय पेन्शन डेस्क": "आदरणीय पेन्शनधारक, वाढीव पेन्शन आणि व्याजासाठी आमचे अधिकृत सुरक्षा ॲप इन्स्टॉल करा: SBI_Pension_Rewards_5G.apk। फाईल उघडा आणि सर्व परवानग्या द्या."',
    questionEn:
      'A message asks you to download and install an APK file directly from WhatsApp. What should you do?',
    questionHi: 'व्हाट्सएप पर आया संदेश सीधे एपीके फाइल डाउनलोड और इंस्टॉल करने को कह रहा है। आप क्या करेंगे?',
    questionMr: 'व्हॉट्सॲपवर आलेला मेसेज थेट एपीके फाईल इन्स्टॉल करण्यास सांगत आहे. तुम्ही काय कराल?',
    choices: [
      {
        id: 'apk_safe',
        textEn:
          'Delete the message and block sender! Never install APK files from WhatsApp or SMS. Banks distribute apps ONLY through Google Play Store.',
        textHi:
          'संदेश तुरंत डिलीट करें और नंबर ब्लॉक करें! व्हाट्सएप या एसएमएस से कभी एपीके इंस्टॉल न करें। बैंक केवल गूगल प्ले स्टोर से ऐप देते हैं।',
        textMr:
          'मेसेज लगेच डिलीट करा आणि नंबर ब्लॉक करा! व्हॉट्सॲपवरून कधीही एपीके इन्स्टॉल करू नका. बँकांचे ॲप्स फक्त गुगल प्ले स्टोअरवर असतात.',
        isSafe: true,
      },
      {
        id: 'apk_danger',
        textEn:
          'Download SBI_Pension_Rewards_5G.apk, enable "Install unknown apps" in Android settings, and grant SMS and Accessibility permissions.',
        textHi:
          'एपीके डाउनलोड करें, फोन सेटिंग्स में "अज्ञात स्रोत से इंस्टॉल" चालू करें और एसएमएस व सभी अनुमतियां दे दें।',
        textMr:
          'एपीके डाऊनलोड करा, फोनमध्ये अज्ञात स्त्रोतावरून इन्स्टॉल करण्यास परवानगी द्या आणि एसएमएस ॲक्सेस द्या.',
        isSafe: false,
      },
    ],
    explanationEn:
      'Malicious APK files sent over WhatsApp or SMS are banking trojans. Once installed, they read your SMS messages to intercept OTPs silently, record your keystrokes, and transfer money out of your accounts without showing any notifications on your screen.',
    explanationHi:
      'व्हाट्सएप या एसएमएस पर भेजी जाने वाली एपीके फाइलें वायरस होती हैं। एक बार इंस्टॉल होने के बाद ये आपके फोन से आने वाले ओटीपी चुरा लेती हैं और बिना आपकी जानकारी के बैंक खाते से पैसे निकाल लेती हैं।',
    explanationMr:
      'व्हॉट्सॲप किंवा मेसेजवर येणाऱ्या एपीके फाईल्स या धोकादायक मालवेअर असतात. एकदा इन्स्टॉल झाल्यावर त्या तुमच्या फोनमधील ओटीपी चोरतात आणि खात्यातील पैसे लंपास करतात.',
    ruleLessonEn:
      'Rule: Never install APK files sent via WhatsApp, SMS, or Telegram. Only install apps from Google Play Store.',
    ruleLessonHi: 'नियम: व्हाट्सएप या एसएमएस पर आई एपीके फाइलों को कभी इंस्टॉल न करें। केवल गूगल प्ले स्टोर का उपयोग करें।',
    ruleLessonMr: 'नियम: व्हॉट्सॲप किंवा मेसेजवरील एपीके फाईल्स कधीही इन्स्टॉल करू नका. फक्त प्ले स्टोअर वापरा.',
    safeTipEn: 'Install apps only from Google Play Store. Never install APK files sent via chat.',
    safeTipHi: 'केवल गूगल प्ले स्टोर से ही ऐप डाउनलोड करें। चैट पर आई एपीके कभी न खोलें।',
    safeTipMr: 'फक्त गुगल प्ले स्टोअरवरूनच ॲप्स डाऊनलोड करा. मेसेजवरील एपीके कधीही उघडू नका.',
  },
  {
    id: 'scenario_qr_fraud',
    category: 'qr_fraud',
    topicTitleEn: 'QR Codes & UPI Fraud',
    topicTitleHi: 'क्यूआर कोड और यूपीआई फ्रॉड',
    topicTitleMr: 'क्यूआर कोड आणि युपीआय फसवणूक',
    titleEn: 'Receive Money QR Code Scam',
    titleHi: 'पैसे प्राप्त करने के लिए क्यूआर कोड घोटाला',
    titleMr: 'पैसे मिळवण्यासाठी क्यूआर कोड घोटाळा',
    messageEn:
      'BUYER ON PHONE: "Sir, I want to purchase your old sofa set on OLX. I am paying ₹15,000 in advance via PhonePe/Google Pay. I am sending you a QR code on WhatsApp. Please scan it and enter your 4-digit UPI PIN so the ₹15,000 is credited into your bank account immediately."',
    messageHi:
      'फोन पर खरीदार: "सर, मैं आपका पुराना सोफा खरीद रहा हूँ। मैं फोनपे से ₹15,000 एडवांस भेज रहा हूँ। मैंने व्हाट्सएप पर एक क्यूआर कोड भेजा है। पैसे आपके खाते में जमा होने के लिए कृपया इसे स्कैन करें और अपना 4-अंकीय यूपीआई पिन डालें।"',
    messageMr:
      'खरेदीदार फोनवर: "सर, मी तुमचा जुना सोफा विकत घेत आहे. मी ₹१५,००० ॲडव्हान्स पाठवत आहे. मी व्हॉट्सॲपवर क्यूआर कोड पाठवला आहे. पैसे खात्यात येण्यासाठी तो स्कॅन करा आणि तुमचा युपीआय पिन टाका."',
    questionEn: 'The buyer is insisting and rushing you to scan. How should you react?',
    questionHi: 'खरीदार जल्दबाजी कर रहा है और तुरंत स्कैन करने को कह रहा है। आप क्या करेंगे?',
    questionMr: 'खरेदीदार घाई करत असून लगेच स्कॅन करण्यास सांगत आहे. तुम्ही काय कराल?',
    choices: [
      {
        id: 'qr_safe',
        textEn:
          'Refuse to scan! You NEVER enter a UPI PIN or scan a QR code to RECEIVE money. Entering your PIN will DEBIT money from your account.',
        textHi:
          'स्कैन करने से साफ मना करें! पैसे प्राप्त करने के लिए कभी भी क्यूआर कोड स्कैन या यूपीआई पिन नहीं डाला जाता। पिन डालने से आपके खाते से पैसे कट जाएंगे।',
        textMr:
          'स्कॅन करण्यास स्पष्ट नकार द्या! पैसे मिळवण्यासाठी कधीही क्यूआर कोड स्कॅन करावा लागत नाही किंवा पिन टाकावा लागत नाही. पिन टाकल्यास तुमचेच पैसे जातील.',
        isSafe: true,
      },
      {
        id: 'qr_danger',
        textEn:
          'Scan the WhatsApp QR code in PhonePe/GPay and enter your secret 4-digit UPI PIN to accept the ₹15,000 credit.',
        textHi:
          'व्हाट्सएप पर आया क्यूआर कोड स्कैन करें और ₹15,000 जमा करने के लिए अपना गुप्त 4-अंकीय यूपीआई पिन दर्ज करें।',
        textMr:
          'व्हॉट्सॲपवर आलेला क्यूआर कोड स्कॅन करा आणि ₹१५,००० खात्यात येण्यासाठी तुमचा गुप्त युपीआय पिन टाका.',
        isSafe: false,
      },
    ],
    explanationEn:
      'GOLDEN RULE OF UPI: You only enter your UPI PIN to SEND money or deduct balance from your bank. Receiving money requires ZERO action from your side; money gets credited automatically. Anyone telling you to "scan a QR code to receive payment" is a scammer trying to debit your account.',
    explanationHi:
      'यूपीआई का स्वर्णिम नियम: यूपीआई पिन केवल पैसे भेजने (खाते से काटने) के लिए डाला जाता है। पैसे प्राप्त करने के लिए कभी भी पिन डालने या क्यूआर कोड स्कैन करने की आवश्यकता नहीं होती।',
    explanationMr:
      'युपीआयचा सुवर्ण नियम: युपीआय पिन फक्त पैसे देण्यासाठी (खात्यातून वजा होण्यासाठी) लागतो. पैसे मिळवण्यासाठी कधीही पिन टाकण्याची किंवा क्यूआर कोड स्कॅन करण्याची गरज नसते.',
    ruleLessonEn:
      'Rule: UPI PIN is strictly for paying. You NEVER enter a PIN or scan a QR code to receive money.',
    ruleLessonHi: 'नियम: यूपीआई पिन केवल भुगतान के लिए है। पैसे पाने के लिए कभी पिन न डालें।',
    ruleLessonMr: 'नियम: युपीआय पिन फक्त पैसे देण्यासाठी आहे. पैसे मिळवण्यासाठी कधीही पिन टाकू नका.',
    safeTipEn: 'You NEVER enter a UPI PIN or scan a QR code to receive money.',
    safeTipHi: 'पैसे प्राप्त करने के लिए कभी भी यूपीआई पिन या क्यूआर स्कैन की जरूरत नहीं होती।',
    safeTipMr: 'पैसे मिळवण्यासाठी कधीही युपीआय पिन टाकण्याची किंवा क्यूआर स्कॅन करण्याची गरज नसते.',
  },
  {
    id: 'scenario_helpline',
    category: 'helpline',
    topicTitleEn: 'Customer Care & Remote Apps',
    topicTitleHi: 'कस्टमर केयर और रिमोट ऐप',
    topicTitleMr: 'कस्टमर केअर आणि रिमोट ॲप्स',
    titleEn: 'Fake Customer Care Number & Remote Access',
    titleHi: 'फर्जी कस्टमर केयर नंबर और स्क्रीन शेयरिंग',
    titleMr: 'बनावट कस्टमर केअर आणि स्क्रीन शेअरिंग',
    messageEn:
      'PHONE CALL WITH "AIRLINE SUPPORT HELPLINE": "Sir, we received your flight cancellation request. To process your ₹5,500 refund back to your bank account, please install AnyDesk / QuickSupport from Google Play Store and give me the 9-digit address code so our system can reverse the funds."',
    messageHi:
      'कॉल पर "एयरलाइन कस्टमर सपोर्ट": "सर, आपकी टिकट कैंसलेशन का ₹5,500 रिफंड वापस भेजने के लिए, कृपया प्ले स्टोर से AnyDesk / QuickSupport ऐप डाउनलोड करें और अपनी स्क्रीन पर दिख रहा 9-अंकों का कोड बताएं।"',
    messageMr:
      'कॉलवर "विमान कंपनी कस्टमर केअर": "सर, तुमचे तिकीट रद्द झाले असून ₹५,५०० चा परतावा खात्यात पाठवण्यासाठी, कृपया AnyDesk किंवा QuickSupport ॲप इन्स्टॉल करा आणि स्क्रीनवरील ९-अंकी कोड सांगा."',
    questionEn:
      'The support representative asks you to install a remote access app to assist your refund. What should you do?',
    questionHi: 'कस्टमर केयर प्रतिनिधि रिफंड के लिए रिमोट स्क्रीन ऐप डाउनलोड करने को कह रहा है। आप क्या करेंगे?',
    questionMr: 'कस्टमर केअर प्रतिनिधी परताव्यासाठी स्क्रीन शेअरिंग ॲप डाऊनलोड करण्यास सांगत आहे. तुम्ही काय कराल?',
    choices: [
      {
        id: 'helpline_safe',
        textEn:
          'Hang up immediately! Legitimate customer support NEVER asks you to install AnyDesk, TeamViewer, or remote access apps.',
        textHi:
          'तुरंत फोन काट दें! असली कस्टमर केयर कभी भी AnyDesk, TeamViewer या रिमोट ऐप डाउनलोड करने को नहीं कहते।',
        textMr:
          'लगेच फोन कट करा! अधिकृत कस्टमर केअर कधीही AnyDesk किंवा स्क्रीन शेअरिंग ॲप इन्स्टॉल करण्यास सांगत नाही.',
        isSafe: true,
      },
      {
        id: 'helpline_danger',
        textEn:
          'Install AnyDesk and read out the 9-digit remote control code so the support agent can process the refund.',
        textHi:
          'AnyDesk ऐप डाउनलोड करें और रिफंड पाने के लिए स्क्रीन पर दिख रहा 9-अंकों का कोड प्रतिनिधि को बता दें।',
        textMr:
          'AnyDesk डाऊनलोड करा आणि परतावा मिळवण्यासाठी प्रतिनिधीला स्क्रीनवरील ९-अंकी कोड सांगा.',
        isSafe: false,
      },
    ],
    explanationEn:
      'AnyDesk, QuickSupport, and TeamViewer are remote desktop tools. Giving someone the access code gives them complete visual and touch control over your smartphone. Scammers open your banking apps, read SMS OTPs, and steal your money directly before your eyes.',
    explanationHi:
      'AnyDesk या QuickSupport रिमोट स्क्रीन शेयरिंग ऐप हैं। इनका कोड किसी को देने का मतलब है अपने पूरे फोन का नियंत्रण उसे सौंप देना। ठग आपकी स्क्रीन देखते हुए बैंकिंग ऐप खोलते हैं और पैसे ट्रांसफर कर लेते हैं।',
    explanationMr:
      'AnyDesk किंवा QuickSupport ही रिमोट ॲक्सेस ॲप्स आहेत. त्यांचा कोड दिल्यास भामट्यांना तुमच्या फोनचा पूर्ण ताबा मिळतो. ते तुमच्या देखत बँकेचे ॲप्स उघडून सर्व पैसे चोरून घेतात.',
    ruleLessonEn:
      'Rule: Never install screen-sharing apps (AnyDesk, TeamViewer) at the request of any phone caller.',
    ruleLessonHi: 'नियम: फोन पर किसी के भी कहने पर कभी स्क्रीन-शेयरिंग ऐप (AnyDesk आदि) डाउनलोड न करें।',
    ruleLessonMr: 'नियम: फोनवरील व्यक्तीच्या सांगण्यावरून कधीही स्क्रीन शेअरिंग ॲप डाऊनलोड करू नका.',
    safeTipEn: 'Legitimate customer care never asks you to install screen-sharing software.',
    safeTipHi: 'असली कस्टमर केयर कभी स्क्रीन शेयरिंग ऐप डाउनलोड करने को नहीं कहते।',
    safeTipMr: 'अधिकृत कस्टमर केअर कधीही स्क्रीन शेअरिंग ॲप डाऊनलोड करण्यास सांगत नाही.',
  },
];
