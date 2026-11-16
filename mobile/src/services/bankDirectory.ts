/**
 * ScamShield Indian Bank Emergency Directory & Freeze Notice Generator
 *
 * Provides verified official emergency helplines for major Indian banks
 * and generates human-reviewed bank freeze notices.
 * Never performs background bank transactions or silent SMS.
 */

export interface BankHelpline {
  id: string;
  name: string;
  nameHi: string;
  nameMr: string;
  phone: string;
  displayPhone: string;
  category: 'public' | 'private';
}

export const INDIAN_BANKS: BankHelpline[] = [
  {
    id: 'sbi',
    name: 'State Bank of India (SBI)',
    nameHi: 'भारतीय स्टेट बैंक (SBI)',
    nameMr: 'स्टेट बँक ऑफ इंडिया (SBI)',
    phone: '1800111109',
    displayPhone: '1800 11 1109',
    category: 'public',
  },
  {
    id: 'hdfc',
    name: 'HDFC Bank',
    nameHi: 'एचडीएफसी बैंक (HDFC)',
    nameMr: 'एचडीएफसी बँक (HDFC)',
    phone: '18001600',
    displayPhone: '1800 1600',
    category: 'private',
  },
  {
    id: 'icici',
    name: 'ICICI Bank',
    nameHi: 'आईसीआईसीआई बैंक (ICICI)',
    nameMr: 'आयसीआयसीआय बँक (ICICI)',
    phone: '18001080',
    displayPhone: '1800 1080',
    category: 'private',
  },
  {
    id: 'pnb',
    name: 'Punjab National Bank (PNB)',
    nameHi: 'पंजाब नेशनल बैंक (PNB)',
    nameMr: 'पंजाब नॅशनल बँक (PNB)',
    phone: '18001802222',
    displayPhone: '1800 180 2222',
    category: 'public',
  },
  {
    id: 'axis',
    name: 'Axis Bank',
    nameHi: 'एक्सिस बैंक (Axis)',
    nameMr: 'अ‍ॅक्सिस बँक (Axis)',
    phone: '18604195555',
    displayPhone: '1860 419 5555',
    category: 'private',
  },
  {
    id: 'bob',
    name: 'Bank of Baroda',
    nameHi: 'बैंक ऑफ बड़ौदा (BOB)',
    nameMr: 'बँक ऑफ बडोदा (BOB)',
    phone: '18005700',
    displayPhone: '1800 5700',
    category: 'public',
  },
  {
    id: 'canara',
    name: 'Canara Bank',
    nameHi: 'केनरा बैंक (Canara)',
    nameMr: 'कॅनरा बँक (Canara)',
    phone: '18004250018',
    displayPhone: '1800 425 0018',
    category: 'public',
  },
  {
    id: 'kotak',
    name: 'Kotak Mahindra Bank',
    nameHi: 'कोटक महिंद्रा बैंक (Kotak)',
    nameMr: 'कोटक महिंद्रा बँक (Kotak)',
    phone: '18602662666',
    displayPhone: '1860 266 2666',
    category: 'private',
  },
  {
    id: 'union',
    name: 'Union Bank of India',
    nameHi: 'यूनियन बैंक ऑफ इंडिया',
    nameMr: 'युनियन बँक ऑफ इंडिया',
    phone: '1800222244',
    displayPhone: '1800 22 2244',
    category: 'public',
  },
];

export interface BankFreezeNoticeParams {
  bankName: string;
  accountLast4: string;
  incidentType: string;
  timestamp?: string;
}

export type EmergencyFamilyMessageType = 'fraud_alert' | 'verify_request';

/**
 * Searches the verified bank directory by bank name, ID, or localized name.
 * Returns undefined if no verified record exists so the UI can present safety warnings.
 */
export function findBankHelpline(query: string): BankHelpline | undefined {
  if (!query || !query.trim()) return undefined;
  const clean = query.trim().toLowerCase();
  return INDIAN_BANKS.find(
    (b) =>
      b.id.toLowerCase() === clean ||
      b.name.toLowerCase().includes(clean) ||
      (b.nameHi && b.nameHi.toLowerCase().includes(clean)) ||
      (b.nameMr && b.nameMr.toLowerCase().includes(clean))
  );
}

/**
 * Generates an official, senior-friendly standardized freeze notice template.
 * Strictly designed to be reviewed and copied/shared by the user.
 * Never performs background bank transactions or silent SMS.
 */
export function generateBankFreezeNotice(params: BankFreezeNoticeParams): string {
  const time = params.timestamp || new Date().toLocaleString('en-IN');
  const safeDigits = params.accountLast4.trim().slice(-4);

  return (
    `URGENT NOTICE TO ${params.bankName.toUpperCase()} FRAUD MONITORING TEAM\n\n` +
    `Subject: Immediate Request to Freeze/Block Account & UPI Facilities\n\n` +
    `Dear Bank Manager / Fraud Helpline Team,\n\n` +
    `I am the primary account holder of account ending in ****${safeDigits}.\n` +
    `I have identified suspected digital fraud / unauthorized cyber activity:\n` +
    `• Incident Nature: ${params.incidentType}\n` +
    `• Reported At: ${time}\n\n` +
    `Please IMMEDIATELY block/freeze all debit card transactions, UPI services, and internet banking channels associated with this account to prevent unauthorized financial loss.\n\n` +
    `I am simultaneously lodging a formal complaint with the National Cyber Crime Portal (1930 / cybercrime.gov.in).\n\n` +
    `Kindly confirm the temporary freeze reference number at your earliest.\n\n` +
    `Account Holder (Ending in ****${safeDigits})`
  );
}

/**
 * Generates clear, non-panicking emergency message templates for trusted family members.
 * Requires explicit user copy or share action. Strictly omits any private credentials.
 */
export function generateFamilyEmergencyNotice(
  type: EmergencyFamilyMessageType,
  customDetails?: string
): string {
  const time = new Date().toLocaleString('en-IN');
  if (type === 'fraud_alert') {
    return (
      `EMERGENCY SECURITY ALERT FROM FAMILY MEMBER\n\n` +
      `Reported: ${time}\n\n` +
      `I suspect a digital scam or unauthorized transaction on my bank account.\n` +
      `${customDetails ? `Details: ${customDetails}\n` : ''}\n` +
      `Immediate Actions Taken:\n` +
      `1. Contacting National Cyber Crime Helpline 1930.\n` +
      `2. Contacting my bank's fraud helpline to block cards & UPI.\n` +
      `3. I have NOT shared any remaining OTPs, PINs, or passwords.\n\n` +
      `Please call me as soon as you see this message to help me verify my account safety.`
    );
  }

  return (
    `FAMILY SAFETY CHECK REQUEST\n\n` +
    `Reported: ${time}\n\n` +
    `I just received a suspicious call or message claiming to be urgent.\n` +
    `${customDetails ? `Situation: ${customDetails}\n` : ''}\n` +
    `I paused and did NOT click any links, install any APK apps, or enter my UPI PIN.\n\n` +
    `Could you please call me or check this message with me before I take any action?`
  );
}

