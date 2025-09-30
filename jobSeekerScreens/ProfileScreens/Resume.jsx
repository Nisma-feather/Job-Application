import {
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  Alert,
  SafeAreaView,
} from "react-native";

import * as DocumentPicker from "expo-document-picker";
import { useEffect, useState } from "react";
import axios from "axios";
import { auth, db } from "../../firebaseConfig";
import { arrayRemove, arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import {AntDesign,} from '@expo/vector-icons';

const Resume = () => {
  const [resumeDetails, setResumeDetails] = useState([]);
  const [cvFile, setCvFile] = useState({});
  const [fileName, setFileName] = useState("");
  const CLOUDINARY_UPLOAD_PRESET = "unsigned_preset";
  const CLOUDINARY_CLOUD_NAME = "dkxi9qvpw";
  const uid = auth.currentUser?.uid;

  const fetchResumeDetails = async () => {
    if (!uid) {
      return;
    }
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
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setCvFile(file);
        setFileName(file.name);
      } else {
        console.log("The picker was canceled, no document selected.");
      }
    } catch (e) {
      Alert.alert("Error", "Can't pick the document");
      console.log("Error picking the document", e);
    }
  };

  const handleSubmit = async () => {
    console.log("Trying to submit");
    try {
      if (!cvFile?.uri || !uid) return;

      const fileuri = cvFile.uri;
      const formData = new FormData();

      formData.append("file", {
        name: fileName,
        uri: fileuri,
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

      const cvURL = res.data.secure_url;
      console.log("Image submitted to Cloudinary");

      await updateDoc(doc(db, "users", uid), {
        resumeDetails: arrayUnion({
          fileName: fileName,
          cvURL: cvURL,
          uploadedAt: new Date(),
        }),
      });

      console.log("Details updated in Firestore");
      Alert.alert("Success", "CV uploaded successfully");
      setFileName("");
      setCvFile({});
      fetchResumeDetails(); // Refresh after upload
    } catch (e) {
      Alert.alert("Unable to submit the CV");
      console.log("Unable to submit the CV", e);
    }
  };
 
  const handleDelete=async(resume)=>{
    try{
      console.log("Resume deletion started")
     const useRef = doc(db,'users',uid);

    await updateDoc(useRef,{
      resumeDetails:arrayRemove(resume)
    })
    Alert.alert("Deleted","resume deleted successfully");
    fetchResumeDetails();
    }
    catch(e){
      console.log(e);
      console.log("Resume deleted successfully")
    }
  }
  const handleDownload = async (url, fileName) => {
    try {
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        fileUri
      );
      const { uri } = await downloadResumable.downloadAsync();
      if (uri) {
        console.log("Downloaded to:", uri);
        Alert.alert("Success", "Resume downloaded successfully!");

        // ✅ Ask to open the file
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(uri);
        } else {
          Alert.alert("Note", "Sharing not available on this device.");
        }
      } else {
        throw new Error("Download failed");
      }
    } catch (e) {
      console.log("Error downloading file:", e);
      Alert.alert("Error", "Download failed");
    }
  };

  useEffect(() => {
    fetchResumeDetails();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.innerContainer}>
          <TouchableOpacity style={styles.chooseOuter} onPress={chooseFile}>
            <Text style={styles.chooseText}>Choose a File</Text>
          </TouchableOpacity>
          <Text>{fileName && fileName}</Text>

          <TouchableOpacity
            style={{ backgroundColor: "blue", padding: 10, marginVertical: 10 }}
            onPress={handleSubmit}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>
              Submit CV
            </Text>
          </TouchableOpacity>

          <View style={{ width: "100%", paddingHorizontal: 20 }}>
            {resumeDetails && resumeDetails.length > 0 ? (
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
                  <AntDesign
                    name="pdffile1"
                    color="#000"
                    size={24}
                    style={{ marginRight: 10 }}
                  />
                  <Text style={{ flex: 1 }}>{item.fileName}</Text>
                  <TouchableOpacity
                    style={{
                      padding: 8,
                      borderRadius: 5,
                    }}
                    onPress={() => handleDownload(item.cvURL, item.fileName)}
                  >
                    <AntDesign name="download" color="#000" size={24} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={()=>handleDelete(item)}>
                    <AntDesign name="delete" color="#000" size={24} />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text>No resumes uploaded yet.</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  chooseOuter: {
    borderWidth: 1,
    borderColor: "#6297e0",
    padding: 5,
    borderRadius: 10,
    width: 150,
    height: 30,
    marginVertical: 10,
  },
  chooseText: {
    color: "#6297e0",
    textAlign: "center",
    fontWeight: "bold",
  },
  innerContainer: {
    width: "100%",
    alignItems: "center",
    paddingTop: 20,
  },
});

export default Resume;
