import { useEffect, useState } from 'react';
import { View, TextInput, Button, Text,StatusBar,StyleSheet,SafeAreaView,ScrollView,Alert,TouchableOpacity,Pressable} from 'react-native';

import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth,db} from '../../firebaseConfig';
import {FontAwesome,Feather} from "@expo/vector-icons"
import { Picker } from "@react-native-picker/picker";
const PersonalInfoScreen = ({navigation}) => {
    const [formData, setFormData] = useState({
        name: "",
        phone:"",
        address: "",
        gender: "",
      });
  const [loading, setLoading] = useState(true);
   const [errors, setErrors] = useState({});
  const genderValue = ['Male', 'Female', 'Other'];

  const handleValidation = () => {
    let valid=true;
   
    let tempErrors = {};
    if (!formData.name){ 
        valid=false
        tempErrors.name = 'Name is required';}
        else{
            
            tempErrors.name=''
        }
    if (!formData.phone){ valid=false
        tempErrors.phone = 'Phone number is required';}
        else if (!/^\d{10}$/.test(formData.phone)) {
          valid = false;
          tempErrors.phone = 'Phone number must be 10 digits';
        } else {
          tempErrors.phone = '';
        }
    if (!formData.gender){ valid=false
        tempErrors.gender = 'Please select a gender';}
       else{
        tempErrors.gender=''
       }

    setErrors(tempErrors);
    return valid
  };

  const userId = auth.currentUser?.uid || "fA9DeooDHHOpjgsLXiGi2VFeE4y2" ;
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRef = doc(db, "users", userId);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const data = docSnap.data().personalData;
          console.log(data)
          setFormData({
            name: data.name || "",
            address: data.address || "",
            gender: data.gender || "",
            phone:data.phone || ""
          });
        }
      } catch (error) {
        console.error("Error fetching personal info:", error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleUpdate = async () => {
    if(!handleValidation()){
      return
    }
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {personalData:formData});
      Alert.alert("Success", "Personal Information Updated Successfully!");
      navigation.navigate('ProfileHome')

    } catch (error) {
      console.error("Error updating personal info:", error);
      Alert.alert("Error", "Failed to update information. Try again.");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: "center", marginTop: 20 }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    
        <SafeAreaView style={styles.container}>
              <ScrollView contentContainerStyle={styles.scroll}>
                {/* Profile Image */}
                
        
                <Text style={styles.header}>Complete Your Profile</Text>
                <Text style={styles.subtext}>Rest assured, your personal data is visible only to you. No one else will have access to it.</Text>
        
                {/* Name */}
                <Text style={styles.label}>Name<Text style={styles.required}>*</Text></Text>
                <TextInput
                 
                  style={[styles.input, errors.name && styles.errorBorder]}
                  onChangeText={(val) => setFormData({ ...formData, name: val })}
                  value={formData.name}
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        
                {/* Phone */}
                <Text style={styles.label}>Phone Number <Text style={styles.required}>*</Text></Text>
                <TextInput
                  
                  keyboardType="phone-pad"
                  style={[styles.input, errors.phone && styles.errorBorder]}
                  onChangeText={(val) => setFormData({ ...formData, phone: val })}
                  value={formData.phone}
                />
                {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
        
                {/* Gender */}
                <Text style={styles.label}>Gender <Text style={styles.required}>*</Text></Text>
                <View style={styles.genderContainer}>
                  {genderValue.map((item, idx) => (
                    <Pressable
                      key={idx}
                      style={[
                        styles.genderOption,
                        formData.gender === item && styles.genderOptionSelected
                      ]}
                      onPress={() => setFormData({ ...formData, gender: item })}
                    >
                      <FontAwesome name="circle-o" color={formData.gender===item?'blue':'#999'} size={17} />
                      <Text>{item}</Text>
                    </Pressable>
                  ))}
                </View>
                {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
                <Text style={styles.label}>Address</Text>
                <TextInput
                  multiline
                  keyboardType="phone-pad"
                  style={[styles.input, errors.phone && styles.errorBorder]}
                  onChangeText={(val) => setFormData({ ...formData, address: val })}
                  value={formData.address}
                />
                {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
        
                {/* Submit */}
                <TouchableOpacity style={styles.button} onPress={handleUpdate}>
                  <Text style={styles.buttonText}>Update</Text>
                </TouchableOpacity>
              </ScrollView>
            </SafeAreaView>
       
  );
};

export default PersonalInfoScreen;

// styles same as you sent
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scroll: {
    padding: 20,
    alignItems: 'center'
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e6e6e6'
  },
  editBtn: {
    marginTop: 10,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5
  },
  editText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center'
  },
  subtext: {
    fontSize: 13,
    color: '#777',
    marginBottom: 20,
    textAlign: 'center'
  },
  label: {
    alignSelf: 'flex-start',
    fontWeight: '500',
    marginBottom: 5,
    marginTop: 15
  },
  input: {
    width: '100%',
   
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#e6eefa'
  },
  genderContainer: {
    flexDirection: 'row',
     gap:15,
    flexWrap:'wrap',
    width: '100%',
    
    marginTop: 5
  },
  genderOption: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    flexDirection:'row'
    ,justifyContent:'center',
    gap:6
  },
  required:{
    color:"#ff2121"
  },
  genderOptionSelected: {
    borderColor: '#007BFF',
    borderWidth:2
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
    fontWeight: 'bold',
    textAlign: 'center'
  },
  errorText: {
    color: 'red',
    alignSelf: 'flex-start',
    marginTop: 4
  },
  errorBorder: {
    borderColor: 'red'
  }
});
 
