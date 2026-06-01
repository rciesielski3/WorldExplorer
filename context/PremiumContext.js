import React from "react";
import { Platform } from "react-native";
import Purchases, { LOG_LEVEL, PURCHASE_TYPE } from "react-native-purchases";

const PREMIUM_PRODUCT_ID =
  process.env.EXPO_PUBLIC_PREMIUM_PRODUCT_ID ||
  "worldexplorer_premium_lifetime";
const PREMIUM_ENTITLEMENT_ID =
  process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID || "premium";

const REVENUECAT_API_KEYS = {
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY,
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY,
};

const PremiumContext = React.createContext({
  isPremium: false,
  isConfigured: false,
  isLoading: true,
  error: null,
  purchasePremium: async () => false,
  restorePurchases: async () => false,
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
  const [isLoading, setIsLoading] = React.useState(true);
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
    const apiKey = getRevenueCatApiKey();

    const configurePurchases = async () => {
      if (!apiKey) {
        if (isMounted) {
          setIsLoading(false);
          setError("RevenueCat API key is missing.");
        }
        return;
      }

      try {
        Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.WARN);
        Purchases.configure({ apiKey });
        if (isMounted) {
          setIsConfigured(true);
        }

        const customerInfoListener = (customerInfo) => {
          if (isMounted) {
            applyCustomerInfo(customerInfo);
          }
        };

        Purchases.addCustomerInfoUpdateListener(customerInfoListener);

        const customerInfo = await Purchases.getCustomerInfo();

        if (isMounted) {
          applyCustomerInfo(customerInfo);
          setError(null);
        }

        return () => {
          Purchases.removeCustomerInfoUpdateListener(customerInfoListener);
        };
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

    let cleanup;
    configurePurchases().then((cleanupListener) => {
      cleanup = cleanupListener;
    });

    return () => {
      isMounted = false;
      if (cleanup) {
        cleanup();
      }
    };
  }, [applyCustomerInfo]);

  const purchasePremium = React.useCallback(async () => {
    if (!isConfigured) {
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { customerInfo } = await Purchases.purchaseProduct(
        PREMIUM_PRODUCT_ID,
        null,
        PURCHASE_TYPE.INAPP
      );
      const hasPremium = hasPremiumEntitlement(customerInfo);
      setIsPremium(hasPremium);
      if (!hasPremium) {
        setError("No active Premium purchase was found for this account.");
      }
      return hasPremium;
    } catch (purchaseError) {
      if (!purchaseError?.userCancelled) {
        setError(purchaseError?.message || "Purchase failed.");
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isConfigured, offerings]);

  const restorePurchases = React.useCallback(async () => {
    if (!isConfigured) {
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const customerInfo = await Purchases.restorePurchases();
      const hasPremium = hasPremiumEntitlement(customerInfo);
      setIsPremium(hasPremium);
      if (!hasPremium) {
        setError("No active Premium purchase was found for this account.");
      }
      return hasPremium;
    } catch (restoreError) {
      setError(restoreError?.message || "Restore failed.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isConfigured]);

  const value = React.useMemo(
    () => ({
      isPremium,
      isConfigured,
      isLoading,
      error,
      purchasePremium,
      restorePurchases,
      refreshCustomerInfo,
    }),
    [
      error,
      isConfigured,
      isLoading,
      isPremium,
      purchasePremium,
      refreshCustomerInfo,
      restorePurchases,
    ]
  );

  return (
    <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>
  );
};

export const usePremium = () => React.useContext(PremiumContext);
