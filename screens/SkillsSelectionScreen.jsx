import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Pressable,
  Keyboard,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

const SkillsSelectionScreen = ({ selected, onSelect }) => {
  const [skills, setSkills] = useState(selected || []);
  const [newSkill, setNewSkill] = useState("");
  const [skillsList, setSkillsList] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef(null);

  const addSkillToSelected = (skillToAdd) => {
    const trimmedSkill = skillToAdd.trim();
    const skillExists = skills.includes(trimmedSkill);

    if (trimmedSkill && !skillExists) {
      const updatedSkills = [...skills, trimmedSkill];
      setSkills(updatedSkills);
      onSelect(updatedSkills);
      setNewSkill("");
      setShowSuggestions(false);
    }
  };

  const addSkill = () => {
    addSkillToSelected(newSkill);
  };

  const handleSelectSuggestion = (skill) => {
    console.log("Selecting skill:", skill);
    addSkillToSelected(skill);
  };

  const removeSkill = (skillToRemove) => {
    const updatedSkills = skills.filter((item) => item !== skillToRemove);
    setSkills(updatedSkills);
    onSelect(updatedSkills);
  };

  // Handle text change - show suggestions when typing
  const handleTextChange = (text) => {
    setNewSkill(text);
    setShowSuggestions(text.length > 0);
  };

  // Handle outside press - but don't interfere with suggestion clicks
  const handleOutsidePress = (event) => {
    // We'll handle this differently to avoid conflicts
    setShowSuggestions(false);
    Keyboard.dismiss();
  };

  useEffect(() => {
    const getInboundSkills = async () => {
      try {
        setFetching(true);
        const skillsRef = doc(db, "masterData", "skills");
        const docSnap = await getDoc(skillsRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.skillsArray && Array.isArray(data.skillsArray)) {
            setSkillsList(data.skillsArray);
          }
        }
      } catch (error) {
        console.error("🔥 Error fetching skills:", error);
      } finally {
        setFetching(false);
      }
    };

    getInboundSkills();
  }, []);

  // Filter skills and only show suggestions if there are results
  const filteredSkills = skillsList
    .filter(
      (skill) =>
        skill.toLowerCase().includes(newSkill.toLowerCase()) &&
        !skills.includes(skill.trim())
    )
    .slice(0, 5);

  const shouldShowSuggestions = showSuggestions && filteredSkills.length > 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Your Skills</Text>

      {/* Input Section */}
      <View style={styles.inputSection}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a skill and press +"
            value={newSkill}
            onChangeText={handleTextChange}
            onSubmitEditing={addSkill}
            placeholderTextColor="#888"
          />
          <Pressable style={styles.addButton} onPress={addSkill}>
            <Ionicons name="add" size={24} color="white" />
          </Pressable>
        </View>

        {fetching && (
          <ActivityIndicator
            size="small"
            color="#1967d2"
            style={{ marginBottom: 10 }}
          />
        )}

        {/* Suggestions Box */}
        {shouldShowSuggestions && (
          <View style={styles.suggestionsBox}>
            {filteredSkills.map((skill, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => {
                  console.log("Pressed suggestion:", skill);
                  handleSelectSuggestion(skill);
                }}
                activeOpacity={0.7}
                style={[
                  styles.suggestionItem,
                  idx === filteredSkills.length - 1 &&
                    styles.suggestionItemLast,
                ]}
              >
                <Text style={styles.suggestionText}>{skill}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Skills Container */}
      <View style={styles.skillsContainer}>
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
      </View>

      {/* Invisible overlay to handle outside clicks - only when suggestions are visible */}
      {shouldShowSuggestions && (
        <Pressable
          style={styles.overlay}
          onPress={() => {
            setShowSuggestions(false);
            Keyboard.dismiss();
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#ffffff",
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
  },
  inputSection: {
    position: "relative",
    zIndex: 20,
  },
  title: {
    fontSize: 22,
    fontFamily: "Poppins-Bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#333",
  },
  inputContainer: {
    flexDirection: "row",
    marginBottom: 0,
    zIndex: 30,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    fontFamily: "Poppins-Regular",
    backgroundColor: "#fff",
  },
  addButton: {
    backgroundColor: "#1967d2",
    borderRadius: 8,
    width: 50,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 15,
    gap: 8,
    zIndex: 10,
  },
  skillItem: {
    flexDirection: "row",
    backgroundColor: "#1967d2",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  skillText: {
    color: "white",
    marginRight: 6,
    fontFamily: "Poppins-Bold",
    fontSize: 14,
  },
  removeButton: {
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  suggestionsBox: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    position: "absolute",
    top: "100%", // Position below input
    left: 0,
    right: 60,
    maxHeight: 150,
    overflow: "hidden",
    marginTop: 4,
    zIndex: 40,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  suggestionItemLast: {
    borderBottomWidth: 0,
  },
  suggestionText: {
    fontSize: 15,
    fontFamily: "Poppins-Regular",
    color: "#333",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    zIndex: 15,
  },
});

export default SkillsSelectionScreen;


