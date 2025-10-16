import React, { useEffect, useState, useCallback } from "react";
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
  Linking,
} from "react-native";

import { useNavigation, useFocusEffect } from "@react-navigation/native";
import {
  Ionicons,
  Feather,
  Entypo,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { auth, db } from "../firebaseConfig";
import {
  addDoc,
  collection,
  getDocs,
  query,
  updateDoc,
  where,
  doc,
  getDoc,
  orderBy,
} from "firebase/firestore";

// --- Helper Function ---
const formatDate = (date) => {
  const posted = date.toDate();
  const now = new Date();
  const diffDate = Math.floor((now - posted) / (1000 * 60 * 60 * 24));
  if (diffDate === 0) {
    const diffHour = Math.floor((now - posted) / (1000 * 60 * 60));
    if (diffHour === 0) {
      const diffMinute = Math.floor((now - posted) / (1000 * 60));
      return diffMinute === 1 ? "1 min ago" : `${diffMinute} mins ago`;
    }
    return diffHour === 1 ? "1 hr ago" : `${diffHour} hrs ago`;
  }
  return diffDate === 1 ? "1 day ago" : `${diffDate} days ago`;
};

// --- ViewJobApplications Component (Jobs List) ---
const ViewJobApplications = ({ navigation }) => {
  const [joblist, setJobList] = useState();
  const [loading, setLoading] = useState(false);
  // Note: Assuming auth.currentUser?.uid is correctly set for the company
  const companyUID = auth.currentUser?.uid;

  const fetchJobList = async () => {
    try {
      setLoading(true);
      if (!companyUID) {
        return;
      }
      const q = query(
        collection(db, "jobs"),
        where("companyUID", "==", companyUID)
      );
      const snapdata = await getDocs(q);

      const fetchedJobs = snapdata.docs.map((job) => ({
        id: job.id,
        ...job.data(),
      }));
      setJobList(fetchedJobs);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchJobList();
    }, [])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>My Posted Jobs</Text>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : joblist?.length > 0 ? (
        <FlatList
          data={joblist}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContentContainer}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <View style={styles.jobCard}>
              <View style={styles.jobHeader}>
                <Text style={styles.jobTitle}>{item.jobrole}</Text>
                <Pressable
                  style={styles.viewButton}
                  onPress={() =>
                    navigation.navigate("Application List", {
                      JobId: item.id,
                      jobRole: item.jobrole, // Passing job role for a better header in the next screen
                    })
                  }
                >
                  <Text style={styles.viewButtonText}>View Applications</Text>
                  <Ionicons
                    name="arrow-forward-sharp"
                    size={14}
                    color="#fff"
                    style={{ marginLeft: 5 }}
                  />
                </Pressable>
              </View>

              <View style={styles.metaInfo}>
                <View style={styles.metaRow}>
                  <Entypo name="location-pin" color="#6B7280" size={16} />
                  <Text style={styles.metaText}>{item.locations}</Text>
                </View>
                <Text style={styles.metaTextPosted}>
                  {item.postedAt ? formatDate(item.postedAt) : "N/A"}
                </Text>
              </View>
            </View>
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Image
            source={require("../assets/emptyfolder.png")} // Placeholder for a real image path
            style={styles.emptyImage}
          />
          <Text style={styles.emptyText}>You haven't posted any jobs yet.</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default ViewJobApplications;

// --- ApplicationsList Component ---
const ApplicationsList = ({ route }) => {
  const { JobId, jobRole } = route.params;
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [jobData, setJobData] = useState({});
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [modalVisible, setModalVisible] = useState(false);
  const [currentApplication, setCurrentApplication] = useState({});
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const navigation = useNavigation();

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

      const userMessages = await Promise.all(
        snap.docs.map(async (d) => {
          const data = d.data();
          // Assuming 'users' collection exists and has personalData.name/imageUrl
          const userRef = await getDoc(doc(db, "users", data?.userId));
          const userData = userRef.exists() ? userRef.data() : {};
          const name = userData?.personalData?.name || "Unknown Applicant";
          const profileImg = userData?.personalData?.imageUrl || null;

          return { id: d.id, ...data, name, profileImg };
        })
      );

      setApplications(userMessages);
      setFilteredApplications(userMessages); // use the same array for filtered initially
      setSelectedStatus("all"); // Reset filter status on fetch
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

  const openCV = async (item) => {
    try {
      if (!item.cvUrl) {
        Alert.alert("No CV Found", "This applicant has not uploaded a CV.");
        return;
      }

      const supported = await Linking.canOpenURL(item.cvUrl);

      if (supported) {
        await Linking.openURL(item.cvUrl);

        // ✅ Mark as viewed only if it was 'applied'
        if (item.status === "applied") {
          await updateDoc(doc(db, "jobApplications", item.id), {
            status: "viewed",
            viewedAt: new Date(),
          });
        }
      } else {
        Alert.alert(
          "Cannot open CV link",
          "The provided CV link is not valid or cannot be opened."
        );
      }
    } catch (error) {
      console.error("Error opening CV:", error);
      Alert.alert("Error", "Something went wrong while opening the CV.");
    }
  };


  const handleStatusUpdate = async () => {
    if (!status || !currentApplication?.id)
      return Alert.alert("Error", "Please select a status to update.");
    setSending(true);

    // Default messages
    const finalMsg =
      status === "shortlisted"
        ? `Congratulations! You’ve been shortlisted for the position of **${jobData.jobrole}** at **${jobData.companyName}**.`
        : `Thank you for your application. Unfortunately, you were not shortlisted for the **${jobData.jobrole}** role at **${jobData.companyName}**.`;

    try {
      // 1. Update application status
      await updateDoc(doc(db, "jobApplications", currentApplication.id), {
        status,
        statusAt: new Date(),
      });

      // 2. Send message to user
      const msgRef = collection(
        db,
        "users",
        currentApplication.userId,
        "messages"
      );
      await addDoc(msgRef, {
        message: message || finalMsg, // Use custom message if provided, else default
        messageAt: new Date(),
        from: jobData.companyUID,
        to: currentApplication.userId,
        type: "status_update",
        status,
        read: false,
        deletedByUser: false,
        deletedByCompany: false,
      });

      Alert.alert("Success", `Status updated to ${status} and message sent.`);
      setModalVisible(false);
      setMessage("");
      setStatus("");
      fetchApplications(); // Re-fetch to update the list
    } catch (e) {
      console.log("Error updating status:", e);
      Alert.alert("Error", "Failed to update status. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const applyFilters = () => {
    if (selectedStatus === "all") {
      setFilteredApplications(applications);
    } else if (selectedStatus) {
      const filtered = applications.filter((a) => a.status === selectedStatus);
      setFilteredApplications(filtered);
    } else {
      setFilteredApplications(applications);
    }
    setFilterVisible(false);
  };

  useEffect(() => {
    fetchApplications();
    fetchJobData();
  }, [JobId]); // Dependency on JobId

  const getStatusStyle = (status) => {
    switch (status) {
      case "shortlisted":
        return styles.statusShortlisted;
      case "notShortlisted":
        return styles.statusRejected;
      case "viewed":
        return styles.statusViewed;
      default:
        return styles.statusApplied;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "shortlisted":
        return "Shortlisted";
      case "notShortlisted":
        return "Rejected";
      case "viewed":
        return "Viewed";
      case "applied":
        return "Applied";
      default:
        return "All";
    }
  };

  const onOpenStatusModal = (item) => {
    setCurrentApplication(item);
    setStatus(item.status || "applied"); // Default to applied if status is missing

    // Set default message based on current status for editing convenience
    if (item.status === "shortlisted") {
      setMessage(
        `We are pleased to inform you that you have been shortlisted for the position of ${jobData.jobrole} at ${jobData.companyName}.`
      );
    } else if (item.status === "notShortlisted") {
      setMessage(
        `Thank you for your interest in the ${jobData.jobrole} position at ${jobData.companyName}. Unfortunately, you were not shortlisted.`
      );
    } else {
      setMessage("");
    }
    setModalVisible(true);
  };

  const renderItem = ({ item }) => (
    <View style={styles.applicantCard}>
      <View style={styles.headerRow}>
        <Text style={styles.applicantName}>{item.name}</Text>
        <Text style={styles.applicantDate}>{formatDate(item.submittedAt)}</Text>
      </View>

      {/* Current Status Badge */}
      <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
        <Text style={styles.statusBadgeText}>{getStatusText(item.status)}</Text>
      </View>

      {item.website && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Website:</Text>
          <Text style={styles.valueLink}>{item.website || "—"}</Text>
        </View>
      )}

      {item.coverLetter && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Cover Letter:</Text>
          <Text style={styles.value}>
            {item.coverLetter.substring(0, 100)}...
          </Text>
        </View>
      )}

      <View style={styles.actionButtons}>
        {item.cvUrl && (
          <TouchableOpacity
            onPress={() => openCV(item)}
            style={[styles.actionButton, styles.cvButton]}
          >
            <Feather name="file-text" size={16} color="#2563EB" />
            <Text style={styles.cvButtonText}>View CV</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, styles.profileButton]}
          onPress={() =>
            navigation.navigate("User Profile", { uid: item.userId })
          }
        >
          <Ionicons name="person-outline" size={16} color="#1E3A8A" />
          <Text style={styles.profileButtonText}>Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.bottomActionButton, styles.updateStatusButton]}
          onPress={() => onOpenStatusModal(item)}
        >
          <MaterialCommunityIcons name="update" size={18} color="#fff" />
          <Text style={styles.updateStatusButtonText}>Update Status</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bottomActionButton, styles.messageButton]}
          onPress={() => {
            navigation.navigate("Messages", {
              screen: "ChatScreen",
              params: {
                to: item?.userId,
                profileImg: item?.profileImg || null,
                userName: item?.name || "User",
              },
            });
          }}
        >
          <Ionicons name="chatbox-outline" size={18} color="#1F2937" />
          <Text style={styles.messageButtonText}>Message</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>{jobRole || "Applications"}</Text>
      </View>

      <TouchableOpacity
        style={styles.filterBarButton}
        onPress={() => setFilterVisible(true)}
      >
        <Ionicons
          name="funnel-outline"
          size={18}
          color="#fff"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.filterBarButtonText}>
          Filter:{" "}
          {selectedStatus.charAt(0).toUpperCase() +
            selectedStatus.slice(1).replace("notShortlisted", "Rejected")}
        </Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#2563EB"
          style={styles.loadingContainer}
        />
      ) : filteredApplications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No applications found for current filter.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredApplications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.applicationsListContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Filter Modal */}
      <Modal
        visible={filterVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFilterVisible(false)}
      >
        <Pressable
          style={styles.filterOverlay}
          onPress={() => setFilterVisible(false)}
        >
          <Pressable
            style={styles.filterContainer}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.filterTitle}>Filter by Status</Text>

            {["all", "applied", "viewed", "shortlisted", "notShortlisted"].map(
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
                    {getStatusText(st)}
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
                <Text style={[styles.filterTxt, { color: "#fff" }]}>
                  Apply Filter
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Status Update Modal */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <Pressable
            style={styles.modalContainer}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.title}>Update Applicant Status</Text>
            <Text style={styles.currentApplicantName}>
              Updating for: {currentApplication?.name || "..."}
            </Text>

            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  status === "shortlisted" && styles.selectedShortlisted,
                ]}
                onPress={() => {
                  setStatus("shortlisted");
                  setMessage(
                    `Congratulations! You’ve been shortlisted for the position of ${jobData.jobrole} at ${jobData.companyName}.`
                  );
                }}
              >
                <Text
                  style={[
                    styles.modalButtonText,
                    status === "shortlisted" && styles.selectedText,
                  ]}
                >
                  Shortlisted
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionButton,
                  status === "notShortlisted" && styles.selectedRejected,
                ]}
                onPress={() => {
                  setStatus("notShortlisted");
                  setMessage(
                    `Thank you for your interest. Unfortunately, you were not shortlisted for the ${jobData.jobrole} role at ${jobData.companyName}.`
                  );
                }}
              >
                <Text
                  style={[
                    styles.modalButtonText,
                    status === "notShortlisted" && styles.selectedText,
                  ]}
                >
                  Rejected
                </Text>
              </TouchableOpacity>

               
            </View>

            <Text style={styles.messageLabel}>
              Custom Message to Applicant:
            </Text>
            <TextInput
              style={styles.textInput}
              multiline
              placeholder="Enter message (leave blank for default)..."
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
                style={[styles.sendButton, sending && { opacity: 0.5 }]}
                onPress={handleStatusUpdate}
                disabled={sending || !status}
              >
                {sending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.sendText}>Send Update</Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export { ApplicationsList };

// --- Stylesheet ---
const styles = StyleSheet.create({
  // --- Global & Layout Styles ---
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB", // Light background for the whole screen
  },
  header: {
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    alignItems: "center",
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    fontFamily: "Poppins-Bold", // Ensure a bold font is used
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // --- ViewJobApplications (Job List) Styles ---
  listContentContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  jobCard: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
    marginRight: 10,
    fontFamily: "Poppins-Bold",
  },
  viewButton: {
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  viewButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
    fontFamily: "Poppins-Bold",
  },
  metaInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    marginTop: 10,
    paddingTop: 10,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    fontSize: 13,
    color: "#6B7280",
    fontFamily: "Poppins-Regular",
  },
  metaTextPosted: {
    fontSize: 12,
    color: "#9CA3AF",
    fontFamily: "Poppins-Regular",
  },
  separator: {
    height: 15,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyImage: {
    height: 150,
    width: 250,
    resizeMode: "contain",
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    fontFamily: "Poppins-Regular",
    textAlign: "center",
  },

  // --- ApplicationsList (Applicant Cards) Styles ---
  filterBarButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginHorizontal: 20,
    marginVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  filterBarButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    fontFamily: "Poppins-Bold",
  },
  applicationsListContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 5,
  },
  applicantCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    // A subtle accent
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 5,
  },
  applicantName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    fontFamily: "Poppins-Bold",
    flex: 1,
  },
  applicantDate: {
    fontSize: 12,
    color: "#9CA3AF",
    fontFamily: "Poppins-Regular",
  },
  profileImageContainer: {
    position: "absolute",
    top: 15,
    right: 15,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginBottom: 10,
  },
  statusBadgeText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
    fontFamily: "Poppins-Bold",
  },
  statusApplied: { backgroundColor: "#6B7280" }, // Gray
  statusViewed: { backgroundColor: "#F59E0B" }, // Amber
  statusShortlisted: { backgroundColor: "#10B981" }, // Green
  statusRejected: { backgroundColor: "#EF4444" }, // Red

  infoRow: {
    marginVertical: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    fontFamily: "Poppins-Bold",
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    color: "#4B5563",
    fontFamily: "Poppins-Regular",
    lineHeight: 20,
  },
  valueLink: {
    color: "#2563EB",
    fontSize: 14,
    textDecorationLine: "underline",
    fontFamily: "Poppins-Regular",
  },

  // Action Buttons
  actionButtons: {
    flexDirection: "row",
    marginTop: 15,
    marginBottom: 10,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
  },
  cvButton: {
    backgroundColor: "#E0E7FF",
    borderWidth: 1,
    borderColor: "#A5B4FC",
  },
  cvButtonText: {
    color: "#2563EB",
    fontWeight: "600",
    fontSize: 13,
    marginLeft: 5,
    fontFamily: "Poppins-Bold",
  },
  profileButton: {
    backgroundColor: "#F3F4F6",
  },
  profileButtonText: {
    color: "#1F2937",
    fontWeight: "600",
    fontSize: 13,
    marginLeft: 5,
    fontFamily: "Poppins-Bold",
  },

  bottomActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 5,
  },
  bottomActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
  },
  updateStatusButton: {
    backgroundColor: "#2563EB",
  },
  updateStatusButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 5,
    fontFamily: "Poppins-Bold",
  },
  messageButton: {
    backgroundColor: "#D1D5DB",
  },
  messageButtonText: {
    color: "#1F2937",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 5,
    fontFamily: "Poppins-Bold",
  },

  // --- Filter Modal Styles ---
  filterOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  filterContainer: {
    backgroundColor: "#fff",
    padding: 25,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
  },
  filterTitle: {
    fontSize: 16,
 
    marginBottom: 15,
    textAlign: "center",
    color: "#1F2937",
    fontFamily: "Poppins-Bold",
  },
  filterOption: {
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    marginVertical: 4,
  },
  filterSelected: {
    backgroundColor: "#2563EB",
  },
  filterText: {
    fontSize: 15,
    textAlign: "center",
    color: "#374151",
    fontFamily: "Poppins-Regular",
  },
  filterTextSelected: {
    color: "#fff",
    fontWeight: "700",
    fontFamily: "Poppins-Bold",
  },
  filterButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  cancelBtn: {
    backgroundColor: "#D1D5DB",
    padding: 12,
    borderRadius: 8,
    width: "48%",
    alignItems: "center",
  },
  applyBtn: {
    backgroundColor: "#2563EB",
    padding: 12,
    borderRadius: 8,
    width: "48%",
    alignItems: "center",
  },
  filterTxt: {
    fontWeight: "600",
    fontFamily: "Poppins-Bold",
  },

  // --- Status Update Modal Styles ---
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 5,
    textAlign: "center",
    color: "#1F2937",
    fontFamily: "Poppins-Bold",
  },
  currentApplicantName: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 15,
    fontFamily: "Poppins-Regular",
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
    gap: 10,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    alignItems: "center",
  },
  selectedShortlisted: { backgroundColor: "#10B981" },
  selectedRejected: { backgroundColor: "#EF4444" },
  selectedViewed: { backgroundColor: "#F59E0B" },
  selectedText: { color: "#fff" },
  modalButtonText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 13,
    fontFamily: "Poppins-Bold",
  },
  messageLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginTop: 15,
    marginBottom: 5,
    fontFamily: "Poppins-Bold",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 10,
    minHeight: 100,
    marginVertical: 10,
    fontFamily: "Poppins-Regular",
    textAlignVertical: "top",
    fontSize: 14,
  },
  footerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  cancelButton: {
    backgroundColor: "#D1D5DB",
    padding: 12,
    borderRadius: 8,
    width: "48%",
    alignItems: "center",
  },
  sendButton: {
    backgroundColor: "#2563EB",
    padding: 12,
    borderRadius: 8,
    width: "48%",
    alignItems: "center",
  },
  cancelText: {
    color: "#1F2937",
    fontWeight: "600",
    fontFamily: "Poppins-Bold",
  },
  sendText: {
    color: "#fff",
    fontWeight: "600",
    fontFamily: "Poppins-Bold",
  },
});
