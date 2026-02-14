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
