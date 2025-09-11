import React, { useEffect, useState } from 'react';
import { View, Text,Pressable, StyleSheet, SafeAreaView,ScrollView, TextInput, Alert, ActivityIndicator,TouchableOpacity } from 'react-native';
import { MaterialIcons} from '@expo/vector-icons';
import { auth, db } from '../../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';


const ProjectsScreen = () => {
  const [projects,setProjects]=useState([{
    title:"",
    description:"",
    technologies:"",
    url:""
  }])
  const [errors,setErrors]=useState([]);
  const [loading,setLoading]=useState(false);
  const fetchProjects=async()=>{
    setLoading(true);
    const uid=auth.currentUser?.uid || "fA9DeooDHHOpjgsLXiGi2VFeE4y2";
    if(!uid){
      Alert.alert("No Projects found");
    }
    try{
      const snap=await getDoc(doc(db,'users',uid));
      if(snap.data().projects){
        setProjects(snap.data().projects)
        setLoading(false);
      }
      else{
        setProjects(projects);
        setLoading(false);
      }
    }
    catch(err){
      Alert.alert("error",err.message)
    }
    setLoading(false);
   
  }
const validate = () => {
  let valid = true;
  const errorArr = [];

  projects.forEach((project, idx) => {
    const projectError = {
      titleError: '',
      descriptionError: '',
      techError: '',
    };

    if (!project.title.trim()) {
      projectError.titleError = 'Title is required.';
      valid = false;
    }

    if (!project.description.trim()) {
      projectError.descriptionError = 'Description is required.';
      valid = false;
    }

    if (!project.technologies.trim()) {
      projectError.techError = 'Technologies used are required.';
      valid = false;
    }

    errorArr.push(projectError);
  });

  setErrors(errorArr);
  return valid;
};
 const RemoveProjectuInput = (index) => {
     if (projects.length > 1) {
       const newProjects = [...projects];
       newProjects.splice(index, 1);
       setProjects(newProjects);
     } else {
       Alert.alert("Cannot remove", "You must have at least one education entry");
     }
   };


  useEffect(()=>{
        
       fetchProjects();
  },[])
  

const handlechange=(idx,field,value)=>{
 const newProjects=[...projects];
 newProjects[idx][field]=value;
 setProjects(newProjects);
}
const handleAddProjects=()=>{
  setProjects([...projects,{ title:"",
    description:"",
    technologies:"",
    url:""}]);
}
console.log(projects);
const handlesubmit=async()=>{
  if (!validate()) {
    Alert.alert('Validation Failed', 'Please fix the errors before submitting.');
    return;
  }
  const uid=auth.currentUser?.uid || "fA9DeooDHHOpjgsLXiGi2VFeE4y2";
  if(!uid){
    Alert.alert("No Projects found");
  }
  try{
   await updateDoc(doc(db,'users',uid),{projects:projects});
   console.log("updated successfully");
  }
  catch(err){
    Alert.alert("error",err.message)
  }
}
  return (
    loading ? (<View><ActivityIndicator/></View>):(
       <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollWrapper}>
          <Text style={styles.title}>Projects</Text>
        {
          projects.map((project,idx)=>{
            return(
              <View key={idx}>
                <Text style={styles.subheading} >Project {idx+1}</Text>
                 {projects.length > 1 && (
                                     <Pressable 
                                       onPress={() => RemoveProjectuInput(idx)}
                                       style={styles.removeButton}
                                     >
                                       <MaterialIcons name="remove-circle" color="#ff4444" size={24} />
                                     </Pressable>
                    )}
                <View style={styles.inputWrapper}>
                <Text style={styles.label} >Project Title<Text style={styles.required}>*</Text></Text>
                <TextInput value={project.title} onChangeText={(value)=>handlechange(idx,"title",value)} style={styles.input}/>
                   {errors[idx]?.titleError ? <Text style={styles.errorText}>{errors[idx].titleError}</Text> : null}
                </View>
                <View style={styles.inputWrapper}>
                <Text  style={styles.label}>Description<Text style={styles.required}>*</Text></Text>
                <TextInput value={project.description} onChangeText={(value)=>handlechange(idx,"description",value)} style={styles.input}/>
                  {errors[idx]?.descriptionError ? <Text style={styles.errorText}>{errors[idx].descriptionError}</Text> : null}
                </View>
                <View style={styles.inputWrapper}>
                <Text  style={styles.label}>Technologies Used<Text style={styles.required}>*</Text></Text>
                <TextInput value={project.technologies} onChangeText={(value)=>handlechange(idx,"technologies",value)} style={styles.input}/>
                  {errors[idx]?.techError ? <Text style={styles.errorText}>{errors[idx].techError}</Text> : null}
                </View>
               
                <View style={styles.inputWrapper}>
                <Text  style={styles.label}>URL</Text>
                <TextInput value={project.url}  onChangeText={(value)=>handlechange(idx,"url",value)} style={styles.input}/>
                  

                </View>
               
                
              </View>
            )
          })
        }

             <View style={styles.addContainer}>
                          <Pressable onPress={handleAddProjects} style={styles.addButton}>
                            <MaterialIcons name="add-circle" color="#1967d2" size={24} />
                            <Text style={styles.addButtonText}>Add Projects</Text>
                          </Pressable>
             </View>
                  <TouchableOpacity style={styles.button} onPress={handlesubmit}>
                          <Text style={styles.buttonText}>Update</Text>
                  </TouchableOpacity>
     
     

      </ScrollView>
    </SafeAreaView>
    )
  
   
   
  );
};

export default ProjectsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollWrapper: { padding: 20 },
  title: { fontSize: 18,textAlign: "center", marginVertical: 20, fontFamily:"Poppins-Bold" },
  inputWrapper: { },
  input: { flex: 1, paddingVertical: 12,fontSize: 11,fontFamily:'Poppins-Medium' },
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

  subheading: {marginVertical: 10,
     fontSize: 14,
      marginLeft: 12,
      fontFamily:"Poppins-Bold"
    },

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
    marginVertical:10,
    fontSize:13,
    fontFamily:"Poppins-Regular"
  },
  required:{
    color:"#ff2121"
  },
  errorText:{
    color:'red',
    marginTop:4,
    fontSize:12
  },
});
