import React, { useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  ImageBackground,
  useColorScheme,
  StyleSheet,
  Animated,
} from "react-native";
import { useNavigation, useTheme } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import LinearGradient from "react-native-linear-gradient";
import * as Animatable from "react-native-animatable";
import GlobalText from "../../theme/GlobalText";

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

export default function ChooseCategoryScreen() {
  // ✅ ALL HOOKS AT TOP LEVEL - NEVER CONDITIONAL
  const navigation = useNavigation();
  const scheme = useColorScheme();
  const { colors } = useTheme();
  const isDark = scheme === "dark";

  // ✅ ALL Animation References declared at top - RENAMED FOR BUY/RENT ORDER
  const buyCardScale = useRef(new Animated.Value(0.8)).current;
  const buyCardOpacity = useRef(new Animated.Value(0)).current;
  const rentCardScale = useRef(new Animated.Value(0.8)).current;
  const rentCardOpacity = useRef(new Animated.Value(0)).current;
  const buyIconRotate = useRef(new Animated.Value(0)).current;
  const rentIconRotate = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(50)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const buyCardSkew = useRef(new Animated.Value(0)).current;
  const rentCardSkew = useRef(new Animated.Value(0)).current;
  const buyPulse = useRef(new Animated.Value(1)).current;
  const rentPulse = useRef(new Animated.Value(1)).current;
  const bgGlow = useRef(new Animated.Value(0)).current;
  const dividerWidth = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(-50)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;

  // ✅ useEffect declared at top level with proper dependencies
  useEffect(() => {
    startAnimations();
  }, []); // Empty dependency array - runs once on mount

  // ✅ All color logic AFTER hooks
  const backgroundColor = isDark ? "#121212" : "#f9f9f9";
  const cardColor = isDark ? "#1E1E1E" : "#fff";
  const textColor = isDark ? "#EDEDED" : "#000";
  const accentColor = COLORS.primary;
  const subtitleColor = isDark ? "#A0A0A0" : "#555";

  // ✅ Animation function declared OUTSIDE of render - UPDATED FOR BUY FIRST
  const startAnimations = () => {
    // Title slide animation
    Animated.sequence([
      Animated.delay(0),
      Animated.parallel([
        Animated.timing(titleSlide, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Header animations
    Animated.parallel([
      Animated.timing(headerSlide, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Buy card animation with skew (FIRST - 300ms delay)
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(buyCardScale, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(buyCardOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(buyCardSkew, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false,
        }),
      ]),
    ]).start();

    // Rent card animation with skew (SECOND - 500ms delay)
    Animated.sequence([
      Animated.delay(500),
      Animated.parallel([
        Animated.timing(rentCardScale, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(rentCardOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(rentCardSkew, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false,
        }),
      ]),
    ]).start();

    // Icon rotations
    Animated.loop(
      Animated.timing(buyIconRotate, {
        toValue: 1,
        duration: 6000,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(rentIconRotate, {
        toValue: 1,
        duration: 6000,
        useNativeDriver: true,
      })
    ).start();

    // Buy card pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(buyPulse, {
          toValue: 1.02,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(buyPulse, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rent card pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(rentPulse, {
          toValue: 1.02,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(rentPulse, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Background glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bgGlow, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: false,
        }),
        Animated.timing(bgGlow, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: false,
        }),
      ])
    ).start();

    // Divider width animation
    Animated.sequence([
      Animated.delay(600),
      Animated.timing(dividerWidth, {
        toValue: 1,
        duration: 800,
        useNativeDriver: false,
      }),
    ]).start();
  };

  // ✅ Handle select function declared OUTSIDE of render
  const handleSelect = async (type) => {
    try {
      await AsyncStorage.setItem("selectedCategory", type);
      navigation.replace("Home", { selectedType: type });
    } catch (err) {
      console.error("Error saving category:", err);
    }
  };

  // Interpolations - UPDATED FOR BUY/RENT ORDER
  const buyIconRotateInterpolate = buyIconRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "-360deg"],
  });

  const rentIconRotateInterpolate = rentIconRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const headerTransform = headerSlide.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 50],
  });

  const buySkewInterpolate = buyCardSkew.interpolate({
    inputRange: [0, 1],
    outputRange: ["8deg", "0deg"],
  });

  const rentSkewInterpolate = rentCardSkew.interpolate({
    inputRange: [0, 1],
    outputRange: ["-8deg", "0deg"],
  });

  const bgGlowInterpolate = bgGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.4],
  });

  const dividerWidthInterpolate = dividerWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "60%"],
  });

  // ✅ NOW render - no hooks called after this point
  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <Animated.View
        style={[
          styles.headerContainer,
          {
            transform: [{ translateY: headerTransform }],
            opacity: headerOpacity,
          },
        ]}
      >
        <LinearGradient
          colors={isDark ? ["#114D44", "#0D3732"] : ["#43C6AC", "#20A68B"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <Animatable.Text
            animation="fadeInDown"
            duration={600}
            style={styles.headerSubtitle}
          >
            Welcome! 👋
          </Animatable.Text>
          <Animated.View
            style={[
              styles.titleWrapper,
              {
                transform: [{ translateX: titleSlide }],
                opacity: titleOpacity,
              },
            ]}
          >
            <GlobalText bold style={styles.headerTitle}>
              Choose Your Interest
            </GlobalText>
          </Animated.View>
          <Animatable.Text
            animation="fadeInUp"
            duration={600}
            delay={200}
            style={styles.headerDescription}
          >
            Rent or Buy - We have it all
          </Animatable.Text>
        </LinearGradient>
      </Animated.View>

      {/* Body */}
      <ImageBackground
        style={styles.bodyContainer}
        resizeMode="cover"
        imageStyle={{ opacity: 0.1 }}
      >
        {/* Background Circles with Glow */}
        <Animatable.View
          animation="pulse"
          iterationCount="infinite"
          duration={3000}
          style={[
            styles.bgCircle1,
            { backgroundColor: `${COLORS.primary}10` },
          ]}
        />
        <Animatable.View
          animation="pulse"
          iterationCount="infinite"
          duration={4000}
          delay={500}
          style={[
            styles.bgCircle2,
            { backgroundColor: `${COLORS.secondary}10` },
          ]}
        />

        {/* Glow Effect */}
        <Animated.View
          style={[
            styles.glowEffect,
            {
              opacity: bgGlowInterpolate,
            },
          ]}
        />

        {/* Cards Container - BUY FIRST, THEN RENT */}
        <View style={styles.cardsContainer}>
          {/* Buy Card - NOW FIRST */}
          <Animated.View
            style={[
              styles.cardWrapper,
              {
                transform: [
                  { scale: Animated.multiply(buyCardScale, buyPulse) },
                  { perspective: 1000 },
                ],
                opacity: buyCardOpacity,
              },
            ]}
          >
            <Animated.View
              style={[
                styles.cardTransform,
                {
                  transform: [{ skewY: buySkewInterpolate }],
                },
              ]}
            >
              <Animatable.View
                animation="slideInLeft"
                duration={700}
                delay={400}
                style={[
                  styles.card,
                  {
                    backgroundColor: cardColor,
                    borderColor: accentColor,
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.cardTouchable}
                  onPress={() => handleSelect("Sale")}
                  activeOpacity={0.85}
                >
                  {/* Glow background */}
                  <Animated.View
                    style={[
                      styles.cardGlow,
                      {
                        backgroundColor: `${COLORS.primaryLight}15`,
                      },
                    ]}
                  />

                  <Animated.View
                    style={[
                      styles.iconCircleWrapper,
                      {
                        transform: [{ rotate: buyIconRotateInterpolate }],
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={["#43C6AC", "#20A68B"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.iconCircle}
                    >
                      <Icon name="home" size={40} color={COLORS.white} />
                    </LinearGradient>
                  </Animated.View>

                  <Animatable.View
                    animation="fadeInUp"
                    duration={500}
                    delay={600}
                    style={styles.cardContent}
                  >
                    <GlobalText
                      bold
                      style={[styles.cardTitle, { color: textColor }]}
                    >
                      Buy
                    </GlobalText>
                    <GlobalText
                      style={[
                        styles.cardSubtitle,
                        { color: subtitleColor },
                      ]}
                    >
                      Discover dream homes
                    </GlobalText>
                  </Animatable.View>

                  <Animatable.View
                    animation="bounce"
                    iterationCount="infinite"
                    duration={1200}
                    style={styles.arrowIcon}
                  >
                    <Icon
                      name="arrow-right-bold-circle"
                      size={28}
                      color={COLORS.primaryLight}
                    />
                  </Animatable.View>
                </TouchableOpacity>
              </Animatable.View>
            </Animated.View>
          </Animated.View>

          {/* Rent Card - NOW SECOND */}
          <Animated.View
            style={[
              styles.cardWrapper,
              {
                transform: [
                  { scale: Animated.multiply(rentCardScale, rentPulse) },
                  { perspective: 1000 },
                ],
                opacity: rentCardOpacity,
              },
            ]}
          >
            <Animated.View
              style={[
                styles.cardTransform,
                {
                  transform: [{ skewY: rentSkewInterpolate }],
                },
              ]}
            >
              <Animatable.View
                animation="slideInRight"
                duration={700}
                delay={600}
                style={[
                  styles.card,
                  {
                    backgroundColor: cardColor,
                    borderColor: accentColor,
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.cardTouchable}
                  onPress={() => handleSelect("Rent")}
                  activeOpacity={0.85}
                >
                  {/* Glow background */}
                  <Animated.View
                    style={[
                      styles.cardGlow,
                      {
                        backgroundColor: `${COLORS.primary}15`,
                      },
                    ]}
                  />

                  <Animated.View
                    style={[
                      styles.iconCircleWrapper,
                      {
                        transform: [{ rotate: rentIconRotateInterpolate }],
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={["#20A68B", "#1F7A6B"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.iconCircle}
                    >
                      <Icon name="home-city" size={40} color={COLORS.white} />
                    </LinearGradient>
                  </Animated.View>

                  <Animatable.View
                    animation="fadeInUp"
                    duration={500}
                    delay={800}
                    style={styles.cardContent}
                  >
                    <GlobalText
                      bold
                      style={[styles.cardTitle, { color: textColor }]}
                    >
                      Rent
                    </GlobalText>
                    <GlobalText
                      style={[
                        styles.cardSubtitle,
                        { color: subtitleColor },
                      ]}
                    >
                      Find rental homes
                    </GlobalText>
                  </Animatable.View>

                  <Animatable.View
                    animation="bounce"
                    iterationCount="infinite"
                    duration={1200}
                    style={styles.arrowIcon}
                  >
                    <Icon
                      name="arrow-right-bold-circle"
                      size={28}
                      color={COLORS.primary}
                    />
                  </Animatable.View>
                </TouchableOpacity>
              </Animatable.View>
            </Animated.View>
          </Animated.View>
        </View>

        {/* Divider with width animation */}
        <Animated.View
          style={[
            styles.divider,
            {
              width: dividerWidthInterpolate,
            },
          ]}
        />
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: { overflow: "hidden" },
  headerGradient: {
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  headerSubtitle: {
    color: "#FFFFFF80",
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  titleWrapper: {
    marginVertical: 6,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 24,
    letterSpacing: 0.5,
  },
  headerDescription: {
    color: "#FFFFFFAA",
    fontSize: 11,
    fontWeight: "400",
    letterSpacing: 0.2,
  },
  bodyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    position: "relative",
  },
  bgCircle1: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    top: -50,
    right: -50,
  },
  bgCircle2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    bottom: -80,
    left: -50,
  },
  glowEffect: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: `${COLORS.primary}40`,
    top: "50%",
    left: "50%",
    marginLeft: -150,
    marginTop: -150,
  },

  // ✅ Cards Container for side-by-side layout
  cardsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    width: "100%",
    maxWidth: 450,
  },

  cardWrapper: {
    flex: 1,
    maxWidth: 180,
  },
  cardTransform: {},
  card: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 14,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    overflow: "hidden",
  },
  cardGlow: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  cardTouchable: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  iconCircleWrapper: { marginBottom: 10 },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  cardContent: { alignItems: "center", marginBottom: 10 },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  cardSubtitle: {
    fontSize: 11,
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "400",
  },
  arrowIcon: { marginTop: 8 },
  divider: {
    height: 2,
    backgroundColor: COLORS.primary,
    marginTop: 14,
  },
});
