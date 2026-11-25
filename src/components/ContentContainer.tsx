import React, { useContext } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import { commonTokens } from "../../theme/tokens";

export interface ContentContainerProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Shared wide-screen content wrapper. Below `layout.maxContentWidth` it does
 * not constrain its children; above it, content is capped to that width and
 * centered (tablets, foldables, phones in landscape).
 */
export function ContentContainer({
  children,
  style,
  testID = "content-container",
}: ContentContainerProps) {
  const { width } = useWindowDimensions();
  // Context (not useSafeAreaInsets) so a missing provider falls back to zero.
  const insets = useContext(SafeAreaInsetsContext);
  const maxWidth = commonTokens.layout.maxContentWidth;
  const isConstrained = width > maxWidth;

  return (
    <View
      testID={testID}
      style={[
        styles.root,
        isConstrained && { maxWidth },
        { paddingLeft: insets?.left ?? 0, paddingRight: insets?.right ?? 0 },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: "100%",
    alignSelf: "center",
  },
});

export default ContentContainer;
