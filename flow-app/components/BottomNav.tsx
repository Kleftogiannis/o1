import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Theme } from '../constants/theme';

type NavItem = {
  id: string;
  label: string;
  icon: string;
  path: string;
};

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: '🏠', path: '/home' },
  { id: 'stats', label: 'Stats', icon: '📊', path: '/stats' },
  { id: 'profile', label: 'Profile', icon: '👤', path: '/profile' },
];

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const handlePress = (item: NavItem) => {
    if (pathname === item.path) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(item.path as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        {NAV_ITEMS.map((item, index) => {
          const isActive = pathname === item.path;

          return (
            <Pressable
              key={item.id}
              onPress={() => handlePress(item)}
              style={({ pressed }) => [
                styles.navItem,
                pressed && styles.navItemPressed,
              ]}
            >
              <View style={[styles.navContent, isActive && styles.navContentActive]}>
                {/* Icon */}
                <Text style={[styles.navIcon, isActive && styles.navIconActive]}>
                  {item.icon}
                </Text>

                {/* Label */}
                <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                  {item.label}
                </Text>

                {/* Active indicator */}
                {isActive && <View style={styles.activeIndicator} />}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.background,
    borderTopWidth: 2,
    borderTopColor: Theme.colors.border,
    paddingBottom: 8,
    paddingTop: 12,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  navItem: {
    flex: 1,
  },
  navItemPressed: {
    opacity: 0.6,
  },
  navContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    position: 'relative',
  },
  navContentActive: {
    // Active state handled by indicator
  },

  // Icon
  navIcon: {
    fontSize: 22,
    marginBottom: 4,
    opacity: 0.5,
  },
  navIconActive: {
    opacity: 1,
  },

  // Label
  navLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Theme.colors.textTertiary,
    letterSpacing: 0.5,
  },
  navLabelActive: {
    color: Theme.colors.primary,
    fontWeight: '700',
  },

  // Active indicator (line on top)
  activeIndicator: {
    position: 'absolute',
    top: 0,
    left: '20%',
    right: '20%',
    height: 3,
    backgroundColor: Theme.colors.primary,
    borderRadius: 2,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});
