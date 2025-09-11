import {
  SafeAreaView,
  Image,
  ScrollView,
  View,
  StyleSheet,
  Text,
  TouchableHighlight,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";

const JobAppliedSuccessfull = ({navigation}) => {

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Image source={require("../assets/tick.png")} style={styles.image} />
        <View style={styles.textWrapper}>
          <Text style={styles.title}>Successful</Text>
          <Text style={styles.subtitle}>Job Applied Successfully</Text>
        </View>

        {/* Fixed TouchableHighlight */}
        <TouchableHighlight
          style={styles.button}
          underlayColor="#3A8DFF"
          onPress={() => {navigation.navigate("Find Job");}}
        >
          <View style={styles.buttonContent}>
            <AntDesign name="arrowleft" size={20} color="white" />
            <Text style={styles.buttonText}>Go To Home</Text>
          </View>
        </TouchableHighlight>
      </ScrollView>
    </SafeAreaView>
  );
};

export default JobAppliedSuccessfull;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    padding: 20,
  },
  image: {
    width: 250,
    height: 250,
    resizeMode: "contain",
  },
  textWrapper: {
    alignItems: "center",

  },
  title: {
    fontSize: 18,
    fontFamily:"Poppins-Bold",
    fontWeight: "700",
    color: "#333",
    marginBottom:8
  },
  subtitle: {
    fontSize: 14,
    fontFamily:"Poppins-Regular",
    color: "gray",
    marginBottom:12
  },
  button: {
    backgroundColor: "#4287f5",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 14,
   fontFamily:"Poppins-Bold",
    marginLeft: 8,
  },
});
