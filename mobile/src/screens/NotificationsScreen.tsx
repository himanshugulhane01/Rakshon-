import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SeniorTheme, getFontFamily } from '../theme';
import { SeniorHeader } from '../components/SeniorHeader';
import { SeniorButton } from '../components/SeniorButton';
import { StorageService } from '../services/storage';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'threat' | 'sync' | 'advisory' | 'info';
  isRead: boolean;
}

export interface NotificationsScreenProps {
  onBack: () => void;
}

const STORAGE_KEY = 'rakshon_notifications_v1';

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: 'Threat Database Updated',
    message: '12,430 scam caller signatures synchronized for real-time offline protection.',
    time: '10:24 AM Today',
    type: 'sync',
    isRead: false,
  },
  {
    id: '2',
    title: 'Suspicious Caller Filtered',
    message: 'Call Screening blocked suspected electricity bill fraud number +91 98234 11002.',
    time: 'Yesterday',
    type: 'threat',
    isRead: false,
  },
  {
    id: '3',
    title: 'RBI Security Advisory',
    message: 'Never install .APK files received via WhatsApp or SMS claiming to update PAN card.',
    time: '2 days ago',
    type: 'advisory',
    isRead: true,
  },
  {
    id: '4',
    title: 'Emergency 1930 Speed Dial Ready',
    message: 'Official National Cybercrime Helpline verified and accessible in 1 tap.',
    time: '3 days ago',
    type: 'info',
    isRead: true,
  },
];

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ onBack }) => {
  const { t, i18n } = useTranslation();
  const isDevanagari = i18n.language === 'hi' || i18n.language === 'mr';

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Load persisted notifications
  useEffect(() => {
    let isMounted = true;
    const loadNotifications = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        const stored = await StorageService.getPreference(STORAGE_KEY, '');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (isMounted) setNotifications(parsed);
        } else {
          if (isMounted) setNotifications(INITIAL_NOTIFICATIONS);
          await StorageService.setPreference(STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
        }
      } catch {
        if (isMounted) setHasError(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadNotifications();
    return () => {
      isMounted = false;
    };
  }, []);

  const saveNotifications = async (updated: NotificationItem[]) => {
    setNotifications(updated);
    try {
      await StorageService.setPreference(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Storage write error handled gracefully
    }
  };

  const markAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    saveNotifications(updated);
  };

  const toggleReadStatus = (id: string) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, isRead: !n.isRead } : n
    );
    saveNotifications(updated);
  };

  const dismissNotification = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    saveNotifications(updated);
  };

  const clearAllNotifications = () => {
    saveNotifications([]);
  };

  const resetSampleNotifications = () => {
    saveNotifications(INITIAL_NOTIFICATIONS);
  };

  const getBadgeIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'threat':
        return '🚨';
      case 'sync':
        return '🛡️';
      case 'advisory':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#152720" />

      {/* Senior Header */}
      <SeniorHeader
        title={t('common.notifications') || 'Notifications'}
        subtitle={
          unreadCount > 0
            ? `${unreadCount} unread security alert${unreadCount > 1 ? 's' : ''}`
            : 'All security alerts up to date'
        }
        onBack={onBack}
        accessibilityLabel="Notifications screen header"
      />

      {/* Top Actions Bar */}
      <View style={styles.topActionsRow}>
        <Text
          style={[
            styles.sectionTitle,
            { fontFamily: getFontFamily('700', isDevanagari) },
          ]}
          allowFontScaling={true}
        >
          Recent Security Updates
        </Text>
        {notifications.length > 0 && (
          <View style={styles.actionLinksRow}>
            {unreadCount > 0 && (
              <TouchableOpacity
                onPress={markAllRead}
                style={styles.markReadTouch}
                accessibilityRole="button"
                accessibilityLabel="Mark all as read"
                accessibilityHint="Marks all notifications as read"
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.markReadText,
                    { fontFamily: getFontFamily('700', isDevanagari) },
                  ]}
                  allowFontScaling={true}
                >
                  Mark all as read
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={clearAllNotifications}
              style={styles.clearAllTouch}
              accessibilityRole="button"
              accessibilityLabel="Clear all notifications"
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.clearAllText,
                  { fontFamily: getFontFamily('600', isDevanagari) },
                ]}
                allowFontScaling={true}
              >
                Clear all
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Main Content Area: Loading, Error, Empty, or List */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={SeniorTheme.colors.richEmerald} />
          <Text
            style={[
              styles.stateText,
              { fontFamily: getFontFamily('500', isDevanagari) },
            ]}
            allowFontScaling={true}
          >
            Loading security notifications...
          </Text>
        </View>
      ) : hasError ? (
        <View style={styles.centerContainer}>
          <Text style={styles.stateIcon}>⚠️</Text>
          <Text
            style={[
              styles.stateTitle,
              { fontFamily: getFontFamily('700', isDevanagari) },
            ]}
            allowFontScaling={true}
          >
            Unable to load notifications
          </Text>
          <SeniorButton
            title="Try Again"
            onPress={() => setNotifications(INITIAL_NOTIFICATIONS)}
            style={styles.retryBtn}
          />
        </View>
      ) : notifications.length === 0 ? (
        /* Empty State */
        <View style={styles.centerContainer}>
          <View style={styles.emptyIconCircle}>
            <Text style={styles.emptyIcon}>🛡️</Text>
          </View>
          <Text
            style={[
              styles.stateTitle,
              { fontFamily: getFontFamily('700', isDevanagari) },
            ]}
            allowFontScaling={true}
          >
            All Caught Up!
          </Text>
          <Text
            style={[
              styles.emptySubtitle,
              { fontFamily: getFontFamily('400', isDevanagari) },
            ]}
            allowFontScaling={true}
          >
            You have no active notifications. Your offline scam protection is active and safeguarding your phone.
          </Text>
          <SeniorButton
            title="Restore Alerts"
            variant="outline"
            onPress={resetSampleNotifications}
            style={styles.restoreBtn}
          />
        </View>
      ) : (
        /* Notifications List */
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {notifications.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => toggleReadStatus(item.id)}
              activeOpacity={0.9}
              style={[
                styles.notificationCard,
                !item.isRead && styles.unreadCard,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${item.title}. ${item.message}. ${item.time}. ${
                item.isRead ? 'Read' : 'Unread'
              }`}
              accessibilityHint="Tap to toggle read status"
            >
              <View style={styles.cardHeader}>
                <View style={styles.iconCircle}>
                  <Text style={styles.typeIcon}>{getBadgeIcon(item.type)}</Text>
                </View>
                <View style={styles.headerTextCol}>
                  <View style={styles.titleRow}>
                    <Text
                      style={[
                        styles.itemTitle,
                        { fontFamily: getFontFamily('700', isDevanagari) },
                      ]}
                      allowFontScaling={true}
                    >
                      {item.title}
                    </Text>
                    {!item.isRead && <View style={styles.unreadDot} />}
                  </View>
                  <Text
                    style={[
                      styles.itemTime,
                      { fontFamily: getFontFamily('400', isDevanagari) },
                    ]}
                    allowFontScaling={true}
                  >
                    {item.time}
                  </Text>
                </View>

                {/* Dismiss Button */}
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    dismissNotification(item.id);
                  }}
                  style={styles.dismissTouch}
                  accessibilityRole="button"
                  accessibilityLabel={`Dismiss ${item.title}`}
                  accessibilityHint="Removes this notification"
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Text style={styles.dismissText}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text
                style={[
                  styles.itemMessage,
                  { fontFamily: getFontFamily('400', isDevanagari) },
                ]}
                allowFontScaling={true}
              >
                {item.message}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SeniorTheme.colors.backgroundMain, // #F8F9FA
  },
  topActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: SeniorTheme.colors.white,
  },
  sectionTitle: {
    fontSize: 16,
    color: SeniorTheme.colors.deepForest,
  },
  actionLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  markReadTouch: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  markReadText: {
    fontSize: 13,
    color: SeniorTheme.colors.richEmerald, // #2D6B51
  },
  clearAllTouch: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  clearAllText: {
    fontSize: 13,
    color: SeniorTheme.colors.textDim,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 36,
    gap: 14,
  },
  notificationCard: {
    backgroundColor: SeniorTheme.colors.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: SeniorTheme.colors.deepForest,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  unreadCard: {
    borderColor: '#A8D9C5',
    backgroundColor: '#F7FCF9',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#E8F5EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  typeIcon: {
    fontSize: 22,
  },
  headerTextCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemTitle: {
    fontSize: 16,
    color: SeniorTheme.colors.deepForest,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: SeniorTheme.colors.richEmerald,
  },
  itemTime: {
    fontSize: 12,
    color: SeniorTheme.colors.textDim,
    marginTop: 2,
  },
  dismissTouch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    marginLeft: 8,
  },
  dismissText: {
    fontSize: 14,
    color: SeniorTheme.colors.textDim,
    fontWeight: '700',
  },
  itemMessage: {
    fontSize: 14,
    color: SeniorTheme.colors.deepForest,
    lineHeight: 20,
    opacity: 0.85,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  stateIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#C8E6D8',
  },
  emptyIcon: {
    fontSize: 40,
  },
  stateTitle: {
    fontSize: 20,
    color: SeniorTheme.colors.deepForest,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: SeniorTheme.colors.textDim,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  stateText: {
    fontSize: 14,
    color: SeniorTheme.colors.textDim,
    marginTop: 12,
  },
  retryBtn: {
    minHeight: 48,
    minWidth: 160,
    borderRadius: 14,
    marginTop: 12,
  },
  restoreBtn: {
    minHeight: 48,
    minWidth: 160,
    borderRadius: 14,
  },
});
