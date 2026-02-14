import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import { useTheme } from "@react-navigation/native";

import PropertyCard from "../../components/ReusableComponents/PropertyCard";
import BottomNav from "../../components/ReusableComponents/BottomNav";
import FilterModal from "../../components/ReusableComponents/FilterModal";
import GlobalText from "../../theme/GlobalText";
import AnimatedBackground from "../../components/ReusableComponents/AnimatedBackground";

import { getSavedProperties, unsaveProperty } from "../../api/api";

export default function SavedPropertiesScreen({ navigation }) {
  const { colors } = useTheme();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const [saved, setSaved] = useState([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch saved properties from backend
  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const data = await getSavedProperties();
        setSaved(data);
      } catch (err) {
        console.error("Fetch saved error:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, []);

  // ✅ Handle when user unsaves property (remove from screen instantly)
  const handleToggleSave = async (property) => {
    try {
      const propertyId = property?._id || property?.id;
      if (!propertyId) return;

      await unsaveProperty(propertyId);

      // 🟢 Instantly remove from local list
      setSaved((prev) => prev.filter((p) => p._id !== propertyId));
    } catch (err) {
      console.error("Unsave failed:", err.message);
    }
  };

  const backgroundColor = isDark ? "#121212" : "#f9f9f9";
  const textColor = isDark ? "#EDEDED" : "#111";
  const subTextColor = isDark ? "#AAAAAA" : "#777";
  const iconColor = isDark ? "#EDEDED" : "#fff";

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor }]}
      edges={["top", "left", "right"]}
    >
      <AnimatedBackground />

      {/* 🔹 Header */}
      <LinearGradient
        colors={isDark ? ["#114D44", "#0D3732"] : ["#43C6AC", "#20A68B"]}
        style={styles.headerContainer}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.iconBtn}
          >
            <Icon name="arrow-left" size={24} color={iconColor} />
          </TouchableOpacity>

          <GlobalText bold style={styles.headerTitle}>
            Saved Properties
          </GlobalText>

          <TouchableOpacity
            onPress={() => setFilterVisible(true)}
            style={styles.iconBtn}
          >
            <Icon name="filter-variant" size={24} color={iconColor} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* 🔹 Loader / Empty / List */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#20A68B" />
          <GlobalText style={{ marginTop: 8, color: "#20A68B" }}>
            Loading saved properties...
          </GlobalText>
        </View>
      ) : saved.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon
            name="bookmark-off"
            size={60}
            color={isDark ? "#2A4A43" : "#B9E1D5"}
          />
          <GlobalText style={[styles.emptyText, { color: textColor }]}>
            No saved properties yet
          </GlobalText>
          <GlobalText style={[styles.emptySubText, { color: subTextColor }]}>
            Explore listings and save your favorites 💚
          </GlobalText>
        </View>
      ) : (
        <FlatList
          data={saved}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <PropertyCard
              item={{
                id: item._id,
                title: item.title,
                price: item.price,
                location: item.location,
                thumbnail: item.thumbnail,
                images: item.images,
                bedrooms: item.bedrooms,
                bathrooms: item.bathrooms,
                kitchen: item.kitchen,
                sqft: item.sqft,
                mapLocation: item.mapLocation,
                isSaved: true,
                category: item.category,
              }}
              onPress={() =>
                navigation.navigate("PropertyDetails", { property: item })
              }
              onToggleSave={() => handleToggleSave(item)}
            />
          )}
          contentContainerStyle={{ paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* 🔹 Bottom Navigation */}
      <BottomNav navigation={navigation} />

      {/* 🔹 Filter Modal */}
      <FilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        navigation={navigation}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: {
    paddingTop: 15,
    paddingBottom: 15,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    zIndex: 5,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  headerTitle: {
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
    flex: 1,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 10,
  },
  emptySubText: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 4,
  },
});
