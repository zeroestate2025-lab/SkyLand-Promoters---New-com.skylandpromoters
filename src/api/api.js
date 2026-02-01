

// api.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ⚠️ Use 10.0.2.2 for Android Emulator, localhost for iOS, or your LAN IP for real device
const API = axios.create({
  baseURL: "https://zero-estate-backend-render.onrender.com/api", // 👈 change this to your backend IP
  headers: { "Content-Type": "application/json" },
});
// https://zero-estate-backend-render.onrender.com/api
// "http://172.20.10.3:5000/api"
// 
// ---------------- INTERCEPTORS ----------------
// 🔹 Attach token automatically before requests
API.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.error("Error attaching token:", err);
  }
  return config;
});


API.interceptors.request.use((config) => {
  console.log(`📡 [${config.method?.toUpperCase()}] ${config.url}`, config.data || "");
  return config;
});

API.interceptors.response.use(
  (res) => {
    console.log(`✅ [${res.status}] Response from ${res.config.url}`, res.data);
    return res;
  },
  (err) => {
    console.error(`❌ [${err.response?.status}] Error from ${err.config?.url}`, err.response?.data || err.message);
    return Promise.reject(err);
  }
);

// =======================================================
// 🔹 AUTH APIs
// =======================================================
//for the password verification api
export const registerOrLogin = async (data) => {
  try {
    const res = await API.post("/auth/register", data);
    console.log("✅ BACKEND RESPONSE:", res.data);
    return res.data;
  } catch (err) {
    console.log("❌ BACKEND ERROR:", err.response?.data || err.message);
    throw err;
  }
};

// Request OTP
export const requestOtp = async (phone, name) => {
  const { data } = await API.post("/auth/send-otp", { phone, name });
  return data;
};

// Verify OTP → Login / Register
export const verifyOtp = async (phone, otp, name) => {
  const { data } = await API.post("/auth/verify-otp", { phone, otp, name });
  // Save token + user in local storage
  await AsyncStorage.setItem("authToken", data.token);
  await AsyncStorage.setItem("user", JSON.stringify(data.user));
  return data;
};

// Quick Login (already registered user with phone only, no OTP)
export const quickLogin = async (phone) => {
  try {
    const { data } = await API.post("/auth/quick-login", { phone });
    await AsyncStorage.setItem("authToken", data.token);
    await AsyncStorage.setItem("user", JSON.stringify(data.user));
    return data;
  } catch (err) {
    console.log("❌ QUICK LOGIN ERROR:", err.response?.data || err.message);
    throw err;
  }
};

// Get logged-in user profile
export const getUserProfile = async () => {
  const { data } = await API.get("/auth/me");
  return data;
};

// Logout (frontend + backend)
export const logout = async () => {
  try {
    await API.post("/auth/logout"); // backend just returns success
  } catch (err) {
    console.warn("Backend logout failed:", err.message);
  }
  // Always clear token locally
  await AsyncStorage.removeItem("authToken");
  await AsyncStorage.removeItem("user");
  return true;
};

// =======================================================
// 🔹 PROPERTY APIs
// =======================================================

// Add new property
export const addProperty = async (propertyData) => {
  // If caller passed a FormData (for file upload), send as multipart/form-data
  if (typeof FormData !== "undefined" && propertyData instanceof FormData) {
    const { data } = await API.post("/properties/add", propertyData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  }

  // Default: send JSON
  const { data } = await API.post("/properties/add", propertyData);
  return data;
};

// Get all properties
export const getProperties = async () => {
  const { data } = await API.get("/properties");
  return data;
};

// Get property by ID
export const getPropertyById = async (id) => {
  const { data } = await API.get(`/properties/${id}`);
  return data;
};

// Update property
export const updateProperty = async (id, propertyData) => {
  const { data } = await API.put(`/properties/${id}`, propertyData);
  return data;
};

// Delete property
export const deleteProperty = async (id) => {
  const { data } = await API.delete(`/properties/${id}`);
  return data;
};

// =======================================================
// 🔹 SAVED PROPERTIES APIs
// =======================================================

// Save property
export const saveProperty = async (id) => {
  const { data } = await API.post(`/properties/${id}/save`);
  return data;
};

// Unsave property
export const unsaveProperty = async (id) => {
  const { data } = await API.delete(`/properties/${id}/save`);
  return data;
};

// Get all saved properties
export const getSavedProperties = async () => {
  const { data } = await API.get("/properties/user/saved");
  return data;
};

// =======================================================
// 🔹 OWNER APIs
// =======================================================

// Get my listed properties
export const getMyProperties = async () => {
  const { data } = await API.get("/properties/my/list");
  return data;
};
// // ✅ Fetch properties with filters
// export const getProperties = async (filters = {}) => {
//   const params = new URLSearchParams(filters).toString();
//   const { data } = await API.get(`/properties?${params}`);
//   return data;
// };


// Update user name
export const updateUserName = async (newName) => {
  const { data } = await API.put("/auth/update-name", { name: newName });
  return data;
};
