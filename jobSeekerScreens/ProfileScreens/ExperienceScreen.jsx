import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text, View, ScrollView, Pressable, StyleSheet, Alert, TouchableOpacity, TextInput } from 'react-native';
import { auth, db } from '../../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import {MaterialIcons,Ionicons} from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const ExperienceScreen = ({ navigation }) => {
  const [experienceDetails, setExperienceDetails] = useState([{ role: '', company: '', from: '', to: '' }]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const [showPicker, setShowPicker] = useState({
    index: null,
    field: null,
  })
  const today=new Date()
  const handleChange = (field, index, value) => {
    const newExperiences = [...experienceDetails];
    newExperiences[index][field] = value;
    setExperienceDetails(newExperiences);
  };
   

  

  const handleAddExperience = () => {
    setExperienceDetails([...experienceDetails, { role: '', company: '', from: '', to: '' }]);
  };

  const fetchExperience = async () => {
    const uid = auth.currentUser?.uid || "fA9DeooDHHOpjgsLXiGi2VFeE4y2";
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      console.log(snap.data())
      const data = snap.data()?.experience || [{ role: '', company: '', from: '', to: '' }];
      console.log("experiences",data)
      setExperienceDetails(data);
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExperienceUpdate = async () => {
    if (!validate()) {
      return
    }
    const uid = auth.currentUser?.uid || "fA9DeooDHHOpjgsLXiGi2VFeE4y2";
    console.log(experienceDetails);
    try {
      const userRef = doc(db, "users", uid);
      
      await updateDoc(userRef, { experience: experienceDetails });
      Alert.alert("Experience Details Updated");
      navigation.navigate("ProfileHome");
    } catch (err) {
      Alert.alert("Error Updating", err.message);
    }
  };
  const validate = () => {
    let valid = true;
    let errorsArr = [];
    experienceDetails.map((item) => {
      const expErrors = {
        roleError: "",
        companyError: "",
        fromError: '',
        toError: ''
      }
      if (!item.role.trim()) {
        valid = false;
        expErrors.roleError = "This field is required"
      }
      if (!item.company.trim()) {
        valid = false;
        expErrors.companyError = "This field is required"
      }
      // if (!item.from.trim()) {
      //   valid = false;
      //   expErrors.fromError = "This field is required"
      // }
      // if (!item.to.trim()) {
      //   valid = false;
      //   expErrors.toError = "This field is required"
      // }
      errorsArr.push(expErrors);
    })
    setErrors(errorsArr)
    return valid;


  }
  const handleDateChange = (event, selectedDate, index, field) => {
    if (event.type === "set") {
      const formattedDate = selectedDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }); // or use a better format if needed
      const updated = [...experienceDetails];
      updated[index][field] = formattedDate;
      setExperienceDetails(updated);
    }
    setShowPicker({ index: null, field: null }); // close picker
  };


  useEffect(() => {
    fetchExperience();
  }, []);
  console.log(errors);
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollWrapper}>
        <Text style={styles.title}>Experience Details</Text>

        {loading ? (
          <Text style={{ textAlign: "center", marginTop: 50 }}>Loading...</Text>
        ) : (
          experienceDetails.map((exp, index) => (
            <View key={index}>
              <Text style={styles.subheading}>Experience {index + 1}</Text>

              <View style={styles.inputWrapper}>
                <Text style={styles.label}>
                  Role<Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  value={exp.role}
                  style={styles.input}
                  onChangeText={(val) => handleChange("role", index, val)}
                />
                {errors[index]?.roleError ? (
                  <Text style={styles.errorText}>
                    {errors[index]?.roleError}
                  </Text>
                ) : null}
              </View>
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>
                  Company Name<Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  value={exp.company}
                  style={styles.input}
                  onChangeText={(val) => handleChange("company", index, val)}
                />
                {errors[index]?.roleError ? (
                  <Text style={styles.errorText}>
                    {errors[index]?.companyError}
                  </Text>
                ) : null}
              </View>
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>
                  From<Text style={styles.required}>*</Text>
                </Text>
                <Pressable
                  style={styles.input}
                  onPress={() => setShowPicker({ index, field: "from" })}
                >
                  <Text>{exp.from ? exp.from : "Select Date"}</Text>
                </Pressable>

                {errors[index]?.roleError ? (
                  <Text style={styles.errorText}>
                    {errors[index]?.fromError}
                  </Text>
                ) : null}
              </View>
              {showPicker.index === index && showPicker.field === "from" && (
                <DateTimePicker
                  value={exp.from ?new Date(exp.from):new Date()}
                  mode="date"
                  display="default"
                 
                  maximumDate={today}
                  onChange={(event, selectedDate) =>
                    handleDateChange(event, selectedDate, index, "from")
                  }
                />
              )}

              <View style={styles.inputWrapper}>
                <Text style={styles.label}>
                  To<Text style={styles.required}>*</Text>
                </Text>
                <Pressable style={styles.input} onPress={()=>setShowPicker({index,field:"to"})}>
                  {exp.to?<Text>{exp.to}</Text>:<Text>Select Date</Text>}
                </Pressable>
                {errors[index]?.roleError ? (
                  <Text style={styles.errorText}>{errors[index]?.toError}</Text>
                ) : null}
              </View>
              {
                showPicker.index === index && showPicker.field === "to" && (
                  <DateTimePicker 
                   value={exp.to?new Date(exp.to):new Date()}
                   mode="date"
                   display='default'
                   
                   maximumDate={today}
                   onChange={(event,selectedDate)=> handleDateChange(event,selectedDate,index,"to")}
                  />
                )
              }
            </View>
          ))
        )}

        <View style={styles.addContainer}>
          <Pressable onPress={handleAddExperience} style={styles.addButton}>
            <MaterialIcons name="add-circle" color="#1967d2" size={24} />
            <Text style={styles.addButtonText}>Add Experience</Text>
          </Pressable>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleExperienceUpdate}
        >
          <Text style={styles.buttonText}>Update</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ExperienceScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollWrapper: { padding: 20 },
  title: { fontSize: 20, fontWeight: "600", textAlign: "center", marginVertical: 20 },
  inputWrapper: {},
  input: { flex: 1, paddingVertical: 12, fontSize: 14 },
  button: { backgroundColor: "#1967d2", borderRadius: 20, paddingVertical: 14, alignItems: "center", elevation: 5 },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  addContainer: {
    alignItems: 'center',
    marginVertical:15
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: "#e1ecf7",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addButtonText: {
    color: "#1967d2",
    fontWeight: "600",
    fontSize: 14,
  },
  subheading: { fontWeight: "bold", marginVertical: 10, fontSize: 15, marginLeft: 12 },
  input: {
    width: '100%',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#e6eefa'
  },
  label: {
    alignSelf: 'flex-start',
    fontWeight: '500',
    marginVertical: 10
  },
  required: {
    color: "#ff2121"
  },
  errorText: {
    color: 'red',
    marginTop: 4,
    fontSize: 12
  },
});
