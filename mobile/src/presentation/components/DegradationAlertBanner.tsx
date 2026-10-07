import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DegradationAlert } from '../../notifications/NotificationManager';
import { colors } from '../../theme/colors';

interface DegradationAlertBannerProps {
  alerts: DegradationAlert[];
  onDismiss: (id: string) => void;
}

export const DegradationAlertBanner: React.FC<DegradationAlertBannerProps> = ({ alerts, onDismiss }) => {
  if (alerts.length === 0) return null;

  const activeAlert = alerts[0]; // Show most recent active alert
  const isCritical = activeAlert.severity === 'critical';
  const borderColor = isCritical ? colors.danger : colors.warning;
  const bgColor = isCritical ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)';

  return (
    <View style={[styles.container, { borderColor, backgroundColor: bgColor }]}>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: borderColor }]}>
            {activeAlert.title}
          </Text>
          <TouchableOpacity onPress={() => onDismiss(activeAlert.id)} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.message}>{activeAlert.message}</Text>
        <Text style={styles.details}>{activeAlert.details}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 12
  },
  content: {
    gap: 4
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  closeBtn: {
    padding: 4
  },
  closeBtnText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700'
  },
  message: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600'
  },
  details: {
    fontSize: 10,
    color: colors.textSecondary,
    fontFamily: 'monospace',
    marginTop: 2
  }
});
