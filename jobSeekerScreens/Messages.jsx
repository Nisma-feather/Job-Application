import React, { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, Image, Text, View, StyleSheet,Button} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../firebaseConfig';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import dummyimg from '../assets/logo.png';


const Messages = ({navigation}) => {
  const [messages, setMessages] = useState([]);
  const [selectionMode,setSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const uid = auth?.currentUser.uid;

  const fetchUserMessages = async () => {
    if (!uid) return;

    try {
      const ref = collection(db, 'users', uid, 'messages');
      const q = query(ref, orderBy('messageAt', 'desc'));
      const snapData = await getDocs(q);
      const messageFetched = snapData?.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(messageFetched);
    } catch (e) {
      console.log(e);
    }
  };
 const handleToggleSelection = (messageId) => {
  setSelectionMode(true);
  handleSelectMessage(messageId)
  
 }
  const handleSelectMessage = (messageId) => {
    if(selectedMessages.includes(messageId)){
      setSelectedMessages((prev)=>prev.filter((id)=>id !== messageId))
      if(selectedMessages.length === 1){
        setSelectionMode(false);
      }
    }
    else{
      
     setSelectedMessages((prev)=>[...prev,messageId])
    }
  }
  useEffect(()=>{
    navigation.setOptions({
      headerRight:()=>(
        <Pressable>
          <Text>Delete</Text>
        </Pressable>
      )
    })

  })
  useEffect(() => {
    fetchUserMessages();
  }, []);
  
console.log("selected Message",selectedMessages)
 console.log(messages)
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {messages.map((message, idx) => (
          <Pressable
            key={idx}
            style={[styles.messageCard,{backgroundColor:selectedMessages.includes(message.id)?"blue":null}]}
            onPress={() =>{
              if(selectionMode){
                handleSelectMessage(message.id);
              }
               navigation.navigate('MessageDetail', { message })
                }
              }
              onLongPress={()=>handleToggleSelection(message.id)}
              
          >
            <Image style={styles.avatar} source={dummyimg} />
            <View style={styles.messageContent}>
                <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                <Text style={styles.sender}>{message.from}</Text>
                <Text style={{color:'#777'}}>{formatDate(message.messageAt)}</Text>
            
            </View>
              
              <Text numberOfLines={1} style={styles.preview}>{message.message}</Text>
              
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Messages;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
      },
      title: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
      },
      body: {
        fontSize: 16,
        color: '#333',
      },
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: '600',
    marginVertical: 16,
  },
  scrollContent: {
    paddingBottom: 20,
    padding:20
  },
  messageCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
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
    fontWeight: '600',
  },
  preview: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  Chatpagecontainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  chatContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingHorizontal:18,
    paddingVertical:5
  },
  receivedBubble: {
    backgroundColor: 'rgb(232, 240, 251)',
    padding: 12,
    borderRadius: 16,
    borderTopLeftRadius: 0,
    maxWidth: '80%',
    alignSelf: 'flex-start',
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
    textAlign: 'right',
  },
});
const formatDate = (timeStamp) => {
  if (!timeStamp) return '';

const postedDate = timeStamp.toDate();
const now = new Date();
const differenceDate = Math.floor((now - postedDate) / (1000 * 60 * 60 * 24));

if (differenceDate === 0) {
  const diffHours = Math.floor((now - postedDate) / (1000 * 60 * 60));
  
  if (diffHours === 0) {
    const diffMinutes = Math.floor((now - postedDate) / (1000 * 60));
    return diffMinutes <= 1 ? '1 m ago' : `${diffMinutes} ms ago`;
  }

  return diffHours === 1 ? '1 hr ago' : `${diffHours} hrs ago`;
}

return differenceDate === 1 ? '1 d ago' : `${differenceDate} ds ago`;

}

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
  