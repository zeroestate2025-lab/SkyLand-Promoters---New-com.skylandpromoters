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

          {item?.category?.toLowerCase() === "house" && (
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
          )}
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

// import React, { useState, useEffect, useMemo } from "react";
// import {
//   View,
//   Image,
//   StyleSheet,
//   TouchableOpacity,
//   Linking,
//   useWindowDimensions,
//   Alert,
//   ActivityIndicator,
//   useColorScheme,
// } from "react-native";
// import * as Animatable from "react-native-animatable";
// import { useTheme } from "@react-navigation/native";
// import {
//   Bed,
//   Bath,
//   UtensilsCrossed,
//   MapPin,
//   Bookmark,
//   BookmarkCheck,
//   Map,
//   Info,
// } from "lucide-react-native";
// import GlobalText from "../../theme/GlobalText";
// import { saveProperty, unsaveProperty, getUserProfile } from "../../api/api";

// export default function PropertyCard({ item, onPress, onToggleSave }) {
//   const { width } = useWindowDimensions();
//   const scheme = useColorScheme();
//   const { colors } = useTheme();
//   const isDark = scheme === "dark";

//   const [isSaved, setIsSaved] = useState(false);
//   const [loadingSave, setLoadingSave] = useState(false);
//   const [checkingStatus, setCheckingStatus] = useState(true);

//   // ✅ Normalize the property ID for consistency
//   const propertyId = item?._id || item?.id;

//   const cardWidth = useMemo(() => width * 0.9, [width]);

//   const formatField = (label, value) => {
//     if (!value || value === "" || value === "undefined" || value === null)
//       return `N/A ${label}`;
//     return `${value} ${label}`;
//   };

//   // ✅ Check if property already saved in backend
//   useEffect(() => {
//     const checkSavedStatus = async () => {
//       try {
//         const userData = await getUserProfile();
//         const savedList =
//           userData?.savedProperties || userData?.favourites || [];
//         const found = savedList.some(
//           (p) => p?._id === propertyId || p === propertyId
//         );
//         setIsSaved(found);
//       } catch (err) {
//         console.warn("Error checking saved status:", err.message);
//       } finally {
//         setCheckingStatus(false);
//       }
//     };
//     checkSavedStatus();
//   }, [propertyId]);

//   // ✅ Handle save/unsave toggle
//   const handleSave = async () => {
//     if (loadingSave || checkingStatus) return;
//     setLoadingSave(true);
//     try {
//       if (isSaved) {
//         await unsaveProperty(propertyId);
//         setIsSaved(false);
//         if (typeof onToggleSave === "function") onToggleSave(item);
//       } else {
//         await saveProperty(propertyId);
//         setIsSaved(true);
//       }
//     } catch (err) {
//       console.error("Save/Unsave error:", err.message);
//       Alert.alert("Error", "Unable to update saved status.");
//     } finally {
//       setLoadingSave(false);
//     }
//   };

//   const openMaps = () => {
//     const location = item?.mapLocation || item?.location;
//     if (!location?.trim()) return;
//     const encoded = encodeURIComponent(location);
//     const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encoded}`;
//     Linking.openURL(mapUrl);
//   };

//   const bgColor = isDark ? "#1E1E1E" : "#fff";
//   const textColor = isDark ? "#EDEDED" : "#111";
//   const subTextColor = isDark ? "#BBBBBB" : "#555";
//   const borderColor = isDark ? "#333" : "#00000015";
//   const shadowColor = isDark ? "#000" : "#43C6AC";

//   // ✅ Pick correct image (thumbnail or first Base64 image)
//   const displayImage =
//     item?.thumbnail ||
//     (item?.images && item.images.length > 0 ? item.images[0] : null);

//   return (
//     <Animatable.View animation="fadeInUp" duration={500} style={styles.wrapper}>
//       <TouchableOpacity
//         activeOpacity={0.93}
//         onPress={onPress}
//         style={[
//           styles.card,
//           {
//             width: cardWidth,
//             backgroundColor: bgColor,
//             borderColor,
//             shadowColor,
//           },
//         ]}
//       >
//         {/* 🏡 Image */}
//         {displayImage ? (
//           <Image
//             source={{ uri: displayImage }}
//             style={styles.image}
//             resizeMode="cover"
//           />
//         ) : (
//           <View
//             style={[
//               styles.image,
//               { backgroundColor: isDark ? "#2C2C2C" : "#f5f5f5" },
//               styles.noImage,
//             ]}
//           >
//             <Map size={42} color={isDark ? "#888" : "#bbb"} />
//           </View>
//         )}

//         {/* 🔖 Bookmark Button */}
//         <TouchableOpacity
//           style={[
//             styles.bookmarkBtn,
//             {
//               backgroundColor: isDark ? "#222" : "#fff",
//               shadowColor: shadowColor,
//             },
//           ]}
//           onPress={handleSave}
//         >
//           {checkingStatus || loadingSave ? (
//             <ActivityIndicator size="small" color="#20A68B" />
//           ) : isSaved ? (
//             <BookmarkCheck size={22} color="#20A68B" strokeWidth={2.4} />
//           ) : (
//             <Bookmark
//               size={22}
//               color={isDark ? "#EDEDED" : "#333"}
//               strokeWidth={2}
//             />
//           )}
//         </TouchableOpacity>

//         {/* 🏠 Content */}
//         <View style={styles.content}>
//           {/* Title & Price */}
//           <View style={styles.rowBetween}>
//             <GlobalText
//               numberOfLines={1}
//               style={[styles.title, { color: textColor }]}
//             >
//               {item?.title || "Untitled Property"}
//             </GlobalText>
//             <GlobalText numberOfLines={1} style={styles.price}>
//               ₹{item?.price ? item.price.toLocaleString("en-IN") : "N/A"}
//             </GlobalText>
//           </View>

//           {/* 📍 Location */}
//           {item?.location ? (
//             <View style={[styles.rowBetween, { marginTop: 4 }]}>
//               <View style={styles.row}>
//                 <MapPin size={15} color={subTextColor} />
//                 <GlobalText
//                   numberOfLines={1}
//                   style={[styles.location, { color: subTextColor }]}
//                 >
//                   {item.location}
//                 </GlobalText>
//               </View>
//               {item?.sqft && (
//                 <GlobalText
//                   numberOfLines={1}
//                   style={[styles.size, { color: subTextColor }]}
//                 >
//                   {item.sqft} sqft
//                 </GlobalText>
//               )}
//             </View>
//           ) : (
//             <View style={styles.infoBox}>
//               <Info size={16} color={subTextColor} />
//               <GlobalText style={[styles.infoText, { color: subTextColor }]}>
//                 Location not provided
//               </GlobalText>
//             </View>
//           )}

//           {/* 🛏️ Features (only if category is House) */}
//           {item?.category?.toLowerCase() === "house" && (
//             <View
//               style={[
//                 styles.featuresRow,
//                 { borderTopColor: isDark ? "#333" : "#00000015" },
//               ]}
//             >
//               <View style={styles.feature}>
//                 <Bed size={16} color="#FF6B6B" />
//                 <GlobalText
//                   style={[styles.featureText, { color: subTextColor }]}
//                 >
//                   {formatField("Bed", item?.bedrooms)}
//                 </GlobalText>
//               </View>

//               <View style={styles.feature}>
//                 <Bath size={16} color="#3AAFA9" />
//                 <GlobalText
//                   style={[styles.featureText, { color: subTextColor }]}
//                 >
//                   {formatField("Bath", item?.bathrooms)}
//                 </GlobalText>
//               </View>

//               <View style={styles.feature}>
//                 <UtensilsCrossed size={16} color="#FFA41B" />
//                 <GlobalText
//                   style={[styles.featureText, { color: subTextColor }]}
//                 >
//                   {item?.kitchen ? `${item.kitchen} Kitchen` : "N/A Kitchen"}
//                 </GlobalText>
//               </View>

//               {item?.location && (
//                 <TouchableOpacity onPress={openMaps} style={styles.mapBtn}>
//                   <Map size={18} color="#20A68B" />
//                 </TouchableOpacity>
//               )}
//             </View>
//           )}
//         </View>
//       </TouchableOpacity>
//     </Animatable.View>
//   );
// }

// const styles = StyleSheet.create({
//   wrapper: {
//     alignItems: "center",
//     marginVertical: 12,
//   },
//   card: {
//     borderRadius: 22,
//     borderWidth: 1,
//     shadowOpacity: 0.12,
//     shadowOffset: { width: 0, height: 5 },
//     shadowRadius: 8,
//     elevation: 5,
//     overflow: "hidden",
//   },
//   image: {
//     width: "100%",
//     height: 180,
//     borderTopLeftRadius: 22,
//     borderTopRightRadius: 22,
//   },
//   noImage: {
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   bookmarkBtn: {
//     position: "absolute",
//     top: 14,
//     right: 14,
//     padding: 7,
//     borderRadius: 20,
//     elevation: 5,
//   },
//   content: {
//     padding: 14,
//   },
//   rowBetween: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   row: {
//     flexDirection: "row",
//     alignItems: "center",
//     flexShrink: 1,
//   },
//   title: {
//     fontSize: 16,
//     fontWeight: "700",
//     maxWidth: "65%",
//   },
//   price: {
//     fontSize: 17,
//     fontWeight: "800",
//     color: "#20A68B",
//     textAlign: "right",
//   },
//   location: {
//     fontSize: 12,
//     marginLeft: 4,
//     maxWidth: 160,
//   },
//   size: {
//     fontSize: 12,
//   },
//   featuresRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginTop: 10,
//     borderTopWidth: 0.8,
//     paddingTop: 8,
//   },
//   feature: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   featureText: {
//     fontSize: 12,
//     marginLeft: 5,
//     maxWidth: 70,
//   },
//   mapBtn: {
//     padding: 6,
//     backgroundColor: "#E6F6F2",
//     borderRadius: 10,
//   },
//   infoBox: { flexDirection: "row", alignItems: "center", marginTop: 5 },
//   infoText: { fontSize: 12, marginLeft: 5 },
// });


// // import React, { useState, useEffect, useMemo } from "react";
// // import {
// //   View,
// //   Image,
// //   StyleSheet,
// //   TouchableOpacity,
// //   Linking,
// //   useWindowDimensions,
// //   Alert,
// //   ActivityIndicator,
// //   useColorScheme,
// // } from "react-native";
// // import * as Animatable from "react-native-animatable";
// // import { useTheme } from "@react-navigation/native";
// // import {
// //   Bed,
// //   Bath,
// //   UtensilsCrossed,
// //   MapPin,
// //   Bookmark,
// //   BookmarkCheck,
// //   Map,
// //   Info,
// // } from "lucide-react-native";
// // import GlobalText from "../../theme/GlobalText";
// // import { saveProperty, unsaveProperty, getUserProfile } from "../../api/api";

// // export default function PropertyCard({ item, onPress }) {
// //   const { width } = useWindowDimensions();
// //   const scheme = useColorScheme();
// //   const { colors } = useTheme();
// //   const isDark = scheme === "dark";

// //   const [isSaved, setIsSaved] = useState(false);
// //   const [loadingSave, setLoadingSave] = useState(false);
// //   const [checkingStatus, setCheckingStatus] = useState(true);

// //   const cardWidth = useMemo(() => width * 0.9, [width]);

// //   const formatField = (label, value) => {
// //     if (!value || value === "" || value === "undefined" || value === null)
// //       return `N/A ${label}`;
// //     return `${value} ${label}`;
// //   };

// //   // ✅ Check if property already saved in backend
// //   useEffect(() => {
// //     const checkSavedStatus = async () => {
// //       try {
// //         const userData = await getUserProfile();
// //         const savedList =
// //           userData?.savedProperties || userData?.favourites || [];
// //         const found = savedList.some(
// //           (p) => p?._id === item?._id || p === item?._id
// //         );
// //         setIsSaved(found);
// //       } catch (err) {
// //         console.warn("Error checking saved status:", err.message);
// //       } finally {
// //         setCheckingStatus(false);
// //       }
// //     };
// //     checkSavedStatus();
// //   }, [item?._id]);

// //   // ✅ Handle save/unsave toggle
// //   const handleSave = async () => {
// //     if (loadingSave || checkingStatus) return;
// //     setLoadingSave(true);
// //     try {
// //       if (isSaved) {
// //         await unsaveProperty(item._id);
// //         setIsSaved(false);
// //       } else {
// //         await saveProperty(item._id);
// //         setIsSaved(true);
// //       }
// //     } catch (err) {
// //       console.error("Save/Unsave error:", err.message);
// //       Alert.alert("Error", "Unable to update saved status.");
// //     } finally {
// //       setLoadingSave(false);
// //     }
// //   };

// //   const openMaps = () => {
// //     const location = item?.mapLocation || item?.location;
// //     if (!location?.trim()) return;
// //     const encoded = encodeURIComponent(location);
// //     const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encoded}`;
// //     Linking.openURL(mapUrl);
// //   };

// //   const bgColor = isDark ? "#1E1E1E" : "#fff";
// //   const textColor = isDark ? "#EDEDED" : "#111";
// //   const subTextColor = isDark ? "#BBBBBB" : "#555";
// //   const borderColor = isDark ? "#333" : "#00000015";
// //   const shadowColor = isDark ? "#000" : "#43C6AC";

// //   // ✅ Choose display image
// //   const displayImage =
// //     item?.thumbnail ||
// //     (item?.images && item.images.length > 0 ? item.images[0] : null);

// //   return (
// //     <Animatable.View animation="fadeInUp" duration={500} style={styles.wrapper}>
// //       <TouchableOpacity
// //         activeOpacity={0.93}
// //         onPress={onPress}
// //         style={[
// //           styles.card,
// //           {
// //             width: cardWidth,
// //             backgroundColor: bgColor,
// //             borderColor,
// //             shadowColor,
// //           },
// //         ]}
// //       >
// //         {/* 🏡 Image */}
// //         {displayImage ? (
// //           <Image
// //             source={{ uri: displayImage }}
// //             style={styles.image}
// //             resizeMode="cover"
// //           />
// //         ) : (
// //           <View
// //             style={[
// //               styles.image,
// //               { backgroundColor: isDark ? "#2C2C2C" : "#f5f5f5" },
// //               styles.noImage,
// //             ]}
// //           >
// //             <Map size={42} color={isDark ? "#888" : "#bbb"} />
// //           </View>
// //         )}

// //         {/* 🔖 Bookmark Icon */}
// //         <TouchableOpacity
// //           style={[
// //             styles.bookmarkBtn,
// //             {
// //               backgroundColor: isDark ? "#222" : "#fff",
// //               shadowColor: shadowColor,
// //             },
// //           ]}
// //           onPress={handleSave}
// //         >
// //           {checkingStatus || loadingSave ? (
// //             <ActivityIndicator size="small" color="#20A68B" />
// //           ) : isSaved ? (
// //             <BookmarkCheck size={22} color="#20A68B" strokeWidth={2.4} />
// //           ) : (
// //             <Bookmark
// //               size={22}
// //               color={isDark ? "#EDEDED" : "#333"}
// //               strokeWidth={2}
// //             />
// //           )}
// //         </TouchableOpacity>

// //         {/* 🏠 Property Info */}
// //         <View style={styles.content}>
// //           {/* Title + Price */}
// //           <View style={styles.rowBetween}>
// //             <GlobalText
// //               numberOfLines={1}
// //               style={[styles.title, { color: textColor }]}
// //             >
// //               {item?.title || "Untitled Property"}
// //             </GlobalText>
// //             <GlobalText numberOfLines={1} style={styles.price}>
// //               ₹{item?.price ? item.price.toLocaleString("en-IN") : "N/A"}
// //             </GlobalText>
// //           </View>

// //           {/* 📍 Location */}
// //           {item?.location ? (
// //             <View style={[styles.rowBetween, { marginTop: 4 }]}>
// //               <View style={styles.row}>
// //                 <MapPin size={15} color={subTextColor} />
// //                 <GlobalText
// //                   numberOfLines={1}
// //                   style={[styles.location, { color: subTextColor }]}
// //                 >
// //                   {item.location}
// //                 </GlobalText>
// //               </View>
// //               {item?.sqft && (
// //                 <GlobalText
// //                   numberOfLines={1}
// //                   style={[styles.size, { color: subTextColor }]}
// //                 >
// //                   {item.sqft} sqft
// //                 </GlobalText>
// //               )}
// //             </View>
// //           ) : (
// //             <View style={styles.infoBox}>
// //               <Info size={16} color={subTextColor} />
// //               <GlobalText style={[styles.infoText, { color: subTextColor }]}>
// //                 Location not provided
// //               </GlobalText>
// //             </View>
// //           )}

// //           {/* 🛏️ Features (only for type = home) */}
// //           {item?.type?.toLowerCase() === "home" && (
// //             <View
// //               style={[
// //                 styles.featuresRow,
// //                 { borderTopColor: isDark ? "#333" : "#00000015" },
// //               ]}
// //             >
// //               <View style={styles.feature}>
// //                 <Bed size={16} color="#FF6B6B" />
// //                 <GlobalText
// //                   style={[styles.featureText, { color: subTextColor }]}
// //                 >
// //                   {formatField("Bed", item?.bedrooms)}
// //                 </GlobalText>
// //               </View>

// //               <View style={styles.feature}>
// //                 <Bath size={16} color="#3AAFA9" />
// //                 <GlobalText
// //                   style={[styles.featureText, { color: subTextColor }]}
// //                 >
// //                   {formatField("Bath", item?.bathrooms)}
// //                 </GlobalText>
// //               </View>

// //               <View style={styles.feature}>
// //                 <UtensilsCrossed size={16} color="#FFA41B" />
// //                 <GlobalText
// //                   style={[styles.featureText, { color: subTextColor }]}
// //                 >
// //                   {item?.kitchen ? `${item.kitchen} Kitchen` : "N/A Kitchen"}
// //                 </GlobalText>
// //               </View>

// //               {item?.location && (
// //                 <TouchableOpacity onPress={openMaps} style={styles.mapBtn}>
// //                   <Map size={18} color="#20A68B" />
// //                 </TouchableOpacity>
// //               )}
// //             </View>
// //           )}
// //         </View>
// //       </TouchableOpacity>
// //     </Animatable.View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   wrapper: {
// //     alignItems: "center",
// //     marginVertical: 12,
// //   },
// //   card: {
// //     borderRadius: 22,
// //     borderWidth: 1,
// //     shadowOpacity: 0.12,
// //     shadowOffset: { width: 0, height: 5 },
// //     shadowRadius: 8,
// //     elevation: 5,
// //     overflow: "hidden",
// //   },
// //   image: {
// //     width: "100%",
// //     height: 180,
// //     borderTopLeftRadius: 22,
// //     borderTopRightRadius: 22,
// //   },
// //   noImage: {
// //     justifyContent: "center",
// //     alignItems: "center",
// //   },
// //   bookmarkBtn: {
// //     position: "absolute",
// //     top: 14,
// //     right: 14,
// //     padding: 7,
// //     borderRadius: 20,
// //     elevation: 5,
// //   },
// //   content: {
// //     padding: 14,
// //   },
// //   rowBetween: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "center",
// //   },
// //   row: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     flexShrink: 1,
// //   },
// //   title: {
// //     fontSize: 16,
// //     fontWeight: "700",
// //     maxWidth: "65%",
// //   },
// //   price: {
// //     fontSize: 17,
// //     fontWeight: "800",
// //     color: "#20A68B",
// //     textAlign: "right",
// //   },
// //   location: {
// //     fontSize: 12,
// //     marginLeft: 4,
// //     maxWidth: 160,
// //   },
// //   size: {
// //     fontSize: 12,
// //   },
// //   featuresRow: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "center",
// //     marginTop: 10,
// //     borderTopWidth: 0.8,
// //     paddingTop: 8,
// //   },
// //   feature: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //   },
// //   featureText: {
// //     fontSize: 12,
// //     marginLeft: 5,
// //     maxWidth: 70,
// //   },
// //   mapBtn: {
// //     padding: 6,
// //     backgroundColor: "#E6F6F2",
// //     borderRadius: 10,
// //   },
// //   infoBox: { flexDirection: "row", alignItems: "center", marginTop: 5 },
// //   infoText: { fontSize: 12, marginLeft: 5 },
// // });

// // // import React, { useState, useEffect, useMemo } from "react";
// // // import {
// // //   View,
// // //   Image,
// // //   StyleSheet,
// // //   TouchableOpacity,
// // //   Linking,
// // //   useWindowDimensions,
// // //   Alert,
// // //   ActivityIndicator,
// // //   useColorScheme,
// // // } from "react-native";
// // // import * as Animatable from "react-native-animatable";
// // // import { useTheme } from "@react-navigation/native";
// // // import {
// // //   Bed,
// // //   Bath,
// // //   UtensilsCrossed,
// // //   MapPin,
// // //   Bookmark,
// // //   BookmarkCheck,
// // //   Map,
// // //   Info,
// // // } from "lucide-react-native";
// // // import GlobalText from "../../theme/GlobalText";
// // // import { saveProperty, unsaveProperty, getUserProfile } from "../../api/api";

// // // export default function PropertyCard({ item, onPress }) {
// // //   const { width } = useWindowDimensions();
// // //   const scheme = useColorScheme();
// // //   const { colors } = useTheme();
// // //   const isDark = scheme === "dark";

// // //   const [isSaved, setIsSaved] = useState(false);
// // //   const [loadingSave, setLoadingSave] = useState(false);
// // //   const [checkingStatus, setCheckingStatus] = useState(true);

// // //   const cardWidth = useMemo(() => width * 0.9, [width]);

// // //   const formatField = (label, value) => {
// // //     if (!value || value === "" || value === "undefined" || value === null)
// // //       return `N/A ${label}`;
// // //     return `${value} ${label}`;
// // //   };

// // //   // ✅ Check if property already saved
// // //   useEffect(() => {
// // //     const checkSavedStatus = async () => {
// // //       try {
// // //         const userData = await getUserProfile();
// // //         const savedList =
// // //           userData?.savedProperties || userData?.favourites || [];
// // //         const found = savedList.some(
// // //           (p) => p?._id === item?._id || p === item?._id
// // //         );
// // //         setIsSaved(found);
// // //       } catch (err) {
// // //         console.warn("Error checking saved status:", err.message);
// // //       } finally {
// // //         setCheckingStatus(false);
// // //       }
// // //     };
// // //     checkSavedStatus();
// // //   }, [item?._id]);

// // //   const handleSave = async () => {
// // //     if (loadingSave || checkingStatus) return;
// // //     setLoadingSave(true);
// // //     try {
// // //       if (isSaved) {
// // //         await unsaveProperty(item._id);
// // //         setIsSaved(false);
// // //       } else {
// // //         await saveProperty(item._id);
// // //         setIsSaved(true);
// // //       }
// // //     } catch (err) {
// // //       console.error("Save/Unsave error:", err.message);
// // //       Alert.alert("Error", "Unable to update saved status.");
// // //     } finally {
// // //       setLoadingSave(false);
// // //     }
// // //   };

// // //   const openMaps = () => {
// // //     const location = item?.mapLocation || item?.location;
// // //     if (!location?.trim()) return;
// // //     const encoded = encodeURIComponent(location);
// // //     const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encoded}`;
// // //     Linking.openURL(mapUrl);
// // //   };

// // //   const bgColor = isDark ? "#1E1E1E" : "#fff";
// // //   const textColor = isDark ? "#EDEDED" : "#111";
// // //   const subTextColor = isDark ? "#BBBBBB" : "#555";
// // //   const borderColor = isDark ? "#333" : "#00000015";
// // //   const shadowColor = isDark ? "#000" : "#43C6AC";

// // //   // ✅ Pick correct image (either thumbnail or first Base64 image)
// // //   const displayImage =
// // //     item?.thumbnail ||
// // //     (item?.images && item.images.length > 0 ? item.images[0] : null);

// // //   return (
// // //     <Animatable.View animation="fadeInUp" duration={500} style={styles.wrapper}>
// // //       <TouchableOpacity
// // //         activeOpacity={0.93}
// // //         onPress={onPress}
// // //         style={[
// // //           styles.card,
// // //           {
// // //             width: cardWidth,
// // //             backgroundColor: bgColor,
// // //             borderColor,
// // //             shadowColor,
// // //           },
// // //         ]}
// // //       >
// // //         {/* 🏡 Image */}
// // //         {displayImage ? (
// // //           <Image
// // //             source={{ uri: displayImage }}
// // //             style={styles.image}
// // //             resizeMode="cover"
// // //           />
// // //         ) : (
// // //           <View
// // //             style={[
// // //               styles.image,
// // //               { backgroundColor: isDark ? "#2C2C2C" : "#f5f5f5" },
// // //               styles.noImage,
// // //             ]}
// // //           >
// // //             <Map size={42} color={isDark ? "#888" : "#bbb"} />
// // //           </View>
// // //         )}

// // //         {/* 🔖 Bookmark */}
// // //         <TouchableOpacity
// // //           style={[
// // //             styles.bookmarkBtn,
// // //             {
// // //               backgroundColor: isDark ? "#222" : "#fff",
// // //               shadowColor: shadowColor,
// // //             },
// // //           ]}
// // //           onPress={handleSave}
// // //         >
// // //           {checkingStatus || loadingSave ? (
// // //             <ActivityIndicator size="small" color="#20A68B" />
// // //           ) : isSaved ? (
// // //             <BookmarkCheck size={22} color="#20A68B" strokeWidth={2.4} />
// // //           ) : (
// // //             <Bookmark
// // //               size={22}
// // //               color={isDark ? "#EDEDED" : "#333"}
// // //               strokeWidth={2}
// // //             />
// // //           )}
// // //         </TouchableOpacity>

// // //         {/* 🏠 Content */}
// // //         <View style={styles.content}>
// // //           {/* Title & Price */}
// // //           <View style={styles.rowBetween}>
// // //             <GlobalText
// // //               numberOfLines={1}
// // //               style={[styles.title, { color: textColor }]}
// // //             >
// // //               {item?.title || "Untitled Property"}
// // //             </GlobalText>
// // //             <GlobalText numberOfLines={1} style={styles.price}>
// // //               ₹{item?.price ? item.price.toLocaleString("en-IN") : "N/A"}
// // //             </GlobalText>
// // //           </View>

// // //           {/* 📍 Location */}
// // //           {item?.location ? (
// // //             <View style={[styles.rowBetween, { marginTop: 4 }]}>
// // //               <View style={styles.row}>
// // //                 <MapPin size={15} color={subTextColor} />
// // //                 <GlobalText
// // //                   numberOfLines={1}
// // //                   style={[styles.location, { color: subTextColor }]}
// // //                 >
// // //                   {item.location}
// // //                 </GlobalText>
// // //               </View>
// // //               {item?.sqft && (
// // //                 <GlobalText
// // //                   numberOfLines={1}
// // //                   style={[styles.size, { color: subTextColor }]}
// // //                 >
// // //                   {item.sqft} sqft
// // //                 </GlobalText>
// // //               )}
// // //             </View>
// // //           ) : (
// // //             <View style={styles.infoBox}>
// // //               <Info size={16} color={subTextColor} />
// // //               <GlobalText style={[styles.infoText, { color: subTextColor }]}>
// // //                 Location not provided
// // //               </GlobalText>
// // //             </View>
// // //           )}

// // //           {/* 🛏️ Features (show only for Home) */}
// // //           {item?.type?.toLowerCase() === "home" && (
// // //             <View
// // //               style={[
// // //                 styles.featuresRow,
// // //                 { borderTopColor: isDark ? "#333" : "#00000015" },
// // //               ]}
// // //             >
// // //               <View style={styles.feature}>
// // //                 <Bed size={16} color="#FF6B6B" />
// // //                 <GlobalText
// // //                   style={[styles.featureText, { color: subTextColor }]}
// // //                 >
// // //                   {formatField("Bed", item?.bedrooms)}
// // //                 </GlobalText>
// // //               </View>

// // //               <View style={styles.feature}>
// // //                 <Bath size={16} color="#3AAFA9" />
// // //                 <GlobalText
// // //                   style={[styles.featureText, { color: subTextColor }]}
// // //                 >
// // //                   {formatField("Bath", item?.bathrooms)}
// // //                 </GlobalText>
// // //               </View>

// // //               <View style={styles.feature}>
// // //                 <UtensilsCrossed size={16} color="#FFA41B" />
// // //                 <GlobalText
// // //                   style={[styles.featureText, { color: subTextColor }]}
// // //                 >
// // //                   {item?.kitchen ? `${item.kitchen} Kitchen` : "N/A Kitchen"}
// // //                 </GlobalText>
// // //               </View>

// // //               {item?.location && (
// // //                 <TouchableOpacity onPress={openMaps} style={styles.mapBtn}>
// // //                   <Map size={18} color="#20A68B" />
// // //                 </TouchableOpacity>
// // //               )}
// // //             </View>
// // //           )}
// // //         </View>
// // //       </TouchableOpacity>
// // //     </Animatable.View>
// // //   );
// // // }

// // // const styles = StyleSheet.create({
// // //   wrapper: {
// // //     alignItems: "center",
// // //     marginVertical: 12,
// // //   },
// // //   card: {
// // //     borderRadius: 22,
// // //     borderWidth: 1,
// // //     shadowOpacity: 0.12,
// // //     shadowOffset: { width: 0, height: 5 },
// // //     shadowRadius: 8,
// // //     elevation: 5,
// // //     overflow: "hidden",
// // //   },
// // //   image: {
// // //     width: "100%",
// // //     height: 180,
// // //     borderTopLeftRadius: 22,
// // //     borderTopRightRadius: 22,
// // //   },
// // //   noImage: {
// // //     justifyContent: "center",
// // //     alignItems: "center",
// // //   },
// // //   bookmarkBtn: {
// // //     position: "absolute",
// // //     top: 14,
// // //     right: 14,
// // //     padding: 7,
// // //     borderRadius: 20,
// // //     elevation: 5,
// // //   },
// // //   content: {
// // //     padding: 14,
// // //   },
// // //   rowBetween: {
// // //     flexDirection: "row",
// // //     justifyContent: "space-between",
// // //     alignItems: "center",
// // //   },
// // //   row: {
// // //     flexDirection: "row",
// // //     alignItems: "center",
// // //     flexShrink: 1,
// // //   },
// // //   title: {
// // //     fontSize: 16,
// // //     fontWeight: "700",
// // //     maxWidth: "65%",
// // //   },
// // //   price: {
// // //     fontSize: 17,
// // //     fontWeight: "800",
// // //     color: "#20A68B",
// // //     textAlign: "right",
// // //   },
// // //   location: {
// // //     fontSize: 12,
// // //     marginLeft: 4,
// // //     maxWidth: 160,
// // //   },
// // //   size: {
// // //     fontSize: 12,
// // //   },
// // //   featuresRow: {
// // //     flexDirection: "row",
// // //     justifyContent: "space-between",
// // //     alignItems: "center",
// // //     marginTop: 10,
// // //     borderTopWidth: 0.8,
// // //     paddingTop: 8,
// // //   },
// // //   feature: {
// // //     flexDirection: "row",
// // //     alignItems: "center",
// // //   },
// // //   featureText: {
// // //     fontSize: 12,
// // //     marginLeft: 5,
// // //     maxWidth: 70,
// // //   },
// // //   mapBtn: {
// // //     padding: 6,
// // //     backgroundColor: "#E6F6F2",
// // //     borderRadius: 10,
// // //   },
// // //   infoBox: { flexDirection: "row", alignItems: "center", marginTop: 5 },
// // //   infoText: { fontSize: 12, marginLeft: 5 },
// // // });

// // // import React, { useState, useEffect, useMemo } from "react";
// // // import {
// // //   View,
// // //   Image,
// // //   StyleSheet,
// // //   TouchableOpacity,
// // //   Linking,
// // //   useWindowDimensions,
// // //   Alert,
// // //   ActivityIndicator,
// // //   useColorScheme,
// // // } from "react-native";
// // // import * as Animatable from "react-native-animatable";
// // // import { useTheme } from "@react-navigation/native";
// // // import {
// // //   Bed,
// // //   Bath,
// // //   UtensilsCrossed,
// // //   MapPin,
// // //   Bookmark,
// // //   BookmarkCheck,
// // //   Map,
// // //   Info,
// // // } from "lucide-react-native";
// // // import GlobalText from "../../theme/GlobalText";
// // // import { saveProperty, unsaveProperty, getUserProfile } from "../../api/api";

// // // export default function PropertyCard({ item, onPress }) {
// // //   const { width } = useWindowDimensions();
// // //   const scheme = useColorScheme();
// // //   const { colors } = useTheme();
// // //   const isDark = scheme === "dark";

// // //   const [isSaved, setIsSaved] = useState(false);
// // //   const [loadingSave, setLoadingSave] = useState(false);
// // //   const [checkingStatus, setCheckingStatus] = useState(true);

// // //   const cardWidth = useMemo(() => width * 0.9, [width]);

// // //   const formatField = (label, value) => {
// // //     if (!value || value === "" || value === "undefined" || value === null)
// // //       return `N/A ${label}`;
// // //     return `${value} ${label}`;
// // //   };

// // //   // ✅ Check if property already saved
// // //   useEffect(() => {
// // //     const checkSavedStatus = async () => {
// // //       try {
// // //         const userData = await getUserProfile();
// // //         const savedList =
// // //           userData?.savedProperties || userData?.favourites || [];
// // //         const found = savedList.some(
// // //           (p) => p?._id === item?._id || p === item?._id
// // //         );
// // //         setIsSaved(found);
// // //       } catch (err) {
// // //         console.warn("Error checking saved status:", err.message);
// // //       } finally {
// // //         setCheckingStatus(false);
// // //       }
// // //     };
// // //     checkSavedStatus();
// // //   }, [item?._id]);

// // //   const handleSave = async () => {
// // //     if (loadingSave || checkingStatus) return;
// // //     setLoadingSave(true);
// // //     try {
// // //       if (isSaved) {
// // //         await unsaveProperty(item._id);
// // //         setIsSaved(false);
// // //       } else {
// // //         await saveProperty(item._id);
// // //         setIsSaved(true);
// // //       }
// // //     } catch (err) {
// // //       console.error("Save/Unsave error:", err.message);
// // //       Alert.alert("Error", "Unable to update saved status.");
// // //     } finally {
// // //       setLoadingSave(false);
// // //     }
// // //   };

// // //   const openMaps = () => {
// // //     const location = item?.mapLocation || item?.location;
// // //     if (!location?.trim()) return;
// // //     const encoded = encodeURIComponent(location);
// // //     const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encoded}`;
// // //     Linking.openURL(mapUrl);
// // //   };

// // //   const bgColor = isDark ? "#1E1E1E" : "#fff";
// // //   const textColor = isDark ? "#EDEDED" : "#111";
// // //   const subTextColor = isDark ? "#BBBBBB" : "#555";
// // //   const borderColor = isDark ? "#333" : "#00000015";
// // //   const shadowColor = isDark ? "#000" : "#43C6AC";

// // //   // ✅ Pick correct image (either thumbnail or first Base64 image)
// // //   const displayImage =
// // //     item?.thumbnail ||
// // //     (item?.images && item.images.length > 0 ? item.images[0] : null);

// // //   return (
// // //     <Animatable.View animation="fadeInUp" duration={500} style={styles.wrapper}>
// // //       <TouchableOpacity
// // //         activeOpacity={0.93}
// // //         onPress={onPress}
// // //         style={[
// // //           styles.card,
// // //           {
// // //             width: cardWidth,
// // //             backgroundColor: bgColor,
// // //             borderColor,
// // //             shadowColor,
// // //           },
// // //         ]}
// // //       >
// // //         {/* 🏡 Image */}
// // //         {displayImage ? (
// // //           <Image
// // //             source={{ uri: displayImage }}
// // //             style={styles.image}
// // //             resizeMode="cover"
// // //           />
// // //         ) : (
// // //           <View
// // //             style={[
// // //               styles.image,
// // //               { backgroundColor: isDark ? "#2C2C2C" : "#f5f5f5" },
// // //               styles.noImage,
// // //             ]}
// // //           >
// // //             <Map size={42} color={isDark ? "#888" : "#bbb"} />
// // //           </View>
// // //         )}

// // //         {/* 🔖 Bookmark */}
// // //         <TouchableOpacity
// // //           style={[
// // //             styles.bookmarkBtn,
// // //             {
// // //               backgroundColor: isDark ? "#222" : "#fff",
// // //               shadowColor: shadowColor,
// // //             },
// // //           ]}
// // //           onPress={handleSave}
// // //         >
// // //           {checkingStatus || loadingSave ? (
// // //             <ActivityIndicator size="small" color="#20A68B" />
// // //           ) : isSaved ? (
// // //             <BookmarkCheck size={22} color="#20A68B" strokeWidth={2.4} />
// // //           ) : (
// // //             <Bookmark
// // //               size={22}
// // //               color={isDark ? "#EDEDED" : "#333"}
// // //               strokeWidth={2}
// // //             />
// // //           )}
// // //         </TouchableOpacity>

// // //         {/* 🏠 Content */}
// // //         <View style={styles.content}>
// // //           {/* Title & Price */}
// // //           <View style={styles.rowBetween}>
// // //             <GlobalText
// // //               numberOfLines={1}
// // //               style={[styles.title, { color: textColor }]}
// // //             >
// // //               {item?.title || "Untitled Property"}
// // //             </GlobalText>
// // //             <GlobalText numberOfLines={1} style={styles.price}>
// // //               ₹{item?.price ? item.price.toLocaleString("en-IN") : "N/A"}
// // //             </GlobalText>
// // //           </View>

// // //           {/* 📍 Location */}
// // //           {item?.location ? (
// // //             <View style={[styles.rowBetween, { marginTop: 4 }]}>
// // //               <View style={styles.row}>
// // //                 <MapPin size={15} color={subTextColor} />
// // //                 <GlobalText
// // //                   numberOfLines={1}
// // //                   style={[styles.location, { color: subTextColor }]}
// // //                 >
// // //                   {item.location}
// // //                 </GlobalText>
// // //               </View>
// // //               {item?.sqft && (
// // //                 <GlobalText
// // //                   numberOfLines={1}
// // //                   style={[styles.size, { color: subTextColor }]}
// // //                 >
// // //                   {item.sqft} sqft
// // //                 </GlobalText>
// // //               )}
// // //             </View>
// // //           ) : (
// // //             <View style={styles.infoBox}>
// // //               <Info size={16} color={subTextColor} />
// // //               <GlobalText style={[styles.infoText, { color: subTextColor }]}>
// // //                 Location not provided
// // //               </GlobalText>
// // //             </View>
// // //           )}

// // //           {/* 🛏️ Features */}
// // //           <View
// // //             style={[
// // //               styles.featuresRow,
// // //               { borderTopColor: isDark ? "#333" : "#00000015" },
// // //             ]}
// // //           >
// // //             <View style={styles.feature}>
// // //               <Bed size={16} color="#FF6B6B" />
// // //               <GlobalText
// // //                 style={[styles.featureText, { color: subTextColor }]}
// // //               >
// // //                 {formatField("Bed", item?.bedrooms)}
// // //               </GlobalText>
// // //             </View>

// // //             <View style={styles.feature}>
// // //               <Bath size={16} color="#3AAFA9" />
// // //               <GlobalText
// // //                 style={[styles.featureText, { color: subTextColor }]}
// // //               >
// // //                 {formatField("Bath", item?.bathrooms)}
// // //               </GlobalText>
// // //             </View>

// // //             <View style={styles.feature}>
// // //               <UtensilsCrossed size={16} color="#FFA41B" />
// // //               <GlobalText
// // //                 style={[styles.featureText, { color: subTextColor }]}
// // //               >
// // //                 {item?.kitchen ? `${item.kitchen} Kitchen` : "N/A Kitchen"}
// // //               </GlobalText>
// // //             </View>

// // //             {item?.location && (
// // //               <TouchableOpacity onPress={openMaps} style={styles.mapBtn}>
// // //                 <Map size={18} color="#20A68B" />
// // //               </TouchableOpacity>
// // //             )}
// // //           </View>
// // //         </View>
// // //       </TouchableOpacity>
// // //     </Animatable.View>
// // //   );
// // // }

// // // const styles = StyleSheet.create({
// // //   wrapper: {
// // //     alignItems: "center",
// // //     marginVertical: 12,
// // //   },
// // //   card: {
// // //     borderRadius: 22,
// // //     borderWidth: 1,
// // //     shadowOpacity: 0.12,
// // //     shadowOffset: { width: 0, height: 5 },
// // //     shadowRadius: 8,
// // //     elevation: 5,
// // //     overflow: "hidden",
// // //   },
// // //   image: {
// // //     width: "100%",
// // //     height: 180,
// // //     borderTopLeftRadius: 22,
// // //     borderTopRightRadius: 22,
// // //   },
// // //   noImage: {
// // //     justifyContent: "center",
// // //     alignItems: "center",
// // //   },
// // //   bookmarkBtn: {
// // //     position: "absolute",
// // //     top: 14,
// // //     right: 14,
// // //     padding: 7,
// // //     borderRadius: 20,
// // //     elevation: 5,
// // //   },
// // //   content: {
// // //     padding: 14,
// // //   },
// // //   rowBetween: {
// // //     flexDirection: "row",
// // //     justifyContent: "space-between",
// // //     alignItems: "center",
// // //   },
// // //   row: {
// // //     flexDirection: "row",
// // //     alignItems: "center",
// // //     flexShrink: 1,
// // //   },
// // //   title: {
// // //     fontSize: 16,
// // //     fontWeight: "700",
// // //     maxWidth: "65%",
// // //   },
// // //   price: {
// // //     fontSize: 17,
// // //     fontWeight: "800",
// // //     color: "#20A68B",
// // //     textAlign: "right",
// // //   },
// // //   location: {
// // //     fontSize: 12,
// // //     marginLeft: 4,
// // //     maxWidth: 160,
// // //   },
// // //   size: {
// // //     fontSize: 12,
// // //   },
// // //   featuresRow: {
// // //     flexDirection: "row",
// // //     justifyContent: "space-between",
// // //     alignItems: "center",
// // //     marginTop: 10,
// // //     borderTopWidth: 0.8,
// // //     paddingTop: 8,
// // //   },
// // //   feature: {
// // //     flexDirection: "row",
// // //     alignItems: "center",
// // //   },
// // //   featureText: {
// // //     fontSize: 12,
// // //     marginLeft: 5,
// // //     maxWidth: 70,
// // //   },
// // //   mapBtn: {
// // //     padding: 6,
// // //     backgroundColor: "#E6F6F2",
// // //     borderRadius: 10,
// // //   },
// // //   infoBox: { flexDirection: "row", alignItems: "center", marginTop: 5 },
// // //   infoText: { fontSize: 12, marginLeft: 5 },
// // // });

// // // // import React, { useState, useEffect, useMemo } from "react";
// // // // import {
// // // //   View,
// // // //   Image,
// // // //   StyleSheet,
// // // //   TouchableOpacity,
// // // //   Linking,
// // // //   useWindowDimensions,
// // // //   Alert,
// // // //   ActivityIndicator,
// // // //   useColorScheme,
// // // // } from "react-native";
// // // // import * as Animatable from "react-native-animatable";
// // // // import { useTheme } from "@react-navigation/native";
// // // // import {
// // // //   Bed,
// // // //   Bath,
// // // //   UtensilsCrossed,
// // // //   MapPin,
// // // //   Bookmark,
// // // //   BookmarkCheck,
// // // //   Map,
// // // //   Info,
// // // // } from "lucide-react-native";
// // // // import GlobalText from "../../theme/GlobalText";
// // // // import {
// // // //   saveProperty,
// // // //   unsaveProperty,
// // // //   getUserProfile,
// // // // } from "../../api/api";

// // // // export default function PropertyCard({ item, onPress }) {
// // // //   const { width } = useWindowDimensions();
// // // //   const scheme = useColorScheme();
// // // //   const { colors } = useTheme();

// // // //   const isDark = scheme === "dark";

// // // //   const [isSaved, setIsSaved] = useState(false);
// // // //   const [loadingSave, setLoadingSave] = useState(false);
// // // //   const [checkingStatus, setCheckingStatus] = useState(true);

// // // //   const cardWidth = useMemo(() => width * 0.9, [width]);

// // // //   const formatField = (label, value) => {
// // // //     if (!value || value === "" || value === "undefined" || value === null)
// // // //       return `N/A ${label}`;
// // // //     return `${value} ${label}`;
// // // //   };

// // // //   // ✅ Check if property already saved
// // // //   useEffect(() => {
// // // //     const checkSavedStatus = async () => {
// // // //       try {
// // // //         const userData = await getUserProfile();
// // // //         const savedList =
// // // //           userData?.savedProperties || userData?.favourites || [];
// // // //         const found = savedList.some(
// // // //           (p) => p?._id === item?._id || p === item?._id
// // // //         );
// // // //         setIsSaved(found);
// // // //       } catch (err) {
// // // //         console.warn("Error checking saved status:", err.message);
// // // //       } finally {
// // // //         setCheckingStatus(false);
// // // //       }
// // // //     };
// // // //     checkSavedStatus();
// // // //   }, [item?._id]);

// // // //   const handleSave = async () => {
// // // //     if (loadingSave || checkingStatus) return;
// // // //     setLoadingSave(true);
// // // //     try {
// // // //       if (isSaved) {
// // // //         await unsaveProperty(item._id);
// // // //         setIsSaved(false);
// // // //       } else {
// // // //         await saveProperty(item._id);
// // // //         setIsSaved(true);
// // // //       }
// // // //     } catch (err) {
// // // //       console.error("Save/Unsave error:", err.message);
// // // //       Alert.alert("Error", "Unable to update saved status.");
// // // //     } finally {
// // // //       setLoadingSave(false);
// // // //     }
// // // //   };

// // // //   const openMaps = () => {
// // // //     const location = item?.mapLocation || item?.location;
// // // //     if (!location?.trim()) return;
// // // //     const encoded = encodeURIComponent(location);
// // // //     const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encoded}`;
// // // //     Linking.openURL(mapUrl);
// // // //   };

// // // //   const bgColor = isDark ? "#1E1E1E" : "#fff";
// // // //   const textColor = isDark ? "#EDEDED" : "#111";
// // // //   const subTextColor = isDark ? "#BBBBBB" : "#555";
// // // //   const borderColor = isDark ? "#333" : "#00000015";
// // // //   const shadowColor = isDark ? "#000" : "#43C6AC";

// // // //   return (
// // // //     <Animatable.View animation="fadeInUp" duration={500} style={styles.wrapper}>
// // // //       <TouchableOpacity
// // // //         activeOpacity={0.93}
// // // //         onPress={onPress}
// // // //         style={[
// // // //           styles.card,
// // // //           {
// // // //             width: cardWidth,
// // // //             backgroundColor: bgColor,
// // // //             borderColor,
// // // //             shadowColor,
// // // //           },
// // // //         ]}
// // // //       >
// // // //         {/* 🏡 Image */}
// // // //         {item?.images?.[0] ? (
// // // //           <Image source={{ uri: item.images[0] }} style={styles.image} />
// // // //         ) : (
// // // //           <View
// // // //             style={[
// // // //               styles.image,
// // // //               { backgroundColor: isDark ? "#2C2C2C" : "#f5f5f5" },
// // // //               styles.noImage,
// // // //             ]}
// // // //           >
// // // //             <Map size={42} color={isDark ? "#888" : "#bbb"} />
// // // //           </View>
// // // //         )}

// // // //         {/* 🔖 Bookmark */}
// // // //         <TouchableOpacity
// // // //           style={[
// // // //             styles.bookmarkBtn,
// // // //             {
// // // //               backgroundColor: isDark ? "#222" : "#fff",
// // // //               shadowColor: shadowColor,
// // // //             },
// // // //           ]}
// // // //           onPress={handleSave}
// // // //         >
// // // //           {checkingStatus || loadingSave ? (
// // // //             <ActivityIndicator size="small" color="#20A68B" />
// // // //           ) : isSaved ? (
// // // //             <BookmarkCheck size={22} color="#20A68B" strokeWidth={2.4} />
// // // //           ) : (
// // // //             <Bookmark
// // // //               size={22}
// // // //               color={isDark ? "#EDEDED" : "#333"}
// // // //               strokeWidth={2}
// // // //             />
// // // //           )}
// // // //         </TouchableOpacity>

// // // //         {/* 🏠 Content */}
// // // //         <View style={styles.content}>
// // // //           {/* Title & Price */}
// // // //           <View style={styles.rowBetween}>
// // // //             <GlobalText
// // // //               numberOfLines={1}
// // // //               style={[styles.title, { color: textColor }]}
// // // //             >
// // // //               {item?.title || "Untitled Property"}
// // // //             </GlobalText>
// // // //             <GlobalText
// // // //               numberOfLines={1}
// // // //               style={styles.price}
// // // //             >
// // // //               ₹{item?.price ? item.price.toLocaleString("en-IN") : "N/A"}
// // // //             </GlobalText>
// // // //           </View>

// // // //           {/* 📍 Location */}
// // // //           {item?.location ? (
// // // //             <View style={[styles.rowBetween, { marginTop: 4 }]}>
// // // //               <View style={styles.row}>
// // // //                 <MapPin size={15} color={subTextColor} />
// // // //                 <GlobalText
// // // //                   numberOfLines={1}
// // // //                   style={[styles.location, { color: subTextColor }]}
// // // //                 >
// // // //                   {item.location}
// // // //                 </GlobalText>
// // // //               </View>
// // // //               {item?.sqft && (
// // // //                 <GlobalText
// // // //                   numberOfLines={1}
// // // //                   style={[styles.size, { color: subTextColor }]}
// // // //                 >
// // // //                   {item.sqft} sqft
// // // //                 </GlobalText>
// // // //               )}
// // // //             </View>
// // // //           ) : (
// // // //             <View style={styles.infoBox}>
// // // //               <Info size={16} color={subTextColor} />
// // // //               <GlobalText style={[styles.infoText, { color: subTextColor }]}>
// // // //                 Location not provided
// // // //               </GlobalText>
// // // //             </View>
// // // //           )}

// // // //           {/* 🛏️ Features */}
// // // //           <View
// // // //             style={[
// // // //               styles.featuresRow,
// // // //               { borderTopColor: isDark ? "#333" : "#00000015" },
// // // //             ]}
// // // //           >
// // // //             <View style={styles.feature}>
// // // //               <Bed size={16} color="#FF6B6B" />
// // // //               <GlobalText
// // // //                 style={[styles.featureText, { color: subTextColor }]}
// // // //               >
// // // //                 {formatField("Bed", item?.bedrooms)}
// // // //               </GlobalText>
// // // //             </View>

// // // //             <View style={styles.feature}>
// // // //               <Bath size={16} color="#3AAFA9" />
// // // //               <GlobalText
// // // //                 style={[styles.featureText, { color: subTextColor }]}
// // // //               >
// // // //                 {formatField("Bath", item?.bathrooms)}
// // // //               </GlobalText>
// // // //             </View>

// // // //             <View style={styles.feature}>
// // // //               <UtensilsCrossed size={16} color="#FFA41B" />
// // // //               <GlobalText
// // // //                 style={[styles.featureText, { color: subTextColor }]}
// // // //               >
// // // //                 {item?.kitchen ? `${item.kitchen} Kitchen` : "N/A Kitchen"}
// // // //               </GlobalText>
// // // //             </View>

// // // //             {item?.location && (
// // // //               <TouchableOpacity onPress={openMaps} style={styles.mapBtn}>
// // // //                 <Map size={18} color="#20A68B" />
// // // //               </TouchableOpacity>
// // // //             )}
// // // //           </View>
// // // //         </View>
// // // //       </TouchableOpacity>
// // // //     </Animatable.View>
// // // //   );
// // // // }

// // // // const styles = StyleSheet.create({
// // // //   wrapper: {
// // // //     alignItems: "center",
// // // //     marginVertical: 12,
// // // //   },
// // // //   card: {
// // // //     borderRadius: 22,
// // // //     borderWidth: 1,
// // // //     shadowOpacity: 0.12,
// // // //     shadowOffset: { width: 0, height: 5 },
// // // //     shadowRadius: 8,
// // // //     elevation: 5,
// // // //     overflow: "hidden",
// // // //   },
// // // //   image: {
// // // //     width: "100%",
// // // //     height: 180,
// // // //     borderTopLeftRadius: 22,
// // // //     borderTopRightRadius: 22,
// // // //   },
// // // //   noImage: {
// // // //     justifyContent: "center",
// // // //     alignItems: "center",
// // // //   },
// // // //   bookmarkBtn: {
// // // //     position: "absolute",
// // // //     top: 14,
// // // //     right: 14,
// // // //     padding: 7,
// // // //     borderRadius: 20,
// // // //     elevation: 5,
// // // //   },
// // // //   content: {
// // // //     padding: 14,
// // // //   },
// // // //   rowBetween: {
// // // //     flexDirection: "row",
// // // //     justifyContent: "space-between",
// // // //     alignItems: "center",
// // // //   },
// // // //   row: {
// // // //     flexDirection: "row",
// // // //     alignItems: "center",
// // // //     flexShrink: 1,
// // // //   },
// // // //   title: {
// // // //     fontSize: 16,
// // // //     fontWeight: "700",
// // // //     maxWidth: "65%",
// // // //   },
// // // //   price: {
// // // //     fontSize: 17,
// // // //     fontWeight: "800",
// // // //     color: "#20A68B",
// // // //     textAlign: "right",
// // // //   },
// // // //   location: {
// // // //     fontSize: 12,
// // // //     marginLeft: 4,
// // // //     maxWidth: 160,
// // // //   },
// // // //   size: {
// // // //     fontSize: 12,
// // // //   },
// // // //   featuresRow: {
// // // //     flexDirection: "row",
// // // //     justifyContent: "space-between",
// // // //     alignItems: "center",
// // // //     marginTop: 10,
// // // //     borderTopWidth: 0.8,
// // // //     paddingTop: 8,
// // // //   },
// // // //   feature: {
// // // //     flexDirection: "row",
// // // //     alignItems: "center",
// // // //   },
// // // //   featureText: {
// // // //     fontSize: 12,
// // // //     marginLeft: 5,
// // // //     maxWidth: 70,
// // // //   },
// // // //   mapBtn: {
// // // //     padding: 6,
// // // //     backgroundColor: "#E6F6F2",
// // // //     borderRadius: 10,
// // // //   },
// // // //   infoBox: { flexDirection: "row", alignItems: "center", marginTop: 5 },
// // // //   infoText: { fontSize: 12, marginLeft: 5 },
// // // // });

// // // // // import React, { useState, useEffect, useMemo } from "react";
// // // // // import {
// // // // //   View,
// // // // //   Image,
// // // // //   StyleSheet,
// // // // //   TouchableOpacity,
// // // // //   Linking,
// // // // //   useWindowDimensions,
// // // // //   Alert,
// // // // //   ActivityIndicator,
// // // // // } from "react-native";
// // // // // import * as Animatable from "react-native-animatable";
// // // // // import { useTheme } from "@react-navigation/native";
// // // // // import {
// // // // //   Bed,
// // // // //   Bath,
// // // // //   UtensilsCrossed,
// // // // //   MapPin,
// // // // //   Bookmark,
// // // // //   BookmarkCheck,
// // // // //   Map,
// // // // //   Info,
// // // // // } from "lucide-react-native";
// // // // // import GlobalText from "../../theme/GlobalText";
// // // // // import {
// // // // //   saveProperty,
// // // // //   unsaveProperty,
// // // // //   getUserProfile, // ✅ to get user's saved list
// // // // // } from "../../api/api";

// // // // // export default function PropertyCard({ item, onPress }) {
// // // // //   const { width } = useWindowDimensions();
// // // // //   const { colors } = useTheme();

// // // // //   const [isSaved, setIsSaved] = useState(false);
// // // // //   const [loadingSave, setLoadingSave] = useState(false);
// // // // //   const [checkingStatus, setCheckingStatus] = useState(true);

// // // // //   const cardWidth = useMemo(() => width * 0.9, [width]);

// // // // //   // ✅ Safe formatter
// // // // //   const formatField = (label, value) => {
// // // // //     if (!value || value === "" || value === "undefined" || value === null)
// // // // //       return `N/A ${label}`;
// // // // //     return `${value} ${label}`;
// // // // //   };

// // // // //   // ✅ Check if this property is already saved (runs once per card)
// // // // //   useEffect(() => {
// // // // //     const checkSavedStatus = async () => {
// // // // //       try {
// // // // //         const userData = await getUserProfile();
// // // // //         const savedList = userData?.savedProperties || userData?.favourites || [];
// // // // //         const found = savedList.some(
// // // // //           (p) => p?._id === item?._id || p === item?._id
// // // // //         );
// // // // //         setIsSaved(found);
// // // // //       } catch (err) {
// // // // //         console.warn("Error checking saved status:", err.message);
// // // // //       } finally {
// // // // //         setCheckingStatus(false);
// // // // //       }
// // // // //     };

// // // // //     checkSavedStatus();
// // // // //   }, [item?._id]);

// // // // //   // ✅ Handle save/unsave
// // // // //   const handleSave = async () => {
// // // // //     if (loadingSave || checkingStatus) return;
// // // // //     setLoadingSave(true);
// // // // //     try {
// // // // //       if (isSaved) {
// // // // //         await unsaveProperty(item._id);
// // // // //         setIsSaved(false);
// // // // //       } else {
// // // // //         await saveProperty(item._id);
// // // // //         setIsSaved(true);
// // // // //       }
// // // // //     } catch (err) {
// // // // //       console.error("Save/Unsave error:", err.message);
// // // // //       Alert.alert("Error", "Unable to update saved status.");
// // // // //     } finally {
// // // // //       setLoadingSave(false);
// // // // //     }
// // // // //   };

// // // // //   // ✅ Open Google Maps link
// // // // //   const openMaps = () => {
// // // // //     const location = item?.mapLocation || item?.location;
// // // // //     if (!location?.trim()) return;
// // // // //     const encoded = encodeURIComponent(location);
// // // // //     const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encoded}`;
// // // // //     Linking.openURL(mapUrl);
// // // // //   };

// // // // //   return (
// // // // //     <Animatable.View animation="fadeInUp" duration={500} style={styles.wrapper}>
// // // // //       <TouchableOpacity
// // // // //         activeOpacity={0.93}
// // // // //         onPress={onPress}
// // // // //         style={[styles.card, { width: cardWidth }]}
// // // // //       >
// // // // //         {/* 🏡 Property Image */}
// // // // //         {item?.images?.[0] ? (
// // // // //           <Image source={{ uri: item.images[0] }} style={styles.image} />
// // // // //         ) : (
// // // // //           <View style={[styles.image, styles.noImage]}>
// // // // //             <Map size={42} color="#bbb" />
// // // // //           </View>
// // // // //         )}

// // // // //         {/* 🔖 Bookmark (Saved State) */}
// // // // //         <TouchableOpacity style={styles.bookmarkBtn} onPress={handleSave}>
// // // // //           {checkingStatus || loadingSave ? (
// // // // //             <ActivityIndicator size="small" color="#20A68B" />
// // // // //           ) : isSaved ? (
// // // // //             <BookmarkCheck size={22} color="#20A68B" strokeWidth={2.4} />
// // // // //           ) : (
// // // // //             <Bookmark size={22} color="#333" strokeWidth={2} />
// // // // //           )}
// // // // //         </TouchableOpacity>

// // // // //         {/* 📜 Property Info */}
// // // // //         <View style={styles.content}>
// // // // //           {/* Title + Price */}
// // // // //           <View style={styles.rowBetween}>
// // // // //             <GlobalText numberOfLines={1} style={styles.title}>
// // // // //               {item?.title || "Untitled Property"}
// // // // //             </GlobalText>
// // // // //             <GlobalText numberOfLines={1} style={styles.price}>
// // // // //               ₹{item?.price ? item.price.toLocaleString("en-IN") : "N/A"}
// // // // //             </GlobalText>
// // // // //           </View>

// // // // //           {/* 📍 Location */}
// // // // //           {item?.location ? (
// // // // //             <View style={[styles.rowBetween, { marginTop: 4 }]}>
// // // // //               <View style={styles.row}>
// // // // //                 <MapPin size={15} color="#888" />
// // // // //                 <GlobalText numberOfLines={1} style={styles.location}>
// // // // //                   {item.location}
// // // // //                 </GlobalText>
// // // // //               </View>
// // // // //               {item?.sqft && (
// // // // //                 <GlobalText numberOfLines={1} style={styles.size}>
// // // // //                   {item.sqft} sqft
// // // // //                 </GlobalText>
// // // // //               )}
// // // // //             </View>
// // // // //           ) : (
// // // // //             <View style={styles.infoBox}>
// // // // //               <Info size={16} color="#999" />
// // // // //               <GlobalText style={styles.infoText}>
// // // // //                 Location not provided
// // // // //               </GlobalText>
// // // // //             </View>
// // // // //           )}

// // // // //           {/* 🛏️ Features */}
// // // // //           <View style={styles.featuresRow}>
// // // // //             <View style={styles.feature}>
// // // // //               <Bed size={16} color="#FF6B6B" />
// // // // //               <GlobalText style={styles.featureText}>
// // // // //                 {formatField("Bed", item?.bedrooms)}
// // // // //               </GlobalText>
// // // // //             </View>

// // // // //             <View style={styles.feature}>
// // // // //               <Bath size={16} color="#3AAFA9" />
// // // // //               <GlobalText style={styles.featureText}>
// // // // //                 {formatField("Bath", item?.bathrooms)}
// // // // //               </GlobalText>
// // // // //             </View>

// // // // //             <View style={styles.feature}>
// // // // //               <UtensilsCrossed size={16} color="#FFA41B" />
// // // // //               <GlobalText style={styles.featureText}>
// // // // //                 {item?.kitchen ? `${item.kitchen} Kitchen` : "N/A Kitchen"}
// // // // //               </GlobalText>
// // // // //             </View>

// // // // //             {item?.location && (
// // // // //               <TouchableOpacity onPress={openMaps} style={styles.mapBtn}>
// // // // //                 <Map size={18} color="#20A68B" />
// // // // //               </TouchableOpacity>
// // // // //             )}
// // // // //           </View>
// // // // //         </View>
// // // // //       </TouchableOpacity>
// // // // //     </Animatable.View>
// // // // //   );
// // // // // }

// // // // // const styles = StyleSheet.create({
// // // // //   wrapper: {
// // // // //     alignItems: "center",
// // // // //     marginVertical: 12,
// // // // //   },
// // // // //   card: {
// // // // //     borderRadius: 22,
// // // // //     backgroundColor: "#fff",
// // // // //     borderWidth: 1,
// // // // //     borderColor: "#00000015",
// // // // //     shadowColor: "#000",
// // // // //     shadowOpacity: 0.12,
// // // // //     shadowOffset: { width: 0, height: 5 },
// // // // //     shadowRadius: 8,
// // // // //     elevation: 5,
// // // // //     overflow: "hidden",
// // // // //   },
// // // // //   image: {
// // // // //     width: "100%",
// // // // //     height: 180,
// // // // //     borderTopLeftRadius: 22,
// // // // //     borderTopRightRadius: 22,
// // // // //   },
// // // // //   noImage: {
// // // // //     justifyContent: "center",
// // // // //     alignItems: "center",
// // // // //     backgroundColor: "#f5f5f5",
// // // // //   },
// // // // //   bookmarkBtn: {
// // // // //     position: "absolute",
// // // // //     top: 14,
// // // // //     right: 14,
// // // // //     backgroundColor: "#fff",
// // // // //     padding: 7,
// // // // //     borderRadius: 20,
// // // // //     elevation: 5,
// // // // //   },
// // // // //   content: {
// // // // //     padding: 14,
// // // // //   },
// // // // //   rowBetween: {
// // // // //     flexDirection: "row",
// // // // //     justifyContent: "space-between",
// // // // //     alignItems: "center",
// // // // //   },
// // // // //   row: {
// // // // //     flexDirection: "row",
// // // // //     alignItems: "center",
// // // // //     flexShrink: 1,
// // // // //   },
// // // // //   title: {
// // // // //     fontSize: 16,
// // // // //     fontWeight: "700",
// // // // //     color: "#111",
// // // // //     maxWidth: "65%",
// // // // //   },
// // // // //   price: {
// // // // //     fontSize: 17,
// // // // //     fontWeight: "800",
// // // // //     color: "#20A68B",
// // // // //     textAlign: "right",
// // // // //   },
// // // // //   location: {
// // // // //     fontSize: 12,
// // // // //     color: "#555",
// // // // //     marginLeft: 4,
// // // // //     maxWidth: 160,
// // // // //   },
// // // // //   size: {
// // // // //     fontSize: 12,
// // // // //     color: "#888",
// // // // //   },
// // // // //   featuresRow: {
// // // // //     flexDirection: "row",
// // // // //     justifyContent: "space-between",
// // // // //     alignItems: "center",
// // // // //     marginTop: 10,
// // // // //     borderTopWidth: 0.8,
// // // // //     borderTopColor: "#00000015",
// // // // //     paddingTop: 8,
// // // // //   },
// // // // //   feature: {
// // // // //     flexDirection: "row",
// // // // //     alignItems: "center",
// // // // //   },
// // // // //   featureText: {
// // // // //     fontSize: 12,
// // // // //     color: "#333",
// // // // //     marginLeft: 5,
// // // // //     maxWidth: 70,
// // // // //   },
// // // // //   mapBtn: {
// // // // //     padding: 6,
// // // // //     backgroundColor: "#E6F6F2",
// // // // //     borderRadius: 10,
// // // // //   },
// // // // //   infoBox: { flexDirection: "row", alignItems: "center", marginTop: 5 },
// // // // //   infoText: { fontSize: 12, color: "#888", marginLeft: 5 },
// // // // // });

// // // // // // import React, { useState, useMemo } from "react";
// // // // // // import {
// // // // // //   View,
// // // // // //   Image,
// // // // // //   StyleSheet,
// // // // // //   TouchableOpacity,
// // // // // //   Linking,
// // // // // //   useWindowDimensions,
// // // // // //   Alert,
// // // // // // } from "react-native";
// // // // // // import * as Animatable from "react-native-animatable";
// // // // // // import { useTheme } from "@react-navigation/native";
// // // // // // import {
// // // // // //   Bed,
// // // // // //   Bath,
// // // // // //   UtensilsCrossed,
// // // // // //   MapPin,
// // // // // //   Bookmark,
// // // // // //   BookmarkCheck,
// // // // // //   Map,
// // // // // //   Info,
// // // // // // } from "lucide-react-native";
// // // // // // import GlobalText from "../../theme/GlobalText";
// // // // // // import { saveProperty, unsaveProperty } from "../../api/api"; // ✅ backend API integration

// // // // // // export default function PropertyCard({ item, onPress }) {
// // // // // //   const { width } = useWindowDimensions();
// // // // // //   const { colors } = useTheme();
// // // // // //   const [isSaved, setIsSaved] = useState(Boolean(item?.isSaved));
// // // // // //   const [loadingSave, setLoadingSave] = useState(false);

// // // // // //   const cardWidth = useMemo(() => width * 0.9, [width]);

// // // // // //   // ✅ Helper — safe field display
// // // // // //   const formatField = (label, value) => {
// // // // // //     if (!value || value === "" || value === "undefined" || value === null)
// // // // // //       return `N/A ${label}`;
// // // // // //     return `${value} ${label}`;
// // // // // //   };

// // // // // //   // ✅ Toggle Save with API call
// // // // // //   const handleSave = async () => {
// // // // // //     if (loadingSave) return;
// // // // // //     setLoadingSave(true);
// // // // // //     try {
// // // // // //       if (isSaved) {
// // // // // //         await unsaveProperty(item._id);
// // // // // //         setIsSaved(false);
// // // // // //       } else {
// // // // // //         await saveProperty(item._id);
// // // // // //         setIsSaved(true);
// // // // // //       }
// // // // // //     } catch (err) {
// // // // // //       console.error("Save/Unsave error:", err.message);
// // // // // //       Alert.alert("Error", "Unable to update saved status.");
// // // // // //     } finally {
// // // // // //       setLoadingSave(false);
// // // // // //     }
// // // // // //   };

// // // // // //   // ✅ Open Maps
// // // // // //   const openMaps = () => {
// // // // // //     try {
// // // // // //       const location = item?.mapLocation || item?.location;
// // // // // //       if (location?.trim()) {
// // // // // //         const encoded = encodeURIComponent(location);
// // // // // //         const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encoded}`;
// // // // // //         Linking.openURL(mapUrl);
// // // // // //       }
// // // // // //     } catch (e) {
// // // // // //       console.warn("Map open failed:", e);
// // // // // //     }
// // // // // //   };

// // // // // //   return (
// // // // // //     <Animatable.View animation="fadeInUp" duration={600} style={styles.wrapper}>
// // // // // //       <TouchableOpacity
// // // // // //         activeOpacity={0.95}
// // // // // //         onPress={onPress}
// // // // // //         style={[styles.card, { width: cardWidth }]}
// // // // // //       >
// // // // // //         {/* 🏡 Property Image */}
// // // // // //         {item?.images?.[0] ? (
// // // // // //           <Image source={{ uri: item.images[0] }} style={styles.image} />
// // // // // //         ) : (
// // // // // //           <View style={[styles.image, styles.noImage]}>
// // // // // //             <Map size={40} color="#aaa" />
// // // // // //           </View>
// // // // // //         )}

// // // // // //         {/* 🔖 Bookmark */}
// // // // // //         <TouchableOpacity style={styles.bookmarkBtn} onPress={handleSave}>
// // // // // //           {isSaved ? (
// // // // // //             <BookmarkCheck size={22} color="#20A68B" strokeWidth={2.5} />
// // // // // //           ) : (
// // // // // //             <Bookmark size={22} color="#333" strokeWidth={2} />
// // // // // //           )}
// // // // // //         </TouchableOpacity>

// // // // // //         {/* 📜 Property Info */}
// // // // // //         <View style={styles.content}>
// // // // // //           {/* Title + Price */}
// // // // // //           <View style={styles.rowBetween}>
// // // // // //             <GlobalText
// // // // // //               numberOfLines={1}
// // // // // //               ellipsizeMode="tail"
// // // // // //               style={styles.title}
// // // // // //             >
// // // // // //               {item?.title || "Untitled Property"}
// // // // // //             </GlobalText>
// // // // // //             <GlobalText
// // // // // //               numberOfLines={1}
// // // // // //               ellipsizeMode="tail"
// // // // // //               style={styles.price}
// // // // // //             >
// // // // // //               ₹{item?.price ? item.price.toLocaleString("en-IN") : "N/A"}
// // // // // //             </GlobalText>
// // // // // //           </View>

// // // // // //           {/* 📍 Location */}
// // // // // //           {item?.location ? (
// // // // // //             <View style={[styles.rowBetween, { marginTop: 4 }]}>
// // // // // //               <View style={styles.row}>
// // // // // //                 <MapPin size={15} color="#888" />
// // // // // //                 <GlobalText
// // // // // //                   numberOfLines={1}
// // // // // //                   ellipsizeMode="tail"
// // // // // //                   style={styles.location}
// // // // // //                 >
// // // // // //                   {item.location}
// // // // // //                 </GlobalText>
// // // // // //               </View>
// // // // // //               {item?.sqft && (
// // // // // //                 <GlobalText numberOfLines={1} style={styles.size}>
// // // // // //                   {item.sqft} sqft
// // // // // //                 </GlobalText>
// // // // // //               )}
// // // // // //             </View>
// // // // // //           ) : (
// // // // // //             <View style={styles.infoBox}>
// // // // // //               <Info size={16} color="#999" />
// // // // // //               <GlobalText style={styles.infoText}>
// // // // // //                 Location not provided
// // // // // //               </GlobalText>
// // // // // //             </View>
// // // // // //           )}

// // // // // //           {/* 🛏️ Features */}
// // // // // //           <View style={styles.featuresRow}>
// // // // // //             <View style={styles.feature}>
// // // // // //               <Bed size={16} color="#FF6B6B" />
// // // // // //               <GlobalText
// // // // // //                 numberOfLines={1}
// // // // // //                 ellipsizeMode="tail"
// // // // // //                 style={styles.featureText}
// // // // // //               >
// // // // // //                 {formatField("Bed", item?.bedrooms)}
// // // // // //               </GlobalText>
// // // // // //             </View>

// // // // // //             <View style={styles.feature}>
// // // // // //               <Bath size={16} color="#3AAFA9" />
// // // // // //               <GlobalText
// // // // // //                 numberOfLines={1}
// // // // // //                 ellipsizeMode="tail"
// // // // // //                 style={styles.featureText}
// // // // // //               >
// // // // // //                 {formatField("Bath", item?.bathrooms)}
// // // // // //               </GlobalText>
// // // // // //             </View>

// // // // // //             <View style={styles.feature}>
// // // // // //               <UtensilsCrossed size={16} color="#FFA41B" />
// // // // // //               <GlobalText
// // // // // //                 numberOfLines={1}
// // // // // //                 ellipsizeMode="tail"
// // // // // //                 style={styles.featureText}
// // // // // //               >
// // // // // //                 {item?.kitchen ? `${item.kitchen} Kitchen` : "N/A Kitchen"}
// // // // // //               </GlobalText>
// // // // // //             </View>

// // // // // //             {/* 🗺 Map */}
// // // // // //             {item?.location && (
// // // // // //               <TouchableOpacity onPress={openMaps} style={styles.mapBtn}>
// // // // // //                 <Map size={18} color="#20A68B" />
// // // // // //               </TouchableOpacity>
// // // // // //             )}
// // // // // //           </View>
// // // // // //         </View>
// // // // // //       </TouchableOpacity>
// // // // // //     </Animatable.View>
// // // // // //   );
// // // // // // }

// // // // // // const styles = StyleSheet.create({
// // // // // //   wrapper: {
// // // // // //     alignItems: "center",
// // // // // //     marginVertical: 12,
// // // // // //   },
// // // // // //   card: {
// // // // // //     borderRadius: 22,
// // // // // //     backgroundColor: "#fff",
// // // // // //     borderWidth: 1.2,
// // // // // //     borderColor: "#00000020",
// // // // // //     shadowColor: "#000",
// // // // // //     shadowOpacity: 0.15,
// // // // // //     shadowOffset: { width: 0, height: 6 },
// // // // // //     shadowRadius: 8,
// // // // // //     elevation: 5,
// // // // // //     overflow: "hidden",
// // // // // //   },
// // // // // //   image: {
// // // // // //     width: "100%",
// // // // // //     height: 180,
// // // // // //     borderTopLeftRadius: 22,
// // // // // //     borderTopRightRadius: 22,
// // // // // //   },
// // // // // //   noImage: {
// // // // // //     justifyContent: "center",
// // // // // //     alignItems: "center",
// // // // // //     backgroundColor: "#f5f5f5",
// // // // // //   },
// // // // // //   bookmarkBtn: {
// // // // // //     position: "absolute",
// // // // // //     top: 14,
// // // // // //     right: 14,
// // // // // //     backgroundColor: "#fff",
// // // // // //     padding: 6,
// // // // // //     borderRadius: 20,
// // // // // //     elevation: 5,
// // // // // //   },
// // // // // //   content: { padding: 14 },
// // // // // //   rowBetween: {
// // // // // //     flexDirection: "row",
// // // // // //     justifyContent: "space-between",
// // // // // //     alignItems: "center",
// // // // // //     flexWrap: "nowrap",
// // // // // //   },
// // // // // //   row: {
// // // // // //     flexDirection: "row",
// // // // // //     alignItems: "center",
// // // // // //     flexShrink: 1,
// // // // // //     overflow: "hidden",
// // // // // //   },
// // // // // //   title: {
// // // // // //     fontSize: 16,
// // // // // //     fontWeight: "700",
// // // // // //     color: "#111",
// // // // // //     maxWidth: "65%",
// // // // // //     flexShrink: 1,
// // // // // //   },
// // // // // //   price: {
// // // // // //     fontSize: 17,
// // // // // //     fontWeight: "800",
// // // // // //     color: "#20A68B",
// // // // // //     textAlign: "right",
// // // // // //     flexShrink: 1,
// // // // // //   },
// // // // // //   location: {
// // // // // //     fontSize: 12,
// // // // // //     color: "#555",
// // // // // //     marginLeft: 4,
// // // // // //     maxWidth: 160,
// // // // // //     flexShrink: 1,
// // // // // //   },
// // // // // //   size: { fontSize: 12, color: "#888", flexShrink: 1 },
// // // // // //   featuresRow: {
// // // // // //     flexDirection: "row",
// // // // // //     justifyContent: "space-between",
// // // // // //     alignItems: "center",
// // // // // //     marginTop: 10,
// // // // // //     borderTopWidth: 0.8,
// // // // // //     borderTopColor: "#00000015",
// // // // // //     paddingTop: 8,
// // // // // //     flexWrap: "nowrap",
// // // // // //   },
// // // // // //   feature: {
// // // // // //     flexDirection: "row",
// // // // // //     alignItems: "center",
// // // // // //     flexShrink: 1,
// // // // // //     overflow: "hidden",
// // // // // //   },
// // // // // //   featureText: {
// // // // // //     fontSize: 12,
// // // // // //     color: "#333",
// // // // // //     marginLeft: 5,
// // // // // //     maxWidth: 70,
// // // // // //     flexShrink: 1,
// // // // // //   },
// // // // // //   mapBtn: {
// // // // // //     padding: 6,
// // // // // //     backgroundColor: "#E6F6F2",
// // // // // //     borderRadius: 10,
// // // // // //   },
// // // // // //   infoBox: { flexDirection: "row", alignItems: "center", marginTop: 5 },
// // // // // //   infoText: { fontSize: 12, color: "#888", marginLeft: 5 },
// // // // // // });


// // // // // // import React, { useState, useMemo } from "react";
// // // // // // import {
// // // // // //   View,
// // // // // //   Image,
// // // // // //   StyleSheet,
// // // // // //   TouchableOpacity,
// // // // // //   Linking,
// // // // // //   useWindowDimensions,
// // // // // // } from "react-native";
// // // // // // import * as Animatable from "react-native-animatable";
// // // // // // import { useTheme } from "@react-navigation/native";
// // // // // // import {
// // // // // //   Bed,
// // // // // //   Bath,
// // // // // //   UtensilsCrossed,
// // // // // //   MapPin,
// // // // // //   Bookmark,
// // // // // //   BookmarkCheck,
// // // // // //   Map,
// // // // // //   Info,
// // // // // // } from "lucide-react-native";
// // // // // // import GlobalText from "../../theme/GlobalText";

// // // // // // export default function PropertyCard({ item, onPress, onToggleSave }) {
// // // // // //   // ✅ Hooks always at top level (never conditional)
// // // // // //   const { width } = useWindowDimensions();
// // // // // //   const { colors } = useTheme();
// // // // // //   const [isSaved, setIsSaved] = useState(Boolean(item?.isSaved));

// // // // // //   // ✅ Memoize card width
// // // // // //   const cardWidth = useMemo(() => width * 0.9, [width]);

// // // // // //   // ✅ Handle Save
// // // // // //   const handleSave = () => {
// // // // // //     const newState = !isSaved;
// // // // // //     setIsSaved(newState);
// // // // // //     if (onToggleSave) onToggleSave(item, newState);
// // // // // //   };

// // // // // //   // ✅ Open Maps safely
// // // // // //   const openMaps = () => {
// // // // // //     try {
// // // // // //       const location = item?.mapLocation || item?.location;
// // // // // //       if (location?.trim()) {
// // // // // //         const encoded = encodeURIComponent(location);
// // // // // //         const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encoded}`;
// // // // // //         Linking.openURL(mapUrl);
// // // // // //       }
// // // // // //     } catch (e) {
// // // // // //       console.warn("Map open failed:", e);
// // // // // //     }
// // // // // //   };

// // // // // //   return (
// // // // // //     <Animatable.View animation="fadeInUp" duration={600} style={styles.wrapper}>
// // // // // //       <TouchableOpacity
// // // // // //         activeOpacity={0.95}
// // // // // //         onPress={onPress}
// // // // // //         style={[styles.card, { width: cardWidth }]}
// // // // // //       >
// // // // // //         {/* 🏡 Image */}
// // // // // //         {item?.image ? (
// // // // // //           <Image source={{ uri: item.image }} style={styles.image} />
// // // // // //         ) : (
// // // // // //           <View style={[styles.image, styles.noImage]}>
// // // // // //             <Map size={40} color="#aaa" />
// // // // // //           </View>
// // // // // //         )}

// // // // // //         {/* 🔖 Bookmark */}
// // // // // //         <TouchableOpacity style={styles.bookmarkBtn} onPress={handleSave}>
// // // // // //           {isSaved ? (
// // // // // //             <BookmarkCheck size={22} color="#20A68B" strokeWidth={2.5} />
// // // // // //           ) : (
// // // // // //             <Bookmark size={22} color="#333" strokeWidth={2} />
// // // // // //           )}
// // // // // //         </TouchableOpacity>

// // // // // //         {/* 📜 Info */}
// // // // // //         <View style={styles.content}>
// // // // // //           <View style={styles.rowBetween}>
// // // // // //             <GlobalText
// // // // // //               numberOfLines={1}
// // // // // //               ellipsizeMode="tail"
// // // // // //               adjustsFontSizeToFit
// // // // // //               style={styles.title}
// // // // // //             >
// // // // // //               {item?.title || "Deluxe Apartment"}
// // // // // //             </GlobalText>
// // // // // //             <GlobalText
// // // // // //               numberOfLines={1}
// // // // // //               adjustsFontSizeToFit
// // // // // //               style={styles.price}
// // // // // //             >
// // // // // //               ₹{item?.price ? item.price.toLocaleString("en-IN") : "26,70,000"}
// // // // // //             </GlobalText>
// // // // // //           </View>

// // // // // //           {/* 📍 Location */}
// // // // // //           {item?.location ? (
// // // // // //             <View style={styles.rowBetween}>
// // // // // //               <View style={styles.row}>
// // // // // //                 <MapPin size={15} color="#888" />
// // // // // //                 <GlobalText
// // // // // //                   numberOfLines={1}
// // // // // //                   ellipsizeMode="tail"
// // // // // //                   style={styles.location}
// // // // // //                 >
// // // // // //                   {item.location}
// // // // // //                 </GlobalText>
// // // // // //               </View>
// // // // // //               {item.size && (
// // // // // //                 <GlobalText numberOfLines={1} style={styles.size}>
// // // // // //                   ({item.size})
// // // // // //                 </GlobalText>
// // // // // //               )}
// // // // // //             </View>
// // // // // //           ) : (
// // // // // //             <View style={styles.infoBox}>
// // // // // //               <Info size={16} color="#999" />
// // // // // //               <GlobalText style={styles.infoText}>
// // // // // //                 Location not provided
// // // // // //               </GlobalText>
// // // // // //             </View>
// // // // // //           )}

// // // // // //           {/* 🛏️ Features */}
// // // // // //           <View style={styles.featuresRow}>
// // // // // //             <View style={styles.feature}>
// // // // // //               <Bed size={16} color="#FF6B6B" />
// // // // // //               <GlobalText style={styles.featureText}>
// // // // // //                 {item?.bed || 4} Bed
// // // // // //               </GlobalText>
// // // // // //             </View>
// // // // // //             <View style={styles.feature}>
// // // // // //               <Bath size={16} color="#3AAFA9" />
// // // // // //               <GlobalText style={styles.featureText}>
// // // // // //                 {item?.bath || 3} Bath
// // // // // //               </GlobalText>
// // // // // //             </View>
// // // // // //             <View style={styles.feature}>
// // // // // //               <UtensilsCrossed size={16} color="#FFA41B" />
// // // // // //               <GlobalText style={styles.featureText}>
// // // // // //                 {item?.kitchen || 1} Kitchen
// // // // // //               </GlobalText>
// // // // // //             </View>
// // // // // //             {item?.location && (
// // // // // //               <TouchableOpacity onPress={openMaps} style={styles.mapBtn}>
// // // // // //                 <Map size={18} color="#20A68B" />
// // // // // //               </TouchableOpacity>
// // // // // //             )}
// // // // // //           </View>
// // // // // //         </View>
// // // // // //       </TouchableOpacity>
// // // // // //     </Animatable.View>
// // // // // //   );
// // // // // // }

// // // // // // const styles = StyleSheet.create({
// // // // // //   wrapper: {
// // // // // //     alignItems: "center",
// // // // // //     marginVertical: 12,
// // // // // //   },
// // // // // //   card: {
// // // // // //     borderRadius: 22,
// // // // // //     backgroundColor: "#fff",
// // // // // //     borderWidth: 1.2,
// // // // // //     borderColor: "#00000020",
// // // // // //     shadowColor: "#000",
// // // // // //     shadowOpacity: 0.15,
// // // // // //     shadowOffset: { width: 0, height: 6 },
// // // // // //     shadowRadius: 8,
// // // // // //     elevation: 5,
// // // // // //     overflow: "hidden",
// // // // // //   },
// // // // // //   image: {
// // // // // //     width: "100%",
// // // // // //     height: 180,
// // // // // //     borderTopLeftRadius: 22,
// // // // // //     borderTopRightRadius: 22,
// // // // // //   },
// // // // // //   noImage: {
// // // // // //     justifyContent: "center",
// // // // // //     alignItems: "center",
// // // // // //     backgroundColor: "#f5f5f5",
// // // // // //   },
// // // // // //   bookmarkBtn: {
// // // // // //     position: "absolute",
// // // // // //     top: 14,
// // // // // //     right: 14,
// // // // // //     backgroundColor: "#fff",
// // // // // //     padding: 6,
// // // // // //     borderRadius: 20,
// // // // // //     elevation: 5,
// // // // // //   },
// // // // // //   content: { padding: 14 },
// // // // // //   rowBetween: {
// // // // // //     flexDirection: "row",
// // // // // //     justifyContent: "space-between",
// // // // // //     alignItems: "center",
// // // // // //   },
// // // // // //   row: { flexDirection: "row", alignItems: "center", flexShrink: 1 },
// // // // // //   title: {
// // // // // //     fontSize: 16,
// // // // // //     fontWeight: "700",
// // // // // //     color: "#111",
// // // // // //     maxWidth: "70%",
// // // // // //   },
// // // // // //   price: {
// // // // // //     fontSize: 17,
// // // // // //     fontWeight: "800",
// // // // // //     color: "#20A68B",
// // // // // //     textAlign: "right",
// // // // // //   },
// // // // // //   location: {
// // // // // //     fontSize: 12,
// // // // // //     color: "#555",
// // // // // //     marginLeft: 4,
// // // // // //     maxWidth: 180,
// // // // // //   },
// // // // // //   size: { fontSize: 12, color: "#888" },
// // // // // //   featuresRow: {
// // // // // //     flexDirection: "row",
// // // // // //     justifyContent: "space-between",
// // // // // //     alignItems: "center",
// // // // // //     marginTop: 10,
// // // // // //     borderTopWidth: 0.8,
// // // // // //     borderTopColor: "#00000015",
// // // // // //     paddingTop: 8,
// // // // // //   },
// // // // // //   feature: { flexDirection: "row", alignItems: "center" },
// // // // // //   featureText: { fontSize: 12, color: "#333", marginLeft: 5 },
// // // // // //   mapBtn: {
// // // // // //     padding: 6,
// // // // // //     backgroundColor: "#E6F6F2",
// // // // // //     borderRadius: 10,
// // // // // //   },
// // // // // //   infoBox: { flexDirection: "row", alignItems: "center", marginTop: 5 },
// // // // // //   infoText: { fontSize: 12, color: "#888", marginLeft: 5 },
// // // // // // });


// // // // // // import React, { useState } from "react";
// // // // // // import {
// // // // // //   View,
// // // // // //   Image,
// // // // // //   StyleSheet,
// // // // // //   TouchableOpacity,
// // // // // //   Linking,
// // // // // // } from "react-native";
// // // // // // import * as Animatable from "react-native-animatable";
// // // // // // import { useTheme } from "@react-navigation/native";
// // // // // // import {
// // // // // //   Bed,
// // // // // //   Bath,
// // // // // //   UtensilsCrossed,
// // // // // //   MapPin,
// // // // // //   Bookmark,
// // // // // //   BookmarkCheck,
// // // // // //   Map,
// // // // // //   Info,
// // // // // // } from "lucide-react-native";
// // // // // // import GlobalText from "../../theme/GlobalText"; // ✅ global Poppins font

// // // // // // export default function PropertyCard({ item, onPress, onToggleSave }) {
// // // // // //   const { colors } = useTheme();
// // // // // //   const [isSaved, setIsSaved] = useState(item.isSaved || false);

// // // // // //   const handleSave = () => {
// // // // // //     const newState = !isSaved;
// // // // // //     setIsSaved(newState);
// // // // // //     if (onToggleSave) onToggleSave(item, newState);
// // // // // //   };

// // // // // //   // 🌍 Open property in Google Maps
// // // // // //   const openMaps = () => {
// // // // // //     const location = item.mapLocation || item.location;
// // // // // //     if (location && typeof location === "string" && location.trim() !== "") {
// // // // // //       const encoded = encodeURIComponent(location);
// // // // // //       const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encoded}`;
// // // // // //       Linking.openURL(mapUrl).catch(() => console.log("Map open failed:", mapUrl));
// // // // // //     } else {
// // // // // //       console.log("⚠️ No valid location provided by property owner");
// // // // // //     }
// // // // // //   };

// // // // // //   return (
// // // // // //     <Animatable.View animation="fadeInUp" duration={600} style={styles.wrapper}>
// // // // // //       <TouchableOpacity style={styles.card} activeOpacity={0.95} onPress={onPress}>
// // // // // //         {/* 🏡 Property Image */}
// // // // // //         {item.image ? (
// // // // // //           <Image source={{ uri: item.image }} style={styles.image} />
// // // // // //         ) : (
// // // // // //           <View style={[styles.image, styles.noImage]}>
// // // // // //             <Map size={40} color="#aaa" />
// // // // // //           </View>
// // // // // //         )}

// // // // // //         {/* 🔖 Save Icon */}
// // // // // //         <TouchableOpacity style={styles.bookmarkBtn} onPress={handleSave}>
// // // // // //           {isSaved ? (
// // // // // //             <BookmarkCheck size={22} color="#20A68B" strokeWidth={2.5} />
// // // // // //           ) : (
// // // // // //             <Bookmark size={22} color="#333" strokeWidth={2} />
// // // // // //           )}
// // // // // //         </TouchableOpacity>

// // // // // //         {/* 🧾 Property Details */}
// // // // // //         <View style={styles.content}>
// // // // // //           <View style={styles.rowBetween}>
// // // // // //             <GlobalText style={styles.title} numberOfLines={1}>
// // // // // //               {item.title || "Deluxe Apartment"}
// // // // // //             </GlobalText>
// // // // // //             <GlobalText style={styles.price}>
// // // // // //               ₹{item.price ? item.price.toLocaleString("en-IN") : "26,70,000"}
// // // // // //             </GlobalText>
// // // // // //           </View>

// // // // // //           {/* 📍 Location */}
// // // // // //           {item.location ? (
// // // // // //             <View style={styles.rowBetween}>
// // // // // //               <View style={styles.row}>
// // // // // //                 <MapPin size={15} color="#888" />
// // // // // //                 <GlobalText style={styles.location} numberOfLines={1}>
// // // // // //                   {item.location || "2BW Street NY, New York"}
// // // // // //                 </GlobalText>
// // // // // //               </View>
// // // // // //               {item.size && (
// // // // // //                 <GlobalText style={styles.size}>
// // // // // //                   ({item.size || "2000 sqft"})
// // // // // //                 </GlobalText>
// // // // // //               )}
// // // // // //             </View>
// // // // // //           ) : (
// // // // // //             <View style={styles.infoBox}>
// // // // // //               <Info size={16} color="#999" />
// // // // // //               <GlobalText style={styles.infoText}>
// // // // // //                 Location not provided by owner
// // // // // //               </GlobalText>
// // // // // //             </View>
// // // // // //           )}

// // // // // //           {/* 🛏️ Features */}
// // // // // //           <View style={styles.featuresRow}>
// // // // // //             <View style={styles.feature}>
// // // // // //               <Bed size={16} color="#FF6B6B" />
// // // // // //               <GlobalText style={styles.featureText}>
// // // // // //                 {item.bed || 4} Bed
// // // // // //               </GlobalText>
// // // // // //             </View>
// // // // // //             <View style={styles.feature}>
// // // // // //               <Bath size={16} color="#3AAFA9" />
// // // // // //               <GlobalText style={styles.featureText}>
// // // // // //                 {item.bath || 3} Bath
// // // // // //               </GlobalText>
// // // // // //             </View>
// // // // // //             <View style={styles.feature}>
// // // // // //               <UtensilsCrossed size={16} color="#FFA41B" />
// // // // // //               <GlobalText style={styles.featureText}>
// // // // // //                 {item.kitchen || 1} Kitchen
// // // // // //               </GlobalText>
// // // // // //             </View>

// // // // // //             {item.location && (
// // // // // //               <TouchableOpacity onPress={openMaps} style={styles.mapBtn}>
// // // // // //                 <Map size={18} color="#20A68B" />
// // // // // //               </TouchableOpacity>
// // // // // //             )}
// // // // // //           </View>
// // // // // //         </View>
// // // // // //       </TouchableOpacity>
// // // // // //     </Animatable.View>
// // // // // //   );
// // // // // // }

// // // // // // const styles = StyleSheet.create({
// // // // // //   wrapper: {
// // // // // //     alignItems: "center",
// // // // // //     marginVertical: 12,
// // // // // //   },
// // // // // //   card: {
// // // // // //     width: 340,
// // // // // //     borderRadius: 22,
// // // // // //     backgroundColor: "#fff",
// // // // // //     borderWidth: 1.5, // ✅ Black outline
// // // // // //     borderColor: "#00000020", // Slight transparent black for elegant border
// // // // // //     shadowColor: "#000",
// // // // // //     shadowOpacity: 0.2,
// // // // // //     shadowOffset: { width: 0, height: 6 },
// // // // // //     shadowRadius: 10,
// // // // // //     elevation: 6,
// // // // // //     overflow: "hidden",
// // // // // //   },
// // // // // //   image: {
// // // // // //     width: "100%",
// // // // // //     height: 190,
// // // // // //     borderTopLeftRadius: 22,
// // // // // //     borderTopRightRadius: 22,
// // // // // //   },
// // // // // //   noImage: {
// // // // // //     justifyContent: "center",
// // // // // //     alignItems: "center",
// // // // // //     backgroundColor: "#f5f5f5",
// // // // // //   },
// // // // // //   bookmarkBtn: {
// // // // // //     position: "absolute",
// // // // // //     top: 14,
// // // // // //     right: 14,
// // // // // //     backgroundColor: "#fff",
// // // // // //     padding: 6,
// // // // // //     borderRadius: 20,
// // // // // //     elevation: 5,
// // // // // //     shadowColor: "#000",
// // // // // //     shadowOpacity: 0.25,
// // // // // //     shadowRadius: 4,
// // // // // //   },
// // // // // //   content: {
// // // // // //     padding: 14,
// // // // // //   },
// // // // // //   rowBetween: {
// // // // // //     flexDirection: "row",
// // // // // //     justifyContent: "space-between",
// // // // // //     alignItems: "center",
// // // // // //   },
// // // // // //   row: {
// // // // // //     flexDirection: "row",
// // // // // //     alignItems: "center",
// // // // // //   },
// // // // // //   title: {
// // // // // //     fontSize: 16,
// // // // // //     fontWeight: "700",
// // // // // //     color: "#111",
// // // // // //   },
// // // // // //   price: {
// // // // // //     fontSize: 17,
// // // // // //     fontWeight: "800",
// // // // // //     color: "#20A68B",
// // // // // //   },
// // // // // //   location: {
// // // // // //     fontSize: 12,
// // // // // //     color: "#555",
// // // // // //     marginLeft: 4,
// // // // // //     width: 180,
// // // // // //   },
// // // // // //   size: {
// // // // // //     fontSize: 12,
// // // // // //     color: "#888",
// // // // // //   },
// // // // // //   featuresRow: {
// // // // // //     flexDirection: "row",
// // // // // //     justifyContent: "space-between",
// // // // // //     alignItems: "center",
// // // // // //     marginTop: 10,
// // // // // //     borderTopWidth: 0.8,
// // // // // //     borderTopColor: "#00000015",
// // // // // //     paddingTop: 8,
// // // // // //   },
// // // // // //   feature: {
// // // // // //     flexDirection: "row",
// // // // // //     alignItems: "center",
// // // // // //   },
// // // // // //   featureText: {
// // // // // //     fontSize: 12,
// // // // // //     color: "#333",
// // // // // //     marginLeft: 5,
// // // // // //   },
// // // // // //   mapBtn: {
// // // // // //     padding: 6,
// // // // // //     backgroundColor: "#E6F6F2",
// // // // // //     borderRadius: 10,
// // // // // //   },
// // // // // //   infoBox: {
// // // // // //     flexDirection: "row",
// // // // // //     alignItems: "center",
// // // // // //     marginTop: 5,
// // // // // //   },
// // // // // //   infoText: {
// // // // // //     fontSize: 12,
// // // // // //     color: "#888",
// // // // // //     marginLeft: 5,
// // // // // //   },
// // // // // // });
