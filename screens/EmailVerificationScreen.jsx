import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebaseConfig";

export default function EmailVerification({ navigation, route }) {
  const { loginData, personalData, fromLogin } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Handle both new signups and returning unverified users
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        setEmailVerified(user.emailVerified);

        if (!fromLogin && !user.emailVerified) {
          try {
            setLoading(true);
            await sendEmailVerification(user);
            Alert.alert("Verification Sent", "Please check your email");
          } catch (err) {
            Alert.alert("Error", "Failed to send verification");
          } finally {
            setLoading(false);
          }
        }
      } else if (fromLogin) {
        try {
          setLoading(true);
          const userCred = await signInWithEmailAndPassword(
            auth,
            loginData.email,
            loginData.password
          );
          setCurrentUser(userCred.user);
          setEmailVerified(userCred.user.emailVerified);
        } catch (err) {
          Alert.alert("Error", "Failed to sign in");
          navigation.goBack();
        } finally {
          setLoading(false);
        }
      }
    });
    return unsubscribe;
  }, [fromLogin, loginData?.email, loginData?.password]);

  const checkVerification = async () => {
    try {
      setChecking(true);
      await currentUser?.reload();
      const updatedUser = auth.currentUser;

      if (updatedUser?.emailVerified) {
        setEmailVerified(true);
        if (fromLogin) {
          navigation.replace("User Interest", {
            fromLogin: true,
            uid: updatedUser.uid,
          });
        } else {
          navigation.replace("User Interest", {
            loginData,
            personalData,
            uid: updatedUser.uid,
          });
        }
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
      <Text style={styles.title}>Verify Your Email</Text>
      <Text style={styles.text}>A verification email has been sent to:</Text>
      <Text style={styles.email}>{loginData?.email}</Text>

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
              onPress={() => {
                if (currentUser) {
                  sendEmailVerification(currentUser);
                  Alert.alert("Email Resent", "Please check your inbox");
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
  },
  buttonText: {
    color: "#fff",
    fontFamily: "Poppins-Bold",
  },
});
