import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Pressable,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme, radius, spacing, fontSize, fontWeight } from '@/theme';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: keyof typeof MaterialIcons.glyphMap;
  rightIcon?: keyof typeof MaterialIcons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  secureTextEntry?: boolean;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  secureTextEntry,
  ...props
}: InputProps) {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  const hasError = !!error;
  const showPasswordToggle = secureTextEntry;

  const getBorderColor = () => {
    if (hasError) return theme.border.error;
    if (isFocused) return theme.border.focus;
    return theme.input.border;
  };

  const getIconColor = () => {
    if (hasError) return theme.semantic.error;
    if (isFocused) return theme.input.iconFocus;
    return theme.input.icon;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, { color: theme.text.primary }]}>{label}</Text>}

      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: theme.input.background,
            borderColor: getBorderColor(),
          },
          isFocused && styles.inputWrapperFocused,
          hasError && styles.inputWrapperError,
        ]}
      >
        {leftIcon && (
          <MaterialIcons name={leftIcon} size={20} color={getIconColor()} style={styles.leftIcon} />
        )}

        <TextInput
          style={[
            styles.input,
            {
              color: theme.input.text,
            },
            !leftIcon && { paddingLeft: spacing[4] },
            inputStyle,
          ]}
          placeholderTextColor={theme.input.placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isSecure}
          {...props}
        />

        {showPasswordToggle && (
          <Pressable
            onPress={() => setIsSecure(!isSecure)}
            style={styles.rightIconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons
              name={isSecure ? 'visibility-off' : 'visibility'}
              size={20}
              color={theme.input.icon}
            />
          </Pressable>
        )}

        {rightIcon && !showPasswordToggle && (
          <Pressable
            onPress={onRightIconPress}
            style={styles.rightIconButton}
            disabled={!onRightIconPress}
          >
            <MaterialIcons name={rightIcon} size={20} color={getIconColor()} />
          </Pressable>
        )}
      </View>

      {(error || hint) && (
        <Text
          style={[
            styles.helperText,
            { color: hasError ? theme.semantic.error : theme.text.tertiary },
          ]}
        >
          {error || hint}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginBottom: spacing[2],
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.lg,
    minHeight: 52,
  },
  inputWrapperFocused: {
    borderWidth: 2,
  },
  inputWrapperError: {
    borderWidth: 2,
  },
  leftIcon: {
    marginLeft: spacing[3],
  },
  input: {
    flex: 1,
    fontSize: fontSize.base,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[3],
  },
  rightIconButton: {
    padding: spacing[3],
  },
  helperText: {
    fontSize: fontSize.xs,
    marginTop: spacing[1],
    marginLeft: spacing[1],
  },
});
