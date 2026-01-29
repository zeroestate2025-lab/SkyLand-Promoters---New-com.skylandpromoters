import React, { useState, useCallback } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  useColorScheme,
  Modal,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import DropDownPicker from "react-native-dropdown-picker";
import AnimatedBackground from "../../components/ReusableComponents/AnimatedBackground";
import { addProperty, updateProperty, getPropertyById } from "../../api/api";
import GlobalText from "../../theme/GlobalText";
import propertyTypes from "../../constants/propertyTypes";
import states from "../../constants/locations/state";
import districts from "../../constants/locations/districts";
import subDistricts from "../../constants/locations/subDistricts";
import * as Animatable from "react-native-animatable";
import Geolocation from "@react-native-community/geolocation";
import {
  ArrowLeft,
  Upload,
  Trash2,
  Home,
  IndianRupee,
  Phone,
  MapPin,
  Landmark,
  Ruler,
  Map,
  Bed,
  Bath,
  UtensilsCrossed,
  ClipboardList,
  Sofa,
  Wrench,
  AlertTriangle,
} from "lucide-react-native";
import { useTheme, useFocusEffect } from "@react-navigation/native";
import RNFS from "react-native-fs";
import ImageResizer from "react-native-image-resizer";

const BASE_URL = "https://zero-estate-backend-render.onrender.com";

export default function AddPropertyScreen({ route, navigation }) {
  const editingProperty = route?.params?.property || null;
  const scheme = useColorScheme();
  const { colors } = useTheme();
  const isDark = scheme === "dark";

  // ✅ STATE INITIALIZATION - CRASH-PROOF
  const [missingModalVisible, setMissingModalVisible] = useState(false);
  const [missingFieldsList, setMissingFieldsList] = useState([]);
  const [mapModal, setMapModal] = useState(false);
  
  // ✅ ALWAYS ARRAY - NO CRASH
  const [images, setImages] = useState([]);
  
  const [title, setTitle] = useState(editingProperty?.title || "");
  const [price, setPrice] = useState(editingProperty?.price?.toString() || "");
  const [contact, setContact] = useState(editingProperty?.contact?.toString() || "");
  const [location, setLocation] = useState(editingProperty?.location || "");
  const [mapLocation, setMapLocation] = useState(editingProperty?.mapLocation || null);
  const [landmark, setLandmark] = useState(editingProperty?.landmark || "");
  
  const [propertySize, setPropertySize] = useState(editingProperty?.propertySize?.toString() || "");
  const [propertyUnit, setPropertyUnit] = useState(editingProperty?.propertyUnit || "sqft");
  const [unitOpen, setUnitOpen] = useState(false);

  const [bedrooms, setBedrooms] = useState(editingProperty?.bedrooms?.toString() || "1");
  const [bathrooms, setBathrooms] = useState(editingProperty?.bathrooms?.toString() || "1");
  const [kitchen, setKitchen] = useState(editingProperty?.kitchen || "Yes");
  
  const [buildingDetails, setBuildingDetails] = useState(editingProperty?.buildingDetails || "");
  const [interior, setInterior] = useState(editingProperty?.interior || "");
  const [construction, setConstruction] = useState(editingProperty?.construction || "");
  const [category, setCategory] = useState(editingProperty?.category || "House");

  const [state, setState] = useState(editingProperty?.state || "");
  const [district, setDistrict] = useState(editingProperty?.district || "");
  const [subDistrict, setSubDistrict] = useState(editingProperty?.subDistrict || "");

  const [propertyPreference, setPropertyPreference] = useState(editingProperty?.propertyPreference || "Sale");
  const [preferenceOpen, setPreferenceOpen] = useState(false);

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [stateOpen, setStateOpen] = useState(false);
  const [districtOpen, setDistrictOpen] = useState(false);
  const [subDistrictOpen, setSubDistrictOpen] = useState(false);

  // ✅ Dropdown items
  const stateItems = states.map((s) => ({ label: s, value: s }));
  const districtItems = useCallback(() => {
    return state ? (districts[state] || []).map((d) => ({ label: d, value: d })) : [];
  }, [state]);
  const subDistrictItems = useCallback(() => {
    return district ? (subDistricts[district] || []).map((sd) => ({ label: sd, value: sd })) : [];
  }, [district]);
  const categoryItems = propertyTypes.map((c) => ({ label: c.name, value: c.name }));

  const preferenceItems = [
    { label: "Sale", value: "Sale" },
    { label: "Rent", value: "Rent" },
  ];

  const propertyUnitItems = [
    { label: "Sqft", value: "sqft" },
    { label: "Cent", value: "cent" },
    { label: "Acre", value: "acre" },
  ];

  // ✅ Map functions
  const openMapPicker = () => {
    setMapModal(false);
    navigation.navigate("MapPicker");
  };

  const useCurrentLocation = async () => {
  setMapModal(false);
  
  try {
    // ✅ TRY WIFI first (no GPS)
    Geolocation.getCurrentPosition(
      (position) => {
        setMapLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          link: `https://www.openstreetmap.org/?mlat=${position.coords.latitude}&mlon=${position.coords.longitude}`,
        });
      },
      // ✅ FALLBACK to IP
      async () => {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        setMapLocation({
          lat: data.latitude || 12.9716,  // Bengaluru fallback
          lng: data.longitude || 77.5946,
        });
      },
      { enableHighAccuracy: false }  // ✅ NO GPS
    );
  } catch {
    // ✅ FINAL FALLBACK - Bengaluru
    setMapLocation({
      lat: 12.9716,
      lng: 77.5946,
    });
  }
};

// const useCurrentLocation = async () => {
//   try {
//     setMapModal(false);
    
//     // ✅ IP-BASED LOCATION (Works everywhere!)
//     const response = await fetch('https://ipapi.co/json/');
//     const data = await response.json();
    
//     if (data.latitude && data.longitude) {
//       setMapLocation({
//         lat: data.latitude,
//         lng: data.longitude,
//         link: `https://www.openstreetmap.org/?mlat=${data.latitude}&mlon=${data.longitude}`,
//       });
//       Alert.alert("✅ Success", `Location set: ${data.city}, ${data.region}`);
//     } else {
//       Alert.alert("Error", "Could not detect location. Use manual map.");
//       openMapPicker();
//     }
//   } catch (error) {
//     console.log("IP Geo failed:", error);
//     Alert.alert("Fallback", "Using manual map selection.");
//     openMapPicker();
//   }
// };



//     const useCurrentLocation = async () => {
//   try {
//     // ✅ Check if location services are enabled first
//     const hasPermission = await Geolocation.requestAuthorization();
//     if (hasPermission !== 'granted') {
//       Alert.alert(
//         "Location Permission Required", 
//         "Please enable location access in app settings"
//       );
//       return;
//     }

//     setMapModal(false);
    
//     // ✅ Show loading alert
//     Alert.alert(
//       "Getting Location", 
//       "Please wait, finding your location...",
//       [{ text: "Cancel", onPress: () => {} }]
//     );

//     // ✅ LONGER TIMEOUT + BETTER OPTIONS
//     Geolocation.getCurrentPosition(
//       (position) => {
//         Alert.alert("Success", "Location found!"); // Remove this line in production
//         const { latitude, longitude } = position.coords;
//         setMapLocation({
//           lat: latitude,
//           lng: longitude,
//           link: `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}`,
//         });
//       },
//       (error) => {
//         console.log("Geolocation error:", error.code, error.message);
        
//         // ✅ FRIENDLY ERROR MESSAGES
//         let errorMsg = "Could not get location. ";
//         switch (error.code) {
//           case 1:
//             errorMsg += "Please enable location permissions in settings.";
//             break;
//           case 2:
//             errorMsg += "Please turn on GPS/Location services.";
//             break;
//           case 3:
//             errorMsg += "Location request timed out. Try again or use manual map selection.";
//             break;
//           default:
//             errorMsg += "Please try manual map selection.";
//         }
        
//         Alert.alert("Location Error", errorMsg, [
//           {
//             text: "Manual Map",
//             onPress: () => openMapPicker()
//           },
//           { text: "Retry", onPress: () => useCurrentLocation() }
//         ]);
//       },
//       {
//         enableHighAccuracy: false,        // ✅ Less strict = faster
//         timeout: 30000,                  // ✅ 30 seconds (double previous)
//         maximumAge: 60000,               // ✅ Use cached location up to 1 min old
//       }
//     );
//   } catch (error) {
//     Alert.alert("Permission Error", "Location permission denied. Please enable in settings.");
//     console.error("Permission error:", error);
//   }
// };

  // const useCurrentLocation = () => {
  //   Geolocation.getCurrentPosition(
  //     (position) => {
  //       const { latitude, longitude } = position.coords;
  //       setMapLocation({
  //         lat: latitude,
  //         lng: longitude,
  //         link: `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}`,
  //       });
  //       setMapModal(false);
  //     },
  //     (error) => Alert.alert("Location Error", error.message),
  //     {
  //       enableHighAccuracy: false,
  //       timeout: 15000,
  //       maximumAge: 10000,
  //     }
  //   );
  // };

  // ✅ Handle selected location from MapPicker
  useFocusEffect(
    useCallback(() => {
      if (route?.params?.selectedLocation) {
        setMapLocation(route.params.selectedLocation);
      }
    }, [])
  );

  // ✅ Load property data when editing - CRASH-PROOF
  useFocusEffect(
    useCallback(() => {
      const loadProperty = async () => {
        if (!editingProperty?._id && !editingProperty?.id) return;
        try {
          const id = editingProperty._id || editingProperty.id;
          const data = await getPropertyById(id);
          
          // ✅ SAFE IMAGE LOADING - ALWAYS ARRAY
          if (data?.images && Array.isArray(data.images)) {
            const normalized = data.images
              .filter(img => img) // Remove null/undefined
              .map((img) => {
                if (!img || typeof img !== "string") return null;
                
                const trimmed = img.trim();
                if (trimmed.startsWith("data:")) return trimmed;
                if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
                if (trimmed.startsWith("/")) return `${BASE_URL}${trimmed}`;
                
                const isLikelyBase64 = /^[A-Za-z0-9+/=\n\r]+$/.test(trimmed.replace(/\s+/g, "")) && trimmed.length > 100;
                if (isLikelyBase64) return `data:image/jpeg;base64,${trimmed.replace(/\s+/g, "")}`;
                
                return `${BASE_URL}${trimmed}`;
              })
              .filter(Boolean); // Remove null values
            
            setImages(normalized);
          } else {
            setImages([]); // ✅ Ensure array even if no images
          }
        } catch (error) {
          console.error("Error loading property:", error.message);
          setImages([]); // ✅ Fallback to empty array
        }
      };
      if (editingProperty) loadProperty();
    }, [editingProperty])
  );

  // ✅ CRASH-PROOF Image handling
  const handleImagePick = () => {
    const currentCount = Array.isArray(images) ? images.length : 0;
    if (currentCount >= 5) {
      Alert.alert("Limit Reached", "You can upload a maximum of 5 images only.");
      return;
    }

    Alert.alert("Upload Image", "Choose an option", [
      {
        text: "Camera",
        onPress: () =>
          launchCamera({ mediaType: "photo" }, async (res) => {
            if (res?.assets?.[0]) {
              const asset = res.assets[0];
              try {
                const resized = await ImageResizer.createResizedImage(
                  asset.uri, 800, 600, "JPEG", 60
                );
                const base64Data = await RNFS.readFile(resized.uri, "base64");
                const newImage = `data:image/jpeg;base64,${base64Data}`;
                
                setImages(prev => {
                  const current = Array.isArray(prev) ? prev : [];
                  return [...current, newImage].slice(0, 5);
                });
              } catch (err) {
                console.error("Compression failed:", err);
                Alert.alert("Error", "Failed to process image");
              }
            }
          }),
      },
      {
        text: "Gallery",
        onPress: () =>
          launchImageLibrary(
            { mediaType: "photo", selectionLimit: 5 - currentCount }, 
            async (res) => {
            if (res?.assets) {
              const newImages = [];
              for (let asset of res.assets) {
                try {
                  const resized = await ImageResizer.createResizedImage(
                    asset.uri, 800, 600, "JPEG", 60
                  );
                  const base64Data = await RNFS.readFile(resized.uri, "base64");
                  newImages.push(`data:image/jpeg;base64,${base64Data}`);
                } catch (err) {
                  console.error("Compression failed:", err);
                }
              }
              
              setImages(prev => {
                const current = Array.isArray(prev) ? prev : [];
                const total = [...current, ...newImages];
                return total.length > 5 ? total.slice(0, 5) : total;
              });
            }
          }
        ),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  // ✅ CRASH-PROOF Image removal
  const removeImage = (index) => {
    if (!Array.isArray(images) || index < 0 || index >= images.length) return;
    
    setImages(prev => {
      const current = Array.isArray(prev) ? prev : [];
      const updated = current.filter((_, i) => i !== index);
      return updated;
    });
  };

  const handleSubmit = async () => {
    try {
      const requiredFields = {
        Title: title,
        Price: price,
        Contact: contact,
        Address: location,
        State: state,
        District: district,
        Category: category,
        PropertyPreference: propertyPreference,
      };

      const missing = Object.entries(requiredFields)
        .filter(([_, v]) => !v || v.toString().trim() === "")
        .map(([k]) => k);

      if (missing.length > 0) {
        setMissingFieldsList(missing);
        setMissingModalVisible(true);
        return;
      }

      const payload = {
        title: title.trim(),
        price: price.trim(),
        contact: Number(contact),
        location: location.trim(),
        mapLocation,
        district: district.trim(),
        subDistrict: subDistrict.trim(),
        state: state.trim(),
        landmark: landmark.trim(),
        propertySize: propertySize.trim(),
        propertyUnit,
        bedrooms,
        bathrooms,
        kitchen,
        buildingDetails: buildingDetails.trim(),
        interior: interior.trim(),
        construction: construction.trim(),
        images, // ✅ Already safe array
        category,
        propertyPreference,
      };

      if (editingProperty) {
        await updateProperty(editingProperty._id || editingProperty.id, payload);
        Alert.alert("✅ Success", "Property updated successfully!", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } else {
        await addProperty(payload);
        navigation.reset({
          index: 0,
          routes: [{ name: "Success" }],
        });
      }
    } catch (err) {
      console.error("Save Error:", err.response?.data || err.message);
      Alert.alert("❌ Error", "Failed to save property");
    }
  };

  // ✅ Theme colors
  const backgroundColor = isDark ? "#121212" : "#f9f9f9";
  const cardColor = isDark ? "#1E1E1E" : "#fff";
  const textColor = isDark ? "#EDEDED" : "#000";
  const placeholderColor = isDark ? "#888" : "#666";
  const borderColor = isDark ? "#333" : "#20A68B";

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <AnimatedBackground />

      <LinearGradient
        colors={isDark ? ["#114D44", "#0D3732"] : ["#43C6AC", "#20A68B"]}
        style={styles.headerContainer}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <GlobalText bold style={styles.headerTitle}>
            {editingProperty ? "Edit Property" : "Add Property"}
          </GlobalText>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 80 }}
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={false}
      >
        {/* Property Preference Dropdown */}
        <GlobalText medium style={[styles.label, { color: textColor }]}>
          Property Preference
        </GlobalText>
        <DropDownPicker
          open={preferenceOpen}
          value={propertyPreference}
          items={preferenceItems}
          setOpen={setPreferenceOpen}
          setValue={setPropertyPreference}
          placeholder="-- Select Preference --"
          style={[styles.dropdownBox, { borderColor, backgroundColor: cardColor }]}
          dropDownContainerStyle={[
            styles.dropdownList,
            { backgroundColor: cardColor, borderColor },
          ]}
          zIndex={5000}
          zIndexInverse={500}
          listMode="SCROLLVIEW"
        />

        <GlobalText medium style={[styles.label, { color: textColor }]}>
          Category
        </GlobalText>
        <DropDownPicker
          open={categoryOpen}
          value={category}
          items={categoryItems}
          setOpen={setCategoryOpen}
          setValue={setCategory}
          placeholder="-- Select Category --"
          style={[styles.dropdownBox, { borderColor, backgroundColor: cardColor }]}
          dropDownContainerStyle={[
            styles.dropdownList,
            { backgroundColor: cardColor, borderColor },
          ]}
          zIndex={4000}
          zIndexInverse={1000}
          listMode="SCROLLVIEW"
        />

        {/* Basic Property Fields */}
        <InputBox 
          icon={<Home size={18} color="#20A68B" />} 
          placeholder="Property Title" 
          value={title} 
          onChange={setTitle} 
          textColor={textColor} 
          placeholderColor={placeholderColor} 
          cardColor={cardColor} 
          borderColor={borderColor} 
        />
        
        <InputBox 
          icon={<IndianRupee size={18} color="#20A68B" />} 
          placeholder="Price (e.g., 80k, 1 lakh)" 
          value={price} 
          onChange={setPrice} 
          keyboardType="numeric" 
          textColor={textColor} 
          placeholderColor={placeholderColor} 
          cardColor={cardColor} 
          borderColor={borderColor} 
        />
        
        <InputBox 
          icon={<Phone size={18} color="#20A68B" />} 
          placeholder="Contact Number" 
          value={contact} 
          onChange={setContact} 
          keyboardType="phone-pad" 
          textColor={textColor} 
          placeholderColor={placeholderColor} 
          cardColor={cardColor} 
          borderColor={borderColor} 
        />
        
        <InputBox 
          icon={<MapPin size={18} color="#20A68B" />} 
          placeholder="Address" 
          value={location} 
          onChange={setLocation} 
          textColor={textColor} 
          placeholderColor={placeholderColor} 
          cardColor={cardColor} 
          borderColor={borderColor} 
        />

        {/* Location Dropdowns */}
        <GlobalText medium style={[styles.label, { color: textColor }]}>
          State
        </GlobalText>
        <DropDownPicker
          open={stateOpen}
          value={state}
          items={stateItems}
          setOpen={setStateOpen}
          setValue={(callback) => {
            const selected = typeof callback === "function" ? callback(state) : callback;
            setState(selected);
            setDistrict("");
            setSubDistrict("");
          }}
          placeholder="-- Select State --"
          style={[styles.dropdownBox, { borderColor, backgroundColor: cardColor }]}
          dropDownContainerStyle={[
            styles.dropdownList,
            { backgroundColor: cardColor, borderColor },
          ]}
          zIndex={3000}
          zIndexInverse={2000}
          listMode="SCROLLVIEW"
        />

        <GlobalText medium style={[styles.label, { color: textColor }]}>
          District
        </GlobalText>
        <DropDownPicker
          open={districtOpen}
          value={district}
          items={districtItems()}
          setOpen={setDistrictOpen}
          setValue={setDistrict}
          placeholder="-- Select District --"
          style={[styles.dropdownBox, { borderColor, backgroundColor: cardColor }]}
          dropDownContainerStyle={[
            styles.dropdownList,
            { backgroundColor: cardColor, borderColor },
          ]}
          zIndex={2000}
          zIndexInverse={3000}
          listMode="SCROLLVIEW"
          disabled={!state}
        />

        <InputBox
          icon={<Landmark size={18} color="#20A68B" />}
          placeholder="Nearby Landmark"
          value={landmark}
          onChange={setLandmark}
          textColor={textColor}
          placeholderColor={placeholderColor}
          cardColor={cardColor}
          borderColor={borderColor}
        />

        {/* Property Size */}
        <GlobalText medium style={[styles.label, { color: textColor }]}>
          Property Size
        </GlobalText>
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 15 }}>
          <View style={{ flex: 1 }}>
            <InputBox
              icon={<Ruler size={18} color="#20A68B" />}
              placeholder="Size Value"
              value={propertySize}
              onChange={setPropertySize}
              keyboardType="numeric"
              textColor={textColor}
              placeholderColor={placeholderColor}
              cardColor={cardColor}
              borderColor={borderColor}
            />
          </View>
          <View style={{ width: 130 }}>
            <DropDownPicker
              open={unitOpen}
              value={propertyUnit}
              items={propertyUnitItems}
              setOpen={setUnitOpen}
              setValue={setPropertyUnit}
              placeholder="Unit"
              style={[styles.dropdownBox, { borderColor, backgroundColor: cardColor }]}
              dropDownContainerStyle={[
                styles.dropdownList,
                { backgroundColor: cardColor, borderColor },
              ]}
              zIndex={1500}
              zIndexInverse={3500}
              listMode="SCROLLVIEW"
            />
          </View>
        </View>

        {/* Map Location Picker */}
        <GlobalText medium style={[styles.label, { color: textColor }]}>
          Map Location
        </GlobalText>
        <TouchableOpacity onPress={() => setMapModal(true)}>
          <View style={[styles.inputBox, { borderColor, backgroundColor: cardColor }]}>
            <View style={styles.inputRow}>
              <Map size={18} color="#20A68B" />
              <TextInput
                placeholder="Select location on map"
                placeholderTextColor={placeholderColor}
                style={[styles.inputField, { height: 45, color: textColor }]}
                value={mapLocation?.link || ""}
                editable={false}
                pointerEvents="none"
              />
            </View>
          </View>
        </TouchableOpacity>

        {/* Map Modal */}
        <Modal visible={mapModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <Animatable.View 
              animation="slideInUp" 
              duration={300} 
              style={[styles.mapOptionBox, { backgroundColor: cardColor }]}
            >
              <GlobalText bold style={[styles.mapOptionTitle, { color: textColor }]}>
                Select Location
              </GlobalText>
              
              <TouchableOpacity 
                style={styles.mapOptionBtn} 
                onPress={openMapPicker}
              >
                <MapPin size={20} color="#20A68B" />
                <GlobalText style={[styles.mapOptionText, { color: textColor }]}>
                  📍 Select on Map
                </GlobalText>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.mapOptionBtn} 
                onPress={useCurrentLocation}
              >
                <Landmark size={20} color="#20A68B" />
                <GlobalText style={[styles.mapOptionText, { color: textColor }]}>
                  📡 Use Current Location
                </GlobalText>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.mapOptionBtn, styles.cancelBtn]} 
                onPress={() => setMapModal(false)}
              >
                <GlobalText style={{ color: "#FF6B6B", fontWeight: "600" }}>Cancel</GlobalText>
              </TouchableOpacity>
            </Animatable.View>
          </View>
        </Modal>

        {/* House-specific fields */}
        {category?.toLowerCase() === "house" && (
          <>
            <InputBox
              icon={<Bed size={18} color="#20A68B" />}
              placeholder="Bedrooms"
              value={bedrooms}
              onChange={setBedrooms}
              keyboardType="numeric"
              textColor={textColor}
              placeholderColor={placeholderColor}
              cardColor={cardColor}
              borderColor={borderColor}
            />
            <InputBox
              icon={<Bath size={18} color="#20A68B" />}
              placeholder="Bathrooms"
              value={bathrooms}
              onChange={setBathrooms}
              keyboardType="numeric"
              textColor={textColor}
              placeholderColor={placeholderColor}
              cardColor={cardColor}
              borderColor={borderColor}
            />
            <InputBox
              icon={<UtensilsCrossed size={18} color="#20A68B" />}
              placeholder="Kitchen (Yes/No)"
              value={kitchen}
              onChange={setKitchen}
              textColor={textColor}
              placeholderColor={placeholderColor}
              cardColor={cardColor}
              borderColor={borderColor}
            />
          </>
        )}

        <InputBox
          icon={<ClipboardList size={18} color="#20A68B" />}
          placeholder="Building Details"
          value={buildingDetails}
          onChange={setBuildingDetails}
          textColor={textColor}
          placeholderColor={placeholderColor}
          cardColor={cardColor}
          borderColor={borderColor}
        />
        
        <InputBox
          icon={<Wrench size={18} color="#20A68B" />}
          placeholder="Construction Details"
          value={construction}
          onChange={setConstruction}
          multiline
          height={80}
          textColor={textColor}
          placeholderColor={placeholderColor}
          cardColor={cardColor}
          borderColor={borderColor}
        />

        {/* ✅ CRASH-PROOF IMAGE UPLOAD SECTION */}
        <GlobalText style={{ 
          textAlign: "center", 
          marginBottom: 8, 
          color: isDark ? "#888" : "#666",
          fontSize: 14 
        }}>
          {Array.isArray(images) ? images.length : 0}/5 images uploaded
        </GlobalText>

        <TouchableOpacity
          style={[styles.uploadBox, { borderColor }]}
          onPress={handleImagePick}
          activeOpacity={0.8}
        >
          <Upload size={20} color="#20A68B" />
          <GlobalText semiBold style={[styles.uploadText, { color: "#20A68B" }]}>
            {Array.isArray(images) && images.length >= 5 
              ? "Max images reached" 
              : "Upload Images"
            }
          </GlobalText>
        </TouchableOpacity>

        {/* ✅ 100% SAFE IMAGE RENDERING */}
        {Array.isArray(images) && images.length > 0 ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 20 }}>
            {images.map((img, i) => (
              <View key={`img-${i}`} style={{ position: "relative", margin: 5 }}>
                <Image 
                  source={{ uri: img }} 
                  style={styles.uploaded}
                  defaultSource={null}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => removeImage(i)}
                  activeOpacity={0.7}
                >
                  <Trash2 size={18} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <View style={{ 
            alignItems: "center", 
            marginBottom: 20, 
            paddingVertical: 20 
          }}>
            <GlobalText style={{ 
              color: isDark ? "#888" : "#999", 
              fontSize: 14,
              textAlign: "center"
            }}>
              No images uploaded yet
            </GlobalText>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.submitBtn, { backgroundColor: "#20A68B" }]} 
          onPress={handleSubmit}
          activeOpacity={0.8}
        >
          <GlobalText bold style={styles.submitText}>
            {editingProperty ? "Update Property" : "Add Property"}
          </GlobalText>
        </TouchableOpacity>
      </ScrollView>

      {/* Missing Fields Modal */}
      <Modal visible={missingModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Animatable.View animation="zoomIn" duration={300} style={styles.modalBox}>
            <AlertTriangle size={50} color="#FF6B6B" />
            <GlobalText bold style={styles.modalTitle}>
              Missing Required Fields
            </GlobalText>
            <GlobalText style={styles.modalSub}>
              Please fill the following fields:
            </GlobalText>
            {Array.isArray(missingFieldsList) && missingFieldsList.length > 0 && (
              missingFieldsList.map((field, idx) => (
                <GlobalText key={`missing-${idx}`} style={styles.modalList}>
                  • {field}
                </GlobalText>
              ))
            )}
            <TouchableOpacity
              onPress={() => setMissingModalVisible(false)}
              style={styles.modalBtn}
            >
              <GlobalText bold style={{ color: "#fff" }}>
                OK, Got it
              </GlobalText>
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ✅ InputBox Component - CRASH-PROOF
function InputBox({
  icon,
  placeholder,
  value,
  onChange,
  keyboardType,
  multiline,
  height,
  textColor,
  placeholderColor,
  cardColor,
  borderColor,
  editable = true,
}) {
  return (
    <View style={[styles.inputBox, { borderColor, backgroundColor: cardColor }]}>
      <View style={styles.inputRow}>
        {icon}
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          style={[styles.inputField, { 
            height: height || 45, 
            color: textColor,
            ...(multiline && { textAlignVertical: 'top' })
          }]}
          value={value || ""}
          onChangeText={onChange}
          keyboardType={keyboardType || "default"}
          multiline={multiline || false}
          editable={editable}
          numberOfLines={multiline ? 4 : 1}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  headerContainer: {
    paddingVertical: 12,
    elevation: 6,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerTitle: { fontSize: 18, color: "#fff" },
  label: { 
    fontSize: 14, 
    marginBottom: 6,
    fontWeight: "600"
  },
  inputBox: {
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 12,
  },
  inputRow: { 
    flexDirection: "row", 
    alignItems: "center",
    flex: 1
  },
  inputField: { 
    flex: 1, 
    paddingHorizontal: 8, 
    paddingVertical: 12,
    fontSize: 14 
  },
  dropdownBox: { 
    borderWidth: 1.5, 
    borderRadius: 12, 
    marginBottom: 15 
  },
  dropdownList: { 
    borderWidth: 1, 
    borderRadius: 10 
  },
  uploadBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderRadius: 12,
    height: 55,
    marginBottom: 15,
  },
  uploadText: { 
    marginLeft: 8, 
    fontSize: 15,
    fontWeight: "600"
  },
  uploaded: { 
    width: 100, 
    height: 100, 
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E6F4EF"
  },
  deleteBtn: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 4,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  submitBtn: {
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 20,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  submitText: { 
    color: "#fff", 
    fontSize: 16,
    fontWeight: "700"
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    width: "85%",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  modalTitle: { 
    fontSize: 20, 
    marginTop: 12, 
    color: "#1A1A1A",
    marginBottom: 8 
  },
  modalSub: { 
    fontSize: 15, 
    color: "#666", 
    marginVertical: 8,
    textAlign: "center"
  },
  modalList: { 
    color: "#333", 
    marginTop: 6,
    fontSize: 14,
    textAlign: "left",
    width: "100%"
  },
  modalBtn: {
    backgroundColor: "#20A68B",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
    elevation: 4,
  },
  mapOptionBox: {
    width: "90%",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    maxHeight: "70%",
  },
  mapOptionTitle: {
    fontSize: 20,
    marginBottom: 24,
    fontWeight: "700",
  },
  mapOptionBtn: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: "#f8f9fa",
    marginBottom: 16,
    elevation: 2,
  },
  mapOptionText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "500",
  },
  cancelBtn: {
    backgroundColor: "#ffebee",
    borderWidth: 1,
    borderColor: "#FF6B6B",
  },
});

// import React, { useState, useCallback } from "react";
// import {
//   View,
//   TextInput,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Image,
//   Alert,
//   useColorScheme,
//   Modal,
// } from "react-native";
// import LinearGradient from "react-native-linear-gradient";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { launchCamera, launchImageLibrary } from "react-native-image-picker";
// import DropDownPicker from "react-native-dropdown-picker";
// import AnimatedBackground from "../../components/ReusableComponents/AnimatedBackground";
// import { addProperty, updateProperty, getPropertyById } from "../../api/api";
// import GlobalText from "../../theme/GlobalText";
// import propertyTypes from "../../constants/propertyTypes";
// import states from "../../constants/locations/state";
// import districts from "../../constants/locations/districts";
// import subDistricts from "../../constants/locations/subDistricts";
// import * as Animatable from "react-native-animatable";
// import Geolocation from "@react-native-community/geolocation";

// import {
//   ArrowLeft,
//   Upload,
//   Trash2,
//   Home,
//   IndianRupee,
//   Phone,
//   MapPin,
//   Landmark,
//   Ruler,
//   Map,
//   Bed,
//   Bath,
//   UtensilsCrossed,
//   ClipboardList,
//   Sofa,
//   Wrench,
//   AlertTriangle,
// } from "lucide-react-native";
// import { useTheme, useFocusEffect } from "@react-navigation/native";
// import RNFS from "react-native-fs";
// import ImageResizer from "react-native-image-resizer";

// // const BASE_URL = "https://zero-estate-backend-render.onrender.com";

// export default function AddPropertyScreen({ route, navigation }) {
//   const editingProperty = route?.params?.property || null;
//   const scheme = useColorScheme();
//   const { colors } = useTheme();
//   const isDark = scheme === "dark";

//   const [missingModalVisible, setMissingModalVisible] = useState(false);
//   const [missingFieldsList, setMissingFieldsList] = useState([]);

//   const [title, setTitle] = useState(editingProperty?.title || "");
//   const [price, setPrice] = useState(editingProperty?.price?.toString() || "");
//   const [contact, setContact] = useState(editingProperty?.contact?.toString() || "");
//   const [location, setLocation] = useState(editingProperty?.location || "");
//   const [mapLocation, setMapLocation] = useState(editingProperty?.mapLocation || null);
//   const [landmark, setLandmark] = useState(editingProperty?.landmark || "");
  
//   // ✅ Property size and unit
//   const [propertySize, setPropertySize] = useState(editingProperty?.propertySize?.toString() || "");
//   const [propertyUnit, setPropertyUnit] = useState(editingProperty?.propertyUnit || "sqft");
//   const [unitOpen, setUnitOpen] = useState(false);

//   const [bedrooms, setBedrooms] = useState(editingProperty?.bedrooms?.toString() || "1");
//   const [bathrooms, setBathrooms] = useState(editingProperty?.bathrooms?.toString() || "1");
//   const [kitchen, setKitchen] = useState(editingProperty?.kitchen || "Yes");
  
//   const [buildingDetails, setBuildingDetails] = useState(editingProperty?.buildingDetails || "");
//   const [interior, setInterior] = useState(editingProperty?.interior || "");
//   const [construction, setConstruction] = useState(editingProperty?.construction || "");
//   const [images, setImages] = useState([]);
//   const [category, setCategory] = useState(editingProperty?.category || "House");

//   const [state, setState] = useState(editingProperty?.state || "");
//   const [district, setDistrict] = useState(editingProperty?.district || "");
//   const [subDistrict, setSubDistrict] = useState(editingProperty?.subDistrict || "");

//   // Property preference field
//   const [propertyPreference, setPropertyPreference] = useState(editingProperty?.propertyPreference || "Sale");
//   const [preferenceOpen, setPreferenceOpen] = useState(false);

//   const [categoryOpen, setCategoryOpen] = useState(false);
//   const [stateOpen, setStateOpen] = useState(false);
//   const [districtOpen, setDistrictOpen] = useState(false);
//   const [subDistrictOpen, setSubDistrictOpen] = useState(false);

//   // ✅ Map modal state - MISSING IN YOUR CODE
//   const [mapModal, setMapModal] = useState(false);

//   const stateItems = states.map((s) => ({ label: s, value: s }));
//   const districtItems = useCallback(() => {
//     return state ? (districts[state] || []).map((d) => ({ label: d, value: d })) : [];
//   }, [state]);
//   const subDistrictItems = useCallback(() => {
//     return district ? (subDistricts[district] || []).map((sd) => ({ label: sd, value: sd })) : [];
//   }, [district]);
//   const categoryItems = propertyTypes.map((c) => ({ label: c.name, value: c.name }));

//   const preferenceItems = [
//     { label: "Sale", value: "Sale" },
//     { label: "Rent", value: "Rent" },
//   ];

//   const propertyUnitItems = [
//     { label: "Sqft", value: "sqft" },
//     { label: "Cent", value: "cent" },
//     { label: "Acre", value: "acre" },
//   ];

//   // ✅ Map picker function - MISSING IN YOUR CODE
//   // const openMapPicker = () => {
//   //   setMapModal(false);
//   //   navigation.navigate("MapPicker", {
//   //     onLocationSelect: (selectedLocation) => {
//   //       setMapLocation(selectedLocation);
//   //     },
//   //   });
//   // };
  
// const openMapPicker = () => {
//   setMapModal(false);
//   navigation.navigate("MapPicker");
// };


// //   // ✅ Current location function
// //   const useCurrentLocation = () => {
// //   Geolocation.getCurrentPosition(
// //     (position) => {
// //       const { latitude, longitude } = position.coords;

// //       setMapLocation({
// //         lat: latitude,
// //         lng: longitude,
// //         link: `https://www.google.com/maps?q=${latitude},${longitude}`,
// //       });

// //       setMapModal(false);
// //     },
// //     (error) => {
// //       Alert.alert("Location Error", error.message);
// //     },
// //     {
// //       enableHighAccuracy: false,
// //       timeout: 15000,
// //       maximumAge: 10000,
// //     }
// //   );
// // };

// const useCurrentLocation = () => {
//   Geolocation.getCurrentPosition(
//     (position) => {
//       const { latitude, longitude } = position.coords;

//       setMapLocation({
//         lat: latitude,
//         lng: longitude,
//         link: `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}`,
//       });

//       setMapModal(false);
//     },
//     (error) => Alert.alert("Location Error", error.message),
//     {
//       enableHighAccuracy: false,
//       timeout: 15000,
//       maximumAge: 10000,
//     }
//   );
// };


//   // const useCurrentLocation = () => {
//   //   Geolocation.getCurrentPosition(
//   //     (pos) => {
//   //       const { latitude, longitude } = pos.coords;
//   //       setMapLocation({
//   //         lat: latitude,
//   //         lng: longitude,
//   //         link: `https://www.google.com/maps?q=${latitude},${longitude}`,
//   //       });
//   //       setMapModal(false);
//   //     },
//   //     (err) => Alert.alert("Error", err.message),
//   //     { enableHighAccuracy: true }
//   //   );
//   // };

//   // ✅ Handle selected location from MapPicker screen
//   useFocusEffect(
//     useCallback(() => {
//       if (route?.params?.selectedLocation) {
//         setMapLocation(route.params.selectedLocation);
//       }
//     }, [route?.params?.selectedLocation])
//   );

//   // ✅ Load property data when editing
//   useFocusEffect(
//     useCallback(() => {
//       const loadProperty = async () => {
//         if (!editingProperty?._id && !editingProperty?.id) return;
//         try {
//           const id = editingProperty._id || editingProperty.id;
//           const data = await getPropertyById(id);
//           if (data?.images && Array.isArray(data.images)) {
//             const normalized = data.images.map((img) => {
//               if (!img || typeof img !== "string") return img;

//               const trimmed = img.trim();

//               if (trimmed.startsWith("data:")) return trimmed;
//               if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
//               if (trimmed.startsWith("/")) return `${BASE_URL}${trimmed}`;

//               const isLikelyBase64 = /^[A-Za-z0-9+/=\n\r]+$/.test(trimmed.replace(/\s+/g, "")) && trimmed.length > 100;
//               if (isLikelyBase64) return `data:image/jpeg;base64,${trimmed.replace(/\s+/g, "")}`;

//               return `${BASE_URL}${trimmed}`;
//             });
//             setImages(normalized.filter(Boolean));
//           }
//         } catch (error) {
//           console.error("Error loading property:", error.message);
//         }
//       };
//       loadProperty();
//     }, [editingProperty?._id])
//   );

//   const handleImagePick = () => {
//     if (images.length >= 5) {
//       Alert.alert("Limit Reached", "You can upload a maximum of 5 images only.");
//       return;
//     }

//     Alert.alert("Upload Image", "Choose an option", [
//       {
//         text: "Camera",
//         onPress: () =>
//           launchCamera({ mediaType: "photo" }, async (res) => {
//             if (res.assets) {
//               const asset = res.assets[0];
//               try {
//                 const resized = await ImageResizer.createResizedImage(asset.uri, 800, 600, "JPEG", 60);
//                 const base64Data = await RNFS.readFile(resized.uri, "base64");
//                 const newImage = `data:image/jpeg;base64,${base64Data}`;
//                 if (images.length < 5) setImages((prev) => [...prev, newImage]);
//               } catch (err) {
//                 console.error("Compression failed:", err);
//               }
//             }
//           }),
//       },
//       {
//         text: "Gallery",
//         onPress: () =>
//           launchImageLibrary({ mediaType: "photo", selectionLimit: 5 - images.length }, async (res) => {
//             if (res.assets) {
//               const newImages = [];
//               for (let asset of res.assets) {
//                 try {
//                   const resized = await ImageResizer.createResizedImage(asset.uri, 800, 600, "JPEG", 60);
//                   const base64Data = await RNFS.readFile(resized.uri, "base64");
//                   newImages.push(`data:image/jpeg;base64,${base64Data}`);
//                 } catch (err) {
//                   console.error("Compression failed:", err);
//                 }
//               }

//               const totalImages = [...images, ...newImages];
//               if (totalImages.length > 5) {
//                 Alert.alert("Limit Reached", "You can have max 5 images total.");
//                 setImages(totalImages.slice(0, 5));
//               } else {
//                 setImages(totalImages);
//               }
//             }
//           }),
//       },
//       { text: "Cancel", style: "cancel" },
//     ]);
//   };

//   const removeImage = (i) => {
//     const updated = [...images];
//     updated.splice(i, 1);
//     setImages(updated);
//   };

//   const handleSubmit = async () => {
//     try {
//       const requiredFields = {
//         Title: title,
//         Price: price,
//         Contact: contact,
//         Address: location,
//         State: state,
//         District: district,
//         Category: category,
//         PropertyPreference: propertyPreference,
//       };

//       const missing = Object.entries(requiredFields)
//         .filter(([_, v]) => !v || v.trim() === "")
//         .map(([k]) => k);

//       if (missing.length > 0) {
//         setMissingFieldsList(missing);
//         setMissingModalVisible(true);
//         return;
//       }

//       const payload = {
//         title,
//         price,
//         contact: Number(contact),
//         location,
//         mapLocation,
//         district,
//         subDistrict,
//         state,
//         landmark,
//         propertySize,
//         propertyUnit,
//         bedrooms,
//         bathrooms,
//         kitchen,
//         buildingDetails,
//         interior,
//         construction,
//         images,
//         category,
//         propertyPreference,
//       };

//       if (editingProperty) {
//         await updateProperty(editingProperty._id || editingProperty.id, payload);
//         Alert.alert("✅ Success", "Property updated successfully!", [
//           { text: "OK", onPress: () => navigation.goBack() },
//         ]);
//       } else {
//         await addProperty(payload);
//         navigation.reset({
//           index: 0,
//           routes: [{ name: "Success" }],
//         });
//       }
//     } catch (err) {
//       console.error("Save Error:", err.response?.data || err.message);
//       Alert.alert("❌ Error", "Failed to save property");
//     }
//   };

//   const backgroundColor = isDark ? "#121212" : "#f9f9f9";
//   const cardColor = isDark ? "#1E1E1E" : "#fff";
//   const textColor = isDark ? "#EDEDED" : "#000";
//   const placeholderColor = isDark ? "#888" : "#666";
//   const borderColor = isDark ? "#333" : "#20A68B";

//   return (
//     <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
//       <AnimatedBackground />

//       <LinearGradient
//         colors={isDark ? ["#114D44", "#0D3732"] : ["#43C6AC", "#20A68B"]}
//         style={styles.headerContainer}
//       >
//         <View style={styles.header}>
//           <TouchableOpacity onPress={() => navigation.goBack()}>
//             <ArrowLeft size={24} color="#fff" />
//           </TouchableOpacity>
//           <GlobalText bold style={styles.headerTitle}>
//             {editingProperty ? "Edit Property" : "Add Property"}
//           </GlobalText>
//           <View style={{ width: 24 }} />
//         </View>
//       </LinearGradient>

//       <ScrollView
//         contentContainerStyle={{ padding: 20, paddingBottom: 80 }}
//         nestedScrollEnabled={true}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Property Preference Dropdown */}
//         <GlobalText medium style={[styles.label, { color: textColor }]}>
//           Property Preference
//         </GlobalText>
//         <DropDownPicker
//           open={preferenceOpen}
//           value={propertyPreference}
//           items={preferenceItems}
//           setOpen={setPreferenceOpen}
//           setValue={setPropertyPreference}
//           placeholder="-- Select Preference --"
//           style={[styles.dropdownBox, { borderColor, backgroundColor: cardColor }]}
//           dropDownContainerStyle={[
//             styles.dropdownList,
//             { backgroundColor: cardColor, borderColor },
//           ]}
//           zIndex={5000}
//           zIndexInverse={500}
//           listMode="SCROLLVIEW"
//         />

//         <GlobalText medium style={[styles.label, { color: textColor }]}>
//           Category
//         </GlobalText>
//         <DropDownPicker
//           open={categoryOpen}
//           value={category}
//           items={categoryItems}
//           setOpen={setCategoryOpen}
//           setValue={setCategory}
//           placeholder="-- Select Category --"
//           style={[styles.dropdownBox, { borderColor, backgroundColor: cardColor }]}
//           dropDownContainerStyle={[
//             styles.dropdownList,
//             { backgroundColor: cardColor, borderColor },
//           ]}
//           zIndex={4000}
//           zIndexInverse={1000}
//           listMode="SCROLLVIEW"
//         />

//         <InputBox 
//           icon={<Home size={18} color="#20A68B" />} 
//           placeholder="Property Title ( Name of place )" 
//           value={title} 
//           onChange={setTitle} 
//           textColor={textColor} 
//           placeholderColor={placeholderColor} 
//           cardColor={cardColor} 
//           borderColor={borderColor} 
//         />
//         <InputBox 
//           icon={<IndianRupee size={18} color="#20A68B" />} 
//           placeholder="Price ( e.g., 80k, 1 lakh, 50 lakhs )" 
//           value={price} 
//           onChange={setPrice}  
//           textColor={textColor} 
//           placeholderColor={placeholderColor} 
//           cardColor={cardColor} 
//           borderColor={borderColor} 
//         />
//         <InputBox 
//           icon={<Phone size={18} color="#20A68B" />} 
//           placeholder="Contact Number" 
//           value={contact} 
//           onChange={setContact} 
//           keyboardType="phone-pad" 
//           textColor={textColor} 
//           placeholderColor={placeholderColor} 
//           cardColor={cardColor} 
//           borderColor={borderColor} 
//         />
//         <InputBox 
//           icon={<MapPin size={18} color="#20A68B" />} 
//           placeholder="Address" 
//           value={location} 
//           onChange={setLocation} 
//           textColor={textColor} 
//           placeholderColor={placeholderColor} 
//           cardColor={cardColor} 
//           borderColor={borderColor} 
//         />

//         {/* State Dropdown */}
//         <GlobalText medium style={[styles.label, { color: textColor }]}>
//           State
//         </GlobalText>
//         <DropDownPicker
//           open={stateOpen}
//           value={state}
//           items={stateItems}
//           setOpen={setStateOpen}
//           setValue={(callback) => {
//             const selected = typeof callback === "function" ? callback(state) : callback;
//             setState(selected);
//             setDistrict("");
//             setSubDistrict("");
//           }}
//           placeholder="-- Select State --"
//           style={[styles.dropdownBox, { borderColor, backgroundColor: cardColor }]}
//           dropDownContainerStyle={[
//             styles.dropdownList,
//             { backgroundColor: cardColor, borderColor },
//           ]}
//           zIndex={3000}
//           zIndexInverse={2000}
//           listMode="SCROLLVIEW"
//         />

//         {/* District Dropdown */}
//         <GlobalText medium style={[styles.label, { color: textColor }]}>
//           District
//         </GlobalText>
//         <DropDownPicker
//           open={districtOpen}
//           value={district}
//           items={districtItems()}
//           setOpen={setDistrictOpen}
//           setValue={setDistrict}
//           placeholder="-- Select District --"
//           style={[styles.dropdownBox, { borderColor, backgroundColor: cardColor }]}
//           dropDownContainerStyle={[
//             styles.dropdownList,
//             { backgroundColor: cardColor, borderColor },
//           ]}
//           zIndex={2000}
//           zIndexInverse={3000}
//           listMode="SCROLLVIEW"
//           disabled={!state}
//         />

//         <InputBox
//           icon={<Landmark size={18} color="#20A68B" />}
//           placeholder="Nearby Landmark"
//           value={landmark}
//           onChange={setLandmark}
//           textColor={textColor}
//           placeholderColor={placeholderColor}
//           cardColor={cardColor}
//           borderColor={borderColor}
//         />

//         {/* Property Size with Unit Dropdown */}
//         <GlobalText medium style={[styles.label, { color: textColor }]}>
//           Property Size
//         </GlobalText>
//         <View style={{ flexDirection: "row", gap: 10, marginBottom: 15 }}>
//           <View style={{ flex: 1 }}>
//             <InputBox
//               icon={<Ruler size={18} color="#20A68B" />}
//               placeholder="Size Value"
//               value={propertySize}
//               onChange={setPropertySize}
//               keyboardType="numeric"
//               textColor={textColor}
//               placeholderColor={placeholderColor}
//               cardColor={cardColor}
//               borderColor={borderColor}
//             />
//           </View>
//           <View style={{ width: 130 }}>
//             <DropDownPicker
//               open={unitOpen}
//               value={propertyUnit}
//               items={propertyUnitItems}
//               setOpen={setUnitOpen}
//               setValue={setPropertyUnit}
//               placeholder="Unit"
//               style={[styles.dropdownBox, { borderColor, backgroundColor: cardColor }]}
//               dropDownContainerStyle={[
//                 styles.dropdownList,
//                 { backgroundColor: cardColor, borderColor },
//               ]}
//               zIndex={1500}
//               zIndexInverse={3500}
//               listMode="SCROLLVIEW"
//             />
//           </View>
//         </View>

//         {/* Map Location Picker */}
//         <GlobalText medium style={[styles.label, { color: textColor }]}>
//           Map Location
//         </GlobalText>
//         <TouchableOpacity onPress={() => setMapModal(true)}>
//           <View style={[styles.inputBox, { borderColor, backgroundColor: cardColor }]}>
//             <View style={styles.inputRow}>
//               <Map size={18} color="#20A68B" />
//               <TextInput
//                 placeholder="Select location on map"
//                 placeholderTextColor={placeholderColor}
//                 style={[styles.inputField, { height: 45, color: textColor }]}
//                 value={mapLocation?.link || ""}
//                 editable={false}
//                 pointerEvents="none"
//               />
//             </View>
//           </View>
//         </TouchableOpacity>

//         {/* Map Modal */}
//         <Modal visible={mapModal} transparent animationType="slide">
//           <View style={styles.modalOverlay}>
//             <Animatable.View animation="slideInUp" duration={300} style={[styles.mapOptionBox, { backgroundColor: cardColor }]}>
//               <GlobalText bold style={[styles.mapOptionTitle, { color: textColor }]}>
//                 Select Location
//               </GlobalText>
              
//               <TouchableOpacity 
//                 style={styles.mapOptionBtn} 
//                 onPress={openMapPicker}
//               >
//                 <MapPin size={20} color="#20A68B" />
//                 <GlobalText style={[styles.mapOptionText, { color: textColor }]}>
//                   📍 Select on Map
//                 </GlobalText>
//               </TouchableOpacity>

//               <TouchableOpacity 
//                 style={styles.mapOptionBtn} 
//                 onPress={useCurrentLocation}
//               >
//                 <Landmark size={20} color="#20A68B" />
//                 <GlobalText style={[styles.mapOptionText, { color: textColor }]}>
//                   📡 Use Current Location
//                 </GlobalText>
//               </TouchableOpacity>

//               <TouchableOpacity 
//                 style={[styles.mapOptionBtn, styles.cancelBtn]} 
//                 onPress={() => setMapModal(false)}
//               >
//                 <GlobalText style={{ color: "red" }}>Cancel</GlobalText>
//               </TouchableOpacity>
//             </Animatable.View>
//           </View>
//         </Modal>

//         {category?.toLowerCase() === "house" && (
//           <>
//             <InputBox
//               icon={<Bed size={18} color="#20A68B" />}
//               placeholder="Bedrooms"
//               value={bedrooms}
//               onChange={setBedrooms}
//               keyboardType="numeric"
//               textColor={textColor}
//               placeholderColor={placeholderColor}
//               cardColor={cardColor}
//               borderColor={borderColor}
//             />
//             <InputBox
//               icon={<Bath size={18} color="#20A68B" />}
//               placeholder="Bathrooms"
//               value={bathrooms}
//               onChange={setBathrooms}
//               keyboardType="numeric"
//               textColor={textColor}
//               placeholderColor={placeholderColor}
//               cardColor={cardColor}
//               borderColor={borderColor}
//             />
//             <InputBox
//               icon={<UtensilsCrossed size={18} color="#20A68B" />}
//               placeholder="Kitchen (Yes/No)"
//               value={kitchen}
//               onChange={setKitchen}
//               textColor={textColor}
//               placeholderColor={placeholderColor}
//               cardColor={cardColor}
//               borderColor={borderColor}
//             />
//           </>
//         )}

//         <InputBox
//           icon={<ClipboardList size={18} color="#20A68B" />}
//           placeholder="Building Details"
//           value={buildingDetails}
//           onChange={setBuildingDetails}
//           textColor={textColor}
//           placeholderColor={placeholderColor}
//           cardColor={cardColor}
//           borderColor={borderColor}
//         />
//         <InputBox
//           icon={<Wrench size={18} color="#20A68B" />}
//           placeholder="Construction Details"
//           value={construction}
//           onChange={setConstruction}
//           multiline
//           height={80}
//           textColor={textColor}
//           placeholderColor={placeholderColor}
//           cardColor={cardColor}
//           borderColor={borderColor}
//         />

//         {/* Image Upload Section */}
//         <GlobalText
//           style={{ textAlign: "center", marginBottom: 8, color: "#888" }}
//         >
//           {images.length}/5 images uploaded
//         </GlobalText>

//         <TouchableOpacity
//           style={[styles.uploadBox, { borderColor }]}
//           onPress={handleImagePick}
//         >
//           <Upload size={20} color="#20A68B" />
//           <GlobalText semiBold style={[styles.uploadText, { color: "#20A68B" }]}>
//             Upload Images
//           </GlobalText>
//         </TouchableOpacity>

//         <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
//           {images.map((img, i) => (
//             <View key={i} style={{ position: "relative", margin: 5 }}>
//               <Image source={{ uri: img }} style={styles.uploaded} />
//               <TouchableOpacity
//                 style={styles.deleteBtn}
//                 onPress={() => removeImage(i)}
//               >
//                 <Trash2 size={18} color="red" />
//               </TouchableOpacity>
//             </View>
//           ))}
//         </View>

//         {/* Submit Button */}
//         <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
//           <GlobalText bold style={styles.submitText}>
//             {editingProperty ? "Update Property" : "Add Property"}
//           </GlobalText>
//         </TouchableOpacity>
//       </ScrollView>

//       {/* Missing Fields Modal */}
//       <Modal visible={missingModalVisible} transparent animationType="fade">
//         <View style={styles.modalOverlay}>
//           <Animatable.View animation="zoomIn" duration={300} style={styles.modalBox}>
//             <AlertTriangle size={50} color="#FF6B6B" />
//             <GlobalText bold style={styles.modalTitle}>
//               Missing Fields
//             </GlobalText>
//             <GlobalText style={styles.modalSub}>
//               Please fill the following fields:
//             </GlobalText>
//             {missingFieldsList.map((field, idx) => (
//               <GlobalText key={idx} style={styles.modalList}>
//                 • {field}
//               </GlobalText>
//             ))}
//             <TouchableOpacity
//               onPress={() => setMissingModalVisible(false)}
//               style={styles.modalBtn}
//             >
//               <GlobalText bold style={{ color: "#fff" }}>
//                 OK
//               </GlobalText>
//             </TouchableOpacity>
//           </Animatable.View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// // Input Box Component
// function InputBox({
//   icon,
//   placeholder,
//   value,
//   onChange,
//   keyboardType,
//   multiline,
//   height,
//   textColor,
//   placeholderColor,
//   cardColor,
//   borderColor,
//   editable = true,
// }) {
//   return (
//     <View style={[styles.inputBox, { borderColor, backgroundColor: cardColor }]}>
//       <View style={styles.inputRow}>
//         {icon}
//         <TextInput
//           placeholder={placeholder}
//           placeholderTextColor={placeholderColor}
//           style={[styles.inputField, { height: height || 45, color: textColor }]}
//           value={value}
//           onChangeText={onChange}
//           keyboardType={keyboardType || "default"}
//           multiline={multiline}
//           editable={editable}
//         />
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: { flex: 1 },
//   headerContainer: {
//     paddingVertical: 12,
//     elevation: 6,
//     borderBottomLeftRadius: 20,
//     borderBottomRightRadius: 20,
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 16,
//   },
//   headerTitle: { fontSize: 18, color: "#fff" },
//   label: { fontSize: 14, marginBottom: 6 },
//   inputBox: {
//     borderWidth: 1,
//     borderRadius: 10,
//     marginBottom: 15,
//     paddingHorizontal: 10,
//   },
//   inputRow: { flexDirection: "row", alignItems: "center" },
//   inputField: { flex: 1, paddingHorizontal: 8, fontSize: 14 },
//   dropdownBox: { borderWidth: 1.5, borderRadius: 10, marginBottom: 15 },
//   dropdownList: { borderWidth: 1, borderRadius: 10 },
//   uploadBox: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     borderWidth: 1,
//     borderRadius: 10,
//     height: 55,
//     marginBottom: 20,
//   },
//   uploadText: { marginLeft: 8, fontSize: 14 },
//   uploaded: { width: 100, height: 100, borderRadius: 10 },
//   deleteBtn: {
//     position: "absolute",
//     top: -6,
//     right: -6,
//     backgroundColor: "#fff",
//     borderRadius: 20,
//     padding: 2,
//   },
//   submitBtn: {
//     backgroundColor: "#20A68B",
//     borderRadius: 12,
//     paddingVertical: 15,
//     alignItems: "center",
//     marginTop: 10,
//   },
//   submitText: { color: "#fff", fontSize: 15 },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.6)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalBox: {
//     backgroundColor: "#fff",
//     width: "80%",
//     borderRadius: 16,
//     padding: 20,
//     alignItems: "center",
//   },
//   modalTitle: { fontSize: 18, marginTop: 10, color: "#222" },
//   modalSub: { fontSize: 13, color: "#555", marginVertical: 5 },
//   modalList: { color: "#333", marginTop: 3 },
//   modalBtn: {
//     backgroundColor: "#20A68B",
//     paddingHorizontal: 25,
//     paddingVertical: 8,
//     borderRadius: 10,
//     marginTop: 15,
//   },
//   mapOptionBox: {
//     width: "85%",
//     borderRadius: 16,
//     padding: 20,
//     alignItems: "center",
//   },
//   mapOptionTitle: {
//     fontSize: 18,
//     marginBottom: 20,
//   },
//   mapOptionBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     width: "100%",
//     paddingVertical: 15,
//     paddingHorizontal: 20,
//     borderRadius: 10,
//     backgroundColor: "#f0f0f0",
//     marginBottom: 12,
//   },
//   mapOptionText: {
//     marginLeft: 10,
//     fontSize: 15,
//   },
//   cancelBtn: {
//     backgroundColor: "#ffebee",
//     justifyContent: "center",
//   },
// });

// // import React, { useState, useCallback } from "react";
// // import {
// //   View,
// //   TextInput,
// //   StyleSheet,
// //   ScrollView,
// //   TouchableOpacity,
// //   Image,
// //   Alert,
// //   useColorScheme,
// //   Modal,
// // } from "react-native";
// // import LinearGradient from "react-native-linear-gradient";
// // import { SafeAreaView } from "react-native-safe-area-context";
// // import { launchCamera, launchImageLibrary } from "react-native-image-picker";
// // import DropDownPicker from "react-native-dropdown-picker";
// // import AnimatedBackground from "../../components/ReusableComponents/AnimatedBackground";
// // import { addProperty, updateProperty, getPropertyById } from "../../api/api";
// // import GlobalText from "../../theme/GlobalText";
// // import propertyTypes from "../../constants/propertyTypes";
// // import states from "../../constants/locations/state";
// // import districts from "../../constants/locations/districts";
// // import subDistricts from "../../constants/locations/subDistricts";
// // import * as Animatable from "react-native-animatable";
// // import {
// //   ArrowLeft,
// //   Upload,
// //   Trash2,
// //   Home,
// //   IndianRupee,
// //   Phone,
// //   MapPin,
// //   Landmark,
// //   Ruler,
// //   Map,
// //   Bed,
// //   Bath,
// //   UtensilsCrossed,
// //   ClipboardList,
// //   Sofa,
// //   Wrench,
// //   AlertTriangle,
// // } from "lucide-react-native";
// // import { useTheme, useFocusEffect } from "@react-navigation/native";
// // import RNFS from "react-native-fs";
// // import ImageResizer from "react-native-image-resizer";

// // // const BASE_URL = "https://zero-estate-backend-render.onrender.com";

// // export default function AddPropertyScreen({ route, navigation }) {
// //   const editingProperty = route?.params?.property || null;
// //   const scheme = useColorScheme();
// //   const { colors } = useTheme();
// //   const isDark = scheme === "dark";

// //   const [missingModalVisible, setMissingModalVisible] = useState(false);
// //   const [missingFieldsList, setMissingFieldsList] = useState([]);

// //   const [title, setTitle] = useState(editingProperty?.title || "");
// //   const [price, setPrice] = useState(editingProperty?.price?.toString() || "");
// //   const [contact, setContact] = useState(editingProperty?.contact?.toString() || "");
// //   const [location, setLocation] = useState(editingProperty?.location || "");
// //   const [mapLocation, setMapLocation] = useState(editingProperty?.mapLocation || "");
// //   const [landmark, setLandmark] = useState(editingProperty?.landmark || "");
  
// //   // ✅ Merged: Using propertySize and propertyUnit instead of sqft
// //   const [propertySize, setPropertySize] = useState(editingProperty?.propertySize?.toString() || "");
// //   const [propertyUnit, setPropertyUnit] = useState(editingProperty?.propertyUnit || "sqft");
// //   const [unitOpen, setUnitOpen] = useState(false);

// //   const [bedrooms, setBedrooms] = useState(editingProperty?.bedrooms?.toString() || "1");
// //   const [bathrooms, setBathrooms] = useState(editingProperty?.bathrooms?.toString() || "1");
// //   const [kitchen, setKitchen] = useState(editingProperty?.kitchen || "Yes");
  
// //   // ✅ Merged: Using buildingDetails instead of amenities
// //   const [buildingDetails, setBuildingDetails] = useState(editingProperty?.buildingDetails || "");
// //   const [interior, setInterior] = useState(editingProperty?.interior || "");
// //   const [construction, setConstruction] = useState(editingProperty?.construction || "");
// //   const [images, setImages] = useState([]);
// //   const [category, setCategory] = useState(editingProperty?.category || "House");

// //   const [state, setState] = useState(editingProperty?.state || "");
// //   const [district, setDistrict] = useState(editingProperty?.district || "");
// //   const [subDistrict, setSubDistrict] = useState(editingProperty?.subDistrict || "");

// //   // 🏡 Property preference field
// //   const [propertyPreference, setPropertyPreference] = useState(editingProperty?.propertyPreference || "Sale");
// //   const [preferenceOpen, setPreferenceOpen] = useState(false);

// //   const [categoryOpen, setCategoryOpen] = useState(false);
// //   const [stateOpen, setStateOpen] = useState(false);
// //   const [districtOpen, setDistrictOpen] = useState(false);
// //   const [subDistrictOpen, setSubDistrictOpen] = useState(false);

// //   const stateItems = states.map((s) => ({ label: s, value: s }));
// //   const districtItems = useCallback(() => {
// //     return state ? (districts[state] || []).map((d) => ({ label: d, value: d })) : [];
// //   }, [state]);
// //   const subDistrictItems = useCallback(() => {
// //     return district ? (subDistricts[district] || []).map((sd) => ({ label: sd, value: sd })) : [];
// //   }, [district]);
// //   const categoryItems = propertyTypes.map((c) => ({ label: c.name, value: c.name }));

// //   // Dropdown for property preference
// //   const preferenceItems = [
// //     { label: "Sale", value: "Sale" },
// //     { label: "Rent", value: "Rent" },
// //   ];

// //   // ✅ Merged: Property unit items
// //   const propertyUnitItems = [
// //     { label: "Sqft", value: "sqft" },
// //     { label: "Cent", value: "cent" },
// //     { label: "Acre", value: "acre" },
// //   ];


// //   const useCurrentLocation = () => {
// //   Geolocation.getCurrentPosition(
// //     (pos) => {
// //             const { latitude, longitude } = pos.coords;
// //             setMapLocation({
// //               lat: latitude,
// //               lng: longitude,
// //               link: `https://www.google.com/maps?q=${latitude},${longitude}`,
// //             });
// //             setMapModal(false);
// //           },
// //           (err) => Alert.alert("Error", err.message),
// //           { enableHighAccuracy: true }
// //         );
// //       };



// //   useFocusEffect(
// //   useCallback(() => {
// //         if (route?.params?.selectedLocation) {
// //           setMapLocation(route.params.selectedLocation);
// //         }
// //       }, [route?.params?.selectedLocation])
// //     );


// //   useFocusEffect(
// //     useCallback(() => {
// //       const loadProperty = async () => {
// //         if (!editingProperty?._id && !editingProperty?.id) return;
// //         try {
// //           const id = editingProperty._id || editingProperty.id;
// //           const data = await getPropertyById(id);
// //           if (data?.images && Array.isArray(data.images)) {
// //             // Normalize images for display in RN Image component.
// //             // Supported shapes:
// //             // - full data URLs (data:...;base64,...) -> leave as-is
// //             // - absolute URLs (http(s)://...) -> leave as-is
// //             // - server-relative paths (/uploads/filename) -> prefix BASE_URL
// //             // - plain base64 strings (without data: prefix) -> prefix a data header
// //             const normalized = data.images.map((img) => {
// //               if (!img || typeof img !== "string") return img;

// //               const trimmed = img.trim();

// //               if (trimmed.startsWith("data:")) return trimmed; // already a data URL
// //               if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed; // full URL
// //               if (trimmed.startsWith("/")) return `${BASE_URL}${trimmed}`; // server-relative path

// //               // Heuristic: if it's a long base64-like string, assume base64 body and prefix data header
// //               // Many base64 payloads are longer than 200 chars; adjust as needed
// //               const isLikelyBase64 = /^[A-Za-z0-9+/=\n\r]+$/.test(trimmed.replace(/\s+/g, "")) && trimmed.length > 100;
// //               if (isLikelyBase64) return `data:image/jpeg;base64,${trimmed.replace(/\s+/g, "")}`;

// //               // Fallback: treat as server-relative path
// //               return `${BASE_URL}${trimmed}`;
// //             });
// //             setImages(normalized.filter(Boolean));
// //           }
// //         } catch (error) {
// //           console.error("Error loading property:", error.message);
// //         }
// //       };
// //       loadProperty();
// //     }, [editingProperty?._id])
// //   );

// //   const handleImagePick = () => {
// //     if (images.length >= 5) {
// //       Alert.alert("Limit Reached", "You can upload a maximum of 5 images only.");
// //       return;
// //     }

// //     Alert.alert("Upload Image", "Choose an option", [
// //       {
// //         text: "Camera",
// //         onPress: () =>
// //           launchCamera({ mediaType: "photo" }, async (res) => {
// //             if (res.assets) {
// //               const asset = res.assets[0];
// //               try {
// //                 const resized = await ImageResizer.createResizedImage(asset.uri, 800, 600, "JPEG", 60);
// //                 const base64Data = await RNFS.readFile(resized.uri, "base64");
// //                 const newImage = `data:image/jpeg;base64,${base64Data}`;
// //                 if (images.length < 5) setImages((prev) => [...prev, newImage]);
// //               } catch (err) {
// //                 console.error("Compression failed:", err);
// //               }
// //             }
// //           }),
// //       },
// //       {
// //         text: "Gallery",
// //         onPress: () =>
// //           launchImageLibrary({ mediaType: "photo", selectionLimit: 5 - images.length }, async (res) => {
// //             if (res.assets) {
// //               const newImages = [];
// //               for (let asset of res.assets) {
// //                 try {
// //                   const resized = await ImageResizer.createResizedImage(asset.uri, 800, 600, "JPEG", 60);
// //                   const base64Data = await RNFS.readFile(resized.uri, "base64");
// //                   newImages.push(`data:image/jpeg;base64,${base64Data}`);
// //                 } catch (err) {
// //                   console.error("Compression failed:", err);
// //                 }
// //               }

// //               const totalImages = [...images, ...newImages];
// //               if (totalImages.length > 5) {
// //                 Alert.alert("Limit Reached", "You can have max 5 images total.");
// //                 setImages(totalImages.slice(0, 5));
// //               } else {
// //                 setImages(totalImages);
// //               }
// //             }
// //           }),
// //       },
// //       { text: "Cancel", style: "cancel" },
// //     ]);
// //   };

// //   const removeImage = (i) => {
// //     const updated = [...images];
// //     updated.splice(i, 1);
// //     setImages(updated);
// //   };

// //   const handleSubmit = async () => {
// //     try {
// //       const requiredFields = {
// //         Title: title,
// //         Price: price,
// //         Contact: contact,
// //         Address: location,
// //         State: state,
// //         District: district,
// //         Category: category,
// //         PropertyPreference: propertyPreference,
// //       };

// //       const missing = Object.entries(requiredFields)
// //         .filter(([_, v]) => !v || v.trim() === "")
// //         .map(([k]) => k);

// //       if (missing.length > 0) {
// //         setMissingFieldsList(missing);
// //         setMissingModalVisible(true);
// //         return;
// //       }

// //       // ✅ Merged: Updated payload with propertySize, propertyUnit, and buildingDetails
// //       const payload = {
// //         title,
// //         price,
// //         contact: Number(contact),
// //         location,
// //         mapLocation,
// //         district,
// //         subDistrict,
// //         state,
// //         landmark,
// //         propertySize, // ✅ Changed from sqft
// //         propertyUnit, // ✅ Added unit
// //         bedrooms,
// //         bathrooms,
// //         kitchen,
// //         buildingDetails, // ✅ Changed from amenities
// //         interior,
// //         construction,
// //         images,
// //         category,
// //         propertyPreference,
// //       };

// //       if (editingProperty) {
// //         await updateProperty(editingProperty._id || editingProperty.id, payload);
// //         Alert.alert("✅ Success", "Property updated successfully!", [
// //           { text: "OK", onPress: () => navigation.goBack() },
// //         ]);
// //       } else {
// //         await addProperty(payload);
// //         navigation.reset({
// //           index: 0,
// //           routes: [{ name: "Success" }],
// //         });
// //       }
// //     } catch (err) {
// //       console.error("Save Error:", err.response?.data || err.message);
// //       Alert.alert("❌ Error", "Failed to save property");
// //     }
// //   };

// //   const backgroundColor = isDark ? "#121212" : "#f9f9f9";
// //   const cardColor = isDark ? "#1E1E1E" : "#fff";
// //   const textColor = isDark ? "#EDEDED" : "#000";
// //   const placeholderColor = isDark ? "#888" : "#666";
// //   const borderColor = isDark ? "#333" : "#20A68B";

// //   return (
// //     <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
// //       <AnimatedBackground />

// //       <LinearGradient
// //         colors={isDark ? ["#114D44", "#0D3732"] : ["#43C6AC", "#20A68B"]}
// //         style={styles.headerContainer}
// //       >
// //         <View style={styles.header}>
// //           <TouchableOpacity onPress={() => navigation.goBack()}>
// //             <ArrowLeft size={24} color="#fff" />
// //           </TouchableOpacity>
// //           <GlobalText bold style={styles.headerTitle}>
// //             {editingProperty ? "Edit Property" : "Add Property"}
// //           </GlobalText>
// //           <View style={{ width: 24 }} />
// //         </View>
// //       </LinearGradient>

// //       <ScrollView
// //         contentContainerStyle={{ padding: 20, paddingBottom: 80 }}
// //         nestedScrollEnabled={true}
// //         showsVerticalScrollIndicator={false}
// //       >
// //         {/* 🏡 Property Preference Dropdown */}
// //         <GlobalText medium style={[styles.label, { color: textColor }]}>
// //           Property Preference
// //         </GlobalText>
// //         <DropDownPicker
// //           open={preferenceOpen}
// //           value={propertyPreference}
// //           items={preferenceItems}
// //           setOpen={setPreferenceOpen}
// //           setValue={setPropertyPreference}
// //           placeholder="-- Select Preference --"
// //           style={[styles.dropdownBox, { borderColor, backgroundColor: cardColor }]}
// //           dropDownContainerStyle={[
// //             styles.dropdownList,
// //             { backgroundColor: cardColor, borderColor },
// //           ]}
// //           zIndex={5000}
// //           zIndexInverse={500}
// //           listMode="SCROLLVIEW"
// //         />

// //         <GlobalText medium style={[styles.label, { color: textColor }]}>
// //           Category
// //         </GlobalText>
// //         <DropDownPicker
// //           open={categoryOpen}
// //           value={category}
// //           items={categoryItems}
// //           setOpen={setCategoryOpen}
// //           setValue={setCategory}
// //           placeholder="-- Select Category --"
// //           style={[styles.dropdownBox, { borderColor, backgroundColor: cardColor }]}
// //           dropDownContainerStyle={[
// //             styles.dropdownList,
// //             { backgroundColor: cardColor, borderColor },
// //           ]}
// //           zIndex={4000}
// //           zIndexInverse={1000}
// //           listMode="SCROLLVIEW"
// //         />

// //         <InputBox 
// //           icon={<Home size={18} color="#20A68B" />} 
// //           placeholder="Property Title ( Name of place )" 
// //           value={title} 
// //           onChange={setTitle} 
// //           textColor={textColor} 
// //           placeholderColor={placeholderColor} 
// //           cardColor={cardColor} 
// //           borderColor={borderColor} 
// //         />
// //         <InputBox 
// //           icon={<IndianRupee size={18} color="#20A68B" />} 
// //           placeholder="Price ( e.g., 80k, 1 lakh, 50 lakhs )" 
// //           value={price} 
// //           onChange={setPrice}  
// //           textColor={textColor} 
// //           placeholderColor={placeholderColor} 
// //           cardColor={cardColor} 
// //           borderColor={borderColor} 
// //         />
// //         <InputBox 
// //           icon={<Phone size={18} color="#20A68B" />} 
// //           placeholder="Contact Number" 
// //           value={contact} 
// //           onChange={setContact} 
// //           keyboardType="phone-pad" 
// //           textColor={textColor} 
// //           placeholderColor={placeholderColor} 
// //           cardColor={cardColor} 
// //           borderColor={borderColor} 
// //         />
// //         <InputBox 
// //           icon={<MapPin size={18} color="#20A68B" />} 
// //           placeholder="Address" 
// //           value={location} 
// //           onChange={setLocation} 
// //           textColor={textColor} 
// //           placeholderColor={placeholderColor} 
// //           cardColor={cardColor} 
// //           borderColor={borderColor} 
// //         />

// //         {/* 🌎 State Dropdown */}
// //         <GlobalText medium style={[styles.label, { color: textColor }]}>
// //           State
// //         </GlobalText>
// //         <DropDownPicker
// //           open={stateOpen}
// //           value={state}
// //           items={stateItems}
// //           setOpen={setStateOpen}
// //           setValue={(callback) => {
// //             const selected = typeof callback === "function" ? callback(state) : callback;
// //             setState(selected);
// //             setDistrict("");
// //             setSubDistrict("");
// //           }}
// //           placeholder="-- Select State --"
// //           style={[styles.dropdownBox, { borderColor, backgroundColor: cardColor }]}
// //           dropDownContainerStyle={[
// //             styles.dropdownList,
// //             { backgroundColor: cardColor, borderColor },
// //           ]}
// //           zIndex={3000}
// //           zIndexInverse={2000}
// //           listMode="SCROLLVIEW"
// //         />

// //         {/* 🏙️ District Dropdown */}
// //         <GlobalText medium style={[styles.label, { color: textColor }]}>
// //           District
// //         </GlobalText>
// //         <DropDownPicker
// //           open={districtOpen}
// //           value={district}
// //           items={districtItems()}
// //           setOpen={setDistrictOpen}
// //           setValue={setDistrict}
// //           placeholder="-- Select District --"
// //           style={[styles.dropdownBox, { borderColor, backgroundColor: cardColor }]}
// //           dropDownContainerStyle={[
// //             styles.dropdownList,
// //             { backgroundColor: cardColor, borderColor },
// //           ]}
// //           zIndex={2000}
// //           zIndexInverse={3000}
// //           listMode="SCROLLVIEW"
// //           disabled={!state}
// //         />

// //         {/* 🏘️ Sub-District Dropdown - Commented as per second code */}
// //         {/* <GlobalText medium style={[styles.label, { color: textColor }]}>
// //           Sub-District
// //         </GlobalText>
// //         <DropDownPicker
// //           open={subDistrictOpen}
// //           value={subDistrict}
// //           items={subDistrictItems()}
// //           setOpen={setSubDistrictOpen}
// //           setValue={setSubDistrict}
// //           placeholder="-- Select Sub-District --"
// //           style={[styles.dropdownBox, { borderColor, backgroundColor: cardColor }]}
// //           dropDownContainerStyle={[
// //             styles.dropdownList,
// //             { backgroundColor: cardColor, borderColor },
// //           ]}
// //           zIndex={1000}
// //           zIndexInverse={4000}
// //           listMode="SCROLLVIEW"
// //           disabled={!district}
// //         /> */}

// //         <InputBox
// //           icon={<Landmark size={18} color="#20A68B" />}
// //           placeholder="Nearby Landmark"
// //           value={landmark}
// //           onChange={setLandmark}
// //           textColor={textColor}
// //           placeholderColor={placeholderColor}
// //           cardColor={cardColor}
// //           borderColor={borderColor}
// //         />

// //         {/* ✅ Merged: Property Size with Unit Dropdown */}
// //         <GlobalText medium style={[styles.label, { color: textColor }]}>
// //           Property Size
// //         </GlobalText>
// //         <View style={{ flexDirection: "row", gap: 10, marginBottom: 15 }}>
// //           <View style={{ flex: 1 }}>
// //             <InputBox
// //               icon={<Ruler size={18} color="#20A68B" />}
// //               placeholder="Size Value"
// //               value={propertySize}
// //               onChange={setPropertySize}
// //               keyboardType="numeric"
// //               textColor={textColor}
// //               placeholderColor={placeholderColor}
// //               cardColor={cardColor}
// //               borderColor={borderColor}
// //             />
// //           </View>
// //           <View style={{ width: 130 }}>
// //             <DropDownPicker
// //               open={unitOpen}
// //               value={propertyUnit}
// //               items={propertyUnitItems}
// //               setOpen={setUnitOpen}
// //               setValue={setPropertyUnit}
// //               placeholder="Unit"
// //               style={[styles.dropdownBox, { borderColor, backgroundColor: cardColor }]}
// //               dropDownContainerStyle={[
// //                 styles.dropdownList,
// //                 { backgroundColor: cardColor, borderColor },
// //               ]}
// //               zIndex={1500}
// //               zIndexInverse={3500}
// //               listMode="SCROLLVIEW"
// //             />
// //           </View>
// //         </View>

// //         {/* <InputBox
// //           icon={<Map size={18} color="#20A68B" />}
// //           placeholder="Google Maps Link ( Using Map link Here )"
// //           value={mapLocation}
// //           onChange={setMapLocation}
// //           textColor={textColor}
// //           placeholderColor={placeholderColor}
// //           cardColor={cardColor}
// //           borderColor={borderColor}
// //         /> */}
// //         <TouchableOpacity onPress={() => setMapModal(true)}>
// //           <InputBox
// //             icon={<Map size={18} color="#20A68B" />}
// //             placeholder="Select location on map"
// //             value={mapLocation?.link || ""}
// //             editable={false}
// //           />
// //         </TouchableOpacity>
// //         <Modal visible={mapModal} transparent animationType="slide">
// //           <View style={styles.modalOverlay}>
// //             <View style={styles.mapOptionBox}>
// //               <TouchableOpacity onPress={openMapPicker}>
// //                 <GlobalText>📍 Select on Map</GlobalText>
// //               </TouchableOpacity>

// //               <TouchableOpacity onPress={useCurrentLocation}>
// //                 <GlobalText>📡 Use Current Location</GlobalText>
// //               </TouchableOpacity>

// //               <TouchableOpacity onPress={() => setMapModal(false)}>
// //                 <GlobalText style={{ color: "red" }}>Cancel</GlobalText>
// //               </TouchableOpacity>
// //             </View>
// //           </View>
// //         </Modal>



// //         {category?.toLowerCase() === "house" && (
// //           <>
// //             <InputBox
// //               icon={<Bed size={18} color="#20A68B" />}
// //               placeholder="Bedrooms"
// //               value={bedrooms}
// //               onChange={setBedrooms}
// //               keyboardType="numeric"
// //               textColor={textColor}
// //               placeholderColor={placeholderColor}
// //               cardColor={cardColor}
// //               borderColor={borderColor}
// //             />
// //             <InputBox
// //               icon={<Bath size={18} color="#20A68B" />}
// //               placeholder="Bathrooms"
// //               value={bathrooms}
// //               onChange={setBathrooms}
// //               keyboardType="numeric"
// //               textColor={textColor}
// //               placeholderColor={placeholderColor}
// //               cardColor={cardColor}
// //               borderColor={borderColor}
// //             />
// //             <InputBox
// //               icon={<UtensilsCrossed size={18} color="#20A68B" />}
// //               placeholder="Kitchen (Yes/No)"
// //               value={kitchen}
// //               onChange={setKitchen}
// //               textColor={textColor}
// //               placeholderColor={placeholderColor}
// //               cardColor={cardColor}
// //               borderColor={borderColor}
// //             />
// //           </>
// //         )}

// //         {/* ✅ Merged: Building Details instead of Amenities */}
// //         <InputBox
// //           icon={<ClipboardList size={18} color="#20A68B" />}
// //           placeholder="Building Details"
// //           value={buildingDetails}
// //           onChange={setBuildingDetails}
// //           textColor={textColor}
// //           placeholderColor={placeholderColor}
// //           cardColor={cardColor}
// //           borderColor={borderColor}
// //         />
// //         {/* Commented Interior field as per second code */}
// //         {/* <InputBox
// //           icon={<Sofa size={18} color="#20A68B" />}
// //           placeholder="Interior Details"
// //           value={interior}
// //           onChange={setInterior}
// //           multiline
// //           height={80}
// //           textColor={textColor}
// //           placeholderColor={placeholderColor}
// //           cardColor={cardColor}
// //           borderColor={borderColor}
// //         /> */}
// //         <InputBox
// //           icon={<Wrench size={18} color="#20A68B" />}
// //           placeholder="Construction Details"
// //           value={construction}
// //           onChange={setConstruction}
// //           multiline
// //           height={80}
// //           textColor={textColor}
// //           placeholderColor={placeholderColor}
// //           cardColor={cardColor}
// //           borderColor={borderColor}
// //         />

// //         {/* 🖼️ Image Upload Section */}
// //         <GlobalText
// //           style={{ textAlign: "center", marginBottom: 8, color: "#888" }}
// //         >
// //           {images.length}/5 images uploaded
// //         </GlobalText>

// //         <TouchableOpacity
// //           style={[styles.uploadBox, { borderColor }]}
// //           onPress={handleImagePick}
// //         >
// //           <Upload size={20} color="#20A68B" />
// //           <GlobalText semiBold style={[styles.uploadText, { color: "#20A68B" }]}>
// //             Upload Images
// //           </GlobalText>
// //         </TouchableOpacity>

// //         <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
// //           {images.map((img, i) => (
// //             <View key={i} style={{ position: "relative", margin: 5 }}>
// //               <Image source={{ uri: img }} style={styles.uploaded} />
// //               <TouchableOpacity
// //                 style={styles.deleteBtn}
// //                 onPress={() => removeImage(i)}
// //               >
// //                 <Trash2 size={18} color="red" />
// //               </TouchableOpacity>
// //             </View>
// //           ))}
// //         </View>

// //         {/* ✅ Submit Button */}
// //         <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
// //           <GlobalText bold style={styles.submitText}>
// //             {editingProperty ? "Update Property" : "Add Property"}
// //           </GlobalText>
// //         </TouchableOpacity>
// //       </ScrollView>

// //       {/* ⚠️ Missing Fields Modal */}
// //       <Modal visible={missingModalVisible} transparent animationType="fade">
// //         <View style={styles.modalOverlay}>
// //           <Animatable.View animation="zoomIn" duration={300} style={styles.modalBox}>
// //             <AlertTriangle size={50} color="#FF6B6B" />
// //             <GlobalText bold style={styles.modalTitle}>
// //               Missing Fields
// //             </GlobalText>
// //             <GlobalText style={styles.modalSub}>
// //               Please fill the following fields:
// //             </GlobalText>
// //             {missingFieldsList.map((field, idx) => (
// //               <GlobalText key={idx} style={styles.modalList}>
// //                 • {field}
// //               </GlobalText>
// //             ))}
// //             <TouchableOpacity
// //               onPress={() => setMissingModalVisible(false)}
// //               style={styles.modalBtn}
// //             >
// //               <GlobalText bold style={{ color: "#fff" }}>
// //                 OK
// //               </GlobalText>
// //             </TouchableOpacity>
// //           </Animatable.View>
// //         </View>
// //       </Modal>
// //     </SafeAreaView>
// //   );
// // }

// // // 🧩 Input Box Component
// // function InputBox({
// //   icon,
// //   placeholder,
// //   value,
// //   onChange,
// //   keyboardType,
// //   multiline,
// //   height,
// //   textColor,
// //   placeholderColor,
// //   cardColor,
// //   borderColor,
// // }) {
// //   return (
// //     <View style={[styles.inputBox, { borderColor, backgroundColor: cardColor }]}>
// //       <View style={styles.inputRow}>
// //         {icon}
// //         <TextInput
// //           placeholder={placeholder}
// //           placeholderTextColor={placeholderColor}
// //           style={[styles.inputField, { height: height || 45, color: textColor }]}
// //           value={value}
// //           onChangeText={onChange}
// //           keyboardType={keyboardType || "default"}
// //           multiline={multiline}
// //         />
// //       </View>
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   safeArea: { flex: 1 },
// //   headerContainer: {
// //     paddingVertical: 12,
// //     elevation: 6,
// //     borderBottomLeftRadius: 20,
// //     borderBottomRightRadius: 20,
// //   },
// //   header: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     justifyContent: "space-between",
// //     paddingHorizontal: 16,
// //   },
// //   headerTitle: { fontSize: 18, color: "#fff" },
// //   label: { fontSize: 14, marginBottom: 6 },
// //   inputBox: {
// //     borderWidth: 1,
// //     borderRadius: 10,
// //     marginBottom: 15,
// //     paddingHorizontal: 10,
// //   },
// //   inputRow: { flexDirection: "row", alignItems: "center" },
// //   inputField: { flex: 1, paddingHorizontal: 8, fontSize: 14 },
// //   dropdownBox: { borderWidth: 1.5, borderRadius: 10, marginBottom: 15 },
// //   dropdownList: { borderWidth: 1, borderRadius: 10 },
// //   uploadBox: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     justifyContent: "center",
// //     borderWidth: 1,
// //     borderRadius: 10,
// //     height: 55,
// //     marginBottom: 20,
// //   },
// //   uploadText: { marginLeft: 8, fontSize: 14 },
// //   uploaded: { width: 100, height: 100, borderRadius: 10 },
// //   deleteBtn: {
// //     position: "absolute",
// //     top: -6,
// //     right: -6,
// //     backgroundColor: "#fff",
// //     borderRadius: 20,
// //     padding: 2,
// //   },
// //   submitBtn: {
// //     backgroundColor: "#20A68B",
// //     borderRadius: 12,
// //     paddingVertical: 15,
// //     alignItems: "center",
// //     marginTop: 10,
// //   },
// //   submitText: { color: "#fff", fontSize: 15 },
// //   modalOverlay: {
// //     flex: 1,
// //     backgroundColor: "rgba(0,0,0,0.6)",
// //     justifyContent: "center",
// //     alignItems: "center",
// //   },
// //   modalBox: {
// //     backgroundColor: "#fff",
// //     width: "80%",
// //     borderRadius: 16,
// //     padding: 20,
// //     alignItems: "center",
// //   },
// //   modalTitle: { fontSize: 18, marginTop: 10, color: "#222" },
// //   modalSub: { fontSize: 13, color: "#555", marginVertical: 5 },
// //   modalList: { color: "#333", marginTop: 3 },
// //   modalBtn: {
// //     backgroundColor: "#20A68B",
// //     paddingHorizontal: 25,
// //     paddingVertical: 8,
// //     borderRadius: 10,
// //     marginTop: 15,
// //   },
// // });

// // // import React, { useState, useCallback } from "react";
// // // import {
// // //   View,
// // //   TextInput,
// // //   StyleSheet,
// // //   ScrollView,
// // //   TouchableOpacity,
// // //   Image,
// // //   Alert,
// // //   useColorScheme,
// // //   Modal,
// // // } from "react-native";
// // // import LinearGradient from "react-native-linear-gradient";
// // // import { SafeAreaView } from "react-native-safe-area-context";
// // // import { launchCamera, launchImageLibrary } from "react-native-image-picker";
// // // import DropDownPicker from "react-native-dropdown-picker";
// // // import AnimatedBackground from "../../components/ReusableComponents/AnimatedBackground";
// // // import { addProperty, updateProperty, getPropertyById } from "../../api/api";
// // // import GlobalText from "../../theme/GlobalText";
// // // import propertyTypes from "../../constants/propertyTypes";
// // // import states from "../../constants/locations/state";
// // // import districts from "../../constants/locations/districts";
// // // import subDistricts from "../../constants/locations/subDistricts";
// // // import * as Animatable from "react-native-animatable";
// // // import {
// // //   ArrowLeft,
// // //   Upload,
// // //   Trash2,
// // //   Home,
// // //   IndianRupee,
// // //   Phone,
// // //   MapPin,
// // //   Landmark,
// // //   Ruler,
// // //   Map,
// // //   Bed,
// // //   Bath,
// // //   UtensilsCrossed,
// // //   ClipboardList,
// // //   Sofa,
// // //   Wrench,
// // //   AlertTriangle,
// // // } from "lucide-react-native";
// // // import { useTheme, useFocusEffect } from "@react-navigation/native";
// // // import RNFS from "react-native-fs";
// // // import ImageResizer from "react-native-image-resizer";

// // // const BASE_URL = "https://zero-estate-backend-render.onrender.com";

// // // export default function AddPropertyScreen({ route, navigation }) {
// // //   const editingProperty = route?.params?.property || null;
// // //   const scheme = useColorScheme();
// // //   const { colors } = useTheme();
// // //   const isDark = scheme === "dark";

// // //   const [missingModalVisible, setMissingModalVisible] = useState(false);
// // //   const [missingFieldsList, setMissingFieldsList] = useState([]);

// // //   const [title, setTitle] = useState(editingProperty?.title || "");
// // //   const [price, setPrice] = useState(editingProperty?.price?.toString() || "");
// // //   const [contact, setContact] = useState(editingProperty?.contact?.toString() || "");
// // //   const [location, setLocation] = useState(editingProperty?.location || "");
// // //   const [mapLocation, setMapLocation] = useState(editingProperty?.mapLocation || "");
// // //   const [landmark, setLandmark] = useState(editingProperty?.landmark || "");
// // //   const [sqft, setSqft] = useState(editingProperty?.sqft?.toString() || "");
// // //   const [bedrooms, setBedrooms] = useState(editingProperty?.bedrooms?.toString() || "1");
// // //   const [bathrooms, setBathrooms] = useState(editingProperty?.bathrooms?.toString() || "1");
// // //   const [kitchen, setKitchen] = useState(editingProperty?.kitchen || "Yes");
// // //   const [amenities, setAmenities] = useState(editingProperty?.amenities || "");
// // //   const [interior, setInterior] = useState(editingProperty?.interior || "");
// // //   const [construction, setConstruction] = useState(editingProperty?.construction || "");
// // //   const [images, setImages] = useState([]);
// // //   const [category, setCategory] = useState(editingProperty?.category || "House");

// // //   const [state, setState] = useState(editingProperty?.state || "");
// // //   const [district, setDistrict] = useState(editingProperty?.district || "");
// // //   const [subDistrict, setSubDistrict] = useState(editingProperty?.subDistrict || "");

// // //   // 🏡 New property preference field
// // //   const [propertyPreference, setPropertyPreference] = useState(editingProperty?.propertyPreference || "Sale");
// // //   const [preferenceOpen, setPreferenceOpen] = useState(false);

// // //   const [categoryOpen, setCategoryOpen] = useState(false);
// // //   const [stateOpen, setStateOpen] = useState(false);
// // //   const [districtOpen, setDistrictOpen] = useState(false);
// // //   const [subDistrictOpen, setSubDistrictOpen] = useState(false);

// // //   const stateItems = states.map((s) => ({ label: s, value: s }));
// // //   const districtItems = useCallback(() => {
// // //     return state ? (districts[state] || []).map((d) => ({ label: d, value: d })) : [];
// // //   }, [state]);
// // //   const subDistrictItems = useCallback(() => {
// // //     return district ? (subDistricts[district] || []).map((sd) => ({ label: sd, value: sd })) : [];
// // //   }, [district]);
// // //   const categoryItems = propertyTypes.map((c) => ({ label: c.name, value: c.name }));

// // //   // Dropdown for property preference
// // //   const preferenceItems = [
// // //     { label: "Sale", value: "Sale" },
// // //     { label: "Rent", value: "Rent" },
// // //   ];

// // //   const [propertySize, setPropertySize] = useState("");
// // //   const [propertyUnit, setPropertyUnit] = useState("sqft");
// // //   const [unitOpen, setUnitOpen] = useState(false);

// // // const propertyUnitItems = [
// // //   { label: "Sqft", value: "sqft" },
// // //   { label: "Cent", value: "cent" },
// // //   { label: "Acre", value: "acre" },
// // // ];


// // //   useFocusEffect(
// // //     useCallback(() => {
// // //       const loadProperty = async () => {
// // //         if (!editingProperty?._id && !editingProperty?.id) return;
// // //         try {
// // //           const id = editingProperty._id || editingProperty.id;
// // //           const data = await getPropertyById(id);
// // //           if (data?.images && Array.isArray(data.images)) {
// // //             // Normalize images for display in RN Image component.
// // //             // Supported shapes:
// // //             // - full data URLs (data:...;base64,...) -> leave as-is
// // //             // - absolute URLs (http(s)://...) -> leave as-is
// // //             // - server-relative paths (/uploads/filename) -> prefix BASE_URL
// // //             // - plain base64 strings (without data: prefix) -> prefix a data header
// // //             const normalized = data.images.map((img) => {
// // //               if (!img || typeof img !== "string") return img;

// // //               const trimmed = img.trim();

// // //               if (trimmed.startsWith("data:")) return trimmed; // already a data URL
// // //               if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed; // full URL
// // //               if (trimmed.startsWith("/")) return `${BASE_URL}${trimmed}`; // server-relative path

// // //               // Heuristic: if it's a long base64-like string, assume base64 body and prefix data header
// // //               // Many base64 payloads are longer than 200 chars; adjust as needed
// // //               const isLikelyBase64 = /^[A-Za-z0-9+/=\n\r]+$/.test(trimmed.replace(/\s+/g, "")) && trimmed.length > 100;
// // //               if (isLikelyBase64) return `data:image/jpeg;base64,${trimmed.replace(/\s+/g, "")}`;

// // //               // Fallback: treat as server-relative path
// // //               return `${BASE_URL}${trimmed}`;
// // //             });
// // //             setImages(normalized.filter(Boolean));
// // //           }
// // //         } catch (error) {
// // //           console.error("Error loading property:", error.message);
// // //         }
// // //       };
// // //       loadProperty();
// // //     }, [editingProperty?._id])
// // //   );

// // //   const handleImagePick = () => {
// // //     if (images.length >= 5) {
// // //       Alert.alert("Limit Reached", "You can upload a maximum of 5 images only.");
// // //       return;
// // //     }

// // //     Alert.alert("Upload Image", "Choose an option", [
// // //       {
// // //         text: "Camera",
// // //         onPress: () =>
// // //           launchCamera({ mediaType: "photo" }, async (res) => {
// // //             if (res.assets) {
// // //               const asset = res.assets[0];
// // //               try {
// // //                 const resized = await ImageResizer.createResizedImage(asset.uri, 800, 600, "JPEG", 60);
// // //                 const base64Data = await RNFS.readFile(resized.uri, "base64");
// // //                 const newImage = `data:image/jpeg;base64,${base64Data}`;
// // //                 if (images.length < 5) setImages((prev) => [...prev, newImage]);
// // //               } catch (err) {
// // //                 console.error("Compression failed:", err);
// // //               }
// // //             }
// // //           }),
// // //       },
// // //       {
// // //         text: "Gallery",
// // //         onPress: () =>
// // //           launchImageLibrary({ mediaType: "photo", selectionLimit: 5 - images.length }, async (res) => {
// // //             if (res.assets) {
// // //               const newImages = [];
// // //               for (let asset of res.assets) {
// // //                 try {
// // //                   const resized = await ImageResizer.createResizedImage(asset.uri, 800, 600, "JPEG", 60);
// // //                   const base64Data = await RNFS.readFile(resized.uri, "base64");
// // //                   newImages.push(`data:image/jpeg;base64,${base64Data}`);
// // //                 } catch (err) {
// // //                   console.error("Compression failed:", err);
// // //                 }
// // //               }

// // //               const totalImages = [...images, ...newImages];
// // //               if (totalImages.length > 5) {
// // //                 Alert.alert("Limit Reached", "You can have max 5 images total.");
// // //                 setImages(totalImages.slice(0, 5));
// // //               } else {
// // //                 setImages(totalImages);
// // //               }
// // //             }
// // //           }),
// // //       },
// // //       { text: "Cancel", style: "cancel" },
// // //     ]);
// // //   };

// // //   const removeImage = (i) => {
// // //     const updated = [...images];
// // //     updated.splice(i, 1);
// // //     setImages(updated);
// // //   };

// // //   const handleSubmit = async () => {
// // //     try {
// // //       const requiredFields = {
// // //         Title: title,
// // //         Price: price,
// // //         Contact: contact,
// // //         Address: location,
// // //         State: state,
// // //         District: district,
// // //         Category: category,
// // //         PropertyPreference: propertyPreference,
// // //       };

// // //       const missing = Object.entries(requiredFields)
// // //         .filter(([_, v]) => !v || v.trim() === "")
// // //         .map(([k]) => k);

// // //       if (missing.length > 0) {
// // //         setMissingFieldsList(missing);
// // //         setMissingModalVisible(true);
// // //         return;
// // //       }

// // //       const payload = {
// // //         title,
// // //         price,
// // //         contact: Number(contact),
// // //         location,
// // //         mapLocation,
// // //         district,
// // //         subDistrict,
// // //         state,
// // //         landmark,
// // //         sqft,
// // //         bedrooms,
// // //         bathrooms,
// // //         kitchen,
// // //         amenities,
// // //         interior,
// // //         construction,
// // //         images,
// // //         category,
// // //         propertyPreference, // ✅ Added field here
// // //       };

// // //       if (editingProperty) {
// // //         await updateProperty(editingProperty._id || editingProperty.id, payload);
// // //         Alert.alert("✅ Success", "Property updated successfully!", [
// // //           { text: "OK", onPress: () => navigation.goBack() },
// // //         ]);
// // //       } else {
// // //         await addProperty(payload);
// // //         navigation.reset({
// // //           index: 0,
// // //           routes: [{ name: "Success" }],
// // //         });
// // //       }
// // //     } catch (err) {
// // //       console.error("Save Error:", err.response?.data || err.message);
// // //       Alert.alert("❌ Error", "Failed to save property");
// // //     }
// // //   };

// // //   const backgroundColor = isDark ? "#121212" : "#f9f9f9";
// // //   const cardColor = isDark ? "#1E1E1E" : "#fff";
// // //   const textColor = isDark ? "#EDEDED" : "#000";
// // //   const placeholderColor = isDark ? "#888" : "#666";
// // //   const borderColor = isDark ? "#333" : "#20A68B";

// // //   return (
// // //     <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
// // //       <AnimatedBackground />

// // //       <LinearGradient
// // //         colors={isDark ? ["#114D44", "#0D3732"] : ["#43C6AC", "#20A68B"]}
// // //         style={styles.headerContainer}
// // //       >
// // //         <View style={styles.header}>
// // //           <TouchableOpacity onPress={() => navigation.goBack()}>
// // //             <ArrowLeft size={24} color="#fff" />
// // //           </TouchableOpacity>
// // //           <GlobalText bold style={styles.headerTitle}>
// // //             {editingProperty ? "Edit Property" : "Add Property"}
// // //           </GlobalText>
// // //           <View style={{ width: 24 }} />
// // //         </View>
// // //       </LinearGradient>

// // //       <ScrollView
// // //         contentContainerStyle={{ padding: 20, paddingBottom: 80 }}
// // //         nestedScrollEnabled={true}
// // //         showsVerticalScrollIndicator={false}
// // //       >
// // //         {/* 🏡 Property Preference Dropdown */}
// // //         <GlobalText medium style={[styles.label, { color: textColor }]}>
// // //           Property Preference
// // //         </GlobalText>
// // //         <DropDownPicker
// // //           open={preferenceOpen}
// // //           value={propertyPreference}
// // //           items={preferenceItems}
// // //           setOpen={setPreferenceOpen}
// // //           setValue={setPropertyPreference}
// // //           placeholder="-- Select Preference --"
// // //           style={[styles.dropdownBox, { borderColor, backgroundColor: cardColor }]}
// // //           dropDownContainerStyle={[
// // //             styles.dropdownList,
// // //             { backgroundColor: cardColor, borderColor },
// // //           ]}
// // //           zIndex={5000}
// // //           zIndexInverse={500}
// // //           listMode="SCROLLVIEW"
// // //         />

// // //         <GlobalText medium style={[styles.label, { color: textColor }]}>
// // //           Category
// // //         </GlobalText>
// // //         <DropDownPicker
// // //           open={categoryOpen}
// // //           value={category}
// // //           items={categoryItems}
// // //           setOpen={setCategoryOpen}
// // //           setValue={setCategory}
// // //           placeholder="-- Select Category --"
// // //           style={[styles.dropdownBox, { borderColor, backgroundColor: cardColor }]}
// // //           dropDownContainerStyle={[
// // //             styles.dropdownList,
// // //             { backgroundColor: cardColor, borderColor },
// // //           ]}
// // //           zIndex={4000}
// // //           zIndexInverse={1000}
// // //           listMode="SCROLLVIEW"
// // //         />

// // //         <InputBox icon={<Home size={18} color="#20A68B" />} placeholder="Property Title ( Name of place )" value={title} onChange={setTitle} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // //         <InputBox icon={<IndianRupee size={18} color="#20A68B" />} placeholder="Price ( Just type Numbers)" value={price} onChange={setPrice}  textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // //         <InputBox icon={<Phone size={18} color="#20A68B" />} placeholder="Contact Number" value={contact} onChange={setContact} keyboardType="phone-pad" textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // //         <InputBox icon={<MapPin size={18} color="#20A68B" />} placeholder="Address " value={location} onChange={setLocation} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />

// // //         {/* ✅ Continue rest of your inputs unchanged... */}
// // //         {/* (State, District, SubDistrict, etc.) */}
// // //         {/* ... your existing code continues below */}
// // //                 {/* 🌎 State Dropdown */}
// // //         <GlobalText medium style={[styles.label, { color: textColor }]}>
// // //           State
// // //         </GlobalText>
// // //         <DropDownPicker
// // //           open={stateOpen}
// // //           value={state}
// // //           items={stateItems}
// // //           setOpen={setStateOpen}
// // //           setValue={(callback) => {
// // //             const selected = typeof callback === "function" ? callback(state) : callback;
// // //             setState(selected);
// // //             setDistrict("");
// // //             setSubDistrict("");
// // //           }}
// // //           placeholder="-- Select State --"
// // //           style={[styles.dropdownBox, { borderColor, backgroundColor: cardColor }]}
// // //           dropDownContainerStyle={[
// // //             styles.dropdownList,
// // //             { backgroundColor: cardColor, borderColor },
// // //           ]}
// // //           zIndex={3000}
// // //           zIndexInverse={2000}
// // //           listMode="SCROLLVIEW"
// // //         />

// // //         {/* 🏙️ District Dropdown */}
// // //         <GlobalText medium style={[styles.label, { color: textColor }]}>
// // //           District
// // //         </GlobalText>
// // //         <DropDownPicker
// // //           open={districtOpen}
// // //           value={district}
// // //           items={districtItems()}
// // //           setOpen={setDistrictOpen}
// // //           setValue={setDistrict}
// // //           placeholder="-- Select District --"
// // //           style={[styles.dropdownBox, { borderColor, backgroundColor: cardColor }]}
// // //           dropDownContainerStyle={[
// // //             styles.dropdownList,
// // //             { backgroundColor: cardColor, borderColor },
// // //           ]}
// // //           zIndex={2000}
// // //           zIndexInverse={3000}
// // //           listMode="SCROLLVIEW"
// // //           disabled={!state}
// // //         />

// // //         {/* 🏘️ Sub-District Dropdown */}
// // //         {/* <GlobalText medium style={[styles.label, { color: textColor }]}>
// // //           Sub-District
// // //         </GlobalText> */}
// // //         {/* <DropDownPicker
// // //           open={subDistrictOpen}
// // //           value={subDistrict}
// // //           items={subDistrictItems()}
// // //           setOpen={setSubDistrictOpen}
// // //           setValue={setSubDistrict}
// // //           placeholder="-- Select Sub-District --"
// // //           style={[styles.dropdownBox, { borderColor, backgroundColor: cardColor }]}
// // //           dropDownContainerStyle={[
// // //             styles.dropdownList,
// // //             { backgroundColor: cardColor, borderColor },
// // //           ]}
// // //           zIndex={1000}
// // //           zIndexInverse={4000}
// // //           listMode="SCROLLVIEW"
// // //           disabled={!district}
// // //         /> */}

// // //         <InputBox
// // //           icon={<Landmark size={18} color="#20A68B" />}
// // //           placeholder="Nearby Landmark"
// // //           value={landmark}
// // //           onChange={setLandmark}
// // //           textColor={textColor}
// // //           placeholderColor={placeholderColor}
// // //           cardColor={cardColor}
// // //           borderColor={borderColor}
// // //         />
// // //         <InputBox
// // //           icon={<Ruler size={18} color="#20A68B" />}
// // //           placeholder="Property Size in Sqft"
// // //           value={sqft}
// // //           onChange={setSqft}
// // //           keyboardType="numeric"
// // //           textColor={textColor}
// // //           placeholderColor={placeholderColor}
// // //           cardColor={cardColor}
// // //           borderColor={borderColor}
// // //         />
// // //         <InputBox
// // //           icon={<Map size={18} color="#20A68B" />}
// // //           placeholder="Google Maps Link ( Using Map link Here )"
// // //           value={mapLocation}
// // //           onChange={setMapLocation}
// // //           textColor={textColor}
// // //           placeholderColor={placeholderColor}
// // //           cardColor={cardColor}
// // //           borderColor={borderColor}
// // //         />

// // //         {category?.toLowerCase() === "house" && (
// // //           <>
// // //             <InputBox
// // //               icon={<Bed size={18} color="#20A68B" />}
// // //               placeholder="Bedrooms"
// // //               value={bedrooms}
// // //               onChange={setBedrooms}
// // //               keyboardType="numeric"
// // //               textColor={textColor}
// // //               placeholderColor={placeholderColor}
// // //               cardColor={cardColor}
// // //               borderColor={borderColor}
// // //             />
// // //             <InputBox
// // //               icon={<Bath size={18} color="#20A68B" />}
// // //               placeholder="Bathrooms"
// // //               value={bathrooms}
// // //               onChange={setBathrooms}
// // //               keyboardType="numeric"
// // //               textColor={textColor}
// // //               placeholderColor={placeholderColor}
// // //               cardColor={cardColor}
// // //               borderColor={borderColor}
// // //             />
// // //             <InputBox
// // //               icon={<UtensilsCrossed size={18} color="#20A68B" />}
// // //               placeholder="Kitchen (Yes/No)"
// // //               value={kitchen}
// // //               onChange={setKitchen}
// // //               textColor={textColor}
// // //               placeholderColor={placeholderColor}
// // //               cardColor={cardColor}
// // //               borderColor={borderColor}
// // //             />
// // //           </>
// // //         )}

// // //         <InputBox
// // //           icon={<ClipboardList size={18} color="#20A68B" />}
// // //           placeholder="Building details"
// // //           value={amenities}
// // //           onChange={setAmenities}
// // //           textColor={textColor}
// // //           placeholderColor={placeholderColor}
// // //           cardColor={cardColor}
// // //           borderColor={borderColor}
// // //         />
// // //         {/* <InputBox
// // //           icon={<Sofa size={18} color="#20A68B" />}
// // //           placeholder="Interior Details"
// // //           value={interior}
// // //           onChange={setInterior}
// // //           multiline
// // //           height={80}
// // //           textColor={textColor}
// // //           placeholderColor={placeholderColor}
// // //           cardColor={cardColor}
// // //           borderColor={borderColor}
// // //         /> */}
// // //         <InputBox
// // //           icon={<Wrench size={18} color="#20A68B" />}
// // //           placeholder="Construction Details"
// // //           value={construction}
// // //           onChange={setConstruction}
// // //           multiline
// // //           height={80}
// // //           textColor={textColor}
// // //           placeholderColor={placeholderColor}
// // //           cardColor={cardColor}
// // //           borderColor={borderColor}
// // //         />

// // //         {/* 🖼️ Image Upload Section */}
// // //         <GlobalText
// // //           style={{ textAlign: "center", marginBottom: 8, color: "#888" }}
// // //         >
// // //           {images.length}/5 images uploaded
// // //         </GlobalText>

// // //         <TouchableOpacity
// // //           style={[styles.uploadBox, { borderColor }]}
// // //           onPress={handleImagePick}
// // //         >
// // //           <Upload size={20} color="#20A68B" />
// // //           <GlobalText semiBold style={[styles.uploadText, { color: "#20A68B" }]}>
// // //             Upload Images
// // //           </GlobalText>
// // //         </TouchableOpacity>

// // //         <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
// // //           {images.map((img, i) => (
// // //             <View key={i} style={{ position: "relative", margin: 5 }}>
// // //               <Image source={{ uri: img }} style={styles.uploaded} />
// // //               <TouchableOpacity
// // //                 style={styles.deleteBtn}
// // //                 onPress={() => removeImage(i)}
// // //               >
// // //                 <Trash2 size={18} color="red" />
// // //               </TouchableOpacity>
// // //             </View>
// // //           ))}
// // //         </View>

// // //         {/* ✅ Submit Button */}
// // //         <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
// // //           <GlobalText bold style={styles.submitText}>
// // //             {editingProperty ? "Update Property" : "Add Property"}
// // //           </GlobalText>
// // //         </TouchableOpacity>
// // //       </ScrollView>

// // //       {/* ⚠️ Missing Fields Modal */}
// // //       <Modal visible={missingModalVisible} transparent animationType="fade">
// // //         <View style={styles.modalOverlay}>
// // //           <Animatable.View animation="zoomIn" duration={300} style={styles.modalBox}>
// // //             <AlertTriangle size={50} color="#FF6B6B" />
// // //             <GlobalText bold style={styles.modalTitle}>
// // //               Missing Fields
// // //             </GlobalText>
// // //             <GlobalText style={styles.modalSub}>
// // //               Please fill the following fields:
// // //             </GlobalText>
// // //             {missingFieldsList.map((field, idx) => (
// // //               <GlobalText key={idx} style={styles.modalList}>
// // //                 • {field}
// // //               </GlobalText>
// // //             ))}
// // //             <TouchableOpacity
// // //               onPress={() => setMissingModalVisible(false)}
// // //               style={styles.modalBtn}
// // //             >
// // //               <GlobalText bold style={{ color: "#fff" }}>
// // //                 OK
// // //               </GlobalText>
// // //             </TouchableOpacity>
// // //           </Animatable.View>
// // //         </View>
// // //       </Modal>
// // //     </SafeAreaView>
// // //   );
// // // }

// // // // 🧩 Input Box Component
// // // function InputBox({
// // //   icon,
// // //   placeholder,
// // //   value,
// // //   onChange,
// // //   keyboardType,
// // //   multiline,
// // //   height,
// // //   textColor,
// // //   placeholderColor,
// // //   cardColor,
// // //   borderColor,
// // // }) {
// // //   return (
// // //     <View style={[styles.inputBox, { borderColor, backgroundColor: cardColor }]}>
// // //       <View style={styles.inputRow}>
// // //         {icon}
// // //         <TextInput
// // //           placeholder={placeholder}
// // //           placeholderTextColor={placeholderColor}
// // //           style={[styles.inputField, { height: height || 45, color: textColor }]}
// // //           value={value}
// // //           onChangeText={onChange}
// // //           keyboardType={keyboardType || "default"}
// // //           multiline={multiline}
// // //         />
// // //       </View>
// // //     </View>
// // //   );
// // // }

// // // const styles = StyleSheet.create({
// // //   safeArea: { flex: 1 },
// // //   headerContainer: {
// // //     paddingVertical: 12,
// // //     elevation: 6,
// // //     borderBottomLeftRadius: 20,
// // //     borderBottomRightRadius: 20,
// // //   },
// // //   header: {
// // //     flexDirection: "row",
// // //     alignItems: "center",
// // //     justifyContent: "space-between",
// // //     paddingHorizontal: 16,
// // //   },
// // //   headerTitle: { fontSize: 18, color: "#fff" },
// // //   label: { fontSize: 14, marginBottom: 6 },
// // //   inputBox: {
// // //     borderWidth: 1,
// // //     borderRadius: 10,
// // //     marginBottom: 15,
// // //     paddingHorizontal: 10,
// // //   },
// // //   inputRow: { flexDirection: "row", alignItems: "center" },
// // //   inputField: { flex: 1, paddingHorizontal: 8, fontSize: 14 },
// // //   dropdownBox: { borderWidth: 1.5, borderRadius: 10, marginBottom: 15 },
// // //   dropdownList: { borderWidth: 1, borderRadius: 10 },
// // //   uploadBox: {
// // //     flexDirection: "row",
// // //     alignItems: "center",
// // //     justifyContent: "center",
// // //     borderWidth: 1,
// // //     borderRadius: 10,
// // //     height: 55,
// // //     marginBottom: 20,
// // //   },
// // //   uploadText: { marginLeft: 8, fontSize: 14 },
// // //   uploaded: { width: 100, height: 100, borderRadius: 10 },
// // //   deleteBtn: {
// // //     position: "absolute",
// // //     top: -6,
// // //     right: -6,
// // //     backgroundColor: "#fff",
// // //     borderRadius: 20,
// // //     padding: 2,
// // //   },
// // //   submitBtn: {
// // //     backgroundColor: "#20A68B",
// // //     borderRadius: 12,
// // //     paddingVertical: 15,
// // //     alignItems: "center",
// // //     marginTop: 10,
// // //   },
// // //   submitText: { color: "#fff", fontSize: 15 },
// // //   modalOverlay: {
// // //     flex: 1,
// // //     backgroundColor: "rgba(0,0,0,0.6)",
// // //     justifyContent: "center",
// // //     alignItems: "center",
// // //   },
// // //   modalBox: {
// // //     backgroundColor: "#fff",
// // //     width: "80%",
// // //     borderRadius: 16,
// // //     padding: 20,
// // //     alignItems: "center",
// // //   },
// // //   modalTitle: { fontSize: 18, marginTop: 10, color: "#222" },
// // //   modalSub: { fontSize: 13, color: "#555", marginVertical: 5 },
// // //   modalList: { color: "#333", marginTop: 3 },
// // //   modalBtn: {
// // //     backgroundColor: "#20A68B",
// // //     paddingHorizontal: 25,
// // //     paddingVertical: 8,
// // //     borderRadius: 10,
// // //     marginTop: 15,
// // //   },
// // // });

