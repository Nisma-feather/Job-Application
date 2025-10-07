import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { setDoc, doc } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import JobTypeScreen from "./JobTypeScreen";
import ExperienceLevelScreen from "./ExperienceLevelScreen";
import PositionScreen from "./PositionScreen";
import SkillsSelectionScreen from "./SkillsSelectionScreen";

const UserInterestForm = ({ navigation, route }) => {
  const { loginData = {}, personalData = {} } = route.params || {};
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    jobType: null,
    experienceLevel: null,
    skills: [],
    position: null,
  });
  const [loading, setLoading] = useState(false);

  const steps = [
    { number: 1, title: "Job Type" },
    { number: 2, title: "Experience" },
    { number: 3, title: "Skills" },
    { number: 4, title: "Position" },
  ];

  const nextStep = () => {
    const fieldMap = {
      1: "jobType",
      2: "experienceLevel",
      3: "skills",
      4: "position",
    };

    const currentField = fieldMap[currentStep];
    const value = formData[currentField];

    if (
      value === null ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === "string" && value.trim() === "")
    ) {
      Alert.alert(
        "Validation Error",
        `Please select your ${steps[currentStep - 1].title}`
      );
      return;
    }

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      submitForm();
    }
  };

  const submitForm = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "User not authenticated.");
      return;
    }

    setLoading(true);
    try {
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        role: "jobseeker",
        loginData,
        personalData,
        userInterest: formData,
        skills: formData.skills,
        createdAt: new Date(),
      });

      Alert.alert("Success", "Profile completed successfully");
      navigation.replace("JobSeeker Dashboard", { uid: user.uid });
    } catch (error) {
      console.error("Error saving to Firestore: ", error);
      Alert.alert("Error", error.message || "Failed to save data");
    } finally {
      setLoading(false);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <JobTypeScreen
            selected={formData.jobType}
            onSelect={(type) => updateFormData("jobType", type)}
          />
        );
      case 2:
        return (
          <ExperienceLevelScreen
            selected={formData.experienceLevel}
            onSelect={(level) => updateFormData("experienceLevel", level)}
          />
        );
      case 3:
        return (
          <SkillsSelectionScreen
            selected={formData.skills}
            onSelect={(skills) => updateFormData("skills", skills)}
          />
        );
      case 4:
        return (
          <PositionScreen
            selected={formData.position}
            onSelect={(position) => updateFormData("position", position)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <LinearGradient
      colors={["#2563EB", "white"]}
      locations={[0, 0.4, 1]}
      style={styles.container}
    >
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ProgressStepper steps={steps} currentStep={currentStep} />

          <View style={styles.contentContainer}>{renderStep()}</View>

          {/* Buttons inside scroll but visible */}
          <View style={styles.buttonContainer}>
            {currentStep > 1 && (
              <TouchableOpacity style={styles.prevButton} onPress={prevStep}>
                <Text style={styles.prevButtonText}>Back</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.nextButton}
              onPress={nextStep}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {currentStep === steps.length ? "Complete" : "Next"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const ProgressStepper = ({ steps, currentStep }) => {
  return (
    <View style={stepperStyles.container}>
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <View style={stepperStyles.stepContainer}>
            <View
              style={[
                stepperStyles.stepCircle,
                currentStep >= step.number && stepperStyles.activeStep,
              ]}
            >
              <Text
                style={[
                  stepperStyles.stepNumber,
                  currentStep >= step.number && stepperStyles.activeStepNumber,
                ]}
              >
                {step.number}
              </Text>
            </View>
          </View>
          {index < steps.length - 1 && (
            <View
              style={[
                stepperStyles.connectorLine,
                currentStep > step.number && stepperStyles.activeLine,
              ]}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 100,
  },
  contentContainer: {
    flex: 1,
    minHeight: 400, // ensures consistent section height
    justifyContent: "flex-start",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  prevButton: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 8,
    width: "48%",
    alignItems: "center",
  },
  prevButtonText: { color: "#333", fontFamily: "Poppins-Bold", fontSize: 15 },
  nextButton: {
    backgroundColor: "#1967d2",
    padding: 10,
    borderRadius: 8,
    width: "48%",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontFamily: "Poppins-Bold", fontSize: 15 },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 1000,
  },
});

const stepperStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  stepContainer: { alignItems: "center", zIndex: 2 },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1967d2",
    marginBottom: 5,
    opacity: 0.5,
  },
  activeStep: {
    backgroundColor: "white",
    borderColor: "#1967d2",
    opacity: 1,
  },
  stepNumber: { color: "#ccc", fontWeight: "bold" },
  activeStepNumber: { color: "#1967d2" },
  connectorLine: {
    flex: 1,
    height: 3,
    backgroundColor: "#1967d2",
    marginHorizontal: -5,
    marginBottom: 20,
  },
  activeLine: { backgroundColor: "#fff" },
});

export default UserInterestForm;
