import { useCallback, useEffect, useRef, useState } from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';
import { runOnJS, useAnimatedReaction, useSharedValue, withTiming } from 'react-native-reanimated';

import { usePrefersReducedMotion } from '@/components/motion/reducedMotion';
import { motion } from '@/constants/theme';

interface Props {
  value: number;
  format: (value: number) => string;
  style?: StyleProp<TextStyle>;
  interpolate?: boolean;
  duration?: number;
}

export function AnimatedNumber({
  value,
  format,
  style,
  interpolate = false,
  duration = motion.duration.slow,
}: Props) {
  const reduced = usePrefersReducedMotion();
  const [display, setDisplay] = useState(value);
  const displayed = useRef(value);
  const progress = useSharedValue(value);

  const commit = useCallback((next: number) => {
    if (displayed.current !== next) {
      displayed.current = next;
      setDisplay(next);
    }
  }, []);

  useEffect(() => {
    if (!interpolate || reduced) {
      progress.set(value);
      commit(value);
      return;
    }
    progress.set(
      withTiming(value, { duration, easing: motion.easing.decelerate }, (finished) => {
        if (finished) {
          runOnJS(commit)(value);
        }
      }),
    );
  }, [value, interpolate, reduced, duration, progress, commit]);

  useAnimatedReaction(
    () => Math.round(progress.value),
    (current, previous) => {
      if (interpolate && !reduced && current !== previous) {
        runOnJS(commit)(current);
      }
    },
    [interpolate, reduced, commit],
  );

  return <Text style={style}>{format(display)}</Text>;
}
