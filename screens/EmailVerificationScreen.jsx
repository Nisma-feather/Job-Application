import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  SafeAreaView
} from "react-native";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../firebaseConfig";

export default function EmailVerification({ navigation, route }) {
  const { loginData, personalData } = route.params || {};
  const [user, setUser] = useState(null);
  const [verificationSent, setVerificationSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  // Create user account on mount
  useEffect(() => {
    const createAccount = async () => {
      try {
        setLoading(true);
        const userCred = await createUserWithEmailAndPassword(
          auth,
          loginData.email,
          loginData.password
        );
        setUser(userCred.user);
        await sendEmailVerification(userCred.user);
        setVerificationSent(true);
        Alert.alert("Verification Email Sent", "Please check your inbox.");
      } catch (err) {
        console.error("Signup error:", err);
        Alert.alert("Signup Error", err.message);
      } finally {
        setLoading(false);
      }
    };

    createAccount();
  }, []);

  // Check email verification status live
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setEmailVerified(currentUser.emailVerified);
      }
    });
    return () => unsubscribe();
  }, []);

  const checkVerification = async () => {
    try {
      await user.reload();
      if (user.emailVerified) {
        setEmailVerified(true);
        Alert.alert("Email Verified", "You can now continue.");
      } else {
        Alert.alert(
          "Still Not Verified",
          "Please click the link in your email."
        );
      }
    } catch (err) {
      console.error("Check verification error:", err);
      Alert.alert("Error", err.message);
    }
  };

  const handleContinue = () => {
    if (emailVerified) {
      navigation.replace("User Interest", {
        loginData: loginData,
        personalData: personalData,
      });
    } else {
      Alert.alert("Please verify your email before continuing.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Email</Text>
      <Text style={styles.text}>A verification email has been sent to:</Text>
      <Text style={styles.email}>{loginData.email}</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <>
          <Pressable style={styles.button} onPress={checkVerification}>
            <Text style={styles.buttonText}>Check Verification</Text>
          </Pressable>

          {emailVerified && (
            <Pressable
              style={[styles.button, { backgroundColor: "#28a745" }]}
              onPress={handleContinue}
            >
              <Text style={styles.buttonText}>Complete Profile</Text>
            </Pressable>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    marginBottom: 12,
    color: "#1967d2",
  },
  text: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#333",
    textAlign: "center",
  },
  email: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginVertical: 10,
  },
  button: {
    marginTop: 20,
    backgroundColor: "#1967d2",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontFamily: "Poppins-Bold",
  },
});
  