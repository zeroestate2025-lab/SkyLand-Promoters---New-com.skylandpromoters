import React, { useState, useEffect, useMemo, memo, useRef } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  Animated,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme, useRoute } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import GlobalText from "../../theme/GlobalText";
import {
  Search,
  SlidersHorizontal,
  Frown,
  Building,
  Building2,
  MapPin,
  LandPlot,
  WarehouseIcon,
  Factory,
  HousePlus,
  User,
  XCircle,
} from "lucide-react-native";
import BottomNav from "../../components/ReusableComponents/BottomNav";
import FilterModal from "../../components/ReusableComponents/FilterModal";
import AnimatedBackground from "../../components/ReusableComponents/AnimatedBackground";
import PropertyCard from "../../components/ReusableComponents/PropertyCard";
import { getProperties, getUserProfile } from "../../api/api";
import propertyTypes from "../../constants/propertyTypes";

// ---------------------------------------------------------
// 🔹 ICON MAP
// ---------------------------------------------------------
const iconMap = {
  House: HousePlus,
  Apartment: Building2,
  Office: Building,
  Land: MapPin,
  Sites: LandPlot,
  Godown: WarehouseIcon,
  Factory: Factory,
};

// ---------------------------------------------------------
// 🔹 Label Mapping (Backend vs Display)
// ---------------------------------------------------------
const displayLabel = (type) => (type === "Sale" ? "Buy" : type);

// ---------------------------------------------------------
// 🔹 HEADER COMPONENT
// ---------------------------------------------------------
const Header = memo(
  ({
    userName,
    searchText,
    setSearchText,
    selectedCategory,
    setSelectedCategory,
    setFilteredPreference,
    filteredPreference,
    setFilterVisible,
    isDark,
    colors,
  }) => {
    return (
      <LinearGradient
        colors={isDark ? ["#16403E", "#0D2F2E"] : ["#43C6AC", "#20A68B"]}
        style={styles.headerGradient}
      >
        {/* Greeting */}
        <View style={styles.headerContent}>
          <View>
            <GlobalText style={[styles.greeting, { color: colors.text }]}>
              Welcome 👋
            </GlobalText>
            <GlobalText style={[styles.name, { color: "#fff" }]}>
              {userName}
            </GlobalText>
          </View>
          {/* Avatar */}
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: isDark ? "#2E5E59" : "#fff",
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
          >
            <User size={20} color={isDark ? "#fff" : "#999"} />
          </View>
        </View>

        {/* Search Box */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.searchRow}>
            <View
              style={[
                styles.searchBox,
                {
                  backgroundColor: isDark ? "#1C1C1E" : "#fff",
                  borderColor: isDark ? "#2A2A2D" : "#E0E0E0",
                },
              ]}
            >
              <Search size={20} color={isDark ? "#BBB" : "#555"} />

              <TextInput
                placeholder="Search properties..."
                placeholderTextColor={isDark ? "#888" : "#aaa"}
                style={[
                  styles.searchInput,
                  { color: isDark ? "#EDEDED" : "#111" },
                ]}
                value={searchText}
                onChangeText={setSearchText}
              />

              {/* ✅ Clear Button */}
              {searchText.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchText("")}
                  activeOpacity={0.7}
                >
                  <XCircle
                    size={20}
                    color={isDark ? "#bbb" : "#666"}
                    style={{ marginLeft: 8 }}
                  />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.filterButton,
                { backgroundColor: isDark ? "#1E7565" : "#20A68B" },
              ]}
              onPress={() => setFilterVisible(true)}
            >
              <SlidersHorizontal size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        {/* ✅ Buy/Rent Toggle - ORDER CHANGED: BUY FIRST, RENT SECOND */}
        <View style={styles.animatedToggleWrapper}>
          <View style={styles.animatedToggleBackground}>
            <View
              style={[
                styles.slider,
                { left: filteredPreference === "Rent" ? "50%" : "0%" }, // ✅ Changed: Rent now moves to right
              ]}
            />
            {["Sale", "Rent"].map((type) => ( // ✅ Changed order: Sale first, Rent second
              <TouchableOpacity
                key={type}
                activeOpacity={0.9}
                style={styles.toggleHalf}
                onPress={() => setFilteredPreference(type)}
              >
                <GlobalText
                  style={[
                    styles.toggleText,
                    filteredPreference === type && styles.toggleTextActive,
                  ]}
                >
                  {displayLabel(type)}
                </GlobalText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Viewing Indicator */}
        {filteredPreference && (
          <View style={{ alignItems: "center", marginTop: 10 }}>
            <GlobalText style={{ color: "#fff", fontSize: 13 }}>
              You're Viewing{" "}
              <GlobalText style={{ fontWeight: "600", color: "#fff" }}>
                {displayLabel(filteredPreference)}
              </GlobalText>{" "}
              Properties
            </GlobalText>
          </View>
        )}

        {/* Property Type Scroll */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={propertyTypes}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => {
            const IconComponent = iconMap[item.name];
            const isActive = selectedCategory === item.name;
            return (
              <TouchableOpacity
                onPress={() => setSelectedCategory(item.name)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.categoryCard,
                    {
                      backgroundColor: isActive
                        ? "#20A68B"
                        : isDark
                        ? "#1C1C1E"
                        : "#fff",
                      borderColor: isActive
                        ? "#20A68B"
                        : isDark
                        ? "#333"
                        : "#EAEAEA",
                    },
                  ]}
                >
                  {IconComponent && (
                    <IconComponent
                      size={26}
                      color={isActive ? "#fff" : isDark ? "#9CE0D4" : "#43C6AC"}
                      strokeWidth={2}
                    />
                  )}
                  <GlobalText
                    numberOfLines={1}
                    style={[
                      styles.categoryText,
                      { color: isActive ? "#fff" : isDark ? "#EDEDED" : "#333" },
                    ]}
                  >
                    {item.name}
                  </GlobalText>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </LinearGradient>
    );
  }
);

// ---------------------------------------------------------
// 🔹 MAIN HOME SCREEN
// ---------------------------------------------------------
export default function HomeScreen({ navigation }) {
  const { colors } = useTheme();
  const route = useRoute();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const mountedRef = useRef(true);

  const [filterVisible, setFilterVisible] = useState(false);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("User");
  const [selectedCategory, setSelectedCategory] = useState("House");
  const [filteredPreference, setFilteredPreference] = useState("Sale"); // ✅ Changed default to "Sale" (Buy)
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const routeType = route?.params?.selectedType;
    const routeCategory = route?.params?.selectedCategory;
    if (routeType && mountedRef.current) setFilteredPreference(routeType);
    if (routeCategory && mountedRef.current)
      setSelectedCategory(routeCategory);
    else if (mountedRef.current) setSelectedCategory("House");
  }, [route]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getProperties();
        if (mountedRef.current) setProperties(data);
        const user = await getUserProfile();
        if (mountedRef.current) setUserName(user?.name || "User");
      } catch (err) {
        console.error("Home load error:", err.message);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      const matchesCategory =
        selectedCategory === "All"
          ? true
          : p.category?.toLowerCase().trim() ===
            selectedCategory.toLowerCase().trim();
      const matchesPreference =
        p.propertyPreference?.toLowerCase() ===
        filteredPreference.toLowerCase();
      const matchesSearch = searchText
        ? p.title?.toLowerCase().includes(searchText.toLowerCase()) ||
          p.location?.toLowerCase().includes(searchText.toLowerCase()) ||
          p.price?.toString().includes(searchText)
        : true;
      return matchesCategory && matchesPreference && matchesSearch;
    });
  }, [properties, selectedCategory, filteredPreference, searchText]);

  const EmptyCategory = () => (
    <View style={styles.emptyContainer}>
      <Frown size={80} color="#20A68B" strokeWidth={1.5} />
      <GlobalText style={[styles.emptyTitle, { color: colors.primary }]}>
        No Properties Found
      </GlobalText>
      <GlobalText
        style={[styles.emptySubtitle, { color: isDark ? "#aaa" : "#555" }]}
      >
        There are currently no {selectedCategory?.toLowerCase()} listings.
      </GlobalText>
    </View>
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#000" : "#f9f9f9" },
      ]}
    >
      <AnimatedBackground />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <FlatList
          data={filteredProperties}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <Header
              userName={userName}
              searchText={searchText}
              setSearchText={setSearchText}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              setFilteredPreference={setFilteredPreference}
              filteredPreference={filteredPreference}
              setFilterVisible={setFilterVisible}
              isDark={isDark}
              colors={colors}
            />
          }
          ListEmptyComponent={!loading && <EmptyCategory />}
          renderItem={({ item }) => (
            <PropertyCard
              item={item}
              onPress={() =>
                navigation.navigate("PropertyDetails", { property: item })
              }
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      </KeyboardAvoidingView>
      <BottomNav navigation={navigation} />
      <FilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
      />
    </SafeAreaView>
  );
}

// ---------------------------------------------------------
// 🔹 STYLES
// ---------------------------------------------------------
const styles = StyleSheet.create({
  container: { flex: 1 },
  headerGradient: {
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  greeting: { fontSize: 20, fontWeight: "400" },
  name: { fontSize: 22, fontWeight: "700" },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#fff",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    flex: 1,
    height: 45,
    borderWidth: 1,
  },
  searchInput: { flex: 1, marginLeft: 6, fontSize: 14 },
  filterButton: { marginLeft: 10, borderRadius: 12, padding: 10 },
  categoryList: { paddingHorizontal: 15, marginTop: 15 },
  categoryCard: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginRight: 12,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
    borderWidth: 1,
    elevation: 3,
  },
  categoryText: { fontSize: 12, marginTop: 6 },
  animatedToggleWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
  },
  animatedToggleBackground: {
    flexDirection: "row",
    width: 190,
    height: 42,
    backgroundColor: "#2EB88E",
    borderRadius: 25,
    position: "relative",
    overflow: "hidden",
  },
  slider: {
    position: "absolute",
    top: 2,
    width: "50%",
    height: 38,
    backgroundColor: "#fff",
    borderRadius: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 1,
  },
  toggleHalf: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  toggleText: {
    color: "#E8F8F5",
    fontSize: 11,
    fontWeight: "600",
  },
  toggleTextActive: {
    color: "#20A68B",
    fontWeight: "700",
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 1,
    paddingHorizontal: 30,
    marginTop: 50,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", marginTop: 10 },
  emptySubtitle: { textAlign: "center", marginTop: 8 },
});
