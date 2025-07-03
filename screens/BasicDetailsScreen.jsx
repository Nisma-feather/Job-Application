import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";

const BasicDetailsScreen = ({ navigation, route }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    gender: "",
  });
  const { loginData } = route.params || {};
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const genderValue = ["Male", "Female", "Other"];

  const handleValidation = () => {
    let valid = true;
    let tempErrors = {};

    if (!formData.name) {
      valid = false;
      tempErrors.name = "Name is required";
    }

    if (!formData.phone) {
      valid = false;
      tempErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      valid = false;
      tempErrors.phone = "Phone number must be 10 digits";
    }

    if (!formData.gender) {
      valid = false;
      tempErrors.gender = "Please select a gender";
    }

    setErrors(tempErrors);
    return valid;
  };

  const handleSignup = async () => {
    if (!handleValidation()) return;

    try {
      setLoading(true);

      // 1. Create the authentication account
      const userCred = await createUserWithEmailAndPassword(
        auth,
        loginData.email,
        loginData.password
      );

      // 2. Navigate to verification screen with all collected data
      navigation.navigate("Email Verification", {
        loginData: loginData,
        personalData: formData,
      });
    } catch (error) {
      let errorMessage = "Signup failed. Please try again.";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email is already registered.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password should be at least 6 characters.";
      }
      Alert.alert("Signup Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.header}>Complete Your Profile</Text>
        <Text style={styles.subtext}>
          Rest assured, your personal data is visible only to you. No one else
          will have access to it.
        </Text>

        {/* Name Field */}
        <Text style={styles.label}>
          Name<Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, errors.name && styles.errorBorder]}
          onChangeText={(val) => setFormData({ ...formData, name: val })}
          value={formData.name}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

        {/* Phone Field */}
        <Text style={styles.label}>
          Phone Number <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          keyboardType="phone-pad"
          style={[styles.input, errors.phone && styles.errorBorder]}
          onChangeText={(val) => setFormData({ ...formData, phone: val })}
          value={formData.phone}
        />
        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

        {/* Gender Selection */}
        <Text style={styles.label}>
          Gender <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.genderContainer}>
          {genderValue.map((item, idx) => (
            <Pressable
              key={idx}
              style={[
                styles.genderOption,
                formData.gender === item && styles.genderOptionSelected,
              ]}
              onPress={() => setFormData({ ...formData, gender: item })}
            >
              <FontAwesome
                name={formData.gender === item ? "dot-circle-o" : "circle-o"}
                color={formData.gender === item ? "#007BFF" : "#999"}
                size={17}
              />
              <Text style={styles.genderText}>{item}</Text>
            </Pressable>
          ))}
        </View>
        {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Complete Profile</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// ... keep your existing styles ...

export default BasicDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scroll: {
    padding: 20,
    alignItems: "center",
  },
  imageContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e6e6e6",
  },
  editBtn: {
    marginTop: 10,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: "#007BFF",
    borderRadius: 5,
  },
  editText: {
    color: "#fff",
    fontWeight: "bold",
  },
  header: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    marginVertical: 10,
    textAlign: "center",
  },
  subtext: {
    fontSize: 13,
    color: "#777",
    fontFamily: "Poppins-Medium",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    alignSelf: "flex-start",
    color: "#333",
    marginBottom: 5,
    marginTop: 15,

    fontFamily: "Poppins-Bold",
  },
  input: {
    width: "100%",

    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#e6eefa",
  },
  genderContainer: {
    flexDirection: "row",
    gap: 15,
    flexWrap: "wrap",
    width: "100%",

    marginTop: 5,
  },
  genderOption: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  required: {
    color: "#ff2121",
  },
  genderOptionSelected: {
    borderColor: "#007BFF",
    borderWidth: 2,
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
    fontFamily: "Poppins-Bold",
    textAlign: "center",
  },
  errorText: {
    color: "red",
    alignSelf: "flex-start",
    marginTop: 4,
  },
  errorBorder: {
    borderColor: "red",
  },
  genderText: {
    fontFamily: "Poppins-Regular",
  },
});
