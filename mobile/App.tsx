import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity
} from 'react-native';
import { useQoSStore, initQoSStore } from './src/state/useQoSStore';
import { DashboardScreen } from './src/presentation/screens/DashboardScreen';
import { ActiveTestScreen } from './src/presentation/screens/ActiveTestScreen';
import { CoverageMapScreen } from './src/presentation/screens/CoverageMapScreen';
import { AnalyticsScreen } from './src/presentation/screens/AnalyticsScreen';
import { HistoryScreen } from './src/presentation/screens/HistoryScreen';
import { SettingsScreen } from './src/presentation/screens/SettingsScreen';
import { DegradationAlertBanner } from './src/presentation/components/DegradationAlertBanner';
import { colors } from './src/theme/colors';

export type TabType = 'dashboard' | 'test' | 'map' | 'analytics' | 'history' | 'settings';

export default function App(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const { currentNetwork, alerts, dismissAlert, activeTestPhase } = useQoSStore();

  useEffect(() => {
    initQoSStore();
  }, []);

  const isTesting = activeTestPhase !== 'idle' && activeTestPhase !== 'completed';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.titleRow}>
            <Text style={styles.headerTitle}>Network QoS Monitor</Text>
            <View style={styles.versionBadge}>
              <Text style={styles.versionText}>LSI 2026</Text>
            </View>
          </View>

          {currentNetwork && (
            <View style={styles.networkPill}>
              <View style={[styles.networkDot, {
                backgroundColor: currentNetwork.networkGeneration === '5G' ? colors.gen5G :
                                 currentNetwork.networkGeneration === '4G' ? colors.gen4G :
                                 currentNetwork.networkGeneration === '3G' ? colors.gen3G : colors.genWifi
              }]} />
              <Text style={styles.networkPillText}>
                {currentNetwork.networkGeneration} • {currentNetwork.signal.dbm}dBm
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.headerSubtitle}>
          Analizador de Calidad de Red Móvil & Mapeo de Cobertura
        </Text>
      </View>

      {/* Degradation Alert Banner (RF-07) */}
      <DegradationAlertBanner alerts={alerts} onDismiss={dismissAlert} />

      {/* Active Screen View */}
      <View style={styles.content}>
        {activeTab === 'dashboard' && (
          <DashboardScreen
            onStartTest={() => setActiveTab('test')}
            onGoToMap={() => setActiveTab('map')}
          />
        )}
        {activeTab === 'test' && (
          <ActiveTestScreen
            onGoToMap={() => setActiveTab('map')}
            onGoToDashboard={() => setActiveTab('dashboard')}
          />
        )}
        {activeTab === 'map' && <CoverageMapScreen />}
        {activeTab === 'analytics' && <AnalyticsScreen />}
        {activeTab === 'history' && <HistoryScreen />}
        {activeTab === 'settings' && <SettingsScreen />}
      </View>

      {/* Bottom Navigation Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'dashboard' && styles.tabItemActive]}
          onPress={() => setActiveTab('dashboard')}
        >
          <Text style={[styles.tabIcon, activeTab === 'dashboard' && styles.tabIconActive]}>📊</Text>
          <Text style={[styles.tabLabel, activeTab === 'dashboard' && styles.tabLabelActive]}>Panel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'test' && styles.tabItemActive]}
          onPress={() => setActiveTab('test')}
        >
          <Text style={[styles.tabIcon, activeTab === 'test' && styles.tabIconActive]}>
            {isTesting ? '⏳' : '⚡'}
          </Text>
          <Text style={[styles.tabLabel, activeTab === 'test' && styles.tabLabelActive]}>
            {isTesting ? 'Midiendo' : 'Test'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'map' && styles.tabItemActive]}
          onPress={() => setActiveTab('map')}
        >
          <Text style={[styles.tabIcon, activeTab === 'map' && styles.tabIconActive]}>🗺️</Text>
          <Text style={[styles.tabLabel, activeTab === 'map' && styles.tabLabelActive]}>Mapa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'analytics' && styles.tabItemActive]}
          onPress={() => setActiveTab('analytics')}
        >
          <Text style={[styles.tabIcon, activeTab === 'analytics' && styles.tabIconActive]}>📈</Text>
          <Text style={[styles.tabLabel, activeTab === 'analytics' && styles.tabLabelActive]}>Gráficos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'history' && styles.tabItemActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabIcon, activeTab === 'history' && styles.tabIconActive]}>🕒</Text>
          <Text style={[styles.tabLabel, activeTab === 'history' && styles.tabLabelActive]}>Historial</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'settings' && styles.tabItemActive]}
          onPress={() => setActiveTab('settings')}
        >
          <Text style={[styles.tabIcon, activeTab === 'settings' && styles.tabIconActive]}>⚙️</Text>
          <Text style={[styles.tabLabel, activeTab === 'settings' && styles.tabLabelActive]}>Ajustes</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.backgroundSecondary
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.3
  },
  versionBadge: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary
  },
  versionText: {
    fontSize: 9,
    fontWeight: '900',
    color: colors.primary
  },
  networkPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  networkDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  networkPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.text,
    fontFamily: 'monospace'
  },
  headerSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2
  },
  content: {
    flex: 1
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 6,
    paddingHorizontal: 4,
    justifyContent: 'space-around'
  },
  tabItem: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8
  },
  tabItemActive: {
    backgroundColor: colors.surfaceHighlight
  },
  tabIcon: {
    fontSize: 16,
    marginBottom: 2
  },
  tabIconActive: {
    transform: [{ scale: 1.1 }]
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '900'
  }
});
