import React, {
  useEffect,
  useState,
  useLayoutEffect,

} from "react";
import { SafeAreaView, View, Text, ActivityIndicator, StyleSheet, ScrollView, Image, Pressable, TextInput, TouchableOpacity, Alert } from 'react-native'
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Linking } from "react-native";
import * as DocumentPicker from 'expo-document-picker'
import axios from "axios";

const CompanyProfile = ({ navigation }) => {
  const CLOUDINARY_UPLOAD_PRESET = "unsigned_preset";
  const CLOUDINARY_CLOUD_NAME = "dkxi9qvpw";
  const [profile, setProfile] = useState({});
  const [imageName, setImageName] = useState("");
  const [imageurl, setImageUrl] = useState("");
  const [image, setImage] = useState();
  const [loading, setLoading] = useState(false);
  const uid = auth.currentUser?.uid;
  const fetchCompanay = async () => {
    setLoading(true);

    // || "vm5dkIUfk0WxgnXT34QBttxA3kV2";

    if (!uid) {
      console.warn("No user UID found");
      setLoading(false);
      return;
    }

    try {
      const snap = await getDoc(doc(db, "companies", uid));
      console.log(snap);
      if (snap.exists()) {
        setProfile(snap.data());
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.log("Error fetching company:", error);
    }

    setLoading(false);
  };
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
          "Profile Update",
          `Do you want to update your logo with ${file.name}`,
          [
            {
              text: "Ok",
              onPress: () => handleUpdate(),
            },
            {
              text: "Cancel",
              style: "cancel",
            },
          ]
        );
      }
    } catch (e) {
      console.log("unable to pick image or image picker canceled");
    }
  };
  const handleUpdate = async () => {
    console.log("trying to update")
    if (!image) return;
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", {
        name: image.name,
        uri: image.uri,
        type: image.mimeType,
      });
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      const cloudRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const resUrl = cloudRes.data.secure_url;
      setImageUrl(resUrl);
      console.log("upload in cloudinary syuccessfully secure url ",resUrl)
      const ref = await updateDoc(doc(db, "companies", uid), {
        ...profile,
        profileImg: resUrl,
      });
      console.log("Updated profile successfully")
      fetchCompanay();
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };
  useLayoutEffect(() => {
    navigation.setOptions({
      title: profile.companyName,
    });
  }, [navigation, profile]);
  useFocusEffect(
    React.useCallback(() => {
      fetchCompanay();
    }, [])
  );

  console.log(profile);

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#0a66c2" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Header Banner */}
          <View style={styles.banner}>
            <View style={styles.avatarContainer}>
              {profile.profileImg ? (
                <Image
                  source={{ uri: profile.profileImg }}
                  style={styles.profileImage}
                />
              ) : (
                <Ionicons name="business" size={70} color="white" />
              )}

              <Pressable onPress={chooseFile} style={styles.editContainer}>
                <MaterialIcons name="edit" size={18} color="#222" />
              </Pressable>
            </View>
          </View>
          {/* Company Info */}
          <View style={styles.content}>
            <Text style={styles.name}>{profile.companyName}</Text>
            <Text style={styles.subtitle}>{profile?.shortDescription}</Text>

            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.sectionText}>
                {profile.basicInfo || "N/A"}
              </Text>

              <Text style={styles.sectionTitle}>Website</Text>
              {profile.website ? (
                <Pressable onPress={() => Linking.openURL(profile.website)}>
                  <Text
                    style={[
                      styles.sectionText,
                      { color: "blue", textDecorationLine: "underline" },
                    ]}
                  >
                    {profile.website}
                  </Text>
                </Pressable>
              ) : (
                <Text style={styles.sectionText}>N/A</Text>
              )}
              <Text style={styles.sectionTitle}>Location</Text>
              <Text style={styles.sectionText}>
                {profile.locations || "N/A"}
              </Text>

              <Text style={styles.sectionTitle}>Established Year</Text>
              <Text style={styles.sectionText}>
                {profile.startYear || "N/A"}
              </Text>

              <Text style={styles.sectionTitle}>Employee Count</Text>
              <Text style={styles.sectionText}>
                {profile.employeeCount || "N/A"}
              </Text>
            </View>

            {/* Edit Button */}
            <Pressable
              style={styles.editBtn}
              onPress={() => navigation.navigate("Profile edit")}
            >
              <Feather name="edit" size={18} color="#0a66c2" />
              <Text style={styles.editText}>Edit Profile</Text>
            </Pressable>
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
  scroll: {
    paddingBottom: 40,
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
    resizeMode: "cover",
  },
  banner: {
    backgroundColor: "#0a66c2",
    height: 130,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 10,
  },
  avatarContainer: {
    backgroundColor: "#d5e1f2",
    borderRadius: 60,
    width: 110,
    height: 110,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    position: "absolute",
    top: 50,
    zIndex: 1,
  },
  editContainer: {
    backgroundColor: "#fff",
    borderRadius: 60,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    position: "absolute",
    top: 30,
    left: 80,
    zIndex: 1,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 3,
    shadowOffset: {
      height: 3,
      width: 2,
    },
    elevation: 2,
  },
  content: {
    marginTop: 70,
    paddingHorizontal: 20,
  },
  name: {
    fontSize: 22,
    fontFamily: "Poppins-Bold",
    textAlign: "center",
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    fontFamily: "Poppins-Regular",
    color: "#666",
    marginBottom: 20,
  },
  infoSection: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  sectionTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 16,
    color: "#444",
    marginTop: 10,
  },
  sectionText: {
    color: "#333",
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    marginTop: 2,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    marginTop: 20,
  },
  editText: {
    marginLeft: 6,
    color: "#0a66c2",
    fontWeight: "600",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CompanyProfile