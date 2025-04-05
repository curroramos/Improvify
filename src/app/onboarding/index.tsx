import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Welcome to Improvify',
    description: 'Grow daily with reflections, challenges, and measurable progress.',
    image: 'https://picsum.photos/800/1200?random=1',
  },
  {
    id: '2',
    title: 'Personalized Challenges',
    description: 'Get 3 tailored challenges every day to boost your personal growth.',
    image: 'https://picsum.photos/800/1200?random=2',
  },
  {
    id: '3',
    title: 'Track Your Progress',
    description: 'See your reflections, points, and achievements all in one place.',
    image: 'https://picsum.photos/800/1200?random=3',
  },
];

export default function OnboardingScreen() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  // Animation values
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (currentSlideIndex === slides.length - 1) {
      // Animate button in
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(buttonScale, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animation if user goes back
      buttonOpacity.setValue(0);
      buttonScale.setValue(0.8);
    }
  }, [currentSlideIndex, buttonOpacity, buttonScale]);

  const updateCurrentSlideIndex = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentSlideIndex(index);
  };

  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem('hasOnboarded', 'true');
      console.log('Onboarding completed, redirecting to login...');
      router.replace('/auth/login');
    } catch (err) {
      console.error('Error storing onboarding:', err);
    }
  };

  const renderSlide = ({ item }: { item: typeof slides[0] }) => (
    <View style={styles.slide}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  const Footer = () => (
    <View style={styles.footerContainer}>
      {currentSlideIndex === slides.length - 1 && (
        <Animated.View
          style={[
            styles.buttonWrapper,
            {
              opacity: buttonOpacity,
              transform: [{ scale: buttonScale }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.btn}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <Text style={styles.btnText}>Get Started</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
      <View style={styles.indicators}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              currentSlideIndex === index && styles.activeIndicator,
            ]}
          />
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        snapToInterval={width} // ensures consistent snapping on all platforms
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={updateCurrentSlideIndex}
        renderItem={renderSlide}
      />
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  slide: {
    width,
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: '80%',
    height: height * 0.4,
    resizeMode: 'cover',
    borderRadius: 8,
    marginTop: 30,
  },
  title: {
    marginTop: 30,
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  description: {
    marginTop: 15,
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 50,
    width,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  indicator: {
    height: 6,
    width: 6,
    backgroundColor: '#ccc',
    marginHorizontal: 3,
    borderRadius: 3,
  },
  activeIndicator: {
    backgroundColor: '#333',
    width: 20,
  },
  buttonWrapper: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  btn: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
    // subtle shadow for better appearance
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
