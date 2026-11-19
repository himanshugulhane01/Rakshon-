import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { SeniorTheme, getFontFamily } from '../theme';

export interface ProtectionStatusCardProps {
  isProtected: boolean;
  statusTitle: string;
  statusSubtitle: string;
  callScreeningActive: boolean;
  threatDbVersion: number;
  threatCount: number;
  lastSyncText?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const ProtectionStatusCard: React.FC<ProtectionStatusCardProps> = ({
  isProtected,
  statusTitle,
  statusSubtitle,
  callScreeningActive,
  threatDbVersion,
  threatCount,
  lastSyncText,
  onRefresh,
  isRefreshing = false,
  style,
}) => {
  return (
    <View
      accessible={true}
      accessibilityRole="summary"
      accessibilityLabel={`Protection status: ${statusTitle}. ${statusSubtitle}`}
      style={[styles.card, style]}
    >
      {/* Top Banner Row */}
      <View style={styles.topRow}>
        <View style={styles.shieldIconContainer}>
          <Text style={styles.shieldEmoji}>{isProtected ? '🛡️' : '⚠️'}</Text>
        </View>
        <View style={styles.headerTextContainer}>
          <Text
            style={[
              styles.statusTitle,
              { fontFamily: getFontFamily('700', false) },
            ]}
            allowFontScaling={true}
          >
            {statusTitle}
          </Text>
          <Text
            style={[
              styles.statusSubtitle,
              { fontFamily: getFontFamily('600', false) },
            ]}
            allowFontScaling={true}
          >
            {statusSubtitle}
          </Text>
        </View>
        {Boolean(onRefresh) && (
          <TouchableOpacity
            onPress={onRefresh}
            disabled={isRefreshing}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Refresh protection status"
            accessibilityHint="Checks latest offline threat database updates"
            style={styles.refreshButton}
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" color={SeniorTheme.colors.richEmerald} />
            ) : (
              <Text style={styles.refreshIconText}>🔄</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Metrics Row */}
      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Text
            style={[
              styles.metricLabel,
              { fontFamily: getFontFamily('700', false) },
            ]}
            allowFontScaling={true}
          >
            CALL SCREENING
          </Text>
          <View style={styles.metricBadgeRow}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: callScreeningActive
                    ? SeniorTheme.colors.richEmerald
                    : SeniorTheme.colors.riskWarning,
                },
              ]}
            />
            <Text
              style={[
                styles.metricValue,
                {
                  color: callScreeningActive
                    ? SeniorTheme.colors.richEmerald
                    : SeniorTheme.colors.riskWarning,
                  fontFamily: getFontFamily('700', false),
                },
              ]}
              allowFontScaling={true}
            >
              {callScreeningActive ? 'PROTECTED' : 'ACTION NEEDED'}
            </Text>
          </View>
        </View>

        <View style={styles.verticalDivider} />

        <View style={styles.metricItem}>
          <Text
            style={[
              styles.metricLabel,
              { fontFamily: getFontFamily('700', false) },
            ]}
            allowFontScaling={true}
          >
            OFFLINE THREAT DB
          </Text>
          <Text
            style={[
              styles.metricDbValue,
              { fontFamily: getFontFamily('700', false) },
            ]}
            allowFontScaling={true}
          >
            {threatCount > 0 ? `${threatCount.toLocaleString()} Patterns` : 'Ready'}
          </Text>
          <Text
            style={[
              styles.metricVersionText,
              { fontFamily: getFontFamily('500', false) },
            ]}
            allowFontScaling={true}
          >
            {threatDbVersion > 0 ? `Version ${threatDbVersion}` : 'Offline Engine'}
          </Text>
        </View>
      </View>

      {/* Last Sync Timestamp */}
      {Boolean(lastSyncText) && (
        <Text
          style={[
            styles.lastSyncText,
            { fontFamily: getFontFamily('400', false) },
          ]}
          allowFontScaling={true}
        >
          {lastSyncText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: SeniorTheme.colors.white,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginVertical: SeniorTheme.spacing.sm,
    shadowColor: SeniorTheme.colors.deepForest,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shieldIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: SeniorTheme.colors.backgroundMain,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  shieldEmoji: {
    fontSize: 26,
  },
  headerTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    color: SeniorTheme.colors.deepForest,
    letterSpacing: 0.2,
  },
  statusSubtitle: {
    fontSize: 14,
    color: SeniorTheme.colors.richEmerald,
    marginTop: 2,
  },
  refreshButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: SeniorTheme.colors.backgroundMain,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  refreshIconText: {
    fontSize: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 12,
    color: SeniorTheme.colors.textDim,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  metricBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  metricValue: {
    fontSize: 14,
    letterSpacing: 0.3,
  },
  verticalDivider: {
    width: 1,
    height: 38,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 12,
  },
  metricDbValue: {
    fontSize: 14,
    color: SeniorTheme.colors.deepForest,
  },
  metricVersionText: {
    fontSize: 12,
    color: SeniorTheme.colors.textDim,
    marginTop: 1,
  },
  lastSyncText: {
    fontSize: 12,
    color: SeniorTheme.colors.textDim,
    textAlign: 'center',
    marginTop: 12,
  },
});
