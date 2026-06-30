import React, { useState } from 'react';
import { TextInput, View, KeyboardAvoidingView, Platform } from 'react-native';
import MaterialCommunityIcons from '@react-native-vector-icons/material-community-icons';
import { useTheme } from '../../../context/ThemeContext';
import { commonTokens } from '../../../theme/tokens';

interface InputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  icon?: string;
  disabled?: boolean;
  label?: string;
  accessibilityHint?: string;
}

export function Input({
  placeholder,
  value,
  onChangeText,
  icon,
  disabled = false,
  label,
  accessibilityHint,
}: InputProps) {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          height: 48,
          minHeight: 48,
          borderRadius: commonTokens.borderRadius.md,
          backgroundColor: theme.colors.surfaceVariant,
          paddingHorizontal: commonTokens.spacing.md,
          borderWidth: isFocused ? 2 : 1,
          borderColor: isFocused ? theme.colors.primary : theme.colors.border,
        }}
      >
        {icon && (
          <MaterialCommunityIcons
            name={icon}
            size={20}
            color={isFocused ? theme.colors.primary : theme.colors.textSecondary}
            style={{ marginRight: commonTokens.spacing.sm }}
          />
        )}
        <TextInput
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={!disabled}
          placeholderTextColor={theme.colors.textSecondary}
          accessibilityLabel={label || placeholder}
          accessibilityHint={accessibilityHint}
          style={{
            flex: 1,
            color: theme.colors.text,
            fontSize: commonTokens.typography.bodyMd.fontSize,
            fontFamily: commonTokens.typography.bodyMd.fontFamily,
            minHeight: 48,
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
