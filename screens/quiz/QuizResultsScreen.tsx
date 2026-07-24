import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Share,
  SafeAreaView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation, StackActions } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
  ZoomIn,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../../context/ThemeContext';
import { commonTokens } from '../../theme/tokens';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { logger } from '../../utils/logger';
import { useQuizHistory } from '../../context/QuizHistoryContext';

interface QuizResultsRouteParams {
  score: number;
  questions: Array<{
    question: string;
    answer: string;
    selectedAnswer?: string;
    type?: string;
  }>;
  difficulty?: 'easy' | 'medium' | 'hard';
  timeTaken?: number;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export function QuizResultsScreen() {
  const route = useRoute();
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { score, questions } = (route.params as QuizResultsRouteParams);
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const { addQuizSession } = useQuizHistory();
  const lottieRef = React.useRef<LottieView>(null);
  const badgeScale = useSharedValue(0);

  const scorePercentage = Math.round((score / questions.length) * 100);
  const correctCount = score;
  const incorrectCount = questions.filter((q) => q.selectedAnswer && q.selectedAnswer !== q.answer).length;
  const skippedCount = questions.filter((q) => !q.selectedAnswer).length;

  // Animations
  const badgeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }));

  useEffect(() => {
    // Start confetti animation
    if (lottieRef.current) {
      lottieRef.current.play();
    }

    // Animate score badge after 500ms
    badgeScale.value = withDelay(500, withSpring(1, { damping: 8, mass: 1, overshootClamping: false }));
  }, []);

  React.useEffect(() => {
    const difficulty = (route.params as QuizResultsRouteParams)?.difficulty || 'medium';
    addQuizSession({
      timestamp: Date.now(),
      difficulty: difficulty as 'easy' | 'medium' | 'hard',
      score: (route.params as QuizResultsRouteParams)?.score || 0,
      timeTaken: (route.params as QuizResultsRouteParams)?.timeTaken || 0,
    }).catch((error) => {
      logger.error('Failed to save quiz session', {
        context: 'QuizResultsScreen',
        timestamp: new Date().toISOString(),
        metadata: { error: String(error) },
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params]);

  const handlePlayAgain = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.replace('Quiz');
  };

  const handleShareScore = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await Share.share({
        message: t('quizShareMessage', {
          score: scorePercentage,
          defaultValue: `I scored ${scorePercentage}% on World Explorer Quiz!`,
        }),
        title: t('quizShareTitle', { defaultValue: 'My Quiz Score' }),
      });
    } catch (error) {
      logger.warn('Failed to share quiz score', {
        context: 'QuizResultsScreen',
        timestamp: new Date().toISOString(),
        metadata: {
          score: scorePercentage,
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
  };

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Confetti Animation */}
      <LottieView
        ref={lottieRef}
        source={require('../../assets/animations/confetti.json')}
        autoPlay={false}
        loop={false}
        style={styles.confetti}
      />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>{t('quizComplete', { defaultValue: 'Quiz Complete!' })}</Text>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.replace('Home');
          }}
          style={styles.closeButton}
        >
          <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Score Badge */}
        <Animated.View
          style={[styles.badgeContainer, badgeAnimatedStyle]}
          entering={ZoomIn.springify().delay(300)}
        >
          <View style={styles.scoreBadge}>
            <Text style={styles.scorePercentage}>{scorePercentage}%</Text>
            <Text style={styles.scoreLabel}>{t('quizCorrect', { defaultValue: 'Correct' })}</Text>
          </View>
        </Animated.View>

        {/* Performance Message */}
        <AnimatedView
          entering={FadeInUp.delay(600).springify()}
          style={styles.performanceSection}
        >
          <Text style={styles.performanceTitle}>
            {t('quizYouGot', { defaultValue: `You got ${scorePercentage}% correct!` })}
          </Text>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${scorePercentage}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.scoreText}>
              {score}/{questions.length} {t('quizQuestions', { defaultValue: 'Questions' })}
            </Text>
          </View>
        </AnimatedView>

        {/* Breakdown Cards */}
        <AnimatedView
          entering={FadeInUp.delay(800).springify()}
          style={styles.breakdownContainer}
        >
          <Text style={styles.breakdownTitle}>{t('quizBreakdown', { defaultValue: 'Breakdown' })}</Text>
          <View style={styles.cardsGrid}>
            {/* Correct Card */}
            <Card style={styles.breakdownCard}>
              <View style={styles.cardContent}>
                <View style={[styles.cardIcon, { backgroundColor: theme.colors.success }]}>
                  <MaterialCommunityIcons name="check-circle" size={24} color="#FFFFFF" />
                </View>
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardNumber}>{correctCount}</Text>
                  <Text style={styles.cardLabel}>{t('quizCorrect', { defaultValue: 'Correct' })}</Text>
                </View>
              </View>
            </Card>

            {/* Incorrect Card */}
            <Card style={styles.breakdownCard}>
              <View style={styles.cardContent}>
                <View style={[styles.cardIcon, { backgroundColor: theme.colors.error }]}>
                  <MaterialCommunityIcons name="close-circle" size={24} color="#FFFFFF" />
                </View>
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardNumber}>{incorrectCount}</Text>
                  <Text style={styles.cardLabel}>{t('quizIncorrect', { defaultValue: 'Incorrect' })}</Text>
                </View>
              </View>
            </Card>

            {/* Skipped Card */}
            <Card style={styles.breakdownCard}>
              <View style={styles.cardContent}>
                <View style={[styles.cardIcon, { backgroundColor: theme.colors.amber }]}>
                  <MaterialCommunityIcons name="skip-forward-circle" size={24} color="#FFFFFF" />
                </View>
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardNumber}>{skippedCount}</Text>
                  <Text style={styles.cardLabel}>{t('quizSkipped', { defaultValue: 'Skipped' })}</Text>
                </View>
              </View>
            </Card>
          </View>
        </AnimatedView>

        {/* Action Buttons */}
        <AnimatedView
          entering={FadeInUp.delay(1000).springify()}
          style={styles.actionsContainer}
        >
          <Button
            label={t('quizPlayAgain', { defaultValue: 'Play Again' })}
            onPress={handlePlayAgain}
            variant="filled"
            style={styles.primaryButton}
          />
          <Button
            label={t('quizShareScore', { defaultValue: 'Share Score' })}
            onPress={handleShareScore}
            variant="outlined"
            style={styles.secondaryButton}
          />
        </AnimatedView>

        {/* Floating Navigation Bar Placeholder */}
        <View style={styles.navigationBarPlaceholder} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    confetti: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 400,
      zIndex: 100,
      pointerEvents: 'none',
    },
    topBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: commonTokens.spacing.lg,
      paddingVertical: commonTokens.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    topBarTitle: {
      fontSize: commonTokens.typography.displayMd.fontSize,
      fontFamily: commonTokens.typography.displayMd.fontFamily,
      color: theme.colors.text,
      fontWeight: '700',
    },
    closeButton: {
      width: 40,
      height: 40,
      borderRadius: commonTokens.borderRadius.full,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
    },
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      paddingHorizontal: commonTokens.spacing.lg,
      paddingBottom: commonTokens.spacing.xl,
    },
    badgeContainer: {
      alignItems: 'center',
      marginTop: commonTokens.spacing.xl,
      marginBottom: commonTokens.spacing.xl,
    },
    scoreBadge: {
      width: 180,
      height: 180,
      borderRadius: 90,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.lg,
    },
    scorePercentage: {
      fontSize: 56,
      fontFamily: commonTokens.typography.displayMd.fontFamily,
      color: '#FFFFFF',
      fontWeight: '700',
    },
    scoreLabel: {
      fontSize: commonTokens.typography.bodyMd.fontSize,
      fontFamily: commonTokens.typography.bodyMd.fontFamily,
      color: 'rgba(255, 255, 255, 0.8)',
      marginTop: commonTokens.spacing.xs,
    },
    performanceSection: {
      marginBottom: commonTokens.spacing.xl,
    },
    performanceTitle: {
      fontSize: commonTokens.typography.displaySm.fontSize,
      fontFamily: commonTokens.typography.displaySm.fontFamily,
      color: theme.colors.text,
      fontWeight: '700',
      marginBottom: commonTokens.spacing.md,
      textAlign: 'center',
    },
    progressBarContainer: {
      gap: commonTokens.spacing.md,
    },
    progressBarBackground: {
      height: 12,
      borderRadius: commonTokens.borderRadius.full,
      backgroundColor: theme.colors.surface,
      overflow: 'hidden',
      ...theme.shadows.sm,
    },
    progressBarFill: {
      height: '100%',
      borderRadius: commonTokens.borderRadius.full,
      backgroundColor: theme.colors.primary,
    },
    scoreText: {
      fontSize: commonTokens.typography.bodyMd.fontSize,
      fontFamily: commonTokens.typography.bodyMd.fontFamily,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    breakdownContainer: {
      marginBottom: commonTokens.spacing.xl,
    },
    breakdownTitle: {
      fontSize: commonTokens.typography.titleLg.fontSize,
      fontFamily: commonTokens.typography.titleLg.fontFamily,
      color: theme.colors.text,
      fontWeight: '700',
      marginBottom: commonTokens.spacing.md,
    },
    cardsGrid: {
      gap: commonTokens.spacing.md,
    },
    breakdownCard: {
      marginBottom: 0,
    },
    cardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: commonTokens.spacing.md,
    },
    cardIcon: {
      width: 50,
      height: 50,
      borderRadius: commonTokens.borderRadius.lg,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cardTextContainer: {
      flex: 1,
    },
    cardNumber: {
      fontSize: commonTokens.typography.displaySm.fontSize,
      fontFamily: commonTokens.typography.displaySm.fontFamily,
      color: theme.colors.text,
      fontWeight: '700',
    },
    cardLabel: {
      fontSize: commonTokens.typography.bodyMd.fontSize,
      fontFamily: commonTokens.typography.bodyMd.fontFamily,
      color: theme.colors.textSecondary,
      marginTop: commonTokens.spacing.xs,
    },
    actionsContainer: {
      gap: commonTokens.spacing.md,
      marginTop: commonTokens.spacing.lg,
    },
    primaryButton: {
      width: '100%',
    },
    secondaryButton: {
      width: '100%',
    },
    navigationBarPlaceholder: {
      height: commonTokens.spacing.xxl,
      marginTop: commonTokens.spacing.lg,
    },
  });

export default QuizResultsScreen;
