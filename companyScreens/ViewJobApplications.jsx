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
  ActivityIndicator,
  Linking
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
    const [loading,setLoading]=useState(false);
    const companyUID = auth.currentUser?.uid ;
        // || "vm5dkIUfk0WxgnXT34QBttxA3kV2";
    console.log(companyUID)
     const fetchJobList=async()=>{
        try{
            setLoading(true);
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
        finally{
            setLoading(false);
        }
     }
    
     useEffect(()=>{
        fetchJobList()
     },[])
     console.log("Joblist",joblist)

  return (
    
      <SafeAreaView style={styles.container}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : joblist?.length > 0 ? (
          <FlatList
            data={joblist}
            keyExtractor={(item) => item.id.toString()}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListHeaderComponent={() => (
              <View style={{ marginVertical: 10, marginBottom: 6 }}>
                <Text style={[styles.heading, { textAlign: "center" }]}>
                  Posted Jobs
                </Text>
              </View>
            )}
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
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Image
              source={require("../assets/emptyfolder.png")}
              style={styles.emptyImage}
            />
            <Text style={styles.emptyText}>No jobs posted yet</Text>
          </View>
        )}
      </SafeAreaView>
    );
    
  
}

export default ViewJobApplications
const ApplicationsList = ({ route }) => {
  const { JobId } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const [jobData, setJobData] = useState({});
  const [currentApplication, setCurrentApplication] = useState({});
  const navigation = useNavigation();

  const fetchApplications = async () => {
    if (!JobId) return;

    try {
      setLoading(true);
      const q = query(
        collection(db, "jobApplications"),
        where("jobId", "==", JobId)
      );
      const snap = await getDocs(q);
      const apps = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setApplications(apps);
    } catch (e) {
      console.log("Error fetching applications:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobData = async () => {
    if (!JobId) return;

    try {
      const jobSnap = await getDoc(doc(db, "jobs", JobId));
      if (jobSnap.exists()) setJobData(jobSnap.data());
    } catch (e) {
      console.log("Error fetching job:", e);
    }
  };

  const openCV = async (cvUrl) => {
    if (!cvUrl || typeof cvUrl !== "string") {
      Alert.alert("Error", "Invalid CV URL");
      return;
    }

    try {
      const supported = await Linking.canOpenURL(cvUrl);
      if (supported) await Linking.openURL(cvUrl);
      else Alert.alert("Error", "Cannot open the CV URL");
    } catch (e) {
      console.log("Error opening CV:", e);
      Alert.alert("Error", "Something went wrong");
    }
  };

  const handleViewStatus = async (app) => {
    if (app.status !== "applied") return;

    try {
      await updateDoc(doc(db, "jobApplications", app.id), {
        status: "viewed",
        viewedAt: new Date(),
      });
    } catch (e) {
      console.log("Failed to mark as viewed", e);
    }
  };

  const handleStatusUpdate = async () => {
    if (!status || !currentApplication?.id) return;

    const finalMsg =
      status === "shortlisted"
        ? `We are pleased to inform you that you have been shortlisted for the position of ${jobData.jobrole} at ${jobData.companyName}.`
        : `Thank you for your interest in the ${jobData.jobrole} position at ${jobData.companyName}. Unfortunately, you were not shortlisted.`;

    try {
      const appRef = doc(db, "jobApplications", currentApplication.id);
      await updateDoc(appRef, {
        status,
        statusAt: new Date(),
      });

      const msgRef = collection(
        db,
        "users",
        currentApplication.userId,
        "messages"
      );
      await addDoc(msgRef, {
        message: message || finalMsg,
        messageAt: new Date(),
        from: jobData.companyName,
        type: "status_update",
        status,
        read: false,
      });

      setModalVisible(false);
      setStatus("");
      setMessage("");
      fetchApplications();
    } catch (e) {
      console.log("Error updating status:", e);
      Alert.alert("Failed to update status");
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchJobData();
  }, []);

  const renderItem = ({ item }) => (
    <View style={[styles.card, { marginHorizontal: 20 }]}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text>Applied {formatDate(item.submittedAt)}</Text>
      </View>

      <Text style={styles.label}>Website:</Text>
      <Text style={styles.website}>{item.website}</Text>

      <Text style={styles.label}>Cover Letter:</Text>
      <Text style={styles.coverLetter}>{item.coverLetter}</Text>

      {item.cvUrl && (
        <TouchableOpacity
          onPress={async () => {
            await openCV(item.cvUrl);
            await handleViewStatus(item);
          }}
        >
          <Text style={{ color: "blue", marginTop: 5 }}>View CV</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.navigate("User Profile", { uid: item.userId })
        }
      >
        <Text style={styles.buttonText}>View Full Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          item.status === "shortlisted" && styles.shortlistBackground,
          item.status === "notShortlisted" && styles.notShortlistBackground,
        ]}
        disabled={["shortlisted", "notShortlisted"].includes(item.status)}
        onPress={() => {
          setCurrentApplication(item);
          setModalVisible(true);
        }}
      >
        <Text style={styles.buttonText}>
          {item.status === "shortlisted"
            ? "Shortlisted"
            : item.status === "notShortlisted"
            ? "Not Shortlisted"
            : "Update Status"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ flex: 1 }} />
      ) : applications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No Applications Yet</Text>
        </View>
      ) : (
        <FlatList
          data={applications}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={() => (
            <Text style={styles.heading}>Applications</Text>
          )}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}

      {/* Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.title}>Update Status</Text>

            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  status === "shortlisted" && styles.selected,
                ]}
                onPress={() => {
                  setStatus("shortlisted");
                  setMessage(""); // optional: customize message
                }}
              >
                <Text style={styles.modalButtonText}>Shortlisted</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionButton,
                  status === "notShortlisted" && styles.selected,
                ]}
                onPress={() => {
                  setStatus("notShortlisted");
                  setMessage(""); // optional: customize message
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
              onChangeText={setMessage}
            />

            <View style={styles.footerButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setModalVisible(false);
                  setStatus("");
                  setMessage("");
                }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleStatusUpdate}
              >
                <Text style={styles.sendText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
},
shortlistBackground:{
 backgroundColor:"#59CE8F"
},
notShortlistBackground:{
backgroundColor:'#FF6464'
},
jobTitle: {
    fontFamily:'Poppins-Bold',
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
  fontSize: 20,
  fontFamily: 'Poppins-Bold',     
  marginVertical: 18,
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
    marginHorizontal:20
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontFamily: 'Poppins-Bold',
    marginBottom: 12,
  },
  jobTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
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
    fontFamily:'Poppins-Bold',
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