import React, { useState, useCallback, useRef, useEffect } from "react";
import { CheckCircle } from "lucide-react-native";
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


export default function AddPropertyScreen({ route, navigation }) {
  const editingProperty = route?.params?.property || null;
  const scheme = useColorScheme();
  const { colors } = useTheme();
  const isDark = scheme === "dark";

  // ✅ useRef to persist data across ALL navigations
  const formDataRef = useRef({});
  const isRestoringRef = useRef(false);


  const [successModalVisible, setSuccessModalVisible] = useState(false);

  
  // STATE INITIALIZATION
  const [missingModalVisible, setMissingModalVisible] = useState(false);
  const [missingFieldsList, setMissingFieldsList] = useState([]);
  const [mapModal, setMapModal] = useState(false);
  
  const [loading, setLoading] = useState(false);

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

  // ✅ FUNCTION: Save current form data to ref
  const saveFormDataToRef = useCallback(() => {
    formDataRef.current = {
      title,
      price,
      contact,
      location,
      state,
      district,
      subDistrict,
      category,
      propertyPreference,
      propertySize,
      propertyUnit,
      bedrooms,
      bathrooms,
      kitchen,
      buildingDetails,
      interior,
      construction,
      landmark,
      images,
      mapLocation,
    };
    console.log("💾 Saved form data to ref:", formDataRef.current);
  }, [
    title, price, contact, location, state, district, subDistrict,
    category, propertyPreference, propertySize, propertyUnit,
    bedrooms, bathrooms, kitchen, buildingDetails, interior,
    construction, landmark, images, mapLocation
  ]);

  // ✅ FUNCTION: Restore form data from ref
  const restoreFormDataFromRef = useCallback(() => {
    if (isRestoringRef.current) return;
    
    const data = formDataRef.current;
    if (!data || Object.keys(data).length === 0) return;

    console.log("📥 Restoring form data from ref:", data);
    isRestoringRef.current = true;

    setTitle(data.title || "");
    setPrice(data.price || "");
    setContact(data.contact || "");
    setLocation(data.location || "");
    setState(data.state || "");
    setDistrict(data.district || "");
    setSubDistrict(data.subDistrict || "");
    setCategory(data.category || "House");
    setPropertyPreference(data.propertyPreference || "Sale");
    setPropertySize(data.propertySize || "");
    setPropertyUnit(data.propertyUnit || "sqft");
    setBedrooms(data.bedrooms || "1");
    setBathrooms(data.bathrooms || "1");
    setKitchen(data.kitchen || "Yes");
    setBuildingDetails(data.buildingDetails || "");
    setInterior(data.interior || "");
    setConstruction(data.construction || "");
    setLandmark(data.landmark || "");
    if (Array.isArray(data.images)) {
      setImages(data.images);
    }
    if (data.mapLocation) {
      setMapLocation(data.mapLocation);
    }

    setTimeout(() => {
      isRestoringRef.current = false;
    }, 100);
  }, []);

  // ✅ Auto-save form data whenever any field changes
  useEffect(() => {
    if (!isRestoringRef.current) {
      saveFormDataToRef();
    }
  }, [
    title, price, contact, location, state, district, subDistrict,
    category, propertyPreference, propertySize, propertyUnit,
    bedrooms, bathrooms, kitchen, buildingDetails, interior,
    construction, landmark, images, mapLocation, saveFormDataToRef
  ]);

  // ✅ NAVIGATION: Open map picker with data preservation
  const openMapPicker = () => {
    saveFormDataToRef(); // Save before navigating
    setMapModal(false);
    
    setTimeout(() => {
      navigation.navigate("MapPicker", {
        currentLocation: mapLocation,
      });
    }, 100);
  };

  // ✅ NAVIGATION: Use current location
  const useCurrentLocation = async () => {
    setMapModal(false);
    
    try {
      Geolocation.getCurrentPosition(
        (position) => {
          setMapLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            link: `https://www.openstreetmap.org/?mlat=${position.coords.latitude}&mlon=${position.coords.longitude}`,
          });
        },
        async () => {
          const res = await fetch('https://ipapi.co/json/');
          const data = await res.json();
          setMapLocation({
            lat: data.latitude || 12.9716,
            lng: data.longitude || 77.5946,
          });
        },
        { enableHighAccuracy: false }
      );
    } catch {
      setMapLocation({
        lat: 12.9716,
        lng: 77.5946,
      });
    }
  };

  // ✅ LIFECYCLE: Handle screen focus (returning from MapPicker)
  useFocusEffect(
    useCallback(() => {
      console.log("🔄 Screen focused, route params:", route?.params);
      
      // 1️⃣ Restore form data from ref
      restoreFormDataFromRef();
      
      // 2️⃣ Handle map location from MapPicker
      if (route?.params?.selectedLocation) {
        console.log("📍 Setting map location from params");
        setMapLocation(route.params.selectedLocation);
      }
      
      // 3️⃣ Load editing property data (only first time)
      if (editingProperty) {
  loadPropertyData();
}

    }, [route?.params, restoreFormDataFromRef])
  );

  // ✅ FUNCTION: Load property data when editing
 // ✅ FUNCTION: Load property data when editing
const loadPropertyData = async () => {
  if (!editingProperty?._id && !editingProperty?.id) return;

  try {
    const id = editingProperty._id || editingProperty.id;
    const data = await getPropertyById(id);

    console.log("📸 Images from DB:", data.images);

    if (Array.isArray(data.images)) {
      setImages(data.images); // ✅ DIRECT BASE64
    } else {
      setImages([]);
    }
  } catch (error) {
    console.error("❌ Error loading property:", error);
    setImages([]);
  }
};


  // ✅ IMAGE HANDLING: Pick images
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

  // ✅ IMAGE HANDLING: Remove image
  const removeImage = (index) => {
    if (!Array.isArray(images) || index < 0 || index >= images.length) return;
    
    setImages(prev => {
      const current = Array.isArray(prev) ? prev : [];
      const updated = current.filter((_, i) => i !== index);
      return updated;
    });
  };

  // ✅ SUBMIT: Handle form submission
  // const handleSubmit = async () => {
  //   try {
  //     const requiredFields = {
  //       Title: title,
  //       Price: price,
  //       Contact: contact,
  //       Address: location,
  //       State: state,
  //       District: district,
  //       Category: category,
  //       PropertyPreference: propertyPreference,
  //     };

  //     const missing = Object.entries(requiredFields)
  //       .filter(([_, v]) => !v || v.toString().trim() === "")
  //       .map(([k]) => k);

  //     if (missing.length > 0) {
  //       setMissingFieldsList(missing);
  //       setMissingModalVisible(true);
  //       return;
  //     }

  //     const payload = {
  //       title: title.trim(),
  //       price: price.trim(),
  //       contact: Number(contact),
  //       location: location.trim(),
  //       mapLocation,
  //       district: district.trim(),
  //       subDistrict: subDistrict.trim(),
  //       state: state.trim(),
  //       landmark: landmark.trim(),
  //       propertySize: propertySize.trim(),
  //       propertyUnit,
  //       bedrooms,
  //       bathrooms,
  //       kitchen,
  //       buildingDetails: buildingDetails.trim(),
  //       interior: interior.trim(),
  //       construction: construction.trim(),
  //       images,
  //       category,
  //       propertyPreference,
  //     };

  //   if (editingProperty) {
  //     await updateProperty(editingProperty._id || editingProperty.id, payload);
  //     formDataRef.current = {};
  //     setSuccessModalVisible(true);
  //   }
  //   } catch (err) {
  //     console.error("Save Error:", err.response?.data || err.message);
  //     Alert.alert("❌ Error", "Failed to save property");
  //   }
  // };
  const handleSubmit = async () => {
  if (loading) return; // 🛑 prevent double click

  try {
    setLoading(true);
    console.log("⏳ Property submit started");

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
      setLoading(false);
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
      images,
      category,
      propertyPreference,
    };

    // ✏️ EDIT
    if (editingProperty) {
      await updateProperty(editingProperty._id || editingProperty.id, payload);
      formDataRef.current = {};
      setSuccessModalVisible(true);
    }
    // ➕ ADD
    else {
      await addProperty(payload);

      formDataRef.current = {};
      navigation.reset({
        index: 0,
        routes: [{ name: "Success" }],
      });
    }

  } catch (err) {
    console.error("❌ Save Error:", err?.response?.data || err.message);
    Alert.alert("Error", "Failed to save property");
  } finally {
    setLoading(false); // ✅ always stop loader
  }
};



  // Theme colors
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
          <TouchableOpacity onPress={() => {
            formDataRef.current = {}; // Clear ref on back
            navigation.goBack();
          }}>
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
        <GlobalText medium style={[styles.label, { color: textColor }]}>
  Map Location
</GlobalText>

<TouchableOpacity
  activeOpacity={0.8}
  onPress={() => setMapModal(true)}
>
  <View style={[styles.inputBox, { borderColor, backgroundColor: cardColor }]}>
    <View style={styles.inputRow}>
      <Map size={18} color="#20A68B" />
      <TextInput
        placeholder="Select location on map"
        placeholderTextColor={placeholderColor}
        style={[
          styles.inputField,
          { height: 45, color: textColor },
        ]}
        value={mapLocation?.link || ""}
        editable={false}          // 🔒 SAFE MODE
        pointerEvents="none"      // 🔒 Prevent focus
      />
    </View>
  </View>
</TouchableOpacity>


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


                {/* ✅ Success Modal */}
<Modal visible={successModalVisible} transparent animationType="fade">
  <View style={styles.modalOverlay}>
    <Animatable.View
      animation="zoomIn"
      duration={300}
      style={styles.successModalBox}
    >
      <View style={styles.successIconWrapper}>
        <CheckCircle size={64} color="#20A68B" />
      </View>

      <GlobalText bold style={styles.successTitle}>
        Property Updated!
      </GlobalText>

      <GlobalText style={styles.successSubText}>
        Your property details have been updated successfully.
      </GlobalText>

      <TouchableOpacity
        style={styles.successBtn}
        activeOpacity={0.85}
        onPress={() => {
          setSuccessModalVisible(false);
          formDataRef.current = {};
          navigation.goBack();
        }}
      >
        <GlobalText bold style={styles.successBtnText}>
          Done
        </GlobalText>
      </TouchableOpacity>
    </Animatable.View>
  </View>
</Modal>

        {/* Map Location Picker */}
        {/* <GlobalText medium style={[styles.label, { color: textColor }]}>
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
        </TouchableOpacity> */}

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

        {/* Image Upload Section */}
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
      {/* 🔄 Loading Overlay */}
{loading && (
  <View style={styles.loadingOverlay}>
    <View style={styles.loadingBox}>
      <Animatable.View animation="rotate" iterationCount="infinite" duration={800}>
        <Upload size={42} color="#20A68B" />
      </Animatable.View>

      <GlobalText style={styles.loadingText}>
        {editingProperty ? "Updating property..." : "Adding property..."}
      </GlobalText>
    </View>
  </View>
)}

    </SafeAreaView>
  );
}

// InputBox Component
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
  loadingOverlay: {
  position: "absolute",
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
},

loadingBox: {
  backgroundColor: "#fff",
  paddingVertical: 30,
  paddingHorizontal: 40,
  borderRadius: 20,
  alignItems: "center",
  elevation: 10,
},

loadingText: {
  marginTop: 16,
  fontSize: 15,
  color: "#333",
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
    justifyContent: "center",
  },
  successModalBox: {
  backgroundColor: "#fff",
  width: "85%",
  borderRadius: 22,
  paddingVertical: 30,
  paddingHorizontal: 24,
  alignItems: "center",
  elevation: 12,
  shadowColor: "#000",
  shadowOpacity: 0.25,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 5 },
},

successIconWrapper: {
  width: 90,
  height: 90,
  borderRadius: 45,
  backgroundColor: "#E6F4EF",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 20,
},

successTitle: {
  fontSize: 20,
  color: "#1A1A1A",
  marginBottom: 10,
},

successSubText: {
  fontSize: 15,
  color: "#666",
  textAlign: "center",
  marginBottom: 24,
  lineHeight: 22,
},

successBtn: {
  backgroundColor: "#20A68B",
  paddingVertical: 14,
  paddingHorizontal: 40,
  borderRadius: 14,
  elevation: 4,
},

successBtnText: {
  color: "#fff",
  fontSize: 16,
},

});
