import React from "react";
import { Text } from "react-native";
import { act, render } from "@testing-library/react-native";
import type { CustomerInfo, PurchasesOfferings } from "react-native-purchases";

jest.mock("react-native-purchases", () => ({
  __esModule: true,
  default: {
    setLogLevel: jest.fn(),
    configure: jest.fn(),
    addCustomerInfoUpdateListener: jest.fn(),
    removeCustomerInfoUpdateListener: jest.fn(),
    getCustomerInfo: jest.fn(),
    getOfferings: jest.fn(),
    purchasePackage: jest.fn(),
    restorePurchases: jest.fn(),
  },
  LOG_LEVEL: { DEBUG: "DEBUG", WARN: "WARN" },
}));

jest.mock("../../utils/logger", () => ({
  __esModule: true,
  logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn() },
}));

type PremiumModule = typeof import("../PremiumContext");

const premiumInfo = {
  entitlements: { active: { premium: {} } },
} as unknown as CustomerInfo;
const freeInfo = { entitlements: { active: {} } } as unknown as CustomerInfo;
const offerings = {
  current: { availablePackages: [], lifetime: null },
} as unknown as PurchasesOfferings;

const flush = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};

// PremiumContext reads env vars at import time, so each test re-imports it
// (sharing the already loaded React so hooks keep working).
const loadModules = (env: Record<string, string | undefined>) => {
  Object.assign(process.env, env);
  jest.doMock("react", () => React);
  let loaded!: {
    premium: PremiumModule;
    purchases: any;
    logger: any;
  };
  jest.isolateModules(() => {
    loaded = {
      premium: jest.requireActual("../PremiumContext"),
      purchases: jest.requireMock("react-native-purchases").default,
      logger: jest.requireMock("../../utils/logger").logger,
    };
  });
  return loaded;
};

const renderProvider = (premium: PremiumModule) => {
  const Probe = () => {
    const { isPremium, isLoading } = premium.usePremium();
    return (
      <Text testID="state">{`${isPremium ? "premium" : "free"}|${
        isLoading ? "loading" : "ready"
      }`}</Text>
    );
  };
  const utils = render(
    <premium.PremiumProvider>
      <Probe />
    </premium.PremiumProvider>
  );
  return {
    ...utils,
    state: () => utils.getByTestId("state").props.children as string,
  };
};

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
};

describe("PremiumContext loading", () => {
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    process.env.EXPO_PUBLIC_PREMIUM_ENABLED = "true";
    process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY = "android-key";
    process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY = "ios-key";
  });

  afterEach(() => {
    jest.useRealTimers();
    errorSpy.mockRestore();
  });

  it("clears loading and sets premium on a fast response", async () => {
    const { premium, purchases, logger } = loadModules({});
    purchases.getCustomerInfo.mockResolvedValue(premiumInfo);
    purchases.getOfferings.mockResolvedValue(offerings);

    const view = renderProvider(premium);
    expect(view.state()).toBe("free|loading");
    await flush();

    expect(view.state()).toBe("premium|ready");
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it("clears loading before offerings resolve", async () => {
    const { premium, purchases } = loadModules({});
    const pendingOfferings = deferred<PurchasesOfferings>();
    purchases.getCustomerInfo.mockResolvedValue(freeInfo);
    purchases.getOfferings.mockReturnValue(pendingOfferings.promise);

    const view = renderProvider(premium);
    await flush();

    expect(view.state()).toBe("free|ready");
    expect(purchases.getOfferings).toHaveBeenCalledTimes(1);
  });

  it("stops loading with isPremium unchanged and warns on timeout", async () => {
    const { premium, purchases, logger } = loadModules({});
    purchases.getCustomerInfo.mockReturnValue(new Promise(() => {}));
    purchases.getOfferings.mockReturnValue(new Promise(() => {}));

    const view = renderProvider(premium);
    await act(async () => {
      jest.advanceTimersByTime(premium.CUSTOMER_INFO_TIMEOUT_MS - 1);
    });
    expect(view.state()).toBe("free|loading");

    await act(async () => {
      jest.advanceTimersByTime(1);
    });
    expect(view.state()).toBe("free|ready");
    expect(logger.warn).toHaveBeenCalledTimes(1);
  });

  it("stops loading and keeps isPremium when getCustomerInfo rejects", async () => {
    const { premium, purchases } = loadModules({});
    purchases.getCustomerInfo.mockRejectedValue(new Error("boom"));

    const view = renderProvider(premium);
    await flush();

    expect(view.state()).toBe("free|ready");
    expect(purchases.getOfferings).not.toHaveBeenCalled();
  });

  it("applies a late customer info response after the timeout", async () => {
    const { premium, purchases } = loadModules({});
    const request = deferred<CustomerInfo>();
    purchases.getCustomerInfo.mockReturnValue(request.promise);
    purchases.getOfferings.mockResolvedValue(offerings);

    const view = renderProvider(premium);
    await act(async () => {
      jest.advanceTimersByTime(premium.CUSTOMER_INFO_TIMEOUT_MS);
    });
    expect(view.state()).toBe("free|ready");

    await act(async () => {
      request.resolve(premiumInfo);
    });
    expect(view.state()).toBe("premium|ready");
  });

  it("applies a listener update after the timeout", async () => {
    const { premium, purchases } = loadModules({});
    purchases.getCustomerInfo.mockReturnValue(new Promise(() => {}));
    purchases.getOfferings.mockReturnValue(new Promise(() => {}));

    const view = renderProvider(premium);
    await act(async () => {
      jest.advanceTimersByTime(premium.CUSTOMER_INFO_TIMEOUT_MS);
    });

    const listener = purchases.addCustomerInfoUpdateListener.mock.calls[0][0];
    await act(async () => {
      listener(premiumInfo);
    });
    expect(view.state()).toBe("premium|ready");
  });

  it("does not update state or warn after unmount", async () => {
    const { premium, purchases, logger } = loadModules({});
    const request = deferred<CustomerInfo>();
    purchases.getCustomerInfo.mockReturnValue(request.promise);
    purchases.getOfferings.mockResolvedValue(offerings);

    const view = renderProvider(premium);
    const listener = purchases.addCustomerInfoUpdateListener.mock.calls[0][0];
    view.unmount();
    expect(purchases.removeCustomerInfoUpdateListener).toHaveBeenCalledWith(
      listener
    );

    await act(async () => {
      jest.advanceTimersByTime(premium.CUSTOMER_INFO_TIMEOUT_MS * 2);
    });
    await act(async () => {
      request.resolve(premiumInfo);
      listener(premiumInfo);
    });

    expect(logger.warn).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("does not let an offerings failure affect premium", async () => {
    const { premium, purchases } = loadModules({});
    purchases.getCustomerInfo.mockResolvedValue(premiumInfo);
    purchases.getOfferings.mockRejectedValue(new Error("offerings down"));

    const view = renderProvider(premium);
    await flush();
    await flush();

    expect(view.state()).toBe("premium|ready");
  });

  it("is not loading and never calls RevenueCat when premium is disabled", async () => {
    const { premium, purchases } = loadModules({
      EXPO_PUBLIC_PREMIUM_ENABLED: "false",
    });

    const view = renderProvider(premium);
    await flush();

    expect(view.state()).toBe("free|ready");
    expect(purchases.configure).not.toHaveBeenCalled();
  });

  it("stops loading without calling RevenueCat when the API key is missing", async () => {
    const { premium, purchases } = loadModules({
      EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY: "",
      EXPO_PUBLIC_REVENUECAT_IOS_API_KEY: "",
    });

    const view = renderProvider(premium);
    await flush();

    expect(view.state()).toBe("free|ready");
    expect(purchases.configure).not.toHaveBeenCalled();
  });
});
