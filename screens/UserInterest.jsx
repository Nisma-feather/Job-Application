
import { LinearGradient } from "expo-linear-gradient";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  ActivityIndicator,
} from "react-native";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  onAuthStateChanged,
} from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import JobTypeScreen from "./JobTypeScreen";
import ExperienceLevelScreen from "./ExperienceLevelScreen";
import PositionScreen from "./PositionScreen";
import SkillsSelectionScreen from "./SkillsSelectionScreen";

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
  const [modalVisible, setModalVisible] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [user, setUser] = useState(null);
  const [accountCreated, setAccountCreated] = useState(false);

  const steps = [
    { number: 1, title: "Job Type" },
    { number: 2, title: "Experience" },
    { number: 3, title: "Skills" },
    { number: 4, title: "Position" },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setEmailVerified(currentUser.emailVerified);
        if (currentUser.emailVerified && accountCreated) {
          submitForm();
        }
      }
    });
    return () => unsubscribe();
  }, [accountCreated]);

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
      handleCompleteProfile();
    }
  };

  const handleCompleteProfile = async () => {
    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        loginData.email,
        loginData.password
      );
      setUser(userCred.user);
      setAccountCreated(true);
      setModalVisible(true);
    } catch (error) {
      console.error("Error creating account: ", error);
      Alert.alert("Error", error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleSendVerification = async () => {
    try {
      await sendEmailVerification(user);
      setVerificationSent(true);
      Alert.alert(
        "Verification Sent",
        "Please check your email and click the verification link."
      );
    } catch (error) {
      console.error("Error sending verification email: ", error);
      Alert.alert(
        "Error",
        error.message || "Failed to send verification email"
      );
    }
  };

  const checkVerification = async () => {
    try {
      await user.reload();
      if (user.emailVerified) {
        setEmailVerified(true);
      } else {
        Alert.alert(
          "Not Verified",
          "Please verify your email first. Check your inbox for the verification email."
        );
      }
    } catch (error) {
      console.error("Error checking verification: ", error);
      Alert.alert(
        "Error",
        error.message || "Failed to check verification status"
      );
    }
  };

  const submitForm = async () => {
    setLoading(true);
    try {
      const uid = user.uid;
      await setDoc(doc(db, "users", uid), {
        email: loginData.email,
        role: "jobseeker",
        loginData: loginData,
        personalData: personalData,
        userInterest: formData,
        createdAt: new Date(),
        emailVerified: true,
      });

      Alert.alert("Success", "Account created successfully");
      navigation.navigate("Login");
    } catch (error) {
      console.error("Error saving to Firestore: ", error);
      Alert.alert("Error", error.message || "Failed to save data");
    } finally {
      setLoading(false);
      setModalVisible(false);
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
      <ScrollView>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        )}

        <ProgressStepper steps={steps} currentStep={currentStep} />
        <View style={styles.contentContainer}>{renderStep()}</View>

        <View style={styles.buttonContainer}>
          {currentStep > 1 && (
            <TouchableOpacity
              style={styles.prevButton}
              onPress={prevStep}
              disabled={loading}
            >
              <Text style={styles.prevButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              styles.nextButton,
              (!formData[Object.keys(formData)[currentStep - 1]] || loading) &&
                styles.disabledButton,
            ]}
            onPress={nextStep}
            disabled={
              !formData[Object.keys(formData)[currentStep - 1]] || loading
            }
          >
            <Text style={styles.buttonText}>
              {currentStep === steps.length ? "Complete" : "Next"}
            </Text>
          </TouchableOpacity>
        </View>

        <Modal
          animationType="slide"
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Verify Your Email</Text>
              <View style={styles.emailContainer}>
                <Text style={styles.emailText}>{loginData.email}</Text>
                <Pressable
                  style={[
                    styles.verifyButton,
                    emailVerified && styles.verifiedButton,
                  ]}
                  onPress={
                    emailVerified
                      ? null
                      : verificationSent
                      ? checkVerification
                      : handleSendVerification
                  }
                  disabled={emailVerified}
                >
                  <Text style={styles.verifyButtonText}>
                    {emailVerified
                      ? "Verified"
                      : verificationSent
                      ? "Check Verification"
                      : "Verify"}
                  </Text>
                </Pressable>
              </View>

              <Text style={styles.verificationText}>
                {emailVerified
                  ? "Your email has been verified successfully!"
                  : verificationSent
                  ? "Verification email sent. Please check your inbox."
                  : "Click verify to send verification email."}
              </Text>

              <Pressable
                style={styles.modalSubmitButton}
                onPress={() => {
                  if (emailVerified) {
                    submitForm();
                  } else {
                    setModalVisible(false);
                    Alert.alert(
                      "Verification Required",
                      "Please verify your email to complete registration."
                    );
                  }
                }}
              >
                <Text style={styles.modalSubmitButtonText}>
                  { emailVerified ? "Submit Details" : null }
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 13,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  prevButton: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 8,
    width: "48%",
    alignItems: "center",
  },
  prevButtonText: {
    color: "#333",
    fontWeight: "bold",
  },
  nextButton: {
    backgroundColor: "#1967d2",
    padding: 15,
    borderRadius: 8,
    width: "48%",
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#cccccc",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
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
  modalContainer: {
    height:300,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  emailContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  emailText: {
    flex: 1,
    fontSize: 16,
  },
  verifyButton: {
    padding: 10,
    backgroundColor: "#007AFF",
    borderRadius: 5,
  },
  verifiedButton: {
    backgroundColor: "green",
  },
  verifyButtonText: {
    color: "white",
  },
  verificationText: {
    marginBottom: 20,
    color: "#666",
    textAlign: "center",
  },
  modalSubmitButton: {
    padding: 10,
    backgroundColor: "#1967d2",
    borderRadius: 5,
    alignItems: "center",
  },
  modalSubmitButtonText: {
    color: "white",
    fontWeight: "bold",
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
  stepContainer: {
    alignItems: "center",
    zIndex: 2,
  },
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
  stepNumber: {
    color: "#ccc",
    fontWeight: "bold",
  },
  activeStepNumber: {
    color: "#1967d2",
  },
  connectorLine: {
    flex: 1,
    height: 3,
    alignItems: "flex-end",
    backgroundColor: "#1967d2",
    marginHorizontal: -5,
    marginBottom: 20,
  },
  activeLine: {
    backgroundColor: "#fff",
  },
});

export default UserInterestForm;