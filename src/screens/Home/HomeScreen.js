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

// import React, { useState, useEffect, useMemo, memo, useRef } from "react";
// import {
//   View,
//   StyleSheet,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   Image,
//   KeyboardAvoidingView,
//   Platform,
//   useColorScheme,
//   Animated,
// } from "react-native";
// import * as Animatable from "react-native-animatable";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useTheme, useRoute } from "@react-navigation/native";
// import LinearGradient from "react-native-linear-gradient";
// import GlobalText from "../../theme/GlobalText";
// import {
//   Search,
//   SlidersHorizontal,
//   Frown,
//   Building,
//   Building2,
//   MapPin,
//   LandPlot,
//   WarehouseIcon,
//   Factory,
//   HousePlus,
//   User,
//   XCircle, // ✅ Added for clear button
// } from "lucide-react-native";
// import BottomNav from "../../components/ReusableComponents/BottomNav";
// import FilterModal from "../../components/ReusableComponents/FilterModal";
// import AnimatedBackground from "../../components/ReusableComponents/AnimatedBackground";
// import PropertyCard from "../../components/ReusableComponents/PropertyCard";
// import { getProperties, getUserProfile } from "../../api/api";
// import propertyTypes from "../../constants/propertyTypes";

// // ---------------------------------------------------------
// // 🔹 ICON MAP
// // ---------------------------------------------------------
// const iconMap = {
//   House: HousePlus,
//   Apartment: Building2,
//   Office: Building,
//   Land: MapPin,
//   Sites: LandPlot,
//   Godown: WarehouseIcon,
//   Factory: Factory,
// };

// // ---------------------------------------------------------
// // 🔹 Label Mapping (Backend vs Display)
// // ---------------------------------------------------------
// const displayLabel = (type) => (type === "Sale" ? "Buy" : type);

// // ---------------------------------------------------------
// // 🔹 HEADER COMPONENT
// // ---------------------------------------------------------
// const Header = memo(
//   ({
//     userName,
//     searchText,
//     setSearchText,
//     selectedCategory,
//     setSelectedCategory,
//     setFilteredPreference,
//     filteredPreference,
//     setFilterVisible,
//     isDark,
//     colors,
//   }) => {
//     return (
//       <LinearGradient
//         colors={isDark ? ["#16403E", "#0D2F2E"] : ["#43C6AC", "#20A68B"]}
//         style={styles.headerGradient}
//       >
//         {/* Greeting */}
//         <View style={styles.headerContent}>
//           <View>
//             <GlobalText style={[styles.greeting, { color: colors.text }]}>
//               Welcome 👋
//             </GlobalText>
//             <GlobalText style={[styles.name, { color: "#fff" }]}>
//               {userName}
//             </GlobalText>
//           </View>
//           {/* Avatar */}
//           <View
//             style={[
//               styles.avatar,
//               {
//                 backgroundColor: isDark ? "#2E5E59" : "#fff",
//                 justifyContent: "center",
//                 alignItems: "center",
//               },
//             ]}
//           >
//             <User size={20} color={isDark ? "#fff" : "#999"} />
//           </View>
//         </View>

//         {/* Search Box */}
//         <KeyboardAvoidingView
//           behavior={Platform.OS === "ios" ? "padding" : undefined}
//         >
//           <View style={styles.searchRow}>
//             <View
//               style={[
//                 styles.searchBox,
//                 {
//                   backgroundColor: isDark ? "#1C1C1E" : "#fff",
//                   borderColor: isDark ? "#2A2A2D" : "#E0E0E0",
//                 },
//               ]}
//             >
//               <Search size={20} color={isDark ? "#BBB" : "#555"} />

//               <TextInput
//                 placeholder="Search properties..."
//                 placeholderTextColor={isDark ? "#888" : "#aaa"}
//                 style={[
//                   styles.searchInput,
//                   { color: isDark ? "#EDEDED" : "#111" },
//                 ]}
//                 value={searchText}
//                 onChangeText={setSearchText}
//               />

//               {/* ✅ Clear Button (Appears only when text is typed) */}
//               {searchText.length > 0 && (
//                 <TouchableOpacity
//                   onPress={() => setSearchText("")}
//                   activeOpacity={0.7}
//                 >
//                   <XCircle
//                     size={20}
//                     color={isDark ? "#bbb" : "#666"}
//                     style={{ marginLeft: 8 }}
//                   />
//                 </TouchableOpacity>
//               )}
//             </View>

//             <TouchableOpacity
//               style={[
//                 styles.filterButton,
//                 { backgroundColor: isDark ? "#1E7565" : "#20A68B" },
//               ]}
//               onPress={() => setFilterVisible(true)}
//             >
//               <SlidersHorizontal size={22} color="#fff" />
//             </TouchableOpacity>
//           </View>
//         </KeyboardAvoidingView>

//         {/* Rent/Buy Toggle */}
//         <View style={styles.animatedToggleWrapper}>
//           <View style={styles.animatedToggleBackground}>
//             <View
//               style={[
//                 styles.slider,
//                 { left: filteredPreference === "Sale" ? "50%" : "0%" },
//               ]}
//             />
//             {["Rent", "Sale"].map((type) => (
//               <TouchableOpacity
//                 key={type}
//                 activeOpacity={0.9}
//                 style={styles.toggleHalf}
//                 onPress={() => setFilteredPreference(type)}
//               >
//                 <GlobalText
//                   style={[
//                     styles.toggleText,
//                     filteredPreference === type && styles.toggleTextActive,
//                   ]}
//                 >
//                   {displayLabel(type)}
//                 </GlobalText>
//               </TouchableOpacity>
//             ))}
//           </View>
//         </View>

//         {/* Viewing Indicator */}
//         {filteredPreference && (
//           <View style={{ alignItems: "center", marginTop: 10 }}>
//             <GlobalText style={{ color: "#fff", fontSize: 13 }}>
//               You’re Viewing{" "}
//               <GlobalText style={{ fontWeight: "600", color: "#fff" }}>
//                 {displayLabel(filteredPreference)}
//               </GlobalText>{" "}
//               Properties
//             </GlobalText>
//           </View>
//         )}

//         {/* Property Type Scroll */}
//         <FlatList
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           data={propertyTypes}
//           keyExtractor={(item) => item.id.toString()}
//           contentContainerStyle={styles.categoryList}
//           renderItem={({ item }) => {
//             const IconComponent = iconMap[item.name];
//             const isActive = selectedCategory === item.name;
//             return (
//               <TouchableOpacity
//                 onPress={() => setSelectedCategory(item.name)}
//                 activeOpacity={0.8}
//               >
//                 <View
//                   style={[
//                     styles.categoryCard,
//                     {
//                       backgroundColor: isActive
//                         ? "#20A68B"
//                         : isDark
//                         ? "#1C1C1E"
//                         : "#fff",
//                       borderColor: isActive
//                         ? "#20A68B"
//                         : isDark
//                         ? "#333"
//                         : "#EAEAEA",
//                     },
//                   ]}
//                 >
//                   {IconComponent && (
//                     <IconComponent
//                       size={26}
//                       color={isActive ? "#fff" : isDark ? "#9CE0D4" : "#43C6AC"}
//                       strokeWidth={2}
//                     />
//                   )}
//                   <GlobalText
//                     numberOfLines={1}
//                     style={[
//                       styles.categoryText,
//                       { color: isActive ? "#fff" : isDark ? "#EDEDED" : "#333" },
//                     ]}
//                   >
//                     {item.name}
//                   </GlobalText>
//                 </View>
//               </TouchableOpacity>
//             );
//           }}
//         />
//       </LinearGradient>
//     );
//   }
// );

// // ---------------------------------------------------------
// // 🔹 MAIN HOME SCREEN
// // ---------------------------------------------------------
// export default function HomeScreen({ navigation }) {
//   const { colors } = useTheme();
//   const route = useRoute();
//   const colorScheme = useColorScheme();
//   const isDark = colorScheme === "dark";
//   const mountedRef = useRef(true);

//   const [filterVisible, setFilterVisible] = useState(false);
//   const [properties, setProperties] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [userName, setUserName] = useState("User");
//   const [selectedCategory, setSelectedCategory] = useState("House");
//   const [filteredPreference, setFilteredPreference] = useState("Rent");
//   const [searchText, setSearchText] = useState("");

//   useEffect(() => {
//     mountedRef.current = true;
//     return () => {
//       mountedRef.current = false;
//     };
//   }, []);

//   useEffect(() => {
//     const routeType = route?.params?.selectedType;
//     const routeCategory = route?.params?.selectedCategory;
//     if (routeType && mountedRef.current) setFilteredPreference(routeType);
//     if (routeCategory && mountedRef.current)
//       setSelectedCategory(routeCategory);
//     else if (mountedRef.current) setSelectedCategory("House");
//   }, [route]);

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         const data = await getProperties();
//         if (mountedRef.current) setProperties(data);
//         const user = await getUserProfile();
//         if (mountedRef.current) setUserName(user?.name || "User");
//       } catch (err) {
//         console.error("Home load error:", err.message);
//       } finally {
//         if (mountedRef.current) setLoading(false);
//       }
//     };
//     loadData();
//   }, []);

//   const filteredProperties = useMemo(() => {
//     return properties.filter((p) => {
//       const matchesCategory =
//         selectedCategory === "All"
//           ? true
//           : p.category?.toLowerCase().trim() ===
//             selectedCategory.toLowerCase().trim();
//       const matchesPreference =
//         p.propertyPreference?.toLowerCase() ===
//         filteredPreference.toLowerCase();
//       const matchesSearch = searchText
//         ? p.title?.toLowerCase().includes(searchText.toLowerCase()) ||
//           p.location?.toLowerCase().includes(searchText.toLowerCase()) ||
//           p.price?.toString().includes(searchText)
//         : true;
//       return matchesCategory && matchesPreference && matchesSearch;
//     });
//   }, [properties, selectedCategory, filteredPreference, searchText]);

//   const EmptyCategory = () => (
//     <View style={styles.emptyContainer}>
//       <Frown size={80} color="#20A68B" strokeWidth={1.5} />
//       <GlobalText style={[styles.emptyTitle, { color: colors.primary }]}>
//         No Properties Found
//       </GlobalText>
//       <GlobalText
//         style={[styles.emptySubtitle, { color: isDark ? "#aaa" : "#555" }]}
//       >
//         There are currently no {selectedCategory?.toLowerCase()} listings.
//       </GlobalText>
//     </View>
//   );

//   return (
//     <SafeAreaView
//       style={[
//         styles.container,
//         { backgroundColor: isDark ? "#000" : "#f9f9f9" },
//       ]}
//     >
//       <AnimatedBackground />
//       <KeyboardAvoidingView
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//         style={{ flex: 1 }}
//       >
//         <FlatList
//           data={filteredProperties}
//           keyExtractor={(item) => item._id}
//           contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
//           keyboardShouldPersistTaps="handled"
//           ListHeaderComponent={
//             <Header
//               userName={userName}
//               searchText={searchText}
//               setSearchText={setSearchText}
//               selectedCategory={selectedCategory}
//               setSelectedCategory={setSelectedCategory}
//               setFilteredPreference={setFilteredPreference}
//               filteredPreference={filteredPreference}
//               setFilterVisible={setFilterVisible}
//               isDark={isDark}
//               colors={colors}
//             />
//           }
//           ListEmptyComponent={!loading && <EmptyCategory />}
//           renderItem={({ item }) => (
//             <PropertyCard
//               item={item}
//               onPress={() =>
//                 navigation.navigate("PropertyDetails", { property: item })
//               }
//             />
//           )}
//           showsVerticalScrollIndicator={false}
//         />
//       </KeyboardAvoidingView>
//       <BottomNav navigation={navigation} />
//       <FilterModal
//         visible={filterVisible}
//         onClose={() => setFilterVisible(false)}
//       />
//     </SafeAreaView>
//   );
// }

// // ---------------------------------------------------------
// // 🔹 STYLES
// // ---------------------------------------------------------
// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   headerGradient: {
//     paddingBottom: 30,
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//   },
//   headerContent: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 20,
//   },
//   greeting: { fontSize: 20, fontWeight: "400" },
//   name: { fontSize: 22, fontWeight: "700" },
//   avatar: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     borderWidth: 2,
//     borderColor: "#fff",
//   },
//   searchRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 20,
//   },
//   searchBox: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderRadius: 12,
//     paddingHorizontal: 12,
//     flex: 1,
//     height: 45,
//     borderWidth: 1,
//   },
//   searchInput: { flex: 1, marginLeft: 6, fontSize: 14 },
//   filterButton: { marginLeft: 10, borderRadius: 12, padding: 10 },
//   categoryList: { paddingHorizontal: 15, marginTop: 15 },
//   categoryCard: {
//     paddingVertical: 12,
//     paddingHorizontal: 8,
//     marginRight: 12,
//     borderRadius: 14,
//     alignItems: "center",
//     justifyContent: "center",
//     minWidth: 80,
//     borderWidth: 1,
//     elevation: 3,
//   },
//   categoryText: { fontSize: 12, marginTop: 6 },
//   animatedToggleWrapper: {
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: 15,
//   },
//   animatedToggleBackground: {
//     flexDirection: "row",
//     width: 190,
//     height: 42,
//     backgroundColor: "#2EB88E",
//     borderRadius: 25,
//     position: "relative",
//     overflow: "hidden",
//   },
//   slider: {
//     position: "absolute",
//     top: 2,
//     width: "50%",
//     height: 38,
//     backgroundColor: "#fff",
//     borderRadius: 20,
//     elevation: 5,
//     shadowColor: "#000",
//     shadowOpacity: 0.15,
//     shadowRadius: 3,
//     shadowOffset: { width: 0, height: 2 },
//     zIndex: 1,
//   },
//   toggleHalf: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     zIndex: 2,
//   },
//   toggleText: {
//     color: "#E8F8F5",
//     fontSize: 11,
//     fontWeight: "600",
//   },
//   toggleTextActive: {
//     color: "#20A68B",
//     fontWeight: "700",
//   },
//   emptyContainer: {
//     justifyContent: "center",
//     alignItems: "center",
//     flexGrow: 1,
//     paddingHorizontal: 30,
//     marginTop: 50,
//   },
//   emptyTitle: { fontSize: 18, fontWeight: "700", marginTop: 10 },
//   emptySubtitle: { textAlign: "center", marginTop: 8 },
// });

// // import React, { useState, useEffect, useMemo, memo, useRef } from "react";
// // import {
// //   View,
// //   StyleSheet,
// //   TextInput,
// //   TouchableOpacity,
// //   FlatList,
// //   Image,
// //   KeyboardAvoidingView,
// //   Platform,
// //   useColorScheme,
// //   Animated,
// // } from "react-native";
// // import * as Animatable from "react-native-animatable";
// // import { SafeAreaView } from "react-native-safe-area-context";
// // import { useTheme, useRoute } from "@react-navigation/native";
// // import LinearGradient from "react-native-linear-gradient";
// // import GlobalText from "../../theme/GlobalText";
// // import {
// //   Search,
// //   SlidersHorizontal,
// //   Frown,
// //   Building,
// //   Building2,
// //   MapPin,
// //   LandPlot,
// //   WarehouseIcon,
// //   Factory,
// //   HousePlus,
// //   User,
// // } from "lucide-react-native";
// // import BottomNav from "../../components/ReusableComponents/BottomNav";
// // import FilterModal from "../../components/ReusableComponents/FilterModal";
// // import AnimatedBackground from "../../components/ReusableComponents/AnimatedBackground";
// // import PropertyCard from "../../components/ReusableComponents/PropertyCard";
// // import { getProperties, getUserProfile } from "../../api/api";
// // import propertyTypes from "../../constants/propertyTypes";

// // // ---------------------------------------------------------
// // // 🔹 ICON MAP
// // // ---------------------------------------------------------
// // const iconMap = {
// //   House: HousePlus,
// //   Apartment: Building2,
// //   Office: Building,
// //   Land: MapPin,
// //   Sites: LandPlot,
// //   Godown: WarehouseIcon,
// //   Factory: Factory,
// // };

// // // ---------------------------------------------------------
// // // 🔹 Label Mapping (Backend vs Display)
// // // ---------------------------------------------------------
// // const displayLabel = (type) => (type === "Sale" ? "Buy" : type);

// // // ---------------------------------------------------------
// // // 🔹 HEADER COMPONENT
// // // ---------------------------------------------------------
// // const Header = memo(
// //   ({
// //     userName,
// //     searchText,
// //     setSearchText,
// //     selectedCategory,
// //     setSelectedCategory,
// //     setFilteredPreference,
// //     filteredPreference,
// //     setFilterVisible,
// //     isDark,
// //     colors,
// //   }) => {
// //     return (
// //       <LinearGradient
// //         colors={isDark ? ["#16403E", "#0D2F2E"] : ["#43C6AC", "#20A68B"]}
// //         style={styles.headerGradient}
// //       >
// //         {/* Greeting */}
// //         <View style={styles.headerContent}>
// //           <View>
// //             <GlobalText style={[styles.greeting, { color: colors.text }]}>
// //               Welcome 👋
// //             </GlobalText>
// //             <GlobalText style={[styles.name, { color: "#fff" }]}>
// //               {userName}
// //             </GlobalText>
// //           </View>
// //           {/* Placeholder avatar: colored circle with white user icon */}
// //           <View style={[styles.avatar, { backgroundColor: isDark ? "#2E5E59" : "#fff", justifyContent: 'center', alignItems: 'center' }]}>
// //             {/* Using lucide user icon to show a neutral silhouette */}
// //             <User size={20} color={isDark ? "#fff" : "#999"} />
// //           </View>
// //         </View>

// //         {/* Search Box */}
// //         <KeyboardAvoidingView
// //           behavior={Platform.OS === "ios" ? "padding" : undefined}
// //         >
// //           <View style={styles.searchRow}>
// //             <View
// //               style={[
// //                 styles.searchBox,
// //                 {
// //                   backgroundColor: isDark ? "#1C1C1E" : "#fff",
// //                   borderColor: isDark ? "#2A2A2D" : "#E0E0E0",
// //                 },
// //               ]}
// //             >
// //               <Search size={20} color={isDark ? "#BBB" : "#555"} />
// //               <TextInput
// //                 placeholder="Search properties..."
// //                 placeholderTextColor={isDark ? "#888" : "#aaa"}
// //                 style={[
// //                   styles.searchInput,
// //                   { color: isDark ? "#EDEDED" : "#111" },
// //                 ]}
// //                 value={searchText}
// //                 onChangeText={setSearchText}
// //               />
// //             </View>
// //             <TouchableOpacity
// //               style={[
// //                 styles.filterButton,
// //                 { backgroundColor: isDark ? "#1E7565" : "#20A68B" },
// //               ]}
// //               onPress={() => setFilterVisible(true)}
// //             >
// //               <SlidersHorizontal size={22} color="#fff" />
// //             </TouchableOpacity>
// //           </View>
// //         </KeyboardAvoidingView>

// //         {/* Rent/Buy Toggle */}
// //         <View style={styles.animatedToggleWrapper}>
// //           <View style={styles.animatedToggleBackground}>
// //             <View
// //               style={[
// //                 styles.slider,
// //                 { left: filteredPreference === "Sale" ? "50%" : "0%" },
// //               ]}
// //             />
// //             {["Rent", "Sale"].map((type) => (
// //               <TouchableOpacity
// //                 key={type}
// //                 activeOpacity={0.9}
// //                 style={styles.toggleHalf}
// //                 onPress={() => setFilteredPreference(type)}
// //               >
// //                 <GlobalText
// //                   style={[
// //                     styles.toggleText,
// //                     filteredPreference === type && styles.toggleTextActive,
// //                   ]}
// //                 >
// //                   {displayLabel(type)}
// //                 </GlobalText>
// //               </TouchableOpacity>
// //             ))}
// //           </View>
// //         </View>

// //         {/* Viewing Indicator */}
// //         {filteredPreference && (
// //           <View style={{ alignItems: "center", marginTop: 10 }}>
// //             <GlobalText style={{ color: "#fff", fontSize: 13 }}>
// //               You’re Viewing{" "}
// //               <GlobalText style={{ fontWeight: "600", color: "#fff" }}>
// //                 {displayLabel(filteredPreference)}
// //               </GlobalText>{" "}
// //               Properties
// //             </GlobalText>
// //           </View>
// //         )}

// //         {/* Property Type Scroll */}
// //         <FlatList
// //           horizontal
// //           showsHorizontalScrollIndicator={false}
// //           data={propertyTypes}
// //           keyExtractor={(item) => item.id.toString()}
// //           contentContainerStyle={styles.categoryList}
// //           renderItem={({ item }) => {
// //             const IconComponent = iconMap[item.name];
// //             const isActive = selectedCategory === item.name;
// //             return (
// //               <TouchableOpacity
// //                 onPress={() => setSelectedCategory(item.name)}
// //                 activeOpacity={0.8}
// //               >
// //                 <View
// //                   style={[
// //                     styles.categoryCard,
// //                     {
// //                       backgroundColor: isActive
// //                         ? "#20A68B"
// //                         : isDark
// //                         ? "#1C1C1E"
// //                         : "#fff",
// //                       borderColor: isActive
// //                         ? "#20A68B"
// //                         : isDark
// //                         ? "#333"
// //                         : "#EAEAEA",
// //                     },
// //                   ]}
// //                 >
// //                   {IconComponent && (
// //                     <IconComponent
// //                       size={26}
// //                       color={isActive ? "#fff" : isDark ? "#9CE0D4" : "#43C6AC"}
// //                       strokeWidth={2}
// //                     />
// //                   )}
// //                   <GlobalText
// //                     numberOfLines={1}
// //                     style={[
// //                       styles.categoryText,
// //                       { color: isActive ? "#fff" : isDark ? "#EDEDED" : "#333" },
// //                     ]}
// //                   >
// //                     {item.name}
// //                   </GlobalText>
// //                 </View>
// //               </TouchableOpacity>
// //             );
// //           }}
// //         />
// //       </LinearGradient>
// //     );
// //   }
// // );

// // // ---------------------------------------------------------
// // // 🔹 MAIN HOME SCREEN
// // // ---------------------------------------------------------
// // export default function HomeScreen({ navigation }) {
// //   const { colors } = useTheme();
// //   const route = useRoute();
// //   const colorScheme = useColorScheme();
// //   const isDark = colorScheme === "dark";
// //   const mountedRef = useRef(true);

// //   const [filterVisible, setFilterVisible] = useState(false);
// //   const [properties, setProperties] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [userName, setUserName] = useState("User");
// //   const [selectedCategory, setSelectedCategory] = useState("House");
// //   const [filteredPreference, setFilteredPreference] = useState("Rent");
// //   const [searchText, setSearchText] = useState("");

// //   // Mount flag to avoid unmounted updates
// //   useEffect(() => {
// //     mountedRef.current = true;
// //     return () => {
// //       mountedRef.current = false;
// //     };
// //   }, []);

// //   // Default or route values
// //   useEffect(() => {
// //     const routeType = route?.params?.selectedType;
// //     const routeCategory = route?.params?.selectedCategory;
// //     if (routeType && mountedRef.current) setFilteredPreference(routeType);
// //     if (routeCategory && mountedRef.current)
// //       setSelectedCategory(routeCategory);
// //     else if (mountedRef.current) setSelectedCategory("House");
// //   }, [route]);

// //   // Load data
// //   useEffect(() => {
// //     const loadData = async () => {
// //       try {
// //         const data = await getProperties();
// //         if (mountedRef.current) setProperties(data);
// //         const user = await getUserProfile();
// //         if (mountedRef.current) setUserName(user?.name || "User");
// //       } catch (err) {
// //         console.error("Home load error:", err.message);
// //       } finally {
// //         if (mountedRef.current) setLoading(false);
// //       }
// //     };
// //     loadData();
// //   }, []);

// //   // Filter logic
// //   const filteredProperties = useMemo(() => {
// //     return properties.filter((p) => {
// //       const matchesCategory =
// //         selectedCategory === "All"
// //           ? true
// //           : p.category?.toLowerCase().trim() ===
// //             selectedCategory.toLowerCase().trim();
// //       const matchesPreference =
// //         p.propertyPreference?.toLowerCase() ===
// //         filteredPreference.toLowerCase();
// //       const matchesSearch = searchText
// //         ? p.title?.toLowerCase().includes(searchText.toLowerCase()) ||
// //           p.location?.toLowerCase().includes(searchText.toLowerCase()) ||
// //           p.price?.toString().includes(searchText)
// //         : true;
// //       return matchesCategory && matchesPreference && matchesSearch;
// //     });
// //   }, [properties, selectedCategory, filteredPreference, searchText]);

// //   // Empty State
// //   const EmptyCategory = () => (
// //     <View style={styles.emptyContainer}>
// //       <Frown size={80} color="#20A68B" strokeWidth={1.5} />
// //       <GlobalText style={[styles.emptyTitle, { color: colors.primary }]}>
// //         No Properties Found
// //       </GlobalText>
// //       <GlobalText
// //         style={[styles.emptySubtitle, { color: isDark ? "#aaa" : "#555" }]}
// //       >
// //         There are currently no {selectedCategory?.toLowerCase()} listings.
// //       </GlobalText>
// //     </View>
// //   );

// //   return (
// //     <SafeAreaView
// //       style={[styles.container, { backgroundColor: isDark ? "#000" : "#f9f9f9" }]}
// //     >
// //       <AnimatedBackground />
// //       <KeyboardAvoidingView
// //         behavior={Platform.OS === "ios" ? "padding" : "height"}
// //         style={{ flex: 1 }}
// //       >
// //         <FlatList
// //           data={filteredProperties}
// //           keyExtractor={(item) => item._id}
// //           contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
// //           keyboardShouldPersistTaps="handled"
// //           ListHeaderComponent={
// //             <Header
// //               userName={userName}
// //               searchText={searchText}
// //               setSearchText={setSearchText}
// //               selectedCategory={selectedCategory}
// //               setSelectedCategory={setSelectedCategory}
// //               setFilteredPreference={setFilteredPreference}
// //               filteredPreference={filteredPreference}
// //               setFilterVisible={setFilterVisible}
// //               isDark={isDark}
// //               colors={colors}
// //             />
// //           }
// //           ListEmptyComponent={!loading && <EmptyCategory />}
// //           renderItem={({ item }) => (
// //             <PropertyCard
// //               item={item}
// //               onPress={() =>
// //                 navigation.navigate("PropertyDetails", { property: item })
// //               }
// //             />
// //           )}
// //           showsVerticalScrollIndicator={false}
// //         />
// //       </KeyboardAvoidingView>
// //       <BottomNav navigation={navigation} />
// //       <FilterModal
// //         visible={filterVisible}
// //         onClose={() => setFilterVisible(false)}
// //       />
// //     </SafeAreaView>
// //   );
// // }

// // // ---------------------------------------------------------
// // // 🔹 STYLES
// // // ---------------------------------------------------------
// // const styles = StyleSheet.create({
// //   container: { flex: 1 },
// //   headerGradient: {
// //     paddingBottom: 30,
// //     borderBottomLeftRadius: 30,
// //     borderBottomRightRadius: 30,
// //   },
// //   headerContent: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "center",
// //     padding: 20,
// //   },
// //   greeting: { fontSize: 20, fontWeight: "400" },
// //   name: { fontSize: 22, fontWeight: "700" },
// //   avatar: {
// //     width: 50,
// //     height: 50,
// //     borderRadius: 25,
// //     borderWidth: 2,
// //     borderColor: "#fff",
// //   },
// //   searchRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20 },
// //   searchBox: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     borderRadius: 12,
// //     paddingHorizontal: 12,
// //     flex: 1,
// //     height: 45,
// //     borderWidth: 1,
// //   },
// //   searchInput: { flex: 1, marginLeft: 6, fontSize: 14 },
// //   filterButton: { marginLeft: 10, borderRadius: 12, padding: 10 },
// //   categoryList: { paddingHorizontal: 15, marginTop: 15 },
// //   categoryCard: {
// //     paddingVertical: 12,
// //     paddingHorizontal: 8,
// //     marginRight: 12,
// //     borderRadius: 14,
// //     alignItems: "center",
// //     justifyContent: "center",
// //     minWidth: 80,
// //     borderWidth: 1,
// //     elevation: 3,
// //   },
// //   categoryText: { fontSize: 12, marginTop: 6 },
// //   animatedToggleWrapper: {
// //     alignItems: "center",
// //     justifyContent: "center",
// //     marginTop: 15,
// //   },
// //   animatedToggleBackground: {
// //     flexDirection: "row",
// //     width: 190,
// //     height: 42,
// //     backgroundColor: "#2EB88E",
// //     borderRadius: 25,
// //     position: "relative",
// //     overflow: "hidden",
// //   },
// //   slider: {
// //     position: "absolute",
// //     top: 2,
// //     width: "50%",
// //     height: 38,
// //     backgroundColor: "#fff",
// //     borderRadius: 20,
// //     elevation: 5,
// //     shadowColor: "#000",
// //     shadowOpacity: 0.15,
// //     shadowRadius: 3,
// //     shadowOffset: { width: 0, height: 2 },
// //     zIndex: 1,
// //   },
// //   toggleHalf: {
// //     flex: 1,
// //     alignItems: "center",
// //     justifyContent: "center",
// //     zIndex: 2,
// //   },
// //   toggleText: {
// //     color: "#E8F8F5",
// //     fontSize: 11,
// //     fontWeight: "600",
// //   },
// //   toggleTextActive: {
// //     color: "#20A68B",
// //     fontWeight: "700",
// //   },
// //   emptyContainer: {
// //     justifyContent: "center",
// //     alignItems: "center",
// //     flexGrow: 1,
// //     paddingHorizontal: 30,
// //     marginTop: 50,
// //   },
// //   emptyTitle: { fontSize: 18, fontWeight: "700", marginTop: 10 },
// //   emptySubtitle: { textAlign: "center", marginTop: 8 },
// // });

// // // import React, { useState, useEffect, useMemo, memo } from "react";
// // // import {
// // //   View,
// // //   StyleSheet,
// // //   TextInput,
// // //   TouchableOpacity,
// // //   FlatList,
// // //   Image,
// // //   KeyboardAvoidingView,
// // //   Platform,
// // //   useColorScheme,
// // //   Animated,
// // // } from "react-native";
// // // import * as Animatable from "react-native-animatable";
// // // import { SafeAreaView } from "react-native-safe-area-context";
// // // import { useTheme, useRoute } from "@react-navigation/native";
// // // import AsyncStorage from "@react-native-async-storage/async-storage";
// // // import LinearGradient from "react-native-linear-gradient";
// // // import GlobalText from "../../theme/GlobalText";
// // // import {
// // //   Search,
// // //   SlidersHorizontal,
// // //   Frown,
// // //   Building,
// // //   Building2,
// // //   MapPin,
// // //   LandPlot,
// // //   WarehouseIcon,
// // //   Factory,
// // //   HousePlus,
// // // } from "lucide-react-native";
// // // import BottomNav from "../../components/ReusableComponents/BottomNav";
// // // import FilterModal from "../../components/ReusableComponents/FilterModal";
// // // import AnimatedBackground from "../../components/ReusableComponents/AnimatedBackground";
// // // import PropertyCard from "../../components/ReusableComponents/PropertyCard";
// // // import { getProperties, getUserProfile } from "../../api/api";
// // // import propertyTypes from "../../constants/propertyTypes";

// // // // ---------------------------------------------------------
// // // // 🔹 ICON MAP
// // // // ---------------------------------------------------------
// // // const iconMap = {
// // //   House: HousePlus,
// // //   Apartment: Building2,
// // //   Office: Building,
// // //   Land: MapPin,
// // //   Sites: LandPlot,
// // //   Godown: WarehouseIcon,
// // //   Factory: Factory,
// // // };

// // // // ---------------------------------------------------------
// // // // 🔹 Label Mapping (Backend vs Display)
// // // // ---------------------------------------------------------
// // // const displayLabel = (type) => {
// // //   if (type === "Sale") return "Buy";
// // //   return type;
// // // };

// // // // ---------------------------------------------------------
// // // // 🔹 HEADER COMPONENT
// // // // ---------------------------------------------------------
// // // const Header = memo(
// // //   ({
// // //     userName,
// // //     searchText,
// // //     setSearchText,
// // //     selectedCategory,
// // //     setSelectedCategory,
// // //     setFilteredPreference,
// // //     filteredPreference,
// // //     setFilterVisible,
// // //     isDark,
// // //     colors,
// // //   }) => {
// // //     return (
// // //       <LinearGradient
// // //         colors={isDark ? ["#16403E", "#0D2F2E"] : ["#43C6AC", "#20A68B"]}
// // //         style={styles.headerGradient}
// // //       >
// // //         {/* Greeting */}
// // //         <View style={styles.headerContent}>
// // //           <View>
// // //             <GlobalText style={[styles.greeting, { color: colors.text }]}>
// // //               Welcome 👋
// // //             </GlobalText>
// // //             <GlobalText style={[styles.name, { color: "#fff" }]}>
// // //               {userName}
// // //             </GlobalText>
// // //           </View>
// // //           <Image
// // //             source={{ uri: "https://randomuser.me/api/portraits/men/75.jpg" }}
// // //             style={styles.avatar}
// // //           />
// // //         </View>

// // //         {/* Search Box */}
// // //         <KeyboardAvoidingView
// // //           behavior={Platform.OS === "ios" ? "padding" : undefined}
// // //         >
// // //           <View style={styles.searchRow}>
// // //             <View
// // //               style={[
// // //                 styles.searchBox,
// // //                 {
// // //                   backgroundColor: isDark ? "#1C1C1E" : "#fff",
// // //                   borderColor: isDark ? "#2A2A2D" : "#E0E0E0",
// // //                 },
// // //               ]}
// // //             >
// // //               <Search size={20} color={isDark ? "#BBB" : "#555"} />
// // //               <TextInput
// // //                 placeholder="Search properties..."
// // //                 placeholderTextColor={isDark ? "#888" : "#aaa"}
// // //                 style={[
// // //                   styles.searchInput,
// // //                   { color: isDark ? "#EDEDED" : "#111" },
// // //                 ]}
// // //                 value={searchText}
// // //                 onChangeText={setSearchText}
// // //               />
// // //             </View>
// // //             <TouchableOpacity
// // //               style={[
// // //                 styles.filterButton,
// // //                 { backgroundColor: isDark ? "#1E7565" : "#20A68B" },
// // //               ]}
// // //               onPress={() => setFilterVisible(true)}
// // //             >
// // //               <SlidersHorizontal size={22} color="#fff" />
// // //             </TouchableOpacity>
// // //           </View>
// // //         </KeyboardAvoidingView>

// // //         {/* Animated Rent/Buy Toggle */}
// // //         <View style={styles.animatedToggleWrapper}>
// // //           <View style={styles.animatedToggleBackground}>
// // //             <Animatable.View
// // //               animation="fadeIn"
// // //               duration={300}
// // //               style={[
// // //                 styles.slider,
// // //                 {
// // //                   left: filteredPreference === "Sale" ? "50%" : "0%",
// // //                 },
// // //               ]}
// // //             />
// // //             {["Rent", "Sale"].map((type) => (
// // //               <TouchableOpacity
// // //                 key={type}
// // //                 activeOpacity={0.9}
// // //                 style={styles.toggleHalf}
// // //                 onPress={() => setFilteredPreference(type)}
// // //               >
// // //                 <GlobalText
// // //                   style={[
// // //                     styles.toggleText,
// // //                     filteredPreference === type && styles.toggleTextActive,
// // //                   ]}
// // //                 >
// // //                   {displayLabel(type)}
// // //                 </GlobalText>
// // //               </TouchableOpacity>
// // //             ))}
// // //           </View>
// // //         </View>

// // //         {/* Viewing Indicator */}
// // //         {filteredPreference && (
// // //           <Animatable.View animation="fadeInDown" duration={700}>
// // //             <GlobalText
// // //               style={{
// // //                 textAlign: "center",
// // //                 color: "#fff",
// // //                 fontSize: 13,
// // //                 marginTop: 10,
// // //               }}
// // //             >
// // //               You’re Viewing{" "}
// // //               <GlobalText style={{ fontWeight: "600", color: "#fff" }}>
// // //                 {displayLabel(filteredPreference)}
// // //               </GlobalText>{" "}
// // //               Properties
// // //             </GlobalText>
// // //           </Animatable.View>
// // //         )}

// // //         {/* Property Type Scroll */}
// // //         <FlatList
// // //           horizontal
// // //           showsHorizontalScrollIndicator={false}
// // //           data={propertyTypes}
// // //           keyExtractor={(item) => item.id.toString()}
// // //           contentContainerStyle={styles.categoryList}
// // //           renderItem={({ item }) => {
// // //             const IconComponent = iconMap[item.name];
// // //             const isActive = selectedCategory === item.name;
// // //             return (
// // //               <TouchableOpacity
// // //                 onPress={() => setSelectedCategory(isActive ? null : item.name)}
// // //                 activeOpacity={0.8}
// // //               >
// // //                 <Animatable.View
// // //                   animation="fadeInUp"
// // //                   duration={600}
// // //                   style={[
// // //                     styles.categoryCard,
// // //                     {
// // //                       backgroundColor: isActive
// // //                         ? "#20A68B"
// // //                         : isDark
// // //                         ? "#1C1C1E"
// // //                         : "#fff",
// // //                       borderColor: isActive
// // //                         ? "#20A68B"
// // //                         : isDark
// // //                         ? "#333"
// // //                         : "#EAEAEA",
// // //                     },
// // //                   ]}
// // //                 >
// // //                   {IconComponent && (
// // //                     <IconComponent
// // //                       size={26}
// // //                       color={isActive ? "#fff" : isDark ? "#9CE0D4" : "#43C6AC"}
// // //                       strokeWidth={2}
// // //                     />
// // //                   )}
// // //                   <GlobalText
// // //                     numberOfLines={1}
// // //                     style={[
// // //                       styles.categoryText,
// // //                       { color: isActive ? "#fff" : isDark ? "#EDEDED" : "#333" },
// // //                     ]}
// // //                   >
// // //                     {item.name}
// // //                   </GlobalText>
// // //                 </Animatable.View>
// // //               </TouchableOpacity>
// // //             );
// // //           }}
// // //         />
// // //       </LinearGradient>
// // //     );
// // //   }
// // // );

// // // // ---------------------------------------------------------
// // // // 🔹 MAIN HOME SCREEN
// // // // ---------------------------------------------------------
// // // export default function HomeScreen({ navigation }) {
// // //   const { colors } = useTheme();
// // //   const route = useRoute();
// // //   const colorScheme = useColorScheme();
// // //   const isDark = colorScheme === "dark";
// // //   const [filterVisible, setFilterVisible] = useState(false);
// // //   const [properties, setProperties] = useState([]);
// // //   const [loading, setLoading] = useState(true);
// // //   const [userName, setUserName] = useState("User");
// // // const [selectedCategory, setSelectedCategory] = useState("House"); // Default
// // // const [filteredPreference, setFilteredPreference] = useState(null);
// // //   const [searchText, setSearchText] = useState("");

// // //   // Load user preference
// // // useEffect(() => {
// // //   const loadInitialPreference = async () => {
// // //     try {
// // //       const fromRouteType = route?.params?.selectedType;
// // //       const fromRouteCategory = route?.params?.selectedCategory;

// // //       // Handle type from route or storage
// // //       if (fromRouteType) {
// // //         setFilteredPreference(fromRouteType);
// // //         await AsyncStorage.setItem("selectedPreference", fromRouteType);
// // //       } else {
// // //         const savedPref = await AsyncStorage.getItem("selectedPreference");
// // //         setFilteredPreference(savedPref || "Rent"); // Default to Rent if nothing saved
// // //       }

// // //       // Handle category from route or storage
// // //       if (fromRouteCategory) {
// // //         setSelectedCategory(fromRouteCategory);
// // //         await AsyncStorage.setItem("selectedCategory", fromRouteCategory);
// // //       } else {
// // //         const savedCategory = await AsyncStorage.getItem("selectedCategory");
// // //         // 🔹 Always fallback to "House"
// // //         setSelectedCategory(savedCategory || "House");
// // //       }
// // //     } catch (err) {
// // //       console.error("Error loading initial preference:", err);
// // //       // 🔹 Ensure default is always applied
// // //       setSelectedCategory("House");
// // //       setFilteredPreference("Rent");
// // //     }
// // //   };

// // //   loadInitialPreference();
// // // }, [route]);


// // //   // Filter Logic
// // //   const filteredProperties = useMemo(() => {
// // //     return properties.filter((p) => {
// // //       const matchesCategory = selectedCategory
// // //         ? p.category?.toLowerCase().trim() ===
// // //           selectedCategory.toLowerCase().trim()
// // //         : true;
// // //       const matchesPreference = filteredPreference
// // //         ? p.propertyPreference?.toLowerCase() ===
// // //           filteredPreference.toLowerCase()
// // //         : true;
// // //       const matchesSearch = searchText
// // //         ? p.title?.toLowerCase().includes(searchText.toLowerCase()) ||
// // //           p.location?.toLowerCase().includes(searchText.toLowerCase()) ||
// // //           p.price?.toString().includes(searchText)
// // //         : true;
// // //       return matchesCategory && matchesPreference && matchesSearch;
// // //     });
// // //   }, [properties, selectedCategory, filteredPreference, searchText]);

// // //   // Load Properties + User Profile
// // //   useEffect(() => {
// // //     const load = async () => {
// // //       try {
// // //         const cached = await AsyncStorage.getItem("properties");
// // //         if (cached) setProperties(JSON.parse(cached));
// // //         const data = await getProperties();
// // //         setProperties(data);
// // //         const user = await getUserProfile();
// // //         setUserName(user?.name || "User");
// // //       } catch (err) {
// // //         console.error("Home load error:", err.message);
// // //       } finally {
// // //         setLoading(false);
// // //       }
// // //     };
// // //     load();
// // //   }, []);

// // //   // Empty Category View
// // //   const EmptyCategory = () => (
// // //     <Animatable.View animation="fadeInUp" duration={700} style={styles.emptyContainer}>
// // //       <Frown size={80} color="#20A68B" strokeWidth={1.5} />
// // //       <GlobalText style={[styles.emptyTitle, { color: colors.primary }]}>
// // //         No Properties Found
// // //       </GlobalText>
// // //       <GlobalText style={[styles.emptySubtitle, { color: isDark ? "#aaa" : "#555" }]}>
// // //         There are currently no {selectedCategory?.toLowerCase()} listings.
// // //       </GlobalText>
// // //       <TouchableOpacity
// // //         style={[styles.resetBtn, { backgroundColor: isDark ? "#2E5E59" : "#43C6AC" }]}
// // //         onPress={() => {
// // //           setSelectedCategory(null);
// // //           setFilteredPreference(null);
// // //         }}
// // //       >
// // //         <GlobalText style={styles.resetText}>Explore All Properties</GlobalText>
// // //       </TouchableOpacity>
// // //     </Animatable.View>
// // //   );

// // //   // Render
// // //   return (
// // //     <SafeAreaView style={[styles.container, { backgroundColor: isDark ? "#000" : "#f9f9f9" }]}>
// // //       <AnimatedBackground />
// // //       <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
// // //         <FlatList
// // //           data={filteredProperties}
// // //           keyExtractor={(item) => item._id}
// // //           contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
// // //           keyboardShouldPersistTaps="handled"
// // //           ListHeaderComponent={
// // //             <Header
// // //               userName={userName}
// // //               searchText={searchText}
// // //               setSearchText={setSearchText}
// // //               selectedCategory={selectedCategory}
// // //               setSelectedCategory={setSelectedCategory}
// // //               setFilteredPreference={setFilteredPreference}
// // //               filteredPreference={filteredPreference}
// // //               setFilterVisible={setFilterVisible}
// // //               isDark={isDark}
// // //               colors={colors}
// // //             />
// // //           }
// // //           ListEmptyComponent={!loading && selectedCategory ? <EmptyCategory /> : null}
// // //           renderItem={({ item }) => (
// // //             <PropertyCard
// // //               item={item}
// // //               onPress={() => navigation.navigate("PropertyDetails", { property: item })}
// // //             />
// // //           )}
// // //           showsVerticalScrollIndicator={false}
// // //         />
// // //       </KeyboardAvoidingView>
// // //       <BottomNav navigation={navigation} />
// // //       <FilterModal visible={filterVisible} onClose={() => setFilterVisible(false)} />
// // //     </SafeAreaView>
// // //   );
// // // }

// // // // ---------------------------------------------------------
// // // // 🔹 STYLES
// // // // ---------------------------------------------------------
// // // const styles = StyleSheet.create({
// // //   container: { flex: 1 },
// // //   headerGradient: {
// // //     paddingBottom: 30,
// // //     borderBottomLeftRadius: 30,
// // //     borderBottomRightRadius: 30,
// // //   },
// // //   headerContent: {
// // //     flexDirection: "row",
// // //     justifyContent: "space-between",
// // //     alignItems: "center",
// // //     padding: 20,
// // //   },
// // //   greeting: { fontSize: 20, fontWeight: "400" },
// // //   name: { fontSize: 22, fontWeight: "700" },
// // //   avatar: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: "#fff" },
// // //   searchRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20 },
// // //   searchBox: {
// // //     flexDirection: "row",
// // //     alignItems: "center",
// // //     borderRadius: 12,
// // //     paddingHorizontal: 12,
// // //     flex: 1,
// // //     height: 45,
// // //     borderWidth: 1,
// // //   },
// // //   searchInput: { flex: 1, marginLeft: 6, fontSize: 14 },
// // //   filterButton: { marginLeft: 10, borderRadius: 12, padding: 10 },
// // //   categoryList: { paddingHorizontal: 15, marginTop: 15 },
// // //   categoryCard: {
// // //     paddingVertical: 12,
// // //     paddingHorizontal: 8,
// // //     marginRight: 12,
// // //     borderRadius: 14,
// // //     alignItems: "center",
// // //     justifyContent: "center",
// // //     minWidth: 80,
// // //     borderWidth: 1,
// // //     elevation: 3,
// // //   },
// // //   categoryText: { fontSize: 12, marginTop: 6 },
// // //   // 🔹 Animated Toggle Styles
// // //   animatedToggleWrapper: {
// // //     alignItems: "center",
// // //     justifyContent: "center",
// // //     marginTop: 15,
// // //   },
// // //   animatedToggleBackground: {
// // //     flexDirection: "row",
// // //     width: 190,
// // //     height: 42,
// // //     backgroundColor: "#2EB88E",
// // //     borderRadius: 25,
// // //     position: "relative",
// // //     overflow: "hidden",
// // //   },
// // //   slider: {
// // //     position: "absolute",
// // //     top: 2,
// // //     width: "50%",
// // //     height: 38,
// // //     backgroundColor: "#fff",
// // //     borderRadius: 20,
// // //     elevation: 5,
// // //     shadowColor: "#000",
// // //     shadowOpacity: 0.15,
// // //     shadowRadius: 3,
// // //     shadowOffset: { width: 0, height: 2 },
// // //     zIndex: 1,
// // //   },
// // //   toggleHalf: {
// // //     flex: 1,
// // //     alignItems: "center",
// // //     justifyContent: "center",
// // //     zIndex: 2,
// // //   },
// // //   toggleText: {
// // //     color: "#E8F8F5",
// // //     fontSize: 11,
// // //     fontWeight: "600",
// // //   },
// // //   toggleTextActive: {
// // //     color: "#20A68B",
// // //     fontWeight: "700",
// // //   },
// // //   emptyContainer: {
// // //     justifyContent: "center",
// // //     alignItems: "center",
// // //     flexGrow: 1,
// // //     paddingHorizontal: 30,
// // //     marginTop: 50,
// // //   },
// // //   emptyTitle: { fontSize: 18, fontWeight: "700", marginTop: 10 },
// // //   emptySubtitle: { textAlign: "center", marginTop: 8 },
// // //   resetBtn: { marginTop: 20, padding: 10, borderRadius: 10 },
// // //   resetText: { color: "#fff", fontWeight: "600" },
// // // });


// // // import React, { useState, useEffect, useMemo, memo } from "react";
// // // import {
// // //   View,
// // //   StyleSheet,
// // //   TextInput,
// // //   TouchableOpacity,
// // //   FlatList,
// // //   Image,
// // //   KeyboardAvoidingView,
// // //   Platform,
// // //   useColorScheme,
// // // } from "react-native";
// // // import * as Animatable from "react-native-animatable";
// // // import { SafeAreaView } from "react-native-safe-area-context";
// // // import { useTheme } from "@react-navigation/native";
// // // import AsyncStorage from "@react-native-async-storage/async-storage";
// // // import LinearGradient from "react-native-linear-gradient";
// // // import GlobalText from "../../theme/GlobalText";
// // // import {
// // //   Search,
// // //   SlidersHorizontal,
// // //   Frown,
// // //   Building,
// // //   Building2,
// // //   MapPin,
// // //   LandPlot,
// // //   WarehouseIcon,
// // //   Factory,
// // //   HousePlus,
// // // } from "lucide-react-native";
// // // import BottomNav from "../../components/ReusableComponents/BottomNav";
// // // import FilterModal from "../../components/ReusableComponents/FilterModal";
// // // import AnimatedBackground from "../../components/ReusableComponents/AnimatedBackground";
// // // import PropertyCard from "../../components/ReusableComponents/PropertyCard";
// // // import { getProperties, getUserProfile } from "../../api/api";
// // // import propertyTypes from "../../constants/propertyTypes";

// // // // -----------------------------------------------
// // // // 🔹 ICON MAP (for property types)
// // // // -----------------------------------------------
// // // const iconMap = {
// // //   House: HousePlus,
// // //   Apartment: Building2,
// // //   Office: Building,
// // //   Land: MapPin,
// // //   Sites: LandPlot,
// // //   Godown: WarehouseIcon,
// // //   Factory: Factory,
// // // };

// // // // -----------------------------------------------
// // // // 🔹 Header Component (Memoized)
// // // // -----------------------------------------------
// // // const Header = memo(
// // //   ({
// // //     userName,
// // //     searchText,
// // //     setSearchText,
// // //     selectedCategory,
// // //     setSelectedCategory,
// // //     setFilteredPreference,
// // //     filteredPreference,
// // //     setFilterVisible,
// // //     isDark,
// // //     colors,
// // //   }) => (
// // //     <LinearGradient
// // //       colors={isDark ? ["#16403E", "#0D2F2E"] : ["#43C6AC", "#20A68B"]}
// // //       style={styles.headerGradient}
// // //     >
// // //       {/* Greeting */}
// // //       <View style={styles.headerContent}>
// // //         <View>
// // //           <GlobalText style={[styles.greeting, { color: colors.text }]}>
// // //             Welcome 👋
// // //           </GlobalText>
// // //           <GlobalText style={[styles.name, { color: "#fff" }]}>
// // //             {userName}
// // //           </GlobalText>
// // //         </View>
// // //         <Image
// // //           source={{ uri: "https://randomuser.me/api/portraits/men/75.jpg" }}
// // //           style={styles.avatar}
// // //         />
// // //       </View>

// // //       {/* 🔍 Search Box */}
// // //       <KeyboardAvoidingView
// // //         behavior={Platform.OS === "ios" ? "padding" : undefined}
// // //       >
// // //         <View style={styles.searchRow}>
// // //           <View
// // //             style={[
// // //               styles.searchBox,
// // //               {
// // //                 backgroundColor: isDark ? "#1C1C1E" : "#fff",
// // //                 borderColor: isDark ? "#2A2A2D" : "#E0E0E0",
// // //               },
// // //             ]}
// // //           >
// // //             <Search size={20} color={isDark ? "#BBB" : "#555"} />
// // //             <TextInput
// // //               placeholder="Search properties..."
// // //               placeholderTextColor={isDark ? "#888" : "#aaa"}
// // //               style={[
// // //                 styles.searchInput,
// // //                 { color: isDark ? "#EDEDED" : "#111" },
// // //               ]}
// // //               value={searchText}
// // //               onChangeText={setSearchText}
// // //             />
// // //           </View>
// // //           <TouchableOpacity
// // //             style={[
// // //               styles.filterButton,
// // //               { backgroundColor: isDark ? "#1E7565" : "#20A68B" },
// // //             ]}
// // //             onPress={() => setFilterVisible(true)}
// // //           >
// // //             <SlidersHorizontal size={22} color="#fff" />
// // //           </TouchableOpacity>
// // //         </View>
// // //       </KeyboardAvoidingView>

// // //       {/* 🏠 Property Type Scroll */}
// // //       <FlatList
// // //         horizontal
// // //         showsHorizontalScrollIndicator={false}
// // //         data={propertyTypes}
// // //         keyExtractor={(item) => item.id.toString()}
// // //         contentContainerStyle={styles.categoryList}
// // //         renderItem={({ item }) => {
// // //           const IconComponent = iconMap[item.name];
// // //           const isActive = selectedCategory === item.name;
// // //           return (
// // //             <TouchableOpacity
// // //               onPress={() => setSelectedCategory(isActive ? null : item.name)}
// // //               activeOpacity={0.8}
// // //             >
// // //               <Animatable.View
// // //                 animation="fadeInUp"
// // //                 duration={600}
// // //                 style={[
// // //                   styles.categoryCard,
// // //                   {
// // //                     backgroundColor: isActive
// // //                       ? "#20A68B"
// // //                       : isDark
// // //                       ? "#1C1C1E"
// // //                       : "#fff",
// // //                     borderColor: isActive
// // //                       ? "#20A68B"
// // //                       : isDark
// // //                       ? "#333"
// // //                       : "#EAEAEA",
// // //                   },
// // //                 ]}
// // //               >
// // //                 {IconComponent && (
// // //                   <IconComponent
// // //                     size={26}
// // //                     color={isActive ? "#fff" : isDark ? "#9CE0D4" : "#43C6AC"}
// // //                     strokeWidth={2}
// // //                   />
// // //                 )}
// // //                 <GlobalText
// // //                   numberOfLines={1}
// // //                   style={[
// // //                     styles.categoryText,
// // //                     { color: isActive ? "#fff" : isDark ? "#EDEDED" : "#333" },
// // //                   ]}
// // //                 >
// // //                   {item.name}
// // //                 </GlobalText>
// // //               </Animatable.View>
// // //             </TouchableOpacity>
// // //           );
// // //         }}
// // //       />

// // //       {/* 🧹 Rent / Sale Filter + Clear */}
// // //       {selectedCategory && (
// // //         <View style={{ alignItems: "center", marginTop: 8 }}>
// // //           <View style={styles.preferenceRow}>
// // //             {["Sale", "Rent"].map((type) => (
// // //               <TouchableOpacity
// // //                 key={type}
// // //                 style={[
// // //                   styles.preferenceBtn,
// // //                   {
// // //                     backgroundColor:
// // //                       filteredPreference === type
// // //                         ? "#20A68B"
// // //                         : isDark
// // //                         ? "#2A2A2A"
// // //                         : "#EAF8F5",
// // //                   },
// // //                 ]}
// // //                 onPress={() =>
// // //                   setFilteredPreference(
// // //                     filteredPreference === type ? null : type
// // //                   )
// // //                 }
// // //               >
// // //                 <GlobalText
// // //                   style={{
// // //                     color: filteredPreference === type ? "#fff" : "#20A68B",
// // //                     fontWeight: "600",
// // //                   }}
// // //                 >
// // //                   {type}
// // //                 </GlobalText>
// // //               </TouchableOpacity>
// // //             ))}
// // //           </View>

// // //           {/* Clear Filter */}
// // //           <TouchableOpacity
// // //             style={[
// // //               styles.clearFilterBtn,
// // //               { backgroundColor: isDark ? "#2F5F59" : "#43C6AC" },
// // //             ]}
// // //             onPress={() => {
// // //               setSelectedCategory(null);
// // //               setFilteredPreference(null);
// // //             }}
// // //           >
// // //             <GlobalText style={styles.clearFilterText}>Clear Filter</GlobalText>
// // //           </TouchableOpacity>

// // //           <GlobalText
// // //             style={[
// // //               styles.filterSummary,
// // //               { color: isDark ? "#AEECE1" : "#EAF8F5" },
// // //             ]}
// // //           >
// // //             Showing {filteredPreference ? filteredPreference + " " : ""}
// // //             {selectedCategory} properties — enjoy browsing!
// // //           </GlobalText>
// // //         </View>
// // //       )}
// // //     </LinearGradient>
// // //   )
// // // );

// // // // -----------------------------------------------
// // // // 🔹 Main HomeScreen Component
// // // // -----------------------------------------------
// // // export default function HomeScreen({ navigation }) {
// // //   const { colors } = useTheme();
// // //   const colorScheme = useColorScheme();
// // //   const isDark = colorScheme === "dark";

// // //   const [filterVisible, setFilterVisible] = useState(false);
// // //   const [properties, setProperties] = useState([]);
// // //   const [loading, setLoading] = useState(true);
// // //   const [userName, setUserName] = useState("User");
// // //   const [selectedCategory, setSelectedCategory] = useState(null);
// // //   const [filteredPreference, setFilteredPreference] = useState(null);
// // //   const [searchText, setSearchText] = useState("");

// // //   // ---------------------------------------------
// // //   // 🔹 Filter Logic
// // //   // ---------------------------------------------
// // //   const filteredProperties = useMemo(() => {
// // //     return properties.filter((p) => {
// // //       const matchesCategory = selectedCategory
// // //         ? p.category?.toLowerCase().trim() ===
// // //           selectedCategory.toLowerCase().trim()
// // //         : true;

// // //       const matchesPreference = filteredPreference
// // //         ? p.propertyPreference?.toLowerCase() ===
// // //           filteredPreference.toLowerCase()
// // //         : true;

// // //       const matchesSearch = searchText
// // //         ? p.title?.toLowerCase().includes(searchText.toLowerCase()) ||
// // //           p.location?.toLowerCase().includes(searchText.toLowerCase()) ||
// // //           p.price?.toString().includes(searchText)
// // //         : true;

// // //       return matchesCategory && matchesPreference && matchesSearch;
// // //     });
// // //   }, [properties, selectedCategory, filteredPreference, searchText]);

// // //   // ---------------------------------------------
// // //   // 🔹 Load Properties + User Profile
// // //   // ---------------------------------------------
// // //   useEffect(() => {
// // //     const load = async () => {
// // //       try {
// // //         const cached = await AsyncStorage.getItem("properties");
// // //         if (cached) setProperties(JSON.parse(cached));

// // //         const data = await getProperties();
// // //         setProperties(data);

// // //         const lightData = data.map(
// // //           ({
// // //             _id,
// // //             title,
// // //             price,
// // //             location,
// // //             category,
// // //             state,
// // //             district,
// // //             propertyPreference,
// // //           }) => ({
// // //             _id,
// // //             title,
// // //             price,
// // //             location,
// // //             category,
// // //             state,
// // //             district,
// // //             propertyPreference,
// // //           })
// // //         );
// // //         await AsyncStorage.setItem("properties", JSON.stringify(lightData));

// // //         const user = await getUserProfile();
// // //         setUserName(user?.name || "User");
// // //       } catch (err) {
// // //         console.error("Home load error:", err.message);
// // //       } finally {
// // //         setLoading(false);
// // //       }
// // //     };
// // //     load();
// // //   }, []);

// // //   // ---------------------------------------------
// // //   // 🔹 Empty Category View
// // //   // ---------------------------------------------
// // //   const EmptyCategory = () => (
// // //     <Animatable.View
// // //       animation="fadeInUp"
// // //       duration={700}
// // //       style={styles.emptyContainer}
// // //     >
// // //       <Frown size={80} color="#20A68B" strokeWidth={1.5} />
// // //       <GlobalText style={[styles.emptyTitle, { color: colors.primary }]}>
// // //         No Properties Found
// // //       </GlobalText>
// // //       <GlobalText
// // //         style={[
// // //           styles.emptySubtitle,
// // //           { color: isDark ? "#aaa" : "#555" },
// // //         ]}
// // //       >
// // //         There are currently no {selectedCategory?.toLowerCase()} listings.
// // //       </GlobalText>
// // //       <TouchableOpacity
// // //         style={[
// // //           styles.resetBtn,
// // //           { backgroundColor: isDark ? "#2E5E59" : "#43C6AC" },
// // //         ]}
// // //         onPress={() => {
// // //           setSelectedCategory(null);
// // //           setFilteredPreference(null);
// // //         }}
// // //       >
// // //         <GlobalText style={styles.resetText}>Explore All Properties</GlobalText>
// // //       </TouchableOpacity>
// // //     </Animatable.View>
// // //   );

// // //   // ---------------------------------------------
// // //   // 🔹 Render
// // //   // ---------------------------------------------
// // //   return (
// // //     <SafeAreaView
// // //       style={[
// // //         styles.container,
// // //         { backgroundColor: isDark ? "#000" : "#f9f9f9" },
// // //       ]}
// // //     >
// // //       <AnimatedBackground />
// // //       <KeyboardAvoidingView
// // //         behavior={Platform.OS === "ios" ? "padding" : "height"}
// // //         style={{ flex: 1 }}
// // //       >
// // //         <FlatList
// // //           data={filteredProperties}
// // //           keyExtractor={(item) => item._id}
// // //           contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
// // //           keyboardShouldPersistTaps="handled"
// // //           ListHeaderComponent={
// // //             <Header
// // //               userName={userName}
// // //               searchText={searchText}
// // //               setSearchText={setSearchText}
// // //               selectedCategory={selectedCategory}
// // //               setSelectedCategory={setSelectedCategory}
// // //               setFilteredPreference={setFilteredPreference}
// // //               filteredPreference={filteredPreference}
// // //               setFilterVisible={setFilterVisible}
// // //               isDark={isDark}
// // //               colors={colors}
// // //             />
// // //           }
// // //           ListEmptyComponent={
// // //             !loading && selectedCategory ? <EmptyCategory /> : null
// // //           }
// // //           renderItem={({ item }) => (
// // //             <PropertyCard
// // //               item={item}
// // //               onPress={() =>
// // //                 navigation.navigate("PropertyDetails", { property: item })
// // //               }
// // //             />
// // //           )}
// // //           showsVerticalScrollIndicator={false}
// // //         />
// // //       </KeyboardAvoidingView>
// // //       <BottomNav navigation={navigation} />
// // //       <FilterModal
// // //         visible={filterVisible}
// // //         onClose={() => setFilterVisible(false)}
// // //       />
// // //     </SafeAreaView>
// // //   );
// // // }

// // // // -----------------------------------------------
// // // // 🔹 Styles
// // // // -----------------------------------------------
// // // const styles = StyleSheet.create({
// // //   container: { flex: 1 },
// // //   headerGradient: {
// // //     paddingBottom: 30,
// // //     borderBottomLeftRadius: 30,
// // //     borderBottomRightRadius: 30,
// // //   },
// // //   headerContent: {
// // //     flexDirection: "row",
// // //     justifyContent: "space-between",
// // //     alignItems: "center",
// // //     padding: 20,
// // //   },
// // //   greeting: { fontSize: 20, fontWeight: "400" },
// // //   name: { fontSize: 22, fontWeight: "700" },
// // //   avatar: {
// // //     width: 50,
// // //     height: 50,
// // //     borderRadius: 25,
// // //     borderWidth: 2,
// // //     borderColor: "#fff",
// // //   },
// // //   searchRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20 },
// // //   searchBox: {
// // //     flexDirection: "row",
// // //     alignItems: "center",
// // //     borderRadius: 12,
// // //     paddingHorizontal: 12,
// // //     flex: 1,
// // //     height: 45,
// // //     borderWidth: 1,
// // //   },
// // //   searchInput: { flex: 1, marginLeft: 6, fontSize: 14 },
// // //   filterButton: { marginLeft: 10, borderRadius: 12, padding: 10 },
// // //   categoryList: { paddingHorizontal: 15, marginTop: 15 },
// // //   categoryCard: {
// // //     paddingVertical: 12,
// // //     paddingHorizontal: 8,
// // //     marginRight: 12,
// // //     borderRadius: 14,
// // //     alignItems: "center",
// // //     justifyContent: "center",
// // //     minWidth: 80,
// // //     borderWidth: 1,
// // //     elevation: 3,
// // //   },
// // //   categoryText: { fontSize: 12, marginTop: 6 },
// // //   preferenceRow: {
// // //     flexDirection: "row",
// // //     justifyContent: "center",
// // //     marginBottom: 5,
// // //     marginTop: 10,
// // //   },
// // //   preferenceBtn: {
// // //     paddingVertical: 8,
// // //     paddingHorizontal: 18,
// // //     borderRadius: 20,
// // //     marginHorizontal: 6,
// // //   },
// // //   clearFilterBtn: {
// // //     marginTop: 12,
// // //     borderRadius: 10,
// // //     paddingVertical: 8,
// // //     paddingHorizontal: 20,
// // //   },
// // //   clearFilterText: { color: "#fff", fontWeight: "600" },
// // //   filterSummary: { marginTop: 6, fontSize: 13, textAlign: "center" },
// // //   emptyContainer: {
// // //     justifyContent: "center",
// // //     alignItems: "center",
// // //     flexGrow: 1,
// // //     paddingHorizontal: 30,
// // //     marginTop: 50,
// // //   },
// // //   emptyTitle: { fontSize: 18, fontWeight: "700", marginTop: 10 },
// // //   emptySubtitle: { textAlign: "center", marginTop: 8 },
// // //   resetBtn: { marginTop: 20, padding: 10, borderRadius: 10 },
// // //   resetText: { color: "#fff", fontWeight: "600" },
// // // });

// // // // import React, { useState, useEffect, useMemo, memo } from "react";
// // // // import {
// // // //   View,
// // // //   StyleSheet,
// // // //   TextInput,
// // // //   TouchableOpacity,
// // // //   FlatList,
// // // //   Image,
// // // //   KeyboardAvoidingView,
// // // //   Platform,
// // // //   useColorScheme,
// // // // } from "react-native";
// // // // import * as Animatable from "react-native-animatable";
// // // // import { SafeAreaView } from "react-native-safe-area-context";
// // // // import { useTheme } from "@react-navigation/native";
// // // // import AsyncStorage from "@react-native-async-storage/async-storage";
// // // // import LinearGradient from "react-native-linear-gradient";
// // // // import GlobalText from "../../theme/GlobalText";
// // // // import {
// // // //   Search,
// // // //   SlidersHorizontal,
// // // //   Frown,
// // // //   Building,
// // // //   Building2,
// // // //   MapPin,
// // // //   LandPlot,
// // // //   WarehouseIcon,
// // // //   Factory,
// // // //   HousePlus,
// // // // } from "lucide-react-native";
// // // // import BottomNav from "../../components/ReusableComponents/BottomNav";
// // // // import FilterModal from "../../components/ReusableComponents/FilterModal";
// // // // import AnimatedBackground from "../../components/ReusableComponents/AnimatedBackground";
// // // // import PropertyCard from "../../components/ReusableComponents/PropertyCard";
// // // // import { getProperties, getUserProfile } from "../../api/api";
// // // // import propertyTypes from "../../constants/propertyTypes";

// // // // const iconMap = {
// // // //   House: HousePlus,
// // // //   Apartment: Building2,
// // // //   Office: Building,
// // // //   Land: MapPin,
// // // //   Sites: LandPlot,
// // // //   Godown: WarehouseIcon,
// // // //   Factory: Factory,
// // // // };

// // // // // ✅ Memoized Header
// // // // const Header = memo(
// // // //   ({
// // // //     userName,
// // // //     searchText,
// // // //     setSearchText,
// // // //     selectedCategory,
// // // //     setSelectedCategory,
// // // //     setFilterVisible,
// // // //     isDark,
// // // //     colors,
// // // //   }) => (
// // // //     <LinearGradient
// // // //       colors={isDark ? ["#16403E", "#0D2F2E"] : ["#43C6AC", "#20A68B"]}
// // // //       style={styles.headerGradient}
// // // //     >
// // // //       {/* Greeting */}
// // // //       <View style={styles.headerContent}>
// // // //         <View>
// // // //           <GlobalText style={[styles.greeting, { color: colors.text }]}>
// // // //             Welcome 👋
// // // //           </GlobalText>
// // // //           <GlobalText style={[styles.name, { color: "#fff" }]}>
// // // //             {userName}
// // // //           </GlobalText>
// // // //         </View>
// // // //         <Image
// // // //           source={{ uri: "https://randomuser.me/api/portraits/men/75.jpg" }}
// // // //           style={styles.avatar}
// // // //         />
// // // //       </View>

// // // //       {/* 🔍 Search */}
// // // //       <KeyboardAvoidingView
// // // //         behavior={Platform.OS === "ios" ? "padding" : undefined}
// // // //       >
// // // //         <View style={styles.searchRow}>
// // // //           <View
// // // //             style={[
// // // //               styles.searchBox,
// // // //               {
// // // //                 backgroundColor: isDark ? "#1C1C1E" : "#fff",
// // // //                 borderColor: isDark ? "#2A2A2D" : "#E0E0E0",
// // // //               },
// // // //             ]}
// // // //           >
// // // //             <Search size={20} color={isDark ? "#BBB" : "#555"} />
// // // //             <TextInput
// // // //               placeholder="Search properties..."
// // // //               placeholderTextColor={isDark ? "#888" : "#aaa"}
// // // //               style={[
// // // //                 styles.searchInput,
// // // //                 { color: isDark ? "#EDEDED" : "#111" },
// // // //               ]}
// // // //               value={searchText}
// // // //               onChangeText={setSearchText}
// // // //             />
// // // //           </View>
// // // //           <TouchableOpacity
// // // //             style={[
// // // //               styles.filterButton,
// // // //               { backgroundColor: isDark ? "#1E7565" : "#20A68B" },
// // // //             ]}
// // // //             onPress={() => setFilterVisible(true)}
// // // //           >
// // // //             <SlidersHorizontal size={22} color="#fff" />
// // // //           </TouchableOpacity>
// // // //         </View>
// // // //       </KeyboardAvoidingView>

// // // //       {/* 🏠 Categories */}
// // // //       <FlatList
// // // //         horizontal
// // // //         showsHorizontalScrollIndicator={false}
// // // //         data={propertyTypes}
// // // //         keyExtractor={(item) => item.id.toString()}
// // // //         contentContainerStyle={styles.categoryList}
// // // //         renderItem={({ item }) => {
// // // //           const IconComponent = iconMap[item.name];
// // // //           const isActive = selectedCategory === item.name;
// // // //           return (
// // // //             <TouchableOpacity
// // // //               onPress={() => setSelectedCategory(isActive ? null : item.name)}
// // // //               activeOpacity={0.8}
// // // //             >
// // // //               <Animatable.View
// // // //                 animation="fadeInUp"
// // // //                 duration={600}
// // // //                 style={[
// // // //                   styles.categoryCard,
// // // //                   {
// // // //                     backgroundColor: isActive
// // // //                       ? "#20A68B"
// // // //                       : isDark
// // // //                       ? "#1C1C1E"
// // // //                       : "#fff",
// // // //                     borderColor: isActive
// // // //                       ? "#20A68B"
// // // //                       : isDark
// // // //                       ? "#333"
// // // //                       : "#EAEAEA",
// // // //                     shadowColor: isDark ? "#000" : "#43C6AC",
// // // //                   },
// // // //                 ]}
// // // //               >
// // // //                 {IconComponent && (
// // // //                   <IconComponent
// // // //                     size={26}
// // // //                     color={isActive ? "#fff" : isDark ? "#9CE0D4" : "#43C6AC"}
// // // //                     strokeWidth={2}
// // // //                   />
// // // //                 )}
// // // //                 <GlobalText
// // // //                   numberOfLines={1}
// // // //                   style={[
// // // //                     styles.categoryText,
// // // //                     { color: isActive ? "#fff" : isDark ? "#EDEDED" : "#333" },
// // // //                   ]}
// // // //                 >
// // // //                   {item.name}
// // // //                 </GlobalText>
// // // //               </Animatable.View>
// // // //             </TouchableOpacity>
// // // //           );
// // // //         }}
// // // //       />

// // // //       {/* 🧹 Clear Filter + Info */}
// // // //       {selectedCategory && (
// // // //         <View style={{ alignItems: "center", marginTop: 8 }}>
// // // //           <TouchableOpacity
// // // //             style={[
// // // //               styles.clearFilterBtn,
// // // //               { backgroundColor: isDark ? "#2F5F59" : "#43C6AC" },
// // // //             ]}
// // // //             onPress={() => setSelectedCategory(null)}
// // // //           >
// // // //             <GlobalText style={styles.clearFilterText}>Clear Filter</GlobalText>
// // // //           </TouchableOpacity>
// // // //           <GlobalText
// // // //             style={[
// // // //               styles.filterSummary,
// // // //               { color: isDark ? "#AEECE1" : "#EAF8F5" },
// // // //             ]}
// // // //           >
// // // //             Showing results for {selectedCategory} properties — enjoy browsing!
// // // //           </GlobalText>
// // // //         </View>
// // // //       )}
// // // //     </LinearGradient>
// // // //   )
// // // // );

// // // // export default function HomeScreen({ navigation }) {
// // // //   const { colors } = useTheme();
// // // //   const isDark = useColorScheme() === "dark";

// // // //   const [filterVisible, setFilterVisible] = useState(false);
// // // //   const [properties, setProperties] = useState([]);
// // // //   const [loading, setLoading] = useState(true);
// // // //   const [userName, setUserName] = useState("User");
// // // //   const [selectedCategory, setSelectedCategory] = useState(null);
// // // //   const [searchText, setSearchText] = useState("");

// // // //   const filteredProperties = useMemo(() => {
// // // //     return properties.filter((p) => {
// // // //       const matchesCategory = selectedCategory
// // // //         ? p.category?.toLowerCase().trim() ===
// // // //           selectedCategory.toLowerCase().trim()
// // // //         : true;
// // // //       const matchesSearch = searchText
// // // //         ? p.title?.toLowerCase().includes(searchText.toLowerCase()) ||
// // // //           p.location?.toLowerCase().includes(searchText.toLowerCase()) ||
// // // //           p.price?.toString().includes(searchText)
// // // //         : true;
// // // //       return matchesCategory && matchesSearch;
// // // //     });
// // // //   }, [properties, selectedCategory, searchText]);

// // // //   useEffect(() => {
// // // //     const load = async () => {
// // // //       try {
// // // //         // Try to load cached (lightweight) data
// // // //         const cached = await AsyncStorage.getItem("properties");
// // // //         if (cached) setProperties(JSON.parse(cached));

// // // //         // Fetch fresh data
// // // //         const data = await getProperties();
// // // //         setProperties(data);

// // // //         // ✅ Cache only small metadata (avoid large Base64)
// // // //         const lightData = data.map(
// // // //           ({ _id, title, price, location, category, state, district }) => ({
// // // //             _id,
// // // //             title,
// // // //             price,
// // // //             location,
// // // //             category,
// // // //             state,
// // // //             district,
// // // //           })
// // // //         );
// // // //         await AsyncStorage.setItem("properties", JSON.stringify(lightData));

// // // //         // Load user info
// // // //         const user = await getUserProfile();
// // // //         setUserName(user?.name || "User");
// // // //       } catch (err) {
// // // //         console.error("Home load error:", err.message);
// // // //       } finally {
// // // //         setLoading(false);
// // // //       }
// // // //     };
// // // //     load();
// // // //   }, []);

// // // //   const EmptyCategory = () => (
// // // //     <Animatable.View
// // // //       animation="fadeInUp"
// // // //       duration={700}
// // // //       style={styles.emptyContainer}
// // // //     >
// // // //       <Frown size={80} color="#20A68B" strokeWidth={1.5} />
// // // //       <GlobalText style={[styles.emptyTitle, { color: colors.primary }]}>
// // // //         No Properties Found
// // // //       </GlobalText>
// // // //       <GlobalText
// // // //         style={[
// // // //           styles.emptySubtitle,
// // // //           { color: isDark ? "#aaa" : "#555" },
// // // //         ]}
// // // //       >
// // // //         There are currently no {selectedCategory?.toLowerCase()} listings
// // // //         available. Please try again later or explore another category.
// // // //       </GlobalText>
// // // //       <TouchableOpacity
// // // //         style={[
// // // //           styles.resetBtn,
// // // //           { backgroundColor: isDark ? "#2E5E59" : "#43C6AC" },
// // // //         ]}
// // // //         onPress={() => setSelectedCategory(null)}
// // // //       >
// // // //         <GlobalText style={styles.resetText}>Explore All Properties</GlobalText>
// // // //       </TouchableOpacity>
// // // //     </Animatable.View>
// // // //   );

// // // //   return (
// // // //     <SafeAreaView
// // // //       style={[
// // // //         styles.container,
// // // //         { backgroundColor: isDark ? "#000" : "#f9f9f9" },
// // // //       ]}
// // // //     >
// // // //       <AnimatedBackground />
// // // //       <KeyboardAvoidingView
// // // //         behavior={Platform.OS === "ios" ? "padding" : "height"}
// // // //         style={{ flex: 1 }}
// // // //       >
// // // //         <FlatList
// // // //           data={filteredProperties}
// // // //           keyExtractor={(item) => item._id}
// // // //           contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
// // // //           keyboardShouldPersistTaps="handled"
// // // //           ListHeaderComponent={
// // // //             <Header
// // // //               userName={userName}
// // // //               searchText={searchText}
// // // //               setSearchText={setSearchText}
// // // //               selectedCategory={selectedCategory}
// // // //               setSelectedCategory={setSelectedCategory}
// // // //               setFilterVisible={setFilterVisible}
// // // //               isDark={isDark}
// // // //               colors={colors}
// // // //             />
// // // //           }
// // // //           ListEmptyComponent={!loading && selectedCategory ? <EmptyCategory /> : null}
// // // //           renderItem={({ item }) => (
// // // //             <PropertyCard
// // // //               item={item}
// // // //               onPress={() =>
// // // //                 navigation.navigate("PropertyDetails", { property: item })
// // // //               }
// // // //             />
// // // //           )}
// // // //           showsVerticalScrollIndicator={false}
// // // //         />
// // // //       </KeyboardAvoidingView>
// // // //       <BottomNav navigation={navigation} />
// // // //       <FilterModal
// // // //         visible={filterVisible}
// // // //         onClose={() => setFilterVisible(false)}
// // // //       />
// // // //     </SafeAreaView>
// // // //   );
// // // // }

// // // // const styles = StyleSheet.create({
// // // //   container: { flex: 1 },
// // // //   headerGradient: {
// // // //     paddingBottom: 30,
// // // //     borderBottomLeftRadius: 30,
// // // //     borderBottomRightRadius: 30,
// // // //   },
// // // //   headerContent: {
// // // //     flexDirection: "row",
// // // //     justifyContent: "space-between",
// // // //     alignItems: "center",
// // // //     padding: 20,
// // // //   },
// // // //   greeting: { fontSize: 20, fontWeight: "400" },
// // // //   name: { fontSize: 22, fontWeight: "700" },
// // // //   avatar: {
// // // //     width: 50,
// // // //     height: 50,
// // // //     borderRadius: 25,
// // // //     borderWidth: 2,
// // // //     borderColor: "#fff",
// // // //   },
// // // //   searchRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20 },
// // // //   searchBox: {
// // // //     flexDirection: "row",
// // // //     alignItems: "center",
// // // //     borderRadius: 12,
// // // //     paddingHorizontal: 12,
// // // //     flex: 1,
// // // //     height: 45,
// // // //     borderWidth: 1,
// // // //   },
// // // //   searchInput: { flex: 1, marginLeft: 6, fontSize: 14 },
// // // //   filterButton: { marginLeft: 10, borderRadius: 12, padding: 10 },
// // // //   categoryList: { paddingHorizontal: 15, marginTop: 15 },
// // // //   categoryCard: {
// // // //     paddingVertical: 12,
// // // //     paddingHorizontal: 8,
// // // //     marginRight: 12,
// // // //     borderRadius: 14,
// // // //     alignItems: "center",
// // // //     justifyContent: "center",
// // // //     minWidth: 80,
// // // //     borderWidth: 1,
// // // //     elevation: 3,
// // // //   },
// // // //   categoryText: { fontSize: 12, marginTop: 6 },
// // // //   clearFilterBtn: {
// // // //     marginTop: 12,
// // // //     borderRadius: 10,
// // // //     paddingVertical: 8,
// // // //     paddingHorizontal: 20,
// // // //   },
// // // //   clearFilterText: { color: "#fff", fontWeight: "600" },
// // // //   filterSummary: { marginTop: 6, fontSize: 13, textAlign: "center" },
// // // //   emptyContainer: {
// // // //     justifyContent: "center",
// // // //     alignItems: "center",
// // // //     flexGrow: 1,
// // // //     paddingHorizontal: 30,
// // // //     marginTop: 50,
// // // //   },
// // // //   emptyTitle: { fontSize: 18, fontWeight: "700", marginTop: 10 },
// // // //   emptySubtitle: { textAlign: "center", marginTop: 8 },
// // // //   resetBtn: { marginTop: 20, padding: 10, borderRadius: 10 },
// // // //   resetText: { color: "#fff", fontWeight: "600" },
// // // // });

// // // // // import React, { useState, useEffect, useMemo, memo } from "react";
// // // // // import {
// // // // //   View,
// // // // //   StyleSheet,
// // // // //   TextInput,
// // // // //   TouchableOpacity,
// // // // //   FlatList,
// // // // //   Image,
// // // // //   KeyboardAvoidingView,
// // // // //   Platform,
// // // // //   useColorScheme,
// // // // // } from "react-native";
// // // // // import * as Animatable from "react-native-animatable";
// // // // // import { SafeAreaView } from "react-native-safe-area-context";
// // // // // import { useTheme } from "@react-navigation/native";
// // // // // import AsyncStorage from "@react-native-async-storage/async-storage";
// // // // // import LinearGradient from "react-native-linear-gradient";
// // // // // import GlobalText from "../../theme/GlobalText";
// // // // // import {
// // // // //   Search,
// // // // //   SlidersHorizontal,
// // // // //   Frown,
// // // // //   Building,
// // // // //   Building2,
// // // // //   MapPin,
// // // // //   LandPlot,
// // // // //   WarehouseIcon,
// // // // //   Factory,
// // // // //   HousePlus,
// // // // // } from "lucide-react-native";
// // // // // import BottomNav from "../../components/ReusableComponents/BottomNav";
// // // // // import FilterModal from "../../components/ReusableComponents/FilterModal";
// // // // // import AnimatedBackground from "../../components/ReusableComponents/AnimatedBackground";
// // // // // import PropertyCard from "../../components/ReusableComponents/PropertyCard";
// // // // // import {
// // // // //   getProperties,
// // // // //   getUserProfile,
// // // // // } from "../../api/api";
// // // // // import propertyTypes from "../../constants/propertyTypes";

// // // // // const iconMap = {
// // // // //   House: HousePlus,
// // // // //   Apartment: Building2,
// // // // //   Office: Building,
// // // // //   Land: MapPin,
// // // // //   Sites: LandPlot,
// // // // //   Godown: WarehouseIcon,
// // // // //   Factory: Factory,
// // // // // };

// // // // // // ✅ Memoized Header
// // // // // const Header = memo(
// // // // //   ({
// // // // //     userName,
// // // // //     searchText,
// // // // //     setSearchText,
// // // // //     selectedCategory,
// // // // //     setSelectedCategory,
// // // // //     setFilterVisible,
// // // // //     isDark,
// // // // //     colors,
// // // // //   }) => (
// // // // //     <LinearGradient
// // // // //       colors={
// // // // //         isDark
// // // // //           ? ["#16403E", "#0D2F2E"]
// // // // //           : ["#43C6AC", "#20A68B"]
// // // // //       }
// // // // //       style={styles.headerGradient}
// // // // //     >
// // // // //       {/* Greeting */}
// // // // //       <View style={styles.headerContent}>
// // // // //         <View>
// // // // //           <GlobalText style={[styles.greeting, { color: colors.text }]}>
// // // // //             Welcome 👋
// // // // //           </GlobalText>
// // // // //           <GlobalText style={[styles.name, { color: "#fff" }]}>
// // // // //             {userName}
// // // // //           </GlobalText>
// // // // //         </View>
// // // // //         <Image
// // // // //           source={{ uri: "https://randomuser.me/api/portraits/men/75.jpg" }}
// // // // //           style={styles.avatar}
// // // // //         />
// // // // //       </View>

// // // // //       {/* 🔍 Search */}
// // // // //       <KeyboardAvoidingView
// // // // //         behavior={Platform.OS === "ios" ? "padding" : undefined}
// // // // //       >
// // // // //         <View style={styles.searchRow}>
// // // // //           <View
// // // // //             style={[
// // // // //               styles.searchBox,
// // // // //               {
// // // // //                 backgroundColor: isDark ? "#1C1C1E" : "#fff",
// // // // //                 borderColor: isDark ? "#2A2A2D" : "#E0E0E0",
// // // // //               },
// // // // //             ]}
// // // // //           >
// // // // //             <Search size={20} color={isDark ? "#BBB" : "#555"} />
// // // // //             <TextInput
// // // // //               placeholder="Search properties..."
// // // // //               placeholderTextColor={isDark ? "#888" : "#aaa"}
// // // // //               style={[
// // // // //                 styles.searchInput,
// // // // //                 { color: isDark ? "#EDEDED" : "#111" },
// // // // //               ]}
// // // // //               value={searchText}
// // // // //               onChangeText={setSearchText}
// // // // //             />
// // // // //           </View>
// // // // //           <TouchableOpacity
// // // // //             style={[
// // // // //               styles.filterButton,
// // // // //               { backgroundColor: isDark ? "#1E7565" : "#20A68B" },
// // // // //             ]}
// // // // //             onPress={() => setFilterVisible(true)}
// // // // //           >
// // // // //             <SlidersHorizontal size={22} color="#fff" />
// // // // //           </TouchableOpacity>
// // // // //         </View>
// // // // //       </KeyboardAvoidingView>

// // // // //       {/* 🏠 Categories */}
// // // // //       <FlatList
// // // // //         horizontal
// // // // //         showsHorizontalScrollIndicator={false}
// // // // //         data={propertyTypes}
// // // // //         keyExtractor={(item) => item.id.toString()}
// // // // //         contentContainerStyle={styles.categoryList}
// // // // //         renderItem={({ item }) => {
// // // // //           const IconComponent = iconMap[item.name];
// // // // //           const isActive = selectedCategory === item.name;
// // // // //           return (
// // // // //             <TouchableOpacity
// // // // //               onPress={() => setSelectedCategory(isActive ? null : item.name)}
// // // // //               activeOpacity={0.8}
// // // // //             >
// // // // //               <Animatable.View
// // // // //                 animation="fadeInUp"
// // // // //                 duration={600}
// // // // //                 style={[
// // // // //                   styles.categoryCard,
// // // // //                   {
// // // // //                     backgroundColor: isActive
// // // // //                       ? "#20A68B"
// // // // //                       : isDark
// // // // //                       ? "#1C1C1E"
// // // // //                       : "#fff",
// // // // //                     borderColor: isActive
// // // // //                       ? "#20A68B"
// // // // //                       : isDark
// // // // //                       ? "#333"
// // // // //                       : "#EAEAEA",
// // // // //                     shadowColor: isDark ? "#000" : "#43C6AC",
// // // // //                   },
// // // // //                 ]}
// // // // //               >
// // // // //                 {IconComponent && (
// // // // //                   <IconComponent
// // // // //                     size={26}
// // // // //                     color={isActive ? "#fff" : isDark ? "#9CE0D4" : "#43C6AC"}
// // // // //                     strokeWidth={2}
// // // // //                   />
// // // // //                 )}
// // // // //                 <GlobalText
// // // // //                   numberOfLines={1}
// // // // //                   style={[
// // // // //                     styles.categoryText,
// // // // //                     { color: isActive ? "#fff" : isDark ? "#EDEDED" : "#333" },
// // // // //                   ]}
// // // // //                 >
// // // // //                   {item.name}
// // // // //                 </GlobalText>
// // // // //               </Animatable.View>
// // // // //             </TouchableOpacity>
// // // // //           );
// // // // //         }}
// // // // //       />

// // // // //       {/* 🧹 Clear Filter + Info */}
// // // // //       {selectedCategory && (
// // // // //         <View style={{ alignItems: "center", marginTop: 8 }}>
// // // // //           <TouchableOpacity
// // // // //             style={[
// // // // //               styles.clearFilterBtn,
// // // // //               { backgroundColor: isDark ? "#2F5F59" : "#43C6AC" },
// // // // //             ]}
// // // // //             onPress={() => setSelectedCategory(null)}
// // // // //           >
// // // // //             <GlobalText style={styles.clearFilterText}>Clear Filter</GlobalText>
// // // // //           </TouchableOpacity>
// // // // //           <GlobalText
// // // // //             style={[
// // // // //               styles.filterSummary,
// // // // //               { color: isDark ? "#AEECE1" : "#EAF8F5" },
// // // // //             ]}
// // // // //           >
// // // // //             Showing results for {selectedCategory} properties — enjoy browsing!
// // // // //           </GlobalText>
// // // // //         </View>
// // // // //       )}
// // // // //     </LinearGradient>
// // // // //   )
// // // // // );

// // // // // export default function HomeScreen({ navigation }) {
// // // // //   const { colors } = useTheme();
// // // // //   const isDark = useColorScheme() === "dark";

// // // // //   const [filterVisible, setFilterVisible] = useState(false);
// // // // //   const [properties, setProperties] = useState([]);
// // // // //   const [loading, setLoading] = useState(true);
// // // // //   const [userName, setUserName] = useState("User");
// // // // //   const [selectedCategory, setSelectedCategory] = useState(null);
// // // // //   const [searchText, setSearchText] = useState("");

// // // // //   const filteredProperties = useMemo(() => {
// // // // //     return properties.filter((p) => {
// // // // //       const matchesCategory = selectedCategory
// // // // //         ? p.category?.toLowerCase().trim() ===
// // // // //           selectedCategory.toLowerCase().trim()
// // // // //         : true;
// // // // //       const matchesSearch = searchText
// // // // //         ? p.title?.toLowerCase().includes(searchText.toLowerCase()) ||
// // // // //           p.location?.toLowerCase().includes(searchText.toLowerCase()) ||
// // // // //           p.price?.toString().includes(searchText)
// // // // //         : true;
// // // // //       return matchesCategory && matchesSearch;
// // // // //     });
// // // // //   }, [properties, selectedCategory, searchText]);

// // // // //   useEffect(() => {
// // // // //     const load = async () => {
// // // // //       try {
// // // // //         const cached = await AsyncStorage.getItem("properties");
// // // // //         if (cached) setProperties(JSON.parse(cached));

// // // // //         const data = await getProperties();
// // // // //         setProperties(data);
// // // // //         await AsyncStorage.setItem("properties", JSON.stringify(data));

// // // // //         const user = await getUserProfile();
// // // // //         setUserName(user?.name || "User");
// // // // //       } catch (err) {
// // // // //         console.error("Home load error:", err.message);
// // // // //       } finally {
// // // // //         setLoading(false);
// // // // //       }
// // // // //     };
// // // // //     load();
// // // // //   }, []);

// // // // //   const EmptyCategory = () => (
// // // // //     <Animatable.View animation="fadeInUp" duration={700} style={styles.emptyContainer}>
// // // // //       <Frown size={80} color={isDark ? "#20A68B" : "#20A68B"} strokeWidth={1.5} />
// // // // //       <GlobalText style={[styles.emptyTitle, { color: colors.primary }]}>
// // // // //         No Properties Found
// // // // //       </GlobalText>
// // // // //       <GlobalText
// // // // //         style={[
// // // // //           styles.emptySubtitle,
// // // // //           { color: isDark ? "#aaa" : "#555" },
// // // // //         ]}
// // // // //       >
// // // // //         There are currently no {selectedCategory?.toLowerCase()} listings available.
// // // // //         Please try again later or explore another category.
// // // // //       </GlobalText>
// // // // //       <TouchableOpacity
// // // // //         style={[
// // // // //           styles.resetBtn,
// // // // //           { backgroundColor: isDark ? "#2E5E59" : "#43C6AC" },
// // // // //         ]}
// // // // //         onPress={() => setSelectedCategory(null)}
// // // // //       >
// // // // //         <GlobalText style={styles.resetText}>Explore All Properties</GlobalText>
// // // // //       </TouchableOpacity>
// // // // //     </Animatable.View>
// // // // //   );

// // // // //   return (
// // // // //     <SafeAreaView
// // // // //       style={[
// // // // //         styles.container,
// // // // //         { backgroundColor: isDark ? "#000" : "#f9f9f9" },
// // // // //       ]}
// // // // //     >
// // // // //       <AnimatedBackground />
// // // // //       <KeyboardAvoidingView
// // // // //         behavior={Platform.OS === "ios" ? "padding" : "height"}
// // // // //         style={{ flex: 1 }}
// // // // //       >
// // // // //         <FlatList
// // // // //           data={filteredProperties}
// // // // //           keyExtractor={(item) => item._id}
// // // // //           contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
// // // // //           keyboardShouldPersistTaps="handled"
// // // // //           ListHeaderComponent={
// // // // //             <Header
// // // // //               userName={userName}
// // // // //               searchText={searchText}
// // // // //               setSearchText={setSearchText}
// // // // //               selectedCategory={selectedCategory}
// // // // //               setSelectedCategory={setSelectedCategory}
// // // // //               setFilterVisible={setFilterVisible}
// // // // //               isDark={isDark}
// // // // //               colors={colors}
// // // // //             />
// // // // //           }
// // // // //           ListEmptyComponent={!loading && selectedCategory ? <EmptyCategory /> : null}
// // // // //           renderItem={({ item }) => (
// // // // //             <PropertyCard
// // // // //               item={item}
// // // // //               onPress={() =>
// // // // //                 navigation.navigate("PropertyDetails", { property: item })
// // // // //               }
// // // // //             />
// // // // //           )}
// // // // //           showsVerticalScrollIndicator={false}
// // // // //         />
// // // // //       </KeyboardAvoidingView>
// // // // //       <BottomNav navigation={navigation} />
// // // // //       <FilterModal
// // // // //         visible={filterVisible}
// // // // //         onClose={() => setFilterVisible(false)}
// // // // //       />
// // // // //     </SafeAreaView>
// // // // //   );
// // // // // }

// // // // // const styles = StyleSheet.create({
// // // // //   container: { flex: 1 },
// // // // //   headerGradient: {
// // // // //     paddingBottom: 30,
// // // // //     borderBottomLeftRadius: 30,
// // // // //     borderBottomRightRadius: 30,
// // // // //   },
// // // // //   headerContent: {
// // // // //     flexDirection: "row",
// // // // //     justifyContent: "space-between",
// // // // //     alignItems: "center",
// // // // //     padding: 20,
// // // // //   },
// // // // //   greeting: { fontSize: 20, fontWeight: "400" },
// // // // //   name: { fontSize: 22, fontWeight: "700" },
// // // // //   avatar: {
// // // // //     width: 50,
// // // // //     height: 50,
// // // // //     borderRadius: 25,
// // // // //     borderWidth: 2,
// // // // //     borderColor: "#fff",
// // // // //   },
// // // // //   searchRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20 },
// // // // //   searchBox: {
// // // // //     flexDirection: "row",
// // // // //     alignItems: "center",
// // // // //     borderRadius: 12,
// // // // //     paddingHorizontal: 12,
// // // // //     flex: 1,
// // // // //     height: 45,
// // // // //     borderWidth: 1,
// // // // //   },
// // // // //   searchInput: { flex: 1, marginLeft: 6, fontSize: 14 },
// // // // //   filterButton: { marginLeft: 10, borderRadius: 12, padding: 10 },
// // // // //   categoryList: { paddingHorizontal: 15, marginTop: 15 },
// // // // //   categoryCard: {
// // // // //     paddingVertical: 12,
// // // // //     paddingHorizontal: 8,
// // // // //     marginRight: 12,
// // // // //     borderRadius: 14,
// // // // //     alignItems: "center",
// // // // //     justifyContent: "center",
// // // // //     minWidth: 80,
// // // // //     borderWidth: 1,
// // // // //     elevation: 3,
// // // // //   },
// // // // //   categoryText: { fontSize: 12, marginTop: 6 },
// // // // //   clearFilterBtn: {
// // // // //     marginTop: 12,
// // // // //     borderRadius: 10,
// // // // //     paddingVertical: 8,
// // // // //     paddingHorizontal: 20,
// // // // //   },
// // // // //   clearFilterText: { color: "#fff", fontWeight: "600" },
// // // // //   filterSummary: { marginTop: 6, fontSize: 13, textAlign: "center" },
// // // // //   emptyContainer: {
// // // // //     justifyContent: "center",
// // // // //     alignItems: "center",
// // // // //     flexGrow: 1,
// // // // //     paddingHorizontal: 30,
// // // // //     marginTop: 50,
// // // // //   },
// // // // //   emptyTitle: { fontSize: 18, fontWeight: "700", marginTop: 10 },
// // // // //   emptySubtitle: { textAlign: "center", marginTop: 8 },
// // // // //   resetBtn: { marginTop: 20, padding: 10, borderRadius: 10 },
// // // // //   resetText: { color: "#fff", fontWeight: "600" },
// // // // // });

// // // // // // import React, { useState, useEffect, useMemo, memo } from "react";
// // // // // // import {
// // // // // //   View,
// // // // // //   StyleSheet,
// // // // // //   TextInput,
// // // // // //   TouchableOpacity,
// // // // // //   FlatList,
// // // // // //   Image,
// // // // // //   KeyboardAvoidingView,
// // // // // //   Platform,
// // // // // // } from "react-native";
// // // // // // import * as Animatable from "react-native-animatable";
// // // // // // import { SafeAreaView } from "react-native-safe-area-context";
// // // // // // import { useTheme } from "@react-navigation/native";
// // // // // // import AsyncStorage from "@react-native-async-storage/async-storage";
// // // // // // import LinearGradient from "react-native-linear-gradient";
// // // // // // import GlobalText from "../../theme/GlobalText";
// // // // // // import {
// // // // // //   Search,
// // // // // //   SlidersHorizontal,
// // // // // //   Frown,
// // // // // //   Building,
// // // // // //   Building2,
// // // // // //   MapPin,
// // // // // //   LandPlot,
// // // // // //   WarehouseIcon,
// // // // // //   Factory,
// // // // // //   Home,
// // // // // //   HousePlus,
// // // // // // } from "lucide-react-native";
// // // // // // import BottomNav from "../../components/ReusableComponents/BottomNav";
// // // // // // import FilterModal from "../../components/ReusableComponents/FilterModal";
// // // // // // import AnimatedBackground from "../../components/ReusableComponents/AnimatedBackground";
// // // // // // import PropertyCard from "../../components/ReusableComponents/PropertyCard";
// // // // // // import {
// // // // // //   getProperties,
// // // // // //   getUserProfile,
// // // // // //   saveProperty,
// // // // // //   unsaveProperty,
// // // // // // } from "../../api/api";
// // // // // // import propertyTypes from "../../constants/propertyTypes";

// // // // // // const iconMap = {
// // // // // //   House: HousePlus,
// // // // // //   Apartment: Building2,
// // // // // //   Office: Building,
// // // // // //   Land: MapPin,
// // // // // //   Sites: LandPlot,
// // // // // //   Godown: WarehouseIcon,
// // // // // //   Factory: Factory,
// // // // // // };

// // // // // // // ✅ Memoized Header
// // // // // // const Header = memo(
// // // // // //   ({
// // // // // //     userName,
// // // // // //     searchText,
// // // // // //     setSearchText,
// // // // // //     selectedCategory,
// // // // // //     setSelectedCategory,
// // // // // //     setFilterVisible,
// // // // // //   }) => (
// // // // // //     <LinearGradient colors={["#43C6AC", "#20A68B"]} style={styles.headerGradient}>
// // // // // //       {/* Greeting */}
// // // // // //       <View style={styles.headerContent}>
// // // // // //         <View>
// // // // // //           <GlobalText style={styles.greeting}>Welcome👋</GlobalText>
// // // // // //           <GlobalText style={styles.name}>{userName}</GlobalText>
// // // // // //         </View>
// // // // // //         <Image
// // // // // //           source={{ uri: "https://randomuser.me/api/portraits/men/75.jpg" }}
// // // // // //           style={styles.avatar}
// // // // // //         />
// // // // // //       </View>

// // // // // //       {/* 🔍 Search */}
// // // // // //       <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
// // // // // //         <View style={styles.searchRow}>
// // // // // //           <View style={styles.searchBox}>
// // // // // //             <Search size={20} color="#555" />
// // // // // //             <TextInput
// // // // // //               placeholder="Search properties..."
// // // // // //               placeholderTextColor="#aaa"
// // // // // //               style={styles.searchInput}
// // // // // //               value={searchText}
// // // // // //               onChangeText={setSearchText}
// // // // // //             />
// // // // // //           </View>
// // // // // //           <TouchableOpacity
// // // // // //             style={styles.filterButton}
// // // // // //             onPress={() => setFilterVisible(true)}
// // // // // //           >
// // // // // //             <SlidersHorizontal size={22} color="#fff" />
// // // // // //           </TouchableOpacity>
// // // // // //         </View>
// // // // // //       </KeyboardAvoidingView>

// // // // // //       {/* 🏠 Categories */}
// // // // // //       <FlatList
// // // // // //         horizontal
// // // // // //         showsHorizontalScrollIndicator={false}
// // // // // //         data={propertyTypes}
// // // // // //         keyExtractor={(item) => item.id.toString()}
// // // // // //         contentContainerStyle={styles.categoryList}
// // // // // //         renderItem={({ item }) => {
// // // // // //           const IconComponent = iconMap[item.name];
// // // // // //           const isActive = selectedCategory === item.name;
// // // // // //           return (
// // // // // //             <TouchableOpacity
// // // // // //               onPress={() => setSelectedCategory(isActive ? null : item.name)}
// // // // // //               activeOpacity={0.8}
// // // // // //             >
// // // // // //               <Animatable.View
// // // // // //                 animation="fadeInUp"
// // // // // //                 duration={600}
// // // // // //                 style={[
// // // // // //                   styles.categoryCard,
// // // // // //                   { backgroundColor: isActive ? "#20A68B" : "#fff" },
// // // // // //                 ]}
// // // // // //               >
// // // // // //                 {IconComponent && (
// // // // // //                   <IconComponent
// // // // // //                     size={26}
// // // // // //                     color={isActive ? "#fff" : "#43C6AC"}
// // // // // //                     strokeWidth={2}
// // // // // //                   />
// // // // // //                 )}
// // // // // //                 <GlobalText
// // // // // //                   numberOfLines={1}
// // // // // //                   style={[
// // // // // //                     styles.categoryText,
// // // // // //                     { color: isActive ? "#fff" : "#333" },
// // // // // //                   ]}
// // // // // //                 >
// // // // // //                   {item.name}
// // // // // //                 </GlobalText>
// // // // // //               </Animatable.View>
// // // // // //             </TouchableOpacity>
// // // // // //           );
// // // // // //         }}
// // // // // //       />

// // // // // //       {/* 🧹 Clear Filter + Info */}
// // // // // //       {selectedCategory && (
// // // // // //         <View style={{ alignItems: "center", marginTop: 8 }}>
// // // // // //           <TouchableOpacity
// // // // // //             style={styles.clearFilterBtn}
// // // // // //             onPress={() => setSelectedCategory(null)}
// // // // // //           >
// // // // // //             <GlobalText style={styles.clearFilterText}>Clear Filter</GlobalText>
// // // // // //           </TouchableOpacity>
// // // // // //           <GlobalText style={styles.filterSummary}>
// // // // // //             Showing results for {selectedCategory} properties — enjoy browsing!
// // // // // //           </GlobalText>
// // // // // //         </View>
// // // // // //       )}
// // // // // //     </LinearGradient>
// // // // // //   )
// // // // // // );

// // // // // // export default function HomeScreen({ navigation }) {
// // // // // //   const [filterVisible, setFilterVisible] = useState(false);
// // // // // //   const [properties, setProperties] = useState([]);
// // // // // //   const [loading, setLoading] = useState(true);
// // // // // //   const [userName, setUserName] = useState("User");
// // // // // //   const [selectedCategory, setSelectedCategory] = useState(null);
// // // // // //   const [searchText, setSearchText] = useState("");

// // // // // //   const filteredProperties = useMemo(() => {
// // // // // //     return properties.filter((p) => {
// // // // // //       const matchesCategory = selectedCategory
// // // // // //         ? p.category?.toLowerCase().trim() ===
// // // // // //           selectedCategory.toLowerCase().trim()
// // // // // //         : true;
// // // // // //       const matchesSearch = searchText
// // // // // //         ? p.title?.toLowerCase().includes(searchText.toLowerCase()) ||
// // // // // //           p.location?.toLowerCase().includes(searchText.toLowerCase()) ||
// // // // // //           p.price?.toString().includes(searchText)
// // // // // //         : true;
// // // // // //       return matchesCategory && matchesSearch;
// // // // // //     });
// // // // // //   }, [properties, selectedCategory, searchText]);

// // // // // //   useEffect(() => {
// // // // // //     const load = async () => {
// // // // // //       try {
// // // // // //         const cached = await AsyncStorage.getItem("properties");
// // // // // //         if (cached) setProperties(JSON.parse(cached));

// // // // // //         const data = await getProperties();
// // // // // //         setProperties(data);
// // // // // //         await AsyncStorage.setItem("properties", JSON.stringify(data));

// // // // // //         const user = await getUserProfile();
// // // // // //         setUserName(user?.name || "User");
// // // // // //       } catch (err) {
// // // // // //         console.error("Home load error:", err.message);
// // // // // //       } finally {
// // // // // //         setLoading(false);
// // // // // //       }
// // // // // //     };
// // // // // //     load();
// // // // // //   }, []);

// // // // // //   const EmptyCategory = () => (
// // // // // //     <Animatable.View animation="fadeInUp" duration={700} style={styles.emptyContainer}>
// // // // // //       <Frown size={80} color="#20A68B" strokeWidth={1.5} />
// // // // // //       <GlobalText style={styles.emptyTitle}>No Properties Found</GlobalText>
// // // // // //       <GlobalText style={styles.emptySubtitle}>
// // // // // //         There are currently no {selectedCategory?.toLowerCase()} listings available.
// // // // // //         Please try again later or explore another category.
// // // // // //       </GlobalText>
// // // // // //       <TouchableOpacity
// // // // // //         style={styles.resetBtn}
// // // // // //         onPress={() => setSelectedCategory(null)}
// // // // // //       >
// // // // // //         <GlobalText style={styles.resetText}>Explore All Properties</GlobalText>
// // // // // //       </TouchableOpacity>
// // // // // //     </Animatable.View>
// // // // // //   );

// // // // // //   return (
// // // // // //     <SafeAreaView style={styles.container}>
// // // // // //       <AnimatedBackground />
// // // // // //       <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
// // // // // //         <FlatList
// // // // // //           data={filteredProperties}
// // // // // //           keyExtractor={(item) => item._id}
// // // // // //           contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
// // // // // //           keyboardShouldPersistTaps="handled"
// // // // // //           ListHeaderComponent={
// // // // // //             <Header
// // // // // //               userName={userName}
// // // // // //               searchText={searchText}
// // // // // //               setSearchText={setSearchText}
// // // // // //               selectedCategory={selectedCategory}
// // // // // //               setSelectedCategory={setSelectedCategory}
// // // // // //               setFilterVisible={setFilterVisible}
// // // // // //             />
// // // // // //           }
// // // // // //           ListEmptyComponent={!loading && selectedCategory ? <EmptyCategory /> : null}
// // // // // //           renderItem={({ item }) => (
// // // // // //             <PropertyCard
// // // // // //               item={item}
// // // // // //               onPress={() => navigation.navigate("PropertyDetails", { property: item })}
// // // // // //             />
// // // // // //           )}
// // // // // //           showsVerticalScrollIndicator={false}
// // // // // //         />
// // // // // //       </KeyboardAvoidingView>
// // // // // //       <BottomNav navigation={navigation} />
// // // // // //       <FilterModal visible={filterVisible} onClose={() => setFilterVisible(false)} />
// // // // // //     </SafeAreaView>
// // // // // //   );
// // // // // // }

// // // // // // const styles = StyleSheet.create({
// // // // // //   container: { flex: 1, backgroundColor: "#f9f9f9" },
// // // // // //   headerGradient: { paddingBottom: 30, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
// // // // // //   headerContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20 },
// // // // // //   greeting: { fontSize:20,fontWeight: "400",color: "#fff" },
// // // // // //   name: { fontSize: 22, color: "#fff", fontWeight: "700" },
// // // // // //   avatar: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: "#fff" },
// // // // // //   searchRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20 },
// // // // // //   searchBox: {
// // // // // //     flexDirection: "row",
// // // // // //     alignItems: "center",
// // // // // //     backgroundColor: "#fff",
// // // // // //     borderRadius: 12,
// // // // // //     paddingHorizontal: 12,
// // // // // //     flex: 1,
// // // // // //     height: 45,
// // // // // //   },
// // // // // //   searchInput: { flex: 1, marginLeft: 6, fontSize: 14 },
// // // // // //   filterButton: { marginLeft: 10, backgroundColor: "#20A68B", borderRadius: 12, padding: 10 },
// // // // // //   categoryList: { paddingHorizontal: 15, marginTop: 15 },
// // // // // //   categoryCard: {
// // // // // //     paddingVertical: 12,
// // // // // //     paddingHorizontal: 8,
// // // // // //     marginRight: 12,
// // // // // //     borderRadius: 14,
// // // // // //     alignItems: "center",
// // // // // //     justifyContent: "center",
// // // // // //     minWidth: 80,
// // // // // //     elevation: 3,
// // // // // //   },
// // // // // //   categoryText: { fontSize: 12, marginTop: 6 },
// // // // // //   clearFilterBtn: { marginTop: 12, borderRadius: 10, backgroundColor: "#43C6AC", paddingVertical: 8, paddingHorizontal: 20 },
// // // // // //   clearFilterText: { color: "#fff", fontWeight: "600" },
// // // // // //   filterSummary: { marginTop: 6, color: "#EAF8F5", fontSize: 13, textAlign: "center" },
// // // // // //   emptyContainer: { justifyContent: "center", alignItems: "center", flexGrow: 1, paddingHorizontal: 30,marginTop: 50 },
// // // // // //   emptyTitle: { fontSize: 18, color: "#20A68B", fontWeight: "700", marginTop: 10 },
// // // // // //   emptySubtitle: { color: "#555", textAlign: "center", marginTop: 8 },
// // // // // //   resetBtn: { marginTop: 20, backgroundColor: "#43C6AC", padding: 10, borderRadius: 10 },
// // // // // //   resetText: { color: "#fff", fontWeight: "600" },
// // // // // // });

// // // // // // import React, { useState, useEffect, useMemo, memo } from "react";
// // // // // // import {
// // // // // //   View,
// // // // // //   StyleSheet,
// // // // // //   TextInput,
// // // // // //   TouchableOpacity,
// // // // // //   FlatList,
// // // // // //   Image,
// // // // // //   KeyboardAvoidingView,
// // // // // //   Platform,
// // // // // // } from "react-native";
// // // // // // import * as Animatable from "react-native-animatable";
// // // // // // import { SafeAreaView } from "react-native-safe-area-context";
// // // // // // import { useTheme } from "@react-navigation/native";
// // // // // // import AsyncStorage from "@react-native-async-storage/async-storage";
// // // // // // import LinearGradient from "react-native-linear-gradient";
// // // // // // import GlobalText from "../../theme/GlobalText";
// // // // // // import {
// // // // // //   Search,
// // // // // //   SlidersHorizontal,
// // // // // //   HousePlus,
// // // // // //   Building2,
// // // // // //   Building,
// // // // // //   MapPin,
// // // // // //   LandPlot,
// // // // // //   WarehouseIcon,
// // // // // //   Factory,
// // // // // //   Frown,
// // // // // // } from "lucide-react-native";
// // // // // // import BottomNav from "../../components/ReusableComponents/BottomNav";
// // // // // // import FilterModal from "../../components/ReusableComponents/FilterModal";
// // // // // // import AnimatedBackground from "../../components/ReusableComponents/AnimatedBackground";
// // // // // // import PropertyCard from "../../components/ReusableComponents/PropertyCard";
// // // // // // import {
// // // // // //   getProperties,
// // // // // //   getUserProfile,
// // // // // //   saveProperty,
// // // // // //   unsaveProperty,
// // // // // // } from "../../api/api";

// // // // // // const categories = [
// // // // // //   { id: 1, name: "House", icon: HousePlus },
// // // // // //   { id: 2, name: "Apartment", icon: Building2 },
// // // // // //   { id: 3, name: "Office", icon: Building },
// // // // // //   { id: 4, name: "Land", icon: MapPin },
// // // // // //   { id: 5, name: "Sites", icon: LandPlot },
// // // // // //   { id: 6, name: "Godown", icon: WarehouseIcon },
// // // // // //   { id: 7, name: "Factory", icon: Factory },
// // // // // // ];

// // // // // // // 🧩 Header Component (Memoized to prevent re-renders)
// // // // // // const Header = memo(
// // // // // //   ({
// // // // // //     userName,
// // // // // //     searchText,
// // // // // //     setSearchText,
// // // // // //     selectedCategory,
// // // // // //     setSelectedCategory,
// // // // // //     setFilterVisible,
// // // // // //   }) => (
// // // // // //     <LinearGradient colors={["#43C6AC", "#20A68B"]} style={styles.headerGradient}>
// // // // // //       <View style={styles.headerContent}>
// // // // // //         <View>
// // // // // //           <GlobalText style={styles.greeting}>Hello 👋</GlobalText>
// // // // // //           <GlobalText style={styles.name}>{userName}</GlobalText>
// // // // // //         </View>
// // // // // //         <Image
// // // // // //           source={{ uri: "https://randomuser.me/api/portraits/men/75.jpg" }}
// // // // // //           style={styles.avatar}
// // // // // //         />
// // // // // //       </View>

// // // // // //       {/* 🔍 Search Bar */}
// // // // // //       <KeyboardAvoidingView
// // // // // //         behavior={Platform.OS === "ios" ? "padding" : undefined}
// // // // // //       >
// // // // // //         <View style={styles.searchRow}>
// // // // // //           <View style={styles.searchBox}>
// // // // // //             <Search size={20} color="#555" />
// // // // // //             <TextInput
// // // // // //               placeholder="Search properties..."
// // // // // //               placeholderTextColor="#aaa"
// // // // // //               style={styles.searchInput}
// // // // // //               value={searchText}
// // // // // //               onChangeText={setSearchText}
// // // // // //             />
// // // // // //           </View>
// // // // // //           <TouchableOpacity
// // // // // //             style={styles.filterButton}
// // // // // //             onPress={() => setFilterVisible(true)}
// // // // // //           >
// // // // // //             <SlidersHorizontal size={22} color="#fff" />
// // // // // //           </TouchableOpacity>
// // // // // //         </View>
// // // // // //       </KeyboardAvoidingView>

// // // // // //       {/* 🏠 Categories */}
// // // // // //       <FlatList
// // // // // //         horizontal
// // // // // //         showsHorizontalScrollIndicator={false}
// // // // // //         data={categories}
// // // // // //         keyExtractor={(item) => item.id.toString()}
// // // // // //         contentContainerStyle={styles.categoryList}
// // // // // //         renderItem={({ item }) => {
// // // // // //           const IconComponent = item.icon;
// // // // // //           const isActive = selectedCategory === item.name;
// // // // // //           return (
// // // // // //             <TouchableOpacity
// // // // // //               onPress={() =>
// // // // // //                 setSelectedCategory(isActive ? null : item.name)
// // // // // //               }
// // // // // //               activeOpacity={0.8}
// // // // // //             >
// // // // // //               <Animatable.View
// // // // // //                 animation="bounceIn"
// // // // // //                 duration={800}
// // // // // //                 style={[
// // // // // //                   styles.categoryCard,
// // // // // //                   { backgroundColor: isActive ? "#20A68B" : "#fff" },
// // // // // //                 ]}
// // // // // //               >
// // // // // //                 <IconComponent
// // // // // //                   size={26}
// // // // // //                   color={isActive ? "#fff" : "#43C6AC"}
// // // // // //                   strokeWidth={2}
// // // // // //                 />
// // // // // //                 <GlobalText
// // // // // //                   numberOfLines={1}
// // // // // //                   style={[
// // // // // //                     styles.categoryText,
// // // // // //                     { color: isActive ? "#fff" : "#333" },
// // // // // //                   ]}
// // // // // //                 >
// // // // // //                   {item.name}
// // // // // //                 </GlobalText>
// // // // // //               </Animatable.View>
// // // // // //             </TouchableOpacity>
// // // // // //           );
// // // // // //         }}
// // // // // //       />

// // // // // //       {/* 🧹 Clear Filter + Summary */}
// // // // // //       {selectedCategory && (
// // // // // //         <View style={{ alignItems: "center", marginTop: 8 }}>
// // // // // //           <TouchableOpacity
// // // // // //             style={styles.clearFilterBtn}
// // // // // //             onPress={() => setSelectedCategory(null)}
// // // // // //           >
// // // // // //             <GlobalText style={styles.clearFilterText}>Clear Filter</GlobalText>
// // // // // //           </TouchableOpacity>

// // // // // //           <GlobalText style={styles.filterSummary}>
// // // // // //             Showing results for {selectedCategory} properties — enjoy browsing!
// // // // // //           </GlobalText>
// // // // // //         </View>
// // // // // //       )}
// // // // // //     </LinearGradient>
// // // // // //   )
// // // // // // );

// // // // // // export default function HomeScreen({ navigation }) {
// // // // // //   const { colors } = useTheme();
// // // // // //   const [filterVisible, setFilterVisible] = useState(false);
// // // // // //   const [properties, setProperties] = useState([]);
// // // // // //   const [loading, setLoading] = useState(true);
// // // // // //   const [userName, setUserName] = useState("User");
// // // // // //   const [selectedCategory, setSelectedCategory] = useState(null);
// // // // // //   const [searchText, setSearchText] = useState("");

// // // // // //   // 🔍 Filtered list based on category + search
// // // // // //   const filteredProperties = useMemo(() => {
// // // // // //     return properties.filter((p) => {
// // // // // //       const matchesCategory = selectedCategory
// // // // // //         ? p.category?.toLowerCase().trim() ===
// // // // // //           selectedCategory.toLowerCase().trim()
// // // // // //         : true;
// // // // // //       const matchesSearch = searchText
// // // // // //         ? p.title?.toLowerCase().includes(searchText.toLowerCase()) ||
// // // // // //           p.location?.toLowerCase().includes(searchText.toLowerCase()) ||
// // // // // //           p.price?.toString().includes(searchText)
// // // // // //         : true;
// // // // // //       return matchesCategory && matchesSearch;
// // // // // //     });
// // // // // //   }, [properties, selectedCategory, searchText]);

// // // // // //   // 🧠 Data fetching
// // // // // //   useEffect(() => {
// // // // // //     const fetchData = async () => {
// // // // // //       try {
// // // // // //         const cached = await AsyncStorage.getItem("properties");
// // // // // //         if (cached) setProperties(JSON.parse(cached));
// // // // // //         const data = await getProperties();
// // // // // //         setProperties(data);
// // // // // //         await AsyncStorage.setItem("properties", JSON.stringify(data));
// // // // // //       } catch (err) {
// // // // // //         console.error("Error fetching properties:", err.message);
// // // // // //       } finally {
// // // // // //         setLoading(false);
// // // // // //       }
// // // // // //     };

// // // // // //     const fetchUser = async () => {
// // // // // //       try {
// // // // // //         const data = await getUserProfile();
// // // // // //         setUserName(data?.name || "User");
// // // // // //         await AsyncStorage.setItem("user", JSON.stringify(data));
// // // // // //       } catch {
// // // // // //         const stored = await AsyncStorage.getItem("user");
// // // // // //         if (stored) {
// // // // // //           const parsed = JSON.parse(stored);
// // // // // //           setUserName(parsed?.name || "User");
// // // // // //         }
// // // // // //       }
// // // // // //     };

// // // // // //     fetchData();
// // // // // //     fetchUser();
// // // // // //   }, []);

// // // // // //   const handleToggleSave = async (property, save) => {
// // // // // //     try {
// // // // // //       const propertyId = property._id;
// // // // // //       if (!propertyId) throw new Error("Missing property ID");
// // // // // //       if (save) await saveProperty(propertyId);
// // // // // //       else await unsaveProperty(propertyId);
// // // // // //     } catch (err) {
// // // // // //       console.error("Save toggle failed:", err);
// // // // // //     }
// // // // // //   };

// // // // // //   const EmptyCategory = () => (
// // // // // //     <Animatable.View
// // // // // //       animation="fadeInUp"
// // // // // //       duration={700}
// // // // // //       style={styles.emptyContainer}
// // // // // //     >
// // // // // //       <Frown size={80} color="#20A68B" strokeWidth={1.5} />
// // // // // //       <GlobalText style={styles.emptyTitle}>No Properties Available</GlobalText>
// // // // // //       <GlobalText style={styles.emptySubtitle}>
// // // // // //         There are currently no {selectedCategory?.toLowerCase()} listings
// // // // // //         available.  
// // // // // //         Please check again later or explore other categories.
// // // // // //       </GlobalText>
// // // // // //       <TouchableOpacity
// // // // // //         style={styles.resetBtn}
// // // // // //         onPress={() => setSelectedCategory(null)}
// // // // // //       >
// // // // // //         <GlobalText style={styles.resetText}>Explore All Properties</GlobalText>
// // // // // //       </TouchableOpacity>
// // // // // //     </Animatable.View>
// // // // // //   );

// // // // // //   return (
// // // // // //     <SafeAreaView style={styles.container}>
// // // // // //       <AnimatedBackground />

// // // // // //       <KeyboardAvoidingView
// // // // // //         behavior={Platform.OS === "ios" ? "padding" : "height"}
// // // // // //         style={{ flex: 1 }}
// // // // // //       >
// // // // // //         <FlatList
// // // // // //           data={filteredProperties}
// // // // // //           keyExtractor={(item) => item._id}
// // // // // //           contentContainerStyle={{
// // // // // //             paddingBottom: 100,
// // // // // //             flexGrow: 1,
// // // // // //           }}
// // // // // //           keyboardShouldPersistTaps="handled"
// // // // // //           ListHeaderComponent={
// // // // // //             <Header
// // // // // //               userName={userName}
// // // // // //               searchText={searchText}
// // // // // //               setSearchText={setSearchText}
// // // // // //               selectedCategory={selectedCategory}
// // // // // //               setSelectedCategory={setSelectedCategory}
// // // // // //               setFilterVisible={setFilterVisible}
// // // // // //             />
// // // // // //           }
// // // // // //           ListEmptyComponent={
// // // // // //             !loading && selectedCategory ? <EmptyCategory /> : null
// // // // // //           }
// // // // // //           renderItem={({ item }) => (
// // // // // //             <PropertyCard
// // // // // //               item={item}
// // // // // //               onPress={() =>
// // // // // //                 navigation.navigate("PropertyDetails", { property: item })
// // // // // //               }
// // // // // //               onToggleSave={handleToggleSave}
// // // // // //             />
// // // // // //           )}
// // // // // //           showsVerticalScrollIndicator={false}
// // // // // //         />
// // // // // //       </KeyboardAvoidingView>

// // // // // //       <BottomNav navigation={navigation} />
// // // // // //       <FilterModal
// // // // // //         visible={filterVisible}
// // // // // //         onClose={() => setFilterVisible(false)}
// // // // // //       />
// // // // // //     </SafeAreaView>
// // // // // //   );
// // // // // // }

// // // // // // const styles = StyleSheet.create({
// // // // // //   container: { flex: 1, backgroundColor: "#f9f9f9" },
// // // // // //   headerGradient: {
// // // // // //     paddingBottom: 30,
// // // // // //     borderBottomLeftRadius: 30,
// // // // // //     borderBottomRightRadius: 30,
// // // // // //     overflow: "hidden",
// // // // // //   },
// // // // // //   filterSummary: {
// // // // // //     marginTop: 6,
// // // // // //     color: "#EAF8F5",
// // // // // //     fontSize: 13,
// // // // // //     fontWeight: "500",
// // // // // //     textAlign: "center",
// // // // // //     opacity: 0.9,
// // // // // //   },
// // // // // //   headerContent: {
// // // // // //     flexDirection: "row",
// // // // // //     justifyContent: "space-between",
// // // // // //     alignItems: "center",
// // // // // //     padding: 20,
// // // // // //   },
// // // // // //   greeting: { fontSize: 16, color: "#fff", fontWeight: "400" },
// // // // // //   name: { fontSize: 22, fontWeight: "700", color: "#fff" },
// // // // // //   avatar: {
// // // // // //     width: 45,
// // // // // //     height: 45,
// // // // // //     borderRadius: 25,
// // // // // //     borderWidth: 2,
// // // // // //     borderColor: "#fff",
// // // // // //   },
// // // // // //   searchRow: {
// // // // // //     flexDirection: "row",
// // // // // //     alignItems: "center",
// // // // // //     paddingHorizontal: 20,
// // // // // //     marginTop: 10,
// // // // // //   },
// // // // // //   searchBox: {
// // // // // //     flexDirection: "row",
// // // // // //     alignItems: "center",
// // // // // //     backgroundColor: "#fff",
// // // // // //     borderRadius: 12,
// // // // // //     paddingHorizontal: 12,
// // // // // //     flex: 1,
// // // // // //     height: 45,
// // // // // //     shadowColor: "#000",
// // // // // //     shadowOpacity: 0.1,
// // // // // //     shadowRadius: 4,
// // // // // //     elevation: 3,
// // // // // //   },
// // // // // //   searchInput: { flex: 1, marginLeft: 6, fontSize: 14 },
// // // // // //   filterButton: {
// // // // // //     marginLeft: 10,
// // // // // //     backgroundColor: "#20A68B",
// // // // // //     borderRadius: 12,
// // // // // //     padding: 10,
// // // // // //     elevation: 4,
// // // // // //   },
// // // // // //   categoryList: { paddingHorizontal: 15, marginTop: 15 },
// // // // // //   categoryCard: {
// // // // // //     paddingVertical: 12,
// // // // // //     paddingHorizontal: 8,
// // // // // //     marginRight: 12,
// // // // // //     borderRadius: 14,
// // // // // //     alignItems: "center",
// // // // // //     justifyContent: "center",
// // // // // //     minWidth: 80,
// // // // // //     maxWidth: 90,
// // // // // //     elevation: 3,
// // // // // //     shadowColor: "#43C6AC",
// // // // // //     shadowOpacity: 0.25,
// // // // // //     shadowRadius: 5,
// // // // // //     shadowOffset: { width: 0, height: 3 },
// // // // // //   },
// // // // // //   categoryText: {
// // // // // //     fontSize: 12,
// // // // // //     marginTop: 6,
// // // // // //     textAlign: "center",
// // // // // //     includeFontPadding: false,
// // // // // //   },
// // // // // //   clearFilterBtn: {
// // // // // //     marginTop: 12,
// // // // // //     borderRadius: 10,
// // // // // //     backgroundColor: "#43C6AC",
// // // // // //     alignItems: "center",
// // // // // //     paddingVertical: 8,
// // // // // //     paddingHorizontal: 20,
// // // // // //   },
// // // // // //   clearFilterText: {
// // // // // //     color: "#fff",
// // // // // //     fontSize: 14,
// // // // // //     fontWeight: "600",
// // // // // //   },
// // // // // //   emptyContainer: {
// // // // // //     justifyContent: "center",
// // // // // //     alignItems: "center",
// // // // // //     flexGrow: 1,
// // // // // //     paddingHorizontal: 30,
// // // // // //   },
// // // // // //   emptyTitle: {
// // // // // //     fontSize: 18,
// // // // // //     color: "#20A68B",
// // // // // //     fontWeight: "700",
// // // // // //     marginTop: 15,
// // // // // //   },
// // // // // //   emptySubtitle: {
// // // // // //     color: "#555",
// // // // // //     textAlign: "center",
// // // // // //     fontSize: 13,
// // // // // //     marginTop: 8,
// // // // // //     lineHeight: 18,
// // // // // //   },
// // // // // //   resetBtn: {
// // // // // //     marginTop: 20,
// // // // // //     backgroundColor: "#43C6AC",
// // // // // //     paddingHorizontal: 18,
// // // // // //     paddingVertical: 10,
// // // // // //     borderRadius: 10,
// // // // // //     elevation: 3,
// // // // // //   },
// // // // // //   resetText: { color: "#fff", fontWeight: "600", fontSize: 14 },
// // // // // // });

// // // // // // // import React, { useState, useEffect, useMemo } from "react";
// // // // // // // import {
// // // // // // //   View,
// // // // // // //   StyleSheet,
// // // // // // //   TextInput,
// // // // // // //   TouchableOpacity,
// // // // // // //   FlatList,
// // // // // // //   Image,
// // // // // // //   KeyboardAvoidingView,
// // // // // // //   Platform,
// // // // // // // } from "react-native";
// // // // // // // import * as Animatable from "react-native-animatable";
// // // // // // // import { SafeAreaView } from "react-native-safe-area-context";
// // // // // // // import { useTheme } from "@react-navigation/native";
// // // // // // // import AsyncStorage from "@react-native-async-storage/async-storage";
// // // // // // // import LinearGradient from "react-native-linear-gradient";
// // // // // // // import GlobalText from "../../theme/GlobalText";
// // // // // // // import {
// // // // // // //   Home,
// // // // // // //   Building2,
// // // // // // //   Building,
// // // // // // //   MapPin,
// // // // // // //   Search,
// // // // // // //   SlidersHorizontal,
// // // // // // //   HousePlus,
// // // // // // //   LandPlot,
// // // // // // //   WarehouseIcon,
// // // // // // //   Factory,
// // // // // // //   Frown,
// // // // // // // } from "lucide-react-native";
// // // // // // // import BottomNav from "../../components/ReusableComponents/BottomNav";
// // // // // // // import FilterModal from "../../components/ReusableComponents/FilterModal";
// // // // // // // import AnimatedBackground from "../../components/ReusableComponents/AnimatedBackground";
// // // // // // // import PropertyCard from "../../components/ReusableComponents/PropertyCard";
// // // // // // // import {
// // // // // // //   getProperties,
// // // // // // //   getUserProfile,
// // // // // // //   saveProperty,
// // // // // // //   unsaveProperty,
// // // // // // // } from "../../api/api";

// // // // // // // const categories = [
// // // // // // //   { id: 1, name: "House", icon: HousePlus },
// // // // // // //   { id: 2, name: "Apartment", icon: Building2 },
// // // // // // //   { id: 3, name: "Office", icon: Building },
// // // // // // //   { id: 4, name: "Land", icon: MapPin },
// // // // // // //   { id: 5, name: "Sites", icon: LandPlot },
// // // // // // //   { id: 6, name: "Godown", icon: WarehouseIcon },
// // // // // // //   { id: 7, name: "Factory", icon: Factory },
// // // // // // // ];

// // // // // // // export default function HomeScreen({ navigation }) {
// // // // // // //   const { colors } = useTheme();
// // // // // // //   const [filterVisible, setFilterVisible] = useState(false);
// // // // // // //   const [properties, setProperties] = useState([]);
// // // // // // //   const [loading, setLoading] = useState(true);
// // // // // // //   const [userName, setUserName] = useState("User");
// // // // // // //   const [selectedCategory, setSelectedCategory] = useState(null);
// // // // // // //   const [searchText, setSearchText] = useState("");

// // // // // // //   // 🔍 Filtered list based on category + search
// // // // // // //   const filteredProperties = useMemo(() => {
// // // // // // //     return properties.filter((p) => {
// // // // // // //       const matchesCategory = selectedCategory
// // // // // // //         ? p.category?.toLowerCase().trim() ===
// // // // // // //           selectedCategory.toLowerCase().trim()
// // // // // // //         : true;
// // // // // // //       const matchesSearch = searchText
// // // // // // //         ? p.title?.toLowerCase().includes(searchText.toLowerCase()) ||
// // // // // // //           p.location?.toLowerCase().includes(searchText.toLowerCase()) ||
// // // // // // //           p.price?.toString().includes(searchText)
// // // // // // //         : true;
// // // // // // //       return matchesCategory && matchesSearch;
// // // // // // //     });
// // // // // // //   }, [properties, selectedCategory, searchText]);

// // // // // // //   const handleToggleSave = async (property, save) => {
// // // // // // //     try {
// // // // // // //       const propertyId = property._id;
// // // // // // //       if (!propertyId) throw new Error("Missing property ID");
// // // // // // //       if (save) await saveProperty(propertyId);
// // // // // // //       else await unsaveProperty(propertyId);
// // // // // // //     } catch (err) {
// // // // // // //       console.error("Save toggle failed:", err);
// // // // // // //     }
// // // // // // //   };

// // // // // // //   // 🧠 Fetch user and property data
// // // // // // //   useEffect(() => {
// // // // // // //     const fetchData = async () => {
// // // // // // //       try {
// // // // // // //         const cached = await AsyncStorage.getItem("properties");
// // // // // // //         if (cached) setProperties(JSON.parse(cached));

// // // // // // //         const data = await getProperties();
// // // // // // //         setProperties(data);
// // // // // // //         await AsyncStorage.setItem("properties", JSON.stringify(data));
// // // // // // //       } catch (err) {
// // // // // // //         console.error("Error fetching properties:", err.message);
// // // // // // //       } finally {
// // // // // // //         setLoading(false);
// // // // // // //       }
// // // // // // //     };

// // // // // // //     const fetchUser = async () => {
// // // // // // //       try {
// // // // // // //         const data = await getUserProfile();
// // // // // // //         setUserName(data?.name || "User");
// // // // // // //         await AsyncStorage.setItem("user", JSON.stringify(data));
// // // // // // //       } catch {
// // // // // // //         const stored = await AsyncStorage.getItem("user");
// // // // // // //         if (stored) {
// // // // // // //           const parsed = JSON.parse(stored);
// // // // // // //           setUserName(parsed?.name || "User");
// // // // // // //         }
// // // // // // //       }
// // // // // // //     };

// // // // // // //     fetchData();
// // // // // // //     fetchUser();
// // // // // // //   }, []);

// // // // // // //   // 🧩 Header Component
// // // // // // //   const Header = () => (
// // // // // // //     <LinearGradient colors={["#43C6AC", "#20A68B"]} style={styles.headerGradient}>
// // // // // // //       <View style={styles.headerContent}>
// // // // // // //         <View>
// // // // // // //           <GlobalText style={styles.greeting}>Hello 👋</GlobalText>
// // // // // // //           <GlobalText style={styles.name}>{userName}</GlobalText>
// // // // // // //         </View>
// // // // // // //         <Image
// // // // // // //           source={{
// // // // // // //             uri: "https://randomuser.me/api/portraits/men/75.jpg",
// // // // // // //           }}
// // // // // // //           style={styles.avatar}
// // // // // // //         />
// // // // // // //       </View>

// // // // // // //       {/* 🔍 Search Bar */}
// // // // // // //       <KeyboardAvoidingView
// // // // // // //         behavior={Platform.OS === "ios" ? "padding" : undefined}
// // // // // // //       >
// // // // // // //         <View style={styles.searchRow}>
// // // // // // //           <View style={styles.searchBox}>
// // // // // // //             <Search size={20} color="#555" />
// // // // // // //             <TextInput
// // // // // // //               placeholder="Search properties..."
// // // // // // //               placeholderTextColor="#aaa"
// // // // // // //               style={styles.searchInput}
// // // // // // //               value={searchText}
// // // // // // //               onChangeText={setSearchText}
// // // // // // //             />
// // // // // // //           </View>
// // // // // // //           <TouchableOpacity
// // // // // // //             style={styles.filterButton}
// // // // // // //             onPress={() => setFilterVisible(true)}
// // // // // // //           >
// // // // // // //             <SlidersHorizontal size={22} color="#fff" />
// // // // // // //           </TouchableOpacity>
// // // // // // //         </View>
// // // // // // //       </KeyboardAvoidingView>

// // // // // // //       {/* 🏠 Categories */}
// // // // // // //       <FlatList
// // // // // // //         horizontal
// // // // // // //         showsHorizontalScrollIndicator={false}
// // // // // // //         data={categories}
// // // // // // //         keyExtractor={(item) => item.id.toString()}
// // // // // // //         contentContainerStyle={styles.categoryList}
// // // // // // //         renderItem={({ item }) => {
// // // // // // //           const IconComponent = item.icon;
// // // // // // //           const isActive = selectedCategory === item.name;
// // // // // // //           return (
// // // // // // //             <TouchableOpacity
// // // // // // //               onPress={() =>
// // // // // // //                 setSelectedCategory(isActive ? null : item.name)
// // // // // // //               }
// // // // // // //               activeOpacity={0.8}
// // // // // // //             >
// // // // // // //               <Animatable.View
// // // // // // //                 animation="bounceIn"
// // // // // // //                 duration={800}
// // // // // // //                 style={[
// // // // // // //                   styles.categoryCard,
// // // // // // //                   { backgroundColor: isActive ? "#20A68B" : "#fff" },
// // // // // // //                 ]}
// // // // // // //               >
// // // // // // //                 <IconComponent
// // // // // // //                   size={26}
// // // // // // //                   color={isActive ? "#fff" : "#43C6AC"}
// // // // // // //                   strokeWidth={2}
// // // // // // //                 />
// // // // // // //                 <GlobalText
// // // // // // //                   numberOfLines={1}
// // // // // // //                   style={[
// // // // // // //                     styles.categoryText,
// // // // // // //                     { color: isActive ? "#fff" : "#333" },
// // // // // // //                   ]}
// // // // // // //                 >
// // // // // // //                   {item.name}
// // // // // // //                 </GlobalText>
// // // // // // //               </Animatable.View>
// // // // // // //             </TouchableOpacity>
// // // // // // //           );
// // // // // // //         }}
// // // // // // //       />

// // // // // // //       {/* 🧹 Clear Filter */}
// // // // // // //     {selectedCategory && (
// // // // // // //   <View style={{ alignItems: "center", marginTop: 8 }}>
// // // // // // //     {/* Clear Filter Button */}
// // // // // // //     <TouchableOpacity
// // // // // // //       style={styles.clearFilterBtn}
// // // // // // //       onPress={() => setSelectedCategory(null)}
// // // // // // //     >
// // // // // // //       <GlobalText style={styles.clearFilterText}>Clear Filter</GlobalText>
// // // // // // //     </TouchableOpacity>

// // // // // // //     {/* 👇 Filter Summary Line */}
// // // // // // //     <GlobalText style={styles.filterSummary}>
// // // // // // //       Showing results for {selectedCategory} properties — enjoy browsing!
// // // // // // //     </GlobalText>
// // // // // // //   </View>
// // // // // // // )}
// // // // // // //     </LinearGradient>
// // // // // // //   );

// // // // // // //   // ❌ Empty Category UI
// // // // // // //   const EmptyCategory = () => (
// // // // // // //     <Animatable.View
// // // // // // //       animation="fadeInUp"
// // // // // // //       duration={700}
// // // // // // //       style={styles.emptyContainer}
// // // // // // //     >
// // // // // // //       <Frown size={80} color="#20A68B" strokeWidth={1.5} />
// // // // // // //       <GlobalText style={styles.emptyTitle}>No Properties Available</GlobalText>
// // // // // // //       <GlobalText style={styles.emptySubtitle}>
// // // // // // //         There are currently no {selectedCategory?.toLowerCase()} listings
// // // // // // //         available.  
// // // // // // //         Please check again later or try exploring other categories.
// // // // // // //       </GlobalText>
// // // // // // //       <TouchableOpacity
// // // // // // //         style={styles.resetBtn}
// // // // // // //         onPress={() => setSelectedCategory(null)}
// // // // // // //       >
// // // // // // //         <GlobalText style={styles.resetText}>Explore All Properties</GlobalText>
// // // // // // //       </TouchableOpacity>
// // // // // // //     </Animatable.View>
// // // // // // //   );

// // // // // // //   return (
// // // // // // //     <SafeAreaView style={styles.container}>
// // // // // // //       <AnimatedBackground />

// // // // // // //       {/* 🏠 Property List */}
// // // // // // //       <FlatList
// // // // // // //         data={filteredProperties}
// // // // // // //         keyExtractor={(item) => item._id}
// // // // // // //         contentContainerStyle={{
// // // // // // //           paddingBottom: 100,
// // // // // // //           flexGrow: 1,
// // // // // // //         }}
// // // // // // //         ListHeaderComponent={<Header />}
// // // // // // //         ListEmptyComponent={
// // // // // // //           !loading && selectedCategory ? <EmptyCategory /> : null
// // // // // // //         }
// // // // // // //         renderItem={({ item }) => (
// // // // // // //           <PropertyCard
// // // // // // //             item={item}
// // // // // // //             onPress={() =>
// // // // // // //               navigation.navigate("PropertyDetails", { property: item })
// // // // // // //             }
// // // // // // //             onToggleSave={handleToggleSave}
// // // // // // //           />
// // // // // // //         )}
// // // // // // //         showsVerticalScrollIndicator={false}
// // // // // // //       />

// // // // // // //       {/* Bottom Navigation & Filter Modal */}
// // // // // // //       <BottomNav navigation={navigation} />
// // // // // // //       <FilterModal
// // // // // // //         visible={filterVisible}
// // // // // // //         onClose={() => setFilterVisible(false)}
// // // // // // //       />
// // // // // // //     </SafeAreaView>
// // // // // // //   );
// // // // // // // }

// // // // // // // const styles = StyleSheet.create({
// // // // // // //   container: { flex: 1, backgroundColor: "#f9f9f9" },
// // // // // // //   headerGradient: {
// // // // // // //     paddingBottom: 30,
// // // // // // //     borderBottomLeftRadius: 30,
// // // // // // //     borderBottomRightRadius: 30,
// // // // // // //     overflow: "hidden",
// // // // // // //   },
// // // // // // //   filterSummary: {
// // // // // // //   marginTop: 6,
// // // // // // //   color: "#EAF8F5",
// // // // // // //   fontSize: 13,
// // // // // // //   fontWeight: "500",
// // // // // // //   textAlign: "center",
// // // // // // //   opacity: 0.9,
// // // // // // // },
// // // // // // //   headerContent: {
// // // // // // //     flexDirection: "row",
// // // // // // //     justifyContent: "space-between",
// // // // // // //     alignItems: "center",
// // // // // // //     padding: 20,
// // // // // // //   },
// // // // // // //   greeting: { fontSize: 16, color: "#fff", fontWeight: "400" },
// // // // // // //   name: { fontSize: 22, fontWeight: "700", color: "#fff" },
// // // // // // //   avatar: {
// // // // // // //     width: 45,
// // // // // // //     height: 45,
// // // // // // //     borderRadius: 25,
// // // // // // //     borderWidth: 2,
// // // // // // //     borderColor: "#fff",
// // // // // // //   },
// // // // // // //   searchRow: {
// // // // // // //     flexDirection: "row",
// // // // // // //     alignItems: "center",
// // // // // // //     paddingHorizontal: 20,
// // // // // // //     marginTop: 10,
// // // // // // //   },
// // // // // // //   searchBox: {
// // // // // // //     flexDirection: "row",
// // // // // // //     alignItems: "center",
// // // // // // //     backgroundColor: "#fff",
// // // // // // //     borderRadius: 12,
// // // // // // //     paddingHorizontal: 12,
// // // // // // //     flex: 1,
// // // // // // //     height: 45,
// // // // // // //     shadowColor: "#000",
// // // // // // //     shadowOpacity: 0.1,
// // // // // // //     shadowRadius: 4,
// // // // // // //     elevation: 3,
// // // // // // //   },
// // // // // // //   searchInput: { flex: 1, marginLeft: 6, fontSize: 14 },
// // // // // // //   filterButton: {
// // // // // // //     marginLeft: 10,
// // // // // // //     backgroundColor: "#20A68B",
// // // // // // //     borderRadius: 12,
// // // // // // //     padding: 10,
// // // // // // //     elevation: 4,
// // // // // // //   },
// // // // // // //   categoryList: { paddingHorizontal: 15, marginTop: 15 },
// // // // // // //   categoryCard: {
// // // // // // //     paddingVertical: 12,
// // // // // // //     paddingHorizontal: 8,
// // // // // // //     marginRight: 12,
// // // // // // //     borderRadius: 14,
// // // // // // //     alignItems: "center",
// // // // // // //     justifyContent: "center",
// // // // // // //     minWidth: 80,
// // // // // // //     maxWidth: 90,
// // // // // // //     elevation: 3,
// // // // // // //     shadowColor: "#43C6AC",
// // // // // // //     shadowOpacity: 0.25,
// // // // // // //     shadowRadius: 5,
// // // // // // //     shadowOffset: { width: 0, height: 3 },
// // // // // // //   },
// // // // // // //   categoryText: {
// // // // // // //     fontSize: 12,
// // // // // // //     marginTop: 6,
// // // // // // //     textAlign: "center",
// // // // // // //     includeFontPadding: false,
// // // // // // //   },
// // // // // // //   clearFilterBtn: {
// // // // // // //     marginTop: 12,
// // // // // // //     marginHorizontal: 20,
// // // // // // //     paddingVertical: 10,
// // // // // // //     borderRadius: 10,
// // // // // // //     backgroundColor: "#43C6AC",
// // // // // // //     alignItems: "center",
// // // // // // //     width: 400,
// // // // // // //   },
// // // // // // //   clearFilterText: {
// // // // // // //     color: "#fff",
// // // // // // //     fontSize: 14,
// // // // // // //     fontWeight: "600",
// // // // // // //   },
// // // // // // //   emptyContainer: {
// // // // // // //     justifyContent: "center",
// // // // // // //     alignItems: "center",
// // // // // // //     flexGrow: 1,
// // // // // // //     paddingHorizontal: 30,
// // // // // // //   },
// // // // // // //   emptyTitle: {
// // // // // // //     fontSize: 18,
// // // // // // //     color: "#20A68B",
// // // // // // //     fontWeight: "700",
// // // // // // //     marginTop: 15,
// // // // // // //   },
// // // // // // //   emptySubtitle: {
// // // // // // //     color: "#555",
// // // // // // //     textAlign: "center",
// // // // // // //     fontSize: 13,
// // // // // // //     marginTop: 8,
// // // // // // //     lineHeight: 18,
// // // // // // //   },
// // // // // // //   resetBtn: {
// // // // // // //     marginTop: 20,
// // // // // // //     backgroundColor: "#43C6AC",
// // // // // // //     paddingHorizontal: 18,
// // // // // // //     paddingVertical: 10,
// // // // // // //     borderRadius: 10,
// // // // // // //     elevation: 3,
// // // // // // //   },
// // // // // // //   resetText: { color: "#fff", fontWeight: "600", fontSize: 14 },
// // // // // // // });

// // // // // // // // import React, { useState, useEffect, useMemo } from "react";
// // // // // // // // import {
// // // // // // // //   View,
// // // // // // // //   StyleSheet,
// // // // // // // //   TextInput,
// // // // // // // //   TouchableOpacity,
// // // // // // // //   FlatList,
// // // // // // // //   Image,
// // // // // // // //   KeyboardAvoidingView,
// // // // // // // //   Platform,
// // // // // // // // } from "react-native";
// // // // // // // // import * as Animatable from "react-native-animatable";
// // // // // // // // import { SafeAreaView } from "react-native-safe-area-context";
// // // // // // // // import { useTheme } from "@react-navigation/native";
// // // // // // // // import AsyncStorage from "@react-native-async-storage/async-storage";
// // // // // // // // import LinearGradient from "react-native-linear-gradient";
// // // // // // // // import GlobalText from "../../theme/GlobalText";
// // // // // // // // import {
// // // // // // // //   Home,
// // // // // // // //   Building2,
// // // // // // // //   Building,
// // // // // // // //   MapPin,
// // // // // // // //   Search,
// // // // // // // //   SlidersHorizontal,
// // // // // // // //   HousePlus,
// // // // // // // //   LandPlot,
// // // // // // // //   WarehouseIcon,
// // // // // // // //   Factory,
// // // // // // // // } from "lucide-react-native";
// // // // // // // // import BottomNav from "../../components/ReusableComponents/BottomNav";
// // // // // // // // import FilterModal from "../../components/ReusableComponents/FilterModal";
// // // // // // // // import AnimatedBackground from "../../components/ReusableComponents/AnimatedBackground";
// // // // // // // // import PropertyCard from "../../components/ReusableComponents/PropertyCard";
// // // // // // // // import {
// // // // // // // //   getProperties,
// // // // // // // //   getUserProfile,
// // // // // // // //   saveProperty,
// // // // // // // //   unsaveProperty,
// // // // // // // // } from "../../api/api";

// // // // // // // // const categories = [
// // // // // // // //   { id: 1, name: "House", icon: HousePlus },
// // // // // // // //   { id: 2, name: "Apartment", icon: Building2 },
// // // // // // // //   { id: 3, name: "Office", icon: Building },
// // // // // // // //   { id: 4, name: "Land", icon: MapPin },
// // // // // // // //   { id: 5, name: "Sites", icon: LandPlot },
// // // // // // // //   { id: 6, name: "Godown", icon: WarehouseIcon },
// // // // // // // //   { id: 7, name: "Factory", icon: Factory }
// // // // // // // // ];

// // // // // // // // export default function HomeScreen({ navigation }) {
// // // // // // // //   const { colors } = useTheme();
// // // // // // // //   const [filterVisible, setFilterVisible] = useState(false);
// // // // // // // //   const [properties, setProperties] = useState([]);
// // // // // // // //   const [loading, setLoading] = useState(true);
// // // // // // // //   const [userName, setUserName] = useState("User");
// // // // // // // //   const [selectedCategory, setSelectedCategory] = useState(null);
// // // // // // // //   const [searchText, setSearchText] = useState("");

// // // // // // // //   const filteredProperties = useMemo(() => {
// // // // // // // //     return properties.filter((p) => {
// // // // // // // //       const matchesCategory = selectedCategory
// // // // // // // //         ? p.category === selectedCategory
// // // // // // // //         : true;
// // // // // // // //       const matchesSearch = searchText
// // // // // // // //         ? p.title?.toLowerCase().includes(searchText.toLowerCase()) ||
// // // // // // // //           p.location?.toLowerCase().includes(searchText.toLowerCase()) ||
// // // // // // // //           p.price?.toString().includes(searchText)
// // // // // // // //         : true;
// // // // // // // //       return matchesCategory && matchesSearch;
// // // // // // // //     });
// // // // // // // //   }, [properties, selectedCategory, searchText]);

// // // // // // // //   const handleToggleSave = async (property, save) => {
// // // // // // // //     try {
// // // // // // // //       const propertyId = property._id;
// // // // // // // //       if (!propertyId) throw new Error("Missing property ID");
// // // // // // // //       if (save) await saveProperty(propertyId);
// // // // // // // //       else await unsaveProperty(propertyId);
// // // // // // // //     } catch (err) {
// // // // // // // //       console.error("Save toggle failed:", err);
// // // // // // // //     }
// // // // // // // //   };

// // // // // // // //   useEffect(() => {
// // // // // // // //     const fetchData = async () => {
// // // // // // // //       try {
// // // // // // // //         const cached = await AsyncStorage.getItem("properties");
// // // // // // // //         if (cached) setProperties(JSON.parse(cached));
// // // // // // // //         const data = await getProperties();
// // // // // // // //         setProperties(data);
// // // // // // // //         await AsyncStorage.setItem("properties", JSON.stringify(data));
// // // // // // // //       } catch (err) {
// // // // // // // //         console.error("Error fetching properties:", err.message);
// // // // // // // //       } finally {
// // // // // // // //         setLoading(false);
// // // // // // // //       }
// // // // // // // //     };

// // // // // // // //     const fetchUser = async () => {
// // // // // // // //       try {
// // // // // // // //         const data = await getUserProfile();
// // // // // // // //         setUserName(data?.name || "User");
// // // // // // // //         await AsyncStorage.setItem("user", JSON.stringify(data));
// // // // // // // //       } catch {
// // // // // // // //         const stored = await AsyncStorage.getItem("user");
// // // // // // // //         if (stored) {
// // // // // // // //           const parsed = JSON.parse(stored);
// // // // // // // //           setUserName(parsed?.name || "User");
// // // // // // // //         }
// // // // // // // //       }
// // // // // // // //     };

// // // // // // // //     fetchData();
// // // // // // // //     fetchUser();
// // // // // // // //   }, []);

// // // // // // // //   const Header = () => (
// // // // // // // //     <LinearGradient colors={["#43C6AC", "#20A68B"]} style={styles.headerGradient}>
// // // // // // // //       <View style={styles.headerContent}>
// // // // // // // //         <View>
// // // // // // // //           <GlobalText style={styles.greeting}>Hello 👋</GlobalText>
// // // // // // // //           <GlobalText style={styles.name}>{userName}</GlobalText>
// // // // // // // //         </View>
// // // // // // // //         <Image
// // // // // // // //           source={{ uri: "https://randomuser.me/api/portraits/men/75.jpg" }}
// // // // // // // //           style={styles.avatar}
// // // // // // // //         />
// // // // // // // //       </View>

// // // // // // // //       {/* 🔍 Search Bar */}
// // // // // // // //       <KeyboardAvoidingView
// // // // // // // //         behavior={Platform.OS === "ios" ? "padding" : undefined}
// // // // // // // //       >
// // // // // // // //         <View style={styles.searchRow}>
// // // // // // // //           <View style={styles.searchBox}>
// // // // // // // //             <Search size={20} color="#555" />
// // // // // // // //             <TextInput
// // // // // // // //               placeholder="Search properties..."
// // // // // // // //               placeholderTextColor="#aaa"
// // // // // // // //               style={styles.searchInput}
// // // // // // // //               value={searchText}
// // // // // // // //               onChangeText={setSearchText}
// // // // // // // //             />
// // // // // // // //           </View>
// // // // // // // //           <TouchableOpacity
// // // // // // // //             style={styles.filterButton}
// // // // // // // //             onPress={() => setFilterVisible(true)}
// // // // // // // //           >
// // // // // // // //             <SlidersHorizontal size={22} color="#fff" />
// // // // // // // //           </TouchableOpacity>
// // // // // // // //         </View>
// // // // // // // //       </KeyboardAvoidingView>

// // // // // // // //       {/* 🏠 Categories */}
// // // // // // // //       <FlatList
// // // // // // // //         horizontal
// // // // // // // //         showsHorizontalScrollIndicator={false}
// // // // // // // //         data={categories}
// // // // // // // //         keyExtractor={(item) => item.id.toString()}
// // // // // // // //         contentContainerStyle={styles.categoryList}
// // // // // // // //         renderItem={({ item }) => {
// // // // // // // //           const IconComponent = item.icon;
// // // // // // // //           const isActive = selectedCategory === item.name;
// // // // // // // //           return (
// // // // // // // //             <TouchableOpacity
// // // // // // // //               onPress={() => setSelectedCategory(isActive ? null : item.name)}
// // // // // // // //               activeOpacity={0.8}
// // // // // // // //             >
// // // // // // // //               <Animatable.View
// // // // // // // //                 animation="bounceIn"
// // // // // // // //                 duration={800}
// // // // // // // //                 style={[
// // // // // // // //                   styles.categoryCard,
// // // // // // // //                   { backgroundColor: isActive ? "#20A68B" : "#fff" },
// // // // // // // //                 ]}
// // // // // // // //               >
// // // // // // // //                 <IconComponent
// // // // // // // //                   size={26}
// // // // // // // //                   color={isActive ? "#fff" : "#43C6AC"}
// // // // // // // //                   strokeWidth={2}
// // // // // // // //                 />
// // // // // // // //                 <GlobalText
// // // // // // // //                   numberOfLines={1}
// // // // // // // //                   ellipsizeMode="tail"
// // // // // // // //                   adjustsFontSizeToFit
// // // // // // // //                   style={[
// // // // // // // //                     styles.categoryText,
// // // // // // // //                     { color: isActive ? "#fff" : "#333" },
// // // // // // // //                   ]}
// // // // // // // //                 >
// // // // // // // //                   {item.name}
// // // // // // // //                 </GlobalText>
// // // // // // // //               </Animatable.View>
// // // // // // // //             </TouchableOpacity>
// // // // // // // //           );
// // // // // // // //         }}
// // // // // // // //       />

// // // // // // // //       {selectedCategory && (
// // // // // // // //         <TouchableOpacity
// // // // // // // //           style={styles.clearFilterBtn}
// // // // // // // //           onPress={() => setSelectedCategory(null)}
// // // // // // // //         >
// // // // // // // //           <GlobalText style={styles.clearFilterText}>Clear Filter</GlobalText>
// // // // // // // //         </TouchableOpacity>
// // // // // // // //       )}
// // // // // // // //     </LinearGradient>
// // // // // // // //   );

// // // // // // // //   return (
// // // // // // // //     <SafeAreaView style={styles.container}>
// // // // // // // //       <AnimatedBackground />
// // // // // // // //       <FlatList
// // // // // // // //         data={filteredProperties}
// // // // // // // //         keyExtractor={(item) => item._id}
// // // // // // // //         contentContainerStyle={{ paddingBottom: 100 }}
// // // // // // // //         ListHeaderComponent={<Header />}
// // // // // // // //         renderItem={({ item }) => (
// // // // // // // //           <PropertyCard
// // // // // // // //             item={item}
// // // // // // // //             onPress={() =>
// // // // // // // //               navigation.navigate("PropertyDetails", { property: item })
// // // // // // // //             }
// // // // // // // //             onToggleSave={handleToggleSave}
// // // // // // // //           />
// // // // // // // //         )}
// // // // // // // //       />
// // // // // // // //       <BottomNav navigation={navigation} />
// // // // // // // //       <FilterModal
// // // // // // // //         visible={filterVisible}
// // // // // // // //         onClose={() => setFilterVisible(false)}
// // // // // // // //       />
// // // // // // // //     </SafeAreaView>
// // // // // // // //   );
// // // // // // // // }

// // // // // // // // const styles = StyleSheet.create({
// // // // // // // //   container: { flex: 1, backgroundColor: "#f9f9f9" },
// // // // // // // //   headerGradient: {
// // // // // // // //     paddingBottom: 30,
// // // // // // // //     borderBottomLeftRadius: 30,
// // // // // // // //     borderBottomRightRadius: 30,
// // // // // // // //     overflow: "hidden",
// // // // // // // //   },
// // // // // // // //   headerContent: {
// // // // // // // //     flexDirection: "row",
// // // // // // // //     justifyContent: "space-between",
// // // // // // // //     alignItems: "center",
// // // // // // // //     padding: 20,
// // // // // // // //   },
// // // // // // // //   greeting: { fontSize: 16, color: "#fff", fontWeight: "400" },
// // // // // // // //   name: { fontSize: 22, fontWeight: "700", color: "#fff" },
// // // // // // // //   avatar: {
// // // // // // // //     width: 45,
// // // // // // // //     height: 45,
// // // // // // // //     borderRadius: 25,
// // // // // // // //     borderWidth: 2,
// // // // // // // //     borderColor: "#fff",
// // // // // // // //   },
// // // // // // // //   searchRow: {
// // // // // // // //     flexDirection: "row",
// // // // // // // //     alignItems: "center",
// // // // // // // //     paddingHorizontal: 20,
// // // // // // // //     marginTop: 10,
// // // // // // // //   },
// // // // // // // //   searchBox: {
// // // // // // // //     flexDirection: "row",
// // // // // // // //     alignItems: "center",
// // // // // // // //     backgroundColor: "#fff",
// // // // // // // //     borderRadius: 12,
// // // // // // // //     paddingHorizontal: 12,
// // // // // // // //     flex: 1,
// // // // // // // //     height: 45,
// // // // // // // //     shadowColor: "#000",
// // // // // // // //     shadowOpacity: 0.1,
// // // // // // // //     shadowRadius: 4,
// // // // // // // //     elevation: 3,
// // // // // // // //   },
// // // // // // // //   searchInput: { flex: 1, marginLeft: 6, fontSize: 14 },
// // // // // // // //   filterButton: {
// // // // // // // //     marginLeft: 10,
// // // // // // // //     backgroundColor: "#20A68B",
// // // // // // // //     borderRadius: 12,
// // // // // // // //     padding: 10,
// // // // // // // //     elevation: 4,
// // // // // // // //   },
// // // // // // // //   categoryList: { paddingHorizontal: 15, marginTop: 15 },
// // // // // // // //   categoryCard: {
// // // // // // // //     paddingVertical: 12,
// // // // // // // //     paddingHorizontal: 8,
// // // // // // // //     marginRight: 12,
// // // // // // // //     borderRadius: 14,
// // // // // // // //     alignItems: "center",
// // // // // // // //     justifyContent: "center",
// // // // // // // //     minWidth: 80,
// // // // // // // //     maxWidth: 90,
// // // // // // // //     elevation: 3,
// // // // // // // //     shadowColor: "#43C6AC",
// // // // // // // //     shadowOpacity: 0.25,
// // // // // // // //     shadowRadius: 5,
// // // // // // // //     shadowOffset: { width: 0, height: 3 },
// // // // // // // //   },
// // // // // // // //   categoryText: {
// // // // // // // //     fontSize: 12,
// // // // // // // //     marginTop: 6,
// // // // // // // //     textAlign: "center",
// // // // // // // //     includeFontPadding: false,
// // // // // // // //     textAlignVertical: "center",
// // // // // // // //   },
// // // // // // // //   clearFilterBtn: {
// // // // // // // //     marginTop: 12,
// // // // // // // //     marginHorizontal: 20,
// // // // // // // //     paddingVertical: 10,
// // // // // // // //     borderRadius: 10,
// // // // // // // //     backgroundColor: "#43C6AC",
// // // // // // // //     alignItems: "center",
// // // // // // // //   },
// // // // // // // //   clearFilterText: {
// // // // // // // //     color: "#fff",
// // // // // // // //     fontSize: 14,
// // // // // // // //     fontWeight: "600",
// // // // // // // //   },
// // // // // // // // });

// // // // // // // // import React, { useState, useEffect, useMemo } from "react";
// // // // // // // // import {
// // // // // // // //   View,
// // // // // // // //   StyleSheet,
// // // // // // // //   TextInput,
// // // // // // // //   TouchableOpacity,
// // // // // // // //   FlatList,
// // // // // // // //   Image,
// // // // // // // //   KeyboardAvoidingView,
// // // // // // // //   Platform,
// // // // // // // // } from "react-native";
// // // // // // // // import * as Animatable from "react-native-animatable";
// // // // // // // // import { SafeAreaView } from "react-native-safe-area-context";
// // // // // // // // import { useTheme } from "@react-navigation/native";
// // // // // // // // import AsyncStorage from "@react-native-async-storage/async-storage";
// // // // // // // // import LinearGradient from "react-native-linear-gradient";
// // // // // // // // import GlobalText from "../../theme/GlobalText";

// // // // // // // // // ✅ Lucide Icons
// // // // // // // // import {
// // // // // // // //   Home,
// // // // // // // //   Building2,
// // // // // // // //   Building,
// // // // // // // //   MapPin,
// // // // // // // //   Search,
// // // // // // // //   SlidersHorizontal,
// // // // // // // //   HousePlus,
// // // // // // // // } from "lucide-react-native";

// // // // // // // // import BottomNav from "../../components/ReusableComponents/BottomNav";
// // // // // // // // import FilterModal from "../../components/ReusableComponents/FilterModal";
// // // // // // // // import AnimatedBackground from "../../components/ReusableComponents/AnimatedBackground";
// // // // // // // // import PropertyCard from "../../components/ReusableComponents/PropertyCard";
// // // // // // // // import {
// // // // // // // //   getProperties,
// // // // // // // //   getUserProfile,
// // // // // // // //   saveProperty,
// // // // // // // //   unsaveProperty,
// // // // // // // // } from "../../api/api";

// // // // // // // // const categories = [
// // // // // // // //   { id: 1, name: "House", icon: HousePlus },
// // // // // // // //   { id: 2, name: "Apartment", icon: Building2 },
// // // // // // // //   { id: 3, name: "Office", icon: Building },
// // // // // // // //   { id: 4, name: "Land", icon: MapPin },
// // // // // // // // ];

// // // // // // // // export default function HomeScreen({ navigation }) {
// // // // // // // //   const { colors } = useTheme();
// // // // // // // //   const [filterVisible, setFilterVisible] = useState(false);
// // // // // // // //   const [properties, setProperties] = useState([]);
// // // // // // // //   const [loading, setLoading] = useState(true);
// // // // // // // //   const [userName, setUserName] = useState("User");
// // // // // // // //   const [selectedCategory, setSelectedCategory] = useState(null);
// // // // // // // //   const [searchText, setSearchText] = useState("");

// // // // // // // //   const filteredProperties = useMemo(() => {
// // // // // // // //     return properties.filter((p) => {
// // // // // // // //       const matchesCategory = selectedCategory
// // // // // // // //         ? p.category === selectedCategory
// // // // // // // //         : true;
// // // // // // // //       const matchesSearch = searchText
// // // // // // // //         ? p.title?.toLowerCase().includes(searchText.toLowerCase()) ||
// // // // // // // //           p.location?.toLowerCase().includes(searchText.toLowerCase()) ||
// // // // // // // //           p.price?.toString().includes(searchText)
// // // // // // // //         : true;
// // // // // // // //       return matchesCategory && matchesSearch;
// // // // // // // //     });
// // // // // // // //   }, [properties, selectedCategory, searchText]);

// // // // // // // //   const handleToggleSave = async (property, save) => {
// // // // // // // //     try {
// // // // // // // //       const propertyId = property._id;
// // // // // // // //       if (!propertyId) throw new Error("Missing property ID");
// // // // // // // //       if (save) await saveProperty(propertyId);
// // // // // // // //       else await unsaveProperty(propertyId);
// // // // // // // //     } catch (err) {
// // // // // // // //       console.error("Save toggle failed:", err);
// // // // // // // //     }
// // // // // // // //   };

// // // // // // // //   useEffect(() => {
// // // // // // // //     const fetchData = async () => {
// // // // // // // //       try {
// // // // // // // //         const cached = await AsyncStorage.getItem("properties");
// // // // // // // //         if (cached) setProperties(JSON.parse(cached));
// // // // // // // //         const data = await getProperties();
// // // // // // // //         setProperties(data);
// // // // // // // //         await AsyncStorage.setItem("properties", JSON.stringify(data));
// // // // // // // //       } catch (err) {
// // // // // // // //         console.error("Error fetching properties:", err.message);
// // // // // // // //       } finally {
// // // // // // // //         setLoading(false);
// // // // // // // //       }
// // // // // // // //     };

// // // // // // // //     const fetchUser = async () => {
// // // // // // // //       try {
// // // // // // // //         const data = await getUserProfile();
// // // // // // // //         setUserName(data?.name || "User");
// // // // // // // //         await AsyncStorage.setItem("user", JSON.stringify(data));
// // // // // // // //       } catch {
// // // // // // // //         const stored = await AsyncStorage.getItem("user");
// // // // // // // //         if (stored) {
// // // // // // // //           const parsed = JSON.parse(stored);
// // // // // // // //           setUserName(parsed?.name || "User");
// // // // // // // //         }
// // // // // // // //       }
// // // // // // // //     };

// // // // // // // //     fetchData();
// // // // // // // //     fetchUser();
// // // // // // // //   }, []);

// // // // // // // //   const Header = () => (
// // // // // // // //     <LinearGradient
// // // // // // // //       colors={["#43C6AC", "#20A68B"]}
// // // // // // // //       style={styles.headerGradient}
// // // // // // // //     >
// // // // // // // //       <View style={styles.headerContent}>
// // // // // // // //         <View>
// // // // // // // //           <GlobalText style={styles.greeting}>Hello 👋</GlobalText>
// // // // // // // //           <GlobalText style={styles.name}>{userName}</GlobalText>
// // // // // // // //         </View>
// // // // // // // //         <Image
// // // // // // // //           source={{ uri: "https://randomuser.me/api/portraits/men/75.jpg" }}
// // // // // // // //           style={styles.avatar}
// // // // // // // //         />
// // // // // // // //       </View>

// // // // // // // //       {/* 🔍 Search Bar */}
// // // // // // // //       <KeyboardAvoidingView
// // // // // // // //         behavior={Platform.OS === "ios" ? "padding" : undefined}
// // // // // // // //       >
// // // // // // // //         <View style={styles.searchRow}>
// // // // // // // //           <View style={styles.searchBox}>
// // // // // // // //             <Search size={20} color="#555" />
// // // // // // // //             <TextInput
// // // // // // // //               placeholder="Search properties..."
// // // // // // // //               placeholderTextColor="#aaa"
// // // // // // // //               style={styles.searchInput}
// // // // // // // //               value={searchText}
// // // // // // // //               onChangeText={setSearchText}
// // // // // // // //             />
// // // // // // // //           </View>
// // // // // // // //           <TouchableOpacity
// // // // // // // //             style={styles.filterButton}
// // // // // // // //             onPress={() => setFilterVisible(true)}
// // // // // // // //           >
// // // // // // // //             <SlidersHorizontal size={22} color="#fff" />
// // // // // // // //           </TouchableOpacity>
// // // // // // // //         </View>
// // // // // // // //       </KeyboardAvoidingView>

// // // // // // // //       {/* 🏠 Categories */}
// // // // // // // //       <FlatList
// // // // // // // //         horizontal
// // // // // // // //         showsHorizontalScrollIndicator={false}
// // // // // // // //         data={categories}
// // // // // // // //         keyExtractor={(item) => item.id.toString()}
// // // // // // // //         contentContainerStyle={styles.categoryList}
// // // // // // // //         renderItem={({ item }) => {
// // // // // // // //           const IconComponent = item.icon;
// // // // // // // //           const isActive = selectedCategory === item.name;
// // // // // // // //           return (
// // // // // // // //             <TouchableOpacity
// // // // // // // //               onPress={() => setSelectedCategory(isActive ? null : item.name)}
// // // // // // // //               activeOpacity={0.8}
// // // // // // // //             >
// // // // // // // //               <Animatable.View
// // // // // // // //                 animation="bounceIn"
// // // // // // // //                 duration={800}
// // // // // // // //                 style={[
// // // // // // // //                   styles.categoryCard,
// // // // // // // //                   { backgroundColor: isActive ? "#20A68B" : "#fff" },
// // // // // // // //                 ]}
// // // // // // // //               >
// // // // // // // //                 <IconComponent
// // // // // // // //                   size={26}
// // // // // // // //                   color={isActive ? "#fff" : "#43C6AC"}
// // // // // // // //                   strokeWidth={2}
// // // // // // // //                 />
// // // // // // // //                 <GlobalText
// // // // // // // //                   style={[
// // // // // // // //                     styles.categoryText,
// // // // // // // //                     { color: isActive ? "#fff" : "#333" },
// // // // // // // //                   ]}
// // // // // // // //                 >
// // // // // // // //                   {item.name}
// // // // // // // //                 </GlobalText>
// // // // // // // //               </Animatable.View>
// // // // // // // //             </TouchableOpacity>
// // // // // // // //           );
// // // // // // // //         }}
// // // // // // // //       />

// // // // // // // //       {selectedCategory && (
// // // // // // // //         <TouchableOpacity
// // // // // // // //           style={styles.clearFilterBtn}
// // // // // // // //           onPress={() => setSelectedCategory(null)}
// // // // // // // //         >
// // // // // // // //           <GlobalText style={styles.clearFilterText}>Clear Filter</GlobalText>
// // // // // // // //         </TouchableOpacity>
// // // // // // // //       )}
// // // // // // // //     </LinearGradient>
// // // // // // // //   );

// // // // // // // //   return (
// // // // // // // //     <SafeAreaView style={styles.container}>
// // // // // // // //       <AnimatedBackground />

// // // // // // // //       <FlatList
// // // // // // // //         data={filteredProperties}
// // // // // // // //         keyExtractor={(item) => item._id}
// // // // // // // //         contentContainerStyle={{ paddingBottom: 100 }}
// // // // // // // //         ListHeaderComponent={<Header />}
// // // // // // // //         renderItem={({ item }) => (
// // // // // // // //           <PropertyCard
// // // // // // // //             item={item}
// // // // // // // //             onPress={() =>
// // // // // // // //               navigation.navigate("PropertyDetails", { property: item })
// // // // // // // //             }
// // // // // // // //             onToggleSave={handleToggleSave}
// // // // // // // //           />
// // // // // // // //         )}
// // // // // // // //       />

// // // // // // // //       <BottomNav navigation={navigation} />
// // // // // // // //       <FilterModal
// // // // // // // //         visible={filterVisible}
// // // // // // // //         onClose={() => setFilterVisible(false)}
// // // // // // // //       />
// // // // // // // //     </SafeAreaView>
// // // // // // // //   );
// // // // // // // // }

// // // // // // // // const styles = StyleSheet.create({
// // // // // // // //   container: { flex: 1, backgroundColor: "#f9f9f9" },
// // // // // // // //   headerGradient: {
// // // // // // // //     paddingBottom: 30,
// // // // // // // //     borderBottomLeftRadius: 30,
// // // // // // // //     borderBottomRightRadius: 30,
// // // // // // // //     overflow: "hidden",
// // // // // // // //   },
// // // // // // // //   headerContent: {
// // // // // // // //     flexDirection: "row",
// // // // // // // //     justifyContent: "space-between",
// // // // // // // //     alignItems: "center",
// // // // // // // //     padding: 20,
// // // // // // // //   },
// // // // // // // //   greeting: { fontSize: 16, color: "#fff", fontWeight: "400" },
// // // // // // // //   name: { fontSize: 22, fontWeight: "700", color: "#fff" },
// // // // // // // //   avatar: {
// // // // // // // //     width: 45,
// // // // // // // //     height: 45,
// // // // // // // //     borderRadius: 25,
// // // // // // // //     borderWidth: 2,
// // // // // // // //     borderColor: "#fff",
// // // // // // // //   },
// // // // // // // //   searchRow: {
// // // // // // // //     flexDirection: "row",
// // // // // // // //     alignItems: "center",
// // // // // // // //     paddingHorizontal: 20,
// // // // // // // //     marginTop: 10,
// // // // // // // //   },
// // // // // // // //   searchBox: {
// // // // // // // //     flexDirection: "row",
// // // // // // // //     alignItems: "center",
// // // // // // // //     backgroundColor: "#fff",
// // // // // // // //     borderRadius: 12,
// // // // // // // //     paddingHorizontal: 12,
// // // // // // // //     flex: 1,
// // // // // // // //     height: 45,
// // // // // // // //     shadowColor: "#000",
// // // // // // // //     shadowOpacity: 0.1,
// // // // // // // //     shadowRadius: 4,
// // // // // // // //     elevation: 3,
// // // // // // // //   },
// // // // // // // //   searchInput: { flex: 1, marginLeft: 6, fontSize: 14 },
// // // // // // // //   filterButton: {
// // // // // // // //     marginLeft: 10,
// // // // // // // //     backgroundColor: "#20A68B",
// // // // // // // //     borderRadius: 12,
// // // // // // // //     padding: 10,
// // // // // // // //     elevation: 4,
// // // // // // // //   },
// // // // // // // //   categoryList: { paddingHorizontal: 15, marginTop: 15 },
// // // // // // // //   categoryCard: {
// // // // // // // //     padding: 12,
// // // // // // // //     marginRight: 12,
// // // // // // // //     borderRadius: 14,
// // // // // // // //     alignItems: "center",
// // // // // // // //     width: 90,
// // // // // // // //     elevation: 3,
// // // // // // // //     shadowColor: "#43C6AC",
// // // // // // // //     shadowOpacity: 0.25,
// // // // // // // //     shadowRadius: 5,
// // // // // // // //     shadowOffset: { width: 0, height: 3 },
// // // // // // // //   },
// // // // // // // //   categoryText: { fontSize: 12, marginTop: 6 },
// // // // // // // //   clearFilterBtn: {
// // // // // // // //     marginTop: 12,
// // // // // // // //     marginHorizontal: 20,
// // // // // // // //     paddingVertical: 10,
// // // // // // // //     borderRadius: 10,
// // // // // // // //     backgroundColor: "#43C6AC",
// // // // // // // //     alignItems: "center",
// // // // // // // //   },
// // // // // // // //   clearFilterText: {
// // // // // // // //     color: "#fff",
// // // // // // // //     fontSize: 14,
// // // // // // // //     fontWeight: "600",
// // // // // // // //   },
// // // // // // // // });
