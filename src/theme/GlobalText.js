import React from "react";
import { Text } from "react-native";

/**
 * ✅ GlobalText
 * A universal text component that applies Poppins font globally.
 * 
 * Props:
 *  - bold → Poppins-Bold
 *  - semiBold → Poppins-SemiBold
 *  - medium → Poppins-Medium
 *  - light → Poppins-Light
 *  - regular (default) → Poppins-Regular
 * 
 * Example:
 *  <GlobalText bold style={{ fontSize: 18 }}>Hello World</GlobalText>
 */

export default function GlobalText({
  bold,
  semiBold,
  medium,
  light,
  regular,
  style,
  children,
  ...rest
}) {
  let fontFamily = "Poppins-Regular"; // default

  if (bold) fontFamily = "Poppins-Bold";
  else if (semiBold) fontFamily = "Poppins-SemiBold";
  else if (medium) fontFamily = "Poppins-Medium";
  else if (light) fontFamily = "Poppins-Light";
  else if (regular) fontFamily = "Poppins-Regular";

  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily,
          color: "#000", // Default color
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

