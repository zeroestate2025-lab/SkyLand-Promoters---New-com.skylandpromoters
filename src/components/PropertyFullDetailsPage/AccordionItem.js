import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useTheme } from "@react-navigation/native";
import GlobalText from "../../theme/GlobalText"; // 👈 import your global text

export default function AccordionItem({ title, children }) {
  const [open, setOpen] = useState(false);
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <TouchableOpacity style={styles.header} onPress={() => setOpen(!open)}>
        <GlobalText style={[styles.title, { color: colors.text }]}>
          {title}
        </GlobalText>

        <Icon
          name={open ? "chevron-up" : "chevron-down"}
          size={22}
          color={colors.text}
        />
      </TouchableOpacity>

      {open && (
        <View style={[styles.content, { borderColor: colors.border }]}>
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    alignItems: "center",
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
  },
  content: {
    padding: 12,
    borderTopWidth: 1,
  },
});
