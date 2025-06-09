import React from "react";
import { SafeAreaView, Text, StyleSheet, View } from "react-native";

export const MessageDetail = ({ route }) => {
  const { message } = route.params;
  console.log(message);

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleString();
  };

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
