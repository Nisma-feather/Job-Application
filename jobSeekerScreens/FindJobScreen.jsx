import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  Modal,
  Animated,
  Easing,
  Dimensions,
  Keyboard,
  SafeAreaView,
} from "react-native";

import { ActivityIndicator } from 'react-native';


const dummyimg = require("../assets/logo.png");
import JobCard from './JobCard';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import {Entypo,Ionicons,Feather, FontAwesome,MaterialCommunityIcons} from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native';

 

const { height } = Dimensions.get('window');

const FindJobScreen = ({ navigation }) => {
  const dummyimg = require('../assets/logo.png');
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [originalJobs, setOriginalJobs] = useState([]);
  const [originalCompanies, setOriginalCompanies] = useState([]);
  const [showFilter, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [expFilter, setExpFilter] = useState([]);
  const [jobTypeFilter, setJobTypeFilter] = useState([]);
  const [jobModeFilter, setJobModeFilter] = useState([]);
  const [bookmarkJobs, setBookmarkJobs] = useState([]);
  const [options, setOptions] = useState('jobs');
  const [showOption, setShowOption] = useState(false);
  const [companyList, setCompanyList] = useState([]);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingBookmarks, setLoadingBookmarks] = useState(true);
  const slideAnim = useRef(new Animated.Value(height)).current;

  const optionData = ['jobs', 'companies'];
  const expYeardata = ['Fresher', '0 - 1 year', '2-5 Years', 'More than 5 Years', 'More than 10 Years'];
  const JobTypedata = [
    "Full Time",
    "Part Time",
    "Internship",
    "Freelance",
    "Contract",
  ];
  const JobModedata = ['Hybrid', 'Remote', 'Offline'];
  const uid = auth.currentUser?.uid;


  useEffect(() => {
    if (showFilter) {
      Animated.timing(slideAnim, {
        toValue: height * 0.25,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [showFilter]);

  const fetchBookMarks = async () => {
    try {
      setLoadingBookmarks(true);
      const q = query(collection(db, 'bookmarks'), where('userId', '==', uid));
      const bookmarkSnap = await getDocs(q);
      const bookmarks = bookmarkSnap.docs.map((bookmark) => bookmark.data().jobId);
      setBookmarkJobs(bookmarks);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
    } finally {
      setLoadingBookmarks(false);
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const q = collection(db, 'jobs');
      const querySnap = await getDocs(q);
      const fetchedJobs = [];
      querySnap.forEach((doc) => {
        fetchedJobs.push({ id: doc.id, ...doc.data() });
      });
      setJobs(fetchedJobs);
      setOriginalJobs(fetchedJobs);
      setFilteredJobs(fetchedJobs);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const ref = collection(db, 'companies');
      const snapData = await getDocs(ref);
      const fetchedCompanies = [];
      snapData.forEach((docs) => {
        fetchedCompanies.push({ id: docs.id, ...docs.data() });
      });
      setCompanyList(fetchedCompanies);
      setOriginalCompanies(fetchedCompanies);
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoadingCompanies(false);
    }
  };
  useFocusEffect(useCallback(() => {
    if (options === "jobs") {
      fetchJobs();
    } else if (options === "companies") {
      fetchCompanies();
    }
    fetchBookMarks();
  }, [uid, options]));

  
  const handlesearch = (value) => {
    setSearchQuery(value);
    if (searchTimeout) clearTimeout(searchTimeout);
    setSearchTimeout(
      setTimeout(() => {
        if (value === '') {
          if (options === 'jobs') {
            setFilteredJobs(originalJobs);
          } else {
            setCompanyList(originalCompanies);
          }
        } else {
          applyFilters();
        }
      }, 300)
    );
  };


  const handleLocationSearch = (value) => {
    setLocationQuery(value);
    applyFilters();
  };

  const togglefilters = (filterArray, filterSetter, val) => {
    if (filterArray.includes(val)) {
      filterSetter(filterArray.filter((item) => item !== val));
    } else {
      filterSetter([...filterArray, val]);
    }
  };

  const applyFilters = useCallback(() => {
    if (options === 'jobs') {
      let updatedJobs = [...originalJobs];
      if (searchQuery) {
        updatedJobs = updatedJobs.filter((job) =>
          job.jobrole?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      if (locationQuery) {
        updatedJobs = updatedJobs.filter((job) =>
          job.locations?.toLowerCase().includes(locationQuery.toLowerCase())
        );
      }
      if (expFilter.length > 0) {
        updatedJobs = updatedJobs.filter((job) => expFilter.includes(job.expYear));
      }
      if (jobTypeFilter.length > 0) {
        updatedJobs = updatedJobs.filter((job) => jobTypeFilter.includes(job.jobType));
      }
      if (jobModeFilter.length > 0) {
        updatedJobs = updatedJobs.filter((job) => jobModeFilter.includes(job.jobMode));
      }
      setFilteredJobs(updatedJobs);
    } else if (options === 'companies') {
      let updatedCompanies = [...originalCompanies];
      if (searchQuery) {
        updatedCompanies = updatedCompanies.filter((company) =>
          company.companyName?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      if (locationQuery) {
        updatedCompanies = updatedCompanies.filter((company) =>
          company.locations?.toLowerCase().includes(locationQuery.toLowerCase())
        );
      }
      setCompanyList(updatedCompanies);
    }
  }, [options, originalJobs, originalCompanies, searchQuery, locationQuery, expFilter, jobTypeFilter, jobModeFilter]);

  const handleApplyFilters = () => {
    applyFilters();
    setShowFilters(false);
    Keyboard.dismiss();
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setLocationQuery('');
    setExpFilter([]);
    setJobTypeFilter([]);
    setJobModeFilter([]);
    if (options === 'jobs') {
      setFilteredJobs(originalJobs);
    } else {
      setCompanyList(originalCompanies);
    }
  };
 console.log("filteredJobs",filteredJobs)
  const styles = StyleSheet.create({
    jobItem: {
      minWidth: 250,
      padding: 10,
      borderRadius: 6,
      backgroundColor: "#fff",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 5,
      marginVertical: 6,
      marginHorizontal: 10,
      gap: 14,
      marginBottom: 15,
      minWidth: 280,
    },
    container: {
      padding: 16,
      flex: 1,
      backgroundColor: "#fff",
    },
    inputContainer: {
      marginBottom: 15,
      padding: 20,
    },
    inputWrapper: {
      position: "relative",
      marginBottom: 8,
    },
    inputIcon: {
      position: "absolute",
      top: 14,
      left: 10,
      zIndex: 2,
    },
    inputField: {
      backgroundColor: "#fff",
      height: 50,
      width: "100%",
      paddingLeft: 35,
      borderColor: "#dedede",
      borderWidth: 1,
      borderRadius: 6,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowRadius: 2,
      shadowOpacity: 0.2,
      elevation: 3,
      
      fontSize:12
    },
    filterButton: {
      backgroundColor: "#5c88ea",
      padding: 12,
      borderRadius: 6,
      alignItems: "center",
      marginTop: 8,
    },
    filterButtonText: {
      color: "steelblue",
      fontWeight: "bold",
      fontSize:12,
      fontFamily: "Poppins-Bold",
    },
    companyName: {
      fontSize: 14,
      color: "#666",
      marginBottom: 4,
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 4,
    },
    metaText: {
      fontSize: 11,
      color: "#555",
      marginLeft: 4,
    },
    bookmarkIcon: {
      marginLeft: 10,
      alignSelf: "flex-start",
    },
    filterOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.5)",
      zIndex: 10,
    },
    showfilterText: {
      color: "white",
      fontSize:12,
      fontFamily: "Poppins-Bold",
    },
    filtersContainer: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: height * 0.75,
      backgroundColor: "white",
      padding: 20,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      zIndex: 20,
      elevation: 20,
    },
    applyButton: {
      backgroundColor: "#0a66c2",
      padding: 12,
      borderRadius: 6,
      alignItems: "center",
      marginTop: 20,
    },
    resetButton: {
      backgroundColor: "#f0f0f0",
      padding: 12,
      borderRadius: 6,
      alignItems: "center",
      marginTop: 10,
    },
    buttonText: {
      color: "white",
      fontWeight: "bold",
    },
    resetButtonText: {
      color: "#333",
      fontWeight: "bold",
    },
    sectionTitle: {
      fontWeight: "bold",
      color: "#555",
      fontSize: 16,
      marginVertical: 10,
    },
    filtersRow: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    filterOptionButton: {
      padding: 8,
      margin: 4,
      backgroundColor: "rgb(232, 240, 251)",
      borderRadius: 6,
    },
    filterOptionButtonSelected: {
      backgroundColor: "rgb(37, 99, 235)",
    },
    closeButton: {
      alignSelf: "flex-end",
      marginBottom: 10,
    },
    companyCard: {
      padding: 10,
      borderRadius: 6,
      backgroundColor: "#fff",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowRadius: 5,
      shadowOpacity: 0.2,
      elevation: 2,
      marginBottom: 12,
      gap: 15,
    },
    jobTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: "#555",
      marginBottom: 10,
    },
    yearStyle: {
      fontSize: 13,
      color: "#5c88ea",
      marginBottom: 4,
    },

    filterButtonTextSelected: {
      color: "white",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    dropdownContainer: {
      backgroundColor: "#fff",
      borderWidth: 1,
      borderColor: "#dedede",
      borderRadius: 6,
      marginTop: 5,
      padding: 10,
    },
    dropdownItem: {
      padding: 10,
    },
    dropdownActive: {
      backgroundColor: "#e6eefa",
    },
    dropdownItemText: {
      fontSize: 12,
    },
    handle: {
      width: 40,
      height: 5,
      backgroundColor: "#ccc",
      borderRadius: 3,
      alignSelf: "center",
      marginBottom: 10,
    },
    CompanyTitle: {
      fontSize: 13,
      color: "#333",
      fontFamily: "Poppins-Bold",
    },
    logo: {
      flexDirection: "row",
      width: 40,
      height: 40,
      borderRadius: 10,
    },
  });
  console.log("filtered Jobs",filteredJobs)

  if ((options === 'jobs' && loading) || (options === 'companies' && loadingCompanies) || loadingBookmarks) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a66c2" />
      </View>
    );
  }
  console.log("companyList",companyList)

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={options === "jobs" ? filteredJobs : companyList}
        ListHeaderComponent={
          <View style={{ width: "100%" }}>
            {/* Search Jobs Input */}
            <View style={styles.inputContainer}>
              <View>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="search"
                    size={20}
                    color="#555"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    placeholder={
                      options === "jobs" ? "search jobs" : "search companies"
                    }
                    style={[styles.inputField]}
                    value={searchQuery}
                    onChangeText={handlesearch}
                  />
                  <TouchableOpacity
                    style={{ right: 15, top: 10, position: "absolute" }}
                    onPress={() => setShowOption(!showOption)}
                  >
                    <Entypo
                      name={showOption ? "chevron-up" : "chevron-down"}
                      size={20}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputWrapper}>
                  <Feather
                    name="map-pin"
                    size={20}
                    color="#555"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    placeholder="Location"
                    style={styles.inputField}
                    value={locationQuery}
                    onChangeText={handleLocationSearch}
                  />
                </View>

                {/* Dropdown options */}
                {showOption && (
                  <View style={styles.dropdownContainer}>
                    {optionData.map((item, index) => (
                      <Pressable
                        key={index}
                        onPress={() => {
                          setOptions(item);
                          setShowOption(false);
                        }}
                        style={[
                          styles.dropdownItem,
                          options === item && styles.dropdownActive,
                        ]}
                      >
                        <Text style={styles.dropdownItemText}>
                          {item.charAt(0).toUpperCase() + item.slice(1)}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}

                {/* Apply Filter Button */}
                {options === "jobs" && (
                  <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => {
                      setShowFilters(true);
                      Keyboard.dismiss();
                    }}
                  >
                    <Text style={styles.showfilterText}>show Filters</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) =>
          options === "jobs" ? (
            <JobCard item={item} navigation={navigation} />
          ) : (
            //Company Card
            <Pressable
              style={[styles.jobItem]}
              onPress={() =>
                navigation.navigate("Company Page", { companyUID: item.id })
              }
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flexDirection: "row", gap: 15 }}>
                  <View
                    style={{
                      width: 45,
                      height: 45,
                      borderWidth: 1,
                      borderColor: "#dedede",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: 6,
                    }}
                  >
                    <View
                      style={{
                        width: 45,
                        height: 45,
                        borderWidth: 1,
                        borderColor: "#dedede",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 6,
                      }}
                    >
                      <Image
                        source={
                          item.profileImg ? { uri: item.profileImg } : dummyimg
                        }
                        style={styles.logo}
                      />
                    </View>
                  </View>

                  <View style={{ justifyContent: "space-between" }}>
                    <Text style={styles.CompanyTitle}>{item.companyName}</Text>
                    <View style={{ flexDirection: "row", gap: 5 }}>
                      <FontAwesome
                        style={{ marginTop: 2 }}
                        name="star"
                        color="#FFD700"
                        size={14}
                      />

                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: "500",
                          color: "#777",
                        }}
                      >
                        {item.reviewAvg
                          ? `${item.reviewAvg}.0 reviews`
                          : "No Review"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  height: 35,
                  borderTopColor: "#dedede",
                  borderTopWidth: 1,
                }}
              >
                <View style={styles.metaRow}>
                  <Entypo name="location-pin" color="#9ca4b5" size={18} />
                  <Text style={styles.metaText}>{item.locations}</Text>
                </View>
              </View>
            </Pressable>
          )
        }
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <Text
            style={{
              textAlign: "center",
              marginTop: 20,
              fontFamily: "Poppins-Medium",
            }}
          >
            {options === "jobs" ? "No Jobs Found" : "No Companies Found"}
          </Text>
        }
        contentContainerStyle={{ flexGrow: 1 }}
      />
      {showFilter && (
        <Pressable
          onPress={() => setShowFilters(false)} // Close when touched
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.4)", // Dim effect
            zIndex: 10,
          }}
        />
      )}
      {/* Filter Panel */}
      <Modal visible={showFilter} animationType="slide" transparent={true}>
        <View
          style={{
            height: 400,
            position: "absolute",
            bottom: 50,
            width: "100%",
            backgroundColor: "white",
          }}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              padding: 20,
            }}
            showsVerticalScrollIndicator={false}
          >
            <Pressable
              onPress={() => setShowFilters(false)}
              style={styles.closeButton}
            >
              <FontAwesome name="close" color="#000" size={24} />
            </Pressable>

            <Text style={styles.sectionTitle}>Experience</Text>
            <View style={styles.filtersRow}>
              {expYeardata.map((exp) => (
                <TouchableOpacity
                  key={exp}
                  onPress={() => togglefilters(expFilter, setExpFilter, exp)}
                  style={[
                    styles.filterOptionButton,
                    expFilter.includes(exp) &&
                      styles.filterOptionButtonSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      expFilter.includes(exp) &&
                        styles.filterButtonTextSelected,
                    ]}
                  >
                    {exp}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Job Type</Text>
            <View style={styles.filtersRow}>
              {JobTypedata.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() =>
                    togglefilters(jobTypeFilter, setJobTypeFilter, type)
                  }
                  style={[
                    styles.filterOptionButton,
                    jobTypeFilter.includes(type) &&
                      styles.filterOptionButtonSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      jobTypeFilter.includes(type) &&
                        styles.filterButtonTextSelected,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Job Mode</Text>
            <View style={styles.filtersRow}>
              {JobModedata.map((mode) => (
                <TouchableOpacity
                  key={mode}
                  onPress={() =>
                    togglefilters(jobModeFilter, setJobModeFilter, mode)
                  }
                  style={[
                    styles.filterOptionButton,
                    jobModeFilter.includes(mode) &&
                      styles.filterOptionButtonSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      jobModeFilter.includes(mode) &&
                        styles.filterButtonTextSelected,
                    ]}
                  >
                    {mode}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApplyFilters}
            >
              <Text style={styles.buttonText}>Apply Filters</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resetButton}
              onPress={resetAllFilters}
            >
              <Text style={styles.resetButtonText}>Reset Filters</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
      {/* {showFilter && (
        <>
          <Pressable
            style={styles.filterOverlay}
            onPress={() => setShowFilters(false)}
          />

          <Animated.View
            style={[
              styles.filtersContainer,
              { transform: [{ translateY: slideAnim }] },
            ]}
          >
            <ScrollView
              contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
              showsVerticalScrollIndicator={false}
            >
              <Pressable
                onPress={() => setShowFilters(false)}
                style={styles.closeButton}
              >
                <FontAwesome name="close" color="#000" size={24} />
              </Pressable>

              <Text style={styles.sectionTitle}>Experience</Text>
              <View style={styles.filtersRow}>
                {expYeardata.map((exp) => (
                  <TouchableOpacity
                    key={exp}
                    onPress={() => togglefilters(expFilter, setExpFilter, exp)}
                    style={[
                      styles.filterOptionButton,
                      expFilter.includes(exp) &&
                        styles.filterOptionButtonSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        expFilter.includes(exp) &&
                          styles.filterButtonTextSelected,
                      ]}
                    >
                      {exp}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionTitle}>Job Type</Text>
              <View style={styles.filtersRow}>
                {JobTypedata.map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() =>
                      togglefilters(jobTypeFilter, setJobTypeFilter, type)
                    }
                    style={[
                      styles.filterOptionButton,
                      jobTypeFilter.includes(type) &&
                        styles.filterOptionButtonSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        jobTypeFilter.includes(type) &&
                          styles.filterButtonTextSelected,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionTitle}>Job Mode</Text>
              <View style={styles.filtersRow}>
                {JobModedata.map((mode) => (
                  <TouchableOpacity
                    key={mode}
                    onPress={() =>
                      togglefilters(jobModeFilter, setJobModeFilter, mode)
                    }
                    style={[
                      styles.filterOptionButton,
                      jobModeFilter.includes(mode) &&
                        styles.filterOptionButtonSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        jobModeFilter.includes(mode) &&
                          styles.filterButtonTextSelected,
                      ]}
                    >
                      {mode}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleApplyFilters}
              >
                <Text style={styles.buttonText}>Apply Filters</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resetButton}
                onPress={resetAllFilters}
              >
                <Text style={styles.resetButtonText}>Reset Filters</Text>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </>
      )} */}
    </SafeAreaView>
  );
};

export default FindJobScreen;