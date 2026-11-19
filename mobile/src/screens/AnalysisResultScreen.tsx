import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  Clipboard,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SeniorTheme } from '../theme';
import { SeniorHeader } from '../components/SeniorHeader';
import { SeniorCard } from '../components/SeniorCard';
import { SeniorBadge } from '../components/SeniorBadge';
import { SeniorButton } from '../components/SeniorButton';
import { MessageAnalysisResponse } from '../services/analysisApi';

export interface AnalysisResultScreenProps {
  result: MessageAnalysisResponse;
  originalMessage: string;
  onAnalyzeAnother: () => void;
  onReturnHome: () => void;
  onCallHelpline?: () => void;
  onBack?: () => void;
}

export const AnalysisResultScreen: React.FC<AnalysisResultScreenProps> = ({
  result,
  originalMessage: _originalMessage,
  onAnalyzeAnother,
  onReturnHome,
  onCallHelpline,
  onBack,
}) => {
  const { t } = useTranslation();
  const [copiedFeedback, setCopiedFeedback] = useState(false);

  const getRiskScheme = () => {
    switch (result.risk_level) {
      case 'HIGH_RISK':
        return {
          bg: SeniorTheme.colors.riskDangerSurface,
          border: SeniorTheme.colors.riskDangerBorder,
          text: SeniorTheme.colors.riskDanger,
          badgeVariant: 'danger' as const,
          badgeLabel: t('analysisResult.dangerTitle'),
          icon: '🚨',
        };
      case 'CAUTION':
        return {
          bg: SeniorTheme.colors.riskWarningSurface,
          border: SeniorTheme.colors.riskWarningBorder,
          text: SeniorTheme.colors.riskWarning,
          badgeVariant: 'caution' as const,
          badgeLabel: t('analysisResult.cautionTitle'),
          icon: '⚠️',
        };
      default:
        return {
          bg: SeniorTheme.colors.riskSafeSurface,
          border: SeniorTheme.colors.riskSafeBorder,
          text: SeniorTheme.colors.riskSafe,
          badgeVariant: 'safe' as const,
          badgeLabel: t('analysisResult.safeTitle'),
          icon: '🛡️',
        };
    }
  };

  const scheme = getRiskScheme();

  const handleCopyAdvice = () => {
    const formattedAdvice = [
      `ScamShield Safety Advice (${result.risk_level}):`,
      `Risk Score: ${result.risk_score} / 100`,
      `Explanation: ${result.explanation}`,
      'Recommended Actions:',
      ...result.recommended_actions.map((act, i) => `${i + 1}. ${act}`),
    ].join('\n');

    Clipboard.setString(formattedAdvice);
    setCopiedFeedback(true);
    setTimeout(() => setCopiedFeedback(false), 3000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={SeniorTheme.colors.backgroundMain} />

      <SeniorHeader
        title={t('analysisResult.title')}
        onBack={onBack || onReturnHome}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Risk Level Hero Card */}
        <SeniorCard
          variant="elevated"
          style={[
            styles.heroCard,
            { backgroundColor: scheme.bg, borderColor: scheme.border },
          ]}
        >
          <View style={styles.heroRow}>
            <View style={styles.heroIconCircle}>
              <Text style={styles.heroIconText}>{scheme.icon}</Text>
            </View>
            <View style={styles.heroTextCol}>
              <SeniorBadge
                variant={scheme.badgeVariant}
                label={scheme.badgeLabel}
              />
              <Text style={[styles.heroTitle, { color: scheme.text }]}>
                {scheme.badgeLabel}
              </Text>
            </View>
          </View>

          {/* Heuristic Score Meter */}
          <View style={styles.scoreContainer}>
            <View style={styles.scoreHeaderRow}>
              <Text style={styles.scoreLabel}>
                {t('analysisResult.riskScoreLabel')}
              </Text>
              <Text style={[styles.scoreValue, { color: scheme.text }]}>
                {`${result.risk_score} / 100`}
              </Text>
            </View>
            {/* Accessible Progress Bar */}
            <View
              style={styles.progressBarTrack}
              accessible={true}
              accessibilityRole="progressbar"
              accessibilityValue={{
                min: 0,
                max: 100,
                now: result.risk_score,
                text: `${result.risk_score} out of 100`,
              }}
            >
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.max(5, result.risk_score)}%`,
                    backgroundColor: scheme.text,
                  },
                ]}
              />
            </View>
            <Text style={styles.scoreDisclaimer}>
              {t('analysisResult.riskScoreDisclaimer')}
            </Text>
          </View>
        </SeniorCard>

        {/* Senior Safety Explanation Card */}
        <SeniorCard variant="elevated" style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            📖 {t('analysisResult.explanationSectionTitle')}
          </Text>
          <Text style={styles.explanationText}>
            {result.explanation}
          </Text>
        </SeniorCard>

        {/* Detected Warning Indicators (if any) */}
        {result.detected_indicators && result.detected_indicators.length > 0 ? (
          <SeniorCard variant="elevated" style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>
              ⚠️ {t('analysisResult.indicatorsSectionTitle')} ({result.detected_indicators.length})
            </Text>
            {result.detected_indicators.map((ind, index) => (
              <View key={`${ind.category}-${index}`} style={styles.indicatorItem}>
                <View style={styles.indicatorHeaderRow}>
                  <Text style={styles.indicatorName}>
                    {ind.indicator_name.replace(/_/g, ' ')}
                  </Text>
                  <SeniorBadge
                    variant={ind.severity === 'HIGH' ? 'danger' : 'caution'}
                    label={ind.severity}
                  />
                </View>
                <Text style={styles.indicatorDesc}>{ind.description}</Text>
                {Boolean(ind.evidence) && (
                  <Text style={styles.indicatorEvidence}>
                    Found: "{ind.evidence}"
                  </Text>
                )}
              </View>
            ))}
          </SeniorCard>
        ) : null}

        {/* Recommended Safe Next Steps */}
        {result.recommended_actions && result.recommended_actions.length > 0 && (
          <SeniorCard variant="elevated" style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>
              ✅ {t('analysisResult.actionsSectionTitle')}
            </Text>
            {result.recommended_actions.map((action, idx) => (
              <View key={idx} style={styles.actionRow}>
                <View style={styles.actionNumberCircle}>
                  <Text style={styles.actionNumberText}>{idx + 1}</Text>
                </View>
                <Text style={styles.actionItemText}>{action}</Text>
              </View>
            ))}
          </SeniorCard>
        )}

        {/* Disclaimers & Uncertainty Note */}
        <SeniorCard variant="outlined" style={styles.disclaimerCard}>
          <Text style={styles.disclaimerHeader}>
            ℹ️ {t('analysisResult.disclaimerTitle')}
          </Text>
          <Text style={styles.disclaimerBody}>{result.disclaimer}</Text>
          <Text style={styles.disclaimerBodySecondary}>
            {t('analysisResult.otpLegitNotice')}
          </Text>
        </SeniorCard>

        {/* Senior-Friendly Action Controls */}
        <View style={styles.buttonStack}>
          <SeniorButton
            title={
              copiedFeedback
                ? t('analysisResult.adviceCopied')
                : t('analysisResult.copyAdviceButton')
            }
            variant="outline"
            onPress={handleCopyAdvice}
            accessibilityLabel={t('analysisResult.copyAdviceButton')}
            style={styles.actionButton}
          />

          <SeniorButton
            title={t('analysisResult.analyzeAnotherButton')}
            variant="primary"
            onPress={onAnalyzeAnother}
            accessibilityLabel={t('analysisResult.analyzeAnotherButton')}
            style={styles.actionButton}
          />

          {Boolean(onCallHelpline) && result.risk_level === 'HIGH_RISK' && (
            <SeniorButton
              title={t('analysisResult.emergencyButton')}
              variant="danger"
              onPress={() => onCallHelpline?.()}
              accessibilityLabel={t('analysisResult.emergencyButton')}
              style={styles.actionButton}
            />
          )}

          <SeniorButton
            title={t('analysisResult.returnHomeButton')}
            variant="secondary"
            onPress={onReturnHome}
            accessibilityLabel={t('analysisResult.returnHomeButton')}
            style={styles.actionButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SeniorTheme.colors.backgroundMain,
  },
  scrollContent: {
    paddingHorizontal: SeniorTheme.spacing.lg,
    paddingVertical: SeniorTheme.spacing.md,
  },
  heroCard: {
    padding: SeniorTheme.spacing.lg,
    borderRadius: SeniorTheme.radii.card,
    borderWidth: 2,
    marginBottom: SeniorTheme.spacing.md,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SeniorTheme.spacing.md,
  },
  heroIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: SeniorTheme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SeniorTheme.spacing.md,
    shadowColor: SeniorTheme.colors.deepForest,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  heroIconText: {
    fontSize: 28,
  },
  heroTextCol: {
    flex: 1,
  },
  heroTitle: {
    fontSize: SeniorTheme.typography.titleMedium,
    fontWeight: '800',
    marginTop: SeniorTheme.spacing.xs,
  },
  scoreContainer: {
    backgroundColor: SeniorTheme.colors.white,
    borderRadius: SeniorTheme.radii.button,
    padding: SeniorTheme.spacing.md,
    marginTop: SeniorTheme.spacing.xs,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  scoreHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SeniorTheme.spacing.xs,
  },
  scoreLabel: {
    fontSize: SeniorTheme.typography.body,
    fontWeight: '700',
    color: SeniorTheme.colors.deepForest,
  },
  scoreValue: {
    fontSize: SeniorTheme.typography.titleMedium,
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 12,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    overflow: 'hidden',
    marginVertical: SeniorTheme.spacing.xs,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  scoreDisclaimer: {
    fontSize: SeniorTheme.typography.caption,
    color: SeniorTheme.colors.textDim,
    marginTop: 4,
    lineHeight: 18,
  },
  sectionCard: {
    padding: SeniorTheme.spacing.lg,
    marginBottom: SeniorTheme.spacing.md,
    borderRadius: SeniorTheme.radii.card,
  },
  sectionTitle: {
    fontSize: SeniorTheme.typography.titleSmall,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
    marginBottom: SeniorTheme.spacing.sm,
  },
  explanationText: {
    fontSize: SeniorTheme.typography.body,
    color: SeniorTheme.colors.deepForest,
    lineHeight: 26,
  },
  indicatorItem: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: SeniorTheme.spacing.sm,
    marginTop: SeniorTheme.spacing.sm,
  },
  indicatorHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  indicatorName: {
    fontSize: SeniorTheme.typography.body,
    fontWeight: '700',
    color: SeniorTheme.colors.deepForest,
    flex: 1,
    textTransform: 'capitalize',
  },
  indicatorDesc: {
    fontSize: SeniorTheme.typography.bodySmall,
    color: SeniorTheme.colors.deepForest,
    opacity: 0.85,
    lineHeight: 22,
  },
  indicatorEvidence: {
    fontSize: SeniorTheme.typography.caption,
    color: SeniorTheme.colors.textDim,
    fontStyle: 'italic',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: SeniorTheme.spacing.xs,
  },
  actionNumberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: SeniorTheme.colors.backgroundMain,
    borderWidth: 1.5,
    borderColor: SeniorTheme.colors.richEmerald,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SeniorTheme.spacing.sm,
    marginTop: 2,
  },
  actionNumberText: {
    fontSize: SeniorTheme.typography.caption,
    fontWeight: '800',
    color: SeniorTheme.colors.richEmerald,
  },
  actionItemText: {
    flex: 1,
    fontSize: SeniorTheme.typography.body,
    color: SeniorTheme.colors.deepForest,
    lineHeight: 24,
    fontWeight: '600',
  },
  disclaimerCard: {
    padding: SeniorTheme.spacing.md,
    backgroundColor: SeniorTheme.colors.backgroundMain,
    borderColor: '#E2E8F0',
    borderRadius: SeniorTheme.radii.card,
    marginBottom: SeniorTheme.spacing.lg,
  },
  disclaimerHeader: {
    fontSize: SeniorTheme.typography.bodySmall,
    fontWeight: '700',
    color: SeniorTheme.colors.deepForest,
    marginBottom: 4,
  },
  disclaimerBody: {
    fontSize: SeniorTheme.typography.caption,
    color: SeniorTheme.colors.textDim,
    lineHeight: 18,
  },
  disclaimerBodySecondary: {
    fontSize: SeniorTheme.typography.caption,
    color: SeniorTheme.colors.richEmerald,
    fontWeight: '600',
    marginTop: SeniorTheme.spacing.xs,
    lineHeight: 18,
  },
  buttonStack: {
    gap: SeniorTheme.spacing.sm,
    marginBottom: SeniorTheme.spacing.xl,
  },
  actionButton: {
    minHeight: SeniorTheme.dimensions.minTouchTarget + 6,
  },
});
