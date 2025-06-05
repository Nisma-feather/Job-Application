import { doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Alert, FlatList, Pressable, TextInput } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { Ionicons, Entypo, MaterialCommunityIcons, AntDesign, Foundation,FontAwesome} from '@expo/vector-icons';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

const JobDetail = ({ route, navigation }) => {
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

  const { currentJob } = route.params;
  console.log(currentJob.companyUID)
  const [company, setCompany] = useState({});
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
  const [activeTab, setActiveTab] = useState('description');
  console.log(currentJob)
  const fetchCompany = async () => {
    const ref = doc(db, 'companies', currentJob.companyUID);
    const companySnap = await getDoc(ref);
    if (companySnap.exists()) {
      const companyData = companySnap.data();
      setCompany(companyData);
      // Calculate rating stats
      const stats = calculateRatingStats(companyData?.reviews);
      setRatingStats(stats);

    }

  }
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
  const fetchUserData = async () => {
    const uid = auth.currentUser?.uid;
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
    fetchCompany();
    fetchUserData();
  }, [])
  const handleReviewSelection = (val) => {
    if (val === star) {
      setStar(0);
      setReview({ ...review, star: 0 });
    } else {
      setStar(val);
      setReview({ ...review, star: val });
    }
  };
  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const handlePostReview = async () => {
    console.log("trying to post")
    if (review.star === 0) {
      Alert.alert("Error", "Please select a star rating");
      return;
    }

    try {
      const exsistingReviews = company.reviews || [];
      const newReview = {
        ...review // Use Firestore Timestamp, not new Date()
      };
      const updatedReview = [...exsistingReviews, newReview]
      const newSum = updatedReview.reduce((acc, review) => acc + review.star, 0);
      const newAvg = newSum / updatedReview.length;

      await updateDoc(doc(db, 'companies', currentJob.companyUID), { reviews: updatedReview, reviewAvg: Math.round(newAvg) });

      // Refresh data
      await fetchCompany();

      // Reset form
      setStar(0);
      setReview({
        ...review,
        star: 0,
        reviewDescription: ''
      });
      console.log("review posted successfully");
      Alert.alert("Success", "Your review has been posted");
    } catch (e) {
      console.log(e)
      Alert.alert("Error", "Failed to post review");
    }
  };
  console.log(activeTab)
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Top Job Card */}
        <View style={styles.jobCard}>
          <View style={styles.jobInfo}>
            <Text style={styles.role}>{currentJob.jobrole}</Text>
            <Text style={styles.location}>{currentJob.locations}</Text>
            <View style={styles.tags}>
              {currentJob.jobType && <Text style={styles.tag}>{currentJob.jobType}</Text>}
              {currentJob.jobMode && <Text style={styles.tag}>{currentJob.jobMode}</Text>}
              <Text style={styles.tag}>{currentJob.jobrole}</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}

      <View style={styles.tabs}>
  <TouchableOpacity
    onPress={() => setActiveTab('description')}
    style={activeTab === 'description' ? styles.activeTab : styles.tab}
  >
    <Text style={activeTab === 'description' ? styles.activeTabText : styles.tabText}>
      Job Description
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    onPress={() => setActiveTab('company')}
    style={activeTab === 'company' ? styles.activeTab : styles.tab}
  >
    <Text style={activeTab === 'company' ? styles.activeTabText : styles.tabText}>
      Company
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    onPress={() => setActiveTab('review')}
    style={activeTab === 'review' ? styles.activeTab : styles.tab}
  >
    <Text style={activeTab === 'review' ? styles.activeTabText : styles.tabText}>
      Review
    </Text>
  </TouchableOpacity>
</View>

 
        {/* Tab Content */}
        <View style={styles.content}>
          {activeTab === 'description' && (
            <>
              <Text style={styles.heading}>About The Role</Text>
              {currentJob.responsibilities.map((line, idx) => (

                <View key={idx} style={styles.bulletRow}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>{line.trim()}</Text>
                </View>

              ))}


              <Text style={styles.heading}>Required Skills</Text>
              {currentJob.requirements.map((line, idx) => (

                <View key={idx} style={styles.bulletRow}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>{line.trim()}</Text>
                </View>

              ))}
            </>
          )}

          {activeTab === 'company' && (
            <>
              <Text style={styles.heading}>About Company</Text>
              <Text>{company.basicInfo}</Text>
              <View style={styles.companyIconlist}>
                <View style={styles.companyIconpart}>
                  <MaterialCommunityIcons name="web" color="#2969ff" size={24} />
                  <Text style={styles.iconText}>Website</Text>
                </View>

                <Text>Website </Text>
              </View>
              <View style={styles.companyIconlist}>
                <View style={styles.companyIconpart}>
                  <Ionicons name="location-outline" color="#ffd175" size={24} />
                  <Text style={styles.iconText} >Headquarters</Text>
                </View>
                <Text>{company.locations}</Text>


              </View>
              <View style={styles.companyIconlist}>
                <View style={styles.companyIconpart}>
                  <FontAwesome name="calendar" color="#00cc9c" size={24} />
                  <Text style={styles.iconText}>Founded</Text>
                </View>

                <Text>{company.startYear}</Text>
              </View>
              <View style={styles.companyIconlist}>
                <View style={styles.companyIconpart}>
                  <Foundation name="torsos" color="#ff73c9" size={24} />
                  <Text style={styles.iconText}>size</Text>
                </View>

                <Text>{company.employeeCount}</Text>

              </View>



            </>
          )}

     {activeTab === 'review' && (
  <View style={styles.reviewContainer}>
    {ratingStats.total > 0 ? (
      <View style={styles.ratingSummaryContainer}>
        <View style={styles.ratingOverview}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.ratingOutOf}>
              <Text style={styles.averageRating}>{Math.round(ratingStats.average)}</Text>/5
            </Text>
            <AnimatedCircularProgress
              size={30}
              width={5}
              fill={ratingStats.average * 20}
              tintColor="#FFD700"
              backgroundColor="#f0f0f0"
            />
          </View>

          <Text style={styles.totalReviews}>Based on {formatNumber(ratingStats.total)} reviews</Text>

          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map(num => (
              <AntDesign key={num} name="star" color={num <= Math.round(ratingStats.average) ? "#FFD700" : "#CCCCCC"} size={22} />
            ))}
          </View>
        </View>

        {/* Rating Distribution */}
        <View style={styles.ratingDistribution}>
          {[5, 4, 3, 2, 1].map(stars => (
            <View key={stars} style={styles.ratingBarContainer}>
              <Text style={styles.ratingLabel}>{stars} star</Text>
              <View style={styles.ratingBarBackground}>
                <View
                  style={[
                    styles.ratingBarFill,
                    {
                      width: `${ratingStats.total > 0
                        ? (ratingStats.distribution[stars] / ratingStats.total) * 100
                        : 0}%`,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      </View>
    ):<View style={{height:200}}><Text style={{fontWeight:'bold',fontSize:16,textAlign:'center'}}>No Reviews Yet</Text></View>}

    {/* Reviews List */}
    <Text style={styles.reviewSectionTitle}>Employee Reviews</Text>
    {
      company.reviews?.map((item,index)=>(
           <View style={styles.reviewCard} key={index}>
          <View style={styles.reviewHeader}>
            <Text style={styles.reviewerName}>{item.userName}</Text>
            <Text style={styles.reviewTime}>{formatReviewTime(item.reviewedAt)}</Text>
          </View>

          <View style={styles.starContainer}>
            {[1, 2, 3, 4, 5].map(num => (
              <AntDesign key={num} name="star" color={item.star >= num ? "#FFD700" : "#CCCCCC"} size={16} />
            ))}
          </View>

          <Text style={styles.reviewText}>{item.reviewDescription}</Text>
        </View>
      ))
    }
     
       
      

    {/* Add Review Section */}
    <View style={styles.addReviewContainer}>
      <Text style={styles.addReviewTitle}>Add Your Review</Text>

      <View style={styles.starRatingContainer}>
        {[1, 2, 3, 4, 5].map(num => (
          <Pressable key={num} onPress={() => handleReviewSelection(num)}>
            <AntDesign name="star" color={star >= num ? "#FFD700" : "#CCCCCC"} size={18} />
          </Pressable>
        ))}
      </View>

      <TextInput
        multiline
        placeholder="Write your review here..."
        style={styles.reviewInput}
        value={review.reviewDescription}
        onChangeText={(val) => setReview({ ...review, reviewDescription: val })}
      />

      <Pressable style={styles.postButton} onPress={handlePostReview}>
        <Text style={styles.postButtonText}>Post Review</Text>
      </Pressable>
    </View>
  </View>
)}
     
    </View>
      </ScrollView >

  {/* Bottom Button */ }
  < View style = { styles.bottomButton } >
    <TouchableOpacity style={styles.applyBtn} onPress={() => navigation.navigate("Apply Job", {
      JobId: currentJob.id,
      companyUID: currentJob.companyUID
    })}>
      <Text style={styles.applyText}>Apply This Job</Text>
    </TouchableOpacity>
      </View >
    </View >
  );
};

export default JobDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scroll: {
    paddingBottom: 100,
  },
  jobCard: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    margin: 16,
    padding: 16,
  },
  jobInfo: {
    alignItems: 'flex-start',
  },
  role: {
    fontSize: 22,
    fontFamily:'Poppins-Bold',
    color: '#fff',
  },
  location: {
    fontSize: 14,
    color: '#ddd',
    marginVertical: 4,

  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#fff',
    color: '#333',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 12,
    marginRight: 8,
    marginTop: 4,
  },
 tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#f0f4ff',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    paddingVertical:5,
    backgroundColor: '#fff', // Corrected from "fff"
  },
  tabText: {
    color: '#3d77ff',
    fontSize:14,
    fontWeight:'bold',
    textAlign: 'center',
  },
  activeTab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,

    backgroundColor: '#3d77ff',
  },
  activeTabText: {
    color: '#fff',
    fontWeight:'bold',
    textAlign: 'center',
     fontSize:14,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  heading: {
    fontFamily:'Poppins-Bold',
    fontSize: 16,
    marginBottom: 6,
  },
  paragraph: {
    color: '#444',
    marginBottom: 16,
    lineHeight: 22,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    marginRight: 6,
    fontSize: 18,
    color: '#6C63FF',
  },
  bulletText: {
    flex: 1,
    color: '#333',
    fontSize: 14,
    fontFamily:'Poppins-Regular'
  },
  bottomButton: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    paddingHorizontal: 20,
  },
  applyBtn: {
    backgroundColor: '#4169e1',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  applyText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  companyIconlist: {
    flexDirection: 'row',
    justifyContent: 'space-between',

    alignItems: 'center'
  },
  companyIconpart: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10
  },
  iconText: {
    fontFamily:'Poppins-Bold',
  },
  reviewContainer: {

    padding: 16,
  },
  ratingSummaryContainer: {

    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  ratingOverview: {

    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
    justifyContent: 'center'
  },
  averageRating: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginRight: 4,
  },
  ratingOutOf: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
    marginRight: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 16,
    gap: 3
  },
  totalReviews: {
    fontSize: 14,
    color: '#666',
  },
  ratingDistribution: {
    marginTop: 8,
  },
  ratingBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingLabel: {
    width: 60,
    fontSize: 12,
    color: '#666',
  },
  ratingBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  ratingCount: {
    width: 30,
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  reviewSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reviewerName: {
    fontWeight: 'bold',
    color: '#000',
  },
  reviewTime: {
    color: '#666',
    fontSize: 12,
  },
  starContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  reviewText: {
    color: '#333',
    lineHeight: 20,
  },
  addReviewContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  addReviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
  },
  starRatingContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  reviewInput: {
    width: '100%',
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    color: '#333',
    textAlignVertical: 'top',
  },
  postButton: {
    backgroundColor: '#1967d2',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  postButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  circularRatingContainer: {
    height: 10,
    width: '100%',
    backgroundColor: '#f0f0f0',
    borderRadius: 5, // Makes it circular
    overflow: 'hidden', // Ensures the fill stays within bounds
    marginVertical: 8,
  },
  circularRatingFill: {
    height: '100%',
    backgroundColor: '#FFD700', // Gold color for rating
    borderRadius: 5, // Match container radius
  },

});
