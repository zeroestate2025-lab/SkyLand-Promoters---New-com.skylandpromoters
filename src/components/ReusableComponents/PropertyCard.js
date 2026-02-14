import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Linking,
  useWindowDimensions,
  Alert,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { useTheme } from "@react-navigation/native";
import {
  Bed,
  Bath,
  UtensilsCrossed,
  MapPin,
  Bookmark,
  BookmarkCheck,
  Map,
  Info,
} from "lucide-react-native";
import GlobalText from "../../theme/GlobalText";
import { saveProperty, unsaveProperty, getUserProfile } from "../../api/api";

export default function PropertyCard({ item, onPress, onToggleSave }) {
  const { width } = useWindowDimensions();
  const scheme = useColorScheme();
  const { colors } = useTheme();
  const isDark = scheme === "dark";

  const [isSaved, setIsSaved] = useState(item?.isSaved || false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(!item?.isSaved);

  const propertyId = item?._id || item?.id;
  const cardWidth = useMemo(() => width * 0.9, [width]);

  // ✅ Verify from backend if saved, only if not explicitly passed
  useEffect(() => {
    if (item?.isSaved) {
      setIsSaved(true);
      setCheckingStatus(false);
      return;
    }

    const checkSavedStatus = async () => {
      try {
        const userData = await getUserProfile();
        const savedList =
          userData?.savedProperties || userData?.favourites || [];
        const found = savedList.some(
          (p) => p?._id === propertyId || p === propertyId
        );
        setIsSaved(found);
      } catch (err) {
        console.warn("Error checking saved status:", err.message);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkSavedStatus();
  }, [propertyId, item?.isSaved]);

  // ✅ Handle Save/Unsave Toggle
  const handleSave = async () => {
    if (loadingSave || checkingStatus) return;
    setLoadingSave(true);
    try {
      if (isSaved) {
        await unsaveProperty(propertyId);
        setIsSaved(false);
        if (typeof onToggleSave === "function") onToggleSave(item, false);
      } else {
        await saveProperty(propertyId);
        setIsSaved(true);
        if (typeof onToggleSave === "function") onToggleSave(item, true);
      }
    } catch (err) {
      console.error("Save/Unsave error:", err.message);
      Alert.alert("Error", "Unable to update saved status.");
    } finally {
      setLoadingSave(false);
    }
  };

  const bgColor = isDark ? "#1E1E1E" : "#fff";
  const textColor = isDark ? "#EDEDED" : "#111";
  const subTextColor = isDark ? "#BBBBBB" : "#555";
  const borderColor = isDark ? "#333" : "#00000015";
  const shadowColor = isDark ? "#000" : "#43C6AC";

  const displayImage =
    item?.thumbnail ||
    (item?.images && item.images.length > 0 ? item.images[0] : null);

  return (
    <Animatable.View animation="fadeInUp" duration={500} style={styles.wrapper}>
      <TouchableOpacity
        activeOpacity={0.93}
        onPress={onPress}
        style={[
          styles.card,
          {
            width: cardWidth,
            backgroundColor: bgColor,
            borderColor,
            shadowColor,
          },
        ]}
      >
        {/* 🏡 Property Image */}
        {displayImage ? (
          <Image
            source={{ uri: displayImage }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.image,
              { backgroundColor: isDark ? "#2C2C2C" : "#f5f5f5" },
              styles.noImage,
            ]}
          >
            <Map size={42} color={isDark ? "#888" : "#bbb"} />
          </View>
        )}

        {/* 🔖 Save Icon */}
        <TouchableOpacity
          style={[
            styles.bookmarkBtn,
            {
              backgroundColor: isDark ? "#222" : "#fff",
              shadowColor: shadowColor,
            },
          ]}
          onPress={handleSave}
        >
          {checkingStatus || loadingSave ? (
            <ActivityIndicator size="small" color="#20A68B" />
          ) : isSaved ? (
            <BookmarkCheck size={22} color="#20A68B" strokeWidth={2.4} />
          ) : (
            <Bookmark
              size={22}
              color={isDark ? "#EDEDED" : "#333"}
              strokeWidth={2}
            />
          )}
        </TouchableOpacity>

        {/* 🏠 Property Details */}
        <View style={styles.content}>
          <View style={styles.rowBetween}>
            <GlobalText
              numberOfLines={1}
              style={[styles.title, { color: textColor }]}
            >
              {item?.title || "Untitled Property"}
            </GlobalText>
            <GlobalText numberOfLines={1} style={styles.price}>
              ₹{item?.price ? item.price.toLocaleString("en-IN") : "N/A"}
            </GlobalText>
          </View>

          <View style={[styles.rowBetween, { marginTop: 4 }]}>
            <View style={styles.row}>
              <MapPin size={15} color={subTextColor} />
              <GlobalText
                numberOfLines={1}
                style={[styles.location, { color: subTextColor }]}
              >
                {item?.location || "No location"}
              </GlobalText>
            </View>
            {item?.sqft && (
              <GlobalText
                numberOfLines={1}
                style={[styles.size, { color: subTextColor }]}
              >
                {item.sqft} sqft
              </GlobalText>
            )}
          </View>

          {/* {item?.category?.toLowerCase() === "house" && (
            <View
              style={[
                styles.featuresRow,
                { borderTopColor: isDark ? "#333" : "#00000015" },
              ]}
            >
              <View style={styles.feature}>
                <Bed size={16} color="#FF6B6B" />
                <GlobalText
                  style={[styles.featureText, { color: subTextColor }]}
                >
                  {item?.bedrooms || 0} Bed
                </GlobalText>
              </View>
              <View style={styles.feature}>
                <Bath size={16} color="#3AAFA9" />
                <GlobalText
                  style={[styles.featureText, { color: subTextColor }]}
                >
                  {item?.bathrooms || 0} Bath
                </GlobalText>
              </View>
              <View style={styles.feature}>
                <UtensilsCrossed size={16} color="#FFA41B" />
                <GlobalText
                  style={[styles.featureText, { color: subTextColor }]}
                >
                  {item?.kitchen ? `${item.kitchen} Kitchen` : "N/A Kitchen"}
                </GlobalText>
              </View>
            </View>
          )} */}
        </View>
      </TouchableOpacity>
    </Animatable.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    marginVertical: 12,
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 8,
    elevation: 5,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 180,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  noImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  bookmarkBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    padding: 7,
    borderRadius: 20,
    elevation: 5,
  },
  content: {
    padding: 14,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    maxWidth: "65%",
  },
  price: {
    fontSize: 17,
    fontWeight: "800",
    color: "#20A68B",
    textAlign: "right",
  },
  location: {
    fontSize: 12,
    marginLeft: 4,
    maxWidth: 160,
  },
  size: {
    fontSize: 12,
  },
  featuresRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    borderTopWidth: 0.8,
    paddingTop: 8,
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureText: {
    fontSize: 12,
    marginLeft: 5,
    maxWidth: 70,
  },
});
