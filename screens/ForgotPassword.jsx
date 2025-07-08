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
  createUserWithEmailAndPassword,
  deleteUser,
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
      return;
    }
    const normalizedEmail = email.trim().toLowerCase();
    const password = "dummyPassword123";

    setDisabled(true);
    try {
      const temp = await createUserWithEmailAndPassword(
        auth,
        normalizedEmail,
        password
      );
      await deleteUser(temp.user);
      setError("Not Registered Email");
      setDisabled(false);
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        try {
          await sendPasswordResetEmail(auth, normalizedEmail);
          setSuccessMsg(
            "Reset email send to your email, please click the link to reset the password"
          );
        } catch (resetErr) {
          switch (resetErr.code) {
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
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid Email format");
      } else {
        setError("Something went wrong ! , Please try again later");
      }
      setDisabled(false);
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
