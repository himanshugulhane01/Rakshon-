import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { SeniorTheme, getFontFamily } from '../theme';

export interface LearningProgressCardProps {
  completedCount: number;
  totalCount: number;
  correctCount: number;
  onContinueLearning: () => void;
  style?: StyleProp<ViewStyle>;
}

export const LearningProgressCard: React.FC<LearningProgressCardProps> = ({
  completedCount,
  totalCount,
  correctCount,
  onContinueLearning,
  style,
}) => {
  const safeTotal = Math.max(totalCount, 1);
  const percentage = Math.min(Math.round((completedCount / safeTotal) * 100), 100);

  return (
    <View
      accessible={true}
      accessibilityRole="summary"
      accessibilityLabel={`Awareness Learning: ${completedCount} of ${totalCount} scenarios completed. ${correctCount} correct answers.`}
      style={[styles.card, style]}
    >
      <View style={styles.headerRow}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconEmoji}>🎓</Text>
        </View>
        <View style={styles.headerTextContainer}>
          <Text
            style={[
              styles.title,
              { fontFamily: getFontFamily('700', false) },
            ]}
            allowFontScaling={true}
          >
            Scam Awareness Simulator
          </Text>
          <Text
            style={[
              styles.subtitle,
              { fontFamily: getFontFamily('500', false) },
            ]}
            allowFontScaling={true}
          >
            {completedCount > 0
              ? `${completedCount} of ${totalCount} Scenarios Practiced`
              : 'Interactive Safety Practice'}
          </Text>
        </View>
        <Text
          style={[
            styles.percentageText,
            { fontFamily: getFontFamily('700', false) },
          ]}
          allowFontScaling={true}
        >
          {percentage}%
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarBackground}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${percentage}%` },
          ]}
        />
      </View>

      {/* Stats and Continue CTA */}
      <View style={styles.footerRow}>
        <Text
          style={[
            styles.encouragementText,
            { fontFamily: getFontFamily('400', false) },
          ]}
          allowFontScaling={true}
        >
          {completedCount === 0
            ? 'Start with simulated fraud scenarios to build your instincts.'
            : `${correctCount} safely handled so far! Keep practicing.`}
        </Text>
        <TouchableOpacity
          onPress={onContinueLearning}
          activeOpacity={0.82}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Continue Scam Simulator"
          style={styles.continueButton}
        >
          <Text
            style={[
              styles.continueButtonText,
              { fontFamily: getFontFamily('700', false) },
            ]}
            allowFontScaling={true}
          >
            {completedCount > 0 ? 'Continue ›' : 'Start Practice ›'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: SeniorTheme.colors.white,
    borderRadius: 20,
    padding: 18,
    marginVertical: SeniorTheme.spacing.sm,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: SeniorTheme.colors.deepForest,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#E8F5EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#C8E6D8',
  },
  iconEmoji: {
    fontSize: 24,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    color: SeniorTheme.colors.deepForest,
  },
  subtitle: {
    fontSize: 13,
    color: SeniorTheme.colors.textDim,
    marginTop: 2,
  },
  percentageText: {
    fontSize: 18,
    color: SeniorTheme.colors.richEmerald,
    marginLeft: 10,
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#E2E8F0',
    borderRadius: 5,
    overflow: 'hidden',
    marginVertical: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: SeniorTheme.colors.richEmerald,
    borderRadius: 5,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 12,
  },
  encouragementText: {
    flex: 1,
    fontSize: 12,
    color: SeniorTheme.colors.textDim,
    lineHeight: 18,
  },
  continueButton: {
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#E8F5EE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C8E6D8',
  },
  continueButtonText: {
    fontSize: 13,
    color: SeniorTheme.colors.richEmerald,
  },
});
