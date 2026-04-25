import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { Colors } from '@/constants/theme';

export default function Index() {
  const { session, profile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      router.replace('/(auth)/welcome');
    } else if (profile?.role === 'owner') {
      router.replace('/(owner)/dashboard');
    } else {
      router.replace('/(tabs)/home');
    }
  }, [session, profile, loading]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ActivityIndicator color={Colors.yellow} size="large" />
    </View>
  );
}
