import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Linking, Clipboard, Share } from 'react-native';
import { EmergencyScreen } from '../src/screens/EmergencyScreen';
import { FamilyCircleScreen } from '../src/screens/FamilyCircleScreen';
import { INDIAN_BANKS, findBankHelpline, generateFamilyEmergencyNotice } from '../src/services/bankDirectory';
import { StorageService } from '../src/services/storage';
import i18n from '../src/i18n';

describe('Stage 3.9: Emergency Mode & Family Safety Circle Refinement', () => {
  beforeEach(async () => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    StorageService._resetAllForTesting();
    await act(async () => {
      await i18n.changeLanguage('en');
    });
    jest.spyOn(Linking, 'openURL').mockResolvedValue(true as any);
    jest.spyOn(Clipboard, 'setString').mockImplementation(() => {});
    jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' } as any);
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });
  });

  describe('EmergencyScreen: Helpline 1930 & Official Portal', () => {
    it('confirms and triggers 1930 dialer upon explicit user confirmation', async () => {
      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<EmergencyScreen onBack={jest.fn()} />);
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      const root = tree!.root;

      // 1930 Call button
      const call1930Btn = root.findByProps({ accessibilityLabel: '🚨 Call 1930 Helpline' });
      act(() => {
        call1930Btn.props.onPress();
      });

      // Confirmation dialog is shown
      expect(root.findByProps({ children: 'Call National Cyber Helpline (1930)?' })).toBeDefined();

      // Confirm dial action
      const confirmBtn = root.findByProps({ accessibilityLabel: 'Call 1930 Now' });
      act(() => {
        confirmBtn.props.onPress();
      });

      expect(Linking.openURL).toHaveBeenCalledWith('tel:1930');
    });

    it('confirms and opens official cybercrime.gov.in portal in browser', async () => {
      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<EmergencyScreen onBack={jest.fn()} />);
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      const root = tree!.root;

      // Portal button
      const portalBtn = root.findByProps({ accessibilityLabel: '🌐 Open cybercrime.gov.in' });
      act(() => {
        portalBtn.props.onPress();
      });

      expect(root.findByProps({ children: 'Open Cybercrime Portal?' })).toBeDefined();

      const confirmPortalBtn = root.findByProps({ accessibilityLabel: 'Open Portal' });
      act(() => {
        confirmPortalBtn.props.onPress();
      });

      expect(Linking.openURL).toHaveBeenCalledWith('https://cybercrime.gov.in');
    });

    it('renders financial fraud Golden Hour guidance steps and critical warnings', async () => {
      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<EmergencyScreen onBack={jest.fn()} />);
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      const root = tree!.root;

      expect(root.findByProps({ children: '⚡ Immediate Fraud Action Steps (Golden Hour)' })).toBeDefined();
      expect(root.findByProps({ children: '1. Act within 2 Hours (Golden Hour)' })).toBeDefined();
      expect(root.findByProps({ children: '2. Block Cards & UPI with Your Bank' })).toBeDefined();
      expect(root.findByProps({ children: '3. Preserve Evidence' })).toBeDefined();
      expect(root.findByProps({ children: '4. Never Disclose Remaining Passwords' })).toBeDefined();

      // Critical Warning
      expect(
        root.findByProps({
          children:
            '⚠️ CRITICAL WARNING: Legitimate bank staff, police, and helpline 1930 will NEVER ask for your OTP, UPI PIN, passwords, or card CVV. Never share credentials.',
        })
      ).toBeDefined();

      // No Auto Freeze Disclaimer
      expect(
        root.findByProps({
          children:
            '⚠️ Important: ScamShield cannot automatically freeze your account or make calls. You must call your bank or 1930 directly.',
        })
      ).toBeDefined();
    });
  });

  describe('EmergencyScreen: Prepared Emergency Family Messages & Bank Directory', () => {
    it('generates family emergency notices with copy and share actions', async () => {
      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<EmergencyScreen onBack={jest.fn()} />);
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      const root = tree!.root;

      // Template heading
      expect(root.findByProps({ children: '👨‍👩‍👦 Prepared Emergency Message for Family' })).toBeDefined();

      // Switch to verify_request template
      const verifyTab = root.findByProps({
        accessibilityLabel: '❓ Verify Suspicious Message / Call',
      });
      act(() => {
        verifyTab.props.onPress();
      });

      // Add details
      const detailInput = root.findByProps({
        accessibilityLabel: 'Optional description of the situation',
      });
      act(() => {
        detailInput.props.onChangeText('Electricity officer Verma called claiming power cutoff tonight');
      });

      // Copy family notice
      const copyBtn = root.findByProps({
        accessibilityLabel: '📋 Copy Family Message Template',
      });
      act(() => {
        copyBtn.props.onPress();
      });
      expect(Clipboard.setString).toHaveBeenCalled();
      const copiedText = (Clipboard.setString as jest.Mock).mock.calls[0][0];
      expect(copiedText).toContain('FAMILY SAFETY CHECK REQUEST');
      expect(copiedText).toContain('Electricity officer Verma called claiming power cutoff tonight');

      // Share family notice
      const shareBtn = root.findByProps({
        accessibilityLabel: '📤 Share Alert with Family',
      });
      await act(async () => {
        shareBtn.props.onPress();
      });
      expect(Share.share).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('FAMILY SAFETY CHECK REQUEST'),
        })
      );
    });

    it('searches verified banks, calls bank helpline, and shows unlisted bank fallback', async () => {
      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<EmergencyScreen onBack={jest.fn()} />);
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      const root = tree!.root;

      // Bank search input
      const searchInput = root.findByProps({ accessibilityLabel: 'Search bank name' });
      act(() => {
        searchInput.props.onChangeText('HDFC');
      });

      // HDFC bank card found
      expect(root.findByProps({ children: 'HDFC Bank' })).toBeDefined();
      expect(root.findByProps({ children: '📞 1800 1600' })).toBeDefined();

      // Call HDFC
      const callHdfcBtn = root.findByProps({
        accessibilityLabel: 'Call HDFC Bank helpline 1800 1600',
      });
      act(() => {
        callHdfcBtn.props.onPress();
      });

      // Dialog confirms calling bank
      expect(root.findByProps({ children: 'Call HDFC Bank Fraud Helpline?' })).toBeDefined();
      const confirmBankBtn = root.findByProps({ accessibilityLabel: 'Call Bank Now' });
      act(() => {
        confirmBankBtn.props.onPress();
      });
      expect(Linking.openURL).toHaveBeenCalledWith('tel:18001600');

      // Unlisted bank fallback warning is always present
      expect(root.findByProps({ children: 'ℹ️ Bank Not Found in Directory?' })).toBeDefined();
      expect(
        root.findByProps({
          children:
            'Check the verified toll-free number printed on the back of your physical Debit Card or bank passbook. NEVER search for bank customer care numbers on Google search ads.',
        })
      ).toBeDefined();
    });

    it('verifies bankDirectory helper functions', () => {
      const sbi = findBankHelpline('sbi');
      expect(sbi).toBeDefined();
      expect(sbi?.phone).toBe('1800111109');

      const pnb = findBankHelpline('पंजाब नेशनल बैंक');
      expect(pnb).toBeDefined();
      expect(pnb?.id).toBe('pnb');

      const nonExistent = findBankHelpline('Unknown Cooperative Bank');
      expect(nonExistent).toBeUndefined();

      const fraudNotice = generateFamilyEmergencyNotice('fraud_alert', '₹10,000 unauthorized transaction');
      expect(fraudNotice).toContain('EMERGENCY SECURITY ALERT');
      expect(fraudNotice).toContain('₹10,000 unauthorized transaction');
      expect(fraudNotice).toContain('1930');
    });
  });

  describe('FamilyCircleScreen: Consent, States & Cloud Status', () => {
    it('validates explicit senior consent before generating invitation code', async () => {
      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<FamilyCircleScreen onBack={jest.fn()} />);
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      const root = tree!.root;

      // Status is NOT_PAIRED initially
      expect(root.findByProps({ children: 'NOT CONNECTED TO A FAMILY MEMBER' })).toBeDefined();

      // Fill caregiver details
      const nameInput = root.findByProps({ accessibilityLabel: "Family Member's Full Name" });
      act(() => {
        nameInput.props.onChangeText('Priya Sharma');
      });

      const relInput = root.findByProps({ accessibilityLabel: 'Relationship' });
      act(() => {
        relInput.props.onChangeText('Daughter');
      });

      // Explicitly uncheck consent
      const consentCheckbox = root.findByProps({
        accessibilityLabel:
          'I give explicit permission to share high-risk scam alerts and simulator learning stats with this family member.',
      });
      act(() => {
        consentCheckbox.props.onPress();
      });

      // Attempt to generate code without consent
      const genBtn = root.findByProps({ accessibilityLabel: '🔑 Generate 6-Digit Pairing Code' });
      await act(async () => {
        genBtn.props.onPress();
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });

      // Error shown: consent required
      expect(
        root.findByProps({
          children: '⚠️ You must check the consent box to authorize invitation and alert sharing.',
        })
      ).toBeDefined();

      // Check consent box
      act(() => {
        consentCheckbox.props.onPress();
      });

      // Generate code successfully
      await act(async () => {
        genBtn.props.onPress();
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });

      // Status updates to PENDING
      expect(
        root.findByProps({ children: 'PAIRING CODE ACTIVE (WAITING FOR CAREGIVER)' })
      ).toBeDefined();
    });

    it('verifies pending state actions: code sharing, copy, cloud relay limitation, and manual confirmation', async () => {
      // Initiate invitation in storage
      await StorageService.initiateFamilyInvitation('Anand Verma', 'Son');

      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<FamilyCircleScreen onBack={jest.fn()} />);
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      const root = tree!.root;

      expect(
        root.findByProps({ children: 'PAIRING CODE ACTIVE (WAITING FOR CAREGIVER)' })
      ).toBeDefined();

      // 6-digit code exists
      const info = await StorageService.getFamilyCircleInfo();
      expect(info.pairingCode).toMatch(/^[0-9]{6}$/);

      // Copy Code
      const copyBtn = root.findByProps({ accessibilityLabel: 'Copy pairing code' });
      act(() => {
        copyBtn.props.onPress();
      });
      expect(Clipboard.setString).toHaveBeenCalledWith(info.pairingCode);

      // Share Invitation via WhatsApp / SMS
      const shareBtn = root.findByProps({
        accessibilityLabel: '📤 Share Invitation Code via WhatsApp / SMS',
      });
      await act(async () => {
        shareBtn.props.onPress();
      });
      expect(Share.share).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining(info.pairingCode!),
        })
      );

      // Cloud status communicates offline/local mode limitation
      expect(
        root.findByProps({
          children:
            'Cloud Relay Server: Offline / Local Mode. Remote push alerts require cloud relay server infrastructure. Local consent pairing code active.',
        })
      ).toBeDefined();

      // Manual Confirmation button connects caregiver
      const confirmBtn = root.findByProps({
        accessibilityLabel: '✓ Confirm Caregiver Connected',
      });
      await act(async () => {
        confirmBtn.props.onPress();
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });

      // Connected state
      expect(
        root.findByProps({ children: 'CONNECTED & GUARDED BY CAREGIVER' })
      ).toBeDefined();
      expect(root.findByProps({ children: 'Anand Verma' })).toBeDefined();
      expect(root.findByProps({ children: 'Relationship: Son' })).toBeDefined();

      // Minimal sharing breakdown is visible
      expect(
        root.findByProps({
          children: '• High-Risk Threat Alerts (Blocked predatory scams only)',
        })
      ).toBeDefined();
      expect(
        root.findByProps({
          children: '• Scam Simulator Learning Progress & Reflex Score',
        })
      ).toBeDefined();
    });

    it('revokes caregiver access with explicit confirmation dialog', async () => {
      await StorageService.confirmCaregiverPairing('Pooja Kulkarni', 'Daughter');

      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<FamilyCircleScreen onBack={jest.fn()} />);
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      const root = tree!.root;

      expect(root.findByProps({ children: 'Pooja Kulkarni' })).toBeDefined();

      // Revoke button
      const revokeBtn = root.findByProps({ accessibilityLabel: '✕ Revoke Caregiver Access' });
      act(() => {
        revokeBtn.props.onPress();
      });

      // Dialog opens
      expect(root.findByProps({ children: 'Revoke Caregiver Access?' })).toBeDefined();

      // Confirm revoke
      const confirmRevokeBtn = root.findByProps({ accessibilityLabel: 'Disconnect Caregiver' });
      await act(async () => {
        confirmRevokeBtn.props.onPress();
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });

      // Restored to NOT_PAIRED in storage and UI
      expect(
        root.findByProps({ children: 'NOT CONNECTED TO A FAMILY MEMBER' })
      ).toBeDefined();
      const updatedInfo = await StorageService.getFamilyCircleInfo();
      expect(updatedInfo.status).toBe('NOT_PAIRED');
      expect(updatedInfo.caregiverName).toBe('');
    });
  });

  describe('Multilingual Stage 3.9 Rendering (Hindi & Marathi)', () => {
    it('renders refined EmergencyScreen and FamilyCircleScreen in Hindi with Devanagari', async () => {
      await act(async () => {
        await i18n.changeLanguage('hi');
      });

      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<EmergencyScreen onBack={jest.fn()} />);
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      let root = tree!.root;

      // Golden Hour guidance in Hindi
      expect(root.findByProps({ children: '⚡ धोखाधड़ी पर त्वरित कार्रवाई (गोल्डन ऑवर)' })).toBeDefined();
      expect(root.findByProps({ children: '1. 2 घंटे के भीतर कार्रवाई (गोल्डन ऑवर)' })).toBeDefined();
      expect(root.findByProps({ children: '👨‍👩‍👦 परिजनों के लिए आपातकालीन संदेश' })).toBeDefined();

      // Render FamilyCircleScreen in Hindi
      await act(async () => {
        tree = renderer.create(<FamilyCircleScreen onBack={jest.fn()} />);
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      root = tree!.root;

      expect(root.findByProps({ children: 'विश्वसनीय परिजन को आमंत्रित करें' })).toBeDefined();
      expect(
        root.findByProps({
          children:
            'मैं इस परिजन के साथ गंभीर साइबर अलर्ट व सीखने की प्रगति साझा करने की स्पष्ट सहमति देता/देती हूँ।',
        })
      ).toBeDefined();
    });

    it('renders refined EmergencyScreen and FamilyCircleScreen in Marathi with Devanagari', async () => {
      await act(async () => {
        await i18n.changeLanguage('mr');
      });

      let tree: renderer.ReactTestRenderer;
      await act(async () => {
        tree = renderer.create(<EmergencyScreen onBack={jest.fn()} />);
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      let root = tree!.root;

      // Golden Hour guidance in Marathi
      expect(root.findByProps({ children: '⚡ फसवणुकीवर तात्काळ कृती (गोल्डन अवर)' })).toBeDefined();
      expect(root.findByProps({ children: '१. २ तासांच्या आत पावले उचला (गोल्डन अवर)' })).toBeDefined();
      expect(root.findByProps({ children: '👨‍👩‍👦 कुटुंबासाठी आपत्कालीन संदेश' })).toBeDefined();

      // Render FamilyCircleScreen in Marathi
      await act(async () => {
        tree = renderer.create(<FamilyCircleScreen onBack={jest.fn()} />);
        for (let i = 0; i < 5; i++) await Promise.resolve();
      });
      root = tree!.root;

      expect(root.findByProps({ children: 'विश्वासू नातेवाईकाला आमंत्रित करा' })).toBeDefined();
      expect(
        root.findByProps({
          children:
            'मी या नातेवाईकासोबत गंभीर सायबर इशारे आणि शिकण्याची प्रगती शेअर करण्यास स्पष्ट संमती देतो/देते.',
        })
      ).toBeDefined();
    });
  });
});

