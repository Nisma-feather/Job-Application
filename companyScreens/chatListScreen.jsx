import React, { useState, useCallback } from "react";
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { auth, db } from "../firebaseConfig";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";

const ChatListScreen = () => {
  const navigation = useNavigation();
  const companyUID = auth.currentUser?.uid;
  const [chats, setChats] = useState([]);

  const fetchUserChats = async (companyUID) => {
    if (!companyUID) return;

    try {
      const usersSnap = await getDocs(collection(db, "users"));
      let messageData = [];

      for (const userDoc of usersSnap.docs) {
        const msgRef = collection(db, "users", userDoc.id, "messages");
        const q = query(msgRef, where("from", "==", companyUID), orderBy("messageAt", "desc"));
        const msgSnap = await getDocs(q);

        if (!msgSnap.empty) {
          messageData.push({
            userId: userDoc.id,
            ...userDoc.data(),
            lastMessage: msgSnap.docs[0].data(),
          });
        }
      }

      setChats(messageData);
    } catch (e) {
      console.error("Error fetching chats:", e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserChats(companyUID);
    }, [companyUID])
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatCard}
      onPress={() => navigation.navigate("ChatScreen", { userId: item.userId, userName: item.name })}
    >
      <Text style={styles.userName}>{item.name || "Unknown User"}</Text>
      <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage?.message || ""}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Messages</Text>
      {chats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text>No chats found</Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          renderItem={renderItem}
          keyExtractor={(item) => item.userId}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#fff" },
  heading: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  chatCard: { padding: 15, backgroundColor: "#f1f1f1", borderRadius: 10, marginVertical: 5 },
  userName: { fontSize: 16, fontWeight: "600" },
  lastMessage: { fontSize: 14, color: "#555", marginTop: 4 },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
});

export default ChatListScreen;
