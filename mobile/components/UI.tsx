import { ReactNode } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Colors, BorderRadius, FontSize, Spacing } from '@/constants/theme';
import { APP_LOGO_URL, APP_NAME } from '@/constants/brand';

// ─── Button ──────────────────────────────────────────────────────────────
interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: ReactNode;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  style,
  icon,
}: ButtonProps) {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        isPrimary && styles.buttonPrimary,
        isSecondary && styles.buttonSecondary,
        variant === 'ghost' && styles.buttonGhost,
        disabled && { opacity: 0.5 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? Colors.bg : Colors.text} />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.buttonText,
              isPrimary && { color: Colors.bg },
              !isPrimary && { color: Colors.text },
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────
export function Card({
  children,
  style,
  onPress,
}: {
  children: ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}) {
  const Component: any = onPress ? TouchableOpacity : View;
  return (
    <Component
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.card, style]}
    >
      {children}
    </Component>
  );
}

// ─── Tag / Pill ──────────────────────────────────────────────────────────
export function Tag({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.tag, active && styles.tagActive]}
    >
      <Text style={[styles.tagText, active && styles.tagTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Avatar ──────────────────────────────────────────────────────────────
export function Avatar({
  name,
  size = 40,
  uri,
}: {
  name?: string | null;
  size?: number;
  uri?: string | null;
}) {
  const initials = name
    ? name
        .split(' ')
        .slice(0, 2)
        .map((s) => s[0])
        .join('')
        .toUpperCase()
    : '?';
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: Colors.yellow,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          color: Colors.bg,
          fontSize: size * 0.4,
          fontWeight: '600',
        }}
      >
        {initials}
      </Text>
    </View>
  );
}

// ─── ScreenHeader ────────────────────────────────────────────────────────
export function ScreenHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <View style={styles.header}>
      <View style={{ flex: 1 }}>
        {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      {right}
    </View>
  );
}

export function BrandMark({ size = 34, showName = true }: { size?: number; showName?: boolean }) {
  return (
    <View style={styles.brandRow}>
      <Image
        source={{ uri: APP_LOGO_URL }}
        style={{ width: size, height: size, borderRadius: Math.round(size * 0.28) }}
        resizeMode="contain"
      />
      {showName ? <Text style={styles.brandText}>{APP_NAME}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  // Button
  button: {
    height: 52,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
  },
  buttonPrimary: {
    backgroundColor: Colors.yellow,
  },
  buttonSecondary: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  buttonText: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },

  // Card
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  // Tag
  tag: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagActive: {
    backgroundColor: Colors.yellow,
    borderColor: Colors.yellow,
  },
  tagText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  tagTextActive: {
    color: Colors.bg,
    fontWeight: '600',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: FontSize.xxl,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginBottom: 2,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  brandText: {
    color: Colors.text,
    fontSize: FontSize.sm,
    fontWeight: '800',
    letterSpacing: 2,
  },
});
