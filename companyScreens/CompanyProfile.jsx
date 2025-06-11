import React, {
  useEffect,
  useState,
  useLayoutEffect,
  ImageBackground,
} from "react";
import { SafeAreaView, View, Text, ActivityIndicator, StyleSheet, ScrollView, Image, Pressable, TextInput, TouchableOpacity } from 'react-native'
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { Ionicons,Feather} from '@expo/vector-icons';

const CompanyProfile = ({ navigation }) => {
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(false);
  const fetchCompanay = async () => {
    setLoading(true);
    const uid = auth.currentUser?.uid ;
    // || "vm5dkIUfk0WxgnXT34QBttxA3kV2";

    if (!uid) {
      console.warn("No user UID found");
      setLoading(false);
      return;
    }

    try {
      const snap = await getDoc(doc(db, 'companies', uid));
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
    useLayoutEffect(()=>{
     navigation.setOptions({
        title:profile.companyName
     })
    },[navigation,profile])
  useEffect(() => {
    fetchCompanay();
  }, [])
  console.log(profile)

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
            <Ionicons name="business" size={70} color="white" />
          </View>
        </View>

        {/* Company Info */}
        <View style={styles.content}>
          <Text style={styles.name}>{profile.companyName}</Text>
          <Text style={styles.subtitle}>Building the future, one line at a time.</Text>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.sectionText}>{profile.basicInfo || 'N/A'}</Text>

            <Text style={styles.sectionTitle}>Website</Text>
            <Text style={styles.sectionText}>{profile.website || 'N/A'}</Text>

            <Text style={styles.sectionTitle}>Location</Text>
            <Text style={styles.sectionText}>{profile.locations || 'N/A'}</Text>

            <Text style={styles.sectionTitle}>Established Year</Text>
            <Text style={styles.sectionText}>{profile.startYear || 'N/A'}</Text>

            <Text style={styles.sectionTitle}>Employee Count</Text>
            <Text style={styles.sectionText}>{profile.employeeCount || 'N/A'}</Text>
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
    backgroundColor: '#fff',
  },
  scroll: {
    paddingBottom: 40,
  },
  banner: {
    backgroundColor: '#0a66c2',
    height: 130,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 10,
  },
  avatarContainer: {
    backgroundColor: '#d5e1f2',
    borderRadius: 60,
    width: 110,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    position: 'absolute',
    top: 50,
    zIndex: 1,
  },
  content: {
    marginTop: 70,
    paddingHorizontal: 20,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  infoSection: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize:16,
    color: '#444',
    marginTop: 10,
  },
  sectionText: {
    color: '#333',
    fontSize: 14,
    marginTop: 2,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 20,
  },
  editText: {
    marginLeft: 6,
    color: '#0a66c2',
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CompanyProfile