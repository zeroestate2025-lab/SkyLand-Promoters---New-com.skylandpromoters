import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { useTheme } from "@react-navigation/native";
import GlobalText from "../../theme/GlobalText"; // 👈 import your global text component

export default function OwnerCard({ name, role, review, rating, avatar }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Image source={{ uri: avatar }} style={styles.avatar} />
        <View>
          <GlobalText style={[styles.name, { color: colors.text }]}>
            {name}
          </GlobalText>
          <GlobalText style={[styles.role, { color: colors.secondaryText }]}>
            {role}
          </GlobalText>
        </View>
      </View>

      <GlobalText style={[styles.review, { color: colors.text }]}>
        {review}
      </GlobalText>

      <GlobalText style={styles.rating}>⭐ {rating}</GlobalText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  name: {
    fontSize: 14,
    fontWeight: "bold",
  },
  role: {
    fontSize: 12,
  },
  review: {
    marginVertical: 10,
    fontSize: 13,
  },
  rating: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFA500",
  },
});
