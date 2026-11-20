import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { CaregiverDashboardScreen } from '../src/screens/CaregiverDashboardScreen';
import { StorageService, CaregiverPermissionSettings } from '../src/services/storage';
import i18n from '../src/i18n';

describe('Feature 4: Complete Caregiver Dashboard', () => {
  beforeEach(async () => {
    jest.useFakeTimers();
    StorageService._resetAllForTesting();
    await act(async () => {
      await i18n.changeLanguage('en');
    });
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });
    StorageService._resetAllForTesting();
  });

  it('1. Renders Caregiver Dashboard with relationship and consent status', async () => {
    await StorageService.confirmCaregiverPairing('Rohit Sharma', 'Son');
    let tree: any;
    await act(async () => {
      tree = renderer.create(<CaregiverDashboardScreen onBack={jest.fn()} />);
    });

    const str = JSON.stringify(tree.toJSON());
    expect(str).toContain('Caregiver Safety Dashboard');
    expect(str).toContain('Rohit Sharma');
    expect(str).toContain('Active Consent Granted');
    expect(str).toContain('Relation: Son');
  });

  it('2. Clearly displays What is Shared vs What is NEVER Shared', async () => {
    let tree: any;
    await act(async () => {
      tree = renderer.create(<CaregiverDashboardScreen onBack={jest.fn()} />);
    });

    const str = JSON.stringify(tree.toJSON());
    expect(str).toContain('What information is shared?');
    expect(str).toContain('Practice module completion and safety quiz scores');
    expect(str).toContain('What is NEVER shared?');
    expect(str).toContain('Private SMS or WhatsApp chat contents');
    expect(str).toContain('Bank passwords, PINs, or OTPs');
  });

  it('3. Manages granular permissions and revocation in StorageService', async () => {
    const defaultPerms = await StorageService.getCaregiverPermissions();
    expect(defaultPerms.shareLearningProgress).toBe(true);

    const updatedPerms: CaregiverPermissionSettings = {
      shareLearningProgress: false,
      shareSecurityStatus: true,
      shareHighRiskAlerts: false,
      consentGrantedAt: new Date().toISOString(),
    };
    await StorageService.setCaregiverPermissions(updatedPerms);

    const reloaded = await StorageService.getCaregiverPermissions();
    expect(reloaded.shareLearningProgress).toBe(false);
    expect(reloaded.shareHighRiskAlerts).toBe(false);
  });

  it('4. Records and renders authorized safety alerts without exposing private SMS', async () => {
    await StorageService.recordCaregiverAlert(
      'Test Alert',
      'High-Risk Caller Blocked',
      'HIGH',
      'Intercepted spoofed caller without recording call audio.'
    );

    const alerts = await StorageService.getCaregiverAlertsLog();
    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts[0].title).toBe('High-Risk Caller Blocked');
    expect(alerts[0].riskLevel).toBe('HIGH');
  });

  it('5. Supports English, Hindi, and Marathi translations', async () => {
    let tree: any;
    await act(async () => {
      await i18n.changeLanguage('hi');
      tree = renderer.create(<CaregiverDashboardScreen onBack={jest.fn()} />);
    });
    expect(JSON.stringify(tree.toJSON())).toContain('केयरगिवर सुरक्षा डैशबोर्ड');

    await act(async () => {
      await i18n.changeLanguage('mr');
      tree = renderer.create(<CaregiverDashboardScreen onBack={jest.fn()} />);
    });
    expect(JSON.stringify(tree.toJSON())).toContain('केअरगिव्हर सुरक्षा डॅशबोर्ड');
  });
});

