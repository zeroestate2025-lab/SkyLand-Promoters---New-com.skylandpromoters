import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import { useTheme } from "@react-navigation/native";
import BottomNav from "../../components/ReusableComponents/BottomNav";
import GlobalText from "../../theme/GlobalText"; // ✅ Global Poppins font

const messages = [
  {
    id: 1,
    name: "Robert Fox",
    message: "Hello! I’m interested in your property.",
    time: "12:30 AM",
    avatar: "https://randomuser.me/api/portraits/men/11.jpg",
    online: true,
  },
  {
    id: 2,
    name: "Wade Warren",
    message: "Let’s schedule a visit tomorrow.",
    time: "1:15 PM",
    avatar: "https://randomuser.me/api/portraits/men/12.jpg",
    online: false,
  },
];

export default function MessagesScreen({ navigation }) {
  const [search, setSearch] = useState("");
  const { colors } = useTheme();

  const filtered = messages.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top", "left", "right"]}
    >
      {/* 🌿 Gradient Header */}
      <LinearGradient
        colors={["#43C6AC", "#20A68B"]}
        style={styles.headerContainer}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.iconBtn}
          >
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>

          <GlobalText bold style={styles.headerTitle}>
            Messages
          </GlobalText>

          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      {/* 🔍 Search Bar */}
      <View style={styles.searchBox}>
        <Icon name="magnify" size={22} color="#20A68B" />
        <TextInput
          placeholder="Search messages..."
          placeholderTextColor="#888"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={styles.composeBtn}>
          <Icon name="pencil" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* 💬 Chat List */}
      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatItem}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("Chat", { user: item })}
          >
            <View style={styles.avatarContainer}>
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
              {item.online && <View style={styles.onlineDot} />}
            </View>

            <View style={styles.details}>
              <GlobalText bold style={styles.name}>
                {item.name}
              </GlobalText>
              <GlobalText style={styles.messageText} numberOfLines={1}>
                {item.message}
              </GlobalText>
            </View>

            <GlobalText style={styles.time}>{item.time}</GlobalText>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      {/* 🧭 Bottom Navigation */}
      <BottomNav navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // 🌿 Gradient Header
  headerContainer: {
    paddingTop: 15,
    paddingBottom: 15,
    elevation: 8,
    shadowColor: "#20A68B",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
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

  // 🔍 Search
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 15,
    paddingHorizontal: 14,
    borderRadius: 14,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: "#333",
  },
  composeBtn: {
    backgroundColor: "#43C6AC",
    padding: 10,
    borderRadius: 10,
    marginLeft: 10,
  },

  // 💬 Chat List
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    marginHorizontal: 15,
    marginVertical: 6,
    borderRadius: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
  },
  avatarContainer: { position: "relative" },
  avatar: { width: 48, height: 48, borderRadius: 25 },
  onlineDot: {
    position: "absolute",
    bottom: 3,
    right: 3,
    width: 10,
    height: 10,
    backgroundColor: "#43C6AC",
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#fff",
  },
  details: { flex: 1, marginLeft: 10 },
  name: {
    fontSize: 15,
    color: "#222",
  },
  messageText: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  time: {
    fontSize: 12,
    color: "#20A68B",
  },
});
