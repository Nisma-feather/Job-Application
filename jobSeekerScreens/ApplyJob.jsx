import {
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Alert,
  Linking,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";
import { auth, db } from "../firebaseConfig";
import { addDoc, collection } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const storage = getStorage();

const ApplyJob = ({ navigation, route }) => {
  const [jobForm, setJobForm] = useState({
    name: "",
    website: "",
    coverLetter: "",
  });

  const uid = auth.currentUser?.uid || "fA9DeooDHHOpjgsLXiGi2VFeE4y2";
  const { companyUID, JobId } = route.params;

  const [cvFile, setCvFile] = useState(null);
  const [fileName, setFileName] = useState("No file chosen");

  const chooseFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (result.type === "success") {
        setCvFile(result);
        setFileName(result.name);
      }
    } catch (error) {
      console.error("Error picking document:", error);
    }
  };

  const handleSubmit = async () => {
    try {
      let cvURL = null;

      if (cvFile) {
        const response = await fetch(cvFile.uri);
        const blob = await response.blob();

        const storageRef = ref(
          storage,
          `cvUploads/${uid}_${Date.now()}_${cvFile.name}`
        );

        await uploadBytes(storageRef, blob);

        cvURL = await getDownloadURL(storageRef);
      }

      const data = {
        userId: uid,
        companyUID: companyUID,
        jobId: JobId,
        ...jobForm,
        cvUrl: cvURL,
        notified: false,
        submittedAt: new Date(),
        status: "applied",
      };

      await addDoc(collection(db, "jobApplications"), data);
      navigation.navigate("Application successfull");
    } catch (e) {
      console.log("Error submitting job application:", e);
      Alert.alert("Error", "Failed to apply for the job. Try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.sectionTitle}>Apply Job</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Full name*</Text>
          <TextInput
            style={styles.input}
            value={jobForm.name}
            onChangeText={(val) =>
              setJobForm((prev) => ({ ...prev, name: val }))
            }
            placeholder="Type your name"
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
          <Text style={styles.label}>Upload CV*</Text>
          <Text style={styles.fileInfo}>Format DOC, PDF, JPG</Text>
          <TouchableOpacity onPress={chooseFile} style={styles.uploadButton}>
            <View style={styles.uploadContainer}>
              <Text style={styles.uploadText}>Browse Files</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.fileName}>{fileName}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Motivational Letter</Text>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  section: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  fileInfo: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  uploadButton: {
    marginTop: 8,
  },
  uploadContainer: {
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    backgroundColor: "#f0f8ff",
  },
  uploadText: {
    color: "#007AFF",
    fontWeight: "500",
  },
  fileName: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
  },
  submitButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
  },
  submitText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default ApplyJob;
