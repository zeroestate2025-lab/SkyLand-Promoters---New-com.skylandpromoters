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
import MapPickerScreen from "../screens/MapPickerScreen"; 

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
            <Stack.Screen name="MapPicker" component={MapPickerScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

