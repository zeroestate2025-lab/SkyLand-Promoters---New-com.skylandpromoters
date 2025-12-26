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

// import React, { useState, useContext } from "react";
// import {
//   View,
//   TextInput,
//   StyleSheet,
//   TouchableOpacity,
//   ActivityIndicator,
//   Modal,
//   useColorScheme,
// } from "react-native";
// import Icon from "react-native-vector-icons/MaterialCommunityIcons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import LinearGradient from "react-native-linear-gradient";
// import { useTheme } from "@react-navigation/native";
// import { AuthContext } from "../../AuthContext/AuthContext";
// import { quickLogin } from "../../api/api";
// import * as Animatable from "react-native-animatable";
// import GlobalText from "../../theme/GlobalText";

// export default function QuickLoginScreen({ navigation }) {
//   const { login } = useContext(AuthContext);
//   const { colors } = useTheme();
//   const scheme = useColorScheme();
//   const isDark = scheme === "dark";

//   const [phone, setPhone] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertType, setAlertType] = useState("error");
//   const [alertMessage, setAlertMessage] = useState("");

//   const showAlert = (message, type = "error") => {
//     setAlertMessage(message);
//     setAlertType(type);
//     setAlertVisible(true);
//     setTimeout(() => setAlertVisible(false), 2000);
//   };

//   const handleQuickLogin = async () => {
//     if (phone.length !== 10) {
//       showAlert("Please enter a valid 10-digit phone number");
//       return;
//     }
//     try {
//       setLoading(true);
//       const res = await quickLogin(`+91${phone}`);
//       await AsyncStorage.setItem("authToken", res.token);
//       await AsyncStorage.setItem("user", JSON.stringify(res.user));
//       await login(res.token);
//       showAlert("Login successful!", "success");
//     } catch (err) {
//       showAlert(err.response?.data?.message || "Quick login failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const bg = isDark ? "#121212" : "#F9F9F9";
//   const card = isDark ? "#1E1E1E" : "#FFFFFF";
//   const text = isDark ? "#FFFFFF" : "#000000";
//   const placeholder = isDark ? "#AAA" : "#666";

//   return (
//     <Animatable.View animation="fadeInUp" style={[styles.container, { backgroundColor: bg }]}>
//       <GlobalText bold style={[styles.logo, { color: "#20A68B" }]}>
//         🌿 Zero Estate
//       </GlobalText>

//       <GlobalText bold style={[styles.title, { color: text }]}>Quick Login</GlobalText>
//       <GlobalText style={[styles.subtitle, { color: text }]}>
//         Enter your registered phone number
//       </GlobalText>

//       <View style={[styles.inputRow, { backgroundColor: card }]}>
//         <Icon name="phone" size={20} color={text} style={{ marginRight: 8 }} />
//         <TextInput
//           style={[styles.textInput, { color: text }]}
//           placeholder="Phone Number"
//           placeholderTextColor={placeholder}
//           keyboardType="phone-pad"
//           maxLength={10}
//           value={phone}
//           onChangeText={(val) => setPhone(val.replace(/[^0-9]/g, ""))}
//         />
//       </View>

//       <TouchableOpacity disabled={phone.length !== 10} activeOpacity={0.8} onPress={handleQuickLogin}>
//         <LinearGradient
//           colors={["#43C6AC", "#20A68B"]}
//           style={[styles.primaryBtn, { opacity: phone.length === 10 ? 1 : 0.6 }]}
//         >
//           {loading ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <GlobalText medium style={styles.btnText}>
//               Quick Login
//             </GlobalText>
//           )}
//         </LinearGradient>
//       </TouchableOpacity>

//       <GlobalText style={[styles.policy, { color: text }]}>
//         By continuing, you agree to our{" "}
//         <GlobalText style={[styles.link, { color: "#20A68B" }]}>Terms of Service</GlobalText> and{" "}
//         <GlobalText style={[styles.link, { color: "#20A68B" }]}>Privacy Policy</GlobalText>
//       </GlobalText>

//       <Modal transparent visible={alertVisible} animationType="fade">
//         <View style={styles.modalOverlay}>
//           <Animatable.View
//             animation="zoomIn"
//             duration={400}
//             style={[
//               styles.alertBox,
//               {
//                 backgroundColor: card,
//                 borderLeftColor: alertType === "error" ? "#E53935" : "#20A68B",
//               },
//             ]}
//           >
//             <Icon
//               name={alertType === "error" ? "alert-circle" : "check-circle"}
//               size={30}
//               color={alertType === "error" ? "#E53935" : "#20A68B"}
//               style={{ marginBottom: 8 }}
//             />
//             <GlobalText
//               style={[
//                 styles.alertText,
//                 {
//                   color: alertType === "error" ? "#E53935" : "#20A68B",
//                 },
//               ]}
//             >
//               {alertMessage}
//             </GlobalText>
//           </Animatable.View>
//         </View>
//       </Modal>
//     </Animatable.View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20, justifyContent: "center" },
//   logo: { fontSize: 28, marginBottom: 20, textAlign: "center" },
//   title: { fontSize: 22, marginBottom: 10, textAlign: "center" },
//   subtitle: { fontSize: 14, marginBottom: 20, textAlign: "center" },
//   inputRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderRadius: 12,
//     paddingHorizontal: 10,
//     marginBottom: 20,
//     height: 50,
//   },
//   textInput: { flex: 1, fontSize: 16 },
//   primaryBtn: { paddingVertical: 14, borderRadius: 12, alignItems: "center" },
//   btnText: { color: "#fff", fontSize: 16 },
//   policy: { marginTop: 20, fontSize: 12, textAlign: "center" },
//   link: { fontWeight: "600" },
//   modalOverlay: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(0,0,0,0.45)",
//   },
//   alertBox: {
//     width: "80%",
//     borderRadius: 14,
//     paddingVertical: 20,
//     paddingHorizontal: 16,
//     alignItems: "center",
//     borderLeftWidth: 5,
//   },
//   alertText: { fontSize: 15, fontWeight: "600", textAlign: "center" },
// });

// // import React, { useState, useContext } from "react";
// // import {
// //   View,
// //   TextInput,
// //   StyleSheet,
// //   TouchableOpacity,
// //   ActivityIndicator,
// //   Modal,
// // } from "react-native";
// // import Icon from "react-native-vector-icons/MaterialCommunityIcons";
// // import AsyncStorage from "@react-native-async-storage/async-storage";
// // import { useTheme } from "@react-navigation/native";
// // import { AuthContext } from "../../AuthContext/AuthContext";
// // import { quickLogin } from "../../api/api";
// // import * as Animatable from "react-native-animatable";
// // import GlobalText from "../../theme/GlobalText";

// // export default function QuickLoginScreen({ navigation }) {
// //   const { login } = useContext(AuthContext);
// //   const { colors, dark } = useTheme(); // 🌗 Theme-aware
// //   const [phone, setPhone] = useState("");
// //   const [loading, setLoading] = useState(false);
// //   const [alertVisible, setAlertVisible] = useState(false);
// //   const [alertType, setAlertType] = useState("error"); // "error" | "success"
// //   const [alertMessage, setAlertMessage] = useState("");

// //   // 🟢 Custom alert handler
// //   const showAlert = (message, type = "error") => {
// //     setAlertMessage(message);
// //     setAlertType(type);
// //     setAlertVisible(true);
// //     setTimeout(() => setAlertVisible(false), 2000);
// //   };

// //   // 🟢 Handle Quick Login
// //   const handleQuickLogin = async () => {
// //     if (phone.length !== 10) {
// //       showAlert("Please enter a valid 10-digit phone number");
// //       return;
// //     }

// //     try {
// //       setLoading(true);
// //       const res = await quickLogin(`+91${phone}`);

// //       await AsyncStorage.setItem("authToken", res.token);
// //       await AsyncStorage.setItem("user", JSON.stringify(res.user));
// //       await login(res.token);
// //       showAlert("Login successful!", "success");
// //     } catch (err) {
// //       showAlert(err.response?.data?.message || "Quick login failed");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <Animatable.View
// //       animation="fadeInUp"
// //       style={[styles.container, { backgroundColor: colors.background }]}
// //     >
// //       {/* 🌿 Logo */}
// //       <GlobalText bold style={[styles.logo, { color: colors.primary }]}>
// //         🌿 Zero Estate
// //       </GlobalText>

// //       {/* Title & Subtitle */}
// //       <GlobalText bold style={[styles.title, { color: colors.text }]}>
// //         Quick Login
// //       </GlobalText>
// //       <GlobalText style={[styles.subtitle, { color: colors.text }]}>
// //         Enter your registered phone number
// //       </GlobalText>

// //       {/* 📞 Input Field */}
// //       <View style={[styles.inputRow, { borderColor: colors.border }]}>
// //         <Icon name="phone" size={20} color={colors.text} style={{ marginRight: 8 }} />
// //         <TextInput
// //           style={[styles.textInput, { color: colors.text }]}
// //           placeholder="Phone Number"
// //           placeholderTextColor={dark ? "#aaa" : "#666"}
// //           keyboardType="phone-pad"
// //           maxLength={10}
// //           value={phone}
// //           onChangeText={(val) => setPhone(val.replace(/[^0-9]/g, ""))}
// //         />
// //       </View>

// //       {/* 🔘 Quick Login Button */}
// //       <TouchableOpacity
// //         style={[
// //           styles.primaryBtn,
// //           {
// //             backgroundColor: colors.primary,
// //             opacity: phone.length === 10 ? 1 : 0.6,
// //           },
// //         ]}
// //         disabled={phone.length !== 10}
// //         onPress={handleQuickLogin}
// //       >
// //         {loading ? (
// //           <ActivityIndicator color="#fff" />
// //         ) : (
// //           <GlobalText medium style={styles.btnText}>
// //             Quick Login
// //           </GlobalText>
// //         )}
// //       </TouchableOpacity>

// //       {/* Terms and Policy */}
// //       <GlobalText style={[styles.policy, { color: colors.text }]}>
// //         By continuing, you agree to our{" "}
// //         <GlobalText style={[styles.link, { color: colors.primary }]}>
// //           Terms of Service
// //         </GlobalText>{" "}
// //         and{" "}
// //         <GlobalText style={[styles.link, { color: colors.primary }]}>
// //           Privacy Policy
// //         </GlobalText>
// //       </GlobalText>

// //       {/* 🧩 Custom Alert Modal */}
// //       <Modal transparent visible={alertVisible} animationType="fade">
// //         <View style={styles.modalOverlay}>
// //           <Animatable.View
// //             animation="zoomIn"
// //             duration={400}
// //             style={[
// //               styles.alertBox,
// //               {
// //                 backgroundColor: colors.card,
// //                 borderLeftColor:
// //                   alertType === "error" ? "#E53935" : colors.primary,
// //               },
// //             ]}
// //           >
// //             <Icon
// //               name={alertType === "error" ? "alert-circle" : "check-circle"}
// //               size={28}
// //               color={alertType === "error" ? "#E53935" : colors.primary}
// //               style={{ marginBottom: 6 }}
// //             />
// //             <GlobalText
// //               style={[
// //                 styles.alertText,
// //                 {
// //                   color:
// //                     alertType === "error" ? "#E53935" : colors.primary,
// //                 },
// //               ]}
// //             >
// //               {alertMessage}
// //             </GlobalText>
// //           </Animatable.View>
// //         </View>
// //       </Modal>
// //     </Animatable.View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     padding: 20,
// //     justifyContent: "center",
// //   },
// //   logo: {
// //     fontSize: 28,
// //     marginBottom: 20,
// //     textAlign: "center",
// //   },
// //   title: {
// //     fontSize: 22,
// //     marginBottom: 10,
// //     textAlign: "center",
// //   },
// //   subtitle: {
// //     fontSize: 14,
// //     marginBottom: 20,
// //     textAlign: "center",
// //   },
// //   inputRow: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     borderWidth: 1,
// //     borderRadius: 12,
// //     paddingHorizontal: 10,
// //     marginBottom: 20,
// //     height: 50,
// //   },
// //   textInput: { flex: 1, fontSize: 16 },
// //   primaryBtn: {
// //     paddingVertical: 14,
// //     borderRadius: 12,
// //     alignItems: "center",
// //   },
// //   btnText: { color: "#fff", fontSize: 16 },
// //   policy: {
// //     marginTop: 20,
// //     fontSize: 12,
// //     textAlign: "center",
// //   },
// //   link: {
// //     textDecorationLine: "underline",
// //     fontWeight: "600",
// //   },

// //   // 🧩 Modal Styles
// //   modalOverlay: {
// //     flex: 1,
// //     justifyContent: "center",
// //     alignItems: "center",
// //     backgroundColor: "rgba(0,0,0,0.4)",
// //   },
// //   alertBox: {
// //     width: "80%",
// //     borderRadius: 12,
// //     paddingVertical: 18,
// //     paddingHorizontal: 15,
// //     alignItems: "center",
// //     borderLeftWidth: 5,
// //     elevation: 5,
// //   },
// //   alertText: {
// //     fontSize: 15,
// //     fontWeight: "600",
// //     textAlign: "center",
// //   },
// // });

// // // import React, { useState, useContext } from "react";
// // // import {
// // //   View,
// // //   TextInput,
// // //   StyleSheet,
// // //   TouchableOpacity,
// // //   ActivityIndicator,
// // //   Modal,
// // // } from "react-native";
// // // import Icon from "react-native-vector-icons/MaterialCommunityIcons";
// // // import AsyncStorage from "@react-native-async-storage/async-storage";
// // // import { AuthContext } from "../../AuthContext/AuthContext";
// // // import { quickLogin } from "../../api/api";
// // // import * as Animatable from "react-native-animatable";
// // // import GlobalText from "../../theme/GlobalText"; // ✅ Global font component

// // // export default function QuickLoginScreen({ navigation }) {
// // //   const { login } = useContext(AuthContext);

// // //   const [phone, setPhone] = useState("");
// // //   const [loading, setLoading] = useState(false);
// // //   const [alertVisible, setAlertVisible] = useState(false);
// // //   const [alertType, setAlertType] = useState("error"); // "error" | "success"
// // //   const [alertMessage, setAlertMessage] = useState("");

// // //   // 🟢 Show custom alert
// // //   const showAlert = (message, type = "error") => {
// // //     setAlertMessage(message);
// // //     setAlertType(type);
// // //     setAlertVisible(true);
// // //     setTimeout(() => setAlertVisible(false), 2000);
// // //   };

// // //   // 🟢 Handle Quick Login
// // //   const handleQuickLogin = async () => {
// // //     if (phone.length !== 10) {
// // //       showAlert("Please enter a valid 10-digit phone number");
// // //       return;
// // //     }

// // //     try {
// // //       setLoading(true);
// // //       const res = await quickLogin(`+91${phone}`);

// // //       await AsyncStorage.setItem("authToken", res.token);
// // //       await AsyncStorage.setItem("user", JSON.stringify(res.user));
// // //       await login(res.token);
// // //       showAlert("Login successful!", "success");
// // //     } catch (err) {
// // //       showAlert(err.response?.data?.message || "Quick login failed");
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   return (
// // //     <Animatable.View animation="fadeInUp" style={styles.container}>
// // //       {/* 🌿 Logo */}
// // //       <GlobalText bold style={styles.logo}>
// // //         🌿 Zero Estate
// // //       </GlobalText>

// // //       {/* Title & Subtitle */}
// // //       <GlobalText bold style={styles.title}>
// // //         Quick Login
// // //       </GlobalText>
// // //       <GlobalText style={styles.subtitle}>
// // //         Enter your registered phone number
// // //       </GlobalText>

// // //       {/* 📞 Input Field */}
// // //       <View style={styles.inputRow}>
// // //         <Icon name="phone" size={20} color="#555" style={{ marginRight: 8 }} />
// // //         <TextInput
// // //           style={styles.textInput}
// // //           placeholder="Phone Number"
// // //           keyboardType="phone-pad"
// // //           maxLength={10}
// // //           value={phone}
// // //           onChangeText={(val) => setPhone(val.replace(/[^0-9]/g, ""))}
// // //         />
// // //       </View>

// // //       {/* 🔘 Quick Login Button */}
// // //       <TouchableOpacity
// // //         style={[
// // //           styles.primaryBtn,
// // //           { opacity: phone.length === 10 ? 1 : 0.6 },
// // //         ]}
// // //         disabled={phone.length !== 10}
// // //         onPress={handleQuickLogin}
// // //       >
// // //         {loading ? (
// // //           <ActivityIndicator color="#fff" />
// // //         ) : (
// // //           <GlobalText medium style={styles.btnText}>
// // //             Quick Login
// // //           </GlobalText>
// // //         )}
// // //       </TouchableOpacity>

// // //       {/* Terms and Policy */}
// // //       <GlobalText style={styles.policy}>
// // //         By continuing, you agree to our{" "}
// // //         <GlobalText style={styles.link}>Terms of Service</GlobalText> and{" "}
// // //         <GlobalText style={styles.link}>Privacy Policy</GlobalText>
// // //       </GlobalText>

// // //       {/* 🧩 Custom Alert Modal */}
// // //       <Modal transparent visible={alertVisible} animationType="fade">
// // //         <View style={styles.modalOverlay}>
// // //           <Animatable.View
// // //             animation="zoomIn"
// // //             duration={400}
// // //             style={[
// // //               styles.alertBox,
// // //               alertType === "error"
// // //                 ? { borderLeftColor: "#E53935" }
// // //                 : { borderLeftColor: "#43C6AC" },
// // //             ]}
// // //           >
// // //             <Icon
// // //               name={alertType === "error" ? "alert-circle" : "check-circle"}
// // //               size={28}
// // //               color={alertType === "error" ? "#E53935" : "#43C6AC"}
// // //               style={{ marginBottom: 6 }}
// // //             />
// // //             <GlobalText
// // //               style={[
// // //                 styles.alertText,
// // //                 alertType === "error"
// // //                   ? { color: "#E53935" }
// // //                   : { color: "#43C6AC" },
// // //               ]}
// // //             >
// // //               {alertMessage}
// // //             </GlobalText>
// // //           </Animatable.View>
// // //         </View>
// // //       </Modal>
// // //     </Animatable.View>
// // //   );
// // // }

// // // const styles = StyleSheet.create({
// // //   container: {
// // //     flex: 1,
// // //     backgroundColor: "#fff",
// // //     padding: 20,
// // //     justifyContent: "center",
// // //   },
// // //   logo: {
// // //     fontSize: 28,
// // //     color: "#43C6AC",
// // //     marginBottom: 20,
// // //     textAlign: "center",
// // //   },
// // //   title: {
// // //     fontSize: 22,
// // //     marginBottom: 10,
// // //     textAlign: "center",
// // //   },
// // //   subtitle: {
// // //     fontSize: 14,
// // //     color: "#555",
// // //     marginBottom: 20,
// // //     textAlign: "center",
// // //   },
// // //   inputRow: {
// // //     flexDirection: "row",
// // //     alignItems: "center",
// // //     borderWidth: 1,
// // //     borderColor: "#ddd",
// // //     borderRadius: 12,
// // //     paddingHorizontal: 10,
// // //     marginBottom: 20,
// // //     height: 50,
// // //   },
// // //   textInput: { flex: 1, fontSize: 16 },
// // //   primaryBtn: {
// // //     backgroundColor: "#43C6AC",
// // //     paddingVertical: 14,
// // //     borderRadius: 12,
// // //     alignItems: "center",
// // //   },
// // //   btnText: { color: "#fff", fontSize: 16 },
// // //   policy: {
// // //     marginTop: 20,
// // //     fontSize: 12,
// // //     color: "#666",
// // //     textAlign: "center",
// // //   },
// // //   link: {
// // //     color: "#43C6AC",
// // //     textDecorationLine: "underline",
// // //   },

// // //   // 🧩 Modal Styles
// // //   modalOverlay: {
// // //     flex: 1,
// // //     justifyContent: "center",
// // //     alignItems: "center",
// // //     backgroundColor: "rgba(0,0,0,0.4)",
// // //   },
// // //   alertBox: {
// // //     width: "80%",
// // //     backgroundColor: "#fff",
// // //     borderRadius: 12,
// // //     paddingVertical: 18,
// // //     paddingHorizontal: 15,
// // //     alignItems: "center",
// // //     borderLeftWidth: 5,
// // //     elevation: 5,
// // //   },
// // //   alertText: {
// // //     fontSize: 15,
// // //     fontWeight: "600",
// // //     textAlign: "center",
// // //   },
// // // });
