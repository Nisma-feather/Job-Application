import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, Pressable, Alert, ActivityIndicator, SafeAreaView,FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../firebaseConfig';
import { getDoc, doc, collection, where, query, getDocs, orderBy, limit } from 'firebase/firestore';
import JobCard from './JobCard';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = ({ navigation }) => {
  const [userData, setUserData] = useState({});
  const [recommend, setRecommend] = useState({});
  const [jobs, setJobs] = useState([]);
  const [jobsForYou, setJobsForYou] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const uid = auth.currentUser?.uid;

  const fetchUserData = async () => {
    if (!uid) {
      Alert.alert("User not Found");
      return null;
    }
    try {
      const ref = await getDoc(doc(db, 'users', uid));
      const snapData = ref.data();

      if (!snapData) {
        throw new Error("No user data found");
      }

      return snapData;
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to load user data");
      throw err;
    }
  };

  const format = (recommendData = {}) => {
    const newRecommend = { ...recommendData };

    if (newRecommend.experienceLevel) {
      const exp = newRecommend.experienceLevel;
      newRecommend.experienceLevel =
        exp === 'Entry Level' ? '0 - 1 Year' :
          exp === 'Student' ? 'Fresher' :
            exp === 'Mid Level' ? '2-5 Years' :
              'More than 5 Years';
    }
    console.log(newRecommend)
    return newRecommend;
  };

  const fetchRecommendJobs = async (recommendData) => {
    try {
      const jobRef = collection(db, "jobs");
      const queryConditions = [];

      if (recommendData?.position)
        queryConditions.push(where("jobrole", "==", recommendData.position));
      if (recommendData?.jobType)
        queryConditions.push(where("jobType", "==", recommendData.jobType));
      if (recommendData?.experienceLevel)
        queryConditions.push(
          where("expYear", "==", recommendData.experienceLevel)
        );

      if (!queryConditions.length) return [];

      const q = query(jobRef, ...queryConditions);
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.error("Error fetching recommended jobs:", err);
      return [];
    }
  };
  
  const fetchSkillBasedJobs = async (skills) => {
    try {
      if (!skills || skills.length === 0) return [];

      const q = query(
        collection(db, "jobs"),
        where("skillsRequired", "array-contains-any", skills)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.error("Error fetching skill-based jobs:", err);
      return [];
    }
  };
  
  const fetchLatestJobs = async () => {
    try {
      const q = query(
        collection(db, "jobs"),
        orderBy("postedAt", "desc"),
        limit(5)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.error("Error fetching latest jobs:", err);
      return [];
    }
  };
  
  useEffect(() => {
    const fetchData = async () => {
      if (!uid) return;

      try {
        setLoading(true);
        const userData = await fetchUserData();
        const recommendData = format(userData?.userInterest || {});
        const skills = userData?.skills || [];

        // ✅ 1. Recommended Section
        let recommended = await fetchRecommendJobs(recommendData);
        if (recommended.length === 0) {
          recommended = await fetchSkillBasedJobs(skills);
          if (recommended.length === 0) {
            recommended = await fetchLatestJobs();
          }
        }

        // ✅ 2. Jobs for You Section
        let forYou = await fetchSkillBasedJobs(skills);
        if (forYou.length === 0) {
          forYou = await fetchLatestJobs();
        }

        // Set state
        setUserData(userData);
        setRecommend(recommendData);
        setJobs(recommended); // Recommended Jobs
        setJobsForYou(forYou); // Jobs for You
      } catch (err) {
        console.error("Error loading job data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [uid]);
  
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{error}</Text>
        <TouchableOpacity onPress={() => window.location.reload()}>
          <Text style={{ color: 'blue' }}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }


  return (
    <SafeAreaView style={{flex:1}}>
       <ScrollView 
  contentContainerStyle={{ paddingBottom: 100, backgroundColor: '#fff', flexGrow: 1,}}
  showsVerticalScrollIndicator={false}
>
     

      {/* Recommend Job */}
      <View style={{ padding: 16, backgroundColor: '#f2f7fc', paddingRight: 0 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold',fontFamily:'Poppins-Bold' }}>Recommend Job</Text>
          <Text style={{ color: 'blue', paddingRight: 16 }}>See All</Text>
        </View>
       <ScrollView horizontal showsHorizontalScrollIndicator={false}>
  {jobs.map((job, idx) => (
    <View key={job.id} style={{ marginRight: idx === jobs.length - 1 ? 0 : 10 }}>
      <JobCard item={job} navigation={navigation} />
    </View>
  ))}
</ScrollView>
      </View>

      {/* Promo Section */}
      <View style={{
        backgroundColor: '#eaf0ff',
        margin: 16,
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 8, maxWidth: '70%' }}>
            Boost Your Interview Success with JobBoard Team Tips
          </Text>
          <TouchableOpacity style={{ backgroundColor: '#0a66c2', padding: 8, borderRadius: 8, width: '80%', maxWidth: 120 }}>
            <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>Start Preparing</Text>
          </TouchableOpacity>
        </View>
        <Image
          source={require('../assets/working.png')}
          style={{ width: 110, height: 110, resizeMode: 'contain', position: 'absolute', right: 10 }}
        />
      </View>

      {/* Jobs for You */}
      <View style={{ paddingHorizontal: 16 }}>
        <Text style={{ fontSize: 18, marginBottom: 13, marginTop: 6,fontFamily:'Poppins-Bold'}}>Jobs for you</Text>
        <FlatList
      data={jobsForYou}
      renderItem={({ item }) => <JobCard item={item} />}
      keyExtractor={item => item.id}
      scrollEnabled={false} // Disable independent scrolling
      contentContainerStyle={{ gap: 10 }}
    />
      </View>

    </ScrollView>
    </SafeAreaView>
   
  );
};
export const Customheader=()=>{
  const navigation=useNavigation();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        backgroundColor: "white",
        height: 80,
        shadowOpacity: 0,
      }}
    >
      <Pressable onPress={()=>navigation.openDrawer()}>
        <Ionicons name="menu" size={24} />
      </Pressable>
      <Pressable
        onPressIn={() => navigation.navigate("Find Job")}
        style={{ flex: 1 }}
      >
        <TextInput
          placeholder="Search Jobs..."
          placeholderTextColor="#666"
          editable={false}
          style={{
            backgroundColor: "white",
            borderRadius: 20,
            fontSize: 16,
            paddingVertical: 10,
            paddingHorizontal: 12,
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowOffset: {
              height: 2,
              width: 0,
            },
            shadowRadius: 2,
            elevation: 2,
            margin: 10,
          }}
        />
      </Pressable>
      <Ionicons name="notifications-outline" size={24} />
    </View>
  );
}

export default HomeScreen;