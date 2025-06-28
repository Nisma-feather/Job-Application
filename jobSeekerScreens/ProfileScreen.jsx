import React, { useEffect, useLayoutEffect, useState } from 'react';
import { ScrollView,View, Text, StyleSheet, TouchableOpacity, Image, Alert, Pressable } from 'react-native';
import { Ionicons,Octicons,MaterialCommunityIcons,Feather,MaterialIcons} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import * as DocumentPicker from 'expo-document-picker'
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';



const ProfileScreen = () => {
  const CLOUDINARY_UPLOAD_PRESET = "unsigned_preset";
  const CLOUDINARY_CLOUD_NAME = "dkxi9qvpw";

  const [loading,setLoading]=useState(false)
  const [image,setImage]=useState();
  const [personalData,setPersonalData]=useState({})
  const [imageName,setImageName]=useState("")
  const [imageUrl,setImageUrl]=useState("")
  const navigation = useNavigation();
  const profileImage = null; 
  const uid=auth.currentUser?.uid
  const fetchUserDetails=async()=>{
    try{
      setLoading(true)
      const ref=await getDoc(doc(db,'users',uid));
      if(ref.exists()){
        const data=ref.data().personalData ;
        console.log("data",data)
        setPersonalData(data)
     
      }

    }
    catch(e){
      console.log(e)
    }
    finally{
      setLoading(false)
    }
   

  }
  const handleLogout=async()=>{
    Alert.alert(
      "Log out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "OK",
          onPress:()=>PerformLogout(),
          style: "destructive"
        }
      ]

    )
    const PerformLogout=async()=>{
      try{
        await signOut(auth);
        navigation.replace("Login");
      }
      catch(e){
        console.error("Error signing out:", e);
        Alert.alert("Error", "Failed to log out. Please try again."); 
      }
    }
    

  }// Fetch from Firestore if available
  const chooseFile=async()=>{
    try{
     const result= await DocumentPicker.getDocumentAsync({
        type:"*/*",
        copyToCacheDirectory:true
      })
      console.log(result)
      if(!result.canceled && result.assets && result.assets.length>0){
        const file=result.assets[0];
        setImage(file);
        setImageName(file.name)

        Alert.alert(
          "Edit Profile Image",
          `Are you sure want to update the profile image ${file.name}`,
          [
            {
              text: "Ok",
              onPress: submitProfile,
            },
            { text: "Cancel", style: "cancel" },
          ]
        );
        
      }
      else{
        console.log("Document picker is canceled")
      }
    }
    catch(e){
      Alert.alert("Can't able to select the image")
    }
  }
  const submitProfile = async () => {
    console.log("trying to submit")
    if (!image) return;

    try {
      setLoading(true)
      const formData = new FormData();
      formData.append("file", {
        uri: image.uri,
        name: image.name,
        type: image.mimeType // or based on your file type
      });
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Clodinary Response",res)

      const resUrl = res.data.secure_url;
      setImageUrl(resUrl);

      const response=await updateDoc(doc(db, "users", uid), {
        personalData: {
          ...personalData,
          imageUrl: resUrl,
        },
      });

      console.log("Update successful");
      fetchUserDetails();
    } catch (e) {
      console.error("Image upload failed:", e);
      Alert.alert("Error", "Failed to upload profile image.");
    }
    finally{
      setLoading(false)
    }
  };
  
  
  useEffect(()=>{
 fetchUserDetails();
  },[uid])

 
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
            <Text
              style={{
                color: "#3b4b5e",
                fontFamily: "Poppins-Bold",
                fontSize: 18,
              }}
            >
              {personalData?.name}
            </Text>
            <Text
              style={{
                color: "#5c93df",
                fontFamily: "Poppins-Bold",
                fontSize: 16,
              }}
            >
              Web Designer
            </Text>
          </View>
        </View>
      ),
    });
  }, [navigation, personalData.imageUrl]);
 
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {loading ? (
          <View>
            <Text>Loading....</Text>
          </View>
        ) : (
          <View style={{ padding: 15 }}>
            <View style={styles.sections}>
              <TouchableOpacity
                style={styles.sectionItem}
                onPress={() => navigation.navigate("PersonalInfo")}
              >
                <View style={styles.headindContainer}>
                  <Octicons
                    name="person-add"
                    color="#6297e0"
                    size={24}
                    style={{}}
                  />
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
              <TouchableOpacity
                style={styles.sectionItem}
                onPress={() => handleLogout()}
              >
                <View style={styles.headindContainer}>
                  <Ionicons name="document-text" color="#6297e0" size={24} />
                  <Text style={styles.sectionText}>Log Out</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  profileSection: {
    flexDirection: "row",
    margin:0,
  },
  imageContainer: {
    width: 110,
    height: 110,
    padding: 10,
    borderWidth: 1,
    borderColor: "#d7e3f3",
    borderRadius: "50%",
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
    borderRadius: "50%",
    padding: 4,
    height: 40,
    width: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowOffset: {
      height: 1,
      width: 0,
    },
    shadowRadius: 5,
  },
  sections: {
    marginTop: 30,
    gap: 15,
  },
  sectionItem: {
    flexDirection: "row",
    justifyContent: "space-between", // pushes left and right sections apart
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderWidth: 1, // use number, not string
    borderColor: "#f0f5fc",
    borderRadius: 5,
    shadowColor: "#6297e0",
    shadowOpacity: 0.2,
    shadowOffset: {
      width: 2,
      height: 2,
    },
  },
  headindContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sectionText: {
    fontSize: 14,
    color: "#3b4b5e",
    fontFamily: "Poppins-Bold",
  },
});

export const ProfileHeader=()=>{
  return (
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
          <MaterialIcons name="edit" color="#444" size={22} />
        </Pressable>
      </View>
    </View>
  );
}
