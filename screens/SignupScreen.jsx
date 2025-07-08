import React, { useState } from 'react';
import { View, Text, TextInput,Pressable,StyleSheet, SafeAreaView,Image, ScrollView } from 'react-native';
import { FontAwesome, AntDesign, Entypo,MaterialIcons} from '@expo/vector-icons';
import logo from '../assets/newIcon.png'

export default function SignupScreen({navigation}) {
  const [agree, setAgree] = useState(false);
  const [formData, setFormData] = useState({
    name:"",
    email: "",
    confirmPassword: ""
    
  });
  const [error,setError]=useState({})

  const toggleCheckbox = () => {
    setAgree(!agree);
  };
  const validate = () => {
    let valid = true;
    const errors = {
      emailError: "",
      passwordError: "",
      termsError: "",
      confirmPassword: "",
    };

    // Email validation
    if (!formData.email.trim()) {
      errors.emailError = "Email is required";
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.emailError = "Invalid email format";
      valid = false;
    }

    // Password validation
    if (!formData.password.trim()) {
      errors.passwordError = "Password is required";
      valid = false;
    } else {
      const passRegex =
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
      if (!passRegex.test(formData.password)) {
        errors.passwordError =
          "Password must be at least 8 characters and include at least one specialcharacter and one number";
        valid = false;
      }
    }

    // Confirm Password
    if (!formData?.confirmPassword.trim()) {
      errors.confirmPasswordError = "Confirm password is required";
      valid = false;
    } else if (formData.confirmPassword !== formData.password) {
      errors.confirmPasswordError = "Passwords do not match";
      valid = false;
    }
    if (!agree && formData.email.trim() && formData.password.trim()) {
      valid = false;
      errors.termsError = "Agree to the Tems & Conditions";
    }

    setError(errors);
    return valid;
  };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView style={{ flexGrow: 1 }}>
        <View style={styles.container}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image source={logo} style={styles.logoOuter}/>
           
            <View>
              <Text style={styles.logoText}>Feather</Text>
              <Text style={styles.logoSubText}>Job Portal App</Text>
            </View>
          </View>

          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>
            Welcome back! Please enter your details
          </Text>

          <Text style={styles.label}>
            Email <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            keyboardType="email-address"
            value={formData.email}
            onChangeText={(val) => setFormData({ ...formData, email: val })}
          />
          {error.emailError ? (
            <Text style={styles.errorText}>{error.emailError}</Text>
          ) : null}

          <Text style={styles.label}>
            Password <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={formData.password}
            onChangeText={(val) => setFormData({ ...formData, password: val })}
          />
          {error.passwordError ? (
            <Text style={styles.errorText}>{error.passwordError}</Text>
          ) : null}
          <Text style={styles.label}>
            Confirm Password <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={formData.confirmPassword}
            onChangeText={(val) =>
              setFormData({ ...formData, confirmPassword: val })
            }
          />
          {error.confirmPasswordError ? (
            <Text style={styles.errorText}>{error.confirmPasswordError}</Text>
          ) : null}

          <Pressable style={styles.checkboxContainer} onPress={toggleCheckbox}>
            <View style={styles.checkbox}>
              {agree && <Entypo name="check" size={14} color="blue" />}
            </View>
            <Text style={styles.checkboxText}>
              I agree to all Term, Privacy and Fees
            </Text>
          </Pressable>
          {error.termsError ? (
            <Text style={styles.errorText}>{error.termsError}</Text>
          ) : null}

          <Pressable
            style={styles.signUpButton}
            onPress={() => {
              if (!validate()) {
                return;
              }
              navigation.navigate("Basic Info", { loginData: formData });
            }}
          >
            <Text style={styles.signUpButtonText}>Sign Up</Text>
          </Pressable>
          {/* 
      <Text style={styles.orText}>Or Continue With</Text>

      <View style={styles.socialButtonsContainer}>
        <Pressable style={[styles.socialButton]}>
          <FontAwesome name="google" size={20} />
          <Text style={styles.socialButtonText}>Sign Up with Google</Text>
        </Pressable>
        <Pressable style={[styles.socialButton]}>
          <AntDesign name="apple1" size={20} />
          <Text style={styles.socialButtonText}>Sign Up with Apple</Text>
        </Pressable>
      </View> */}

          <Pressable onPress={() => navigation.replace("Login")}>
            <Text style={styles.footerText}>
              Already have an account?{" "}
              <Text style={styles.signInText}>Sign In</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:'center',
    gap: 10,
    marginTop:25,
    marginBottom:15
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
    fontSize: 19,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily:'Poppins-Bold'
    
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
   
    marginBottom:5,
    fontFamily:'Poppins-Regular'
  },
  required:{
    color:"#ff2121",
    marginTop:5,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    fontFamily:'Poppins-Bold',
    marginTop:15
  },
  input: {
    backgroundColor: '#e6eefa',

    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    marginTop:15
  },
  checkbox: {
    height: 20,
    width: 20,
    borderWidth: 2,
    borderColor: '#6d7b9c',
    borderRadius: 4,
    fontFamily:'Poppins-Regular',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  checkboxText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4B5563',
  },
  signUpButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop:16,
    marginBottom: 16,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize:15,
    fontFamily:'Poppins-Bold',
    textAlign: 'center',
  },
  socialButtonsContainer: {
    gap:10,
    marginBottom: 16,  
  },
  socialButton: {
    flex: 1,
    gap:10,
    
    flexDirection:'row',
    borderWidth: 1,
    justifyContent:'center',
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  socialButtonText: {
    fontSize: 14,
    color:'#888',
    fontWeight:600,
    marginTop: 4,
  },
  footerText: {
    textAlign: 'center',
    fontSize: 13,
    fontFamily:"Poppins-Regular",
  },
  signInText: {
    color: '#2563EB',
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop:5,
    
  },
});
