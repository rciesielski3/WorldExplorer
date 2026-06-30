import React from 'react';
import {
  View,
  ScrollView,
  Text,
  ActivityIndicator,
  Image,
  ImageBackground,
  Pressable,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../../context/ThemeContext';
import { commonTokens } from '../../theme/tokens';
import { TopBar } from '../../components/ui/TopBar';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { QuestionCard } from '../../components/ui/QuestionCard';
import { Button } from '../../components/ui/Button';
import { FloatingNavBar } from '../../components/Navigation/FloatingNavBar';
import AdBanner from '../../components/AdBanner';
import { fetchCountries, getLocalizedCountryName } from '../../utils/countries';
import { FLAG_ASSETS } from '../../utils/flagAssets';

const {
  answerQuestion,
  countCorrectAnswers,
  getScoreMessageKey,
} = require('./quizSession');

interface Question {
  type: 'flag' | 'capital' | 'country';
  question: string;
  flag?: string;
  options: string[];
  answer: string;
  selectedAnswer?: string;
  isCorrect?: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
}

const QuizScreen = ({ route, navigation }: any) => {
  const [currentQuestion, setCurrentQuestion] = React.useState(0);
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedAnswer, setSelectedAnswer] = React.useState<string | null>(null);
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const practiceQuestions = route.params?.practiceQuestions;

  React.useEffect(() => {
    if (practiceQuestions?.length) {
      setQuestions(
        practiceQuestions.map(
          ({
            selectedAnswer: _selectedAnswer,
            isCorrect: _isCorrect,
            ...question
          }: any) => ({
            ...question,
            difficulty: getDifficultyForQuestion(question),
          }),
        ),
      );
      setLoading(false);
      return undefined;
    }

    let isMounted = true;
    fetchCountries()
      .then((countries) => {
        if (isMounted) {
          const generatedQuestions = generateQuestions(countries);
          setQuestions(generatedQuestions);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error('Error fetching countries:', error);
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [practiceQuestions]);

  const getDifficultyForQuestion = (question: Question): 'easy' | 'medium' | 'hard' => {
    // Derive difficulty from question type
    // flag questions are easier, capital questions are harder
    switch (question.type) {
      case 'flag':
        return 'easy';
      case 'capital':
        return 'hard';
      case 'country':
      default:
        return 'medium';
    }
  };

  const generateQuestions = (countries: any[]): Question[] => {
    const generatedQuestions: Question[] = [];

    for (let i = 0; i < 10; i++) {
      const randomCountry =
        countries[Math.floor(Math.random() * countries.length)];
      const questionTypes: Array<'flag' | 'capital' | 'country'> = ['flag', 'capital', 'country'];
      const type =
        questionTypes[Math.floor(Math.random() * questionTypes.length)];

      let question: Question = {
        type: 'flag',
        question: '',
        options: [],
        answer: '',
      };

      if (type === 'flag') {
        question = {
          type: 'flag',
          question: t('quizFlagBelong'),
          flag: randomCountry.flagPath || '',
          options: generateOptions(
            countries,
            getLocalizedCountryName(randomCountry, i18n.language),
            'country',
          ),
          answer: getLocalizedCountryName(randomCountry, i18n.language),
          difficulty: 'easy',
        };
      } else if (type === 'capital') {
        question = {
          type: 'capital',
          question: t('quizCapital', {
            country: getLocalizedCountryName(randomCountry, i18n.language),
          }),
          options: generateOptions(
            countries,
            randomCountry.capital || t('noCapital'),
            'capital',
          ),
          answer: randomCountry.capital || t('noCapital'),
          difficulty: 'hard',
        };
      } else {
        question = {
          type: 'country',
          question: t('quizCountryCapital', {
            country: getLocalizedCountryName(randomCountry, i18n.language),
          }),
          options: generateOptions(
            countries,
            getLocalizedCountryName(randomCountry, i18n.language),
            'country',
          ),
          answer: getLocalizedCountryName(randomCountry, i18n.language),
          difficulty: 'medium',
        };
      }
      generatedQuestions.push(question);
    }
    return generatedQuestions;
  };

  const generateOptions = (countries: any[], correctAnswer: string, type: string): string[] => {
    const options = new Set([correctAnswer]);

    while (options.size < 4) {
      const randomCountry =
        countries[Math.floor(Math.random() * countries.length)];
      const option =
        type === 'capital'
          ? randomCountry.capital || t('noCapital')
          : getLocalizedCountryName(randomCountry, i18n.language);

      options.add(option);
    }

    return Array.from(options).sort(() => Math.random() - 0.5);
  };

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) {
      return;
    }

    // Haptic feedback for answer selection
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setSelectedAnswer(answer);
    setQuestions((prevQuestions) =>
      prevQuestions.map((question, index) =>
        index === currentQuestion
          ? { ...answerQuestion(question, answer), difficulty: question.difficulty }
          : question,
      ),
    );
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setCurrentQuestion((prev) => prev + 1);
  };

  const handleNavigate = (routeName: string) => {
    navigation.navigate(routeName);
  };

  const answeredQuestion = questions[currentQuestion];
  const hasAnsweredCurrentQuestion = Boolean(selectedAnswer);
  const score = countCorrectAnswers(questions);
  const progress = currentQuestion / Math.max(questions.length, 1);

  if (loading) {
    return (
      <ImageBackground
        source={require('../../assets/worldMapBackground.png')}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </ImageBackground>
    );
  }

  const navItems = [
    { name: 'Home', icon: 'home-outline', color: theme.colors.primary },
    { name: 'Explore', icon: 'map-outline', color: theme.colors.primary },
    { name: 'Quiz', icon: 'lightbulb-outline', color: theme.colors.primary },
    { name: 'Settings', icon: 'cog-outline', color: theme.colors.primary },
  ];

  return (
    <ImageBackground
      source={require('../../assets/worldMapBackground.png')}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, backgroundColor: `${theme.colors.background}00` }}>
        {/* Top Bar */}
        <TopBar appName={t('quiz')} />

        {/* Progress Bar */}
        <View style={{ paddingHorizontal: commonTokens.spacing.lg }}>
          <ProgressBar progress={progress} duration={300} />
        </View>

        {/* Content */}
        {currentQuestion < questions.length ? (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              padding: commonTokens.spacing.lg,
              paddingBottom: 100, // Space for floating nav
            }}
            scrollEventThrottle={16}
          >
            {/* Question Card */}
            <QuestionCard
              question={answeredQuestion.question}
              questionType={answeredQuestion.type}
              difficulty={answeredQuestion.difficulty || 'medium'}
              flagSource={
                answeredQuestion.type === 'flag' && answeredQuestion.flag
                  ? FLAG_ASSETS[answeredQuestion.flag]
                  : undefined
              }
            />

            {/* Answer Buttons */}
            <View style={{ gap: commonTokens.spacing.md, marginBottom: commonTokens.spacing.lg }}>
              {answeredQuestion.options.map((option: string, index: number) => {
                const letters = ['A', 'B', 'C', 'D'];
                const isSelected = option === selectedAnswer;
                const isCorrect = option === answeredQuestion.answer;
                const showFeedback = hasAnsweredCurrentQuestion;

                let backgroundColor = theme.colors.surface;
                let borderColor = theme.colors.primary;
                let textColor = theme.colors.text;
                let badgeBackgroundColor = theme.colors.surfaceSubtle;
                let badgeTextColor = theme.colors.text;

                if (showFeedback && isSelected && isCorrect) {
                  backgroundColor = theme.colors.success;
                  borderColor = theme.colors.success;
                  textColor = '#FFFFFF';
                  badgeBackgroundColor = theme.colors.success;
                  badgeTextColor = '#FFFFFF';
                } else if (showFeedback && isSelected && !isCorrect) {
                  backgroundColor = theme.colors.error;
                  borderColor = theme.colors.error;
                  textColor = '#FFFFFF';
                  badgeBackgroundColor = theme.colors.error;
                  badgeTextColor = '#FFFFFF';
                } else if (showFeedback && !isSelected && isCorrect) {
                  backgroundColor = theme.colors.successBg;
                  borderColor = theme.colors.success;
                  textColor = theme.colors.success;
                  badgeBackgroundColor = theme.colors.success;
                  badgeTextColor = '#FFFFFF';
                } else if (hasAnsweredCurrentQuestion && !isSelected) {
                  backgroundColor = theme.colors.surfaceSubtle;
                  borderColor = theme.colors.textTertiary;
                  textColor = theme.colors.textTertiary;
                }

                return (
                  <View
                    key={index}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: commonTokens.spacing.md,
                    }}
                  >
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        backgroundColor: badgeBackgroundColor,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: commonTokens.typography.titleLg.fontSize,
                          fontFamily: commonTokens.typography.titleLg.fontFamily,
                          fontWeight: '700',
                          color: badgeTextColor,
                        }}
                      >
                        {letters[index]}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => handleAnswer(option)}
                      disabled={hasAnsweredCurrentQuestion}
                      style={({ pressed }) => ({
                        flex: 1,
                        height: 48,
                        borderRadius: commonTokens.borderRadius.md,
                        backgroundColor,
                        borderWidth: 2,
                        borderColor,
                        justifyContent: 'center',
                        paddingHorizontal: commonTokens.spacing.md,
                        opacity: pressed ? 0.8 : 1,
                      })}
                    >
                      <Text
                        style={{
                          fontSize: commonTokens.typography.bodyMd.fontSize,
                          fontFamily: commonTokens.typography.bodyMd.fontFamily,
                          color: textColor,
                        }}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>

            {/* Feedback and Next Button */}
            {hasAnsweredCurrentQuestion && (
              <View
                style={{
                  backgroundColor: answeredQuestion.isCorrect
                    ? theme.colors.successBg
                    : theme.colors.errorBg,
                  borderRadius: commonTokens.borderRadius.lg,
                  padding: commonTokens.spacing.lg,
                  marginBottom: commonTokens.spacing.lg,
                  borderLeftWidth: 4,
                  borderLeftColor: answeredQuestion.isCorrect
                    ? theme.colors.success
                    : theme.colors.error,
                }}
              >
                <Text
                  style={{
                    fontSize: commonTokens.typography.titleMd.fontSize,
                    fontFamily: commonTokens.typography.titleMd.fontFamily,
                    fontWeight: '600',
                    color: theme.colors.text,
                    marginBottom: commonTokens.spacing.md,
                  }}
                >
                  {answeredQuestion.isCorrect
                    ? t('quizAnswerCorrect')
                    : t('quizAnswerIncorrect')}
                </Text>

                <Text
                  style={{
                    fontSize: commonTokens.typography.bodyMd.fontSize,
                    fontFamily: commonTokens.typography.bodyMd.fontFamily,
                    color: theme.colors.textSecondary,
                    marginBottom: commonTokens.spacing.sm,
                  }}
                >
                  {t('quizYourAnswer')}: {selectedAnswer}
                </Text>

                {!answeredQuestion.isCorrect && (
                  <Text
                    style={{
                      fontSize: commonTokens.typography.bodyMd.fontSize,
                      fontFamily: commonTokens.typography.bodyMd.fontFamily,
                      color: theme.colors.textSecondary,
                      marginBottom: commonTokens.spacing.md,
                    }}
                  >
                    {t('quizCorrectAnswer')}: {answeredQuestion.answer}
                  </Text>
                )}

                <Button
                  label={
                    currentQuestion + 1 === questions.length
                      ? t('quizFinish')
                      : t('quizNextQuestion')
                  }
                  onPress={handleNextQuestion}
                />
              </View>
            )}

            {/* Question Progress */}
            <Text
              style={{
                fontSize: commonTokens.typography.bodyMd.fontSize,
                fontFamily: commonTokens.typography.bodyMd.fontFamily,
                color: theme.colors.textSecondary,
                textAlign: 'center',
                marginTop: commonTokens.spacing.md,
              }}
            >
              {t('questionProgress', {
                current: currentQuestion + 1,
                total: questions.length,
              })}
            </Text>
          </ScrollView>
        ) : (
          /* Quiz Complete Screen */
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              padding: commonTokens.spacing.lg,
              paddingBottom: 100,
              justifyContent: 'center',
            }}
          >
            <View style={{ alignItems: 'center', gap: commonTokens.spacing.lg }}>
              <Text
                style={{
                  fontSize: commonTokens.typography.displayMd.fontSize,
                  fontFamily: commonTokens.typography.displayMd.fontFamily,
                  fontWeight: '700',
                  color: theme.colors.primary,
                  marginBottom: commonTokens.spacing.lg,
                }}
              >
                {t('quizScore')}
              </Text>

              <View
                style={{
                  alignItems: 'center',
                  backgroundColor: theme.colors.surface,
                  borderRadius: commonTokens.borderRadius.lg,
                  padding: commonTokens.spacing.xl,
                  width: '100%',
                  ...commonTokens.shadows.md,
                }}
              >
                <Text
                  style={{
                    fontSize: 64,
                    fontFamily: commonTokens.typography.display.fontFamily,
                    fontWeight: '700',
                    color: theme.colors.primary,
                  }}
                >
                  {score}/{questions.length}
                </Text>

                <Text
                  style={{
                    fontSize: commonTokens.typography.bodyLg.fontSize,
                    fontFamily: commonTokens.typography.bodyLg.fontFamily,
                    color: theme.colors.textSecondary,
                    marginTop: commonTokens.spacing.md,
                    textAlign: 'center',
                  }}
                >
                  {t(getScoreMessageKey(score, questions.length))}
                </Text>
              </View>

              <View style={{ width: '100%', gap: commonTokens.spacing.md }}>
                <Button
                  label={t('quizViewAnswers')}
                  onPress={() =>
                    navigation.navigate('QuizResults', { score, questions })
                  }
                />
                <Button
                  label={t('quizTryAgain')}
                  onPress={() => {
                    setCurrentQuestion(0);
                    setSelectedAnswer(null);
                    setLoading(true);
                    fetchCountries()
                      .then((countries) => {
                        const generatedQuestions = generateQuestions(countries);
                        setQuestions(generatedQuestions);
                        setLoading(false);
                      })
                      .catch((error) => {
                        console.error('Error fetching countries:', error);
                        setLoading(false);
                      });
                  }}
                  variant="outlined"
                />
              </View>
            </View>
          </ScrollView>
        )}

        {/* Floating Navigation Bar */}
        <FloatingNavBar
          currentRoute="Quiz"
          onNavigate={handleNavigate}
          items={navItems}
        />

        {/* Ad Banner */}
        <AdBanner />
      </View>
    </ImageBackground>
  );
};

export default QuizScreen;
