import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { styles } from "./Login";
import {
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { auth } from "../firebaseConfig";


const ForgotPassword = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [disabled, setDisabled] = useState(false);

  const handleForgotPassword = async () => {
    setError("");
    setSuccessMsg("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    try {
      setDisabled(true); // Disable button while processing
      const normalizedEmail = email.trim().toLowerCase();

      // Check if email is registered
      // const methods = await fetchSignInMethodsForEmail(auth, normalizedEmail);
      // console.log("methods",methods)
      // if (methods.length === 0) {
      //   setError("This email is not registered.");
      //   setDisabled(false);
      //   return;
      // }

      // // Check if the user signed up with email/password
      // if (!methods.includes("password")) {
      //   setError("This account does not use email/password login.");
      //   setDisabled(false);
      //   return;
      // }
   
      // If checks pass, send reset email
      await sendPasswordResetEmail(auth, normalizedEmail);
      setSuccessMsg("Password reset link sent! Check your email.");
    } catch (err) {
      console.error("Error:", err);
      setDisabled(false);

      // Handle Firebase errors
      switch (err.code) {
        case "auth/invalid-email":
          setError("Invalid email format.");
          break;
        case "auth/too-many-requests":
          setError("Too many attempts. Try again later.");
          break;
        default:
          setError("Failed to send reset link. Please try again.");
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoOuter}>
              <MaterialIcons name="double-arrow" color="#fff" size={28} />
            </View>
            <View>
              <Text style={styles.logoText}>Feather</Text>
              <Text style={styles.logoSubText}>Job Portal App</Text>
            </View>
          </View>

          {/* Email Input */}
          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!disabled}
            style={[
              styles.input,
              disabled && { backgroundColor: "#eee", color: "#888" },
            ]}
          />

          {/* Error & Success Messages */}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {successMsg ? (
            <Text style={{ color: "green", marginTop: 10 }}>{successMsg}</Text>
          ) : null}

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.LoginButton,
              disabled && { backgroundColor: "#ccc" },
            ]}
            onPress={handleForgotPassword}
            disabled={disabled}
          >
            <Text style={styles.LoginButtonText}>
              {disabled ? "Sending..." : "Send Reset Link"}
            </Text>
          </TouchableOpacity>

          {/* Back to Login */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginTop: 20 }}
          >
            <Text style={{ color: "#2e64e5", textAlign: "center" }}>
              Back to Login
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ForgotPassword;
