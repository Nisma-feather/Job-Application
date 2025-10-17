import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { Text, StyleSheet, View, SafeAreaView, Pressable,Alert} from "react-native";
import { auth, db } from "../firebaseConfig";
import { FlatList } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
export const MessageDetail = ({ route, navigation }) => {
  const from = route.params?.from || null;
  const { companyName, logoUrl } = route?.params;
  const uid = auth?.currentUser.uid;
  const [messages, setMessages] = useState([]);
  // const [selectionMode,setSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);

  const handleAddtoSelectedMessage = (messageId) => {
    if (selectedMessages.includes(messageId)) {
      const updatedMessages = selectedMessages.filter((m) => m !== messageId);
      setSelectedMessages(updatedMessages);
    } else {
      setSelectedMessages([...selectedMessages, messageId]);
    }
  };

  const formatDate = (timeStamp) => {
    if (!timeStamp) return "";

    const postedDate = timeStamp.toDate();
    const now = new Date();
    const differenceDate = Math.floor(
      (now - postedDate) / (1000 * 60 * 60 * 24)
    );

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

  // const markAsRead=async(messageId)=>{
  //   try {
  //     const uid = auth.currentUser?.uid;
  //     if (!uid) return;
  //     const ref = doc(db, "users", uid, "messages", messageId);
  //     await updateDoc(ref, { read: true });
  //     console.log("Marked as read:", messageId);
  //   } catch (error) {
  //     console.error("Failed to mark message as read:", error);
  //   }

  // }
  // useEffect(()=>{
  //   markAsRead(message.id)
  // },[])

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle:  () => (
              <Text
                style={{ marginLeft: 10, fontSize: 17, fontFamily: "Poppins-Medium" }}
              >
                {companyName}
              </Text>
            ),
      headerLeft: () => (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginLeft: 10,
          }}
        >
          {navigation.canGoBack() && (
            <Pressable
              onPress={() => navigation.goBack()}
              style={{ marginRight: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </Pressable>
          )}
          {logoUrl ? (
            <Image
              source={{ uri: logoUrl }}
              style={{ height: 40, width: 40, borderRadius: 20 }}
            />
          ) : (
            <Ionicons name="business-outline" size={40} color="#777" />
          )}
        </View>
      ),
      headerTitleAlign: "left",
      
    });
  }, [navigation, companyName]);

  const fetchUserMessages = async () => {
    try {
      if (!uid || !from) {
        return;
      }

      const messageRef = collection(db, "users", uid, "messages");
      const q = query(
        messageRef,
        where("from", "==", from),
        where("deletedByUser", "!=", true),
        orderBy("messageAt", "desc")
      );
      const messagesSnap = await getDocs(q);
      const messageArray = messagesSnap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setMessages(messageArray);
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    if (from && uid) {
      fetchUserMessages();
    }
  }, [from, uid]);
console.log("selected Messages",selectedMessages)
  return (
    <SafeAreaView style={styles.Chatpagecontainer}>
      {/* <View style={styles.chatContainer}>
        <View style={styles.receivedBubble}>
          <Text style={styles.messageText}>{message.message}</Text>
          <Text style={styles.timestamp}>{formatDate(message.messageAt)}</Text>
        </View>
      </View> */}
      <FlatList
        data={messages}
        inverted
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable style={styles.chatContainer} onLongPress={()=>handleAddtoSelectedMessage(item.id)}>
            <View style={styles.receivedBubble}>
              <Text style={styles.messageText}>{item.message}</Text>
              <Text style={styles.timestamp}>{formatDate(item.messageAt)}</Text>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  Chatpagecontainer: {
    flex: 1,
    backgroundColor: "#fff",
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
    fontSize: 13.5,
    color: "#222",
    fontFamily: "Poppins-Regular",
  },
  timestamp: {
    fontSize: 12,
    color: "#888",
    marginTop: 6,
    textAlign: "right",
    fontFamily: "Poppins-Medium",
  },
});
