
import "react-native-gesture-handler";
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // ❗ Fix: Move Ionicons import here
import { useFonts } from '@expo-google-fonts/poppins';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import 'react-native-get-random-values';
import Login from './screens/Login';
import RoleSelectionScreen from './screens/RoleSelectionScreen';
import SignupScreen from './screens/SignupScreen';
import BasicDetailsScreen from './screens/BasicDetailsScreen';
import UserInterestForm from './screens/UserInterest';
import CompanyLogin from './companyScreens/CompanyLogin';
import CompanySignUp from './companyScreens/CompanySignUp';
import CompanyDetails from './companyScreens/CompanyDetails';
import JobSeekerTab, { JobSeekerDrawer } from './jobSeekerScreens/JobSeekerTab';
import JobDetail from './jobSeekerScreens/JobDetail';
import ApplyJob from './jobSeekerScreens/ApplyJob';
import CompanyDashboard from './companyScreens/CompanyDashboard';
import { createDrawerNavigator } from "@react-navigation/drawer";
import ProfileScreen from "./jobSeekerScreens/ProfileScreen";
import EmailVerificationScreen from "./screens/EmailVerificationScreen";
import ForgotPassword from "./screens/ForgotPassword";
import CompanyEmailVerification from "./companyScreens/CompanyVerification";


const Stack = createNativeStackNavigator();
const Drawer=createDrawerNavigator();


export default function App() {
  

  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('./assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Bold': require('./assets/fonts/Poppins-Bold.ttf'),
    'Poppins-Medium': require('./assets/fonts/Poppins-Medium.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <Text>Loading ...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Role" component={RoleSelectionScreen} />
        <Stack.Screen
          name="JobSeekerStack"
          component={JobSeekerStack}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Forgot Password" component={ForgotPassword} />
        <Stack.Screen
          name="CompanyStack"
          component={CompanyStack}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Company Details" component={CompanyDetails} />

        <Stack.Screen
          name="JobSeeker Dashboard"
          component={JobSeekerDrawer}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen name="Job Details" component={JobDetail} />
        <Stack.Screen name="Apply Job" component={ApplyJob} />
        <Stack.Screen
          name="CompanyDashboard"
          component={CompanyDashboard}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Email Verification"
          component={EmailVerificationScreen}
        />
        <Stack.Screen
          name="User Interest"
          component={UserInterestForm}
          options={{
            headerTitle: () => null, // Best option for completely removing title
            headerStyle: {
              backgroundColor: "#2563EB",
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 0,
            },
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="Company Verification"
          component={CompanyEmailVerification}
        />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

const CompanyStack=()=>{
  return (
  <Stack.Navigator initialRouteName='CompanySignUp' screenOptions={{headerShown:false}}>
   
     <Stack.Screen name="CompanyLogin" component={CompanyLogin}/>
     <Stack.Screen name="CompanySignUp" component={CompanySignUp}/>
     
     
     
     

  </Stack.Navigator>
  );
}



const JobSeekerStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="SignUp"
      screenOptions={({ navigation, route }) => ({
        headerTitle: "",
        headerBackTitleVisible: false,
        headerStyle: {
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
        },
        headerTintColor: "blue",
        headerLeft: () => {
          if (navigation.canGoBack()) {
            return (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{ marginLeft: 20 }}
              >
                <View
                  style={{
                    backgroundColor: "#e6eefa",
                    borderRadius: 20,
                    padding: 8,
                  }}
                >
                  <Ionicons name="arrow-back" size={20} color="#2563EB" />
                </View>
              </TouchableOpacity>
            );
          }
          return null;
        },
      })}
    >
    
      <Stack.Screen name="SignUp" component={SignupScreen} />
      <Stack.Screen name="Basic Info" component={BasicDetailsScreen} />
     
    </Stack.Navigator>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    
  },
});
