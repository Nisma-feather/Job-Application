import { doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ScrollView, StyleSheet, TextInput, Text, TouchableOpacity, SafeAreaView,
  View, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { db } from '../firebaseConfig';

const PostJobEdit = ({ route, navigation }) => {
  const { JobId } = route.params;
  const [job, setJob] = useState({});
  const [updating, setUpdating] = useState(false);
  const [skillsRequired, setSkillsRequired] = useState('');
  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  const expYeardata = ['', 'Fresher', "0 - 1 Year", "2-5 Years", "More than 5 Years", "More than 10 Years"];
  const JobTypedata = ['', 'Full Time', 'Part Time', 'Contract', 'Freelance', 'Internship'];
  const JobModedata = ['', 'Hybrid', "Remote", "OnSite"];
  const JobStatus = ['Open', 'Closed', 'Expired'];

  const fetchJobDetails = async () => {
    if (!JobId) return;
    try {
      const ref = doc(db, 'jobs', JobId);
      const snap = await getDoc(ref);
      const data = snap.data();

      if (data) {
        const expiryDate = data.expiryDate ? new Date(data.expiryDate.toDate ? data.expiryDate.toDate() : data.expiryDate) : null;
        const isExpired = expiryDate && expiryDate < new Date();

        setJob({
          ...data,
          requirements: (data.requirements || []).join('. '),
          responsibilities: (data.responsibilities || []).join('. '),
          expiryDate,
          status: isExpired ? 'Expired' : data.status || 'Open',
        });
        setSkillsRequired((data.skillsRequired || []).join(', '));
      }
    } catch (e) {
      console.log("Can't fetch job details", e);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, []);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setJob({ ...job, expiryDate: selectedDate });
    }
  };

  const validateFields = () => {
    const newErrors = {};
    if (!job.jobrole?.trim()) newErrors.jobrole = 'Job role is required';
    if (!job.locations?.trim()) newErrors.locations = 'Location is required';
    if (!skillsRequired.trim()) newErrors.skillsRequired = 'Skills are required';
    if (!job.jobType?.trim()) newErrors.jobType = 'Job type is required';
    if (!job.jobMode?.trim()) newErrors.jobMode = 'Job mode is required';
    if (!job.expYear?.trim()) newErrors.expYear = 'Experience level is required';
    if (job.status !== 'Expired' && !job.expiryDate) newErrors.expiryDate = 'Set a Job Expiry date';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleJobUpdate = async () => {
    if (!validateFields()) return;

    try {
      setUpdating(true);
      const ref = doc(db, 'jobs', JobId);

      let updatedStatus = job.status;
      if (job.expiryDate && new Date(job.expiryDate) < new Date()) {
        updatedStatus = 'Expired';
      }

      await updateDoc(ref, {
        ...job,
        status: updatedStatus,
        expiryDate: job.expiryDate ? job.expiryDate : null,
        requirements: job.requirements.split('. '),
        responsibilities: job.responsibilities.split('.'),
        skillsRequired: skillsRequired
          .split(',')
          .map(skill => skill.trim())
          .filter(skill => skill),
      });

      Alert.alert("✅ Job Updated Successfully");
      navigation.navigate("Post Job HomeScreen");
    } catch (e) {
      console.log("Can't update job", e);
    } finally {
      setUpdating(false);
    }
  };

  const isDatePickerDisabled = job.status === 'Expired';

  return (
    <SafeAreaView style={styles.formContainer}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* --- Existing fields remain same --- */}
          <Text style={styles.label}>
            Job Role <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Type Job Role"
            value={job.jobrole || ""}
            onChangeText={(val) => setJob({ ...job, jobrole: val })}
          />
          {errors.jobrole && (
            <Text style={styles.errorText}>{errors.jobrole}</Text>
          )}

          <Text style={styles.label}>No of Vacancies</Text>
          <TextInput
            style={styles.input}
            placeholder="Type vacancies"
            value={job.vacancies || ""}
            onChangeText={(val) => setJob({ ...job, vacancies: val })}
            keyboardType="numeric"
          />

          <Text style={styles.label}>
            Location <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Type Location"
            value={job.locations || ""}
            onChangeText={(val) => setJob({ ...job, locations: val })}
          />
          {errors.locations && (
            <Text style={styles.errorText}>{errors.locations}</Text>
          )}

          <Text style={styles.label}>Requirements</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Enter requirements"
            value={job.requirements || ""}
            onChangeText={(val) => setJob({ ...job, requirements: val })}
            multiline
            numberOfLines={4}
          />
          <Text style={styles.label}>
            Skills Required <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., React, JavaScript"
            value={skillsRequired}
            onChangeText={(val) => setSkillsRequired(val)}
          />
          {errors.skillsRequired && (
            <Text style={styles.errorText}>{errors.skillsRequired}</Text>
          )}

          <Text style={styles.label}>Roles & Responsibilities</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Enter responsibilities"
            value={job.responsibilities || ""}
            onChangeText={(val) => setJob({ ...job, responsibilities: val })}
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>
            Experience Level <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.pickerWrapper}>
            <Picker
              style={styles.picker}
              selectedValue={job.expYear || ""}
              onValueChange={(val) => setJob({ ...job, expYear: val })}
            >
              {expYeardata.map((exp, idx) => (
                <Picker.Item
                  key={idx}
                  label={exp || "Select Experience"}
                  value={exp}
                />
              ))}
            </Picker>
          </View>
          {errors.expYear && (
            <Text style={styles.errorText}>{errors.expYear}</Text>
          )}

          <Text style={styles.label}>
            Job Type <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.pickerWrapper}>
            <Picker
              style={styles.picker}
              selectedValue={job.jobType || ""}
              onValueChange={(val) => setJob({ ...job, jobType: val })}
            >
              {JobTypedata.map((type, idx) => (
                <Picker.Item
                  key={idx}
                  label={type || "Select Job Type"}
                  value={type}
                />
              ))}
            </Picker>
          </View>
          {errors.jobType && (
            <Text style={styles.errorText}>{errors.jobType}</Text>
          )}

          <Text style={styles.label}>
            Job Mode <Text style={styles.required}>*</Text>
          </Text>
          <View>
            <Picker
              style={styles.picker}
              selectedValue={job.jobMode || ""}
              onValueChange={(val) => setJob({ ...job, jobMode: val })}
            >
              {JobModedata.map((mode, idx) => (
                <Picker.Item
                  key={idx}
                  label={mode || "Select Job Mode"}
                  value={mode}
                />
              ))}
            </Picker>
          </View>
          {errors.jobMode && (
            <Text style={styles.errorText}>{errors.jobMode}</Text>
          )}

          <Text style={styles.label}>Salary Package</Text>
          <TextInput
            style={styles.input}
            placeholder="Type package"
            value={job.salaryPack || ""}
            onChangeText={(val) => setJob({ ...job, salaryPack: val })}
          />

          {/* Expiry Date Picker */}
          <Text style={styles.label}>
            Job Expiry Date <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={[styles.input, { justifyContent: "center" }]}
            disabled={isDatePickerDisabled}
            onPress={() => setShowDatePicker(true)}
          >
            <Text>
              {job.expiryDate
                ? new Date(job.expiryDate).toDateString()
                : "Select Expiry Date"}
            </Text>
          </TouchableOpacity>
          {errors.expiryDate && (
            <Text style={styles.errorText}>{errors.expiryDate}</Text>
          )}

          {showDatePicker && (
            <DateTimePicker
              value={job.expiryDate || new Date()}
              mode="date"
              minimumDate={new Date()}
              display="default"
              onChange={handleDateChange}
            />
          )}

          {/* Job Status Picker */}
          <Text style={styles.label}>Job Status</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={job.status || "Open"}
              onValueChange={(val) => setJob({ ...job, status: val })}
              style={styles.picker}
            >
              {JobStatus.map((st, i) => (
                <Picker.Item key={i} label={st} value={st} />
              ))}
            </Picker>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitButton, { opacity: updating ? 0.6 : 1 }]}
            disabled={updating}
            onPress={handleJobUpdate}
          >
            <Text style={styles.submitButtonText}>
              {updating ? "Updating..." : "Update Job"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
