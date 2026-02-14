import React, { useState, useContext } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  useColorScheme,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LinearGradient from "react-native-linear-gradient";
import { useTheme } from "@react-navigation/native";
import { AuthContext } from "../../AuthContext/AuthContext";
import { quickLogin } from "../../api/api";
import * as Animatable from "react-native-animatable";
import GlobalText from "../../theme/GlobalText";

export default function QuickLoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const { colors } = useTheme();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState("error");
  const [alertMessage, setAlertMessage] = useState("");

  const showAlert = (message, type = "error") => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
    setTimeout(() => setAlertVisible(false), 2000);
  };

  const handleQuickLogin = async () => {
    if (phone.length !== 10) {
      showAlert("Please enter a valid 10-digit phone number");
      return;
    }

    try {
      setLoading(true);
      const res = await quickLogin(`+91${phone}`);

      // ✅ Store only essential user info (avoid Base64 heavy data)
      const { _id, name, phone: userPhone } = res.user;
      await AsyncStorage.setItem("authToken", res.token);
      await AsyncStorage.setItem("user", JSON.stringify({ _id, name, phone: userPhone }));

      await login(res.token);
      showAlert("Login successful!", "success");
    } catch (err) {
      showAlert(err.response?.data?.message || "Quick login failed");
    } finally {
      setLoading(false);
    }
  };

  const bg = isDark ? "#121212" : "#F9F9F9";
  const card = isDark ? "#1E1E1E" : "#FFFFFF";
  const text = isDark ? "#FFFFFF" : "#000000";
  const placeholder = isDark ? "#AAA" : "#666";

  return (
    <Animatable.View animation="fadeInUp" style={[styles.container, { backgroundColor: bg }]}>
      <GlobalText bold style={[styles.logo, { color: "#20A68B" }]}>
        🌿 Sky Land Promoters
      </GlobalText>

      <GlobalText bold style={[styles.title, { color: text }]}>Quick Login</GlobalText>
      <GlobalText style={[styles.subtitle, { color: text }]}>
        Enter your registered phone number
      </GlobalText>

      <View style={[styles.inputRow, { backgroundColor: card }]}>
        <Icon name="phone" size={20} color={text} style={{ marginRight: 8 }} />
        <TextInput
          style={[styles.textInput, { color: text }]}
          placeholder="Phone Number"
          placeholderTextColor={placeholder}
          keyboardType="phone-pad"
          maxLength={10}
          value={phone}
          onChangeText={(val) => setPhone(val.replace(/[^0-9]/g, ""))}
        />
      </View>

      <TouchableOpacity disabled={phone.length !== 10} activeOpacity={0.8} onPress={handleQuickLogin}>
        <LinearGradient
          colors={["#43C6AC", "#20A68B"]}
          style={[styles.primaryBtn, { opacity: phone.length === 10 ? 1 : 0.6 }]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <GlobalText medium style={styles.btnText}>
              Quick Login
            </GlobalText>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <GlobalText style={[styles.policy, { color: text }]}>
        By continuing, you agree to our{" "}
        <GlobalText style={[styles.link, { color: "#20A68B" }]}>Terms of Service</GlobalText> and{" "}
        <GlobalText style={[styles.link, { color: "#20A68B" }]}>Privacy Policy</GlobalText>
      </GlobalText>

      {/* ✅ Alert Modal */}
      <Modal transparent visible={alertVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <Animatable.View
            animation="zoomIn"
            duration={400}
            style={[
              styles.alertBox,
              {
                backgroundColor: card,
                borderLeftColor: alertType === "error" ? "#E53935" : "#20A68B",
              },
            ]}
          >
            <Icon
              name={alertType === "error" ? "alert-circle" : "check-circle"}
              size={30}
              color={alertType === "error" ? "#E53935" : "#20A68B"}
              style={{ marginBottom: 8 }}
            />
            <GlobalText
              style={[
                styles.alertText,
                { color: alertType === "error" ? "#E53935" : "#20A68B" },
              ]}
            >
              {alertMessage}
            </GlobalText>
          </Animatable.View>
        </View>
      </Modal>
    </Animatable.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  logo: { fontSize: 28, marginBottom: 20, textAlign: "center" },
  title: { fontSize: 22, marginBottom: 10, textAlign: "center" },
  subtitle: { fontSize: 14, marginBottom: 20, textAlign: "center" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 10,
    marginBottom: 20,
    height: 50,
  },
  textInput: { flex: 1, fontSize: 16 },
  primaryBtn: { paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  btnText: { color: "#fff", fontSize: 16 },
  policy: { marginTop: 20, fontSize: 12, textAlign: "center" },
  link: { fontWeight: "600" },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  alertBox: {
    width: "80%",
    borderRadius: 14,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    borderLeftWidth: 5,
  },
  alertText: { fontSize: 15, fontWeight: "600", textAlign: "center" },
});
