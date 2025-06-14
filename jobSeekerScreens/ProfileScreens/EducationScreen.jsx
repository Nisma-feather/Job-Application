import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Pressable,
  TextInput,
  StyleSheet,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialIcons } from "@expo/vector-icons";
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Fontisto } from "@expo/vector-icons";
const EducationScreen = ({ navigation }) => {
  const [educationDetails, setEducationDetails] = useState([
    {
      type: "",
      name: "",
      institute: "",
      percentage: "",
      from: "",
      to: "",
      isPresent: false,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([{}]);
  const [showPicker, setShowPicker] = useState({ index: null, field: null });

  const handleChange = (field, index, value) => {
    const newEducationDetails = [...educationDetails];
    newEducationDetails[index][field] = value;
    setEducationDetails(newEducationDetails);
  };

  const handleAddEduInput = () => {
    setEducationDetails((prev) => [
      ...prev,
      {
        type: "",
        name: "",
        institute: "",
        percentage: "",
        from: "",
        to: "",
        isPresent: false,
      },
    ]);
    setErrors((prev) => [...prev, {}]);
  };

  const handleRemoveEduInput = (index) => {
    if (educationDetails.length > 1) {
      const newEducationDetails = [...educationDetails];
      newEducationDetails.splice(index, 1);
      const newErrors = [...errors];
      newErrors.splice(index, 1);
      setEducationDetails(newEducationDetails);
      setErrors(newErrors);
    } else {
      Alert.alert(
        "Cannot remove",
        "You must have at least one education entry"
      );
    }
  };

  const fetchEducation = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    try {
      setLoading(true);
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) {
        const userData = snap.data();
        const eduData = userData.education || [
          {
            type: "",
            name: "",
            institute: "",
            percentage: "",
            from: "",
            to: "",
            isPresent: false,
          },
        ];
        setEducationDetails(eduData);
        setErrors(eduData.map(() => ({})));
      }
    } catch (err) {
      console.error("Error fetching education:", err);
      setEducationDetails([
        {
          type: "",
          name: "",
          institute: "",
          percentage: "",
          from: "",
          to: "",
          isPresent: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectedDate = (event, selectedDate, index, field) => {
    if (event.type === "set" && selectedDate) {
      const formattedDate = selectedDate.toISOString();
      const updated = [...educationDetails];
      updated[index][field] = formattedDate;
      setEducationDetails(updated);
    }
    setShowPicker({ index: null, field: null });
  };

  const validate = () => {
    let valid = true;
    console.log("Validating education details...");
    const newErrors = educationDetails.map((edu) => {
      const errors = {
        typeError: "",
        nameError: "",
        instituteError: "",
        percentageError: "",
        dateError:""
      };const handleSelectedDate = (event, selectedDate, index, field) => {
        if (event.type === "set" && selectedDate) {
          const formattedDate = selectedDate.toISOString();
          const updated = [...educationDetails];
          updated[index][field] = formattedDate;
          setEducationDetails(updated);
        }
        setShowPicker({ index: null, field: null });
      };
      if (!edu.type.trim()) {
        errors.typeError = "This Field is Required";
        valid = false;
      }
      if (!edu.name.trim()) {
        errors.nameError = "This Field is Required";
        valid = false;
      }
      if (!edu.institute.trim()) {
        errors.instituteError = "This Field is Required";
        valid = false;
      }
      if (edu.percentage.trim()) {
        const value = parseFloat(edu.percentage);
        if (!(value >= 1 && value <= 100)) {
          errors.percentageError = "CGPA/Percentage must be between 1 and 100";
          valid = false;
        }
      }
      if ((!edu.from.trim()) || !(edu.to.trim() || edu.isPresent)) {
        valid = false;
        errors.dateError = "This field is required";
      }
      return errors;
      
    });

    setErrors(newErrors);
    return valid;
  };

  const handleEducationUpdate = async () => {
    if (!validate()) {
      console.log("Validation failed, errors:");
      return;
      
    }
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    try {
      setLoading(true);
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        education: educationDetails,
        updatedAt: new Date(),
      });
      Alert.alert("Success", "Education details updated successfully");
      navigation.navigate("ProfileHome");
    } catch (err) {
      console.error("Error updating education:", err);
      Alert.alert("Error", "Failed to update education details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEducation();
  }, []);
  console.log();
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
                      <MaterialIcons
                        name="remove-circle"
                        color="#ff4444"
                        size={24}
                      />
                    </Pressable>
                  )}
                </View>

                {/* Education Type Picker */}
                <View style={styles.pickerWrapper}>
                  <Text style={styles.label}>
                    Education Type<Text style={styles.required}>*</Text>
                  </Text>
                  <Picker
                    selectedValue={edu.type}
                    style={styles.picker}
                    onValueChange={(val) => handleChange("type", index, val)}
                  >
                    <Picker.Item label="Select Education Type" value="" />
                    <Picker.Item label="Diploma" value="diploma" />
                    <Picker.Item label="Higher Secondary" value="hsc" />
                    <Picker.Item label="Secondary School (SSLC)" value="sslc" />
                    <Picker.Item label="UG Degree" value="ug_degree" />
                    <Picker.Item label="PG Degree" value="pg_degree" />
                  </Picker>
                  {errors[index]?.typeError && (
                    <Text style={styles.errorText}>
                      {errors[index].typeError}
                    </Text>
                  )}
                </View>

                {/* Specialization */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>
                    Specialization<Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    value={edu.name}
                    style={styles.input}
                    onChangeText={(val) => handleChange("name", index, val)}
                  />
                  {errors[index]?.nameError && (
                    <Text style={styles.errorText}>
                      {errors[index].nameError}
                    </Text>
                  )}
                </View>

                {/* Institute */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>
                    Institute/University Name
                    <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    value={edu.institute}
                    style={styles.input}
                    onChangeText={(val) =>
                      handleChange("institute", index, val)
                    }
                  />
                  {errors[index]?.instituteError && (
                    <Text style={styles.errorText}>
                      {errors[index].instituteError}
                    </Text>
                  )}
                </View>

                {/* Percentage */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>Percentage/CGPA</Text>
                  <TextInput
                    value={edu.percentage}
                    style={styles.input}
                    onChangeText={(val) =>
                      handleChange("percentage", index, val)
                    }
                    keyboardType="numeric"
                  />
                  {errors[index]?.percentageError && (
                    <Text style={styles.errorText}>
                      {errors[index].percentageError}
                    </Text>
                  )}
                </View>

                {/* From Date */}
                <View style={{ flexDirection: "row", gap: 20 }}>
                  <View style={[styles.inputWrapper, { flex: 1 }]}>
                    <Text style={styles.label}>From</Text>
                    <Pressable
                      style={styles.input}
                      onPress={() => setShowPicker({ index, field: "from" })}
                    >
                      <Text>
                        {edu.from
                          ? new Date(edu.from).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "Select Date"}
                      </Text>
                    </Pressable>
                  </View>

                  {/* To Date */}
                  <View style={[styles.inputWrapper, { flex: 1 }]}>
                    <Text style={styles.label}>
                      To<Text style={styles.required}>*</Text>
                    </Text>
                    <Pressable
                      style={styles.input}
                      onPress={() => setShowPicker({ index, field: "to" })}
                      disabled={edu.isPresent}
                    >
                      <Text>
                        {edu.isPresent
                          ? "Present"
                          : edu.to
                          ? new Date(edu.to).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "Select Date"}
                      </Text>
                    </Pressable>
                  </View>
                </View>
                {errors[index]?.dateError && (
                  <Text style={styles.errorText}>
                    {errors[index].dateError}
                  </Text>
                )}
                {!educationDetails.some(
                  (edu, i) => i !== index && edu.isPresent
                ) && (
                  <View
                    style={{ flexDirection: "row", gap: 10, marginTop: 10 }}
                  >
                    <Pressable
                      onPress={() => {
                        const updated = [...educationDetails];
                        updated[index].isPresent = !updated[index].isPresent;
                        if (updated[index].isPresent) updated[index].to = "";
                        setEducationDetails(updated);
                      }}
                    >
                      <Fontisto
                        name={
                          edu.isPresent ? "checkbox-active" : "checkbox-passive"
                        }
                        color="#000"
                        size={20}
                      />
                    </Pressable>

                    <Text>Currently studying here</Text>
                  </View>
                )}
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
                {loading ? "Updating..." : "Update Education"}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Shared Date Picker */}
      {showPicker.index !== null && (
        <DateTimePicker
          value={
            educationDetails[showPicker.index]?.[showPicker.field]
              ? new Date(educationDetails[showPicker.index][showPicker.field])
              : new Date()
          }
          mode="date"
          display="default"
          onChange={(event, selectedDate) =>
            handleSelectedDate(
              event,
              selectedDate,
              showPicker.index,
              showPicker.field
            )
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  scrollWrapper: { padding: 20, paddingBottom: 40 },
  title: {
    fontSize: 22,
    fontFamily: "Poppins-Bold",
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
  label: { alignSelf: "flex-start", fontFamily:"Poppins-Bold", color:"#333", marginVertical: 10, fontSize:15},
  required: { color: "#ff2121" },
  eduHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  subheading: { fontSize: 17, fontFamily:'Poppins-Bold', color: "#555" },
  pickerWrapper: { overflow: "hidden" },
  picker: {
    height: 50,
    width: "100%",
    backgroundColor: "#e6eefa",
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  inputWrapper: {},
  input: {
    backgroundColor: "#e6eefa",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#333",
  },
  removeButton: { padding: 4 },
  addContainer: { alignItems: "center", marginBottom: 20 },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#e1ecf7",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addButtonText: { color: "#1967d2", fontWeight: "600", fontSize: 14 },
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
  buttonText: { color: "#ffffff", fontWeight: "bold", fontSize: 16 },
  errorText: { color: "red", marginTop: 4, fontSize: 12 },
});

export default EducationScreen;
