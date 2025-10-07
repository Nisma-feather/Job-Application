import { Picker } from "@react-native-picker/picker";
import React, { useState, useCallback } from "react";
import {
  Alert,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";

import { auth, db } from "../firebaseConfig";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

const PostJob = ({ navigation }) => {
  const [jobrole, setJobRole] = useState("");
  const [vacancies, setVacancies] = useState("");
  const [locations, setlocations] = useState("");
  const [requiremnts, setRequiremnts] = useState("");
  const [roleRes, setRoleRes] = useState("");
  const [expYear, setExpYear] = useState("");
  const [jobType, setJobType] = useState("");
  const [jobMode, setJobMode] = useState("");
  const [updating, setUpdating] = useState(false);
  const [skillsInput, setSkillsInput] = useState("");
  const [errors, setErrors] = useState({});
  const [salaryPack, setSalaryPack] = useState("");

  const companyUID = auth.currentUser?.uid;

  const expYeardata = [
    "",
    "Fresher",
    "0 - 1 Year",
    "2-5 Years",
    "More than 5 Years",
    "More than 10 Years",
  ];
  const JobTypedata = [
    "",
    "Full Time",
    "Part Time",
    "Contract",
    "Freelance",
    "Internship",
  ];
  const JobModedata = ["", "Hybrid", "Remote", "OnSite"];

  const validateFields = () => {
    const newErrors = {};
    if (!jobrole?.trim()) newErrors.jobrole = "Job role is required";
    if (!locations?.trim()) newErrors.locations = "Location is required";
    if (!skillsInput.trim()) newErrors.skillsRequired = "Skills are required";
    if (!jobType?.trim()) newErrors.jobType = "Job type is required";
    if (!jobMode?.trim()) newErrors.jobMode = "Job mode is required";
    if (!expYear?.trim()) newErrors.expYear = "Experience level is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePostJob = async () => {
    if (!companyUID) {
      Alert.alert("Error", "Company UID is required");
      return;
    }
    if (!validateFields()) return;

    let companyName = "Unknown Company";
    try {
      const companyRef = doc(db, "companies", companyUID);
      const companySnap = await getDoc(companyRef);
      if (companySnap.exists()) {
        companyName = companySnap.data().companyName || "Unknown Company";
      }
    } catch (err) {
      console.warn("Error fetching company data:", err);
    }

    try {
      setUpdating(true);
      const jobData = {
        companyUID,
        companyName,
        jobrole,
        vacancies,
        locations,
        expYear,
        requirements: requiremnts
          .split(".")
          .map((str) => str.trim())
          .filter(Boolean),
        skillsRequired: skillsInput
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
        responsibilities: roleRes
          .split(".")
          .map((str) => str.trim())
          .filter(Boolean),
        jobType,
        jobMode,
        salaryPack,
        postedAt: new Date(),
      };
      await addDoc(collection(db, "jobs"), jobData);
      navigation.replace("Post Job HomeScreen"); // ✅ use navigate instead of replace
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setUpdating(false);
    }
  };

  // ✅ Reset form each time tab is focused
  useFocusEffect(
    useCallback(() => {
      setJobRole("");
      setVacancies("");
      setlocations("");
      setRequiremnts("");
      setRoleRes("");
      setExpYear("");
      setJobType("");
      setJobMode("");
      setSkillsInput("");
      setSalaryPack("");
      setErrors({});
      setUpdating(false);
    }, [])
  );

  return (
    <SafeAreaView style={styles.formContainer}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <Text style={styles.label}>
              Job Role<Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholderTextColor="#999"
              value={jobrole}
              onChangeText={setJobRole}
            />
            {errors.jobrole && (
              <Text style={styles.errorText}>{errors.jobrole}</Text>
            )}

            <Text style={styles.label}>No of Vacancies</Text>
            <TextInput
              style={styles.input}
              placeholderTextColor="#999"
              value={vacancies}
              onChangeText={setVacancies}
              keyboardType="numeric"
            />

            <Text style={styles.label}>
              Locations<Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholderTextColor="#999"
              value={locations}
              onChangeText={setlocations}
            />
            {errors.locations && (
              <Text style={styles.errorText}>{errors.locations}</Text>
            )}

            <Text style={styles.label}>Requirements</Text>
            <TextInput
              style={styles.textArea}
              placeholderTextColor="#999"
              value={requiremnts}
              onChangeText={setRequiremnts}
              multiline
              numberOfLines={4}
            />

            <Text style={styles.label}>Skills Required</Text>
            <TextInput
              style={styles.input}
              value={skillsInput}
              onChangeText={setSkillsInput}
            />
            {errors.skillsRequired && (
              <Text style={styles.errorText}>{errors.skillsRequired}</Text>
            )}

            <Text style={styles.label}>Roles & Responsibilities</Text>
            <TextInput
              style={styles.textArea}
              placeholderTextColor="#999"
              value={roleRes}
              onChangeText={setRoleRes}
              multiline
              numberOfLines={4}
            />

            <Text style={styles.label}>
              Experience Level <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.pickerWrapper}>
              <Picker
                style={styles.picker}
                selectedValue={expYear}
                onValueChange={setExpYear}
              >
                {expYeardata.map((exp, idx) => (
                  <Picker.Item
                    key={idx}
                    label={exp || "Select Years of Exp"}
                    value={exp}
                  />
                ))}
              </Picker>
            </View>
            {errors.expYear && (
              <Text style={styles.errorText}>{errors.expYear}</Text>
            )}

            <Text style={styles.label}>
              Job Type <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.pickerWrapper}>
              <Picker
                style={styles.picker}
                selectedValue={jobType}
                onValueChange={setJobType}
              >
                {JobTypedata.map((type, idx) => (
                  <Picker.Item
                    key={idx}
                    label={type || "Select Type of Job"}
                    value={type}
                  />
                ))}
              </Picker>
            </View>
            {errors.jobType && (
              <Text style={styles.errorText}>{errors.jobType}</Text>
            )}

            <Text style={styles.label}>
              Job Mode <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.pickerWrapper}>
              <Picker
                style={styles.picker}
                selectedValue={jobMode}
                onValueChange={setJobMode}
              >
                {JobModedata.map((mode, idx) => (
                  <Picker.Item
                    key={idx}
                    label={mode || "Select Job Mode"}
                    value={mode}
                  />
                ))}
              </Picker>
            </View>
            {errors.jobMode && (
              <Text style={styles.errorText}>{errors.jobMode}</Text>
            )}

            <Text style={styles.label}>Salary Package</Text>
            <TextInput
              style={styles.input}
              placeholderTextColor="#999"
              value={salaryPack}
              onChangeText={setSalaryPack}
            />

            <TouchableOpacity
              style={[styles.submitButton, { opacity: updating ? 0.6 : 1 }]}
              disabled={updating}
              onPress={handlePostJob}
            >
              <Text style={styles.submitButtonText}>
                {updating ? "Posting..." : "Post Job"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ✅ Success Screen
export const JobPostSuccessScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.successContainer}>
      <Image source={require("../assets/tick.png")} style={styles.image} />
      <Text style={styles.successText}>Job Posted Successfully!</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("CompanyDashboard")}
      >
        <Text style={styles.buttonText}>Go to Dashboard</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default PostJob;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#ffffff",
  },
  iconContainer: { marginBottom: 20 },
  image: { width: 250, height: 250, resizeMode: "contain" },
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#ffffff",
  },
  successText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#888",
    marginBottom: 30,
    textAlign: "center",
  },
  button: {
    backgroundColor: "blue",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  required: {
    color: "#ff2121",
  },
  errorText: {
    color: "red",
    fontSize: 13,
    marginTop: 4,
  },
  formContainer: { flex: 1, backgroundColor: "#fff" },
  scrollContainer: { padding: 20 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 5,
    marginTop: 15,
    color: "#333",
  },
  input: {
    backgroundColor: "#e6eefa",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 12,
  },
  textArea: {
    backgroundColor: "#e6eefa",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    textAlignVertical: "top",
    minHeight: 100,
    marginBottom: 8,
  },
  pickerWrapper: { marginBottom: 8, overflow: "hidden" },
  picker: {
    height: 50,
    width: "100%",
    backgroundColor: "#e6eefa",
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  submitButton: {
    marginTop: 30,
    backgroundColor: "#007bff",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
});

