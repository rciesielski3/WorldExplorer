import React from 'react';
import { Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';

interface NavBarIconProps {
  name: string;
  isActive: boolean;
  onPress: () => void;
  color: string;
}

export function NavBarIcon({ name, isActive, onPress, color }: NavBarIconProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handlePress}
        onPressIn={() => (scale.value = withSpring(1.1))}
        onPressOut={() => (scale.value = withSpring(1))}
        style={{
          padding: 8,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <MaterialCommunityIcons
          name={name}
          size={isActive ? 26 : 24}
          color={isActive ? color : `${color}99`}
        />
      </Pressable>
    </Animated.View>
  );
}
