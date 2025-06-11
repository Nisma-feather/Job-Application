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
        <View style={{ position: 'relative',backgroundColor:'blue',width:'100%',height:130 }}>
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
            <Ionicons name="person"  color="white" size={75} />
            </View>
           
          </View>
        </View>

        <View style={styles.profileContainer}>
          <Text style={[styles.profileHeading,styles.profileName]}>{profile?.personalData?.name || 'No Name Found'}</Text>

          <View style={styles.section}>
            <Text style={styles.profileHeading}>About</Text>
            <Text style={styles.text}>
              {profile?.description || 'The word Lorem Ipsum is derived from the Latin word which means “pain itself”. It is a kind of a text filler tool that is used by the webmaster on the website.'}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.profileHeading}>Education</Text>
            {profile.education && profile.education.map((edu, idx) => (
              <View key={idx}>
                <Text style={styles.subheading}>{edu.institute}</Text>
                <Text style={styles.text}>{edu.name}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.profileHeading}>Experience</Text>
            {profile.experience && profile.experience.map((exp, idx) => (
              <View key={idx}>
                <Text style={styles.subheading}>{exp.company}</Text>
                <Text style={styles.text}>{exp.role}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.profileHeading}>Skills</Text>
            <View style={styles.skillContainer}>
              {profile.skills && profile.skills.map((skill, idx) => (
                <View key={idx} style={styles.skillBox}>
                  <Text>{skill}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.profileHeading}>Projects</Text>
            {profile.projects && profile.projects.map((project, idx) => (
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
  )
}

export default UserProfile

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white', // light grey background
  },
  logo: {
    height: 100,
    width: 100,
    resizeMode: 'cover',
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
    marginBottom: -50,
  },
  whiteContainer: {
    height:110,
    width:110,
    position: 'absolute',
    justifyContent:'center',
    alignItems:'center',
    top: 80,
    left:50,
    alignSelf: 'center',
   backgroundColor: '#d5e1f2',
    borderRadius: 60,
    padding: 5,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  profileContainer: {
    marginTop: 50,
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    zIndex:-1
  },
  profileHeading: {
    fontWeight: 'bolder',
    fontSize: 18,
    marginVertical: 15,
    color: "#1f2937",
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    paddingBottom: 5,
  },
  subheading: {
    fontSize: 15,
    fontWeight: "600",
    color: '#374151',
    marginTop: 8,
  },
  text: {
    fontSize: 15,
    color: '#4b5563',
    marginBottom: 5,
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  skillBox: {
    borderWidth: 1,
    borderColor: '#2563EB',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#e0e7ff',
    marginRight: 8,
    marginBottom: 8,
  },
  profileName:{
    fontSize:22,
    color:'#666'
  },
  skillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  }
})
