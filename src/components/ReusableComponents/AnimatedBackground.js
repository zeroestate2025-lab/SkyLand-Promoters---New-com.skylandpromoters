import React from "react";
import { Dimensions, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import * as Animatable from "react-native-animatable";

const { width, height } = Dimensions.get("window");

export default function AnimatedBackground() {
  return (
    <>
      {/* 🌊 Top Left Soft Glow */}
      <Animatable.View
        animation="pulse"
        iterationCount="infinite"
        duration={6000}
        easing="ease-in-out"
        style={[styles.wave, { top: -120, left: -70 }]}
      >
        <LinearGradient
          colors={["#43C6AC", "transparent"]} // same as login top gradient
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animatable.View>

      {/* 🌊 Bottom Right Soft Glow */}
      <Animatable.View
        animation="pulse"
        iterationCount="infinite"
        delay={2500}
        duration={6000}
        easing="ease-in-out"
        style={[styles.wave, { bottom: -120, right: -70 }]}
      >
        <LinearGradient
          colors={["#20A68B", "transparent"]} // same as login bottom gradient
          style={styles.gradient}
          start={{ x: 1, y: 1 }}
          end={{ x: 0, y: 0 }}
        />
      </Animatable.View>
    </>
  );
}

const styles = StyleSheet.create({
  wave: {
    position: "absolute",
    width: width * 1.5,
    height: height * 0.7,
    borderRadius: width,
    opacity: 0.4, // reduced for subtle effect
  },
  gradient: {
    flex: 1,
    borderRadius: 999,
  },
});
