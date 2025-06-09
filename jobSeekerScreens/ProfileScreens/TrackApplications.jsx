import React, { useEffect, useState } from 'react';
import { View, Text, Alert, ScrollView, SafeAreaView, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { auth, db } from '../../firebaseConfig';
import { collection,doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import {Octicons} from '@expo/vector-icons';
const TrackApplications = () => {
  const [applications, setApplications] = useState([]);
  const uid = auth.currentUser?.uid;
  const [loading,setLoading]=useState(false);


  const fetchUserApplication = async () => {
    if (!uid) return;
    setLoading(true)
    try {
      
      const q = query(collection(db, 'jobApplications'), where("userId", '==', uid));
      const SnapData = await getDocs(q);
      const fetchedApplications = [];
      
      for (const Doc of SnapData.docs) {
        try {
          const data = Doc.data();
          
          if (!data.jobId) {
            console.warn("Missing jobId for application:", Doc.id);
            continue; // Skip this iteration instead of returning
          }
          
          // Assuming job details are in a 'jobs' collection
          const jobRef = doc(db, 'jobs', data.jobId);
          const jobSnap = await getDoc(jobRef);
          
          if (!jobSnap.exists()) {
            console.warn("Job not found:", data.jobId);
            continue;
          }
          
          const jobData = jobSnap.data();
          console.log(jobData)
          fetchedApplications.push({
            id: doc.id,
            ...data,
            companyName: jobData.companyName,
            role: jobData.jobrole,
            viewStatus:false // Fixed potential typo (jobrole -> jobRole)
          });
          
        } catch (e) {
          console.error("Error processing application:", Doc.id, e);
          continue;
        }
      }
      setLoading(false)
      setApplications(fetchedApplications);
      
    } catch (e) {
      console.error("Fetch error:", e);
      Alert.alert("Error", "Can't fetch job applications");
    }
  };
  useEffect(() => {
    fetchUserApplication();
  }, [uid]);

  const formatDate = (date) => {
    const jsDate = date.toDate ? date.toDate() : date;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${jsDate.getDate()} ${months[jsDate.getMonth()]} ${jsDate.getFullYear()}`;
  };

  const calculateStep = (job) => {
    const status = job.status;
    if (status === 'viewed') return 2;
    if (status === 'shortlisted' || status === 'notShortlisted') return 3;
    return 1;
  };
console.log(applications)
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{padding:20}}>
        {
          loading ? <ActivityIndicator/> :
        applications.map((job, idx) => {
          const step = calculateStep(job);
          return (
            <View key={idx} style={styles.card}>
              <View style={{flexWrap:'wrap'}}>
              <Text style={styles.title}>{job.role}</Text>
               <View style={{flexDirection:'row',gap:3}}>
                 <Octicons name="square-fill" color="blue" size={15} />
                  <Text style={styles.dateText}>{job.companyName}</Text>
                  <Pressable onPress={()=>{
                    const updatedApplications = [...applications];
  updatedApplications[idx].viewStatus = !(job.viewStatus);
  setApplications(updatedApplications);
                  }}><Text style={{color:'blue'}}>View status</Text></Pressable>
               </View>
               {  job.viewStatus && (<>
              {/* Step 1 - Applied */}
              <View style={styles.stepRow}>
                <StepDot active={step >= 1} />
                <View>
                  <Text style={styles.stepLabel}>Applied</Text>
                  <Text style={styles.dateText}>{formatDate(job.submittedAt)}</Text>
                </View>
              </View>

              {/* Step 2 - Viewed */}
              <View style={styles.stepRow}>
                <StepDot active={step >= 2} />
                <View>
                  <Text style={styles.stepLabel}>Viewed</Text>
                  <Text style={styles.dateText}>{job.viewedAt ? formatDate(job.viewedAt) : '—'}</Text>
                </View>
              </View>

              {/* Step 3 - Shortlisted / Rejected */}
              <View style={styles.stepRow}>
                <StepDot active={step >= 3} />
                <View>
                  <Text style={styles.stepLabel}>
                    {job.status === 'shortlisted' ? 'Shortlisted' : job.status === 'notShortlisted' ? 'Rejected' : '—'}
                  </Text>
                  <Text style={styles.dateText}>{job.statusAt ? formatDate(job.statusAt) : '—'}</Text>
                </View>
              </View>
              </>)
      }
               </View>
        
            </View>
            
          );
        })
      }
      </ScrollView>
    </SafeAreaView>
  );
};

// Dot component
const StepDot = ({ active }) => (
  <View style={styles.dotContainer}>
    <View style={[styles.outerDot, { borderColor: active ? '#60d182' : '#ccc' }]}>
      <View style={[styles.innerDot, { backgroundColor: active ? '#60d182' : '#ccc' }]} />
    </View>
    <View style={[styles.connector, { backgroundColor: active ? '#60d182' : '#ccc' }]} />
  </View>
);

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fa',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 13,
    color: '#666',
  },
  stepRow: {
    flexDirection: 'row',
  },
  dotContainer: {
    alignItems: 'center',
    marginRight: 12,
  },
  outerDot: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  connector: {
    width: 2,
    height: 40,
    marginVertical:6
  },
  stepLabel: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 4,
  },

});

export default TrackApplications;
