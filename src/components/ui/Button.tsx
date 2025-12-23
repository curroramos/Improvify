import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  PressableProps,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, radius, spacing, textStyles } from '@/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'gradient';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  ...props
}: ButtonProps) {
  const { theme, gradients } = useTheme();
  const isDisabled = disabled || loading;

  const sizeStyles = {
    sm: {
      paddingVertical: spacing[2],
      paddingHorizontal: spacing[4],
      borderRadius: radius.md,
      fontSize: textStyles.buttonSmall.fontSize,
    },
    md: {
      paddingVertical: spacing[3],
      paddingHorizontal: spacing[5],
      borderRadius: radius.lg,
      fontSize: textStyles.button.fontSize,
    },
    lg: {
      paddingVertical: spacing[4],
      paddingHorizontal: spacing[6],
      borderRadius: radius.xl,
      fontSize: textStyles.button.fontSize + 2,
    },
  };

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    if (isDisabled) {
      return {
        container: {
          backgroundColor: theme.button.disabledBackground,
        },
        text: {
          color: theme.button.disabledText,
        },
      };
    }

    switch (variant) {
      case 'secondary':
        return {
          container: {
            backgroundColor: theme.button.secondaryBackground,
          },
          text: {
            color: theme.button.secondaryText,
          },
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
          },
          text: {
            color: theme.button.ghostText,
          },
        };
      case 'gradient':
        return {
          container: {},
          text: {
            color: theme.button.primaryText,
          },
        };
      default:
        return {
          container: {
            backgroundColor: theme.button.primaryBackground,
          },
          text: {
            color: theme.button.primaryText,
          },
        };
    }
  };

  const variantStyles = getVariantStyles();
  const currentSize = sizeStyles[size];

  const content = (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        {
          paddingVertical: currentSize.paddingVertical,
          paddingHorizontal: currentSize.paddingHorizontal,
          borderRadius: currentSize.borderRadius,
          opacity: pressed && !isDisabled ? 0.8 : 1,
        },
        variant !== 'gradient' && variantStyles.container,
        fullWidth && styles.fullWidth,
        style,
      ]}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variantStyles.text.color} />
      ) : (
        <>
          {leftIcon && <>{leftIcon}</>}
          <Text
            style={[
              styles.text,
              {
                fontSize: currentSize.fontSize,
                fontWeight: textStyles.button.fontWeight,
              },
              variantStyles.text,
              leftIcon ? { marginLeft: spacing[2] } : undefined,
              rightIcon ? { marginRight: spacing[2] } : undefined,
              textStyle,
            ]}
          >
            {children}
          </Text>
          {rightIcon && <>{rightIcon}</>}
        </>
      )}
    </Pressable>
  );

  if (variant === 'gradient' && !isDisabled) {
    return (
      <LinearGradient
        colors={gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[{ borderRadius: currentSize.borderRadius }, fullWidth && styles.fullWidth]}
      >
        {content}
      </LinearGradient>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    textAlign: 'center',
  },
});
