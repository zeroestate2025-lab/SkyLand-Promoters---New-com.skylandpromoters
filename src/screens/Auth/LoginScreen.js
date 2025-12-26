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

          <GlobalText style={[styles.tagline, { color: textColor }]}>
            India’s #1 Property Booking App
          </GlobalText>

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

// import React, { useState, useContext } from "react";
// import {
//   View,
//   TextInput,
//   StyleSheet,
//   TouchableOpacity,
//   ActivityIndicator,
//   ScrollView,
//   useColorScheme,
// } from "react-native";
// import Icon from "react-native-vector-icons/MaterialCommunityIcons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import LinearGradient from "react-native-linear-gradient";
// import { useTheme } from "@react-navigation/native";
// import * as Animatable from "react-native-animatable";
// import { AuthContext } from "../../AuthContext/AuthContext";
// import { registerOrLogin } from "../../api/api";
// import GlobalText from "../../theme/GlobalText";

// export default function LoginScreen({ navigation }) {
//   // ✅ Hooks — all at top level (order fixed)
//   const { login } = useContext(AuthContext);
//   const { colors } = useTheme();
//   const scheme = useColorScheme();
//   const isDark = scheme === "dark";

//   const [step, setStep] = useState(1);
//   const [name, setName] = useState("");
//   const [phone, setPhone] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [errorMessage, setErrorMessage] = useState("");

//   const handleNext = () => {
//     if (name.length < 2 || phone.length !== 10) {
//       setErrorMessage("Please enter a valid name and 10-digit phone number");
//       return;
//     }
//     setErrorMessage("");
//     setStep(2);
//   };

//   const handleAuth = async () => {
//     if (password.length < 4) {
//       setErrorMessage("Password must be at least 4 characters");
//       return;
//     }
//     try {
//       setLoading(true);
//       const res = await registerOrLogin({ name, phone: `+91${phone}`, password });
//       await AsyncStorage.setItem("authToken", res.token);
//       await AsyncStorage.setItem("user", JSON.stringify(res.user));
//       await login(res.token);
//     } catch (err) {
//       setErrorMessage(err.response?.data?.message || "Login failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const backgroundColor = isDark ? "#121212" : "#F9F9F9";
//   const cardColor = isDark ? "#1E1E1E" : "#FFFFFF";
//   const textColor = isDark ? "#FFFFFF" : "#000000";
//   const placeholderColor = isDark ? "#AAAAAA" : "#777";

//   return (
//     <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
//       <View style={[styles.container, { backgroundColor }]}>
//         <Animatable.View animation="fadeInUp" duration={800} style={{ flex: 1 }}>
//           {/* 🌿 Logo */}
//           <Animatable.Text
//             animation="pulse"
//             iterationCount="infinite"
//             duration={4000}
//             style={[styles.logo, { color: "#20A68B" }]}
//           >
//             🌿 Zero Estate
//           </Animatable.Text>

//           <GlobalText style={[styles.tagline, { color: textColor }]}>
//             India’s #1 Property Booking App
//           </GlobalText>

//           {/* 🌿 Step Forms */}
//           {step === 1 && (
//             <Animatable.View animation="fadeInLeft" duration={600}>
//               <GlobalText style={[styles.label, { color: textColor }]}>
//                 Log in or Sign up
//               </GlobalText>

//               {/* Name Input */}
//               <View style={[styles.inputRow, { backgroundColor: cardColor }]}>
//                 <Icon name="account" size={20} color={textColor} style={{ marginRight: 8 }} />
//                 <TextInput
//                   style={[styles.textInput, { color: textColor }]}
//                   placeholder="Enter your Name"
//                   placeholderTextColor={placeholderColor}
//                   value={name}
//                   onChangeText={setName}
//                 />
//               </View>

//               {/* Phone Input */}
//               <View style={[styles.inputRow, { backgroundColor: cardColor }]}>
//                 <Icon name="phone" size={20} color={textColor} style={{ marginRight: 8 }} />
//                 <TextInput
//                   style={[styles.textInput, { color: textColor }]}
//                   placeholder="Phone Number"
//                   placeholderTextColor={placeholderColor}
//                   keyboardType="phone-pad"
//                   maxLength={10}
//                   value={phone}
//                   onChangeText={(val) => setPhone(val.replace(/[^0-9]/g, ""))}
//                 />
//               </View>

//               {errorMessage && (
//                 <GlobalText style={styles.errorText}>{errorMessage}</GlobalText>
//               )}

//               <TouchableOpacity
//                 disabled={phone.length !== 10 || name.length < 2}
//                 activeOpacity={0.8}
//                 onPress={handleNext}
//               >
//                 <LinearGradient
//                   colors={["#43C6AC", "#20A68B"]}
//                   style={[
//                     styles.primaryBtn,
//                     { opacity: phone.length === 10 && name.length > 1 ? 1 : 0.6 },
//                   ]}
//                 >
//                   <GlobalText style={styles.btnText}>Continue</GlobalText>
//                 </LinearGradient>
//               </TouchableOpacity>

//               <TouchableOpacity onPress={() => navigation.navigate("QuickLogin")}>
//                 <GlobalText style={[styles.quickLoginText, { color: "#20A68B" }]}>
//                   Already a user? Quick Login →
//                 </GlobalText>
//               </TouchableOpacity>
//             </Animatable.View>
//           )}

//           {step === 2 && (
//             <Animatable.View animation="fadeInRight" duration={600}>
//               <GlobalText style={[styles.label, { color: textColor }]}>
//                 Set or Enter your Password
//               </GlobalText>

//               <View style={[styles.inputRow, { backgroundColor: cardColor }]}>
//                 <Icon name="lock" size={20} color={textColor} style={{ marginRight: 8 }} />
//                 <TextInput
//                   style={[styles.textInput, { color: textColor }]}
//                   placeholder="Password"
//                   placeholderTextColor={placeholderColor}
//                   secureTextEntry={!showPassword}
//                   value={password}
//                   onChangeText={setPassword}
//                 />
//                 <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
//                   <Icon name={showPassword ? "eye-off" : "eye"} size={22} color={textColor} />
//                 </TouchableOpacity>
//               </View>

//               {errorMessage && (
//                 <GlobalText style={styles.errorText}>{errorMessage}</GlobalText>
//               )}

//               <TouchableOpacity
//                 disabled={password.length < 4}
//                 activeOpacity={0.8}
//                 onPress={handleAuth}
//               >
//                 <LinearGradient
//                   colors={["#43C6AC", "#20A68B"]}
//                   style={[
//                     styles.primaryBtn,
//                     { opacity: password.length >= 4 ? 1 : 0.6 },
//                   ]}
//                 >
//                   {loading ? (
//                     <ActivityIndicator color="#fff" />
//                   ) : (
//                     <GlobalText style={styles.btnText}>Continue</GlobalText>
//                   )}
//                 </LinearGradient>
//               </TouchableOpacity>

//               <TouchableOpacity onPress={() => setStep(1)}>
//                 <GlobalText style={[styles.backText, { color: "#20A68B" }]}>
//                   ← Go Back
//                 </GlobalText>
//               </TouchableOpacity>
//             </Animatable.View>
//           )}

//           {/* Policy */}
//           <GlobalText style={[styles.policy, { color: textColor }]}>
//             By continuing, you agree to our{" "}
//             <GlobalText style={[styles.link, { color: "#20A68B" }]}>
//               Terms of Service
//             </GlobalText>{" "}
//             and{" "}
//             <GlobalText style={[styles.link, { color: "#20A68B" }]}>
//               Privacy Policy
//             </GlobalText>
//           </GlobalText>
//         </Animatable.View>
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: "center", padding: 20 },
//   logo: {
//     fontSize: 28,
//     fontWeight: "bold",
//     textAlign: "center",
//     marginBottom: 15,
//     marginTop: 150,
//   },
//   tagline: { fontSize: 14, textAlign: "center", marginBottom: 25 },
//   label: { fontSize: 16, fontWeight: "600", marginBottom: 10, textAlign: "center" },
//   inputRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderRadius: 12,
//     paddingHorizontal: 10,
//     marginBottom: 15,
//     height: 50,
//   },
//   textInput: { flex: 1, fontSize: 16 },
//   primaryBtn: {
//     borderRadius: 12,
//     alignItems: "center",
//     marginTop: 10,
//     paddingVertical: 14,
//   },
//   btnText: { color: "#fff", fontSize: 16, fontWeight: "600", textAlign: "center" },
//   quickLoginText: {
//     marginTop: 15,
//     fontSize: 14,
//     textAlign: "center",
//     fontWeight: "600",
//   },
//   backText: {
//     marginTop: 15,
//     fontSize: 14,
//     textAlign: "center",
//     fontWeight: "600",
//   },
//   policy: { marginTop: 20, fontSize: 12, textAlign: "center" },
//   link: { fontWeight: "600" },
//   errorText: { color: "#E53935", textAlign: "center", marginBottom: 10, fontSize: 13 },
// });

// // import React, { useState, useContext } from "react";
// // import {
// //   View,
// //   TextInput,
// //   StyleSheet,
// //   TouchableOpacity,
// //   ActivityIndicator,
// //   ScrollView,
// // } from "react-native";
// // import Icon from "react-native-vector-icons/MaterialCommunityIcons";
// // import AsyncStorage from "@react-native-async-storage/async-storage";
// // import { useTheme } from "@react-navigation/native";
// // import { AuthContext } from "../../AuthContext/AuthContext";
// // import { registerOrLogin } from "../../api/api";
// // import * as Animatable from "react-native-animatable";
// // import GlobalText from "../../theme/GlobalText";

// // export default function LoginScreen({ navigation }) {
// //   // ✅ All hooks declared here (top level)
// //   const { login } = useContext(AuthContext);
// //   const { colors, dark } = useTheme();

// //   const [step, setStep] = useState(1);
// //   const [name, setName] = useState("");
// //   const [phone, setPhone] = useState("");
// //   const [password, setPassword] = useState("");
// //   const [showPassword, setShowPassword] = useState(false);
// //   const [loading, setLoading] = useState(false);
// //   const [errorMessage, setErrorMessage] = useState("");


// //   // 🔹 Proceed to Password Screen
// //   const handleNext = () => {
// //     if (name.length < 2 || phone.length !== 10) {
// //       setErrorMessage("Please enter a valid name and 10-digit phone number");
// //       return;
// //     }
// //     setErrorMessage("");
// //     setStep(2);
// //   };

// //   // 🔹 Login / Register
// //   const handleAuth = async () => {
// //     if (password.length < 4) {
// //       setErrorMessage("Password must be at least 4 characters");
// //       return;
// //     }
// //     try {
// //       setLoading(true);
// //       const res = await registerOrLogin({ name, phone: `+91${phone}`, password  });
// //       await AsyncStorage.setItem("authToken", res.token);
// //       await AsyncStorage.setItem("user", JSON.stringify(res.user));
// //       await login(res.token);
// //     } catch (err) {
// //       setErrorMessage(err.response?.data?.message || "Login failed");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
// //       <View style={[styles.container, { backgroundColor: colors.background }]}>
// //         <Animatable.View
// //           animation="fadeInUp"
// //           duration={800}
// //           style={{ flex: 1, justifyContent: "center" }}
// //         >
// //           <Animatable.Text
// //             animation="pulse"
// //             iterationCount="infinite"
// //             duration={4000}
// //             style={[styles.logo, { color: colors.primary }]}
// //           >
// //             🌿 Zero Estate
// //           </Animatable.Text>

// //           <GlobalText style={[styles.tagline, { color: colors.text }]}>
// //             India’s #1 Property Booking App
// //           </GlobalText>

// //           {step === 1 ? (
// //             // ----------------------------------------------------
// //             // 🔹 STEP 1: NAME + PHONE SCREEN
// //             // ----------------------------------------------------
// //             <Animatable.View animation="fadeInLeft" duration={600}>
// //               <GlobalText style={[styles.label, { color: colors.text }]}>
// //                 Log in or Sign up
// //               </GlobalText>

// //               {/* Name Input */}
// //               <View style={[styles.inputRow, { borderColor: colors.border }]}>
// //                 <Icon
// //                   name="account"
// //                   size={20}
// //                   color={colors.text}
// //                   style={{ marginRight: 8 }}
// //                 />
// //                 <TextInput
// //                   style={[styles.textInput, { color: colors.text }]}
// //                   placeholder="Enter your Name"
// //                   placeholderTextColor={dark ? "#aaa" : "#666"}
// //                   value={name}
// //                   onChangeText={setName}
// //                 />
// //               </View>

// //               {/* Phone Input */}
// //               <View style={[styles.inputRow, { borderColor: colors.border }]}>
// //                 <Icon
// //                   name="phone"
// //                   size={20}
// //                   color={colors.text}
// //                   style={{ marginRight: 8 }}
// //                 />
// //                 <TextInput
// //                   style={[styles.textInput, { color: colors.text }]}
// //                   placeholder="Phone Number"
// //                   placeholderTextColor={dark ? "#aaa" : "#666"}
// //                   keyboardType="phone-pad"
// //                   maxLength={10}
// //                   value={phone}
// //                   onChangeText={(val) => setPhone(val.replace(/[^0-9]/g, ""))}
// //                 />
// //               </View>

// //               {errorMessage && (
// //                 <GlobalText style={styles.errorText}>{errorMessage}</GlobalText>
// //               )}

// //               <TouchableOpacity
// //                 activeOpacity={0.8}
// //                 style={[
// //                   styles.primaryBtn,
// //                   {
// //                     backgroundColor: colors.primary,
// //                     opacity: phone.length === 10 && name.length > 1 ? 1 : 0.5,
// //                   },
// //                 ]}
// //                 disabled={phone.length !== 10 || name.length < 2}
// //                 onPress={handleNext}
// //               >
// //                 <GlobalText style={styles.btnText}>Continue</GlobalText>
// //               </TouchableOpacity>

// //               <TouchableOpacity
// //                 onPress={() => navigation.navigate("QuickLogin")}
// //               >
// //                 <GlobalText
// //                   style={[styles.quickLoginText, { color: colors.primary }]}
// //                 >
// //                   Already a user? Quick Login →
// //                 </GlobalText>
// //               </TouchableOpacity>
// //             </Animatable.View>
// //           ) : (
// //             // ----------------------------------------------------
// //             // 🔹 STEP 2: PASSWORD SCREEN
// //             // ----------------------------------------------------
// //             <Animatable.View animation="fadeInRight" duration={600}>
// //               <GlobalText style={[styles.label, { color: colors.text }]}>
// //                 Set or Enter your Password
// //               </GlobalText>

// //               {/* Password Input */}
// //               <View style={[styles.inputRow, { borderColor: colors.border }]}>
// //                 <Icon
// //                   name="lock"
// //                   size={20}
// //                   color={colors.text}
// //                   style={{ marginRight: 8 }}
// //                 />
// //                 <TextInput
// //                   style={[styles.textInput, { color: colors.text }]}
// //                   placeholder="Password"
// //                   placeholderTextColor={dark ? "#aaa" : "#666"}
// //                   secureTextEntry={!showPassword}
// //                   value={password}
// //                   onChangeText={setPassword}
// //                 />
// //                 <TouchableOpacity
// //                   onPress={() => setShowPassword(!showPassword)}
// //                 >
// //                   <Icon
// //                     name={showPassword ? "eye-off" : "eye"}
// //                     size={22}
// //                     color={colors.text}
// //                   />
// //                 </TouchableOpacity>
// //               </View>

// //               {errorMessage && (
// //                 <GlobalText style={styles.errorText}>{errorMessage}</GlobalText>
// //               )}

// //               <TouchableOpacity
// //                 activeOpacity={0.8}
// //                 style={[
// //                   styles.primaryBtn,
// //                   {
// //                     backgroundColor: colors.primary,
// //                     opacity: password.length >= 4 ? 1 : 0.5,
// //                   },
// //                 ]}
// //                 disabled={password.length < 4}
// //                 onPress={handleAuth}
// //               >
// //                 {loading ? (
// //                   <ActivityIndicator color="#fff" />
// //                 ) : (
// //                   <GlobalText style={styles.btnText}>Continue</GlobalText>
// //                 )}
// //               </TouchableOpacity>

// //               <TouchableOpacity onPress={() => setStep(1)}>
// //                 <GlobalText
// //                   style={[styles.backText, { color: colors.primary }]}
// //                 >
// //                   ← Go Back
// //                 </GlobalText>
// //               </TouchableOpacity>
// //             </Animatable.View>
// //           )}

// //           <GlobalText style={[styles.policy, { color: colors.text }]}>
// //             By continuing, you agree to our{" "}
// //             <GlobalText style={[styles.link, { color: colors.primary }]}>
// //               Terms of Service
// //             </GlobalText>{" "}
// //             and{" "}
// //             <GlobalText style={[styles.link, { color: colors.primary }]}>
// //               Privacy Policy
// //             </GlobalText>
// //           </GlobalText>
// //         </Animatable.View>
// //       </View>
// //     </ScrollView>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: { flex: 1, justifyContent: "center", padding: 20 },
// //   logo: {
// //     fontSize: 28,
// //     fontWeight: "bold",
// //     textAlign: "center",
// //     marginBottom: 15,
// //   },
// //   tagline: { fontSize: 14, textAlign: "center", marginBottom: 25 },
// //   label: { fontSize: 16, fontWeight: "600", marginBottom: 10, textAlign: "center" },
// //   inputRow: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     borderWidth: 1,
// //     borderRadius: 12,
// //     paddingHorizontal: 10,
// //     marginBottom: 15,
// //     height: 50,
// //   },
// //   textInput: { flex: 1, fontSize: 16 },
// //   primaryBtn: {
// //     paddingVertical: 14,
// //     borderRadius: 12,
// //     alignItems: "center",
// //     marginTop: 10,
// //   },
// //   btnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
// //   quickLoginText: {
// //     marginTop: 15,
// //     fontSize: 14,
// //     textAlign: "center",
// //     fontWeight: "600",
// //   },
// //   backText: {
// //     marginTop: 15,
// //     fontSize: 14,
// //     textAlign: "center",
// //     fontWeight: "600",
// //   },
// //   policy: {
// //     marginTop: 20,
// //     fontSize: 12,
// //     textAlign: "center",
// //   },
// //   link: { fontWeight: "600" },
// //   errorText: {
// //     color: "red",
// //     textAlign: "center",
// //     marginBottom: 10,
// //     fontSize: 13,
// //   },
// // });

// // // import React, { useState, useContext, useRef } from "react";
// // // import {
// // //   View,
// // //   TextInput,
// // //   StyleSheet,
// // //   TouchableOpacity,
// // //   ActivityIndicator,
// // //   FlatList,
// // //   Modal,
// // //   ScrollView,
// // // } from "react-native";
// // // import Icon from "react-native-vector-icons/MaterialCommunityIcons";
// // // import AsyncStorage from "@react-native-async-storage/async-storage";
// // // import { useTheme } from "@react-navigation/native";
// // // import { AuthContext } from "../../AuthContext/AuthContext";
// // // import { requestOtp, verifyOtp, quickLogin } from "../../api/api";
// // // import * as Animatable from "react-native-animatable";
// // // import GlobalText from "../../theme/GlobalText";

// // // // 🌍 Country List
// // // const countries = [
// // //   { code: "+91", name: "India", flag: "🇮🇳" },
// // //   { code: "+1", name: "USA", flag: "🇺🇸" },
// // //   { code: "+44", name: "UK", flag: "🇬🇧" },
// // //   { code: "+61", name: "Australia", flag: "🇦🇺" },
// // //   { code: "+971", name: "UAE", flag: "🇦🇪" },
// // // ];

// // // export default function LoginScreen({ navigation }) {
// // //   const { login } = useContext(AuthContext);
// // //   const { colors, dark } = useTheme(); // ✅ Theme-aware
// // //   const [name, setName] = useState("");
// // //   const [phone, setPhone] = useState("");
// // //   const [loading, setLoading] = useState(false);
// // //   const [otp, setOtp] = useState("");
// // //   const [showOtpScreen, setShowOtpScreen] = useState(false);
// // //   const [selectedCountry, setSelectedCountry] = useState(countries[0]);
// // //   const [showCountryModal, setShowCountryModal] = useState(false);
// // //   const [resendTimer, setResendTimer] = useState(30);
// // //   const [errorMessage, setErrorMessage] = useState("");

// // //   const inputRefs = useRef([]);
// // //   const otpBoxRef = useRef(null);

// // //   // 🔹 Send OTP or Quick Login
// // //   const handleSendOtp = async () => {
// // //     if (phone.length !== 10 || name.length < 2) {
// // //       setErrorMessage("Please enter a valid name and 10-digit phone number");
// // //       if (otpBoxRef.current) otpBoxRef.current.shake(600);
// // //       return;
// // //     }
// // //     try {
// // //       setLoading(true);
// // //       const res = await requestOtp(`${selectedCountry.code}${phone}`, name);

// // //       if (res.message?.toLowerCase().includes("already")) {
// // //         const quickRes = await quickLogin(`${selectedCountry.code}${phone}`);
// // //         await AsyncStorage.setItem("authToken", quickRes.token);
// // //         await AsyncStorage.setItem("user", JSON.stringify(quickRes.user));
// // //         await login(quickRes.token);
// // //       } else {
// // //         setShowOtpScreen(true);
// // //         setOtp("");
// // //         setResendTimer(30);

// // //         const interval = setInterval(() => {
// // //           setResendTimer((t) => {
// // //             if (t <= 1) {
// // //               clearInterval(interval);
// // //               return 0;
// // //             }
// // //             return t - 1;
// // //           });
// // //         }, 1000);
// // //       }
// // //     } catch (err) {
// // //       setErrorMessage(err.response?.data?.message || "Failed to send OTP");
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   // 🔹 Verify OTP
// // //   const handleVerifyOtp = async () => {
// // //     if (otp.length < 4) {
// // //       setErrorMessage("Please enter 4-digit OTP");
// // //       if (otpBoxRef.current) otpBoxRef.current.shake(600);
// // //       return;
// // //     }
// // //     try {
// // //       setLoading(true);
// // //       const res = await verifyOtp(`${selectedCountry.code}${phone}`, otp, name);
// // //       await AsyncStorage.setItem("authToken", res.token);
// // //       await AsyncStorage.setItem("user", JSON.stringify(res.user));
// // //       await login(res.token);
// // //     } catch (err) {
// // //       setErrorMessage(err.response?.data?.message || "Invalid OTP");
// // //       if (otpBoxRef.current) otpBoxRef.current.shake(600);
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   // 🔹 OTP input auto focus
// // //   const handleOtpChange = (text, index) => {
// // //     let newOtp = otp.split("");
// // //     newOtp[index] = text;
// // //     setOtp(newOtp.join(""));

// // //     if (text && index < 3) {
// // //       inputRefs.current[index + 1].focus();
// // //     }
// // //     if (!text && index > 0) {
// // //       inputRefs.current[index - 1].focus();
// // //     }
// // //   };

// // //   return (
// // //     <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
// // //       <View style={[styles.container, { backgroundColor: colors.background }]}>
// // //         {!showOtpScreen ? (
// // //           <Animatable.View animation="fadeInUp" duration={800}>
// // //             <Animatable.Text
// // //               animation="pulse"
// // //               iterationCount="infinite"
// // //               duration={4000}
// // //               style={[styles.logo, { color: colors.primary }]}
// // //             >
// // //               🌿 Zero Estate
// // //             </Animatable.Text>

// // //             <GlobalText style={[styles.tagline, { color: colors.text }]}>
// // //               India’s #1 Property Booking App
// // //             </GlobalText>
// // //             <GlobalText style={[styles.label, { color: colors.text }]}>
// // //               Log in or sign up
// // //             </GlobalText>

// // //             {/* Name Input */}
// // //             <Animatable.View
// // //               animation="fadeInLeft"
// // //               delay={200}
// // //               style={[styles.inputRow, { borderColor: colors.border }]}
// // //             >
// // //               <Icon name="account" size={20} color={colors.text} style={{ marginRight: 8 }} />
// // //               <TextInput
// // //                 style={[styles.textInput, { color: colors.text }]}
// // //                 placeholder="Enter your Name"
// // //                 placeholderTextColor={dark ? "#aaa" : "#666"}
// // //                 value={name}
// // //                 onChangeText={setName}
// // //               />
// // //             </Animatable.View>

// // //             {/* Phone Input */}
// // //             <Animatable.View
// // //               animation="fadeInRight"
// // //               delay={400}
// // //               style={[styles.phoneRow, { borderColor: colors.border }]}
// // //             >
// // //               <TouchableOpacity
// // //                 style={styles.countryBox}
// // //                 onPress={() => setShowCountryModal(true)}
// // //               >
// // //                 <GlobalText style={[styles.flag, { color: colors.text }]}>
// // //                   {selectedCountry.flag}
// // //                 </GlobalText>
// // //                 <Icon name="chevron-down" size={20} color={colors.text} />
// // //               </TouchableOpacity>
// // //               <TextInput
// // //                 style={[styles.phoneInput, { color: colors.text }]}
// // //                 placeholder={`${selectedCountry.code} Phone number`}
// // //                 placeholderTextColor={dark ? "#aaa" : "#666"}
// // //                 keyboardType="phone-pad"
// // //                 maxLength={10}
// // //                 value={phone}
// // //                 onChangeText={(val) => setPhone(val.replace(/[^0-9]/g, ""))}
// // //               />
// // //             </Animatable.View>

// // //             {errorMessage && (
// // //               <GlobalText style={styles.errorText}>{errorMessage}</GlobalText>
// // //             )}

// // //             <Animatable.View animation="bounceIn" delay={600}>
// // //               <TouchableOpacity
// // //                 activeOpacity={0.8}
// // //                 style={[
// // //                   styles.primaryBtn,
// // //                   {
// // //                     backgroundColor: colors.primary,
// // //                     opacity: phone.length === 10 && name.length > 1 ? 1 : 0.5,
// // //                   },
// // //                 ]}
// // //                 disabled={phone.length !== 10 || name.length < 2}
// // //                 onPress={handleSendOtp}
// // //               >
// // //                 {loading ? (
// // //                   <ActivityIndicator color="#fff" />
// // //                 ) : (
// // //                   <GlobalText style={styles.btnText}>Continue</GlobalText>
// // //                 )}
// // //               </TouchableOpacity>
// // //             </Animatable.View>

// // //             <TouchableOpacity onPress={() => navigation.navigate("QuickLogin")}>
// // //               <GlobalText style={[styles.quickLoginText, { color: colors.primary }]}>
// // //                 Already a user? Quick Login →
// // //               </GlobalText>
// // //             </TouchableOpacity>

// // //             <GlobalText style={[styles.policy, { color: colors.text }]}>
// // //               By continuing, you agree to our{" "}
// // //               <GlobalText style={[styles.link, { color: colors.primary }]}>
// // //                 Terms of Service
// // //               </GlobalText>{" "}
// // //               and{" "}
// // //               <GlobalText style={[styles.link, { color: colors.primary }]}>
// // //                 Privacy Policy
// // //               </GlobalText>
// // //             </GlobalText>
// // //           </Animatable.View>
// // //         ) : (
// // //           /* OTP Screen */
// // //           <Animatable.View animation="fadeInUp" duration={800}>
// // //             <GlobalText style={[styles.title, { color: colors.text }]}>
// // //               OTP Verification
// // //             </GlobalText>
// // //             <GlobalText style={[styles.subtitle, { color: colors.text }]}>
// // //               We have sent a verification code to{"\n"}
// // //               <GlobalText style={{ fontWeight: "600", color: colors.primary }}>
// // //                 {selectedCountry.code}-{phone}
// // //               </GlobalText>
// // //             </GlobalText>

// // //             <Animatable.View ref={otpBoxRef} style={styles.otpRow}>
// // //               {[0, 1, 2, 3].map((i) => (
// // //                 <TextInput
// // //                   key={i}
// // //                   ref={(el) => (inputRefs.current[i] = el)}
// // //                   style={[
// // //                     styles.otpBox,
// // //                     { color: colors.text, borderColor: colors.border },
// // //                     otp.length === i ? { borderColor: colors.primary } : {},
// // //                   ]}
// // //                   maxLength={1}
// // //                   keyboardType="number-pad"
// // //                   value={otp[i] || ""}
// // //                   placeholder="-"
// // //                   placeholderTextColor={dark ? "#777" : "#aaa"}
// // //                   onChangeText={(text) => handleOtpChange(text, i)}
// // //                 />
// // //               ))}
// // //             </Animatable.View>

// // //             {errorMessage && (
// // //               <GlobalText style={styles.errorText}>{errorMessage}</GlobalText>
// // //             )}

// // //             <TouchableOpacity
// // //               style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
// // //               onPress={handleVerifyOtp}
// // //             >
// // //               {loading ? (
// // //                 <ActivityIndicator color="#fff" />
// // //               ) : (
// // //                 <GlobalText style={styles.btnText}>Verify & Login</GlobalText>
// // //               )}
// // //             </TouchableOpacity>

// // //             {resendTimer > 0 ? (
// // //               <GlobalText style={[styles.resendText, { color: colors.text }]}>
// // //                 Resend SMS in {resendTimer}s
// // //               </GlobalText>
// // //             ) : (
// // //               <TouchableOpacity onPress={handleSendOtp}>
// // //                 <GlobalText style={[styles.resendText, { color: colors.primary }]}>
// // //                   Resend OTP
// // //                 </GlobalText>
// // //               </TouchableOpacity>
// // //             )}
// // //           </Animatable.View>
// // //         )}

// // //         {/* Country Picker Modal */}
// // //         <Modal visible={showCountryModal} animationType="slide">
// // //           <View style={[{ flex: 1, padding: 20 }, { backgroundColor: colors.background }]}>
// // //             <TouchableOpacity onPress={() => setShowCountryModal(false)}>
// // //               <GlobalText style={[styles.backLink, { color: colors.primary }]}>← Back</GlobalText>
// // //             </TouchableOpacity>
// // //             <GlobalText style={[styles.title, { color: colors.text }]}>
// // //               Select your country
// // //             </GlobalText>
// // //             <FlatList
// // //               data={countries}
// // //               keyExtractor={(item) => item.code}
// // //               renderItem={({ item }) => (
// // //                 <TouchableOpacity
// // //                   style={[styles.countryRow, { borderColor: colors.border }]}
// // //                   onPress={() => {
// // //                     setSelectedCountry(item);
// // //                     setShowCountryModal(false);
// // //                   }}
// // //                 >
// // //                   <GlobalText style={[styles.flag, { color: colors.text }]}>
// // //                     {item.flag}
// // //                   </GlobalText>
// // //                   <GlobalText style={[styles.countryName, { color: colors.text }]}>
// // //                     {item.name}
// // //                   </GlobalText>
// // //                   <GlobalText style={[styles.countryCode, { color: colors.text }]}>
// // //                     {item.code}
// // //                   </GlobalText>
// // //                 </TouchableOpacity>
// // //               )}
// // //             />
// // //           </View>
// // //         </Modal>
// // //       </View>
// // //     </ScrollView>
// // //   );
// // // }

// // // // ✅ THEME-AWARE STYLES
// // // const styles = StyleSheet.create({
// // //   container: { flex: 1, justifyContent: "center", padding: 20 },
// // //   logo: {
// // //     fontSize: 28,
// // //     fontWeight: "bold",
// // //     textAlign: "center",
// // //     marginBottom: 15,
// // //   },
// // //   tagline: { fontSize: 14, textAlign: "center", marginBottom: 25 },
// // //   label: { fontSize: 16, fontWeight: "600", marginBottom: 10 },
// // //   inputRow: {
// // //     flexDirection: "row",
// // //     alignItems: "center",
// // //     borderWidth: 1,
// // //     borderRadius: 12,
// // //     paddingHorizontal: 10,
// // //     marginBottom: 15,
// // //     height: 50,
// // //   },
// // //   phoneRow: {
// // //     flexDirection: "row",
// // //     alignItems: "center",
// // //     borderWidth: 1,
// // //     borderRadius: 12,
// // //     paddingHorizontal: 10,
// // //     marginBottom: 15,
// // //     height: 50,
// // //   },
// // //   textInput: { flex: 1, fontSize: 16 },
// // //   phoneInput: { flex: 1, fontSize: 16 },
// // //   countryBox: { flexDirection: "row", alignItems: "center", marginRight: 10 },
// // //   primaryBtn: {
// // //     paddingVertical: 14,
// // //     borderRadius: 12,
// // //     alignItems: "center",
// // //     marginTop: 10,
// // //   },
// // //   btnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
// // //   quickLoginText: {
// // //     marginTop: 15,
// // //     fontSize: 14,
// // //     textAlign: "center",
// // //     fontWeight: "600",
// // //   },
// // //   policy: {
// // //     marginTop: 20,
// // //     fontSize: 12,
// // //     textAlign: "center",
// // //   },
// // //   link: { fontWeight: "600" },
// // //   backLink: { fontWeight: "600", marginBottom: 20 },
// // //   title: {
// // //     fontSize: 22,
// // //     fontWeight: "700",
// // //     textAlign: "center",
// // //     marginBottom: 10,
// // //   },
// // //   subtitle: { fontSize: 14, textAlign: "center", marginBottom: 20 },
// // //   otpRow: { flexDirection: "row", justifyContent: "center", marginVertical: 15 },
// // //   otpBox: {
// // //     width: 50,
// // //     height: 50,
// // //     borderWidth: 1,
// // //     borderRadius: 10,
// // //     textAlign: "center",
// // //     fontSize: 20,
// // //     marginHorizontal: 8,
// // //   },
// // //   resendText: { textAlign: "center", fontSize: 13, marginTop: 10 },
// // //   errorText: {
// // //     color: "red",
// // //     textAlign: "center",
// // //     marginBottom: 10,
// // //     fontSize: 13,
// // //   },
// // //   flag: { fontSize: 20, marginRight: 5 },
// // //   countryRow: {
// // //     flexDirection: "row",
// // //     justifyContent: "space-between",
// // //     paddingVertical: 15,
// // //     borderBottomWidth: 1,
// // //   },
// // //   countryName: { fontSize: 16 },
// // //   countryCode: { fontSize: 15 },
// // // });


// // // // import React, { useState, useContext, useRef } from "react";
// // // // import {
// // // //   View,
// // // //   TextInput,
// // // //   StyleSheet,
// // // //   TouchableOpacity,
// // // //   ActivityIndicator,
// // // //   FlatList,
// // // //   Modal,
// // // //   ScrollView,
// // // // } from "react-native";
// // // // import Icon from "react-native-vector-icons/MaterialCommunityIcons";
// // // // import AsyncStorage from "@react-native-async-storage/async-storage";
// // // // import { AuthContext } from "../../AuthContext/AuthContext";
// // // // import { requestOtp, verifyOtp, quickLogin } from "../../api/api";
// // // // import * as Animatable from "react-native-animatable";
// // // // import GlobalText from "../../theme/GlobalText";

// // // // // 🌍 Country List
// // // // const countries = [
// // // //   { code: "+91", name: "India", flag: "🇮🇳" },
// // // //   { code: "+1", name: "USA", flag: "🇺🇸" },
// // // //   { code: "+44", name: "UK", flag: "🇬🇧" },
// // // //   { code: "+61", name: "Australia", flag: "🇦🇺" },
// // // //   { code: "+971", name: "UAE", flag: "🇦🇪" },
// // // // ];

// // // // export default function LoginScreen({ navigation }) {
// // // //   const { login } = useContext(AuthContext);

// // // //   const [name, setName] = useState("");
// // // //   const [phone, setPhone] = useState("");
// // // //   const [loading, setLoading] = useState(false);
// // // //   const [otp, setOtp] = useState("");
// // // //   const [showOtpScreen, setShowOtpScreen] = useState(false);
// // // //   const [selectedCountry, setSelectedCountry] = useState(countries[0]);
// // // //   const [showCountryModal, setShowCountryModal] = useState(false);
// // // //   const [resendTimer, setResendTimer] = useState(30);
// // // //   const [errorMessage, setErrorMessage] = useState("");

// // // //   const inputRefs = useRef([]);
// // // //   const otpBoxRef = useRef(null);

// // // //   // 🔹 Send OTP or Quick Login
// // // //   const handleSendOtp = async () => {
// // // //     if (phone.length !== 10 || name.length < 2) {
// // // //       setErrorMessage("Please enter a valid name and 10-digit phone number");
// // // //       if (otpBoxRef.current) otpBoxRef.current.shake(600);
// // // //       return;
// // // //     }
// // // //     try {
// // // //       setLoading(true);
// // // //       const res = await requestOtp(`${selectedCountry.code}${phone}`, name);

// // // //       if (res.message?.toLowerCase().includes("already")) {
// // // //         const quickRes = await quickLogin(`${selectedCountry.code}${phone}`);
// // // //         await AsyncStorage.setItem("authToken", quickRes.token);
// // // //         await AsyncStorage.setItem("user", JSON.stringify(quickRes.user));
// // // //         await login(quickRes.token);
// // // //       } else {
// // // //         setShowOtpScreen(true);
// // // //         setOtp("");
// // // //         setResendTimer(30);

// // // //         const interval = setInterval(() => {
// // // //           setResendTimer((t) => {
// // // //             if (t <= 1) {
// // // //               clearInterval(interval);
// // // //               return 0;
// // // //             }
// // // //             return t - 1;
// // // //           });
// // // //         }, 1000);
// // // //       }
// // // //     } catch (err) {
// // // //       setErrorMessage(err.response?.data?.message || "Failed to send OTP");
// // // //     } finally {
// // // //       setLoading(false);
// // // //     }
// // // //   };

// // // //   // 🔹 Verify OTP
// // // //   const handleVerifyOtp = async () => {
// // // //     if (otp.length < 4) {
// // // //       setErrorMessage("Please enter 4-digit OTP");
// // // //       if (otpBoxRef.current) otpBoxRef.current.shake(600);
// // // //       return;
// // // //     }
// // // //     try {
// // // //       setLoading(true);
// // // //       const res = await verifyOtp(`${selectedCountry.code}${phone}`, otp, name);
// // // //       await AsyncStorage.setItem("authToken", res.token);
// // // //       await AsyncStorage.setItem("user", JSON.stringify(res.user));
// // // //       await login(res.token);
// // // //     } catch (err) {
// // // //       setErrorMessage(err.response?.data?.message || "Invalid OTP");
// // // //       if (otpBoxRef.current) otpBoxRef.current.shake(600);
// // // //     } finally {
// // // //       setLoading(false);
// // // //     }
// // // //   };

// // // //   // 🔹 OTP input auto focus
// // // //   const handleOtpChange = (text, index) => {
// // // //     let newOtp = otp.split("");
// // // //     newOtp[index] = text;
// // // //     setOtp(newOtp.join(""));

// // // //     if (text && index < 3) {
// // // //       inputRefs.current[index + 1].focus();
// // // //     }
// // // //     if (!text && index > 0) {
// // // //       inputRefs.current[index - 1].focus();
// // // //     }
// // // //   };

// // // //   return (
// // // //     <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
// // // //       <View style={styles.container}>
// // // //         {!showOtpScreen ? (
// // // //           <Animatable.View animation="fadeInUp" duration={800}>
// // // //             <Animatable.Text
// // // //               animation="pulse"
// // // //               iterationCount="infinite"
// // // //               duration={4000}
// // // //               style={styles.logo}
// // // //             >
// // // //               🌿 Zero Estate
// // // //             </Animatable.Text>

// // // //             <GlobalText style={styles.tagline}>
// // // //               India’s #1 Property Booking App
// // // //             </GlobalText>
// // // //             <GlobalText style={styles.label}>Log in or sign up</GlobalText>

// // // //             {/* Name Input */}
// // // //             <Animatable.View animation="fadeInLeft" delay={200} style={styles.inputRow}>
// // // //               <Icon name="account" size={20} color="#555" style={{ marginRight: 8 }} />
// // // //               <TextInput
// // // //                 style={styles.textInput}
// // // //                 placeholder="Enter your Name"
// // // //                 value={name}
// // // //                 onChangeText={setName}
// // // //               />
// // // //             </Animatable.View>

// // // //             {/* Phone Input */}
// // // //             <Animatable.View animation="fadeInRight" delay={400} style={styles.phoneRow}>
// // // //               <TouchableOpacity
// // // //                 style={styles.countryBox}
// // // //                 onPress={() => setShowCountryModal(true)}
// // // //               >
// // // //                 <GlobalText style={styles.flag}>{selectedCountry.flag}</GlobalText>
// // // //                 <Icon name="chevron-down" size={20} color="#555" />
// // // //               </TouchableOpacity>
// // // //               <TextInput
// // // //                 style={styles.phoneInput}
// // // //                 placeholder={`${selectedCountry.code} Phone number`}
// // // //                 keyboardType="phone-pad"
// // // //                 maxLength={10}
// // // //                 value={phone}
// // // //                 onChangeText={(val) => setPhone(val.replace(/[^0-9]/g, ""))}
// // // //               />
// // // //             </Animatable.View>

// // // //             {errorMessage && (
// // // //               <GlobalText style={styles.errorText}>{errorMessage}</GlobalText>
// // // //             )}

// // // //             <Animatable.View animation="bounceIn" delay={600}>
// // // //               <TouchableOpacity
// // // //                 activeOpacity={0.8}
// // // //                 style={[
// // // //                   styles.primaryBtn,
// // // //                   { opacity: phone.length === 10 && name.length > 1 ? 1 : 0.5 },
// // // //                 ]}
// // // //                 disabled={phone.length !== 10 || name.length < 2}
// // // //                 onPress={handleSendOtp}
// // // //               >
// // // //                 {loading ? (
// // // //                   <ActivityIndicator color="#fff" />
// // // //                 ) : (
// // // //                   <GlobalText style={styles.btnText}>Continue</GlobalText>
// // // //                 )}
// // // //               </TouchableOpacity>
// // // //             </Animatable.View>

// // // //             <TouchableOpacity onPress={() => navigation.navigate("QuickLogin")}>
// // // //               <GlobalText style={styles.quickLoginText}>
// // // //                 Already a user? Quick Login →
// // // //               </GlobalText>
// // // //             </TouchableOpacity>

// // // //             <GlobalText style={styles.policy}>
// // // //               By continuing, you agree to our{" "}
// // // //               <GlobalText style={styles.link}>Terms of Service</GlobalText> and{" "}
// // // //               <GlobalText style={styles.link}>Privacy Policy</GlobalText>
// // // //             </GlobalText>
// // // //           </Animatable.View>
// // // //         ) : (
// // // //           /* OTP Screen */
// // // //           <Animatable.View animation="fadeInUp" duration={800}>
// // // //             {/* <TouchableOpacity onPress={() => setShowOtpScreen(false)}>
// // // //               <GlobalText style={styles.backLink}>← Back</GlobalText>
// // // //             </TouchableOpacity> */}

// // // //             <GlobalText style={styles.title}>OTP Verification</GlobalText>
// // // //             <GlobalText style={styles.subtitle}>
// // // //               We have sent a verification code to{"\n"}
// // // //               <GlobalText style={{ fontWeight: "600" }}>
// // // //                 {selectedCountry.code}-{phone}
// // // //               </GlobalText>
// // // //             </GlobalText>

// // // //             <Animatable.View ref={otpBoxRef} style={styles.otpRow}>
// // // //               {[0, 1, 2, 3].map((i) => (
// // // //                 <TextInput
// // // //                   key={i}
// // // //                   ref={(el) => (inputRefs.current[i] = el)}
// // // //                   style={[
// // // //                     styles.otpBox,
// // // //                     otp.length === i ? styles.activeOtp : null,
// // // //                   ]}
// // // //                   maxLength={1}
// // // //                   keyboardType="number-pad"
// // // //                   value={otp[i] || ""}
// // // //                   onChangeText={(text) => handleOtpChange(text, i)}
// // // //                 />
// // // //               ))}
// // // //             </Animatable.View>

// // // //             {errorMessage && (
// // // //               <GlobalText style={styles.errorText}>{errorMessage}</GlobalText>
// // // //             )}

// // // //             <TouchableOpacity style={styles.primaryBtn} onPress={handleVerifyOtp}>
// // // //               {loading ? (
// // // //                 <ActivityIndicator color="#fff" />
// // // //               ) : (
// // // //                 <GlobalText style={styles.btnText}>Verify & Login</GlobalText>
// // // //               )}
// // // //             </TouchableOpacity>

// // // //             {resendTimer > 0 ? (
// // // //               <GlobalText style={styles.resendText}>
// // // //                 Resend SMS in {resendTimer}s
// // // //               </GlobalText>
// // // //             ) : (
// // // //               <TouchableOpacity onPress={handleSendOtp}>
// // // //                 <GlobalText style={[styles.resendText, { color: "#43C6AC" }]}>
// // // //                   Resend OTP
// // // //                 </GlobalText>
// // // //               </TouchableOpacity>
// // // //             )}
// // // //           </Animatable.View>
// // // //         )}

// // // //         {/* Country Picker */}
// // // //         <Modal visible={showCountryModal} animationType="slide">
// // // //           <View style={{ flex: 1, padding: 20 }}>
// // // //             <TouchableOpacity onPress={() => setShowCountryModal(false)}>
// // // //               <GlobalText style={styles.backLink}>← Back</GlobalText>
// // // //             </TouchableOpacity>
// // // //             <GlobalText style={styles.title}>Select your country</GlobalText>
// // // //             <FlatList
// // // //               data={countries}
// // // //               keyExtractor={(item) => item.code}
// // // //               renderItem={({ item }) => (
// // // //                 <TouchableOpacity
// // // //                   style={styles.countryRow}
// // // //                   onPress={() => {
// // // //                     setSelectedCountry(item);
// // // //                     setShowCountryModal(false);
// // // //                   }}
// // // //                 >
// // // //                   <GlobalText style={styles.flag}>{item.flag}</GlobalText>
// // // //                   <GlobalText style={styles.countryName}>{item.name}</GlobalText>
// // // //                   <GlobalText style={styles.countryCode}>{item.code}</GlobalText>
// // // //                 </TouchableOpacity>
// // // //               )}
// // // //             />
// // // //           </View>
// // // //         </Modal>
// // // //       </View>
// // // //     </ScrollView>
// // // //   );
// // // // }

// // // // // ✅ STYLES FIXED HERE
// // // // const styles = StyleSheet.create({
// // // //   container: {
// // // //     flex: 1,
// // // //     backgroundColor: "#fff",
// // // //     justifyContent: "center",
// // // //     padding: 20,
// // // //   },
// // // //   logo: {
// // // //     fontSize: 28,
// // // //     fontWeight: "bold",
// // // //     color: "#43C6AC",
// // // //     textAlign: "center",
// // // //     marginBottom: 15,
// // // //   },
// // // //   tagline: {
// // // //     fontSize: 14,
// // // //     color: "#777",
// // // //     textAlign: "center",
// // // //     marginBottom: 25,
// // // //   },
// // // //   label: { fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 10 },
// // // //   inputRow: {
// // // //     flexDirection: "row",
// // // //     alignItems: "center",
// // // //     borderWidth: 1,
// // // //     borderColor: "#ddd",
// // // //     borderRadius: 12,
// // // //     paddingHorizontal: 10,
// // // //     marginBottom: 15,
// // // //     height: 50,
// // // //   },
// // // //   textInput: { flex: 1, fontSize: 16 },
// // // //   phoneRow: {
// // // //     flexDirection: "row",
// // // //     alignItems: "center",
// // // //     borderWidth: 1,
// // // //     borderColor: "#ddd",
// // // //     borderRadius: 12,
// // // //     paddingHorizontal: 10,
// // // //     marginBottom: 15,
// // // //     height: 50,
// // // //   },
// // // //   countryBox: { flexDirection: "row", alignItems: "center", marginRight: 10 },
// // // //   phoneInput: { flex: 1, fontSize: 16 },
// // // //   primaryBtn: {
// // // //     backgroundColor: "#43C6AC",
// // // //     paddingVertical: 14,
// // // //     borderRadius: 12,
// // // //     alignItems: "center",
// // // //     marginTop: 10,
// // // //   },
// // // //   btnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
// // // //   quickLoginText: {
// // // //     marginTop: 15,
// // // //     fontSize: 14,
// // // //     color: "#43C6AC",
// // // //     textAlign: "center",
// // // //     fontWeight: "600",
// // // //   },
// // // //   policy: {
// // // //     marginTop: 20,
// // // //     fontSize: 12,
// // // //     color: "#666",
// // // //     textAlign: "center",
// // // //   },
// // // //   link: { color: "#43C6AC", fontWeight: "600" },
// // // //   backLink: {
// // // //     color: "#43C6AC",
// // // //     fontWeight: "600",
// // // //     marginBottom: 20,
// // // //   },
// // // //   title: {
// // // //     fontSize: 22,
// // // //     fontWeight: "700",
// // // //     color: "#333",
// // // //     textAlign: "center",
// // // //     marginBottom: 10,
// // // //   },
// // // //   subtitle: {
// // // //     fontSize: 14,
// // // //     color: "#555",
// // // //     textAlign: "center",
// // // //     marginBottom: 20,
// // // //   },
// // // //   otpRow: {
// // // //     flexDirection: "row",
// // // //     justifyContent: "center",
// // // //     marginVertical: 15,
// // // //   },
// // // //   otpBox: {
// // // //     width: 50,
// // // //     height: 50,
// // // //     borderWidth: 1,
// // // //     borderColor: "#ccc",
// // // //     borderRadius: 10,
// // // //     textAlign: "center",
// // // //     fontSize: 20,
// // // //     marginHorizontal: 8,
// // // //   },
// // // //   activeOtp: { borderColor: "#43C6AC" },
// // // //   resendText: {
// // // //     textAlign: "center",
// // // //     color: "#777",
// // // //     fontSize: 13,
// // // //     marginTop: 10,
// // // //   },
// // // //   errorText: {
// // // //     color: "red",
// // // //     textAlign: "center",
// // // //     marginBottom: 10,
// // // //     fontSize: 13,
// // // //   },
// // // //   flag: { fontSize: 20, marginRight: 5 },
// // // //   countryRow: {
// // // //     flexDirection: "row",
// // // //     justifyContent: "space-between",
// // // //     paddingVertical: 15,
// // // //     borderBottomWidth: 1,
// // // //     borderColor: "#eee",
// // // //   },
// // // //   countryName: { fontSize: 16, color: "#333" },
// // // //   countryCode: { fontSize: 15, color: "#777" },
// // // // });
