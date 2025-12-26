import React from "react";
import { Text, TextInput } from "react-native";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/AuthContext/AuthContext";
import FontProvider from "./src/theme/FontProvider";

// ✅ Global font style
const customTextProps = {
  style: {
    fontFamily: "Poppins-Regular", // 👈 must match font name exactly
  },
};

// ✅ Apply default font (ignore TS warning safely)
(Text as any).defaultProps = (Text as any).defaultProps || {};
(Text as any).defaultProps.style = customTextProps.style;

(TextInput as any).defaultProps = (TextInput as any).defaultProps || {};
(TextInput as any).defaultProps.style = customTextProps.style;

export default function App() {
  return (
    <AuthProvider>
      <FontProvider>
        <AppNavigator />
      </FontProvider>
    </AuthProvider>
  );
}


// import React from "react";
// import AppNavigator from "./src/navigation/AppNavigator";  // Import your navigation
// import { AuthProvider } from "./src/AuthContext/AuthContext"; 

// export default function App() {
//    return (
//     <AuthProvider>
//       <AppNavigator />
//     </AuthProvider>
//   );
// }


// /**
//  * Sample React Native App
//  * https://github.com/facebook/react-native
//  *
//  * @format
//  */

// import { NewAppScreen } from '@react-native/new-app-screen';
// import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
// import {
//   SafeAreaProvider,
//   useSafeAreaInsets,
// } from 'react-native-safe-area-context';

// function App() {
//   const isDarkMode = useColorScheme() === 'dark';

//   return (
//     <SafeAreaProvider>
//       <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
//       <AppContent />
//     </SafeAreaProvider>
//   );
// }

// function AppContent() {
//   const safeAreaInsets = useSafeAreaInsets();

//   return (
//     <View style={styles.container}>
//       <NewAppScreen
//         templateFileName="App.tsx"
//         safeAreaInsets={safeAreaInsets}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
// });

// export default App;
