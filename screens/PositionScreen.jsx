import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons';

const PositionScreen = ({ selected, onSelect }) => {
  const positions = [
    'Developer',
    'Designer',
    'Marketing Executive',
    'Buisness Management',
    'SEO Analyst',
    'Networking'
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What Job you Really want </Text>
      <View style={styles.optionsContainer}>
        {positions.map((level) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.option,
              selected === level && styles.selectedOption
            ]}
            onPress={() => onSelect(level)}
          >  { selected === level ?
             <MaterialCommunityIcons name="checkbox-marked" color="#1967d2" size={24} />:
             <MaterialCommunityIcons name="checkbox-blank-outline" color="#f9f9f9" size={24} /> 
             }
            <Text style={styles.optionText}>{level}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// Use similar styles as JobTypeScreen or customize as needed
export default PositionScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "white",
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,

},
  title: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    marginBottom: 30,
    textAlign: "center",
  },
  optionsContainer: {
    marginBottom: 30,
  },
  option: {
    flexDirection: "row",
    gap: 13,
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  selectedOption: {
    backgroundColor: "#e6f0ff",
    borderColor: "#1967d2",
  },
  optionText: {
    fontSize: 14,
    textAlign: "center",
    color: "#555",
    fontFamily: "Poppins-Regular",
  },
});