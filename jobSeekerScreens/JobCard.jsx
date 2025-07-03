import React, { useEffect, useState,useCallback } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Ionicons, Entypo,FontAwesome, MaterialCommunityIcons,AntDesign } from '@expo/vector-icons';
import { auth, db } from '../firebaseConfig'; // Adjust the path as needed
import {
  collection, query, where, getDocs, addDoc, deleteDoc, doc,
  getDoc
} from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';


const dummyimg = require('../assets/logo.png'); // Replace with actual image path

const JobCard = ({ item }) => {
  console.log(item)
  const navigation = useNavigation();
  const [logo,setLogo]=useState("");
  const [reviewAvg,setReviewAvg]=useState(0);
  const [bookmarkJobs, setBookmarkJobs] = useState([]);
  const uid = auth.currentUser?.uid;

  const fetchBookMarks = async () => {
    try {
      const q = query(collection(db, 'bookmarks'), where("userId", "==", uid));
      const bookmarkSnap = await getDocs(q);
      const bookmarks = bookmarkSnap.docs.map((bookmark) => bookmark.data().jobId);
      setBookmarkJobs(bookmarks);
    } catch (e) {
      console.error("Failed to fetch bookmarks:", e);
    }
  };
  const fetchReviews=async()=>{
    const snapData=await getDoc(doc(db,'companies',item.companyUID));
    console.log(snapData.data());
    setReviewAvg(snapData.data()?.reviewAvg);


  }
  const fetchCompany=async()=>{
    const ref=await getDoc(doc(db,'companies',item.companyUID));
    console.log("Fetching logo",ref)
    const profileImage=ref.data()?.profileImg;
    setLogo(profileImage)
    

  }

  const handletoggleBookmark = async (jobId) => {
    try {
      const q = query(
        collection(db, 'bookmarks'),
        where('userId', '==', uid),
        where('jobId', '==', jobId)
      );
      const bookmarkSnap = await getDocs(q);


      if (!bookmarkSnap.empty) {
        await deleteDoc(doc(db, 'bookmarks', bookmarkSnap.docs[0].id));
        const updated = bookmarkJobs.filter((id) => id !== jobId);
        setBookmarkJobs(updated);
      } else {
        await addDoc(collection(db, 'bookmarks'), { userId: uid, jobId });
        setBookmarkJobs([...bookmarkJobs, jobId]);
      }
    } catch (e) {
      console.log("Bookmark toggle error:", e);
    }
  };
  const formatDate = (timeStamp) => {
    if (!timeStamp) return '';
    if (!timeStamp) return '';

  const postedDate = timeStamp.toDate();
  const now = new Date();
  const differenceDate = Math.floor((now - postedDate) / (1000 * 60 * 60 * 24));

  if (differenceDate === 0) {
    const diffHours = Math.floor((now - postedDate) / (1000 * 60 * 60));
    
    if (diffHours === 0) {
      const diffMinutes = Math.floor((now - postedDate) / (1000 * 60));
      return diffMinutes <= 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
    }

    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  }

  return differenceDate === 1 ? '1 day ago' : `${differenceDate} days ago`;

  }
  useEffect(() => {
    fetchBookMarks();
    fetchReviews();
  }, []);
console.log(reviewAvg)
useFocusEffect(
  useCallback(() => {
    fetchBookMarks();
    fetchCompany(); 
    fetchReviews(); // re-fetch to reflect latest bookmarks
  }, [])
);
console.log("logo",logo)
  return (
    <Pressable onPress={() => navigation.navigate("Job Details", { currentJob: item })}>
      <View style={styles.jobItem}>
      <View style={{flexDirection:'row',justifyContent:'space-between'}}>
        <View style={{flexDirection:"row",gap:10,}}>
          
            <View style={{width:45,height:45,borderWidth:1,borderColor:'#dedede',justifyContent:'center',alignItems:'center',borderRadius:6,}}>
          <Image source={logo?{uri:logo}:dummyimg} style={styles.logo} />
          </View>
         
          <View style={{justifyContent:'space-between'}}>
            <Text style={styles.jobTitle}>{item.jobrole}</Text>
            <View style={{flexDirection:'row',gap:3}}>
            <Text style={styles.companyName}>{item.companyName}</Text>
            
            <FontAwesome style={{marginTop:2}} name="star"  color="#FFD700"  size={14} />
            <Text style={{fontSize:10,fontWeight:'500',color:"#777"}}>{(reviewAvg && reviewAvg > 0 )? `${reviewAvg}.0 Review` : "No Reviews"}</Text>

            </View>
            

          </View>

          </View>
          
          <Pressable style={styles.bookmarkIcon} onPress={() => handletoggleBookmark(item.id)}>
            <Ionicons name={bookmarkJobs.includes(item.id) ? "bookmark" : "bookmark-outline"} color="#4B9CD3"  size={24} />
          </Pressable>

        </View>
        <View style={{flexDirection:'row',gap:8}}>
          <View style={{paddingVertical:5,paddingHorizontal:12,backgroundColor:"#e8f0fb",borderRadius:5}}>
           <Text style={{fontWeight:'bold',fontSize:10,fontFamily:'Poppins-Medium',color:"#555",}}>{item.jobType}</Text>
          </View>
          <View style={{paddingVertical:5,paddingHorizontal:12,backgroundColor:"#e8f0fb",borderRadius:5}}>
            <Text style={{fontWeight:'bold',fontSize:10,fontFamily:'Poppins-Medium',color:"#555"}}>{item.jobMode}</Text>
          </View>
        </View>
        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:"center",height:35,borderTopColor:'#dedede',borderTopWidth:1}}>
          <View style={styles.metaRow}>
            <Entypo name="location-pin" color="#9ca4b5" size={18} />
            <Text style={styles.metaText}>{item.locations}</Text>
          </View>
          <Text style={styles.metaText}>
            {formatDate(item.postedAt)}
          </Text>

        </View>
      </View>


    </Pressable>
  );
};

const styles = StyleSheet.create({
  jobItem: {
    minWidth:250,
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.25,
  shadowRadius: 6,
  elevation: 5,
    marginVertical:6,
    marginHorizontal:10,
    gap:14,
    marginBottom:15,
    minWidth:280,
    maxWidth:500
  },
  logo: {
    flexDirection:'row',
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  jobTitle: {
    fontSize: 13,
    color: '#333',
    fontFamily:"Poppins-Bold"
  },
  companyName: {
    fontSize: 12,
 
    color:"#5c88ea",

    marginBottom: 4,
    marginRight:15,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#7a86a1',
    marginLeft: 4,
    
  },
  bookmarkIcon: {
   marginRight:8
  },

});

export default JobCard;
