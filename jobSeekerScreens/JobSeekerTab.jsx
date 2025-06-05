import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./HomeScreen";
import FindJobScreen from "./FindJobScreen";

const Tab=createBottomTabNavigator();
const Stack=createNativeStackNavigator();

const JobSeekerTab=()=>{
    return(
        <Tab.Navigator >
            <Tab.Screen name="Home" component={HomeStack}/>
            
        </Tab.Navigator>
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
export default JobSeekerTab