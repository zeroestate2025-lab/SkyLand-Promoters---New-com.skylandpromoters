import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Dimensions,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { useTheme } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import GlobalText from "../../theme/GlobalText";

const { width, height } = Dimensions.get("window");

// ---------------------------------------------------------
// 🔹 MINT-TEAL COLOR PALETTE
// ---------------------------------------------------------
const MINT_TEAL_COLORS = {
  primary: "#20A68B",        // Teal green - Primary
  primaryLight: "#43C6AC",   // Bright turquoise - Accent
  secondary: "#2EB88E",      // Mint green - Secondary
  white: "#FFFFFF",          // White text/elements
  background: "#F0F4F3",     // Light background
};

export default function SplashScreen({ navigation }) {
  // const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo Scale & Fade Animation
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Spinner Rotation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    const timer = setTimeout(() => {
      // navigation.replace("Onboarding1");
    }, 3500);

    return () => clearTimeout(timer);
  }, [navigation, scaleAnim, opacityAnim, slideAnim, rotateAnim]);

  const spinInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <LinearGradient
      colors={[MINT_TEAL_COLORS.primary, MINT_TEAL_COLORS.secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container]}
    >
      {/* 🌊 Background Animated Circles */}
      <Animatable.View
        animation="pulse"
        iterationCount="infinite"
        duration={3000}
        style={[
          styles.bgCircle1,
          {
            backgroundColor: `${MINT_TEAL_COLORS.primaryLight}20`,
          },
        ]}
      />
      <Animatable.View
        animation="pulse"
        iterationCount="infinite"
        duration={4000}
        delay={300}
        style={[
          styles.bgCircle2,
          {
            backgroundColor: `${MINT_TEAL_COLORS.white}10`,
          },
        ]}
      />

      {/* 🎯 Main Content Container */}
      <View style={styles.contentContainer}>
        {/* 🌿 Animated Logo Container */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim },
              ],
              opacity: opacityAnim,
            },
          ]}
        >
          {/* Logo Badge */}
          <View
            style={[
              styles.logoBadge,
              { backgroundColor: `${MINT_TEAL_COLORS.white}20` },
            ]}
          >
            <GlobalText style={styles.logoEmoji}>🌿</GlobalText>
          </View>

          {/* Brand Name */}
          <GlobalText
            bold
            style={[styles.logo, { color: MINT_TEAL_COLORS.white }]}
          >
            Sky Land Promoter
          </GlobalText>

          {/* Tagline */}
          <Animatable.Text
            animation="fadeInUp"
            delay={1200}
            style={[styles.tagline, { color: `${MINT_TEAL_COLORS.white}85` }]}
          >
            Find Your Dream Property
          </Animatable.Text>
        </Animated.View>

        {/* 🔄 Loading Indicator with Custom Spinner */}
        <Animatable.View
          animation="fadeIn"
          delay={1000}
          style={styles.loaderContainer}
        >
          <Animated.View
            style={[
              styles.customSpinner,
              {
                transform: [{ rotate: spinInterpolate }],
              },
            ]}
          >
            <View
              style={[
                styles.spinnerTrack,
                { borderColor: `${MINT_TEAL_COLORS.white}30` },
              ]}
            />
            <View
              style={[
                styles.spinnerFill,
                { borderTopColor: MINT_TEAL_COLORS.white },
              ]}
            />
          </Animated.View>

          {/* Loading Text */}
          <Animatable.Text
            animation="fadeInUp"
            delay={1400}
            style={[styles.loadingText, { color: `${MINT_TEAL_COLORS.white}70` }]}
          >
            Loading properties...
          </Animatable.Text>
        </Animatable.View>
      </View>

      {/* 📍 Bottom Brand Info */}
      <Animatable.View
        animation="fadeInUp"
        delay={1600}
        style={styles.footerContainer}
      >
        <GlobalText style={[styles.footerText, { color: `${MINT_TEAL_COLORS.white}60` }]}>
          Your Trusted Real Estate Partner
        </GlobalText>
      </Animatable.View>
    </LinearGradient>
  );
}

// ---------------------------------------------------------
// 🔹 STYLES
// ---------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },

  // Background Animated Circles
  bgCircle1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    top: -100,
    right: -50,
  },
  bgCircle2: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    bottom: -80,
    left: -50,
  },

  // Main Content
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },

  // Logo Container
  logoContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  logoBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#FFFFFF40",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  logoEmoji: {
    fontSize: 50,
  },
  logo: {
    fontSize: 36,
    letterSpacing: 1.2,
    textAlign: "center",
    fontWeight: "700",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.5,
    textAlign: "center",
    marginTop: 8,
  },

  // Loader Container
  loaderContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  customSpinner: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  spinnerTrack: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    position: "absolute",
  },
  spinnerFill: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderTopWidth: 4,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  loadingText: {
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.3,
    marginTop: 8,
  },

  // Footer
  footerContainer: {
    position: "absolute",
    bottom: 40,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    fontWeight: "400",
    letterSpacing: 0.2,
  },
});

// import React, { useEffect } from "react";
// import { View, StyleSheet, ActivityIndicator } from "react-native";
// import * as Animatable from "react-native-animatable";
// import { useTheme } from "@react-navigation/native";
// import GlobalText from "../../theme/GlobalText"; // ✅ Import global text

// export default function SplashScreen({ navigation }) {
//   const { colors } = useTheme();

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       // navigation.replace("Onboarding1");
//     }, 2000);
//     return () => clearTimeout(timer);
//   }, [navigation]);

//   return (
//     <View style={[styles.container, { backgroundColor: colors.primary }]}>
//       {/* 🌿 Animated Logo Text */}
//       <Animatable.View animation="fadeInDown" duration={1000}>
//         <GlobalText bold style={[styles.logo, { color: colors.background }]}>
//           🌿 Sky Land Promoter
//         </GlobalText>
//       </Animatable.View>

//       {/* 🔄 Loading Spinner */}
//       <ActivityIndicator
//         size="large"
//         color={colors.background}
//         style={{ marginTop: 20 }}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   logo: {
//     fontSize: 34,
//     letterSpacing: 1,
//     textAlign: "center",
//   },
// });
