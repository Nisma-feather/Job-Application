import { doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ScrollView, StyleSheet, TextInput, Text, TouchableOpacity, SafeAreaView, View
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { db } from '../firebaseConfig';

const PostJobEdit = ({ route }) => {
  const { JobId } = route.params;
  const [job, setJob] = useState({});
  const [skillsRequired, setSkillsRequired] = useState('');
  const [errors, setErrors] = useState({});
  const [requirements,setRequiremnts]=useState("");
  const [responsibilities,setResponsibilities]=useState("")

  const expYeardata = ['', 'Fresher', "0 - 1 Year", "2-5 Years", "More than 5 Years", "More than 10 Years"];
  const JobTypedata = ['', 'Full Time', 'Part Time', 'Contract', 'Freelance', 'Internship'];
  const JobModedata = ['', 'Hybrid', "Remote", "OnSite"];

  const fetchJobDetails = async () => {
    if (!JobId) return;
    try {
      const ref = doc(db, 'jobs', JobId);
      const Snapdata = await getDoc(ref);
      const data = Snapdata.data();
      
      if (data) {
        setJob({ ...data });
        setSkillsRequired((data.skillsRequired || []).join(', '));
        const requirements=(data.requirements || []).join('.');
        const responsibilities=(data.responsibilities || []).join('.');
        setJob({
    ...data,
    requirements,
    responsibilities,
  });
      }
    } catch (e) {
      console.log("Can't fetch job details", e);
    }
  };
console.log(job)
  useEffect(() => {
    fetchJobDetails();
  }, []);

  const validateFields = () => {
    const newErrors = {};
    if (!job.jobrole?.trim()) newErrors.jobrole = 'Job role is required';
    if (!job.locations?.trim()) newErrors.locations = 'Location is required';
    if (!skillsRequired.trim()) newErrors.skillsRequired = 'Skills are required';
    if (!job.jobType?.trim()) newErrors.jobType = 'Job type is required';
    if (!job.jobMode?.trim()) newErrors.jobMode = 'Job mode is required';
    if (!job.expYear?.trim()) newErrors.expYear = 'Experience level is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleJobUpdate = async () => {
  

    try {
      const ref = doc(db, 'jobs', JobId);
      await updateDoc(ref, {
        ...job,
        requirements:job.requirements.split(". "),
        responsibilities:job.responsibilities.split("."),
        skillsRequired:skillsRequired
          .split(',')
          .map(skill => skill.trim())
          .filter(skill => skill),
      });
      setErrors({});
      fetchJobDetails();
    } catch (e) {
      console.log("Can't update job", e);
    }
  };
  console.log("Job Mode Value:", job.jobMode);
  return (
    <SafeAreaView style={styles.formContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Job Role <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="Type Job Role"
          value={job.jobrole || ''}
          onChangeText={(val) => setJob({ ...job, jobrole: val })}
        />
        {errors.jobrole && <Text style={styles.errorText}>{errors.jobrole}</Text>}

        <Text style={styles.label}>No of Vacancies</Text>
        <TextInput
          style={styles.input}
          placeholder="Type vacancies"
          value={job.vacancies || ''}
          onChangeText={(val) => setJob({ ...job, vacancies: val })}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Location <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="Type Location"
          value={job.locations || ''}
          onChangeText={(val) => setJob({ ...job, locations: val })}
        />
        {errors.locations && <Text style={styles.errorText}>{errors.locations}</Text>}

        <Text style={styles.label}>Requirements</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Enter requirements"
          value={job.requirements || ''}
          onChangeText={(val) => setJob({ ...job, requirements: val })}
          multiline
          numberOfLines={4}
        />
        <Text style={styles.label}>Skills Required <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., React, JavaScript"
          value={skillsRequired}
          onChangeText={(val) => setSkillsRequired(val)}
        />
        {errors.skillsRequired && <Text style={styles.errorText}>{errors.skillsRequired}</Text>}

        <Text style={styles.label}>Roles & Responsibilities</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Enter responsibilities"
          value={job.responsibilities|| ''}
          onChangeText={(val) => setJob({ ...job, responsibilities: val })}
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Experience Level <Text style={styles.required}>*</Text></Text>
        <View style={styles.pickerWrapper}>
          <Picker style={styles.picker}
            selectedValue={job.expYear || ''}
            onValueChange={(val) => setJob({ ...job, expYear: val })}
          >
            {expYeardata.map((exp, idx) => (
              <Picker.Item key={idx} label={exp || 'Select Experience'} value={exp} />
            ))}
          </Picker>
        </View>
        {errors.expYear && <Text style={styles.errorText}>{errors.expYear}</Text>}

        <Text style={styles.label}>Job Type <Text style={styles.required}>*</Text></Text>
        <View style={styles.pickerWrapper}>
          <Picker style={styles.picker}
            selectedValue={job.jobType || ''}
            onValueChange={(val) => setJob({ ...job, jobType: val })}
          >
            {JobTypedata.map((type, idx) => (
              <Picker.Item key={idx} label={type || 'Select Job Type'} value={type} />
            ))}
          </Picker>
        </View>
        {errors.jobType && <Text style={styles.errorText}>{errors.jobType}</Text>}

        <Text style={styles.label}>Job Mode <Text style={styles.required}>*</Text></Text>
        <View >
          <Picker style={styles.picker}
            selectedValue={job.jobMode || ''}
            onValueChange={(val) => setJob({ ...job, jobMode: val })}
          >
            {JobModedata.map((mode, idx) => (
              <Picker.Item key={idx} label={mode || 'Select Job Mode'} value={mode} />
            ))}
          </Picker>
        </View>
        {errors.jobMode && <Text style={styles.errorText}>{errors.jobMode}</Text>}

        <Text style={styles.label}>Salary Package</Text>
        <TextInput
          style={styles.input}
          placeholder="Type package"
          value={job.salaryPack || ''}
          onChangeText={(val) => setJob({ ...job, salaryPack: val })}
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleJobUpdate}>
          <Text style={styles.submitButtonText}>Update Job</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PostJobEdit;

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    backgroundColor: '#fff',
       
  },
  scrollContainer: {
    padding: 15,
  },
  label: {
    fontSize: 13,
    color: '#333',
    fontFamily: 'Poppins-Bold',
    marginVertical:8
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
  required:{
    color:"#ff2121"
  },
  textArea: {
    backgroundColor: '#e6eefa',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    textAlignVertical: 'top',
    minHeight: 100,
    marginBottom: 8,
  },
  pickerWrapper: {
    marginBottom: 8,
    overflow: 'hidden',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 10,
    marginTop: 30,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '800',
  },
  input: {
    backgroundColor: '#e6eefa',
    fontSize: 12,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 8,
  
  },
});
