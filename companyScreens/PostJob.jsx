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
  Keyboard,
  TouchableWithoutFeedback

} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
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

  
  const [expiryDate, setExpiryDate] = useState("");
  const [pickerDate, setPickerDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [jobStatus, setJobStatus] = useState("Open");

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
    if (!expiryDate) {
      newErrors.expiryDate = "Set a Job Expiry";
    } else {
      const selectedDate = new Date(expiryDate);
      const today = new Date();

      // Normalize both dates (ignore time portion)
      selectedDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      // Check if expiryDate is not at least 1 day after today
      if (selectedDate <= today) {
        newErrors.expiryDate = "Expiry date must be at least 1 day after today";
      }
    }

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
        expiryDate,
        status: jobStatus,
        postedAt: new Date(),
      };
      await addDoc(collection(db, "jobs"), jobData);
      navigation.replace("Post Job HomeScreen");
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setUpdating(false);
    }
  };

  // Reset form each time tab is focused
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
      setExpiryDate(new Date());
      setJobStatus("Open");
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

          <Text style={styles.label}>
            Skills Required
            <Text style={styles.required}>*</Text>
          </Text>
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

          <Text style={styles.label}>
            Job Expiry Date <Text style={styles.required}>*</Text>{" "}
          </Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
          >
            <Text>
              {expiryDate && new Date(expiryDate) > new Date()
                ? expiryDate.toISOString().split("T")[0] // converts to YYYY-MM-DD
                : "Select Expiry Date"}
            </Text>
          </TouchableOpacity>
          {errors.expiryDate && (
            <Text style={styles.errorText}>{errors.expiryDate}</Text>
          )}

          {showDatePicker && (
            <DateTimePicker
              value={expiryDate ? new Date(expiryDate) : new Date()}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setExpiryDate(selectedDate);
              }}
              minimumDate={new Date()}
            />
          )}

          <Text style={styles.label}>
            Job Status <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.pickerWrapper}>
            <Picker
              style={styles.picker}
              selectedValue={jobStatus}
              onValueChange={(val) => setJobStatus(val)}
            >
              <Picker.Item label="Open" value="Open" />
              <Picker.Item label="Closed" value="Closed" />
            </Picker>
          </View>

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
  formContainer: { flex: 1, backgroundColor: "#fff" },
  scrollContainer: { padding: 20 },
  label: { fontSize: 14, color:"#333", fontFamily:"Poppins-Bold", marginBottom: 5, marginTop: 15 },
  required: { color: "#ff2121" },
  input: {
    backgroundColor: "#e6eefa",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 12,
    fontFamily:"Poppins-Regular"
  },
  textArea: {
    backgroundColor: "#e6eefa",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    textAlignVertical: "top",
    minHeight: 100,
    marginBottom: 8,
  },
  pickerWrapper: { marginBottom: 8, overflow: "hidden" },
  picker: {
    fontFamily:"Poppins-Regular",
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
  submitButtonText: { color: "white", fontSize: 14, fontWeight: "bold" },
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#ffffff",
  },
  image: { width: 250, height: 250, resizeMode: "contain" },
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
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  errorText: { color: "red", fontSize: 13, marginTop: 4 },
});
