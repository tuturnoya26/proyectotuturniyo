import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Button } from '@/components/UI';
import { Colors, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { APP_LOGO_URL, APP_NAME } from '@/constants/brand';

const { width, height } = Dimensions.get('window');

export default function Welcome() {
  return (
    <View style={styles.container}>
      {/* Background image placeholder */}
      <View style={styles.bgImage}>
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.4)', '#0A0A0A']}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        {/* Decorative circles */}
        <View style={[styles.decorCircle, { top: 80, right: -40 }]} />
        <View style={[styles.decorCircle2, { top: 200, left: -60 }]} />
      </View>

      <View style={styles.content}>
        <Image source={{ uri: APP_LOGO_URL }} style={styles.logoImage} resizeMode="contain" />

        <Text style={styles.brandName}>{APP_NAME}</Text>

        <Text style={styles.heading}>
          Encontrá la mejor{'\n'}
          <Text style={styles.headingAccent}>barbería</Text> cerca tuyo
        </Text>

        <Text style={styles.subheading}>
          Reservá tu turno con los mejores profesionales de tu zona en pocos toques.
        </Text>

        <View style={styles.actions}>
          <Button title="Empezar" onPress={() => router.push('/(auth)/login')} />
          <Button
            title="Ya tengo cuenta"
            variant="ghost"
            onPress={() => router.push('/(auth)/login')}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  bgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.6,
    backgroundColor: '#1a1a1a',
    overflow: 'hidden',
  },
  decorCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.yellow,
    opacity: 0.15,
  },
  decorCircle2: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: Colors.yellow,
    opacity: 0.08,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.xxl,
    paddingBottom: 60,
  },
  logoImage: {
    width: 72,
    height: 72,
    marginBottom: Spacing.xl,
  },
  brandName: {
    color: Colors.text,
    fontSize: FontSize.sm,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: Spacing.lg,
  },
  heading: {
    color: Colors.text,
    fontSize: 38,
    fontWeight: '800',
    lineHeight: 44,
    marginBottom: Spacing.lg,
  },
  headingAccent: {
    color: Colors.yellow,
  },
  subheading: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    lineHeight: 22,
    marginBottom: Spacing.xxxl,
  },
  actions: {
    gap: Spacing.md,
  },
});
