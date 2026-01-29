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
