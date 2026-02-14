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
