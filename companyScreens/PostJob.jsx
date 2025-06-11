import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react'
import { Alert, TouchableOpacity } from 'react-native';
import { ScrollView, Text, View, StyleSheet,SafeAreaView, TextInput  } from 'react-native'

import { auth, db } from '../firebaseConfig';
import { addDoc, collection, doc,getDoc} from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons'; import { useNavigation } from '@react-navigation/native';

const PostJob = ({ navigation }) => {

  const [jobrole, setJobRole] = useState("");
  const [vacancies, setVacancies] = useState("");
  const [locations, setlocations] = useState("");
  const [requiremnts, setRequiremnts] = useState("");
  const [roleRes, setRoleRes] = useState("");
  const [expYear, setExpYear] = useState("");
  const [jobType, setJobType] = useState("");
  const [jobMode, setJobMode] = useState("");
  const [skillsInput, setSkillsInput] = useState('');
  const [errors, setErrors] = useState({});

  const [salaryPack, setSalaryPack] = useState("");

  const expYeardata = ['', 'Fresher', "0 - 1 Year", "2-5 Years", "More than 5 Years", "More than 10 Years"];
  const JobTypedata = ['', 
    'Full Time',
    'Part Time',
    'Contract',
    'Freelance',
    'Internship',];
  const JobModedata = ['', 'Hybrid', "Remote", "OnSite"];
  const companyUID =  auth.currentUser?.uid ;
      // || "vm5dkIUfk0WxgnXT34QBttxA3kV2";
  
  const validateFields = () => {
    const newErrors = {};
    if (!jobrole?.trim()) newErrors.jobrole = 'Job role is required';
    if (!locations?.trim()) newErrors.locations = 'Location is required';
    if (!skillsInput.trim()) newErrors.skillsRequired = 'Skills are required';
    if (!jobType?.trim()) newErrors.jobType = 'Job type is required';
    if (!jobMode?.trim()) newErrors.jobMode = 'Job mode is required';
    if (!expYear?.trim()) newErrors.expYear = 'Experience level is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePostJob = async () => {
   
    if (!companyUID) {
      console.error("Company UID is required");
      Alert.alert("Error", "Company UID is required");
      return;
    }

   

    if (!validateFields()) return;
     
       
    let companyName = "Unknown Company";
    try {
      const companyRef = doc(db, 'companies', companyUID);
      const companySnap = await getDoc(companyRef);
      
      if (companySnap.exists()) {
        companyName = companySnap.data().companyName || "Unknown Company";
      } else {
        console.warn("Company document not found, using default name");
      }
    } catch (companyError) {
      console.error("Error fetching company data:", companyError);
      // Continue with default name even if company fetch fails
    }

    try {
      
      const jobData = {
        companyUID,
        companyName,
        jobrole,
        vacancies,
        locations,
        expYear,
        requirements: requiremnts.split('.').map((str)=>str.trim()).filter(Boolean),
        skillsRequired : skillsInput
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill),
        responsibilities: roleRes.split('.').map((str)=>str.trim()).filter(Boolean),
        jobType,
        jobMode,
        salaryPack,
        postedAt: new Date(),
      };
      console.log(jobData)
      await addDoc(collection(db, 'jobs'), jobData);
      Alert.alert("Job Posted Successfully");
      console.log("job posted")
      navigation.navigate("Job Post Success")
    }
    catch (err) {
      Alert.alert('Error', err.message)
    }
   
  }
console.log(skillsInput)

console.log(companyUID);
  return (
    <SafeAreaView style={styles.formContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.label}>Job Role<Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          
          placeholderTextColor="#999"
          value={jobrole}
          onChangeText={setJobRole}
        />
         {errors.jobrole && <Text style={styles.errorText}>{errors.jobrole}</Text>}

        <Text style={styles.label}>No of Vacancies</Text>
        <TextInput
          style={styles.input}
        
          placeholderTextColor="#999"
          value={vacancies}
          onChangeText={setVacancies}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Locations<Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
         
          placeholderTextColor="#999"
          value={locations}
          onChangeText={setlocations}
        />
        {errors.locations && <Text style={styles.errorText}>{errors.locations}</Text>}

        <Text style={styles.label}>Requirements</Text>
        <TextInput
          style={styles.textArea}
         
          placeholderTextColor="#999"
          value={requiremnts}
          onChangeText={setRequiremnts}
          multiline
          numberOfLines={4}
        />
        <Text style={styles.label}>Skills Required</Text>
        <TextInput
          style={styles.input}
         
          value={skillsInput}
          onChangeText={setSkillsInput}
        />
         {errors.skillsRequired && <Text style={styles.errorText}>{errors.skillsRequired}</Text>}


        <Text style={styles.label}>Roles & Responsibilities</Text>
        <TextInput
          style={styles.textArea}
        
          placeholderTextColor="#999"
          value={roleRes}
          onChangeText={setRoleRes}
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Experience Level <Text style={styles.required}>*</Text></Text>
        <View style={styles.pickerWrapper}>
          <Picker style={styles.picker} selectedValue={expYear} onValueChange={setExpYear}>
            {expYeardata.map((exp, idx) => (
              <Picker.Item key={idx} label={exp === '' ? 'Select Years of Exp' : exp} value={exp} />
            ))}
          </Picker>
        </View>
         {errors.expYear && <Text style={styles.errorText}>{errors.expYear}</Text>}
        

        <Text style={styles.label}>Job Type <Text style={styles.required}>*</Text></Text>
        <View style={styles.pickerWrapper}>
          <Picker style={styles.picker} selectedValue={jobType} onValueChange={setJobType} >
            {JobTypedata.map((type, idx) => (
              <Picker.Item key={idx} label={type === '' ? 'Select Type of Job' : type} value={type} />
            ))}
          </Picker>
        </View>
        {errors.jobType && <Text style={styles.errorText}>{errors.jobType}</Text>}

        <Text style={styles.label}>Job Mode <Text style={styles.required}>*</Text></Text>
        <View style={styles.pickerWrapper}>
          <Picker style={styles.picker} selectedValue={jobMode} onValueChange={setJobMode}>
            {JobModedata.map((mode, idx) => (
              <Picker.Item key={idx} label={mode === '' ? 'Select Job Mode' : mode} value={mode} />
            ))}
          </Picker>
        </View>
         {errors.jobMode && <Text style={styles.errorText}>{errors.jobMode}</Text>}

        <Text style={styles.label}>Salary Package</Text>
        <TextInput
          style={styles.input}
          
          placeholderTextColor="#999"
          value={salaryPack}
          onChangeText={setSalaryPack}
        />

        <TouchableOpacity style={styles.submitButton} onPress={handlePostJob}>
          <Text style={styles.submitButtonText}>Post Job</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>

  )
}
export const JobPostSucessScreen = () => {
  const Navigation = useNavigation();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="checkmark-circle" size={100} color="#7cfc00" />
      </View>
      <Text style={styles.successText}>Job Posted Successfully!</Text>
      <TouchableOpacity style={styles.button} onPress={() => Navigation.replace('CompanyDashboard')}>
        <Text style={styles.buttonText}>Go to Dashboard</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )


}

export default PostJob

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    marginBottom: 20,
  },
  successText: {
    fontSize: 24,
    fontWeight: 'bold',

    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: 'blue',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    marginTop: 15,
    color: '#333',
  },
  input: {
    backgroundColor: '#e6eefa',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 8,
  
  },
  textArea: {
    backgroundColor: '#e6eefa',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 100,
    marginBottom: 8,
  },
  picker: {
    height: 50,
    width: "100%",
    backgroundColor: '#e6eefa',
    borderRadius: 10,
    border:'none',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  pickerWrapper: {
    marginBottom: 8,
    overflow: 'hidden',
  },
  submitButton: {
    marginTop: 30,
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Success screen styles already included
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    marginBottom: 20,
  },
  successText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: 'blue',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  required:{
    color:"#ff2121"
  },
});

