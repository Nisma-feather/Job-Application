
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from "react";
import { Alert, View, Button, TextInput, SafeAreaView, Text, TouchableOpacity, StyleSheet, Pressable, ScrollView } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { sendPasswordResetEmail } from 'firebase/auth/cordova';


const Login=({navigation})=>{
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const validate = () => {
    let valid = true;
    if (!email.trim()) {
      valid = false
      setEmailError("Email is Required")
    }
    else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setEmailError("Invalid email format");
        valid = false;
      }
      else {
        setEmailError("")
      }

    }

    if (!password.trim()) {
      valid = false
      setPasswordError("Password is Required")
    }
    else {
      setPasswordError("")
    }

    return valid
  }
  const handleLogin = async () => {
    if (!validate()) return;
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      // Check email verification first
      if (!user.emailVerified) {
        navigation.replace("Email Verification", {
          fromLogin: true,
          loginData: { email, password },
        });
        return;
      }

      // Check if profile is complete
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists() || !userDoc.data().userInterest) {
        navigation.replace("User Interest", {
          fromLogin: true,
          uid: user.uid,
        });
        return;
      }

      // If both verified and profile complete
      const data = userDoc.data();
      if (data.role === "jobseeker") {
        navigation.replace("JobSeeker Dashboard", { uid: user.uid });
      } else if (data.role === "company") {
        navigation.replace("CompanyDashboard");
      } else {
        Alert.alert("Error", "Unknown user role");
      }
    } catch (err) {
      Alert.alert("Login Failed", "Incorrect username or password");
      console.log(err);
    }
  };
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <ScrollView style={{ flexGrow: 1 }}>
          <View style={styles.container}>
            <View style={styles.logoContainer}>
              <View style={styles.logoOuter}>
                <MaterialIcons name="double-arrow" color="#fff" size={28} />
              </View>
              <View>
                <Text style={styles.logoText}>Feather</Text>
                <Text style={styles.logoSubText}>Job Portal App</Text>
              </View>
            </View>

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

            <Text style={styles.label}>
              Password<Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
            />
            {passwordError ? (
              <Text style={styles.errorText}>{passwordError}</Text>
            ) : null}
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

            <TouchableOpacity style={styles.LoginButton} onPress={handleLogin}>
              <Text style={styles.LoginButtonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.replace("Role")}>
              <Text style={styles.signupText}>
                Don't have an account?{" "}
                <Text style={{ color: "blue" }}> Creat one </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
}
export default Login 

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
  
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 20,
  },
  logoOuter: {
    backgroundColor: '#1967d2',
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#1967d2',
    fontSize: 22,
    fontWeight: 'bold',
  },
  logoSubText: {
    color: '#666',
    fontSize: 12,
    fontFamily:'Poppins-Regular'
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginVertical:8,
    fontFamily:"Poppins-Bold"
  },
  required:{
    color:"#ff2121"
  },
  input: {
    backgroundColor: '#e6eefa',
    borderRadius: 8,
    fontSize:12,
    paddingHorizontal: 16,
    paddingVertical: 10,
   
  },
  errorText: {
    marginTop:5,
    color: 'red',
    fontSize:11
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 32,
    textAlign: "center",
    color: "#333"
  },
 
  LoginButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 8,
    marginVertical:10,
    marginTop:25
  },
  LoginButtonText: {
    color: '#fff',
    fontSize:13,
    textTransform:'uppercase',
    textAlign: 'center',
     fontFamily:"Poppins-Bold"
  },
  signupText: {
    textAlign: "center",
    color: "#444",
    fontSize: 12,
     fontFamily:"Poppins-Medium"
  }
});