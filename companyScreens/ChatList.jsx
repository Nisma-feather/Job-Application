import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  Image,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { auth, db } from "../firebaseConfig";
import { useFocusEffect } from "@react-navigation/native";
import {
  collectionGroup,
  where,
  getDocs,
  getDoc,
  doc,
  orderBy,
  deleteDoc,
} from "firebase/firestore";

const CompanyMessages = ({ navigation }) => {
  const companyUID = auth.currentUser?.uid;
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);

  const fetchUserChats = async (companyUID) => {
    if (!companyUID) return;
    try {
      setLoading(true);
      const q = collectionGroup(db, "messages");
      const snap = await getDocs(
        q.withConverter(null) // workaround if needed
      );

      const messageData = [];
      for (const docSnap of snap.docs) {
        const data = docSnap.data();
        if (data.from !== companyUID) continue;

        const userDocRef = doc(db, "users", data.to);
        const userSnap = await getDoc(userDocRef);

        const userName = userSnap.exists()
          ? userSnap.data().personalData?.name
          : "Unknown User";
        const profileImg = userSnap.exists()
          ? userSnap.data().personalData?.imageUrl
          : null;

        messageData.push({
          id: docSnap.id, // use id consistently
          ...data,
          userName,
          profileImg,
        });
      }

      // group by user
      const grouped = Object.values(
        messageData.reduce((acc, msg) => {
          const uid = msg.to;
          if (!acc[uid] || msg.messageAt > acc[uid].messageAt) {
            acc[uid] = msg;
          }
          return acc;
        }, {})
      );

      setMessages(grouped);
    } catch (e) {
      console.error("Error fetching chats:", e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchUserChats(companyUID);
    }, [companyUID])
  );

  const handleToggleSelection = (id) => {
    setSelectionMode(true);
    handleSelectMessage(id);
  };

  const handleSelectMessage = (id) => {
    if (selectedMessages.includes(id)) {
      const updated = selectedMessages.filter((mid) => mid !== id);
      setSelectedMessages(updated);
      if (updated.length === 0) setSelectionMode(false);
    } else {
      setSelectedMessages((prev) => [...prev, id]);
    }
  };

  const handleMessageDeletion = async () => {
    try {
      const deletePromises = selectedMessages.map(async (id) => {
        const ref = doc(db, "companies", companyUID, "messages", id);
        await deleteDoc(ref);
      });
      await Promise.all(deletePromises);
      setMessages((prev) =>
        prev.filter((m) => !selectedMessages.includes(m.id))
      );
      setSelectionMode(false);
      setSelectedMessages([]);
      Alert.alert("Messages deleted successfully");
    } catch (e) {
      console.log("Error deleting messages:", e);
      Alert.alert("Unable to delete the messages");
    }
  };

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        selectionMode ? (
          <Pressable
            onPress={() =>
              Alert.alert(
                "Delete Messages",
                "These messages will be permanently deleted.",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "OK", onPress: () => handleMessageDeletion() },
                ]
              )
            }
          >
            <Ionicons
              name="trash-outline"
              color="#000"
              size={24}
              style={{ marginRight: 12 }}
            />
          </Pressable>
        ) : null,
    });
  }, [selectionMode, selectedMessages]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {loading ? (
        <ActivityIndicator size="large" color="#000" />
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={() => (
            <Text style={styles.emptyText}>No Messages</Text>
          )}
          renderItem={({ item }) => (
            <Pressable
              style={[
                styles.messageCard,
                {
                  backgroundColor: selectedMessages.includes(item.id)
                    ? "rgb(232, 240, 251)"
                    : "#f9f9f9",
                },
              ]}
              onPress={() => {
                if (selectionMode && selectedMessages.includes(item.id)) {
                  handleSelectMessage(item.id);
                } else {
                  navigation.navigate("ChatScreen", {
                    to:item.to,
                    userName:item.userName,
                    profileImg:item?.profileImg,
                  });
                }
              }}
              onLongPress={() => handleToggleSelection(item.id)}
            >
              {selectedMessages.includes(item.id) && (
                <MaterialCommunityIcons
                  name="checkbox-marked"
                  color="blue"
                  size={22}
                  style={{ marginRight: 6 }}
                />
              )}

              {item.profileImg ? (
                <Image
                  source={{ uri: item.profileImg }}
                  style={styles.avatar}
                />
              ) : (
                <Ionicons
                  name="person-circle-outline"
                  size={60}
                  color="#777"
                  style={{ marginRight: 12 }}
                />
              )}

              <View style={styles.messageContent}>
                <View style={styles.messageHeader}>
                  <Text style={styles.sender}>{item.userName}</Text>
                  <Text style={styles.time}>{formatDate(item.messageAt)}</Text>
                </View>
                <Text numberOfLines={1} style={styles.preview}>
                  {item.message}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default CompanyMessages;

// --- Styles & formatDate ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 16 },
  emptyText: {
    marginTop: 40,
    textAlign: "center",
    fontSize: 18,
    color: "#777",
  },
  messageCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginTop:13,
 
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
  },
  avatar: { height: 60, width: 60, borderRadius: 30, marginRight: 12 },
  messageContent: { flex: 1 },
  messageHeader: { flexDirection: "row", justifyContent: "space-between" },
  sender: { fontSize: 16, fontWeight: "600" },
  preview: { fontSize: 14, color: "#555", marginTop: 4 },
  time: { fontSize: 12, color: "#777" },
});

export const formatDate = (timeStamp) => {
  if (!timeStamp) return "";
  const postedDate = timeStamp.toDate();
  const now = new Date();
  const diff = Math.floor((now - postedDate) / (1000 * 60 * 60 * 24));
  if (diff === 0) {
    const hours = Math.floor((now - postedDate) / (1000 * 60 * 60));
    if (hours === 0) {
      const mins = Math.floor((now - postedDate) / (1000 * 60));
      return mins <= 1 ? "1 min ago" : `${mins} mins ago`;
    }
    return `${hours} hrs ago`;
  }
  return `${diff} days ago`;
};
