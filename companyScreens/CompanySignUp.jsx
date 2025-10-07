import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MaterialIcons, Entypo } from "@expo/vector-icons";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { SafeAreaView } from "react-native-safe-area-context";
import logo from "../assets/newIcon.png";

const CompanySignUp = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cpassword, setCPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    let valid = true;
    const errors = {};

    if (!email.trim()) {
      errors.emailError = "Email is required";
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.emailError = "Invalid email format";
      valid = false;
    }

    if (!password.trim()) {
      errors.passwordError = "Password is required";
      valid = false;
    } else if (
      !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/.test(password)
    ) {
      errors.passwordError =
        "Password must be 8+ chars with special character & number";
      valid = false;
    }

    if (!cpassword.trim()) {
      errors.cpasswordError = "Enter Confirm Password";
      valid = false;
    } else if (password !== cpassword) {
      errors.cpasswordError = "Passwords don't match";
      valid = false;
    }

    if (!agree) {
      errors.termsError = "Please agree to the terms";
      valid = false;
    }

    setError(errors);
    return valid;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCred.user;

      await setDoc(doc(db, "users", user.uid), {
        email,
        role: "company",
        isVerified: false,
        createdAt: new Date(),
        profileComplete: false,
      });

      await sendEmailVerification(user);
      navigation.replace("Company Verification", { uid: user.uid });
    } catch (err) {
      let errorMsg = "Signup failed";
      if (err.code === "auth/email-already-in-use") {
        errorMsg = "Email already in use";
      }
      Alert.alert("Error", errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 10 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <View style={styles.logoContainer}>
              <Image source={logo} style={styles.logoOuter} />
              <View>
                <Text style={styles.logoText}>Feather</Text>
                <Text style={styles.logoSubText}>Job Portal App</Text>
              </View>
            </View>

            <Text style={styles.title}>Create Company Account</Text>
            <Text style={styles.subtitle}>Enter your company details</Text>

            {/* Email */}
            <Text style={styles.label}>
              Email <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            {error.emailError && (
              <Text style={styles.errorText}>{error.emailError}</Text>
            )}

            {/* Password */}
            <Text style={styles.label}>
              Password <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            {error.passwordError && (
              <Text style={styles.errorText}>{error.passwordError}</Text>
            )}

            {/* Confirm Password */}
            <Text style={styles.label}>
              Confirm Password <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={cpassword}
              onChangeText={setCPassword}
              secureTextEntry
            />
            {error.cpasswordError && (
              <Text style={styles.errorText}>{error.cpasswordError}</Text>
            )}

            {/* Terms Checkbox */}
            <Pressable
              style={styles.checkboxContainer}
              onPress={() => setAgree(!agree)}
            >
              <View style={styles.checkbox}>
                {agree && <Entypo name="check" size={14} color="blue" />}
              </View>
              <Text style={styles.checkboxText}>
                I agree to all Term, Privacy and Fees
              </Text>
            </Pressable>
            {error.termsError && (
              <Text style={styles.errorText}>{error.termsError}</Text>
            )}

            {/* Sign Up Button */}
            <TouchableOpacity
              style={styles.signUpButton}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.signUpButtonText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            {/* Footer */}
            <Pressable onPress={() => navigation.replace("Login")}>
              <Text style={styles.footerText}>
                Already have an account?{" "}
                <Text style={styles.signInText}>Sign In</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CompanySignUp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 10,
  },
  required: {
    color: "#ff2121",
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
  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 4,
    marginTop: 15,
  },
  input: {
    backgroundColor: "#e6eefa",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 12,
  },
  checkboxContainer: {
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    height: 20,
    width: 20,
    borderWidth: 2,
    borderColor: "#6d7b9c",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  checkboxText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#4B5563",
  },
  signUpButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 8,
    marginVertical: 23,
  },
  signUpButtonText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },
  errorText: {
    color: "red",
    fontSize: 11,
    marginTop: 5,
  },
  footerText: {
    textAlign: "center",
    fontSize: 13,
  },
  signInText: {
    color: "#2563EB",
    fontSize: 12,
  },
});
