import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Image,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const UserProfile = ({ route }) => {
  const { uid } = route.params;
  const [profile, setProfile] = useState({});

  useEffect(() => {
    const fetchUserData = async () => {
      if (!uid) {
        return;
      }
      try {
        const snapdata = await getDoc(doc(db, "users", uid));
        setProfile(snapdata.data());
      } catch (e) {
        console.error("Error fetching user data:", e);
      }
    };
    fetchUserData();
  }, [uid]);

  const { personalData, description, education, experience, skills, projects } =
    profile;
  console.log("profile", profile);

  // Function to format Firestore Timestamp as "DD MMM YYYY" (e.g., "21 Jul 2025")
 const formatTimestamp = (timestamp) => {
   if (!timestamp) return "";

   try {
     let date;

     // Handle Firestore Timestamp or ISO string
     if (typeof timestamp.toDate === "function") {
       date = timestamp.toDate();
     } else {
       date = new Date(timestamp);
     }

     const day = date.getDate();
     const month = date.toLocaleString("default", { month: "short" });
     const year = date.getFullYear();

     return `${day} ${month} ${year}`;
   } catch (error) {
     console.error("Error formatting timestamp:", error);
     return "Invalid date";
   }
 };


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <LinearGradient
          colors={["#2563EB", "#1F2937"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerBackground}
        >
          <View style={styles.profileImageContainer}>
            {personalData?.profileImg ? (
              <Image
                source={{ uri: personalData.profileImg }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.defaultProfileImage}>
                <Ionicons name="person" color="#555" size={75} />
              </View>
            )}
          </View>
        </LinearGradient>

        <View style={styles.profileContent}>
          <Text style={styles.profileName}>
            {personalData?.name || "Lina Jamasin"}
          </Text>
          <Text style={styles.profileTitle}>
            {personalData?.title || "Designer UI | UX"}
          </Text>
          <Text style={styles.profileDescription}>
            {description ||
              "Passionate UI/UX designer dedicated to crafting intuitive digital experiences. Creating visually stunning interfaces with a focus on user-centric design."}
          </Text>

          {/* Skills Section */}
          {skills && skills.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Skills</Text>
              <View style={styles.skillContainer}>
                {skills.map((skill, index) => (
                  <View key={index} style={styles.skillPill}>
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Work Experience Section with Timeline */}
          {experience && experience.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Work Experience</Text>
              <View style={styles.timelineWrapper}>
                {experience.map((exp, index) => (
                  <View key={index} style={styles.timelineItem}>
                    {experience.length > index + 1 ? (
                      <View style={styles.timelineLine} />
                    ) : null}
                    <View style={styles.timelineDot} />
                    <View style={styles.timelineContent}>
                      <Text style={styles.jobTitle}>{exp.role}</Text>
                      <View style={styles.companyInfo}>
                        <Text style={styles.companyName}>{exp.company}</Text>
                        <Text style={styles.dates}>{`${formatTimestamp(
                          exp.from
                        )} - ${formatTimestamp(exp.to) || "Present"}`}</Text>
                      </View>
                      <Text style={styles.jobDescription}>
                        {exp.description}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Education Section with Timeline */}
          {education && education.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Education</Text>
              <View style={styles.timelineWrapper}>
                {education.map((edu, index) => (
                  <View key={index} style={styles.timelineItem}>
                    {education.length > index + 1 ? (
                      <View style={styles.timelineLine} />
                    ) : null}
                    <View style={styles.timelineDot} />
                    <View style={styles.timelineContent}>
                      <Text style={styles.jobTitle}>{edu.name}</Text>
                      <View style={styles.companyInfo}>
                        <Text style={styles.dates}>
                          {formatTimestamp(edu.from)} -{" "}
                          {formatTimestamp(edu.to)}
                        </Text>
                        <Text style={styles.companyName}>{edu.institute}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Projects Section */}
          {projects && projects.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Projects</Text>
              {projects.map((project, index) => (
                <View key={index} style={styles.projectItem}>
                  <Text style={styles.jobTitle}>{project.title}</Text>
                  <Text style={styles.jobDescription}>
                    {project.description}
                  </Text>
                  <Text style={styles.projectTech}>
                    <Text style={{ fontWeight: "bold" }}>Technologies:</Text>{" "}
                    {project.technologies}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#Fff",
  },
  headerBackground: {
    width: "100%",
    height: 160,
    justifyContent: "center",
    alignItems: "center",
  },
  profileImageContainer: {
    height: 120,
    width: 120,
    borderRadius: 60,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 5,
    borderColor: "#fff",
    marginTop: 100,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  profileImage: {
    height: 110,
    width: 110,
    borderRadius: 55,
  },
  defaultProfileImage: {
    height: 110,
    width: 110,
    borderRadius: 55,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  profileContent: {
    paddingHorizontal: 20,
    marginTop: 80,
  },
  profileName: {
    fontSize: 18,
   fontFamily:"Poppins-Bold",
    color: "#2563EB",
    textAlign: "center",
    marginBottom: 4,
  },
  profileTitle: {
    fontSize: 15,
    fontFamily:"Poppins-Regular",
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 10,
  },
  profileDescription: {
    fontSize: 12,
    fontFamily:"Poppins-Regular",
    color: "#4B5563",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 15,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily:"Poppins-Bold",
    color: "#2563EB",
    marginBottom: 16,
  },
  skillContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  skillPill: {
    backgroundColor: "#E0E7FF",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#2563EB",
  },
  skillText: {
    fontSize: 13,
    color: "#111",
    fontFamily: "Poppins-Regular",
  },
  timelineWrapper: {
    position: "relative",
    paddingLeft: 20, // Creates space for the line and dots
  },
  timelineLine: {
    position: "absolute",
    left: 5, // Aligns with the center of the dots
    top: 5,
    bottom: 5,
    width: 2,
    height: "113%",
    backgroundColor: "#D1D5DB",
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#2563EB",
    marginRight: 15,
    marginTop: 5, // Aligns the dot with the top of the text
    zIndex: 1, // Ensures the dot is on top of the line
  },
  timelineContent: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 2,
  },
  companyInfo: {
    flexDirection: "column",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  companyName: {
    fontSize: 14,
    color: "#4B5563",
  },
  dates: {
    fontSize: 11,
    color: "#6B7280",
  },
  jobDescription: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
  },
  projectItem: {
    marginBottom: 16,
  },
  projectTech: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },
});
