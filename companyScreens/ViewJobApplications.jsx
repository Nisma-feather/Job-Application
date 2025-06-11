import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  Pressable,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Modal,
  TextInput,
  Alert,
  StyleSheet,
} from "react-native";
import { useNavigation } from '@react-navigation/native';
import { Ionicons, Feather, Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
import { auth, db } from '../firebaseConfig';
import { addDoc, collection, getDocs, query, updateDoc, where,doc, getDoc } from 'firebase/firestore';

const formatDate = (date) => {
  const posted = date.toDate();
  const now = new Date();
  const diffDate = Math.floor((now - posted) / (1000 * 60 * 60 * 24));
  if (diffDate === 0) {
      const diffHour = Math.floor((now - posted) / (1000 * 60 * 60));
      if (diffHour === 0) {
          const diffMinute = Math.floor((now - posted) / (1000 * 60))
          return diffMinute === 1 ? '1 min ago' : `${diffMinute}mins ago`
      }
      return diffHour === 1 ? '1 hr ago' : `${diffHour}hrs ago`

  }
  return diffDate === 1 ? '1 day ago' : `${diffDate}days ago`
}
const ViewJobApplications = ({navigation}) => {
    const [joblist,setJobList]=useState();
    const companyUID = auth.currentUser?.uid ;
        // || "vm5dkIUfk0WxgnXT34QBttxA3kV2";
    console.log(companyUID)
     const fetchJobList=async()=>{
        try{
            if (!companyUID){
                return
            }
            const q = query(collection(db,'jobs'),where('companyUID','==',companyUID));
            const snapdata=await getDocs(q);
            
             const fetchedJobs=snapdata.docs.map(job=>({id:job.id,...job.data()}))
             setJobList(fetchedJobs)
        }
        catch(e){
            console.log(e);
        }
     }
    
     useEffect(()=>{
        fetchJobList()
     },[])
     console.log("Joblist",joblist)

  return (
   <SafeAreaView style={styles.container}>
  
    <Text style={styles.heading}>Recently Posted Jobs</Text>

    {joblist?.length > 0 ? (
      <FlatList
        data={joblist}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.jobCard}>
            <View style={styles.jobHeader}>
              <Text style={styles.jobTitle}>{item.jobrole}</Text>
              <Pressable
                style={styles.buttonSmall}
                onPress={() =>
                  navigation.navigate("Application List", {
                    JobId: item.id,
                  })
                }
              >
                <Text style={styles.buttonTextSmall}>View Applications</Text>
              </Pressable>
            </View>

            <View style={styles.metaInfo}>
              <View style={styles.metaRow}>
                <Entypo name="location-pin" color="#6B7280" size={16} />
                <Text style={styles.metaText}>{item.locations}</Text>
              </View>
              <Text style={styles.metaText}>{formatDate(item.postedAt)}</Text>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    ) : (
      <View style={styles.emptyContainer}>
        <Image
          source={require('../assets/emptyfolder.png')}
          style={styles.emptyImage}
        />
        <Text style={styles.emptyText}>No jobs posted yet</Text>
      </View>
    )}

</SafeAreaView>
    
                    
                  
  )
}

export default ViewJobApplications

const ApplicationsList = ({ route }) => {
   const { JobId } = route.params;
  const [modalVisible,setModalVisible]=useState(false);
  const [applications, setApplications] = useState([]);
  
  const [disableBtn,setDisableBtn]=useState(false);

  const [status,setStatus]=useState("");
  const [message,setMessage]=useState("");
  const [jobData,setJobData]=useState("");
  const [currentApplication,setCurrentApplication]=useState({})
  const navigation = useNavigation();
  const selectionMsg=`We are pleased to inform you that you have been shortlisted for the position of ${jobData.jobrole} at ${jobData.companyName} and we look forward to the next steps in the selection process. Our team will be in touch with you shortly regarding further details.`
  const rejectionMSg=`Thank you for your interest in the ${jobData.jobrole} position at ${jobData.companyName}.we regret to inform you that you have not been shortlisted for the next stage of the selection process. `


  const fetchApplications = async () => {
    if (!JobId) return;

    try {
      const q = query(collection(db, 'jobApplications'), where('jobId', '==', JobId));
      const snapData = await getDocs(q);
      const appList = snapData.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setApplications(appList);
    } catch (e) {
      console.log('Error fetching applications:', e);
    }
  };
  const fetchCompanyDetails=async()=>{
    const jobsnap=await getDoc(doc(db,'jobs',JobId));
    setJobData(jobsnap.data());

  }
  setMessage
  const updateStatus=async()=>{
    try{
      
      const jobref=doc(db,'jobApplications',currentApplication.id);
      await updateDoc(jobref,{status:status,statusAt:new Date()});
  
      const MessageRef=collection(db,'users',currentApplication.userId,'messages');
      await addDoc(MessageRef,{
        message:message,
        messageAt: new Date(),
        from:jobData.companyName,
        type: 'status_update',
        status: status,
        read: false
      })
      setMessage('');
      setStatus('');
      setModalVisible(false);
      fetchApplications();
     
      console.log("status updated successfully")
    }
   catch(e){
    console.log(e);
    Alert.alert("can't able to send the messages")
   }
  }

  useEffect(() => {
    fetchApplications();
    fetchCompanyDetails();
  }, []);
 console.log(jobData)
console.log(applications)
  const renderItem = ({ item }) => (
    <View style={styles.card}>
    <View style={{flexDirection:'row',justifyContent:'space-between'}}>
      <View>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.label}>Website:</Text>
      <Text style={styles.website}>{item.website}</Text>
      <Text style={styles.label}>Cover Letter:</Text>
      <Text style={styles.coverLetter}>{item.coverLetter}</Text>

      </View>
      <Text>Applied {formatDate(item.submittedAt)}</Text>
      
    </View>
      
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('User Profile', { uid: item.userId })}
      >
        <Text style={styles.buttonText}>View Full Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity  style={[styles.button,item.status === "shortlisted" && styles.shortlistBackground, item.status === "notShortlisted" && styles.notShortlistBackground]} onPress={()=>{setModalVisible(true),setCurrentApplication(item)}} disabled={item.status === "shortlisted" || item.status === "notShortlisted"}> <Text style={styles.buttonText}>{item.status==="shortlisted"?"Shortlisted":item.status==="notShortlisted"?"Not Shortlisted":"Update Status"}</Text></TouchableOpacity>
    </View>
  );
console.log(message)
  return (
   <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Applications</Text>

        {
          applications.length === 0 ? (
            <View style={styles.emptyContainer}>
              {/* <Image source={require('../assets/emptyfolder.png')} style={styles.emptyImage} /> */}
              <Text style={styles.emptyText}>No Applications Yet</Text>
            </View>
          ) : (
            <FlatList
              data={applications}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.list}
            />
          )
        }

        <Modal
          visible={modalVisible}
          animationType='slide'
          onRequestClose={() => setModalVisible(false)}
          transparent
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.title}>Update Status</Text>

              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={[styles.optionButton, status === 'shortlisted' && styles.selected]}
                  onPress={() => {
                    setMessage(selectionMsg);
                    setStatus('shortlisted');
                  }}
                >
                  <Text style={styles.modalButtonText}>Shortlisted</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.optionButton, status === 'notShortlisted' && styles.selected]}
                  onPress={() => {
                    setMessage(rejectionMSg);
                    setStatus('notShortlisted');
                  }}
                >
                  <Text style={styles.modalButtonText}>Rejected</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.textInput}
                multiline
                placeholder="Enter message..."
                value={message}
                onChangeText={(val) => setMessage(val)}
              />

              <View style={styles.footerButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setModalVisible(false);
                    setStatus('');
                    setMessage('');
                  }}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.sendButton} onPress={updateStatus}>
                  <Text style={styles.sendText}>Send</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

export  {ApplicationsList}

const styles=StyleSheet.create({
   safeContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyImage: {
    height: 100,
    width: 200,
    resizeMode: 'contain',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6B7280',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff'
},
button: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 8,
    marginVertical: 10
},
buttonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
},
heading: {
    fontWeight: 'bold',
    fontSize: 14,
    marginVertical: 10,
},
shortlistBackground:{
 backgroundColor:"#59CE8F"
},
notShortlistBackground:{
backgroundColor:'#FF6464'
},
jobCard: {
    // backgroundColor: '#e6eefa',
    padding: 16,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: {
        width: 0,
        height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6, // For Android
},
jobTitle: {
    fontWeight: 'bolder',
    color: "#555"
},
jobContainer: {
    height: 15
},
metaRow: {
    flexDirection: 'row',
    gap: 3
},
metaText: {
    fontSize: 11,
    color: '#333',

},
bottomcard: {
    borderTopColor: '#2563EB',
    marginTop: 15,
    paddingTop: 5,
    flexDirection: 'row',
    justifyContent: 'space-between'
},
buttonContainer:{
backgroundColor:"#2563EB",
paddingVertical:12,
paddingHorizontal:8,
borderRadius:10
},
buttonText:{
   color:'white',
   fontWeight:"bold"
},
heading: {
  fontSize: 28,
  fontWeight: '700',
  marginBottom: 20,
  color: '#1F2937',
  textAlign: 'center',
},
list: {
  paddingBottom: 20,
},
card: {
  backgroundColor: '#ffffff',
  borderRadius: 16,
  padding: 20,
  marginBottom: 16,
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 6,
},
name: {
  fontSize: 22,
  fontWeight: 'bold',
  color: '#111827',
  marginBottom: 12,
},
label: {
  fontSize: 16,
  fontWeight: '600',
  marginTop: 10,
  color: '#374151',
},
website: {
  color: '#3B82F6',
  fontSize: 16,
  marginTop: 4,
  textDecorationLine: 'underline',
},
coverLetter: {
  fontSize: 16,
  color: '#4B5563',
  marginTop: 4,
  lineHeight: 22,
},
button: {
  marginTop: 20,
  backgroundColor: '#2563EB',
  paddingVertical: 12,
  borderRadius: 12,
  alignItems: 'center',
},
buttonText: {
  color: '#fff',
  fontWeight: '600',
  fontSize: 16,
},
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.4)',
  justifyContent: 'center',
  alignItems: 'center',
},
modalContainer: {
  width: '85%',
  backgroundColor: '#fff',
  borderRadius: 12,
  padding: 20,
  elevation: 5,
},
title: {
  fontSize: 18,
  fontWeight: '600',
  marginBottom: 15,
  textAlign: 'center',
},
buttonGroup: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  marginVertical: 10,
},
optionButton: {
  paddingVertical: 10,
  paddingHorizontal: 15,
  backgroundColor: '#f0f0f0',
  borderRadius: 8,
},
selected: {
  backgroundColor: '#4CAF50',
},
modalButtonText: {
  color: '#000',
  fontWeight: '500',
},
textInput: {
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  padding: 10,
  minHeight: 80,
  marginVertical: 15,
  textAlignVertical: 'top',
},
footerButtons: {
  flexDirection: 'row',
  justifyContent: 'space-between',
},
cancelButton: {
  backgroundColor: '#ccc',
  padding: 10,
  borderRadius: 8,
  width: '48%',
  alignItems: 'center',
},
sendButton: {
  backgroundColor: '#2196F3',
  padding: 10,
  borderRadius: 8,
  width: '48%',
  alignItems: 'center',
},
cancelText: {
  color: '#000',
  fontWeight: '500',
},
sendText: {
  color: '#fff',
  fontWeight: '500',
},
 container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  jobCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    marginRight: 10,
  },
  buttonSmall: {
    backgroundColor: '#2563EB',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  buttonTextSmall: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#6B7280',
  },
  separator: {
    height: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyImage: {
    height: 120,
    width: 220,
    resizeMode: 'contain',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#9CA3AF',
  },
})