import React, { useEffect, useState, useCallback } from "react";
import {
  Pressable,
  Image,
  Text,
  View,
  StyleSheet,
  Alert,
  FlatList,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../firebaseConfig";
import {
  collection,
  deleteDoc,
  onSnapshot,
  getDoc,
  orderBy,
  query,
  doc,
} from "firebase/firestore";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";

const office = require("../assets/office.png");

const Messages = ({ navigation }) => {
  const [messages, setMessages] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const uid = auth?.currentUser?.uid;

  // ✅ Safe date formatter
  const formatDate = (timeStamp) => {
    if (!timeStamp || typeof timeStamp.toDate !== "function") return "";
    const postedDate = timeStamp.toDate();
    const now = new Date();
    const diffMs = now - postedDate;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 0)
      return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
    if (diffHours > 0)
      return diffHours === 1 ? "1 hr ago" : `${diffHours} hrs ago`;
    if (diffMinutes > 0)
      return diffMinutes === 1 ? "1 min ago" : `${diffMinutes} mins ago`;
    return "Just now";
  };

  const fetchUserMessages = useCallback(async () => {
    const ref = collection(db, "users", uid, "messages");
    const q = query(ref, orderBy("messageAt", "desc"));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const allMessages = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      // ✅ Group by company UID (data.from)
      const grouped = allMessages.reduce((acc, msg) => {
        const from = msg.from;
        if (!acc[from]) acc[from] = [];
        acc[from].push(msg);
        return acc;
      }, {});

      // ✅ For each company, find last message + unread count
      const companyData = await Promise.all(
        Object.keys(grouped).map(async (companyId) => {
          const messagesFromCompany = grouped[companyId];
          const lastMessage = messagesFromCompany[0];
          const unreadCount = messagesFromCompany.filter(
            (m) => !m.isRead
          ).length;

          let companyName = companyId;
          let logoUrl = null;

          try {
            const companyRef = doc(db, "companies", companyId);
            const companySnap = await getDoc(companyRef);
            if (companySnap.exists()) {
              const data = companySnap.data();
              companyName = data.companyName || companyName;
              logoUrl = data.logoUrl || null;
            }
          } catch (e) {
            console.log("Error fetching company:", e);
          }

          return {
            companyId,
            companyName,
            logoUrl,
            lastMessage: lastMessage.message || "",
            messageAt: lastMessage.messageAt,
            unreadCount,
          };
        })
      );

      setMessages(companyData);
    });

    return () => unsubscribe();
  }, [uid]);

  const handleToggleSelection = (companyId) => {
    setSelectionMode(true);
    handleSelectMessage(companyId);
  };

  const handleSelectMessage = (companyId) => {
    if (selectedMessages.includes(companyId)) {
      const updated = selectedMessages.filter((id) => id !== companyId);
      setSelectedMessages(updated);
      if (updated.length === 0) setSelectionMode(false);
    } else {
      setSelectedMessages((prev) => [...prev, companyId]);
    }
  };

  const handleMessageDeletion = async () => {
    try {
      const deletePromises = selectedMessages.map(async (companyId) => {
        // Delete all messages from that company for this user
        const ref = collection(db, "users", uid, "messages");
        const snapshot = await getDocs(ref);
        const msgsToDelete = snapshot.docs.filter(
          (docSnap) => docSnap.data().from === companyId
        );
        for (const msg of msgsToDelete) {
          await deleteDoc(doc(db, "users", uid, "messages", msg.id));
        }
      });

      await Promise.all(deletePromises);
      setMessages((prev) =>
        prev.filter((msg) => !selectedMessages.includes(msg.companyId))
      );
      setSelectedMessages([]);
      setSelectionMode(false);
      Alert.alert("Messages deleted successfully");
    } catch (e) {
      console.log("Error deleting messages:", e);
      Alert.alert("Unable to delete the messages");
    }
  };

  useEffect(() => {
    fetchUserMessages();
  }, [fetchUserMessages]);

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
                  { text: "Cancel", style: "cancel" },
                  { text: "OK", onPress: handleMessageDeletion },
                ]
              )
            }
          >
            <Ionicons
              name="trash-outline"
              style={{ marginLeft: 12 }}
              color="#000"
              size={24}
            />
          </Pressable>
        ) : null,
    });
  }, [selectionMode, selectedMessages]);

  const renderItem = ({ item }) => (
    <Pressable
      style={[
        {
          backgroundColor: selectedMessages.includes(item.companyId)
            ? "rgb(232, 240, 251)"
            : "#f9f9f9",
        },
        styles.messageCard,
      ]}
      onPress={() => {
        if (selectionMode && selectedMessages.includes(item.companyId)) {
          handleSelectMessage(item.companyId);
        } else {
          navigation.navigate("MessageDetail", { companyId: item.companyId });
        }
      }}
      onLongPress={() => handleToggleSelection(item.companyId)}
    >
      {selectedMessages.includes(item.companyId) && (
        <MaterialCommunityIcons name="checkbox-marked" color="blue" size={24} />
      )}
     
      <Image
        style={styles.avatar}
        source={item.logoUrl ? { uri: item.logoUrl } : office}
      />

      <View style={styles.messageContent}>
        <View style={styles.row}>
          <Text style={styles.sender}>{item.companyName}</Text>

          {item.unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>

        <Text numberOfLines={1} style={styles.preview}>
          {typeof item.lastMessage === "string"
            ? item.lastMessage
            : JSON.stringify(item.lastMessage)}
        </Text>
      </View>
      <Text style={styles.date}>{formatDate(item.messageAt)}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        ListEmptyComponent={() => (
          <View style={{ marginTop: 40 }}>
            <Text style={styles.emptyText}>No Messages</Text>
          </View>
        )}
        data={messages}
        keyExtractor={(item) => item.companyId}
        renderItem={renderItem}
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews
      />
    </SafeAreaView>
  );
};

export default Messages;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
  },
  messageCard: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    marginTop:12,
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    backgroundColor: "#007bff",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeText: {
    color: "white",
    fontSize: 12,
  },
  date: {
    color: "#777",
    marginLeft: 8,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 18,
    fontFamily: "Poppins-Medium",
  },
});
