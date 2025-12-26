import { DefaultTheme, DarkTheme } from "@react-navigation/native";

export const LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#4CAF50",   // always green
    background: "#f9f9f9",
    card: "#fff",
    text: "#000",
    border: "#ccc",
  },
};

export const DarkThemeCustom = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: "#4CAF50",   // ✅ override blue with green
    background: "#121212",
    card: "#1e1e1e",
    text: "#fff",
    border: "#333",
  },
};
