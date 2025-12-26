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

  const [missingModalVisible, setMissingModalVisible] = useState(false);
  const [missingFieldsList, setMissingFieldsList] = useState([]);

  const [title, setTitle] = useState(editingProperty?.title || "");
  const [price, setPrice] = useState(editingProperty?.price?.toString() || "");
  const [contact, setContact] = useState(editingProperty?.contact?.toString() || "");
  const [location, setLocation] = useState(editingProperty?.location || "");
  const [mapLocation, setMapLocation] = useState(editingProperty?.mapLocation || "");
  const [landmark, setLandmark] = useState(editingProperty?.landmark || "");
  const [sqft, setSqft] = useState(editingProperty?.sqft?.toString() || "");
  const [bedrooms, setBedrooms] = useState(editingProperty?.bedrooms?.toString() || "1");
  const [bathrooms, setBathrooms] = useState(editingProperty?.bathrooms?.toString() || "1");
  const [kitchen, setKitchen] = useState(editingProperty?.kitchen || "Yes");
  const [amenities, setAmenities] = useState(editingProperty?.amenities || "");
  const [interior, setInterior] = useState(editingProperty?.interior || "");
  const [construction, setConstruction] = useState(editingProperty?.construction || "");
  const [images, setImages] = useState([]);
  const [category, setCategory] = useState(editingProperty?.category || "House");

  const [state, setState] = useState(editingProperty?.state || "");
  const [district, setDistrict] = useState(editingProperty?.district || "");
  const [subDistrict, setSubDistrict] = useState(editingProperty?.subDistrict || "");

  // 🏡 New property preference field
  const [propertyPreference, setPropertyPreference] = useState(editingProperty?.propertyPreference || "Sale");
  const [preferenceOpen, setPreferenceOpen] = useState(false);

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [stateOpen, setStateOpen] = useState(false);
  const [districtOpen, setDistrictOpen] = useState(false);
  const [subDistrictOpen, setSubDistrictOpen] = useState(false);

  const stateItems = states.map((s) => ({ label: s, value: s }));
  const districtItems = useCallback(() => {
    return state ? (districts[state] || []).map((d) => ({ label: d, value: d })) : [];
  }, [state]);
  const subDistrictItems = useCallback(() => {
    return district ? (subDistricts[district] || []).map((sd) => ({ label: sd, value: sd })) : [];
  }, [district]);
  const categoryItems = propertyTypes.map((c) => ({ label: c.name, value: c.name }));

  // Dropdown for property preference
  const preferenceItems = [
    { label: "Sale", value: "Sale" },
    { label: "Rent", value: "Rent" },
  ];

  useFocusEffect(
    useCallback(() => {
      const loadProperty = async () => {
        if (!editingProperty?._id && !editingProperty?.id) return;
        try {
          const id = editingProperty._id || editingProperty.id;
          const data = await getPropertyById(id);
          if (data?.images && Array.isArray(data.images)) {
            // Normalize images for display in RN Image component.
            // Supported shapes:
            // - full data URLs (data:...;base64,...) -> leave as-is
            // - absolute URLs (http(s)://...) -> leave as-is
            // - server-relative paths (/uploads/filename) -> prefix BASE_URL
            // - plain base64 strings (without data: prefix) -> prefix a data header
            const normalized = data.images.map((img) => {
              if (!img || typeof img !== "string") return img;

              const trimmed = img.trim();

              if (trimmed.startsWith("data:")) return trimmed; // already a data URL
              if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed; // full URL
              if (trimmed.startsWith("/")) return `${BASE_URL}${trimmed}`; // server-relative path

              // Heuristic: if it's a long base64-like string, assume base64 body and prefix data header
              // Many base64 payloads are longer than 200 chars; adjust as needed
              const isLikelyBase64 = /^[A-Za-z0-9+/=\n\r]+$/.test(trimmed.replace(/\s+/g, "")) && trimmed.length > 100;
              if (isLikelyBase64) return `data:image/jpeg;base64,${trimmed.replace(/\s+/g, "")}`;

              // Fallback: treat as server-relative path
              return `${BASE_URL}${trimmed}`;
            });
            setImages(normalized.filter(Boolean));
          }
        } catch (error) {
          console.error("Error loading property:", error.message);
        }
      };
      loadProperty();
    }, [editingProperty?._id])
  );

  const handleImagePick = () => {
    if (images.length >= 5) {
      Alert.alert("Limit Reached", "You can upload a maximum of 5 images only.");
      return;
    }

    Alert.alert("Upload Image", "Choose an option", [
      {
        text: "Camera",
        onPress: () =>
          launchCamera({ mediaType: "photo" }, async (res) => {
            if (res.assets) {
              const asset = res.assets[0];
              try {
                const resized = await ImageResizer.createResizedImage(asset.uri, 800, 600, "JPEG", 60);
                const base64Data = await RNFS.readFile(resized.uri, "base64");
                const newImage = `data:image/jpeg;base64,${base64Data}`;
                if (images.length < 5) setImages((prev) => [...prev, newImage]);
              } catch (err) {
                console.error("Compression failed:", err);
              }
            }
          }),
      },
      {
        text: "Gallery",
        onPress: () =>
          launchImageLibrary({ mediaType: "photo", selectionLimit: 5 - images.length }, async (res) => {
            if (res.assets) {
              const newImages = [];
              for (let asset of res.assets) {
                try {
                  const resized = await ImageResizer.createResizedImage(asset.uri, 800, 600, "JPEG", 60);
                  const base64Data = await RNFS.readFile(resized.uri, "base64");
                  newImages.push(`data:image/jpeg;base64,${base64Data}`);
                } catch (err) {
                  console.error("Compression failed:", err);
                }
              }

              const totalImages = [...images, ...newImages];
              if (totalImages.length > 5) {
                Alert.alert("Limit Reached", "You can have max 5 images total.");
                setImages(totalImages.slice(0, 5));
              } else {
                setImages(totalImages);
              }
            }
          }),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const removeImage = (i) => {
    const updated = [...images];
    updated.splice(i, 1);
    setImages(updated);
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
        .filter(([_, v]) => !v || v.trim() === "")
        .map(([k]) => k);

      if (missing.length > 0) {
        setMissingFieldsList(missing);
        setMissingModalVisible(true);
        return;
      }

      const payload = {
        title,
        price,
        contact: Number(contact),
        location,
        mapLocation,
        district,
        subDistrict,
        state,
        landmark,
        sqft,
        bedrooms,
        bathrooms,
        kitchen,
        amenities,
        interior,
        construction,
        images,
        category,
        propertyPreference, // ✅ Added field here
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
        {/* 🏡 Property Preference Dropdown */}
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

        <InputBox icon={<Home size={18} color="#20A68B" />} placeholder="Property Title ( Name of place )" value={title} onChange={setTitle} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
        <InputBox icon={<IndianRupee size={18} color="#20A68B" />} placeholder="Price ( Just type Numbers)" value={price} onChange={setPrice} keyboardType="numeric" textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
        <InputBox icon={<Phone size={18} color="#20A68B" />} placeholder="Contact Number" value={contact} onChange={setContact} keyboardType="phone-pad" textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
        <InputBox icon={<MapPin size={18} color="#20A68B" />} placeholder="Address " value={location} onChange={setLocation} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />

        {/* ✅ Continue rest of your inputs unchanged... */}
        {/* (State, District, SubDistrict, etc.) */}
        {/* ... your existing code continues below */}
                {/* 🌎 State Dropdown */}
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

        {/* 🏙️ District Dropdown */}
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

        {/* 🏘️ Sub-District Dropdown */}
        <GlobalText medium style={[styles.label, { color: textColor }]}>
          Sub-District
        </GlobalText>
        <DropDownPicker
          open={subDistrictOpen}
          value={subDistrict}
          items={subDistrictItems()}
          setOpen={setSubDistrictOpen}
          setValue={setSubDistrict}
          placeholder="-- Select Sub-District --"
          style={[styles.dropdownBox, { borderColor, backgroundColor: cardColor }]}
          dropDownContainerStyle={[
            styles.dropdownList,
            { backgroundColor: cardColor, borderColor },
          ]}
          zIndex={1000}
          zIndexInverse={4000}
          listMode="SCROLLVIEW"
          disabled={!district}
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
        <InputBox
          icon={<Ruler size={18} color="#20A68B" />}
          placeholder="Property Size in Sqft"
          value={sqft}
          onChange={setSqft}
          keyboardType="numeric"
          textColor={textColor}
          placeholderColor={placeholderColor}
          cardColor={cardColor}
          borderColor={borderColor}
        />
        <InputBox
          icon={<Map size={18} color="#20A68B" />}
          placeholder="Google Maps Link ( Using Map link Here )"
          value={mapLocation}
          onChange={setMapLocation}
          textColor={textColor}
          placeholderColor={placeholderColor}
          cardColor={cardColor}
          borderColor={borderColor}
        />

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
          placeholder="Amenities"
          value={amenities}
          onChange={setAmenities}
          textColor={textColor}
          placeholderColor={placeholderColor}
          cardColor={cardColor}
          borderColor={borderColor}
        />
        <InputBox
          icon={<Sofa size={18} color="#20A68B" />}
          placeholder="Interior Details"
          value={interior}
          onChange={setInterior}
          multiline
          height={80}
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

        {/* 🖼️ Image Upload Section */}
        <GlobalText
          style={{ textAlign: "center", marginBottom: 8, color: "#888" }}
        >
          {images.length}/5 images uploaded
        </GlobalText>

        <TouchableOpacity
          style={[styles.uploadBox, { borderColor }]}
          onPress={handleImagePick}
        >
          <Upload size={20} color="#20A68B" />
          <GlobalText semiBold style={[styles.uploadText, { color: "#20A68B" }]}>
            Upload Images
          </GlobalText>
        </TouchableOpacity>

        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {images.map((img, i) => (
            <View key={i} style={{ position: "relative", margin: 5 }}>
              <Image source={{ uri: img }} style={styles.uploaded} />
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => removeImage(i)}
              >
                <Trash2 size={18} color="red" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* ✅ Submit Button */}
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <GlobalText bold style={styles.submitText}>
            {editingProperty ? "Update Property" : "Add Property"}
          </GlobalText>
        </TouchableOpacity>
      </ScrollView>

      {/* ⚠️ Missing Fields Modal */}
      <Modal visible={missingModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Animatable.View animation="zoomIn" duration={300} style={styles.modalBox}>
            <AlertTriangle size={50} color="#FF6B6B" />
            <GlobalText bold style={styles.modalTitle}>
              Missing Fields
            </GlobalText>
            <GlobalText style={styles.modalSub}>
              Please fill the following fields:
            </GlobalText>
            {missingFieldsList.map((field, idx) => (
              <GlobalText key={idx} style={styles.modalList}>
                • {field}
              </GlobalText>
            ))}
            <TouchableOpacity
              onPress={() => setMissingModalVisible(false)}
              style={styles.modalBtn}
            >
              <GlobalText bold style={{ color: "#fff" }}>
                OK
              </GlobalText>
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// 🧩 Input Box Component
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
}) {
  return (
    <View style={[styles.inputBox, { borderColor, backgroundColor: cardColor }]}>
      <View style={styles.inputRow}>
        {icon}
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          style={[styles.inputField, { height: height || 45, color: textColor }]}
          value={value}
          onChangeText={onChange}
          keyboardType={keyboardType || "default"}
          multiline={multiline}
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
  label: { fontSize: 14, marginBottom: 6 },
  inputBox: {
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  inputRow: { flexDirection: "row", alignItems: "center" },
  inputField: { flex: 1, paddingHorizontal: 8, fontSize: 14 },
  dropdownBox: { borderWidth: 1.5, borderRadius: 10, marginBottom: 15 },
  dropdownList: { borderWidth: 1, borderRadius: 10 },
  uploadBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 10,
    height: 55,
    marginBottom: 20,
  },
  uploadText: { marginLeft: 8, fontSize: 14 },
  uploaded: { width: 100, height: 100, borderRadius: 10 },
  deleteBtn: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 2,
  },
  submitBtn: {
    backgroundColor: "#20A68B",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 10,
  },
  submitText: { color: "#fff", fontSize: 15 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    width: "80%",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: { fontSize: 18, marginTop: 10, color: "#222" },
  modalSub: { fontSize: 13, color: "#555", marginVertical: 5 },
  modalList: { color: "#333", marginTop: 3 },
  modalBtn: {
    backgroundColor: "#20A68B",
    paddingHorizontal: 25,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 15,
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
// import {
//   addProperty,
//   updateProperty,
//   getPropertyById,
// } from "../../api/api";
// import GlobalText from "../../theme/GlobalText";
// import propertyTypes from "../../constants/propertyTypes";
// import states from "../../constants/locations/state";
// import districts from "../../constants/locations/districts";
// import subDistricts from "../../constants/locations/subDistricts";
// import * as Animatable from "react-native-animatable";
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



// // 🌐 Base URL for backend images
// const BASE_URL = "https://zero-estate-backend-render.onrender.com";

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
//   const [mapLocation, setMapLocation] = useState(editingProperty?.mapLocation || "");
//   const [landmark, setLandmark] = useState(editingProperty?.landmark || "");
//   const [sqft, setSqft] = useState(editingProperty?.sqft?.toString() || "");
//   const [bedrooms, setBedrooms] = useState(editingProperty?.bedrooms?.toString() || "1");
//   const [bathrooms, setBathrooms] = useState(editingProperty?.bathrooms?.toString() || "1");
//   const [kitchen, setKitchen] = useState(editingProperty?.kitchen || "Yes");
//   const [amenities, setAmenities] = useState(editingProperty?.amenities || "");
//   const [interior, setInterior] = useState(editingProperty?.interior || "");
//   const [construction, setConstruction] = useState(editingProperty?.construction || "");
//   const [images, setImages] = useState([]);
//   const [category, setCategory] = useState(editingProperty?.category || "House");

//   const [state, setState] = useState(editingProperty?.state || "");
//   const [district, setDistrict] = useState(editingProperty?.district || "");
//   const [subDistrict, setSubDistrict] = useState(editingProperty?.subDistrict || "");

//   const [categoryOpen, setCategoryOpen] = useState(false);
//   const [stateOpen, setStateOpen] = useState(false);
//   const [districtOpen, setDistrictOpen] = useState(false);
//   const [subDistrictOpen, setSubDistrictOpen] = useState(false);

//   const stateItems = states.map((s) => ({ label: s, value: s }));
//   const districtItems = useCallback(() => {
//     return state ? (districts[state] || []).map((d) => ({ label: d, value: d })) : [];
//   }, [state]);
//   const subDistrictItems = useCallback(() => {
//     return district ? (subDistricts[district] || []).map((sd) => ({ label: sd, value: sd })) : [];
//   }, [district]);
//   const categoryItems = propertyTypes.map((c) => ({ label: c.name, value: c.name }));

//   // ✅ Load property details if editing
//   useFocusEffect(
//     useCallback(() => {
//       const loadProperty = async () => {
//         if (!editingProperty?._id && !editingProperty?.id) return;
//         try {
//           const id = editingProperty._id || editingProperty.id;
//           const data = await getPropertyById(id);
//           if (data?.images && Array.isArray(data.images)) {
//             const normalized = data.images.map((img) => {
//               if (img.startsWith("data:") || img.startsWith("http")) return img;
//               return `${BASE_URL}${img}`;
//             });
//             setImages(normalized);
//           }
//         } catch (error) {
//           console.error("Error loading property:", error.message);
//         }
//       };
//       loadProperty();
//     }, [editingProperty?._id])
//   );

//   // // 🖼️ Image Picker (max 5)
//   // const handleImagePick = () => {
//   //   if (images.length >= 5) {
//   //     Alert.alert("Limit Reached", "You can upload a maximum of 5 images only.");
//   //     return;
//   //   }

//   //   Alert.alert("Upload Image", "Choose an option", [
//   //     {
//   //       text: "Camera",
//   //       onPress: () =>
//   //         launchCamera({ mediaType: "photo", includeBase64: false }, async (res) => {
//   //           if (res.assets) {
//   //             const asset = res.assets[0];
//   //             const base64Data = await RNFS.readFile(asset.uri, "base64");
//   //             const newImage = `data:${asset.type};base64,${base64Data}`;
//   //             if (images.length < 5) {
//   //               setImages((prev) => [...prev, newImage]);
//   //             } else {
//   //               Alert.alert("Limit Reached", "Maximum 5 images allowed.");
//   //             }
//   //           }
//   //         }),
//   //     },
//   //     {
//   //       text: "Gallery",
//   //       onPress: () =>
//   //         launchImageLibrary(
//   //           { mediaType: "photo", selectionLimit: 5 - images.length, includeBase64: false },
//   //           async (res) => {
//   //             if (res.assets) {
//   //               const newImages = [];
//   //               for (let asset of res.assets) {
//   //                 const base64Data = await RNFS.readFile(asset.uri, "base64");
//   //                 newImages.push(`data:${asset.type};base64,${base64Data}`);
//   //               }
//   //               const totalImages = [...images, ...newImages];
//   //               if (totalImages.length > 5) {
//   //                 Alert.alert("Limit Reached", "You can have max 5 images total.");
//   //                 setImages(totalImages.slice(0, 5));
//   //               } else {
//   //                 setImages(totalImages);
//   //               }
//   //             }
//   //           }
//   //         ),
//   //     },
//   //     { text: "Cancel", style: "cancel" },
//   //   ]);
//   // };
// // 🖼️ Image Picker (optimized with compression)
// const handleImagePick = () => {
//   if (images.length >= 5) {
//     Alert.alert("Limit Reached", "You can upload a maximum of 5 images only.");
//     return;
//   }

//   Alert.alert("Upload Image", "Choose an option", [
//     {
//       text: "Camera",
//       onPress: () =>
//         launchCamera({ mediaType: "photo" }, async (res) => {
//           if (res.assets) {
//             const asset = res.assets[0];
//             try {
//               // 🔹 Compress and resize image before base64 encoding
//               const resized = await ImageResizer.createResizedImage(
//                 asset.uri,
//                 800, // width
//                 600, // height
//                 "JPEG",
//                 60 // quality 0–100
//               );
//               const base64Data = await RNFS.readFile(resized.uri, "base64");
//               const newImage = `data:image/jpeg;base64,${base64Data}`;
//               if (images.length < 5) setImages((prev) => [...prev, newImage]);
//             } catch (err) {
//               console.error("Compression failed:", err);
//             }
//           }
//         }),
//     },
//     {
//       text: "Gallery",
//       onPress: () =>
//         launchImageLibrary(
//           { mediaType: "photo", selectionLimit: 5 - images.length },
//           async (res) => {
//             if (res.assets) {
//               const newImages = [];
//               for (let asset of res.assets) {
//                 try {
//                   const resized = await ImageResizer.createResizedImage(
//                     asset.uri,
//                     800,
//                     600,
//                     "JPEG",
//                     60
//                   );
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
//           }
//         ),
//     },
//     { text: "Cancel", style: "cancel" },
//   ]);
// };


//   // 🗑️ Remove image (local delete)
//   const removeImage = (i) => {
//     const updated = [...images];
//     updated.splice(i, 1);
//     setImages(updated);
//   };

//   // ✅ Submit handler
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
//         sqft,
//         bedrooms,
//         bathrooms,
//         kitchen,
//         amenities,
//         interior,
//         construction,
//         images,
//         category,
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

//       {/* Header */}
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

//       {/* Form */}
//       <ScrollView
//         contentContainerStyle={{ padding: 20, paddingBottom: 80 }}
//         nestedScrollEnabled={true}
//         showsVerticalScrollIndicator={false}
//       >
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

//         <InputBox icon={<Home size={18} color="#20A68B" />} placeholder="Property Title" value={title} onChange={setTitle} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
//         <InputBox icon={<IndianRupee size={18} color="#20A68B" />} placeholder="Price" value={price} onChange={setPrice} keyboardType="numeric" textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
//         <InputBox icon={<Phone size={18} color="#20A68B" />} placeholder="Contact Number" value={contact} onChange={setContact} keyboardType="phone-pad" textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
//         <InputBox icon={<MapPin size={18} color="#20A68B" />} placeholder="Address" value={location} onChange={setLocation} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />

//         {/* Dropdowns */}
//         <GlobalText medium style={[styles.label, { color: textColor }]}>State</GlobalText>
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

//         <GlobalText medium style={[styles.label, { color: textColor }]}>District</GlobalText>
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

//         <GlobalText medium style={[styles.label, { color: textColor }]}>Sub-District</GlobalText>
//         <DropDownPicker
//           open={subDistrictOpen}
//           value={subDistrict}
//           items={subDistrictItems()}
//           setOpen={setSubDistrictOpen}
//           setValue={setSubDistrict}
//           placeholder="-- Select Sub-District --"
//           style={[styles.dropdownBox, { borderColor, backgroundColor: cardColor }]}
//           dropDownContainerStyle={[
//             styles.dropdownList,
//             { backgroundColor: cardColor, borderColor },
//           ]}
//           zIndex={1000}
//           zIndexInverse={4000}
//           listMode="SCROLLVIEW"
//           disabled={!district}
//         />

//         <InputBox icon={<Landmark size={18} color="#20A68B" />} placeholder="Nearby Landmark" value={landmark} onChange={setLandmark} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
//         <InputBox icon={<Ruler size={18} color="#20A68B" />} placeholder="Property Size in Sqft" value={sqft} onChange={setSqft} keyboardType="numeric" textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
//         <InputBox icon={<Map size={18} color="#20A68B" />} placeholder="Google Maps Link" value={mapLocation} onChange={setMapLocation} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />

//         {category?.toLowerCase() === "house" && (
//           <>
//             <InputBox icon={<Bed size={18} color="#20A68B" />} placeholder="Bedrooms" value={bedrooms} onChange={setBedrooms} keyboardType="numeric" textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
//             <InputBox icon={<Bath size={18} color="#20A68B" />} placeholder="Bathrooms" value={bathrooms} onChange={setBathrooms} keyboardType="numeric" textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
//             <InputBox icon={<UtensilsCrossed size={18} color="#20A68B" />} placeholder="Kitchen (Yes/No)" value={kitchen} onChange={setKitchen} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
//           </>
//         )}

//         <InputBox icon={<ClipboardList size={18} color="#20A68B" />} placeholder="Amenities" value={amenities} onChange={setAmenities} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
//         <InputBox icon={<Sofa size={18} color="#20A68B" />} placeholder="Interior Details" value={interior} onChange={setInterior} multiline height={80} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
//         <InputBox icon={<Wrench size={18} color="#20A68B" />} placeholder="Construction Details" value={construction} onChange={setConstruction} multiline height={80} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />

//         {/* Upload */}
//         <GlobalText style={{ textAlign: "center", marginBottom: 8, color: "#888" }}>
//           {images.length}/5 images uploaded
//         </GlobalText>

//         <TouchableOpacity style={[styles.uploadBox, { borderColor }]} onPress={handleImagePick}>
//           <Upload size={20} color="#20A68B" />
//           <GlobalText semiBold style={[styles.uploadText, { color: "#20A68B" }]}>Upload Images</GlobalText>
//         </TouchableOpacity>

//         <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
//           {images.map((img, i) => (
//             <View key={i} style={{ position: "relative", margin: 5 }}>
//               <Image source={{ uri: img }} style={styles.uploaded} />
//               <TouchableOpacity style={styles.deleteBtn} onPress={() => removeImage(i)}>
//                 <Trash2 size={18} color="red" />
//               </TouchableOpacity>
//             </View>
//           ))}
//         </View>

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
//             <GlobalText bold style={styles.modalTitle}>Missing Fields</GlobalText>
//             <GlobalText style={styles.modalSub}>Please fill the following fields:</GlobalText>
//             {missingFieldsList.map((field, idx) => (
//               <GlobalText key={idx} style={styles.modalList}>• {field}</GlobalText>
//             ))}
//             <TouchableOpacity onPress={() => setMissingModalVisible(false)} style={styles.modalBtn}>
//               <GlobalText bold style={{ color: "#fff" }}>OK</GlobalText>
//             </TouchableOpacity>
//           </Animatable.View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// }

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
// });


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
// import { addProperty, updateProperty } from "../../api/api";
// import GlobalText from "../../theme/GlobalText";
// import propertyTypes from "../../constants/propertyTypes";
// import states from "../../constants/locations/state";
// import districts from "../../constants/locations/districts";
// import subDistricts from "../../constants/locations/subDistricts";
// import * as Animatable from "react-native-animatable";
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
// import { useTheme } from "@react-navigation/native";
// import RNFS from "react-native-fs";

// const BASE_URL = "https://your-backend-domain.com"; // Replace with your live backend URL

// export default function AddPropertyScreen({ route, navigation }) {
//   const editingProperty = route?.params?.property || null;
//   const scheme = useColorScheme();
//   const { colors } = useTheme();
//   const isDark = scheme === "dark";

//   // 🧩 Normalize images
//   const normalizedImages = editingProperty?.images?.map((img) => {
//     if (img.startsWith("data:") || img.startsWith("http")) return img;
//     return `${BASE_URL}${img}`;
//   });

//   const [missingModalVisible, setMissingModalVisible] = useState(false);
//   const [missingFieldsList, setMissingFieldsList] = useState([]);

//   const [title, setTitle] = useState(editingProperty?.title || "");
//   const [price, setPrice] = useState(editingProperty?.price?.toString() || "");
//   const [contact, setContact] = useState(editingProperty?.contact?.toString() || "");
//   const [location, setLocation] = useState(editingProperty?.location || "");
//   const [mapLocation, setMapLocation] = useState(editingProperty?.mapLocation || "");
//   const [landmark, setLandmark] = useState(editingProperty?.landmark || "");
//   const [sqft, setSqft] = useState(editingProperty?.sqft?.toString() || "");
//   const [bedrooms, setBedrooms] = useState(editingProperty?.bedrooms?.toString() || "1");
//   const [bathrooms, setBathrooms] = useState(editingProperty?.bathrooms?.toString() || "1");
//   const [kitchen, setKitchen] = useState(editingProperty?.kitchen || "Yes");
//   const [amenities, setAmenities] = useState(editingProperty?.amenities || "");
//   const [interior, setInterior] = useState(editingProperty?.interior || "");
//   const [construction, setConstruction] = useState(editingProperty?.construction || "");
//   const [images, setImages] = useState(normalizedImages || []);
//   const [category, setCategory] = useState(editingProperty?.category || "House");

//   const [state, setState] = useState(editingProperty?.state || "");
//   const [district, setDistrict] = useState(editingProperty?.district || "");
//   const [subDistrict, setSubDistrict] = useState(editingProperty?.subDistrict || "");

//   // Dropdown states
//   const [categoryOpen, setCategoryOpen] = useState(false);
//   const [stateOpen, setStateOpen] = useState(false);
//   const [districtOpen, setDistrictOpen] = useState(false);
//   const [subDistrictOpen, setSubDistrictOpen] = useState(false);

//   const stateItems = states.map((s) => ({ label: s, value: s }));
//   const districtItems = useCallback(() => {
//     return state ? (districts[state] || []).map((d) => ({ label: d, value: d })) : [];
//   }, [state]);
//   const subDistrictItems = useCallback(() => {
//     return district ? (subDistricts[district] || []).map((sd) => ({ label: sd, value: sd })) : [];
//   }, [district]);
//   const categoryItems = propertyTypes.map((c) => ({ label: c.name, value: c.name }));

//   // 🖼️ Image Picker
//   const handleImagePick = () =>
//     Alert.alert("Upload Image", "Choose an option", [
//       {
//         text: "Camera",
//         onPress: () =>
//           launchCamera({ mediaType: "photo", includeBase64: false }, async (res) => {
//             if (res.assets) {
//               const asset = res.assets[0];
//               const base64Data = await RNFS.readFile(asset.uri, "base64");
//               setImages((prev) => [...prev, `data:${asset.type};base64,${base64Data}`]);
//             }
//           }),
//       },
//       {
//         text: "Gallery",
//         onPress: () =>
//           launchImageLibrary(
//             { mediaType: "photo", selectionLimit: 5, includeBase64: false },
//             async (res) => {
//               if (res.assets) {
//                 const newImages = [];
//                 for (let asset of res.assets) {
//                   const base64Data = await RNFS.readFile(asset.uri, "base64");
//                   newImages.push(`data:${asset.type};base64,${base64Data}`);
//                 }
//                 setImages((prev) => [...prev, ...newImages]);
//               }
//             }
//           ),
//       },
//       { text: "Cancel", style: "cancel" },
//     ]);

//   const removeImage = (i) => {
//     const updated = [...images];
//     updated.splice(i, 1);
//     setImages(updated);
//   };

//   // ✅ Submit handler
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
//         sqft,
//         bedrooms,
//         bathrooms,
//         kitchen,
//         amenities,
//         interior,
//         construction,
//         images,
//         category,
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

//       {/* Header */}
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

//       {/* Form Scroll */}
//       <ScrollView
//         contentContainerStyle={{ padding: 20, paddingBottom: 80 }}
//         nestedScrollEnabled={true} // ✅ Enables scroll inside dropdowns
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Category */}
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

//         {/* Inputs */}
//         <InputBox icon={<Home size={18} color="#20A68B" />} placeholder="Property Title" value={title} onChange={setTitle} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
//         <InputBox icon={<IndianRupee size={18} color="#20A68B" />} placeholder="Price" value={price} onChange={setPrice} keyboardType="numeric" textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
//         <InputBox icon={<Phone size={18} color="#20A68B" />} placeholder="Contact Number" value={contact} onChange={setContact} keyboardType="phone-pad" textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
//         <InputBox icon={<MapPin size={18} color="#20A68B" />} placeholder="Address" value={location} onChange={setLocation} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />

//         {/* Location dropdowns */}
//         <GlobalText medium style={[styles.label, { color: textColor }]}>State</GlobalText>
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

//         <GlobalText medium style={[styles.label, { color: textColor }]}>District</GlobalText>
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

//         <GlobalText medium style={[styles.label, { color: textColor }]}>Sub-District</GlobalText>
//         <DropDownPicker
//           open={subDistrictOpen}
//           value={subDistrict}
//           items={subDistrictItems()}
//           setOpen={setSubDistrictOpen}
//           setValue={setSubDistrict}
//           placeholder="-- Select Sub-District --"
//           style={[styles.dropdownBox, { borderColor, backgroundColor: cardColor }]}
//           dropDownContainerStyle={[
//             styles.dropdownList,
//             { backgroundColor: cardColor, borderColor },
//           ]}
//           zIndex={1000}
//           zIndexInverse={4000}
//           listMode="SCROLLVIEW"
//           disabled={!district}
//         />

//         {/* Other fields */}
//         <InputBox icon={<Landmark size={18} color="#20A68B" />} placeholder="Nearby Landmark" value={landmark} onChange={setLandmark} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
//         <InputBox icon={<Ruler size={18} color="#20A68B" />} placeholder="Property Size in Sqft" value={sqft} onChange={setSqft} keyboardType="numeric" textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
//         <InputBox icon={<Map size={18} color="#20A68B" />} placeholder="Google Maps Link" value={mapLocation} onChange={setMapLocation} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />

//         {/* 🏡 Show Bed/Bath/Kitchen only if House */}
//         {category?.toLowerCase() === "house" && (
//           <>
//             <InputBox icon={<Bed size={18} color="#20A68B" />} placeholder="Bedrooms" value={bedrooms} onChange={setBedrooms} keyboardType="numeric" textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
//             <InputBox icon={<Bath size={18} color="#20A68B" />} placeholder="Bathrooms" value={bathrooms} onChange={setBathrooms} keyboardType="numeric" textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
//             <InputBox icon={<UtensilsCrossed size={18} color="#20A68B" />} placeholder="Kitchen (Yes/No)" value={kitchen} onChange={setKitchen} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
//           </>
//         )}

//         <InputBox icon={<ClipboardList size={18} color="#20A68B" />} placeholder="Amenities" value={amenities} onChange={setAmenities} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
//         <InputBox icon={<Sofa size={18} color="#20A68B" />} placeholder="Interior Details" value={interior} onChange={setInterior} multiline height={80} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
//         <InputBox icon={<Wrench size={18} color="#20A68B" />} placeholder="Construction Details" value={construction} onChange={setConstruction} multiline height={80} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />

//         {/* Upload */}
//         <TouchableOpacity style={[styles.uploadBox, { borderColor }]} onPress={handleImagePick}>
//           <Upload size={20} color="#20A68B" />
//           <GlobalText semiBold style={[styles.uploadText, { color: "#20A68B" }]}>Upload Images</GlobalText>
//         </TouchableOpacity>

//         <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
//           {images.map((img, i) => (
//             <View key={i} style={{ position: "relative", margin: 5 }}>
//               <Image source={{ uri: img }} style={styles.uploaded} />
//               <TouchableOpacity style={styles.deleteBtn} onPress={() => removeImage(i)}>
//                 <Trash2 size={18} color="red" />
//               </TouchableOpacity>
//             </View>
//           ))}
//         </View>

//         {/* Submit */}
//         <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
//           <GlobalText bold style={styles.submitText}>
//             {editingProperty ? "Update Property" : "Add Property"}
//           </GlobalText>
//         </TouchableOpacity>
//       </ScrollView>

//       {/* Missing Modal */}
//       <Modal visible={missingModalVisible} transparent animationType="fade">
//         <View style={styles.modalOverlay}>
//           <Animatable.View animation="zoomIn" duration={300} style={styles.modalBox}>
//             <AlertTriangle size={50} color="#FF6B6B" />
//             <GlobalText bold style={styles.modalTitle}>Missing Fields</GlobalText>
//             <GlobalText style={styles.modalSub}>Please fill the following fields:</GlobalText>
//             {missingFieldsList.map((field, idx) => (
//               <GlobalText key={idx} style={styles.modalList}>• {field}</GlobalText>
//             ))}
//             <TouchableOpacity onPress={() => setMissingModalVisible(false)} style={styles.modalBtn}>
//               <GlobalText bold style={{ color: "#fff" }}>OK</GlobalText>
//             </TouchableOpacity>
//           </Animatable.View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// }

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
// // import { addProperty, updateProperty } from "../../api/api";
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
// // import { useTheme } from "@react-navigation/native";
// // import RNFS from "react-native-fs";

// // // 🌐 Set your backend base URL
// // const BASE_URL = "https://your-backend-domain.com"; // Replace with your live backend URL

// // export default function AddPropertyScreen({ route, navigation }) {
// //   const editingProperty = route?.params?.property || null;
// //   const scheme = useColorScheme();
// //   const { colors } = useTheme();
// //   const isDark = scheme === "dark";

// //   // 🧩 Normalize images
// //   const normalizedImages = editingProperty?.images?.map((img) => {
// //     if (img.startsWith("data:") || img.startsWith("http")) return img;
// //     return `${BASE_URL}${img}`;
// //   });

// //   // Error modal
// //   const [missingModalVisible, setMissingModalVisible] = useState(false);
// //   const [missingFieldsList, setMissingFieldsList] = useState([]);

// //   // Form Fields
// //   const [title, setTitle] = useState(editingProperty?.title || "");
// //   const [price, setPrice] = useState(editingProperty?.price?.toString() || "");
// //   const [contact, setContact] = useState(editingProperty?.contact?.toString() || "");
// //   const [location, setLocation] = useState(editingProperty?.location || "");
// //   const [mapLocation, setMapLocation] = useState(editingProperty?.mapLocation || "");
// //   const [landmark, setLandmark] = useState(editingProperty?.landmark || "");
// //   const [sqft, setSqft] = useState(editingProperty?.sqft?.toString() || "");
// //   const [bedrooms, setBedrooms] = useState(editingProperty?.bedrooms?.toString() || "1");
// //   const [bathrooms, setBathrooms] = useState(editingProperty?.bathrooms?.toString() || "1");
// //   const [kitchen, setKitchen] = useState(editingProperty?.kitchen || "Yes");
// //   const [amenities, setAmenities] = useState(editingProperty?.amenities || "");
// //   const [interior, setInterior] = useState(editingProperty?.interior || "");
// //   const [construction, setConstruction] = useState(editingProperty?.construction || "");
// //   const [images, setImages] = useState(normalizedImages || []);
// //   const [category, setCategory] = useState(editingProperty?.category || "House");

// //   // Location states
// //   const [state, setState] = useState(editingProperty?.state || "");
// //   const [district, setDistrict] = useState(editingProperty?.district || "");
// //   const [subDistrict, setSubDistrict] = useState(editingProperty?.subDistrict || "");

// //   // Dropdowns
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

// //   // 🖼️ Image Picker
// //   const handleImagePick = () =>
// //     Alert.alert("Upload Image", "Choose an option", [
// //       {
// //         text: "Camera",
// //         onPress: () =>
// //           launchCamera({ mediaType: "photo", includeBase64: false }, async (res) => {
// //             if (res.assets) {
// //               const asset = res.assets[0];
// //               const base64Data = await RNFS.readFile(asset.uri, "base64");
// //               setImages((prev) => [...prev, `data:${asset.type};base64,${base64Data}`]);
// //             }
// //           }),
// //       },
// //       {
// //         text: "Gallery",
// //         onPress: () =>
// //           launchImageLibrary(
// //             { mediaType: "photo", selectionLimit: 5, includeBase64: false },
// //             async (res) => {
// //               if (res.assets) {
// //                 const newImages = [];
// //                 for (let asset of res.assets) {
// //                   const base64Data = await RNFS.readFile(asset.uri, "base64");
// //                   newImages.push(`data:${asset.type};base64,${base64Data}`);
// //                 }
// //                 setImages((prev) => [...prev, ...newImages]);
// //               }
// //             }
// //           ),
// //       },
// //       { text: "Cancel", style: "cancel" },
// //     ]);

// //   const removeImage = (i) => {
// //     const updated = [...images];
// //     updated.splice(i, 1);
// //     setImages(updated);
// //   };

// //   // ✅ Submit
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
// //       };

// //       const missing = Object.entries(requiredFields)
// //         .filter(([_, v]) => !v || v.trim() === "")
// //         .map(([k]) => k);

// //       if (missing.length > 0) {
// //         setMissingFieldsList(missing);
// //         setMissingModalVisible(true);
// //         return;
// //       }

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
// //         sqft,
// //         bedrooms,
// //         bathrooms,
// //         kitchen,
// //         amenities,
// //         interior,
// //         construction,
// //         images,
// //         category,
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

// //       {/* Header */}
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

// //       {/* Form */}
// //       <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
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

// //         {/* Inputs */}
// //         <InputBox icon={<Home size={18} color="#20A68B" />} placeholder="Property Title" value={title} onChange={setTitle} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// //         <InputBox icon={<IndianRupee size={18} color="#20A68B" />} placeholder="Price" value={price} onChange={setPrice} keyboardType="numeric" textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// //         <InputBox icon={<Phone size={18} color="#20A68B" />} placeholder="Contact Number" value={contact} onChange={setContact} keyboardType="phone-pad" textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// //         <InputBox icon={<MapPin size={18} color="#20A68B" />} placeholder="Address" value={location} onChange={setLocation} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />

// //         {/* Dropdowns */}
// //         <GlobalText medium style={[styles.label, { color: textColor }]}>State</GlobalText>
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
// //           dropDownContainerStyle={[styles.dropdownList, { backgroundColor: cardColor, borderColor }]}
// //           zIndex={3000}
// //           zIndexInverse={2000}
// //         />

// //         <GlobalText medium style={[styles.label, { color: textColor }]}>District</GlobalText>
// //         <DropDownPicker
// //           open={districtOpen}
// //           value={district}
// //           items={districtItems()}
// //           setOpen={setDistrictOpen}
// //           setValue={setDistrict}
// //           placeholder="-- Select District --"
// //           style={[styles.dropdownBox, { borderColor, backgroundColor: cardColor }]}
// //           dropDownContainerStyle={[styles.dropdownList, { backgroundColor: cardColor, borderColor }]}
// //           zIndex={2000}
// //           zIndexInverse={3000}
// //           disabled={!state}
// //         />

// //         <GlobalText medium style={[styles.label, { color: textColor }]}>Sub-District</GlobalText>
// //         <DropDownPicker
// //           open={subDistrictOpen}
// //           value={subDistrict}
// //           items={subDistrictItems()}
// //           setOpen={setSubDistrictOpen}
// //           setValue={setSubDistrict}
// //           placeholder="-- Select Sub-District --"
// //           style={[styles.dropdownBox, { borderColor, backgroundColor: cardColor }]}
// //           dropDownContainerStyle={[styles.dropdownList, { backgroundColor: cardColor, borderColor }]}
// //           zIndex={1000}
// //           zIndexInverse={4000}
// //           disabled={!district}
// //         />

// //         {/* More fields */}
// //         <InputBox icon={<Landmark size={18} color="#20A68B" />} placeholder="Nearby Landmark" value={landmark} onChange={setLandmark} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// //         <InputBox icon={<Ruler size={18} color="#20A68B" />} placeholder="Property Size in Sqft" value={sqft} onChange={setSqft} keyboardType="numeric" textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// //         <InputBox icon={<Map size={18} color="#20A68B" />} placeholder="Google Maps Link" value={mapLocation} onChange={setMapLocation} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />

// //         {/* 🏡 Show Bed/Bath/Kitchen only when category is House */}
// //         {category?.toLowerCase() === "house" && (
// //           <>
// //             <InputBox icon={<Bed size={18} color="#20A68B" />} placeholder="Bedrooms" value={bedrooms} onChange={setBedrooms} keyboardType="numeric" textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// //             <InputBox icon={<Bath size={18} color="#20A68B" />} placeholder="Bathrooms" value={bathrooms} onChange={setBathrooms} keyboardType="numeric" textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// //             <InputBox icon={<UtensilsCrossed size={18} color="#20A68B" />} placeholder="Kitchen (Yes/No)" value={kitchen} onChange={setKitchen} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// //           </>
// //         )}

// //         <InputBox icon={<ClipboardList size={18} color="#20A68B" />} placeholder="Amenities" value={amenities} onChange={setAmenities} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// //         <InputBox icon={<Sofa size={18} color="#20A68B" />} placeholder="Interior Details" value={interior} onChange={setInterior} multiline height={80} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// //         <InputBox icon={<Wrench size={18} color="#20A68B" />} placeholder="Construction Details" value={construction} onChange={setConstruction} multiline height={80} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />

// //         {/* Upload */}
// //         <TouchableOpacity style={[styles.uploadBox, { borderColor }]} onPress={handleImagePick}>
// //           <Upload size={20} color="#20A68B" />
// //           <GlobalText semiBold style={[styles.uploadText, { color: "#20A68B" }]}>Upload Images</GlobalText>
// //         </TouchableOpacity>

// //         <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
// //           {images.map((img, i) => (
// //             <View key={i} style={{ position: "relative", margin: 5 }}>
// //               <Image source={{ uri: img }} style={styles.uploaded} />
// //               <TouchableOpacity style={styles.deleteBtn} onPress={() => removeImage(i)}>
// //                 <Trash2 size={18} color="red" />
// //               </TouchableOpacity>
// //             </View>
// //           ))}
// //         </View>

// //         {/* Submit */}
// //         <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
// //           <GlobalText bold style={styles.submitText}>
// //             {editingProperty ? "Update Property" : "Add Property"}
// //           </GlobalText>
// //         </TouchableOpacity>
// //       </ScrollView>

// //       {/* Missing Modal */}
// //       <Modal visible={missingModalVisible} transparent animationType="fade">
// //         <View style={styles.modalOverlay}>
// //           <Animatable.View animation="zoomIn" duration={300} style={styles.modalBox}>
// //             <AlertTriangle size={50} color="#FF6B6B" />
// //             <GlobalText bold style={styles.modalTitle}>Missing Fields</GlobalText>
// //             <GlobalText style={styles.modalSub}>Please fill the following fields:</GlobalText>
// //             {missingFieldsList.map((field, idx) => (
// //               <GlobalText key={idx} style={styles.modalList}>• {field}</GlobalText>
// //             ))}
// //             <TouchableOpacity
// //               onPress={() => setMissingModalVisible(false)}
// //               style={styles.modalBtn}
// //             >
// //               <GlobalText bold style={{ color: "#fff" }}>OK</GlobalText>
// //             </TouchableOpacity>
// //           </Animatable.View>
// //         </View>
// //       </Modal>
// //     </SafeAreaView>
// //   );
// // }

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
// // // import { addProperty, updateProperty } from "../../api/api";
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
// // // import { useTheme } from "@react-navigation/native";
// // // import RNFS from "react-native-fs";

// // // // 🌐 Set your backend base URL (used for image normalization)
// // // const BASE_URL = "https://your-backend-domain.com"; // Replace with your live backend URL

// // // export default function AddPropertyScreen({ route, navigation }) {
// // //   const editingProperty = route?.params?.property || null;
// // //   const scheme = useColorScheme();
// // //   const { colors } = useTheme();
// // //   const isDark = scheme === "dark";

// // //   // 🧩 Normalize images from backend (handles base64, full URLs, or relative paths)
// // //   const normalizedImages = editingProperty?.images?.map((img) => {
// // //     if (img.startsWith("data:") || img.startsWith("http")) return img;
// // //     return `${BASE_URL}${img}`;
// // //   });

// // //   // Error modal
// // //   const [missingModalVisible, setMissingModalVisible] = useState(false);
// // //   const [missingFieldsList, setMissingFieldsList] = useState([]);

// // //   // Form Fields
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
// // //   const [images, setImages] = useState(normalizedImages || []);
// // //   const [category, setCategory] = useState(editingProperty?.category || "House");

// // //   // Location states
// // //   const [state, setState] = useState(editingProperty?.state || "");
// // //   const [district, setDistrict] = useState(editingProperty?.district || "");
// // //   const [subDistrict, setSubDistrict] = useState(editingProperty?.subDistrict || "");

// // //   // Dropdowns
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

// // //   // 🖼️ Image Picker
// // //   const handleImagePick = () =>
// // //     Alert.alert("Upload Image", "Choose an option", [
// // //       {
// // //         text: "Camera",
// // //         onPress: () =>
// // //           launchCamera({ mediaType: "photo", includeBase64: false }, async (res) => {
// // //             if (res.assets) {
// // //               const asset = res.assets[0];
// // //               const base64Data = await RNFS.readFile(asset.uri, "base64");
// // //               setImages((prev) => [...prev, `data:${asset.type};base64,${base64Data}`]);
// // //             }
// // //           }),
// // //       },
// // //       {
// // //         text: "Gallery",
// // //         onPress: () =>
// // //           launchImageLibrary(
// // //             { mediaType: "photo", selectionLimit: 5, includeBase64: false },
// // //             async (res) => {
// // //               if (res.assets) {
// // //                 const newImages = [];
// // //                 for (let asset of res.assets) {
// // //                   const base64Data = await RNFS.readFile(asset.uri, "base64");
// // //                   newImages.push(`data:${asset.type};base64,${base64Data}`);
// // //                 }
// // //                 setImages((prev) => [...prev, ...newImages]);
// // //               }
// // //             }
// // //           ),
// // //       },
// // //       { text: "Cancel", style: "cancel" },
// // //     ]);

// // //   const removeImage = (i) => {
// // //     const updated = [...images];
// // //     updated.splice(i, 1);
// // //     setImages(updated);
// // //   };

// // //   // ✅ Submit
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

// // //       {/* Header */}
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

// // //       {/* Form */}
// // //       <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
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

// // //         {/* Inputs */}
// // //         <InputBox icon={<Home size={18} color="#20A68B" />} placeholder="Property Title" value={title} onChange={setTitle} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // //         <InputBox icon={<IndianRupee size={18} color="#20A68B" />} placeholder="Price" value={price} onChange={setPrice} keyboardType="numeric" textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // //         <InputBox icon={<Phone size={18} color="#20A68B" />} placeholder="Contact Number" value={contact} onChange={setContact} keyboardType="phone-pad" textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // //         <InputBox icon={<MapPin size={18} color="#20A68B" />} placeholder="Address" value={location} onChange={setLocation} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />

// // //         {/* Dropdowns */}
// // //         <GlobalText medium style={[styles.label, { color: textColor }]}>State</GlobalText>
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
// // //           dropDownContainerStyle={[styles.dropdownList, { backgroundColor: cardColor, borderColor }]}
// // //           zIndex={3000}
// // //           zIndexInverse={2000}
// // //         />

// // //         <GlobalText medium style={[styles.label, { color: textColor }]}>District</GlobalText>
// // //         <DropDownPicker
// // //           open={districtOpen}
// // //           value={district}
// // //           items={districtItems()}
// // //           setOpen={setDistrictOpen}
// // //           setValue={setDistrict}
// // //           placeholder="-- Select District --"
// // //           style={[styles.dropdownBox, { borderColor, backgroundColor: cardColor }]}
// // //           dropDownContainerStyle={[styles.dropdownList, { backgroundColor: cardColor, borderColor }]}
// // //           zIndex={2000}
// // //           zIndexInverse={3000}
// // //           disabled={!state}
// // //         />

// // //         <GlobalText medium style={[styles.label, { color: textColor }]}>Sub-District</GlobalText>
// // //         <DropDownPicker
// // //           open={subDistrictOpen}
// // //           value={subDistrict}
// // //           items={subDistrictItems()}
// // //           setOpen={setSubDistrictOpen}
// // //           setValue={setSubDistrict}
// // //           placeholder="-- Select Sub-District --"
// // //           style={[styles.dropdownBox, { borderColor, backgroundColor: cardColor }]}
// // //           dropDownContainerStyle={[styles.dropdownList, { backgroundColor: cardColor, borderColor }]}
// // //           zIndex={1000}
// // //           zIndexInverse={4000}
// // //           disabled={!district}
// // //         />

// // //         {/* More fields */}
// // //         <InputBox icon={<Landmark size={18} color="#20A68B" />} placeholder="Nearby Landmark" value={landmark} onChange={setLandmark} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // //         <InputBox icon={<Ruler size={18} color="#20A68B" />} placeholder="Property Size in Sqft" value={sqft} onChange={setSqft} keyboardType="numeric" textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // //         <InputBox icon={<Map size={18} color="#20A68B" />} placeholder="Google Maps Link" value={mapLocation} onChange={setMapLocation} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // //         <InputBox icon={<Bed size={18} color="#20A68B" />} placeholder="Bedrooms" value={bedrooms} onChange={setBedrooms} keyboardType="numeric" textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // //         <InputBox icon={<Bath size={18} color="#20A68B" />} placeholder="Bathrooms" value={bathrooms} onChange={setBathrooms} keyboardType="numeric" textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // //         <InputBox icon={<UtensilsCrossed size={18} color="#20A68B" />} placeholder="Kitchen (Yes/No)" value={kitchen} onChange={setKitchen} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // //         <InputBox icon={<ClipboardList size={18} color="#20A68B" />} placeholder="Amenities" value={amenities} onChange={setAmenities} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // //         <InputBox icon={<Sofa size={18} color="#20A68B" />} placeholder="Interior Details" value={interior} onChange={setInterior} multiline height={80} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // //         <InputBox icon={<Wrench size={18} color="#20A68B" />} placeholder="Construction Details" value={construction} onChange={setConstruction} multiline height={80} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />

// // //         {/* Upload */}
// // //         <TouchableOpacity style={[styles.uploadBox, { borderColor }]} onPress={handleImagePick}>
// // //           <Upload size={20} color="#20A68B" />
// // //           <GlobalText semiBold style={[styles.uploadText, { color: "#20A68B" }]}>Upload Images</GlobalText>
// // //         </TouchableOpacity>

// // //         <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
// // //           {images.map((img, i) => (
// // //             <View key={i} style={{ position: "relative", margin: 5 }}>
// // //               <Image source={{ uri: img }} style={styles.uploaded} />
// // //               <TouchableOpacity style={styles.deleteBtn} onPress={() => removeImage(i)}>
// // //                 <Trash2 size={18} color="red" />
// // //               </TouchableOpacity>
// // //             </View>
// // //           ))}
// // //         </View>

// // //         {/* Submit */}
// // //         <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
// // //           <GlobalText bold style={styles.submitText}>
// // //             {editingProperty ? "Update Property" : "Add Property"}
// // //           </GlobalText>
// // //         </TouchableOpacity>
// // //       </ScrollView>

// // //       {/* Missing Modal */}
// // //       <Modal visible={missingModalVisible} transparent animationType="fade">
// // //         <View style={styles.modalOverlay}>
// // //           <Animatable.View animation="zoomIn" duration={300} style={styles.modalBox}>
// // //             <AlertTriangle size={50} color="#FF6B6B" />
// // //             <GlobalText bold style={styles.modalTitle}>Missing Fields</GlobalText>
// // //             <GlobalText style={styles.modalSub}>Please fill the following fields:</GlobalText>
// // //             {missingFieldsList.map((field, idx) => (
// // //               <GlobalText key={idx} style={styles.modalList}>• {field}</GlobalText>
// // //             ))}
// // //             <TouchableOpacity
// // //               onPress={() => setMissingModalVisible(false)}
// // //               style={styles.modalBtn}
// // //             >
// // //               <GlobalText bold style={{ color: "#fff" }}>OK</GlobalText>
// // //             </TouchableOpacity>
// // //           </Animatable.View>
// // //         </View>
// // //       </Modal>
// // //     </SafeAreaView>
// // //   );
// // // }

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

// // // // import React, { useState, useCallback } from "react";
// // // // import {
// // // //   View,
// // // //   TextInput,
// // // //   StyleSheet,
// // // //   ScrollView,
// // // //   TouchableOpacity,
// // // //   Image,
// // // //   Alert,
// // // //   useColorScheme,
// // // //   Modal,
// // // // } from "react-native";
// // // // import LinearGradient from "react-native-linear-gradient";
// // // // import { SafeAreaView } from "react-native-safe-area-context";
// // // // import { launchCamera, launchImageLibrary } from "react-native-image-picker";
// // // // import DropDownPicker from "react-native-dropdown-picker";
// // // // import AnimatedBackground from "../../components/ReusableComponents/AnimatedBackground";
// // // // import { addProperty, updateProperty } from "../../api/api";
// // // // import GlobalText from "../../theme/GlobalText";
// // // // import propertyTypes from "../../constants/propertyTypes";
// // // // import states from "../../constants/locations/state";
// // // // import districts from "../../constants/locations/districts";
// // // // import subDistricts from "../../constants/locations/subDistricts";
// // // // import * as Animatable from "react-native-animatable";
// // // // import {
// // // //   ArrowLeft,
// // // //   Upload,
// // // //   Trash2,
// // // //   Home,
// // // //   IndianRupee,
// // // //   Phone,
// // // //   MapPin,
// // // //   Landmark,
// // // //   Ruler,
// // // //   Map,
// // // //   Bed,
// // // //   Bath,
// // // //   UtensilsCrossed,
// // // //   ClipboardList,
// // // //   Sofa,
// // // //   Wrench,
// // // //   AlertTriangle,
// // // // } from "lucide-react-native";
// // // // import { useTheme } from "@react-navigation/native";
// // // // import RNFS from "react-native-fs";

// // // // export default function AddPropertyScreen({ route, navigation }) {
// // // //   const editingProperty = route?.params?.property || null;
// // // //   const scheme = useColorScheme();
// // // //   const { colors } = useTheme();
// // // //   const isDark = scheme === "dark";

// // // //   // Error modal
// // // //   const [missingModalVisible, setMissingModalVisible] = useState(false);
// // // //   const [missingFieldsList, setMissingFieldsList] = useState([]);

// // // //   // Form Fields
// // // //   const [title, setTitle] = useState(editingProperty?.title || "");
// // // //   const [price, setPrice] = useState(editingProperty?.price?.toString() || "");
// // // //   const [contact, setContact] = useState(editingProperty?.contact?.toString() || "");
// // // //   const [location, setLocation] = useState(editingProperty?.location || "");
// // // //   const [mapLocation, setMapLocation] = useState(editingProperty?.mapLocation || "");
// // // //   const [landmark, setLandmark] = useState(editingProperty?.landmark || "");
// // // //   const [sqft, setSqft] = useState(editingProperty?.sqft?.toString() || "");
// // // //   const [bedrooms, setBedrooms] = useState(editingProperty?.bedrooms?.toString() || "1");
// // // //   const [bathrooms, setBathrooms] = useState(editingProperty?.bathrooms?.toString() || "1");
// // // //   const [kitchen, setKitchen] = useState(editingProperty?.kitchen || "Yes");
// // // //   const [amenities, setAmenities] = useState(editingProperty?.amenities || "");
// // // //   const [interior, setInterior] = useState(editingProperty?.interior || "");
// // // //   const [construction, setConstruction] = useState(editingProperty?.construction || "");
// // // //   const [images, setImages] = useState(editingProperty?.images || []);
// // // //   const [category, setCategory] = useState(editingProperty?.category || "House");

// // // //   // Location states
// // // //   const [state, setState] = useState(editingProperty?.state || "");
// // // //   const [district, setDistrict] = useState(editingProperty?.district || "");
// // // //   const [subDistrict, setSubDistrict] = useState(editingProperty?.subDistrict || "");

// // // //   // Dropdowns
// // // //   const [categoryOpen, setCategoryOpen] = useState(false);
// // // //   const [stateOpen, setStateOpen] = useState(false);
// // // //   const [districtOpen, setDistrictOpen] = useState(false);
// // // //   const [subDistrictOpen, setSubDistrictOpen] = useState(false);

// // // //   const stateItems = states.map((s) => ({ label: s, value: s }));
// // // //   const districtItems = useCallback(() => {
// // // //     return state ? (districts[state] || []).map((d) => ({ label: d, value: d })) : [];
// // // //   }, [state]);
// // // //   const subDistrictItems = useCallback(() => {
// // // //     return district ? (subDistricts[district] || []).map((sd) => ({ label: sd, value: sd })) : [];
// // // //   }, [district]);
// // // //   const categoryItems = propertyTypes.map((c) => ({ label: c.name, value: c.name }));

// // // //   // 🖼️ Image Picker
// // // //   const handleImagePick = () =>
// // // //     Alert.alert("Upload Image", "Choose an option", [
// // // //       {
// // // //         text: "Camera",
// // // //         onPress: () =>
// // // //           launchCamera({ mediaType: "photo", includeBase64: false }, async (res) => {
// // // //             if (res.assets) {
// // // //               const asset = res.assets[0];
// // // //               const base64Data = await RNFS.readFile(asset.uri, "base64");
// // // //               setImages((prev) => [...prev, `data:${asset.type};base64,${base64Data}`]);
// // // //             }
// // // //           }),
// // // //       },
// // // //       {
// // // //         text: "Gallery",
// // // //         onPress: () =>
// // // //           launchImageLibrary(
// // // //             { mediaType: "photo", selectionLimit: 5, includeBase64: false },
// // // //             async (res) => {
// // // //               if (res.assets) {
// // // //                 const newImages = [];
// // // //                 for (let asset of res.assets) {
// // // //                   const base64Data = await RNFS.readFile(asset.uri, "base64");
// // // //                   newImages.push(`data:${asset.type};base64,${base64Data}`);
// // // //                 }
// // // //                 setImages((prev) => [...prev, ...newImages]);
// // // //               }
// // // //             }
// // // //           ),
// // // //       },
// // // //       { text: "Cancel", style: "cancel" },
// // // //     ]);

// // // //   const removeImage = (i) => {
// // // //     const updated = [...images];
// // // //     updated.splice(i, 1);
// // // //     setImages(updated);
// // // //   };

// // // //   // ✅ Submit
// // // //   const handleSubmit = async () => {
// // // //     try {
// // // //       const requiredFields = {
// // // //         Title: title,
// // // //         Price: price,
// // // //         Contact: contact,
// // // //         Address: location,
// // // //         State: state,
// // // //         District: district,
// // // //         Category: category,
// // // //       };

// // // //       const missing = Object.entries(requiredFields)
// // // //         .filter(([_, v]) => !v || v.trim() === "")
// // // //         .map(([k]) => k);

// // // //       if (missing.length > 0) {
// // // //         setMissingFieldsList(missing);
// // // //         setMissingModalVisible(true);
// // // //         return;
// // // //       }

// // // //       const payload = {
// // // //         title,
// // // //         price,
// // // //         contact: Number(contact),
// // // //         location,
// // // //         mapLocation,
// // // //         district,
// // // //         subDistrict,
// // // //         state,
// // // //         landmark,
// // // //         sqft,
// // // //         bedrooms,
// // // //         bathrooms,
// // // //         kitchen,
// // // //         amenities,
// // // //         interior,
// // // //         construction,
// // // //         images,
// // // //         category,
// // // //       };

// // // //       if (editingProperty) {
// // // //         await updateProperty(editingProperty._id || editingProperty.id, payload);
// // // //         Alert.alert("✅ Success", "Property updated successfully!", [
// // // //           { text: "OK", onPress: () => navigation.goBack() },
// // // //         ]);
// // // //       } else {
// // // //         await addProperty(payload);
// // // //         // ✅ Navigate directly to SuccessScreen.js
// // // //         navigation.reset({
// // // //           index: 0,
// // // //           routes: [{ name: "Success" }],
// // // //         });
// // // //       }
// // // //     } catch (err) {
// // // //       console.error("Save Error:", err.response?.data || err.message);
// // // //       Alert.alert("❌ Error", "Failed to save property");
// // // //     }
// // // //   };

// // // //   const backgroundColor = isDark ? "#121212" : "#f9f9f9";
// // // //   const cardColor = isDark ? "#1E1E1E" : "#fff";
// // // //   const textColor = isDark ? "#EDEDED" : "#000";
// // // //   const placeholderColor = isDark ? "#888" : "#666";
// // // //   const borderColor = isDark ? "#333" : "#20A68B";

// // // //   return (
// // // //     <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
// // // //       <AnimatedBackground />

// // // //       {/* Header */}
// // // //       <LinearGradient
// // // //         colors={isDark ? ["#114D44", "#0D3732"] : ["#43C6AC", "#20A68B"]}
// // // //         style={styles.headerContainer}
// // // //       >
// // // //         <View style={styles.header}>
// // // //           <TouchableOpacity onPress={() => navigation.goBack()}>
// // // //             <ArrowLeft size={24} color="#fff" />
// // // //           </TouchableOpacity>
// // // //           <GlobalText bold style={styles.headerTitle}>
// // // //             {editingProperty ? "Edit Property" : "Add Property"}
// // // //           </GlobalText>
// // // //           <View style={{ width: 24 }} />
// // // //         </View>
// // // //       </LinearGradient>

// // // //       {/* Form */}
// // // //       <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
// // // //         <GlobalText medium style={[styles.label, { color: textColor }]}>
// // // //           Category
// // // //         </GlobalText>
// // // //         <DropDownPicker
// // // //           open={categoryOpen}
// // // //           value={category}
// // // //           items={categoryItems}
// // // //           setOpen={setCategoryOpen}
// // // //           setValue={setCategory}
// // // //           placeholder="-- Select Category --"
// // // //           style={[styles.dropdownBox, { borderColor, backgroundColor: cardColor }]}
// // // //           dropDownContainerStyle={[
// // // //             styles.dropdownList,
// // // //             { backgroundColor: cardColor, borderColor },
// // // //           ]}
// // // //           zIndex={4000}
// // // //           zIndexInverse={1000}
// // // //           listMode="SCROLLVIEW"
// // // //         />

// // // //         {/* Inputs */}
// // // //         <InputBox icon={<Home size={18} color="#20A68B" />} placeholder="Property Title" value={title} onChange={setTitle} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // // //         <InputBox icon={<IndianRupee size={18} color="#20A68B" />} placeholder="Price" value={price} onChange={setPrice} keyboardType="numeric" textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // // //         <InputBox icon={<Phone size={18} color="#20A68B" />} placeholder="Contact Number" value={contact} onChange={setContact} keyboardType="phone-pad" textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // // //         <InputBox icon={<MapPin size={18} color="#20A68B" />} placeholder="Address" value={location} onChange={setLocation} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />

// // // //         {/* Dropdowns */}
// // // //         <GlobalText medium style={[styles.label, { color: textColor }]}>State</GlobalText>
// // // //         <DropDownPicker
// // // //           open={stateOpen}
// // // //           value={state}
// // // //           items={stateItems}
// // // //           setOpen={setStateOpen}
// // // //           setValue={(callback) => {
// // // //             const selected = typeof callback === "function" ? callback(state) : callback;
// // // //             setState(selected);
// // // //             setDistrict("");
// // // //             setSubDistrict("");
// // // //           }}
// // // //           placeholder="-- Select State --"
// // // //           style={[styles.dropdownBox, { borderColor, backgroundColor: cardColor }]}
// // // //           dropDownContainerStyle={[styles.dropdownList, { backgroundColor: cardColor, borderColor }]}
// // // //           zIndex={3000}
// // // //           zIndexInverse={2000}
// // // //         />

// // // //         <GlobalText medium style={[styles.label, { color: textColor }]}>District</GlobalText>
// // // //         <DropDownPicker
// // // //           open={districtOpen}
// // // //           value={district}
// // // //           items={districtItems()}
// // // //           setOpen={setDistrictOpen}
// // // //           setValue={setDistrict}
// // // //           placeholder="-- Select District --"
// // // //           style={[styles.dropdownBox, { borderColor, backgroundColor: cardColor }]}
// // // //           dropDownContainerStyle={[styles.dropdownList, { backgroundColor: cardColor, borderColor }]}
// // // //           zIndex={2000}
// // // //           zIndexInverse={3000}
// // // //           disabled={!state}
// // // //         />

// // // //         <GlobalText medium style={[styles.label, { color: textColor }]}>Sub-District</GlobalText>
// // // //         <DropDownPicker
// // // //           open={subDistrictOpen}
// // // //           value={subDistrict}
// // // //           items={subDistrictItems()}
// // // //           setOpen={setSubDistrictOpen}
// // // //           setValue={setSubDistrict}
// // // //           placeholder="-- Select Sub-District --"
// // // //           style={[styles.dropdownBox, { borderColor, backgroundColor: cardColor }]}
// // // //           dropDownContainerStyle={[styles.dropdownList, { backgroundColor: cardColor, borderColor }]}
// // // //           zIndex={1000}
// // // //           zIndexInverse={4000}
// // // //           disabled={!district}
// // // //         />

// // // //         {/* More fields */}
// // // //         <InputBox icon={<Landmark size={18} color="#20A68B" />} placeholder="Nearby Landmark" value={landmark} onChange={setLandmark} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // // //         <InputBox icon={<Ruler size={18} color="#20A68B" />} placeholder="Property Size in Sqft" value={sqft} onChange={setSqft} keyboardType="numeric" textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // // //         <InputBox icon={<Map size={18} color="#20A68B" />} placeholder="Google Maps Link" value={mapLocation} onChange={setMapLocation} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // // //         <InputBox icon={<Bed size={18} color="#20A68B" />} placeholder="Bedrooms" value={bedrooms} onChange={setBedrooms} keyboardType="numeric" textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // // //         <InputBox icon={<Bath size={18} color="#20A68B" />} placeholder="Bathrooms" value={bathrooms} onChange={setBathrooms} keyboardType="numeric" textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // // //         <InputBox icon={<UtensilsCrossed size={18} color="#20A68B" />} placeholder="Kitchen (Yes/No)" value={kitchen} onChange={setKitchen} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // // //         <InputBox icon={<ClipboardList size={18} color="#20A68B" />} placeholder="Amenities" value={amenities} onChange={setAmenities} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // // //         <InputBox icon={<Sofa size={18} color="#20A68B" />} placeholder="Interior Details" value={interior} onChange={setInterior} multiline height={80} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // // //         <InputBox icon={<Wrench size={18} color="#20A68B" />} placeholder="Construction Details" value={construction} onChange={setConstruction} multiline height={80} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />

// // // //         {/* Upload */}
// // // //         <TouchableOpacity style={[styles.uploadBox, { borderColor }]} onPress={handleImagePick}>
// // // //           <Upload size={20} color="#20A68B" />
// // // //           <GlobalText semiBold style={[styles.uploadText, { color: "#20A68B" }]}>Upload Images</GlobalText>
// // // //         </TouchableOpacity>

// // // //         <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
// // // //           {images.map((img, i) => (
// // // //             <View key={i} style={{ position: "relative", margin: 5 }}>
// // // //               <Image source={{ uri: img }} style={styles.uploaded} />
// // // //               <TouchableOpacity style={styles.deleteBtn} onPress={() => removeImage(i)}>
// // // //                 <Trash2 size={18} color="red" />
// // // //               </TouchableOpacity>
// // // //             </View>
// // // //           ))}
// // // //         </View>

// // // //         {/* Submit */}
// // // //         <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
// // // //           <GlobalText bold style={styles.submitText}>
// // // //             {editingProperty ? "Update Property" : "Add Property"}
// // // //           </GlobalText>
// // // //         </TouchableOpacity>
// // // //       </ScrollView>

// // // //       {/* Missing Modal */}
// // // //       <Modal visible={missingModalVisible} transparent animationType="fade">
// // // //         <View style={styles.modalOverlay}>
// // // //           <Animatable.View animation="zoomIn" duration={300} style={styles.modalBox}>
// // // //             <AlertTriangle size={50} color="#FF6B6B" />
// // // //             <GlobalText bold style={styles.modalTitle}>Missing Fields</GlobalText>
// // // //             <GlobalText style={styles.modalSub}>Please fill the following fields:</GlobalText>
// // // //             {missingFieldsList.map((field, idx) => (
// // // //               <GlobalText key={idx} style={styles.modalList}>• {field}</GlobalText>
// // // //             ))}
// // // //             <TouchableOpacity
// // // //               onPress={() => setMissingModalVisible(false)}
// // // //               style={styles.modalBtn}
// // // //             >
// // // //               <GlobalText bold style={{ color: "#fff" }}>OK</GlobalText>
// // // //             </TouchableOpacity>
// // // //           </Animatable.View>
// // // //         </View>
// // // //       </Modal>
// // // //     </SafeAreaView>
// // // //   );
// // // // }

// // // // function InputBox({ icon, placeholder, value, onChange, keyboardType, multiline, height, textColor, placeholderColor, cardColor, borderColor }) {
// // // //   return (
// // // //     <View style={[styles.inputBox, { borderColor, backgroundColor: cardColor }]}>
// // // //       <View style={styles.inputRow}>
// // // //         {icon}
// // // //         <TextInput
// // // //           placeholder={placeholder}
// // // //           placeholderTextColor={placeholderColor}
// // // //           style={[styles.inputField, { height: height || 45, color: textColor }]}
// // // //           value={value}
// // // //           onChangeText={onChange}
// // // //           keyboardType={keyboardType || "default"}
// // // //           multiline={multiline}
// // // //         />
// // // //       </View>
// // // //     </View>
// // // //   );
// // // // }

// // // // const styles = StyleSheet.create({
// // // //   safeArea: { flex: 1 },
// // // //   headerContainer: { paddingVertical: 12, elevation: 6, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
// // // //   header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16 },
// // // //   headerTitle: { fontSize: 18, color: "#fff" },
// // // //   label: { fontSize: 14, marginBottom: 6 },
// // // //   inputBox: { borderWidth: 1, borderRadius: 10, marginBottom: 15, paddingHorizontal: 10 },
// // // //   inputRow: { flexDirection: "row", alignItems: "center" },
// // // //   inputField: { flex: 1, paddingHorizontal: 8, fontSize: 14 },
// // // //   dropdownBox: { borderWidth: 1.5, borderRadius: 10, marginBottom: 15 },
// // // //   dropdownList: { borderWidth: 1, borderRadius: 10 },
// // // //   uploadBox: {
// // // //     flexDirection: "row",
// // // //     alignItems: "center",
// // // //     justifyContent: "center",
// // // //     borderWidth: 1,
// // // //     borderRadius: 10,
// // // //     height: 55,
// // // //     marginBottom: 20,
// // // //   },
// // // //   uploadText: { marginLeft: 8, fontSize: 14 },
// // // //   uploaded: { width: 100, height: 100, borderRadius: 10 },
// // // //   deleteBtn: {
// // // //     position: "absolute",
// // // //     top: -6,
// // // //     right: -6,
// // // //     backgroundColor: "#fff",
// // // //     borderRadius: 20,
// // // //     padding: 2,
// // // //   },
// // // //   submitBtn: {
// // // //     backgroundColor: "#20A68B",
// // // //     borderRadius: 12,
// // // //     paddingVertical: 15,
// // // //     alignItems: "center",
// // // //     marginTop: 10,
// // // //   },
// // // //   submitText: { color: "#fff", fontSize: 15 },
// // // //   modalOverlay: {
// // // //     flex: 1,
// // // //     backgroundColor: "rgba(0,0,0,0.6)",
// // // //     justifyContent: "center",
// // // //     alignItems: "center",
// // // //   },
// // // //   modalBox: {
// // // //     backgroundColor: "#fff",
// // // //     width: "80%",
// // // //     borderRadius: 16,
// // // //     padding: 20,
// // // //     alignItems: "center",
// // // //   },
// // // //   modalTitle: { fontSize: 18, marginTop: 10, color: "#222" },
// // // //   modalSub: { fontSize: 13, color: "#555", marginVertical: 5 },
// // // //   modalList: { color: "#333", marginTop: 3 },
// // // //   modalBtn: {
// // // //     backgroundColor: "#20A68B",
// // // //     paddingHorizontal: 25,
// // // //     paddingVertical: 8,
// // // //     borderRadius: 10,
// // // //     marginTop: 15,
// // // //   },
// // // // });

// // // // // import React, { useState, useCallback } from "react";
// // // // // import {
// // // // //   View,
// // // // //   TextInput,
// // // // //   StyleSheet,
// // // // //   ScrollView,
// // // // //   TouchableOpacity,
// // // // //   Image,
// // // // //   Alert,
// // // // //   useColorScheme,
// // // // //   Modal,
// // // // // } from "react-native";
// // // // // import LinearGradient from "react-native-linear-gradient";
// // // // // import { SafeAreaView } from "react-native-safe-area-context";
// // // // // import { launchCamera, launchImageLibrary } from "react-native-image-picker";
// // // // // import DropDownPicker from "react-native-dropdown-picker";
// // // // // import AnimatedBackground from "../../components/ReusableComponents/AnimatedBackground";
// // // // // import { addProperty, updateProperty } from "../../api/api";
// // // // // import GlobalText from "../../theme/GlobalText";
// // // // // import propertyTypes from "../../constants/propertyTypes";
// // // // // import states from "../../constants/locations/state";
// // // // // import districts from "../../constants/locations/districts";
// // // // // import subDistricts from "../../constants/locations/subDistricts";
// // // // // import * as Animatable from "react-native-animatable";
// // // // // import {
// // // // //   ArrowLeft,
// // // // //   Upload,
// // // // //   Trash2,
// // // // //   Home,
// // // // //   IndianRupee,
// // // // //   Phone,
// // // // //   MapPin,
// // // // //   Landmark,
// // // // //   Ruler,
// // // // //   Map,
// // // // //   Bed,
// // // // //   Bath,
// // // // //   UtensilsCrossed,
// // // // //   ClipboardList,
// // // // //   Sofa,
// // // // //   Wrench,
// // // // //   AlertTriangle,
// // // // // } from "lucide-react-native";
// // // // // import { useTheme } from "@react-navigation/native";
// // // // // import RNFS from "react-native-fs";

// // // // // export default function AddPropertyScreen({ route, navigation }) {
// // // // //   const editingProperty = route?.params?.property || null;
// // // // //   const scheme = useColorScheme();
// // // // //   const { colors } = useTheme();
// // // // //   const isDark = scheme === "dark";

// // // // //   // Error modal
// // // // //   const [missingModalVisible, setMissingModalVisible] = useState(false);
// // // // //   const [missingFieldsList, setMissingFieldsList] = useState([]);

// // // // //   // Form Fields
// // // // //   const [title, setTitle] = useState(editingProperty?.title || "");
// // // // //   const [price, setPrice] = useState(editingProperty?.price?.toString() || "");
// // // // //   const [contact, setContact] = useState(editingProperty?.contact?.toString() || "");
// // // // //   const [location, setLocation] = useState(editingProperty?.location || "");
// // // // //   const [mapLocation, setMapLocation] = useState(editingProperty?.mapLocation || "");
// // // // //   const [landmark, setLandmark] = useState(editingProperty?.landmark || "");
// // // // //   const [sqft, setSqft] = useState(editingProperty?.sqft?.toString() || "");
// // // // //   const [bedrooms, setBedrooms] = useState(editingProperty?.bedrooms?.toString() || "1");
// // // // //   const [bathrooms, setBathrooms] = useState(editingProperty?.bathrooms?.toString() || "1");
// // // // //   const [kitchen, setKitchen] = useState(editingProperty?.kitchen || "Yes");
// // // // //   const [amenities, setAmenities] = useState(editingProperty?.amenities || "");
// // // // //   const [interior, setInterior] = useState(editingProperty?.interior || "");
// // // // //   const [construction, setConstruction] = useState(editingProperty?.construction || "");
// // // // //   const [images, setImages] = useState(editingProperty?.images || []); // keep existing images
// // // // //   const [category, setCategory] = useState(editingProperty?.category || "House");

// // // // //   // Location states
// // // // //   const [state, setState] = useState(editingProperty?.state || "");
// // // // //   const [district, setDistrict] = useState(editingProperty?.district || "");
// // // // //   const [subDistrict, setSubDistrict] = useState(editingProperty?.subDistrict || "");

// // // // //   // Dropdowns
// // // // //   const [categoryOpen, setCategoryOpen] = useState(false);
// // // // //   const [stateOpen, setStateOpen] = useState(false);
// // // // //   const [districtOpen, setDistrictOpen] = useState(false);
// // // // //   const [subDistrictOpen, setSubDistrictOpen] = useState(false);

// // // // //   const stateItems = states.map((s) => ({ label: s, value: s }));
// // // // //   const districtItems = useCallback(() => {
// // // // //     return state ? (districts[state] || []).map((d) => ({ label: d, value: d })) : [];
// // // // //   }, [state]);
// // // // //   const subDistrictItems = useCallback(() => {
// // // // //     return district ? (subDistricts[district] || []).map((sd) => ({ label: sd, value: sd })) : [];
// // // // //   }, [district]);
// // // // //   const categoryItems = propertyTypes.map((c) => ({ label: c.name, value: c.name }));

// // // // //   // 🖼️ Image Picker
// // // // //   const handleImagePick = () =>
// // // // //     Alert.alert("Upload Image", "Choose an option", [
// // // // //       {
// // // // //         text: "Camera",
// // // // //         onPress: () =>
// // // // //           launchCamera({ mediaType: "photo", includeBase64: false }, async (res) => {
// // // // //             if (res.assets) {
// // // // //               const asset = res.assets[0];
// // // // //               const base64Data = await RNFS.readFile(asset.uri, "base64");
// // // // //               setImages((prev) => [...prev, `data:${asset.type};base64,${base64Data}`]);
// // // // //             }
// // // // //           }),
// // // // //       },
// // // // //       {
// // // // //         text: "Gallery",
// // // // //         onPress: () =>
// // // // //           launchImageLibrary(
// // // // //             { mediaType: "photo", selectionLimit: 5, includeBase64: false },
// // // // //             async (res) => {
// // // // //               if (res.assets) {
// // // // //                 const newImages = [];
// // // // //                 for (let asset of res.assets) {
// // // // //                   const base64Data = await RNFS.readFile(asset.uri, "base64");
// // // // //                   newImages.push(`data:${asset.type};base64,${base64Data}`);
// // // // //                 }
// // // // //                 setImages((prev) => [...prev, ...newImages]);
// // // // //               }
// // // // //             }
// // // // //           ),
// // // // //       },
// // // // //       { text: "Cancel", style: "cancel" },
// // // // //     ]);

// // // // //   const removeImage = (i) => {
// // // // //     const updated = [...images];
// // // // //     updated.splice(i, 1);
// // // // //     setImages(updated);
// // // // //   };

// // // // //   // ✅ Submit
// // // // //   const handleSubmit = async () => {
// // // // //     try {
// // // // //       const requiredFields = {
// // // // //         Title: title,
// // // // //         Price: price,
// // // // //         Contact: contact,
// // // // //         Address: location,
// // // // //         State: state,
// // // // //         District: district,
// // // // //         Category: category,
// // // // //       };

// // // // //       const missing = Object.entries(requiredFields)
// // // // //         .filter(([_, v]) => !v || v.trim() === "")
// // // // //         .map(([k]) => k);

// // // // //       if (missing.length > 0) {
// // // // //         setMissingFieldsList(missing);
// // // // //         setMissingModalVisible(true);
// // // // //         return;
// // // // //       }

// // // // //       const payload = {
// // // // //         title,
// // // // //         price,
// // // // //         contact: Number(contact),
// // // // //         location,
// // // // //         mapLocation,
// // // // //         district,
// // // // //         subDistrict,
// // // // //         state,
// // // // //         landmark,
// // // // //         sqft,
// // // // //         bedrooms,
// // // // //         bathrooms,
// // // // //         kitchen,
// // // // //         amenities,
// // // // //         interior,
// // // // //         construction,
// // // // //         images,
// // // // //         category,
// // // // //       };

// // // // //           if (editingProperty) {
// // // // //         await updateProperty(editingProperty._id || editingProperty.id, payload);
// // // // //         navigation.goBack();
// // // // //       } else {
// // // // //         await addProperty(payload);
// // // // //         navigation.reset({
// // // // //           index: 0,
// // // // //           routes: [{ name: "Success" }],
// // // // //         });
// // // // //       }

// // // // //     } catch (err) {
// // // // //       console.error("Save Error:", err.response?.data || err.message);
// // // // //       Alert.alert("❌ Error", "Failed to save property");
// // // // //     }
// // // // //   };

// // // // //   const backgroundColor = isDark ? "#121212" : "#f9f9f9";
// // // // //   const cardColor = isDark ? "#1E1E1E" : "#fff";
// // // // //   const textColor = isDark ? "#EDEDED" : "#000";
// // // // //   const placeholderColor = isDark ? "#888" : "#666";
// // // // //   const borderColor = isDark ? "#333" : "#20A68B";

// // // // //   return (
// // // // //     <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
// // // // //       <AnimatedBackground />

// // // // //       {/* Header */}
// // // // //       <LinearGradient
// // // // //         colors={isDark ? ["#114D44", "#0D3732"] : ["#43C6AC", "#20A68B"]}
// // // // //         style={styles.headerContainer}
// // // // //       >
// // // // //         <View style={styles.header}>
// // // // //           <TouchableOpacity onPress={() => navigation.goBack()}>
// // // // //             <ArrowLeft size={24} color="#fff" />
// // // // //           </TouchableOpacity>
// // // // //           <GlobalText bold style={styles.headerTitle}>
// // // // //             {editingProperty ? "Edit Property" : "Add Property"}
// // // // //           </GlobalText>
// // // // //           <View style={{ width: 24 }} />
// // // // //         </View>
// // // // //       </LinearGradient>

// // // // //       {/* Form */}
// // // // //       <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
// // // // //         <GlobalText medium style={[styles.label, { color: textColor }]}>
// // // // //           Category
// // // // //         </GlobalText>
// // // // //         <DropDownPicker
// // // // //           open={categoryOpen}
// // // // //           value={category}
// // // // //           items={categoryItems}
// // // // //           setOpen={setCategoryOpen}
// // // // //           setValue={setCategory}
// // // // //           placeholder="-- Select Category --"
// // // // //           style={[styles.dropdownBox, { borderColor, backgroundColor: cardColor }]}
// // // // //           dropDownContainerStyle={[styles.dropdownList, { backgroundColor: cardColor, borderColor }]}
// // // // //           zIndex={4000}
// // // // //           zIndexInverse={1000}
// // // // //           listMode="SCROLLVIEW"
// // // // //         />

// // // // //         {/* Input Fields */}
// // // // //         <InputBox icon={<Home size={18} color="#20A68B" />} placeholder="Property Title" value={title} onChange={setTitle} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // // // //         <InputBox icon={<IndianRupee size={18} color="#20A68B" />} placeholder="Price" value={price} onChange={setPrice} keyboardType="numeric" textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // // // //         <InputBox icon={<Phone size={18} color="#20A68B" />} placeholder="Contact Number" value={contact} onChange={setContact} keyboardType="phone-pad" textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // // // //         <InputBox icon={<MapPin size={18} color="#20A68B" />} placeholder="Address" value={location} onChange={setLocation} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />

// // // // //         {/* State Dropdown */}
// // // // //         <GlobalText medium style={[styles.label, { color: textColor }]}>State</GlobalText>
// // // // //         <DropDownPicker
// // // // //           open={stateOpen}
// // // // //           value={state}
// // // // //           items={stateItems}
// // // // //           setOpen={setStateOpen}
// // // // //           setValue={(callback) => {
// // // // //             const selected = typeof callback === "function" ? callback(state) : callback;
// // // // //             setState(selected);
// // // // //             setDistrict("");
// // // // //             setSubDistrict("");
// // // // //           }}
// // // // //           placeholder="-- Select State --"
// // // // //           style={[styles.dropdownBox, { borderColor, backgroundColor: cardColor }]}
// // // // //           dropDownContainerStyle={[styles.dropdownList, { backgroundColor: cardColor, borderColor }]}
// // // // //           zIndex={3000}
// // // // //           zIndexInverse={2000}
// // // // //         />

// // // // //         <GlobalText medium style={[styles.label, { color: textColor }]}>District</GlobalText>
// // // // //         <DropDownPicker
// // // // //           open={districtOpen}
// // // // //           value={district}
// // // // //           items={districtItems()}
// // // // //           setOpen={setDistrictOpen}
// // // // //           setValue={setDistrict}
// // // // //           placeholder="-- Select District --"
// // // // //           style={[styles.dropdownBox, { borderColor, backgroundColor: cardColor }]}
// // // // //           dropDownContainerStyle={[styles.dropdownList, { backgroundColor: cardColor, borderColor }]}
// // // // //           zIndex={2000}
// // // // //           zIndexInverse={3000}
// // // // //           disabled={!state}
// // // // //         />

// // // // //         <GlobalText medium style={[styles.label, { color: textColor }]}>Sub-District</GlobalText>
// // // // //         <DropDownPicker
// // // // //           open={subDistrictOpen}
// // // // //           value={subDistrict}
// // // // //           items={subDistrictItems()}
// // // // //           setOpen={setSubDistrictOpen}
// // // // //           setValue={setSubDistrict}
// // // // //           placeholder="-- Select Sub-District --"
// // // // //           style={[styles.dropdownBox, { borderColor, backgroundColor: cardColor }]}
// // // // //           dropDownContainerStyle={[styles.dropdownList, { backgroundColor: cardColor, borderColor }]}
// // // // //           zIndex={1000}
// // // // //           zIndexInverse={4000}
// // // // //           disabled={!district}
// // // // //         />

// // // // //         {/* Extra Details */}
// // // // //         <InputBox icon={<Landmark size={18} color="#20A68B" />} placeholder="Nearby Landmark" value={landmark} onChange={setLandmark} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // // // //         <InputBox icon={<Ruler size={18} color="#20A68B" />} placeholder="Property Size in Sqft" value={sqft} onChange={setSqft} keyboardType="numeric" textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // // // //         <InputBox icon={<Map size={18} color="#20A68B" />} placeholder="Google Maps Link" value={mapLocation} onChange={setMapLocation} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // // // //         <InputBox icon={<Bed size={18} color="#20A68B" />} placeholder="Bedrooms" value={bedrooms} onChange={setBedrooms} keyboardType="numeric" textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // // // //         <InputBox icon={<Bath size={18} color="#20A68B" />} placeholder="Bathrooms" value={bathrooms} onChange={setBathrooms} keyboardType="numeric" textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // // // //         <InputBox icon={<UtensilsCrossed size={18} color="#20A68B" />} placeholder="Kitchen (Yes/No)" value={kitchen} onChange={setKitchen} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // // // //         <InputBox icon={<ClipboardList size={18} color="#20A68B" />} placeholder="Amenities" value={amenities} onChange={setAmenities} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // // // //         <InputBox icon={<Sofa size={18} color="#20A68B" />} placeholder="Interior Details" value={interior} onChange={setInterior} multiline height={80} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // // // //         <InputBox icon={<Wrench size={18} color="#20A68B" />} placeholder="Construction Details" value={construction} onChange={setConstruction} multiline height={80} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />

// // // // //         {/* Upload Images */}
// // // // //         <TouchableOpacity style={[styles.uploadBox, { borderColor }]} onPress={handleImagePick}>
// // // // //           <Upload size={20} color="#20A68B" />
// // // // //           <GlobalText semiBold style={[styles.uploadText, { color: "#20A68B" }]}>Upload Images</GlobalText>
// // // // //         </TouchableOpacity>

// // // // //         <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
// // // // //           {images.map((img, i) => (
// // // // //             <View key={i} style={{ position: "relative", margin: 5 }}>
// // // // //               <Image source={{ uri: img }} style={styles.uploaded} />
// // // // //               <TouchableOpacity style={styles.deleteBtn} onPress={() => removeImage(i)}>
// // // // //                 <Trash2 size={18} color="red" />
// // // // //               </TouchableOpacity>
// // // // //             </View>
// // // // //           ))}
// // // // //         </View>

// // // // //         {/* Submit */}
// // // // //         <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
// // // // //           <GlobalText bold style={styles.submitText}>
// // // // //             {editingProperty ? "Update Property" : "Add Property"}
// // // // //           </GlobalText>
// // // // //         </TouchableOpacity>
// // // // //       </ScrollView>

// // // // //       {/* Missing Fields Modal */}
// // // // //       <Modal visible={missingModalVisible} transparent animationType="fade">
// // // // //         <View style={styles.modalOverlay}>
// // // // //           <Animatable.View animation="zoomIn" duration={300} style={styles.modalBox}>
// // // // //             <AlertTriangle size={50} color="#FF6B6B" />
// // // // //             <GlobalText bold style={styles.modalTitle}>Missing Fields</GlobalText>
// // // // //             <GlobalText style={styles.modalSub}>Please fill the following fields:</GlobalText>
// // // // //             {missingFieldsList.map((field, idx) => (
// // // // //               <GlobalText key={idx} style={styles.modalList}>• {field}</GlobalText>
// // // // //             ))}
// // // // //             <TouchableOpacity
// // // // //               onPress={() => setMissingModalVisible(false)}
// // // // //               style={styles.modalBtn}
// // // // //             >
// // // // //               <GlobalText bold style={{ color: "#fff" }}>OK</GlobalText>
// // // // //             </TouchableOpacity>
// // // // //           </Animatable.View>
// // // // //         </View>
// // // // //       </Modal>
// // // // //     </SafeAreaView>
// // // // //   );
// // // // // }

// // // // // function InputBox({ icon, placeholder, value, onChange, keyboardType, multiline, height, textColor, placeholderColor, cardColor, borderColor }) {
// // // // //   return (
// // // // //     <View style={[styles.inputBox, { borderColor, backgroundColor: cardColor }]}>
// // // // //       <View style={styles.inputRow}>
// // // // //         {icon}
// // // // //         <TextInput
// // // // //           placeholder={placeholder}
// // // // //           placeholderTextColor={placeholderColor}
// // // // //           style={[styles.inputField, { height: height || 45, color: textColor }]}
// // // // //           value={value}
// // // // //           onChangeText={onChange}
// // // // //           keyboardType={keyboardType || "default"}
// // // // //           multiline={multiline}
// // // // //         />
// // // // //       </View>
// // // // //     </View>
// // // // //   );
// // // // // }

// // // // // const styles = StyleSheet.create({
// // // // //   safeArea: { flex: 1 },
// // // // //   headerContainer: { paddingVertical: 12, elevation: 6, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
// // // // //   header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16 },
// // // // //   headerTitle: { fontSize: 18, color: "#fff" },
// // // // //   label: { fontSize: 14, marginBottom: 6 },
// // // // //   inputBox: { borderWidth: 1, borderRadius: 10, marginBottom: 15, paddingHorizontal: 10 },
// // // // //   inputRow: { flexDirection: "row", alignItems: "center" },
// // // // //   inputField: { flex: 1, paddingHorizontal: 8, fontSize: 14 },
// // // // //   dropdownBox: { borderWidth: 1.5, borderRadius: 10, marginBottom: 15 },
// // // // //   dropdownList: { borderWidth: 1, borderRadius: 10 },
// // // // //   uploadBox: {
// // // // //     flexDirection: "row",
// // // // //     alignItems: "center",
// // // // //     justifyContent: "center",
// // // // //     borderWidth: 1,
// // // // //     borderRadius: 10,
// // // // //     height: 55,
// // // // //     marginBottom: 20,
// // // // //   },
// // // // //   uploadText: { marginLeft: 8, fontSize: 14 },
// // // // //   uploaded: { width: 100, height: 100, borderRadius: 10 },
// // // // //   deleteBtn: {
// // // // //     position: "absolute",
// // // // //     top: -6,
// // // // //     right: -6,
// // // // //     backgroundColor: "#fff",
// // // // //     borderRadius: 20,
// // // // //     padding: 2,
// // // // //   },
// // // // //   submitBtn: {
// // // // //     backgroundColor: "#20A68B",
// // // // //     borderRadius: 12,
// // // // //     paddingVertical: 15,
// // // // //     alignItems: "center",
// // // // //     marginTop: 10,
// // // // //   },
// // // // //   submitText: { color: "#fff", fontSize: 15 },
// // // // //   modalOverlay: {
// // // // //     flex: 1,
// // // // //     backgroundColor: "rgba(0,0,0,0.6)",
// // // // //     justifyContent: "center",
// // // // //     alignItems: "center",
// // // // //   },
// // // // //   modalBox: {
// // // // //     backgroundColor: "#fff",
// // // // //     width: "80%",
// // // // //     borderRadius: 16,
// // // // //     padding: 20,
// // // // //     alignItems: "center",
// // // // //   },
// // // // //   modalTitle: { fontSize: 18, marginTop: 10, color: "#222" },
// // // // //   modalSub: { fontSize: 13, color: "#555", marginVertical: 5 },
// // // // //   modalList: { color: "#333", marginTop: 3 },
// // // // //   modalBtn: {
// // // // //     backgroundColor: "#20A68B",
// // // // //     paddingHorizontal: 25,
// // // // //     paddingVertical: 8,
// // // // //     borderRadius: 10,
// // // // //     marginTop: 15,
// // // // //   },
// // // // // });

// // // // // // import React, { useState, useCallback } from "react";
// // // // // // import {
// // // // // //   View,
// // // // // //   TextInput,
// // // // // //   StyleSheet,
// // // // // //   ScrollView,
// // // // // //   TouchableOpacity,
// // // // // //   Image,
// // // // // //   Alert,
// // // // // //   useColorScheme,
// // // // // //   Modal,
// // // // // // } from "react-native";
// // // // // // import LinearGradient from "react-native-linear-gradient";
// // // // // // import { SafeAreaView } from "react-native-safe-area-context";
// // // // // // import { launchCamera, launchImageLibrary } from "react-native-image-picker";
// // // // // // import DropDownPicker from "react-native-dropdown-picker";
// // // // // // import AnimatedBackground from "../../components/ReusableComponents/AnimatedBackground";
// // // // // // import { addProperty, updateProperty } from "../../api/api";
// // // // // // import GlobalText from "../../theme/GlobalText";
// // // // // // import propertyTypes from "../../constants/propertyTypes";
// // // // // // import states from "../../constants/locations/state";
// // // // // // import districts from "../../constants/locations/districts";
// // // // // // import subDistricts from "../../constants/locations/subDistricts";
// // // // // // import * as Animatable from "react-native-animatable";
// // // // // // import {
// // // // // //   ArrowLeft,
// // // // // //   Upload,
// // // // // //   Trash2,
// // // // // //   Home,
// // // // // //   IndianRupee,
// // // // // //   Phone,
// // // // // //   MapPin, 
// // // // // //   Landmark,
// // // // // //   Ruler,
// // // // // //   Map,
// // // // // //   Bed,
// // // // // //   Bath,
// // // // // //   UtensilsCrossed,
// // // // // //   ClipboardList,
// // // // // //   Sofa,
// // // // // //   Wrench,
// // // // // // } from "lucide-react-native";
// // // // // // import { useTheme } from "@react-navigation/native";
// // // // // // import RNFS from "react-native-fs";

// // // // // // export default function AddPropertyScreen({ route, navigation }) {
// // // // // //   const editingProperty = route?.params?.property || null;
// // // // // //   const scheme = useColorScheme();
// // // // // //   const { colors } = useTheme();
// // // // // //   const isDark = scheme === "dark";

// // // // // //   // Error modal
// // // // // //   const [missingModalVisible, setMissingModalVisible] = useState(false);
// // // // // //   const [missingFieldsList, setMissingFieldsList] = useState([]);

// // // // // //   // Form Fields
// // // // // //   const [title, setTitle] = useState(editingProperty?.title || "");
// // // // // //   const [price, setPrice] = useState(editingProperty?.price?.toString() || "");
// // // // // //   const [contact, setContact] = useState(editingProperty?.contact?.toString() || "");
// // // // // //   const [location, setLocation] = useState(editingProperty?.location || "");
// // // // // //   const [mapLocation, setMapLocation] = useState(editingProperty?.mapLocation || "");
// // // // // //   const [landmark, setLandmark] = useState(editingProperty?.landmark || "");
// // // // // //   const [sqft, setSqft] = useState(editingProperty?.sqft?.toString() || "");
// // // // // //   const [bedrooms, setBedrooms] = useState(editingProperty?.bedrooms?.toString() || "1");
// // // // // //   const [bathrooms, setBathrooms] = useState(editingProperty?.bathrooms?.toString() || "1");
// // // // // //   const [kitchen, setKitchen] = useState(editingProperty?.kitchen || "Yes");
// // // // // //   const [amenities, setAmenities] = useState(editingProperty?.amenities || "");
// // // // // //   const [interior, setInterior] = useState(editingProperty?.interior || "");
// // // // // //   const [construction, setConstruction] = useState(editingProperty?.construction || "");
// // // // // //   const [images, setImages] = useState(editingProperty?.images || []);
// // // // // //   const [category, setCategory] = useState(editingProperty?.category || "House");

// // // // // //   // Location states
// // // // // //   const [state, setState] = useState(editingProperty?.state || "");
// // // // // //   const [district, setDistrict] = useState(editingProperty?.district || "");
// // // // // //   const [subDistrict, setSubDistrict] = useState(editingProperty?.subDistrict || "");

// // // // // //   // Dropdowns
// // // // // //   const [categoryOpen, setCategoryOpen] = useState(false);
// // // // // //   const [stateOpen, setStateOpen] = useState(false);
// // // // // //   const [districtOpen, setDistrictOpen] = useState(false);
// // // // // //   const [subDistrictOpen, setSubDistrictOpen] = useState(false);

// // // // // //   const stateItems = states.map((s) => ({ label: s, value: s }));
// // // // // //   const districtItems = useCallback(() => {
// // // // // //     return state ? (districts[state] || []).map((d) => ({ label: d, value: d })) : [];
// // // // // //   }, [state]);
// // // // // //   const subDistrictItems = useCallback(() => {
// // // // // //     return district ? (subDistricts[district] || []).map((sd) => ({ label: sd, value: sd })) : [];
// // // // // //   }, [district]);
// // // // // //   const categoryItems = propertyTypes.map((c) => ({ label: c.name, value: c.name }));

// // // // // //   // 🖼️ Image Picker
// // // // // //   const handleImagePick = () =>
// // // // // //     Alert.alert("Upload Image", "Choose an option", [
// // // // // //       {
// // // // // //         text: "Camera",
// // // // // //         onPress: () =>
// // // // // //           launchCamera({ mediaType: "photo", includeBase64: false }, async (res) => {
// // // // // //             if (res.assets) {
// // // // // //               const asset = res.assets[0];
// // // // // //               const base64Data = await RNFS.readFile(asset.uri, "base64");
// // // // // //               setImages([...images, `data:${asset.type};base64,${base64Data}`]);
// // // // // //             }
// // // // // //           }),
// // // // // //       },
// // // // // //       {
// // // // // //         text: "Gallery",
// // // // // //         onPress: () =>
// // // // // //           launchImageLibrary(
// // // // // //             { mediaType: "photo", selectionLimit: 5, includeBase64: false },
// // // // // //             async (res) => {
// // // // // //               if (res.assets) {
// // // // // //                 const newImages = [];
// // // // // //                 for (let asset of res.assets) {
// // // // // //                   const base64Data = await RNFS.readFile(asset.uri, "base64");
// // // // // //                   newImages.push(`data:${asset.type};base64,${base64Data}`);
// // // // // //                 }
// // // // // //                 setImages([...images, ...newImages]);
// // // // // //               }
// // // // // //             }
// // // // // //           ),
// // // // // //       },
// // // // // //       { text: "Cancel", style: "cancel" },
// // // // // //     ]);

// // // // // //   const removeImage = (i) => {
// // // // // //     const updated = [...images];
// // // // // //     updated.splice(i, 1);
// // // // // //     setImages(updated);
// // // // // //   };

// // // // // //   // ✅ Submit
// // // // // //   const handleSubmit = async () => {
// // // // // //     try {
// // // // // //       const requiredFields = {
// // // // // //         Title: title,
// // // // // //         Price: price,
// // // // // //         Contact: contact,
// // // // // //         Address: location,
// // // // // //         State: state,
// // // // // //         District: district,
// // // // // //         Category: category,
// // // // // //       };
// // // // // //       console.log("Required Fields:", requiredFields);

// // // // // //       const missing = Object.entries(requiredFields)
// // // // // //         .filter(([_, v]) => !v || v.trim() === "")
// // // // // //         .map(([k]) => k);

// // // // // //       if (missing.length > 0) {
// // // // // //         setMissingFieldsList(missing);
// // // // // //         setMissingModalVisible(true);
// // // // // //         return;
// // // // // //       }

// // // // // //       const payload = {
// // // // // //         title,
// // // // // //         price,
// // // // // //         contact: Number(contact),
// // // // // //         location,
// // // // // //         mapLocation,
// // // // // //         district,
// // // // // //         subDistrict,
// // // // // //         state,
// // // // // //         landmark,
// // // // // //         sqft,
// // // // // //         bedrooms,
// // // // // //         bathrooms,
// // // // // //         kitchen,
// // // // // //         amenities,
// // // // // //         interior,
// // // // // //         construction,
// // // // // //         images,
// // // // // //         category,
// // // // // //       };
// // // // // //       console.log("Payload:", payload);

// // // // // //       if (editingProperty) {
// // // // // //         await updateProperty(editingProperty._id, payload);
// // // // // //         Alert.alert("Success", "Property updated successfully!");
// // // // // //       } else {
// // // // // //         await addProperty(payload);
// // // // // //         Alert.alert("Success", "Property added successfully!");
// // // // // //       }

// // // // // //       navigation.reset({
// // // // // //         index: 0,
// // // // // //         routes: [{ name: "Success" }],
// // // // // //       });
// // // // // //     } catch (err) {
// // // // // //       console.error("Save Error:", err.response?.data || err.message);
// // // // // //       Alert.alert("Error", "Failed to save property");
// // // // // //     }
// // // // // //   };

// // // // // //   const backgroundColor = isDark ? "#121212" : "#f9f9f9";
// // // // // //   const cardColor = isDark ? "#1E1E1E" : "#fff";
// // // // // //   const textColor = isDark ? "#EDEDED" : "#000";
// // // // // //   const placeholderColor = isDark ? "#888" : "#666";
// // // // // //   const borderColor = isDark ? "#333" : "#20A68B";

// // // // // //   return (
// // // // // //     <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
// // // // // //       <AnimatedBackground />

// // // // // //       {/* Header */}
// // // // // //       <LinearGradient
// // // // // //         colors={isDark ? ["#114D44", "#0D3732"] : ["#43C6AC", "#20A68B"]}
// // // // // //         style={styles.headerContainer}
// // // // // //       >
// // // // // //         <View style={styles.header}>
// // // // // //           <TouchableOpacity onPress={() => navigation.goBack()}>
// // // // // //             <ArrowLeft size={24} color="#fff" />
// // // // // //           </TouchableOpacity>
// // // // // //           <GlobalText bold style={styles.headerTitle}>
// // // // // //             {editingProperty ? "Edit Property" : "Add Property"}
// // // // // //           </GlobalText>
// // // // // //           <View style={{ width: 24 }} />
// // // // // //         </View>
// // // // // //       </LinearGradient>

// // // // // //       {/* Form */}
// // // // // //       <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
// // // // // //         {/* Category */}
// // // // // //         <GlobalText medium style={[styles.label, { color: textColor }]}>
// // // // // //           Category
// // // // // //         </GlobalText>
// // // // // //         <DropDownPicker
// // // // // //           open={categoryOpen}
// // // // // //           value={category}
// // // // // //           items={categoryItems}
// // // // // //           setOpen={setCategoryOpen}
// // // // // //           setValue={setCategory}
// // // // // //           placeholder="-- Select Category --"
// // // // // //           style={[styles.dropdownBox, { borderColor, backgroundColor: cardColor }]}
// // // // // //           dropDownContainerStyle={[styles.dropdownList, { backgroundColor: cardColor, borderColor }]}
// // // // // //           zIndex={4000}
// // // // // //           zIndexInverse={1000}
// // // // // //           listMode="SCROLLVIEW"
// // // // // //         />

// // // // // //         {/* Input Fields */}
// // // // // //         <InputBox icon={<Home size={18} color="#20A68B" />} placeholder="Property Title" value={title} onChange={setTitle} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // // // // //         <InputBox icon={<IndianRupee size={18} color="#20A68B" />} placeholder="Price" value={price} onChange={setPrice} keyboardType="numeric" textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // // // // //         <InputBox icon={<Phone size={18} color="#20A68B" />} placeholder="Contact Number" value={contact} onChange={setContact} keyboardType="phone-pad" textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // // // // //         <InputBox icon={<MapPin size={18} color="#20A68B" />} placeholder="Address" value={location} onChange={setLocation} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />

// // // // // //         {/* State Dropdown */}
// // // // // //         <GlobalText medium style={[styles.label, { color: textColor }]}>State</GlobalText>
// // // // // //         <DropDownPicker
// // // // // //           open={stateOpen}
// // // // // //           value={state}
// // // // // //           items={stateItems}
// // // // // //           setOpen={setStateOpen}
// // // // // //           setValue={(callback) => {
// // // // // //             const selected = typeof callback === "function" ? callback(state) : callback;
// // // // // //             setState(selected);
// // // // // //             setDistrict("");
// // // // // //             setSubDistrict("");
// // // // // //           }}
// // // // // //           placeholder="-- Select State --"
// // // // // //           style={[styles.dropdownBox, { borderColor, backgroundColor: cardColor }]}
// // // // // //           dropDownContainerStyle={[styles.dropdownList, { backgroundColor: cardColor, borderColor }]}
// // // // // //           zIndex={3000}
// // // // // //           zIndexInverse={2000}
// // // // // //         />

// // // // // //         {/* District Dropdown */}
// // // // // //         <GlobalText medium style={[styles.label, { color: textColor }]}>District</GlobalText>
// // // // // //         <DropDownPicker
// // // // // //           open={districtOpen}
// // // // // //           value={district}
// // // // // //           items={districtItems()}
// // // // // //           setOpen={setDistrictOpen}
// // // // // //           setValue={setDistrict}
// // // // // //           placeholder="-- Select District --"
// // // // // //           style={[styles.dropdownBox, { borderColor, backgroundColor: cardColor }]}
// // // // // //           dropDownContainerStyle={[styles.dropdownList, { backgroundColor: cardColor, borderColor }]}
// // // // // //           zIndex={2000}
// // // // // //           zIndexInverse={3000}
// // // // // //           disabled={!state}
// // // // // //         />

// // // // // //         {/* SubDistrict */}
// // // // // //         <GlobalText medium style={[styles.label, { color: textColor }]}>Sub-District</GlobalText>
// // // // // //         <DropDownPicker
// // // // // //           open={subDistrictOpen}
// // // // // //           value={subDistrict}
// // // // // //           items={subDistrictItems()}
// // // // // //           setOpen={setSubDistrictOpen}
// // // // // //           setValue={setSubDistrict}
// // // // // //           placeholder="-- Select Sub-District --"
// // // // // //           style={[styles.dropdownBox, { borderColor, backgroundColor: cardColor }]}
// // // // // //           dropDownContainerStyle={[styles.dropdownList, { backgroundColor: cardColor, borderColor }]}
// // // // // //           zIndex={1000}
// // // // // //           zIndexInverse={4000}
// // // // // //           disabled={!district}
// // // // // //         />

// // // // // //         {/* Remaining Fields */}
// // // // // //         <InputBox icon={<Landmark size={18} color="#20A68B" />} placeholder="Nearby Landmark" value={landmark} onChange={setLandmark} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // // // // //         <InputBox icon={<Ruler size={18} color="#20A68B" />} placeholder="Property Size in Sqft" value={sqft} onChange={setSqft} keyboardType="numeric" textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // // // // //         <InputBox icon={<Map size={18} color="#20A68B" />} placeholder="Google Maps Link" value={mapLocation} onChange={setMapLocation} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // // // // //         <InputBox icon={<Bed size={18} color="#20A68B" />} placeholder="Bedrooms" value={bedrooms} onChange={setBedrooms} keyboardType="numeric" textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // // // // //         <InputBox icon={<Bath size={18} color="#20A68B" />} placeholder="Bathrooms" value={bathrooms} onChange={setBathrooms} keyboardType="numeric" textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // // // // //         <InputBox icon={<UtensilsCrossed size={18} color="#20A68B" />} placeholder="Kitchen (Yes/No)" value={kitchen} onChange={setKitchen} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // // // // //         <InputBox icon={<ClipboardList size={18} color="#20A68B" />} placeholder="Amenities" value={amenities} onChange={setAmenities} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // // // // //         <InputBox icon={<Sofa size={18} color="#20A68B" />} placeholder="Interior Details" value={interior} onChange={setInterior} multiline height={80} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // // // // //         <InputBox icon={<Wrench size={18} color="#20A68B" />} placeholder="Construction Details" value={construction} onChange={setConstruction} multiline height={80} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />

// // // // // //         {/* Upload */}
// // // // // //         <TouchableOpacity style={[styles.uploadBox, { borderColor }]} onPress={handleImagePick}>
// // // // // //           <Upload size={20} color="#20A68B" />
// // // // // //           <GlobalText semiBold style={[styles.uploadText, { color: "#20A68B" }]}>Upload Images</GlobalText>
// // // // // //         </TouchableOpacity>

// // // // // //         <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
// // // // // //           {images.map((img, i) => (
// // // // // //             <View key={i} style={{ position: "relative", margin: 5 }}>
// // // // // //               <Image source={{ uri: img }} style={styles.uploaded} />
// // // // // //               <TouchableOpacity style={styles.deleteBtn} onPress={() => removeImage(i)}>
// // // // // //                 <Trash2 size={18} color="red" />
// // // // // //               </TouchableOpacity>
// // // // // //             </View>
// // // // // //           ))}
// // // // // //         </View>

// // // // // //         {/* Submit */}
// // // // // //         <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
// // // // // //           <GlobalText bold style={styles.submitText}>
// // // // // //             {editingProperty ? "Update Property" : "Add Property"}
// // // // // //           </GlobalText>
// // // // // //         </TouchableOpacity>
// // // // // //       </ScrollView>
// // // // // //     </SafeAreaView>
// // // // // //   );
// // // // // // }

// // // // // // function InputBox({ icon, placeholder, value, onChange, keyboardType, multiline, height, textColor, placeholderColor, cardColor, borderColor }) {
// // // // // //   return (
// // // // // //     <View style={[styles.inputBox, { borderColor, backgroundColor: cardColor }]}>
// // // // // //       <View style={styles.inputRow}>
// // // // // //         {icon}
// // // // // //         <TextInput
// // // // // //           placeholder={placeholder}
// // // // // //           placeholderTextColor={placeholderColor}
// // // // // //           style={[styles.inputField, { height: height || 45, color: textColor }]}
// // // // // //           value={value}
// // // // // //           onChangeText={onChange}
// // // // // //           keyboardType={keyboardType || "default"}
// // // // // //           multiline={multiline}
// // // // // //         />
// // // // // //       </View>
// // // // // //     </View>
// // // // // //   );
// // // // // // }

// // // // // // const styles = StyleSheet.create({
// // // // // //   safeArea: { flex: 1 },
// // // // // //   headerContainer: { paddingVertical: 12, elevation: 6, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
// // // // // //   header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16 },
// // // // // //   headerTitle: { fontSize: 18, color: "#fff" },
// // // // // //   label: { fontSize: 14, marginBottom: 6 },
// // // // // //   inputBox: { borderWidth: 1, borderRadius: 10, marginBottom: 15, paddingHorizontal: 10 },
// // // // // //   inputRow: { flexDirection: "row", alignItems: "center" },
// // // // // //   inputField: { flex: 1, paddingHorizontal: 8, fontSize: 14 },
// // // // // //   dropdownBox: { borderWidth: 1.5, borderRadius: 10, marginBottom: 15 },
// // // // // //   dropdownList: {
// // // // // //     borderWidth: 1,
// // // // // //     borderRadius: 10,
// // // // // //   },
// // // // // //   uploadBox: {
// // // // // //     flexDirection: "row",
// // // // // //     alignItems: "center",
// // // // // //     justifyContent: "center",
// // // // // //     borderWidth: 1,
// // // // // //     borderRadius: 10,
// // // // // //     height: 55,
// // // // // //     marginBottom: 20,
// // // // // //   },
// // // // // //   uploadText: { marginLeft: 8, fontSize: 14 },
// // // // // //   uploaded: { width: 100, height: 100, borderRadius: 10 },
// // // // // //   deleteBtn: {
// // // // // //     position: "absolute",
// // // // // //     top: -6,
// // // // // //     right: -6,
// // // // // //     backgroundColor: "#fff",
// // // // // //     borderRadius: 20,
// // // // // //     padding: 2,
// // // // // //   },
// // // // // //   submitBtn: {
// // // // // //     backgroundColor: "#20A68B",
// // // // // //     borderRadius: 12,
// // // // // //     paddingVertical: 15,
// // // // // //     alignItems: "center",
// // // // // //     marginTop: 10,
// // // // // //   },
// // // // // //   submitText: { color: "#fff", fontSize: 15 },
// // // // // // });

// // // // // // // import React, { useState } from "react";
// // // // // // // import {
// // // // // // //   View,
// // // // // // //   TextInput,
// // // // // // //   StyleSheet,
// // // // // // //   ScrollView,
// // // // // // //   TouchableOpacity,
// // // // // // //   Image,
// // // // // // //   Alert,
// // // // // // //   useColorScheme,
// // // // // // //   Modal,
// // // // // // // } from "react-native";
// // // // // // // import LinearGradient from "react-native-linear-gradient";
// // // // // // // import { SafeAreaView } from "react-native-safe-area-context";
// // // // // // // import { launchCamera, launchImageLibrary } from "react-native-image-picker";
// // // // // // // import DropDownPicker from "react-native-dropdown-picker";
// // // // // // // import AnimatedBackground from "../../components/ReusableComponents/AnimatedBackground";
// // // // // // // import { addProperty, updateProperty } from "../../api/api";
// // // // // // // import GlobalText from "../../theme/GlobalText";
// // // // // // // import propertyTypes from "../../constants/propertyTypes";
// // // // // // // import states from "../../constants/locations/state";
// // // // // // // import districts from "../../constants/locations/districts";
// // // // // // // import subDistricts from "../../constants/locations/subDistricts";
// // // // // // // import * as Animatable from "react-native-animatable";
// // // // // // // import {
// // // // // // //   ArrowLeft,
// // // // // // //   Upload,
// // // // // // //   Trash2,
// // // // // // //   Home,
// // // // // // //   IndianRupee,
// // // // // // //   Phone,
// // // // // // //   MapPin,
// // // // // // //   Landmark,
// // // // // // //   Ruler,
// // // // // // //   Map,
// // // // // // //   Bed,
// // // // // // //   Bath,
// // // // // // //   UtensilsCrossed,
// // // // // // //   ClipboardList,
// // // // // // //   Sofa,
// // // // // // //   Wrench,
// // // // // // // } from "lucide-react-native";
// // // // // // // import { useTheme } from "@react-navigation/native";
// // // // // // // import RNFS from "react-native-fs"; // ✅ for Base64 conversion

// // // // // // // export default function AddPropertyScreen({ route, navigation }) {
// // // // // // //   const editingProperty = route?.params?.property || null;
// // // // // // //   const scheme = useColorScheme();
// // // // // // //   const { colors } = useTheme();
// // // // // // //   const isDark = scheme === "dark";
// // // // // // //   const [missingModalVisible, setMissingModalVisible] = useState(false);
// // // // // // //   const [missingFieldsList, setMissingFieldsList] = useState([]);

// // // // // // //   // 🧱 Form fields
// // // // // // //   const [title, setTitle] = useState(editingProperty?.title || "");
// // // // // // //   const [price, setPrice] = useState(editingProperty?.price?.toString() || "");
// // // // // // //   const [contact, setContact] = useState(editingProperty?.contact?.toString() || "");
// // // // // // //   const [location, setLocation] = useState(editingProperty?.location || "");
// // // // // // //   const [mapLocation, setMapLocation] = useState(editingProperty?.mapLocation || "");
// // // // // // //   const [landmark, setLandmark] = useState(editingProperty?.landmark || "");
// // // // // // //   const [sqft, setSqft] = useState(editingProperty?.sqft?.toString() || "");
// // // // // // //   const [bedrooms, setBedrooms] = useState(editingProperty?.bedrooms?.toString() || "1");
// // // // // // //   const [bathrooms, setBathrooms] = useState(editingProperty?.bathrooms?.toString() || "1");
// // // // // // //   const [kitchen, setKitchen] = useState(editingProperty?.kitchen || "Yes");
// // // // // // //   const [amenities, setAmenities] = useState(editingProperty?.amenities || "");
// // // // // // //   const [interior, setInterior] = useState(editingProperty?.interior || "");
// // // // // // //   const [construction, setConstruction] = useState(editingProperty?.construction || "");
// // // // // // //   const [images, setImages] = useState(editingProperty?.images || []);
// // // // // // //   const [category, setCategory] = useState(editingProperty?.category || "House");

// // // // // // //   // 🏛️ Location states
// // // // // // //   const [state, setState] = useState(editingProperty?.state || "");
// // // // // // //   const [district, setDistrict] = useState(editingProperty?.district || "");
// // // // // // //   const [subDistrict, setSubDistrict] = useState(editingProperty?.subDistrict || "");

// // // // // // //   // Dropdown open states
// // // // // // //   const [stateOpen, setStateOpen] = useState(false);
// // // // // // //   const [districtOpen, setDistrictOpen] = useState(false);
// // // // // // //   const [subDistrictOpen, setSubDistrictOpen] = useState(false);
// // // // // // //   const [categoryOpen, setCategoryOpen] = useState(false);

// // // // // // //   // Dropdown data
// // // // // // //   const stateItems = states.map((s) => ({ label: s, value: s }));
// // // // // // //   const districtItems = state ? (districts[state] || []).map((d) => ({ label: d, value: d })) : [];
// // // // // // //   const subDistrictItems = district ? (subDistricts[district] || []).map((sd) => ({ label: sd, value: sd })) : [];
// // // // // // //   const categoryItems = propertyTypes.map((c) => ({ label: c.name, value: c.name }));

// // // // // // //   // 🖼️ Image Picker + Base64 conversion
// // // // // // //   const handleImagePick = () =>
// // // // // // //     Alert.alert("Upload Image", "Choose an option", [
// // // // // // //       {
// // // // // // //         text: "Camera",
// // // // // // //         onPress: () =>
// // // // // // //           launchCamera({ mediaType: "photo", includeBase64: false }, async (res) => {
// // // // // // //             if (res.assets) {
// // // // // // //               const asset = res.assets[0];
// // // // // // //               const base64Data = await RNFS.readFile(asset.uri, "base64");
// // // // // // //               setImages([...images, `data:${asset.type};base64,${base64Data}`]);
// // // // // // //             }
// // // // // // //           }),
// // // // // // //       },
// // // // // // //       {
// // // // // // //         text: "Gallery",
// // // // // // //         onPress: () =>
// // // // // // //           launchImageLibrary({ mediaType: "photo", selectionLimit: 5, includeBase64: false }, async (res) => {
// // // // // // //             if (res.assets) {
// // // // // // //               const newImages = [];
// // // // // // //               for (let asset of res.assets) {
// // // // // // //                 const base64Data = await RNFS.readFile(asset.uri, "base64");
// // // // // // //                 newImages.push(`data:${asset.type};base64,${base64Data}`);
// // // // // // //               }
// // // // // // //               setImages([...images, ...newImages]);
// // // // // // //             }
// // // // // // //           }),
// // // // // // //       },
// // // // // // //       { text: "Cancel", style: "cancel" },
// // // // // // //     ]);

// // // // // // //   const removeImage = (index) => {
// // // // // // //     const updated = [...images];
// // // // // // //     updated.splice(index, 1);
// // // // // // //     setImages(updated);
// // // // // // //   };

// // // // // // //   // ✅ Submit handler
// // // // // // //   const handleSubmit = async () => {
// // // // // // //     try {
// // // // // // //       const requiredFields = {
// // // // // // //         Title: title,
// // // // // // //         Price: price,
// // // // // // //         "Contact Number": contact,
// // // // // // //         Address: location,
// // // // // // //         State: state,
// // // // // // //         District: district,
// // // // // // //         Category: category,
// // // // // // //       };

// // // // // // //       const missingFields = Object.entries(requiredFields)
// // // // // // //         .filter(([_, value]) => !value || value.trim() === "")
// // // // // // //         .map(([key]) => key);

// // // // // // //       if (missingFields.length > 0) {
// // // // // // //         setMissingFieldsList(missingFields);
// // // // // // //         setMissingModalVisible(true);
// // // // // // //         return;
// // // // // // //       }

// // // // // // //       const propertyPayload = {
// // // // // // //         title,
// // // // // // //         price,
// // // // // // //         contact: Number(contact),
// // // // // // //         location,
// // // // // // //         mapLocation,
// // // // // // //         district,
// // // // // // //         subDistrict,
// // // // // // //         state,
// // // // // // //         landmark,
// // // // // // //         sqft,
// // // // // // //         bedrooms,
// // // // // // //         bathrooms,
// // // // // // //         kitchen,
// // // // // // //         amenities,
// // // // // // //         interior,
// // // // // // //         construction,
// // // // // // //         images, // ✅ already Base64
// // // // // // //         category,
// // // // // // //       };

// // // // // // //       let res;
// // // // // // //       if (editingProperty) {
// // // // // // //         res = await updateProperty(editingProperty._id, propertyPayload);
// // // // // // //         Alert.alert("Success", "Property updated successfully!");
// // // // // // //       } else {
// // // // // // //         res = await addProperty(propertyPayload);
// // // // // // //         Alert.alert("Success", "Property added successfully!");
// // // // // // //       }

// // // // // // //       navigation.reset({
// // // // // // //         index: 0,
// // // // // // //         routes: [{ name: "Success" }],
// // // // // // //       });
// // // // // // //     } catch (err) {
// // // // // // //       console.error("Property save error:", err.response?.data || err.message);
// // // // // // //       Alert.alert("Error", err.response?.data?.error || "Failed to save property");
// // // // // // //     }
// // // // // // //   };

// // // // // // //   // Theme-dependent colors
// // // // // // //   const backgroundColor = isDark ? "#121212" : "#f9f9f9";
// // // // // // //   const cardColor = isDark ? "#1E1E1E" : "#fff";
// // // // // // //   const textColor = isDark ? "#EDEDED" : "#000";
// // // // // // //   const placeholderColor = isDark ? "#888" : "#666";
// // // // // // //   const borderColor = isDark ? "#333" : "#20A68B";

// // // // // // //   return (
// // // // // // //     <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
// // // // // // //       <AnimatedBackground />

// // // // // // //       {/* 🔹 Header */}
// // // // // // //       <LinearGradient
// // // // // // //         colors={isDark ? ["#114D44", "#0D3732"] : ["#43C6AC", "#20A68B"]}
// // // // // // //         style={styles.headerContainer}
// // // // // // //       >
// // // // // // //         <View style={styles.header}>
// // // // // // //           <TouchableOpacity onPress={() => navigation.goBack()}>
// // // // // // //             <ArrowLeft size={24} color="#fff" />
// // // // // // //           </TouchableOpacity>
// // // // // // //           <GlobalText bold style={styles.headerTitle}>
// // // // // // //             {editingProperty ? "Edit Property" : "Add Property"}
// // // // // // //           </GlobalText>
// // // // // // //           <View style={{ width: 24 }} />
// // // // // // //         </View>
// // // // // // //       </LinearGradient>

// // // // // // //       {/* 🔹 Form */}
// // // // // // //       <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
// // // // // // //         <GlobalText medium style={[styles.label, { color: textColor }]}>
// // // // // // //           Category
// // // // // // //         </GlobalText>
// // // // // // //         <DropDownPicker
// // // // // // //           open={categoryOpen}
// // // // // // //           value={category}
// // // // // // //           items={categoryItems}
// // // // // // //           setOpen={setCategoryOpen}
// // // // // // //           setValue={setCategory}
// // // // // // //           placeholder="-- Select Category --"
// // // // // // //           style={[styles.dropdownBox, { borderColor, backgroundColor: cardColor }]}
// // // // // // //           dropDownContainerStyle={[
// // // // // // //             styles.dropdownList,
// // // // // // //             { backgroundColor: cardColor, borderColor },
// // // // // // //           ]}
// // // // // // //           zIndex={4000}
// // // // // // //           listMode="SCROLLVIEW"
// // // // // // //         />

// // // // // // //         {/* Inputs */}
// // // // // // //         <InputBox icon={<Home size={18} color="#20A68B" />} placeholder="Property Title" value={title} onChange={setTitle} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // // // // // //         <InputBox icon={<IndianRupee size={18} color="#20A68B" />} placeholder="Price" value={price} onChange={setPrice} keyboardType="numeric" textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // // // // // //         <InputBox icon={<Phone size={18} color="#20A68B" />} placeholder="Contact Number" value={contact} onChange={setContact} keyboardType="phone-pad" textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // // // // // //         <InputBox icon={<MapPin size={18} color="#20A68B" />} placeholder="Address" value={location} onChange={setLocation} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />

// // // // // // //         {/* State dropdowns */}
// // // // // // //         <GlobalText medium style={[styles.label, { color: textColor }]}>State</GlobalText>
// // // // // // //         <DropDownPicker
// // // // // // //           open={stateOpen}
// // // // // // //           value={state}
// // // // // // //           items={stateItems}
// // // // // // //           setOpen={setStateOpen}
// // // // // // //           setValue={setState}
// // // // // // //           placeholder="-- Select State --"
// // // // // // //           style={[styles.dropdownBox, { borderColor, backgroundColor: cardColor }]}
// // // // // // //           dropDownContainerStyle={[styles.dropdownList, { backgroundColor: cardColor, borderColor }]}
// // // // // // //           zIndex={3000}
// // // // // // //           listMode="SCROLLVIEW"
// // // // // // //           onChangeValue={(v) => {
// // // // // // //             setState(v);
// // // // // // //             setDistrict("");
// // // // // // //             setSubDistrict("");
// // // // // // //           }}
// // // // // // //         />
// // // // // // //         <GlobalText medium style={[styles.label, { color: textColor }]}>District</GlobalText>
// // // // // // //         <DropDownPicker
// // // // // // //           open={districtOpen}
// // // // // // //           value={district}
// // // // // // //           items={districtItems}
// // // // // // //           setOpen={setDistrictOpen}
// // // // // // //           setValue={setDistrict}
// // // // // // //           placeholder="-- Select District --"
// // // // // // //           style={[styles.dropdownBox, { borderColor, backgroundColor: cardColor }]}
// // // // // // //           dropDownContainerStyle={[styles.dropdownList, { backgroundColor: cardColor, borderColor }]}
// // // // // // //           zIndex={2000}
// // // // // // //           listMode="SCROLLVIEW"
// // // // // // //           disabled={!state}
// // // // // // //         />
// // // // // // //         <GlobalText medium style={[styles.label, { color: textColor }]}>Sub-District</GlobalText>
// // // // // // //         <DropDownPicker
// // // // // // //           open={subDistrictOpen}
// // // // // // //           value={subDistrict}
// // // // // // //           items={subDistrictItems}
// // // // // // //           setOpen={setSubDistrictOpen}
// // // // // // //           setValue={setSubDistrict}
// // // // // // //           placeholder="-- Select Sub-District --"
// // // // // // //           style={[styles.dropdownBox, { borderColor, backgroundColor: cardColor }]}
// // // // // // //           dropDownContainerStyle={[styles.dropdownList, { backgroundColor: cardColor, borderColor }]}
// // // // // // //           zIndex={1000}
// // // // // // //           listMode="SCROLLVIEW"
// // // // // // //           disabled={!district}
// // // // // // //         />

// // // // // // //         {/* Remaining fields */}
// // // // // // //         <InputBox icon={<Landmark size={18} color="#20A68B" />} placeholder="Nearby Landmark" value={landmark} onChange={setLandmark} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // // // // // //         <InputBox icon={<Ruler size={18} color="#20A68B" />} placeholder="Property Size in Sqft" value={sqft} onChange={setSqft} keyboardType="numeric" textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // // // // // //         <InputBox icon={<Map size={18} color="#20A68B" />} placeholder="Google Maps Link" value={mapLocation} onChange={setMapLocation} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // // // // // //         <InputBox icon={<Bed size={18} color="#20A68B" />} placeholder="Bedrooms" value={bedrooms} onChange={setBedrooms} keyboardType="numeric" textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // // // // // //         <InputBox icon={<Bath size={18} color="#20A68B" />} placeholder="Bathrooms" value={bathrooms} onChange={setBathrooms} keyboardType="numeric" textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // // // // // //         <InputBox icon={<UtensilsCrossed size={18} color="#20A68B" />} placeholder="Kitchen (Yes/No)" value={kitchen} onChange={setKitchen} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // // // // // //         <InputBox icon={<ClipboardList size={18} color="#20A68B" />} placeholder="Amenities" value={amenities} onChange={setAmenities} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // // // // // //         <InputBox icon={<Sofa size={18} color="#20A68B" />} placeholder="Interior Details" value={interior} onChange={setInterior} multiline height={80} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />
// // // // // // //         <InputBox icon={<Wrench size={18} color="#20A68B" />} placeholder="Construction Details" value={construction} onChange={setConstruction} multiline height={80} textColor={textColor} placeholderColor={placeholderColor} cardColor={cardColor} borderColor={borderColor} />

// // // // // // //         {/* Missing Fields Modal */}
// // // // // // //         <Modal transparent visible={missingModalVisible} animationType="fade" onRequestClose={() => setMissingModalVisible(false)}>
// // // // // // //           <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}>
// // // // // // //             <Animatable.View animation="zoomIn" duration={400} easing="ease-out" style={[{ width: "80%", borderRadius: 16, padding: 20, alignItems: "center", elevation: 8 }, { backgroundColor: isDark ? "#1E1E1E" : "#fff" }]}>
// // // // // // //               <GlobalText bold style={{ fontSize: 17, color: isDark ? "#fff" : "#333" }}>Missing Fields</GlobalText>
// // // // // // //               <View style={{ marginVertical: 10, alignSelf: "stretch", backgroundColor: isDark ? "#2A2A2A" : "#F4F4F4", borderRadius: 8, padding: 10 }}>
// // // // // // //                 {missingFieldsList.map((field, idx) => (
// // // // // // //                   <GlobalText key={idx} style={{ fontSize: 14, color: isDark ? "#EAEAEA" : "#444", marginBottom: 4 }}>• {field}</GlobalText>
// // // // // // //                 ))}
// // // // // // //               </View>
// // // // // // //               <GlobalText style={{ fontSize: 13, color: isDark ? "#B0B0B0" : "#666", textAlign: "center", marginBottom: 15 }}>
// // // // // // //                 📝 Note: Title, Price, Contact, Address, State, District, and Category are mandatory fields.
// // // // // // //               </GlobalText>
// // // // // // //               <TouchableOpacity activeOpacity={0.9} onPress={() => setMissingModalVisible(false)}>
// // // // // // //                 <LinearGradient colors={["#43C6AC", "#20A68B"]} style={{ borderRadius: 12, paddingVertical: 10, paddingHorizontal: 30, elevation: 3 }}>
// // // // // // //                   <GlobalText bold style={{ color: "#fff", fontSize: 15 }}>OK</GlobalText>
// // // // // // //                 </LinearGradient>
// // // // // // //               </TouchableOpacity>
// // // // // // //             </Animatable.View>
// // // // // // //           </View>
// // // // // // //         </Modal>

// // // // // // //         {/* 🖼️ Upload */}
// // // // // // //         <TouchableOpacity style={[styles.uploadBox, { borderColor }]} onPress={handleImagePick}>
// // // // // // //           <Upload size={20} color="#20A68B" />
// // // // // // //           <GlobalText semiBold style={[styles.uploadText, { color: "#20A68B" }]}>Upload Images</GlobalText>
// // // // // // //         </TouchableOpacity>

// // // // // // //         <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
// // // // // // //           {images.map((img, i) => (
// // // // // // //             <View key={i} style={{ position: "relative", margin: 5 }}>
// // // // // // //               <Image source={{ uri: img }} style={styles.uploaded} />
// // // // // // //               <TouchableOpacity style={styles.deleteBtn} onPress={() => removeImage(i)}>
// // // // // // //                 <Trash2 size={18} color="red" />
// // // // // // //               </TouchableOpacity>
// // // // // // //             </View>
// // // // // // //           ))}
// // // // // // //         </View>

// // // // // // //         {/* ✅ Submit */}
// // // // // // //         <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
// // // // // // //           <GlobalText bold style={styles.submitText}>
// // // // // // //             {editingProperty ? "Update Property" : "Add Property"}
// // // // // // //           </GlobalText>
// // // // // // //         </TouchableOpacity>
// // // // // // //       </ScrollView>
// // // // // // //     </SafeAreaView>
// // // // // // //   );
// // // // // // // }

// // // // // // // // 🧱 Reusable InputBox
// // // // // // // function InputBox({ icon, placeholder, value, onChange, keyboardType, multiline, height, textColor, placeholderColor, cardColor, borderColor }) {
// // // // // // //   return (
// // // // // // //     <View style={[styles.inputBox, { borderColor, backgroundColor: cardColor }]}>
// // // // // // //       <View style={styles.inputRow}>
// // // // // // //         {icon}
// // // // // // //         <TextInput
// // // // // // //           placeholder={placeholder}
// // // // // // //           placeholderTextColor={placeholderColor}
// // // // // // //           style={[styles.inputField, { height: height || 45, color: textColor }]}
// // // // // // //           value={value}
// // // // // // //           onChangeText={onChange}
// // // // // // //           keyboardType={keyboardType || "default"}
// // // // // // //           multiline={multiline}
// // // // // // //         />
// // // // // // //       </View>
// // // // // // //     </View>
// // // // // // //   );
// // // // // // // }

// // // // // // // // 🎨 Styles
// // // // // // // const styles = StyleSheet.create({
// // // // // // //   safeArea: { flex: 1 },
// // // // // // //   headerContainer: {
// // // // // // //     paddingVertical: 12,
// // // // // // //     elevation: 6,
// // // // // // //     borderBottomLeftRadius: 20,
// // // // // // //     borderBottomRightRadius: 20,
// // // // // // //   },
// // // // // // //   header: {
// // // // // // //     flexDirection: "row",
// // // // // // //     alignItems: "center",
// // // // // // //     justifyContent: "space-between",
// // // // // // //     paddingHorizontal: 16,
// // // // // // //   },
// // // // // // //   headerTitle: { fontSize: 18, color: "#fff" },
// // // // // // //   label: { fontSize: 14, marginBottom: 6 },
// // // // // // //   inputBox: {
// // // // // // //     borderWidth: 1,
// // // // // // //     borderRadius: 10,
// // // // // // //     marginBottom: 15,
// // // // // // //     paddingHorizontal: 10,
// // // // // // //   },
// // // // // // //   inputRow: { flexDirection: "row", alignItems: "center" },
// // // // // // //   inputField: { flex: 1, paddingHorizontal: 8, fontSize: 14 },
// // // // // // //   dropdownBox: {
// // // // // // //     borderWidth: 1.5,
// // // // // // //     borderRadius: 10,
// // // // // // //     marginBottom: 15,
// // // // // // //   },
// // // // // // //   dropdownList: {
// // // // // // //     borderWidth: 1,
// // // // // // //     borderRadius: 10,
// // // // // // //   },
// // // // // // //   uploadBox: {
// // // // // // //     flexDirection: "row",
// // // // // // //     alignItems: "center",
// // // // // // //     justifyContent: "center",
// // // // // // //     borderWidth: 1,
// // // // // // //     borderRadius: 10,
// // // // // // //     height: 55,
// // // // // // //     marginBottom: 20,
// // // // // // //   },
// // // // // // //   uploadText: { marginLeft: 8, fontSize: 14 },
// // // // // // //   uploaded: { width: 100, height: 100, borderRadius: 10 },
// // // // // // //   deleteBtn: {
// // // // // // //     position: "absolute",
// // // // // // //     top: -6,
// // // // // // //     right: -6,
// // // // // // //     backgroundColor: "#fff",
// // // // // // //     borderRadius: 20,
// // // // // // //     padding: 2,
// // // // // // //   },
// // // // // // //   submitBtn: {
// // // // // // //     backgroundColor: "#20A68B",
// // // // // // //     borderRadius: 12,
// // // // // // //     paddingVertical: 15,
// // // // // // //     alignItems: "center",
// // // // // // //     marginTop: 10,
// // // // // // //   },
// // // // // // //   submitText: { color: "#fff", fontSize: 15 },
// // // // // // // });

// // // // // // // // import React, { useState } from "react";
// // // // // // // // import {
// // // // // // // //   View,
// // // // // // // //   TextInput,
// // // // // // // //   StyleSheet,
// // // // // // // //   ScrollView,
// // // // // // // //   TouchableOpacity,
// // // // // // // //   Image,
// // // // // // // //   Alert,
// // // // // // // //   Platform,
// // // // // // // //   useColorScheme,
// // // // // // // //   Modal,
// // // // // // // // } from "react-native";
// // // // // // // // import LinearGradient from "react-native-linear-gradient";
// // // // // // // // import { SafeAreaView } from "react-native-safe-area-context";
// // // // // // // // import { launchCamera, launchImageLibrary } from "react-native-image-picker";
// // // // // // // // import DropDownPicker from "react-native-dropdown-picker";
// // // // // // // // import AnimatedBackground from "../../components/ReusableComponents/AnimatedBackground";
// // // // // // // // import { addProperty, updateProperty } from "../../api/api";
// // // // // // // // import GlobalText from "../../theme/GlobalText";
// // // // // // // // import propertyTypes from "../../constants/propertyTypes";
// // // // // // // // import states from "../../constants/locations/state";
// // // // // // // // import districts from "../../constants/locations/districts";
// // // // // // // // import subDistricts from "../../constants/locations/subDistricts";
// // // // // // // // import * as Animatable from "react-native-animatable";
// // // // // // // // import {
// // // // // // // //   ArrowLeft,
// // // // // // // //   Upload,
// // // // // // // //   Trash2,
// // // // // // // //   Home,
// // // // // // // //   IndianRupee,
// // // // // // // //   Phone,
// // // // // // // //   MapPin,
// // // // // // // //   Landmark,
// // // // // // // //   Ruler,
// // // // // // // //   Map,
// // // // // // // //   Bed,
// // // // // // // //   Bath,
// // // // // // // //   UtensilsCrossed,
// // // // // // // //   ClipboardList,
// // // // // // // //   Sofa,
// // // // // // // //   Wrench,
// // // // // // // // } from "lucide-react-native";
// // // // // // // // import { useTheme } from "@react-navigation/native";

// // // // // // // // export default function AddPropertyScreen({ route, navigation }) {
// // // // // // // //   const editingProperty = route?.params?.property || null;
// // // // // // // //   const scheme = useColorScheme();
// // // // // // // //   const { colors } = useTheme();
// // // // // // // //   const isDark = scheme === "dark";
// // // // // // // //   const [missingModalVisible, setMissingModalVisible] = useState(false);
// // // // // // // // const [missingFieldsList, setMissingFieldsList] = useState([]);


// // // // // // // //   // 🧱 Form fields
// // // // // // // //   const [title, setTitle] = useState(editingProperty?.title || "");
// // // // // // // //   const [price, setPrice] = useState(editingProperty?.price?.toString() || "");
// // // // // // // //   const [contact, setContact] = useState(editingProperty?.contact?.toString() || "");
// // // // // // // //   const [location, setLocation] = useState(editingProperty?.location || "");
// // // // // // // //   const [mapLocation, setMapLocation] = useState(editingProperty?.mapLocation || "");
// // // // // // // //   const [landmark, setLandmark] = useState(editingProperty?.landmark || "");
// // // // // // // //   const [sqft, setSqft] = useState(editingProperty?.sqft?.toString() || "");
// // // // // // // //   const [bedrooms, setBedrooms] = useState(editingProperty?.bedrooms?.toString() || "1");
// // // // // // // //   const [bathrooms, setBathrooms] = useState(editingProperty?.bathrooms?.toString() || "1");
// // // // // // // //   const [kitchen, setKitchen] = useState(editingProperty?.kitchen || "Yes");
// // // // // // // //   const [amenities, setAmenities] = useState(editingProperty?.amenities || "");
// // // // // // // //   const [interior, setInterior] = useState(editingProperty?.interior || "");
// // // // // // // //   const [construction, setConstruction] = useState(editingProperty?.construction || "");
// // // // // // // //   const [images, setImages] = useState(editingProperty?.images || []);
// // // // // // // //   const [category, setCategory] = useState(editingProperty?.category || "House");

// // // // // // // //   // 🏛️ Location states
// // // // // // // //   const [state, setState] = useState(editingProperty?.state || "");
// // // // // // // //   const [district, setDistrict] = useState(editingProperty?.district || "");
// // // // // // // //   const [subDistrict, setSubDistrict] = useState(editingProperty?.subDistrict || "");

// // // // // // // //   // Dropdown open states
// // // // // // // //   const [stateOpen, setStateOpen] = useState(false);
// // // // // // // //   const [districtOpen, setDistrictOpen] = useState(false);
// // // // // // // //   const [subDistrictOpen, setSubDistrictOpen] = useState(false);
// // // // // // // //   const [categoryOpen, setCategoryOpen] = useState(false);

// // // // // // // //   // Dropdown data
// // // // // // // //   const stateItems = states.map((s) => ({ label: s, value: s }));
// // // // // // // //   const districtItems = state ? (districts[state] || []).map((d) => ({ label: d, value: d })) : [];
// // // // // // // //   const subDistrictItems = district ? (subDistricts[district] || []).map((sd) => ({ label: sd, value: sd })) : [];
// // // // // // // //   const categoryItems = propertyTypes.map((c) => ({ label: c.name, value: c.name }));

  

// // // // // // // //   // 🖼️ Image Picker
// // // // // // // //   const handleImagePick = () =>
// // // // // // // //     Alert.alert("Upload Image", "Choose an option", [
// // // // // // // //       {
// // // // // // // //         text: "Camera",
// // // // // // // //         onPress: () =>
// // // // // // // //           launchCamera({ mediaType: "photo" }, (res) => {
// // // // // // // //             if (res.assets) setImages([...images, res.assets[0].uri]);
// // // // // // // //           }),
// // // // // // // //       },
// // // // // // // //       {
// // // // // // // //         text: "Gallery",
// // // // // // // //         onPress: () =>
// // // // // // // //           launchImageLibrary({ mediaType: "photo", selectionLimit: 5 }, (res) => {
// // // // // // // //             if (res.assets) setImages([...images, ...res.assets.map((a) => a.uri)]);
// // // // // // // //           }),
// // // // // // // //       },
// // // // // // // //       { text: "Cancel", style: "cancel" },
// // // // // // // //     ]);

// // // // // // // //   const removeImage = (index) => {
// // // // // // // //     const updated = [...images];
// // // // // // // //     updated.splice(index, 1);
// // // // // // // //     setImages(updated);
// // // // // // // //   };

// // // // // // // //   // ✅ Submit handler
// // // // // // // //   // const handleSubmit = async () => {
// // // // // // // //   //   try {
// // // // // // // //   //     if (!title || !price || !contact || !location || !district || !state || !category) {
// // // // // // // //   //       Alert.alert("Missing Fields", "Please fill all required fields");
// // // // // // // //   //       return;
// // // // // // // //   //     }

// // // // // // // //   //     const propertyPayload = {
// // // // // // // //   //       title,
// // // // // // // //   //       price,
// // // // // // // //   //       contact: Number(contact),
// // // // // // // //   //       location,
// // // // // // // //   //       mapLocation,
// // // // // // // //   //       district,
// // // // // // // //   //       subDistrict,
// // // // // // // //   //       state,
// // // // // // // //   //       landmark,
// // // // // // // //   //       sqft,
// // // // // // // //   //       bedrooms,
// // // // // // // //   //       bathrooms,
// // // // // // // //   //       kitchen,
// // // // // // // //   //       amenities,
// // // // // // // //   //       interior,
// // // // // // // //   //       construction,
// // // // // // // //   //       images,
// // // // // // // //   //       category,
// // // // // // // //   //     };

// // // // // // // //   //     let res;
// // // // // // // //   //     if (editingProperty) {
// // // // // // // //   //       res = await updateProperty(editingProperty._id, propertyPayload);
// // // // // // // //   //       Alert.alert("Success", "Property updated successfully!");
// // // // // // // //   //     } else {
// // // // // // // //   //       res = await addProperty(propertyPayload);
// // // // // // // //   //       Alert.alert("Success", "Property added successfully!");
// // // // // // // //   //     }

// // // // // // // //   //     navigation.reset({
// // // // // // // //   //       index: 0,
// // // // // // // //   //       routes: [{ name: "Success" }],
// // // // // // // //   //     });
// // // // // // // //   //   } catch (err) {
// // // // // // // //   //     console.error("Property save error:", err.response?.data || err.message);
// // // // // // // //   //     Alert.alert("Error", err.response?.data?.error || "Failed to save property");
// // // // // // // //   //   }
// // // // // // // //   // };
// // // // // // // //   // ✅ Submit handler
// // // // // // // // const handleSubmit = async () => {
// // // // // // // //   try {
// // // // // // // //     // Required field checks
// // // // // // // //     const requiredFields = {
// // // // // // // //       Title: title,
// // // // // // // //       Price: price,
// // // // // // // //       "Contact Number": contact,
// // // // // // // //       Address: location,
// // // // // // // //       State: state,
// // // // // // // //       District: district,
// // // // // // // //       Category: category,
// // // // // // // //     };

// // // // // // // //     const missingFields = Object.entries(requiredFields)
// // // // // // // //       .filter(([_, value]) => !value || value.trim() === "")
// // // // // // // //       .map(([key]) => key);

// // // // // // // //     if (missingFields.length > 0) {
// // // // // // // //       setMissingFieldsList(missingFields);
// // // // // // // //       setMissingModalVisible(true);
// // // // // // // //       return;
// // // // // // // //     }

// // // // // // // //     const propertyPayload = {
// // // // // // // //       title,
// // // // // // // //       price,
// // // // // // // //       contact: Number(contact),
// // // // // // // //       location,
// // // // // // // //       mapLocation,
// // // // // // // //       district,
// // // // // // // //       subDistrict,
// // // // // // // //       state,
// // // // // // // //       landmark,
// // // // // // // //       sqft,
// // // // // // // //       bedrooms,
// // // // // // // //       bathrooms,
// // // // // // // //       kitchen,
// // // // // // // //       amenities,
// // // // // // // //       interior,
// // // // // // // //       construction,
// // // // // // // //       images,
// // // // // // // //       category,
// // // // // // // //     };

// // // // // // // //     let res;
// // // // // // // //     if (editingProperty) {
// // // // // // // //       res = await updateProperty(editingProperty._id, propertyPayload);
// // // // // // // //       Alert.alert("Success", "Property updated successfully!");
// // // // // // // //     } else {
// // // // // // // //       res = await addProperty(propertyPayload);
// // // // // // // //       Alert.alert("Success", "Property added successfully!");
// // // // // // // //     }

// // // // // // // //     navigation.reset({
// // // // // // // //       index: 0,
// // // // // // // //       routes: [{ name: "Success" }],
// // // // // // // //     });
// // // // // // // //   } catch (err) {
// // // // // // // //     console.error("Property save error:", err.response?.data || err.message);
// // // // // // // //     Alert.alert("Error", err.response?.data?.error || "Failed to save property");
// // // // // // // //   }
// // // // // // // // };



// // // // // // // //   // Theme-dependent colors
// // // // // // // //   const backgroundColor = isDark ? "#121212" : "#f9f9f9";
// // // // // // // //   const cardColor = isDark ? "#1E1E1E" : "#fff";
// // // // // // // //   const textColor = isDark ? "#EDEDED" : "#000";
// // // // // // // //   const placeholderColor = isDark ? "#888" : "#666";
// // // // // // // //   const borderColor = isDark ? "#333" : "#20A68B";

// // // // // // // //   return (
// // // // // // // //     <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
// // // // // // // //       <AnimatedBackground />

// // // // // // // //       {/* 🔹 Header */}
// // // // // // // //       <LinearGradient
// // // // // // // //         colors={isDark ? ["#114D44", "#0D3732"] : ["#43C6AC", "#20A68B"]}
// // // // // // // //         style={styles.headerContainer}
// // // // // // // //       >
// // // // // // // //         <View style={styles.header}>
// // // // // // // //           <TouchableOpacity onPress={() => navigation.goBack()}>
// // // // // // // //             <ArrowLeft size={24} color="#fff" />
// // // // // // // //           </TouchableOpacity>
// // // // // // // //           <GlobalText bold style={styles.headerTitle}>
// // // // // // // //             {editingProperty ? "Edit Property" : "Add Property"}
// // // // // // // //           </GlobalText>
// // // // // // // //           <View style={{ width: 24 }} />
// // // // // // // //         </View>
// // // // // // // //       </LinearGradient>

// // // // // // // //       {/* 🔹 Form */}
// // // // // // // //       <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
// // // // // // // //         <GlobalText medium style={[styles.label, { color: textColor }]}>
// // // // // // // //           Category
// // // // // // // //         </GlobalText>
// // // // // // // //         <DropDownPicker
// // // // // // // //           open={categoryOpen}
// // // // // // // //           value={category}
// // // // // // // //           items={categoryItems}
// // // // // // // //           setOpen={setCategoryOpen}
// // // // // // // //           setValue={setCategory}
// // // // // // // //           placeholder="-- Select Category --"
// // // // // // // //           style={[styles.dropdownBox, { borderColor, backgroundColor: cardColor }]}
// // // // // // // //           dropDownContainerStyle={[
// // // // // // // //             styles.dropdownList,
// // // // // // // //             { backgroundColor: cardColor, borderColor },
// // // // // // // //           ]}
// // // // // // // //           zIndex={4000}
// // // // // // // //           listMode="SCROLLVIEW"
// // // // // // // //         />

// // // // // // // //         {/* Text Inputs */}
// // // // // // // //         <InputBox
// // // // // // // //           icon={<Home size={18} color="#20A68B" />}
// // // // // // // //           placeholder="Property Title"
// // // // // // // //           value={title}
// // // // // // // //           onChange={setTitle}
// // // // // // // //           textColor={textColor}
// // // // // // // //           placeholderColor={placeholderColor}
// // // // // // // //           cardColor={cardColor}
// // // // // // // //           borderColor={borderColor}
// // // // // // // //         />

// // // // // // // //         <InputBox
// // // // // // // //           icon={<IndianRupee size={18} color="#20A68B" />}
// // // // // // // //           placeholder="Price"
// // // // // // // //           value={price}
// // // // // // // //           onChange={setPrice}
// // // // // // // //           keyboardType="numeric"
// // // // // // // //           textColor={textColor}
// // // // // // // //           placeholderColor={placeholderColor}
// // // // // // // //           cardColor={cardColor}
// // // // // // // //           borderColor={borderColor}
// // // // // // // //         />

// // // // // // // //         <InputBox
// // // // // // // //           icon={<Phone size={18} color="#20A68B" />}
// // // // // // // //           placeholder="Contact Number"
// // // // // // // //           value={contact}
// // // // // // // //           onChange={setContact}
// // // // // // // //           keyboardType="phone-pad"
// // // // // // // //           textColor={textColor}
// // // // // // // //           placeholderColor={placeholderColor}
// // // // // // // //           cardColor={cardColor}
// // // // // // // //           borderColor={borderColor}
// // // // // // // //         />

// // // // // // // //         <InputBox
// // // // // // // //           icon={<MapPin size={18} color="#20A68B" />}
// // // // // // // //           placeholder="Address"
// // // // // // // //           value={location}
// // // // // // // //           onChange={setLocation}
// // // // // // // //           textColor={textColor}
// // // // // // // //           placeholderColor={placeholderColor}
// // // // // // // //           cardColor={cardColor}
// // // // // // // //           borderColor={borderColor}
// // // // // // // //         />

// // // // // // // //         {/* State Dropdowns */}
// // // // // // // //         <GlobalText medium style={[styles.label, { color: textColor }]}>State</GlobalText>
// // // // // // // //         <DropDownPicker
// // // // // // // //           open={stateOpen}
// // // // // // // //           value={state}
// // // // // // // //           items={stateItems}
// // // // // // // //           setOpen={setStateOpen}
// // // // // // // //           setValue={setState}
// // // // // // // //           placeholder="-- Select State --"
// // // // // // // //           style={[styles.dropdownBox, { borderColor, backgroundColor: cardColor }]}
// // // // // // // //           dropDownContainerStyle={[styles.dropdownList, { backgroundColor: cardColor, borderColor }]}
// // // // // // // //           zIndex={3000}
// // // // // // // //           listMode="SCROLLVIEW"
// // // // // // // //           onChangeValue={(v) => {
// // // // // // // //             setState(v);
// // // // // // // //             setDistrict("");
// // // // // // // //             setSubDistrict("");
// // // // // // // //           }}
// // // // // // // //         />

// // // // // // // //         <GlobalText medium style={[styles.label, { color: textColor }]}>District</GlobalText>
// // // // // // // //         <DropDownPicker
// // // // // // // //           open={districtOpen}
// // // // // // // //           value={district}
// // // // // // // //           items={districtItems}
// // // // // // // //           setOpen={setDistrictOpen}
// // // // // // // //           setValue={setDistrict}
// // // // // // // //           placeholder="-- Select District --"
// // // // // // // //           style={[styles.dropdownBox, { borderColor, backgroundColor: cardColor }]}
// // // // // // // //           dropDownContainerStyle={[styles.dropdownList, { backgroundColor: cardColor, borderColor }]}
// // // // // // // //           zIndex={2000}
// // // // // // // //           listMode="SCROLLVIEW"
// // // // // // // //           disabled={!state}
// // // // // // // //         />

// // // // // // // //         <GlobalText medium style={[styles.label, { color: textColor }]}>Sub-District</GlobalText>
// // // // // // // //         <DropDownPicker
// // // // // // // //           open={subDistrictOpen}
// // // // // // // //           value={subDistrict}
// // // // // // // //           items={subDistrictItems}
// // // // // // // //           setOpen={setSubDistrictOpen}
// // // // // // // //           setValue={setSubDistrict}
// // // // // // // //           placeholder="-- Select Sub-District --"
// // // // // // // //           style={[styles.dropdownBox, { borderColor, backgroundColor: cardColor }]}
// // // // // // // //           dropDownContainerStyle={[styles.dropdownList, { backgroundColor: cardColor, borderColor }]}
// // // // // // // //           zIndex={1000}
// // // // // // // //           listMode="SCROLLVIEW"
// // // // // // // //           disabled={!district}
// // // // // // // //         />

// // // // // // // //         {/* Inputs */}
// // // // // // // //         <InputBox
// // // // // // // //           icon={<Landmark size={18} color="#20A68B" />}
// // // // // // // //           placeholder="Nearby Landmark"
// // // // // // // //           value={landmark}
// // // // // // // //           onChange={setLandmark}
// // // // // // // //           textColor={textColor}
// // // // // // // //           placeholderColor={placeholderColor}
// // // // // // // //           cardColor={cardColor}
// // // // // // // //           borderColor={borderColor}
// // // // // // // //         />

// // // // // // // //         <InputBox
// // // // // // // //           icon={<Ruler size={18} color="#20A68B" />}
// // // // // // // //           placeholder="Property Size in Sqft"
// // // // // // // //           value={sqft}
// // // // // // // //           onChange={setSqft}
// // // // // // // //           keyboardType="numeric"
// // // // // // // //           textColor={textColor}
// // // // // // // //           placeholderColor={placeholderColor}
// // // // // // // //           cardColor={cardColor}
// // // // // // // //           borderColor={borderColor}
// // // // // // // //         />

// // // // // // // //         <InputBox
// // // // // // // //           icon={<Map size={18} color="#20A68B" />}
// // // // // // // //           placeholder="Google Maps Link"
// // // // // // // //           value={mapLocation}
// // // // // // // //           onChange={setMapLocation}
// // // // // // // //           textColor={textColor}
// // // // // // // //           placeholderColor={placeholderColor}
// // // // // // // //           cardColor={cardColor}
// // // // // // // //           borderColor={borderColor}
// // // // // // // //         />

// // // // // // // //         <InputBox
// // // // // // // //           icon={<Bed size={18} color="#20A68B" />}
// // // // // // // //           placeholder="Bedrooms"
// // // // // // // //           value={bedrooms}
// // // // // // // //           onChange={setBedrooms}
// // // // // // // //           keyboardType="numeric"
// // // // // // // //           textColor={textColor}
// // // // // // // //           placeholderColor={placeholderColor}
// // // // // // // //           cardColor={cardColor}
// // // // // // // //           borderColor={borderColor}
// // // // // // // //         />

// // // // // // // //         <InputBox
// // // // // // // //           icon={<Bath size={18} color="#20A68B" />}
// // // // // // // //           placeholder="Bathrooms"
// // // // // // // //           value={bathrooms}
// // // // // // // //           onChange={setBathrooms}
// // // // // // // //           keyboardType="numeric"
// // // // // // // //           textColor={textColor}
// // // // // // // //           placeholderColor={placeholderColor}
// // // // // // // //           cardColor={cardColor}
// // // // // // // //           borderColor={borderColor}
// // // // // // // //         />

// // // // // // // //         <InputBox
// // // // // // // //           icon={<UtensilsCrossed size={18} color="#20A68B" />}
// // // // // // // //           placeholder="Kitchen (Yes/No)"
// // // // // // // //           value={kitchen}
// // // // // // // //           onChange={setKitchen}
// // // // // // // //           textColor={textColor}
// // // // // // // //           placeholderColor={placeholderColor}
// // // // // // // //           cardColor={cardColor}
// // // // // // // //           borderColor={borderColor}
// // // // // // // //         />

// // // // // // // //         <InputBox
// // // // // // // //           icon={<ClipboardList size={18} color="#20A68B" />}
// // // // // // // //           placeholder="Amenities"
// // // // // // // //           value={amenities}
// // // // // // // //           onChange={setAmenities}
// // // // // // // //           textColor={textColor}
// // // // // // // //           placeholderColor={placeholderColor}
// // // // // // // //           cardColor={cardColor}
// // // // // // // //           borderColor={borderColor}
// // // // // // // //         />

// // // // // // // //         <InputBox
// // // // // // // //           icon={<Sofa size={18} color="#20A68B" />}
// // // // // // // //           placeholder="Interior Details"
// // // // // // // //           value={interior}
// // // // // // // //           onChange={setInterior}
// // // // // // // //           multiline
// // // // // // // //           height={80}
// // // // // // // //           textColor={textColor}
// // // // // // // //           placeholderColor={placeholderColor}
// // // // // // // //           cardColor={cardColor}
// // // // // // // //           borderColor={borderColor}
// // // // // // // //         />

// // // // // // // //         <InputBox
// // // // // // // //           icon={<Wrench size={18} color="#20A68B" />}
// // // // // // // //           placeholder="Construction Details"
// // // // // // // //           value={construction}
// // // // // // // //           onChange={setConstruction}
// // // // // // // //           multiline
// // // // // // // //           height={80}
// // // // // // // //           textColor={textColor}
// // // // // // // //           placeholderColor={placeholderColor}
// // // // // // // //           cardColor={cardColor}
// // // // // // // //           borderColor={borderColor}
// // // // // // // //         />
// // // // // // // //         {/* 🔔 Missing Fields Modal */}
// // // // // // // // <Modal
// // // // // // // //   transparent
// // // // // // // //   visible={missingModalVisible}
// // // // // // // //   animationType="fade"
// // // // // // // //   onRequestClose={() => setMissingModalVisible(false)}
// // // // // // // // >
// // // // // // // //   <View
// // // // // // // //     style={{
// // // // // // // //       flex: 1,
// // // // // // // //       backgroundColor: "rgba(0,0,0,0.5)",
// // // // // // // //       justifyContent: "center",
// // // // // // // //       alignItems: "center",
// // // // // // // //     }}
// // // // // // // //   >
// // // // // // // //     <Animatable.View
// // // // // // // //       animation="zoomIn"
// // // // // // // //       duration={400}
// // // // // // // //       easing="ease-out"
// // // // // // // //       style={[
// // // // // // // //         {
// // // // // // // //           width: "80%",
// // // // // // // //           borderRadius: 16,
// // // // // // // //           padding: 20,
// // // // // // // //           alignItems: "center",
// // // // // // // //           elevation: 8,
// // // // // // // //         },
// // // // // // // //         { backgroundColor: isDark ? "#1E1E1E" : "#fff" },
// // // // // // // //       ]}
// // // // // // // //     >
// // // // // // // //       <GlobalText bold style={{ fontSize: 17, color: isDark ? "#fff" : "#333" }}>
// // // // // // // //         Missing Fields
// // // // // // // //       </GlobalText>

// // // // // // // //       <View
// // // // // // // //         style={{
// // // // // // // //           marginVertical: 10,
// // // // // // // //           alignSelf: "stretch",
// // // // // // // //           backgroundColor: isDark ? "#2A2A2A" : "#F4F4F4",
// // // // // // // //           borderRadius: 8,
// // // // // // // //           padding: 10,
// // // // // // // //         }}
// // // // // // // //       >
// // // // // // // //         {missingFieldsList.map((field, idx) => (
// // // // // // // //           <GlobalText
// // // // // // // //             key={idx}
// // // // // // // //             style={{
// // // // // // // //               fontSize: 14,
// // // // // // // //               color: isDark ? "#EAEAEA" : "#444",
// // // // // // // //               marginBottom: 4,
// // // // // // // //             }}
// // // // // // // //           >
// // // // // // // //             • {field}
// // // // // // // //           </GlobalText>
// // // // // // // //         ))}
// // // // // // // //       </View>

// // // // // // // //       <GlobalText
// // // // // // // //         style={{
// // // // // // // //           fontSize: 13,
// // // // // // // //           color: isDark ? "#B0B0B0" : "#666",
// // // // // // // //           textAlign: "center",
// // // // // // // //           marginBottom: 15,
// // // // // // // //         }}
// // // // // // // //       >
// // // // // // // //         📝 Note: Title, Price, Contact, Address, State, District, and Category
// // // // // // // //         are mandatory fields.
// // // // // // // //       </GlobalText>

// // // // // // // //       <TouchableOpacity
// // // // // // // //         activeOpacity={0.9}
// // // // // // // //         onPress={() => setMissingModalVisible(false)}
// // // // // // // //       >
// // // // // // // //         <LinearGradient
// // // // // // // //           colors={["#43C6AC", "#20A68B"]}
// // // // // // // //           style={{
// // // // // // // //             borderRadius: 12,
// // // // // // // //             paddingVertical: 10,
// // // // // // // //             paddingHorizontal: 30,
// // // // // // // //             elevation: 3,
// // // // // // // //           }}
// // // // // // // //         >
// // // // // // // //           <GlobalText bold style={{ color: "#fff", fontSize: 15 }}>
// // // // // // // //             OK
// // // // // // // //           </GlobalText>
// // // // // // // //         </LinearGradient>
// // // // // // // //       </TouchableOpacity>
// // // // // // // //     </Animatable.View>
// // // // // // // //   </View>
// // // // // // // // </Modal>


// // // // // // // //         {/* 🖼️ Upload */}
// // // // // // // //         <TouchableOpacity style={[styles.uploadBox, { borderColor }]} onPress={handleImagePick}>
// // // // // // // //           <Upload size={20} color="#20A68B" />
// // // // // // // //           <GlobalText semiBold style={[styles.uploadText, { color: "#20A68B" }]}>
// // // // // // // //             Upload Images
// // // // // // // //           </GlobalText>
// // // // // // // //         </TouchableOpacity>

// // // // // // // //         <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
// // // // // // // //           {images.map((img, i) => (
// // // // // // // //             <View key={i} style={{ position: "relative", margin: 5 }}>
// // // // // // // //               <Image source={{ uri: img }} style={styles.uploaded} />
// // // // // // // //               <TouchableOpacity style={styles.deleteBtn} onPress={() => removeImage(i)}>
// // // // // // // //                 <Trash2 size={18} color="red" />
// // // // // // // //               </TouchableOpacity>
// // // // // // // //             </View>
// // // // // // // //           ))}
// // // // // // // //         </View>

// // // // // // // //         {/* ✅ Submit */}
// // // // // // // //         <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
// // // // // // // //           <GlobalText bold style={styles.submitText}>
// // // // // // // //             {editingProperty ? "Update Property" : "Add Property"}
// // // // // // // //           </GlobalText>
// // // // // // // //         </TouchableOpacity>
// // // // // // // //       </ScrollView>
// // // // // // // //     </SafeAreaView>
// // // // // // // //   );
// // // // // // // // }

// // // // // // // // // 🧱 Reusable InputBox
// // // // // // // // function InputBox({
// // // // // // // //   icon,
// // // // // // // //   placeholder,
// // // // // // // //   value,
// // // // // // // //   onChange,
// // // // // // // //   keyboardType,
// // // // // // // //   multiline,
// // // // // // // //   height,
// // // // // // // //   textColor,
// // // // // // // //   placeholderColor,
// // // // // // // //   cardColor,
// // // // // // // //   borderColor,
// // // // // // // // }) {
// // // // // // // //   return (
// // // // // // // //     <View
// // // // // // // //       style={[
// // // // // // // //         styles.inputBox,
// // // // // // // //         { borderColor, backgroundColor: cardColor },
// // // // // // // //       ]}
// // // // // // // //     >
// // // // // // // //       <View style={styles.inputRow}>
// // // // // // // //         {icon}
// // // // // // // //         <TextInput
// // // // // // // //           placeholder={placeholder}
// // // // // // // //           placeholderTextColor={placeholderColor}
// // // // // // // //           style={[styles.inputField, { height: height || 45, color: textColor }]}
// // // // // // // //           value={value}
// // // // // // // //           onChangeText={onChange}
// // // // // // // //           keyboardType={keyboardType || "default"}
// // // // // // // //           multiline={multiline}
// // // // // // // //         />
// // // // // // // //       </View>
// // // // // // // //     </View>
// // // // // // // //   );
// // // // // // // // }

// // // // // // // // // 🎨 Styles
// // // // // // // // const styles = StyleSheet.create({
// // // // // // // //   safeArea: { flex: 1 },
// // // // // // // //   headerContainer: {
// // // // // // // //     paddingVertical: 12,
// // // // // // // //     elevation: 6,
// // // // // // // //     borderBottomLeftRadius: 20,
// // // // // // // //     borderBottomRightRadius: 20,
// // // // // // // //   },
// // // // // // // //   header: {
// // // // // // // //     flexDirection: "row",
// // // // // // // //     alignItems: "center",
// // // // // // // //     justifyContent: "space-between",
// // // // // // // //     paddingHorizontal: 16,
// // // // // // // //   },
// // // // // // // //   headerTitle: { fontSize: 18, color: "#fff" },
// // // // // // // //   label: { fontSize: 14, marginBottom: 6 },
// // // // // // // //   inputBox: {
// // // // // // // //     borderWidth: 1,
// // // // // // // //     borderRadius: 10,
// // // // // // // //     marginBottom: 15,
// // // // // // // //     paddingHorizontal: 10,
// // // // // // // //   },
// // // // // // // //   inputRow: { flexDirection: "row", alignItems: "center" },
// // // // // // // //   inputField: { flex: 1, paddingHorizontal: 8, fontSize: 14 },
// // // // // // // //   dropdownBox: {
// // // // // // // //     borderWidth: 1.5,
// // // // // // // //     borderRadius: 10,
// // // // // // // //     marginBottom: 15,
// // // // // // // //   },
// // // // // // // //   dropdownList: {
// // // // // // // //     borderWidth: 1,
// // // // // // // //     borderRadius: 10,
// // // // // // // //   },
// // // // // // // //   uploadBox: {
// // // // // // // //     flexDirection: "row",
// // // // // // // //     alignItems: "center",
// // // // // // // //     justifyContent: "center",
// // // // // // // //     borderWidth: 1,
// // // // // // // //     borderRadius: 10,
// // // // // // // //     height: 55,
// // // // // // // //     marginBottom: 20,
// // // // // // // //   },
// // // // // // // //   uploadText: { marginLeft: 8, fontSize: 14 },
// // // // // // // //   uploaded: { width: 100, height: 100, borderRadius: 10 },
// // // // // // // //   deleteBtn: {
// // // // // // // //     position: "absolute",
// // // // // // // //     top: -6,
// // // // // // // //     right: -6,
// // // // // // // //     backgroundColor: "#fff",
// // // // // // // //     borderRadius: 20,
// // // // // // // //     padding: 2,
// // // // // // // //   },
// // // // // // // //   submitBtn: {
// // // // // // // //     backgroundColor: "#20A68B",
// // // // // // // //     borderRadius: 12,
// // // // // // // //     paddingVertical: 15,
// // // // // // // //     alignItems: "center",
// // // // // // // //     marginTop: 10,
// // // // // // // //   },
// // // // // // // //   submitText: { color: "#fff", fontSize: 15 },
// // // // // // // // });

// // // // // // // // // import React, { useState } from "react";
// // // // // // // // // import {
// // // // // // // // //   View,
// // // // // // // // //   TextInput,
// // // // // // // // //   StyleSheet,
// // // // // // // // //   ScrollView,
// // // // // // // // //   TouchableOpacity,
// // // // // // // // //   Image,
// // // // // // // // //   Alert,
// // // // // // // // //   Platform,
// // // // // // // // // } from "react-native";
// // // // // // // // // import LinearGradient from "react-native-linear-gradient";
// // // // // // // // // import { SafeAreaView } from "react-native-safe-area-context";
// // // // // // // // // import { launchCamera, launchImageLibrary } from "react-native-image-picker";
// // // // // // // // // import DropDownPicker from "react-native-dropdown-picker";
// // // // // // // // // import AnimatedBackground from "../../components/ReusableComponents/AnimatedBackground";
// // // // // // // // // import { addProperty, updateProperty } from "../../api/api";
// // // // // // // // // import GlobalText from "../../theme/GlobalText";
// // // // // // // // // import propertyTypes from "../../constants/propertyTypes";
// // // // // // // // // import states from "../../constants/locations/state";
// // // // // // // // // import districts from "../../constants/locations/districts";
// // // // // // // // // import subDistricts from "../../constants/locations/subDistricts";
// // // // // // // // // import {
// // // // // // // // //   ArrowLeft,
// // // // // // // // //   Upload,
// // // // // // // // //   Trash2,
// // // // // // // // //   Home,
// // // // // // // // //   IndianRupee,
// // // // // // // // //   Phone,
// // // // // // // // //   MapPin,
// // // // // // // // //   Landmark,
// // // // // // // // //   Ruler,
// // // // // // // // //   Map,
// // // // // // // // //   Bed,
// // // // // // // // //   Bath,
// // // // // // // // //   UtensilsCrossed,
// // // // // // // // //   ClipboardList,
// // // // // // // // //   Sofa,
// // // // // // // // //   Wrench,
// // // // // // // // // } from "lucide-react-native";

// // // // // // // // // export default function AddPropertyScreen({ route, navigation }) {
// // // // // // // // //   const editingProperty = route?.params?.property || null;

// // // // // // // // //   // 🧱 Form fields
// // // // // // // // //   const [title, setTitle] = useState(editingProperty?.title || "");
// // // // // // // // //   const [price, setPrice] = useState(editingProperty?.price?.toString() || "");
// // // // // // // // //   const [contact, setContact] = useState(editingProperty?.contact?.toString() || "");
// // // // // // // // //   const [location, setLocation] = useState(editingProperty?.location || "");
// // // // // // // // //   const [mapLocation, setMapLocation] = useState(editingProperty?.mapLocation || "");
// // // // // // // // //   const [landmark, setLandmark] = useState(editingProperty?.landmark || "");
// // // // // // // // //   const [sqft, setSqft] = useState(editingProperty?.sqft?.toString() || "");
// // // // // // // // //   const [bedrooms, setBedrooms] = useState(editingProperty?.bedrooms?.toString() || "1");
// // // // // // // // //   const [bathrooms, setBathrooms] = useState(editingProperty?.bathrooms?.toString() || "1");
// // // // // // // // //   const [kitchen, setKitchen] = useState(editingProperty?.kitchen || "Yes");
// // // // // // // // //   const [amenities, setAmenities] = useState(editingProperty?.amenities || "");
// // // // // // // // //   const [interior, setInterior] = useState(editingProperty?.interior || "");
// // // // // // // // //   const [construction, setConstruction] = useState(editingProperty?.construction || "");
// // // // // // // // //   const [images, setImages] = useState(editingProperty?.images || []);
// // // // // // // // //   const [category, setCategory] = useState(editingProperty?.category || "House");

// // // // // // // // //   // 🏛️ Location states
// // // // // // // // //   const [state, setState] = useState(editingProperty?.state || "");
// // // // // // // // //   const [district, setDistrict] = useState(editingProperty?.district || "");
// // // // // // // // //   const [subDistrict, setSubDistrict] = useState(editingProperty?.subDistrict || "");

// // // // // // // // //   // Dropdown open states
// // // // // // // // //   const [stateOpen, setStateOpen] = useState(false);
// // // // // // // // //   const [districtOpen, setDistrictOpen] = useState(false);
// // // // // // // // //   const [subDistrictOpen, setSubDistrictOpen] = useState(false);
// // // // // // // // //   const [categoryOpen, setCategoryOpen] = useState(false);

// // // // // // // // //   // Dropdown data
// // // // // // // // //   const stateItems = states.map((s) => ({ label: s, value: s }));
// // // // // // // // //   const districtItems = state ? (districts[state] || []).map((d) => ({ label: d, value: d })) : [];
// // // // // // // // //   const subDistrictItems = district ? (subDistricts[district] || []).map((sd) => ({ label: sd, value: sd })) : [];
// // // // // // // // //   const categoryItems = propertyTypes.map((c) => ({ label: c.name, value: c.name }));

// // // // // // // // //   // 🖼️ Image Picker
// // // // // // // // //   const handleImagePick = () =>
// // // // // // // // //     Alert.alert("Upload Image", "Choose an option", [
// // // // // // // // //       {
// // // // // // // // //         text: "Camera",
// // // // // // // // //         onPress: () =>
// // // // // // // // //           launchCamera({ mediaType: "photo" }, (res) => {
// // // // // // // // //             if (res.assets) setImages([...images, res.assets[0].uri]);
// // // // // // // // //           }),
// // // // // // // // //       },
// // // // // // // // //       {
// // // // // // // // //         text: "Gallery",
// // // // // // // // //         onPress: () =>
// // // // // // // // //           launchImageLibrary({ mediaType: "photo", selectionLimit: 5 }, (res) => {
// // // // // // // // //             if (res.assets) setImages([...images, ...res.assets.map((a) => a.uri)]);
// // // // // // // // //           }),
// // // // // // // // //       },
// // // // // // // // //       { text: "Cancel", style: "cancel" },
// // // // // // // // //     ]);

// // // // // // // // //   // 🗑️ Remove Image
// // // // // // // // //   const removeImage = (index) => {
// // // // // // // // //     const updated = [...images];
// // // // // // // // //     updated.splice(index, 1);
// // // // // // // // //     setImages(updated);
// // // // // // // // //   };

// // // // // // // // //   // ✅ Submit handler
// // // // // // // // //   const handleSubmit = async () => {
// // // // // // // // //     try {
// // // // // // // // //       if (!title || !price || !contact || !location || !district || !state || !category) {
// // // // // // // // //         Alert.alert("Missing Fields", "Please fill all required fields");
// // // // // // // // //         return;
// // // // // // // // //       }

// // // // // // // // //       const propertyPayload = {
// // // // // // // // //         title,
// // // // // // // // //         price,
// // // // // // // // //         contact: Number(contact),
// // // // // // // // //         location,
// // // // // // // // //         mapLocation,
// // // // // // // // //         district,
// // // // // // // // //         subDistrict,
// // // // // // // // //         state,
// // // // // // // // //         landmark,
// // // // // // // // //         sqft,
// // // // // // // // //         bedrooms,
// // // // // // // // //         bathrooms,
// // // // // // // // //         kitchen,
// // // // // // // // //         amenities,
// // // // // // // // //         interior,
// // // // // // // // //         construction,
// // // // // // // // //         images,
// // // // // // // // //         category,
// // // // // // // // //       };

// // // // // // // // //       let res;
// // // // // // // // //       if (editingProperty) {
// // // // // // // // //         res = await updateProperty(editingProperty._id, propertyPayload);
// // // // // // // // //         Alert.alert("Success", "Property updated successfully!");
// // // // // // // // //       } else {
// // // // // // // // //         res = await addProperty(propertyPayload);
// // // // // // // // //         Alert.alert("Success", "Property added successfully!");
// // // // // // // // //       }

// // // // // // // // //       navigation.reset({
// // // // // // // // //         index: 0,
// // // // // // // // //         routes: [{ name: "Success" }],
// // // // // // // // //       });
// // // // // // // // //     } catch (err) {
// // // // // // // // //       console.error("Property save error:", err.response?.data || err.message);
// // // // // // // // //       Alert.alert("Error", err.response?.data?.error || "Failed to save property");
// // // // // // // // //     }
// // // // // // // // //   };

// // // // // // // // //   return (
// // // // // // // // //     <SafeAreaView style={styles.safeArea}>
// // // // // // // // //       <AnimatedBackground />

// // // // // // // // //       {/* 🔹 Header */}
// // // // // // // // //       <LinearGradient colors={["#43C6AC", "#20A68B"]} style={styles.headerContainer}>
// // // // // // // // //         <View style={styles.header}>
// // // // // // // // //           <TouchableOpacity onPress={() => navigation.goBack()}>
// // // // // // // // //             <ArrowLeft size={24} color="#fff" />
// // // // // // // // //           </TouchableOpacity>
// // // // // // // // //           <GlobalText bold style={styles.headerTitle}>
// // // // // // // // //             {editingProperty ? "Edit Property" : "Add Property"}
// // // // // // // // //           </GlobalText>
// // // // // // // // //           <View style={{ width: 24 }} />
// // // // // // // // //         </View>
// // // // // // // // //       </LinearGradient>

// // // // // // // // //       {/* 🔹 Form */}
// // // // // // // // //       <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
// // // // // // // // //         {/* Category */}
// // // // // // // // //         <GlobalText medium style={styles.label}>Category</GlobalText>
// // // // // // // // //         <DropDownPicker
// // // // // // // // //           open={categoryOpen}
// // // // // // // // //           value={category}
// // // // // // // // //           items={categoryItems}
// // // // // // // // //           setOpen={setCategoryOpen}
// // // // // // // // //           setValue={setCategory}
// // // // // // // // //           placeholder="-- Select Category --"
// // // // // // // // //           style={styles.dropdownBox}
// // // // // // // // //           dropDownContainerStyle={styles.dropdownList}
// // // // // // // // //           zIndex={4000}
// // // // // // // // //           zIndexInverse={4000}
// // // // // // // // //           listMode="SCROLLVIEW"
// // // // // // // // //         />

// // // // // // // // //         {/* Text Inputs */}
// // // // // // // // //         <InputBox icon={<Home size={18} color="#20A68B" />} placeholder="Property Title" value={title} onChange={setTitle} />
// // // // // // // // //         <InputBox icon={<IndianRupee size={18} color="#20A68B" />} placeholder="Price" value={price} onChange={setPrice} keyboardType="numeric" />
// // // // // // // // //         <InputBox icon={<Phone size={18} color="#20A68B" />} placeholder="Contact Number" value={contact} onChange={setContact} keyboardType="phone-pad" />
// // // // // // // // //         <InputBox icon={<MapPin size={18} color="#20A68B" />} placeholder="Address" value={location} onChange={setLocation} />

// // // // // // // // //         {/* State */}
// // // // // // // // //         <GlobalText medium style={styles.label}>State</GlobalText>
// // // // // // // // //         <DropDownPicker
// // // // // // // // //           open={stateOpen}
// // // // // // // // //           value={state}
// // // // // // // // //           items={stateItems}
// // // // // // // // //           setOpen={setStateOpen}
// // // // // // // // //           setValue={setState}
// // // // // // // // //           placeholder="-- Select State --"
// // // // // // // // //           style={styles.dropdownBox}
// // // // // // // // //           dropDownContainerStyle={styles.dropdownList}
// // // // // // // // //           zIndex={3000}
// // // // // // // // //           zIndexInverse={1000}
// // // // // // // // //           listMode="SCROLLVIEW"
// // // // // // // // //           onChangeValue={(v) => {
// // // // // // // // //             setState(v);
// // // // // // // // //             setDistrict("");
// // // // // // // // //             setSubDistrict("");
// // // // // // // // //           }}
// // // // // // // // //         />

// // // // // // // // //         {/* District */}
// // // // // // // // //         <GlobalText medium style={styles.label}>District</GlobalText>
// // // // // // // // //         <DropDownPicker
// // // // // // // // //           open={districtOpen}
// // // // // // // // //           value={district}
// // // // // // // // //           items={districtItems}
// // // // // // // // //           setOpen={setDistrictOpen}
// // // // // // // // //           setValue={setDistrict}
// // // // // // // // //           placeholder="-- Select District --"
// // // // // // // // //           style={styles.dropdownBox}
// // // // // // // // //           dropDownContainerStyle={styles.dropdownList}
// // // // // // // // //           zIndex={2000}
// // // // // // // // //           zIndexInverse={2000}
// // // // // // // // //           listMode="SCROLLVIEW"
// // // // // // // // //           disabled={!state}
// // // // // // // // //           onChangeValue={(v) => {
// // // // // // // // //             setDistrict(v);
// // // // // // // // //             setSubDistrict("");
// // // // // // // // //           }}
// // // // // // // // //         />

// // // // // // // // //         {/* Sub-District */}
// // // // // // // // //         <GlobalText medium style={styles.label}>Sub-District</GlobalText>
// // // // // // // // //         <DropDownPicker
// // // // // // // // //           open={subDistrictOpen}
// // // // // // // // //           value={subDistrict}
// // // // // // // // //           items={subDistrictItems}
// // // // // // // // //           setOpen={setSubDistrictOpen}
// // // // // // // // //           setValue={setSubDistrict}
// // // // // // // // //           placeholder="-- Select Sub-District --"
// // // // // // // // //           style={styles.dropdownBox}
// // // // // // // // //           dropDownContainerStyle={styles.dropdownList}
// // // // // // // // //           listMode="SCROLLVIEW"
// // // // // // // // //           zIndex={1000}
// // // // // // // // //           zIndexInverse={3000}
// // // // // // // // //           disabled={!district}
// // // // // // // // //         />

// // // // // // // // //         {/* More Inputs */}
// // // // // // // // //         <InputBox icon={<Landmark size={18} color="#20A68B" />} placeholder="Nearby Landmark" value={landmark} onChange={setLandmark} />
// // // // // // // // //         <InputBox icon={<Ruler size={18} color="#20A68B" />} placeholder="Property Size in Sqft" value={sqft} onChange={setSqft} keyboardType="numeric" />
// // // // // // // // //         <InputBox icon={<Map size={18} color="#20A68B" />} placeholder="Google Maps Link" value={mapLocation} onChange={setMapLocation} />
// // // // // // // // //         <InputBox icon={<Bed size={18} color="#20A68B" />} placeholder="Bedrooms" value={bedrooms} onChange={setBedrooms} keyboardType="numeric" />
// // // // // // // // //         <InputBox icon={<Bath size={18} color="#20A68B" />} placeholder="Bathrooms" value={bathrooms} onChange={setBathrooms} keyboardType="numeric" />
// // // // // // // // //         <InputBox icon={<UtensilsCrossed size={18} color="#20A68B" />} placeholder="Kitchen (Yes/No)" value={kitchen} onChange={setKitchen} />
// // // // // // // // //         <InputBox icon={<ClipboardList size={18} color="#20A68B" />} placeholder="Amenities" value={amenities} onChange={setAmenities} />
// // // // // // // // //         <InputBox icon={<Sofa size={18} color="#20A68B" />} placeholder="Interior Details" value={interior} onChange={setInterior} multiline height={80} />
// // // // // // // // //         <InputBox icon={<Wrench size={18} color="#20A68B" />} placeholder="Construction Details" value={construction} onChange={setConstruction} multiline height={80} />

// // // // // // // // //         {/* 🖼️ Image Upload */}
// // // // // // // // //         <TouchableOpacity style={styles.uploadBox} onPress={handleImagePick}>
// // // // // // // // //           <Upload size={20} color="#20A68B" />
// // // // // // // // //           <GlobalText semiBold style={styles.uploadText}>Upload Images</GlobalText>
// // // // // // // // //         </TouchableOpacity>

// // // // // // // // //         <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
// // // // // // // // //           {images.map((img, i) => (
// // // // // // // // //             <View key={i} style={{ position: "relative", margin: 5 }}>
// // // // // // // // //               <Image source={{ uri: img }} style={styles.uploaded} />
// // // // // // // // //               <TouchableOpacity style={styles.deleteBtn} onPress={() => removeImage(i)}>
// // // // // // // // //                 <Trash2 size={18} color="red" />
// // // // // // // // //               </TouchableOpacity>
// // // // // // // // //             </View>
// // // // // // // // //           ))}
// // // // // // // // //         </View>

// // // // // // // // //         {/* ✅ Submit */}
// // // // // // // // //         <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
// // // // // // // // //           <GlobalText bold style={styles.submitText}>
// // // // // // // // //             {editingProperty ? "Update Property" : "Add Property"}
// // // // // // // // //           </GlobalText>
// // // // // // // // //         </TouchableOpacity>
// // // // // // // // //       </ScrollView>
// // // // // // // // //     </SafeAreaView>
// // // // // // // // //   );
// // // // // // // // // }

// // // // // // // // // // 🧱 Reusable Input Component
// // // // // // // // // function InputBox({ icon, placeholder, value, onChange, keyboardType, multiline, height }) {
// // // // // // // // //   return (
// // // // // // // // //     <View style={styles.inputBox}>
// // // // // // // // //       <View style={styles.inputRow}>
// // // // // // // // //         {icon}
// // // // // // // // //         <TextInput
// // // // // // // // //           placeholder={placeholder}
// // // // // // // // //           placeholderTextColor="#888"
// // // // // // // // //           style={[styles.inputField, { height: height || 45 }]}
// // // // // // // // //           value={value}
// // // // // // // // //           onChangeText={onChange}
// // // // // // // // //           keyboardType={keyboardType || "default"}
// // // // // // // // //           multiline={multiline}
// // // // // // // // //         />
// // // // // // // // //       </View>
// // // // // // // // //     </View>
// // // // // // // // //   );
// // // // // // // // // }

// // // // // // // // // // 🎨 Styles
// // // // // // // // // const styles = StyleSheet.create({
// // // // // // // // //   safeArea: { flex: 1, backgroundColor: "#f9f9f9" },
// // // // // // // // //   headerContainer: {
// // // // // // // // //     paddingVertical: 12,
// // // // // // // // //     elevation: 6,
// // // // // // // // //     borderBottomLeftRadius: 20,
// // // // // // // // //     borderBottomRightRadius: 20,
// // // // // // // // //   },
// // // // // // // // //   header: {
// // // // // // // // //     flexDirection: "row",
// // // // // // // // //     alignItems: "center",
// // // // // // // // //     justifyContent: "space-between",
// // // // // // // // //     paddingHorizontal: 16,
// // // // // // // // //   },
// // // // // // // // //   headerTitle: { fontSize: 18, color: "#fff" },
// // // // // // // // //   label: { fontSize: 14, marginBottom: 6, color: "#333" },
// // // // // // // // //   inputBox: {
// // // // // // // // //     borderWidth: 1,
// // // // // // // // //     borderColor: "#20A68B",
// // // // // // // // //     borderRadius: 10,
// // // // // // // // //     backgroundColor: "#fff",
// // // // // // // // //     marginBottom: 15,
// // // // // // // // //     paddingHorizontal: 10,
// // // // // // // // //   },
// // // // // // // // //   inputRow: { flexDirection: "row", alignItems: "center" },
// // // // // // // // //   inputField: { flex: 1, paddingHorizontal: 8, color: "#000", fontSize: 14 },
// // // // // // // // //   dropdownBox: {
// // // // // // // // //     borderColor: "#20A68B",
// // // // // // // // //     borderWidth: 1.5,
// // // // // // // // //     borderRadius: 10,
// // // // // // // // //     backgroundColor: "#fff",
// // // // // // // // //     marginBottom: 15,
// // // // // // // // //   },
// // // // // // // // //   dropdownList: {
// // // // // // // // //     borderColor: "#20A68B",
// // // // // // // // //     borderWidth: 1,
// // // // // // // // //     borderRadius: 10,
// // // // // // // // //   },
// // // // // // // // //   uploadBox: {
// // // // // // // // //     flexDirection: "row",
// // // // // // // // //     alignItems: "center",
// // // // // // // // //     justifyContent: "center",
// // // // // // // // //     borderWidth: 1,
// // // // // // // // //     borderColor: "#20A68B",
// // // // // // // // //     borderRadius: 10,
// // // // // // // // //     height: 55,
// // // // // // // // //     marginBottom: 20,
// // // // // // // // //     backgroundColor: "#fff",
// // // // // // // // //   },
// // // // // // // // //   uploadText: { color: "#20A68B", marginLeft: 8, fontSize: 14 },
// // // // // // // // //   uploaded: { width: 100, height: 100, borderRadius: 10 },
// // // // // // // // //   deleteBtn: {
// // // // // // // // //     position: "absolute",
// // // // // // // // //     top: -6,
// // // // // // // // //     right: -6,
// // // // // // // // //     backgroundColor: "#fff",
// // // // // // // // //     borderRadius: 20,
// // // // // // // // //     padding: 2,
// // // // // // // // //   },
// // // // // // // // //   submitBtn: {
// // // // // // // // //     backgroundColor: "#20A68B",
// // // // // // // // //     borderRadius: 12,
// // // // // // // // //     paddingVertical: 15,
// // // // // // // // //     alignItems: "center",
// // // // // // // // //     marginTop: 10,
// // // // // // // // //   },
// // // // // // // // //   submitText: { color: "#fff", fontSize: 15 },
// // // // // // // // // });

// // // // // // // // // // import React, { useState } from "react";
// // // // // // // // // // import {
// // // // // // // // // //   View,
// // // // // // // // // //   TextInput,
// // // // // // // // // //   StyleSheet,
// // // // // // // // // //   ScrollView,
// // // // // // // // // //   TouchableOpacity,
// // // // // // // // // //   Image,
// // // // // // // // // //   Alert,
// // // // // // // // // // } from "react-native";
// // // // // // // // // // import LinearGradient from "react-native-linear-gradient";
// // // // // // // // // // import { SafeAreaView } from "react-native-safe-area-context";
// // // // // // // // // // import { useTheme } from "@react-navigation/native";
// // // // // // // // // // import { launchCamera, launchImageLibrary } from "react-native-image-picker";
// // // // // // // // // // import DropDownPicker from "react-native-dropdown-picker";
// // // // // // // // // // import AnimatedBackground from "../../components/ReusableComponents/AnimatedBackground";
// // // // // // // // // // import { addProperty, updateProperty } from "../../api/api.js";
// // // // // // // // // // import GlobalText from "../../theme/GlobalText"; // ✅ Global Poppins font

// // // // // // // // // // // ✅ Lucide Icons
// // // // // // // // // // import {
// // // // // // // // // //   ArrowLeft,
// // // // // // // // // //   Home,
// // // // // // // // // //   IndianRupee,
// // // // // // // // // //   Phone,
// // // // // // // // // //   MapPin,
// // // // // // // // // //   Landmark,
// // // // // // // // // //   Ruler,
// // // // // // // // // //   Map,
// // // // // // // // // //   Bed,
// // // // // // // // // //   Bath,
// // // // // // // // // //   UtensilsCrossed,
// // // // // // // // // //   ClipboardList,
// // // // // // // // // //   Sofa,
// // // // // // // // // //   Wrench,
// // // // // // // // // //   Upload,
// // // // // // // // // //   Trash2,
// // // // // // // // // // } from "lucide-react-native";

// // // // // // // // // // // ✅ Location constants
// // // // // // // // // // import states from "../../constants/locations/state";
// // // // // // // // // // import districts from "../../constants/locations/districts";
// // // // // // // // // // import subDistricts from "../../constants/locations/subDistricts";

// // // // // // // // // // export default function AddPropertyScreen({ route, navigation }) {
// // // // // // // // // //   const { colors } = useTheme();
// // // // // // // // // //   const editingProperty = route?.params?.property || null;

// // // // // // // // // //   // form states
// // // // // // // // // //   const [title, setTitle] = useState(editingProperty?.title || "");
// // // // // // // // // //   const [price, setPrice] = useState(editingProperty?.price?.toString() || "");
// // // // // // // // // //   const [contact, setContact] = useState(editingProperty?.contact?.toString() || "");
// // // // // // // // // //   const [location, setLocation] = useState(editingProperty?.location || "");
// // // // // // // // // //   const [mapLocation, setMapLocation] = useState(editingProperty?.mapLocation || "");
// // // // // // // // // //   const [landmark, setLandmark] = useState(editingProperty?.landmark || "");
// // // // // // // // // //   const [sqft, setSqft] = useState(editingProperty?.sqft?.toString() || "");
// // // // // // // // // //   const [bedrooms, setBedrooms] = useState(editingProperty?.bedrooms?.toString() || "1");
// // // // // // // // // //   const [bathrooms, setBathrooms] = useState(editingProperty?.bathrooms?.toString() || "1");
// // // // // // // // // //   const [kitchen, setKitchen] = useState(editingProperty?.kitchen || "Yes");
// // // // // // // // // //   const [amenities, setAmenities] = useState(editingProperty?.amenities || "");
// // // // // // // // // //   const [interior, setInterior] = useState(editingProperty?.interior || "");
// // // // // // // // // //   const [construction, setConstruction] = useState(editingProperty?.construction || "");
// // // // // // // // // //   const [images, setImages] = useState(editingProperty?.images || []);
// // // // // // // // // //   const [category, setCategory] = useState(editingProperty?.category || "House");

// // // // // // // // // //   // dropdowns
// // // // // // // // // //   const [state, setState] = useState(editingProperty?.state || "");
// // // // // // // // // //   const [district, setDistrict] = useState(editingProperty?.district || "");
// // // // // // // // // //   const [subDistrict, setSubDistrict] = useState(editingProperty?.subDistrict || "");

// // // // // // // // // //   const [stateOpen, setStateOpen] = useState(false);
// // // // // // // // // //   const [districtOpen, setDistrictOpen] = useState(false);
// // // // // // // // // //   const [subDistrictOpen, setSubDistrictOpen] = useState(false);
// // // // // // // // // //   const [categoryOpen, setCategoryOpen] = useState(false);

// // // // // // // // // //   // dropdown data
// // // // // // // // // //   const stateItems = states.map((s) => ({ label: s, value: s }));
// // // // // // // // // //   const districtItems = state ? (districts[state] || []).map((d) => ({ label: d, value: d })) : [];
// // // // // // // // // //   const subDistrictItems = district ? (subDistricts[district] || []).map((sd) => ({ label: sd, value: sd })) : [];

// // // // // // // // // //   // image picker
// // // // // // // // // //   const handleImagePick = () =>
// // // // // // // // // //     Alert.alert("Upload Image", "Choose an option", [
// // // // // // // // // //       {
// // // // // // // // // //         text: "Camera",
// // // // // // // // // //         onPress: () =>
// // // // // // // // // //           launchCamera({ mediaType: "photo" }, (res) => {
// // // // // // // // // //             if (res.assets) setImages([...images, res.assets[0].uri]);
// // // // // // // // // //           }),
// // // // // // // // // //       },
// // // // // // // // // //       {
// // // // // // // // // //         text: "Gallery",
// // // // // // // // // //         onPress: () =>
// // // // // // // // // //           launchImageLibrary({ mediaType: "photo", selectionLimit: 5 }, (res) => {
// // // // // // // // // //             if (res.assets) setImages([...images, ...res.assets.map((a) => a.uri)]);
// // // // // // // // // //           }),
// // // // // // // // // //       },
// // // // // // // // // //       { text: "Cancel", style: "cancel" },
// // // // // // // // // //     ]);

// // // // // // // // // //   const removeImage = (index) => {
// // // // // // // // // //     const updated = [...images];
// // // // // // // // // //     updated.splice(index, 1);
// // // // // // // // // //     setImages(updated);
// // // // // // // // // //   };

// // // // // // // // // //   // ✅ Submit handler
// // // // // // // // // //   const handleSubmit = async () => {
// // // // // // // // // //     try {
// // // // // // // // // //       if (!title || !price || !contact || !location || !district || !state || !category) {
// // // // // // // // // //         Alert.alert("Missing Fields", "Please fill all required fields");
// // // // // // // // // //         return;
// // // // // // // // // //       }

// // // // // // // // // //       const propertyPayload = {
// // // // // // // // // //         title,
// // // // // // // // // //         price,
// // // // // // // // // //         contact: Number(contact),
// // // // // // // // // //         location,
// // // // // // // // // //         mapLocation,
// // // // // // // // // //         district,
// // // // // // // // // //         subDistrict,
// // // // // // // // // //         state,
// // // // // // // // // //         landmark,
// // // // // // // // // //         sqft,
// // // // // // // // // //         bedrooms,
// // // // // // // // // //         bathrooms,
// // // // // // // // // //         kitchen,
// // // // // // // // // //         amenities,
// // // // // // // // // //         interior,
// // // // // // // // // //         construction,
// // // // // // // // // //         images,
// // // // // // // // // //         category,
// // // // // // // // // //       };

// // // // // // // // // //       let res;
// // // // // // // // // //       if (editingProperty) {
// // // // // // // // // //         res = await updateProperty(editingProperty._id, propertyPayload);
// // // // // // // // // //         // Alert.alert("Success", "Property updated successfully!");
// // // // // // // // // //       } else {
// // // // // // // // // //         res = await addProperty(propertyPayload);
// // // // // // // // // //         // Alert.alert("Success", "Property added successfully!");
// // // // // // // // // //       }

// // // // // // // // // //       navigation.reset({
// // // // // // // // // //         index: 0,
// // // // // // // // // //         routes: [{ name: "Success" }],
// // // // // // // // // //       });
// // // // // // // // // //     } catch (err) {
// // // // // // // // // //       console.error("Property save error:", err.response?.data || err.message);
// // // // // // // // // //       Alert.alert("Error", err.response?.data?.error || "Failed to save property");
// // // // // // // // // //     }
// // // // // // // // // //   };

// // // // // // // // // //   return (
// // // // // // // // // //     <SafeAreaView style={styles.safeArea}>
// // // // // // // // // //       <AnimatedBackground />

// // // // // // // // // //       {/* 🔹 Header */}
// // // // // // // // // //       <LinearGradient colors={["#43C6AC", "#20A68B"]} style={styles.headerContainer}>
// // // // // // // // // //         <View style={styles.header}>
// // // // // // // // // //           <TouchableOpacity onPress={() => navigation.goBack()}>
// // // // // // // // // //             <ArrowLeft size={24} color="#fff" />
// // // // // // // // // //           </TouchableOpacity>
// // // // // // // // // //           <GlobalText bold style={styles.headerTitle}>
// // // // // // // // // //             {editingProperty ? "Edit Property" : "Add Property"}
// // // // // // // // // //           </GlobalText>
// // // // // // // // // //           <View style={{ width: 24 }} />
// // // // // // // // // //         </View>
// // // // // // // // // //       </LinearGradient>

// // // // // // // // // //       {/* 🔹 Form */}
// // // // // // // // // //       <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
// // // // // // // // // //         <GlobalText medium style={styles.label}>Category</GlobalText>
// // // // // // // // // //         <DropDownPicker
// // // // // // // // // //           open={categoryOpen}
// // // // // // // // // //           value={category}
// // // // // // // // // //           items={[
// // // // // // // // // //             { label: "House", value: "House" },
// // // // // // // // // //             { label: "Apartment", value: "Apartment" },
// // // // // // // // // //             { label: "Office", value: "Office" },
// // // // // // // // // //             { label: "Land", value: "Land" },
// // // // // // // // // //             { label: "Sites", value: "Sites" },
// // // // // // // // // //             { label: "Godown", value: "Godown" },
// // // // // // // // // //             { label: "Factory", value: "Factory" },
// // // // // // // // // //           ]}
// // // // // // // // // //           setOpen={setCategoryOpen}
// // // // // // // // // //           setValue={setCategory}
// // // // // // // // // //           placeholder="-- Select Category --"
// // // // // // // // // //           style={styles.dropdownBox}
// // // // // // // // // //           dropDownContainerStyle={styles.dropdownList}
// // // // // // // // // //           zIndex={4000}
// // // // // // // // // //           zIndexInverse={4000}
// // // // // // // // // //           listMode="SCROLLVIEW"
// // // // // // // // // //         />

// // // // // // // // // //         {/* Inputs */}
// // // // // // // // // //         <InputBox icon={<Home size={18} color="#20A68B" />} placeholder="Property Title" value={title} onChange={setTitle} />
// // // // // // // // // //         <InputBox icon={<IndianRupee size={18} color="#20A68B" />} placeholder="Price" value={price} onChange={setPrice} keyboardType="numeric" />
// // // // // // // // // //         <InputBox icon={<Phone size={18} color="#20A68B" />} placeholder="Contact Number" value={contact} onChange={setContact} keyboardType="phone-pad" />
// // // // // // // // // //         <InputBox icon={<MapPin size={18} color="#20A68B" />} placeholder="Address" value={location} onChange={setLocation} />

// // // // // // // // // //         <GlobalText medium style={styles.label}>State</GlobalText>
// // // // // // // // // //         <DropDownPicker
// // // // // // // // // //           open={stateOpen}
// // // // // // // // // //           value={state}
// // // // // // // // // //           items={stateItems}
// // // // // // // // // //           setOpen={setStateOpen}
// // // // // // // // // //           setValue={setState}
// // // // // // // // // //           placeholder="-- Select State --"
// // // // // // // // // //           style={styles.dropdownBox}
// // // // // // // // // //           dropDownContainerStyle={styles.dropdownList}
// // // // // // // // // //           zIndex={3000}
// // // // // // // // // //           zIndexInverse={1000}
// // // // // // // // // //           listMode="SCROLLVIEW"
// // // // // // // // // //           onChangeValue={(v) => {
// // // // // // // // // //             setState(v);
// // // // // // // // // //             setDistrict("");
// // // // // // // // // //             setSubDistrict("");
// // // // // // // // // //           }}
// // // // // // // // // //         />

// // // // // // // // // //         <GlobalText medium style={styles.label}>District</GlobalText>
// // // // // // // // // //         <DropDownPicker
// // // // // // // // // //           open={districtOpen}
// // // // // // // // // //           value={district}
// // // // // // // // // //           items={districtItems}
// // // // // // // // // //           setOpen={setDistrictOpen}
// // // // // // // // // //           setValue={setDistrict}
// // // // // // // // // //           placeholder="-- Select District --"
// // // // // // // // // //           style={styles.dropdownBox}
// // // // // // // // // //           dropDownContainerStyle={styles.dropdownList}
// // // // // // // // // //           zIndex={2000}
// // // // // // // // // //           zIndexInverse={2000}
// // // // // // // // // //           listMode="SCROLLVIEW"
// // // // // // // // // //           disabled={!state}
// // // // // // // // // //           onChangeValue={(v) => {
// // // // // // // // // //             setDistrict(v);
// // // // // // // // // //             setSubDistrict("");
// // // // // // // // // //           }}
// // // // // // // // // //         />

// // // // // // // // // //         <GlobalText medium style={styles.label}>Sub-District</GlobalText>
// // // // // // // // // //         <DropDownPicker
// // // // // // // // // //           open={subDistrictOpen}
// // // // // // // // // //           value={subDistrict}
// // // // // // // // // //           items={subDistrictItems}
// // // // // // // // // //           setOpen={setSubDistrictOpen}
// // // // // // // // // //           setValue={setSubDistrict}
// // // // // // // // // //           placeholder="-- Select Sub-District --"
// // // // // // // // // //           style={styles.dropdownBox}
// // // // // // // // // //           dropDownContainerStyle={styles.dropdownList}
// // // // // // // // // //           listMode="SCROLLVIEW"
// // // // // // // // // //           zIndex={1000}
// // // // // // // // // //           zIndexInverse={3000}
// // // // // // // // // //           disabled={!district}
// // // // // // // // // //         />

// // // // // // // // // //         <InputBox icon={<Landmark size={18} color="#20A68B" />} placeholder="Nearby Landmark" value={landmark} onChange={setLandmark} />
// // // // // // // // // //         <InputBox icon={<Ruler size={18} color="#20A68B" />} placeholder="Property Size in Sqft" value={sqft} onChange={setSqft} keyboardType="numeric" />
// // // // // // // // // //         <InputBox icon={<Map size={18} color="#20A68B" />} placeholder="Google Maps Link" value={mapLocation} onChange={setMapLocation} />
// // // // // // // // // //         <InputBox icon={<Bed size={18} color="#20A68B" />} placeholder="Bedrooms" value={bedrooms} onChange={setBedrooms} keyboardType="numeric" />
// // // // // // // // // //         <InputBox icon={<Bath size={18} color="#20A68B" />} placeholder="Bathrooms" value={bathrooms} onChange={setBathrooms} keyboardType="numeric" />
// // // // // // // // // //         <InputBox icon={<UtensilsCrossed size={18} color="#20A68B" />} placeholder="Kitchen (Yes/No)" value={kitchen} onChange={setKitchen} />
// // // // // // // // // //         <InputBox icon={<ClipboardList size={18} color="#20A68B" />} placeholder="Amenities" value={amenities} onChange={setAmenities} />
// // // // // // // // // //         <InputBox icon={<Sofa size={18} color="#20A68B" />} placeholder="Interior Details" value={interior} onChange={setInterior} multiline height={80} />
// // // // // // // // // //         <InputBox icon={<Wrench size={18} color="#20A68B" />} placeholder="Construction Details" value={construction} onChange={setConstruction} multiline height={80} />

// // // // // // // // // //         {/* Image Upload */}
// // // // // // // // // //         <TouchableOpacity style={styles.uploadBox} onPress={handleImagePick}>
// // // // // // // // // //           <Upload size={20} color="#20A68B" />
// // // // // // // // // //           <GlobalText semiBold style={styles.uploadText}>Upload Images</GlobalText>
// // // // // // // // // //         </TouchableOpacity>

// // // // // // // // // //         <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
// // // // // // // // // //           {images.map((img, i) => (
// // // // // // // // // //             <View key={i} style={{ position: "relative", margin: 5 }}>
// // // // // // // // // //               <Image source={{ uri: img }} style={styles.uploaded} />
// // // // // // // // // //               <TouchableOpacity style={styles.deleteBtn} onPress={() => removeImage(i)}>
// // // // // // // // // //                 <Trash2 size={18} color="red" />
// // // // // // // // // //               </TouchableOpacity>
// // // // // // // // // //             </View>
// // // // // // // // // //           ))}
// // // // // // // // // //         </View>

// // // // // // // // // //         {/* Submit */}
// // // // // // // // // //         <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
// // // // // // // // // //           <GlobalText bold style={styles.submitText}>
// // // // // // // // // //             {editingProperty ? "Update Property" : "Add Property"}
// // // // // // // // // //           </GlobalText>
// // // // // // // // // //         </TouchableOpacity>
// // // // // // // // // //       </ScrollView>
// // // // // // // // // //     </SafeAreaView>
// // // // // // // // // //   );
// // // // // // // // // // }

// // // // // // // // // // // ✅ Reusable Input
// // // // // // // // // // function InputBox({ icon, placeholder, value, onChange, keyboardType, multiline, height }) {
// // // // // // // // // //   return (
// // // // // // // // // //     <View style={styles.inputBox}>
// // // // // // // // // //       <View style={styles.inputRow}>
// // // // // // // // // //         {icon}
// // // // // // // // // //         <TextInput
// // // // // // // // // //           placeholder={placeholder}
// // // // // // // // // //           placeholderTextColor="#888"
// // // // // // // // // //           style={[styles.inputField, { height: height || 45 }]}
// // // // // // // // // //           value={value}
// // // // // // // // // //           onChangeText={onChange}
// // // // // // // // // //           keyboardType={keyboardType || "default"}
// // // // // // // // // //           multiline={multiline}
// // // // // // // // // //         />
// // // // // // // // // //       </View>
// // // // // // // // // //     </View>
// // // // // // // // // //   );
// // // // // // // // // // }

// // // // // // // // // // // ✅ Styles
// // // // // // // // // // const styles = StyleSheet.create({
// // // // // // // // // //   safeArea: { flex: 1, backgroundColor: "#f9f9f9" },
// // // // // // // // // //   headerContainer: {
// // // // // // // // // //     paddingVertical: 12,
// // // // // // // // // //     elevation: 6,
// // // // // // // // // //     borderBottomLeftRadius: 20,
// // // // // // // // // //     borderBottomRightRadius: 20,
// // // // // // // // // //   },
// // // // // // // // // //   header: {
// // // // // // // // // //     flexDirection: "row",
// // // // // // // // // //     alignItems: "center",
// // // // // // // // // //     justifyContent: "space-between",
// // // // // // // // // //     paddingHorizontal: 16,
// // // // // // // // // //   },
// // // // // // // // // //   headerTitle: {
// // // // // // // // // //     fontSize: 18,
// // // // // // // // // //     color: "#fff",
// // // // // // // // // //   },
// // // // // // // // // //   label: {
// // // // // // // // // //     fontSize: 14,
// // // // // // // // // //     marginBottom: 6,
// // // // // // // // // //     color: "#333",
// // // // // // // // // //   },
// // // // // // // // // //   inputBox: {
// // // // // // // // // //     borderWidth: 1,
// // // // // // // // // //     borderColor: "#20A68B",
// // // // // // // // // //     borderRadius: 10,
// // // // // // // // // //     backgroundColor: "#fff",
// // // // // // // // // //     marginBottom: 15,
// // // // // // // // // //     paddingHorizontal: 10,
// // // // // // // // // //   },
// // // // // // // // // //   inputRow: { flexDirection: "row", alignItems: "center" },
// // // // // // // // // //   inputField: {
// // // // // // // // // //     flex: 1,
// // // // // // // // // //     paddingHorizontal: 8,
// // // // // // // // // //     color: "#000",
// // // // // // // // // //     fontSize: 14,
// // // // // // // // // //   },
// // // // // // // // // //   dropdownBox: {
// // // // // // // // // //     borderColor: "#20A68B",
// // // // // // // // // //     borderWidth: 1.5,
// // // // // // // // // //     borderRadius: 10,
// // // // // // // // // //     backgroundColor: "#fff",
// // // // // // // // // //     marginBottom: 15,
// // // // // // // // // //   },
// // // // // // // // // //   dropdownList: {
// // // // // // // // // //     borderColor: "#20A68B",
// // // // // // // // // //     borderWidth: 1,
// // // // // // // // // //     borderRadius: 10,
// // // // // // // // // //   },
// // // // // // // // // //   uploadBox: {
// // // // // // // // // //     flexDirection: "row",
// // // // // // // // // //     alignItems: "center",
// // // // // // // // // //     justifyContent: "center",
// // // // // // // // // //     borderWidth: 1,
// // // // // // // // // //     borderColor: "#20A68B",
// // // // // // // // // //     borderRadius: 10,
// // // // // // // // // //     height: 55,
// // // // // // // // // //     marginBottom: 20,
// // // // // // // // // //     backgroundColor: "#fff",
// // // // // // // // // //   },
// // // // // // // // // //   uploadText: { color: "#20A68B", marginLeft: 8, fontSize: 14 },
// // // // // // // // // //   uploaded: { width: 100, height: 100, borderRadius: 10 },
// // // // // // // // // //   deleteBtn: {
// // // // // // // // // //     position: "absolute",
// // // // // // // // // //     top: -6,
// // // // // // // // // //     right: -6,
// // // // // // // // // //     backgroundColor: "#fff",
// // // // // // // // // //     borderRadius: 20,
// // // // // // // // // //     padding: 2,
// // // // // // // // // //   },
// // // // // // // // // //   submitBtn: {
// // // // // // // // // //     backgroundColor: "#20A68B",
// // // // // // // // // //     borderRadius: 12,
// // // // // // // // // //     paddingVertical: 15,
// // // // // // // // // //     alignItems: "center",
// // // // // // // // // //     marginTop: 10,
// // // // // // // // // //   },
// // // // // // // // // //   submitText: { color: "#fff", fontSize: 15 },
// // // // // // // // // // });
