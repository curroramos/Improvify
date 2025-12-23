import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  ViewToken,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import LottieView from 'lottie-react-native';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');

interface Slide {
  id: string;
  translationKey: 'welcome' | 'challenges' | 'progress';
  gradient: readonly [string, string, string];
  icon: keyof typeof MaterialIcons.glyphMap;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  animation: any;
}

const slides: Slide[] = [
  {
    id: '1',
    translationKey: 'welcome',
    gradient: ['#667eea', '#764ba2', '#6B73FF'] as const,
    icon: 'auto-awesome',
    animation: require('../../../assets/animations/welcome-animation.json'),
  },
  {
    id: '2',
    translationKey: 'challenges',
    gradient: ['#11998e', '#38ef7d', '#23D5AB'] as const,
    icon: 'emoji-events',
    animation: require('../../../assets/animations/challenge-animation.json'),
  },
  {
    id: '3',
    translationKey: 'progress',
    gradient: ['#FC466B', '#3F5EFB', '#C471ED'] as const,
    icon: 'insights',
    animation: require('../../../assets/animations/progress-animation.json'),
  },
];

export default function OnboardingScreen() {
  const { t } = useTranslation('onboarding');
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<Animated.FlatList<Slide>>(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const viewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }, []);

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem('hasOnboarded', 'true');
      router.replace('/auth/signup');
    } catch {
      router.replace('/auth/signup');
    }
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      handleComplete();
    }
  };

  const isLastSlide = currentIndex === slides.length - 1;

  const renderSlide = ({ item, index }: { item: Slide; index: number }) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0, 1, 0],
      extrapolate: 'clamp',
    });

    const translateY = scrollX.interpolate({
      inputRange,
      outputRange: [60, 0, 60],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.slide}>
        <LinearGradient
          colors={item.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Decorative circles */}
        <View style={styles.decorativeContainer}>
          <Animated.View
            style={[styles.decorativeCircle, styles.circle1, { transform: [{ scale }] }]}
          />
          <Animated.View
            style={[styles.decorativeCircle, styles.circle2, { transform: [{ scale }] }]}
          />
          <Animated.View
            style={[styles.decorativeCircle, styles.circle3, { transform: [{ scale }] }]}
          />
        </View>

        <Animated.View
          style={[
            styles.content,
            {
              opacity,
              transform: [{ translateY }],
              paddingTop: insets.top + 20,
            },
          ]}
        >
          {/* Icon Badge */}
          <View style={styles.iconBadge}>
            <MaterialIcons name={item.icon} size={28} color="#fff" />
          </View>

          {/* Animation */}
          <View style={styles.animationContainer}>
            <LottieView source={item.animation} autoPlay loop style={styles.animation} />
          </View>

          {/* Text Content */}
          <View style={styles.textContent}>
            <Text style={styles.subtitle}>{t(`slides.${item.translationKey}.subtitle`)}</Text>
            <Text style={styles.title}>{t(`slides.${item.translationKey}.title`)}</Text>
            <View style={styles.descriptionCard}>
              <Text style={styles.description}>
                {t(`slides.${item.translationKey}.description`)}
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Background gradient for current slide */}
      <LinearGradient
        colors={slides[currentIndex].gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: true,
        })}
        scrollEventThrottle={16}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
      />

      {/* Bottom Controls */}
      <View style={[styles.controls, { paddingBottom: insets.bottom + 20 }]}>
        {/* Skip Button */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleComplete}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.skipText}>{isLastSlide ? '' : t('skip')}</Text>
        </TouchableOpacity>

        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {slides.map((_, index) => {
            const isActive = index === currentIndex;
            return (
              <View
                key={index}
                style={[styles.dot, isActive ? styles.dotActive : styles.dotInactive]}
              />
            );
          })}
        </View>

        {/* Next/Get Started Button */}
        <TouchableOpacity
          style={[styles.nextButton, isLastSlide && styles.getStartedButton]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          {isLastSlide ? (
            <Text style={styles.getStartedText}>{t('getStarted')}</Text>
          ) : (
            <MaterialIcons name="arrow-forward" size={24} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  slide: {
    width,
    height,
    justifyContent: 'flex-start',
  },
  decorativeContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  circle1: {
    width: width * 0.8,
    height: width * 0.8,
    top: -width * 0.2,
    right: -width * 0.3,
  },
  circle2: {
    width: width * 0.6,
    height: width * 0.6,
    bottom: height * 0.15,
    left: -width * 0.3,
  },
  circle3: {
    width: width * 0.4,
    height: width * 0.4,
    bottom: height * 0.4,
    right: -width * 0.1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  animationContainer: {
    width: width * 0.75,
    height: width * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  textContent: {
    alignItems: 'center',
    paddingHorizontal: 16,
    maxWidth: 400,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 2.5,
    marginBottom: 12,
    textAlign: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 48,
    marginBottom: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  descriptionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  skipButton: {
    width: 80,
    height: 44,
    justifyContent: 'center',
  },
  skipText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 28,
    backgroundColor: '#fff',
  },
  dotInactive: {
    width: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  nextButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  getStartedButton: {
    width: 140,
    borderRadius: 28,
    backgroundColor: '#fff',
  },
  getStartedText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
});
