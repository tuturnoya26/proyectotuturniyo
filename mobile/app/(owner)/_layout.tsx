import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius } from '@/constants/theme';
import { Platform, View } from 'react-native';

export default function OwnerLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.bgCard,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
        },
        tabBarActiveTintColor: Colors.yellow,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, focused }) => <I name="home" c={color} f={focused} />,
        }}
      />
      <Tabs.Screen
        name="agenda"
        options={{
          title: 'Agenda',
          tabBarIcon: ({ color, focused }) => <I name="calendar" c={color} f={focused} />,
        }}
      />
      <Tabs.Screen
        name="cash"
        options={{
          title: 'Caja',
          tabBarIcon: ({ color, focused }) => <I name="wallet" c={color} f={focused} />,
        }}
      />
      <Tabs.Screen
        name="business"
        options={{
          title: 'Mi local',
          tabBarIcon: ({ color, focused }) => <I name="storefront" c={color} f={focused} />,
        }}
      />
    </Tabs>
  );
}

function I({ name, c, f }: { name: any; c: string; f: boolean }) {
  return (
    <View
      style={{
        width: 44,
        height: 32,
        borderRadius: BorderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: f ? Colors.yellow : 'transparent',
      }}
    >
      <Ionicons name={name} size={20} color={f ? Colors.bg : c} />
    </View>
  );
}
