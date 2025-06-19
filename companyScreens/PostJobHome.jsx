import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  Ionicons,
  Feather,
  Entypo,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { auth, db } from "../firebaseConfig";
import { CommonActions, useFocusEffect } from "@react-navigation/native";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

const PostJobHome = ({ navigation }) => {
  const [postedjobs, setPostedJobs] = useState([]);
  const [loading,setLoading]=useState(false)

  const fetchPostedJobs = async () => {
    const companyUID = auth.currentUser?.uid;
    //  || "vm5dkIUfk0WxgnXT34QBttxA3kV2";
    if (!companyUID) {
      return;
    }
 
    try {
      setLoading(true)
      const q = query(
        collection(db, "jobs"),
        where("companyUID", "==", companyUID)
      );
      const snapData = await getDocs(q);
      const fetchedjobs = [];
      snapData.forEach((doc) => {
        fetchedjobs.push({ id: doc.id, ...doc.data() });
      });
      console.log(fetchedjobs);
      setPostedJobs(fetchedjobs);
    } catch (e) {
      console.log(e);
    }
    finally{
      setLoading(false)
    }
  };
  const formatDate = (date) => {
    const posted = date.toDate();
    const now = new Date();
    const diffDate = Math.floor((now - posted) / (1000 * 60 * 60 * 24));
    if (diffDate === 0) {
      const diffHour = Math.floor((now - posted) / (1000 * 60 * 60));
      if (diffHour === 0) {
        const diffMinute = Math.floor((now - posted) / (1000 * 60));
        return diffMinute === 1 ? "1 min ago" : `${diffMinute}s ago`;
      }
      return diffHour === 1 ? "1 hr ago" : `${diffHour}hrs ago`;
    }
    return diffDate === 1 ? "1 day ago" : `${diffDate}days ago`;
  };
  const handleJobDelete = async (JobId) => {
    try {
      const ref = doc(db, "jobs", JobId);
      await deleteDoc(ref);
      console.log("document deleted");
      Alert.alert("Job Deleted Successfully");
      console.log("deleted successfully");
      fetchPostedJobs();
    } catch (e) {
      Alert.alert("Unable to delete");
    }
  };
  useFocusEffect(
    React.useCallback(() => {
      // ✅ Your logic here
      fetchPostedJobs();
    }, [])
  );

  console.log(postedjobs);
  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <FlatList
          ListHeaderComponent={() => (
            <View style={styles.headerContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate("Post Job")}
              >
                <Text style={styles.buttonText}>+ Post New Job</Text>
              </TouchableOpacity>
              <Text style={styles.heading}>Recently Posted Jobs</Text>
            </View>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Image
                source={require("../assets/emptyfolder.png")}
                style={styles.emptyImage}
              />
              <Text style={styles.emptyText}>No Jobs posted yet.</Text>
            </View>
          )}
          data={postedjobs}
          renderItem={({ item }) => (
            <View style={styles.jobCard}>
              <View style={styles.jobTopRow}>
                <Text style={styles.jobTitle}>{item.jobrole}</Text>
                <View style={styles.iconRow}>
                  <Pressable
                    onPress={() =>
                      navigation.navigate("Edit Job", { JobId: item.id })
                    }
                  >
                    <Image
                      source={require("../assets/edit.png")}
                      style={styles.icon}
                    />
                  </Pressable>
                  <Pressable onPress={() => handleJobDelete(item.id)}>
                    <Image
                      source={require("../assets/delete.png")}
                      style={styles.icon}
                    />
                  </Pressable>
                </View>
              </View>

              <View style={styles.bottomcard}>
                <View style={styles.metaRow}>
                  <Entypo name="location-pin" color="#6b7280" size={18} />
                  <Text style={styles.metaText}>{item.locations}</Text>
                </View>
                <Text style={styles.metaText}>{formatDate(item.postedAt)}</Text>
              </View>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          contentContainerStyle={{ padding: 16 }}
        />
      )}
    </SafeAreaView>
  );
};


  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#f9fafb",
    },
    loaderContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    headerContainer: {
      paddingBottom: 12,
      alignItems: "center",
    },
    button: {
      backgroundColor: "#3b82f6",
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 10,
      marginTop: 10,
    },
    buttonText: {
      color: "#ffffff",
      fontWeight: "800",
  
      fontSize: 16,
    },
    heading: {
      fontSize: 20,
      fontWeight: "700",
      marginTop: 16,
      textAlign: "center",
      color: "#111827",
    },
    emptyContainer: {
      alignItems: "center",
      marginTop: 40,
    },
    emptyImage: {
      height: 150,
      width: 150,
      marginBottom: 10,
    },
    emptyText: {
      fontSize: 16,
      color: "#6b7280",
    },
    jobCard: {
      backgroundColor: "#ffffff",
      borderRadius: 12,
      padding: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    jobTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    jobTitle: {
      fontSize: 17,
      
      fontFamily: "Poppins-Bold",
      color: "#1f2937",
      flex: 1,
    },
    iconRow: {
      flexDirection: "row",
      gap: 10,
    },
    icon: {
      height: 22,
      width: 22,
      marginLeft: 12,
    },
    bottomcard: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 10,
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    metaText: {
      marginLeft: 4,
      color: "#6b7280",
      fontSize: 14,
    },
  
});

export default PostJobHome;
