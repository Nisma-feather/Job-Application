import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { onAuthStateChanged, sendEmailVerification } from "firebase/auth";
import { auth } from "../firebaseConfig";

export default function CompanyEmailVerification({ navigation, route }) {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const { uid } = route.params; // Get uid from route params

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.uid === uid) {
        // Verify matching uid
        setCurrentUser(user);
        setEmailVerified(user.emailVerified);

        if (!user.emailVerified) {
          try {
            setLoading(true);
            await sendEmailVerification(user);
            Alert.alert("Verification Sent", "Please check your company email");
          } catch (err) {
           console.log(err)
          } finally {
            setLoading(false);
          }
        }
      } else {
        navigation.replace("CompanySignUp");
      }
    });
    return unsubscribe;
  }, [uid]);

  const checkVerification = async () => {
    try {
      setChecking(true);
      await currentUser.reload();
      const updatedUser = auth.currentUser;

      if (updatedUser.emailVerified) {
        navigation.replace("Company Details", {
          uid: updatedUser.uid,
          email: updatedUser.email,
        });
      } else {
        Alert.alert("Not Verified", "Please verify your email first");
      }
    } catch (err) {
      Alert.alert("Error", "Failed to check verification");
    } finally {
      setChecking(false);
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Company Email</Text>
      <Text style={styles.text}>A verification email has been sent to:</Text>
      <Text style={styles.email}>{currentUser?.email}</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <>
          <Pressable
            style={styles.button}
            onPress={checkVerification}
            disabled={checking}
          >
            {checking ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {emailVerified ? "Continue" : "Check Verification"}
              </Text>
            )}
          </Pressable>

          {!emailVerified && (
            <Pressable
              style={[styles.button, styles.resendButton]}
              onPress={async () => {
                if (currentUser) {
                  try {
                    await sendEmailVerification(currentUser);
                    Alert.alert("Email Resent", "Please check your inbox");
                  } catch (err) {
                    Alert.alert("Error", "Failed to resend email");
                  }
                }
              }}
            >
              <Text style={styles.buttonText}>Resend Email</Text>
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
    minWidth: 200,
    alignItems: "center",
  },
  resendButton: {
    backgroundColor: "#6c757d",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontFamily: "Poppins-Bold",
  },
});
