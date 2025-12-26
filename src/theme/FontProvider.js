import React, { useEffect } from "react";
import { Text, TextInput } from "react-native";

export default function FontProvider({ children }) {
  useEffect(() => {
    const customFont = "Poppins-Regular";

    // Apply global font to all Text and TextInput components
    if (Text.defaultProps == null) Text.defaultProps = {};
    if (TextInput.defaultProps == null) TextInput.defaultProps = {};

    Text.defaultProps.style = { fontFamily: customFont };
    TextInput.defaultProps.style = { fontFamily: customFont };
    console.log(`✅ Global font applied: ${customFont}`);
  }, []);
  console.log('✅ Fonts loaded successfully');


  return <>{children}</>;
}
