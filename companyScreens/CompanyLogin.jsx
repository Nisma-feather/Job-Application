import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react'
import { TextInput,SafeAreaView,View, Pressable, Alert,Button,Text, StyleSheet,TouchableOpacity} from 'react-native';
import MaterialIcons from '@expo/vector-icons'
import { auth,db } from '../firebaseConfig';
import { doc, getDoc, getFirestore } from 'firebase/firestore';

const CompanyLogin = ({navigation}) => {
    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");
    const handleLogin = async()=>{
       try{
         const userCred=await signInWithEmailAndPassword(auth,email,password);
         const uid=userCred.user.uid;
         const userRef=doc(db,'users',uid);
         const userSnap=await getDoc(userRef);

         if(userSnap.exists()){
        const userData=userSnap.data();
            if(userData.role !== 'company'){
                Alert.alert("Access Denied", "This Account is not Registered as company");
                return 

            }
            console.log("Login Successful")
            navigation.replace("CompanyDashboard",{uid:uid});
         }
         else {
            Alert.alert('Error', 'User role not found.');
          }

       }
       catch(e){
        Alert.alert("Account not created",e.message,[
        {
            text:"create Account",
            onPress:()=>{
                navigation.navigate("CompanySignUp")
            
                    }
         }, 
         {  text:"Try Again"}
        ])
       }
    }
  return (
   <SafeAreaView style={{flex:1}}>
    <View style={styles.container}>
        <View style={styles.logoContainer}>
                  <View style={styles.logoOuter}>
                    <MaterialIcons name="double-arrow" color="#fff" size={28} />
                  </View>
                  <View>
                    <Text style={styles.logoText}>Karier</Text>
                    <Text style={styles.logoSubText}>Job Portal App</Text>
                  </View>
        </View>
         <Text style={styles.label}>Email<Text style={styles.required}>*</Text></Text>
        <TextInput style={styles.input} onChangeText={setEmail} placeholder='Email'/>
        <Text  style={styles.label}>Password<Text style={styles.required}>*</Text></Text>
        <TextInput style={styles.input} onChangeText={setPassword} placeholder='Password' value={password} secureTextEntry/>
     
        <TouchableOpacity onPress={handleLogin} style={styles.LoginButton}>
            <Text style={styles.LoginButtonText}>
                Login
            </Text>
        </TouchableOpacity>
        <Text style={styles.textCenter}>Don't have an account ?
            <Pressable onPress={()=>navigation.navigate("CompanySignUp")}>
                <Text style={{color:'blue'}}> Creat one </Text>
            </Pressable>
        </Text>
    </View>
   </SafeAreaView>

  )
}

export default CompanyLogin

const styles=StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 24,
        justifyContent:'center'
      },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginVertical: 20,
      },
      required:{
        color:"#ff2121"
      },
      textCenter:{
        textAlign:'center'

      },
      logoOuter: {
        backgroundColor: '#1967d2',
        width: 50,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
      },
      logoText: {
        color: '#1967d2',
        fontSize: 22,
        fontWeight: 'bold',
      },
      logoSubText: {
        color: '#666',
        fontSize: 12,
      },
      label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 4,
      },
      input: {
        backgroundColor: '#e6eefa',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginBottom: 16,
      },
      LoginButton: {
        backgroundColor: '#2563EB',
        paddingVertical: 14,
        borderRadius: 8,
        marginVertical:10
      },
      LoginButtonText: {
        color: '#fff',
        fontWeight: '600',
        textAlign: 'center',
      },
})