import { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  TextInput,
  Pressable,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import {MaterialIcons,Feather} from "@expo/vector-icons";

import { auth, db } from "../../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function SkillsUpdateScreen({ navigation }) {
  const [skills, setSkills] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error,setError] = useState('');

  const uid = auth.currentUser?.uid;

  useEffect(() => {
    const fetchSkills = async () => {
      if (!uid) return;

      try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const skillsData = userData.skills || [];
          setSkills(skillsData);
        }
      } catch (error) {
        console.error("Error fetching skills:", error);
        Alert.alert("Error", "Failed to load skills data");
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  const addSkill = () => {
    const trimmed = input.trim();
    if(skills.length >=0){
      setError('');
    }
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setInput("");
      Keyboard.dismiss();
    }
  };

  const removeSkill = (index) => {
    const updatedSkills = [...skills];
    updatedSkills.splice(index, 1);
    setSkills(updatedSkills);
  };
 function validation(){
    let valid=true;
    if(skills.length<=0){
      setError('Atleast add one skill');
       valid=false;
    }
    else{
      setError('');
    }
    return valid;

  }

  const handleUpdateSkills = async () => {
    if (!validation()) return;
    if (skills.length === 0) {
      Alert.alert("Validation Error", "Please add at least one skill");
      return;
    }

    try {
      setUpdating(true);
      await updateDoc(doc(db, "users", uid), {
        skills: skills,
        updatedAt: new Date(),
      });
      Alert.alert("Success", "Skills updated successfully");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating skills: ", error);
      Alert.alert("Error", "Failed to update skills");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1967d2" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.wrapper} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Update Your Skills</Text>

        <View style={styles.inputRow}>
          <Text style={styles.label}>Enter Skills</Text>
          <View style={styles.inputContainer}>
          <TextInput
            placeholder="Enter a skill"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={addSkill}
            style={styles.input}
          />
          <Pressable onPress={addSkill} style={styles.addButton}>
            <MaterialIcons name="add-circle" size={28} color="#1967d2" />
          </Pressable>

          </View>
          
        </View>

        <View style={styles.tagContainer}>
          {skills.map((skill, index) => (
            <View key={index} style={styles.skillTag}>
              <Text style={styles.skillText}>{skill}</Text>
              <Pressable onPress={() => removeSkill(index)}>
                <MaterialIcons name="close" size={16} color="#fff" />
              </Pressable>
            </View>
          ))}
          <Text>{error}</Text>
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleUpdateSkills}
          disabled={updating}
        >
          {updating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.saveText}>Update Skills</Text>
              
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  wrapper: {
    padding: 20,
  },
  title: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  inputRow: {
    
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  inputContainer:{
   flexDirection:'row',
   alignItems:'center'
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f4f6f9",
    borderRadius: 8,
    padding: 12,
    fontSize: 12,
  },
  addButton: {
    paddingHorizontal: 5,
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 30,
  },
  skillTag: {
    flexDirection: "row",
    backgroundColor: "#1967d2",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: "center",
    gap: 6,
  },
  skillText: {
    color: "#fff",
    fontSize: 13,
    fontWeight:'bold'
  },
  saveButton: {
    backgroundColor: "#1967d2",
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  saveText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  saveIcon: {
    marginLeft: 5,
  },
  label: {
    alignSelf: 'flex-start',
    fontWeight: '500',
    marginBottom: 5,
    marginTop: 15
  },
  
});
