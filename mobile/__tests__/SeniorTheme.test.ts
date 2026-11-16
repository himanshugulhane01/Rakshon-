import { SeniorTheme } from '../src/theme';

describe('SeniorTheme Approved Six-Colour Palette & Accessibility Tokens', () => {
  it('enforces the exact approved six-colour core palette', () => {
    expect(SeniorTheme.colors.deepForest).toBe('#152720');
    expect(SeniorTheme.colors.richEmerald).toBe('#2d6b51');
    expect(SeniorTheme.colors.emeraldLight).toBe('#4a9a79');
    expect(SeniorTheme.colors.backgroundMain).toBe('#f8f9fa');
    expect(SeniorTheme.colors.textDim).toBe('#939e99');
    expect(SeniorTheme.colors.white).toBe('#FFFFFF');
  });

  it('provides clearly separated semantic risk colors for threat communication', () => {
    expect(SeniorTheme.colors.riskDanger).toBe('#C62828');
    expect(SeniorTheme.colors.riskWarning).toBe('#B23B00');
    expect(SeniorTheme.colors.riskSafe).toBe('#1B5E20');
  });

  it('enforces touch targets strictly greater than or equal to 48dp', () => {
    expect(SeniorTheme.dimensions.minTouchTarget).toBeGreaterThanOrEqual(48);
    expect(SeniorTheme.dimensions.buttonHeight).toBeGreaterThanOrEqual(48);
    expect(SeniorTheme.dimensions.inputHeight).toBeGreaterThanOrEqual(48);
  });

  it('enforces senior-readable typography scales (minimum 16sp, standard 18sp)', () => {
    expect(SeniorTheme.typography.bodySmall).toBeGreaterThanOrEqual(16);
    expect(SeniorTheme.typography.body).toBeGreaterThanOrEqual(18);
    expect(SeniorTheme.typography.bodyLarge).toBeGreaterThanOrEqual(20);
    expect(SeniorTheme.typography.titleMedium).toBeGreaterThanOrEqual(26);
    expect(SeniorTheme.typography.headerLarge).toBeGreaterThanOrEqual(32);
  });
});
