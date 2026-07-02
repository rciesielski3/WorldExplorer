import React, { ReactNode } from "react";
import { Platform } from "react-native";
import Purchases, { LOG_LEVEL, PurchasesPackage, CustomerInfo } from "react-native-purchases";

const PREMIUM_ENABLED = process.env.EXPO_PUBLIC_PREMIUM_ENABLED === "true";
const PREMIUM_ENTITLEMENT_ID =
  process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID || "premium";
const PREMIUM_PRODUCT_ID =
  process.env.EXPO_PUBLIC_REVENUECAT_PREMIUM_PRODUCT_ID ||
  "worldexplorer_premium_lifetime";

const REVENUECAT_API_KEYS: Record<string, string | undefined> = {
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY,
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY,
};

interface PremiumContextType {
  isPremium: boolean;
  isConfigured: boolean;
  isEnabled: boolean;
  isLoading: boolean;
  isPurchasing: boolean;
  isRestoring: boolean;
  error: string | null;
  premiumPackage: PurchasesPackage | null;
  purchasePremium: () => Promise<boolean>;
  refreshCustomerInfo: () => Promise<void>;
  refreshOfferings?: () => Promise<void>;
  restorePurchases: () => Promise<boolean>;
}

const PremiumContext = React.createContext<PremiumContextType>({
  isPremium: false,
  isConfigured: false,
  isEnabled: false,
  isLoading: false,
  isPurchasing: false,
  isRestoring: false,
  error: null,
  premiumPackage: null,
  purchasePremium: async () => false,
  refreshCustomerInfo: async () => {},
  restorePurchases: async () => false,
});

const hasPremiumEntitlement = (customerInfo: CustomerInfo): boolean =>
  Boolean(customerInfo?.entitlements?.active?.[PREMIUM_ENTITLEMENT_ID]);

const getPremiumPackage = (offerings: any): PurchasesPackage | null => {
  const currentOffering = offerings?.current;
  const availablePackages = currentOffering?.availablePackages || [];

  return (
    availablePackages.find(
      (offeringPackage: any) =>
        offeringPackage?.storeProduct?.identifier === PREMIUM_PRODUCT_ID
    ) ||
    currentOffering?.lifetime ||
    availablePackages[0] ||
    null
  );
};

const getRevenueCatApiKey = (): string | undefined => {
  if (Platform.OS !== "android" && Platform.OS !== "ios") {
    return undefined;
  }

  return REVENUECAT_API_KEYS[Platform.OS];
};

interface PremiumProviderProps {
  children: ReactNode;
}

export const PremiumProvider: React.FC<PremiumProviderProps> = ({ children }) => {
  const [isPremium, setIsPremium] = React.useState(false);
  const [isConfigured, setIsConfigured] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(PREMIUM_ENABLED);
  const [isPurchasing, setIsPurchasing] = React.useState(false);
  const [isRestoring, setIsRestoring] = React.useState(false);
  const [premiumPackage, setPremiumPackage] = React.useState<PurchasesPackage | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const applyCustomerInfo = React.useCallback((customerInfo: CustomerInfo) => {
    setIsPremium(hasPremiumEntitlement(customerInfo));
  }, []);

  const refreshCustomerInfo = React.useCallback(async () => {
    if (!isConfigured) {
      return;
    }

    try {
      const customerInfo = await Purchases.getCustomerInfo();
      applyCustomerInfo(customerInfo);
      setError(null);
    } catch (refreshError: any) {
      setError(
        refreshError?.message || "RevenueCat customer info refresh failed."
      );
    }
  }, [applyCustomerInfo, isConfigured]);

  const refreshOfferings = React.useCallback(async () => {
    if (!isConfigured) {
      return;
    }

    try {
      const offerings = await Purchases.getOfferings();
      setPremiumPackage(getPremiumPackage(offerings));
      setError(null);
    } catch (offeringsError: any) {
      setPremiumPackage(null);
      setError(offeringsError?.message || "RevenueCat offerings load failed.");
    }
  }, [isConfigured]);

  const purchasePremium = React.useCallback(async () => {
    setError(null);

    if (!isConfigured) {
      setError("RevenueCat is not configured.");
      return false;
    }

    if (!premiumPackage) {
      setError("Premium product is not available.");
      return false;
    }

    setIsPurchasing(true);

    try {
      const { customerInfo } = await Purchases.purchasePackage(premiumPackage);
      applyCustomerInfo(customerInfo);
      setError(null);
      return hasPremiumEntitlement(customerInfo);
    } catch (purchaseError: any) {
      if (!purchaseError?.userCancelled) {
        setError(purchaseError?.message || "Premium purchase failed.");
      }

      return false;
    } finally {
      setIsPurchasing(false);
    }
  }, [applyCustomerInfo, isConfigured, premiumPackage]);

  const restorePurchases = React.useCallback(async () => {
    setError(null);

    if (!isConfigured) {
      setError("RevenueCat is not configured.");
      return false;
    }

    setIsRestoring(true);

    try {
      const customerInfo = await Purchases.restorePurchases();
      applyCustomerInfo(customerInfo);
      setError(null);
      return hasPremiumEntitlement(customerInfo);
    } catch (restoreError: any) {
      setError(restoreError?.message || "Premium restore failed.");
      return false;
    } finally {
      setIsRestoring(false);
    }
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

    const customerInfoListener = (customerInfo: CustomerInfo) => {
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

        try {
          const offerings = await Purchases.getOfferings();

          if (isMounted) {
            setPremiumPackage(getPremiumPackage(offerings));
          }
        } catch (offeringsError: any) {
          if (isMounted) {
            setPremiumPackage(null);
            setError(
              offeringsError?.message || "RevenueCat offerings load failed."
            );
          }
        }
      } catch (configurationError: any) {
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
      isPurchasing,
      isRestoring,
      error,
      premiumPackage,
      purchasePremium,
      refreshCustomerInfo,
      refreshOfferings,
      restorePurchases,
    }),
    [
      error,
      isConfigured,
      isLoading,
      isPremium,
      isPurchasing,
      isRestoring,
      premiumPackage,
      purchasePremium,
      refreshCustomerInfo,
      refreshOfferings,
      restorePurchases,
    ]
  );

  return (
    <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>
  );
};

export const usePremium = () => React.useContext(PremiumContext);
