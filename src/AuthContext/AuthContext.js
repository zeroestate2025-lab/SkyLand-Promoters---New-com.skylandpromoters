// AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { navigationRef } from "../navigation/navigationRef"; // ✅ Ensure navigationRef is exported from your navigationRef.js

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Load saved token when app starts
  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          console.log("🔑 Loaded token from storage");
          setUserToken(token);
        } else {
          console.log("🚫 No token found in storage");
        }
      } catch (err) {
        console.log("❌ Error loading token:", err);
      } finally {
        setLoading(false);
      }
    };
    loadToken();
  }, []);

  // ✅ Login method
  const login = async (token) => {
    try {
      await AsyncStorage.setItem("authToken", token);
      setUserToken(token);
      console.log("✅ User logged in successfully, token stored.");

      // Optional: Reset navigation to ChooseCategory (fresh flow)
      navigationRef.current?.reset({
        index: 0,
        routes: [{ name: "ChooseCategory" }],
      });
    } catch (err) {
      console.log("❌ Error in login:", err);
    }
  };

  // ✅ Logout method
  const logout = async () => {
    try {
      await AsyncStorage.removeItem("authToken");
      setUserToken(null);
      console.log("👋 User logged out, token cleared.");

      // Reset navigation to Login screen
      navigationRef.current?.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (err) {
      console.log("❌ Error during logout:", err);
    }
  };

  // ✅ AuthContext values
  return (
    <AuthContext.Provider value={{ userToken, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// // AuthContext.js
// import React, { createContext, useState, useEffect } from "react";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { navigationRef } from "../navigation/navigationRef";  // make sure you exported this

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [userToken, setUserToken] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const loadToken = async () => {
//       try {
//         const token = await AsyncStorage.getItem("authToken");
//         setUserToken(token);
//       } catch (err) {
//         console.log("Error loading token", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadToken();
//   }, []);

//   const login = async (token) => {
//     await AsyncStorage.setItem("authToken", token);
//     setUserToken(token);
//   };

//   const logout = async () => {
//     await AsyncStorage.removeItem("authToken");
//     setUserToken(null);

//     // 👇 Reset to "Login" not "LoginScreen"
//     navigationRef.current?.reset({
//       index: 0,
//       routes: [{ name: "Login" }],
//     });
//   };

//   return (
//     <AuthContext.Provider value={{ userToken, login, logout, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };
