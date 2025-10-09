import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Image
} from "react-native";
import {MaterialIcons,FontAwesome} from '@expo/vector-icons';
import logo from "../assets/logoImage.png"


const RoleSelectionScreen = ({ navigation }) => {
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleSelection = () => {
    console.log(selectedRole)
    if (selectedRole === "jobseeker") {
      navigation.replace("JobSeekerStack");
    } else if (selectedRole === "company") {
      navigation.replace("CompanyStack");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.innerWrapper}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image source={logo} style={styles.logoOuter} />

          <View>
            <Text style={styles.logoText}>Feather</Text>
            <Text style={styles.logoSubText}>Job Portal App</Text>
          </View>
        </View>

        {/* Titles */}
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>Who are you?</Text>
          <Text style={styles.subtitle}>
            Select your role to get started with your personalized experience.
          </Text>
        </View>

        {/* Horizontal ScrollView for Role Cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardScrollContainer}
        >
          <TouchableOpacity
            style={[
              styles.card,
              selectedRole === "jobseeker" && styles.selectedCard,
            ]}
            onPress={() => setSelectedRole("jobseeker")}
          >
            <FontAwesome name="user" size={32} color="#1967d2" />
            <Text style={styles.cardTitle}>JOB SEEKERS</Text>
            <Text style={styles.cardDescription}>
              Finding a job here never been easier than before
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.card,
              selectedRole === "company" && styles.selectedCard,
            ]}
            onPress={() => setSelectedRole("company")}
          >
            <FontAwesome name="briefcase" size={32} color="#1967d2" />
            <Text style={styles.cardTitle}>COMPANIES</Text>
            <Text style={styles.cardDescription}>
              Let’s recruit relevant candidates quickly
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Button comes right after cards now */}
        <TouchableOpacity
          style={[
            styles.nextButton,
            !selectedRole && { backgroundColor: "#ccc" },
          ]}
          onPress={handleRoleSelection}
          disabled={!selectedRole}
        >
          <Text style={styles.nextButtonText}>NEXT</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RoleSelectionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  innerWrapper: {
    padding: 20,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
  },
  logoOuter: {
    backgroundColor: "#1967d2",
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    color: "#1967d2",
    fontSize: 22,
    fontWeight: "bold",
  },
  logoSubText: {
    color: "#666",
    fontSize: 12,
  },
  titleContainer: {
    marginTop: 30,
    marginBottom: 10,
  },
  mainTitle: {
    fontSize: 16,
 
    fontFamily:"Poppins-Bold"
  },
  subtitle: {
    color: "#777",
    marginTop: 6,
    fontSize: 12,
    fontFamily:"Poppins-Medium"
  },
  cardScrollContainer: {
    gap: 14,
    paddingVertical: 10,
  },
  card: {
    backgroundColor: "#f6f6f6",
    padding: 18,
    borderRadius: 16,
    width: 220,
    marginRight: 10,
    alignItems: "center",
    borderColor: "#eee",
    borderWidth: 1,
  },
  selectedCard: {
    borderColor: "#1967d2",
    borderWidth: 2,
    backgroundColor: "#e6f0ff",
  },
  cardTitle: {
    fontFamily:"Poppins-Bold",
    marginTop: 10,
    fontSize: 14,
  },
  cardDescription: {
    fontSize: 12,
    color: "#777",
    textAlign: "center",
    marginTop: 4,
  },
  nextButton: {
    backgroundColor: "#1967d2",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 30,
  },
  nextButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
