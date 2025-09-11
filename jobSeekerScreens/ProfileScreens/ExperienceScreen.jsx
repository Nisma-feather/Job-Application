import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  Text,
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Fontisto } from "@expo/vector-icons";
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

const ExperienceScreen = ({ navigation }) => {
  const [experienceDetails, setExperienceDetails] = useState([
    { role: "", company: "", from: "", to: "", isPresent: false },
  ]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const [showPicker, setShowPicker] = useState({
    index: null,
    field: null,
  });
  const today = new Date();
  const handleChange = (field, index, value) => {
    const newExperiences = [...experienceDetails];
    newExperiences[index][field] = value;
    setExperienceDetails(newExperiences);
  };

  const handleAddExperience = () => {
    setExperienceDetails([
      ...experienceDetails,
      { role: "", company: "", from: "", to: "", isPresent: false },
    ]);
  };

  const fetchExperience = async () => {
    const uid = auth.currentUser?.uid || "fA9DeooDHHOpjgsLXiGi2VFeE4y2";
    try {
      const snap = await getDoc(doc(db, "users", uid));
      console.log(snap.data());
      const data = snap.data()?.experience || [
        { role: "", company: "", from: "", to: "", isPresent: false },
      ];
      console.log("experiences", data);
      setExperienceDetails(data);
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExperienceUpdate = async () => {
    if (!validate()) {
      return;
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
        dateError:""
      };
      if (!item.role.trim()) {
        valid = false;
        expErrors.roleError = "This field is required";
      }
      if (!item.company.trim()) {
        valid = false;
        expErrors.companyError = "This field is required";
      }
      if (!item.from.trim() || (!item.to.trim() && !item.isPresent)) {
        valid = false;
        expErrors.dateError = "This field is required";
      }
      errorsArr.push(expErrors);
    });
    setErrors(errorsArr);
    return valid;
  };
  const handleSelectedDate = (event, selectedDate, index, field) => {
    if (event.type === "set" && selectedDate) {
      const formattedDate = selectedDate.toISOString();
      const updated = [...experienceDetails];
      updated[index][field] = formattedDate;
      setExperienceDetails(updated);
    }
    setShowPicker({ index: null, field: null });
  };

  useEffect(() => {
    fetchExperience();
  }, []);
  console.log(errors);
  const handleDelete=(id)=>{
    const newExperiences = experienceDetails.filter((exp,index)=>index!== id);
    setExperienceDetails(newExperiences);

  }
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollWrapper}>
        <Text style={styles.title}>Experience Details</Text>

        {loading ? (
          <Text style={{ textAlign: "center"}}>Loading...</Text>
        ) : (
          experienceDetails.map((exp, index) => (
            <View key={index}>
              <View style={styles.eduHeader}>
                                <Text style={styles.subheading}>Education {index + 1}</Text>
                                {experienceDetails.length > 1 && (
                                  <Pressable
                                    onPress={() => handleDelete(index)}
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
           
              <View style={{ flexDirection: "row", gap: 20 }}>
                <View style={[styles.inputWrapper, { flex: 1 }]}>
                  <Text style={styles.label}>From</Text>
                  <Pressable
                    style={styles.input}
                    onPress={() => setShowPicker({ index, field: "from" })}
                  >
                    <Text>
                      {exp.from
                        ? new Date(exp.from).toLocaleDateString("en-GB", {
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
                    disabled={exp.isPresent}
                  >
                    <Text>
                      {exp.isPresent
                        ? "Present"
                        : exp.to
                        ? new Date(exp.to).toLocaleDateString("en-GB", {
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
              {!experienceDetails.some(
                (exp, i) => i !== index && exp.isPresent
              ) && (
                <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                  <Pressable
                    onPress={() => {
                      const updated = [...experienceDetails];
                      updated[index].isPresent = !updated[index].isPresent;
                      if (updated[index].isPresent) updated[index].to = "";
                      setExperienceDetails(updated);
                    }}
                  >
                    <Fontisto
                      name={
                        exp.isPresent ? "checkbox-active" : "checkbox-passive"
                      }
                      color="#000"
                      size={20}
                    />
                  </Pressable>

                  <Text>Currently working here</Text>
                </View>
              )}
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
      {/* Shared Date Picker */}
            {showPicker.index !== null && (
              <DateTimePicker
                value={
                  experienceDetails[showPicker.index]?.[showPicker.field]
                    ? new Date(experienceDetails[showPicker.index][showPicker.field])
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

export default ExperienceScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollWrapper: { padding: 20 },
  title: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
   
  },
  eduHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  label: {
    alignSelf: "flex-start",
    fontFamily: "Poppins-Bold",
    color: "#333",
    marginVertical: 10,
    fontSize: 13,
  },
  removeButton: { padding: 4 },
  inputWrapper: {},
  input: { flex: 1, paddingVertical: 12, fontSize: 13,fontFamily:"Poppins-Regular" },
  button: {
    backgroundColor: "#1967d2",
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: "center",
    elevation: 5,
  },
  buttonText: { color: "#fff",fontFamily:'Poppins-Bold', fontSize: 16 },
  addContainer: {
    alignItems: "center",
    marginVertical: 15,
    
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
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
  subheading: { fontSize: 17, fontFamily: "Poppins-Bold", color: "#555",marginTop:30},
  input: {
    width: "100%",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#e6eefa",
  },
  title: {
    fontSize: 22,
    fontFamily: "Poppins-Bold",
    color: "#333",
    textAlign: "center",
    marginVertical: 20,
  },
  label: { alignSelf: "flex-start", fontFamily:"Poppins-Bold", color:"#333", marginVertical: 10, fontSize:15},
  required: {
    color: "#ff2121",
  },
  errorText: {
    color: "red",
    marginTop: 4,
    fontSize: 12,
  },
});
