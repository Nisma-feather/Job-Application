import React, { useEffect, useState,useCallback} from 'react'
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

import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons, Feather, Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
import { auth, db } from '../firebaseConfig';
import { addDoc, collection, getDocs, query, updateDoc, where,doc, getDoc, orderBy } from 'firebase/firestore';

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
    
     useFocusEffect(
       useCallback(() => {
         fetchJobList();
       }, [])
     );
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
                  View Applications
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
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [jobData, setJobData] = useState({});
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [currentApplication, setCurrentApplication] = useState({});
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const navigation = useNavigation();
  const [sending,setSending] = useState(false);

  // Fetch all applications sorted by earliest applied first
  const fetchApplications = async () => {
    if (!JobId) return;
    try {
      setLoading(true);
      const q = query(
        collection(db, "jobApplications"),
        where("jobId", "==", JobId),
        orderBy("submittedAt", "asc")
      );
      const snap = await getDocs(q);
      const apps = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setApplications(apps);
      setFilteredApplications(apps);
    } catch (e) {
      console.log("Error fetching applications:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobData = async () => {
    if (!JobId) return;
    const jobSnap = await getDoc(doc(db, "jobs", JobId));
    if (jobSnap.exists()) setJobData(jobSnap.data());
  };

  const openCV = async (cvUrl) => {
    if (!cvUrl) return Alert.alert("No CV available");
    const supported = await Linking.canOpenURL(cvUrl);
    if (supported) await Linking.openURL(cvUrl);
    else Alert.alert("Cannot open CV link");
  };

  const handleStatusUpdate = async () => {
    if (!status || !currentApplication?.id) return;
    setSending(true);
    const finalMsg =
      status === "shortlisted"
        ? `You’ve been shortlisted for the position of ${jobData.jobrole} at ${jobData.companyName}.`
        : `Unfortunately, you were not shortlisted for the ${jobData.jobrole} role at ${jobData.companyName}.`;
    
    try {
      await updateDoc(doc(db, "jobApplications", currentApplication.id), {
        status,
        statusAt: new Date(),
      });

      // Send message to user
      const msgRef = collection(
        db,
        "users",
        currentApplication.userId,
        "messages"
      );
      await addDoc(msgRef, {
        message: message || finalMsg,
        messageAt: new Date(),
        from: jobData.companyUID,
        to: currentApplication.userId,
        type: "status_update",
        status,
        read: false,
      });

      setModalVisible(false);
      setMessage("");
      setStatus("");
      fetchApplications();
    } catch (e) {
      console.log("Error updating status:", e);
      Alert.alert("Failed to update status");
    }
    finally{
      setSending(false)
    }
  };

  const applyFilters = () => {
    if (selectedStatus) {
      const filtered = applications.filter(
        (a) => a.status === selectedStatus
      );
      setFilteredApplications(filtered);
    } else {
      setFilteredApplications(applications);
    }
    setFilterVisible(false);
  };

  useEffect(() => {
    fetchApplications();
    fetchJobData();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.date}>{formatDate(item.submittedAt)}</Text>
      </View>

      <Text style={styles.label}>Website:</Text>
      <Text style={styles.value}>{item.website || "—"}</Text>

      <Text style={styles.label}>Cover Letter:</Text>
      <Text style={styles.value}>{item.coverLetter || "—"}</Text>

      {item.cvUrl && (
        <TouchableOpacity
          onPress={() => openCV(item.cvUrl)}
          style={{ marginTop: 5 }}
        >
          <Text style={styles.link}>View CV</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.profileButton}
        onPress={() =>
          navigation.navigate("User Profile", { uid: item.userId })
        }
      >
        <Text style={styles.profileButtonText}>View Full Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.statusButton,
          item.status === "shortlisted" && styles.shortlisted,
          item.status === "notShortlisted" && styles.rejected,
        ]}
        onPress={() => {
           setCurrentApplication(item);
           setStatus(item.status);

           if (item.status === "shortlisted") {
             setMessage(
               `We are pleased to inform you that you have been shortlisted for the position of ${jobData.jobrole} at ${jobData.companyName}.`
             );
           } else if (item.status === "notShortlisted") {
             setMessage(
               `Thank you for your interest in the ${jobData.jobrole} position at ${jobData.companyName}. Unfortunately, you were not shortlisted.`
             );
           } else {
             setMessage(""); // optional: clear message for other statuses
           }
          setModalVisible(true);
        }}
      >
        <Text style={styles.statusButtonText}>
          {item.status === "shortlisted"
            ? "Shortlisted"
            : item.status === "notShortlisted"
            ? "Rejected"
            : "Update Status"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ flex: 1 }} />
      ) : (
        <>
          <Text style={styles.heading}>Applications</Text>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setFilterVisible(true)}
          >
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setFilterVisible(true)}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons
                  name="filter-outline" // pick any icon you like
                  size={20}
                  color="#fff"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.filterButtonText}>Apply Filters</Text>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>

          {filteredApplications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No applications found</Text>
            </View>
          ) : (
            <FlatList
              data={filteredApplications}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
            />
          )}
        </>
      )}

      {/* Filter Modal */}
      <Modal
        visible={filterVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterVisible(false)}
      >
        <View style={styles.filterOverlay}>
          <View style={styles.filterContainer}>
            <Text style={styles.filterTitle}>Filter by Status</Text>

            {["applied", "viewed", "shortlisted", "notShortlisted"].map(
              (st) => (
                <TouchableOpacity
                  key={st}
                  style={[
                    styles.filterOption,
                    selectedStatus === st && styles.filterSelected,
                  ]}
                  onPress={() => setSelectedStatus(st)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      selectedStatus === st && styles.filterTextSelected,
                    ]}
                  >
                    {st.charAt(0).toUpperCase() + st.slice(1)}
                  </Text>
                </TouchableOpacity>
              )
            )}

            <View style={styles.filterButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setFilterVisible(false)}
              >
                <Text style={styles.filterTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyBtn} onPress={applyFilters}>
                <Text style={[styles.filterTxt, { color: "#fff" }]}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
                  setMessage(
                    `We are pleased to inform you that you have been shortlisted for the position of ${jobData.jobrole} at ${jobData.companyName}.`
                  );
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
                  setMessage(
                    `Thank you for your interest in the ${jobData.jobrole} position at ${jobData.companyName}. Unfortunately, you were not shortlisted.`
                  );
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
                disabled={sending}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleStatusUpdate}
                disabled={sending}
              >
                <Text style={styles.sendText}>
                  {sending ? "Sending..." : "Send"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};


export  {ApplicationsList}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    padding: 16,
    flexGrow: 1,
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 50,
  },
  emptyImage: {
    height: 100,
    width: 200,
    resizeMode: "contain",
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: "#6B7280",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 8,
    marginVertical: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },
  shortlistBackground: {
    backgroundColor: "#59CE8F",
  },
  notShortlistBackground: {
    backgroundColor: "#FF6464",
  },

  jobContainer: {
    height: 15,
  },
  metaRow: {
    flexDirection: "row",
    gap: 3,
  },
  metaText: {
    fontSize: 11,
    color: "#333",
  },
  bottomcard: {
    borderTopColor: "#2563EB",
    marginTop: 15,
    paddingTop: 5,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  buttonContainer: {
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
  },

  heading: {
    fontSize: 13,
    fontFamily: "Poppins-Bold",
    color: "#666",
    marginVertical: 13,
    textAlign: "center",
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 10,
    color: "#374151",
  },
  website: {
    color: "#3B82F6",
    fontSize: 13,
    marginTop: 4,
    textDecorationLine: "underline",
  },
  coverLetter: {
    fontSize: 13,
    color: "#4B5563",
    marginTop: 4,
    lineHeight: 22,
  },
  button: {
    marginTop: 20,
    backgroundColor: "#2563EB",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },

  modalContainer: {
    width: "85%",
    maxHeight: "80%", // prevents full-screen black
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    zIndex: 10000,
  },
  title: {
    fontSize: 15,
    fontFamily: "Poppins-Bold",
    marginBottom: 10,
    textAlign: "center",
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  selected: {
    backgroundColor: "#4CAF50",
  },
  modalButtonText: {
    color: "#000",
    fontFamily: "Poppins-Bold",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    minHeight: 80,
    marginVertical: 15,
    fontFamily: "Poppins-Regular",
    textAlignVertical: "top",
  },
  footerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    backgroundColor: "#ccc",
    fontFamily: "Poppins-Bold",
    padding: 10,
    borderRadius: 8,
    width: "48%",
    alignItems: "center",
  },
  sendButton: {
    backgroundColor: "#2196F3",

    padding: 10,
    borderRadius: 8,
    width: "48%",
    alignItems: "center",
  },
  cancelText: {
    color: "#000",
    fontFamily: "Poppins-Bold",
  },
  sendText: {
    color: "#fff",
    fontFamily: "Poppins-Bold",
  },
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  jobCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginHorizontal: 20,
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    fontFamily: "Poppins-Bold",
    marginBottom: 12,
  },
  jobTitle: {
    fontSize: 13,
    fontFamily: "Poppins-Bold",
    color: "#1F2937",
    flex: 1,
    marginRight: 10,
  },
  buttonSmall: {
    backgroundColor: "#2563EB",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  buttonTextSmall: {
    color: "#fff",
    fontFamily: "Poppins-Bold",
    fontSize: 12,
  },
  metaInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#6B7280",
  },
  separator: {
    height: 12,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  emptyImage: {
    height: 120,
    width: 220,
    resizeMode: "contain",
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#9CA3AF",
  },
  filterContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
  },

  filterOption: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    marginVertical: 5,
  },
  filterSelected: {
    backgroundColor: "#2563EB",
  },

  filterButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  filterCancel: {
    backgroundColor: "#e5e7eb",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    width: "48%",
  },
  filterApply: {
    backgroundColor: "#2563EB",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    width: "48%",
  },
  container: { flex: 1, backgroundColor: "#f9fafb", padding: 10 },
  heading: {
    fontSize: 17,
    fontFamily: "Poppins-Bold",
    marginTop: 10,
    marginBottom: 10,
    color: "#333",
  },
  list: { paddingBottom: 40 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  name: { fontSize: 16, fontFamily: "Poppins-Bold", color: "#444" },
  date: { fontSize: 12, color: "#666", fontFamily: "Poppins-Regular" },
  label: { fontSize: 13, fontFamily: "Poppins-Bold", marginTop: 4 },
  value: {
    fontSize: 13,
    color: "#444",
    marginBottom: 2,
    fontFamily: "Poppins-Regular",
  },
  link: { color: "#2563EB", fontSize: 13, fontFamily: "Poppins-Regular" },
  profileButton: {
    marginTop: 10,

    backgroundColor: "#E0E7FF",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  profileButtonText: {
    color: "#1E3A8A",
    fontFamily: "Poppins-Bold",
    fontWeight: "600",
  },
  statusButton: {
    marginTop: 8,
    paddingVertical: 8,
    borderRadius: 6,

    backgroundColor: "#2563EB",
    alignItems: "center",
  },
  shortlisted: { backgroundColor: "#10B981" },
  rejected: { backgroundColor: "#EF4444" },
  statusButtonText: { color: "#fff", fontFamily: "Poppins-Bold" },
  filterButton: {
    backgroundColor: "#2563EB",

    fontFamily: "Poppins-Bold",
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 5,
  },
  filterButtonText: { color: "#fff", fontFamily: "Poppins-Bold", fontSize: 15 },
  emptyContainer: { flex: 1, alignItems: "center", marginTop: 50 },
  emptyText: { color: "#666", fontSize: 16 },
  filterOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  filterContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  filterTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    marginBottom: 15,
    textAlign: "center",
  },
  filterOption: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  filterSelected: {
    backgroundColor: "#E0E7FF",
  },
  filterText: {
    fontSize: 16,
    textAlign: "center",
    fontFamily: "Poppins-Regular",
  },
  filterTextSelected: { color: "#2563EB" },
  filterButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  cancelBtn: {
    backgroundColor: "#F3F4F6",
    padding: 10,
    borderRadius: 6,
    width: "45%",
    alignItems: "center",
  },
  applyBtn: {
    backgroundColor: "#2563EB",
    padding: 10,
    fontFamily: "Poppins-Bold",
    borderRadius: 6,
    width: "45%",
    alignItems: "center",
  },
  filterTxt: {
    fontFamily: "Poppins-Bold",
  },
  modalOverlay: {
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  filterOverlay: {
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
});