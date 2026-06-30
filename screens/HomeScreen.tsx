import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import LottieView from 'lottie-react-native';
import * as Haptics from 'expo-haptics';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '../context/ThemeContext';
import { commonTokens } from '../theme/tokens';
import { TopBar } from '../src/components/Navigation/TopBar';
import { Card } from '../src/components/ui/Card';
import { Button } from '../src/components/ui/Button';
import { FloatingNavBar } from '../src/components/Navigation/FloatingNavBar';
import { fetchCountries, getLocalizedCountryName } from '../utils/countries';
import { getDailyCountry } from '../utils/dailyCountry';
import { FLAG_ASSETS } from '../utils/flagAssets';

const HomeScreen = ({ navigation }: any) => {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [dailyCountry, setDailyCountry] = React.useState<any>(null);
  const [isDailyCountryLoading, setIsDailyCountryLoading] = React.useState(true);

  // Sample stats (in a real app, these would come from context/storage)
  const [stats] = React.useState({
    countriesExplored: 47,
    quizStreak: 12,
    regionsUnlocked: 8,
  });

  React.useEffect(() => {
    fetchCountries()
      .then((countriesData) => {
        setDailyCountry(getDailyCountry(countriesData));
      })
      .catch((error) => console.error('Error fetching daily country:', error))
      .finally(() => setIsDailyCountryLoading(false));
  }, []);

  const handleExplorePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('Explore');
  };

  const handleQuizPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('Quiz');
  };

  const handleSettingsPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Settings');
  };

  const handleDailyCountryPress = () => {
    if (dailyCountry) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      navigation.navigate('CountryDetails', { country: dailyCountry });
    }
  };

  const navItems = [
    {
      name: 'Explore',
      icon: 'earth',
      color: theme.colors.primary,
    },
    {
      name: 'Map',
      icon: 'map-outline',
      color: theme.colors.secondary,
    },
    {
      name: 'Quiz',
      icon: 'puzzle-outline',
      color: theme.colors.amber,
    },
  ];

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
      }}
    >
      <TopBar
        title="WorldExplorer"
        onSettingsPress={handleSettingsPress}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <LinearGradient
          colors={theme.gradients.home}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            marginHorizontal: commonTokens.spacing.md,
            marginTop: commonTokens.spacing.lg,
            marginBottom: commonTokens.spacing.lg,
            borderRadius: commonTokens.borderRadius.lg,
            paddingVertical: commonTokens.spacing.xxl,
            paddingHorizontal: commonTokens.spacing.lg,
            alignItems: 'center',
            ...commonTokens.shadows.md,
          }}
        >
          <LottieView
            source={require('../assets/animations/rotating-earth.json')}
            autoPlay
            loop
            style={{
              width: 120,
              height: 120,
              marginBottom: commonTokens.spacing.md,
            }}
          />

          <Text
            style={{
              fontSize: commonTokens.typography.displayMd.fontSize,
              fontFamily: commonTokens.typography.displayMd.fontFamily,
              fontWeight: '700',
              color: '#FFFFFF',
              textAlign: 'center',
              marginBottom: commonTokens.spacing.sm,
            }}
          >
            {t('welcome')} Explorer
          </Text>

          <Text
            style={{
              fontSize: commonTokens.typography.bodyMd.fontSize,
              fontFamily: commonTokens.typography.bodyMd.fontFamily,
              color: 'rgba(255, 255, 255, 0.85)',
              textAlign: 'center',
              marginBottom: commonTokens.spacing.lg,
            }}
          >
            {t('homeHeroSubtitle') || 'Discover the world, one country at a time'}
          </Text>

          {/* CTA Buttons */}
          <View
            style={{
              width: '100%',
              gap: commonTokens.spacing.md,
            }}
          >
            <Button
              label={t('exploreNow') || 'Explore Now'}
              onPress={handleExplorePress}
              variant="filled"
              accessibilityLabel={t('exploreNow')}
            />
            <Button
              label={t('takeQuiz') || 'Take Quiz'}
              onPress={handleQuizPress}
              variant="outlined"
              accessibilityLabel={t('takeQuiz')}
            />
          </View>
        </LinearGradient>

        {/* Daily Challenge Card */}
        <View
          style={{
            marginHorizontal: commonTokens.spacing.md,
            marginBottom: commonTokens.spacing.lg,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: commonTokens.spacing.md,
              paddingHorizontal: commonTokens.spacing.sm,
            }}
          >
            <MaterialCommunityIcons
              name="star"
              size={20}
              color={theme.colors.amber}
              style={{ marginRight: commonTokens.spacing.sm }}
            />
            <Text
              style={{
                fontSize: commonTokens.typography.titleMd.fontSize,
                fontFamily: commonTokens.typography.titleMd.fontFamily,
                fontWeight: '600',
                color: theme.colors.text,
              }}
            >
              {t('dailyCountry') || 'Daily Challenge'}
            </Text>
          </View>

          <Card
            onPress={handleDailyCountryPress}
            elevation="md"
            style={{
              padding: commonTokens.spacing.lg,
            }}
          >
            {isDailyCountryLoading ? (
              <ActivityIndicator
                color={theme.colors.primary}
                size="large"
                style={{
                  height: 100,
                  justifyContent: 'center',
                }}
              />
            ) : dailyCountry ? (
              <View style={{ gap: commonTokens.spacing.md }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: commonTokens.spacing.md,
                  }}
                >
                  <Image
                    source={FLAG_ASSETS[dailyCountry.flagPath]}
                    style={{
                      width: 48,
                      height: 32,
                      borderRadius: commonTokens.borderRadius.sm,
                    }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: commonTokens.typography.titleLg.fontSize,
                        fontFamily: commonTokens.typography.titleLg.fontFamily,
                        fontWeight: '600',
                        color: theme.colors.text,
                      }}
                    >
                      {getLocalizedCountryName(dailyCountry, i18n.language)}
                    </Text>
                    <Text
                      style={{
                        fontSize: commonTokens.typography.bodySm.fontSize,
                        fontFamily: commonTokens.typography.bodySm.fontFamily,
                        color: theme.colors.textSecondary,
                      }}
                    >
                      {t('capitalOf')} {dailyCountry.capital}
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text
                    style={{
                      fontSize: commonTokens.typography.bodySm.fontSize,
                      fontFamily: commonTokens.typography.bodySm.fontFamily,
                      color: theme.colors.primary,
                      fontWeight: '500',
                    }}
                  >
                    {t('viewCountry') || 'View Details'}
                  </Text>
                  <MaterialCommunityIcons
                    name="arrow-right"
                    size={18}
                    color={theme.colors.primary}
                  />
                </View>
              </View>
            ) : (
              <Text
                style={{
                  fontSize: commonTokens.typography.bodySm.fontSize,
                  fontFamily: commonTokens.typography.bodySm.fontFamily,
                  color: theme.colors.textTertiary,
                  textAlign: 'center',
                }}
              >
                {t('dailyCountryUnavailable') || 'No country available'}
              </Text>
            )}
          </Card>
        </View>

        {/* Stats Row */}
        <View
          style={{
            marginHorizontal: commonTokens.spacing.md,
            marginBottom: commonTokens.spacing.lg,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              gap: commonTokens.spacing.md,
            }}
          >
            {/* Countries Explored */}
            <Card
              elevation="sm"
              style={{
                flex: 1,
                padding: commonTokens.spacing.md,
                alignItems: 'center',
              }}
            >
              <MaterialCommunityIcons
                name="earth"
                size={28}
                color={theme.colors.primary}
                style={{ marginBottom: commonTokens.spacing.sm }}
              />
              <Text
                style={{
                  fontSize: 22,
                  fontFamily: commonTokens.typography.titleLg.fontFamily,
                  fontWeight: '700',
                  color: theme.colors.text,
                }}
              >
                {stats.countriesExplored}
              </Text>
              <Text
                style={{
                  fontSize: commonTokens.typography.bodySm.fontSize,
                  fontFamily: commonTokens.typography.bodySm.fontFamily,
                  color: theme.colors.textSecondary,
                  textAlign: 'center',
                  marginTop: commonTokens.spacing.xs,
                }}
              >
                {t('countriesExplored') || 'Explored'}
              </Text>
            </Card>

            {/* Quiz Streak */}
            <Card
              elevation="sm"
              style={{
                flex: 1,
                padding: commonTokens.spacing.md,
                alignItems: 'center',
              }}
            >
              <MaterialCommunityIcons
                name="fire"
                size={28}
                color={theme.colors.amber}
                style={{ marginBottom: commonTokens.spacing.sm }}
              />
              <Text
                style={{
                  fontSize: 22,
                  fontFamily: commonTokens.typography.titleLg.fontFamily,
                  fontWeight: '700',
                  color: theme.colors.text,
                }}
              >
                {stats.quizStreak}
              </Text>
              <Text
                style={{
                  fontSize: commonTokens.typography.bodySm.fontSize,
                  fontFamily: commonTokens.typography.bodySm.fontFamily,
                  color: theme.colors.textSecondary,
                  textAlign: 'center',
                  marginTop: commonTokens.spacing.xs,
                }}
              >
                {t('quizStreak') || 'Streak'}
              </Text>
            </Card>

            {/* Regions Unlocked */}
            <Card
              elevation="sm"
              style={{
                flex: 1,
                padding: commonTokens.spacing.md,
                alignItems: 'center',
              }}
            >
              <MaterialCommunityIcons
                name="globe-model"
                size={28}
                color={theme.colors.secondary}
                style={{ marginBottom: commonTokens.spacing.sm }}
              />
              <Text
                style={{
                  fontSize: 22,
                  fontFamily: commonTokens.typography.titleLg.fontFamily,
                  fontWeight: '700',
                  color: theme.colors.text,
                }}
              >
                {stats.regionsUnlocked}
              </Text>
              <Text
                style={{
                  fontSize: commonTokens.typography.bodySm.fontSize,
                  fontFamily: commonTokens.typography.bodySm.fontFamily,
                  color: theme.colors.textSecondary,
                  textAlign: 'center',
                  marginTop: commonTokens.spacing.xs,
                }}
              >
                {t('regionsUnlocked') || 'Regions'}
              </Text>
            </Card>
          </View>
        </View>
      </ScrollView>

      {/* Floating Navigation Bar */}
      <FloatingNavBar
        currentRoute="Home"
        onNavigate={(routeName: string) => navigation.navigate(routeName)}
        items={navItems}
      />
    </View>
  );
};

export default HomeScreen;
