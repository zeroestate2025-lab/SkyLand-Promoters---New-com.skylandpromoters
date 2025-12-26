import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  SafeAreaView,
  BackHandler,
  useColorScheme,
} from "react-native";
import Slider from "@react-native-assets/slider";
import DropDownPicker from "react-native-dropdown-picker";
import GlobalText from "../../theme/GlobalText";
import { navigate } from "../../navigation/navigationRef";
import states from "../../constants/locations/state";
import districts from "../../constants/locations/districts";
import subDistricts from "../../constants/locations/subDistricts";
import propertyTypes from "../../constants/propertyTypes";

export default function FilterModal({ visible, onClose, currentFilters = {} }) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const brandPrimary = "#43C6AC";
  const brandSecondary = "#20A68B";
  const borderColor = isDark ? "#444" : "#C8E6DC";

  const [size, setSize] = useState(currentFilters.size || 10000);
  const [minPrice, setMinPrice] = useState(currentFilters.minPrice || 5000);
  const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice || 15000);
  const [propertyType, setPropertyType] = useState(
    currentFilters.propertyType || null
  );
  const [propertyPreference, setPropertyPreference] = useState(
    currentFilters.propertyPreference || null
  );
  const [state, setState] = useState(currentFilters.state || "");
  const [district, setDistrict] = useState(currentFilters.district || "");
  const [subDistrict, setSubDistrict] = useState(
    currentFilters.subDistrict || ""
  );
  const [bedrooms, setBedrooms] = useState(currentFilters.bedrooms || "");
  const [bathrooms, setBathrooms] = useState(currentFilters.bathrooms || "");
  const [kitchen, setKitchen] = useState(currentFilters.kitchen || "");

  const [stateOpen, setStateOpen] = useState(false);
  const [districtOpen, setDistrictOpen] = useState(false);
  const [subDistrictOpen, setSubDistrictOpen] = useState(false);
  const [bedroomOpen, setBedroomOpen] = useState(false);
  const [bathroomOpen, setBathroomOpen] = useState(false);
  const [kitchenOpen, setKitchenOpen] = useState(false);

  const handleBackPress = useCallback(() => {
    if (visible) {
      onClose();
      return true;
    }
    return false;
  }, [visible, onClose]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );
    return () => backHandler.remove();
  }, [handleBackPress]);

  const stateItems = states.map((s) => ({ label: s, value: s }));
  const districtItems = state
    ? (districts[state] || []).map((d) => ({ label: d, value: d }))
    : [];
  const subDistrictItems = district
    ? (subDistricts[district] || []).map((sd) => ({ label: sd, value: sd }))
    : [];

  const bedroomItems = ["1", "2", "3", "4+"].map((b) => ({
    label: b,
    value: b,
  }));
  const bathroomItems = ["1", "2", "3", "4+"].map((b) => ({
    label: b,
    value: b,
  }));
  const kitchenItems = ["Yes", "No"].map((k) => ({ label: k, value: k }));

  const applyFilters = () => {
    onClose();
    setTimeout(() => {
      navigate("MatchedProperties", {
        filters: {
          propertyType,
          propertyPreference, // ✅ keeps Sale/Rent backend logic same
          size,
          minPrice,
          maxPrice,
          state,
          district,
          subDistrict,
          bedrooms,
          bathrooms,
          kitchen,
        },
      });
    }, 300);
  };

  const resetFilters = () => {
    setSize(10000);
    setMinPrice(5000);
    setMaxPrice(15000);
    setPropertyType(null);
    setPropertyPreference(null);
    setState("");
    setDistrict("");
    setSubDistrict("");
    setBedrooms("");
    setBathrooms("");
    setKitchen("");
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <SafeAreaView style={styles.safeView}>
        <View style={styles.overlay}>
          <View
            style={[
              styles.container,
              { backgroundColor: isDark ? "#1E1E1E" : "#fff" },
            ]}
          >
            <GlobalText
              style={[styles.title, { color: isDark ? "#AEECE1" : "#20A68B" }]}
            >
              🎯 Filter Properties
            </GlobalText>

            <ScrollView
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 100 }}
            >
              {/* ✅ Property Preference Section */}
              <GlobalText
                style={[styles.subtitle, { color: isDark ? "#ddd" : "#333" }]}
              >
                Property Preference
              </GlobalText>
              <View style={styles.preferenceRow}>
                {[
                  { display: "Buy", value: "Sale" },
                  { display: "Rent", value: "Rent" },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    style={[
                      styles.preferenceBtn,
                      {
                        backgroundColor:
                          propertyPreference === item.value
                            ? brandPrimary
                            : isDark
                            ? "#2A2A2A"
                            : "#EAF8F5",
                      },
                    ]}
                    onPress={() =>
                      setPropertyPreference(
                        propertyPreference === item.value ? null : item.value
                      )
                    }
                  >
                    <GlobalText
                      style={{
                        color:
                          propertyPreference === item.value
                            ? "#fff"
                            : brandSecondary,
                        fontWeight: "600",
                      }}
                    >
                      {item.display}
                    </GlobalText>
                  </TouchableOpacity>
                ))}
              </View>

              {/* ✅ Property Type */}
              <GlobalText
                style={[styles.subtitle, { color: isDark ? "#ddd" : "#333" }]}
              >
                Property Type
              </GlobalText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 8 }}
              >
                {propertyTypes.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.typeBtn,
                      {
                        backgroundColor:
                          propertyType === type.name
                            ? brandPrimary
                            : isDark
                            ? "#2A2A2A"
                            : "#EAF8F5",
                      },
                    ]}
                    onPress={() =>
                      setPropertyType(
                        propertyType === type.name ? null : type.name
                      )
                    }
                  >
                    <GlobalText
                      style={{
                        color:
                          propertyType === type.name ? "#fff" : brandSecondary,
                        fontWeight: "600",
                      }}
                    >
                      {type.name}
                    </GlobalText>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* ✅ Location Filters */}
              <GlobalText
                style={[styles.subtitle, { color: isDark ? "#ddd" : "#333" }]}
              >
                Location
              </GlobalText>

              <DropDownPicker
                open={stateOpen}
                value={state}
                items={stateItems}
                setOpen={setStateOpen}
                setValue={setState}
                placeholder="Select State"
                style={[styles.dropdownBox, { borderColor }]}
                dropDownContainerStyle={styles.dropdownList}
                zIndex={3000}
                listMode="SCROLLVIEW"
                onChangeValue={(v) => {
                  setState(v);
                  setDistrict("");
                  setSubDistrict("");
                }}
              />

              <DropDownPicker
                open={districtOpen}
                value={district}
                items={districtItems}
                setOpen={setDistrictOpen}
                setValue={setDistrict}
                placeholder="Select District"
                style={[styles.dropdownBox, { borderColor }]}
                dropDownContainerStyle={styles.dropdownList}
                zIndex={2000}
                listMode="SCROLLVIEW"
                disabled={!state}
                onChangeValue={(v) => {
                  setDistrict(v);
                  setSubDistrict("");
                }}
              />

              <DropDownPicker
                open={subDistrictOpen}
                value={subDistrict}
                items={subDistrictItems}
                setOpen={setSubDistrictOpen}
                setValue={setSubDistrict}
                placeholder="Select Sub-District"
                style={[styles.dropdownBox, { borderColor }]}
                dropDownContainerStyle={styles.dropdownList}
                zIndex={1000}
                listMode="SCROLLVIEW"
                disabled={!district}
              />

              {/* ✅ Property Size */}
              <GlobalText
                style={[styles.subtitle, { color: isDark ? "#ddd" : "#333" }]}
              >
                Property Size
              </GlobalText>
              <Slider
                minimumValue={0}
                maximumValue={20000}
                step={100}
                value={size}
                onValueChange={setSize}
              />
              <GlobalText
                style={[styles.sliderValue, { color: brandPrimary }]}
              >
                Up to {size} sqft
              </GlobalText>

              {/* ✅ Price Range */}
              <GlobalText
                style={[styles.subtitle, { color: isDark ? "#ddd" : "#333" }]}
              >
                Price Range
              </GlobalText>
              <Slider
                minimumValue={0}
                maximumValue={5000000}
                step={1000}
                value={minPrice}
                onValueChange={setMinPrice}
              />
              <GlobalText
                style={[styles.sliderValue, { color: brandPrimary }]}
              >
                Min ₹{minPrice.toLocaleString()}
              </GlobalText>

              <Slider
                minimumValue={minPrice}
                maximumValue={10000000}
                step={1000}
                value={maxPrice}
                onValueChange={setMaxPrice}
              />
              <GlobalText
                style={[styles.sliderValue, { color: brandPrimary }]}
              >
                Max ₹{maxPrice.toLocaleString()}
              </GlobalText>
            </ScrollView>

            {/* ✅ Buttons */}
            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.resetBtn} onPress={resetFilters}>
                <GlobalText
                  style={{ color: brandPrimary, fontWeight: "600" }}
                >
                  Reset
                </GlobalText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.applyBtn, { backgroundColor: brandPrimary }]}
                onPress={applyFilters}
              >
                <GlobalText style={{ color: "#fff", fontWeight: "600" }}>
                  Apply Filters
                </GlobalText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeView: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  overlay: { flex: 1, justifyContent: "flex-end" },
  container: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: "90%",
  },
  title: {
    fontWeight: "700",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontWeight: "600",
    marginTop: 15,
  },
  preferenceRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginVertical: 8,
  },
  preferenceBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginRight: 10,
  },
  typeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
  },
  dropdownBox: {
    borderWidth: 1.5,
    borderRadius: 12,
    backgroundColor: "#fff",
    marginVertical: 8,
  },
  dropdownList: {
    borderColor: "#43C6AC",
    borderWidth: 1.5,
    borderRadius: 12,
    backgroundColor: "#E9FFF5",
    maxHeight: 200,
  },
  sliderValue: {
    textAlign: "right",
    marginTop: 4,
    fontWeight: "500",
  },
  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
  },
  resetBtn: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
  },
  applyBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});

// import React, { useState, useEffect, useCallback } from "react";
// import {
//   View,
//   StyleSheet,
//   TouchableOpacity,
//   Modal,
//   ScrollView,
//   SafeAreaView,
//   BackHandler,
//   useColorScheme,
// } from "react-native";
// import Slider from "@react-native-assets/slider";
// import DropDownPicker from "react-native-dropdown-picker";
// import GlobalText from "../../theme/GlobalText";
// import { navigate } from "../../navigation/navigationRef";
// import states from "../../constants/locations/state";
// import districts from "../../constants/locations/districts";
// import subDistricts from "../../constants/locations/subDistricts";
// import propertyTypes from "../../constants/propertyTypes";

// export default function FilterModal({ visible, onClose, currentFilters = {} }) {  const scheme = useColorScheme();
//   const isDark = scheme === "dark";
//   const brandPrimary = "#43C6AC";
//   const brandSecondary = "#20A68B";
//   const borderColor = isDark ? "#444" : "#C8E6DC";

//   const [size, setSize] = useState(currentFilters.size || 10000);
//   const [minPrice, setMinPrice] = useState(currentFilters.minPrice || 5000);
//   const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice || 15000);
//   const [propertyType, setPropertyType] = useState(currentFilters.propertyType || null);
//   const [propertyPreference, setPropertyPreference] = useState(
//     currentFilters.propertyPreference || null
//   );
//   const [state, setState] = useState(currentFilters.state || "");
//   const [district, setDistrict] = useState(currentFilters.district || "");
//   const [subDistrict, setSubDistrict] = useState(currentFilters.subDistrict || "");
//   const [bedrooms, setBedrooms] = useState(currentFilters.bedrooms || "");
//   const [bathrooms, setBathrooms] = useState(currentFilters.bathrooms || "");
//   const [kitchen, setKitchen] = useState(currentFilters.kitchen || "");

//   const [stateOpen, setStateOpen] = useState(false);
//   const [districtOpen, setDistrictOpen] = useState(false);
//   const [subDistrictOpen, setSubDistrictOpen] = useState(false);
//   const [bedroomOpen, setBedroomOpen] = useState(false);
//   const [bathroomOpen, setBathroomOpen] = useState(false);
//   const [kitchenOpen, setKitchenOpen] = useState(false);

//   const handleBackPress = useCallback(() => {
//     if (visible) {
//       onClose();
//       return true;
//     }
//     return false;
//   }, [visible, onClose]);

//   useEffect(() => {
//     const backHandler = BackHandler.addEventListener("hardwareBackPress", handleBackPress);
//     return () => backHandler.remove();
//   }, [handleBackPress]);

//   const stateItems = states.map((s) => ({ label: s, value: s }));
//   const districtItems = state
//     ? (districts[state] || []).map((d) => ({ label: d, value: d }))
//     : [];
//   const subDistrictItems = district
//     ? (subDistricts[district] || []).map((sd) => ({ label: sd, value: sd }))
//     : [];

//   const bedroomItems = ["1", "2", "3", "4+"].map((b) => ({ label: b, value: b }));
//   const bathroomItems = ["1", "2", "3", "4+"].map((b) => ({ label: b, value: b }));
//   const kitchenItems = ["Yes", "No"].map((k) => ({ label: k, value: k }));

//   const applyFilters = () => {
//     onClose();
//     setTimeout(() => {
//       navigate("MatchedProperties", {
//         filters: {
//           propertyType,
//           propertyPreference, // ✅ included in filter pass
//           size,
//           minPrice,
//           maxPrice,
//           state,
//           district,
//           subDistrict,
//           bedrooms,
//           bathrooms,
//           kitchen,
//         },
//       });
//     }, 300);
//   };

//   const resetFilters = () => {
//     setSize(10000);
//     setMinPrice(5000);
//     setMaxPrice(15000);
//     setPropertyType(null);
//     setPropertyPreference(null);
//     setState("");
//     setDistrict("");
//     setSubDistrict("");
//     setBedrooms("");
//     setBathrooms("");
//     setKitchen("");
//   };

//   return (
//     <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
//       <SafeAreaView style={styles.safeView}>
//         <View style={styles.overlay}>
//           <View
//             style={[
//               styles.container,
//               { backgroundColor: isDark ? "#1E1E1E" : "#fff" },
//             ]}
//           >
//             <GlobalText style={[styles.title, { color: isDark ? "#AEECE1" : "#20A68B" }]}>
//               🎯 Filter Properties
//             </GlobalText>

//             <ScrollView
//               nestedScrollEnabled
//               showsVerticalScrollIndicator={false}
//               contentContainerStyle={{ paddingBottom: 100 }}
//             >
//               {/* ✅ Property Preference Section */}
//               <GlobalText style={[styles.subtitle, { color: isDark ? "#ddd" : "#333" }]}>
//                 Property Preference
//               </GlobalText>
//               <View style={styles.preferenceRow}>
//                 {["Sale", "Rent"].map((type) => (
//                   <TouchableOpacity
//                     key={type}
//                     style={[
//                       styles.preferenceBtn,
//                       {
//                         backgroundColor:
//                           propertyPreference === type
//                             ? brandPrimary
//                             : isDark
//                             ? "#2A2A2A"
//                             : "#EAF8F5",
//                       },
//                     ]}
//                     onPress={() =>
//                       setPropertyPreference(
//                         propertyPreference === type ? null : type
//                       )
//                     }
//                   >
//                     <GlobalText
//                       style={{
//                         color:
//                           propertyPreference === type
//                             ? "#fff"
//                             : brandSecondary,
//                         fontWeight: "600",
//                       }}
//                     >
//                       {type}
//                     </GlobalText>
//                   </TouchableOpacity>
//                 ))}
//               </View>

//               {/* ✅ Property Type */}
//               <GlobalText style={[styles.subtitle, { color: isDark ? "#ddd" : "#333" }]}>
//                 Property Type
//               </GlobalText>
//               <ScrollView
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 contentContainerStyle={{ paddingVertical: 8 }}
//               >
//                 {propertyTypes.map((type) => (
//                   <TouchableOpacity
//                     key={type.id}
//                     style={[
//                       styles.typeBtn,
//                       {
//                         backgroundColor:
//                           propertyType === type.name
//                             ? brandPrimary
//                             : isDark
//                             ? "#2A2A2A"
//                             : "#EAF8F5",
//                       },
//                     ]}
//                     onPress={() =>
//                       setPropertyType(propertyType === type.name ? null : type.name)
//                     }
//                   >
//                     <GlobalText
//                       style={{
//                         color: propertyType === type.name ? "#fff" : brandSecondary,
//                         fontWeight: "600",
//                       }}
//                     >
//                       {type.name}
//                     </GlobalText>
//                   </TouchableOpacity>
//                 ))}
//               </ScrollView>

//               {/* ✅ Location Filters */}
//               <GlobalText style={[styles.subtitle, { color: isDark ? "#ddd" : "#333" }]}>
//                 Location
//               </GlobalText>

//               <DropDownPicker
//                 open={stateOpen}
//                 value={state}
//                 items={stateItems}
//                 setOpen={setStateOpen}
//                 setValue={setState}
//                 placeholder="Select State"
//                 style={[styles.dropdownBox, { borderColor }]}
//                 dropDownContainerStyle={styles.dropdownList}
//                 zIndex={3000}
//                 listMode="SCROLLVIEW"
//                 onChangeValue={(v) => {
//                   setState(v);
//                   setDistrict("");
//                   setSubDistrict("");
//                 }}
//               />

//               <DropDownPicker
//                 open={districtOpen}
//                 value={district}
//                 items={districtItems}
//                 setOpen={setDistrictOpen}
//                 setValue={setDistrict}
//                 placeholder="Select District"
//                 style={[styles.dropdownBox, { borderColor }]}
//                 dropDownContainerStyle={styles.dropdownList}
//                 zIndex={2000}
//                 listMode="SCROLLVIEW"
//                 disabled={!state}
//                 onChangeValue={(v) => {
//                   setDistrict(v);
//                   setSubDistrict("");
//                 }}
//               />

//               <DropDownPicker
//                 open={subDistrictOpen}
//                 value={subDistrict}
//                 items={subDistrictItems}
//                 setOpen={setSubDistrictOpen}
//                 setValue={setSubDistrict}
//                 placeholder="Select Sub-District"
//                 style={[styles.dropdownBox, { borderColor }]}
//                 dropDownContainerStyle={styles.dropdownList}
//                 zIndex={1000}
//                 listMode="SCROLLVIEW"
//                 disabled={!district}
//               />

//               {/* ✅ Property Size */}
//               <GlobalText style={[styles.subtitle, { color: isDark ? "#ddd" : "#333" }]}>
//                 Property Size
//               </GlobalText>
//               <Slider
//                 minimumValue={0}
//                 maximumValue={20000}
//                 step={100}
//                 value={size}
//                 onValueChange={setSize}
//               />
//               <GlobalText style={[styles.sliderValue, { color: brandPrimary }]}>
//                 Up to {size} sqft
//               </GlobalText>

//               {/* ✅ Price Range */}
//               <GlobalText style={[styles.subtitle, { color: isDark ? "#ddd" : "#333" }]}>
//                 Price Range
//               </GlobalText>
//               <Slider
//                 minimumValue={0}
//                 maximumValue={5000000}
//                 step={1000}
//                 value={minPrice}
//                 onValueChange={setMinPrice}
//               />
//               <GlobalText style={[styles.sliderValue, { color: brandPrimary }]}>
//                 Min ₹{minPrice.toLocaleString()}
//               </GlobalText>

//               <Slider
//                 minimumValue={minPrice}
//                 maximumValue={10000000}
//                 step={1000}
//                 value={maxPrice}
//                 onValueChange={setMaxPrice}
//               />
//               <GlobalText style={[styles.sliderValue, { color: brandPrimary }]}>
//                 Max ₹{maxPrice.toLocaleString()}
//               </GlobalText>
//             </ScrollView>

//             {/* ✅ Buttons */}
//             <View style={styles.btnRow}>
//               <TouchableOpacity style={styles.resetBtn} onPress={resetFilters}>
//                 <GlobalText style={{ color: brandPrimary, fontWeight: "600" }}>
//                   Reset
//                 </GlobalText>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={[styles.applyBtn, { backgroundColor: brandPrimary }]}
//                 onPress={applyFilters}
//               >
//                 <GlobalText style={{ color: "#fff", fontWeight: "600" }}>
//                   Apply Filters
//                 </GlobalText>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </SafeAreaView>
//     </Modal>
//   );
// }

// const styles = StyleSheet.create({
//   safeView: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
//   overlay: { flex: 1, justifyContent: "flex-end" },
//   container: {
//     borderTopLeftRadius: 28,
//     borderTopRightRadius: 28,
//     padding: 20,
//     maxHeight: "90%",
//   },
//   title: {
//     fontWeight: "700",
//     fontSize: 18,
//     textAlign: "center",
//     marginBottom: 10,
//   },
//   subtitle: {
//     fontWeight: "600",
//     marginTop: 15,
//   },
//   preferenceRow: {
//     flexDirection: "row",
//     justifyContent: "flex-start",
//     marginVertical: 8,
//   },
//   preferenceBtn: {
//     paddingVertical: 8,
//     paddingHorizontal: 20,
//     borderRadius: 20,
//     marginRight: 10,
//   },
//   typeBtn: {
//     paddingVertical: 8,
//     paddingHorizontal: 15,
//     borderRadius: 20,
//     marginRight: 10,
//   },
//   dropdownBox: {
//     borderWidth: 1.5,
//     borderRadius: 12,
//     backgroundColor: "#fff",
//     marginVertical: 8,
//   },
//   dropdownList: {
//     borderColor: "#43C6AC",
//     borderWidth: 1.5,
//     borderRadius: 12,
//     backgroundColor: "#E9FFF5",
//     maxHeight: 200,
//   },
//   sliderValue: {
//     textAlign: "right",
//     marginTop: 4,
//     fontWeight: "500",
//   },
//   btnRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 25,
//   },
//   resetBtn: {
//     borderWidth: 1.5,
//     borderRadius: 12,
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     flex: 1,
//     marginRight: 10,
//     alignItems: "center",
//   },
//   applyBtn: {
//     borderRadius: 12,
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     flex: 2,
//     alignItems: "center",
//     justifyContent: "center",
//   },
// });

// import React, { useState, useEffect, useCallback } from "react";
// import {
//   View,
//   StyleSheet,
//   TouchableOpacity,
//   Modal,
//   ScrollView,
//   SafeAreaView,
//   BackHandler,
//   useColorScheme,
// } from "react-native";
// import Slider from "@react-native-assets/slider";
// import DropDownPicker from "react-native-dropdown-picker";
// import GlobalText from "../../theme/GlobalText";
// import { navigate } from "../../navigation/navigationRef";
// import states from "../../constants/locations/state";
// import districts from "../../constants/locations/districts";
// import subDistricts from "../../constants/locations/subDistricts";
// import propertyTypes from "../../constants/propertyTypes";

// export default function FilterModal({ visible, onClose, currentFilters = {} }) {
//   const scheme = useColorScheme();
//   const isDark = scheme === "dark";
//   const brandPrimary = "#43C6AC";
//   const brandSecondary = "#20A68B";
//   const borderColor = isDark ? "#444" : "#C8E6DC";

//   const [size, setSize] = useState(currentFilters.size || 10000);
//   const [minPrice, setMinPrice] = useState(currentFilters.minPrice || 5000);
//   const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice || 15000);
//   const [propertyType, setPropertyType] = useState(currentFilters.propertyType || null);
//   const [state, setState] = useState(currentFilters.state || "");
//   const [district, setDistrict] = useState(currentFilters.district || "");
//   const [subDistrict, setSubDistrict] = useState(currentFilters.subDistrict || "");
//   const [bedrooms, setBedrooms] = useState(currentFilters.bedrooms || "");
//   const [bathrooms, setBathrooms] = useState(currentFilters.bathrooms || "");
//   const [kitchen, setKitchen] = useState(currentFilters.kitchen || "");

//   const [stateOpen, setStateOpen] = useState(false);
//   const [districtOpen, setDistrictOpen] = useState(false);
//   const [subDistrictOpen, setSubDistrictOpen] = useState(false);
//   const [bedroomOpen, setBedroomOpen] = useState(false);
//   const [bathroomOpen, setBathroomOpen] = useState(false);
//   const [kitchenOpen, setKitchenOpen] = useState(false);

//   const handleBackPress = useCallback(() => {
//     if (visible) {
//       onClose();
//       return true;
//     }
//     return false;
//   }, [visible, onClose]);

//   useEffect(() => {
//     const backHandler = BackHandler.addEventListener(
//       "hardwareBackPress",
//       handleBackPress
//     );
//     return () => backHandler.remove();
//   }, [handleBackPress]);

//   const stateItems = states.map((s) => ({ label: s, value: s }));
//   const districtItems = state
//     ? (districts[state] || []).map((d) => ({ label: d, value: d }))
//     : [];
//   const subDistrictItems = district
//     ? (subDistricts[district] || []).map((sd) => ({ label: sd, value: sd }))
//     : [];

//   const bedroomItems = ["1", "2", "3", "4+"].map((b) => ({ label: b, value: b }));
//   const bathroomItems = ["1", "2", "3", "4+"].map((b) => ({ label: b, value: b }));
//   const kitchenItems = ["Yes", "No"].map((k) => ({ label: k, value: k }));

//   const applyFilters = () => {
//     onClose();
//     setTimeout(() => {
//       navigate("MatchedProperties", {
//         filters: {
//           propertyType,
//           size,
//           minPrice,
//           maxPrice,
//           state,
//           district,
//           subDistrict,
//           bedrooms,
//           bathrooms,
//           kitchen,
//         },
//       });
//     }, 300);
//   };

//   const resetFilters = () => {
//     setSize(10000);
//     setMinPrice(5000);
//     setMaxPrice(15000);
//     setPropertyType(null);
//     setState("");
//     setDistrict("");
//     setSubDistrict("");
//     setBedrooms("");
//     setBathrooms("");
//     setKitchen("");
//   };

//   return (
//     <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
//       <SafeAreaView style={styles.safeView}>
//         <View style={styles.overlay}>
//           <View
//             style={[
//               styles.container,
//               { backgroundColor: isDark ? "#1E1E1E" : "#fff" },
//             ]}
//           >
//             <GlobalText style={[styles.title, { color: isDark ? "#AEECE1" : "#20A68B" }]}>
//               🎯 Filter Properties
//             </GlobalText>

//             <ScrollView
//               nestedScrollEnabled
//               showsVerticalScrollIndicator={false}
//               contentContainerStyle={{ paddingBottom: 100 }}
//             >
//               <GlobalText style={[styles.subtitle, { color: isDark ? "#ddd" : "#333" }]}>
//                 Property Type
//               </GlobalText>
//               <ScrollView
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 contentContainerStyle={{ paddingVertical: 8 }}
//               >
//                 {propertyTypes.map((type) => (
//                   <TouchableOpacity
//                     key={type.id}
//                     style={[
//                       styles.typeBtn,
//                       {
//                         backgroundColor:
//                           propertyType === type.name
//                             ? brandPrimary
//                             : isDark
//                               ? "#2A2A2A"
//                               : "#EAF8F5",
//                       },
//                     ]}
//                     onPress={() =>
//                       setPropertyType(
//                         propertyType === type.name ? null : type.name
//                       )
//                     }
//                   >
//                     <GlobalText
//                       style={{
//                         color:
//                           propertyType === type.name
//                             ? "#fff"
//                             : brandSecondary,
//                         fontWeight: "600",
//                       }}
//                     >
//                       {type.name}
//                     </GlobalText>
//                   </TouchableOpacity>
//                 ))}
//               </ScrollView>

//               <GlobalText style={[styles.subtitle, { color: isDark ? "#ddd" : "#333" }]}>
//                 Location
//               </GlobalText>

//               <DropDownPicker
//                 open={stateOpen}
//                 value={state}
//                 items={stateItems}
//                 setOpen={setStateOpen}
//                 setValue={setState}
//                 placeholder="Select State"
//                 style={[styles.dropdownBox, { borderColor }]}
//                 dropDownContainerStyle={styles.dropdownList}
//                 zIndex={3000}
//                 listMode="SCROLLVIEW"
//                 onChangeValue={(v) => {
//                   setState(v);
//                   setDistrict("");
//                   setSubDistrict("");
//                 }}
//               />

//               <DropDownPicker
//                 open={districtOpen}
//                 value={district}
//                 items={districtItems}
//                 setOpen={setDistrictOpen}
//                 setValue={setDistrict}
//                 placeholder="Select District"
//                 style={[styles.dropdownBox, { borderColor }]}
//                 dropDownContainerStyle={styles.dropdownList}
//                 zIndex={2000}
//                 listMode="SCROLLVIEW"
//                 disabled={!state}
//                 onChangeValue={(v) => {
//                   setDistrict(v);
//                   setSubDistrict("");
//                 }}
//               />

//               <DropDownPicker
//                 open={subDistrictOpen}
//                 value={subDistrict}
//                 items={subDistrictItems}
//                 setOpen={setSubDistrictOpen}
//                 setValue={setSubDistrict}
//                 placeholder="Select Sub-District"
//                 style={[styles.dropdownBox, { borderColor }]}
//                 dropDownContainerStyle={styles.dropdownList}
//                 zIndex={1000}
//                 listMode="SCROLLVIEW"
//                 disabled={!district}
//               />

//               <GlobalText style={[styles.subtitle, { color: isDark ? "#ddd" : "#333" }]}>
//                 Property Size
//               </GlobalText>
//               <Slider
//                 minimumValue={0}
//                 maximumValue={20000}
//                 step={100}
//                 value={size}
//                 onValueChange={setSize}
//               />
//               <GlobalText style={[styles.sliderValue, { color: brandPrimary }]}>
//                 Up to {size} sqft
//               </GlobalText>

//               <GlobalText style={[styles.subtitle, { color: isDark ? "#ddd" : "#333" }]}>
//                 Price Range
//               </GlobalText>
//               <Slider
//                 minimumValue={0}
//                 maximumValue={5000000}
//                 step={1000}
//                 value={minPrice}
//                 onValueChange={setMinPrice}
//               />
//               <GlobalText style={[styles.sliderValue, { color: brandPrimary }]}>
//                 Min ₹{minPrice.toLocaleString()}
//               </GlobalText>

//               <Slider
//                 minimumValue={minPrice}
//                 maximumValue={10000000}
//                 step={1000}
//                 value={maxPrice}
//                 onValueChange={setMaxPrice}
//               />
//               <GlobalText style={[styles.sliderValue, { color: brandPrimary }]}>
//                 Max ₹{maxPrice.toLocaleString()}
//               </GlobalText>
//             </ScrollView>

//             <View style={styles.btnRow}>
//               <TouchableOpacity style={styles.resetBtn} onPress={resetFilters}>
//                 <GlobalText style={{ color: brandPrimary, fontWeight: "600" }}>Reset</GlobalText>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={[styles.applyBtn, { backgroundColor: brandPrimary }]}
//                 onPress={applyFilters}
//               >
//                 <GlobalText style={{ color: "#fff", fontWeight: "600" }}>
//                   Apply Filters
//                 </GlobalText>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </SafeAreaView>
//     </Modal>
//   );
// }

// const styles = StyleSheet.create({
//   safeView: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
//   overlay: {
//     flex: 1,
//     justifyContent: "flex-end",
//   },
//   container: {
//     borderTopLeftRadius: 28,
//     borderTopRightRadius: 28,
//     padding: 20,
//     maxHeight: "90%",
//   },
//   title: {
//     fontWeight: "700",
//     fontSize: 18,
//     textAlign: "center",
//     marginBottom: 10,
//   },
//   subtitle: {
//     fontWeight: "600",
//     marginTop: 15,
//   },
//   typeBtn: {
//     paddingVertical: 8,
//     paddingHorizontal: 15,
//     borderRadius: 20,
//     marginRight: 10,
//   },
//   dropdownBox: {
//     borderWidth: 1.5,
//     borderRadius: 12,
//     backgroundColor: "#fff",
//     marginVertical: 8,
//   },
//   dropdownList: {
//     borderColor: "#43C6AC",
//     borderWidth: 1.5,
//     borderRadius: 12,
//     backgroundColor: "#E9FFF5",
//     maxHeight: 200,
//   },
//   sliderValue: {
//     textAlign: "right",
//     marginTop: 4,
//     fontWeight: "500",
//   },
//   btnRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 25,
//   },
//   resetBtn: {
//     borderWidth: 1.5,
//     borderRadius: 12,
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     flex: 1,
//     marginRight: 10,
//     alignItems: "center",
//   },
//   applyBtn: {
//     borderRadius: 12,
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     flex: 2,
//     alignItems: "center",
//     justifyContent: "center",
//   },
// });

// import React, { useState, useEffect, useCallback } from "react";
// import {
//   View,
//   StyleSheet,
//   TouchableOpacity,
//   Modal,
//   ScrollView,
//   SafeAreaView,
//   BackHandler,
// } from "react-native";
// import Slider from "@react-native-assets/slider";
// import DropDownPicker from "react-native-dropdown-picker";
// import GlobalText from "../../theme/GlobalText";
// import { navigate } from "../../navigation/navigationRef";
// import states from "../../constants/locations/state";
// import districts from "../../constants/locations/districts";
// import subDistricts from "../../constants/locations/subDistricts";
// import propertyTypes from "../../constants/propertyTypes";

// export default function FilterModal({ visible, onClose, currentFilters = {} }) {
//   const brandPrimary = "#43C6AC";
//   const brandSecondary = "#20A68B";
//   const borderColor = "#C8E6DC";

//   // Default filters (if re-opening with old selections)
//   const [size, setSize] = useState(currentFilters.size || 10000);
//   const [minPrice, setMinPrice] = useState(currentFilters.minPrice || 50000);
//   const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice || 15000);
//   const [propertyType, setPropertyType] = useState(currentFilters.propertyType || null);
//   const [state, setState] = useState(currentFilters.state || "");
//   const [district, setDistrict] = useState(currentFilters.district || "");
//   const [subDistrict, setSubDistrict] = useState(currentFilters.subDistrict || "");
//   const [bedrooms, setBedrooms] = useState(currentFilters.bedrooms || "");
//   const [bathrooms, setBathrooms] = useState(currentFilters.bathrooms || "");
//   const [kitchen, setKitchen] = useState(currentFilters.kitchen || "");

//   // Dropdown open states
//   const [stateOpen, setStateOpen] = useState(false);
//   const [districtOpen, setDistrictOpen] = useState(false);
//   const [subDistrictOpen, setSubDistrictOpen] = useState(false);
//   const [bedroomOpen, setBedroomOpen] = useState(false);
//   const [bathroomOpen, setBathroomOpen] = useState(false);
//   const [kitchenOpen, setKitchenOpen] = useState(false);

//   // 🧩 Handle Android back button
//   const handleBackPress = useCallback(() => {
//     if (visible) {
//       onClose();
//       return true;
//     }
//     return false;
//   }, [visible, onClose]);

//   useEffect(() => {
//     const backHandler = BackHandler.addEventListener(
//       "hardwareBackPress",
//       handleBackPress
//     );
//     return () => backHandler.remove();
//   }, [handleBackPress]);

//   // Dropdown data
//   const stateItems = states.map((s) => ({ label: s, value: s }));
//   const districtItems = state
//     ? (districts[state] || []).map((d) => ({ label: d, value: d }))
//     : [];
//   const subDistrictItems = district
//     ? (subDistricts[district] || []).map((sd) => ({ label: sd, value: sd }))
//     : [];

//   const bedroomItems = ["1", "2", "3", "4+"].map((b) => ({ label: b, value: b }));
//   const bathroomItems = ["1", "2", "3", "4+"].map((b) => ({ label: b, value: b }));
//   const kitchenItems = ["Yes", "No"].map((k) => ({ label: k, value: k }));

//   // ✅ Apply filters and navigate
//   const applyFilters = () => {
//     onClose();
//     setTimeout(() => {
//       navigate("MatchedProperties", {
//         filters: {
//           propertyType,
//           size,
//           minPrice,
//           maxPrice,
//           state,
//           district,
//           subDistrict,
//           bedrooms,
//           bathrooms,
//           kitchen,
//         },
//       });
//     }, 300);
//   };

//   // 🔄 Reset all filters
//   const resetFilters = () => {
//     setSize(2500);
//     setMinPrice(5000);
//     setMaxPrice(15000);
//     setPropertyType(null);
//     setState("");
//     setDistrict("");
//     setSubDistrict("");
//     setBedrooms("");
//     setBathrooms("");
//     setKitchen("");
//   };

//   return (
//     <Modal
//       visible={visible}
//       animationType="slide"
//       transparent
//       onRequestClose={onClose}
//     >
//       <SafeAreaView style={styles.safeView}>
//         <View style={styles.overlay}>
//           <View style={styles.container}>
//             <GlobalText style={styles.title}>🎯 Filter Properties</GlobalText>

//             <ScrollView
//               nestedScrollEnabled
//               showsVerticalScrollIndicator={false}
//               contentContainerStyle={{ paddingBottom: 100 }}
//             >
//               {/* 🏠 Property Type */}
//               <GlobalText style={styles.subtitle}>Property Type</GlobalText>
//               <ScrollView
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 contentContainerStyle={{ paddingVertical: 8 }}
//               >
//                 {propertyTypes.map((type) => (
//                   <TouchableOpacity
//                     key={type.id}
//                     style={[
//                       styles.typeBtn,
//                       {
//                         backgroundColor:
//                           propertyType === type.name ? brandPrimary : "#EAF8F5",
//                       },
//                     ]}
//                     onPress={() =>
//                       setPropertyType(
//                         propertyType === type.name ? null : type.name
//                       )
//                     }
//                   >
//                     <GlobalText
//                       style={{
//                         color:
//                           propertyType === type.name
//                             ? "#fff"
//                             : brandSecondary,
//                         fontWeight: "600",
//                       }}
//                     >
//                       {type.name}
//                     </GlobalText>
//                   </TouchableOpacity>
//                 ))}
//               </ScrollView>

//               {/* 📍 Location Filters */}
//               <GlobalText style={styles.subtitle}>Location</GlobalText>

//               <DropDownPicker
//                 open={stateOpen}
//                 value={state}
//                 items={stateItems}
//                 setOpen={setStateOpen}
//                 setValue={setState}
//                 placeholder="Select State"
//                 style={[styles.dropdownBox, { borderColor }]}
//                 dropDownContainerStyle={styles.dropdownList}
//                 zIndex={3000}
//                 listMode="SCROLLVIEW"
//                 onChangeValue={(v) => {
//                   setState(v);
//                   setDistrict("");
//                   setSubDistrict("");
//                 }}
//               />

//               <DropDownPicker
//                 open={districtOpen}
//                 value={district}
//                 items={districtItems}
//                 setOpen={setDistrictOpen}
//                 setValue={setDistrict}
//                 placeholder="Select District"
//                 style={[styles.dropdownBox, { borderColor }]}
//                 dropDownContainerStyle={styles.dropdownList}
//                 zIndex={2000}
//                 listMode="SCROLLVIEW"
//                 disabled={!state}
//                 onChangeValue={(v) => {
//                   setDistrict(v);
//                   setSubDistrict("");
//                 }}
//               />

//               <DropDownPicker
//                 open={subDistrictOpen}
//                 value={subDistrict}
//                 items={subDistrictItems}
//                 setOpen={setSubDistrictOpen}
//                 setValue={setSubDistrict}
//                 placeholder="Select Sub-District"
//                 style={[styles.dropdownBox, { borderColor }]}
//                 dropDownContainerStyle={styles.dropdownList}
//                 zIndex={1000}
//                 listMode="SCROLLVIEW"
//                 disabled={!district}
//               />

//               {/* 🛏️ Room Filters */}
//               {/* <GlobalText style={styles.subtitle}>Bedrooms</GlobalText>
//               <DropDownPicker
//                 open={bedroomOpen}
//                 value={bedrooms}
//                 items={bedroomItems}
//                 setOpen={setBedroomOpen}
//                 setValue={setBedrooms}
//                 placeholder="Select Bedrooms"
//                 style={[styles.dropdownBox, { borderColor }]}
//                 dropDownContainerStyle={styles.dropdownList}
//                 zIndex={900}
//               />

//               <GlobalText style={styles.subtitle}>Bathrooms</GlobalText>
//               <DropDownPicker
//                 open={bathroomOpen}
//                 value={bathrooms}
//                 items={bathroomItems}
//                 setOpen={setBathroomOpen}
//                 setValue={setBathrooms}
//                 placeholder="Select Bathrooms"
//                 style={[styles.dropdownBox, { borderColor }]}
//                 dropDownContainerStyle={styles.dropdownList}
//                 zIndex={800}
//               />

//               <GlobalText style={styles.subtitle}>Kitchen</GlobalText>
//               <DropDownPicker
//                 open={kitchenOpen}
//                 value={kitchen}
//                 items={kitchenItems}
//                 setOpen={setKitchenOpen}
//                 setValue={setKitchen}
//                 placeholder="Select Kitchen"
//                 style={[styles.dropdownBox, { borderColor }]}
//                 dropDownContainerStyle={styles.dropdownList}
//                 zIndex={700}
//               /> */}

//               {/* 📏 Property Size */}
//               <GlobalText style={styles.subtitle}>Property Size</GlobalText>
//               <Slider
//                 minimumValue={500}
//                 maximumValue={10000}
//                 step={100}
//                 value={size}
//                 onValueChange={setSize}
//               />
//               <GlobalText style={styles.sliderValue}>Up to {size} sqft</GlobalText>

//               {/* 💰 Price Range */}
//               <GlobalText style={styles.subtitle}>Price Range</GlobalText>
//               <Slider
//                 minimumValue={50000}
//                 maximumValue={100000}
//                 step={1000}
//                 value={minPrice}
//                 onValueChange={setMinPrice}
//               />
//               <GlobalText style={styles.sliderValue}>
//                 Min ₹{minPrice.toLocaleString()}
//               </GlobalText>

//               <Slider
//                 minimumValue={minPrice}
//                 maximumValue={2000000}
//                 step={1000}
//                 value={maxPrice}
//                 onValueChange={setMaxPrice}
//               />
//               <GlobalText style={styles.sliderValue}>
//                 Max ₹{maxPrice.toLocaleString()}
//               </GlobalText>
//             </ScrollView>

//             {/* ✅ Action Buttons */}
//             <View style={styles.btnRow}>
//               <TouchableOpacity style={styles.resetBtn} onPress={resetFilters}>
//                 <GlobalText style={{ color: brandPrimary, fontWeight: "600" }}>
//                   Reset
//                 </GlobalText>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={[styles.applyBtn, { backgroundColor: brandPrimary }]}
//                 onPress={applyFilters}
//               >
//                 <GlobalText style={{ color: "#fff", fontWeight: "600" }}>
//                   Apply Filters
//                 </GlobalText>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </SafeAreaView>
//     </Modal>
//   );
// }

// // 🌿 Styles
// const styles = StyleSheet.create({
//   safeView: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
//   overlay: { flex: 1, justifyContent: "flex-end" },
//   container: {
//     borderTopLeftRadius: 28,
//     borderTopRightRadius: 28,
//     padding: 20,
//     backgroundColor: "#fff",
//     maxHeight: "90%",
//   },
//   title: {
//     fontWeight: "700",
//     fontSize: 18,
//     color: "#20A68B",
//     textAlign: "center",
//     marginBottom: 10,
//   },
//   subtitle: {
//     fontWeight: "600",
//     marginTop: 15,
//     color: "#333",
//   },
//   typeBtn: {
//     paddingVertical: 8,
//     paddingHorizontal: 15,
//     borderRadius: 20,
//     marginRight: 10,
//   },
//   dropdownBox: {
//     borderWidth: 1.5,
//     borderRadius: 12,
//     backgroundColor: "#fff",
//     marginVertical: 8,
//   },
//   dropdownList: {
//     borderColor: "#43C6AC",
//     borderWidth: 1.5,
//     borderRadius: 12,
//     backgroundColor: "#E9FFF5",
//     maxHeight: 200,
//   },
//   sliderValue: {
//     color: "#43C6AC",
//     textAlign: "right",
//     marginTop: 4,
//     fontWeight: "500",
//   },
//   btnRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginTop: 25,
//   },
//   resetBtn: {
//     borderWidth: 1.5,
//     borderColor: "#43C6AC",
//     borderRadius: 12,
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     flex: 1,
//     marginRight: 10,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   applyBtn: {
//     borderRadius: 12,
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     flex: 2,
//     elevation: 2,
//     alignItems: "center",
//     justifyContent: "center",
//   },
// });

// // import React, { useState, useEffect, useCallback } from "react";
// // import {
// //   View,
// //   StyleSheet,
// //   TouchableOpacity,
// //   Modal,
// //   ScrollView,
// //   SafeAreaView,
// //   BackHandler,
// // } from "react-native";
// // import Slider from "@react-native-assets/slider";
// // import DropDownPicker from "react-native-dropdown-picker";
// // import GlobalText from "../../theme/GlobalText";
// // import { navigate } from "../../navigation/navigationRef";
// // import propertyTypes from "../../constants/propertyTypes";
// // import states from "../../constants/locations/state";
// // import districts from "../../constants/locations/districts";
// // import subDistricts from "../../constants/locations/subDistricts";

// // export default function FilterModal({ visible, onClose }) {
// //   const brandPrimary = "#43C6AC";
// //   const brandSecondary = "#20A68B";
// //   const borderColor = "#C8E6DC";

// //   const [size, setSize] = useState(2500);
// //   const [minPrice, setMinPrice] = useState(5000);
// //   const [maxPrice, setMaxPrice] = useState(15000);
// //   const [propertyType, setPropertyType] = useState(null);
// //   const [state, setState] = useState("");
// //   const [district, setDistrict] = useState("");
// //   const [subDistrict, setSubDistrict] = useState("");
// //   const [bedrooms, setBedrooms] = useState("");
// //   const [bathrooms, setBathrooms] = useState("");
// //   const [kitchen, setKitchen] = useState("");

// //   const [stateOpen, setStateOpen] = useState(false);
// //   const [districtOpen, setDistrictOpen] = useState(false);
// //   const [subDistrictOpen, setSubDistrictOpen] = useState(false);

// //   const handleBackPress = useCallback(() => {
// //     if (visible) {
// //       onClose();
// //       return true;
// //     }
// //     return false;
// //   }, [visible, onClose]);

// //   useEffect(() => {
// //     const backHandler = BackHandler.addEventListener(
// //       "hardwareBackPress",
// //       handleBackPress
// //     );
// //     return () => backHandler.remove();
// //   }, [handleBackPress]);

// //   const stateItems = states.map((s) => ({ label: s, value: s }));
// //   const districtItems = state
// //     ? (districts[state] || []).map((d) => ({ label: d, value: d }))
// //     : [];
// //   const subDistrictItems = district
// //     ? (subDistricts[district] || []).map((sd) => ({ label: sd, value: sd }))
// //     : [];

// //   const bedroomItems = ["1", "2", "3", "4+"].map((b) => ({
// //     label: b,
// //     value: b,
// //   }));
// //   const bathroomItems = ["1", "2", "3", "4+"].map((b) => ({
// //     label: b,
// //     value: b,
// //   }));
// //   const kitchenItems = ["Yes", "No"].map((k) => ({ label: k, value: k }));

// //   const applyFilters = () => {
// //     onClose();
// //     setTimeout(() => {
// //       navigate("MatchedProperties", {
// //         filters: {
// //           propertyType,
// //           size,
// //           minPrice,
// //           maxPrice,
// //           state,
// //           district,
// //           subDistrict,
// //           bedrooms,
// //           bathrooms,
// //           kitchen,
// //         },
// //       });
// //     }, 300);
// //   };

// //   const resetFilters = () => {
// //     setSize(2500);
// //     setMinPrice(5000);
// //     setMaxPrice(15000);
// //     setPropertyType(null);
// //     setState("");
// //     setDistrict("");
// //     setSubDistrict("");
// //     setBedrooms("");
// //     setBathrooms("");
// //     setKitchen("");
// //   };

// //   return (
// //     <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
// //       <SafeAreaView style={styles.safeView}>
// //         <View style={styles.overlay}>
// //           <View style={styles.container}>
// //             <GlobalText style={styles.title}>🔍 Filter Properties</GlobalText>

// //             <ScrollView
// //               nestedScrollEnabled
// //               showsVerticalScrollIndicator={false}
// //               contentContainerStyle={{ paddingBottom: 100 }}
// //             >
// //               {/* 🏠 Property Type */}
// //               <GlobalText style={styles.subtitle}>Property Type</GlobalText>
// //               <ScrollView
// //                 horizontal
// //                 showsHorizontalScrollIndicator={false}
// //                 contentContainerStyle={{ paddingVertical: 8 }}
// //               >
// //                 {propertyTypes.map((type) => (
// //                   <TouchableOpacity
// //                     key={type.value}
// //                     style={[
// //                       styles.typeBtn,
// //                       {
// //                         backgroundColor:
// //                           propertyType === type.value ? brandPrimary : "#EAF8F5",
// //                       },
// //                     ]}
// //                     onPress={() => setPropertyType(type.value)}
// //                   >
// //                     <GlobalText
// //                       style={{
// //                         color:
// //                           propertyType === type.value
// //                             ? "#fff"
// //                             : brandSecondary,
// //                         fontWeight: "600",
// //                       }}
// //                     >
// //                       {type.label}
// //                     </GlobalText>
// //                   </TouchableOpacity>
// //                 ))}
// //               </ScrollView>

// //               {/* 📍 Location */}
// //               <GlobalText style={styles.subtitle}>Location</GlobalText>
// //               <DropDownPicker
// //                 open={stateOpen}
// //                 value={state}
// //                 items={stateItems}
// //                 setOpen={setStateOpen}
// //                 setValue={setState}
// //                 placeholder="Select State"
// //                 style={[styles.dropdownBox, { borderColor }]}
// //                 dropDownContainerStyle={styles.dropdownList}
// //                 zIndex={3000}
// //                 onChangeValue={(v) => {
// //                   setState(v);
// //                   setDistrict("");
// //                   setSubDistrict("");
// //                 }}
// //               />

// //               <DropDownPicker
// //                 open={districtOpen}
// //                 value={district}
// //                 items={districtItems}
// //                 setOpen={setDistrictOpen}
// //                 setValue={setDistrict}
// //                 placeholder="Select District"
// //                 style={[styles.dropdownBox, { borderColor }]}
// //                 dropDownContainerStyle={styles.dropdownList}
// //                 zIndex={2000}
// //                 disabled={!state}
// //                 onChangeValue={(v) => {
// //                   setDistrict(v);
// //                   setSubDistrict("");
// //                 }}
// //               />

// //               <DropDownPicker
// //                 open={subDistrictOpen}
// //                 value={subDistrict}
// //                 items={subDistrictItems}
// //                 setOpen={setSubDistrictOpen}
// //                 setValue={setSubDistrict}
// //                 placeholder="Select Sub-District"
// //                 style={[styles.dropdownBox, { borderColor }]}
// //                 dropDownContainerStyle={styles.dropdownList}
// //                 zIndex={1000}
// //                 disabled={!district}
// //               />

// //               {/* 📏 Property Size */}
// //               <GlobalText style={styles.subtitle}>Property Size</GlobalText>
// //               <Slider
// //                 minimumValue={500}
// //                 maximumValue={5000}
// //                 step={100}
// //                 value={size}
// //                 onValueChange={setSize}
// //               />
// //               <GlobalText style={styles.sliderValue}>
// //                 Up to {size} sqft
// //               </GlobalText>

// //               {/* 💰 Price Range */}
// //               <GlobalText style={styles.subtitle}>Price Range</GlobalText>
// //               <Slider
// //                 minimumValue={1000}
// //                 maximumValue={50000}
// //                 step={500}
// //                 value={minPrice}
// //                 onValueChange={setMinPrice}
// //               />
// //               <GlobalText style={styles.sliderValue}>
// //                 Min ₹{minPrice}
// //               </GlobalText>

// //               <Slider
// //                 minimumValue={5000}
// //                 maximumValue={100000}
// //                 step={500}
// //                 value={maxPrice}
// //                 onValueChange={setMaxPrice}
// //               />
// //               <GlobalText style={styles.sliderValue}>
// //                 Max ₹{maxPrice}
// //               </GlobalText>
// //             </ScrollView>

// //             {/* ✅ Buttons */}
// //             <View style={styles.btnRow}>
// //               <TouchableOpacity style={styles.resetBtn} onPress={resetFilters}>
// //                 <GlobalText style={{ color: brandPrimary, fontWeight: "600" }}>
// //                   Reset
// //                 </GlobalText>
// //               </TouchableOpacity>

// //               <TouchableOpacity
// //                 style={[styles.applyBtn, { backgroundColor: brandPrimary }]}
// //                 onPress={applyFilters}
// //               >
// //                 <GlobalText style={{ color: "#fff", fontWeight: "600" }}>
// //                   Apply
// //                 </GlobalText>
// //               </TouchableOpacity>
// //             </View>
// //           </View>
// //         </View>
// //       </SafeAreaView>
// //     </Modal>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   safeView: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
// //   overlay: { flex: 1, justifyContent: "flex-end" },
// //   container: {
// //     borderTopLeftRadius: 28,
// //     borderTopRightRadius: 28,
// //     padding: 20,
// //     backgroundColor: "#fff",
// //     maxHeight: "90%",
// //   },
// //   title: {
// //     fontWeight: "700",
// //     fontSize: 18,
// //     color: "#20A68B",
// //     textAlign: "center",
// //   },
// //   subtitle: { fontWeight: "600", marginTop: 15, color: "#333" },
// //   typeBtn: {
// //     paddingVertical: 8,
// //     paddingHorizontal: 15,
// //     borderRadius: 20,
// //     marginRight: 10,
// //   },
// //   dropdownBox: {
// //     borderWidth: 1.5,
// //     borderRadius: 12,
// //     backgroundColor: "#fff",
// //     marginVertical: 8,
// //   },
// //   dropdownList: {
// //     borderColor: "#43C6AC",
// //     borderWidth: 1.5,
// //     borderRadius: 12,
// //     backgroundColor: "#E9FFF5",
// //     maxHeight: 200,
// //   },
// //   sliderValue: { color: "#43C6AC", textAlign: "right", marginTop: 4 },
// //   btnRow: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "center",
// //     marginTop: 25,
// //   },
// //   resetBtn: {
// //     borderWidth: 1.5,
// //     borderColor: "#43C6AC",
// //     borderRadius: 12,
// //     paddingVertical: 12,
// //     paddingHorizontal: 20,
// //     flex: 1,
// //     marginRight: 10,
// //     alignItems: "center",
// //     justifyContent: "center",
// //   },
// //   applyBtn: {
// //     borderRadius: 12,
// //     paddingVertical: 12,
// //     paddingHorizontal: 20,
// //     flex: 2,
// //     elevation: 2,
// //     alignItems: "center",
// //     justifyContent: "center",
// //   },
// // });

// // // import React, { useState, useEffect, useCallback } from "react";
// // // import {
// // //   View,
// // //   StyleSheet,
// // //   TouchableOpacity,
// // //   Modal,
// // //   ScrollView,
// // //   SafeAreaView,
// // //   BackHandler,
// // // } from "react-native";
// // // import Slider from "@react-native-assets/slider";
// // // import DropDownPicker from "react-native-dropdown-picker";
// // // import GlobalText from "../../theme/GlobalText";
// // // import { navigate } from "../../navigation/navigationRef";
// // // import states from "../../constants/locations/state";
// // // import districts from "../../constants/locations/districts";
// // // import subDistricts from "../../constants/locations/subDistricts";

// // // export default function FilterModal({ visible, onClose }) {
// // //   const brandPrimary = "#43C6AC";
// // //   const brandSecondary = "#20A68B";
// // //   const borderColor = "#C8E6DC";

// // //   // 🧱 Hooks must always be declared first
// // //   const [size, setSize] = useState(2500);
// // //   const [minPrice, setMinPrice] = useState(5000);
// // //   const [maxPrice, setMaxPrice] = useState(15000);
// // //   const [propertyType, setPropertyType] = useState(null);
// // //   const [state, setState] = useState("");
// // //   const [district, setDistrict] = useState("");
// // //   const [subDistrict, setSubDistrict] = useState("");
// // //   const [bedrooms, setBedrooms] = useState("");
// // //   const [bathrooms, setBathrooms] = useState("");
// // //   const [kitchen, setKitchen] = useState("");

// // //   const [stateOpen, setStateOpen] = useState(false);
// // //   const [districtOpen, setDistrictOpen] = useState(false);
// // //   const [subDistrictOpen, setSubDistrictOpen] = useState(false);
// // //   const [bedroomOpen, setBedroomOpen] = useState(false);
// // //   const [bathroomOpen, setBathroomOpen] = useState(false);
// // //   const [kitchenOpen, setKitchenOpen] = useState(false);

// // //   // ✅ Stable back action using useCallback (prevents hook mismatch)
// // //   const handleBackPress = useCallback(() => {
// // //     if (visible) {
// // //       onClose();
// // //       return true;
// // //     }
// // //     return false;
// // //   }, [visible, onClose]);

// // //   // ✅ Register only once
// // //   useEffect(() => {
// // //     const backHandler = BackHandler.addEventListener(
// // //       "hardwareBackPress",
// // //       handleBackPress
// // //     );
// // //     return () => backHandler.remove();
// // //   }, [handleBackPress]);


// // //   const stateItems = states.map((s) => ({ label: s, value: s }));
// // //   const districtItems = state
// // //     ? (districts[state] || []).map((d) => ({ label: d, value: d }))
// // //     : [];
// // //   const subDistrictItems = district
// // //     ? (subDistricts[district] || []).map((sd) => ({ label: sd, value: sd }))
// // //     : [];

// // //   const bedroomItems = ["1", "2", "3", "4+"].map((b) => ({ label: b, value: b }));
// // //   const bathroomItems = ["1", "2", "3", "4+"].map((b) => ({ label: b, value: b }));
// // //   const kitchenItems = ["Yes", "No"].map((k) => ({ label: k, value: k }));

// // //   const applyFilters = () => {
// // //     onClose();
// // //     setTimeout(() => {
// // //       navigate("MatchedProperties", {
// // //         filters: {
// // //           propertyType,
// // //           size,
// // //           minPrice,
// // //           maxPrice,
// // //           state,
// // //           district,
// // //           subDistrict,
// // //           bedrooms,
// // //           bathrooms,
// // //           kitchen,
// // //         },
// // //       });
// // //     }, 300);
// // //   };

// // //   const resetFilters = () => {
// // //     setSize(2500);
// // //     setMinPrice(5000);
// // //     setMaxPrice(15000);
// // //     setPropertyType(null);
// // //     setState("");
// // //     setDistrict("");
// // //     setSubDistrict("");
// // //     setBedrooms("");
// // //     setBathrooms("");
// // //     setKitchen("");
// // //   };

// // //   return (
// // //     <Modal
// // //       visible={visible}
// // //       animationType="slide"
// // //       transparent
// // //       onRequestClose={onClose}
// // //     >
// // //       <SafeAreaView style={styles.safeView}>
// // //         <View style={styles.overlay}>
// // //           <View style={styles.container}>
// // //             <GlobalText style={styles.title}>🔍 Filter Properties</GlobalText>

// // //             <ScrollView
// // //               nestedScrollEnabled
// // //               showsVerticalScrollIndicator={false}
// // //               contentContainerStyle={{ paddingBottom: 100 }}
// // //             >
// // //               {/* 🏠 Property Type */}
// // //               <GlobalText style={styles.subtitle}>Property Type</GlobalText>
// // //               <ScrollView
// // //                 horizontal
// // //                 showsHorizontalScrollIndicator={false}
// // //                 contentContainerStyle={{ paddingVertical: 8 }}
// // //               >
// // //                 {[
// // //                   "House",
// // //                   "Apartment",
// // //                   "Office",
// // //                   "Land",
// // //                   "Sites",
// // //                   "Godown",
// // //                   "Factory",
// // //                 ].map((type) => (
// // //                   <TouchableOpacity
// // //                     key={type}
// // //                     style={[
// // //                       styles.typeBtn,
// // //                       {
// // //                         backgroundColor:
// // //                           propertyType === type ? brandPrimary : "#EAF8F5",
// // //                       },
// // //                     ]}
// // //                     onPress={() => setPropertyType(type)}
// // //                   >
// // //                     <GlobalText
// // //                       style={{
// // //                         color: propertyType === type ? "#fff" : brandSecondary,
// // //                         fontWeight: "600",
// // //                       }}
// // //                     >
// // //                       {type}
// // //                     </GlobalText>
// // //                   </TouchableOpacity>
// // //                 ))}
// // //               </ScrollView>

// // //               {/* 📍 Location */}
// // //               <GlobalText style={styles.subtitle}>Location</GlobalText>

// // //               {/* State Dropdown */}
// // //               <DropDownPicker
// // //                 open={stateOpen}
// // //                 value={state}
// // //                 items={stateItems}
// // //                 setOpen={setStateOpen}
// // //                 setValue={setState}
// // //                 placeholder="Select State"
// // //                 style={[styles.dropdownBox, { borderColor }]}
// // //                 dropDownContainerStyle={styles.dropdownList}
// // //                 zIndex={3000}
// // //                 listMode="SCROLLVIEW"
// // //                 scrollViewProps={{
// // //                   nestedScrollEnabled: true,
// // //                   showsVerticalScrollIndicator: true,
// // //                 }}
// // //                 onChangeValue={(v) => {
// // //                   setState(v);
// // //                   setDistrict("");
// // //                   setSubDistrict("");
// // //                 }}
// // //               />

// // //               {/* District Dropdown */}
// // //               <DropDownPicker
// // //                 open={districtOpen}
// // //                 value={district}
// // //                 items={districtItems}
// // //                 setOpen={setDistrictOpen}
// // //                 setValue={setDistrict}
// // //                 placeholder="Select District"
// // //                 style={[styles.dropdownBox, { borderColor }]}
// // //                 dropDownContainerStyle={styles.dropdownList}
// // //                 zIndex={2000}
// // //                 listMode="SCROLLVIEW"
// // //                 scrollViewProps={{
// // //                   nestedScrollEnabled: true,
// // //                   showsVerticalScrollIndicator: true,
// // //                 }}
// // //                 disabled={!state}
// // //                 onChangeValue={(v) => {
// // //                   setDistrict(v);
// // //                   setSubDistrict("");
// // //                 }}
// // //               />

// // //               {/* Sub-District Dropdown */}
// // //               <DropDownPicker
// // //                 open={subDistrictOpen}
// // //                 value={subDistrict}
// // //                 items={subDistrictItems}
// // //                 setOpen={setSubDistrictOpen}
// // //                 setValue={setSubDistrict}
// // //                 placeholder="Select Sub-District"
// // //                 style={[styles.dropdownBox, { borderColor }]}
// // //                 dropDownContainerStyle={styles.dropdownList}
// // //                 zIndex={1000}
// // //                 listMode="SCROLLVIEW"
// // //                 scrollViewProps={{
// // //                   nestedScrollEnabled: true,
// // //                   showsVerticalScrollIndicator: true,
// // //                 }}
// // //                 disabled={!district}
// // //               />

// // //               {/* 📏 Property Size */}
// // //               <GlobalText style={styles.subtitle}>Property Size</GlobalText>
// // //               <Slider
// // //                 minimumValue={500}
// // //                 maximumValue={5000}
// // //                 step={100}
// // //                 value={size}
// // //                 onValueChange={setSize}
// // //               />
// // //               <GlobalText style={styles.sliderValue}>Up to {size} sqft</GlobalText>

// // //               {/* 💰 Price Range */}
// // //               <GlobalText style={styles.subtitle}>Price Range</GlobalText>
// // //               <Slider
// // //                 minimumValue={1000}
// // //                 maximumValue={50000}
// // //                 step={500}
// // //                 value={minPrice}
// // //                 onValueChange={setMinPrice}
// // //               />
// // //               <GlobalText style={styles.sliderValue}>Min ₹{minPrice}</GlobalText>

// // //               <Slider
// // //                 minimumValue={5000}
// // //                 maximumValue={100000}
// // //                 step={500}
// // //                 value={maxPrice}
// // //                 onValueChange={setMaxPrice}
// // //               />
// // //               <GlobalText style={styles.sliderValue}>Max ₹{maxPrice}</GlobalText>
// // //             </ScrollView>

// // //             {/* ✅ Buttons */}
// // //             <View style={styles.btnRow}>
// // //               <TouchableOpacity style={styles.resetBtn} onPress={resetFilters}>
// // //                 <GlobalText style={{ color: brandPrimary, fontWeight: "600" }}>
// // //                   Reset
// // //                 </GlobalText>
// // //               </TouchableOpacity>

// // //               <TouchableOpacity
// // //                 style={[styles.applyBtn, { backgroundColor: brandPrimary }]}
// // //                 onPress={applyFilters}
// // //               >
// // //                 <GlobalText style={{ color: "#fff", fontWeight: "600" }}>
// // //                   Apply
// // //                 </GlobalText>
// // //               </TouchableOpacity>
// // //             </View>
// // //           </View>
// // //         </View>
// // //       </SafeAreaView>
// // //     </Modal>
// // //   );
// // // }

// // // const styles = StyleSheet.create({
// // //   safeView: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
// // //   overlay: { flex: 1, justifyContent: "flex-end" },
// // //   container: {
// // //     borderTopLeftRadius: 28,
// // //     borderTopRightRadius: 28,
// // //     padding: 20,
// // //     backgroundColor: "#fff",
// // //     maxHeight: "90%",
// // //   },
// // //   title: {
// // //     fontWeight: "700",
// // //     fontSize: 18,
// // //     color: "#20A68B",
// // //     textAlign: "center",
// // //   },
// // //   subtitle: { fontWeight: "600", marginTop: 15, color: "#333" },
// // //   typeBtn: {
// // //     paddingVertical: 8,
// // //     paddingHorizontal: 15,
// // //     borderRadius: 20,
// // //     marginRight: 10,
// // //   },
// // //   dropdownBox: {
// // //     borderWidth: 1.5,
// // //     borderRadius: 12,
// // //     backgroundColor: "#fff",
// // //     marginVertical: 8,
// // //   },
// // //   dropdownList: {
// // //     borderColor: "#43C6AC",
// // //     borderWidth: 1.5,
// // //     borderRadius: 12,
// // //     backgroundColor: "#E9FFF5",
// // //     maxHeight: 200,
// // //   },
// // //   sliderValue: { color: "#43C6AC", textAlign: "right", marginTop: 4 },
// // //   btnRow: {
// // //     flexDirection: "row",
// // //     justifyContent: "space-between",
// // //     alignItems: "center",
// // //     marginTop: 25,
// // //   },
// // //   resetBtn: {
// // //     borderWidth: 1.5,
// // //     borderColor: "#43C6AC",
// // //     borderRadius: 12,
// // //     paddingVertical: 12,
// // //     paddingHorizontal: 20,
// // //     flex: 1,
// // //     marginRight: 10,
// // //     alignItems: "center",
// // //     justifyContent: "center",
// // //   },
// // //   applyBtn: {
// // //     borderRadius: 12,
// // //     paddingVertical: 12,
// // //     paddingHorizontal: 20,
// // //     flex: 2,
// // //     elevation: 2,
// // //     alignItems: "center",
// // //     justifyContent: "center",
// // //   },
// // // });

// // // // import React, { useState } from "react";
// // // // import {
// // // //   View,
// // // //   StyleSheet,
// // // //   TouchableOpacity,
// // // //   Modal,
// // // //   ScrollView,
// // // //   SafeAreaView,
// // // // } from "react-native";
// // // // import Slider from "@react-native-assets/slider";
// // // // import DropDownPicker from "react-native-dropdown-picker";
// // // // import GlobalText from "../../theme/GlobalText";
// // // // import { navigate } from "../../navigation/navigationRef";
// // // // import states from "../../constants/locations/state";
// // // // import districts from "../../constants/locations/districts";
// // // // import subDistricts from "../../constants/locations/subDistricts";

// // // // export default function FilterModal({ visible, onClose }) {
// // // //   const brandPrimary = "#43C6AC";
// // // //   const brandSecondary = "#20A68B";
// // // //   const borderColor = "#C8E6DC";

// // // //   const [size, setSize] = useState(2500);
// // // //   const [minPrice, setMinPrice] = useState(5000);
// // // //   const [maxPrice, setMaxPrice] = useState(15000);
// // // //   const [propertyType, setPropertyType] = useState(null);
// // // //   const [state, setState] = useState("");
// // // //   const [district, setDistrict] = useState("");
// // // //   const [subDistrict, setSubDistrict] = useState("");
// // // //   const [bedrooms, setBedrooms] = useState("");
// // // //   const [bathrooms, setBathrooms] = useState("");
// // // //   const [kitchen, setKitchen] = useState("");

// // // //   const [stateOpen, setStateOpen] = useState(false);
// // // //   const [districtOpen, setDistrictOpen] = useState(false);
// // // //   const [subDistrictOpen, setSubDistrictOpen] = useState(false);
// // // //   const [bedroomOpen, setBedroomOpen] = useState(false);
// // // //   const [bathroomOpen, setBathroomOpen] = useState(false);
// // // //   const [kitchenOpen, setKitchenOpen] = useState(false);

// // // //   const stateItems = states.map((s) => ({ label: s, value: s }));
// // // //   const districtItems = state
// // // //     ? (districts[state] || []).map((d) => ({ label: d, value: d }))
// // // //     : [];
// // // //   const subDistrictItems = district
// // // //     ? (subDistricts[district] || []).map((sd) => ({ label: sd, value: sd }))
// // // //     : [];

// // // //   const bedroomItems = ["1", "2", "3", "4+"].map((b) => ({
// // // //     label: b,
// // // //     value: b,
// // // //   }));
// // // //   const bathroomItems = ["1", "2", "3", "4+"].map((b) => ({
// // // //     label: b,
// // // //     value: b,
// // // //   }));
// // // //   const kitchenItems = ["Yes", "No"].map((k) => ({ label: k, value: k }));

// // // //   const applyFilters = () => {
// // // //     onClose();
// // // //     setTimeout(() => {
// // // //       navigate("MatchedProperties", {
// // // //         filters: {
// // // //           propertyType,
// // // //           size,
// // // //           minPrice,
// // // //           maxPrice,
// // // //           state,
// // // //           district,
// // // //           subDistrict,
// // // //           bedrooms,
// // // //           bathrooms,
// // // //           kitchen,
// // // //         },
// // // //       });
// // // //     }, 300);
// // // //   };

// // // //   const resetFilters = () => {
// // // //     setSize(2500);
// // // //     setMinPrice(5000);
// // // //     setMaxPrice(15000);
// // // //     setPropertyType(null);
// // // //     setState("");
// // // //     setDistrict("");
// // // //     setSubDistrict("");
// // // //     setBedrooms("");
// // // //     setBathrooms("");
// // // //     setKitchen("");
// // // //   };

// // // //   return (
// // // //     <Modal
// // // //       visible={visible}
// // // //       animationType="slide"
// // // //       transparent
// // // //       onRequestClose={onClose}
// // // //     >
// // // //       <SafeAreaView style={styles.safeView}>
// // // //         <View style={styles.overlay}>
// // // //           <View style={styles.container}>
// // // //             <GlobalText style={styles.title}>🔍 Filter Properties</GlobalText>

// // // //             <ScrollView
// // // //               nestedScrollEnabled
// // // //               showsVerticalScrollIndicator={false}
// // // //               contentContainerStyle={{ paddingBottom: 100 }}
// // // //             >
// // // //               {/* 🏠 Property Type */}
// // // //               <GlobalText style={styles.subtitle}>Property Type</GlobalText>
// // // //               <ScrollView
// // // //                 horizontal
// // // //                 showsHorizontalScrollIndicator={false}
// // // //                 contentContainerStyle={{ paddingVertical: 8 }}
// // // //               >
// // // //                 {[
// // // //                   "House",
// // // //                   "Apartment",
// // // //                   "Office",
// // // //                   "Land",
// // // //                   "Sites",
// // // //                   "Godown",
// // // //                   "Factory",
// // // //                 ].map((type) => (
// // // //                   <TouchableOpacity
// // // //                     key={type}
// // // //                     style={[
// // // //                       styles.typeBtn,
// // // //                       {
// // // //                         backgroundColor:
// // // //                           propertyType === type ? brandPrimary : "#EAF8F5",
// // // //                       },
// // // //                     ]}
// // // //                     onPress={() => setPropertyType(type)}
// // // //                   >
// // // //                     <GlobalText
// // // //                       style={{
// // // //                         color: propertyType === type ? "#fff" : brandSecondary,
// // // //                         fontWeight: "600",
// // // //                       }}
// // // //                     >
// // // //                       {type}
// // // //                     </GlobalText>
// // // //                   </TouchableOpacity>
// // // //                 ))}
// // // //               </ScrollView>

// // // //               {/* 📍 Location */}
// // // //               <GlobalText style={styles.subtitle}>Location</GlobalText>

// // // //               {/* State Dropdown */}
// // // //               <DropDownPicker
// // // //                 open={stateOpen}
// // // //                 value={state}
// // // //                 items={stateItems}
// // // //                 setOpen={setStateOpen}
// // // //                 setValue={setState}
// // // //                 placeholder="Select State"
// // // //                 style={[styles.dropdownBox, { borderColor }]}
// // // //                 dropDownContainerStyle={styles.dropdownList}
// // // //                 zIndex={3000}
// // // //                 listMode="SCROLLVIEW"
// // // //                 scrollViewProps={{
// // // //                   nestedScrollEnabled: true,
// // // //                   showsVerticalScrollIndicator: true,
// // // //                 }}
// // // //                 onChangeValue={(v) => {
// // // //                   setState(v);
// // // //                   setDistrict("");
// // // //                   setSubDistrict("");
// // // //                 }}
// // // //               />

// // // //               {/* District Dropdown */}
// // // //               <DropDownPicker
// // // //                 open={districtOpen}
// // // //                 value={district}
// // // //                 items={districtItems}
// // // //                 setOpen={setDistrictOpen}
// // // //                 setValue={setDistrict}
// // // //                 placeholder="Select District"
// // // //                 style={[styles.dropdownBox, { borderColor }]}
// // // //                 dropDownContainerStyle={styles.dropdownList}
// // // //                 zIndex={2000}
// // // //                 listMode="SCROLLVIEW"
// // // //                 scrollViewProps={{
// // // //                   nestedScrollEnabled: true,
// // // //                   showsVerticalScrollIndicator: true,
// // // //                 }}
// // // //                 disabled={!state}
// // // //                 onChangeValue={(v) => {
// // // //                   setDistrict(v);
// // // //                   setSubDistrict("");
// // // //                 }}
// // // //               />

// // // //               {/* Sub-District Dropdown */}
// // // //               <DropDownPicker
// // // //                 open={subDistrictOpen}
// // // //                 value={subDistrict}
// // // //                 items={subDistrictItems}
// // // //                 setOpen={setSubDistrictOpen}
// // // //                 setValue={setSubDistrict}
// // // //                 placeholder="Select Sub-District"
// // // //                 style={[styles.dropdownBox, { borderColor }]}
// // // //                 dropDownContainerStyle={styles.dropdownList}
// // // //                 zIndex={1000}
// // // //                 listMode="SCROLLVIEW"
// // // //                 scrollViewProps={{
// // // //                   nestedScrollEnabled: true,
// // // //                   showsVerticalScrollIndicator: true,
// // // //                 }}
// // // //                 disabled={!district}
// // // //               />

// // // //               {/* 📏 Property Size */}
// // // //               <GlobalText style={styles.subtitle}>Property Size</GlobalText>
// // // //               <Slider
// // // //                 minimumValue={500}
// // // //                 maximumValue={5000}
// // // //                 step={100}
// // // //                 value={size}
// // // //                 onValueChange={setSize}
// // // //               />
// // // //               <GlobalText style={styles.sliderValue}>Up to {size} sqft</GlobalText>

// // // //               {/* 💰 Price Range */}
// // // //               <GlobalText style={styles.subtitle}>Price Range</GlobalText>
// // // //               <Slider
// // // //                 minimumValue={1000}
// // // //                 maximumValue={50000}
// // // //                 step={500}
// // // //                 value={minPrice}
// // // //                 onValueChange={setMinPrice}
// // // //               />
// // // //               <GlobalText style={styles.sliderValue}>Min ₹{minPrice}</GlobalText>

// // // //               <Slider
// // // //                 minimumValue={5000}
// // // //                 maximumValue={100000}
// // // //                 step={500}
// // // //                 value={maxPrice}
// // // //                 onValueChange={setMaxPrice}
// // // //               />
// // // //               <GlobalText style={styles.sliderValue}>Max ₹{maxPrice}</GlobalText>
// // // //             </ScrollView>

// // // //             {/* ✅ Buttons */}
// // // //             <View style={styles.btnRow}>
// // // //               <TouchableOpacity style={styles.resetBtn} onPress={resetFilters}>
// // // //                 <GlobalText style={{ color: brandPrimary, fontWeight: "600" }}>
// // // //                   Reset
// // // //                 </GlobalText>
// // // //               </TouchableOpacity>

// // // //               <TouchableOpacity
// // // //                 style={[styles.applyBtn, { backgroundColor: brandPrimary }]}
// // // //                 onPress={applyFilters}
// // // //               >
// // // //                 <GlobalText style={{ color: "#fff", fontWeight: "600" }}>
// // // //                   Apply
// // // //                 </GlobalText>
// // // //               </TouchableOpacity>
// // // //             </View>
// // // //           </View>
// // // //         </View>
// // // //       </SafeAreaView>
// // // //     </Modal>
// // // //   );
// // // // }

// // // // const styles = StyleSheet.create({
// // // //   safeView: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
// // // //   overlay: { flex: 1, justifyContent: "flex-end" },
// // // //   container: {
// // // //     borderTopLeftRadius: 28,
// // // //     borderTopRightRadius: 28,
// // // //     padding: 20,
// // // //     backgroundColor: "#fff",
// // // //     maxHeight: "90%",
// // // //   },
// // // //   title: {
// // // //     fontWeight: "700",
// // // //     fontSize: 18,
// // // //     color: "#20A68B",
// // // //     textAlign: "center",
// // // //   },
// // // //   subtitle: { fontWeight: "600", marginTop: 15, color: "#333" },
// // // //   typeBtn: {
// // // //     paddingVertical: 8,
// // // //     paddingHorizontal: 15,
// // // //     borderRadius: 20,
// // // //     marginRight: 10,
// // // //   },
// // // //   dropdownBox: {
// // // //     borderWidth: 1.5,
// // // //     borderRadius: 12,
// // // //     backgroundColor: "#fff",
// // // //     marginVertical: 8,
// // // //   },
// // // //   dropdownList: {
// // // //     borderColor: "#43C6AC",
// // // //     borderWidth: 1.5,
// // // //     borderRadius: 12,
// // // //     backgroundColor: "#E9FFF5",
// // // //     maxHeight: 200, // ✅ ensures dropdown scrolls properly
// // // //   },
// // // //   sliderValue: { color: "#43C6AC", textAlign: "right", marginTop: 4 },
// // // // btnRow: {
// // // //   flexDirection: "row",
// // // //   justifyContent: "space-between",
// // // //   alignItems: "center",
// // // //   marginTop: 25,
// // // // },
// // // // resetBtn: {
// // // //   borderWidth: 1.5,
// // // //   borderColor: "#43C6AC",
// // // //   borderRadius: 12,
// // // //   paddingVertical: 12,
// // // //   paddingHorizontal: 20,
// // // //   flex: 1,
// // // //   marginRight: 10,
// // // //   alignItems: "center", // ✅ centers horizontally
// // // //   justifyContent: "center", // ✅ centers vertically
// // // // },

// // // // applyBtn: {
// // // //   borderRadius: 12,
// // // //   paddingVertical: 12,
// // // //   paddingHorizontal: 20,
// // // //   flex: 2,
// // // //   elevation: 2,
// // // //   alignItems: "center", // ✅ centers horizontally
// // // //   justifyContent: "center", // ✅ centers vertically
// // // // },
// // // // });

// // // // import React, { useState } from "react";
// // // // import {
// // // //   View,
// // // //   StyleSheet,
// // // //   TouchableOpacity,
// // // //   Modal,
// // // //   ScrollView,
// // // //   SafeAreaView,
// // // // } from "react-native";
// // // // import Slider from "@react-native-assets/slider"; // ✅ fixed import
// // // // import DropDownPicker from "react-native-dropdown-picker";
// // // // import GlobalText from "../../theme/GlobalText";
// // // // import { navigate } from "../../navigation/navigationRef";
// // // // import states from "../../constants/locations/state";
// // // // import districts from "../../constants/locations/districts";
// // // // import subDistricts from "../../constants/locations/subDistricts";

// // // // export default function FilterModal({ visible, onClose }) {
// // // //   const brandPrimary = "#43C6AC";
// // // //   const brandSecondary = "#20A68B";
// // // //   const borderColor = "#C8E6DC";

// // // //   const [size, setSize] = useState(2500);
// // // //   const [minPrice, setMinPrice] = useState(5000);
// // // //   const [maxPrice, setMaxPrice] = useState(15000);
// // // //   const [propertyType, setPropertyType] = useState(null);
// // // //   const [state, setState] = useState("");
// // // //   const [district, setDistrict] = useState("");
// // // //   const [subDistrict, setSubDistrict] = useState("");
// // // //   const [bedrooms, setBedrooms] = useState("");
// // // //   const [bathrooms, setBathrooms] = useState("");
// // // //   const [kitchen, setKitchen] = useState("");

// // // //   const [stateOpen, setStateOpen] = useState(false);
// // // //   const [districtOpen, setDistrictOpen] = useState(false);
// // // //   const [subDistrictOpen, setSubDistrictOpen] = useState(false);
// // // //   const [bedroomOpen, setBedroomOpen] = useState(false);
// // // //   const [bathroomOpen, setBathroomOpen] = useState(false);
// // // //   const [kitchenOpen, setKitchenOpen] = useState(false);

// // // //   const stateItems = states.map((s) => ({ label: s, value: s }));
// // // //   const districtItems = state
// // // //     ? (districts[state] || []).map((d) => ({ label: d, value: d }))
// // // //     : [];
// // // //   const subDistrictItems = district
// // // //     ? (subDistricts[district] || []).map((sd) => ({ label: sd, value: sd }))
// // // //     : [];

// // // //   const bedroomItems = ["1", "2", "3", "4+"].map((b) => ({ label: b, value: b }));
// // // //   const bathroomItems = ["1", "2", "3", "4+"].map((b) => ({ label: b, value: b }));
// // // //   const kitchenItems = ["Yes", "No"].map((k) => ({ label: k, value: k }));

// // // //   const applyFilters = () => {
// // // //     onClose();
// // // //     setTimeout(() => {
// // // //       navigate("MatchedProperties", {
// // // //         filters: {
// // // //           propertyType,
// // // //           size,
// // // //           minPrice,
// // // //           maxPrice,
// // // //           state,
// // // //           district,
// // // //           subDistrict,
// // // //           bedrooms,
// // // //           bathrooms,
// // // //           kitchen,
// // // //         },
// // // //       });
// // // //     }, 300);
// // // //   };

// // // //   const resetFilters = () => {
// // // //     setSize(2500);
// // // //     setMinPrice(5000);
// // // //     setMaxPrice(15000);
// // // //     setPropertyType(null);
// // // //     setState("");
// // // //     setDistrict("");
// // // //     setSubDistrict("");
// // // //     setBedrooms("");
// // // //     setBathrooms("");
// // // //     setKitchen("");
// // // //   };

// // // //   return (
// // // //     <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
// // // //       <SafeAreaView style={styles.safeView}>
// // // //         <View style={styles.overlay}>
// // // //           <View style={styles.container}>
// // // //             <GlobalText style={styles.title}>🔍 Filter Properties</GlobalText>

// // // //             <ScrollView
// // // //               nestedScrollEnabled
// // // //               showsVerticalScrollIndicator={false}
// // // //               contentContainerStyle={{ paddingBottom: 100 }}
// // // //             >
// // // //               <GlobalText style={styles.subtitle}>Property Type</GlobalText>
// // // //               <ScrollView
// // // //                 horizontal
// // // //                 showsHorizontalScrollIndicator={false}
// // // //                 contentContainerStyle={{ paddingVertical: 8 }}
// // // //               >
// // // //                 {["House", "Apartment", "Office", "Land", "Sites", "Godown", "Factory"].map(
// // // //                   (type) => (
// // // //                     <TouchableOpacity
// // // //                       key={type}
// // // //                       style={[
// // // //                         styles.typeBtn,
// // // //                         {
// // // //                           backgroundColor:
// // // //                             propertyType === type ? brandPrimary : "#EAF8F5",
// // // //                         },
// // // //                       ]}
// // // //                       onPress={() => setPropertyType(type)}
// // // //                     >
// // // //                       <GlobalText
// // // //                         style={{
// // // //                           color: propertyType === type ? "#fff" : brandSecondary,
// // // //                           fontWeight: "600",
// // // //                         }}
// // // //                       >
// // // //                         {type}
// // // //                       </GlobalText>
// // // //                     </TouchableOpacity>
// // // //                   )
// // // //                 )}
// // // //               </ScrollView>

// // // //               <GlobalText style={styles.subtitle}>Location</GlobalText>
// // // //               <DropDownPicker
// // // //                 open={stateOpen}
// // // //                 value={state}
// // // //                 items={stateItems}
// // // //                 setOpen={setStateOpen}
// // // //                 setValue={setState}
// // // //                 placeholder="Select State"
// // // //                 style={[styles.dropdownBox, { borderColor }]}
// // // //                 dropDownContainerStyle={styles.dropdownList}
// // // //                 zIndex={3000}
// // // //                 onChangeValue={(v) => {
// // // //                   setState(v);
// // // //                   setDistrict("");
// // // //                   setSubDistrict("");
// // // //                 }}
// // // //               />
// // // //               <DropDownPicker
// // // //                 open={districtOpen}
// // // //                 value={district}
// // // //                 items={districtItems}
// // // //                 setOpen={setDistrictOpen}
// // // //                 setValue={setDistrict}
// // // //                 placeholder="Select District"
// // // //                 style={[styles.dropdownBox, { borderColor }]}
// // // //                 dropDownContainerStyle={styles.dropdownList}
// // // //                 zIndex={2000}
// // // //                 disabled={!state}
// // // //                 onChangeValue={(v) => {
// // // //                   setDistrict(v);
// // // //                   setSubDistrict("");
// // // //                 }}
// // // //               />
// // // //               <DropDownPicker
// // // //                 open={subDistrictOpen}
// // // //                 value={subDistrict}
// // // //                 items={subDistrictItems}
// // // //                 setOpen={setSubDistrictOpen}
// // // //                 setValue={setSubDistrict}
// // // //                 placeholder="Select Sub-District"
// // // //                 style={[styles.dropdownBox, { borderColor }]}
// // // //                 dropDownContainerStyle={styles.dropdownList}
// // // //                 zIndex={1000}
// // // //                 disabled={!district}
// // // //               />

// // // //               {/* <GlobalText style={styles.subtitle}>Details</GlobalText>
// // // //               <DropDownPicker
// // // //                 open={bedroomOpen}
// // // //                 value={bedrooms}
// // // //                 items={bedroomItems}
// // // //                 setOpen={setBedroomOpen}
// // // //                 setValue={setBedrooms}
// // // //                 placeholder="Bedrooms"
// // // //                 style={[styles.dropdownBox, { borderColor }]}
// // // //                 dropDownContainerStyle={styles.dropdownList}
// // // //                 zIndex={900}
// // // //               />
// // // //               <DropDownPicker
// // // //                 open={bathroomOpen}
// // // //                 value={bathrooms}
// // // //                 items={bathroomItems}
// // // //                 setOpen={setBathroomOpen}
// // // //                 setValue={setBathrooms}
// // // //                 placeholder="Bathrooms"
// // // //                 style={[styles.dropdownBox, { borderColor }]}
// // // //                 dropDownContainerStyle={styles.dropdownList}
// // // //                 zIndex={800}
// // // //               />
// // // //               <DropDownPicker
// // // //                 open={kitchenOpen}
// // // //                 value={kitchen}
// // // //                 items={kitchenItems}
// // // //                 setOpen={setKitchenOpen}
// // // //                 setValue={setKitchen}
// // // //                 placeholder="Kitchen"
// // // //                 style={[styles.dropdownBox, { borderColor }]}
// // // //                 dropDownContainerStyle={styles.dropdownList}
// // // //                 zIndex={700}
// // // //               /> */}

// // // //               <GlobalText style={styles.subtitle}>Property Size</GlobalText>
// // // //               <Slider
// // // //                 minimumValue={500}
// // // //                 maximumValue={5000}
// // // //                 step={100}
// // // //                 value={size}
// // // //                 onValueChange={setSize}
// // // //               />
// // // //               <GlobalText style={styles.sliderValue}>Up to {size} sqft</GlobalText>

// // // //               <GlobalText style={styles.subtitle}>Price Range</GlobalText>
// // // //               <Slider
// // // //                 minimumValue={1000}
// // // //                 maximumValue={50000}
// // // //                 step={500}
// // // //                 value={minPrice}
// // // //                 onValueChange={setMinPrice}
// // // //               />
// // // //               <GlobalText style={styles.sliderValue}>Min ₹{minPrice}</GlobalText>

// // // //               <Slider
// // // //                 minimumValue={5000}
// // // //                 maximumValue={100000}
// // // //                 step={500}
// // // //                 value={maxPrice}
// // // //                 onValueChange={setMaxPrice}
// // // //               />
// // // //               <GlobalText style={styles.sliderValue}>Max ₹{maxPrice}</GlobalText>
// // // //             </ScrollView>

// // // //             <View style={styles.btnRow}>
// // // //               <TouchableOpacity style={styles.resetBtn} onPress={resetFilters}>
// // // //                 <GlobalText style={{ color: brandPrimary, fontWeight: "600" }}>
// // // //                   Reset
// // // //                 </GlobalText>
// // // //               </TouchableOpacity>

// // // //               <TouchableOpacity
// // // //                 style={[styles.applyBtn, { backgroundColor: brandPrimary }]}
// // // //                 onPress={applyFilters}
// // // //               >
// // // //                 <GlobalText style={{ color: "#fff", fontWeight: "600" }}>
// // // //                   Apply
// // // //                 </GlobalText>
// // // //               </TouchableOpacity>
// // // //             </View>
// // // //           </View>
// // // //         </View>
// // // //       </SafeAreaView>
// // // //     </Modal>
// // // //   );
// // // // }

// // // // const styles = StyleSheet.create({
// // // //   safeView: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
// // // //   overlay: { flex: 1, justifyContent: "flex-end" },
// // // //   container: {
// // // //     borderTopLeftRadius: 28,
// // // //     borderTopRightRadius: 28,
// // // //     padding: 20,
// // // //     backgroundColor: "#fff",
// // // //     maxHeight: "90%",
// // // //   },
// // // //   title: { fontWeight: "700", fontSize: 18, color: "#20A68B", textAlign: "center" },
// // // //   subtitle: { fontWeight: "600", marginTop: 15, color: "#333" },
// // // //   typeBtn: {
// // // //     paddingVertical: 8,
// // // //     paddingHorizontal: 15,
// // // //     borderRadius: 20,
// // // //     marginRight: 10,
// // // //   },
// // // //   dropdownBox: {
// // // //     borderWidth: 1.5,
// // // //     borderRadius: 12,
// // // //     backgroundColor: "#fff",
// // // //     marginVertical: 8,
// // // //   },
// // // //   dropdownList: {
// // // //     borderColor: "#43C6AC",
// // // //     borderWidth: 1.5,
// // // //     borderRadius: 12,
// // // //     backgroundColor: "#E9FFF5",
// // // //   },
// // // //   sliderValue: { color: "#43C6AC", textAlign: "right", marginTop: 4 },
// // // //   btnRow: { flexDirection: "row", marginTop: 25 },
// // // //   resetBtn: {
// // // //     borderWidth: 1.5,
// // // //     borderColor: "#43C6AC",
// // // //     borderRadius: 12,
// // // //     padding: 12,
// // // //     flex: 1,
// // // //     marginRight: 10,
// // // //   },
// // // //   applyBtn: {
// // // //     borderRadius: 12,
// // // //     padding: 12,
// // // //     flex: 2,
// // // //     elevation: 2,
// // // //   },
// // // // });

// // // // // // FilterModal.js
// // // // // import React, { useState } from "react";
// // // // // import {
// // // // //   View,
// // // // //   StyleSheet,
// // // // //   TouchableOpacity,
// // // // //   Modal,
// // // // //   ScrollView,
// // // // //   SafeAreaView,
// // // // // } from "react-native";
// // // // // import Slider from "@react-native-community/slider";
// // // // // import DropDownPicker from "react-native-dropdown-picker";
// // // // // import GlobalText from "../../theme/GlobalText";
// // // // // import { navigate } from "../../navigation/navigationRef"; // ✅ for global navigation

// // // // // // ✅ Location constants
// // // // // import states from "../../constants/locations/state";
// // // // // import districts from "../../constants/locations/districts";
// // // // // import subDistricts from "../../constants/locations/subDistricts";

// // // // // export default function FilterModal({ visible, onClose }) {
// // // // //   // 🎨 Brand Colors
// // // // //   const brandPrimary = "#43C6AC";
// // // // //   const brandSecondary = "#20A68B";
// // // // //   const borderColor = "#C8E6DC";

// // // // //   // 🔹 Filters state
// // // // //   const [size, setSize] = useState(2500);
// // // // //   const [minPrice, setMinPrice] = useState(5000);
// // // // //   const [maxPrice, setMaxPrice] = useState(15000);
// // // // //   const [propertyType, setPropertyType] = useState(null);
// // // // //   const [state, setState] = useState("");
// // // // //   const [district, setDistrict] = useState("");
// // // // //   const [subDistrict, setSubDistrict] = useState("");
// // // // //   const [bedrooms, setBedrooms] = useState("");
// // // // //   const [bathrooms, setBathrooms] = useState("");
// // // // //   const [kitchen, setKitchen] = useState("");

// // // // //   // 🔹 Dropdown open states
// // // // //   const [stateOpen, setStateOpen] = useState(false);
// // // // //   const [districtOpen, setDistrictOpen] = useState(false);
// // // // //   const [subDistrictOpen, setSubDistrictOpen] = useState(false);
// // // // //   const [bedroomOpen, setBedroomOpen] = useState(false);
// // // // //   const [bathroomOpen, setBathroomOpen] = useState(false);
// // // // //   const [kitchenOpen, setKitchenOpen] = useState(false);

// // // // //   // 🔹 Dropdown items
// // // // //   const stateItems = states.map((s) => ({ label: s, value: s }));
// // // // //   const districtItems = state
// // // // //     ? (districts[state] || []).map((d) => ({ label: d, value: d }))
// // // // //     : [];
// // // // //   const subDistrictItems = district
// // // // //     ? (subDistricts[district] || []).map((sd) => ({ label: sd, value: sd }))
// // // // //     : [];

// // // // //   const bedroomItems = ["1", "2", "3", "4+"].map((b) => ({ label: b, value: b }));
// // // // //   const bathroomItems = ["1", "2", "3", "4+"].map((b) => ({ label: b, value: b }));
// // // // //   const kitchenItems = ["Yes", "No"].map((k) => ({ label: k, value: k }));

// // // // //   // ✅ Apply filters and navigate
// // // // //   const applyFilters = () => {
// // // // //     onClose();
// // // // //     setTimeout(() => {
// // // // //       navigate("MatchedProperties", {
// // // // //         filters: {
// // // // //           size,
// // // // //           minPrice,
// // // // //           maxPrice,
// // // // //           category: propertyType,
// // // // //           state,
// // // // //           district,
// // // // //           subDistrict,
// // // // //           bedrooms,
// // // // //           bathrooms,
// // // // //           kitchen,
// // // // //         },
// // // // //       });
// // // // //     }, 300);
// // // // //   };

// // // // //   // 🔁 Reset all filters
// // // // //   const resetFilters = () => {
// // // // //     setSize(2500);
// // // // //     setMinPrice(5000);
// // // // //     setMaxPrice(15000);
// // // // //     setPropertyType(null);
// // // // //     setState("");
// // // // //     setDistrict("");
// // // // //     setSubDistrict("");
// // // // //     setBedrooms("");
// // // // //     setBathrooms("");
// // // // //     setKitchen("");
// // // // //   };

// // // // //   return (
// // // // //     <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
// // // // //       <SafeAreaView style={styles.safeView}>
// // // // //         <View style={styles.overlay}>
// // // // //           <View style={styles.container}>
// // // // //             <GlobalText style={styles.title}>🔍 Filter Properties</GlobalText>

// // // // //             <ScrollView
// // // // //               nestedScrollEnabled
// // // // //               showsVerticalScrollIndicator={false}
// // // // //               contentContainerStyle={{ paddingBottom: 100 }}
// // // // //             >
// // // // //               {/* 🏠 Property Type */}
// // // // //               <GlobalText style={styles.subtitle}>Property Type</GlobalText>
// // // // //               <ScrollView
// // // // //                 horizontal
// // // // //                 showsHorizontalScrollIndicator={false}
// // // // //                 contentContainerStyle={{ paddingVertical: 8 }}
// // // // //               >
// // // // //                 {["House", "Apartment", "Office", "Land", "Sites", "Godown", "Factory"].map(
// // // // //                   (type) => (
// // // // //                     <TouchableOpacity
// // // // //                       key={type}
// // // // //                       style={[
// // // // //                         styles.typeBtn,
// // // // //                         {
// // // // //                           backgroundColor:
// // // // //                             propertyType === type ? brandPrimary : "#EAF8F5",
// // // // //                         },
// // // // //                       ]}
// // // // //                       onPress={() => setPropertyType(type)}
// // // // //                     >
// // // // //                       <GlobalText
// // // // //                         style={{
// // // // //                           color: propertyType === type ? "#fff" : brandSecondary,
// // // // //                           fontWeight: "600",
// // // // //                         }}
// // // // //                       >
// // // // //                         {type}
// // // // //                       </GlobalText>
// // // // //                     </TouchableOpacity>
// // // // //                   )
// // // // //                 )}
// // // // //               </ScrollView>

// // // // //               {/* 📍 Location Filters */}
// // // // //               <GlobalText style={styles.subtitle}>Location</GlobalText>

// // // // //               <DropDownPicker
// // // // //                 open={stateOpen}
// // // // //                 value={state}
// // // // //                 items={stateItems}
// // // // //                 setOpen={setStateOpen}
// // // // //                 setValue={setState}
// // // // //                 placeholder="-- Select State --"
// // // // //                 style={[styles.dropdownBox, { borderColor }]}
// // // // //                 dropDownContainerStyle={styles.dropdownList}
// // // // //                 zIndex={3000}
// // // // //                 onChangeValue={(v) => {
// // // // //                   setState(v);
// // // // //                   setDistrict("");
// // // // //                   setSubDistrict("");
// // // // //                 }}
// // // // //               />

// // // // //               <DropDownPicker
// // // // //                 open={districtOpen}
// // // // //                 value={district}
// // // // //                 items={districtItems}
// // // // //                 setOpen={setDistrictOpen}
// // // // //                 setValue={setDistrict}
// // // // //                 placeholder="-- Select District --"
// // // // //                 style={[styles.dropdownBox, { borderColor }]}
// // // // //                 dropDownContainerStyle={styles.dropdownList}
// // // // //                 zIndex={2000}
// // // // //                 disabled={!state}
// // // // //                 onChangeValue={(v) => {
// // // // //                   setDistrict(v);
// // // // //                   setSubDistrict("");
// // // // //                 }}
// // // // //               />

// // // // //               <DropDownPicker
// // // // //                 open={subDistrictOpen}
// // // // //                 value={subDistrict}
// // // // //                 items={subDistrictItems}
// // // // //                 setOpen={setSubDistrictOpen}
// // // // //                 setValue={setSubDistrict}
// // // // //                 placeholder="-- Select Sub-District --"
// // // // //                 style={[styles.dropdownBox, { borderColor }]}
// // // // //                 dropDownContainerStyle={styles.dropdownList}
// // // // //                 zIndex={1000}
// // // // //                 disabled={!district}
// // // // //               />

// // // // //               {/* 🛏️ Details */}
// // // // //               <GlobalText style={styles.subtitle}>Details</GlobalText>
// // // // //               <DropDownPicker
// // // // //                 open={bedroomOpen}
// // // // //                 value={bedrooms}
// // // // //                 items={bedroomItems}
// // // // //                 setOpen={setBedroomOpen}
// // // // //                 setValue={setBedrooms}
// // // // //                 placeholder="Bedrooms"
// // // // //                 style={[styles.dropdownBox, { borderColor }]}
// // // // //                 dropDownContainerStyle={styles.dropdownList}
// // // // //                 zIndex={900}
// // // // //               />

// // // // //               <DropDownPicker
// // // // //                 open={bathroomOpen}
// // // // //                 value={bathrooms}
// // // // //                 items={bathroomItems}
// // // // //                 setOpen={setBathroomOpen}
// // // // //                 setValue={setBathrooms}
// // // // //                 placeholder="Bathrooms"
// // // // //                 style={[styles.dropdownBox, { borderColor }]}
// // // // //                 dropDownContainerStyle={styles.dropdownList}
// // // // //                 zIndex={800}
// // // // //               />

// // // // //               <DropDownPicker
// // // // //                 open={kitchenOpen}
// // // // //                 value={kitchen}
// // // // //                 items={kitchenItems}
// // // // //                 setOpen={setKitchenOpen}
// // // // //                 setValue={setKitchen}
// // // // //                 placeholder="Kitchen"
// // // // //                 style={[styles.dropdownBox, { borderColor }]}
// // // // //                 dropDownContainerStyle={styles.dropdownList}
// // // // //                 zIndex={700}
// // // // //               />

// // // // //               {/* 📏 Size */}
// // // // //               <GlobalText style={styles.subtitle}>Property Size</GlobalText>
// // // // //               <Slider
// // // // //                 style={{ width: "100%" }}
// // // // //                 minimumValue={500}
// // // // //                 maximumValue={5000}
// // // // //                 step={100}
// // // // //                 value={size}
// // // // //                 onValueChange={setSize}
// // // // //                 minimumTrackTintColor={brandSecondary}
// // // // //                 maximumTrackTintColor="#D1EAE3"
// // // // //               />
// // // // //               <GlobalText style={styles.sliderValue}>Up to {size} sqft</GlobalText>

// // // // //               {/* 💰 Price */}
// // // // //               <GlobalText style={styles.subtitle}>Price Range</GlobalText>

// // // // //               <Slider
// // // // //                 style={{ width: "100%" }}
// // // // //                 minimumValue={1000}
// // // // //                 maximumValue={50000}
// // // // //                 step={500}
// // // // //                 value={minPrice}
// // // // //                 onValueChange={setMinPrice}
// // // // //                 minimumTrackTintColor={brandSecondary}
// // // // //                 maximumTrackTintColor="#D1EAE3"
// // // // //               />
// // // // //               <GlobalText style={styles.sliderValue}>Min: ₹{minPrice}</GlobalText>

// // // // //               <Slider
// // // // //                 style={{ width: "100%" }}
// // // // //                 minimumValue={5000}
// // // // //                 maximumValue={100000}
// // // // //                 step={500}
// // // // //                 value={maxPrice}
// // // // //                 onValueChange={setMaxPrice}
// // // // //                 minimumTrackTintColor={brandSecondary}
// // // // //                 maximumTrackTintColor="#D1EAE3"
// // // // //               />
// // // // //               <GlobalText style={styles.sliderValue}>Max: ₹{maxPrice}</GlobalText>
// // // // //             </ScrollView>

// // // // //             {/* ✅ Buttons */}
// // // // //             <View style={styles.btnRow}>
// // // // //               <TouchableOpacity style={styles.resetBtn} onPress={resetFilters}>
// // // // //                 <GlobalText style={{ color: brandPrimary, fontWeight: "600" }}>
// // // // //                   Reset
// // // // //                 </GlobalText>
// // // // //               </TouchableOpacity>

// // // // //               <TouchableOpacity
// // // // //                 style={[styles.applyBtn, { backgroundColor: brandPrimary }]}
// // // // //                 onPress={applyFilters}
// // // // //               >
// // // // //                 <GlobalText style={{ color: "#fff", fontWeight: "600" }}>
// // // // //                   Apply Filters
// // // // //                 </GlobalText>
// // // // //               </TouchableOpacity>
// // // // //             </View>
// // // // //           </View>
// // // // //         </View>
// // // // //       </SafeAreaView>
// // // // //     </Modal>
// // // // //   );
// // // // // }

// // // // // const styles = StyleSheet.create({
// // // // //   safeView: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
// // // // //   overlay: { flex: 1, justifyContent: "flex-end" },
// // // // //   container: {
// // // // //     borderTopLeftRadius: 28,
// // // // //     borderTopRightRadius: 28,
// // // // //     padding: 20,
// // // // //     backgroundColor: "#fff",
// // // // //     maxHeight: "90%",
// // // // //   },
// // // // //   title: { fontWeight: "bold", textAlign: "center", color: "#20A68B", fontSize: 20 },
// // // // //   subtitle: { fontWeight: "600", marginTop: 15, color: "#333" },
// // // // //   typeBtn: {
// // // // //     paddingVertical: 8,
// // // // //     paddingHorizontal: 15,
// // // // //     borderRadius: 20,
// // // // //     marginRight: 10,
// // // // //   },
// // // // //   btnRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 25 },
// // // // //   resetBtn: {
// // // // //     borderWidth: 1.5,
// // // // //     borderColor: "#43C6AC",
// // // // //     borderRadius: 12,
// // // // //     padding: 12,
// // // // //     flex: 1,
// // // // //     marginRight: 10,
// // // // //   },
// // // // //   applyBtn: {
// // // // //     borderRadius: 12,
// // // // //     padding: 12,
// // // // //     flex: 2,
// // // // //     elevation: 2,
// // // // //   },
// // // // //   dropdownBox: {
// // // // //     borderWidth: 1.5,
// // // // //     borderRadius: 12,
// // // // //     backgroundColor: "#FFFFFF",
// // // // //     marginVertical: 8,
// // // // //   },
// // // // //   dropdownList: {
// // // // //     borderColor: "#43C6AC",
// // // // //     borderWidth: 1.5,
// // // // //     borderRadius: 12,
// // // // //     backgroundColor: "#E9FFF5",
// // // // //   },
// // // // //   sliderValue: { color: "#43C6AC", textAlign: "right", marginTop: 4 },
// // // // // });

// // // // // // import React, { useState } from "react";
// // // // // // import {
// // // // // //   View,
// // // // // //   StyleSheet,
// // // // // //   TouchableOpacity,
// // // // // //   Modal,
// // // // // //   ScrollView,
// // // // // //   useWindowDimensions,
// // // // // //   SafeAreaView,
// // // // // // } from "react-native";
// // // // // // import Slider from "@react-native-community/slider";
// // // // // // import { useTheme } from "@react-navigation/native";
// // // // // // import DropDownPicker from "react-native-dropdown-picker";
// // // // // // import GlobalText from "../../theme/GlobalText";
// // // // // // import { navigate } from "../../navigation/navigationRef"; // ✅ global navigation helper

// // // // // // // ✅ Location constants
// // // // // // import states from "../../constants/locations/state";
// // // // // // import districts from "../../constants/locations/districts";
// // // // // // import subDistricts from "../../constants/locations/subDistricts";

// // // // // // export default function FilterModal({ visible, onClose }) {
// // // // // //   const { width } = useWindowDimensions();

// // // // // //   // 🌿 Custom Zero Estate Color Palette (same as Login)
// // // // // //   const brandPrimary = "#43C6AC";
// // // // // //   const brandSecondary = "#20A68B";
// // // // // //   const lightBg = "#F7FFFC";
// // // // // //   const cardColor = "#FFFFFF";
// // // // // //   const borderColor = "#C8E6DC";
// // // // // //   const textColor = "#1A1A1A";

// // // // // //   // 🔹 Responsive scaling
// // // // // //   const baseFont = width < 360 ? 12 : width < 420 ? 13 : 14;
// // // // // //   const titleFont = baseFont + 6;
// // // // // //   const subtitleFont = baseFont + 3;
// // // // // //   const buttonFont = baseFont + 1;

// // // // // //   // 🔹 Filters state
// // // // // //   const [size, setSize] = useState(2500);
// // // // // //   const [minPrice, setMinPrice] = useState(5000);
// // // // // //   const [maxPrice, setMaxPrice] = useState(15000);
// // // // // //   const [propertyType, setPropertyType] = useState(null);
// // // // // //   const [state, setState] = useState("");
// // // // // //   const [district, setDistrict] = useState("");
// // // // // //   const [subDistrict, setSubDistrict] = useState("");
// // // // // //   const [bedrooms, setBedrooms] = useState("");
// // // // // //   const [bathrooms, setBathrooms] = useState("");
// // // // // //   const [kitchen, setKitchen] = useState("");

// // // // // //   // 🔹 Dropdown open states
// // // // // //   const [stateOpen, setStateOpen] = useState(false);
// // // // // //   const [districtOpen, setDistrictOpen] = useState(false);
// // // // // //   const [subDistrictOpen, setSubDistrictOpen] = useState(false);
// // // // // //   const [bedroomOpen, setBedroomOpen] = useState(false);
// // // // // //   const [bathroomOpen, setBathroomOpen] = useState(false);
// // // // // //   const [kitchenOpen, setKitchenOpen] = useState(false);

// // // // // //   // 🔹 Items
// // // // // //   const stateItems = states.map((s) => ({ label: s, value: s }));
// // // // // //   const districtItems = state
// // // // // //     ? (districts[state] || []).map((d) => ({ label: d, value: d }))
// // // // // //     : [];
// // // // // //   const subDistrictItems = district
// // // // // //     ? (subDistricts[district] || []).map((sd) => ({ label: sd, value: sd }))
// // // // // //     : [];

// // // // // //   const bedroomItems = ["1", "2", "3", "4+"].map((b) => ({ label: b, value: b }));
// // // // // //   const bathroomItems = ["1", "2", "3", "4+"].map((b) => ({ label: b, value: b }));
// // // // // //   const kitchenItems = ["Yes", "No"].map((k) => ({ label: k, value: k }));

// // // // // //   // 🔹 Apply filters (global navigation)
// // // // // //   const applyFilters = () => {
// // // // // //     onClose();
// // // // // //     setTimeout(() => {
// // // // // //       navigate("MatchedProperties", {
// // // // // //         filters: {
// // // // // //           size,
// // // // // //           minPrice,
// // // // // //           maxPrice,
// // // // // //           category: propertyType,
// // // // // //           state,
// // // // // //           district,
// // // // // //           subDistrict,
// // // // // //           bedrooms,
// // // // // //           bathrooms,
// // // // // //           kitchen,
// // // // // //         },
// // // // // //       });
// // // // // //     }, 300);
// // // // // //   };

// // // // // //   return (
// // // // // //     <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
// // // // // //       <SafeAreaView style={styles.safeView}>
// // // // // //         <View style={styles.overlay}>
// // // // // //           <View style={[styles.container, { backgroundColor: cardColor }]}>
// // // // // //             <GlobalText
// // // // // //               style={[
// // // // // //                 styles.title,
// // // // // //                 { color: brandSecondary, fontSize: titleFont },
// // // // // //               ]}
// // // // // //             >
// // // // // //               🔍 Filter Properties
// // // // // //             </GlobalText>

// // // // // //             <ScrollView
// // // // // //               nestedScrollEnabled
// // // // // //               showsVerticalScrollIndicator={false}
// // // // // //               contentContainerStyle={{ paddingBottom: 100 }}
// // // // // //             >
// // // // // //               {/* 🏠 Property Type */}
// // // // // //               <GlobalText
// // // // // //                 style={[
// // // // // //                   styles.subtitle,
// // // // // //                   { color: textColor, fontSize: subtitleFont },
// // // // // //                 ]}
// // // // // //               >
// // // // // //                 Property Type
// // // // // //               </GlobalText>

// // // // // //               <ScrollView
// // // // // //                 horizontal
// // // // // //                 showsHorizontalScrollIndicator={false}
// // // // // //                 contentContainerStyle={{ paddingVertical: 8 }}
// // // // // //               >
// // // // // //                 {[
// // // // // //                   "House",
// // // // // //                   "Apartment",
// // // // // //                   "Office",
// // // // // //                   "Land",
// // // // // //                   "Sites",
// // // // // //                   "Godown",
// // // // // //                   "Factory",
// // // // // //                 ].map((type) => (
// // // // // //                   <TouchableOpacity
// // // // // //                     key={type}
// // // // // //                     style={[
// // // // // //                       styles.typeBtn,
// // // // // //                       {
// // // // // //                         backgroundColor:
// // // // // //                           propertyType === type ? brandPrimary : "#EAF8F5",
// // // // // //                         marginRight: 10,
// // // // // //                       },
// // // // // //                     ]}
// // // // // //                     onPress={() => setPropertyType(type)}
// // // // // //                   >
// // // // // //                     <GlobalText
// // // // // //                       style={{
// // // // // //                         color:
// // // // // //                           propertyType === type ? "#fff" : brandSecondary,
// // // // // //                         fontWeight: "600",
// // // // // //                         fontSize: baseFont,
// // // // // //                       }}
// // // // // //                     >
// // // // // //                       {type}
// // // // // //                     </GlobalText>
// // // // // //                   </TouchableOpacity>
// // // // // //                 ))}
// // // // // //               </ScrollView>

// // // // // //               {/* 📍 Location Filters */}
// // // // // //               <GlobalText
// // // // // //                 style={[
// // // // // //                   styles.subtitle,
// // // // // //                   { color: textColor, fontSize: subtitleFont },
// // // // // //                 ]}
// // // // // //               >
// // // // // //                 Location
// // // // // //               </GlobalText>

// // // // // //               <DropDownPicker
// // // // // //                 open={stateOpen}
// // // // // //                 value={state}
// // // // // //                 items={stateItems}
// // // // // //                 setOpen={setStateOpen}
// // // // // //                 setValue={setState}
// // // // // //                 placeholder="-- Select State --"
// // // // // //                 style={[styles.dropdownBox, { borderColor: borderColor }]}
// // // // // //                 dropDownContainerStyle={styles.dropdownList}
// // // // // //                 listMode="SCROLLVIEW"
// // // // // //                 zIndex={3000}
// // // // // //                 onChangeValue={(v) => {
// // // // // //                   setState(v);
// // // // // //                   setDistrict("");
// // // // // //                   setSubDistrict("");
// // // // // //                 }}
// // // // // //               />

// // // // // //               <DropDownPicker
// // // // // //                 open={districtOpen}
// // // // // //                 value={district}
// // // // // //                 items={districtItems}
// // // // // //                 setOpen={setDistrictOpen}
// // // // // //                 setValue={setDistrict}
// // // // // //                 placeholder="-- Select District --"
// // // // // //                 style={[styles.dropdownBox, { borderColor: borderColor }]}
// // // // // //                 dropDownContainerStyle={styles.dropdownList}
// // // // // //                 listMode="SCROLLVIEW"
// // // // // //                 zIndex={2000}
// // // // // //                 disabled={!state}
// // // // // //                 onChangeValue={(v) => {
// // // // // //                   setDistrict(v);
// // // // // //                   setSubDistrict("");
// // // // // //                 }}
// // // // // //               />

// // // // // //               <DropDownPicker
// // // // // //                 open={subDistrictOpen}
// // // // // //                 value={subDistrict}
// // // // // //                 items={subDistrictItems}
// // // // // //                 setOpen={setSubDistrictOpen}
// // // // // //                 setValue={setSubDistrict}
// // // // // //                 placeholder="-- Select Sub-District --"
// // // // // //                 style={[styles.dropdownBox, { borderColor: borderColor }]}
// // // // // //                 dropDownContainerStyle={styles.dropdownList}
// // // // // //                 listMode="SCROLLVIEW"
// // // // // //                 zIndex={1000}
// // // // // //                 disabled={!district}
// // // // // //               />

// // // // // //               {/* 🛏️ Details Section */}
// // // // // //               <GlobalText
// // // // // //                 style={[
// // // // // //                   styles.subtitle,
// // // // // //                   { color: textColor, fontSize: subtitleFont },
// // // // // //                 ]}
// // // // // //               >
// // // // // //                 Details
// // // // // //               </GlobalText>

// // // // // //               <DropDownPicker
// // // // // //                 open={bedroomOpen}
// // // // // //                 value={bedrooms}
// // // // // //                 items={bedroomItems}
// // // // // //                 setOpen={setBedroomOpen}
// // // // // //                 setValue={setBedrooms}
// // // // // //                 placeholder="Bedrooms"
// // // // // //                 style={[styles.dropdownBox, { borderColor: borderColor }]}
// // // // // //                 dropDownContainerStyle={styles.dropdownList}
// // // // // //                 listMode="SCROLLVIEW"
// // // // // //                 zIndex={900}
// // // // // //               />

// // // // // //               <DropDownPicker
// // // // // //                 open={bathroomOpen}
// // // // // //                 value={bathrooms}
// // // // // //                 items={bathroomItems}
// // // // // //                 setOpen={setBathroomOpen}
// // // // // //                 setValue={setBathrooms}
// // // // // //                 placeholder="Bathrooms"
// // // // // //                 style={[styles.dropdownBox, { borderColor: borderColor }]}
// // // // // //                 dropDownContainerStyle={styles.dropdownList}
// // // // // //                 listMode="SCROLLVIEW"
// // // // // //                 zIndex={800}
// // // // // //               />

// // // // // //               <DropDownPicker
// // // // // //                 open={kitchenOpen}
// // // // // //                 value={kitchen}
// // // // // //                 items={kitchenItems}
// // // // // //                 setOpen={setKitchenOpen}
// // // // // //                 setValue={setKitchen}
// // // // // //                 placeholder="Kitchen"
// // // // // //                 style={[styles.dropdownBox, { borderColor: borderColor }]}
// // // // // //                 dropDownContainerStyle={styles.dropdownList}
// // // // // //                 listMode="SCROLLVIEW"
// // // // // //                 zIndex={700}
// // // // // //               />

// // // // // //               {/* 📏 Property Size */}
// // // // // //               <GlobalText
// // // // // //                 style={[
// // // // // //                   styles.subtitle,
// // // // // //                   { color: textColor, fontSize: subtitleFont },
// // // // // //                 ]}
// // // // // //               >
// // // // // //                 Property Size
// // // // // //               </GlobalText>

// // // // // //               <Slider
// // // // // //                 style={{ width: "100%" }}
// // // // // //                 minimumValue={500}
// // // // // //                 maximumValue={5000}
// // // // // //                 step={100}
// // // // // //                 value={size}
// // // // // //                 minimumTrackTintColor={brandSecondary}
// // // // // //                 maximumTrackTintColor="#D1EAE3"
// // // // // //                 onValueChange={setSize}
// // // // // //               />
// // // // // //               <GlobalText style={{ color: brandPrimary, textAlign: "right" }}>
// // // // // //                 Up to {size} sqft
// // // // // //               </GlobalText>

// // // // // //               {/* 💰 Price Range */}
// // // // // //               <GlobalText
// // // // // //                 style={[
// // // // // //                   styles.subtitle,
// // // // // //                   { color: textColor, fontSize: subtitleFont },
// // // // // //                 ]}
// // // // // //               >
// // // // // //                 Price Range
// // // // // //               </GlobalText>

// // // // // //               <Slider
// // // // // //                 style={{ width: "100%" }}
// // // // // //                 minimumValue={1000}
// // // // // //                 maximumValue={30000}
// // // // // //                 step={500}
// // // // // //                 value={minPrice}
// // // // // //                 minimumTrackTintColor={brandSecondary}
// // // // // //                 maximumTrackTintColor="#D1EAE3"
// // // // // //                 onValueChange={setMinPrice}
// // // // // //               />
// // // // // //               <GlobalText style={{ color: brandPrimary, textAlign: "right" }}>
// // // // // //                 Min: ₹{minPrice}
// // // // // //               </GlobalText>

// // // // // //               <Slider
// // // // // //                 style={{ width: "100%" }}
// // // // // //                 minimumValue={5000}
// // // // // //                 maximumValue={50000}
// // // // // //                 step={500}
// // // // // //                 value={maxPrice}
// // // // // //                 minimumTrackTintColor={brandSecondary}
// // // // // //                 maximumTrackTintColor="#D1EAE3"
// // // // // //                 onValueChange={setMaxPrice}
// // // // // //               />
// // // // // //               <GlobalText style={{ color: brandPrimary, textAlign: "right" }}>
// // // // // //                 Max: ₹{maxPrice}
// // // // // //               </GlobalText>
// // // // // //             </ScrollView>

// // // // // //             {/* ✅ Action Buttons */}
// // // // // //             <View style={styles.btnRow}>
// // // // // //               <TouchableOpacity
// // // // // //                 style={[styles.resetBtn, { borderColor: brandPrimary }]}
// // // // // //                 onPress={() => {
// // // // // //                   setSize(2500);
// // // // // //                   setMinPrice(50000);
// // // // // //                   setMaxPrice(1000000);
// // // // // //                   setPropertyType(null);
// // // // // //                   setState("");
// // // // // //                   setDistrict("");
// // // // // //                   setSubDistrict("");
// // // // // //                   setBedrooms("");
// // // // // //                   setBathrooms("");
// // // // // //                   setKitchen("");
// // // // // //                 }}
// // // // // //               >
// // // // // //                 <GlobalText
// // // // // //                   style={{
// // // // // //                     color: brandPrimary,
// // // // // //                     fontWeight: "600",
// // // // // //                     fontSize: buttonFont,
// // // // // //                     textAlign: "center",
// // // // // //                   }}
// // // // // //                 >
// // // // // //                   Reset
// // // // // //                 </GlobalText>
// // // // // //               </TouchableOpacity>

// // // // // //               <TouchableOpacity
// // // // // //                 style={[styles.applyBtn, { backgroundColor: brandPrimary }]}
// // // // // //                 onPress={applyFilters}
// // // // // //               >
// // // // // //                 <GlobalText
// // // // // //                   style={{
// // // // // //                     color: "#fff",
// // // // // //                     fontWeight: "600",
// // // // // //                     fontSize: buttonFont,
// // // // // //                     textAlign: "center",
// // // // // //                   }}
// // // // // //                 >
// // // // // //                   Apply Filters
// // // // // //                 </GlobalText>
// // // // // //               </TouchableOpacity>
// // // // // //             </View>
// // // // // //           </View>
// // // // // //         </View>
// // // // // //       </SafeAreaView>
// // // // // //     </Modal>
// // // // // //   );
// // // // // // }

// // // // // // const styles = StyleSheet.create({
// // // // // //   safeView: {
// // // // // //     flex: 1,
// // // // // //     backgroundColor: "rgba(0,0,0,0.4)",
// // // // // //   },
// // // // // //   overlay: {
// // // // // //     flex: 1,
// // // // // //     justifyContent: "flex-end",
// // // // // //   },
// // // // // //   container: {
// // // // // //     borderTopLeftRadius: 28,
// // // // // //     borderTopRightRadius: 28,
// // // // // //     padding: 20,
// // // // // //     maxHeight: "88%",
// // // // // //     elevation: 8,
// // // // // //     shadowColor: "#000",
// // // // // //     shadowOpacity: 0.2,
// // // // // //     shadowRadius: 8,
// // // // // //   },
// // // // // //   title: { fontWeight: "bold", marginBottom: 15, textAlign: "center" },
// // // // // //   subtitle: { fontWeight: "600", marginTop: 15 },
// // // // // //   typeBtn: {
// // // // // //     paddingVertical: 8,
// // // // // //     paddingHorizontal: 15,
// // // // // //     borderRadius: 20,
// // // // // //     elevation: 1,
// // // // // //   },
// // // // // //   btnRow: {
// // // // // //     flexDirection: "row",
// // // // // //     justifyContent: "space-between",
// // // // // //     marginTop: 25,
// // // // // //   },
// // // // // //   resetBtn: {
// // // // // //     borderWidth: 1,
// // // // // //     borderRadius: 12,
// // // // // //     padding: 12,
// // // // // //     flex: 1,
// // // // // //     marginRight: 10,
// // // // // //   },
// // // // // //   applyBtn: {
// // // // // //     borderRadius: 12,
// // // // // //     padding: 12,
// // // // // //     flex: 2,
// // // // // //     shadowColor: "#000",
// // // // // //     shadowOpacity: 0.15,
// // // // // //     shadowRadius: 4,
// // // // // //     elevation: 2,
// // // // // //   },
// // // // // //   dropdownBox: {
// // // // // //     borderWidth: 1.5,
// // // // // //     borderRadius: 12,
// // // // // //     backgroundColor: "#FFFFFF",
// // // // // //     marginVertical: 8,
// // // // // //   },
// // // // // //   dropdownList: {
// // // // // //     borderColor: "#43C6AC",
// // // // // //     borderWidth: 1.5,
// // // // // //     borderRadius: 12,
// // // // // //     backgroundColor: "#E9FFF5",
// // // // // //   },
// // // // // // });

// // // // // // import React, { useState } from "react";
// // // // // // import {
// // // // // //   View,
// // // // // //   StyleSheet,
// // // // // //   TouchableOpacity,
// // // // // //   Modal,
// // // // // //   ScrollView,
// // // // // //   useWindowDimensions,
// // // // // // } from "react-native";
// // // // // // import Slider from "@react-native-community/slider";
// // // // // // import { useTheme } from "@react-navigation/native";
// // // // // // import DropDownPicker from "react-native-dropdown-picker";
// // // // // // import GlobalText from "../../theme/GlobalText";

// // // // // // // ✅ Location constants
// // // // // // import states from "../../constants/locations/state";
// // // // // // import districts from "../../constants/locations/districts";
// // // // // // import subDistricts from "../../constants/locations/subDistricts";

// // // // // // export default function FilterModal({ visible, onClose, navigation }) {
// // // // // //   const { colors } = useTheme();
// // // // // //   const { width } = useWindowDimensions();

// // // // // //   // 🔹 Responsive scaling
// // // // // //   const baseFont = width < 360 ? 12 : width < 420 ? 13 : 14;
// // // // // //   const titleFont = baseFont + 6;
// // // // // //   const subtitleFont = baseFont + 3;
// // // // // //   const buttonFont = baseFont + 1;

// // // // // //   // 🔹 Filters state
// // // // // //   const [size, setSize] = useState(2500);
// // // // // //   const [minPrice, setMinPrice] = useState(5000);
// // // // // //   const [maxPrice, setMaxPrice] = useState(15000);
// // // // // //   const [propertyType, setPropertyType] = useState(null);

// // // // // //   const [state, setState] = useState("");
// // // // // //   const [district, setDistrict] = useState("");
// // // // // //   const [subDistrict, setSubDistrict] = useState("");

// // // // // //   const [bedrooms, setBedrooms] = useState("");
// // // // // //   const [bathrooms, setBathrooms] = useState("");
// // // // // //   const [kitchen, setKitchen] = useState("");

// // // // // //   // 🔹 Dropdown open states
// // // // // //   const [stateOpen, setStateOpen] = useState(false);
// // // // // //   const [districtOpen, setDistrictOpen] = useState(false);
// // // // // //   const [subDistrictOpen, setSubDistrictOpen] = useState(false);
// // // // // //   const [bedroomOpen, setBedroomOpen] = useState(false);
// // // // // //   const [bathroomOpen, setBathroomOpen] = useState(false);
// // // // // //   const [kitchenOpen, setKitchenOpen] = useState(false);

// // // // // //   // 🔹 Items
// // // // // //   const stateItems = states.map((s) => ({ label: s, value: s }));
// // // // // //   const districtItems = state
// // // // // //     ? (districts[state] || []).map((d) => ({ label: d, value: d }))
// // // // // //     : [];
// // // // // //   const subDistrictItems = district
// // // // // //     ? (subDistricts[district] || []).map((sd) => ({ label: sd, value: sd }))
// // // // // //     : [];

// // // // // //   const bedroomItems = ["1", "2", "3", "4+"].map((b) => ({ label: b, value: b }));
// // // // // //   const bathroomItems = ["1", "2", "3", "4+"].map((b) => ({ label: b, value: b }));
// // // // // //   const kitchenItems = ["Yes", "No"].map((k) => ({ label: k, value: k }));

// // // // // //   // 🔹 Apply filters (navigate after modal closes)
// // // // // //   const applyFilters = () => {
// // // // // //     onClose();

// // // // // //     // ✅ Use correct screen name (case-sensitive)
// // // // // //     setTimeout(() => {
// // // // // //       navigation.navigate("MatchedProperties", {
// // // // // //         filters: {
// // // // // //           size,
// // // // // //           minPrice,
// // // // // //           maxPrice,
// // // // // //           propertyType,
// // // // // //           state,
// // // // // //           district,
// // // // // //           subDistrict,
// // // // // //           bedrooms,
// // // // // //           bathrooms,
// // // // // //           kitchen,
// // // // // //         },
// // // // // //       });
// // // // // //     }, 300);
// // // // // //   };

// // // // // //   return (
// // // // // //     <Modal
// // // // // //       visible={visible}
// // // // // //       animationType="slide"
// // // // // //       transparent
// // // // // //       onRequestClose={onClose}
// // // // // //     >
// // // // // //       <View style={styles.overlay}>
// // // // // //         <View style={[styles.container, { backgroundColor: colors.card }]}>
// // // // // //           <GlobalText
// // // // // //             numberOfLines={1}
// // // // // //             adjustsFontSizeToFit
// // // // // //             style={[styles.title, { color: colors.text, fontSize: titleFont }]}
// // // // // //           >
// // // // // //             Filter
// // // // // //           </GlobalText>

// // // // // //           <ScrollView
// // // // // //             nestedScrollEnabled
// // // // // //             showsVerticalScrollIndicator={false}
// // // // // //             contentContainerStyle={{ paddingBottom: 100 }}
// // // // // //           >
// // // // // //             {/* 🏠 Property Type */}
// // // // // //             <GlobalText
// // // // // //               style={[styles.subtitle, { color: colors.text, fontSize: subtitleFont }]}
// // // // // //             >
// // // // // //               Property Type
// // // // // //             </GlobalText>

// // // // // //             {/* 🔹 Scrollable Horizontal Property Types */}
// // // // // //             <ScrollView
// // // // // //               horizontal
// // // // // //               showsHorizontalScrollIndicator={false}
// // // // // //               contentContainerStyle={{ paddingVertical: 8 }}
// // // // // //             >
// // // // // //               {[
// // // // // //                 "House",
// // // // // //                 "Apartment",
// // // // // //                 "Office",
// // // // // //                 "Land",
// // // // // //                 "Sites",
// // // // // //                 "Godown",
// // // // // //                 "Factory",
// // // // // //               ].map((type) => (
// // // // // //                 <TouchableOpacity
// // // // // //                   key={type}
// // // // // //                   style={[
// // // // // //                     styles.typeBtn,
// // // // // //                     {
// // // // // //                       backgroundColor:
// // // // // //                         propertyType === type ? colors.primary : "#f0f0f0",
// // // // // //                       marginRight: 10,
// // // // // //                     },
// // // // // //                   ]}
// // // // // //                   onPress={() => setPropertyType(type)}
// // // // // //                 >
// // // // // //                   <GlobalText
// // // // // //                     numberOfLines={1}
// // // // // //                     adjustsFontSizeToFit
// // // // // //                     style={{
// // // // // //                       color:
// // // // // //                         propertyType === type ? colors.card : colors.text,
// // // // // //                       fontWeight: "600",
// // // // // //                       fontSize: baseFont,
// // // // // //                     }}
// // // // // //                   >
// // // // // //                     {type}
// // // // // //                   </GlobalText>
// // // // // //                 </TouchableOpacity>
// // // // // //               ))}
// // // // // //             </ScrollView>

// // // // // //             {/* 📍 Location Filters */}
// // // // // //             <GlobalText
// // // // // //               style={[styles.subtitle, { color: colors.text, fontSize: subtitleFont }]}
// // // // // //             >
// // // // // //               Location
// // // // // //             </GlobalText>

// // // // // //             <DropDownPicker
// // // // // //               open={stateOpen}
// // // // // //               value={state}
// // // // // //               items={stateItems}
// // // // // //               setOpen={setStateOpen}
// // // // // //               setValue={setState}
// // // // // //               placeholder="-- Select State --"
// // // // // //               style={styles.dropdownBox}
// // // // // //               dropDownContainerStyle={styles.dropdownList}
// // // // // //               listMode="SCROLLVIEW"
// // // // // //               zIndex={3000}
// // // // // //               zIndexInverse={1000}
// // // // // //               onChangeValue={(v) => {
// // // // // //                 setState(v);
// // // // // //                 setDistrict("");
// // // // // //                 setSubDistrict("");
// // // // // //               }}
// // // // // //             />

// // // // // //             <DropDownPicker
// // // // // //               open={districtOpen}
// // // // // //               value={district}
// // // // // //               items={districtItems}
// // // // // //               setOpen={setDistrictOpen}
// // // // // //               setValue={setDistrict}
// // // // // //               placeholder="-- Select District --"
// // // // // //               style={styles.dropdownBox}
// // // // // //               dropDownContainerStyle={styles.dropdownList}
// // // // // //               listMode="SCROLLVIEW"
// // // // // //               zIndex={2000}
// // // // // //               zIndexInverse={2000}
// // // // // //               disabled={!state}
// // // // // //               onChangeValue={(v) => {
// // // // // //                 setDistrict(v);
// // // // // //                 setSubDistrict("");
// // // // // //               }}
// // // // // //             />

// // // // // //             <DropDownPicker
// // // // // //               open={subDistrictOpen}
// // // // // //               value={subDistrict}
// // // // // //               items={subDistrictItems}
// // // // // //               setOpen={setSubDistrictOpen}
// // // // // //               setValue={setSubDistrict}
// // // // // //               placeholder="-- Select Sub-District --"
// // // // // //               style={styles.dropdownBox}
// // // // // //               dropDownContainerStyle={styles.dropdownList}
// // // // // //               listMode="SCROLLVIEW"
// // // // // //               zIndex={1000}
// // // // // //               zIndexInverse={3000}
// // // // // //               disabled={!district}
// // // // // //             />

// // // // // //             {/* 🛏️ Details Section */}
// // // // // //             <GlobalText
// // // // // //               style={[styles.subtitle, { color: colors.text, fontSize: subtitleFont }]}
// // // // // //             >
// // // // // //               Details
// // // // // //             </GlobalText>

// // // // // //             <DropDownPicker
// // // // // //               open={bedroomOpen}
// // // // // //               value={bedrooms}
// // // // // //               items={bedroomItems}
// // // // // //               setOpen={setBedroomOpen}
// // // // // //               setValue={setBedrooms}
// // // // // //               placeholder="Bedrooms"
// // // // // //               style={styles.dropdownBox}
// // // // // //               dropDownContainerStyle={styles.dropdownList}
// // // // // //               listMode="SCROLLVIEW"
// // // // // //               zIndex={900}
// // // // // //               zIndexInverse={400}
// // // // // //             />

// // // // // //             <DropDownPicker
// // // // // //               open={bathroomOpen}
// // // // // //               value={bathrooms}
// // // // // //               items={bathroomItems}
// // // // // //               setOpen={setBathroomOpen}
// // // // // //               setValue={setBathrooms}
// // // // // //               placeholder="Bathrooms"
// // // // // //               style={styles.dropdownBox}
// // // // // //               dropDownContainerStyle={styles.dropdownList}
// // // // // //               listMode="SCROLLVIEW"
// // // // // //               zIndex={800}
// // // // // //               zIndexInverse={300}
// // // // // //             />

// // // // // //             <DropDownPicker
// // // // // //               open={kitchenOpen}
// // // // // //               value={kitchen}
// // // // // //               items={kitchenItems}
// // // // // //               setOpen={setKitchenOpen}
// // // // // //               setValue={setKitchen}
// // // // // //               placeholder="Kitchen"
// // // // // //               style={styles.dropdownBox}
// // // // // //               dropDownContainerStyle={styles.dropdownList}
// // // // // //               listMode="SCROLLVIEW"
// // // // // //               zIndex={700}
// // // // // //               zIndexInverse={200}
// // // // // //             />

// // // // // //             {/* 📏 Property Size */}
// // // // // //             <GlobalText
// // // // // //               style={[styles.subtitle, { color: colors.text, fontSize: subtitleFont }]}
// // // // // //             >
// // // // // //               Property Size
// // // // // //             </GlobalText>

// // // // // //             <Slider
// // // // // //               style={{ width: "100%" }}
// // // // // //               minimumValue={500}
// // // // // //               maximumValue={5000}
// // // // // //               step={100}
// // // // // //               value={size}
// // // // // //               minimumTrackTintColor={colors.primary}
// // // // // //               maximumTrackTintColor={colors.border}
// // // // // //               onValueChange={setSize}
// // // // // //             />
// // // // // //             <GlobalText style={{ color: colors.primary, textAlign: "right" }}>
// // // // // //               Up to {size} sqft
// // // // // //             </GlobalText>

// // // // // //             {/* 💰 Price Range */}
// // // // // //             <GlobalText
// // // // // //               style={[styles.subtitle, { color: colors.text, fontSize: subtitleFont }]}
// // // // // //             >
// // // // // //               Price Range
// // // // // //             </GlobalText>

// // // // // //             <Slider
// // // // // //               style={{ width: "100%" }}
// // // // // //               minimumValue={1000}
// // // // // //               maximumValue={30000}
// // // // // //               step={500}
// // // // // //               value={minPrice}
// // // // // //               minimumTrackTintColor={colors.primary}
// // // // // //               maximumTrackTintColor={colors.border}
// // // // // //               onValueChange={setMinPrice}
// // // // // //             />
// // // // // //             <GlobalText style={{ color: colors.primary, textAlign: "right" }}>
// // // // // //               Min: ₹{minPrice}
// // // // // //             </GlobalText>

// // // // // //             <Slider
// // // // // //               style={{ width: "100%" }}
// // // // // //               minimumValue={5000}
// // // // // //               maximumValue={50000}
// // // // // //               step={500}
// // // // // //               value={maxPrice}
// // // // // //               minimumTrackTintColor={colors.primary}
// // // // // //               maximumTrackTintColor={colors.border}
// // // // // //               onValueChange={setMaxPrice}
// // // // // //             />
// // // // // //             <GlobalText style={{ color: colors.primary, textAlign: "right" }}>
// // // // // //               Max: ₹{maxPrice}
// // // // // //             </GlobalText>
// // // // // //           </ScrollView>

// // // // // //           {/* ✅ Action Buttons */}
// // // // // //           <View style={styles.btnRow}>
// // // // // //             <TouchableOpacity
// // // // // //               style={[styles.resetBtn, { borderColor: colors.primary }]}
// // // // // //               onPress={() => {
// // // // // //                 setSize(2500);
// // // // // //                 setMinPrice(5000);
// // // // // //                 setMaxPrice(15000);
// // // // // //                 setPropertyType(null);
// // // // // //                 setState("");
// // // // // //                 setDistrict("");
// // // // // //                 setSubDistrict("");
// // // // // //                 setBedrooms("");
// // // // // //                 setBathrooms("");
// // // // // //                 setKitchen("");
// // // // // //               }}
// // // // // //             >
// // // // // //               <GlobalText
// // // // // //                 style={{
// // // // // //                   color: colors.primary,
// // // // // //                   fontWeight: "600",
// // // // // //                   fontSize: buttonFont,
// // // // // //                   textAlign: "center",
// // // // // //                 }}
// // // // // //               >
// // // // // //                 Reset
// // // // // //               </GlobalText>
// // // // // //             </TouchableOpacity>

// // // // // //             <TouchableOpacity
// // // // // //               style={[styles.applyBtn, { backgroundColor: colors.primary }]}
// // // // // //               onPress={applyFilters}
// // // // // //             >
// // // // // //               <GlobalText
// // // // // //                 style={{
// // // // // //                   color: colors.card,
// // // // // //                   fontWeight: "600",
// // // // // //                   fontSize: buttonFont,
// // // // // //                   textAlign: "center",
// // // // // //                 }}
// // // // // //               >
// // // // // //                 Apply Filters
// // // // // //               </GlobalText>
// // // // // //             </TouchableOpacity>
// // // // // //           </View>
// // // // // //         </View>
// // // // // //       </View>
// // // // // //     </Modal>
// // // // // //   );
// // // // // // }

// // // // // // const styles = StyleSheet.create({
// // // // // //   overlay: {
// // // // // //     flex: 1,
// // // // // //     justifyContent: "flex-end",
// // // // // //     backgroundColor: "rgba(0,0,0,0.4)",
// // // // // //   },
// // // // // //   container: {
// // // // // //     borderTopLeftRadius: 30,
// // // // // //     borderTopRightRadius: 30,
// // // // // //     padding: 20,
// // // // // //     maxHeight: "88%",
// // // // // //     elevation: 10,
// // // // // //     shadowColor: "#000",
// // // // // //     shadowOpacity: 0.2,
// // // // // //     shadowRadius: 8,
// // // // // //   },
// // // // // //   title: { fontWeight: "bold", marginBottom: 15 },
// // // // // //   subtitle: { fontWeight: "600", marginTop: 15 },
// // // // // //   typeBtn: {
// // // // // //     paddingVertical: 8,
// // // // // //     paddingHorizontal: 15,
// // // // // //     borderRadius: 20,
// // // // // //     elevation: 2,
// // // // // //   },
// // // // // //   btnRow: {
// // // // // //     flexDirection: "row",
// // // // // //     justifyContent: "space-between",
// // // // // //     marginTop: 25,
// // // // // //   },
// // // // // //   resetBtn: {
// // // // // //     borderWidth: 1,
// // // // // //     borderRadius: 12,
// // // // // //     padding: 12,
// // // // // //     flex: 1,
// // // // // //     marginRight: 10,
// // // // // //   },
// // // // // //   applyBtn: { borderRadius: 12, padding: 12, flex: 2 },
// // // // // //   dropdownBox: {
// // // // // //     borderColor: "#ccc",
// // // // // //     borderWidth: 1.5,
// // // // // //     borderRadius: 12,
// // // // // //     backgroundColor: "#fff",
// // // // // //     marginVertical: 8,
// // // // // //   },
// // // // // //   dropdownList: {
// // // // // //     borderColor: "#43C6AC",
// // // // // //     borderWidth: 1.5,
// // // // // //     borderRadius: 12,
// // // // // //     backgroundColor: "#f1fff8",
// // // // // //   },
// // // // // // });


// // // // // // // import React, { useState } from "react";
// // // // // // // import {
// // // // // // //   View,
// // // // // // //   StyleSheet,
// // // // // // //   TouchableOpacity,
// // // // // // //   Modal,
// // // // // // //   ScrollView,
// // // // // // // } from "react-native";
// // // // // // // import Slider from "@react-native-community/slider";
// // // // // // // import { useTheme, useNavigation } from "@react-navigation/native";
// // // // // // // import DropDownPicker from "react-native-dropdown-picker";

// // // // // // // import GlobalText from "../../theme/GlobalText"; // 👈 Import your global text

// // // // // // // // ✅ Location constants
// // // // // // // import states from "../../constants/locations/state";
// // // // // // // import districts from "../../constants/locations/districts";
// // // // // // // import subDistricts from "../../constants/locations/subDistricts";

// // // // // // // export default function FilterModal({ visible, onClose }) {
// // // // // // //   const { colors } = useTheme();
// // // // // // //   const navigation = useNavigation();

// // // // // // //   // 🔹 Filters state
// // // // // // //   const [size, setSize] = useState(2500);
// // // // // // //   const [minPrice, setMinPrice] = useState(5000);
// // // // // // //   const [maxPrice, setMaxPrice] = useState(15000);
// // // // // // //   const [propertyType, setPropertyType] = useState(null);

// // // // // // //   const [state, setState] = useState("");
// // // // // // //   const [district, setDistrict] = useState("");
// // // // // // //   const [subDistrict, setSubDistrict] = useState("");

// // // // // // //   const [bedrooms, setBedrooms] = useState("");
// // // // // // //   const [bathrooms, setBathrooms] = useState("");
// // // // // // //   const [kitchen, setKitchen] = useState("");

// // // // // // //   // 🔹 Dropdown open states
// // // // // // //   const [stateOpen, setStateOpen] = useState(false);
// // // // // // //   const [districtOpen, setDistrictOpen] = useState(false);
// // // // // // //   const [subDistrictOpen, setSubDistrictOpen] = useState(false);
// // // // // // //   const [bedroomOpen, setBedroomOpen] = useState(false);
// // // // // // //   const [bathroomOpen, setBathroomOpen] = useState(false);
// // // // // // //   const [kitchenOpen, setKitchenOpen] = useState(false);

// // // // // // //   // 🔹 Items
// // // // // // //   const stateItems = states.map((s) => ({ label: s, value: s }));
// // // // // // //   const districtItems = state
// // // // // // //     ? (districts[state] || []).map((d) => ({ label: d, value: d }))
// // // // // // //     : [];
// // // // // // //   const subDistrictItems = district
// // // // // // //     ? (subDistricts[district] || []).map((sd) => ({ label: sd, value: sd }))
// // // // // // //     : [];

// // // // // // //   const bedroomItems = ["1", "2", "3", "4+"].map((b) => ({
// // // // // // //     label: b,
// // // // // // //     value: b,
// // // // // // //   }));
// // // // // // //   const bathroomItems = ["1", "2", "3", "4+"].map((b) => ({
// // // // // // //     label: b,
// // // // // // //     value: b,
// // // // // // //   }));
// // // // // // //   const kitchenItems = ["Yes", "No"].map((k) => ({
// // // // // // //     label: k,
// // // // // // //     value: k,
// // // // // // //   }));

// // // // // // //   // 🔹 Apply filters
// // // // // // //   const applyFilters = () => {
// // // // // // //     onClose();
// // // // // // //     navigation.navigate("Matchedproperties", {
// // // // // // //       filters: {
// // // // // // //         size,
// // // // // // //         minPrice,
// // // // // // //         maxPrice,
// // // // // // //         propertyType,
// // // // // // //         state,
// // // // // // //         district,
// // // // // // //         subDistrict,
// // // // // // //         bedrooms,
// // // // // // //         bathrooms,
// // // // // // //         kitchen,
// // // // // // //       },
// // // // // // //     });
// // // // // // //   };

// // // // // // //   return (
// // // // // // //     <Modal
// // // // // // //       visible={visible}
// // // // // // //       animationType="slide"
// // // // // // //       transparent
// // // // // // //       onRequestClose={onClose}
// // // // // // //     >
// // // // // // //       <View style={styles.overlay}>
// // // // // // //         <View style={[styles.container, { backgroundColor: colors.card }]}>
// // // // // // //           <GlobalText style={[styles.title, { color: colors.text }]}>
// // // // // // //             Filter
// // // // // // //           </GlobalText>

// // // // // // //           <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
// // // // // // //             {/* Category */}
// // // // // // //             <GlobalText style={[styles.subtitle, { color: colors.text }]}>
// // // // // // //               Property Type
// // // // // // //             </GlobalText>

// // // // // // //             <View style={styles.typeRow}>
// // // // // // //               {["House", "Apartment", "Office", "Land"].map((type) => (
// // // // // // //                 <TouchableOpacity
// // // // // // //                   key={type}
// // // // // // //                   style={[
// // // // // // //                     styles.typeBtn,
// // // // // // //                     {
// // // // // // //                       backgroundColor:
// // // // // // //                         propertyType === type
// // // // // // //                           ? colors.primary
// // // // // // //                           : colors.border,
// // // // // // //                     },
// // // // // // //                   ]}
// // // // // // //                   onPress={() => setPropertyType(type)}
// // // // // // //                 >
// // // // // // //                   <GlobalText
// // // // // // //                     style={{
// // // // // // //                       color:
// // // // // // //                         propertyType === type ? colors.card : colors.text,
// // // // // // //                       fontWeight: "600",
// // // // // // //                     }}
// // // // // // //                   >
// // // // // // //                     {type}
// // // // // // //                   </GlobalText>
// // // // // // //                 </TouchableOpacity>
// // // // // // //               ))}
// // // // // // //             </View>

// // // // // // //             {/* Location Filters */}
// // // // // // //             <GlobalText style={[styles.subtitle, { color: colors.text }]}>
// // // // // // //               Location
// // // // // // //             </GlobalText>

// // // // // // //             <DropDownPicker
// // // // // // //               open={stateOpen}
// // // // // // //               value={state}
// // // // // // //               items={stateItems}
// // // // // // //               setOpen={setStateOpen}
// // // // // // //               setValue={setState}
// // // // // // //               placeholder="-- Select State --"
// // // // // // //               style={styles.dropdownBox}
// // // // // // //               dropDownContainerStyle={styles.dropdownList}
// // // // // // //               listMode="SCROLLVIEW"
// // // // // // //               zIndex={3000}
// // // // // // //               zIndexInverse={1000}
// // // // // // //               onChangeValue={(v) => {
// // // // // // //                 setState(v);
// // // // // // //                 setDistrict("");
// // // // // // //                 setSubDistrict("");
// // // // // // //               }}
// // // // // // //             />

// // // // // // //             <DropDownPicker
// // // // // // //               open={districtOpen}
// // // // // // //               value={district}
// // // // // // //               items={districtItems}
// // // // // // //               setOpen={setDistrictOpen}
// // // // // // //               setValue={setDistrict}
// // // // // // //               placeholder="-- Select District --"
// // // // // // //               style={styles.dropdownBox}
// // // // // // //               dropDownContainerStyle={styles.dropdownList}
// // // // // // //               listMode="SCROLLVIEW"
// // // // // // //               zIndex={2000}
// // // // // // //               zIndexInverse={2000}
// // // // // // //               disabled={!state}
// // // // // // //               onChangeValue={(v) => {
// // // // // // //                 setDistrict(v);
// // // // // // //                 setSubDistrict("");
// // // // // // //               }}
// // // // // // //             />

// // // // // // //             <DropDownPicker
// // // // // // //               open={subDistrictOpen}
// // // // // // //               value={subDistrict}
// // // // // // //               items={subDistrictItems}
// // // // // // //               setOpen={setSubDistrictOpen}
// // // // // // //               setValue={setSubDistrict}
// // // // // // //               placeholder="-- Select Sub-District --"
// // // // // // //               style={styles.dropdownBox}
// // // // // // //               dropDownContainerStyle={styles.dropdownList}
// // // // // // //               listMode="SCROLLVIEW"
// // // // // // //               zIndex={1000}
// // // // // // //               zIndexInverse={3000}
// // // // // // //               disabled={!district}
// // // // // // //             />

// // // // // // //             {/* Bedrooms / Bathrooms / Kitchen */}
// // // // // // //             <GlobalText style={[styles.subtitle, { color: colors.text }]}>
// // // // // // //               Details
// // // // // // //             </GlobalText>

// // // // // // //             <DropDownPicker
// // // // // // //               open={bedroomOpen}
// // // // // // //               value={bedrooms}
// // // // // // //               items={bedroomItems}
// // // // // // //               setOpen={setBedroomOpen}
// // // // // // //               setValue={setBedrooms}
// // // // // // //               placeholder="Bedrooms"
// // // // // // //               style={styles.dropdownBox}
// // // // // // //               dropDownContainerStyle={styles.dropdownList}
// // // // // // //               listMode="SCROLLVIEW"
// // // // // // //               zIndex={900}
// // // // // // //               zIndexInverse={400}
// // // // // // //             />

// // // // // // //             <DropDownPicker
// // // // // // //               open={bathroomOpen}
// // // // // // //               value={bathrooms}
// // // // // // //               items={bathroomItems}
// // // // // // //               setOpen={setBathroomOpen}
// // // // // // //               setValue={setBathrooms}
// // // // // // //               placeholder="Bathrooms"
// // // // // // //               style={styles.dropdownBox}
// // // // // // //               dropDownContainerStyle={styles.dropdownList}
// // // // // // //               listMode="SCROLLVIEW"
// // // // // // //               zIndex={800}
// // // // // // //               zIndexInverse={300}
// // // // // // //             />

// // // // // // //             <DropDownPicker
// // // // // // //               open={kitchenOpen}
// // // // // // //               value={kitchen}
// // // // // // //               items={kitchenItems}
// // // // // // //               setOpen={setKitchenOpen}
// // // // // // //               setValue={setKitchen}
// // // // // // //               placeholder="Kitchen"
// // // // // // //               style={styles.dropdownBox}
// // // // // // //               dropDownContainerStyle={styles.dropdownList}
// // // // // // //               listMode="SCROLLVIEW"
// // // // // // //               zIndex={700}
// // // // // // //               zIndexInverse={200}
// // // // // // //             />

// // // // // // //             {/* Size */}
// // // // // // //             <GlobalText style={[styles.subtitle, { color: colors.text }]}>
// // // // // // //               Property Size
// // // // // // //             </GlobalText>

// // // // // // //             <Slider
// // // // // // //               style={{ width: "100%" }}
// // // // // // //               minimumValue={500}
// // // // // // //               maximumValue={5000}
// // // // // // //               step={100}
// // // // // // //               value={size}
// // // // // // //               minimumTrackTintColor={colors.primary}
// // // // // // //               maximumTrackTintColor={colors.border}
// // // // // // //               onValueChange={setSize}
// // // // // // //             />

// // // // // // //             <GlobalText
// // // // // // //               style={{ color: colors.primary, textAlign: "right" }}
// // // // // // //             >
// // // // // // //               Up to {size} sqft
// // // // // // //             </GlobalText>

// // // // // // //             {/* Price */}
// // // // // // //             <GlobalText style={[styles.subtitle, { color: colors.text }]}>
// // // // // // //               Price Range
// // // // // // //             </GlobalText>

// // // // // // //             <Slider
// // // // // // //               style={{ width: "100%" }}
// // // // // // //               minimumValue={1000}
// // // // // // //               maximumValue={30000}
// // // // // // //               step={500}
// // // // // // //               value={minPrice}
// // // // // // //               minimumTrackTintColor={colors.primary}
// // // // // // //               maximumTrackTintColor={colors.border}
// // // // // // //               onValueChange={setMinPrice}
// // // // // // //             />

// // // // // // //             <GlobalText
// // // // // // //               style={{ color: colors.primary, textAlign: "right" }}
// // // // // // //             >
// // // // // // //               Min: ${minPrice}
// // // // // // //             </GlobalText>

// // // // // // //             <Slider
// // // // // // //               style={{ width: "100%" }}
// // // // // // //               minimumValue={5000}
// // // // // // //               maximumValue={50000}
// // // // // // //               step={500}
// // // // // // //               value={maxPrice}
// // // // // // //               minimumTrackTintColor={colors.primary}
// // // // // // //               maximumTrackTintColor={colors.border}
// // // // // // //               onValueChange={setMaxPrice}
// // // // // // //             />

// // // // // // //             <GlobalText
// // // // // // //               style={{ color: colors.primary, textAlign: "right" }}
// // // // // // //             >
// // // // // // //               Max: ${maxPrice}
// // // // // // //             </GlobalText>
// // // // // // //           </ScrollView>

// // // // // // //           {/* Buttons */}
// // // // // // //           <View style={styles.btnRow}>
// // // // // // //             <TouchableOpacity
// // // // // // //               style={[styles.resetBtn, { borderColor: colors.primary }]}
// // // // // // //               onPress={() => {
// // // // // // //                 setSize(2500);
// // // // // // //                 setMinPrice(5000);
// // // // // // //                 setMaxPrice(15000);
// // // // // // //                 setPropertyType(null);
// // // // // // //                 setState("");
// // // // // // //                 setDistrict("");
// // // // // // //                 setSubDistrict("");
// // // // // // //                 setBedrooms("");
// // // // // // //                 setBathrooms("");
// // // // // // //                 setKitchen("");
// // // // // // //               }}
// // // // // // //             >
// // // // // // //               <GlobalText
// // // // // // //                 style={{
// // // // // // //                   color: colors.primary,
// // // // // // //                   fontWeight: "600",
// // // // // // //                   textAlign: "center",
// // // // // // //                 }}
// // // // // // //               >
// // // // // // //                 Reset
// // // // // // //               </GlobalText>
// // // // // // //             </TouchableOpacity>

// // // // // // //             <TouchableOpacity
// // // // // // //               style={[styles.applyBtn, { backgroundColor: colors.primary }]}
// // // // // // //               onPress={applyFilters}
// // // // // // //             >
// // // // // // //               <GlobalText
// // // // // // //                 style={{
// // // // // // //                   color: colors.card,
// // // // // // //                   fontWeight: "600",
// // // // // // //                   textAlign: "center",
// // // // // // //                 }}
// // // // // // //               >
// // // // // // //                 Apply Filters
// // // // // // //               </GlobalText>
// // // // // // //             </TouchableOpacity>
// // // // // // //           </View>
// // // // // // //         </View>
// // // // // // //       </View>
// // // // // // //     </Modal>
// // // // // // //   );
// // // // // // // }

// // // // // // // const styles = StyleSheet.create({
// // // // // // //   overlay: {
// // // // // // //     flex: 1,
// // // // // // //     justifyContent: "flex-end",
// // // // // // //     backgroundColor: "rgba(0,0,0,0.4)",
// // // // // // //   },
// // // // // // //   container: {
// // // // // // //     borderTopLeftRadius: 30,
// // // // // // //     borderTopRightRadius: 30,
// // // // // // //     padding: 20,
// // // // // // //     maxHeight: "85%",
// // // // // // //   },
// // // // // // //   title: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },
// // // // // // //   subtitle: { fontSize: 16, fontWeight: "600", marginTop: 15 },
// // // // // // //   typeRow: {
// // // // // // //     flexDirection: "row",
// // // // // // //     justifyContent: "space-between",
// // // // // // //     marginTop: 10,
// // // // // // //   },
// // // // // // //   typeBtn: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20 },
// // // // // // //   btnRow: {
// // // // // // //     flexDirection: "row",
// // // // // // //     justifyContent: "space-between",
// // // // // // //     marginTop: 25,
// // // // // // //   },
// // // // // // //   resetBtn: {
// // // // // // //     borderWidth: 1,
// // // // // // //     borderRadius: 12,
// // // // // // //     padding: 12,
// // // // // // //     flex: 1,
// // // // // // //     marginRight: 10,
// // // // // // //   },
// // // // // // //   applyBtn: { borderRadius: 12, padding: 12, flex: 2 },
// // // // // // //   dropdownBox: {
// // // // // // //     borderColor: "black",
// // // // // // //     borderWidth: 2,
// // // // // // //     borderRadius: 12,
// // // // // // //     backgroundColor: "#fff",
// // // // // // //     marginTop: 10,
// // // // // // //     marginBottom: 10,
// // // // // // //   },
// // // // // // //   dropdownList: {
// // // // // // //     borderColor: "green",
// // // // // // //     borderWidth: 2,
// // // // // // //     borderRadius: 12,
// // // // // // //     backgroundColor: "#e8fce8",
// // // // // // //   },
// // // // // // // });
