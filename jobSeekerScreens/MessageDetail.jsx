import { doc, updateDoc } from "firebase/firestore";
import React, { useEffect } from "react";
import {  Text, StyleSheet, View } from "react-native";
import { auth,db } from "../firebaseConfig"
import { SafeAreaView } from 'react-native-safe-area-context';
export const MessageDetail = ({ route }) => {
  const { message } = route.params;
  console.log("message", message);

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

  const markAsRead=async(messageId)=>{
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      const ref = doc(db, "users", uid, "messages", messageId);
      await updateDoc(ref, { read: true });
      console.log("Marked as read:", messageId);
    } catch (error) {
      console.error("Failed to mark message as read:", error);
    }

  }
  useEffect(()=>{
    markAsRead(message.id)
  },[])

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
