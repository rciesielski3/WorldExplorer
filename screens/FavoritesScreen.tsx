import React, { useMemo, useState } from "react";
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import { useTranslation } from "react-i18next";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import { useFavorites } from "../context/FavoritesContext";
import { useTheme } from "../context/ThemeContext";
import {
  countries,
  getLocalizedCountryName,
  getSearchableCountryText,
  type Country,
} from "../utils/countries";
import { FLAG_ASSETS } from "../utils/flagAssets";
import { SearchBar } from "../src/components/ui/SearchBar";
import { getStyles } from "../styles";
import { commonTokens } from "../theme/tokens";
import type { RootStackParamList } from "../types/navigation";

type FavoritesScreenProps = StackScreenProps<RootStackParamList, "Favorites">;

export const FavoritesScreen: React.FC<FavoritesScreenProps> = ({
  navigation,
}) => {
  const { getFavorites, toggleFavorite } = useFavorites();
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const styles = getStyles(theme);
  const [searchQuery, setSearchQuery] = useState("");

  const favoriteCodes = getFavorites();

  const favoriteCountries = useMemo<Country[]>(() => {
    const codes = new Set(favoriteCodes);
    return countries.filter((c) => codes.has(c.code));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [favoriteCodes.join(",")]);

  const filteredCountries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return favoriteCountries;
    return favoriteCountries.filter((c) =>
      getSearchableCountryText(c).includes(query)
    );
  }, [favoriteCountries, searchQuery]);

  const renderCountryCard = ({ item }: { item: Country }) => (
    <TouchableOpacity
      style={[styles.countryCard, localStyles.favCard]}
      onPress={() => navigation.navigate("CountryDetails", { country: item })}
      activeOpacity={0.78}
      testID={`favorite-card-${item.code}`}
    >
      <Image
        source={FLAG_ASSETS[item.flagPath]}
        style={styles.countryCardFlag}
      />
      <View style={styles.cardContent}>
        <Text style={styles.countryName}>
          {getLocalizedCountryName(item, i18n.language)}
        </Text>
        <Text style={styles.countryMetaText}>{item.capital}</Text>
      </View>
      <TouchableOpacity
        onPress={() => toggleFavorite(item.code)}
        testID={`unfavorite-${item.code}`}
        accessibilityRole="button"
        accessibilityLabel={t("removeFavorite", {
          country: getLocalizedCountryName(item, i18n.language),
        })}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={localStyles.heartButton}
      >
        <MaterialCommunityIcons
          name="heart"
          size={24}
          color={theme.colors.error}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (favoriteCountries.length === 0) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={localStyles.emptyContainer}>
          <MaterialCommunityIcons
            name="heart-outline"
            size={48}
            color={theme.colors.textSecondary}
          />
          <Text style={[styles.title, localStyles.emptyText]}>
            {t("noFavorites")}
          </Text>
          <Text style={[styles.settingDescription, localStyles.emptySubtext]}>
            {t("addFavoritesPrompt")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <SearchBar
        onSearch={setSearchQuery}
        placeholder={t("searchCountries")}
        style={localStyles.searchBar}
      />
      <FlatList
        data={filteredCountries}
        renderItem={renderCountryCard}
        keyExtractor={(item) => item.code}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={localStyles.listContainer}
        ListEmptyComponent={
          <View style={styles.exploreEmptyState}>
            <MaterialCommunityIcons
              name="magnify"
              size={32}
              color={theme.colors.text}
            />
            <Text style={styles.settingDescription}>
              {t("exploreEmptyState")}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  favCard: {
    flexDirection: "row",
    alignItems: "center",
  },
  heartButton: {
    minWidth: 48,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBar: {
    marginHorizontal: commonTokens.spacing.md,
    marginTop: commonTokens.spacing.md,
    marginBottom: commonTokens.spacing.sm,
  },
  listContainer: {
    paddingHorizontal: commonTokens.spacing.md,
    paddingBottom: commonTokens.spacing.xxl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: commonTokens.spacing.lg,
  },
  emptyText: {
    marginTop: commonTokens.spacing.md,
    textAlign: "center",
  },
  emptySubtext: {
    marginTop: commonTokens.spacing.sm,
    textAlign: "center",
    opacity: 0.72,
  },
});

export default FavoritesScreen;
