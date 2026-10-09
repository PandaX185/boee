import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { usePrefersReducedMotion } from '@/components/motion/reducedMotion';
import { motion } from '@/constants/theme';

interface Props {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  delay?: number;
}

export function Reveal({ children, style, delay = 0 }: Props) {
  const reduced = usePrefersReducedMotion();

  if (reduced) {
    return <View style={style}>{children}</View>;
  }

  return (
    <Animated.View style={style} entering={FadeInDown.delay(delay).duration(motion.duration.base)}>
      {children}
    </Animated.View>
  );
}
