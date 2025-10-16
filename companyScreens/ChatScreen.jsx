import React, { useEffect, useLayoutEffect, useState } from 'react'
import { formatDate } from './ChatList';
import { Text,TextInput,SafeAreaView,View, StyleSheet, FlatList,Image,ActivityIndicator,Pressable, Alert } from "react-native";
import { auth, db } from '../firebaseConfig';
import { collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import {Ionicons} from "@expo/vector-icons"


const ChatScreen = ({navigation,route}) => {
  const {to,profileImg,userName} = route.params;
  const companyUID = auth.currentUser?.uid;
  const [loading,setLoading] = useState(false);
  const [messages,setMessages] = useState([]);
  const [selectedMessages,setSelectedMessages] = useState([]);
  const [selectionMode,setSelectionMode] = useState(false);
  const [newMessage,setNewMessage] = useState("");


  const handleSelectMessage=(messageId)=>{
    try{ 
      if(selectedMessages.includes(messageId) ){
        setSelectedMessages(selectedMessages.filter((msgId,idx)=>msgId !== messageId))
        if(selectedMessages.length === 1){
          setSelectionMode(false)
        }
      }
      else{
        setSelectedMessages([...selectedMessages,messageId]);
        if(!selectionMode){
          setSelectionMode(true)
        }
      }

        
    }
    catch(e){
      console.log(e)
    }
  }

  const fetchUserChats=async()=>{
    if(!to || !companyUID){
      return
    }
    try{ 
      setLoading(true);
      const messageRef= collection(db,"users",to,"messages");
      const q = query(
        messageRef,
        where("from", "==", companyUID),
        where("deletedByCompany", "==", false)
      );
      const messageSnap =await getDocs(q);
    
       const  msgs= messageSnap.docs.map((doc)=>({id:doc.id,...doc.data()}))
       setMessages(msgs);

      
      }
    catch(e){
      console.log(e)

    }
    finally{
      setLoading(false)    
    }
  }
  useEffect(()=>{
    fetchUserChats()
  },[]);
 console.log("Selection Mode",selectionMode);
 console.log("Slected Message",selectedMessages);


const handleDeleteForMe = async () => {
  try {
    const temporaryDeletion = selectedMessages.map(async (msgId) =>
      updateDoc(doc(db, "users", to, "messages", msgId), {
        deletedByCompany: true,
      })
    );

    await Promise.all(temporaryDeletion);
    fetchUserChats();
      setSelectionMode(false);
      setSelectedMessages([]);
    Alert.alert("Message deleted successfully");
  
 
  } catch (e) {
    console.log(e);
  }
};

const handleDeleteForEveryOne = async () => {
  try {
    const permanentDeletion = selectedMessages.map(async (msgId) =>
      deleteDoc(doc(db, "users", to, "messages", msgId))
    );

    await Promise.all(permanentDeletion);
        fetchUserChats();
  
    setSelectionMode(false);
    setSelectedMessages([]);
      Alert.alert("Messages deleted permanently");

  } catch (e) {
    console.log(e);
  }
};




 useLayoutEffect(() => {
   navigation.setOptions({
     headerTitle: () => (
       <Text
         style={{
           marginLeft: 10,
           fontSize: 17,
           fontFamily: "Poppins-Medium",
         }}
       >
         {userName}
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
               { text: "Delete for Me", onPress: handleDeleteForMe },
               {
                 text: "Delete for Everyone",
                 onPress: handleDeleteForEveryOne,
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
 }, [navigation, selectionMode, profileImg, userName]);


   
  return (
    <SafeAreaView style={styles.Chatpagecontainer}>
      {loading ? (
        <ActivityIndicator size="large" color="blue" />
      ) : (
        <View>
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={() => <View>No Messages Yet</View>}
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
          <View style={{ position: "relative", margin: 10 }}>
            <TextInput
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Enter Message"
              style={{
                backgroundColor: "#fff",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
                elevation: 3,
                borderRadius: 25,
                paddingVertical: 10,
                paddingHorizontal: 20,
                paddingRight: 50, // space for send button
                fontSize: 16,
              }}
            />
            <Pressable
    
              style={{
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
              }}
            >
              <Ionicons name="send" color="#fff" size={18} />
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

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
  messageText: {
    fontSize: 13,
    color: "#333",
    fontFamily:"Poppins-Regular"
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
    marginTop: 6,
    textAlign: "right",
    fontFamily:"Poppins-Medium"
  },
});

export default ChatScreen