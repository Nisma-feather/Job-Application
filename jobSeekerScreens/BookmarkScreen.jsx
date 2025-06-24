import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  FlatList,
  Pressable,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { auth, db } from "../firebaseConfig";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import {
  Entypo,
  Ionicons,
  MaterialCommunityIcons,
  Feather,
} from "@expo/vector-icons";
import dummyimg from "../assets/icon.png";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback } from "react";
import JobCard from "./JobCard";

const BookMarkScreen = ({ navigation }) => {
  // const navigation=useNavigation();
  const [loading, setLoading] = useState(false);
  const uid = auth.currentUser?.uid;
  console.log(uid);
  const [bookmarks, setBookmarks] = useState([]);
  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "bookmarks"), where("userId", "==", uid));
      const bookmarkSnap = await getDocs(q);

      const bookmarkdatas = [];
      const jobIds = bookmarkSnap.docs.map((bookmark) => bookmark.data().jobId);
      for (const jobId of jobIds) {
        const ref = doc(db, "jobs", jobId);
        const jobSnap = await getDoc(ref);

        if (jobSnap.exists()) {
          const jobData = jobSnap.data();
          let companyName = "Unknown Company";
          let companyLogo;
          console.log(jobData.companyUID);
          if (jobData.companyUID) {
            const companyRef = doc(db, "companies", jobData.companyUID);
            const companysnap = await getDoc(companyRef);

            companyName = companysnap.data().companyName || companyName;
            companyLogo=companysnap.data().profileImg ;
            console.log("company Logo url",companyLogo)
          }
          bookmarkdatas.push({ id: jobId, ...jobData, companyName,companyLogo });
        }
      }
      setLoading(false);
      setBookmarks(bookmarkdatas);
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };
  console.log(bookmarks);
  const removeBookmark = async (jobId) => {
    const q = query(
      collection(db, "bookmarks"),
      where("userId", "==", uid),
      where("jobId", "==", jobId)
    );
    const snapdata = await getDocs(q);
    await deleteDoc(doc(db, "bookmarks", snapdata.docs[0].id));
    const newBookmark = bookmarks.filter((bookmark) => jobId !== bookmark.id);
    setBookmarks(newBookmark);
  };
  const formatDate = (timeStamp) => {
    if (!timeStamp) return "";
    if (!timeStamp) return "";

    const postedDate = timeStamp.toDate();
    const now = new Date();
    const differenceDate = Math.floor(
      (now - postedDate) / (1000 * 60 * 60 * 24)
    );

    if (differenceDate === 0) {
      const diffHours = Math.floor((now - postedDate) / (1000 * 60 * 60));

      if (diffHours === 0) {
        const diffMinutes = Math.floor((now - postedDate) / (1000 * 60));
        return diffMinutes <= 1 ? "1 minute ago" : `${diffMinutes} minutes ago`;
      }

      return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
    }

    return differenceDate === 1 ? "1 day ago" : `${differenceDate} days ago`;
  };
  console.log(bookmarks);
  useFocusEffect(
    useCallback(() => {
      fetchBookmarks();
    }, [])
  );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      {loading ? (
        <View
          style={{ alignItems: "center", justifyContent: "center", flex: 1 }}
        >
          <ActivityIndicator animating={loading} size="large" />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {bookmarks.length === 0 ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                source={{
                  uri: "https://cdn-icons-png.flaticon.com/128/892/892340.png",
                }}
                style={{ height: 50, width: 50 }}
              />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#555",
                  marginVertical: 10,
                }}
              >
                No Bookmarks Yet
              </Text>
            </View>
          ) : (
            <View style={styles.listJobs}>
              <FlatList
                data={bookmarks}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() =>
                      navigation.navigate("Job Details", { currentJob: item })
                    }
                  >
                    <View style={styles.jobItem}>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          height: "40%",
                          maxHeight: 45,
                        }}
                      >
                        <View style={{ flexDirection: "row", gap: 10 }}>
                          <View
                            style={{
                              width: 40,
                              height: 40,
                              borderWidth: 1,
                              borderColor: "#dedede",
                              justifyContent: "center",
                              alignItems: "center",
                              borderRadius: 6,
                            }}
                          >
                            <View style={{width:40,height:40,borderWidth:1,borderColor:'#dedede',justifyContent:'center',alignItems:'center',borderRadius:6,}}>
                                                        <Image source={item.companyLogo?{uri:item.companyLogo}:dummyimg} style={styles.logo} />
                           </View>
                          </View>

                          <View style={{ justifyContent: "space-between" }}>
                            <Text style={styles.jobTitle}>{item.jobrole}</Text>
                            <Text style={styles.companyName}>
                              {item.companyName}
                            </Text>
                          </View>
                        </View>

                        <Pressable
                          style={styles.bookmarkIcon}
                          onPress={() => removeBookmark(item.id)}
                        >
                          <Ionicons name="bookmark" color="#4B9CD3" size={22} />
                        </Pressable>
                      </View>
                      <View style={{ flexDirection: "row", gap: 8 }}>
                        <View
                          style={{
                            paddingVertical: 5,
                            paddingHorizontal: 12,
                            backgroundColor: "#e8f0fb",
                          }}
                        >
                          <Text style={{ fontWeight: "bold", fontSize: 12 }}>
                            {item.jobType}
                          </Text>
                        </View>
                        <View
                          style={{
                            paddingVertical: 5,
                            paddingHorizontal: 12,
                            backgroundColor: "#e8f0fb",
                          }}
                        >
                          <Text style={{ fontWeight: "bold", fontSize: 12 }}>
                            {item.jobMode}
                          </Text>
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
                          <Entypo
                            name="location-pin"
                            color="#9ca4b5"
                            size={18}
                          />
                          <Text style={styles.metaText}>{item.locations}</Text>
                        </View>
                        <Text style={styles.metaText}>
                          {formatDate(item.postedAt)}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                )}
                keyExtractor={(item) => item.id.toString()}
              />
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

export default BookMarkScreen;
const styles = StyleSheet.create({
  listJobs: {
    padding: 15,
    flex: 1,
  },
  logo: {
    flexDirection: "row",
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  jobItem: {
    padding: 10,
    borderRadius: 6,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
    marginHorizontal: 10,
    gap: 10,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  companyName: {
    fontSize: 13,
    color: "#666",
    color: "#5c88ea",
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  metaText: {
    fontSize: 13,
    color: "#555",
    marginLeft: 4,
  },

  bookmarkIcon: {
    marginLeft: 10,
    alignSelf: "flex-start",
  },
});
