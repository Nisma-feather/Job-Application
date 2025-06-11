import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";


import {Ionicons} from '@expo/vector-icons';
import CompanyProfile from "./CompanyProfile";
import CompanyProfileEdit from "./CompanyProfileEdit";
import PostJobHome from "./PostJobHome";
import PostJob from "./PostJob";
import PostJobEdit from "./PostJobEdit";
import ViewJobApplications, { ApplicationsList } from "./ViewJobApplications";
import UserProfile from "./UserProfile";


const Tab=createBottomTabNavigator();
const Stack=createNativeStackNavigator();


const CompanyDashboard = () => {
  
  return (
    <Tab.Navigator screenOptions={({route})=>({
     
     
      tabBarIcon:({focused,color,size})=>{
        let Iconname;
        if(route.name==='company Profile'){
          Iconname=focused?'person':'person-outline'
        }
        else if(route.name==='Posted Jobs'){
          Iconname=focused?'browsers':"browsers-outline"
        }
        else if(route.name==='View Applications'){
           Iconname=focused?'home':'home-outline'
        }
        return  <Ionicons name={Iconname} color={color} size={24} />
      },
      tabBarActiveTintColor:'#0a66c2',
      tabBarInactiveTintColor:"#666",
      tabBarShowLabel:false,
      tabBarItemStyle:{
        height:50
      }

  })} >
      
      <Tab.Screen name="company Profile" component={CompanyProfileStack} options={{headerShown:false}}/>
      <Tab.Screen name="View Applications" component={JobApplicationStack} options={{headerShown:false}}/>
      <Tab.Screen name="Posted Jobs" component={CompanyPostJobStack} options={{headerShown:false}}/>
      {/* <Tab.Screen name="notfication" component={Notifications}/> */}
      
      
  </Tab.Navigator>
  )
}

const JobApplicationStack=()=>{
  return(
    <Stack.Navigator>
      <Stack.Screen name="Posted Jobs" component={ViewJobApplications}/>
      <Stack.Screen name="Application List" component={ApplicationsList}/>
      <Stack.Screen name="User Profile" component={UserProfile}/>
    
    </Stack.Navigator>
     
  )
}


const CompanyProfileStack=()=>{
  return(
    <Stack.Navigator>
       <Stack.Screen name="Profile" component={CompanyProfile}/>
       <Stack.Screen name="Profile edit" component={CompanyProfileEdit}/>
    </Stack.Navigator>
  
  )
}
const CompanyPostJobStack=()=>{
  return(
    <Stack.Navigator>
      <Stack.Screen name="Post Job HomeScreen" component={PostJobHome} />
      <Stack.Screen name="Post Job" component={PostJob}/>
      <Stack.Screen name="Edit Job" component={PostJobEdit}/>

    </Stack.Navigator>
    
  )
}
export default CompanyDashboard
