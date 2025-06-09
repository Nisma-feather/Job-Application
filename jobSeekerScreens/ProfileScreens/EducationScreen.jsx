import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text, View, ScrollView, TouchableOpacity ,Pressable,TextInput,StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import {MaterialIcons} from '@expo/vector-icons'
import { auth, db } from '../../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const EducationScreen = ({navigation}) => {
  const [educationDetails, setEducationDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors,setErrors]=useState([{}]);

  // Handle field changes
  const handleChange = (field, index, value) => {
    const newEducationDetails = [...educationDetails];
    newEducationDetails[index][field] = value;
    setEducationDetails(newEducationDetails);
  };

  // Add new empty education field
  const handleAddEduInput = () => {
    setEducationDetails([...educationDetails,
      { type: '', name: '', institute: '', percentage: '' }
    ]);
  };

  // Remove education field
  const handleRemoveEduInput = (index) => {
    if (educationDetails.length > 1) {
      const newEducationDetails = [...educationDetails];
      newEducationDetails.splice(index, 1);
      setEducationDetails(newEducationDetails);
    } else {
      Alert.alert("Cannot remove", "You must have at least one education entry");
    }
  };

  // Fetch education data from Firestore
  const fetchEducation = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    try {
      setLoading(true);
      const snap = await getDoc(doc(db, 'users', uid));
      
      if (snap.exists()) {
        const userData = snap.data();
        // Initialize with empty array if no education data exists
        const eduData = userData.education || [{ type: '', name: '', institute: '', percentage: '' }];
        setEducationDetails(eduData);
      }
    } catch (err) {
      console.error("Error fetching education:", err);
      // Initialize with empty fields if error occurs
      setEducationDetails([{ type: '', name: '', institute: '', percentage: '' }]);
    } finally {
      setLoading(false);
    }
  };
  // Validation before Updation

  const validate=()=>{
    let valid=true;
    const newerrors=educationDetails.map((edu)=>{
       const errors={
          typeError:"",
          nameError:"",
          instituteError:"",
          percentageError:""
       }
       if(!edu.type.trim()){
          errors.typeError="This Field is Required"
       }
       if(!edu.name.trim()){
          errors.nameError="This Field is Required"
       }
      if(!edu.institute.trim()){
         errors.instituteError="This Field is Required"
       }
       if(edu.percentage.trim()){
          if(!(edu.percentage >=1 && edu.percentage<=100)){
                errors.percentageError="cgpc/percenteage must be a valid number"
          }
       }
       return errors;
    })
    
   setErrors(newerrors);
   return valid;

 }

  // Update education in Firestore
  const handleEducationUpdate = async () => {
    if(!validate()){
      return
   }
    const uid = auth.currentUser?.uid;
    if (!uid) return;
     
     
    // for (const edu of educationDetails) {
    //   if (!edu.type || !edu.name || !edu.institute || !edu.percentage) {
    //     Alert.alert("Validation Error", "Please fill all fields for all education entries");
    //     return;
    //   }
    // }
    try {
      setLoading(true);
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, { 
        education: educationDetails,
        updatedAt: new Date() 
      });
      console.log("updated successfully")
      Alert.alert("Success", "Education details updated successfully");
      navigation.navigate("ProfileHome");
    } catch (err) {
      console.error("Error updating education:", err);
      console.log("Error in updating")
      Alert.alert("Error", "Failed to update education details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEducation();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollWrapper}>
        <Text style={styles.title}>Education Details</Text>

        {loading ? (
          <Text>Loading...</Text>
        ) : (
          <>
            {educationDetails.map((edu, index) => (
              <View key={index} style={styles.eduContainer}>
                <View style={styles.eduHeader}>
                  <Text style={styles.subheading}>Education {index + 1}</Text>
                  {educationDetails.length > 1 && (
                    <Pressable 
                      onPress={() => handleRemoveEduInput(index)}
                      style={styles.removeButton}
                    >
                      <MaterialIcons name="remove-circle" color="#ff4444" size={24} />
                    </Pressable>
                  )}
                  
                </View>

                <View style={styles.pickerWrapper}>
                   <Text style={styles.label}>Education Type<Text style={styles.required}>*</Text></Text>
                  <Picker 
                    selectedValue={edu.type} 
                    style={styles.picker}
                    onValueChange={(val) => handleChange("type", index, val)}
                  >
                    <Picker.Item label='Select Education Type' value="" />
                    <Picker.Item label="Diploma" value="diploma" />
                    <Picker.Item label="Higher Secondary" value="hsc" />
                    <Picker.Item label="Secondary School (SSLC)" value="sslc" />
                    <Picker.Item label="UG Degree" value="ug_degree" />
                    <Picker.Item label="PG Degree" value="pg_degree" />
                  </Picker>
                  {errors[index]?.typeError?<Text style={styles.errorText}>{errors[index].typeError}</Text>:null}
                </View>

                <View style={styles.inputWrapper}>
                   <Text style={styles.label}>Specialization<Text style={styles.required}>*</Text></Text>
                  <TextInput 
                    
                    value={edu.name} 
                    style={styles.input} 
                    onChangeText={(val) => handleChange("name", index, val)} 
                  />
                  {errors[index]?.nameError?<Text style={styles.errorText}>{errors[index].nameError}</Text>:null}
                </View>
                <View style={styles.inputWrapper}>
                   <Text style={styles.label}>Institute/University Name<Text style={styles.required}>*</Text></Text>
                  <TextInput 
                    
                    value={edu.institute}  
                    style={styles.input} 
                    onChangeText={(val) => handleChange("institute", index, val)} 
                  />
                  {errors[index]?.instituteError?<Text style={styles.errorText}>{errors[index].instituteError}</Text>:null}
                </View>
                <View style={styles.inputWrapper}>
                   <Text style={styles.label}>Percentage/CGPA</Text>
                  <TextInput 
                    
                    value={edu.percentage} 
                    style={styles.input} 
                    onChangeText={(val) => handleChange("percentage", index, val)}
                    keyboardType="numeric"
                  />
                  {errors[index]?.percentageError?<Text style={styles.errorText}>{errors[index].percentageError}</Text>:null}
                </View>
              </View>
            ))}

            <View style={styles.addContainer}>
              <Pressable onPress={handleAddEduInput} style={styles.addButton}>
                <MaterialIcons name="add-circle" color="#1967d2" size={24} />
                <Text style={styles.addButtonText}>Add Education</Text>
              </Pressable>
            </View>

            <TouchableOpacity 
              style={styles.button} 
              onPress={handleEducationUpdate}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Updating...' : 'Update Education'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: "white",
    },
    scrollWrapper: {
      padding: 20,
      paddingBottom: 40,
    },
    title: {
      fontSize: 22,
      fontWeight: "700",
      color: "#333",
      textAlign: "center",
      marginVertical: 20,
    },
    eduContainer: {
      backgroundColor: "#ffffff",
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      
    },
    label: {
      alignSelf: 'flex-start',
      fontWeight: '500',
      marginVertical:10
    },
    required:{
      color:"#ff2121"
    },
    eduHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    subheading: {
      fontSize: 16,
      fontWeight: "600",
      color: "#555",
    },
    pickerWrapper: {
      
     
      

      overflow: "hidden",
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
    inputWrapper: {
      
    },
    input: {
      backgroundColor: '#e6eefa',
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      color: "#333",
    },
    removeButton: {
      padding: 4,
    },
    addContainer: {
      alignItems: 'center',
      marginBottom: 20,
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
    button: {
      backgroundColor: "#1967d2",
      borderRadius: 24,
      paddingVertical: 14,
      alignItems: "center",
      shadowColor: "#1967d2",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    },
    buttonText: {
      color: "#ffffff",
      fontWeight: "bold",
      fontSize: 16,
    },
    errorText:{
      color:'red',
      marginTop:4,
      fontSize:12
    },
    label: {
      alignSelf: 'flex-start',
      fontWeight: '500',
      marginVertical:10
    },
  });

export default EducationScreen;