import React, { useContext, useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LightTheme } from "../assets/DisplayModes/theme";
import { AuthContext } from "../AuthContext/AuthContext.js";
import { navigationRef } from "./navigationRef";

// ------------------- Screens -------------------
import SplashScreen from "../screens/Auth/SplashScreen";
import Onboarding1 from "../screens/Auth/Onboarding1";
import LoginScreen from "../screens/Auth/LoginScreen";
import QuickLoginScreen from "../screens/Auth/QuickLoginScreen";
import ChooseCategoryScreen from "../screens/Auth/ChooseCategoryScreen";
import HomeScreen from "../screens/Home/HomeScreen";
import MatchedPropertiesScreen from "../screens/Home/MatchedPropertiesScreen";
import PropertyDetailsScreen from "../screens/PropertyDetailFullPage/PropertyDetailsScreen";
import SettingsScreen from "../screens/setting/SettingsScreen";
import OwnerProfileScreen from "../screens/setting/OwnerProfileScreen";
import AddPropertyScreen from "../screens/PropertyAddingPage/AddPropertyScreen";
import SuccessScreen from "../screens/PropertyAddingPage/SuccessScreen";
import PrivacyPolicyScreen from "../screens/setting/PrivacyPolicyScreen";
import SavedPropertiesScreen from "../screens/SavedProperty/SavedPropertiesScreen";
import MessagesScreen from "../screens/MessagePage/MessagesScreen";
import ChatScreen from "../screens/MessagePage/ChatScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { userToken, loading } = useContext(AuthContext);
  const [splashVisible, setSplashVisible] = useState(true);
  const [checking, setChecking] = useState(true);
  const [isNewInstall, setIsNewInstall] = useState(false);
  const [categoryChosen, setCategoryChosen] = useState(false);

  // ✅ Check install + category
  useEffect(() => {
    const checkInstallAndCategory = async () => {
      try {
        const isFirstInstall = await AsyncStorage.getItem("isFirstInstall");
        const category = await AsyncStorage.getItem("selectedCategory");

        if (!isFirstInstall) {
          setIsNewInstall(true);
          await AsyncStorage.setItem("isFirstInstall", "true");
        } else {
          setIsNewInstall(false);
        }

        setCategoryChosen(!!category);
      } catch (err) {
        console.log("Error checking AsyncStorage:", err);
      } finally {
        setChecking(false);
      }
    };
    checkInstallAndCategory();
  }, []);

  // ✅ Smart splash hide
  useEffect(() => {
    if (!loading && !checking) {
      const timer = setTimeout(() => setSplashVisible(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, checking]);

  // ✅ While waiting for async tasks
  if (loading || checking || splashVisible) {
    return <SplashScreen />;
  }

  // ✅ Decide what to render dynamically (not static initialRoute)
  return (
    <NavigationContainer ref={navigationRef} theme={LightTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!userToken ? (
          // 🔹 Not logged in
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="QuickLogin" component={QuickLoginScreen} />
            <Stack.Screen name="Onboarding1" component={Onboarding1} />
          </>
        ) : (
          // 🔹 Logged in
          <>
            {isNewInstall && !categoryChosen ? (
              <Stack.Screen
                name="ChooseCategory"
                component={ChooseCategoryScreen}
              />
            ) : (
              <Stack.Screen
                name="ChooseCategory"
                component={ChooseCategoryScreen}
              />
            )}
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen
              name="MatchedProperties"
              component={MatchedPropertiesScreen}
            />
            <Stack.Screen
              name="PropertyDetails"
              component={PropertyDetailsScreen}
            />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="OwnerProfile" component={OwnerProfileScreen} />
            <Stack.Screen name="AddProperty" component={AddPropertyScreen} />
            <Stack.Screen name="Success" component={SuccessScreen} />
            <Stack.Screen
              name="PrivacyPolicy"
              component={PrivacyPolicyScreen}
            />
            <Stack.Screen
              name="SavedProperties"
              component={SavedPropertiesScreen}
            />
            <Stack.Screen name="Messages" component={MessagesScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}


// import React, { useContext, useEffect, useState } from "react";
// import { NavigationContainer } from "@react-navigation/native";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import { View, ActivityIndicator } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { LightTheme } from "../assets/DisplayModes/theme";
// import { AuthContext } from "../AuthContext/AuthContext.js";

// // Auth Screens
// import SplashScreen from "../screens/Auth/SplashScreen";
// import Onboarding1 from "../screens/Auth/Onboarding1";
// import LoginScreen from "../screens/Auth/LoginScreen";
// import QuickLoginScreen from "../screens/Auth/QuickLoginScreen";

// // Main App Screens
// import HomeScreen from "../screens/Home/HomeScreen";
// import MatchedPropertiesScreen from "../screens/Home/MatchedPropertiesScreen";
// import PropertyDetailsScreen from "../screens/PropertyDetailFullPage/PropertyDetailsScreen";

// // Settings & Profile
// import SettingsScreen from "../screens/setting/SettingsScreen";
// import OwnerProfileScreen from "../screens/setting/OwnerProfileScreen";
// import AddPropertyScreen from "../screens/PropertyAddingPage/AddPropertyScreen";
// import SuccessScreen from "../screens/PropertyAddingPage/SuccessScreen";
// import PrivacyPolicyScreen from "../screens/setting/PrivacyPolicyScreen";

// // Saved Properties
// import SavedPropertiesScreen from "../screens/SavedProperty/SavedPropertiesScreen";

// // Messages
// import MessagesScreen from "../screens/MessagePage/MessagesScreen";
// import ChatScreen from "../screens/MessagePage/ChatScreen";

// // New Category Selection Screen
// import ChooseCategoryScreen from "../screens/Auth/ChooseCategoryScreen";

// import { navigationRef } from "./navigationRef";
// import { DefaultTheme } from "@react-navigation/native";

// const Stack = createNativeStackNavigator();

// export default function AppNavigator() {
//   const { userToken, loading } = useContext(AuthContext);
//   const [splashVisible, setSplashVisible] = useState(true);
//   const [onboardingSeen, setOnboardingSeen] = useState(false);
//   const [categoryChosen, setCategoryChosen] = useState(false);
//   const [checking, setChecking] = useState(true);

//   useEffect(() => {
//     const checkStatus = async () => {
//       try {
//         const seen = await AsyncStorage.getItem("onboardingSeen");
//         setOnboardingSeen(!!seen);

//         const category = await AsyncStorage.getItem("selectedCategory");
//         setCategoryChosen(!!category);
//       } catch (e) {
//         console.error("Error checking onboarding/category status:", e);
//       } finally {
//         setChecking(false);
//       }
//     };
//     checkStatus();
//   }, []);

//   // Splash Screen Timer
//   useEffect(() => {
//     const timer = setTimeout(() => setSplashVisible(false), 2000);
//     return () => clearTimeout(timer);
//   }, []);

//   if (loading || checking) {
//     return (
//       <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//         <ActivityIndicator size="large" color="#43C6AC" />
//       </View>
//     );
//   }

//   return (
//     <NavigationContainer ref={navigationRef} theme={LightTheme}>
//       <Stack.Navigator screenOptions={{ headerShown: false }}>
//         {/* ✅ SPLASH */}
//         {splashVisible ? (
//           <Stack.Screen name="Splash" component={SplashScreen} />
//         ) : userToken ? (
//           // ✅ LOGGED-IN FLOW
//           <>
//             {!categoryChosen ? (
//               <Stack.Screen
//                 name="ChooseCategory"
//                 component={ChooseCategoryScreen}
//                 options={{ headerShown: false }}
//               />
//             ) : null}

//             <Stack.Screen name="Home" component={HomeScreen} />
//             <Stack.Screen
//               name="MatchedProperties"
//               component={MatchedPropertiesScreen}
//             />
//             <Stack.Screen
//               name="PropertyDetails"
//               component={PropertyDetailsScreen}
//             />
//             <Stack.Screen name="Settings" component={SettingsScreen} />
//             <Stack.Screen name="OwnerProfile" component={OwnerProfileScreen} />
//             <Stack.Screen name="AddProperty" component={AddPropertyScreen} />
//             <Stack.Screen name="Success" component={SuccessScreen} />
//             <Stack.Screen
//               name="PrivacyPolicy"
//               component={PrivacyPolicyScreen}
//             />
//             <Stack.Screen
//               name="SavedProperties"
//               component={SavedPropertiesScreen}
//             />
//             <Stack.Screen name="Messages" component={MessagesScreen} />
//             <Stack.Screen name="Chat" component={ChatScreen} />
//           </>
//         ) : (
//           // ✅ LOGGED OUT FLOW
//           <>
//             {!onboardingSeen ? (
//               <Stack.Screen
//                 name="Onboarding1"
//                 component={Onboarding1}
//                 options={{ headerShown: false }}
//               />
//             ) : null}
//             <Stack.Screen name="Login" component={LoginScreen} />
//             <Stack.Screen name="QuickLogin" component={QuickLoginScreen} />
//           </>
//         )}
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }

// import React, { useContext, useEffect, useState } from "react";
// import { NavigationContainer } from "@react-navigation/native";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import { View, ActivityIndicator } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { LightTheme, DarkThemeCustom } from "../assets/DisplayModes/theme";
// import { AuthContext } from "../AuthContext/AuthContext.js";

// // Auth Screens
// import SplashScreen from "../screens/Auth/SplashScreen";
// import Onboarding1 from "../screens/Auth/Onboarding1";
// import LoginScreen from "../screens/Auth/LoginScreen";
// import QuickLoginScreen from "../screens/Auth/QuickLoginScreen";

// // Main App Screens
// import HomeScreen from "../screens/Home/HomeScreen";
// import MatchedPropertiesScreen from "../screens/Home/MatchedPropertiesScreen";
// import PropertyDetailsScreen from "../screens/PropertyDetailFullPage/PropertyDetailsScreen";

// // Settings & Profile
// import SettingsScreen from "../screens/setting/SettingsScreen";
// import OwnerProfileScreen from "../screens/setting/OwnerProfileScreen";
// import AddPropertyScreen from "../screens/PropertyAddingPage/AddPropertyScreen";
// import SuccessScreen from "../screens/PropertyAddingPage/SuccessScreen";
// import PrivacyPolicyScreen from "../screens/setting/PrivacyPolicyScreen";

// // Saved Properties
// import SavedPropertiesScreen from "../screens/SavedProperty/SavedPropertiesScreen";

// // Messages
// import MessagesScreen from "../screens/MessagePage/MessagesScreen";
// import ChatScreen from "../screens/MessagePage/ChatScreen";
// import ChooseCategoryScreen from "../screens/Auth/ChooseCategoryScreen";

// import { navigationRef } from "./navigationRef";

// import { DefaultTheme } from "@react-navigation/native";


// const Stack = createNativeStackNavigator();

// export default function AppNavigator() {
//   const { userToken, loading } = useContext(AuthContext);
//   const [splashVisible, setSplashVisible] = useState(true);
//   const [onboardingSeen, setOnboardingSeen] = useState(false);
//   const [checking, setChecking] = useState(true);

//   useEffect(() => {
//     const checkOnboardingStatus = async () => {
//       try {
//         const seen = await AsyncStorage.getItem("onboardingSeen");
//         setOnboardingSeen(!!seen);
//       } catch (e) {
//         console.error("Error checking onboarding status:", e);
//       } finally {
//         setChecking(false);
//       }
//     };
//     checkOnboardingStatus();
//   }, []);

//   // Splash Screen Timer
//   useEffect(() => {
//     const timer = setTimeout(() => setSplashVisible(false), 2000); // 2 seconds
//     return () => clearTimeout(timer);
//   }, []);

//   if (loading || checking) {
//     return (
//       <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//         <ActivityIndicator size="large" color="#43C6AC" />
//       </View>
//     );
//   }

// const CustomTheme = {
//   ...DefaultTheme,
//   colors: {
//     ...DefaultTheme.colors,
//     primary: "#20A68B",
//     background: "#F9F9F9",
//     card: "#FFFFFF",
//     text: "#1A1A1A",
//     border: "#E0E0E0",
//   },
//   fonts: {
//     regular: { fontFamily: "Poppins-Regular" },
//     medium: { fontFamily: "Poppins-Medium" },
//     bold: { fontFamily: "Poppins-Bold" },
//   },
// };


//   return (
//     <NavigationContainer
//       ref={navigationRef}
//       theme={LightTheme}
//     >
//       <Stack.Navigator screenOptions={{ headerShown: false }}>
//         {/* ✅ SPLASH → always first */}
//         {splashVisible ? (
//           <Stack.Screen name="Splash" component={SplashScreen} />
//         ) : userToken ? (
//           // ✅ LOGGED IN ROUTES
//           <>
//             <Stack.Screen name="Home" component={HomeScreen} />
//             <Stack.Screen name="MatchedProperties" component={MatchedPropertiesScreen} />
//             <Stack.Screen name="PropertyDetails" component={PropertyDetailsScreen} />
//             <Stack.Screen name="Settings" component={SettingsScreen} />
//             <Stack.Screen name="OwnerProfile" component={OwnerProfileScreen} />
//             <Stack.Screen name="AddProperty" component={AddPropertyScreen} />
//             <Stack.Screen name="Success" component={SuccessScreen} />
//             <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
//             <Stack.Screen name="SavedProperties" component={SavedPropertiesScreen} />
//             <Stack.Screen name="Messages" component={MessagesScreen} />
//             <Stack.Screen name="Chat" component={ChatScreen} />
//           </>
//         ) : (
//           // ✅ LOGGED OUT ROUTES
//           <>
//             {!onboardingSeen ? (
//               <Stack.Screen
//                 name="Onboarding1"
//                 component={Onboarding1}
//                 options={{ headerShown: false }}
//               />
//             ) : null}

//             <Stack.Screen name="Login" component={LoginScreen} />
//             <Stack.Screen name="QuickLogin" component={QuickLoginScreen} />
//           </>
//         )}
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }
