import React from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useTheme } from "@react-navigation/native";
import GlobalText from "../../theme/GlobalText"; // 👈 Import GlobalText

export default function SearchBar({ onFilterPress }) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {/* 🔍 Search Box */}
      <View style={[styles.searchBox, { backgroundColor: colors.card }]}>
        <Icon name="magnify" size={20} color={colors.text} />
        <TextInput
          placeholder="Search..."
          placeholderTextColor={colors.text}
          style={[styles.input, { color: colors.text }]}
        />
      </View>

      {/* 🎛 Filter Button */}
      <TouchableOpacity
        style={[styles.filterBtn, { backgroundColor: colors.primary }]}
        onPress={onFilterPress}
        activeOpacity={0.8}
      >
        <GlobalText style={styles.filterText}>Filters</GlobalText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 20,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 15,
    paddingHorizontal: 10,
    elevation: 3,
    height: 45,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  filterBtn: {
    marginLeft: 10,
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 45,
    justifyContent: "center",
    elevation: 3,
  },
  filterText: {
    color: "#fff",
    fontWeight: "600",
  },
});
