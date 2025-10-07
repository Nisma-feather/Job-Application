import {
  ScrollView,
  TextInput,
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Alert,
  Linking,
  Pressable,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import * as DocumentPicker from "expo-document-picker";
import { useState, useEffect } from "react";
import { auth, db, storage } from "../firebaseConfig";
import { addDoc, collection, getDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Ionicons, AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

const ApplyJob = ({ navigation, route }) => {
  const [resumeSelect, setResumeSelect] = useState(false);
  const [selectedResumeIndex, setSelectedResumeIndex] = useState();
  const [cvURL, setCvURL] = useState("");
  const [cvFile, setCvFile] = useState();
  const [jobForm, setJobForm] = useState({
    name: "",
    website: "",
    coverLetter: "",
  });

  const CLOUDINARY_UPLOAD_PRESET = "unsigned_preset";
  const CLOUDINARY_CLOUD_NAME = "dkxi9qvpw";
  const uid = auth.currentUser?.uid || "fA9DeooDHHOpjgsLXiGi2VFeE4y2";
  const { companyUID, JobId } = route.params;

  const [resumeDetails, setResumeDetails] = useState([]);
  const [fileName, setFileName] = useState("No file chosen");

  const fetchResumeDetails = async () => {
    if (!uid) return;
    try {
      const ref = await getDoc(doc(db, "users", uid));
      if (ref.exists()) {
        const data = ref.data().resumeDetails || [];
        setResumeDetails(data);
      }
    } catch (e) {
      console.log("Unable to fetch the resume details", e);
    }
  };

  const chooseFile = async () => {
    console.log("Choosing File");
    setResumeSelect(false);

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const allowedExtensions = ["pdf", "doc"];
        const fileExt = file.name.split(".").pop().toLowerCase();

        if (!allowedExtensions.includes(fileExt)) {
          Alert.alert("Invalid File Type", "Please select a PDF or DOC file.");
          return;
        }

        setCvFile(file);
        setFileName(file.name);
      }
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert("Error", "Something went wrong while picking the document.");
    }
  };

  const handleSubmit = async () => {
    console.log("submit");
    if (!jobForm.name?.trim()) {
      Alert.alert("Name is required.");
      return;
    }

    if (!resumeSelect && !cvFile) {
      Alert.alert("Please upload or select a CV.");
      return;
    }

    try {
      if (cvFile && !resumeSelect) {
        const fileUri = cvFile.uri;
        const fileName = cvFile.name || "document.pdf";

        const formData = new FormData();
        formData.append("file", {
          uri: fileUri,
          name: fileName,
          type: "application/pdf",
        });
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        const res = await axios.post(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              "X-Requested-With": "XMLHttpRequest",
            },
          }
        );

        const uploadedURL = res.data.secure_url;
        setCvURL(uploadedURL);
        console.log("Cloudinary response:", res.data);
      }

      const data = {
        userId: uid,
        companyUID: companyUID,
        jobId: JobId,
        ...jobForm,
        cvUrl: cvURL || "",
        notified: false,
        submittedAt: new Date(),
        status: "applied",
      };

      await addDoc(collection(db, "jobApplications"), data);

      navigation.navigate("Job Successful");
      console.log("Applied Successfully");
    } catch (e) {
      console.log("Error submitting job application:", e);
      Alert.alert("Error", "Failed to apply for the job.");
    }
  };

  const handleDownload = async (url, fileName) => {
    try {
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      const downloadResumable = FileSystem.createDownloadResumable(url, fileUri);
      const { uri } = await downloadResumable.downloadAsync();

      if (uri) {
        Alert.alert("Success", "Resume downloaded successfully!");
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(uri);
        } else {
          Alert.alert("Note", "Sharing not available on this device.");
        }
      }
    } catch (e) {
      console.log("Error downloading file:", e);
      Alert.alert("Error", "Download failed");
    }
  };

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const name = docSnap.data()?.personalData?.name || "";
          setJobForm((prev) => ({ ...prev, name }));
        }
      } catch (error) {
        console.log("Error fetching user name:", error);
      }
    };

    if (uid) {
      fetchUserName();
      fetchResumeDetails();
    }
  }, [uid]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionTitle}>Apply Job</Text>

          <View style={styles.section}>
            <Text style={styles.label}>
              Full name<Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={jobForm.name}
              onChangeText={(val) =>
                setJobForm((prev) => ({ ...prev, name: val }))
              }
              editable={false}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Website, Blog, or Portfolio*</Text>
            <TextInput
              style={styles.input}
              value={jobForm.website}
              onChangeText={(val) =>
                setJobForm((prev) => ({ ...prev, website: val }))
              }
              placeholder="Type your portfolio address"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>
              Upload CV<Text style={styles.required}>*</Text>
            </Text>
            <Text style={styles.fileInfo}>Format DOC, PDF, JPG</Text>
            <TouchableOpacity onPress={chooseFile} style={styles.uploadButton}>
              <View style={styles.uploadContainer}>
                <Text style={styles.uploadText}>Browse Files</Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.fileName}>{resumeSelect ? "" : fileName}</Text>

            <View>
              {resumeDetails.length > 0 &&
                resumeDetails.map((item, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 10,
                      backgroundColor: "#f1f1f1",
                      padding: 10,
                      borderRadius: 6,
                    }}
                  >
                    <Pressable
                      onPress={() => {
                        setResumeSelect(true);
                        setSelectedResumeIndex(index);
                        setFileName(item.fileName);
                        setCvURL(item.cvURL);
                      }}
                    >
                      <MaterialCommunityIcons
                        name={
                          resumeSelect && selectedResumeIndex === index
                            ? "checkbox-marked-circle-outline"
                            : "checkbox-blank-circle-outline"
                        }
                        color="#000"
                        size={24}
                      />
                    </Pressable>
                    <AntDesign
                      name="pdffile1"
                      color="#000"
                      size={24}
                      style={{ marginRight: 10 }}
                    />
                    <Text style={{ flex: 1 }}>{item.fileName}</Text>
                    <TouchableOpacity
                      style={{ padding: 8, borderRadius: 5 }}
                      onPress={() =>
                        handleDownload(item.cvURL, item.fileName)
                      }
                    >
                      <AntDesign name="download" color="#000" size={24} />
                    </TouchableOpacity>
                  </View>
                ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Cover Letter</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={jobForm.coverLetter}
              onChangeText={(val) =>
                setJobForm((prev) => ({ ...prev, coverLetter: val }))
              }
              placeholder="Write something..."
              multiline
              numberOfLines={4}
            />
          </View>

          <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
            <Text style={styles.submitText}>Apply This Job</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContainer: { padding: 15 },
  required: { color: "#ff2121" },
  sectionTitle: {
    fontSize: 16,
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 20,
    fontFamily: "Poppins-Medium",
    color: "#333",
  },
  section: { marginBottom: 10 },
  label: {
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 12,
    backgroundColor: "#f9f9f9",
  },
  textArea: { height: 90, textAlignVertical: "top" },
  fileInfo: { fontSize: 13, color: "#666", marginBottom: 8 },
  uploadButton: { marginTop: 8 },
  uploadContainer: {
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    backgroundColor: "#f0f8ff",
  },
  uploadText: { color: "#007AFF", fontWeight: "500" },
  fileName: { marginTop: 8, fontSize: 14, color: "#666" },
  submitButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    marginTop: 20,
  },
  submitText: {
    color: "white",
    fontFamily: "Poppins-Bold",
    fontSize: 13,
  },
});

export default ApplyJob;
