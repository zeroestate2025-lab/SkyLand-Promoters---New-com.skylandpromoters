import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Alert,
  Image,
  FlatList,
  Dimensions,
  Modal,
  ActivityIndicator,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { SafeAreaView } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import MapView, { Marker } from "react-native-maps";
import { WebView } from "react-native-webview";
import GlobalText from "../../theme/GlobalText";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Bed,
  Bath,
  UtensilsCrossed,
  Maximize2,
  MapPin,
  X,
  ImageOff,
} from "lucide-react-native";
import AccordionItem from "../../components/PropertyFullDetailsPage/AccordionItem";
import AnimatedBackground from "../../components/ReusableComponents/AnimatedBackground";
import { getPropertyById, saveProperty, unsaveProperty } from "../../api/api";

const { width } = Dimensions.get("window");

export default function PropertyDetailsScreen({ route, navigation }) {
  const { property: initialProperty } = route.params;
  const [property, setProperty] = useState(initialProperty);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(initialProperty?.isSaved || false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [zoomImage, setZoomImage] = useState(null);

  // ✅ Fetch updated property data
  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        const data = await getPropertyById(initialProperty._id);
        setProperty(data);
      } catch (err) {
        console.error("Error fetching property:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPropertyDetails();
  }, [initialProperty._id]);

  // ✅ Save/Unsave toggle
  const handleToggleSave = async () => {
    try {
      if (isSaved) {
        await unsaveProperty(property._id);
        setIsSaved(false);
      } else {
        await saveProperty(property._id);
        setIsSaved(true);
      }
    } catch (err) {
      Alert.alert("Error", "Could not update saved state.");
      console.error("Save toggle failed:", err.message);
    }
  };

  const renderImage = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        setZoomImage(item);
        setModalVisible(true);
      }}
      activeOpacity={0.9}
    >
      <Image source={{ uri: item }} style={[styles.imageSlide, { width }]} resizeMode="cover" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#20A68B" />
        <GlobalText style={{ color: "#20A68B", marginTop: 10 }}>Loading Property...</GlobalText>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AnimatedBackground />

      {/* 🔹 Header */}
      <LinearGradient colors={["#43C6AC", "#20A68B"]} style={styles.headerGradient}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={22} color="#fff" />
          </TouchableOpacity>

          <GlobalText style={styles.topTitle}>Property Details</GlobalText>

          <TouchableOpacity style={styles.iconButton} onPress={handleToggleSave}>
            {isSaved ? (
              <BookmarkCheck size={22} color="#fff" strokeWidth={2.5} />
            ) : (
              <Bookmark size={22} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* 🔹 Content */}
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* 🖼 Image Slider */}
        <Animatable.View animation="fadeInUp" duration={800}>
          {property.images && property.images.length > 0 ? (
            <>
              <FlatList
                data={property.images}
                renderItem={renderImage}
                keyExtractor={(item, index) => index.toString()}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                  const index = Math.round(e.nativeEvent.contentOffset.x / width);
                  setActiveIndex(index);
                }}
              />
              <View style={styles.pagination}>
                {property.images.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      { backgroundColor: i === activeIndex ? "#20A68B" : "#ccc" },
                    ]}
                  />
                ))}
              </View>
            </>
          ) : (
            <View style={[styles.imageSlide, styles.noImage]}>
              <ImageOff size={40} color="#aaa" />
              <GlobalText style={{ color: "#666", marginTop: 5 }}>No Image Available</GlobalText>
            </View>
          )}
        </Animatable.View>

        {/* 🏡 Property Info */}
        <Animatable.View animation="fadeInUp" delay={150} duration={800} style={styles.detailsCard}>
          <GlobalText style={styles.title}>{property.title}</GlobalText>
          <GlobalText style={styles.price}>₹ {property.price}</GlobalText>

          <View style={styles.locationRow}>
            <MapPin size={16} color="#20A68B" />
            <GlobalText style={styles.locationText}>
              {property.location || "Location not provided by owner"}
            </GlobalText>
          </View>

          {/* 🛏️ Show only if category is House */}
          {property?.category?.toLowerCase() === "house" && (
            <View style={styles.featuresGrid}>
              <View style={styles.featureBox}>
                <Bed size={18} color="#FF6B6B" />
                <GlobalText style={styles.featureText}>
                  {property.bedrooms ? `${property.bedrooms} Beds` : "N/A Beds"}
                </GlobalText>
              </View>
              <View style={styles.featureBox}>
                <Bath size={18} color="#3AAFA9" />
                <GlobalText style={styles.featureText}>
                  {property.bathrooms ? `${property.bathrooms} Baths` : "N/A Baths"}
                </GlobalText>
              </View>
              <View style={styles.featureBox}>
                <UtensilsCrossed size={18} color="#FFA41B" />
                <GlobalText style={styles.featureText}>
                  {property.kitchen ? `${property.kitchen} Kitchen` : "N/A Kitchen"}
                </GlobalText>
              </View>
            </View>
          )}

          <View style={styles.sqftRow}>
            <Maximize2 size={16} color="#20A68B" />
            <GlobalText style={styles.sqftText}>
              {property.sqft ? `${property.sqft} sqft` : "N/A sqft"}
            </GlobalText>
          </View>
        </Animatable.View>

        {/* 🧾 Details Accordion */}
        {property.amenities && (
          <AccordionItem title="Amenities">
            <GlobalText style={styles.accordionText}>{property.amenities}</GlobalText>
          </AccordionItem>
        )}
        {property.interior && (
          <AccordionItem title="Interior Details">
            <GlobalText style={styles.accordionText}>{property.interior}</GlobalText>
          </AccordionItem>
        )}
        {property.construction && (
          <AccordionItem title="Construction Details">
            <GlobalText style={styles.accordionText}>{property.construction}</GlobalText>
          </AccordionItem>
        )}

        {/* 🗺 Map Section */}
        {/* {property.mapLocation && (
          <Animatable.View animation="fadeInUp" delay={450} duration={800}>
            <GlobalText style={styles.sectionTitle}>Location</GlobalText>
            <View style={styles.mapContainer}>
              {property.latitude && property.longitude ? (
                <MapView
                  style={{ flex: 1 }}
                  initialRegion={{
                    latitude: parseFloat(property.latitude),
                    longitude: parseFloat(property.longitude),
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                >
                  <Marker
                    coordinate={{
                      latitude: parseFloat(property.latitude),
                      longitude: parseFloat(property.longitude),
                    }}
                    title={property.title}
                    description={property.location}
                  />
                </MapView>
              ) : (
                <WebView source={{ uri: property.mapLocation }} style={{ flex: 1 }} />
              )}
            </View>
          </Animatable.View>
        )} */}
      </ScrollView>

      {/* 🔍 Full Image Modal */}
      <Modal visible={modalVisible} transparent>
        <View style={styles.modalBackground}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <X size={28} color="#fff" />
          </TouchableOpacity>
          {zoomImage && (
            <Image source={{ uri: zoomImage }} style={styles.fullscreenImage} resizeMode="contain" />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f9f9f9" },
  container: { flex: 1 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerGradient: {
    paddingVertical: 12,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  topTitle: { fontSize: 18, fontWeight: "700", color: "#fff" },
  iconButton: { padding: 8, borderRadius: 10 },
  imageSlide: {
    height: 250,
    borderRadius: 15,
    backgroundColor: "#f0f0f0",
    marginTop: 10,
  },
  noImage: { justifyContent: "center", alignItems: "center" },
  pagination: { flexDirection: "row", justifyContent: "center", marginVertical: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 4 },
  detailsCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 18,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  title: { fontSize: 20, fontWeight: "700", color: "#1A1A1A", marginBottom: 4 },
  price: { fontSize: 18, fontWeight: "700", color: "#20A68B", marginBottom: 10 },
  locationRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  locationText: { marginLeft: 6, fontSize: 14, color: "#555", flexShrink: 1 },
  featuresGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E6F4EF",
    paddingVertical: 10,
    marginBottom: 6,
  },
  featureBox: { flexDirection: "row", alignItems: "center", flex: 1, justifyContent: "center" },
  featureText: { fontSize: 14, color: "#333", marginLeft: 6 },
  sqftRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
  },
  sqftText: { fontSize: 14, color: "#222", marginLeft: 6, fontWeight: "600" },
  accordionText: { fontSize: 14, color: "#555" },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginHorizontal: 16,
    marginTop: 20,
    color: "#222",
  },
  mapContainer: {
    height: 600,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 30,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenImage: { width: "100%", height: "80%" },
  closeButton: { position: "absolute", top: 40, right: 20, zIndex: 2 },
});

// import React, { useState, useEffect } from "react";
// import {
//   ScrollView,
//   StyleSheet,
//   TouchableOpacity,
//   View,
//   Alert,
//   Image,
//   FlatList,
//   Dimensions,
//   Modal,
//   ActivityIndicator,
// } from "react-native";
// import * as Animatable from "react-native-animatable";
// import { SafeAreaView } from "react-native-safe-area-context";
// import LinearGradient from "react-native-linear-gradient";
// import MapView, { Marker } from "react-native-maps";
// import { WebView } from "react-native-webview";
// import GlobalText from "../../theme/GlobalText";
// import {
//   ArrowLeft,
//   Bookmark,
//   BookmarkCheck,
//   Bed,
//   Bath,
//   UtensilsCrossed,
//   Maximize2,
//   MapPin,
//   X,
//   ImageOff,
// } from "lucide-react-native";

// import AccordionItem from "../../components/PropertyFullDetailsPage/AccordionItem";
// import AnimatedBackground from "../../components/ReusableComponents/AnimatedBackground";
// import { getPropertyById, saveProperty, unsaveProperty } from "../../api/api";

// const { width } = Dimensions.get("window");

// export default function PropertyDetailsScreen({ route, navigation }) {
//   const { property: initialProperty } = route.params;
//   const [property, setProperty] = useState(initialProperty);
//   const [loading, setLoading] = useState(true);
//   const [isSaved, setIsSaved] = useState(initialProperty?.isSaved || false);
//   const [activeIndex, setActiveIndex] = useState(0);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [zoomImage, setZoomImage] = useState(null);

//   // ✅ Fetch Updated Property Data
//   useEffect(() => {
//     const fetchPropertyDetails = async () => {
//       try {
//         const data = await getPropertyById(initialProperty._id);
//         setProperty(data);
//       } catch (err) {
//         console.error("Error fetching property:", err.message);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchPropertyDetails();
//   }, [initialProperty._id]);

//   // ✅ Save/Unsave toggle
//   const handleToggleSave = async () => {
//     try {
//       if (isSaved) {
//         await unsaveProperty(property._id);
//         setIsSaved(false);
//         // Alert.alert("Removed", "Property removed from saved list.");
//       } else {
//         await saveProperty(property._id);
//         setIsSaved(true);
//         // Alert.alert("Saved", "Property added to your saved list.");
//       }
//     } catch (err) {
//       Alert.alert("Error", "Could not update saved state.");
//       console.error("Save toggle failed:", err.message);
//     }
//   };

//   const renderImage = ({ item }) => (
//     <TouchableOpacity
//       onPress={() => {
//         setZoomImage(item);
//         setModalVisible(true);
//       }}
//       activeOpacity={0.9}
//     >
//       <Image source={{ uri: item }} style={[styles.imageSlide, { width }]} resizeMode="cover" />
//     </TouchableOpacity>
//   );

//   if (loading) {
//     return (
//       <View style={styles.loaderContainer}>
//         <ActivityIndicator size="large" color="#20A68B" />
//         <GlobalText style={{ color: "#20A68B", marginTop: 10 }}>Loading Property...</GlobalText>
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <AnimatedBackground />

//       {/* 🔹 Header */}
//       <LinearGradient colors={["#43C6AC", "#20A68B"]} style={styles.headerGradient}>
//         <View style={styles.topBar}>
//           <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
//             <ArrowLeft size={22} color="#fff" />
//           </TouchableOpacity>

//           <GlobalText style={styles.topTitle}>Property Details</GlobalText>

//           <TouchableOpacity style={styles.iconButton} onPress={handleToggleSave}>
//             {isSaved ? (
//               <BookmarkCheck size={22} color="#fff" strokeWidth={2.5} />
//             ) : (
//               <Bookmark size={22} color="#fff" />
//             )}
//           </TouchableOpacity>
//         </View>
//       </LinearGradient>

//       {/* 🔹 Content */}
//       <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
//         {/* 🖼 Image Slider */}
//         <Animatable.View animation="fadeInUp" duration={800}>
//           {property.images && property.images.length > 0 ? (
//             <>
//               <FlatList
//                 data={property.images}
//                 renderItem={renderImage}
//                 keyExtractor={(item, index) => index.toString()}
//                 horizontal
//                 pagingEnabled
//                 showsHorizontalScrollIndicator={false}
//                 onMomentumScrollEnd={(e) => {
//                   const index = Math.round(e.nativeEvent.contentOffset.x / width);
//                   setActiveIndex(index);
//                 }}
//               />
//               <View style={styles.pagination}>
//                 {property.images.map((_, i) => (
//                   <View
//                     key={i}
//                     style={[
//                       styles.dot,
//                       { backgroundColor: i === activeIndex ? "#20A68B" : "#ccc" },
//                     ]}
//                   />
//                 ))}
//               </View>
//             </>
//           ) : (
//             <View style={[styles.imageSlide, styles.noImage]}>
//               <ImageOff size={40} color="#aaa" />
//               <GlobalText style={{ color: "#666", marginTop: 5 }}>No Image Available</GlobalText>
//             </View>
//           )}
//         </Animatable.View>

//         {/* 🏡 Property Info */}
//         <Animatable.View animation="fadeInUp" delay={150} duration={800} style={styles.detailsCard}>
//           <GlobalText style={styles.title}>{property.title}</GlobalText>
//           <GlobalText style={styles.price}>₹ {property.price}</GlobalText>

//           <View style={styles.locationRow}>
//             <MapPin size={16} color="#20A68B" />
//             <GlobalText style={styles.locationText}>
//               {property.location || "Location not provided by owner"}
//             </GlobalText>
//           </View>

//           <View style={styles.featuresGrid}>
//             <View style={styles.featureBox}>
//               <Bed size={18} color="#FF6B6B" />
//               <GlobalText style={styles.featureText}>{property.bedrooms} Beds</GlobalText>
//             </View>
//             <View style={styles.featureBox}>
//               <Bath size={18} color="#3AAFA9" />
//               <GlobalText style={styles.featureText}>{property.bathrooms} Baths</GlobalText>
//             </View>
//             <View style={styles.featureBox}>
//               <UtensilsCrossed size={18} color="#FFA41B" />
//               <GlobalText style={styles.featureText}>{property.kitchen} Kitchen</GlobalText>
//             </View>
//           </View>

//           <View style={styles.sqftRow}>
//             <Maximize2 size={16} color="#20A68B" />
//             <GlobalText style={styles.sqftText}>
//               {property.sqft ? `${property.sqft} sqft` : "N/A sqft"}
//             </GlobalText>
//           </View>
//         </Animatable.View>

//         {/* 🧾 Details Accordion */}
//         {property.amenities && (
//           <AccordionItem title="Amenities">
//             <GlobalText style={styles.accordionText}>{property.amenities}</GlobalText>
//           </AccordionItem>
//         )}
//         {property.interior && (
//           <AccordionItem title="Interior Details">
//             <GlobalText style={styles.accordionText}>{property.interior}</GlobalText>
//           </AccordionItem>
//         )}
//         {property.construction && (
//           <AccordionItem title="Construction Details">
//             <GlobalText style={styles.accordionText}>{property.construction}</GlobalText>
//           </AccordionItem>
//         )}

//         {/* 🗺 Map Section */}
//         {property.mapLocation && (
//           <Animatable.View animation="fadeInUp" delay={450} duration={800}>
//             <GlobalText style={styles.sectionTitle}>Location</GlobalText>
//             <View style={styles.mapContainer}>
//               {property.latitude && property.longitude ? (
//                 <MapView
//                   style={{ flex: 1 }}
//                   initialRegion={{
//                     latitude: parseFloat(property.latitude),
//                     longitude: parseFloat(property.longitude),
//                     latitudeDelta: 0.01,
//                     longitudeDelta: 0.01,
//                   }}
//                 >
//                   <Marker
//                     coordinate={{
//                       latitude: parseFloat(property.latitude),
//                       longitude: parseFloat(property.longitude),
//                     }}
//                     title={property.title}
//                     description={property.location}
//                   />
//                 </MapView>
//               ) : (
//                 <WebView source={{ uri: property.mapLocation }} style={{ flex: 1 }} />
//               )}
//             </View>
//           </Animatable.View>
//         )}
//       </ScrollView>

//       {/* 🔍 Full Image Modal */}
//       <Modal visible={modalVisible} transparent>
//         <View style={styles.modalBackground}>
//           <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
//             <X size={28} color="#fff" />
//           </TouchableOpacity>
//           {zoomImage && (
//             <Image source={{ uri: zoomImage }} style={styles.fullscreenImage} resizeMode="contain" />
//           )}
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: { flex: 1, backgroundColor: "#f9f9f9" },
//   container: { flex: 1 },
//   loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
//   headerGradient: {
//     paddingVertical: 12,
//     borderBottomLeftRadius: 20,
//     borderBottomRightRadius: 20,
//     elevation: 5,
//   },
//   topBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 16,
//   },
//   topTitle: { fontSize: 18, fontWeight: "700", color: "#fff" },
//   iconButton: { padding: 8, borderRadius: 10 },

//   imageSlide: {
//     height: 250,
//     borderRadius: 15,
//     backgroundColor: "#f0f0f0",
//     marginTop: 10,
//   },
//   noImage: { justifyContent: "center", alignItems: "center" },
//   pagination: { flexDirection: "row", justifyContent: "center", marginVertical: 8 },
//   dot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 4 },

//   // 🏡 Property Info Card
//   detailsCard: {
//     backgroundColor: "#fff",
//     borderRadius: 18,
//     paddingVertical: 20,
//     paddingHorizontal: 18,
//     marginHorizontal: 16,
//     marginTop: 14,
//     marginBottom: 8,
//     elevation: 6,
//     shadowColor: "#000",
//     shadowOpacity: 0.08,
//     shadowRadius: 6,
//     shadowOffset: { width: 0, height: 3 },
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: "700",
//     color: "#1A1A1A",
//     marginBottom: 4,
//   },
//   price: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#20A68B",
//     marginBottom: 10,
//   },
//   locationRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 14,
//   },
//   locationText: {
//     marginLeft: 6,
//     fontSize: 14,
//     color: "#555",
//     flexShrink: 1,
//   },
//   featuresGrid: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     borderTopWidth: 1,
//     borderBottomWidth: 1,
//     borderColor: "#E6F4EF",
//     paddingVertical: 10,
//     marginBottom: 6,
//   },
//   featureBox: {
//     flexDirection: "row",
//     alignItems: "center",
//     flex: 1,
//     justifyContent: "center",
//   },
//   featureText: {
//     fontSize: 14,
//     color: "#333",
//     marginLeft: 6,
//   },
//   sqftRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingTop: 8,
//   },
//   sqftText: {
//     fontSize: 14,
//     color: "#222",
//     marginLeft: 6,
//     fontWeight: "600",
//   },

//   accordionText: { fontSize: 14, color: "#555" },
//   sectionTitle: {
//     fontSize: 17,
//     fontWeight: "700",
//     marginHorizontal: 16,
//     marginTop: 20,
//     color: "#222",
//   },
//   mapContainer: {
//     height: 600,
//     marginHorizontal: 16,
//     marginTop: 10,
//     borderRadius: 14,
//     overflow: "hidden",
//     marginBottom: 30,
//   },
//   modalBackground: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.9)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   fullscreenImage: { width: "100%", height: "80%" },
//   closeButton: { position: "absolute", top: 40, right: 20, zIndex: 2 },
// });

// // import React, { useState, useEffect } from "react";
// // import {
// //   ScrollView,
// //   StyleSheet,
// //   TouchableOpacity,
// //   View,
// //   Alert,
// //   Image,
// //   FlatList,
// //   Dimensions,
// //   Modal,
// //   ActivityIndicator,
// // } from "react-native";
// // import * as Animatable from "react-native-animatable";
// // import { SafeAreaView } from "react-native-safe-area-context";
// // import LinearGradient from "react-native-linear-gradient";
// // import MapView, { Marker } from "react-native-maps";
// // import { WebView } from "react-native-webview";
// // import GlobalText from "../../theme/GlobalText"; // ✅ Poppins integration
// // import {
// //   ArrowLeft,
// //   Bookmark,
// //   BookmarkCheck,
// //   Bed,
// //   Bath,
// //   UtensilsCrossed,
// //   Maximize2,
// //   MapPin,
// //   X,
// //   ImageOff,
// // } from "lucide-react-native";

// // import AccordionItem from "../../components/PropertyFullDetailsPage/AccordionItem";
// // import AnimatedBackground from "../../components/ReusableComponents/AnimatedBackground";
// // import { getPropertyById, saveProperty, unsaveProperty } from "../../api/api";

// // const { width } = Dimensions.get("window");

// // export default function PropertyDetailsScreen({ route, navigation }) {
// //   const { property: initialProperty } = route.params;
// //   const [property, setProperty] = useState(initialProperty);
// //   const [loading, setLoading] = useState(true);
// //   const [isSaved, setIsSaved] = useState(initialProperty?.isSaved || false);
// //   const [activeIndex, setActiveIndex] = useState(0);
// //   const [modalVisible, setModalVisible] = useState(false);
// //   const [zoomImage, setZoomImage] = useState(null);

// //   // ✅ Fetch Updated Property Data
// //   useEffect(() => {
// //     const fetchPropertyDetails = async () => {
// //       try {
// //         const data = await getPropertyById(initialProperty._id);
// //         setProperty(data);
// //       } catch (err) {
// //         console.error("Error fetching property:", err.message);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };
// //     fetchPropertyDetails();
// //   }, [initialProperty._id]);

// //   // ✅ Save/Unsave toggle
// //   const handleToggleSave = async () => {
// //     try {
// //       if (isSaved) {
// //         await unsaveProperty(property._id);
// //         setIsSaved(false);
// //         Alert.alert("Removed", "Property removed from saved list.");
// //       } else {
// //         await saveProperty(property._id);
// //         setIsSaved(true);
// //         Alert.alert("Saved", "Property added to your saved list.");
// //       }
// //     } catch (err) {
// //       Alert.alert("Error", "Could not update saved state.");
// //       console.error("Save toggle failed:", err.message);
// //     }
// //   };

// //   const renderImage = ({ item }) => (
// //     <TouchableOpacity
// //       onPress={() => {
// //         setZoomImage(item);
// //         setModalVisible(true);
// //       }}
// //       activeOpacity={0.9}
// //     >
// //       <Image source={{ uri: item }} style={[styles.imageSlide, { width }]} resizeMode="cover" />
// //     </TouchableOpacity>
// //   );

// //   if (loading) {
// //     return (
// //       <View style={styles.loaderContainer}>
// //         <ActivityIndicator size="large" color="#20A68B" />
// //         <GlobalText style={{ color: "#20A68B", marginTop: 10 }}>Loading Property...</GlobalText>
// //       </View>
// //     );
// //   }

// //   return (
// //     <SafeAreaView style={styles.safeArea}>
// //       <AnimatedBackground />

// //       {/* 🔹 Header */}
// //       <LinearGradient colors={["#43C6AC", "#20A68B"]} style={styles.headerGradient}>
// //         <View style={styles.topBar}>
// //           <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
// //             <ArrowLeft size={22} color="#fff" />
// //           </TouchableOpacity>

// //           <GlobalText style={styles.topTitle}>Property Details</GlobalText>

// //           <TouchableOpacity style={styles.iconButton} onPress={handleToggleSave}>
// //             {isSaved ? (
// //               <BookmarkCheck size={22} color="#fff" strokeWidth={2.5} />
// //             ) : (
// //               <Bookmark size={22} color="#fff" />
// //             )}
// //           </TouchableOpacity>
// //         </View>
// //       </LinearGradient>

// //       {/* 🔹 Content */}
// //       <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
// //         {/* 🖼 Image Slider */}
// //         <Animatable.View animation="fadeInUp" duration={800}>
// //           {property.images && property.images.length > 0 ? (
// //             <>
// //               <FlatList
// //                 data={property.images}
// //                 renderItem={renderImage}
// //                 keyExtractor={(item, index) => index.toString()}
// //                 horizontal
// //                 pagingEnabled
// //                 showsHorizontalScrollIndicator={false}
// //                 onMomentumScrollEnd={(e) => {
// //                   const index = Math.round(e.nativeEvent.contentOffset.x / width);
// //                   setActiveIndex(index);
// //                 }}
// //               />
// //               <View style={styles.pagination}>
// //                 {property.images.map((_, i) => (
// //                   <View
// //                     key={i}
// //                     style={[
// //                       styles.dot,
// //                       { backgroundColor: i === activeIndex ? "#20A68B" : "#ccc" },
// //                     ]}
// //                   />
// //                 ))}
// //               </View>
// //             </>
// //           ) : (
// //             <View style={[styles.imageSlide, styles.noImage]}>
// //               <ImageOff size={40} color="#aaa" />
// //               <GlobalText style={{ color: "#666", marginTop: 5 }}>No Image Available</GlobalText>
// //             </View>
// //           )}
// //         </Animatable.View>

// //                 {/* 🏡 Property Info */}
// //         <Animatable.View animation="fadeInUp" delay={150} duration={800} style={styles.detailsCard}>
// //           <GlobalText style={styles.title}>{property.title}</GlobalText>
// //           <GlobalText style={styles.price}>₹ {property.price}</GlobalText>

// //           <View style={styles.locationRow}>
// //             <MapPin size={16} color="#20A68B" />
// //             <GlobalText style={styles.locationText}>
// //               {property.location || "Location not provided by owner"}
// //             </GlobalText>
// //           </View>

// //           <View style={styles.featuresGrid}>
// //             <View style={styles.featureBox}>
// //               <Bed size={18} color="#FF6B6B" />
// //               <GlobalText style={styles.featureText}>{property.bedrooms} Beds</GlobalText>
// //             </View>
// //             <View style={styles.featureBox}>
// //               <Bath size={18} color="#3AAFA9" />
// //               <GlobalText style={styles.featureText}>{property.bathrooms} Baths</GlobalText>
// //             </View>
// //             <View style={styles.featureBox}>
// //               <UtensilsCrossed size={18} color="#FFA41B" />
// //               <GlobalText style={styles.featureText}>{property.kitchen} Kitchen</GlobalText>
// //             </View>
// //           </View>

// //           <View style={styles.sqftRow}>
// //             <Maximize2 size={16} color="#20A68B" />
// //             <GlobalText style={styles.sqftText}>
// //               {property.size ? `${property.size} sqft` : "N/A sqft"}
// //             </GlobalText>
// //           </View>
// //         </Animatable.View>

// //         {/* <Animatable.View animation="fadeInUp" delay={150} duration={800} style={styles.detailsCard}>
// //           <GlobalText style={styles.title}>{property.title}</GlobalText>
// //           <GlobalText style={styles.price}>₹ {property.price}</GlobalText>

// //           <View style={styles.locationRow}>
// //             <MapPin size={16} color="#20A68B" />
// //             <GlobalText style={styles.locationText}>
// //               {property.location || "Location not provided by owner"}
// //             </GlobalText>
// //           </View>

// //           <View style={styles.featuresRow}>
// //             <Feature icon={<Bed size={16} color="#FF6B6B" />} text={`${property.bedrooms} Beds`} />
// //             <Feature icon={<Bath size={16} color="#3AAFA9" />} text={`${property.bathrooms} Baths`} />
// //             <Feature icon={<UtensilsCrossed size={16} color="#FFA41B" />} text={`${property.kitchen} Kitchen`} />
// //             <Feature icon={<Maximize2 size={16} color="#20A68B" />} text={`${property.size || "N/A"} sqft`} />
// //           </View>
// //         </Animatable.View> */}

// //         {/* 🧾 Details Accordion */}
// //         {property.amenities && (
// //           <AccordionItem title="Amenities">
// //             <GlobalText style={styles.accordionText}>{property.amenities}</GlobalText>
// //           </AccordionItem>
// //         )}
// //         {property.interior && (
// //           <AccordionItem title="Interior Details">
// //             <GlobalText style={styles.accordionText}>{property.interior}</GlobalText>
// //           </AccordionItem>
// //         )}
// //         {property.construction && (
// //           <AccordionItem title="Construction Details">
// //             <GlobalText style={styles.accordionText}>{property.construction}</GlobalText>
// //           </AccordionItem>
// //         )}

// //         {/* 🗺 Map Section */}
// //         {property.mapLocation && (
// //           <Animatable.View animation="fadeInUp" delay={450} duration={800}>
// //             <GlobalText style={styles.sectionTitle}>Location</GlobalText>
// //             <View style={styles.mapContainer}>
// //               {property.latitude && property.longitude ? (
// //                 <MapView
// //                   style={{ flex: 1 }}
// //                   initialRegion={{
// //                     latitude: parseFloat(property.latitude),
// //                     longitude: parseFloat(property.longitude),
// //                     latitudeDelta: 0.01,
// //                     longitudeDelta: 0.01,
// //                   }}
// //                 >
// //                   <Marker
// //                     coordinate={{
// //                       latitude: parseFloat(property.latitude),
// //                       longitude: parseFloat(property.longitude),
// //                     }}
// //                     title={property.title}
// //                     description={property.location}
// //                   />
// //                 </MapView>
// //               ) : (
// //                 <WebView source={{ uri: property.mapLocation }} style={{ flex: 1 }} />
// //               )}
// //             </View>
// //           </Animatable.View>
// //         )}
// //       </ScrollView>

// //       {/* 🔍 Full Image Modal */}
// //       <Modal visible={modalVisible} transparent>
// //         <View style={styles.modalBackground}>
// //           <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
// //             <X size={28} color="#fff" />
// //           </TouchableOpacity>
// //           {zoomImage && (
// //             <Image source={{ uri: zoomImage }} style={styles.fullscreenImage} resizeMode="contain" />
// //           )}
// //         </View>
// //       </Modal>
// //     </SafeAreaView>
// //   );
// // }

// // // ✅ Reusable Feature Box
// // const Feature = ({ icon, text }) => (
// //   <View style={styles.featureItem}>
// //     {icon}
// //     <GlobalText style={styles.featureText}>{text}</GlobalText>
// //   </View>
// // );

// // const styles = StyleSheet.create({
// //   safeArea: { flex: 1, backgroundColor: "#f9f9f9" },
// //   container: { flex: 1 },
// //   loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
// //   headerGradient: {
// //     paddingVertical: 12,
// //     borderBottomLeftRadius: 20,
// //     borderBottomRightRadius: 20,
// //     elevation: 5,
// //   },
// //   topBar: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     justifyContent: "space-between",
// //     paddingHorizontal: 16,
// //   },
// //   topTitle: { fontSize: 18, fontWeight: "700", color: "#fff" },
// //   iconButton: { padding: 8, borderRadius: 10 },
// //   imageSlide: {
// //     height: 250,
// //     borderRadius: 15,
// //     backgroundColor: "#f0f0f0",
// //     marginTop: 10,
// //   },
// //   noImage: { justifyContent: "center", alignItems: "center" },
// //   pagination: { flexDirection: "row", justifyContent: "center", marginVertical: 8 },
// //   dot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 4 },
// //   detailsCard: {
// //     backgroundColor: "#fff",
// //     borderRadius: 16,
// //     padding: 18,
// //     margin: 16,
// //     elevation: 6,
// //   },
// //   title: { fontSize: 20, fontWeight: "700", color: "#222" },
// //   price: { fontSize: 18, fontWeight: "700", color: "#20A68B", marginTop: 4 },
// //   locationRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
// //   locationText: { marginLeft: 4, fontSize: 13, color: "#555" },
// //   featuresRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
// //   featureItem: { flexDirection: "row", alignItems: "center" },
// //   featureText: { fontSize: 13, color: "#333", marginLeft: 4 },
// //   accordionText: { fontSize: 14, color: "#555" },
// //   sectionTitle: { fontSize: 17, fontWeight: "700", marginHorizontal: 16, marginTop: 20, color: "#222" },
// //   mapContainer: {
// //     height: 600,
// //     marginHorizontal: 16,
// //     marginTop: 10,
// //     borderRadius: 14,
// //     overflow: "hidden",
// //     marginBottom: 30,
// //   },
// //   modalBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.9)", justifyContent: "center", alignItems: "center" },
// //   fullscreenImage: { width: "100%", height: "80%" },
// //   closeButton: { position: "absolute", top: 40, right: 20, zIndex: 2 },
// // });
