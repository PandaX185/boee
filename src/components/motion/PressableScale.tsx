import type { ReactNode } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { usePrefersReducedMotion } from '@/components/motion/reducedMotion';
import { motion } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props extends Omit<PressableProps, 'style' | 'children'> {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  pressedScale?: number;
}

export function PressableScale({ children, style, pressedScale = 0.97, disabled, ...rest }: Props) {
  const reduced = usePrefersReducedMotion();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={(event) => {
        if (!reduced && !disabled) {
          scale.set(withSpring(pressedScale, motion.spring.snappy));
        }
        rest.onPressIn?.(event);
      }}
      onPressOut={(event) => {
        if (!reduced && !disabled) {
          scale.set(withSpring(1, motion.spring.gentle));
        }
        rest.onPressOut?.(event);
      }}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}
