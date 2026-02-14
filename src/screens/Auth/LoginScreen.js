import React, { useState, useContext } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  useColorScheme,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LinearGradient from "react-native-linear-gradient";
import { useTheme } from "@react-navigation/native";
import * as Animatable from "react-native-animatable";
import { AuthContext } from "../../AuthContext/AuthContext";
import { registerOrLogin } from "../../api/api";
import GlobalText from "../../theme/GlobalText";

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const { colors } = useTheme();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
 
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleNext = () => {
    if (name.length < 2 || phone.length !== 10) {
      setErrorMessage("Please enter a valid name and 10-digit phone number");
      return;
    }
    setErrorMessage("");
    setStep(2);
  };

  const handleAuth = async () => {
    if (password.length < 4) {
      setErrorMessage("Password must be at least 4 characters");
      return;
    }
    try {
      setLoading(true);
      const res = await registerOrLogin({ name, phone: `+91${phone}`, password });

      // ✅ Save lightweight user info only (avoid large Base64 data)
      const { _id, name: userName, phone: userPhone } = res.user;
      await AsyncStorage.setItem("authToken", res.token);
      await AsyncStorage.setItem("user", JSON.stringify({ _id, name: userName, phone: userPhone }));

      await login(res.token);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const backgroundColor = isDark ? "#121212" : "#F9F9F9";
  const cardColor = isDark ? "#1E1E1E" : "#FFFFFF";
  const textColor = isDark ? "#FFFFFF" : "#000000";
  const placeholderColor = isDark ? "#AAAAAA" : "#777";

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={[styles.container, { backgroundColor }]}>
        <Animatable.View animation="fadeInUp" duration={800} style={{ flex: 1 }}>
          <Animatable.Text
            animation="pulse"
            iterationCount="infinite"
            duration={4000}
            style={[styles.logo, { color: "#20A68B" }]}
          >
            🌿 Sky Land Promoters
          </Animatable.Text>
          
{/* 
          <GlobalText style={[styles.tagline, { color: textColor }]}>
            India’s #1 Property Booking App
          </GlobalText> */}

          {step === 1 && (
            <Animatable.View animation="fadeInLeft" duration={600}>
              <GlobalText style={[styles.label, { color: textColor }]}>
                Log in or Sign up
              </GlobalText>

              <View style={[styles.inputRow, { backgroundColor: cardColor }]}>
                <Icon name="account" size={20} color={textColor} style={{ marginRight: 8 }} />
                <TextInput
                  style={[styles.textInput, { color: textColor }]}
                  placeholder="Enter your Name"
                  placeholderTextColor={placeholderColor}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={[styles.inputRow, { backgroundColor: cardColor }]}>
                <Icon name="phone" size={20} color={textColor} style={{ marginRight: 8 }} />
                <TextInput
                  style={[styles.textInput, { color: textColor }]}
                  placeholder="Phone Number"
                  placeholderTextColor={placeholderColor}
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={(val) => setPhone(val.replace(/[^0-9]/g, ""))}
                />
              </View>

              {errorMessage && <GlobalText style={styles.errorText}>{errorMessage}</GlobalText>}

              <TouchableOpacity
                disabled={phone.length !== 10 || name.length < 2}
                activeOpacity={0.8}
                onPress={handleNext}
              >
                <LinearGradient
                  colors={["#43C6AC", "#20A68B"]}
                  style={[
                    styles.primaryBtn,
                    { opacity: phone.length === 10 && name.length > 1 ? 1 : 0.6 },
                  ]}
                >
                  <GlobalText style={styles.btnText}>Continue</GlobalText>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate("QuickLogin")}>
                <GlobalText style={[styles.quickLoginText, { color: "#20A68B" }]}>
                  Already a user? Quick Login →
                </GlobalText>
              </TouchableOpacity>
            </Animatable.View>
          )}

          {step === 2 && (
            <Animatable.View animation="fadeInRight" duration={600}>
              <GlobalText style={[styles.label, { color: textColor }]}>
                Set or Enter your Password
              </GlobalText>

              <View style={[styles.inputRow, { backgroundColor: cardColor }]}>
                <Icon name="lock" size={20} color={textColor} style={{ marginRight: 8 }} />
                <TextInput
                  style={[styles.textInput, { color: textColor }]}
                  placeholder="Password"
                  placeholderTextColor={placeholderColor}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Icon name={showPassword ? "eye-off" : "eye"} size={22} color={textColor} />
                </TouchableOpacity>
              </View>

              {errorMessage && <GlobalText style={styles.errorText}>{errorMessage}</GlobalText>}

              <TouchableOpacity
                disabled={password.length < 4}
                activeOpacity={0.8}
                onPress={handleAuth}
              >
                <LinearGradient
                  colors={["#43C6AC", "#20A68B"]}
                  style={[
                    styles.primaryBtn,
                    { opacity: password.length >= 4 ? 1 : 0.6 },
                  ]}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <GlobalText style={styles.btnText}>Continue</GlobalText>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setStep(1)}>
                <GlobalText style={[styles.backText, { color: "#20A68B" }]}>
                  ← Go Back
                </GlobalText>
              </TouchableOpacity>
            </Animatable.View>
          )}

          <GlobalText style={[styles.policy, { color: textColor }]}>
            By continuing, you agree to our{" "}
            <GlobalText style={[styles.link, { color: "#20A68B" }]}>
              Terms of Service
            </GlobalText>{" "}
            and{" "}
            <GlobalText style={[styles.link, { color: "#20A68B" }]}>
              Privacy Policy
            </GlobalText>
          </GlobalText>
        </Animatable.View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  logo: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    marginTop: 150,
  },
  tagline: { fontSize: 14, textAlign: "center", marginBottom: 25 },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 10, textAlign: "center" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 10,
    marginBottom: 15,
    height: 50,
  },
  textInput: { flex: 1, fontSize: 16 },
  primaryBtn: {
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    paddingVertical: 14,
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "600", textAlign: "center" },
  quickLoginText: {
    marginTop: 15,
    fontSize: 14,
    textAlign: "center",
    fontWeight: "600",
  },
  backText: {
    marginTop: 15,
    fontSize: 14,
    textAlign: "center",
    fontWeight: "600",
  },
  policy: { marginTop: 20, fontSize: 12, textAlign: "center" },
  link: { fontWeight: "600" },
  errorText: { color: "#E53935", textAlign: "center", marginBottom: 10, fontSize: 13 },
});
