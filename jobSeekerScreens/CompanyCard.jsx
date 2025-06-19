import { collection, doc, getDoc,where, getDocs, query, updateDoc, wher,Timestamp } from "firebase/firestore";
import {
  ScrollView,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  Pressable,
  TextInput,
  Alert,
  FlatList,
  SafeAreaView,
  ImageBackground,
} from "react-native";
import { auth, db } from "../firebaseConfig";
import { useEffect, useState } from "react";
import JobCard from "./JobCard";

import {Ionicons,MaterialCommunityIcons,Foundation,FontAwesome,Entypo,EvilIcons,AntDesign} from '@expo/vector-icons';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

// Helper to calculate rating statistics
const calculateRatingStats = (reviews = []) => {
  if (!reviews || reviews.length === 0) return {
    average: 0,
    total: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  };

  const sum = reviews.reduce((acc, review) => acc + review.star, 0);
  const average = sum / reviews.length;
  
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(review => {
    distribution[review.star]++;
  });

  return {
    average: parseFloat(average.toFixed(1)),
    total: reviews.length,
    distribution
  };
};

// Helper to format review time
const formatReviewTime = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const reviewDate = date.toDate ? date.toDate() : new Date(date);
  const diffInHours = Math.floor((now - reviewDate) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now - reviewDate) / (1000 * 60));
    return `${diffInMinutes} min ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hr ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  }
};

// Helper to format large numbers
const formatNumber = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
};

const CompanyCard = ({ route, navigation }) => {
  const { companyUID } = route.params;
  const uid = auth?.currentUser?.uid;
  const [activeTab, setActiveTab] = useState('about');
  const dummyimg = require('../assets/logo.png');
  const logo = require('../assets/logo.png');
  const [jobs, setJobs] = useState([]);
  const reviewNumber = [1, 2, 3, 4, 5];
  const [star, setStar] = useState(0);
  const [review, setReview] = useState({
    star: 0,
    userName: '',
    reviewDescription: '',
    reviewedAt: new Date(),
  });
  const [ratingStats, setRatingStats] = useState({
    average: 0,
    total: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
 
  const bgImg = {
    uri: 'https://media.istockphoto.com/id/511061090/photo/business-office-building-in-london-england.jpg?s=612x612',
  };
  const [company, setCompany] = useState({});

  const fetchCompanyDetails = async () => {
    if (!companyUID) return;
    
    try {
      const ref = doc(db, 'companies', companyUID);
      const SnapShot = await getDoc(ref);
      const companyData = SnapShot.data();
      setCompany(companyData);
      
      // Calculate rating stats
      const stats = calculateRatingStats(companyData?.reviews);
      setRatingStats(stats);
    } catch (e) {
      console.log(e);
    }
  };

  const fetchCompanyJobs = async () => {
    if (!companyUID) return;
    
    try {
      const ref = query(collection(db, 'jobs'), where('companyUID', '==', companyUID));
      const jobSnapshot = await getDocs(ref);
      const fetchedJobs = [];
      
      jobSnapshot.forEach((doc) => {
        fetchedJobs.push({ id: doc.id, ...doc.data() });
      });
      
      setJobs(fetchedJobs);
    } catch (e) {
      console.log(e);
    }
  };

  const fetchUserData = async () => {
    if (!uid) return;
    
    try {
      const ref = doc(db, 'users', uid);
      const snapUserData = await getDoc(ref);
      const userName = snapUserData.data()?.personalData?.name;
      setReview(prev => ({ ...prev, userName }));
    } catch (e) {
      Alert.alert("Error", "Cannot fetch user details");
    }
  };

  useEffect(() => {
    fetchCompanyDetails();
    fetchCompanyJobs();
    fetchUserData();
  }, []);

  const handleReviewSelection = (val) => {
    if (val === star) {
      setStar(0);
      setReview({ ...review, star: 0 });
    } else {
      setStar(val);
      setReview({ ...review, star: val });
    }
  };


  const handlePostReview = async () => {
    if (review.star === 0) {
      Alert.alert("Error", "Please select a star rating");
      return;
    }

    try {
      const exsistingReviews=company.reviews || [];
      const newReview = {
       ...review,
       reviewedAt: Timestamp.now() // Use Firestore Timestamp, not new Date()
     };
     const updatedReview =[...exsistingReviews,newReview]
     const newSum=updatedReview.reduce((acc, review) => acc + review.star, 0);
     const newAvg=newSum/updatedReview.length;
      
      await updateDoc(doc(db, 'companies', companyUID), { reviews: updatedReview, reviewAvg:Math.round(newAvg)});
      
      // Refresh data
      await fetchCompanyDetails();
      
      // Reset form
      setStar(0);
      setReview({
        ...review,
        star: 0,
        reviewDescription: ''
      });
      
      Alert.alert("Success", "Your review has been posted");
    } catch (e) {
      Alert.alert("Error", "Failed to post review");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Top Banner */}
        {/* <View style={{ position: 'relative' }}>
          <ImageBackground
            source={{
              uri: "https://media.istockphoto.com/id/511061090/photo/business-office-building-in-london-england.jpg?s=612x612&w=0&k=20&c=nYAn4JKoCqO1hMTjZiND1PAIWoABuy1BwH1MhaEoG6w=",
            }}
            style={{ height: 200, width: '100%' }}
          >
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'black', opacity: 0.4 }]} />
          </ImageBackground>

          <View style={styles.whiteContainer}>
            <Image source={dummyimg} style={styles.logo} />
          </View>
          
          <View style={styles.headerText}>
            <Text style={styles.role}>{company.companyName}</Text>
            <Text style={styles.company}>IT Technology Solutions</Text>
          </View>
        </View> */}
        <View
          style={{
            position: "relative",
            backgroundColor: "blue",
            width: "100%",
            height: 110,
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
              <Ionicons name="person" color="white" size={75} />
            </View>
          </View>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.role}>{company.companyName}</Text>
          <Text style={styles.company}>IT Technology Solutions</Text>
        </View>

        {/* Tabs */}
        {/* <View style={styles.tabs}>
          {['About', 'Open Jobs', 'Review'].map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab.toLowerCase())}
              style={[styles.tab, activeTab === tab.toLowerCase() && styles.activeTab]}
            >
              <Text style={activeTab === tab.toLowerCase() ? styles.activeTabText : styles.tabText}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View> */}
        {/* tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            onPress={() => setActiveTab("about")}
            style={activeTab === "about" ? styles.activeTab : styles.tab}
          >
            <Text
              style={
                activeTab === "about" ? styles.activeTabText : styles.tabText
              }
            >
              About
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("open jobs")}
            style={activeTab === "open jobs" ? styles.activeTab : styles.tab}
          >
            <Text
              style={
                activeTab === "open jobs"
                  ? styles.activeTabText
                  : styles.tabText
              }
            >
              Open Jobs
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("review")}
            style={activeTab === "review" ? styles.activeTab : styles.tab}
          >
            <Text
              style={
                activeTab === "review" ? styles.activeTabText : styles.tabText
              }
            >
              Review
            </Text>
          </TouchableOpacity>
        </View>

        {/* About Content */}
        {activeTab === "about" && (
          <View style={styles.aboutContainer}>
            <Text style={styles.sectionTitle}>About Company</Text>
            <Text style={styles.description}>
              {company.basicInfo || "No company description available."}
            </Text>

            <View style={styles.infoRow}>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <MaterialCommunityIcons name="web" color="#2969ff" size={24} />
                <Text style={styles.value}>Website</Text>
              </View>
              <Text style={styles.label}>
                {company.website || "www.example.com"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <Ionicons name="location-outline" color="#ffd175" size={24} />
                <Text style={styles.value}>Headquarters</Text>
              </View>
              <Text style={styles.label}>
                {company.locations || "Not specified"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <FontAwesome name="calendar" color="#00cc9c" size={24} />
                <Text style={styles.value}>Founded</Text>
              </View>
              <Text style={styles.label}>{company.startYear || "Unknown"}</Text>
            </View>

            <View style={styles.infoRow}>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <Foundation name="torsos" color="#ff73c9" size={24} />
                <Text style={styles.value}>Size</Text>
              </View>
              <Text style={styles.label}>
                {company.employeeCount || "Not specified"}
              </Text>
            </View>
          </View>
        )}

        {/* Open Jobs Content */}
        {activeTab === "open jobs" && (
          <View style={{ padding: 15 }}>
            {jobs.length===0? <View><Text style={styles.emptyText}>Currently No Job Openings</Text></View>:jobs.map((item, idx) => (
              <JobCard key={idx} item={item} navigation={navigation} />
            ))}
            {/* <FlatList
              data={jobs}
              renderItem={({ item }) => (
                <JobCard item={item} navigation={navigation} />
              )}
              keyExtractor={(item) => item.id}
            /> */}
          </View>
        )}

        {/* Review Content */}
        {activeTab === "review" && (
          <View style={styles.reviewContainer}>
            {/* Rating Summary */}
            {company?.reviews?.length > 0 && (
              <View style={styles.ratingSummaryContainer}>
                <View style={styles.ratingOverview}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={styles.ratingOutOf}>
                      {" "}
                      <Text style={styles.averageRating}>
                        {ratingStats.average}
                      </Text>
                      /5
                    </Text>

                    <AnimatedCircularProgress
                      size={30}
                      width={5}
                      fill={ratingStats.average * 20}
                      tintColor="#FFD700"
                      backgroundColor="#f0f0f0"
                    ></AnimatedCircularProgress>
                  </View>

                  <Text style={styles.totalReviews}>
                    Based on {formatNumber(ratingStats.total)} reviews
                  </Text>

                  <View style={styles.starsContainer}>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <AntDesign
                        key={num}
                        name="star"
                        color={
                          num <= Math.round(ratingStats.average)
                            ? "#FFD700"
                            : "#CCCCCC"
                        }
                        size={22}
                      />
                    ))}
                  </View>
                </View>

                {/* Rating Distribution */}
                <View style={styles.ratingDistribution}>
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <View key={stars} style={styles.ratingBarContainer}>
                      <Text style={styles.ratingLabel}>{stars} star</Text>
                      <View style={styles.ratingBarBackground}>
                        <View
                          style={[
                            styles.ratingBarFill,
                            {
                              width: `${
                                ratingStats.total > 0
                                  ? (ratingStats.distribution[stars] /
                                      ratingStats.total) *
                                    100
                                  : 0
                              }%`,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}
           

            {/* Reviews List */}
            <Text style={styles.reviewSectionTitle}>Employee Reviews</Text>

            {(company?.reviews?.length ?? 0) === 0 ? (
              <View>
                <Text>No Reviews Yet</Text>
              </View>
            ) : (
              company?.reviews?.map((item, idx) => {
                return (
                  <View style={styles.reviewCard} key={idx}>
                    <View style={styles.reviewHeader}>
                      <Text style={styles.reviewerName}>{item.userName}</Text>
                      <Text style={styles.reviewTime}>
                        {formatReviewTime(item.reviewedAt)}
                      </Text>
                    </View>

                    <View style={styles.starContainer}>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <View key={num}>
                          {
                            <AntDesign
                              key={num}
                              name="star"
                              color={item.star >= num ? "#FFD700" : "#CCCCCC"}
                              size={16}
                            />
                          }
                        </View>
                      ))}
                    </View>

                    <Text style={styles.reviewText}>
                      {item.reviewDescription}
                    </Text>
                  </View>
                );
              })
            )}

            {/* <FlatList
              data={company.reviews || []}
              renderItem={({ item }) => (
                <View style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewerName}>{item.userName}</Text>
                    <Text style={styles.reviewTime}>
                      {formatReviewTime(item.reviewedAt)}
                    </Text>
                  </View>

                  <View style={styles.starContainer}>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <View key={num}>
                        {
                          <AntDesign
                            key={num}
                            name="star"
                            color={item.star >= num ? "#FFD700" : "#CCCCCC"}
                            size={16}
                          />
                        }
                      </View>
                    ))}
                  </View>

                  <Text style={styles.reviewText}>
                    {item.reviewDescription}
                  </Text>
                </View>
              )}
              keyExtractor={(item, index) => index.toString()}
            /> */}

            {/* Add Review Section */}
            <View style={styles.addReviewContainer}>
              <Text style={styles.addReviewTitle}>Add Your Review</Text>

              <View style={styles.starRatingContainer}>
                {[1, 2, 3, 4, 5].map((num) => (
                  <Pressable
                    key={num}
                    onPress={() => handleReviewSelection(num)}
                  >
                    {
                      <AntDesign
                        key={num}
                        name="star"
                        color={star >= num ? "#FFD700" : "#CCCCCC"}
                        size={18}
                      />
                    }
                  </Pressable>
                ))}
              </View>

              <TextInput
                multiline
                placeholder="Write your review here..."
                style={styles.reviewInput}
                value={review.reviewDescription}
                onChangeText={(val) =>
                  setReview({ ...review, reviewDescription: val })
                }
              />

              <Pressable style={styles.postButton} onPress={handlePostReview}>
                <Text style={styles.postButtonText}>Post Review</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  emptyText:{
   fontFamily:"Poppins-Medium",
   textAlign:'center'
  },
  banner: {
    height: 200,
    width: "100%",
    justifyContent: "flex-end",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
    opacity: 0.3,
  },
  logoBox: {
    position: "absolute",
    top: 120,
    alignSelf: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    elevation: 5,
  },
  logo: {
    height: 60,
    width: 60,
    resizeMode: "contain",
  },
  headerText: {
    marginTop: 50,
    alignItems: "center",
  },
  role: {
    color: "#333",
    fontSize: 19,
    fontFamily:'Poppins-Bold',
    marginTop:5
  },
  company: {
    color: "#666",
    fontSize: 14,
  },
  whiteContainer: {
    height: 110,
    width: 110,
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    top: 50,
    left: 50,
    alignSelf: "center",
    backgroundColor: "#d5e1f2",
    borderRadius: 60,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  aboutContainer: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  sectionTitle: {
    color: "#111",
    fontSize: 17,
    fontFamily:"Poppins-Bold",
    marginBottom: 10,
  },
  description: {
    color: "#444",
    lineHeight: 20,
    fontFamily:"Poppins-Medium",
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    color: "#555",

    fontFamily:"Poppins-Medium"
  },
  value: {
    color: "#222",
    fontSize:15,
    fontFamily:"Poppins-Bold"
  },
  galleryImage: {
    height: 100,
    width: 100,
    borderRadius: 8,
    marginRight: 10,
  },
  // whiteContainer: {
  //   position: 'absolute',
  //   top: 50,
  //   alignSelf: 'center',
  //   backgroundColor: 'white',
  //   borderRadius: 12,
  //   elevation: 5,
  //   shadowColor: '#000',
  //   shadowOffset: { width: 0, height: 2 },
  //   shadowOpacity: 0.3,
  //   shadowRadius: 4,
  // },
  logo: {
    height: 100,
    width: 100,
    resizeMode: "contain",
  },
  // Review Section Styles
  reviewContainer: {
    padding: 16,
  },
  ratingSummaryContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  ratingOverview: {
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
    justifyContent: "center",
  },
  averageRating: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    marginRight: 4,
  },
  ratingOutOf: {
    fontSize: 16,
    color: "#666",
    fontWeight: "bold",
    marginRight: 16,
  },
  starsContainer: {
    flexDirection: "row",
    marginRight: 16,
    gap: 3,
  },
  totalReviews: {
    fontSize: 14,
    color: "#666",
  },
  ratingDistribution: {
    marginTop: 8,
  },
  ratingBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingLabel: {
    width: 60,
    fontSize: 12,
    color: "#666",
  },
  ratingBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: "hidden",
  },
  ratingBarFill: {
    height: "100%",
    backgroundColor: "#FFD700",
    borderRadius: 4,
  },
  ratingCount: {
    width: 30,
    fontSize: 12,
    color: "#666",
    textAlign: "right",
  },
  reviewSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#000",
  },
  reviewCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  reviewerName: {
    fontWeight: "bold",
    color: "#000",
  },
  reviewTime: {
    color: "#666",
    fontSize: 12,
  },
  starContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  reviewText: {
    color: "#333",
    lineHeight: 20,
  },
  addReviewContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  addReviewTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#000",
  },
  starRatingContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  reviewInput: {
    width: "100%",
    minHeight: 100,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    color: "#333",
    textAlignVertical: "top",
  },
  postButton: {
    backgroundColor: "#1967d2",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  postButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  circularRatingContainer: {
    height: 10,
    width: "100%",
    backgroundColor: "#f0f0f0",
    borderRadius: 5, // Makes it circular
    overflow: "hidden", // Ensures the fill stays within bounds
    marginVertical: 8,
  },
  circularRatingFill: {
    height: "100%",
    backgroundColor: "#FFD700", // Gold color for rating
    borderRadius: 5, // Match container radius
  },
  tabs: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: "#f0f4ff",
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
    paddingVertical: 5,
    backgroundColor: "#fff", // Corrected from "fff"
  },
  tabText: {
    color: "#3d77ff",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  activeTab: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,

    backgroundColor: "#3d77ff",
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 14,
  },

});

export default CompanyCard;