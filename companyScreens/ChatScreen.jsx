import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { formatDate } from "./ChatList";
import {
  Text,
  TextInput,
  SafeAreaView,
  View,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { auth, db } from "../firebaseConfig";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";

const ChatScreen = ({ navigation, route }) => {
  const { to, profileImg, userName } = route.params;
  const companyUID = auth.currentUser?.uid;

  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  const flatListRef = useRef(null);

  // Select / deselect message
  const handleSelectMessage = (messageId) => {
    if (selectedMessages.includes(messageId)) {
      const filtered = selectedMessages.filter((id) => id !== messageId);
      setSelectedMessages(filtered);
      if (filtered.length === 0) setSelectionMode(false);
    } else {
      setSelectedMessages([...selectedMessages, messageId]);
      if (!selectionMode) setSelectionMode(true);
    }
  };

  // Fetch messages not deleted by company
  const fetchUserChats = async () => {
    if (!to || !companyUID) return;
    try {
      setLoading(true);
      const messageRef = collection(db, "users", to, "messages");
      const q = query(
        messageRef,
        where("from", "==", companyUID),
        where("deletedByCompany", "==", false),
        orderBy("messageAt", "asc")
      );
      const snap = await getDocs(q);
      const msgs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs.reverse()); // newest at bottom
    } catch (e) {
      console.log("Error fetching chats:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserChats();
  }, []);

  // Delete message only for company
  const handleDeleteForMe = async (messagesToDelete) => {
    try {
      await Promise.all(
        messagesToDelete.map((msgId) =>
          updateDoc(doc(db, "users", to, "messages", msgId), {
            deletedByCompany: true,
          })
        )
      );
      setSelectedMessages([]);
      setSelectionMode(false);
      fetchUserChats();
      Alert.alert("Message deleted successfully");
    } catch (e) {
      console.log(e);
    }
  };

  // Delete message for everyone
  const handleDeleteForEveryOne = async (messagesToDelete) => {
    try {
      await Promise.all(
        messagesToDelete.map((msgId) =>
          deleteDoc(doc(db, "users", to, "messages", msgId))
        )
      );
      setSelectedMessages([]);
      setSelectionMode(false);
      fetchUserChats();
      Alert.alert("Messages deleted permanently");
    } catch (e) {
      console.log(e);
    }
  };

  // Send a new message
  const handleSendNewMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      setSending(true);
      const msgObj = {
        from: companyUID,
        to,
        type: "status_update",
        message: newMessage,
        messageAt: new Date(),
        read: false,
        deletedByUser: false,
        deletedByCompany: false,
      };
      const msgRef = collection(db, "users", to, "messages");
      await addDoc(msgRef, msgObj);
      setNewMessage("");
      fetchUserChats();
    } catch (e) {
      console.log(e);
    } finally {
      setSending(false);
    }
  };

  // Header layout with delete option
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Text
          style={{ marginLeft: 10, fontSize: 17, fontFamily: "Poppins-Medium" }}
        >
          {userName}
        </Text>
      ),
      headerLeft: () => (
        <View
          style={{ flexDirection: "row", alignItems: "center", marginLeft: 10 }}
        >
          {navigation.canGoBack() && (
            <Pressable
              onPress={() => navigation.goBack()}
              style={{ marginRight: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </Pressable>
          )}
          {profileImg ? (
            <Image
              source={{ uri: profileImg }}
              style={{ height: 40, width: 40, borderRadius: 20 }}
            />
          ) : (
            <Ionicons name="person-circle-outline" size={40} color="#777" />
          )}
        </View>
      ),
      headerTitleAlign: "left",
      headerRight: () =>
        selectionMode ? (
          <Pressable
            onPress={() =>
              Alert.alert("Delete Messages", "Choose delete option", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete for Me",
                  onPress: () => handleDeleteForMe(selectedMessages),
                },
                {
                  text: "Delete for Everyone",
                  onPress: () => handleDeleteForEveryOne(selectedMessages),
                },
              ])
            }
          >
            <Ionicons
              name="trash-outline"
              size={24}
              style={{ marginRight: 12 }}
           
            />
          </Pressable>
        ) : null,
    });
  }, [navigation, selectionMode, profileImg, userName, selectedMessages]);

  // Auto scroll to bottom
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  return (
    <SafeAreaView style={styles.Chatpagecontainer}>
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="blue" />
        </View>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          <View style={{ flex: 1 }}>
            {messages.length === 0 ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text>No Messages Yet</Text>
              </View>
            ) : (
              <FlatList
                ref={flatListRef}
                inverted
                data={messages}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={() => (
                  <View>
                    <Text>No Messages Yet</Text>
                  </View>
                )}
                renderItem={({ item }) => (
                  <Pressable
                    onLongPress={() => handleSelectMessage(item.id)}
                    style={[
                      selectedMessages.includes(item.id)
                        ? {
                            backgroundColor: "#A3CCDA",
                            opacity: 0.7,
                            width: "100%",
                          }
                        : null,
                    ]}
                  >
                    <View style={styles.chatContainer}>
                      <View style={styles.receivedBubble}>
                        <Text style={styles.messageText}>{item.message}</Text>
                        <Text style={styles.timestamp}>
                          {formatDate(item.messageAt)}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                )}
              />
            )}

            {/* Chat Input */}
            <View style={styles.chatBox}>
              <TextInput
                value={newMessage}
                onChangeText={setNewMessage}
                placeholder="Enter Message"
                style={styles.chatInput}
              />
              <Pressable
                style={styles.chatsendIcon}
                disabled={sending || !newMessage.trim()}
                onPress={handleSendNewMessage}
              >
                {sending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Ionicons name="send" color="#fff" size={18} />
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  Chatpagecontainer: { flex: 1, backgroundColor: "#fff" },
  chatContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    paddingHorizontal: 18,
    paddingVertical: 5,
  },
  receivedBubble: {
    backgroundColor: "rgb(232, 240, 251)",
    padding: 12,
    borderRadius: 16,
    borderTopRightRadius: 0,
    maxWidth: "80%",
    alignSelf: "flex-end",
    marginVertical: 5,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: { fontSize: 13, color: "#333", fontFamily: "Poppins-Regular" },
  timestamp: {
    fontSize: 12,
    color: "#999",
    marginTop: 6,
    textAlign: "right",
    fontFamily: "Poppins-Medium",
  },
  chatBox: { position: "relative", margin: 10 },
  chatInput: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    paddingRight: 50,
    fontSize: 14,
  },
  chatsendIcon: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: [{ translateY: -15 }],
    height: 30,
    width: 30,
    borderRadius: 15,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
});

export default ChatScreen;
