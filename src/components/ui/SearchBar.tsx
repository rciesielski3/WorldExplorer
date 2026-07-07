import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../context/ThemeContext';
import { commonTokens } from '../../../theme/tokens';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  style?: ViewStyle;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Search countries...',
  style,
}) => {
  const [query, setQuery] = useState('');
  const { theme } = useTheme();
  const { colors } = theme;

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <View style={[styles.container, style]}>
      <MaterialCommunityIcons
        name="magnify"
        size={20}
        color={colors.text}
        style={styles.icon}
      />
      <TextInput
        style={[styles.input, { color: colors.text, backgroundColor: colors.surfaceVariant }]}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        value={query}
        onChangeText={(text) => {
          setQuery(text);
          onSearch(text);
        }}
        testID="search-input"
      />
      {query.length > 0 && (
        <TouchableOpacity onPress={handleClear} testID="clear-btn">
          <MaterialCommunityIcons
            name="close-circle"
            size={20}
            color={colors.text}
            style={styles.clearIcon}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: commonTokens.spacing.md,
    paddingVertical: commonTokens.spacing.sm,
    borderRadius: 8,
  },
  icon: {
    marginRight: commonTokens.spacing.sm,
  },
  input: {
    flex: 1,
    paddingHorizontal: commonTokens.spacing.sm,
    paddingVertical: commonTokens.spacing.xs,
    borderRadius: 6,
    fontSize: 14,
  },
  clearIcon: {
    marginLeft: commonTokens.spacing.sm,
  },
});
