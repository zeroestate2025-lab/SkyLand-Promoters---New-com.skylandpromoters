import React, { useContext, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  useColorScheme,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Animatable from "react-native-animatable";
import { useTheme } from "@react-navigation/native";

// 🟢 Icons
import {
  User,
  ShieldCheck,
  LogOut,
  ArrowLeft,
  ChevronRight,
} from "lucide-react-native";

// 🧩 Components
import BottomNav from "../../components/ReusableComponents/BottomNav";
import AnimatedBackground from "../../components/ReusableComponents/AnimatedBackground";
import GlobalText from "../../theme/GlobalText";

// 🔐 Auth
import { AuthContext } from "../../AuthContext/AuthContext";

// ⚙️ Settings Options
const settingsOptions = [
  {
    id: 1,
    title: "Personal Profile",
    icon: User,
    color: "#43C6AC",
    route: "OwnerProfile",
  },
  {
    id: 2,
    title: "Privacy Policy",
    icon: ShieldCheck,
    color: "#2ECC71",
    route: "PrivacyPolicy",
  },
  {
    id: 3,
    title: "Log Out",
    icon: LogOut,
    color: "#E53935",
    route: null,
  },
];

export default function SettingsScreen({ navigation }) {
  const { logout } = useContext(AuthContext);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const { colors } = useTheme();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  // 🎯 Logout logic
  const handleLogout = async () => {
    try {
      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: "Splash" }],
      });
    } catch (err) {
      Alert.alert("Error", "Failed to logout. Please try again.");
      console.error("Logout error:", err.message);
    }
  };

  // 🧱 Render Each Item
  const renderItem = ({ item }) => {
    const IconComponent = item.icon;
    return (
      <Animatable.View animation="fadeInUp" duration={600}>
        <TouchableOpacity
          style={[
            styles.option,
            {
              backgroundColor: isDark ? "#1E1E1E" : colors.card,
              shadowColor: isDark ? "#00000040" : "#000",
            },
          ]}
          onPress={() => {
            if (item.title === "Log Out") {
              setLogoutVisible(true);
            } else if (item.route) {
              navigation.navigate(item.route);
            } else {
              Alert.alert(item.title, "Feature coming soon!");
            }
          }}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.iconWrapper,
              { backgroundColor: item.color + "22" },
            ]}
          >
            <IconComponent size={20} color={item.color} strokeWidth={2.3} />
          </View>

          <GlobalText
            style={[
              styles.optionText,
              { color: isDark ? "#EDEDED" : "#222" },
            ]}
          >
            {item.title}
          </GlobalText>

          <ChevronRight size={20} color={isDark ? "#888" : "#777"} />
        </TouchableOpacity>
      </Animatable.View>
    );
  };

  const backgroundColor = isDark ? "#121212" : "#F9F9F9";
  const modalColor = isDark ? "#1E1E1E" : "#fff";
  const modalText = isDark ? "#EDEDED" : "#333";

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor }]}
      edges={["left", "right", "bottom"]}
    >
      <AnimatedBackground />

      {/* 🌈 Header */}
      <LinearGradient
        colors={isDark ? ["#114D44", "#0D3732"] : ["#43C6AC", "#20A68B"]}
        style={styles.headerContainer}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.iconBtn}
          >
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <GlobalText bold style={styles.headerTitle}>
            Settings
          </GlobalText>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      {/* ⚙️ Settings List */}
      <FlatList
        data={settingsOptions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
      />

      {/* 🔴 Logout Modal */}
      <Modal
        transparent
        visible={logoutVisible}
        animationType="fade"
        onRequestClose={() => setLogoutVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animatable.View animation="zoomIn" style={[styles.modalBox, { backgroundColor: modalColor }]}>
            <LogOut size={40} color="#E53935" />
            <GlobalText bold style={[styles.modalTitle, { color: modalText }]}>
              Confirm Logout
            </GlobalText>
            <GlobalText style={[styles.modalMessage, { color: isDark ? "#AAAAAA" : "#666" }]}>
              Are you sure you want to log out?
            </GlobalText>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.cancelBtn,
                  { borderColor: isDark ? "#555" : "#ccc" },
                ]}
                onPress={() => setLogoutVisible(false)}
              >
                <GlobalText
                  style={{
                    color: isDark ? "#EDEDED" : "#555",
                    fontWeight: "600",
                  }}
                >
                  Cancel
                </GlobalText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={handleLogout}
              >
                <GlobalText style={styles.logoutText}>Log Out</GlobalText>
              </TouchableOpacity>
            </View>
          </Animatable.View>
        </View>
      </Modal>

      {/* 🧭 Bottom Navigation */}
      <BottomNav navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  headerContainer: {
    paddingVertical: 15,
    elevation: 8,
    shadowColor: "#20A68B",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
    flex: 1,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  // Option Cards
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 15,
    marginTop: 12,
    borderRadius: 14,
    elevation: 3,
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  optionText: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },

  // Logout Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "80%",
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
    elevation: 6,
  },
  modalTitle: {
    fontSize: 18,
    marginTop: 10,
  },
  modalMessage: {
    fontSize: 14,
    textAlign: "center",
    marginVertical: 10,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    width: "100%",
  },
  cancelBtn: {
    flex: 1,
    marginRight: 10,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  logoutBtn: {
    flex: 1,
    marginLeft: 10,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#E53935",
    alignItems: "center",
  },
  logoutText: { fontSize: 14, fontWeight: "700", color: "#fff" },
});
