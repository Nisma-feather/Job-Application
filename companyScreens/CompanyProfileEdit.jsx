import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

export default function CompanyProfileEdit({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState({
    companyName: "",
    startYear: "",
    employeeCount: "",
    locations: "",
    website: "",
    basicInfo: "",
    shortDescription: "",
  });

  const [errors, setErrors] = useState({
    nameError: "",
    yearError: "",
    countError: "",
    locationError: "",
  });

  const validate = () => {
    let valid = true;
    const newErrors = {
      nameError: "",
      yearError: "",
      countError: "",
      locationError: "",
    };

    if (!company.companyName.trim()) {
      newErrors.nameError = "Company Name is Required";
      valid = false;
    }
    if (!company.startYear.trim()) {
      newErrors.yearError = "Established Year is Required";
      valid = false;
    }
    if (!company.employeeCount.trim()) {
      newErrors.countError = "Employee Count is Required";
      valid = false;
    }
    if (!company.locations.trim()) {
      newErrors.locationError = "Location is Required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const fetchCompany = async () => {
    setLoading(true);
    const uid = auth.currentUser?.uid;
    if (!uid) {
      console.warn("No user UID found");
      setLoading(false);
      return;
    }

    try {
      const snap = await getDoc(doc(db, "companies", uid));
      if (snap.exists()) {
        const data = snap.data();
        setCompany((prev) => ({
          ...prev,
          ...data,
          website: data.website || "",
        }));
      } else {
        setCompany({
          companyName: "",
          startYear: "",
          employeeCount: "",
          locations: "",
          website: "",
          basicInfo: "",
          shortDescription: "",
        });
      }
    } catch (error) {
      console.log("Error fetching company:", error);
    }

    setLoading(false);
  };

  const handleUpdate = async () => {
    if (!validate()) return;
    const companyUID = auth.currentUser?.uid;
    if (!companyUID) return;

    try {
      await updateDoc(doc(db, "companies", companyUID), { ...company });
      navigation.navigate("Profile");
    } catch (e) {
      Alert.alert("Can't update profile");
      console.log("Error updating profile:", e);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.header}>Complete the Company Profile</Text>

          <Text style={styles.label}>
            Name<Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.nameError && styles.errorBorder]}
            value={company.companyName}
            onChangeText={(val) => setCompany({ ...company, companyName: val })}
          />
          {errors.nameError && (
            <Text style={styles.errorText}>{errors.nameError}</Text>
          )}

          <Text style={styles.label}>
            Established Year<Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.yearError && styles.errorBorder]}
            value={company.startYear}
            onChangeText={(val) => setCompany({ ...company, startYear: val })}
            keyboardType="numeric"
          />
          {errors.yearError && (
            <Text style={styles.errorText}>{errors.yearError}</Text>
          )}

          <Text style={styles.label}>
            Description<Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, { height: 70 }]}
            value={company.shortDescription}
            onChangeText={(val) =>
              setCompany({ ...company, shortDescription: val })
            }
            multiline
          />

          <Text style={styles.label}>Website</Text>
          <TextInput
            style={styles.input}
            value={company.website}
            onChangeText={(val) => setCompany({ ...company, website: val })}
          />

          <Text style={styles.label}>
            Employee Count<Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.countError && styles.errorBorder]}
            value={company.employeeCount}
            onChangeText={(val) =>
              setCompany({ ...company, employeeCount: val })
            }
            keyboardType="numeric"
          />
          {errors.countError && (
            <Text style={styles.errorText}>{errors.countError}</Text>
          )}

          <Text style={styles.label}>
            Location<Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.locationError && styles.errorBorder]}
            value={company.locations}
            onChangeText={(val) => setCompany({ ...company, locations: val })}
          />
          {errors.locationError && (
            <Text style={styles.errorText}>{errors.locationError}</Text>
          )}

          <Text style={styles.label}>About the Company</Text>
          <TextInput
            style={[styles.input, { height: 100 }]}
            value={company.basicInfo}
            onChangeText={(val) => setCompany({ ...company, basicInfo: val })}
            multiline
          />

          <TouchableOpacity style={styles.button} onPress={handleUpdate}>
            <Text style={styles.buttonText}>Update Profile</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scroll: {
    padding: 15,
  },
  header: {
    fontSize: 15,
    fontFamily: "Poppins-Bold",
    marginVertical: 10,
    textAlign: "center",
  },
  label: {
    alignSelf: "flex-start",
    fontFamily: "Poppins-Bold",
    color: "#333",
    fontSize: 13,
    marginBottom: 5,
    marginTop: 10,
  },
  required: {
    color: "#ff2121",
  },
  input: {
    width: "100%",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 12,
    backgroundColor: "#e6eefa",
    fontFamily: "Poppins-Regular",
    marginBottom: 4,
  },
  errorBorder: {
    borderColor: "red",
    borderWidth: 1,
  },
  button: {
    backgroundColor: "#007BFF",
    marginTop: 30,
    width: "100%",
    padding: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  errorText: {
    color: "red",
    fontSize: 11,
    marginVertical: 4,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
});
