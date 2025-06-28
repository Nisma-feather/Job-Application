import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { db } from '../firebaseConfig';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  ImageBackground,
  Image,
  ScrollView,
} from "react-native";

import { Ionicons } from '@expo/vector-icons';

const UserProfile = ({ route }) => {
  const { uid } = route.params;
  const [profile, setProfile] = useState({});
  const [educations, setEducations] = useState([])

  const fetchUserData = async () => {
    if (!uid) {
      return
    }
    try {
      const snapdata = await getDoc(doc(db, 'users', uid));
      console.log(snapdata.data())
      setProfile(snapdata.data())
      setEducations(snapdata.data().education);

    }
    catch (e) {

    }
  }
  useEffect(() => {
    fetchUserData()
  }, [])
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View
          style={{
            position: "relative",
            backgroundColor: "blue",
            width: "100%",
            height: 130,
          }}
        >
          {/* <ImageBackground
            source={{
              uri: "https://media.istockphoto.com/id/511061090/photo/business-office-building-in-london-england.jpg?s=612x612&w=0&k=20&c=nYAn4JKoCqO1hMTjZiND1PAIWoABuy1BwH1MhaEoG6w=",
            }}
            style={{ height: 200, width: '100%' }}
          >
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'black', opacity: 0.4 }]} />
          </ImageBackground> */}

          <View style={styles.whiteContainer}>
            {/* <Image source={require("../assets/user.png")} style={styles.logo} /> */}
            <View>
              {profile?.personalData?.profileImg ? (
                <Image
                  source={{ uri: profile.personalData?.profileImg }}
                  style={styles.logo}
                />
              ) : (
                <Ionicons name="person" color="#555" size={75} />
              )}
            </View>
          </View>
        </View>

        <View style={styles.profileContainer}>
          <Text style={[styles.profileHeading, styles.profileName]}>
            {profile?.personalData?.name || null }
          </Text>

          <View style={styles.section}>
            <Text style={styles.profileHeading}>About</Text>
            <Text style={styles.text}>
              {profile?.description ||
                "The word Lorem Ipsum is derived from the Latin word which means “pain itself”. It is a kind of a text filler tool that is used by the webmaster on the website."}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.profileHeading}>Education</Text>
            {profile.education &&
              profile.education.map((edu, idx) => (
                <View key={idx}>
                  <Text style={styles.subheading}>{edu.institute}</Text>
                  <Text style={styles.text}>{edu.name}</Text>
                </View>
              ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.profileHeading}>Experience</Text>
            {profile.experience &&
              profile.experience.map((exp, idx) => (
                <View key={idx}>
                  <Text style={styles.subheading}>{exp.company}</Text>
                  <Text style={styles.text}>{exp.role}</Text>
                </View>
              ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.profileHeading}>Skills</Text>
            <View style={styles.skillContainer}>
              {profile.skills &&
                profile.skills.map((skill, idx) => (
                  <View key={idx} style={styles.skillBox}>
                    <Text style={{fontSize:13}}>{skill}</Text>
                  </View>
                ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.profileHeading}>Projects</Text>
            {profile.projects &&
              profile.projects.map((project, idx) => (
                <View key={idx}>
                  <Text style={styles.subheading}>{project.title}</Text>
                  <Text style={styles.text}>{project.description}</Text>
                  <Text style={styles.text}>{project.technologies}</Text>
                </View>
              ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default UserProfile

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  whiteContainer: {
    height: 120,
    width: 120,
    borderRadius: 60,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 80,
    alignSelf: "center",
    borderWidth: 4,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  logo: {
    height: 100,
    width: 100,
    borderRadius: 50,
    resizeMode: "cover",
  },
  profileContainer: {
    marginTop: 80,
    paddingHorizontal: 20,
    paddingTop: 40,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  profileHeading: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 6,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 20,
    color: "#374151",
  },
  section: {
    marginBottom: 20,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  subheading: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  text: {
    fontSize: 13,
    color: "#4b5563",
    lineHeight: 22,
    marginBottom: 6,
  },
  skillContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  skillBox: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#e0e7ff",
    borderColor: "#3b82f6",
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
});
