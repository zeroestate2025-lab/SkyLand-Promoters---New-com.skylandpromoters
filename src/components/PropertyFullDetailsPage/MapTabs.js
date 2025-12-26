import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "@react-navigation/native";
import GlobalText from "../../theme/GlobalText"; // 👈 import global text

export default function MapTabs() {
  const [active, setActive] = useState("Location");
  const { colors } = useTheme();

  const tabs = ["Location"];

  return (
    <View style={styles.container}>
      <View style={styles.tabRow}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabBtn,
              {
                backgroundColor:
                  active === tab ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setActive(tab)}
          >
            <GlobalText
              style={[
                styles.tabText,
                { color: active === tab ? colors.card : colors.text },
              ]}
            >
              {tab}
            </GlobalText>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.mapBox, { backgroundColor: colors.border }]}>
        <GlobalText style={{ color: colors.text }}>
          🗺 Showing {active} Map here
        </GlobalText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 15, marginBottom: 25 },
  tabRow: { flexDirection: "row", marginBottom: 10 },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: "center",
  },
  tabText: { fontSize: 14, fontWeight: "600" },
  mapBox: {
    height: 150,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
