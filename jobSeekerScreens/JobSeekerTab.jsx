import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {Ionicons} from '@expo/vector-icons'
import { View,Text,Image } from "react-native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import HomeScreen, { Customheader } from "./HomeScreen";
import FindJobScreen from "./FindJobScreen";
import PersonalInfoScreen from "./ProfileScreens/PersonalInfoScreen";
import EducationScreen from "./ProfileScreens/EducationScreen";
import ExperienceScreen from "./ProfileScreens/ExperienceScreen";
import SkillsUpdateScreen from "./ProfileScreens/SkillsScreen";
import ProjectsScreen from "./ProfileScreens/ProjectsScreen";
import TrackApplications from "./ProfileScreens/TrackApplications";
import ProfileScreen, { ProfileHeader } from "./ProfileScreen";
import JobDetail from "./JobDetail";
import ApplyJob from "./ApplyJob";
import CompanyCard from "./CompanyCard";
import BookMarkScreen from "./BookmarkScreen";
import Messages from "./Messages";
import { MessageDetail } from "./MessageDetail";
import { auth, db } from "../firebaseConfig";
import { collection, doc, getDocs, query, where,onSnapshot} from "firebase/firestore";
import { useLayoutEffect, useState,useEffect } from "react";
import Resume from "./ProfileScreens/Resume";
import JobAppliedSuccessfull from "./JobAppliedSuccessful";





const Tab=createBottomTabNavigator();
const Stack=createNativeStackNavigator();
const Drawer=createDrawerNavigator()

const JobSeekerTab=()=>{
  
const [unreadCount, setUnreadCount] = useState(0);
const office=require("../assets/office.png")
  

          useEffect(() => {
            
            const uid = auth.currentUser?.uid;
               if (!uid) return;

               const messagesRef = collection(db, "users", uid, "messages");
              const q = query(messagesRef, where("read", "==", false));

                 const unsubscribe = onSnapshot(q, (snapshot) => {
                   setUnreadCount(snapshot.size); // Update count whenever data changes
                  });

                            return () => unsubscribe(); // Clean up listener on unmount
                            }, []);

    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarShowLabel: false,
         
             tabBarStyle: {
    //  position: 'absolute',
    //   bottom: 0, 
      backgroundColor: '#fff',
      borderTopWidth: 1,
      borderColor: '#ddd',
    },
          
          tabBarItemStyle: {
            // This styles individual tab items
            height: 50, // Height of each tab item
          },
          tabBarIcon: ({ focused, color, size }) => {
            let IconName;
            if (route.name === "Home") {
              IconName = focused ? "home" : "home-outline";
            } else if (route.name === "Profile") {
              IconName = focused ? "person" : "person-outline";
            } else if (route.name === "Messages") {
              IconName = focused
                ? "chatbox-ellipses"
                : "chatbox-ellipses-outline";
            }
            
             else if (route.name === "BookMark") {
              IconName = focused ? "bookmarks" : "bookmarks-outline";
            } else if(route.name === "Message"){
              IconName = focused
                ? "chatbox-ellipses"
                : "chatbox-ellipses-outline";
            }
            else if(route.name==="Find Jobs"){
                IconName = focused ? "search" : "search-outline";
            }
            return <Ionicons name={IconName} color={color} size={28} />;
          },
          tabBarActiveTintColor: "#0a66c2",
          tabBarInactiveTintColor: "#666",
        })}
      > 
        <Tab.Screen name="Home" component={HomeStack} options={{headerShown:false}}/>
        <Tab.Screen
          name="Find Jobs"
          component={JobStack}
          options={{
           
            headerShown: false
          }}
        />
        <Tab.Screen name="Profile" component={ProfileStack} options={{
          headerStyle:{
            backgroundColor:"#f0f5fa",
          elevation: 0, // Android
          shadowOpacity: 0, // iOS
          borderBottomWidth: 0 },
          headerShown:false}}/>
        <Tab.Screen name="BookMark" component={BookMarkScreen} />
        <Tab.Screen name="Message" component={MessagesStack} options={{headerShown:false,
          tabBarIcon:({focused,color,size})=>(
            <View style={{position:'relative'}}>
              <Ionicons name={focused? "chatbox-ellipses" : "chatbox-ellipses-outline"} color={color} size={28}/>
              {unreadCount >0 && (
                <View style={{ width:20,height:20,borderRadius:'50%',backgroundColor:"red",justifyContent:'center',alignItems:'center',position:'absolute',left:15,bottom:15}}>
                  <Text style={{color:"white",fontWeight:'bold'}}>{unreadCount}</Text>
                  </View>
              )}
            </View>

          )
        }}/>
      </Tab.Navigator>
    );
}
//Job Seeker Drawer Navigator



const HomeStack=()=>{
  return (
    <Stack.Navigator screenOptions={{ headerShown: "false" }}>
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={({ navigation }) => ({
          headerTitle: () => <Customheader navigation={navigation} />,
          headerStyle: {
            margin: 10,
            backgroundColor: "#fff",
            shadowOpacity: 0,
            elevation: 0,
          },
        })}
      />
      <Stack.Screen name="Find Job" component={FindJobScreen} />
      <Stack.Screen name="Company Page" component={CompanyCard} />
    </Stack.Navigator>
  );
}
const ProfileStack = () => {
  return (
    <Stack.Navigator initialRouteName="ProfileHome">
      <Stack.Screen
        name="ProfileHome"
        component={ProfileScreen}
        options={{ headerShown: true }}
      />
      <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
      <Stack.Screen name="Education" component={EducationScreen} />
      <Stack.Screen name="Experience" component={ExperienceScreen} />
      <Stack.Screen name="Skills" component={SkillsUpdateScreen} />
      <Stack.Screen name="Projects" component={ProjectsScreen} />
      <Stack.Screen name="Track Application" component={TrackApplications} />
      <Stack.Screen name="Resume" component={Resume} />
    </Stack.Navigator>
  );
};
const JobStack = () => {
  return (
    <Stack.Navigator screenOptions={{  }}>
      <Stack.Screen name="Find Job" component={FindJobScreen} />
      <Stack.Screen name="Company Page" component={CompanyCard} />
      <Stack.Screen name="Job Details" component={JobDetail} />
      <Stack.Screen name="Apply Job" component={ApplyJob} />
      <Stack.Screen name="Job Successful" component={JobAppliedSuccessfull} options={{headerShown:false}}/>
    </Stack.Navigator>
  );
};
export const JobSeekerDrawer=()=>{
  return (
    <Drawer.Navigator screenOptions={{headerShown:false}}>
      <Drawer.Screen name="Home" component={JobSeekerTab} />
      <Drawer.Screen name="Profile" component={ProfileStack} />
    </Drawer.Navigator>
  );
}

const MessagesStack=()=>{
  return(
    <Stack.Navigator screenOptions={{headerStyle:{
      backgroundColor:'white',
      elevation:0,
      shadowOpacity:0
    },
   }}>
      <Stack.Screen name="Messages" component={Messages}/>
      <Stack.Screen name="MessageDetail" component={MessageDetail} />
    </Stack.Navigator>
  )
}
export default JobSeekerTab