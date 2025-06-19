import React, { useEffect, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Image,
  Text,
  View,
  StyleSheet,
  Alert,
  FlatList
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../firebaseConfig";
import {
  collection,
  deleteDoc,
  getDocs,
  orderBy,
  query,
  doc,
} from "firebase/firestore";
import dummyimg from "../assets/logo.png";
import {
  MaterialCommunityIcons,
  Ionicons,
  Foundation,
} from "@expo/vector-icons";

const Messages = ({ navigation }) => {
  const [messages, setMessages] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const uid = auth?.currentUser?.uid;

  const fetchUserMessages = async () => {
    if (!uid) return;

    try {
      const ref = collection(db, "users", uid, "messages");
      const q = query(ref, orderBy("messageAt", "desc"));
      const snapData = await getDocs(q);
      const messageFetched = snapData.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(messageFetched);
    } catch (e) {
      console.log(e);
    }
  };

  const handleToggleSelection = (messageId) => {
    setSelectionMode(true);
    handleSelectMessage(messageId);
  };

  const handleSelectMessage = (messageId) => {
    if (selectedMessages.includes(messageId)) {
      const updated = selectedMessages.filter((id) => id !== messageId);
      setSelectedMessages(updated);
      if (updated.length === 0) {
        setSelectionMode(false);
      }
    } else {
      setSelectedMessages((prev) => [...prev, messageId]);
    }
  };

  const handleMessageDeletion = async () => {
    try {
      const deletePromises = selectedMessages.map(async (messageId) => {
        const messageRef = doc(db, "users", uid, "messages", messageId);
        await deleteDoc(messageRef);
      });
      await Promise.all(deletePromises);
      setMessages((prev) =>
        prev.filter((message) => !selectedMessages.includes(message.id))
      );
      setSelectedMessages([]);
      setSelectionMode(false);
      Alert.alert("Messages deleted successfully");
    } catch (e) {
      Alert.alert("Unable to delete the messages");
      console.log("Error deleting the messages:", e);
    }
  };

  useEffect(() => {
    fetchUserMessages();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        selectionMode ? (
          <Pressable
            onPress={() =>
              Alert.alert(
                "Delete Messages",
                "The messages will be permanently deleted from your device.",
                [
                  {
                    text: "Cancel",
                    style: "cancel",
                    onPress: () => {
                      setSelectionMode(false);
                      setSelectedMessages([]);
                    },
                  },
                  {
                    text: "OK",
                    onPress: () => handleMessageDeletion(),
                  },
                ]
              )
            }
          >
            <Ionicons name="trash-outline" style={{marginLeft:12}} color="#000" size={24} />
          </Pressable>
        ) : null,
    });
  }, [selectionMode, selectedMessages]);

  console.log(selectionMode);
  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        ListEmptyComponent={() => (
          <View style={{ marginTop: 30, fontFamily: "Poppins-Bold" }}>
            <Text style={{ marginTop: 30, fontFamily: "Poppins-Medium",textAlign:'center',fontSize:20}}>
              No Messages
            </Text>
          </View>
        )}
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Pressable
            style={[
              {
                backgroundColor: selectedMessages.includes(item.id)
                  ? "rgb(232, 240, 251)"
                  : "#f9f9f9",
              },
              styles.messageCard,
            ]}
            onPress={() => {
              if (selectionMode && selectedMessages.includes(item.id)) {
                handleSelectMessage(item.id);
              } else {
                navigation.navigate("MessageDetail", { message: item });
              }
            }}
            onLongPress={() => handleToggleSelection(item.id)}
          >
            {selectedMessages.includes(item.id) && (
              <View>
                <MaterialCommunityIcons
                  name="checkbox-marked"
                  color="blue"
                  size={24}
                />
              </View>
            )}
            <Image style={styles.avatar} source={dummyimg} />
            <View style={styles.messageContent}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={styles.sender}>{item.from}</Text>
                <Text style={{ color: "#777" }}>
                  {formatDate(item.messageAt)}
                </Text>
              </View>
              <Text numberOfLines={1} style={styles.preview}>
                {typeof item.message === "string"
                  ? item.message
                  : JSON.stringify(item.message)}
              </Text>
            </View>
          </Pressable>
        )}
      />

      {/* <ScrollView contentContainerStyle={styles.scrollContent}>
        {messages.map((message, idx) => (
          <Pressable
            key={idx}
            style={[
              {
                backgroundColor: selectedMessages.includes(message.id)
                  ? "rgb(232, 240, 251)"
                  : "#f9f9f9",
              },
              styles.messageCard,
              { zIndex: -1 },
            ]}
            onPress={() => {
              if (selectionMode && selectedMessages.includes(message.id)) {
                handleSelectMessage(message.id);
              }
              navigation.navigate("MessageDetail", { message });
            }}
            onLongPress={() => handleToggleSelection(message.id)}
          >
            {selectedMessages.includes(message.id) ? (
              <View>
                <MaterialCommunityIcons
                  name="checkbox-marked"
                  color="blue"
                  size={24}
                />
              </View>
            ) : null}
            <Image style={styles.avatar} source={dummyimg} />
            <View style={styles.messageContent}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={styles.sender}>{message.from}</Text>
                <Text style={{ color: "#777" }}>
                  {formatDate(message.messageAt)}
                </Text>
              </View>
              <Text numberOfLines={1} style={styles.preview}>
                {typeof message.message === "string"
                  ? message.message
                  : JSON.stringify(message.message)}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView> */}
    </SafeAreaView>
  );
};

export default Messages;

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: "#fff",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  body: {
    fontSize: 16,
    color: "#333",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: "600",
    marginVertical: 16,
  },
  scrollContent: {
    paddingBottom: 20,
    paddingTop:20
  },
  messageCard: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    height: 60,
    width: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  messageContent: {
    flex: 1,
  },
  sender: {
    fontSize: 16,
    fontWeight: "600",
  },
  preview: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },
  Chatpagecontainer: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  header: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
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
    borderTopLeftRadius: 0,
    maxWidth: "80%",
    alignSelf: "flex-start",
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
    color: "#333",
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
    marginTop: 6,
    textAlign: "right",
  },
});
const formatDate = (timeStamp) => {
  if (!timeStamp) return "";

  const postedDate = timeStamp.toDate();
  const now = new Date();
  const differenceDate = Math.floor((now - postedDate) / (1000 * 60 * 60 * 24));

  if (differenceDate === 0) {
    const diffHours = Math.floor((now - postedDate) / (1000 * 60 * 60));

    if (diffHours === 0) {
      const diffMinutes = Math.floor((now - postedDate) / (1000 * 60));
      return diffMinutes <= 1 ? "1 m ago" : `${diffMinutes} ms ago`;
    }

    return diffHours === 1 ? "1 hr ago" : `${diffHours} hrs ago`;
  }

  return differenceDate === 1 ? "1 day ago" : `${differenceDate} days ago`;
};

export const MessageDetail = ({ route }) => {
  const { message } = route.params;

  return (
    <SafeAreaView style={styles.Chatpagecontainer}>
      <View style={styles.chatContainer}>
        <View style={styles.receivedBubble}>
          <Text style={styles.messageText}>{message.message}</Text>
          <Text style={styles.timestamp}>{formatDate(message.messageAt)}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};
