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
  Linking,
  Platform,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { SafeAreaView } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
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
  PhoneCall,
  Navigation,
  ExternalLink,
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

  // ✅ Open Google Maps with coordinates (External Browser/App)
  const openInGoogleMaps = () => {
    if (!property?.mapLocation?.lat || !property?.mapLocation?.lng) {
      Alert.alert("Error", "Location coordinates not available");
      return;
    }

    const lat = property.mapLocation.lat;
    const lng = property.mapLocation.lng;
    const label = encodeURIComponent(property.title || "Property Location");

    // Cross-platform Google Maps URL
    const scheme = Platform.select({
      ios: `comgooglemaps://?center=${lat},${lng}&q=${lat},${lng}&zoom=14`,
      android: `geo:${lat},${lng}?q=${lat},${lng}(${label})`,
    });

    const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

    Linking.canOpenURL(scheme)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(scheme);
        } else {
          return Linking.openURL(fallbackUrl);
        }
      })
      .catch((err) => {
        console.error("Map open error:", err);
        Linking.openURL(fallbackUrl);
      });
  };

  // ✅ Open OpenStreetMap in browser (Alternative option)
  const openInOpenStreetMap = () => {
    if (!property?.mapLocation?.lat || !property?.mapLocation?.lng) {
      Alert.alert("Error", "Location coordinates not available");
      return;
    }

    const lat = property.mapLocation.lat;
    const lng = property.mapLocation.lng;
    const osmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;

    Linking.openURL(osmUrl).catch((err) => {
      console.error("OSM open error:", err);
      Alert.alert("Error", "Could not open map");
    });
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
                  {property.bedrooms ? `${property.bedrooms} Bedroom` : "N/A Beds"}
                </GlobalText>
              </View>
              <View style={styles.featureBox}>
                <Bath size={18} color="#3AAFA9" />
                <GlobalText style={styles.featureText}>
                  {property.bathrooms ? `${property.bathrooms} Bathroom` : "N/A Baths"}
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
              {property.propertySize && property.propertyUnit
                ? `${property.propertySize} ${property.propertyUnit}`
                : property.sqft
                ? `${property.sqft} sqft`
                : "N/A"}
            </GlobalText>
          </View>

          <View style={styles.contactRow}>
            <PhoneCall size={16} color="#20A68B" />
            <GlobalText style={styles.contactText}>
              {property.contact ? `${property.contact}` : "N/A Contact"}
            </GlobalText>
          </View>
        </Animatable.View>

        {/* 🧾 Details Accordion */}
        {property.buildingDetails && (
          <AccordionItem title="Building Details">
            <GlobalText style={styles.accordionText}>{property.buildingDetails}</GlobalText>
          </AccordionItem>
        )}
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

        {/* 🗺 Map Section - OpenStreetMap via WebView (100% FREE) */}
        {property.mapLocation?.lat && property.mapLocation?.lng && (
          <Animatable.View animation="fadeInUp" delay={300} duration={700}>
            <GlobalText style={styles.sectionTitle}>Location on Map</GlobalText>

            <View style={styles.mapCard}>
              {/* OpenStreetMap via WebView */}
              <WebView
                source={{
                  uri: `https://www.openstreetmap.org/export/embed.html?bbox=${
                    Number(property.mapLocation.lng) - 0.01
                  },${Number(property.mapLocation.lat) - 0.01},${
                    Number(property.mapLocation.lng) + 0.01
                  },${Number(property.mapLocation.lat) + 0.01}&layer=mapnik&marker=${
                    property.mapLocation.lat
                  },${property.mapLocation.lng}`,
                }}
                style={styles.webViewMap}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                scalesPageToFit={true}
                scrollEnabled={false}
                renderLoading={() => (
                  <View style={styles.mapLoader}>
                    <ActivityIndicator size="small" color="#20A68B" />
                  </View>
                )}
              />

              {/* Navigation Buttons Overlay */}
              <View style={styles.mapButtonsContainer}>
                <TouchableOpacity
                  style={styles.mapActionBtn}
                  onPress={openInGoogleMaps}
                  activeOpacity={0.8}
                >
                  <Navigation size={16} color="#fff" />
                  <GlobalText style={styles.mapBtnText}>Google Maps</GlobalText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.mapActionBtn, styles.mapActionBtnSecondary]}
                  onPress={openInOpenStreetMap}
                  activeOpacity={0.8}
                >
                  <ExternalLink size={16} color="#fff" />
                  <GlobalText style={styles.mapBtnText}>Open in Browser</GlobalText>
                </TouchableOpacity>
              </View>
            </View>
          </Animatable.View>
        )}
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
  contactRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  contactText: { fontSize: 15, fontWeight: "600", color: "#333", marginLeft: 6 },
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
  accordionText: { fontSize: 14, color: "#555", lineHeight: 20 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
    color: "#222",
  },
  mapCard: {
    height: 280,
    marginHorizontal: 16,
    marginBottom: 30,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#eaeaea",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  webViewMap: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  mapLoader: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -12 }, { translateY: -12 }],
  },
  mapButtonsContainer: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  mapActionBtn: {
    backgroundColor: "#20A68B",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    flex: 1,
    justifyContent: "center",
  },
  mapActionBtnSecondary: {
    backgroundColor: "#3498db",
  },
  mapBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
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
//   PhoneCall,
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

//   // ✅ Fetch updated property data
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
//       } else {
//         await saveProperty(property._id);
//         setIsSaved(true);
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

//   const openInGoogleMaps = () => {
//   if (!property?.mapLocation?.lat || !property?.mapLocation?.lng) return;

//   const lat = property.mapLocation.lat;
//   const lng = property.mapLocation.lng;

//   const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

//   Linking.canOpenURL(googleMapsUrl)
//     .then((supported) => {
//       if (supported) {
//         Linking.openURL(googleMapsUrl);
//       } else {
//         Alert.alert("Error", "Unable to open Google Maps");
//       }
//     })
//     .catch((err) => {
//       console.error("Map open error:", err);
//       Alert.alert("Error", "Something went wrong");
//     });
// };


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

//           {/* 🛏️ Show only if category is House */}
//           {property?.category?.toLowerCase() === "house" && (
//             <View style={styles.featuresGrid}>
//               <View style={styles.featureBox}>
//                 <Bed size={18} color="#FF6B6B" />
//                 <GlobalText style={styles.featureText}>
//                   {property.bedrooms ? `${property.bedrooms} Beds` : "N/A Beds"}
//                 </GlobalText>
//               </View>
//               <View style={styles.featureBox}>
//                 <Bath size={18} color="#3AAFA9" />
//                 <GlobalText style={styles.featureText}>
//                   {property.bathrooms ? `${property.bathrooms} Baths` : "N/A Baths"}
//                 </GlobalText>
//               </View>
//               <View style={styles.featureBox}>
//                 <UtensilsCrossed size={18} color="#FFA41B" />
//                 <GlobalText style={styles.featureText}>
//                   {property.kitchen ? `${property.kitchen} Kitchen` : "N/A Kitchen"}
//                 </GlobalText>
//               </View>
//             </View>
//           )}

//           <View style={styles.sqftRow}>
//             <Maximize2 size={16} color="#20A68B" />
//             <GlobalText style={styles.sqftText}>
//               {property.sqft ? `${property.sqft} sqft` : "N/A sqft"}
//             </GlobalText>
//           </View>
//           <View style={styles.contact}>
//             <PhoneCall size={16} color="#20A68B" />
//             <GlobalText style={styles.contact}>
//               {property.contact ? `${property.contact}` : "N/A Contact"}
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
    

//         {property.mapLocation?.lat && property.mapLocation?.lng && (
//   <Animatable.View animation="fadeInUp" delay={300} duration={700}>
//     <GlobalText style={styles.sectionTitle}>Location</GlobalText>

//     <View style={styles.mapCard}>
//       {/* Map */}
//       <MapView
//         provider={PROVIDER_DEFAULT}
//         style={StyleSheet.absoluteFillObject}
//         initialRegion={{
//           latitude: Number(property.mapLocation.lat),
//           longitude: Number(property.mapLocation.lng),
//           latitudeDelta: 0.01,
//           longitudeDelta: 0.01,
//         }}
//         pointerEvents="none" // 👈 map is view-only
//       >
//         <Marker
//           coordinate={{
//             latitude: Number(property.mapLocation.lat),
//             longitude: Number(property.mapLocation.lng),
//           }}
//           title={property.title}
//           description={property.location}
//         />
//       </MapView>

//       {/* Overlay Button */}
//       <TouchableOpacity
//         style={styles.mapActionBtn}
//         onPress={openInGoogleMaps}
//         activeOpacity={0.8}
//       >
//         <Navigation size={18} color="#fff" />
//       </TouchableOpacity>
//     </View>
//   </Animatable.View>
// )}


//         {/* 🗺 Map Section */}
//         {property.mapLocation?.lat && property.mapLocation?.lng && (
//   <View style={styles.mapContainer}>
//     <MapView
//       style={{ flex: 1 }}
//       // provider={PROVIDER_DEFAULT}
//       initialRegion={{
//         latitude: Number(property.mapLocation.lat),
//         longitude: Number(property.mapLocation.lng),
//         latitudeDelta: 0.01,
//         longitudeDelta: 0.01,
//       }}
//     >
//       <Marker
//         coordinate={{
//           latitude: Number(property.mapLocation.lat),
//           longitude: Number(property.mapLocation.lng),
//         }}
//         title={property.title}
//       />
//     </MapView>
//   </View>
// )}

// {/* {property.mapLocation?.lat && property.mapLocation?.lng && (
//   <Animatable.View animation="fadeInUp" delay={450} duration={800}>
//     <GlobalText style={styles.sectionTitle}>Location</GlobalText>

//     <View style={styles.mapContainer}>
//       <MapView
//         style={{ flex: 1 }}
//         initialRegion={{
//           latitude: Number(property.mapLocation.lat),
//           longitude: Number(property.mapLocation.lng),
//           latitudeDelta: 0.01,
//           longitudeDelta: 0.01,
//         }}
//       >
//         <Marker
//           coordinate={{
//             latitude: Number(property.mapLocation.lat),
//             longitude: Number(property.mapLocation.lng),
//           }}
//           title={property.title}
//           description={property.location}
//         />
//       </MapView>
//     </View>
//   </Animatable.View>
// )} */}

//         {/* {property.mapLocation && (
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
//         )} */}
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
//   title: { fontSize: 20, fontWeight: "700", color: "#1A1A1A", marginBottom: 4 },
//   price: { fontSize: 18, fontWeight: "700", color: "#20A68B", marginBottom: 10 },
//   locationRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
//   contact: { fontSize: 18, fontWeight: "700", color: "#20A68B" , marginBottom: 14 },
//   locationText: { marginLeft: 6, fontSize: 16, color: "#555", flexShrink: 1 },
//   featuresGrid: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     borderTopWidth: 1,
//     borderBottomWidth: 1,
//     borderColor: "#E6F4EF",
//     paddingVertical: 10,
//     marginBottom: 6,
//   },
//   featureBox: { flexDirection: "row", alignItems: "center", flex: 1, justifyContent: "center" },
//   featureText: { fontSize: 14, color: "#333", marginLeft: 6 },
//   sqftRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingTop: 8,
//   },
//   sqftText: { fontSize: 14, color: "#222", marginLeft: 6, fontWeight: "600" },
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
//   mapCard: {
//   height: 220,
//   marginHorizontal: 16,
//   marginTop: 10,
//   marginBottom: 30,
//   borderRadius: 16,
//   overflow: "hidden",
//   backgroundColor: "#eaeaea",
// },

// mapActionBtn: {
//   position: "absolute",
//   top: 12,
//   right: 12,
//   backgroundColor: "#20A68B",
//   width: 40,
//   height: 40,
//   borderRadius: 20,
//   justifyContent: "center",
//   alignItems: "center",
//   elevation: 5,
// },

//   modalBackground: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.9)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   fullscreenImage: { width: "100%", height: "80%" },
//   closeButton: { position: "absolute", top: 40, right: 20, zIndex: 2 },
// });
