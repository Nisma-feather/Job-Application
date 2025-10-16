import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  View,
  Image,
  TextInput,
  SafeAreaView,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import logo from "../assets/logoImage.png";

const Login = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [loading,setLoading] = useState(false)
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    let valid = true;
    if (!email.trim()) {
      valid = false;
      setEmailError("Email is Required");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setEmailError("Invalid email format");
        valid = false;
      } else {
        setEmailError("");
      }
    }

    if (!password.trim()) {
      valid = false;
      setPasswordError("Password is Required");
    } else {
      setPasswordError("");
    }

    return valid;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true)
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      const userDocSnap = await getDoc(doc(db, "users", user.uid));

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();

        if (userData.role === "company") {
          if (!user.emailVerified) {
            navigation.navigate("Company Verification", { uid: user.uid });
            return;
          }

          const companySnap = await getDoc(doc(db, "companies", user.uid));
          if (companySnap.exists()) {
            navigation.replace("CompanyDashboard", { uid: user.uid });
          } else {
            navigation.navigate("Company Details", {
              uid: user.uid,
              email: user.email,
            });
          }
          return;
        }

        if (userData.role === "jobseeker") {
          navigation.replace("JobSeeker Dashboard", { uid: user.uid });
          return;
        }

        Alert.alert("Error", "Unknown company role");
        return;
      }

      if (!user.emailVerified) {
        navigation.navigate("Email Verification", {
          fromLogin: true,
          loginData: { email, password },
        });
        return;
      }

      const jobSeekerDoc = await getDoc(doc(db, "jobseekers", user.uid));
      if (!jobSeekerDoc.exists() || !jobSeekerDoc.data().userInterest) {
        navigation.replace("User Interest", {
          fromLogin: true,
          uid: user.uid,
        });
        return;
      }
    } catch (err) {
      Alert.alert("Login Failed", "Incorrect username or password");
      console.log(err);
    }
    finally{
      setLoading(false);
    }
  };




  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView style={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <View style={styles.logoContainer}>
              <Image source={logo} style={styles.logoOuter} />
              <View style={{ alignItems: "center", marginTop: 10 }}>
                <Text style={styles.logoText}>Feather</Text>
                <Text style={styles.logoSubText}>Job Portal App</Text>
              </View>
            </View>
          </View>

          {/* Email Input */}
          <Text style={styles.label}>
            Email<Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
          {emailError ? (
            <Text style={styles.errorText}>{emailError}</Text>
          ) : null}

          {/* Password Input */}
          <Text style={styles.label}>
            Password<Text style={styles.required}>*</Text>
          </Text>

          <View style={{ position: "relative" }}>
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={styles.input}
            />
            <TouchableOpacity
              onPress={() => {
                setShowPassword(!showPassword);
              }}
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: [{ translateY: -10 }], // center vertically
              }}
            >
              <MaterialCommunityIcons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                color="#000"
                size={20}
              />
            </TouchableOpacity>
          </View>
          {passwordError ? (
            <Text style={styles.errorText}>{passwordError}</Text>
          ) : null}

          {/* Forgot Password */}
          <Pressable
            style={{
              marginTop: 7,
              flexDirection: "row",
              justifyContent: "flex-end",
            }}
            onPress={() => navigation.navigate("Forgot Password")}
          >
            <Text style={{ fontSize: 12 }}>Forgot Password?</Text>
          </Pressable>

          {/* Login Button */}
          <TouchableOpacity
            style={styles.LoginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.LoginButtonText}>
              {loading ? " Loading..." : "Login"}
            </Text>
          </TouchableOpacity>

          {/* Sign Up */}
          <TouchableOpacity onPress={() => navigation.replace("Role")}>
            <Text style={styles.signupText}>
              Don't have an account?
              <Text style={{ color: "blue" }}> Create one </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Login;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 24,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginVertical: 20,
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
  label: {
    fontSize: 13,
    fontWeight: "500",
    marginVertical: 8,
  },
  required: {
    color: "#ff2121",
  },
  input: {
    backgroundColor: "#e6eefa",
    borderRadius: 8,
    fontSize: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  errorText: {
    marginTop: 5,
    color: "red",
    fontSize: 11,
  },
  LoginButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 10,
    borderRadius: 8,
    marginVertical: 10,
    marginTop: 25,
  },
  LoginButtonText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    textTransform: "uppercase",
    textAlign: "center",
  },
  signupText: {
    textAlign: "center",
    color: "#444",
    fontSize: 12,
  },
});
