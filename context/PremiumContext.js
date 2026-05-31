import React from "react";
import { Platform } from "react-native";
import Purchases from "react-native-purchases";
import {
  REVENUECAT_ANDROID_API_KEY,
  REVENUECAT_IOS_API_KEY,
  REVENUECAT_ENTITLEMENT_ID,
} from "@env";

const PremiumContext = React.createContext({
  isPremium: false,
  isConfigured: false,
  isLoading: true,
  offerings: null,
  error: null,
  purchasePremium: async () => false,
  restorePurchases: async () => false,
  refreshCustomerInfo: async () => {},
});

const entitlementId = REVENUECAT_ENTITLEMENT_ID || "premium";

const hasPremiumEntitlement = (customerInfo) =>
  Boolean(customerInfo?.entitlements?.active?.[entitlementId]);

const getRevenueCatApiKey = () => {
  if (Platform.OS === "ios") {
    return REVENUECAT_IOS_API_KEY;
  }

  return REVENUECAT_ANDROID_API_KEY;
};

export const PremiumProvider = ({ children }) => {
  const [isPremium, setIsPremium] = React.useState(false);
  const [isConfigured, setIsConfigured] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [offerings, setOfferings] = React.useState(null);
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
        Purchases.setLogLevel(Purchases.LOG_LEVEL.WARN);
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

        let loadedOfferings = null;
        try {
          loadedOfferings = await Purchases.getOfferings();
        } catch (offeringsError) {
          console.warn("RevenueCat offerings unavailable", offeringsError);
        }

        if (isMounted) {
          applyCustomerInfo(customerInfo);
          setOfferings(loadedOfferings);
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
      const currentOffering = offerings?.current;
      const premiumPackage =
        currentOffering?.availablePackages?.[0] || currentOffering?.lifetime;

      if (!premiumPackage) {
        throw new Error("No RevenueCat offering is available.");
      }

      const { customerInfo } = await Purchases.purchasePackage(premiumPackage);
      const hasPremium = hasPremiumEntitlement(customerInfo);
      setIsPremium(hasPremium);
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
      offerings,
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
      offerings,
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
