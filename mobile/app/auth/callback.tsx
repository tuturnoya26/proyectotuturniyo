import { ActivityIndicator, View } from 'react-native';
import { Colors } from '@/constants/theme';

export default function AuthCallbackScreen() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.bg,
      }}
    >
      <ActivityIndicator size="large" color={Colors.yellow} />
    </View>
  );
}
