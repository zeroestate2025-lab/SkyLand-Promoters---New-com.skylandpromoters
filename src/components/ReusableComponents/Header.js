import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { useTheme } from "@react-navigation/native";
import GlobalText from "../../theme/GlobalText"; // 👈 Import global text
import { User } from "lucide-react-native";

export default function Header() {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View>
        <GlobalText style={[styles.greeting, { color: colors.text }]}>
          Hello!
        </GlobalText>
        <GlobalText style={[styles.name, { color: colors.text }]}>
          James Butler
        </GlobalText>
      </View>
      {/* Placeholder avatar (white user icon on colored circle) */}
      <View style={[styles.avatar, { backgroundColor: "#fff" }]}> 
        <User size={20} color="#999" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 50,
  },
  greeting: {
    fontSize: 14,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});

