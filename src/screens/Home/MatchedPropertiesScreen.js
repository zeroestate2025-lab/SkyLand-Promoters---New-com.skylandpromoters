import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Easing,
  useColorScheme,
} from "react-native";
import { useFocusEffect, useTheme } from "@react-navigation/native";
import GlobalText from "../../theme/GlobalText";
import { Frown, SlidersHorizontal, XCircle, ArrowLeft } from "lucide-react-native";
import PropertyCard from "../../components/ReusableComponents/PropertyCard";
import { getProperties } from "../../api/api";
import FilterModal from "../../components/ReusableComponents/FilterModal";
import LinearGradient from "react-native-linear-gradient";
import AnimatedBackground from "../../components/ReusableComponents/AnimatedBackground";

export default function MatchedPropertiesScreen({ route, navigation }) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const { colors } = useTheme();

  const routeParams = route?.params || {};
  const filtersFromRoute = routeParams.filters || {};

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterVisible, setFilterVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState(filtersFromRoute);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (
      filtersFromRoute &&
      JSON.stringify(filtersFromRoute) !== JSON.stringify(activeFilters)
    ) {
      setActiveFilters(filtersFromRoute);
    }
  }, [filtersFromRoute]);

  const fetchFilteredData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getProperties();
      const allData = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];

      let filtered = allData;
      if (activeFilters && Object.keys(activeFilters).length > 0) {
        const {
          size,
          minPrice,
          maxPrice,
          propertyType,
          state,
          district,
          subDistrict,
          bedrooms,
          bathrooms,
          kitchen,
        } = activeFilters;

        filtered = allData.filter((p) => {
          const category = p.category || p.type || p.propertyType || "";

          const matchesType = propertyType
            ? category.toLowerCase().includes(propertyType.toLowerCase())
            : true;

          const matchesPrice =
            Number(p.price) >= (minPrice || 0) &&
            Number(p.price) <= (maxPrice || Infinity);

          const matchesSize = p.sqft
            ? parseInt(p.sqft) <= (size || 999999)
            : true;

          const matchesBed = bedrooms
            ? String(p.bedrooms || "").includes(bedrooms)
            : true;

          const matchesBath = bathrooms
            ? String(p.bathrooms || "").includes(bathrooms)
            : true;

          const matchesKitchen = kitchen
            ? String(p.kitchen || "")
                .toLowerCase()
                .includes(kitchen.toLowerCase())
            : true;

          const matchesState = state ? p.state === state : true;
          const matchesDistrict = district ? p.district === district : true;
          const matchesSubDistrict = subDistrict
            ? p.subDistrict === subDistrict
            : true;

          return (
            matchesType &&
            matchesPrice &&
            matchesSize &&
            matchesState &&
            matchesDistrict &&
            matchesSubDistrict &&
            matchesBed &&
            matchesBath &&
            matchesKitchen
          );
        });
      }

      setProperties(filtered);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } catch (err) {
      console.error("❌ Error fetching matched properties:", err.message);
    } finally {
      setLoading(false);
    }
  }, [activeFilters]);

  useFocusEffect(
    useCallback(() => {
      fetchFilteredData();
    }, [fetchFilteredData])
  );

  const handleClearFilters = () => {
    setActiveFilters({});
    navigation.setParams({ filters: {} });
  };

  const hasFilters = activeFilters && Object.keys(activeFilters).length > 0;

  const renderFilterChips = () => {
    if (!hasFilters) return null;
    const chips = Object.entries(activeFilters).filter(
      ([, v]) => v !== "" && v != null
    );
    return (
      <View style={styles.filterChipContainer}>
        {chips.map(([key, value]) => (
          <View key={key} style={styles.chip}>
            <GlobalText style={styles.chipText}>
              {`${key}: ${value}`}
            </GlobalText>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#F7FAF9" }]}>
      <AnimatedBackground />

      <LinearGradient
        colors={ isDark ? ["#114D44", "#0D3732"] : ["#43C6AC", "#20A68B"] }
        style={styles.header}
      >
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <ArrowLeft size={22} color="#fff" />
          </TouchableOpacity>
          <GlobalText style={styles.headerTitle}>
            Matched Properties
          </GlobalText>
        </View>

        <View style={styles.headerButtons}>
          {hasFilters && (
            <TouchableOpacity
              style={styles.clearAllBtn}
              onPress={handleClearFilters}
            >
              <XCircle size={20} color="#fff" />
              <GlobalText style={styles.clearAllText}></GlobalText>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setFilterVisible(true)}
          >
            <SlidersHorizontal size={20} color="#fff" />
            <GlobalText style={styles.filterText}></GlobalText>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {renderFilterChips()}

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={ isDark ? "#20A68B" : "#20A68B" } />
        </View>
      ) : properties.length > 0 ? (
        <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
          <FlatList
            data={properties}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContainer}
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
        </Animated.View>
      ) : (
        <View style={styles.emptyContainer}>
          <Frown size={80} color={ isDark ? "#20A68B" : "#20A68B" } strokeWidth={1.5} />
          <GlobalText style={[styles.emptyText, { color: isDark ? "#ddd" : "#666" }]}>
            No matching properties found
          </GlobalText>
          <TouchableOpacity
            style={[styles.tryAgainBtn, { backgroundColor: isDark ? "#285A50" : "#43C6AC" }]}
            onPress={() => setFilterVisible(true)}
          >
            <GlobalText style={styles.tryAgainText}>Adjust Filters</GlobalText>
          </TouchableOpacity>
        </View>
      )}

      <FilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        currentFilters={activeFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#43C6AC",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    zIndex: 1,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: {
    marginRight: 6,
    padding: 6,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  headerTitle: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "700",
    marginLeft: 10,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  clearAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  clearAllText: {
    color: "#fff",
    marginLeft: 5,
    fontWeight: "600",
    fontSize: 13,
  },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  filterText: {
    color: "#fff",
    marginLeft: 6,
    fontWeight: "600",
    fontSize: 13,
  },
  filterChipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    marginTop: 10,
    marginBottom: 5,
  },
  chip: {
    backgroundColor: "#E8F8F4",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
    elevation: 2,
    shadowColor: "#20A68B",
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  chipText: {
    color: "#20A68B",
    fontSize: 13,
    fontWeight: "500",
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 80,
    paddingTop: 6,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "500",
    marginTop: 12,
    textAlign: "center",
  },
  tryAgainBtn: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    elevation: 3,
  },
  tryAgainText: {
    color: "#fff",
    fontWeight: "600",
  },
});


// import React, { useEffect, useState, useCallback, useRef } from "react";
// import {
//   View,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
//   Animated,
//   Easing,
// } from "react-native";
// import { useFocusEffect, useTheme } from "@react-navigation/native";
// import GlobalText from "../../theme/GlobalText";
// import { Frown, SlidersHorizontal, XCircle, ArrowLeft } from "lucide-react-native";
// import PropertyCard from "../../components/ReusableComponents/PropertyCard";
// import { getProperties } from "../../api/api";
// import FilterModal from "../../components/ReusableComponents/FilterModal";
// import LinearGradient from "react-native-linear-gradient";
// import AnimatedBackground from "../../components/ReusableComponents/AnimatedBackground";

// export default function MatchedPropertiesScreen({ route, navigation }) {
//   const routeParams = route?.params || {};
//   const filtersFromRoute = routeParams.filters || {};

//   const { colors } = useTheme();
//   const [properties, setProperties] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filterVisible, setFilterVisible] = useState(false);
//   const [activeFilters, setActiveFilters] = useState(filtersFromRoute);
//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   // ✅ When route filters change (after reapply), update active filters
//   useEffect(() => {
//     if (
//       filtersFromRoute &&
//       JSON.stringify(filtersFromRoute) !== JSON.stringify(activeFilters)
//     ) {
//       setActiveFilters(filtersFromRoute);
//     }
//   }, [filtersFromRoute]);

//   // 🧩 Fetch & Filter Data
//   const fetchFilteredData = useCallback(async () => {
//     try {
//       setLoading(true);
//       const response = await getProperties();

//       const allData = Array.isArray(response)
//         ? response
//         : Array.isArray(response?.data)
//         ? response.data
//         : [];

//       let filtered = allData;

//       if (activeFilters && Object.keys(activeFilters).length > 0) {
//         const {
//           size,
//           minPrice,
//           maxPrice,
//           propertyType,
//           state,
//           district,
//           subDistrict,
//           bedrooms,
//           bathrooms,
//           kitchen,
//         } = activeFilters;

//         filtered = allData.filter((p) => {
//           const category = p.category || p.type || p.propertyType || "";

//           const matchesType = propertyType
//             ? category.toLowerCase().includes(propertyType.toLowerCase())
//             : true;

//           const matchesPrice =
//             Number(p.price) >= (minPrice || 0) &&
//             Number(p.price) <= (maxPrice || Infinity);

//           const matchesSize = p.sqft
//             ? parseInt(p.sqft) <= (size || 999999)
//             : true;

//           const matchesBed = bedrooms
//             ? String(p.bedrooms || "").includes(bedrooms)
//             : true;

//           const matchesBath = bathrooms
//             ? String(p.bathrooms || "").includes(bathrooms)
//             : true;

//           const matchesKitchen = kitchen
//             ? String(p.kitchen || "")
//                 .toLowerCase()
//                 .includes(kitchen.toLowerCase())
//             : true;

//           const matchesState = state ? p.state === state : true;
//           const matchesDistrict = district ? p.district === district : true;
//           const matchesSubDistrict = subDistrict
//             ? p.subDistrict === subDistrict
//             : true;

//           return (
//             matchesType &&
//             matchesPrice &&
//             matchesSize &&
//             matchesState &&
//             matchesDistrict &&
//             matchesSubDistrict &&
//             matchesBed &&
//             matchesBath &&
//             matchesKitchen
//           );
//         });
//       }

//       setProperties(filtered);

//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 600,
//         easing: Easing.out(Easing.ease),
//         useNativeDriver: true,
//       }).start();
//     } catch (err) {
//       console.error("❌ Error fetching matched properties:", err.message);
//     } finally {
//       setLoading(false);
//     }
//   }, [activeFilters]);

//   // 🔄 Run fetch when filters change OR screen refocuses
//   useFocusEffect(
//     useCallback(() => {
//       fetchFilteredData();
//     }, [fetchFilteredData])
//   );

//   // 🧹 Clear filters
//   const handleClearFilters = () => {
//     setActiveFilters({});
//     navigation.setParams({ filters: {} });
//   };

//   const hasFilters =
//     activeFilters && Object.keys(activeFilters).length > 0;

//   const renderFilterChips = () => {
//     if (!hasFilters) return null;
//     const chips = Object.entries(activeFilters).filter(
//       ([, value]) => value !== "" && value !== null && value !== undefined
//     );

//     return (
//       <View style={styles.filterChipContainer}>
//         {chips.map(([key, value]) => (
//           <View key={key} style={styles.chip}>
//             <GlobalText style={styles.chipText}>
//               {`${key}: ${value}`}
//             </GlobalText>
//           </View>
//         ))}
//       </View>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       <AnimatedBackground />

//       {/* 🧭 Header with Back + Filter */}
//       <LinearGradient colors={["#43C6AC", "#20A68B"]} style={styles.header}>
//         <View style={styles.headerLeft}>
//           <TouchableOpacity
//             onPress={() => navigation.goBack()}
//             style={styles.backBtn}
//           >
//             <ArrowLeft size={22} color="#fff" />
//           </TouchableOpacity>
//           <GlobalText style={styles.headerTitle}>
//             Matched Properties
//           </GlobalText>
//         </View>

//         <View style={styles.headerButtons}>
//           {hasFilters && (
//             <TouchableOpacity
//               style={styles.clearAllBtn}
//               onPress={handleClearFilters}
//             >
//               <XCircle size={20} color="#fff" />
//               <GlobalText style={styles.clearAllText}></GlobalText>
//             </TouchableOpacity>
//           )}

//           <TouchableOpacity
//             style={styles.filterBtn}
//             onPress={() => setFilterVisible(true)}
//           >
//             <SlidersHorizontal size={20} color="#fff" />
//             <GlobalText style={styles.filterText}></GlobalText>
//           </TouchableOpacity>
//         </View>
//       </LinearGradient>

//       {/* 🧩 Filter Chips */}
//       {renderFilterChips()}

//       {/* 🏠 Property List */}
//       {loading ? (
//         <View style={styles.loading}>
//           <ActivityIndicator size="large" color="#20A68B" />
//         </View>
//       ) : properties.length > 0 ? (
//         <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
//           <FlatList
//             data={properties}
//             keyExtractor={(item) => item._id}
//             contentContainerStyle={styles.listContainer}
//             renderItem={({ item }) => (
//               <PropertyCard
//                 item={item}
//                 onPress={() =>
//                   navigation.navigate("PropertyDetails", {
//                     property: item,
//                   })
//                 }
//               />
//             )}
//             showsVerticalScrollIndicator={false}
//           />
//         </Animated.View>
//       ) : (
//         <View style={styles.emptyContainer}>
//           <Frown size={80} color="#20A68B" strokeWidth={1.5} />
//           <GlobalText style={styles.emptyText}>
//             No matching properties found
//           </GlobalText>
//           <TouchableOpacity
//             style={styles.tryAgainBtn}
//             onPress={() => setFilterVisible(true)}
//           >
//             <GlobalText style={styles.tryAgainText}>
//               Adjust Filters
//             </GlobalText>
//           </TouchableOpacity>
//         </View>
//       )}

//       {/* 🧰 Filter Modal */}
//       <FilterModal
//         visible={filterVisible}
//         onClose={() => setFilterVisible(false)}
//         currentFilters={activeFilters}
//       />
//     </View>
//   );
// }

// // 🌿 Styles
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F7FAF9",
//   },

//   // 🌿 Header Section
//   header: {
//     paddingHorizontal: 16,
//     paddingVertical: 14,
//     borderBottomLeftRadius: 25,
//     borderBottomRightRadius: 25,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     elevation: 8,
//     shadowColor: "#43C6AC",
//     shadowOpacity: 0.25,
//     shadowRadius: 6,
//     width: "100%",
//     height: 80,
//     zIndex: 1,  
//   },
//   headerLeft: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//   },
//   backBtn: {
//     marginRight: 6,
//     padding: 6,
//     borderRadius: 10,
//     backgroundColor: "rgba(255,255,255,0.15)",
//   },
//   headerTitle: {
//     fontSize: 18,
//     color: "#fff",
//     fontWeight: "700",
//     letterSpacing: 0.5,
//     marginLeft: 15,
//   },
//   headerButtons: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   clearAllBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginRight: 10,
//     backgroundColor: "rgba(255,255,255,0.15)",
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 8,
//   },
//   clearAllText: {
//     color: "#fff",
//     marginLeft: 5,
//     fontWeight: "600",
//     fontSize: 13,
//   },
//   filterBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "rgba(255,255,255,0.15)",
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     borderRadius: 8,
//   },
//   filterText: {
//     color: "#fff",
//     marginLeft: 6,
//     fontWeight: "600",
//     fontSize: 13,
//   },

//   // 🧩 Filter Chips
//   filterChipContainer: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "flex-start",
//     paddingHorizontal: 12,
//     marginTop: 10,
//     marginBottom: 5,
//   },
//   chip: {
//     backgroundColor: "#E8F8F4",
//     borderRadius: 20,
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     margin: 4,
//     flexDirection: "row",
//     alignItems: "center",
//     elevation: 2,
//     shadowColor: "#20A68B",
//     shadowOpacity: 0.15,
//     shadowRadius: 4,
//   },
//   chipText: {
//     color: "#20A68B",
//     fontSize: 13,
//     fontWeight: "500",
//   },

//   // 🏡 List / Property Section
//   listContainer: {
//     paddingHorizontal: 15,
//     paddingBottom: 80,
//     paddingTop: 6,
//   },
//   loading: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   // 😕 Empty State
//   emptyContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: 30,
//   },
//   emptyText: {
//     color: "#666",
//     fontSize: 15,
//     fontWeight: "500",
//     marginTop: 12,
//     textAlign: "center",
//   },
//   tryAgainBtn: {
//     marginTop: 15,
//     backgroundColor: "#43C6AC",
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 10,
//     elevation: 3,
//   },
//   tryAgainText: {
//     color: "#fff",
//     fontWeight: "600",
//     letterSpacing: 0.3,
//   },
// });

// // const styles = StyleSheet.create({
// //   container: { flex: 1, backgroundColor: "#f9f9f9" },
// //   header: {
// //     paddingHorizontal: 18,
// //     paddingVertical: 14,
// //     borderBottomLeftRadius: 25,
// //     borderBottomRightRadius: 25,
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "center",
// //     elevation: 8,
// //   },
// //   headerLeft: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //   },
// //   backBtn: {
// //     marginRight: 8,
// //     padding: 4,
// //   },
// //   headerTitle: { fontSize: 18, color: "#fff", fontWeight: "700" },
// //   headerButtons: { flexDirection: "row", alignItems: "center" },
// //   filterBtn: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     marginLeft: 12,
// //   },
// //   filterText: {
// //     color: "#fff",
// //     marginLeft: 6,
// //     fontWeight: "600",
// //   },
// //   clearAllBtn: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     marginRight: 10,
// //   },
// //   clearAllText: {
// //     color: "#fff",
// //     marginLeft: 5,
// //     fontWeight: "600",
// //   },
// //   filterChipContainer: {
// //     flexDirection: "row",
// //     flexWrap: "wrap",
// //     paddingHorizontal: 10,
// //     marginTop: 10,
// //   },
// //   chip: {
// //     backgroundColor: "#EAF8F5",
// //     paddingVertical: 6,
// //     paddingHorizontal: 10,
// //     borderRadius: 15,
// //     margin: 4,
// //   },
// //   chipText: {
// //     color: "#20A68B",
// //     fontSize: 12,
// //     fontWeight: "500",
// //   },
// //   loading: {
// //     flex: 1,
// //     justifyContent: "center",
// //     alignItems: "center",
// //   },
// //   emptyContainer: {
// //     flex: 1,
// //     justifyContent: "center",
// //     alignItems: "center",
// //     paddingHorizontal: 30,
// //   },
// //   emptyText: {
// //     color: "#555",
// //     fontSize: 15,
// //     fontWeight: "500",
// //     marginTop: 12,
// //   },
// //   tryAgainBtn: {
// //     marginTop: 15,
// //     backgroundColor: "#43C6AC",
// //     paddingVertical: 10,
// //     paddingHorizontal: 18,
// //     borderRadius: 10,
// //   },
// //   tryAgainText: {
// //     color: "#fff",
// //     fontWeight: "600",
// //   },
// //   listContainer: {
// //     paddingHorizontal: 15,
// //     paddingBottom: 80,
// //   },
// // });

// // import React, { useEffect, useState, useCallback, useRef } from "react";
// // import {
// //   View,
// //   StyleSheet,
// //   FlatList,
// //   TouchableOpacity,
// //   ActivityIndicator,
// //   Animated,
// //   Easing,
// // } from "react-native";
// // import { useFocusEffect, useTheme } from "@react-navigation/native";
// // import GlobalText from "../../theme/GlobalText";
// // import { Frown, SlidersHorizontal, XCircle } from "lucide-react-native";
// // import PropertyCard from "../../components/ReusableComponents/PropertyCard";
// // import { getProperties } from "../../api/api";
// // import FilterModal from "../../components/ReusableComponents/FilterModal";
// // import LinearGradient from "react-native-linear-gradient";
// // import AnimatedBackground from "../../components/ReusableComponents/AnimatedBackground";

// // export default function MatchedPropertiesScreen({ route, navigation }) {
// //   // Always safely destructure route.params
// //   const routeParams = route?.params || {};
// //   const filters = routeParams.filters || {};

// //   const { colors } = useTheme();
// //   const [properties, setProperties] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [filterVisible, setFilterVisible] = useState(false);
// //   const [activeFilters, setActiveFilters] = useState(filters);
// //   const fadeAnim = useRef(new Animated.Value(0)).current;

// //   // 🧩 Fetch & Filter Data
// //   const fetchFilteredData = useCallback(async () => {
// //     try {
// //       setLoading(true);
// //       const response = await getProperties();

// //       const allData = Array.isArray(response)
// //         ? response
// //         : Array.isArray(response?.data)
// //         ? response.data
// //         : [];

// //       let filtered = allData;

// //       if (activeFilters && Object.keys(activeFilters).length > 0) {
// //         const {
// //           size,
// //           minPrice,
// //           maxPrice,
// //           propertyType,
// //           state,
// //           district,
// //           subDistrict,
// //           bedrooms,
// //           bathrooms,
// //           kitchen,
// //         } = activeFilters;

// //         filtered = allData.filter((p) => {
// //           const category =
// //             p.category || p.type || p.propertyType || "";

// //           const matchesType = propertyType
// //             ? category.toLowerCase().includes(propertyType.toLowerCase())
// //             : true;

// //           const matchesPrice =
// //             Number(p.price) >= (minPrice || 0) &&
// //             Number(p.price) <= (maxPrice || Infinity);

// //           const matchesSize = p.sqft
// //             ? parseInt(p.sqft) <= (size || 999999)
// //             : true;

// //           const matchesBed = bedrooms
// //             ? String(p.bedrooms || "").includes(bedrooms)
// //             : true;

// //           const matchesBath = bathrooms
// //             ? String(p.bathrooms || "").includes(bathrooms)
// //             : true;

// //           const matchesKitchen = kitchen
// //             ? String(p.kitchen || "")
// //                 .toLowerCase()
// //                 .includes(kitchen.toLowerCase())
// //             : true;

// //           const matchesState = state ? p.state === state : true;
// //           const matchesDistrict = district ? p.district === district : true;
// //           const matchesSubDistrict = subDistrict
// //             ? p.subDistrict === subDistrict
// //             : true;

// //           return (
// //             matchesType &&
// //             matchesPrice &&
// //             matchesSize &&
// //             matchesState &&
// //             matchesDistrict &&
// //             matchesSubDistrict &&
// //             matchesBed &&
// //             matchesBath &&
// //             matchesKitchen
// //           );
// //         });
// //       }

// //       setProperties(filtered);

// //       Animated.timing(fadeAnim, {
// //         toValue: 1,
// //         duration: 600,
// //         easing: Easing.out(Easing.ease),
// //         useNativeDriver: true,
// //       }).start();
// //     } catch (err) {
// //       console.error("❌ Error fetching matched properties:", err.message);
// //     } finally {
// //       setLoading(false);
// //     }
// //   }, [activeFilters, fadeAnim]);

// //   // 🔄 Refresh whenever filters change or screen refocuses
// //   useFocusEffect(
// //     useCallback(() => {
// //       fetchFilteredData();
// //     }, [fetchFilteredData])
// //   );

// //   const handleClearFilters = () => {
// //     setActiveFilters({});
// //     navigation.setParams({ filters: {} });
// //   };

// //   const hasFilters =
// //     activeFilters && Object.keys(activeFilters).length > 0;

// //   const renderFilterChips = () => {
// //     if (!hasFilters) return null;
// //     const chips = Object.entries(activeFilters).filter(
// //       ([, value]) => value !== "" && value !== null && value !== undefined
// //     );

// //     return (
// //       <View style={styles.filterChipContainer}>
// //         {chips.map(([key, value]) => (
// //           <View key={key} style={styles.chip}>
// //             <GlobalText style={styles.chipText}>
// //               {`${key}: ${value}`}
// //             </GlobalText>
// //           </View>
// //         ))}
// //       </View>
// //     );
// //   };

// //   return (
// //     <View style={styles.container}>
// //       <AnimatedBackground />

// //       {/* 🧭 Header */}
// //       <LinearGradient colors={["#43C6AC", "#20A68B"]} style={styles.header}>
// //         <GlobalText style={styles.headerTitle}>
// //           Matched Properties
// //         </GlobalText>

// //         <View style={styles.headerButtons}>
// //           {hasFilters && (
// //             <TouchableOpacity
// //               style={styles.clearAllBtn}
// //               onPress={handleClearFilters}
// //             >
// //               <XCircle size={20} color="#fff" />
// //               <GlobalText style={styles.clearAllText}>Clear</GlobalText>
// //             </TouchableOpacity>
// //           )}

// //           <TouchableOpacity
// //             style={styles.filterBtn}
// //             onPress={() => setFilterVisible(true)}
// //           >
// //             <SlidersHorizontal size={20} color="#fff" />
// //             <GlobalText style={styles.filterText}>Filter</GlobalText>
// //           </TouchableOpacity>
// //         </View>
// //       </LinearGradient>

// //       {/* 🧩 Filter Chips */}
// //       {renderFilterChips()}

// //       {/* 🏠 Property List */}
// //       {loading ? (
// //         <View style={styles.loading}>
// //           <ActivityIndicator size="large" color="#20A68B" />
// //         </View>
// //       ) : properties.length > 0 ? (
// //         <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
// //           <FlatList
// //             data={properties}
// //             keyExtractor={(item) => item._id}
// //             contentContainerStyle={styles.listContainer}
// //             renderItem={({ item }) => (
// //               <PropertyCard
// //                 item={item}
// //                 onPress={() =>
// //                   navigation.navigate("PropertyDetails", {
// //                     property: item,
// //                   })
// //                 }
// //               />
// //             )}
// //             showsVerticalScrollIndicator={false}
// //           />
// //         </Animated.View>
// //       ) : (
// //         <View style={styles.emptyContainer}>
// //           <Frown size={80} color="#20A68B" strokeWidth={1.5} />
// //           <GlobalText style={styles.emptyText}>
// //             No matching properties found
// //           </GlobalText>
// //           <TouchableOpacity
// //             style={styles.tryAgainBtn}
// //             onPress={() => setFilterVisible(true)}
// //           >
// //             <GlobalText style={styles.tryAgainText}>
// //               Adjust Filters
// //             </GlobalText>
// //           </TouchableOpacity>
// //         </View>
// //       )}

// //       {/* 🧰 Filter Modal */}
// //       <FilterModal
// //         visible={filterVisible}
// //         onClose={() => setFilterVisible(false)}
// //         currentFilters={activeFilters}
// //       />
// //     </View>
// //   );
// // }

// // // 🌿 Styles
// // const styles = StyleSheet.create({
// //   container: { flex: 1, backgroundColor: "#f9f9f9" },
// //   header: {
// //     paddingHorizontal: 18,
// //     paddingVertical: 14,
// //     borderBottomLeftRadius: 25,
// //     borderBottomRightRadius: 25,
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "center",
// //     elevation: 8,
// //   },
// //   headerTitle: { fontSize: 18, color: "#fff", fontWeight: "700" },
// //   headerButtons: { flexDirection: "row", alignItems: "center" },
// //   filterBtn: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     marginLeft: 12,
// //   },
// //   filterText: {
// //     color: "#fff",
// //     marginLeft: 6,
// //     fontWeight: "600",
// //   },
// //   clearAllBtn: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     marginRight: 10,
// //   },
// //   clearAllText: {
// //     color: "#fff",
// //     marginLeft: 5,
// //     fontWeight: "600",
// //   },
// //   filterChipContainer: {
// //     flexDirection: "row",
// //     flexWrap: "wrap",
// //     paddingHorizontal: 10,
// //     marginTop: 10,
// //   },
// //   chip: {
// //     backgroundColor: "#EAF8F5",
// //     paddingVertical: 6,
// //     paddingHorizontal: 10,
// //     borderRadius: 15,
// //     margin: 4,
// //   },
// //   chipText: {
// //     color: "#20A68B",
// //     fontSize: 12,
// //     fontWeight: "500",
// //   },
// //   loading: {
// //     flex: 1,
// //     justifyContent: "center",
// //     alignItems: "center",
// //   },
// //   emptyContainer: {
// //     flex: 1,
// //     justifyContent: "center",
// //     alignItems: "center",
// //     paddingHorizontal: 30,
// //   },
// //   emptyText: {
// //     color: "#555",
// //     fontSize: 15,
// //     fontWeight: "500",
// //     marginTop: 12,
// //   },
// //   tryAgainBtn: {
// //     marginTop: 15,
// //     backgroundColor: "#43C6AC",
// //     paddingVertical: 10,
// //     paddingHorizontal: 18,
// //     borderRadius: 10,
// //   },
// //   tryAgainText: {
// //     color: "#fff",
// //     fontWeight: "600",
// //   },
// //   listContainer: {
// //     paddingHorizontal: 15,
// //     paddingBottom: 80,
// //   },
// // });

// // // import React, { useState, useEffect, useCallback } from "react";
// // // import {
// // //   View,
// // //   StyleSheet,
// // //   FlatList,
// // //   TextInput,
// // //   TouchableOpacity,
// // //   ActivityIndicator,
// // //   Animated,
// // //   Easing,
// // //   Image,
// // //   Keyboard,
// // // } from "react-native";
// // // import Icon from "react-native-vector-icons/MaterialCommunityIcons";
// // // import { SafeAreaView } from "react-native-safe-area-context";
// // // import LinearGradient from "react-native-linear-gradient";
// // // import GlobalText from "../../theme/GlobalText";
// // // import PropertyCard from "../../components/ReusableComponents/PropertyCard";
// // // import FilterModal from "../../components/ReusableComponents/FilterModal";
// // // import { getProperties } from "../../api/api";

// // // export default function MatchedPropertiesScreen({ navigation, route }) {
// // //   const { filters } = route.params || {};
// // //   const [search, setSearch] = useState("");
// // //   const [filterVisible, setFilterVisible] = useState(false);
// // //   const [properties, setProperties] = useState([]);
// // //   const [loading, setLoading] = useState(true);
// // //   const [fadeAnim] = useState(new Animated.Value(0));

// // //   const brandPrimary = "#43C6AC";
// // //   const brandSecondary = "#20A68B";

// // //   // 🧩 Fetch and filter data
// // //   const fetchFilteredData = useCallback(async () => {
// // //   try {
// // //     setLoading(true);
// // //     const response = await getProperties();

// // //     // 🧩 Handle API shape (either array or { data: [...] })
// // //     const allData = Array.isArray(response)
// // //       ? response
// // //       : Array.isArray(response?.data)
// // //       ? response.data
// // //       : [];

// // //     if (!allData.length) {
// // //       console.warn("⚠️ No property data found from backend");
// // //     }
// // //       if (filters && Object.keys(filters).length > 0) {
// // //         const {
// // //           size,
// // //           minPrice,
// // //           maxPrice,
// // //           propertyType,
// // //           state,
// // //           district,
// // //           subDistrict,
// // //           bedrooms,
// // //           bathrooms,
// // //           kitchen,
// // //         } = filters;

// // //         filtered = allData.filter((p) => {
// // //        const propertyCategory = p.category || p.type || p.propertyType || "";
// // //         const matchesType = propertyType
// // //           ? propertyCategory
// // //               .toLowerCase()
// // //               .trim()
// // //               .includes(propertyType.toLowerCase().trim())
// // //           : true;
// // //         const matchesPrice =
// // //           p.price >= (minPrice || 0) && p.price <= (maxPrice || Infinity);
// // //         const matchesSize = p.sqft
// // //           ? parseInt(p.sqft) <= (size || 999999)
// // //           : true;
// // //         const matchesBed = bedrooms
// // //           ? String(p.bedrooms || "").includes(bedrooms)
// // //           : true;
// // //         const matchesBath = bathrooms
// // //           ? String(p.bathrooms || "").includes(bathrooms)
// // //           : true;
// // //         const matchesKitchen = kitchen
// // //           ? String(p.kitchen || "")
// // //               .toLowerCase()
// // //               .includes(kitchen.toLowerCase())
// // //           : true;
// // //         const matchesState = state ? p.state === state : true;
// // //         const matchesDistrict = district ? p.district === district : true;
// // //         const matchesSubDistrict = subDistrict
// // //           ? p.subDistrict === subDistrict
// // //           : true;
// // //           console.log("Filter Type:", propertyType, "Data Category:", p.category);


// // //           return (
// // //             matchesType &&
// // //             matchesPrice &&
// // //             matchesSize &&
// // //             matchesState &&
// // //             matchesDistrict &&
// // //             matchesSubDistrict &&
// // //             matchesBed &&
// // //             matchesBath &&
// // //             matchesKitchen
// // //           );
// // //         });
// // //       }

// // //       setProperties(filtered);

// // //       Animated.timing(fadeAnim, {
// // //         toValue: 1,
// // //         duration: 600,
// // //         easing: Easing.out(Easing.ease),
// // //         useNativeDriver: true,
// // //       }).start();
// // //     } catch (err) {
// // //       console.error("Error fetching matched properties:", err.message);
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   }, [filters]);

// // //   useEffect(() => {
// // //     fetchFilteredData();
// // //   }, [fetchFilteredData]);

// // //   // 🧠 Local search filtering
// // //   const filteredData = properties.filter((item) =>
// // //     item.title?.toLowerCase().includes(search.toLowerCase())
// // //   );

// // //   // 🟩 Render filter summary chips
// // //   const renderFilterChips = () => {
// // //     if (!filters || Object.keys(filters).length === 0) return null;

// // //     const chips = [];
// // //     if (filters.propertyType) chips.push(filters.propertyType);
// // //     if (filters.minPrice || filters.maxPrice)
// // //       chips.push(`₹${filters.minPrice || 0}–₹${filters.maxPrice || "Any"}`);
// // //     if (filters.bedrooms) chips.push(`${filters.bedrooms} Beds`);
// // //     if (filters.bathrooms) chips.push(`${filters.bathrooms} Baths`);
// // //     if (filters.kitchen) chips.push(`${filters.kitchen} Kitchen`);
// // //     if (filters.state) chips.push(filters.state);
// // //     if (filters.district) chips.push(filters.district);

// // //     return (
// // //       <View style={{ marginTop: 6, marginBottom: 2 }}>
// // //         <FlatList
// // //           horizontal
// // //           data={chips}
// // //           keyExtractor={(item, index) => index.toString()}
// // //           renderItem={({ item }) => (
// // //             <View style={styles.chip}>
// // //               <GlobalText
// // //                 numberOfLines={1}
// // //                 ellipsizeMode="tail"
// // //                 style={styles.chipText}
// // //               >
// // //                 {item}
// // //               </GlobalText>
// // //             </View>
// // //           )}
// // //           showsHorizontalScrollIndicator={false}
// // //           contentContainerStyle={styles.chipContainer}
// // //           scrollEnabled={chips.length > 2}
// // //         />
// // //       </View>
// // //     );
// // //   };

// // //   // 🧱 Empty state component
// // //   const EmptyState = () => (
// // //     <View style={styles.emptyContainer}>
// // //       <Icon name="home-search-outline" size={90} color={brandSecondary} />
// // //       <GlobalText
// // //         style={{
// // //           color: brandSecondary,
// // //           fontSize: 16,
// // //           fontWeight: "600",
// // //           marginTop: 15,
// // //         }}
// // //       >
// // //         No properties found
// // //       </GlobalText>
// // //       <GlobalText
// // //         style={{
// // //           color: "#777",
// // //           fontSize: 13,
// // //           textAlign: "center",
// // //           marginTop: 5,
// // //           width: "80%",
// // //         }}
// // //       >
// // //         Try adjusting your filters or explore other categories like Houses,
// // //         Offices, or Factories.
// // //       </GlobalText>
// // //       <TouchableOpacity
// // //         style={styles.resetBtn}
// // //         onPress={() => navigation.goBack()}
// // //       >
// // //         <GlobalText style={styles.resetText}>← Go Back</GlobalText>
// // //       </TouchableOpacity>
// // //     </View>
// // //   );

// // //   return (
// // //     <SafeAreaView style={styles.safeArea}>
// // //       {/* Header with gradient */}
// // //       <LinearGradient
// // //         colors={[brandPrimary, brandSecondary]}
// // //         start={{ x: 0, y: 0 }}
// // //         end={{ x: 1, y: 1 }}
// // //         style={styles.headerGradient}
// // //       >
// // //         <TouchableOpacity
// // //           onPress={() => navigation.goBack()}
// // //           style={styles.iconBtn}
// // //         >
// // //           <Icon name="arrow-left" size={24} color="#fff" />
// // //         </TouchableOpacity>

// // //         <View style={{ flex: 1 }}>
// // //           <GlobalText style={styles.headerTitleGradient}>
// // //             Matched Properties
// // //           </GlobalText>
// // //           <GlobalText
// // //             style={{
// // //               color: "#fff",
// // //               fontSize: 13,
// // //               textAlign: "center",
// // //               opacity: 0.9,
// // //               marginTop: -2,
// // //             }}
// // //           >
// // //             {filters && Object.keys(filters).length > 0
// // //               ? "Filters Applied"
// // //               : "No Filters Applied"}
// // //           </GlobalText>
// // //         </View>

// // //         {/* Filter toggle */}
// // //         <TouchableOpacity
// // //           onPress={() => {
// // //             if (filters && Object.keys(filters).length > 0) {
// // //               navigation.replace("MatchedProperties", { filters: {} });
// // //             } else {
// // //               setFilterVisible(true);
// // //             }
// // //           }}
// // //           style={styles.iconBtn}
// // //         >
// // //           {filters && Object.keys(filters).length > 0 ? (
// // //             <Icon name="filter-remove-outline" size={23} color="#fff" />
// // //           ) : (
// // //             <Icon name="filter-variant" size={23} color="#fff" />
// // //           )}
// // //         </TouchableOpacity>
// // //       </LinearGradient>

// // //       {/* Search input */}
// // //       <View style={styles.searchContainer}>
// // //         <View style={styles.searchBox}>
// // //           <Icon name="magnify" size={20} color={brandSecondary} />
// // //           <TextInput
// // //             placeholder="Search by title..."
// // //             placeholderTextColor="#B0B0B0"
// // //             value={search}
// // //             onChangeText={setSearch}
// // //             onBlur={Keyboard.dismiss}
// // //             style={styles.searchInput}
// // //           />
// // //           {search.length > 0 && (
// // //             <TouchableOpacity onPress={() => setSearch("")}>
// // //               <Icon name="close-circle" size={18} color="#aaa" />
// // //             </TouchableOpacity>
// // //           )}
// // //         </View>
// // //       </View>

// // //       {/* Filter summary chips */}
// // //       {renderFilterChips()}

// // //       {/* Property list */}
// // //       {loading ? (
// // //         <View style={styles.loaderContainer}>
// // //           <ActivityIndicator size="large" color={brandPrimary} />
// // //           <GlobalText style={styles.loadingText}>
// // //             Loading properties...
// // //           </GlobalText>
// // //         </View>
// // //       ) : filteredData.length === 0 ? (
// // //         <EmptyState />
// // //       ) : (
// // //         <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
// // //           <FlatList
// // //             data={filteredData}
// // //             keyExtractor={(item) => item._id}
// // //             renderItem={({ item }) => (
// // //               <PropertyCard
// // //                 item={{
// // //                   id: item._id,
// // //                   title: item.title,
// // //                   price: item.price,
// // //                   location: item.location,
// // //                   image:
// // //                     item.images && item.images.length > 0
// // //                       ? item.images[0]
// // //                       : "https://cdn-icons-png.flaticon.com/512/619/619034.png",
// // //                   bed: item.bedrooms,
// // //                   bath: item.bathrooms,
// // //                   kitchen: item.kitchen,
// // //                   size: item.sqft || "N/A",
// // //                   category: item.category,
// // //                 }}
// // //                 onPress={() =>
// // //                   navigation.navigate("PropertyDetails", { property: item })
// // //                 }
// // //               />
// // //             )}
// // //             contentContainerStyle={{ paddingBottom: 100 }}
// // //             showsVerticalScrollIndicator={false}
// // //           />
// // //         </Animated.View>
// // //       )}

// // //       {/* Filter modal */}
// // //       <FilterModal
// // //         visible={filterVisible}
// // //         onClose={() => setFilterVisible(false)}
// // //       />
// // //     </SafeAreaView>
// // //   );
// // // }

// // // // 🌿 Styles
// // // const styles = StyleSheet.create({
// // //   safeArea: { flex: 1, backgroundColor: "#F7FFFC" },
// // //   headerGradient: {
// // //     flexDirection: "row",
// // //     alignItems: "center",
// // //     justifyContent: "space-between",
// // //     paddingHorizontal: 16,
// // //     paddingVertical: 14,
// // //     elevation: 6,
// // //     shadowColor: "#000",
// // //     shadowOpacity: 0.15,
// // //     shadowRadius: 6,
// // //     borderBottomLeftRadius: 12,
// // //     borderBottomRightRadius: 12,
// // //   },
// // //   headerTitleGradient: {
// // //     fontSize: 18,
// // //     fontWeight: "700",
// // //     color: "#fff",
// // //     textAlign: "center",
// // //   },
// // //   iconBtn: { padding: 6, borderRadius: 10 },
// // //   searchContainer: { marginTop: 10, marginHorizontal: 16 },
// // //   searchBox: {
// // //     flexDirection: "row",
// // //     alignItems: "center",
// // //     backgroundColor: "#FFFFFF",
// // //     borderWidth: 1.3,
// // //     borderColor: "#C8E6DC",
// // //     borderRadius: 14,
// // //     paddingHorizontal: 10,
// // //     height: 46,
// // //     elevation: 2,
// // //   },
// // //   searchInput: {
// // //     flex: 1,
// // //     color: "#1A1A1A",
// // //     marginLeft: 6,
// // //     fontSize: 14,
// // //   },
// // //   chipContainer: {
// // //     flexDirection: "row",
// // //     alignItems: "center",
// // //     paddingHorizontal: 16,
// // //     gap: 8,
// // //   },
// // //   chip: {
// // //     backgroundColor: "#E8F7F3",
// // //     borderRadius: 20,
// // //     paddingHorizontal: 12,
// // //     paddingVertical: 5,
// // //     borderWidth: 1,
// // //     borderColor: "#B4E1D2",
// // //   },
// // //   chipText: {
// // //     color: "#20A68B",
// // //     fontSize: 13,
// // //     fontWeight: "600",
// // //   },
// // //   loaderContainer: {
// // //     flex: 1,
// // //     justifyContent: "center",
// // //     alignItems: "center",
// // //   },
// // //   loadingText: {
// // //     color: "#20A68B",
// // //     marginTop: 10,
// // //     fontWeight: "500",
// // //   },
// // //   emptyContainer: {
// // //     flex: 1,
// // //     justifyContent: "center",
// // //     alignItems: "center",
// // //     paddingHorizontal: 20,
// // //   },
// // //   resetBtn: {
// // //     marginTop: 20,
// // //     paddingHorizontal: 18,
// // //     paddingVertical: 8,
// // //     backgroundColor: "#43C6AC",
// // //     borderRadius: 10,
// // //     elevation: 3,
// // //   },
// // //   resetText: {
// // //     color: "#fff",
// // //     fontWeight: "600",
// // //     fontSize: 14,
// // //   },
// // // });



// // // // import React, { useState, useEffect, useCallback } from "react";
// // // // import {
// // // //   View,
// // // //   StyleSheet,
// // // //   FlatList,
// // // //   TextInput,
// // // //   TouchableOpacity,
// // // //   ActivityIndicator,
// // // //   Animated,
// // // //   Easing,
// // // //   Image,
// // // //   Keyboard,
// // // // } from "react-native";
// // // // import Icon from "react-native-vector-icons/MaterialCommunityIcons";
// // // // import { SafeAreaView } from "react-native-safe-area-context";
// // // // import LinearGradient from "react-native-linear-gradient";
// // // // import GlobalText from "../../theme/GlobalText";
// // // // import PropertyCard from "../../components/ReusableComponents/PropertyCard";
// // // // import FilterModal from "../../components/ReusableComponents/FilterModal";
// // // // import { getProperties } from "../../api/api";

// // // // export default function MatchedPropertiesScreen({ navigation, route }) {
// // // //   const { filters } = route.params || {};
// // // //   const [search, setSearch] = useState("");
// // // //   const [filterVisible, setFilterVisible] = useState(false);
// // // //   const [properties, setProperties] = useState([]);
// // // //   const [loading, setLoading] = useState(true);
// // // //   const [fadeAnim] = useState(new Animated.Value(0));

// // // //   const brandPrimary = "#43C6AC";
// // // //   const brandSecondary = "#20A68B";

// // // //   const fetchFilteredData = useCallback(async () => {
// // // //     try {
// // // //       setLoading(true);
// // // //       let url = `/api/properties`;

// // // //       if (filters?.category) {
// // // //         url += `?type=${encodeURIComponent(filters.category)}`;
// // // //       }

// // // //       const data = await getProperties(url);
// // // //       let filtered = data;

// // // //       if (filters) {
// // // //         const {
// // // //           size,
// // // //           minPrice,
// // // //           maxPrice,
// // // //           category,
// // // //           state,
// // // //           district,
// // // //           subDistrict,
// // // //           bedrooms,
// // // //           bathrooms,
// // // //           kitchen,
// // // //         } = filters;

// // // //         filtered = filtered.filter((p) => {
// // // //           const matchesType = category
// // // //             ? p.category?.toLowerCase() === category.toLowerCase()
// // // //             : true;
// // // //           const matchesPrice =
// // // //             p.price >= (minPrice || 0) && p.price <= (maxPrice || Infinity);
// // // //           const matchesSize = p.sqft ? parseInt(p.sqft) <= size : true;
// // // //           const matchesState = state ? p.state === state : true;
// // // //           const matchesDistrict = district ? p.district === district : true;
// // // //           const matchesSubDistrict = subDistrict
// // // //             ? p.subDistrict === subDistrict
// // // //             : true;
// // // //           const matchesBed = bedrooms
// // // //             ? String(p.bedrooms || "").includes(bedrooms)
// // // //             : true;
// // // //           const matchesBath = bathrooms
// // // //             ? String(p.bathrooms || "").includes(bathrooms)
// // // //             : true;
// // // //           const matchesKitchen = kitchen
// // // //             ? String(p.kitchen || "").toLowerCase() === kitchen.toLowerCase()
// // // //             : true;

// // // //           return (
// // // //             matchesType &&
// // // //             matchesPrice &&
// // // //             matchesSize &&
// // // //             matchesState &&
// // // //             matchesDistrict &&
// // // //             matchesSubDistrict &&
// // // //             matchesBed &&
// // // //             matchesBath &&
// // // //             matchesKitchen
// // // //           );
// // // //         });
// // // //       }

// // // //       setProperties(filtered);

// // // //       Animated.timing(fadeAnim, {
// // // //         toValue: 1,
// // // //         duration: 600,
// // // //         easing: Easing.out(Easing.ease),
// // // //         useNativeDriver: true,
// // // //       }).start();
// // // //     } catch (err) {
// // // //       console.error("Error fetching matched properties:", err.message);
// // // //     } finally {
// // // //       setLoading(false);
// // // //     }
// // // //   }, [filters]);

// // // //   useEffect(() => {
// // // //     fetchFilteredData();
// // // //   }, [fetchFilteredData]);

// // // //   const filteredData = properties.filter((item) =>
// // // //     item.title.toLowerCase().includes(search.toLowerCase())
// // // //   );

// // // //   const EmptyState = () => (
// // // //     <View style={styles.emptyContainer}>
// // // //       <Image
// // // //         source={{
// // // //           uri: "https://cdn-icons-png.flaticon.com/512/4076/4076505.png",
// // // //         }}
// // // //         style={{ width: 130, height: 130, opacity: 0.9 }}
// // // //       />
// // // //       <GlobalText
// // // //         style={{
// // // //           color: brandSecondary,
// // // //           fontSize: 16,
// // // //           fontWeight: "600",
// // // //           marginTop: 15,
// // // //         }}
// // // //       >
// // // //         No properties found
// // // //       </GlobalText>
// // // //       <GlobalText
// // // //         style={{
// // // //           color: "#777",
// // // //           fontSize: 13,
// // // //           textAlign: "center",
// // // //           marginTop: 5,
// // // //           width: "80%",
// // // //         }}
// // // //       >
// // // //         Try adjusting your filters or explore other categories like Houses,
// // // //         Offices, or Factories.
// // // //       </GlobalText>
// // // //       <TouchableOpacity
// // // //         style={styles.resetBtn}
// // // //         onPress={() => navigation.goBack()}
// // // //       >
// // // //         <GlobalText style={styles.resetText}>← Go Back</GlobalText>
// // // //       </TouchableOpacity>
// // // //     </View>
// // // //   );

// // // //   return (
// // // //     <SafeAreaView style={styles.safeArea}>
// // // //       {/* 🔹 Gradient Header (like Property Details) */}
// // // //       <LinearGradient
// // // //         colors={["#43C6AC", "#20A68B"]}
// // // //         start={{ x: 0, y: 0 }}
// // // //         end={{ x: 1, y: 1 }}
// // // //         style={styles.headerGradient}
// // // //       >
// // // //         <TouchableOpacity
// // // //           onPress={() => navigation.goBack()}
// // // //           style={styles.iconBtn}
// // // //         >
// // // //           <Icon name="arrow-left" size={24} color="#fff" />
// // // //         </TouchableOpacity>

// // // //         <GlobalText style={styles.headerTitleGradient}>
// // // //           Matched Properties
// // // //         </GlobalText>

// // // //         <TouchableOpacity
// // // //           onPress={() => setFilterVisible(true)}
// // // //           style={styles.iconBtn}
// // // //         >
// // // //           <Icon name="filter-variant" size={23} color="#fff" />
// // // //         </TouchableOpacity>
// // // //       </LinearGradient>

// // // //       {/* 🔹 Search Input */}
// // // //       <View style={styles.searchContainer}>
// // // //         <View style={styles.searchBox}>
// // // //           <Icon name="magnify" size={20} color={brandSecondary} />
// // // //           <TextInput
// // // //             placeholder="Search by title..."
// // // //             placeholderTextColor="#B0B0B0"
// // // //             value={search}
// // // //             onChangeText={setSearch}
// // // //             onBlur={Keyboard.dismiss}
// // // //             style={styles.searchInput}
// // // //           />
// // // //           {search.length > 0 && (
// // // //             <TouchableOpacity onPress={() => setSearch("")}>
// // // //               <Icon name="close-circle" size={18} color="#aaa" />
// // // //             </TouchableOpacity>
// // // //           )}
// // // //         </View>
// // // //       </View>

// // // //       {/* 🔹 Property List */}
// // // //       {loading ? (
// // // //         <View style={styles.loaderContainer}>
// // // //           <ActivityIndicator size="large" color={brandPrimary} />
// // // //           <GlobalText style={styles.loadingText}>
// // // //             Loading properties...
// // // //           </GlobalText>
// // // //         </View>
// // // //       ) : filteredData.length === 0 ? (
// // // //         <EmptyState />
// // // //       ) : (
// // // //         <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
// // // //           <FlatList
// // // //             data={filteredData}
// // // //             keyExtractor={(item) => item._id}
// // // //             renderItem={({ item }) => (
// // // //               <PropertyCard
// // // //                 item={{
// // // //                   id: item._id,
// // // //                   title: item.title,
// // // //                   price: item.price,
// // // //                   location: item.location,
// // // //                   image:
// // // //                     item.images && item.images.length > 0
// // // //                       ? item.images[0]
// // // //                       : "https://cdn-icons-png.flaticon.com/512/619/619034.png",
// // // //                   bed: item.bedrooms,
// // // //                   bath: item.bathrooms,
// // // //                   kitchen: item.kitchen,
// // // //                   size: item.sqft || "N/A",
// // // //                   category: item.category,
// // // //                 }}
// // // //                 onPress={() =>
// // // //                   navigation.navigate("PropertyDetails", { property: item })
// // // //                 }
// // // //               />
// // // //             )}
// // // //             contentContainerStyle={{ paddingBottom: 100 }}
// // // //             showsVerticalScrollIndicator={false}
// // // //           />
// // // //         </Animated.View>
// // // //       )}

// // // //       {/* 🔹 Filter Modal */}
// // // //       <FilterModal visible={filterVisible} onClose={() => setFilterVisible(false)} />
// // // //     </SafeAreaView>
// // // //   );
// // // // }

// // // // const styles = StyleSheet.create({
// // // //   safeArea: {
// // // //     flex: 1,
// // // //     backgroundColor: "#F7FFFC",
// // // //   },
// // // //   // Gradient header style (same as Property Details)
// // // //   headerGradient: {
// // // //     flexDirection: "row",
// // // //     alignItems: "center",
// // // //     justifyContent: "space-between",
// // // //     paddingHorizontal: 16,
// // // //     paddingVertical: 14,
// // // //     elevation: 6,
// // // //     shadowColor: "#000",
// // // //     shadowOpacity: 0.15,
// // // //     shadowRadius: 6,
// // // //     borderBottomLeftRadius: 12,
// // // //     borderBottomRightRadius: 12,
// // // //   },
// // // //   headerTitleGradient: {
// // // //     fontSize: 18,
// // // //     fontWeight: "700",
// // // //     color: "#fff",
// // // //     textAlign: "center",
// // // //     flex: 1,
// // // //   },
// // // //   iconBtn: {
// // // //     padding: 6,
// // // //     borderRadius: 10,
// // // //   },
// // // //   searchContainer: {
// // // //     marginTop: 10,
// // // //     marginHorizontal: 16,
// // // //   },
// // // //   searchBox: {
// // // //     flexDirection: "row",
// // // //     alignItems: "center",
// // // //     backgroundColor: "#FFFFFF",
// // // //     borderWidth: 1.3,
// // // //     borderColor: "#C8E6DC",
// // // //     borderRadius: 14,
// // // //     paddingHorizontal: 10,
// // // //     height: 46,
// // // //     shadowColor: "#000",
// // // //     shadowOpacity: 0.05,
// // // //     shadowRadius: 4,
// // // //     elevation: 2,
// // // //   },
// // // //   searchInput: {
// // // //     flex: 1,
// // // //     color: "#1A1A1A",
// // // //     marginLeft: 6,
// // // //     fontSize: 14,
// // // //   },
// // // //   loaderContainer: {
// // // //     flex: 1,
// // // //     justifyContent: "center",
// // // //     alignItems: "center",
// // // //   },
// // // //   loadingText: {
// // // //     color: "#20A68B",
// // // //     marginTop: 10,
// // // //     fontWeight: "500",
// // // //   },
// // // //   emptyContainer: {
// // // //     flex: 1,
// // // //     justifyContent: "center",
// // // //     alignItems: "center",
// // // //     paddingHorizontal: 20,
// // // //   },
// // // //   resetBtn: {
// // // //     marginTop: 20,
// // // //     paddingHorizontal: 18,
// // // //     paddingVertical: 8,
// // // //     backgroundColor: "#43C6AC",
// // // //     borderRadius: 10,
// // // //     elevation: 3,
// // // //   },
// // // //   resetText: {
// // // //     color: "#fff",
// // // //     fontWeight: "600",
// // // //     fontSize: 14,
// // // //   },
// // // // });

// // // // // import React, { useState, useEffect } from "react";
// // // // // import {
// // // // //   View,
// // // // //   StyleSheet,
// // // // //   FlatList,
// // // // //   TextInput,
// // // // //   TouchableOpacity,
// // // // //   ActivityIndicator,
// // // // // } from "react-native";
// // // // // import Icon from "react-native-vector-icons/MaterialCommunityIcons";
// // // // // import { SafeAreaView } from "react-native-safe-area-context";
// // // // // import { useTheme } from "@react-navigation/native";

// // // // // import GlobalText from "../../theme/GlobalText";
// // // // // import PropertyCard from "../../components/ReusableComponents/PropertyCard";
// // // // // import FilterModal from "../../components/ReusableComponents/FilterModal";
// // // // // import { getProperties } from "../../api/api";

// // // // // export default function MatchedPropertiesScreen({ navigation, route }) {
// // // // //   const { filters } = route.params || {};
// // // // //   const [search, setSearch] = useState("");
// // // // //   const [filterVisible, setFilterVisible] = useState(false);
// // // // //   const [properties, setProperties] = useState([]);
// // // // //   const [loading, setLoading] = useState(true);

// // // // //   const { colors } = useTheme();

// // // // //   // 🌿 Brand colors
// // // // //   const brandPrimary = "#43C6AC";
// // // // //   const brandSecondary = "#20A68B";

// // // // //   useEffect(() => {
// // // // //     const fetchData = async () => {
// // // // //       try {
// // // // //         const data = await getProperties();
// // // // //         let filtered = data;

// // // // //         if (filters) {
// // // // //           const {
// // // // //             size,
// // // // //             minPrice,
// // // // //             maxPrice,
// // // // //             propertyType,
// // // // //             state,
// // // // //             district,
// // // // //             subDistrict,
// // // // //             bedrooms,
// // // // //             bathrooms,
// // // // //             kitchen,
// // // // //           } = filters;

// // // // //           filtered = filtered.filter((p) => {
// // // // //             const matchesType = propertyType
// // // // //               ? p.category?.toLowerCase() === propertyType.toLowerCase()
// // // // //               : true;
// // // // //             const matchesPrice =
// // // // //               p.price >= (minPrice || 0) && p.price <= (maxPrice || Infinity);
// // // // //             const matchesSize = p.size ? parseInt(p.size) <= size : true;
// // // // //             const matchesState = state ? p.state === state : true;
// // // // //             const matchesDistrict = district ? p.district === district : true;
// // // // //             const matchesSubDistrict = subDistrict
// // // // //               ? p.subDistrict === subDistrict
// // // // //               : true;
// // // // //             const matchesBed = bedrooms
// // // // //               ? String(p.bedrooms || "").includes(bedrooms)
// // // // //               : true;
// // // // //             const matchesBath = bathrooms
// // // // //               ? String(p.bathrooms || "").includes(bathrooms)
// // // // //               : true;
// // // // //             const matchesKitchen = kitchen
// // // // //               ? String(p.kitchen || "").toLowerCase() ===
// // // // //                 kitchen.toLowerCase()
// // // // //               : true;

// // // // //             return (
// // // // //               matchesType &&
// // // // //               matchesPrice &&
// // // // //               matchesSize &&
// // // // //               matchesState &&
// // // // //               matchesDistrict &&
// // // // //               matchesSubDistrict &&
// // // // //               matchesBed &&
// // // // //               matchesBath &&
// // // // //               matchesKitchen
// // // // //             );
// // // // //           });
// // // // //         }

// // // // //         setProperties(filtered);
// // // // //       } catch (err) {
// // // // //         console.error(
// // // // //           "Error fetching matched properties:",
// // // // //           err.response?.data || err.message
// // // // //         );
// // // // //       } finally {
// // // // //         setLoading(false);
// // // // //       }
// // // // //     };

// // // // //     fetchData();
// // // // //   }, [filters]);

// // // // //   const filteredData = properties.filter((item) =>
// // // // //     item.title.toLowerCase().includes(search.toLowerCase())
// // // // //   );

// // // // //   return (
// // // // //     <SafeAreaView
// // // // //       style={[styles.container, { backgroundColor: "#F7FFFC" }]}
// // // // //       edges={["left", "right", "bottom"]}
// // // // //     >
// // // // //       {/* 🔹 Header */}
// // // // //       <View
// // // // //         style={[
// // // // //           styles.header,
// // // // //           {
// // // // //             backgroundColor: "#FFFFFF",
// // // // //             borderBottomColor: "#C8E6DC",
// // // // //           },
// // // // //         ]}
// // // // //       >
// // // // //         <TouchableOpacity onPress={() => navigation.goBack()}>
// // // // //           <Icon name="arrow-left" size={24} color={brandSecondary} />
// // // // //         </TouchableOpacity>

// // // // //         <GlobalText style={[styles.headerTitle, { color: brandSecondary }]}>
// // // // //           Matched Properties
// // // // //         </GlobalText>

// // // // //         <View style={{ width: 24 }} />
// // // // //       </View>

// // // // //       {/* 🔹 Search Row */}
// // // // //       <View style={styles.searchRow}>
// // // // //         <View
// // // // //           style={[
// // // // //             styles.searchBox,
// // // // //             {
// // // // //               backgroundColor: "#FFFFFF",
// // // // //               borderColor: "#C8E6DC",
// // // // //             },
// // // // //           ]}
// // // // //         >
// // // // //           <Icon name="magnify" size={20} color={brandSecondary} />
// // // // //           <TextInput
// // // // //             style={[styles.searchInput, { color: "#1A1A1A" }]}
// // // // //             placeholder="Search by title..."
// // // // //             placeholderTextColor="#B0B0B0"
// // // // //             value={search}
// // // // //             onChangeText={setSearch}
// // // // //           />
// // // // //         </View>

// // // // //         <TouchableOpacity
// // // // //           style={[
// // // // //             styles.filterBtn,
// // // // //             { backgroundColor: brandPrimary, shadowColor: "#000" },
// // // // //           ]}
// // // // //           onPress={() => setFilterVisible(true)}
// // // // //         >
// // // // //           <Icon name="filter-variant" size={20} color="#fff" />
// // // // //           <GlobalText style={styles.filterText}>Filters</GlobalText>
// // // // //         </TouchableOpacity>
// // // // //       </View>

// // // // //       {/* 🔹 Section Title */}
// // // // //       <View style={styles.sectionHeader}>
// // // // //         <GlobalText style={[styles.sectionTitle, { color: brandSecondary }]}>
// // // // //           {filters ? "Filtered Properties" : "All Properties"}
// // // // //         </GlobalText>
// // // // //       </View>

// // // // //       {/* 🔹 Property List */}
// // // // //       {loading ? (
// // // // //         <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
// // // // //           <ActivityIndicator size="large" color={brandSecondary} />
// // // // //           <GlobalText style={{ color: brandSecondary, marginTop: 10 }}>
// // // // //             Loading properties...
// // // // //           </GlobalText>
// // // // //         </View>
// // // // //       ) : filteredData.length === 0 ? (
// // // // //         <GlobalText
// // // // //           style={{
// // // // //             textAlign: "center",
// // // // //             marginTop: 30,
// // // // //             color: brandSecondary,
// // // // //             fontSize: 15,
// // // // //           }}
// // // // //         >
// // // // //           No properties found matching your filters.
// // // // //         </GlobalText>
// // // // //       ) : (
// // // // //         <FlatList
// // // // //           data={filteredData}
// // // // //           keyExtractor={(item) => item._id}
// // // // //           renderItem={({ item }) => (
// // // // //             <PropertyCard
// // // // //               item={{
// // // // //                 id: item._id,
// // // // //                 title: item.title,
// // // // //                 price: item.price,
// // // // //                 location: item.location,
// // // // //                 image:
// // // // //                   item.images && item.images.length > 0 ? item.images[0] : null,
// // // // //                 bed: item.bedrooms,
// // // // //                 bath: item.bathrooms,
// // // // //                 kitchen: item.kitchen,
// // // // //                 size: item.size || "N/A",
// // // // //                 category: item.category,
// // // // //               }}
// // // // //               onPress={() =>
// // // // //                 navigation.navigate("PropertyDetails", { property: item })
// // // // //               }
// // // // //             />
// // // // //           )}
// // // // //           contentContainerStyle={{ paddingBottom: 30, paddingHorizontal: 10 }}
// // // // //         />
// // // // //       )}

// // // // //       {/* 🔹 Filter Modal */}
// // // // //       <FilterModal
// // // // //         visible={filterVisible}
// // // // //         onClose={() => setFilterVisible(false)}
// // // // //       />
// // // // //     </SafeAreaView>
// // // // //   );
// // // // // }

// // // // // const styles = StyleSheet.create({
// // // // //   container: { flex: 1 },
// // // // //   header: {
// // // // //     flexDirection: "row",
// // // // //     alignItems: "center",
// // // // //     justifyContent: "space-between",
// // // // //     paddingHorizontal: 15,
// // // // //     paddingVertical: 15,
// // // // //     borderBottomWidth: 1,
// // // // //     elevation: 4,
// // // // //     shadowColor: "#000",
// // // // //     shadowOpacity: 0.1,
// // // // //     shadowRadius: 3,
// // // // //   },
// // // // //   headerTitle: {
// // // // //     fontSize: 17,
// // // // //     fontWeight: "700",
// // // // //   },
// // // // //   searchRow: {
// // // // //     flexDirection: "row",
// // // // //     margin: 15,
// // // // //     alignItems: "center",
// // // // //   },
// // // // //   searchBox: {
// // // // //     flex: 1,
// // // // //     flexDirection: "row",
// // // // //     alignItems: "center",
// // // // //     borderRadius: 12,
// // // // //     paddingHorizontal: 10,
// // // // //     height: 45,
// // // // //     borderWidth: 1,
// // // // //     elevation: 2,
// // // // //   },
// // // // //   searchInput: { flex: 1, paddingVertical: 8, marginLeft: 6 },
// // // // //   filterBtn: {
// // // // //     flexDirection: "row",
// // // // //     alignItems: "center",
// // // // //     paddingHorizontal: 12,
// // // // //     paddingVertical: 8,
// // // // //     borderRadius: 12,
// // // // //     marginLeft: 10,
// // // // //     elevation: 3,
// // // // //   },
// // // // //   filterText: { color: "#fff", marginLeft: 5, fontWeight: "600" },
// // // // //   sectionHeader: {
// // // // //     flexDirection: "row",
// // // // //     justifyContent: "space-between",
// // // // //     marginHorizontal: 15,
// // // // //     marginBottom: 10,
// // // // //   },
// // // // //   sectionTitle: { fontSize: 18, fontWeight: "700" },
// // // // // });

// // // // // import React, { useState, useEffect } from "react";
// // // // // import {
// // // // //   View,
// // // // //   StyleSheet,
// // // // //   FlatList,
// // // // //   TextInput,
// // // // //   TouchableOpacity,
// // // // // } from "react-native";
// // // // // import Icon from "react-native-vector-icons/MaterialCommunityIcons";
// // // // // import { SafeAreaView } from "react-native-safe-area-context";
// // // // // import { useTheme } from "@react-navigation/native";

// // // // // import GlobalText from "../../theme/GlobalText";
// // // // // import PropertyCard from "../../components/ReusableComponents/PropertyCard";
// // // // // import FilterModal from "../../components/ReusableComponents/FilterModal";
// // // // // import { getProperties } from "../../api/api";

// // // // // export default function MatchedPropertiesScreen({ navigation, route }) {
// // // // //   const { filters } = route.params || {};
// // // // //   const [search, setSearch] = useState("");
// // // // //   const [filterVisible, setFilterVisible] = useState(false);
// // // // //   const [properties, setProperties] = useState([]);
// // // // //   const [loading, setLoading] = useState(true);
// // // // //   const { colors } = useTheme();

// // // // //   useEffect(() => {
// // // // //     const fetchData = async () => {
// // // // //       try {
// // // // //         const data = await getProperties();
// // // // //         let filtered = data;

// // // // //         if (filters) {
// // // // //           const { size, minPrice, maxPrice, propertyType } = filters;

// // // // //           filtered = filtered.filter((p) => {
// // // // //             const matchesType = propertyType ? p.category === propertyType : true;
// // // // //             const matchesPrice = p.price >= minPrice && p.price <= maxPrice;
// // // // //             const matchesSize = p.size ? parseInt(p.size) <= size : true;
// // // // //             return matchesType && matchesPrice && matchesSize;
// // // // //           });
// // // // //         }

// // // // //         setProperties(filtered);
// // // // //       } catch (err) {
// // // // //         console.error(
// // // // //           "Error fetching matched properties:",
// // // // //           err.response?.data || err.message
// // // // //         );
// // // // //       } finally {
// // // // //         setLoading(false);
// // // // //       }
// // // // //     };

// // // // //     fetchData();
// // // // //   }, [filters]);

// // // // //   const filteredData = properties.filter((item) =>
// // // // //     item.title.toLowerCase().includes(search.toLowerCase())
// // // // //   );

// // // // //   return (
// // // // //     <SafeAreaView
// // // // //       style={[styles.container, { backgroundColor: colors.background }]}
// // // // //       edges={["left", "right", "bottom"]}
// // // // //     >
// // // // //       {/* 🔹 Header */}
// // // // //       <View
// // // // //         style={[
// // // // //           styles.header,
// // // // //           { backgroundColor: colors.card, borderBottomColor: colors.border },
// // // // //         ]}
// // // // //       >
// // // // //         <TouchableOpacity onPress={() => navigation.goBack()}>
// // // // //           <Icon name="arrow-left" size={24} color={colors.text} />
// // // // //         </TouchableOpacity>

// // // // //         <GlobalText style={[styles.headerTitle, { color: colors.text }]}>
// // // // //           Matched Properties
// // // // //         </GlobalText>

// // // // //         <View style={{ width: 24 }} />
// // // // //       </View>

// // // // //       {/* 🔹 Search Row */}
// // // // //       <View style={styles.searchRow}>
// // // // //         <View style={[styles.searchBox, { backgroundColor: colors.card }]}>
// // // // //           <Icon name="magnify" size={20} color={colors.text} />
// // // // //           <TextInput
// // // // //             style={[styles.searchInput, { color: colors.text }]}
// // // // //             placeholder="Search..."
// // // // //             placeholderTextColor={colors.border}
// // // // //             value={search}
// // // // //             onChangeText={setSearch}
// // // // //           />
// // // // //         </View>

// // // // //         <TouchableOpacity
// // // // //           style={[styles.filterBtn, { backgroundColor: colors.primary }]}
// // // // //           onPress={() => setFilterVisible(true)}
// // // // //         >
// // // // //           <Icon name="filter-variant" size={20} color="#fff" />
// // // // //           <GlobalText style={styles.filterText}>Filters</GlobalText>
// // // // //         </TouchableOpacity>
// // // // //       </View>

// // // // //       {/* 🔹 Section Title */}
// // // // //       <View style={styles.sectionHeader}>
// // // // //         <GlobalText style={[styles.sectionTitle, { color: colors.text }]}>
// // // // //           {filters ? "Filtered Properties" : "All Properties"}
// // // // //         </GlobalText>
// // // // //       </View>

// // // // //       {/* 🔹 Property List */}
// // // // //       {loading ? (
// // // // //         <GlobalText
// // // // //           style={{ textAlign: "center", marginTop: 20, color: colors.text }}
// // // // //         >
// // // // //           Loading...
// // // // //         </GlobalText>
// // // // //       ) : filteredData.length === 0 ? (
// // // // //         <GlobalText
// // // // //           style={{ textAlign: "center", marginTop: 20, color: colors.text }}
// // // // //         >
// // // // //           No properties found
// // // // //         </GlobalText>
// // // // //       ) : (
// // // // //         <FlatList
// // // // //           data={filteredData}
// // // // //           keyExtractor={(item) => item._id}
// // // // //           renderItem={({ item }) => (
// // // // //             <PropertyCard
// // // // //               item={{
// // // // //                 id: item._id,
// // // // //                 title: item.title,
// // // // //                 price: item.price,
// // // // //                 location: item.location,
// // // // //                 image:
// // // // //                   item.images && item.images.length > 0
// // // // //                     ? item.images[0]
// // // // //                     : null,
// // // // //                 bed: item.bedrooms,
// // // // //                 bath: item.bathrooms,
// // // // //                 kitchen: item.kitchen,
// // // // //                 size: item.size || "N/A",
// // // // //               }}
// // // // //               onPress={() =>
// // // // //                 navigation.navigate("PropertyDetails", { property: item })
// // // // //               }
// // // // //             />
// // // // //           )}
// // // // //           contentContainerStyle={{ paddingBottom: 20 }}
// // // // //         />
// // // // //       )}

// // // // //       {/* 🔹 Filter Modal */}
// // // // //       <FilterModal
// // // // //         visible={filterVisible}
// // // // //         onClose={() => setFilterVisible(false)}
// // // // //         navigation={navigation}
// // // // //       />
// // // // //     </SafeAreaView>
// // // // //   );
// // // // // }

// // // // // const styles = StyleSheet.create({
// // // // //   container: { flex: 1 },
// // // // //   header: {
// // // // //     flexDirection: "row",
// // // // //     alignItems: "center",
// // // // //     justifyContent: "space-between",
// // // // //     paddingHorizontal: 15,
// // // // //     paddingVertical: 15,
// // // // //     borderBottomWidth: 1,
// // // // //   },
// // // // //   headerTitle: { fontSize: 16, fontWeight: "600" },
// // // // //   searchRow: { flexDirection: "row", margin: 15, alignItems: "center" },
// // // // //   searchBox: {
// // // // //     flex: 1,
// // // // //     flexDirection: "row",
// // // // //     alignItems: "center",
// // // // //     borderRadius: 12,
// // // // //     paddingHorizontal: 10,
// // // // //     elevation: 2,
// // // // //   },
// // // // //   searchInput: { flex: 1, paddingVertical: 8, marginLeft: 6 },
// // // // //   filterBtn: {
// // // // //     flexDirection: "row",
// // // // //     alignItems: "center",
// // // // //     paddingHorizontal: 12,
// // // // //     paddingVertical: 8,
// // // // //     borderRadius: 12,
// // // // //     marginLeft: 10,
// // // // //   },
// // // // //   filterText: { color: "#fff", marginLeft: 5 },
// // // // //   sectionHeader: {
// // // // //     flexDirection: "row",
// // // // //     justifyContent: "space-between",
// // // // //     marginHorizontal: 15,
// // // // //     marginBottom: 10,
// // // // //   },
// // // // //   sectionTitle: { fontSize: 18, fontWeight: "700" },
// // // // // });
