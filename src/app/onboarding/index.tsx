import React, { useRef, useState } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

// Slide data
const slides = [
  {
    id: '1',
    title: 'Welcome to Improvify',
    description: 'Grow daily with reflections, challenges, and measurable progress.',
    image: 'https://picsum.photos/800/1200?random=1', // Replace w/ real image
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
  const router = useRouter(); // We'll use router to redirect after onboarding

  const updateCurrentSlideIndex = (e: any) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setCurrentSlideIndex(currentIndex);
  };

  const goToNextSlide = () => {
    const nextSlideIndex = currentSlideIndex + 1;
    if (nextSlideIndex < slides.length) {
      const offset = nextSlideIndex * width;
      flatListRef.current?.scrollToOffset({ offset });
      setCurrentSlideIndex(nextSlideIndex);
    }
  };

  const skipToLastSlide = () => {
    const lastSlideIndex = slides.length - 1;
    const offset = lastSlideIndex * width;
    flatListRef.current?.scrollToOffset({ offset });
    setCurrentSlideIndex(lastSlideIndex);
  };

  const handleGetStarted = async () => {
    // Mark onboarding as complete
    await AsyncStorage.setItem('hasOnboarded', 'true');
    // Then push to login. 
    // Because of the "redirect" rules, you could also just call router.replace('/auth/login').
    router.replace('/auth/login');
  };

  const renderFooter = () => {
    return (
      <View style={styles.footerContainer}>
        {/* Pagination dots */}
        <View style={styles.indicators}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                currentSlideIndex === index && {
                  backgroundColor: '#333',
                  width: 20,
                },
              ]}
            />
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          {currentSlideIndex === slides.length - 1 ? (
            // Final Slide => "Get Started" button
            <TouchableOpacity style={styles.btn} onPress={handleGetStarted}>
              <Text style={styles.btnText}>Get Started</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity style={[styles.btn, styles.btnOutline]} onPress={skipToLastSlide}>
                <Text style={[styles.btnText, { color: '#333' }]}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btn} onPress={goToNextSlide}>
                <Text style={styles.btnText}>Next</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  const renderItem = ({ item }: { item: typeof slides[0] }) => (
    <View style={styles.slide}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
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
        onMomentumScrollEnd={updateCurrentSlideIndex}
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
      />
      {renderFooter()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    height,
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
    marginTop: 20,
  },
  indicator: {
    height: 6,
    width: 6,
    backgroundColor: '#ccc',
    marginHorizontal: 3,
    borderRadius: 3,
  },
  buttonsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-evenly',
  },
  btn: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  btnOutline: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#333',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
  },
});
