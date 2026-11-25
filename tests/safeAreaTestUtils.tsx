import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

// No native measurement exists under Jest, so tests supply fixed metrics
// (a notched phone with a gesture bar).
export const TEST_SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 375, height: 812 },
  insets: { top: 44, left: 0, right: 0, bottom: 34 },
};

export const WithSafeArea: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>{children}</SafeAreaProvider>
);
