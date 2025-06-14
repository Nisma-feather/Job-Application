import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {Ionicons} from '@expo/vector-icons'
import { View,Text,Image } from "react-native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import HomeScreen from "./HomeScreen";
import FindJobScreen from "./FindJobScreen";
import PersonalInfoScreen from "./ProfileScreens/PersonalInfoScreen";
import EducationScreen from "./ProfileScreens/EducationScreen";
import ExperienceScreen from "./ProfileScreens/ExperienceScreen";
import SkillsUpdateScreen from "./ProfileScreens/SkillsScreen";
import ProjectsScreen from "./ProfileScreens/ProjectsScreen";
import TrackApplications from "./ProfileScreens/TrackApplications";
import ProfileScreen from "./ProfileScreen";
import JobDetail from "./JobDetail";
import ApplyJob from "./ApplyJob";
import CompanyCard from "./CompanyCard";
import BookMarkScreen from "./BookmarkScreen";
import Messages from "./Messages";
import { MessageDetail } from "./MessageDetail";
import { auth, db } from "../firebaseConfig";
import { collection, doc, getDocs, query, where,onSnapshot} from "firebase/firestore";
import { useLayoutEffect, useState,useEffect } from "react";




const Tab=createBottomTabNavigator();
const Stack=createNativeStackNavigator();
const Drawer=createDrawerNavigator()

const JobSeekerTab=()=>{
  
const [unreadCount, setUnreadCount] = useState(0);

  

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
            // This styles the entire tab bar container
            height: 60, // Adjust height as needed
            paddingBottom: 10, // Add padding at bottom
            paddingTop: 10, // Add padding at top
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
            } else if (route.name === "BookMark") {
              IconName = focused ? "bookmarks" : "bookmarks-outline";
            } else if(route.name === "Message"){
              IconName = focused
                ? "chatbox-ellipses"
                : "chatbox-ellipses-outline";
            }
            return <Ionicons name={IconName} color={color} size={28} />;
          },
          tabBarActiveTintColor: "#0a66c2",
          tabBarInactiveTintColor: "#666",
        })}
      >
        <Tab.Screen name="Home" component={HomeStack} />
        <Tab.Screen
          name="Find Jobs"
          component={JobStack}
          options={{
            tabBarIcon: () => <Ionicons name="search" color="#000" size={28} />,
          }}
        />
        <Tab.Screen name="Profile" component={ProfileStack} />
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

const JobSeekerDrawer=()=>{
  return(
    <Drawer.Navigator >
      <Drawer.Screen name="Profile" component={ProfileStack}/>
    </Drawer.Navigator>
  )
}

const HomeStack=()=>{
  return(
    <Stack.Navigator screenOptions={{headerShown:'false'}}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} options={({navigation})=>({
        header:()=>(
          <Customheader navigation={navigation} />
        ),
        headerStyle:{
          height:60,
          backgroundColor:'#fff',
          shadowOpacity:0,
          elevation:0
        },
        headerShown:false
      }
      )}/>
      <Stack.Screen name="Find Job" component={FindJobScreen}/>
      
      
     
    
    </Stack.Navigator>
  )
}
const ProfileStack = () => {
  return (
    <Stack.Navigator initialRouteName="ProfileHome">
      <Stack.Screen
        name="ProfileHome"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
      <Stack.Screen name="Education" component={EducationScreen} />
      <Stack.Screen name="Experience" component={ExperienceScreen} />
      <Stack.Screen name="Skills" component={SkillsUpdateScreen} />
      <Stack.Screen name="Projects" component={ProjectsScreen} />
      <Stack.Screen name="Track Application" component={TrackApplications} />
    
    </Stack.Navigator>
  );
};
const JobStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Find Job" component={FindJobScreen} />
      <Stack.Screen name="Company Page" component={CompanyCard} />
      <Stack.Screen name="Job Details" component={JobDetail} />
      <Stack.Screen name="Apply Job" component={ApplyJob} />
    </Stack.Navigator>
  );
};

const MessagesStack=()=>{
  return(
    <Stack.Navigator screenOptions={{headerStyle:{
      backgroundColor:'white',
      elevation:0,
      shadowOpacity:0
    },
   }}>
      <Stack.Screen name="Messages" component={Messages}/>
      <Stack.Screen name="MessageDetail" component={MessageDetail} options={({route})=>({
      headerTitle:()=>(
        <View style={{flexDirection:'row',alignItems:'center',paddingVertical:'10px'}}>
          <View style={{height:50,width:50,borderRadius:'5px',borderWidth:1,borderColor:'#666'}}>
            <Image style={{width:'100%',height:'100%'}} source={route.params.message?.logo 
    ? {uri: route.params.message.logo} 
    : require("../assets/logo.png")}/>
          </View>
          <Text style={{marginLeft:10,fontWeight:'bold'}}>{route.params.message.from}</Text>
        </View>
      )

      })}/>
    </Stack.Navigator>
  )
}
export default JobSeekerTab