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
  const [loading,setLoading] = useState(false);
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
    setLoading(true); // Start loading
    try {
      const ref = collection(db, "users", uid, "messages");
      const q = query(ref, orderBy("messageAt", "desc"));

      const unsubscribe = onSnapshot(
        q,
        async (snapshot) => {
          try {
            const allMessages = snapshot.docs.map((docSnap) => ({
              id: docSnap.id,
              ...docSnap.data(),
            }));

            // ✅ Group messages by company UID (data.from)
            const grouped = allMessages.reduce((acc, msg) => {
              const from = msg.from;
              if (!acc[from]) acc[from] = [];
              acc[from].push(msg);
              return acc;
            }, {});

            // ✅ Process each company group
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
          } catch (err) {
            console.error("Error processing messages snapshot:", err);
          } finally {
            setLoading(false); // ✅ Always stop loading after processing snapshot
          }
        },
        (error) => {
          console.error("onSnapshot error:", error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error("Error fetching user messages:", error);
    } finally {
      setLoading(false); // ✅ Ensures loading stops even if setup fails
    }
  }, [uid]);


  

  useEffect(() => {
    fetchUserMessages();
  }, [fetchUserMessages]);

  
  const renderItem = ({ item }) =>{ 
    console.log("Message Item",item)
    return(
    <Pressable
      style={    
        styles.messageCard}
      onPress={() => {
       
          navigation.navigate("MessageDetail", {
            companyId: item.companyId,
            from: item.companyId,
            companyName:item.companyName,
            logoUrl:item.logoUrl,
          });
        
      }}
    
    >
 

      <View style={styles.innerContainer}>
        {/* Left side - Logo */}
        {item.logoUrl ? (
          <Image style={styles.imageStyle} source={{ uri: item.logoUrl }} />
        ) : (
          <Ionicons
            name="business-outline"
            size={50}
            color="#777"
            style={{ marginRight: 12 }}
          />
        )}
        {/* <Image
       

        {/* Right side - Text content */}
        <View style={styles.textContainer}>
          {/* Top row: company name + unread badge */}
          <View style={styles.topRow}>
            <Text style={styles.sender}>{item.companyName}</Text>

            {item.unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.unreadCount}</Text>
              </View>
            )}
          </View>

          {/* Message preview */}
          <Text numberOfLines={1} style={styles.preview}>
            {typeof item.lastMessage === "string"
              ? item.lastMessage
              : JSON.stringify(item.lastMessage)}
          </Text>

          {/* Time below message */}
          <Text style={styles.date}>{formatDate(item.messageAt)}</Text>
        </View>
      </View>
    </Pressable>
  )}

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
  messageCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    marginHorizontal: 10,
    backgroundColor: "#f7f7f7",
  },
  innerContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sender: {
    fontSize: 15,
    fontFamily: "Poppins-Bold",
    color: "#444",
  },
  badge: {
    backgroundColor: "#007bff",
    borderRadius: 10,
    // paddingHorizontal: 6,
    // paddingVertical: 2,
    minWidth: 22,
    alignItems: "center",
    justifyContent: "center",
    height: 25,
    width: 25,
  },
  badgeText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Poppins-Bold",
  },
  preview: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: "#555",
    marginTop: 2,
  },
  date: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
    alignSelf: "flex-end",
  },
  imageStyle: {
    height: 40,
    width: 40,
    borderRadius: 20,
  },
});
