import React from "react";
import { View, StyleSheet, Image } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useTheme } from "@react-navigation/native";
import GlobalText from "../../theme/GlobalText"; // 👈 Import global text component

export default function PropertyHeader({
  title,
  price,
  location,
  size,
  image,
  bed,
  bath,
  kitchen,
}) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <Image source={{ uri: image }} style={styles.image} />

      <View style={styles.details}>
        {/* 🏠 Title */}
        <GlobalText style={[styles.title, { color: colors.text }]}>
          {title}
        </GlobalText>

        {/* 💰 Price */}
        <GlobalText style={[styles.price, { color: colors.primary }]}>
          ${price}
        </GlobalText>

        {/* 📍 Location */}
        <View style={styles.locationRow}>
          <Icon name="map-marker" size={14} color={colors.text} />
          <GlobalText style={[styles.location, { color: colors.text }]}>
            {location} ({size})
          </GlobalText>
        </View>

        {/* 🛏️ Features */}
        <View style={styles.featuresRow}>
          <Icon name="bed" size={16} color="tomato" />
          <GlobalText style={[styles.featureText, { color: colors.text }]}>
            {bed} Bed
          </GlobalText>

          <Icon name="shower" size={16} color="#2196F3" />
          <GlobalText style={[styles.featureText, { color: colors.text }]}>
            {bath} Bath
          </GlobalText>

          <Icon name="silverware-fork-knife" size={16} color="#4CAF50" />
          <GlobalText style={[styles.featureText, { color: colors.text }]}>
            {kitchen} Kitchen
          </GlobalText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 15,
    padding: 12,
    elevation: 3,
    marginBottom: 15,
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: 12,
  },
  details: {
    marginTop: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  price: {
    fontSize: 16,
    fontWeight: "600",
    marginVertical: 5,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  location: {
    fontSize: 13,
    marginLeft: 5,
  },
  featuresRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    flexWrap: "wrap",
  },
  featureText: {
    fontSize: 12,
    marginHorizontal: 6,
  },
});
