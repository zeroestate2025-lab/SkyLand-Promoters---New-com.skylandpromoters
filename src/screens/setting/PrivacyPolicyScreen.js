import React from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, useColorScheme } from "react-native";
import * as Animatable from "react-native-animatable";
import { SafeAreaView } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import { useTheme } from "@react-navigation/native";
import AnimatedBackground from "../../components/ReusableComponents/AnimatedBackground";
import GlobalText from "../../theme/GlobalText";
import { ArrowLeft, ShieldCheck, Info, Mail, UserCog } from "lucide-react-native";

export default function PrivacyPolicyScreen({ navigation }) {
  const { colors } = useTheme();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const bg = isDark ? "#121212" : "#F9F9F9";
  const card = isDark ? "#1E1E1E" : "#fff";
  const text = isDark ? "#EDEDED" : "#555";

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <AnimatedBackground />

      <LinearGradient
        colors={isDark ? ["#114D44", "#0D3732"] : ["#43C6AC", "#20A68B"]}
        style={styles.headerContainer}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <GlobalText bold style={styles.headerTitle}>
            Privacy Policy
          </GlobalText>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        {[
          {
            icon: Info,
            title: "Introduction",
            content:
              "At Sky Land Promoters, your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you use our services.",
          },
          {
            icon: ShieldCheck,
            title: "Information We Collect",
            content:
              "• Personal details such as name, phone number, and email.\n• Property-related information when you list or browse properties.\n• Usage data to improve our app experience.",
          },
          {
            icon: UserCog,
            title: "How We Use Your Information",
            content:
              "• To provide and improve our services.\n• To communicate updates and offers.\n• To ensure security and prevent fraudulent activity.",
          },
          {
            icon: ShieldCheck,
            title: "Your Rights",
            content:
              "You have the right to access, modify, or delete your personal data at any time. Please contact our support team for assistance.",
          },
          {
            icon: Mail,
            title: "Contact Us",
            content:
              "If you have any questions about this Privacy Policy, please reach out to us at:\n\nsupport@zeroestate.com",
          },
        ].map((section, index) => (
          <Animatable.View
            key={index}
            animation="fadeInUp"
            delay={index * 150}
            duration={800}
            style={[styles.card, { backgroundColor: card }]}
          >
            <View style={styles.sectionHeader}>
              <section.icon size={18} color="#20A68B" />
              <GlobalText bold style={[styles.sectionTitle, { color: "#20A68B" }]}>
                {section.title}
              </GlobalText>
            </View>
            <GlobalText style={[styles.paragraph, { color: text }]}>{section.content}</GlobalText>
          </Animatable.View>
        ))}

        <TouchableOpacity
          style={styles.backButtonWrapper}
          onPress={() => navigation.goBack()}
          activeOpacity={0.9}
        >
          <LinearGradient colors={["#43C6AC", "#20A68B"]} style={styles.backButton}>
            <GlobalText bold style={styles.backButtonText}>Back to Settings</GlobalText>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { padding: 20, paddingBottom: 80 },
  headerContainer: {
    paddingTop: 15,
    paddingBottom: 15,
    elevation: 8,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  headerTitle: { fontSize: 18, color: "#fff", textAlign: "center", flex: 1 },
  iconBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    elevation: 5,
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  sectionTitle: { fontSize: 16, marginLeft: 8 },
  paragraph: { fontSize: 14, lineHeight: 22 },
  backButtonWrapper: { marginTop: 10, alignItems: "center" },
  backButton: {
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 40,
    elevation: 4,
  },
  backButtonText: { color: "#fff", fontSize: 15 },
});

// import React from "react";
// import {
//   View,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
// } from "react-native";
// import * as Animatable from "react-native-animatable";
// import { SafeAreaView } from "react-native-safe-area-context";
// import LinearGradient from "react-native-linear-gradient";
// import { useTheme } from "@react-navigation/native";
// import AnimatedBackground from "../../components/ReusableComponents/AnimatedBackground";
// import GlobalText from "../../theme/GlobalText"; // ✅ unified typography
// import { ArrowLeft, ShieldCheck, Info, Mail, UserCog } from "lucide-react-native";

// export default function PrivacyPolicyScreen({ navigation }) {
//   const { colors } = useTheme();

//   return (
//     <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
//       <AnimatedBackground />

//       {/* 🌿 Header */}
//       <LinearGradient
//         colors={["#43C6AC", "#20A68B"]}
//         style={styles.headerContainer}
//       >
//         <View style={styles.header}>
//           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
//             <ArrowLeft size={24} color="#fff" />
//           </TouchableOpacity>
//           <GlobalText bold style={styles.headerTitle}>
//             Privacy Policy
//           </GlobalText>
//           <View style={{ width: 40 }} />
//         </View>
//       </LinearGradient>

//       {/* 🌿 Content */}
//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.scrollContainer}
//       >
//         <Animatable.View animation="fadeInUp" duration={800} style={styles.card}>
//           <View style={styles.sectionHeader}>
//             <Info size={18} color="#20A68B" />
//             <GlobalText bold style={styles.sectionTitle}>Introduction</GlobalText>
//           </View>
//           <GlobalText style={styles.paragraph}>
//             At <GlobalText style={styles.brand}>Zero Estate</GlobalText>, your privacy is important to us.
//             This Privacy Policy explains how we collect, use, and protect your
//             information when you use our services.
//           </GlobalText>
//         </Animatable.View>

//         <Animatable.View animation="fadeInUp" delay={150} duration={800} style={styles.card}>
//           <View style={styles.sectionHeader}>
//             <ShieldCheck size={18} color="#20A68B" />
//             <GlobalText bold style={styles.sectionTitle}>Information We Collect</GlobalText>
//           </View>
//           <GlobalText style={styles.paragraph}>
//             • Personal details such as name, phone number, and email. {"\n"}
//             • Property-related information when you list or browse properties. {"\n"}
//             • Usage data to improve our app experience.
//           </GlobalText>
//         </Animatable.View>

//         <Animatable.View animation="fadeInUp" delay={300} duration={800} style={styles.card}>
//           <View style={styles.sectionHeader}>
//             <UserCog size={18} color="#20A68B" />
//             <GlobalText bold style={styles.sectionTitle}>How We Use Your Information</GlobalText>
//           </View>
//           <GlobalText style={styles.paragraph}>
//             • To provide and improve our services. {"\n"}
//             • To communicate updates and offers. {"\n"}
//             • To ensure security and prevent fraudulent activity.
//           </GlobalText>
//         </Animatable.View>

//         <Animatable.View animation="fadeInUp" delay={450} duration={800} style={styles.card}>
//           <View style={styles.sectionHeader}>
//             <ShieldCheck size={18} color="#20A68B" />
//             <GlobalText bold style={styles.sectionTitle}>Your Rights</GlobalText>
//           </View>
//           <GlobalText style={styles.paragraph}>
//             You have the right to access, modify, or delete your personal data at
//             any time. Please contact our support team for assistance.
//           </GlobalText>
//         </Animatable.View>

//         <Animatable.View animation="fadeInUp" delay={600} duration={800} style={styles.card}>
//           <View style={styles.sectionHeader}>
//             <Mail size={18} color="#20A68B" />
//             <GlobalText bold style={styles.sectionTitle}>Contact Us</GlobalText>
//           </View>
//           <GlobalText style={styles.paragraph}>
//             If you have any questions about this Privacy Policy, please reach
//             out to us at: {"\n"}
//             <GlobalText style={styles.email}>support@zeroestate.com</GlobalText>
//           </GlobalText>
//         </Animatable.View>

//         {/* 🌿 Back Button */}
//         <TouchableOpacity
//           style={styles.backButtonWrapper}
//           onPress={() => navigation.goBack()}
//           activeOpacity={0.9}
//         >
//           <LinearGradient colors={["#43C6AC", "#20A68B"]} style={styles.backButton}>
//             <GlobalText bold style={styles.backButtonText}>
//               Back to Settings
//             </GlobalText>
//           </LinearGradient>
//         </TouchableOpacity>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "transparent" },
//   scrollContainer: { padding: 20, paddingBottom: 80 },

//   headerContainer: {
//     paddingTop: 15,
//     paddingBottom: 15,
//     elevation: 8,
//     shadowColor: "#20A68B",
//     shadowOpacity: 0.25,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 6,
//     borderBottomLeftRadius: 20,
//     borderBottomRightRadius: 20,
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 15,
//   },
//   headerTitle: { fontSize: 18, color: "#fff", textAlign: "center", flex: 1 },
//   iconBtn: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 14,
//     padding: 16,
//     marginBottom: 16,
//     elevation: 5,
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//     shadowOffset: { width: 0, height: 3 },
//   },
//   sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
//   sectionTitle: { fontSize: 16, marginLeft: 8, color: "#20A68B" },
//   paragraph: { fontSize: 14, lineHeight: 22, color: "#555" },
//   brand: { color: "#20A68B", fontWeight: "700" },
//   email: { fontWeight: "700", color: "#20A68B" },

//   backButtonWrapper: { marginTop: 10, alignItems: "center" },
//   backButton: {
//     borderRadius: 25,
//     paddingVertical: 12,
//     paddingHorizontal: 40,
//     elevation: 4,
//   },
//   backButtonText: { color: "#fff", fontSize: 15 },
// });
