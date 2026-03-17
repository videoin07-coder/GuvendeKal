import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './src/ui/HomeScreen';
import ContactsScreen from './src/ui/ContactsScreen';
import SafeWalkScreen from './src/ui/SafeWalkScreen';
import HistoryScreen from './src/ui/HistoryScreen';
import SettingsScreen from './src/ui/SettingsScreen';
import { Colors } from './src/theme';

type Tab = 'home' | 'contacts' | 'walk' | 'history' | 'settings';

interface TabItem {
  key: Tab;
  icon: string;
  label: string;
}

const TABS: TabItem[] = [
  { key: 'home',     icon: '🛡️', label: 'SOS'      },
  { key: 'walk',     icon: '🚶', label: 'Yürüyüş'  },
  { key: 'contacts', icon: '👥', label: 'Kişiler'   },
  { key: 'history',  icon: '📋', label: 'Geçmiş'   },
  { key: 'settings', icon: '⚙️', label: 'Ayarlar'  },
];

const SCREENS: Record<Tab, React.ReactElement> = {
  home:     <HomeScreen />,
  walk:     <SafeWalkScreen />,
  contacts: <ContactsScreen />,
  history:  <HistoryScreen />,
  settings: <SettingsScreen />,
};

export default function App() {
  const [active, setActive] = useState<Tab>('home');

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Screen */}
      <View style={styles.screen}>{SCREENS[active]}</View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const isActive = active === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tab}
              onPress={() => setActive(tab.key)}
              activeOpacity={0.75}
            >
              {isActive && <View style={styles.tabIndicator} />}
              <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>
                {tab.icon}
              </Text>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg1 },
  screen: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.bg2,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: 6,
    paddingTop: 6,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    top: 0,
    width: 28,
    height: 2,
    borderRadius: 2,
    backgroundColor: Colors.red,
  },
  tabIcon: { fontSize: 20, opacity: 0.45 },
  tabIconActive: { opacity: 1 },
  tabLabel: { fontSize: 10, color: Colors.textMuted, marginTop: 3, fontWeight: '500' },
  tabLabelActive: { color: Colors.red, fontWeight: '700' },
});
