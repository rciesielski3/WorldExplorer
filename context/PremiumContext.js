import React from "react";
import { Platform } from "react-native";
import Purchases, { LOG_LEVEL } from "react-native-purchases";

const PREMIUM_ENABLED = process.env.EXPO_PUBLIC_PREMIUM_ENABLED === "true";
const PREMIUM_ENTITLEMENT_ID =
  process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID || "premium";

const REVENUECAT_API_KEYS = {
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY,
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY,
};

const PremiumContext = React.createContext({
  isPremium: false,
  isConfigured: false,
  isEnabled: false,
  isLoading: false,
  error: null,
  refreshCustomerInfo: async () => {},
});

const hasPremiumEntitlement = (customerInfo) =>
  Boolean(customerInfo?.entitlements?.active?.[PREMIUM_ENTITLEMENT_ID]);

const getRevenueCatApiKey = () => {
  if (Platform.OS !== "android" && Platform.OS !== "ios") {
    return undefined;
  }

  return REVENUECAT_API_KEYS[Platform.OS];
};

export const PremiumProvider = ({ children }) => {
  const [isPremium, setIsPremium] = React.useState(false);
  const [isConfigured, setIsConfigured] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(PREMIUM_ENABLED);
  const [error, setError] = React.useState(null);

  const applyCustomerInfo = React.useCallback((customerInfo) => {
    setIsPremium(hasPremiumEntitlement(customerInfo));
  }, []);

  const refreshCustomerInfo = React.useCallback(async () => {
    if (!isConfigured) {
      return;
    }

    const customerInfo = await Purchases.getCustomerInfo();
    applyCustomerInfo(customerInfo);
  }, [applyCustomerInfo, isConfigured]);

  React.useEffect(() => {
    let isMounted = true;

    if (!PREMIUM_ENABLED) {
      setIsLoading(false);
      return undefined;
    }

    const apiKey = getRevenueCatApiKey();

    if (!apiKey) {
      setIsLoading(false);
      setError("RevenueCat API key is missing.");
      return undefined;
    }

    const customerInfoListener = (customerInfo) => {
      if (isMounted) {
        applyCustomerInfo(customerInfo);
      }
    };

    const configurePurchases = async () => {
      try {
        Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.WARN);
        Purchases.configure({ apiKey });
        Purchases.addCustomerInfoUpdateListener(customerInfoListener);

        const customerInfo = await Purchases.getCustomerInfo();

        if (isMounted) {
          applyCustomerInfo(customerInfo);
          setIsConfigured(true);
          setError(null);
        }
      } catch (configurationError) {
        if (isMounted) {
          setError(configurationError?.message || "RevenueCat setup failed.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    configurePurchases();

    return () => {
      isMounted = false;
      Purchases.removeCustomerInfoUpdateListener(customerInfoListener);
    };
  }, [applyCustomerInfo]);

  const value = React.useMemo(
    () => ({
      isPremium,
      isConfigured,
      isEnabled: PREMIUM_ENABLED,
      isLoading,
      error,
      refreshCustomerInfo,
    }),
    [error, isConfigured, isLoading, isPremium, refreshCustomerInfo]
  );

  return (
    <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>
  );
};

export const usePremium = () => React.useContext(PremiumContext);
