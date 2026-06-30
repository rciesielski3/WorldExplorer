import React from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import packageJson from '../package.json';

import { useTheme } from '../context/ThemeContext';
import { usePremium } from '../context/PremiumContext';
import { Card } from '../components/ui/Card';
import { ToggleSwitch } from '../components/ui/ToggleSwitch';
import { TopBar } from '../components/ui/TopBar';
import { FloatingNavBar } from '../components/Navigation/FloatingNavBar';
import { commonTokens } from '../theme/tokens';
import { Picker } from '@react-native-picker/picker';

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleThemeToggle = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    theme.toggleTheme();
  };

  const handleSoundToggle = () => {
    setSoundEnabled(!soundEnabled);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleHapticsToggle = () => {
    setHapticsEnabled(!hapticsEnabled);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleResetData = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Implement data reset functionality
    alert(t('resetData'));
  };

  const handleContactPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(CONTACT_URL);
  };

  const navItems = [
    { name: 'Home', icon: 'home-outline', color: theme.colors.primary },
    { name: 'Explore', icon: 'earth', color: theme.colors.secondary },
    { name: 'Map', icon: 'map-outline', color: theme.colors.ocean },
    { name: 'Quiz', icon: 'puzzle-outline', color: theme.colors.amber },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <TopBar appName={t('settings')} />

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
              onValueChange={handleThemeToggle}
              enabledIcon="moon"
              disabledIcon="sun"
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
              onValueChange={handleSoundToggle}
              enabledIcon="volume-high"
              disabledIcon="volume-mute"
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
              onValueChange={handleHapticsToggle}
              enabledIcon="vibrate"
              disabledIcon="vibrate-off"
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
        onNavigate={(routeName) => navigation.navigate(routeName)}
        items={navItems}
      />
    </View>
  );
}

export default SettingsScreen;
