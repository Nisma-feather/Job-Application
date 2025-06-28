import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  ScrollView,
  View,
  SafeAreaView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Pressable,
  ActivityIndicator,
} from "react-native";
import {
  Ionicons,
  Octicons,
  MaterialCommunityIcons,
  Feather,
  MaterialIcons,
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import * as DocumentPicker from "expo-document-picker";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import axios from "axios";

const ProfileScreen = () => {
  const CLOUDINARY_UPLOAD_PRESET = "unsigned_preset";
  const CLOUDINARY_CLOUD_NAME = "dkxi9qvpw";

  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [personalData, setPersonalData] = useState({});
  const navigation = useNavigation();
  const uid = auth.currentUser?.uid;

  const fetchUserDetails = async () => {
    if (!uid) return;
    setLoading(true);
    try {
      const ref = await getDoc(doc(db, "users", uid));
      if (ref.exists()) {
        const data = ref.data().personalData;
        setPersonalData(data);
      }
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Failed to fetch user details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [uid]);

  // Refetch when new imageUrl is uploaded
  useEffect(() => {
    if (imageUrl) {
      fetchUserDetails();
    }
  }, [imageUrl]);

  const chooseFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setImage(file);

        Alert.alert(
          "Edit Profile Image",
          `Are you sure want to update the profile image ${file.name}?`,
          [
            { text: "Cancel", style: "cancel" },
            { text: "OK", onPress: () => submitProfile(file) },
          ]
        );
      }
    } catch (e) {
      Alert.alert("Couldn't select image", e.message);
    }
  };

  const submitProfile = async (file) => {
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || "image/jpeg",
      });
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const resUrl = res.data.secure_url;
      setImageUrl(resUrl);

      await updateDoc(doc(db, "users", uid), {
        personalData: {
          ...personalData,
          imageUrl: resUrl,
        },
      });
    } catch (e) {
      console.error(e);
      Alert.alert("Upload Failed", "Could not update profile image.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "OK",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut(auth);
            navigation.replace("Login");
          } catch (e) {
            Alert.alert("Error", "Logout failed.");
          }
        },
      },
    ]);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.profileSection}>
          <View style={styles.imageContainer}>
            {personalData.imageUrl ? (
              <Image
                source={{ uri: personalData.imageUrl }}
                style={styles.profileImage}
              />
            ) : (
              <View style={[styles.profileImage, styles.placeholder]}>
                <Ionicons name="person" color="white" size={50} />
              </View>
            )}
            <Pressable style={styles.editIcon} onPress={chooseFile}>
              <MaterialIcons name="edit" color="#333" size={22} />
            </Pressable>
          </View>
          <View style={{ marginLeft: 20, justifyContent: "center" }}>
            <Text style={styles.nameText}>{personalData?.name || "User"}</Text>
            <Text style={styles.designationText}>Web Designer</Text>
          </View>
        </View>
      ),
    });
  }, [navigation, personalData.imageUrl]);

  return (
    <SafeAreaView style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#3b4b5e" />
          <Text style={styles.loadingText}>Please wait...</Text>
        </View>
      )}
      <ScrollView contentContainerStyle={{ padding: 15 }}>
        <View style={styles.sections}>
          <TouchableOpacity
            style={styles.sectionItem}
            onPress={() => navigation.navigate("PersonalInfo")}
          >
            <View style={styles.headindContainer}>
              <Octicons name="person-add" color="#6297e0" size={24} />
              <Text style={styles.sectionText}>Personal Information</Text>
            </View>
            <Text style={{ color: "#3a7bd6" }}>Add +</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sectionItem}
            onPress={() => navigation.navigate("Education")}
          >
            <View style={styles.headindContainer}>
              <Octicons name="book" color="#6297e0" size={24} />
              <Text style={styles.sectionText}>Education Details</Text>
            </View>
            <Text style={{ color: "#3a7bd6" }}>Add +</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sectionItem}
            onPress={() => navigation.navigate("Skills")}
          >
            <View style={styles.headindContainer}>
              <Octicons name="file-badge" color="#6297e0" size={24} />
              <Text style={styles.sectionText}>Skills</Text>
            </View>
            <Text style={{ color: "#3a7bd6" }}>Add +</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sectionItem}
            onPress={() => navigation.navigate("Experience")}
          >
            <View style={styles.headindContainer}>
              <MaterialCommunityIcons
                name="hexagon-slice-3"
                color="#6297e0"
                size={24}
              />
              <Text style={styles.sectionText}>Experience</Text>
            </View>
            <Text style={{ color: "#3a7bd6" }}>Add +</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sectionItem}
            onPress={() => navigation.navigate("Projects")}
          >
            <View style={styles.headindContainer}>
              <Feather name="pie-chart" color="#6297e0" size={24} />
              <Text style={styles.sectionText}>Projects</Text>
            </View>
            <Text style={{ color: "#3a7bd6" }}>Add +</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sectionItem}
            onPress={() => navigation.navigate("Track Application")}
          >
            <View style={styles.headindContainer}>
              <Ionicons name="document-text" color="#6297e0" size={24} />
              <Text style={styles.sectionText}>Track Application</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sectionItem}
            onPress={() => navigation.navigate("Resume")}
          >
            <View style={styles.headindContainer}>
              <Ionicons name="document-text" color="#6297e0" size={24} />
              <Text style={styles.sectionText}>Resume</Text>
            </View>
            <Text style={{ color: "#3a7bd6" }}>Add +</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sectionItem} onPress={handleLogout}>
            <View style={styles.headindContainer}>
              <Ionicons name="log-out-outline" color="#6297e0" size={24} />
              <Text style={styles.sectionText}>Log Out</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  imageContainer: {
    width: 110,
    height: 110,
    padding: 10,
    borderWidth: 1,
    borderColor: "#d7e3f3",
    borderRadius: 60,
    position: "relative",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
    resizeMode: "cover",
  },
  placeholder: {
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 4,
    height: 40,
    width: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowOffset: { height: 1, width: 0 },
    shadowRadius: 5,
  },
  nameText: {
    color: "#3b4b5e",
    fontSize: 18,
    fontWeight: "bold",
  },
  designationText: {
    color: "#5c93df",
    fontSize: 16,
  },
  sections: {
    marginTop: 20,
    gap: 15,
  },
  sectionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#f0f5fc",
    borderRadius: 5,
    backgroundColor: "#f9fafe",
  },
  headindContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sectionText: {
    fontSize: 14,
    color: "#3b4b5e",
    fontWeight: "600",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
});
