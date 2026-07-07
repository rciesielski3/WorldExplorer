import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  TextInput,
} from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import { useTheme } from "../context/ThemeContext";
import { countries, getLocalizedCountryName, type Country } from "../utils/countries";
import { getStyles } from "../styles";
import { ComparisonTable } from "../src/components/ui/ComparisonTable";
import { commonTokens } from "../theme/tokens";
import type { RootStackParamList } from "../types/navigation";

type ComparisonScreenProps = StackScreenProps<RootStackParamList, "Comparison">;

const MAX_COMPARISON_COUNTRIES = 3;

export const ComparisonScreen: React.FC<ComparisonScreenProps> = ({ route }) => {
  const [selectedCountries, setSelectedCountries] = useState<Country[]>(
    route.params?.initialCountries || []
  );
  const [showPicker, setShowPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const { colors } = theme;
  const styles = getStyles(theme);

  const canAddMore = selectedCountries.length < MAX_COMPARISON_COUNTRIES;

  const availableCountries = React.useMemo(() => {
    const selectedCodes = new Set(selectedCountries.map((s) => s.code));
    const query = searchQuery.toLowerCase();
    return countries.filter(
      (c) =>
        !selectedCodes.has(c.code) &&
        getLocalizedCountryName(c, i18n.language).toLowerCase().includes(query)
    );
  }, [selectedCountries, searchQuery, i18n.language]);

  const handleSelectCountry = (country: Country) => {
    if (canAddMore) {
      setSelectedCountries([...selectedCountries, country]);
      setSearchQuery("");
    }
  };

  const handleRemoveCountry = (code: string) => {
    setSelectedCountries(selectedCountries.filter((c) => c.code !== code));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Selected countries chips */}
      <View style={localStyles.selectedContainer}>
        {selectedCountries.map((country) => (
          <View
            key={country.code}
            style={[localStyles.chip, { backgroundColor: colors.primary }]}
          >
            <Text style={[localStyles.chipText, { color: colors.buttonText }]}>
              {getLocalizedCountryName(country, i18n.language)}
            </Text>
            <TouchableOpacity
              onPress={() => handleRemoveCountry(country.code)}
              testID={`remove-country-${country.code}`}
              accessibilityLabel={`${t("back")} ${getLocalizedCountryName(country, i18n.language)}`}
            >
              <MaterialCommunityIcons name="close" size={16} color={colors.buttonText} />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Add more button */}
      {canAddMore && (
        <TouchableOpacity
          style={[localStyles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowPicker(true)}
          testID="add-country-btn"
          accessibilityRole="button"
          accessibilityLabel={t("addCountry")}
        >
          <MaterialCommunityIcons name="plus" size={20} color={colors.buttonText} />
          <Text style={[localStyles.addButtonText, { color: colors.buttonText }]}>
            {t("addCountry")}
          </Text>
        </TouchableOpacity>
      )}

      {/* Comparison table */}
      {selectedCountries.length >= 2 && (
        <View style={localStyles.tableContainer}>
          <ComparisonTable countries={selectedCountries} />
        </View>
      )}

      {/* Country picker modal */}
      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={[localStyles.pickerHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity
              onPress={() => setShowPicker(false)}
              testID="picker-close-btn"
              accessibilityRole="button"
              accessibilityLabel={t("back")}
            >
              <MaterialCommunityIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[localStyles.pickerTitle, { color: colors.text }]}>
              {t("selectCountry")}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <TextInput
            style={[
              localStyles.pickerSearch,
              { borderColor: colors.border, color: colors.text },
            ]}
            placeholder={t("searchCountries")}
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            testID="picker-search"
          />

          <FlatList
            data={availableCountries}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[localStyles.pickerItem, { borderBottomColor: colors.border }]}
                onPress={() => handleSelectCountry(item)}
                testID={`picker-item-${item.code}`}
              >
                <Text style={{ color: colors.text }}>
                  {getLocalizedCountryName(item, i18n.language)}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.code}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  selectedContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: commonTokens.spacing.md,
    gap: commonTokens.spacing.sm,
  },
  chip: {
    borderRadius: commonTokens.borderRadius.full,
    paddingHorizontal: commonTokens.spacing.md,
    paddingVertical: commonTokens.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: commonTokens.spacing.sm,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  addButton: {
    marginHorizontal: commonTokens.spacing.md,
    marginBottom: commonTokens.spacing.md,
    borderRadius: commonTokens.borderRadius.md,
    paddingVertical: commonTokens.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: commonTokens.spacing.sm,
    minHeight: 48,
  },
  addButtonText: {
    fontWeight: "600",
  },
  tableContainer: {
    flex: 1,
    padding: commonTokens.spacing.md,
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: commonTokens.spacing.md,
    paddingVertical: commonTokens.spacing.md,
    borderBottomWidth: 1,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  pickerSearch: {
    marginHorizontal: commonTokens.spacing.md,
    marginVertical: commonTokens.spacing.md,
    paddingHorizontal: commonTokens.spacing.md,
    paddingVertical: commonTokens.spacing.sm,
    borderWidth: 1,
    borderRadius: commonTokens.borderRadius.sm,
  },
  pickerItem: {
    paddingHorizontal: commonTokens.spacing.md,
    paddingVertical: commonTokens.spacing.md,
    borderBottomWidth: 1,
    minHeight: 48,
    justifyContent: "center",
  },
});
