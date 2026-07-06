import React from "react";
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

import { useQuizHistory } from "../context/QuizHistoryContext";
import { useTheme } from "../context/ThemeContext";
import { ACHIEVEMENTS } from "../utils/achievements";
import { getStyles } from "../styles";
import { commonTokens } from "../theme/tokens";

export const QuizStatsScreen = ({ navigation }: any) => {
  const { getStats, clearHistory } = useQuizHistory();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = getStyles(theme);

  const stats = getStats();

  const handleClearHistory = () => {
    clearHistory();
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={localStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, localStyles.header]}>
          {t("quizStatistics")}
        </Text>

        <View style={localStyles.statsGrid}>
          <View
            style={[
              localStyles.statCard,
              { borderColor: theme.colors.primary, backgroundColor: theme.colors.card },
            ]}
            testID="stat-total-quizzes"
          >
            <Text style={[styles.countryStatValue, { color: theme.colors.text }]}>
              {stats.totalQuizzes}
            </Text>
            <Text style={styles.countryStatLabel}>{t("totalQuizzes")}</Text>
          </View>

          <View
            style={[
              localStyles.statCard,
              { borderColor: theme.colors.secondary, backgroundColor: theme.colors.card },
            ]}
            testID="stat-current-streak"
          >
            <Text style={[styles.countryStatValue, { color: theme.colors.text }]}>
              {stats.currentStreak}
            </Text>
            <Text style={styles.countryStatLabel}>{t("currentStreak")}</Text>
          </View>

          <View
            style={[
              localStyles.statCard,
              { borderColor: theme.colors.success, backgroundColor: theme.colors.card },
            ]}
            testID="stat-best-score"
          >
            <Text style={[styles.countryStatValue, { color: theme.colors.text }]}>
              {stats.bestScore}%
            </Text>
            <Text style={styles.countryStatLabel}>{t("bestScore")}</Text>
          </View>
        </View>

        <Text style={[styles.subtitle, localStyles.sectionTitle]}>
          {t("achievements")}
        </Text>

        <View style={localStyles.achievementsGrid}>
          {ACHIEVEMENTS.map((achievement) => (
            <View
              key={achievement.id}
              style={[
                localStyles.achievementBadge,
                { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
              ]}
              testID={`achievement-${achievement.id}`}
            >
              <Text style={localStyles.achievementIcon}>{achievement.icon}</Text>
              <Text
                style={[styles.countryMetaText, localStyles.achievementLabel]}
                numberOfLines={2}
              >
                {t(achievement.labelKey)}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          testID="clear-history-btn"
          style={[localStyles.clearButton, { backgroundColor: theme.colors.error }]}
          onPress={handleClearHistory}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={t("clearHistory")}
        >
          <Text style={localStyles.clearButtonText}>{t("clearHistory")}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  scrollContent: {
    padding: commonTokens.spacing.md,
    paddingBottom: commonTokens.spacing.xxl,
  },
  header: {
    marginBottom: commonTokens.spacing.lg,
  },
  sectionTitle: {
    marginBottom: commonTokens.spacing.md,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: commonTokens.spacing.sm,
    marginBottom: commonTokens.spacing.lg,
  },
  statCard: {
    width: "31%",
    minHeight: 90,
    padding: commonTokens.spacing.sm,
    borderRadius: commonTokens.borderRadius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  achievementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: commonTokens.spacing.sm,
    marginBottom: commonTokens.spacing.xl,
  },
  achievementBadge: {
    width: "45%",
    minHeight: 96,
    padding: commonTokens.spacing.md,
    borderRadius: commonTokens.borderRadius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: commonTokens.spacing.xs,
  },
  achievementLabel: {
    textAlign: "center",
  },
  clearButton: {
    minHeight: commonTokens.touchTarget.minimum,
    borderRadius: commonTokens.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: commonTokens.spacing.sm,
  },
  clearButtonText: {
    color: "#FFFFFF",
    fontFamily: "Exo2-Bold",
    fontSize: 15,
  },
});

export default QuizStatsScreen;
