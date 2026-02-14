import React from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import GlobalText from "../../theme/GlobalText";
import { useTheme } from "@react-navigation/native";

export default function CategoryCard({ icon, name }) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  // ✅ Responsive scaling based on device width
  const cardSize = width < 360 ? 70 : width < 420 ? 80 : 90;
  const iconSize = width < 360 ? 22 : width < 420 ? 26 : 30;
  const fontSize = width < 360 ? 10 : width < 420 ? 11 : 12;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          width: cardSize,
          height: cardSize,
          borderRadius: cardSize * 0.3,
        },
      ]}
    >
      <Icon name={icon} size={iconSize} color={colors.primary || "#43C6AC"} />
      <GlobalText
        numberOfLines={1}
        ellipsizeMode="tail"
        adjustsFontSizeToFit
        style={[
          styles.text,
          { color: colors.text, fontSize, maxWidth: cardSize * 0.9 },
        ]}
      >
        {name}
      </GlobalText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  text: {
    marginTop: 5,
    textAlign: "center",
    includeFontPadding: false,
  },
});

