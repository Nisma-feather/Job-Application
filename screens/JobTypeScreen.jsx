import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import{ MaterialCommunityIcons} from '@expo/vector-icons';
const JobTypeScreen = ({ selected, onSelect }) => {
  const jobTypes = [
    'Full Time',
    'Part Time',
    'Contract',
    'Freelance',
    'Internship',
    
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What type of job are you looking for?</Text>
      <View style={styles.optionsContainer}>
        {jobTypes.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.option,
              selected === type && styles.selectedOption
            ]}
            onPress={() => onSelect(type)}
          >
            { selected === type ?
                         <MaterialCommunityIcons name="checkbox-marked" color="#1967d2" size={24} />:
                         <MaterialCommunityIcons name="checkbox-blank-outline" color="#f9f9f9" size={24} /> 
                         }
            <Text style={styles.optionText}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor:'white',
    borderTopRightRadius:20,
    borderTopLeftRadius:20
  },
  title: {
    fontSize: 22,
    fontFamily:'Poppins-Bold',
    color:'#444',
    marginVertical: 30,
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: 30,
  },
  option: {
    flexDirection:'row',
      gap:13,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  selectedOption: {
    backgroundColor: '#e6f0ff',
    borderColor: '#1967d2',
  },
  optionText: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily:'Poppins-Regular'
  },
});

export default JobTypeScreen;