
import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  useColorScheme,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useRoute, useTheme } from "@react-navigation/native";
import {
  Home,
  Bookmark,
  BookmarkCheck,
  Plus,
  User,
  HomeIcon,
} from "lucide-react-native";
import GlobalText from "../../theme/GlobalText";

export default function BottomNav({ navigation }) {
  const route = useRoute();
  const { colors } = useTheme();
  const scheme = useColorScheme();
  const { width, height } = useWindowDimensions();

  const isDark = scheme === "dark";

  // ✅ Dynamic responsive scaling
  const iconSize = width < 360 ? 22 : width < 420 ? 26 : 28;
  const fontSize = width < 360 ? 9 : width < 420 ? 10 : 11;

  const tabs = [
    { name: "Home", icon: Home, outline: HomeIcon, label: "Home" },
    {
      name: "SavedProperties",
      icon: BookmarkCheck,
      outline: Bookmark,
      label: "Saved",
    },
    { name: "Settings", icon: User, label: "Profile" },
    { name: "AddProperty", icon: Plus, isCenter: true },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? "#111" : colors.card,
          paddingVertical: height < 700 ? 6 : 8,
          borderTopColor: isDark ? "#222" : "#E5E5E5",
        },
      ]}
    >
      {tabs.map((tab, index) => {
        const isActive = route.name === tab.name;
        const IconComponent = isActive
          ? tab.icon || tab.outline
          : tab.outline || tab.icon;

        // 🟢 Center Add Button
        if (tab.isCenter) {
          return (
            <TouchableOpacity
              key={index}
              style={styles.addButtonWrapper}
              onPress={() => navigation.navigate(tab.name)}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={["#43C6AC", "#20A68B"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.addButton,
                  { width: iconSize * 2.2, height: iconSize * 2.2 },
                ]}
              >
                <Plus size={iconSize + 6} color="#fff" strokeWidth={2.4} />
              </LinearGradient>
            </TouchableOpacity>
          );
        }

        // ⚪ Regular Tabs
        const iconColor = isActive
          ? "#20A68B"
          : isDark
          ? "#AAAAAA"
          : "#9e9e9e";

        const textColor = isActive
          ? "#20A68B"
          : isDark
          ? "#CCCCCC"
          : "#9e9e9e";

        return (
          <TouchableOpacity
            key={index}
            style={styles.tabButton}
            onPress={() => navigation.navigate(tab.name)}
            activeOpacity={0.8}
          >
            <IconComponent
              size={iconSize}
              strokeWidth={isActive ? 2.6 : 2}
              color={iconColor}
              style={isActive ? styles.activeIcon : null}
            />
            <GlobalText
              numberOfLines={1}
              adjustsFontSizeToFit
              style={[
                styles.label,
                {
                  color: textColor,
                  fontSize,
                  maxWidth: 80,
                },
              ]}
            >
              {tab.label}
            </GlobalText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    elevation: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    paddingHorizontal: 5,
  },
  tabButton: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 60,
  },
  label: {
    marginTop: 2,
    includeFontPadding: false,
    textAlign: "center",
  },
  addButtonWrapper: {
    elevation: 12,
    shadowColor: "#20A68B",
    shadowOpacity: 0.45,
    shadowRadius: 10,
    borderRadius: 50,
    marginBottom: 10,
  },
  addButton: {
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  activeIcon: {
    transform: [{ scale: 1.08 }],
    shadowColor: "#43C6AC",
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
});

