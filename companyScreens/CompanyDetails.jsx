import { useState } from "react";
import { 
  SafeAreaView, 
  StyleSheet, 
  ScrollView,
  Text,
  Alert,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { auth, db } from "../firebaseConfig";  // Make sure db is exported from your firebaseConfig
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const CompanyDetails = ({ route, navigation }) => {
    const { uid } = route.params; 
    const { email, password } = route.params;
    const [company, setCompany] = useState({
        companyName: '',
        startYear: '',
        employeeCount: '',
        locations: '',
        basicInfo: '',
    });
    const [errors, setErrors] = useState({
        nameError: '',
        yearError: '',
        countError: '',
        locationError: ''
    });

    const validate = () => {
        let valid = true;
        const newErrors = {
            nameError: '',
            yearError: '',
            countError: '',
            locationError: ''
        };

        if (!company.companyName.trim()) {
            newErrors.nameError = "Company Name is Required";
            valid = false;
        }
        if (!company.startYear.trim()) {
            newErrors.yearError = "Established Year is Required";
            valid = false;
        }
        if (!company.employeeCount.trim()) {
            newErrors.countError = "Employee Count is Required";
            valid = false;
        }
        if (!company.locations.trim()) {
            newErrors.locationError = "Location is Required";
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleCreateAccount = async () => {
        if (!validate()) {
            return;
        }

        try {
          

            await setDoc(doc(db, 'companies', uid), {
                uid,
                email,
                companyName: company.companyName,
                startYear: company.startYear,
                employeeCount: company.employeeCount,
                locations: company.locations,
                basicInfo: company.basicInfo,
            });

            Alert.alert('Success', 'Account Created Successfully');
            navigation.replace('Login');
        } catch (err) {
            Alert.alert('Error', err.message);
            console.error("Signup error:", err);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <Text style={styles.header}>Complete the Company Profile</Text>
                
                <Text style={styles.label}>Name<Text style={styles.required}>*</Text></Text>
                <TextInput 
                    style={[styles.input, errors.nameError && styles.errorBorder]} 
                    value={company.companyName}
                    onChangeText={(val) => setCompany({ ...company, companyName: val })}
                />
                {errors.nameError && <Text style={styles.errorText}>{errors.nameError}</Text>}

                <Text style={styles.label}>Established Year<Text style={styles.required}>*</Text></Text>
                <TextInput 
                    style={[styles.input, errors.yearError && styles.errorBorder]}
                    value={company.startYear}
                    onChangeText={(val) => setCompany({ ...company, startYear: val })}
                    keyboardType="numeric"
                />
                {errors.yearError && <Text style={styles.errorText}>{errors.yearError}</Text>}

                <Text style={styles.label}>Employee Count<Text style={styles.required}>*</Text></Text>
                <TextInput 
                    style={[styles.input, errors.countError && styles.errorBorder]}
                    value={company.employeeCount}
                    onChangeText={(val) => setCompany({ ...company, employeeCount: val })}
                    keyboardType="numeric"
                />
                {errors.countError && <Text style={styles.errorText}>{errors.countError}</Text>}

                <Text style={styles.label}>Location<Text style={styles.required}>*</Text></Text>
                <TextInput 
                    style={[styles.input, errors.locationError && styles.errorBorder]}
                    value={company.locations}
                    onChangeText={(val) => setCompany({ ...company, locations: val })}
                />
                {errors.locationError && <Text style={styles.errorText}>{errors.locationError}</Text>}

                <Text style={styles.label}>About the Company</Text>
                <TextInput 
                    style={[styles.input, { height: 100 }]}
                    value={company.basicInfo}
                    onChangeText={(val) => setCompany({ ...company, basicInfo: val })}
                    multiline
                />
               
                <TouchableOpacity style={styles.button} onPress={handleCreateAccount}>
                    <Text style={styles.buttonText}>Create Account</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scroll: {
        padding: 15,
    },
    header: {
        fontSize: 15,
        fontWeight: 'bold',
        marginVertical: 7,
        textAlign: 'center'
    },
    label: {
        alignSelf: 'flex-start',
        fontWeight: '500',
        marginBottom: 5,
        marginTop: 10,
        color:"#222",
        fontFamily:"Poppins-Bold",
        fontSize:13
    },
    required: {
        color: '#ff2121'
    },
    input: {
        width: '100%',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 10,
        fontSize: 12,
        backgroundColor: '#e6eefa',
        marginBottom: 4
    },

    button: {
        backgroundColor: '#007BFF',
        marginTop: 30,
        width: '100%',
        padding: 15,
        borderRadius: 8
    },
    buttonText: {
        color: '#fff',
        textAlign:'center',
        fontSize:13,
        fontFamily:"Poppins-Bold"
    },
    errorText: {
        color: 'red',
        fontSize: 11,
        marginVertical: 4,
        alignSelf: 'flex-start',
    }
});

export default CompanyDetails;