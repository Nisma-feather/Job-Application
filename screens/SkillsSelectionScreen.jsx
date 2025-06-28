import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Keyboard } from 'react-native';

const SkillsSelectionScreen = ({ selected, onSelect }) => {
  const [skills, setSkills] = useState(selected || []);
  const [newSkill, setNewSkill] = useState('');

  const addSkill = () => {
    Keyboard.dismiss();
    const trimmedSkill = newSkill.trim();
    const skillExists = skills.includes(trimmedSkill);

    if (trimmedSkill && !skillExists) {
      const updatedSkills = [...skills, trimmedSkill];
      setSkills(updatedSkills);
      onSelect(updatedSkills);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    const updatedSkills = skills.filter(item => item !== skillToRemove);
    setSkills(updatedSkills);
    onSelect(updatedSkills);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Your Skills</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a skill and press +"
          value={newSkill}
          onChangeText={setNewSkill}
          onSubmitEditing={addSkill}
        />
        <Pressable style={styles.addButton} onPress={addSkill}>
          <Ionicons name="add" size={24} color="white" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.skillsContainer}>
        {skills.map((item) => (
          <View key={item} style={styles.skillItem}>
            <Text style={styles.skillText}>{item}</Text>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeSkill(item)}
            >
              <Ionicons name="close" size={16} color="white" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
  },
  title: {
    fontSize: 16,
   fontFamily:"Poppins-Bold",
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 12,
    fontFamily:"Poppins-Regular"
  },
  addButton: {
    backgroundColor: '#1967d2',
    borderRadius: 8,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillItem: {
    flexDirection: 'row',
    backgroundColor: '#1967d2',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  skillText: {
    color: 'white',
    marginRight: 6,
    fontFamily:"Poppins-Bold",
    fontSize:13
  },
  removeButton: {
    backgroundColor: '#104a8e',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SkillsSelectionScreen;
