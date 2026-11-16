import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { SeniorTheme } from '../theme';
import { SeniorButton } from './SeniorButton';

export interface SeniorDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  isDestructive?: boolean;
  dismissable?: boolean;
  accessibilityLabel?: string;
}

export const SeniorDialog: React.FC<SeniorDialogProps> = ({
  visible,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  isDestructive = false,
  dismissable = true,
  accessibilityLabel,
}) => {
  const handleBackdropPress = () => {
    if (dismissable && onCancel) {
      onCancel();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {
        if (dismissable && onCancel) {
          onCancel();
        }
      }}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View
          style={styles.backdrop}
          accessible={true}
          accessibilityRole="alert"
          accessibilityLabel={accessibilityLabel || title}
        >
          <TouchableWithoutFeedback>
            <View style={styles.dialogCard}>
              {/* Dialog Title */}
              <Text style={styles.titleText}>{title}</Text>

              {/* Dialog Message */}
              <Text style={styles.messageText}>{message}</Text>

              {/* Action Buttons */}
              <View style={styles.actionsContainer}>
                {/* Confirm Button */}
                <SeniorButton
                  title={confirmText}
                  variant={isDestructive ? 'danger' : 'primary'}
                  onPress={onConfirm}
                  style={styles.actionButton}
                />

                {/* Cancel Button */}
                {Boolean(cancelText) && (
                  <SeniorButton
                    title={cancelText!}
                    variant="secondary"
                    onPress={onCancel ? onCancel : () => {}}
                    style={styles.actionButton}
                  />
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(21, 39, 32, 0.65)', // Deep Forest tinted overlay
    justifyContent: 'center',
    alignItems: 'center',
    padding: SeniorTheme.spacing.lg,
  },
  dialogCard: {
    backgroundColor: SeniorTheme.colors.white,
    borderRadius: SeniorTheme.radii.lg,
    padding: SeniorTheme.spacing.xl,
    width: '100%',
    maxWidth: 420,
    shadowColor: SeniorTheme.colors.deepForest,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  titleText: {
    fontSize: SeniorTheme.typography.titleMedium,
    fontWeight: '800',
    color: SeniorTheme.colors.deepForest,
    marginBottom: SeniorTheme.spacing.md,
    textAlign: 'center',
  },
  messageText: {
    fontSize: SeniorTheme.typography.body,
    color: SeniorTheme.colors.deepForest,
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: SeniorTheme.spacing.lg,
  },
  actionsContainer: {
    width: '100%',
    gap: SeniorTheme.spacing.xs,
  },
  actionButton: {
    marginVertical: SeniorTheme.spacing.xs,
  },
});

