import React, { useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import * as Animatable from "react-native-animatable";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useTheme } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import GlobalText from "../../theme/GlobalText"; // ✅ Import GlobalText

const { width } = Dimensions.get("window");

export default function SuccessScreen({ navigation }) {
  const { colors } = useTheme();

  useEffect(() => {
    const t = setTimeout(() => navigation.replace("Home"), 3000);
    return () => clearTimeout(t);
  }, [navigation]);

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      {/* ✅ Checkmark Animation */}
      <Animatable.View animation="zoomIn" duration={1000} style={styles.circle}>
        <Icon name="check-circle" size={80} color="#fff" />
      </Animatable.View>

      {/* ✅ Texts */}
      <GlobalText bold style={styles.title}>
        Property Added Successfully!
      </GlobalText>
      <GlobalText style={styles.subtitle}>Your property is now live 🎉</GlobalText>

      {/* ✅ Gradient Button */}
      <TouchableOpacity onPress={() => navigation.replace("Home")}>
        <LinearGradient
          colors={["#ffffff", "#e3fcef"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.button}
        >
          <GlobalText bold style={[styles.buttonText, { color: colors.primary }]}>
            Go Home
          </GlobalText>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  circle: {
    width: width * 0.35,
    height: width * 0.35,
    borderRadius: (width * 0.35) / 2,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
  },
  title: {
    fontSize: 22,
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: "#fff",
    marginBottom: 30,
    textAlign: "center",
  },
  button: {
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 40,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    textAlign: "center",
  },
});
