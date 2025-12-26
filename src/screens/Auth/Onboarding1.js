import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Image,
  Animated,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Animatable from "react-native-animatable";
import GlobalText from "../../theme/GlobalText";

const { width, height } = Dimensions.get("window");

// ✅ Import your local images
import findProperty from "../../assets/images/find.png";
import verified from "../../assets/images/verified.png";
import booking from "../../assets/images/booking.png";

// ---------------------------------------------------------
// 🔹 COLOR PALETTE
// ---------------------------------------------------------
const COLORS = {
  primary: "#20A68B",
  primaryLight: "#43C6AC",
  secondary: "#2EB88E",
  white: "#FFFFFF",
  background: "#F0F4F3",
  text: "#2C3E50",
  textLight: "#666666",
};

export default function Onboarding1({ navigation }) {
  // ✅ All hooks at top level
  const [index, setIndex] = useState(0);
  const scrollViewRef = useRef(null);

  // Animation References
  const imageScale = useRef(new Animated.Value(0.8)).current;
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(50)).current;
  const textSlide = useRef(new Animated.Value(50)).current;
  const buttonScale = useRef(new Animated.Value(0)).current;
  const cardRotate = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  const slides = [
    {
      id: 1,
      title: "Find Your Dream Property",
      text: "Explore apartments, villas, and commercial spaces across India effortlessly.",
      image: findProperty,
      icon: "🏡",
    },
    {
      id: 2,
      title: "Connect with Verified Owners",
      text: "Sky Land Promoters ensures transparency — directly connect with verified property owners.",
      image: verified,
      icon: "✓",
    },
    {
      id: 3,
      title: "Book with Confidence",
      text: "Secure, simple, and fast property booking experience with trusted listings.",
      image: booking,
      icon: "🔒",
    },
  ];

  // ✅ useEffect - Animations
  useEffect(() => {
    resetAnimations();
    startAnimations();
  }, [index]);

  // ✅ Animation reset function
  const resetAnimations = () => {
    imageScale.setValue(0.8);
    imageOpacity.setValue(0);
    titleSlide.setValue(50);
    textSlide.setValue(50);
    buttonScale.setValue(0);
    cardRotate.setValue(0);
  };

  // ✅ Animation start - Simple and reliable
  const startAnimations = () => {
    // Image Scale & Fade
    Animated.parallel([
      Animated.timing(imageScale, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(imageOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Title Slide
    Animated.timing(titleSlide, {
      toValue: 0,
      duration: 600,
      useNativeDriver: true,
      delay: 150,
    }).start();

    // Text Slide
    Animated.timing(textSlide, {
      toValue: 0,
      duration: 600,
      useNativeDriver: true,
      delay: 300,
    }).start();

    // Button Scale
    Animated.timing(buttonScale, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
      delay: 450,
    }).start();

    // Card Rotation
    Animated.sequence([
      Animated.timing(cardRotate, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(cardRotate, {
        toValue: 0.95,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Float Animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // ✅ Handle Next
  const handleNext = async () => {
    if (index < slides.length - 1) {
      setIndex(index + 1);
    } else {
      try {
        await AsyncStorage.setItem("onboardingSeen", "true");
        navigation.navigate("Login");
      } catch (error) {
        console.error("AsyncStorage error:", error);
      }
    }
  };

  // ✅ Handle Previous
  const handlePrevious = () => {
    if (index > 0) {
      setIndex(index - 1);
    }
  };

  // ✅ Handle Skip
  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem("onboardingSeen", "true");
      navigation.replace("Login");
    } catch (error) {
      console.error("AsyncStorage error:", error);
    }
  };

  // Interpolations
  const floatInterpolate = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  const rotateInterpolate = cardRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["3deg", "-1deg"],
  });

  const titleOpacity = titleSlide.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0],
  });

  const textOpacity = textSlide.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0],
  });

  return (
    <View style={styles.container}>
      {/* ✅ COMPACT Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Animatable.Text
          animation="fadeInDown"
          duration={600}
          style={styles.logo}
        >
          🌿 Sky Land Promoters
        </Animatable.Text>
      </LinearGradient>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            { width: `${((index + 1) / slides.length) * 100}%` },
          ]}
        />
      </View>

      {/* Slides Container */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        contentOffset={{ x: index * width, y: 0 }}
        style={styles.slidesContainer}
      >
        {slides.map((slide, slideIndex) => (
          <View key={slide.id} style={[styles.slide, { width }]}>
            {/* Slide Card */}
            <Animated.View
              style={[
                styles.slideCard,
                {
                  transform: [
                    { scale: imageScale },
                    { rotate: rotateInterpolate },
                  ],
                },
              ]}
            >
              {/* Icon Badge */}
              <Animatable.View
                animation="pulse"
                iterationCount="infinite"
                duration={2000}
                style={[
                  styles.iconBadge,
                  {
                    backgroundColor:
                      slideIndex === 0
                        ? "#FFF4E6"
                        : slideIndex === 1
                        ? "#E8F5E9"
                        : "#E3F2FD",
                  },
                ]}
              >
                <GlobalText style={styles.badgeIcon}>
                  {slide.icon}
                </GlobalText>
              </Animatable.View>

              {/* Image */}
              <Animated.Image
                source={slide.image}
                style={[
                  styles.image,
                  {
                    opacity: imageOpacity,
                    transform: [{ translateY: floatInterpolate }],
                  },
                ]}
              />
            </Animated.View>

            {/* Content */}
            <View style={styles.contentContainer}>
              {/* Title */}
              <Animated.View
                style={[
                  styles.titleContainer,
                  {
                    transform: [{ translateY: titleSlide }],
                    opacity: titleOpacity,
                  },
                ]}
              >
                <GlobalText style={styles.title}>{slide.title}</GlobalText>
              </Animated.View>

              {/* Text */}
              <Animated.View
                style={[
                  styles.textContainer,
                  {
                    transform: [{ translateY: textSlide }],
                    opacity: textOpacity,
                  },
                ]}
              >
                <GlobalText style={styles.text}>{slide.text}</GlobalText>
              </Animated.View>

              {/* Features List */}
              <Animatable.View
                animation="fadeInUp"
                duration={700}
                delay={350}
                style={styles.featuresContainer}
              >
                <View style={styles.feature}>
                  <View style={styles.featureDot} />
                  <GlobalText style={styles.featureText}>Fast</GlobalText>
                </View>
                <View style={styles.feature}>
                  <View style={styles.featureDot} />
                  <GlobalText style={styles.featureText}>Verified</GlobalText>
                </View>
                <View style={styles.feature}>
                  <View style={styles.featureDot} />
                  <GlobalText style={styles.featureText}>Secure</GlobalText>
                </View>
              </Animatable.View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Indicator Dots */}
      <Animatable.View
        animation="fadeIn"
        duration={500}
        delay={150}
        style={styles.dotsContainer}
      >
        {slides.map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i === index ? COLORS.primary : "#DDD",
                width: i === index ? 28 : 8,
              },
            ]}
          />
        ))}
      </Animatable.View>

      {/* Navigation Buttons */}
      <View style={styles.buttonsContainer}>
        {index > 0 ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handlePrevious}
            style={styles.prevButton}
          >
            <GlobalText style={styles.prevButtonText}>← Back</GlobalText>
          </TouchableOpacity>
        ) : (
          <View style={styles.prevButtonPlaceholder} />
        )}

        <Animated.View
          style={[
            styles.buttonWrapper,
            {
              transform: [{ scale: buttonScale }],
            },
          ]}
        >
          <TouchableOpacity activeOpacity={0.85} onPress={handleNext}>
            <LinearGradient
              colors={[COLORS.primaryLight, COLORS.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.button}
            >
              <GlobalText style={styles.buttonText}>
                {index === slides.length - 1 ? "Get Started 🚀" : "Next →"}
              </GlobalText>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Skip Button */}
      {index < slides.length - 1 && (
        <Animatable.View
          animation="fadeIn"
          duration={400}
          delay={200}
        >
          <TouchableOpacity onPress={handleSkip}>
            <GlobalText style={styles.skip}>Skip</GlobalText>
          </TouchableOpacity>
        </Animatable.View>
      )}

      {/* Slide Counter */}
      <Animatable.View
        animation="fadeIn"
        duration={400}
        delay={250}
        style={styles.slideCounter}
      >
        <GlobalText style={styles.counterText}>
          {index + 1}/{slides.length}
        </GlobalText>
      </Animatable.View>
    </View>
  );
}

// ---------------------------------------------------------
// 🔹 OPTIMIZED STYLES
// ---------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    justifyContent: "space-between",
  },

  // ✅ COMPACT Header - Reduced padding
  header: {
    width: "100%",
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  logo: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.white,
    letterSpacing: 0.3,
  },

  // Progress Bar
  progressBarContainer: {
    width: "100%",
    height: 3,
    backgroundColor: "#EEE",
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: COLORS.primary,
  },

  // Slides
  slidesContainer: {
    flex: 1,
  },
  slide: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  slideCard: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 25,
  },

  // Icon Badge
  iconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  badgeIcon: {
    fontSize: 32,
  },

  // Image
  image: {
    width: width * 0.5,
    height: width * 0.6,
    resizeMode: "contain",
  },

  // Content
  contentContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  titleContainer: {
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.primary,
    textAlign: "center",
    letterSpacing: 0.2,
  },
  textContainer: {
    marginBottom: 15,
  },
  text: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: "center",
    lineHeight: 21,
    paddingHorizontal: 10,
  },

  // Features
  featuresContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginTop: 12,
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  featureText: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: "500",
  },

  // Dots
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },

  // Buttons
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  prevButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    alignItems: "center",
    minWidth: 70,
  },
  prevButtonPlaceholder: {
    minWidth: 70,
  },
  prevButtonText: {
    color: COLORS.primary,
    fontWeight: "600",
    fontSize: 12,
  },
  buttonWrapper: {
    flex: 1,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.2,
  },

  // Skip
  skip: {
    color: COLORS.primary,
    fontWeight: "600",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 8,
  },

  // Counter
  slideCounter: {
    position: "absolute",
    top: 24,
    right: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: `${COLORS.primary}12`,
  },
  counterText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.primary,
  },
});

// import React, { useState } from "react";
// import {
//   View,
//   StyleSheet,
//   TouchableOpacity,
//   Dimensions,
//   ScrollView,
//   Image,
// } from "react-native";
// import LinearGradient from "react-native-linear-gradient";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as Animatable from "react-native-animatable";
// import GlobalText from "../../theme/GlobalText"; // ✅ global font

// const { width } = Dimensions.get("window");

// // ✅ Import your local images here
// import findProperty from "../../assets/images/find.png";
// import verified from "../../assets/images/verified.png";
// import booking from "../../assets/images/booking.png";

// export default function Onboarding1({ navigation }) {
//   const slides = [
//     {
//       id: 1,
//       title: "Find Your Dream Property",
//       text: "Explore apartments, villas, and commercial spaces across India effortlessly.",
//       image: findProperty,
//     },
//     {
//       id: 2,
//       title: "Connect with Verified Owners",
//       text: "Sky Land Promoters ensures transparency — directly connect with verified property owners.",
//       image: verified,
//     },
//     {
//       id: 3,
//       title: "Book with Confidence",
//       text: "Secure, simple, and fast property booking experience with trusted listings.",
//       image: booking,
//     },
//   ];

//   const [index, setIndex] = useState(0);

//   const handleNext = async () => {
//     if (index < slides.length - 1) {
//       setIndex(index + 1);
//     } else {
//       await AsyncStorage.setItem("onboardingSeen", "true");
//       navigation.navigate("Login"); // ✅ Redirect to Login
//     }
//   };

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <LinearGradient colors={["#ffffff", "#ffffff"]} style={styles.header}>
//         <Animatable.Text animation="fadeInDown" style={styles.logo}>
//           🌿 Sky Land Promoters
//         </Animatable.Text>
//       </LinearGradient>

//       {/* Slides */}
//       <ScrollView
//         horizontal
//         pagingEnabled
//         showsHorizontalScrollIndicator={false}
//         scrollEnabled={false}
//         contentOffset={{ x: index * width, y: 0 }}
//       >
//         {slides.map((slide) => (
//           <View key={slide.id} style={[styles.slide, { width }]}>
//             <Animatable.Image
//               source={slide.image}
//               style={styles.image}
//               animation="zoomIn"
//               duration={800}
//             />
//             <Animatable.View animation="fadeInUp" duration={800}>
//               <GlobalText style={styles.title}>{slide.title}</GlobalText>
//               <GlobalText style={styles.text}>{slide.text}</GlobalText>
//             </Animatable.View>
//           </View>
//         ))}
//       </ScrollView>

//       {/* Dots */}
//       <View style={styles.dotsContainer}>
//         {slides.map((_, i) => (
//           <View
//             key={i}
//             style={[
//               styles.dot,
//               { backgroundColor: i === index ? "#20A68B" : "#ccc" },
//             ]}
//           />
//         ))}
//       </View>

//       {/* Next Button */}
//       <TouchableOpacity activeOpacity={0.9} onPress={handleNext}>
//         <LinearGradient colors={["#43C6AC", "#20A68B"]} style={styles.button}>
//           <GlobalText style={styles.buttonText}>
//             {index === slides.length - 1 ? "Get Started" : "Next →"}
//           </GlobalText>
//         </LinearGradient>
//       </TouchableOpacity>

//       {/* Skip Button */}
//       {index < slides.length - 1 && (
//         <TouchableOpacity
//           onPress={async () => {
//             await AsyncStorage.setItem("onboardingSeen", "true");
//             navigation.replace("Login");
//           }}
//         >
//           <GlobalText style={styles.skip}>Skip</GlobalText>
//         </TouchableOpacity>
//       )}
//     </View>
//   );
// }

// // ✅ STYLES
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingBottom: 30,
//   },
//   header: {
//     width: "100%",
//     paddingVertical: 25,
//     alignItems: "center",
//     borderBottomLeftRadius: 25,
//     borderBottomRightRadius: 25,
//     elevation: 4,
//   },
//   logo: {
//     fontSize: 26,
//     fontWeight: "700",
//     color: "#20A68B",
//     letterSpacing: 0.5,
//   },
//   slide: {
//     alignItems: "center",
//     justifyContent: "center",
//     paddingHorizontal: 25,
//   },
//   image: {
//     width: width * 0.5,
//     height: width * 0.7,
//     resizeMode: "contain",
//     marginVertical: 30,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: "700",
//     color: "#20A68B",
//     textAlign: "center",
//     marginBottom: 10,
//   },
//   text: {
//     fontSize: 14,
//     color: "#555",
//     textAlign: "center",
//     lineHeight: 22,
//   },
//   dotsContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 15,
//   },
//   dot: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     marginHorizontal: 5,
//   },
//   button: {
//     width: width * 0.8,
//     paddingVertical: 14,
//     borderRadius: 12,
//     alignItems: "center",
//   },
//   buttonText: {
//     color: "#fff",
//     fontWeight: "700",
//     fontSize: 16,
//   },
//   skip: {
//     color: "#20A68B",
//     fontWeight: "600",
//     marginTop: 12,
//   },
// });

