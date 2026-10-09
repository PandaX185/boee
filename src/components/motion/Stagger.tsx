import { Children, type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { usePrefersReducedMotion } from '@/components/motion/reducedMotion';
import { motion } from '@/constants/theme';

interface Props {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  delay?: number;
}

export function Stagger({ children, style, delay = 55 }: Props) {
  const reduced = usePrefersReducedMotion();

  if (reduced) {
    return <View style={style}>{children}</View>;
  }

  return (
    <View style={style}>
      {Children.toArray(children).map((child, index) => (
        <Animated.View
          key={index}
          entering={FadeInDown.delay(index * delay).duration(motion.duration.base)}
        >
          {child}
        </Animated.View>
      ))}
    </View>
  );
}
