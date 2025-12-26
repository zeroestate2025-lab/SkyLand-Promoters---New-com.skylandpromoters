import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import LinearGradient from "react-native-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import GlobalText from "../../theme/GlobalText";

const initialMessages = [
  {
    id: 1,
    sender: "other",
    text: "Hello, how are you?",
    time: "12:00 PM",
    avatar: "https://randomuser.me/api/portraits/men/15.jpg",
  },
  {
    id: 2,
    sender: "me",
    text: "I’m good, thanks! How about you?",
    time: "12:05 PM",
  },
];

export default function ChatScreen({ navigation }) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMessage = {
      id: messages.length + 1,
      sender: "me",
      text: input,
      time: "Now",
    };
    setMessages([...messages, newMessage]);
    setInput("");
  };

  const renderMessage = ({ item }) =>
    item.sender === "me" ? (
      <View style={styles.myMsgWrapper}>
        <View style={styles.myMessage}>
          <GlobalText style={styles.myMsgText}>{item.text}</GlobalText>
        </View>
        <GlobalText style={styles.time}>{item.time}</GlobalText>
      </View>
    ) : (
      <View style={styles.messageRow}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View>
          <View style={styles.otherMessage}>
            <GlobalText style={styles.otherMsgText}>{item.text}</GlobalText>
          </View>
          <GlobalText style={styles.time}>{item.time}</GlobalText>
        </View>
      </View>
    );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* 🌿 Gradient Header */}
      <LinearGradient colors={["#43C6AC", "#20A68B"]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>

        <GlobalText bold style={styles.headerTitle}>
          Chat
        </GlobalText>

        <TouchableOpacity>
          <Icon name="phone" size={22} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* 💬 Messages */}
      <FlatList
        data={messages}
        keyExtractor={(i) => i.id.toString()}
        renderItem={renderMessage}
        contentContainerStyle={{ padding: 15 }}
      />

      {/* 📝 Input Bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#888"
            value={input}
            onChangeText={setInput}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Icon name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F9F9" },

  // 🌿 Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    elevation: 8,
    shadowColor: "#20A68B",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
  },

  // 💬 Messages
  messageRow: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-end",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 20,
    marginRight: 8,
  },
  otherMessage: {
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderTopLeftRadius: 0,
    maxWidth: 250,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
  },
  otherMsgText: { color: "#333", fontSize: 14, lineHeight: 20 },

  myMsgWrapper: {
    marginBottom: 12,
    alignItems: "flex-end",
  },
  myMessage: {
    padding: 12,
    backgroundColor: "#20A68B",
    borderRadius: 14,
    borderTopRightRadius: 0,
    maxWidth: 250,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
  },
  myMsgText: { color: "#fff", fontSize: 14, lineHeight: 20 },
  time: { fontSize: 11, color: "#999", marginTop: 4, marginHorizontal: 6 },

  // 📝 Input Bar
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 25,
    paddingHorizontal: 14,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 10,
    color: "#333",
  },
  sendBtn: {
    backgroundColor: "#43C6AC",
    padding: 10,
    borderRadius: 20,
    marginLeft: 6,
  },
});

