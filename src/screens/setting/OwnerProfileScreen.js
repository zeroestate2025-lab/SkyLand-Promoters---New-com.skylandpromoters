
import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  useColorScheme,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import * as Animatable from "react-native-animatable";
import { useTheme } from "@react-navigation/native";
import {
  ArrowLeft,
  Pencil,
  Bed,
  Bath,
  UtensilsCrossed,
  PlusCircle,
  MapPin,
  Trash2,
  User,
} from "lucide-react-native";

import AnimatedBackground from "../../components/ReusableComponents/AnimatedBackground";
import GlobalText from "../../theme/GlobalText";
import { getMyProperties, getUserProfile, updateUserName, deleteProperty } from "../../api/api";

export default function OwnerProfileScreen({ navigation }) {
  const { colors } = useTheme();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const [myProperties, setMyProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({
    name: "User",
    phone: "N/A",
    avatar: null,
  });

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userData = await getUserProfile();
        setUser(userData);

        const properties = await getMyProperties();
        setMyProperties(properties);
      } catch (err) {
        console.log("Error fetching data:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

 const handleSaveName = async () => {
  if (!newName.trim()) return;
  try {
    setSaving(true);
    const res = await updateUserName(newName);
    console.log("✅ Update Response:", res);

    if (res.success) {
      setUser((prev) => ({ ...prev, name: res.user.name }));
      setEditModalVisible(false);
    } else {
      alert(res.message || "Failed to update name");
    }
  } catch (err) {
    console.error("❌ Error updating name:", err.response?.data || err.message);
    alert(err.response?.data?.message || "Something went wrong!");
  } finally {
    setSaving(false);
  }
};

// Delete property handler
const handleDeleteProperty = (id) => {
  Alert.alert(
    "Delete property",
    "Are you sure you want to delete this property? This action cannot be undone.",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setDeletingId(id);
            const res = await deleteProperty(id);
            console.log("Delete response:", res);
            // If backend returns success flag or deleted id
            setMyProperties((prev) => prev.filter((p) => p._id !== id));
          } catch (err) {
            console.error("Error deleting property:", err.response?.data || err.message);
            Alert.alert("Delete failed", err.response?.data?.message || "Could not delete property");
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]
  );
};

  const bg = isDark ? "#121212" : "#F9F9F9";
  const card = isDark ? "#1E1E1E" : "#fff";
  const text = isDark ? "#EDEDED" : "#222";
  const subText = isDark ? "#AAAAAA" : "#666";

  const renderProperty = ({ item }) => (
    <Animatable.View
      animation="fadeInUp"
      duration={600}
      style={[styles.card, { backgroundColor: card }]}
    >
      <Image
        source={
          item.thumbnail
            ? { uri: item.thumbnail }
            : {
                uri: "https://images.unsplash.com/photo-1560185127-6ed189bf04bb?auto=format&fit=crop&w=800&q=60",
              }
        }
        style={styles.cardImage}
        resizeMode="cover"
      />

      <View style={styles.cardDetails}>
        <View style={styles.titleRow}>
          <GlobalText
            bold
            numberOfLines={1}
            style={[styles.title, { color: text }]}
          >
            {item.title || "Untitled Property"}
          </GlobalText>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              onPress={() => navigation.navigate("AddProperty", { property: item })}
              activeOpacity={0.8}
              style={{ marginRight: 12 }}
            >
              <Pencil size={18} color="#20A68B" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleDeleteProperty(item._id)}
              activeOpacity={0.8}
            >
              {deletingId === item._id ? (
                <ActivityIndicator size="small" color="#FF3B30" />
              ) : (
                <Trash2 size={18} color="#FF3B30" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <GlobalText style={[styles.price, { color: "#20A68B" }]}>
          ₹ {item.price ? item.price.toLocaleString("en-IN") : "N/A"}
        </GlobalText>

        <View style={styles.locationRow}>
          <MapPin size={14} color={subText} />
          <GlobalText
            numberOfLines={1}
            style={[styles.location, { color: subText }]}
          >
            {item.location || "Location not provided"}
          </GlobalText>
        </View>
      </View>
    </Animatable.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <AnimatedBackground />

      <LinearGradient
        colors={isDark ? ["#114D44", "#0D3732"] : ["#43C6AC", "#20A68B"]}
        style={styles.headerContainer}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.iconBtn}
          >
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>

          <GlobalText bold style={styles.headerTitle}>
            Owner Profile
          </GlobalText>
        </View>
      </LinearGradient>

      <Animatable.View
        animation="fadeInDown"
        duration={800}
        style={[styles.profileCard, { backgroundColor: card }]}
      >
          {user?.avatar ? (
            <Image
              source={{ uri: user.avatar }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, { backgroundColor: isDark ? "#2E5E59" : "#fff", justifyContent: 'center', alignItems: 'center' }]}>
              <User size={28} color={isDark ? "#fff" : "#999"} />
            </View>
          )}
        <View>
          <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 15 }}>
            <GlobalText bold style={[styles.name, { color: text }]}>
              {user.name}
            </GlobalText>
            <TouchableOpacity
              style={{ marginLeft: 8 }}
              onPress={() => {
                setNewName(user.name);
                setEditModalVisible(true);
              }}
            >
              <Pencil size={18} color="#20A68B" />
            </TouchableOpacity>
          </View>
          <GlobalText style={[styles.email, { color: subText, marginLeft: 15 }]}>
            {user.phone}
          </GlobalText>
        </View>
      </Animatable.View>

      <GlobalText bold style={[styles.sectionTitle, { color: text }]}>
        My Listed Properties
      </GlobalText>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#20A68B" />
          <GlobalText style={[styles.loadingText, { color: subText }]}>
            Loading your properties...
          </GlobalText>
        </View>
      ) : myProperties.length === 0 ? (
        <Animatable.View animation="fadeIn" style={styles.emptyState}>
          <GlobalText style={[styles.noPropertyText, { color: subText }]}>
            No properties listed yet.
          </GlobalText>
          <GlobalText style={[styles.subText, { color: subText }]}>
            Tap “Add Property” below to create your first listing 🏡
          </GlobalText>
        </Animatable.View>
      ) : (
        <FlatList
          data={myProperties}
          keyExtractor={(item) => item._id}
          renderItem={renderProperty}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("AddProperty")}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={["#43C6AC", "#20A68B"]}
          style={styles.addButtonGradient}
        >
          <PlusCircle size={22} color="#fff" strokeWidth={2.5} />
          <GlobalText bold style={styles.addText}>
            Add Property
          </GlobalText>
        </LinearGradient>
      </TouchableOpacity>

      {/* 🔹 Edit Name Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalBox, { backgroundColor: card }]}>
            <GlobalText bold style={{ fontSize: 16, marginBottom: 10, color: text }}>
              Edit Name
            </GlobalText>

            <TextInput
              value={newName}
              onChangeText={setNewName}
              style={[
                styles.input,
                {
                  borderColor: "#20A68B",
                  color: text,
                },
              ]}
              placeholder="Enter new name"
              placeholderTextColor="#999"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: "#ccc" }]}
                onPress={() => setEditModalVisible(false)}
              >
                <GlobalText>Cancel</GlobalText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: "#20A68B" }]}
                onPress={handleSaveName}
                disabled={saving}
              >
                <GlobalText style={{ color: "#fff" }}>
                  {saving ? "Saving..." : "Save"}
                </GlobalText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  headerContainer: {
    paddingVertical: 15,
    elevation: 8,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerTitle: { fontSize: 18, color: "#fff", textAlign: "center", flex: 1 },
  iconBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },

  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 15,
    marginTop: 20,
    borderRadius: 14,
    elevation: 4,
  },
  avatar: {
    width: 65,
    height: 65,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "#43C6AC",
  },
  name: { fontSize: 17 },
  email: { fontSize: 14, marginTop: 4 },

  sectionTitle: {
    fontSize: 16,
    marginLeft: 15,
    marginTop: 20,
    marginBottom: 10,
  },

  loaderContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
  },
  loadingText: { marginTop: 8, fontSize: 13 },

  emptyState: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
  },
  noPropertyText: { fontSize: 14, marginBottom: 6 },
  subText: { fontSize: 12 },

  card: {
    flexDirection: "row",
    borderRadius: 14,
    marginHorizontal: 15,
    marginBottom: 15,
    elevation: 5,
    overflow: "hidden",
  },
  cardImage: {
    width: 120,
    height: 120,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
    backgroundColor: "#EAEAEA",
  },
  cardDetails: { flex: 1, padding: 12 },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 15 },
  price: { fontSize: 14, marginVertical: 4 },
  locationRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  location: { fontSize: 12, marginLeft: 4, flexShrink: 1 },
  featuresRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  feature: { flexDirection: "row", alignItems: "center" },
  featureText: { fontSize: 12, marginLeft: 4 },

  addButton: { position: "absolute", bottom: 25, left: 20, right: 20 },
  addButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    paddingVertical: 14,
    elevation: 6,
  },
  addText: { color: "#fff", marginLeft: 8, fontSize: 15 },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalBox: {
    width: "85%",
    padding: 20,
    borderRadius: 12,
    elevation: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  btn: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 10,
  },
});

// import React, { useEffect, useState } from "react";
// import {
//   View,
//   StyleSheet,
//   Image,
//   TouchableOpacity,
//   FlatList,
//   ActivityIndicator,
//   useColorScheme,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import LinearGradient from "react-native-linear-gradient";
// import * as Animatable from "react-native-animatable";
// import { useTheme } from "@react-navigation/native";
// import {
//   ArrowLeft,
//   Pencil,
//   Bed,
//   Bath,
//   UtensilsCrossed,
//   PlusCircle,
//   MapPin,
// } from "lucide-react-native";

// import AnimatedBackground from "../../components/ReusableComponents/AnimatedBackground";
// import GlobalText from "../../theme/GlobalText";
// import { getMyProperties, getUserProfile } from "../../api/api";

// export default function OwnerProfileScreen({ navigation }) {
//   // ✅ All hooks must be declared here (no conditionals!)
//   const { colors } = useTheme();
//   const scheme = useColorScheme();
//   const isDark = scheme === "dark";

//   const [myProperties, setMyProperties] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [user, setUser] = useState({
//     name: "User",
//     phone: "N/A",
//     avatar: null,
//   });

//   // ✅ Fetch user & property data
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const userData = await getUserProfile();
//         setUser(userData);

//         const properties = await getMyProperties();
//         setMyProperties(properties);
//       } catch (err) {
//         console.log("Error fetching data:", err.message);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   // Theme colors
//   const bg = isDark ? "#121212" : "#F9F9F9";
//   const card = isDark ? "#1E1E1E" : "#fff";
//   const text = isDark ? "#EDEDED" : "#222";
//   const subText = isDark ? "#AAAAAA" : "#666";

//   // ✅ Renders each property card
//   const renderProperty = ({ item }) => (
//     <Animatable.View
//       animation="fadeInUp"
//       duration={600}
//       style={[styles.card, { backgroundColor: card }]}
//     >
//       <Image
//         source={
//           item.thumbnail
//             ? { uri: item.thumbnail }
//             : {
//                 uri: "https://images.unsplash.com/photo-1560185127-6ed189bf04bb?auto=format&fit=crop&w=800&q=60",
//               }
//         }
//         style={styles.cardImage}
//         resizeMode="cover"
//       />

//       <View style={styles.cardDetails}>
//         <View style={styles.titleRow}>
//           <GlobalText
//             bold
//             numberOfLines={1}
//             style={[styles.title, { color: text }]}
//           >
//             {item.title || "Untitled Property"}
//           </GlobalText>

//           <TouchableOpacity
//             onPress={() => navigation.navigate("AddProperty", { property: item })}
//             activeOpacity={0.8}
//           >
//             <Pencil size={18} color="#20A68B" />
//           </TouchableOpacity>
//         </View>

//         <GlobalText style={[styles.price, { color: "#20A68B" }]}>
//           ₹ {item.price ? item.price.toLocaleString("en-IN") : "N/A"}
//         </GlobalText>

//         <View style={styles.locationRow}>
//           <MapPin size={14} color={subText} />
//           <GlobalText
//             numberOfLines={1}
//             style={[styles.location, { color: subText }]}
//           >
//             {item.location || "Location not provided"}
//           </GlobalText>
//         </View>

//         {/* <View style={styles.featuresRow}>
//           <View style={styles.feature}>
//             <Bed size={16} color="#43C6AC" />
//             <GlobalText style={[styles.featureText, { color: subText }]}>
//               {item.bedrooms || 0}
//             </GlobalText>
//           </View>

//           <View style={styles.feature}>
//             <Bath size={16} color="#43C6AC" />
//             <GlobalText style={[styles.featureText, { color: subText }]}>
//               {item.bathrooms || 0}
//             </GlobalText>
//           </View>

//           <View style={styles.feature}>
//             <UtensilsCrossed size={16} color="#43C6AC" />
//             <GlobalText style={[styles.featureText, { color: subText }]}>
//               {item.kitchen === "Yes" ? "Yes" : "No"}
//             </GlobalText>
//           </View>
//         </View> */}
//       </View>
//     </Animatable.View>
//   );

//   return (
//     <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
//       <AnimatedBackground />

//       {/* 🔹 Header */}
//       <LinearGradient
//         colors={isDark ? ["#114D44", "#0D3732"] : ["#43C6AC", "#20A68B"]}
//         style={styles.headerContainer}
//       >
//         <View style={styles.header}>
//           <TouchableOpacity
//             onPress={() => navigation.goBack()}
//             style={styles.iconBtn}
//           >
//             <ArrowLeft size={24} color="#fff" />
//           </TouchableOpacity>

//           <GlobalText bold style={styles.headerTitle}>
//             Owner Profile
//           </GlobalText>

//           {/* <TouchableOpacity
//             onPress={() => navigation.navigate("EditOwnerProfile", { user })}
//             style={styles.iconBtn}
//           >
//             <Pencil size={22} color="#fff" />
//           </TouchableOpacity> */}
//         </View>
//       </LinearGradient>

//       {/* 🔹 User Card */}
//       <Animatable.View
//         animation="fadeInDown"
//         duration={800}
//         style={[styles.profileCard, { backgroundColor: card }]}
//       >
//         <Image
//           source={{
//             uri: user.avatar || "https://randomuser.me/api/portraits/men/75.jpg",
//           }}
//           style={styles.avatar}
//         />
//         <View style={{ marginLeft: 15 }}>
//           <GlobalText bold style={[styles.name, { color: text }]}>
//             {user.name}
//           </GlobalText>
//           <GlobalText style={[styles.email, { color: subText }]}>
//             {user.phone}
//           </GlobalText>
//         </View>
//       </Animatable.View>

//       {/* 🔹 Listed Properties Section */}
//       <GlobalText bold style={[styles.sectionTitle, { color: text }]}>
//         My Listed Properties
//       </GlobalText>

//       {/* 🌀 Loader / Data Display */}
//       {loading ? (
//         <View style={styles.loaderContainer}>
//           <ActivityIndicator size="large" color="#20A68B" />
//           <GlobalText style={[styles.loadingText, { color: subText }]}>
//             Loading your properties...
//           </GlobalText>
//         </View>
//       ) : myProperties.length === 0 ? (
//         <Animatable.View animation="fadeIn" style={styles.emptyState}>
//           <GlobalText style={[styles.noPropertyText, { color: subText }]}>
//             No properties listed yet.
//           </GlobalText>
//           <GlobalText style={[styles.subText, { color: subText }]}>
//             Tap “Add Property” below to create your first listing 🏡
//           </GlobalText>
//         </Animatable.View>
//       ) : (
//         <FlatList
//           data={myProperties}
//           keyExtractor={(item) => item._id}
//           renderItem={renderProperty}
//           contentContainerStyle={{ paddingBottom: 100 }}
//           showsVerticalScrollIndicator={false}
//         />
//       )}

//       {/* 🔹 Add Property Button */}
//       <TouchableOpacity
//         style={styles.addButton}
//         onPress={() => navigation.navigate("AddProperty")}
//         activeOpacity={0.9}
//       >
//         <LinearGradient
//           colors={["#43C6AC", "#20A68B"]}
//           style={styles.addButtonGradient}
//         >
//           <PlusCircle size={22} color="#fff" strokeWidth={2.5} />
//           <GlobalText bold style={styles.addText}>
//             Add Property
//           </GlobalText>
//         </LinearGradient>
//       </TouchableOpacity>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },

//   headerContainer: {
//     paddingVertical: 15,
//     elevation: 8,
//     borderBottomLeftRadius: 20,
//     borderBottomRightRadius: 20,
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 16,
//   },
//   headerTitle: { fontSize: 18, color: "#fff", textAlign: "center", flex: 1 },
//   iconBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },

//   profileCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 16,
//     marginHorizontal: 15,
//     marginTop: 20,
//     borderRadius: 14,
//     elevation: 4,
//   },
//   avatar: {
//     width: 65,
//     height: 65,
//     borderRadius: 35,
//     borderWidth: 2,
//     borderColor: "#43C6AC",
//   },
//   name: { fontSize: 17 },
//   email: { fontSize: 14, marginTop: 4 },

//   sectionTitle: {
//     fontSize: 16,
//     marginLeft: 15,
//     marginTop: 20,
//     marginBottom: 10,
//   },

//   loaderContainer: {
//     justifyContent: "center",
//     alignItems: "center",
//     marginTop: 25,
//   },
//   loadingText: { marginTop: 8, fontSize: 13 },

//   emptyState: {
//     justifyContent: "center",
//     alignItems: "center",
//     marginTop: 30,
//   },
//   noPropertyText: { fontSize: 14, marginBottom: 6 },
//   subText: { fontSize: 12 },

//   card: {
//     flexDirection: "row",
//     borderRadius: 14,
//     marginHorizontal: 15,
//     marginBottom: 15,
//     elevation: 5,
//     overflow: "hidden",
//   },
//   cardImage: {
//     width: 120,
//     height: 120,
//     borderTopLeftRadius: 14,
//     borderBottomLeftRadius: 14,
//     backgroundColor: "#EAEAEA",
//   },
//   cardDetails: { flex: 1, padding: 12 },
//   titleRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   title: { fontSize: 15 },
//   price: { fontSize: 14, marginVertical: 4 },
//   locationRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
//   location: { fontSize: 12, marginLeft: 4, flexShrink: 1 },
//   featuresRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 8,
//   },
//   feature: { flexDirection: "row", alignItems: "center" },
//   featureText: { fontSize: 12, marginLeft: 4 },

//   addButton: { position: "absolute", bottom: 25, left: 20, right: 20 },
//   addButtonGradient: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     borderRadius: 14,
//     paddingVertical: 14,
//     elevation: 6,
//   },
//   addText: { color: "#fff", marginLeft: 8, fontSize: 15 },
// });

// // import React, { useEffect, useState } from "react";
// // import {
// //   View,
// //   StyleSheet,
// //   Image,
// //   TouchableOpacity,
// //   FlatList,
// //   useColorScheme,
// // } from "react-native";
// // import { SafeAreaView } from "react-native-safe-area-context";
// // import LinearGradient from "react-native-linear-gradient";
// // import * as Animatable from "react-native-animatable";
// // import { useTheme } from "@react-navigation/native";
// // import {
// //   ArrowLeft,
// //   Pencil,
// //   Bed,
// //   Bath,
// //   UtensilsCrossed,
// //   PlusCircle,
// //   MapPin,
// // } from "lucide-react-native";

// // import AnimatedBackground from "../../components/ReusableComponents/AnimatedBackground";
// // import GlobalText from "../../theme/GlobalText";
// // import { getMyProperties, getUserProfile } from "../../api/api";

// // export default function OwnerProfileScreen({ navigation }) {
// //   const { colors } = useTheme();
// //   const scheme = useColorScheme();
// //   const isDark = scheme === "dark";

// //   const [myProperties, setMyProperties] = useState([]);
// //   const [user, setUser] = useState({
// //     name: "User",
// //     phone: "N/A",
// //     avatar: null,
// //   });

// //   // 🔹 Fetch User Profile + Listed Properties
// //   useEffect(() => {
// //     const fetchData = async () => {
// //       try {
// //         const userData = await getUserProfile();
// //         setUser(userData);

// //         const properties = await getMyProperties();
// //         setMyProperties(properties);
// //       } catch (err) {
// //         console.log("Error fetching data:", err.message);
// //       }
// //     };
// //     fetchData();
// //   }, []);

// //   const bg = isDark ? "#121212" : "#F9F9F9";
// //   const card = isDark ? "#1E1E1E" : "#fff";
// //   const text = isDark ? "#EDEDED" : "#222";
// //   const subText = isDark ? "#AAAAAA" : "#666";

// //   // 🔹 Property Item Renderer
// //   const renderProperty = ({ item }) => (
// //     <Animatable.View
// //       animation="fadeInUp"
// //       duration={600}
// //       style={[styles.card, { backgroundColor: card }]}
// //     >
// //       <Image
// //         source={
// //           item.thumbnail
// //             ? { uri: item.thumbnail }
// //             : {
// //                 uri: "https://images.unsplash.com/photo-1560185127-6ed189bf04bb?auto=format&fit=crop&w=800&q=60",
// //               } // ✅ online home placeholder
// //         }
// //         style={styles.cardImage}
// //         resizeMode="cover"
// //       />
// //       <View style={styles.cardDetails}>
// //         <View style={styles.titleRow}>
// //           <GlobalText
// //             bold
// //             numberOfLines={1}
// //             style={[styles.title, { color: text }]}
// //           >
// //             {item.title || "Untitled Property"}
// //           </GlobalText>

// //           <TouchableOpacity
// //             onPress={() =>
// //               navigation.navigate("AddProperty", { property: item })
// //             }
// //             activeOpacity={0.8}
// //           >
// //             <Pencil size={18} color="#20A68B" />
// //           </TouchableOpacity>
// //         </View>

// //         <GlobalText style={[styles.price, { color: "#20A68B" }]}>
// //           ₹ {item.price ? item.price.toLocaleString("en-IN") : "N/A"}
// //         </GlobalText>

// //         <View style={styles.locationRow}>
// //           <MapPin size={14} color={subText} />
// //           <GlobalText
// //             numberOfLines={1}
// //             style={[styles.location, { color: subText }]}
// //           >
// //             {item.location || "Location not provided"}
// //           </GlobalText>
// //         </View>

// //         <View style={styles.featuresRow}>
// //           <View style={styles.feature}>
// //             <Bed size={16} color="#43C6AC" />
// //             <GlobalText style={[styles.featureText, { color: subText }]}>
// //               {item.bedrooms || 0}
// //             </GlobalText>
// //           </View>

// //           <View style={styles.feature}>
// //             <Bath size={16} color="#43C6AC" />
// //             <GlobalText style={[styles.featureText, { color: subText }]}>
// //               {item.bathrooms || 0}
// //             </GlobalText>
// //           </View>

// //           <View style={styles.feature}>
// //             <UtensilsCrossed size={16} color="#43C6AC" />
// //             <GlobalText style={[styles.featureText, { color: subText }]}>
// //               {item.kitchen === "Yes" ? "Yes" : "No"}
// //             </GlobalText>
// //           </View>
// //         </View>
// //       </View>
// //     </Animatable.View>
// //   );

// //   return (
// //     <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
// //       <AnimatedBackground />

// //       {/* 🔹 Header */}
// //       <LinearGradient
// //         colors={isDark ? ["#114D44", "#0D3732"] : ["#43C6AC", "#20A68B"]}
// //         style={styles.headerContainer}
// //       >
// //         <View style={styles.header}>
// //           <TouchableOpacity
// //             onPress={() => navigation.goBack()}
// //             style={styles.iconBtn}
// //           >
// //             <ArrowLeft size={24} color="#fff" />
// //           </TouchableOpacity>

// //           <GlobalText bold style={styles.headerTitle}>
// //             Owner Profile
// //           </GlobalText>

// //           <TouchableOpacity
// //             onPress={() => navigation.navigate("EditOwnerProfile", { user })}
// //             style={styles.iconBtn}
// //           >
// //             <Pencil size={22} color="#fff" />
// //           </TouchableOpacity>
// //         </View>
// //       </LinearGradient>

// //       {/* 🔹 User Card */}
// //       <Animatable.View
// //         animation="fadeInDown"
// //         duration={800}
// //         style={[styles.profileCard, { backgroundColor: card }]}
// //       >
// //         <Image
// //           source={{
// //             uri: user.avatar || "https://randomuser.me/api/portraits/men/75.jpg",
// //           }}
// //           style={styles.avatar}
// //         />
// //         <View style={{ marginLeft: 15 }}>
// //           <GlobalText bold style={[styles.name, { color: text }]}>
// //             {user.name}
// //           </GlobalText>
// //           <GlobalText style={[styles.email, { color: subText }]}>
// //             {user.phone}
// //           </GlobalText>
// //         </View>
// //       </Animatable.View>

// //       {/* 🔹 Listed Properties Section */}
// //       <GlobalText bold style={[styles.sectionTitle, { color: text }]}>
// //         My Listed Properties
// //       </GlobalText>

// //       {myProperties.length === 0 ? (
// //         <Animatable.View animation="fadeIn" style={styles.emptyState}>
// //           <GlobalText style={[styles.noPropertyText, { color: subText }]}>
// //             No properties listed yet.
// //           </GlobalText>
// //           <GlobalText style={[styles.subText, { color: subText }]}>
// //             Tap “Add Property” below to create your first listing 🏡
// //           </GlobalText>
// //         </Animatable.View>
// //       ) : (
// //         <FlatList
// //           data={myProperties}
// //           keyExtractor={(item) => item._id}
// //           renderItem={renderProperty}
// //           contentContainerStyle={{ paddingBottom: 100 }}
// //           showsVerticalScrollIndicator={false}
// //         />
// //       )}

// //       {/* 🔹 Add Property Button */}
// //       <TouchableOpacity
// //         style={styles.addButton}
// //         onPress={() => navigation.navigate("AddProperty")}
// //         activeOpacity={0.9}
// //       >
// //         <LinearGradient
// //           colors={["#43C6AC", "#20A68B"]}
// //           style={styles.addButtonGradient}
// //         >
// //           <PlusCircle size={22} color="#fff" strokeWidth={2.5} />
// //           <GlobalText bold style={styles.addText}>
// //             Add Property
// //           </GlobalText>
// //         </LinearGradient>
// //       </TouchableOpacity>
// //     </SafeAreaView>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: { flex: 1 },

// //   headerContainer: {
// //     paddingVertical: 15,
// //     elevation: 8,
// //     borderBottomLeftRadius: 20,
// //     borderBottomRightRadius: 20,
// //   },
// //   header: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     justifyContent: "space-between",
// //     paddingHorizontal: 16,
// //   },
// //   headerTitle: { fontSize: 18, color: "#fff", textAlign: "center", flex: 1 },
// //   iconBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },

// //   profileCard: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     padding: 16,
// //     marginHorizontal: 15,
// //     marginTop: 20,
// //     borderRadius: 14,
// //     elevation: 4,
// //   },
// //   avatar: {
// //     width: 65,
// //     height: 65,
// //     borderRadius: 35,
// //     borderWidth: 2,
// //     borderColor: "#43C6AC",
// //   },
// //   name: { fontSize: 17 },
// //   email: { fontSize: 14, marginTop: 4 },

// //   sectionTitle: {
// //     fontSize: 16,
// //     marginLeft: 15,
// //     marginTop: 20,
// //     marginBottom: 10,
// //   },
// //   emptyState: {
// //     justifyContent: "center",
// //     alignItems: "center",
// //     marginTop: 30,
// //   },
// //   noPropertyText: { fontSize: 14, marginBottom: 6 },
// //   subText: { fontSize: 12 },

// //   card: {
// //     flexDirection: "row",
// //     borderRadius: 14,
// //     marginHorizontal: 15,
// //     marginBottom: 15,
// //     elevation: 5,
// //     overflow: "hidden",
// //   },
// //   cardImage: {
// //     width: 120,
// //     height: 120,
// //     borderTopLeftRadius: 14,
// //     borderBottomLeftRadius: 14,
// //     backgroundColor: "#EAEAEA",
// //   },
// //   cardDetails: { flex: 1, padding: 12 },
// //   titleRow: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "center",
// //   },
// //   title: { fontSize: 15 },
// //   price: { fontSize: 14, marginVertical: 4 },
// //   locationRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
// //   location: { fontSize: 12, marginLeft: 4, flexShrink: 1 },
// //   featuresRow: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     marginTop: 8,
// //   },
// //   feature: { flexDirection: "row", alignItems: "center" },
// //   featureText: { fontSize: 12, marginLeft: 4 },

// //   addButton: { position: "absolute", bottom: 25, left: 20, right: 20 },
// //   addButtonGradient: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     justifyContent: "center",
// //     borderRadius: 14,
// //     paddingVertical: 14,
// //     elevation: 6,
// //   },
// //   addText: { color: "#fff", marginLeft: 8, fontSize: 15 },
// // });

// // // import React, { useEffect, useState } from "react";
// // // import {
// // //   View,
// // //   StyleSheet,
// // //   Image,
// // //   TouchableOpacity,
// // //   FlatList,
// // //   useColorScheme,
// // // } from "react-native";
// // // import { SafeAreaView } from "react-native-safe-area-context";
// // // import LinearGradient from "react-native-linear-gradient";
// // // import * as Animatable from "react-native-animatable";
// // // import { useTheme } from "@react-navigation/native";
// // // import {
// // //   ArrowLeft,
// // //   Pencil,
// // //   Bed,
// // //   Bath,
// // //   UtensilsCrossed,
// // //   PlusCircle,
// // //   MapPin,
// // // } from "lucide-react-native";

// // // import AnimatedBackground from "../../components/ReusableComponents/AnimatedBackground";
// // // import GlobalText from "../../theme/GlobalText";
// // // import { getMyProperties, getUserProfile } from "../../api/api";

// // // export default function OwnerProfileScreen({ navigation }) {
// // //   const { colors } = useTheme();
// // //   const scheme = useColorScheme();
// // //   const isDark = scheme === "dark";

// // //   const [myProperties, setMyProperties] = useState([]);
// // //   const [user, setUser] = useState({
// // //     name: "User",
// // //     phone: "N/A",
// // //     avatar: null,
// // //   });

// // //   useEffect(() => {
// // //     const fetchData = async () => {
// // //       try {
// // //         const userData = await getUserProfile();
// // //         setUser(userData);
// // //         const properties = await getMyProperties();
// // //         setMyProperties(properties);
// // //       } catch (err) {
// // //         console.log("Error fetching data:", err.message);
// // //       }
// // //     };
// // //     fetchData();
// // //   }, []);

// // //   const bg = isDark ? "#121212" : "#F9F9F9";
// // //   const card = isDark ? "#1E1E1E" : "#fff";
// // //   const text = isDark ? "#EDEDED" : "#222";
// // //   const subText = isDark ? "#AAAAAA" : "#666";

// // //   const renderProperty = ({ item }) => (
// // //     <Animatable.View animation="fadeInUp" duration={600} style={[styles.card, { backgroundColor: card }]}>
// // //       <Image
// // //         source={
// // //           item.thumbnail
// // //             ? { uri: item.thumbnail }
// // //             : require("../../assets/images/no-image.png") // fallback placeholder
// // //         }
// // //         style={styles.cardImage}
// // //         resizeMode="cover"
// // //       />
// // //       <View style={styles.cardDetails}>
// // //         <View style={styles.titleRow}>
// // //           <GlobalText bold numberOfLines={1} style={[styles.title, { color: text }]}>
// // //             {item.title}
// // //           </GlobalText>
// // //           <TouchableOpacity
// // //             onPress={() => navigation.navigate("AddProperty", { property: item })}
// // //             activeOpacity={0.8}
// // //           >
// // //             <Pencil size={18} color="#20A68B" />
// // //           </TouchableOpacity>
// // //         </View>

// // //         <GlobalText style={[styles.price, { color: "#20A68B" }]}>₹ {item.price}</GlobalText>

// // //         <View style={styles.locationRow}>
// // //           <MapPin size={14} color={subText} />
// // //           <GlobalText numberOfLines={1} style={[styles.location, { color: subText }]}>
// // //             {item.location || "Location not provided"}
// // //           </GlobalText>
// // //         </View>

// // //         <View style={styles.featuresRow}>
// // //           <View style={styles.feature}>
// // //             <Bed size={16} color="#43C6AC" />
// // //             <GlobalText style={[styles.featureText, { color: subText }]}>
// // //               {item.bedrooms || 0}
// // //             </GlobalText>
// // //           </View>
// // //           <View style={styles.feature}>
// // //             <Bath size={16} color="#43C6AC" />
// // //             <GlobalText style={[styles.featureText, { color: subText }]}>
// // //               {item.bathrooms || 0}
// // //             </GlobalText>
// // //           </View>
// // //           <View style={styles.feature}>
// // //             <UtensilsCrossed size={16} color="#43C6AC" />
// // //             <GlobalText style={[styles.featureText, { color: subText }]}>
// // //               {item.kitchen === "Yes" ? "Yes" : "No"}
// // //             </GlobalText>
// // //           </View>
// // //         </View>
// // //       </View>
// // //     </Animatable.View>
// // //   );

// // //   return (
// // //     <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
// // //       <AnimatedBackground />

// // //       <LinearGradient
// // //         colors={isDark ? ["#114D44", "#0D3732"] : ["#43C6AC", "#20A68B"]}
// // //         style={styles.headerContainer}
// // //       >
// // //         <View style={styles.header}>
// // //           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
// // //             <ArrowLeft size={24} color="#fff" />
// // //           </TouchableOpacity>
// // //           <GlobalText bold style={styles.headerTitle}>Owner Profile</GlobalText>
// // //           <TouchableOpacity
// // //             onPress={() => navigation.navigate("EditOwnerProfile", { user })}
// // //             style={styles.iconBtn}
// // //           >
// // //             <Pencil size={22} color="#fff" />
// // //           </TouchableOpacity>
// // //         </View>
// // //       </LinearGradient>

// // //       <Animatable.View animation="fadeInDown" duration={800} style={[styles.profileCard, { backgroundColor: card }]}>
// // //         <Image
// // //           source={{
// // //             uri: user.avatar || "https://randomuser.me/api/portraits/men/75.jpg",
// // //           }}
// // //           style={styles.avatar}
// // //         />
// // //         <View style={{ marginLeft: 15 }}>
// // //           <GlobalText bold style={[styles.name, { color: text }]}>{user.name}</GlobalText>
// // //           <GlobalText style={[styles.email, { color: subText }]}>{user.phone}</GlobalText>
// // //         </View>
// // //       </Animatable.View>

// // //       <GlobalText bold style={[styles.sectionTitle, { color: text }]}>
// // //         My Listed Properties
// // //       </GlobalText>

// // //       {myProperties.length === 0 ? (
// // //         <Animatable.View animation="fadeIn" style={styles.emptyState}>
// // //           <GlobalText style={[styles.noPropertyText, { color: subText }]}>
// // //             No properties listed yet.
// // //           </GlobalText>
// // //           <GlobalText style={[styles.subText, { color: subText }]}>
// // //             Tap “Add Property” below to create your first listing 🏡
// // //           </GlobalText>
// // //         </Animatable.View>
// // //       ) : (
// // //         <FlatList
// // //           data={myProperties}
// // //           keyExtractor={(item) => item._id}
// // //           renderItem={renderProperty}
// // //           contentContainerStyle={{ paddingBottom: 100 }}
// // //         />
// // //       )}

// // //       <TouchableOpacity
// // //         style={styles.addButton}
// // //         onPress={() => navigation.navigate("AddProperty")}
// // //         activeOpacity={0.9}
// // //       >
// // //         <LinearGradient colors={["#43C6AC", "#20A68B"]} style={styles.addButtonGradient}>
// // //           <PlusCircle size={22} color="#fff" strokeWidth={2.5} />
// // //           <GlobalText bold style={styles.addText}>Add Property</GlobalText>
// // //         </LinearGradient>
// // //       </TouchableOpacity>
// // //     </SafeAreaView>
// // //   );
// // // }

// // // const styles = StyleSheet.create({
// // //   container: { flex: 1 },
// // //   headerContainer: {
// // //     paddingVertical: 15,
// // //     elevation: 8,
// // //     borderBottomLeftRadius: 20,
// // //     borderBottomRightRadius: 20,
// // //   },
// // //   header: {
// // //     flexDirection: "row",
// // //     alignItems: "center",
// // //     justifyContent: "space-between",
// // //     paddingHorizontal: 16,
// // //   },
// // //   headerTitle: { fontSize: 18, color: "#fff", textAlign: "center", flex: 1 },
// // //   iconBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },

// // //   profileCard: {
// // //     flexDirection: "row",
// // //     alignItems: "center",
// // //     padding: 16,
// // //     marginHorizontal: 15,
// // //     marginTop: 20,
// // //     borderRadius: 14,
// // //     elevation: 4,
// // //   },
// // //   avatar: {
// // //     width: 65,
// // //     height: 65,
// // //     borderRadius: 35,
// // //     borderWidth: 2,
// // //     borderColor: "#43C6AC",
// // //   },
// // //   name: { fontSize: 17 },
// // //   email: { fontSize: 14, marginTop: 4 },
// // //   sectionTitle: { fontSize: 16, marginLeft: 15, marginTop: 20, marginBottom: 10 },
// // //   emptyState: { justifyContent: "center", alignItems: "center", marginTop: 30 },
// // //   noPropertyText: { fontSize: 14, marginBottom: 6 },
// // //   subText: { fontSize: 12 },
// // //   card: {
// // //     flexDirection: "row",
// // //     borderRadius: 14,
// // //     marginHorizontal: 15,
// // //     marginBottom: 15,
// // //     elevation: 5,
// // //     overflow: "hidden",
// // //   },
// // //   cardImage: { width: 120, height: 120 },
// // //   cardDetails: { flex: 1, padding: 12 },
// // //   titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
// // //   title: { fontSize: 15 },
// // //   price: { fontSize: 14, marginVertical: 4 },
// // //   locationRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
// // //   location: { fontSize: 12, marginLeft: 4, flexShrink: 1 },
// // //   featuresRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
// // //   feature: { flexDirection: "row", alignItems: "center" },
// // //   featureText: { fontSize: 12, marginLeft: 4 },
// // //   addButton: { position: "absolute", bottom: 25, left: 20, right: 20 },
// // //   addButtonGradient: {
// // //     flexDirection: "row",
// // //     alignItems: "center",
// // //     justifyContent: "center",
// // //     borderRadius: 14,
// // //     paddingVertical: 14,
// // //     elevation: 6,
// // //   },
// // //   addText: { color: "#fff", marginLeft: 8, fontSize: 15 },
// // // });

// // // // import React, { useEffect, useState } from "react";
// // // // import {
// // // //   View,
// // // //   StyleSheet,
// // // //   Image,
// // // //   TouchableOpacity,
// // // //   FlatList,
// // // // } from "react-native";
// // // // import { SafeAreaView } from "react-native-safe-area-context";
// // // // import LinearGradient from "react-native-linear-gradient";
// // // // import * as Animatable from "react-native-animatable";
// // // // import { useTheme } from "@react-navigation/native";
// // // // import {
// // // //   ArrowLeft,
// // // //   Pencil,
// // // //   Bed,
// // // //   Bath,
// // // //   UtensilsCrossed,
// // // //   PlusCircle,
// // // //   MapPin,
// // // // } from "lucide-react-native";

// // // // import AnimatedBackground from "../../components/ReusableComponents/AnimatedBackground";
// // // // import GlobalText from "../../theme/GlobalText"; // ✅ global typography
// // // // import { getMyProperties, getUserProfile } from "../../api/api";

// // // // export default function OwnerProfileScreen({ navigation }) {
// // // //   const { colors } = useTheme();
// // // //   const [myProperties, setMyProperties] = useState([]);
// // // //   const [user, setUser] = useState({
// // // //     name: "User",
// // // //     phone: "N/A",
// // // //     avatar: null,
// // // //   });

// // // //   useEffect(() => {
// // // //     const fetchData = async () => {
// // // //       try {
// // // //         const userData = await getUserProfile();
// // // //         setUser(userData);

// // // //         const properties = await getMyProperties();
// // // //         setMyProperties(properties);
// // // //       } catch (err) {
// // // //         console.log("Error fetching data:", err.message);
// // // //       }
// // // //     };
// // // //     fetchData();
// // // //   }, []);

// // // //   // 🏠 Render each property
// // // //   const renderProperty = ({ item }) => (
// // // //     <Animatable.View animation="fadeInUp" duration={600} style={styles.card}>
// // // //       <Image
// // // //         source={{
// // // //           uri: item.images?.[0] || "https://via.placeholder.com/150",
// // // //         }}
// // // //         style={styles.cardImage}
// // // //       />
// // // //       <View style={styles.cardDetails}>
// // // //         <View style={styles.titleRow}>
// // // //           <GlobalText bold numberOfLines={1} style={styles.title}>
// // // //             {item.title}
// // // //           </GlobalText>
// // // //           <TouchableOpacity
// // // //             onPress={() => navigation.navigate("AddProperty", { property: item })}
// // // //             activeOpacity={0.8}
// // // //           >
// // // //             <Pencil size={18} color="#20A68B" />
// // // //           </TouchableOpacity>
// // // //         </View>

// // // //         <GlobalText style={styles.price}>₹ {item.price}</GlobalText>

// // // //         <View style={styles.locationRow}>
// // // //           <MapPin size={14} color="#888" />
// // // //           <GlobalText numberOfLines={1} style={styles.location}>
// // // //             {item.location || "Location not provided"}
// // // //           </GlobalText>
// // // //         </View>

// // // //         <View style={styles.featuresRow}>
// // // //           <View style={styles.feature}>
// // // //             <Bed size={16} color="#43C6AC" />
// // // //             <GlobalText style={styles.featureText}>{item.bedrooms || 0}</GlobalText>
// // // //           </View>
// // // //           <View style={styles.feature}>
// // // //             <Bath size={16} color="#43C6AC" />
// // // //             <GlobalText style={styles.featureText}>{item.bathrooms || 0}</GlobalText>
// // // //           </View>
// // // //           <View style={styles.feature}>
// // // //             <UtensilsCrossed size={16} color="#43C6AC" />
// // // //             <GlobalText style={styles.featureText}>
// // // //               {item.kitchen === "Yes" ? "Yes" : "No"}
// // // //             </GlobalText>
// // // //           </View>
// // // //         </View>
// // // //       </View>
// // // //     </Animatable.View>
// // // //   );

// // // //   return (
// // // //     <SafeAreaView style={styles.container}>
// // // //       <AnimatedBackground />

// // // //       {/* 🌿 Header */}
// // // //       <LinearGradient colors={["#43C6AC", "#20A68B"]} style={styles.headerContainer}>
// // // //         <View style={styles.header}>
// // // //           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
// // // //             <ArrowLeft size={24} color="#fff" />
// // // //           </TouchableOpacity>
// // // //           <GlobalText bold style={styles.headerTitle}>
// // // //             Owner Profile
// // // //           </GlobalText>
// // // //           <TouchableOpacity
// // // //             onPress={() => navigation.navigate("EditOwnerProfile", { user })}
// // // //             style={styles.iconBtn}
// // // //           >
// // // //             <Pencil size={22} color="#fff" />
// // // //           </TouchableOpacity>
// // // //         </View>
// // // //       </LinearGradient>

// // // //       {/* 🌿 Profile Card */}
// // // //       <Animatable.View animation="fadeInDown" duration={800} style={styles.profileCard}>
// // // //         <Image
// // // //           source={{
// // // //             uri: user.avatar || "https://randomuser.me/api/portraits/men/75.jpg",
// // // //           }}
// // // //           style={styles.avatar}
// // // //         />
// // // //         <View style={{ marginLeft: 15 }}>
// // // //           <GlobalText bold style={styles.name}>
// // // //             {user.name}
// // // //           </GlobalText>
// // // //           <GlobalText style={styles.email}>{user.phone}</GlobalText>
// // // //         </View>
// // // //       </Animatable.View>

// // // //       {/* 🌿 My Properties */}
// // // //       <GlobalText bold style={styles.sectionTitle}>
// // // //         My Listed Properties
// // // //       </GlobalText>

// // // //       {myProperties.length === 0 ? (
// // // //         <Animatable.View animation="fadeIn" style={styles.emptyState}>
// // // //           <GlobalText style={styles.noPropertyText}>
// // // //             No properties listed yet.
// // // //           </GlobalText>
// // // //           <GlobalText style={styles.subText}>
// // // //             Tap “Add Property” below to create your first listing 🏡
// // // //           </GlobalText>
// // // //         </Animatable.View>
// // // //       ) : (
// // // //         <FlatList
// // // //           data={myProperties}
// // // //           keyExtractor={(item) => item._id}
// // // //           renderItem={renderProperty}
// // // //           contentContainerStyle={{ paddingBottom: 100 }}
// // // //         />
// // // //       )}

// // // //       {/* 🌿 Add Property Floating Button */}
// // // //       <TouchableOpacity
// // // //         style={styles.addButton}
// // // //         onPress={() => navigation.navigate("AddProperty")}
// // // //         activeOpacity={0.9}
// // // //       >
// // // //         <LinearGradient
// // // //           colors={["#43C6AC", "#20A68B"]}
// // // //           style={styles.addButtonGradient}
// // // //         >
// // // //           <PlusCircle size={22} color="#fff" strokeWidth={2.5} />
// // // //           <GlobalText bold style={styles.addText}>
// // // //             Add Property
// // // //           </GlobalText>
// // // //         </LinearGradient>
// // // //       </TouchableOpacity>
// // // //     </SafeAreaView>
// // // //   );
// // // // }

// // // // const styles = StyleSheet.create({
// // // //   container: { flex: 1, backgroundColor: "transparent" },

// // // //   headerContainer: {
// // // //     paddingVertical: 15,
// // // //     elevation: 8,
// // // //     shadowColor: "#20A68B",
// // // //     shadowOpacity: 0.25,
// // // //     shadowRadius: 6,
// // // //     borderBottomLeftRadius: 20,
// // // //     borderBottomRightRadius: 20,
// // // //   },
// // // //   header: {
// // // //     flexDirection: "row",
// // // //     alignItems: "center",
// // // //     justifyContent: "space-between",
// // // //     paddingHorizontal: 16,
// // // //   },
// // // //   headerTitle: {
// // // //     fontSize: 18,
// // // //     color: "#fff",
// // // //     textAlign: "center",
// // // //     flex: 1,
// // // //   },
// // // //   iconBtn: {
// // // //     width: 40,
// // // //     height: 40,
// // // //     borderRadius: 20,
// // // //     justifyContent: "center",
// // // //     alignItems: "center",
// // // //   },

// // // //   profileCard: {
// // // //     flexDirection: "row",
// // // //     alignItems: "center",
// // // //     backgroundColor: "#fff",
// // // //     padding: 16,
// // // //     marginHorizontal: 15,
// // // //     marginTop: 20,
// // // //     borderRadius: 14,
// // // //     elevation: 4,
// // // //   },
// // // //   avatar: {
// // // //     width: 65,
// // // //     height: 65,
// // // //     borderRadius: 35,
// // // //     borderWidth: 2,
// // // //     borderColor: "#43C6AC",
// // // //   },
// // // //   name: { fontSize: 17, color: "#222" },
// // // //   email: { fontSize: 14, color: "#666", marginTop: 4 },

// // // //   sectionTitle: {
// // // //     fontSize: 16,
// // // //     marginLeft: 15,
// // // //     marginTop: 20,
// // // //     marginBottom: 10,
// // // //     color: "#333",
// // // //   },
// // // //   emptyState: {
// // // //     justifyContent: "center",
// // // //     alignItems: "center",
// // // //     marginTop: 30,
// // // //   },
// // // //   noPropertyText: { fontSize: 14, color: "#777", marginBottom: 6 },
// // // //   subText: { fontSize: 12, color: "#999" },

// // // //   card: {
// // // //     flexDirection: "row",
// // // //     backgroundColor: "#fff",
// // // //     borderRadius: 14,
// // // //     marginHorizontal: 15,
// // // //     marginBottom: 15,
// // // //     elevation: 5,
// // // //     overflow: "hidden",
// // // //   },
// // // //   cardImage: { width: 120, height: 120 },
// // // //   cardDetails: { flex: 1, padding: 12 },
// // // //   titleRow: {
// // // //     flexDirection: "row",
// // // //     justifyContent: "space-between",
// // // //     alignItems: "center",
// // // //   },
// // // //   title: { fontSize: 15, color: "#222", flex: 1 },
// // // //   price: { fontSize: 14, color: "#20A68B", marginVertical: 4 },
// // // //   locationRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
// // // //   location: { fontSize: 12, color: "#666", marginLeft: 4, flexShrink: 1 },
// // // //   featuresRow: {
// // // //     flexDirection: "row",
// // // //     justifyContent: "space-between",
// // // //     marginTop: 8,
// // // //   },
// // // //   feature: { flexDirection: "row", alignItems: "center" },
// // // //   featureText: { fontSize: 12, marginLeft: 4, color: "#444" },

// // // //   addButton: { position: "absolute", bottom: 25, left: 20, right: 20 },
// // // //   addButtonGradient: {
// // // //     flexDirection: "row",
// // // //     alignItems: "center",
// // // //     justifyContent: "center",
// // // //     borderRadius: 14,
// // // //     paddingVertical: 14,
// // // //     elevation: 6,
// // // //   },
// // // //   addText: { color: "#fff", marginLeft: 8, fontSize: 15 },
// // // // });
