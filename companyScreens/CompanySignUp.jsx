import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet,Pressable, Alert, SafeAreaView, ScrollView } from 'react-native';
import { FontAwesome, AntDesign, Entypo,MaterialIcons } from '@expo/vector-icons';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, getFirestore } from 'firebase/firestore';
import { auth } from '../firebaseConfig';
import { Platform } from 'react-native';
const db = getFirestore();

const CompanySignUp = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cpassword, setCPassword]= useState('');
  // const [companyName, setCompanyName] = useState('');
  // const [startYear, setStartYear] = useState('');
  // const [employeeCount, setEmployeeCount] = useState('');
  // const [locations, setLocations] = useState('');
  // const [basicInfo, setBasicInfo] = useState('');
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState({});

  const toggleCheckbox = () => setAgree(!agree);

  const validate = () => {
    let valid = true;
    const errors = {};

    if (!email.trim()) {
      errors.emailError = 'Email is required';
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.emailError = 'Invalid email format';
      valid = false;
    }

    if (!password.trim()) {
      errors.passwordError = 'Password is required';
      valid = false;
    } else if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/.test(password)) {
      errors.passwordError = 'Password must be 8+ characters with special character & number';
      valid = false;
    } 

    if(!cpassword.trim()){
      valid=false
      errors.cpasswordError='Enter Confirm Password'
    }
    else if(password !== cpassword){
      valid=false
      errors.cpasswordError="password and confirm password not matching"
    }

    // if (!companyName.trim()) {
    //   errors.companyNameError = 'Company name is required';
    //   valid = false;
    // }

    // if (!startYear.trim()) {
    //   errors.startYearError = 'Start year is required';
    //   valid = false;
    // }

    // if (!employeeCount.trim()) {
    //   errors.employeeCountError = 'Employee count is required';
    //   valid = false;
    // }

    // if (!locations.trim()) {
    //   errors.locationsError = 'Locations are required';
    //   valid = false;
    // }

  

    if (!agree) {
      errors.termsError = 'Please agree to the terms';
      valid = false;
    }

    setError(errors);
    return valid;
  };

  // const handleSignup = async () => {
  //   if (!validate()) return;

  //   try {
  //     const userCred = await createUserWithEmailAndPassword(auth, email, password);
  //     const uid = userCred.user.uid;

  //     await setDoc(doc(db, 'users', uid), {
  //       email,
  //       role: 'company',
  //     });

  //     await setDoc(doc(db, 'companies', uid), {
  //       uid,
  //       email,
  //       companyName,
  //       startYear,
  //       employeeCount,
  //       locations,
  //       basicInfo,
  //     });

  //     Alert.alert('Account Created Successfully');
  //     navigation.replace('CompanyLogin');
  //   } catch (err) {
  //     Alert.alert('Error', err.message);
  //   }
  // };

  return (
    <SafeAreaView style={{flex:1}}>
      <ScrollView style={{ backgroundColor: '#fff' }}
  contentContainerStyle={{ flexGrow: 1 }}
  showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
        <View style={styles.logoContainer}>
          <View style={styles.logoOuter}>
            <MaterialIcons name="double-arrow" color="#fff" size={28} />
          </View>
          <View>
            <Text style={styles.logoText}>Karier</Text>
            <Text style={styles.logoSubText}>Job Portal App</Text>
          </View>
        </View>

        <Text style={styles.title}>Create Company Account</Text>
        <Text style={styles.subtitle}>Enter your company details</Text>

        <Text style={styles.label}>Email <Text style={styles.required}>*</Text></Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />
        {error.emailError && <Text style={styles.errorText}>{error.emailError}</Text>}

        <Text style={styles.label}>Password <Text style={styles.required}>*</Text></Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />
        {error.passwordError && <Text style={styles.errorText}>{error.passwordError}</Text>}

        <Text style={styles.label}>Confirm Password <Text style={styles.required}>*</Text></Text>
        <TextInput style={styles.input} value={cpassword} onChangeText={setCPassword} secureTextEntry />
        {error.cpasswordError && <Text style={styles.errorText}>{error.cpasswordError}</Text>}

        {/* <Text style={styles.label}>Company Name <Text style={styles.required}>*</Text></Text>
        <TextInput style={styles.input} value={companyName} onChangeText={setCompanyName} />
        {error.companyNameError && <Text style={styles.errorText}>{error.companyNameError}</Text>}

        <Text style={styles.label}>Start Year <Text style={styles.required}>*</Text></Text>
        <TextInput style={styles.input} value={startYear} onChangeText={setStartYear} keyboardType="numeric" />
        {error.startYearError && <Text style={styles.errorText}>{error.startYearError}</Text>}

        <Text style={styles.label}>Employee Count<Text style={styles.required}>*</Text></Text>
        <TextInput style={styles.input} value={employeeCount} onChangeText={setEmployeeCount} keyboardType="numeric" />
        {error.employeeCountError && <Text style={styles.errorText}>{error.employeeCountError}</Text>}

        <Text style={styles.label}>Locations<Text style={styles.required}>*</Text></Text>
        <TextInput style={styles.input} value={locations} onChangeText={setLocations} />
        {error.locationsError && <Text style={styles.errorText}>{error.locationsError}</Text>}

        <Text style={styles.label}>Basic Info </Text>
        <TextInput style={styles.input} value={basicInfo} onChangeText={setBasicInfo} multiline /> */}
       

        <View style={styles.checkboxContainer}>
          <TouchableOpacity onPress={toggleCheckbox} style={styles.checkbox}>
            {agree && <Entypo name="check" size={14} color="blue" />}
          </TouchableOpacity>
          <Text style={styles.checkboxText}>I agree to all Term, Privacy and Fees</Text>
        </View>
        {error.termsError && <Text style={styles.errorText}>{error.termsError}</Text>}

        <TouchableOpacity style={styles.signUpButton} onPress={()=>{
          if(!validate()){
            return
          }
          navigation.navigate('Company Details', {email:email,password:password})
        }}>
          <Text style={styles.signUpButtonText}>Sign Up</Text>
        </TouchableOpacity>
        <Pressable onPress={()=>navigation.replace("Login")}>
            <Text style={styles.footerText}>
                Already have an account? <Text style={styles.signInText}>Sign In</Text>
              </Text>
           </Pressable>
      </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default CompanySignUp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    height: "100%",
    paddingTop: Platform.OS === "android" ? 50 : 0,
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
    fontFamily: "Poppins-Bold",
  },
  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    fontFamily: "Poppins-Regular",
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 4,
    fontFamily: "Poppins-Bold",
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
    fontFamily: "Poppis-Medium",
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
    fontFamily: "Poppins-Bold",
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
    fontFamily: "Poppins-Regular",
  },
  signInText: {
    color: "#2563EB",
    fontSize: 12,
  },
});
