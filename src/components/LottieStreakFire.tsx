import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { Svg, Path, Defs, RadialGradient, Stop, Circle } from 'react-native-svg';

import { StreakFireState } from '@/types';

// Fire state visual configuration matching spec:
// 0 days: Dead ember (Gray, None)
// 1-6 days: Small flame (Orange, Gentle flicker)
// 7-13 days: Medium flame (Orange-Yellow, Active flicker)
// 14-29 days: Large flame (Yellow-Gold, Dynamic pulse)
// 30+ days: Blue flame (Blue-White, Intense glow + particles)

interface FireStateVisual {
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
  intensity: number;
  hasParticles: boolean;
  animationSpeed: number;
  flickerRange: number;
  pulseEnabled: boolean;
}

const FIRE_STATE_VISUALS: Record<StreakFireState, FireStateVisual> = {
  dead: {
    primaryColor: '#6B7280', // Gray
    secondaryColor: '#4B5563',
    glowColor: '#374151',
    intensity: 0,
    hasParticles: false,
    animationSpeed: 0,
    flickerRange: 0,
    pulseEnabled: false,
  },
  small: {
    primaryColor: '#F97316', // Orange
    secondaryColor: '#EA580C',
    glowColor: '#FB923C',
    intensity: 0.3,
    hasParticles: false,
    animationSpeed: 1.2,
    flickerRange: 0.05,
    pulseEnabled: false,
  },
  medium: {
    primaryColor: '#FBBF24', // Orange-Yellow
    secondaryColor: '#F97316',
    glowColor: '#FCD34D',
    intensity: 0.5,
    hasParticles: false,
    animationSpeed: 0.9,
    flickerRange: 0.1,
    pulseEnabled: false,
  },
  large: {
    primaryColor: '#FCD34D', // Yellow-Gold
    secondaryColor: '#FBBF24',
    glowColor: '#FDE68A',
    intensity: 0.7,
    hasParticles: false,
    animationSpeed: 0.7,
    flickerRange: 0.12,
    pulseEnabled: true,
  },
  blue: {
    primaryColor: '#93C5FD', // Blue-White
    secondaryColor: '#60A5FA',
    glowColor: '#BFDBFE',
    intensity: 1,
    hasParticles: true,
    animationSpeed: 0.5,
    flickerRange: 0.15,
    pulseEnabled: true,
  },
};

interface LottieStreakFireProps {
  state: StreakFireState;
  size?: number;
  compact?: boolean; // Reduces glow for tight spaces
}

const _AnimatedSvg = Animated.createAnimatedComponent(Svg); // Reserved for future use

// Particle component for blue flame
function FireParticle({
  delay,
  size,
  color,
  containerSize,
}: {
  delay: number;
  size: number;
  color: string;
  containerSize: number;
}) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    const startX = (Math.random() - 0.5) * containerSize * 0.4;

    translateX.value = startX;
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(-containerSize * 0.8, { duration: 1500, easing: Easing.out(Easing.quad) })
        ),
        -1,
        false
      )
    );

    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(0.8, { duration: 200 }),
          withTiming(0.6, { duration: 800 }),
          withTiming(0, { duration: 500 })
        ),
        -1,
        false
      )
    );

    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 0 }),
          withTiming(0.3, { duration: 1500, easing: Easing.out(Easing.quad) })
        ),
        -1,
        false
      )
    );
  }, [delay, containerSize]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          bottom: containerSize * 0.3,
          left: containerSize / 2 - size / 2,
        },
        animatedStyle,
      ]}
    />
  );
}

// Ember particle for dead state
function EmberParticle({ size, containerSize }: { size: number; containerSize: number }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(withTiming(0.5, { duration: 2000 }), withTiming(0.2, { duration: 2000 })),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.ember,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#EF4444',
          bottom: containerSize * 0.2,
        },
        animatedStyle,
      ]}
    />
  );
}

export function LottieStreakFire({ state, size = 40, compact = false }: LottieStreakFireProps) {
  const visual = FIRE_STATE_VISUALS[state];

  // Animation values
  const flameScale = useSharedValue(1);
  const flameRotation = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const glowScale = useSharedValue(1);
  const innerFlameScale = useSharedValue(1);

  useEffect(() => {
    if (state === 'dead') {
      flameScale.value = withSpring(1);
      flameRotation.value = withSpring(0);
      glowOpacity.value = withTiming(0);
      return;
    }

    const { animationSpeed, flickerRange, pulseEnabled, intensity } = visual;

    // Main flame flicker
    flameScale.value = withRepeat(
      withSequence(
        withTiming(1 + flickerRange, {
          duration: 150 * animationSpeed,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(1 - flickerRange * 0.5, {
          duration: 100 * animationSpeed,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(1 + flickerRange * 0.3, {
          duration: 120 * animationSpeed,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(1, {
          duration: 130 * animationSpeed,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      true
    );

    // Rotation wobble
    const rotationRange = 2 + intensity * 4;
    flameRotation.value = withRepeat(
      withSequence(
        withTiming(rotationRange, { duration: 200 * animationSpeed }),
        withTiming(-rotationRange, { duration: 200 * animationSpeed }),
        withTiming(rotationRange * 0.5, { duration: 150 * animationSpeed }),
        withTiming(-rotationRange * 0.5, { duration: 150 * animationSpeed })
      ),
      -1,
      true
    );

    // Glow animation
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.4 + intensity * 0.4, { duration: 800 }),
        withTiming(0.2 + intensity * 0.2, { duration: 800 })
      ),
      -1,
      true
    );

    // Pulse for large and blue states
    if (pulseEnabled) {
      glowScale.value = withRepeat(
        withSequence(withTiming(1.2, { duration: 600 }), withTiming(1, { duration: 600 })),
        -1,
        true
      );

      innerFlameScale.value = withRepeat(
        withSequence(withTiming(1.1, { duration: 500 }), withTiming(0.95, { duration: 500 })),
        -1,
        true
      );
    } else {
      glowScale.value = withSpring(1);
      innerFlameScale.value = withSpring(1);
    }
  }, [state, visual]);

  const animatedFlameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: flameScale.value }, { rotate: `${flameRotation.value}deg` }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));

  const animatedInnerFlameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: innerFlameScale.value }],
  }));

  // Generate particles for blue state (disabled in compact mode)
  const particles = useMemo(() => {
    if (!visual.hasParticles || compact) return null;
    return Array.from({ length: 8 }).map((_, i) => (
      <FireParticle
        key={i}
        delay={i * 200}
        size={3 + Math.random() * 3}
        color={i % 2 === 0 ? '#BFDBFE' : '#93C5FD'}
        containerSize={size}
      />
    ));
  }, [visual.hasParticles, size, compact]);

  // Glow size - smaller in compact mode
  const glowMultiplier = compact ? 1.2 : 1.8;

  return (
    <View
      style={[styles.container, { width: size, height: size }, compact && styles.compactContainer]}
    >
      {/* Glow layer - reduced in compact mode */}
      {state !== 'dead' && !compact && (
        <Animated.View
          style={[
            styles.glow,
            {
              width: size * glowMultiplier,
              height: size * glowMultiplier,
              borderRadius: size,
              backgroundColor: visual.glowColor,
            },
            animatedGlowStyle,
          ]}
        />
      )}

      {/* Particles */}
      {particles}

      {/* Dead ember state */}
      {state === 'dead' && <EmberParticle size={size * 0.15} containerSize={size} />}

      {/* Main flame SVG */}
      <Animated.View style={[styles.flameContainer, animatedFlameStyle]}>
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Defs>
            <RadialGradient id="flameGradient" cx="50%" cy="70%" r="60%">
              <Stop offset="0%" stopColor={visual.primaryColor} />
              <Stop offset="100%" stopColor={visual.secondaryColor} />
            </RadialGradient>
          </Defs>
          {/* Outer flame */}
          <Path
            d="M12 2C12 2 4 9 4 14C4 18.4183 7.58172 22 12 22C16.4183 22 20 18.4183 20 14C20 9 12 2 12 2Z"
            fill="url(#flameGradient)"
          />
          {/* Inner flame */}
          <Animated.View style={animatedInnerFlameStyle}>
            <Path
              d="M12 6C12 6 8 10 8 13C8 15.7614 9.79086 18 12 18C14.2091 18 16 15.7614 16 13C16 10 12 6 12 6Z"
              fill={visual.primaryColor}
              opacity={0.8}
            />
          </Animated.View>
          {/* Core */}
          <Circle cx="12" cy="14" r="2" fill="#FFFFFF" opacity={state === 'dead' ? 0 : 0.5} />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  compactContainer: {
    overflow: 'visible',
  },
  glow: {
    position: 'absolute',
  },
  flameContainer: {
    position: 'absolute',
  },
  particle: {
    position: 'absolute',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  ember: {
    position: 'absolute',
    alignSelf: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
});
