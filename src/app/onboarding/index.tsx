import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  SafeAreaView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import MaskedView from '@react-native-masked-view/masked-view';
import { useFonts, Poppins_700Bold, Poppins_400Regular } from '@expo-google-fonts/poppins';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Welcome to Improvify',
    subtitle: 'Your Personal Growth Journey',
    description: 'Grow daily with reflections, challenges, and measurable progress.',
    image: 'https://images.unsplash.com/photo-1552581234-26160f608093?q=80&w=2000',
    color: ['#4F46E5', '#7C3AED'],
    animation: require('../../../assets/animations/welcome-animation.json'),
    icon: 'self-improvement',
  },
  {
    id: '2',
    title: 'Daily Challenges',
    subtitle: 'Personalized for You',
    description: 'Get 3 tailored challenges every day to boost your personal growth journey.',
    image: 'https://images.unsplash.com/photo-1484863137850-59afcfe05386?q=80&w=2000',
    color: ['#10B981', '#059669'],
    animation: require('../../../assets/animations/challenge-animation.json'),
    icon: 'emoji-events',
  },
  {
    id: '3',
    title: 'Track Progress',
    subtitle: `See How Far You've Come`,
    description: 'Visualize your growth with beautiful charts and achievement badges.',
    image: 'https://images.unsplash.com/photo-1571331627305-b3603f4ef4a7?q=80&w=2000',
    color: ['#EC4899', '#DB2777'],
    animation: require('../../../assets/animations/progress-animation.json'),
    icon: 'insights',
  },
];

export default function OnboardingScreen() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  
  // Animation values
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  const [fontsLoaded] = useFonts({
    Poppins_700Bold,
    Poppins_400Regular,
  });
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
    
    if (currentSlideIndex === slides.length - 1) {
      // Animate button in
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 800,
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
  }, [currentSlideIndex]);

  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem('hasOnboarded', 'true');
      console.log('Onboarding completed, redirecting to login...');
      router.replace('/auth/signup');
    } catch (err) {
      console.error('Error storing onboarding:', err);
    }
  };

  const nextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      slidesRef.current?.scrollToIndex({ 
        index: currentSlideIndex + 1,
        animated: true 
      });
    } else {
      handleGetStarted();
    }
  };

  // Add proper type to the ref
  const slidesRef = useRef<Animated.FlatList>(null);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Set status bar to transparent */}
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <Animated.FlatList
        ref={slidesRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentSlideIndex(index);
        }}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width
          ];
          
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp'
          });
          
          const translateY = scrollX.interpolate({
            inputRange,
            outputRange: [50, 0, 50],
            extrapolate: 'clamp'
          });

          return (
            <View style={styles.slide}>
              <View style={styles.slideContent}>
                <View style={styles.iconContainer}>
                  <LinearGradient colors={item.color} style={styles.iconBackground}>
                    <MaterialIcons name={item.icon} size={40} color="#fff" />
                  </LinearGradient>
                </View>
          
                <View style={styles.contentContainer}>
                  <LottieView
                    source={item.animation}
                    autoPlay
                    loop
                    style={styles.animation}
                  />
          
                  <Animated.View
                    style={[
                      styles.textContainer,
                      { opacity, transform: [{ translateY }] },
                    ]}
                  >
                    <Text style={styles.subtitle}>{item.subtitle}</Text>
          
                    <MaskedView
                      maskElement={<Text style={styles.title}>{item.title}</Text>}
                    >
                      <LinearGradient
                        colors={item.color}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      >
                        <Text style={[styles.title, { opacity: 0 }]}>{item.title}</Text>
                      </LinearGradient>
                    </MaskedView>
          
                    <BlurView intensity={80} tint="dark" style={styles.descriptionContainer}>
                      <Text style={styles.description}>{item.description}</Text>
                    </BlurView>
                  </Animated.View>
                </View>
              </View>
            </View>
          );          
        }}
      />
      
      {/* Bottom Controls - Keep SafeAreaView here to protect from notches */}
      <SafeAreaView style={styles.controlsWrapper}>
        <View style={styles.controlsContainer}>
          {/* Skip button - Use empty View to maintain layout when hidden */}
          <View style={styles.skipButtonContainer}>
            {currentSlideIndex < slides.length - 1 && (
              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleGetStarted}
              >
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* Progress Indicators */}
          <View style={styles.indicators}>
            {slides.map((_, index) => {
              const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
              
              const dotWidth = scrollX.interpolate({
                inputRange,
                outputRange: [8, 24, 8],
                extrapolate: 'clamp',
              });
              
              const backgroundColor = scrollX.interpolate({
                inputRange,
                outputRange: ['rgba(255, 255, 255, 0.4)', '#FFFFFF', 'rgba(255, 255, 255, 0.4)'],
                extrapolate: 'clamp',
              });

              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.indicator,
                    { width: dotWidth, backgroundColor }
                  ]}
                />
              );
            })}
          </View>
          
          {/* Next/Get Started Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.navigationButton,
                { backgroundColor: slides[currentSlideIndex].color[0] }
              ]}
              onPress={nextSlide}
              activeOpacity={0.8}
            >
              {currentSlideIndex < slides.length - 1 ? (
                <MaterialIcons name="arrow-forward" size={24} color="white" />
              ) : (
                <Text style={styles.getStartedText}>Get Started</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // Replace safeContainer with slideContent that goes edge to edge
  slideContent: {
    flex: 1,
    width: '100%',
    // Add padding for status bar to prevent content from going underneath it
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 30,
  },
  slide: {
    width,
    height: '100%',
  },
  contentContainer: {
    flex: 1,
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    // Adjust vertical position to move content up
    marginTop: -height * 0.05,
    marginBottom: 60,
  },
  animation: {
    width: width * 0.7,
    height: width * 0.65,
    marginBottom: 30,
  },
  textContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
    maxWidth: 500,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    marginBottom: 8,
    fontFamily: 'Poppins_400Regular',
    textTransform: 'uppercase',
    letterSpacing: 3,
  },
  title: {
    fontSize: 34,
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#fff',
  },
  descriptionContainer: {
    padding: 20,
    borderRadius: 16,
    marginTop: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  description: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Poppins_400Regular',
    lineHeight: 24,
  },
  controlsWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    backgroundColor: 'transparent', // Make sure it's transparent
  },
  controlsContainer: {
    paddingHorizontal: 20, 
    paddingVertical: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 50 : 40,
    marginTop: 20,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    height: 8,
    width: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  getStartedButton: {
    width: 120,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  navigationButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  getStartedText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins_700Bold',
  },
  skipButton: {
    padding: 10,
  },
  skipText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
  skipButtonContainer: {
    width: 60, // Match width with the button container on the right
    height: 60, // Ensure consistent height
    justifyContent: 'center',
  },
  iconContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 20 : 40,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
});