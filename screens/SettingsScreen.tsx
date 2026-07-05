import React from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import packageJson from '../package.json';

import { useTheme } from '../context/ThemeContext';
import { usePremium } from '../context/PremiumContext';
import { Card } from '../src/components/ui/Card';
import { ToggleSwitch } from '../src/components/ui/ToggleSwitch';
import { TopBar } from '../src/components/Navigation/TopBar';
import { FloatingNavBar } from '../src/components/Navigation/FloatingNavBar';
import { commonTokens } from '../theme/tokens';
import { Picker } from '@react-native-picker/picker';
import { logger } from '../utils/logger';
import { triggerLightHaptic, triggerMediumHaptic } from '../utils/haptics';

const CONTACT_URL = 'https://rciesielski.dev/contact';

interface SettingsScreenProps {
  navigation: any;
}

export function SettingsScreen({ navigation }: SettingsScreenProps) {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [language, setLanguage] = React.useState(i18n.language);
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [hapticsEnabled, setHapticsEnabled] = React.useState(true);

  const {
    error: premiumError,
    isConfigured: isPremiumConfigured,
    isEnabled: isPremiumEnabled,
    isLoading: isPremiumLoading,
    isPremium,
    isPurchasing,
    isRestoring,
    premiumPackage,
    purchasePremium,
    restorePurchases,
  } = usePremium();

  const isPremiumBusy = isPremiumLoading || isPurchasing || isRestoring;
  const canBuyPremium =
    isPremiumConfigured && Boolean(premiumPackage) && !isPremiumBusy;
  const canRestorePremium = isPremiumConfigured && !isPremiumBusy;

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    i18n.changeLanguage(value);
    triggerLightHaptic();
  };

  const handleThemeToggle = async () => {
    await triggerLightHaptic();
    theme.toggleTheme();
  };

  const handleSoundToggle = () => {
    setSoundEnabled(!soundEnabled);
    triggerLightHaptic();
  };

  const handleHapticsToggle = () => {
    setHapticsEnabled(!hapticsEnabled);
    triggerLightHaptic();
  };

  const handleResetData = () => {
    triggerMediumHaptic();
    Alert.alert(
      t('resetData'),
      'This will clear all app data including preferences. This cannot be undone.',
      [
        {
          text: 'Cancel',
          onPress: () => {
            // User cancelled reset
          },
          style: 'cancel',
        },
        {
          text: 'Reset',
          onPress: async () => {
            try {
              // Clear all stored data
              await AsyncStorage.clear();
              Alert.alert('Success', 'All app data has been cleared. Please restart the app.');
              // In a production app, you might reload the app here using expo-updates
              // or similar reload mechanism
            } catch (error) {
              logger.error('Failed to reset app data', {
                context: 'SettingsScreen',
                timestamp: new Date().toISOString(),
                metadata: {
                  action: 'resetData',
                  error: error instanceof Error ? error.message : String(error),
                },
              });
              Alert.alert('Error', 'Failed to reset app data. Please try again.');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleContactPress = () => {
    triggerLightHaptic();
    Linking.openURL(CONTACT_URL);
  };

  const navItems = [
    { name: 'Home', icon: 'home-outline', color: theme.colors.primary },
    { name: 'Explore', icon: 'earth', color: theme.colors.secondary },
    { name: 'Map', icon: 'map-outline', color: theme.colors.ocean },
    { name: 'Quiz', icon: 'puzzle-outline', color: theme.colors.amber },
    { name: 'Favorites', icon: 'heart-outline', color: theme.colors.error },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <TopBar title={t('settings')} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: commonTokens.spacing.lg,
          paddingTop: commonTokens.spacing.lg,
          paddingBottom: commonTokens.spacing.xxl + insets.bottom,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance Card */}
        <Card style={{ marginBottom: commonTokens.spacing.lg }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: commonTokens.spacing.md,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons
                name={theme.isDarkMode ? 'moon' : 'sun'}
                size={24}
                color={theme.colors.primary}
                style={{ marginRight: commonTokens.spacing.md }}
              />
              <Text
                style={{
                  fontSize: commonTokens.typography.titleLg.fontSize,
                  fontFamily: commonTokens.typography.titleLg.fontFamily,
                  fontWeight: '600',
                  color: theme.colors.text,
                }}
              >
                {t('appearance')}
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: commonTokens.spacing.md,
              borderTopWidth: 1,
              borderTopColor: theme.colors.border,
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: commonTokens.typography.bodyLg.fontSize,
                  fontFamily: commonTokens.typography.bodyLg.fontFamily,
                  color: theme.colors.text,
                  marginBottom: commonTokens.spacing.xs,
                }}
              >
                {t('darkMode')}
              </Text>
              <Text
                style={{
                  fontSize: commonTokens.typography.bodySm.fontSize,
                  fontFamily: commonTokens.typography.bodySm.fontFamily,
                  color: theme.colors.textSecondary,
                }}
              >
                {theme.isDarkMode ? t('modeOn') : t('modeOff')}
              </Text>
            </View>
            <ToggleSwitch
              value={theme.isDarkMode}
              onToggle={handleThemeToggle}
              label={t('darkMode')}
              accessibilityLabel={t('darkMode')}
            />
          </View>
        </Card>

        {/* Language Card */}
        <Card style={{ marginBottom: commonTokens.spacing.lg }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: commonTokens.spacing.md,
            }}
          >
            <MaterialCommunityIcons
              name="translate"
              size={24}
              color={theme.colors.primary}
              style={{ marginRight: commonTokens.spacing.md }}
            />
            <Text
              style={{
                fontSize: commonTokens.typography.titleLg.fontSize,
                fontFamily: commonTokens.typography.titleLg.fontFamily,
                fontWeight: '600',
                color: theme.colors.text,
              }}
            >
              {t('language')}
            </Text>
          </View>

          <View
            style={{
              borderRadius: commonTokens.borderRadius.md,
              backgroundColor: theme.colors.surfaceSubtle,
              marginTop: commonTokens.spacing.md,
              overflow: 'hidden',
            }}
          >
            <Picker
              selectedValue={language}
              onValueChange={handleLanguageChange}
              style={{
                color: theme.colors.text,
              }}
            >
              <Picker.Item label="English" value="en" />
              <Picker.Item label="Español" value="es" />
              <Picker.Item label="Français" value="fr" />
              <Picker.Item label="Deutsch" value="de" />
              <Picker.Item label="Polski" value="pl" />
            </Picker>
          </View>
        </Card>

        {/* Sound & Haptics Card */}
        <Card style={{ marginBottom: commonTokens.spacing.lg }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: commonTokens.spacing.md,
            }}
          >
            <MaterialCommunityIcons
              name="speaker-multiple"
              size={24}
              color={theme.colors.primary}
              style={{ marginRight: commonTokens.spacing.md }}
            />
            <Text
              style={{
                fontSize: commonTokens.typography.titleLg.fontSize,
                fontFamily: commonTokens.typography.titleLg.fontFamily,
                fontWeight: '600',
                color: theme.colors.text,
              }}
            >
              {t('soundHaptics')}
            </Text>
          </View>

          {/* Sound Toggle */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: commonTokens.spacing.md,
              paddingBottom: commonTokens.spacing.md,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border,
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: commonTokens.typography.bodyLg.fontSize,
                  fontFamily: commonTokens.typography.bodyLg.fontFamily,
                  color: theme.colors.text,
                  marginBottom: commonTokens.spacing.xs,
                }}
              >
                {t('sound')}
              </Text>
              <Text
                style={{
                  fontSize: commonTokens.typography.bodySm.fontSize,
                  fontFamily: commonTokens.typography.bodySm.fontFamily,
                  color: theme.colors.textSecondary,
                }}
              >
                {soundEnabled ? t('enabled') : t('disabled')}
              </Text>
            </View>
            <ToggleSwitch
              value={soundEnabled}
              onToggle={handleSoundToggle}
              label={t('sound')}
              accessibilityLabel={t('sound')}
            />
          </View>

          {/* Haptics Toggle */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: commonTokens.spacing.md,
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: commonTokens.typography.bodyLg.fontSize,
                  fontFamily: commonTokens.typography.bodyLg.fontFamily,
                  color: theme.colors.text,
                  marginBottom: commonTokens.spacing.xs,
                }}
              >
                {t('hapticFeedback')}
              </Text>
              <Text
                style={{
                  fontSize: commonTokens.typography.bodySm.fontSize,
                  fontFamily: commonTokens.typography.bodySm.fontFamily,
                  color: theme.colors.textSecondary,
                }}
              >
                {hapticsEnabled ? t('enabled') : t('disabled')}
              </Text>
            </View>
            <ToggleSwitch
              value={hapticsEnabled}
              onToggle={handleHapticsToggle}
              label={t('hapticFeedback')}
              accessibilityLabel={t('hapticFeedback')}
            />
          </View>
        </Card>

        {/* Data & Privacy Card */}
        <Card style={{ marginBottom: commonTokens.spacing.lg }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: commonTokens.spacing.md,
            }}
          >
            <MaterialCommunityIcons
              name="shield-account"
              size={24}
              color={theme.colors.primary}
              style={{ marginRight: commonTokens.spacing.md }}
            />
            <Text
              style={{
                fontSize: commonTokens.typography.titleLg.fontSize,
                fontFamily: commonTokens.typography.titleLg.fontFamily,
                fontWeight: '600',
                color: theme.colors.text,
              }}
            >
              {t('dataPrivacy')}
            </Text>
          </View>

          <View
            style={{
              gap: commonTokens.spacing.sm,
              marginTop: commonTokens.spacing.md,
            }}
          >
            <TouchableOpacity
              onPress={handleResetData}
              style={{
                paddingVertical: commonTokens.spacing.md,
                paddingHorizontal: commonTokens.spacing.md,
                backgroundColor: theme.colors.errorBg,
                borderRadius: commonTokens.borderRadius.md,
                borderLeftWidth: 3,
                borderLeftColor: theme.colors.error,
              }}
            >
              <Text
                style={{
                  fontSize: commonTokens.typography.bodyLg.fontSize,
                  fontFamily: commonTokens.typography.bodyLg.fontFamily,
                  color: theme.colors.error,
                  fontWeight: '600',
                }}
              >
                {t('resetData')}
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Premium Card (if enabled) */}
        {isPremiumEnabled && (
          <Card style={{ marginBottom: commonTokens.spacing.lg }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: commonTokens.spacing.md,
              }}
            >
              <MaterialCommunityIcons
                name="star"
                size={24}
                color={theme.colors.amber}
                style={{ marginRight: commonTokens.spacing.md }}
              />
              <Text
                style={{
                  fontSize: commonTokens.typography.titleLg.fontSize,
                  fontFamily: commonTokens.typography.titleLg.fontFamily,
                  fontWeight: '600',
                  color: theme.colors.text,
                }}
              >
                {t('premium')}
              </Text>
            </View>

            <Text
              style={{
                fontSize: commonTokens.typography.bodyMd.fontSize,
                fontFamily: commonTokens.typography.bodyMd.fontFamily,
                color: theme.colors.textSecondary,
                marginBottom: commonTokens.spacing.md,
              }}
            >
              {isPremium ? t('premiumActive') : t('premiumDescription')}
            </Text>

            {premiumError ? (
              <Text
                style={{
                  fontSize: commonTokens.typography.bodySm.fontSize,
                  fontFamily: commonTokens.typography.bodySm.fontFamily,
                  color: theme.colors.error,
                  marginBottom: commonTokens.spacing.md,
                }}
              >
                {premiumError}
              </Text>
            ) : null}

            {isPremiumBusy ? (
              <ActivityIndicator
                color={theme.colors.primary}
                style={{ marginBottom: commonTokens.spacing.md }}
              />
            ) : null}

            {!isPremium ? (
              <View
                style={{
                  gap: commonTokens.spacing.sm,
                  marginTop: commonTokens.spacing.md,
                }}
              >
                <TouchableOpacity
                  disabled={!canBuyPremium}
                  onPress={purchasePremium}
                  style={{
                    paddingVertical: commonTokens.spacing.md,
                    paddingHorizontal: commonTokens.spacing.lg,
                    backgroundColor: canBuyPremium
                      ? theme.colors.primary
                      : theme.colors.textTertiary,
                    borderRadius: commonTokens.borderRadius.md,
                    opacity: canBuyPremium ? 1 : 0.5,
                  }}
                >
                  <Text
                    style={{
                      fontSize: commonTokens.typography.bodyLg.fontSize,
                      fontFamily: commonTokens.typography.bodyLg.fontFamily,
                      color: '#FFFFFF',
                      fontWeight: '600',
                      textAlign: 'center',
                    }}
                  >
                    {isPurchasing ? t('loading') : t('buyPremium')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={!canRestorePremium}
                  onPress={restorePurchases}
                  style={{
                    paddingVertical: commonTokens.spacing.md,
                    paddingHorizontal: commonTokens.spacing.lg,
                    backgroundColor: theme.colors.surfaceSubtle,
                    borderRadius: commonTokens.borderRadius.md,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    opacity: canRestorePremium ? 1 : 0.5,
                  }}
                >
                  <Text
                    style={{
                      fontSize: commonTokens.typography.bodyLg.fontSize,
                      fontFamily: commonTokens.typography.bodyLg.fontFamily,
                      color: theme.colors.text,
                      fontWeight: '600',
                      textAlign: 'center',
                    }}
                  >
                    {isRestoring ? t('loading') : t('restorePurchases')}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </Card>
        )}

        {/* About Card */}
        <Card style={{ marginBottom: commonTokens.spacing.lg }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: commonTokens.spacing.md,
            }}
          >
            <MaterialCommunityIcons
              name="information-outline"
              size={24}
              color={theme.colors.primary}
              style={{ marginRight: commonTokens.spacing.md }}
            />
            <Text
              style={{
                fontSize: commonTokens.typography.titleLg.fontSize,
                fontFamily: commonTokens.typography.titleLg.fontFamily,
                fontWeight: '600',
                color: theme.colors.text,
              }}
            >
              {t('aboutApp')}
            </Text>
          </View>

          <Text
            style={{
              fontSize: commonTokens.typography.bodyMd.fontSize,
              fontFamily: commonTokens.typography.bodyMd.fontFamily,
              color: theme.colors.textSecondary,
              marginBottom: commonTokens.spacing.md,
              lineHeight: 22,
            }}
          >
            {t('aboutAppDescription')}
          </Text>

          <Text
            style={{
              fontSize: commonTokens.typography.bodySm.fontSize,
              fontFamily: commonTokens.typography.bodySm.fontFamily,
              color: theme.colors.textSecondary,
              marginBottom: commonTokens.spacing.md,
            }}
          >
            {t('createdBy')}
          </Text>

          <TouchableOpacity
            onPress={handleContactPress}
            style={{
              paddingVertical: commonTokens.spacing.sm,
              paddingHorizontal: commonTokens.spacing.md,
              backgroundColor: theme.colors.primaryLight,
              borderRadius: commonTokens.borderRadius.md,
            }}
          >
            <Text
              style={{
                fontSize: commonTokens.typography.bodyLg.fontSize,
                fontFamily: commonTokens.typography.bodyLg.fontFamily,
                color: theme.colors.primary,
                fontWeight: '600',
                textAlign: 'center',
              }}
            >
              {t('contact')} →
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Version Card */}
        <Card
          style={{
            marginBottom: commonTokens.spacing.lg,
            backgroundColor: theme.colors.surfaceSubtle,
          }}
        >
          <View style={{ alignItems: 'center' }}>
            <Text
              style={{
                fontSize: commonTokens.typography.bodyMd.fontSize,
                fontFamily: commonTokens.typography.bodyMd.fontFamily,
                color: theme.colors.textSecondary,
                marginBottom: commonTokens.spacing.xs,
              }}
            >
              {t('appVersion')}
            </Text>
            <Text
              style={{
                fontSize: commonTokens.typography.displaySm.fontSize,
                fontFamily: commonTokens.typography.displaySm.fontFamily,
                color: theme.colors.primary,
                fontWeight: '700',
              }}
            >
              v{packageJson.version}
            </Text>
            <Text
              style={{
                fontSize: commonTokens.typography.bodySm.fontSize,
                fontFamily: commonTokens.typography.bodySm.fontFamily,
                color: theme.colors.textTertiary,
                marginTop: commonTokens.spacing.xs,
              }}
            >
              © {new Date().getFullYear()} Adateo
            </Text>
          </View>
        </Card>
      </ScrollView>

      {/* Floating Navigation Bar */}
      <FloatingNavBar
        currentRoute="Settings"
        onNavigate={(routeName: string) => navigation.navigate(routeName)}
        items={navItems}
      />
    </View>
  );
}

export default SettingsScreen;
