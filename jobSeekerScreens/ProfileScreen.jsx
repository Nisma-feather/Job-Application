import React from 'react';
import { SafeAreaView, ScrollView,View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons,Octicons,MaterialCommunityIcons,Feather} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';



const ProfileScreen = () => {
  const navigation = useNavigation();
  const profileImage = null; // Fetch from Firestore if available

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={{ padding: 15 }}>
          <View style={styles.profileSection}>
             <View style={styles.profileImage}>
             <Ionicons name="person"  color="white" size={50} />
             </View>
            
            {/* <Image
              source={profileImage ? { uri: profileImage } : <Ionicons name="person" color="white" size={24} />}
              style={styles.profileImage}
            /> */}
            
          </View>

          <View style={styles.sections}>
            <TouchableOpacity style={styles.sectionItem} onPress={() => navigation.navigate('PersonalInfo')}>
              <View style={styles.headindContainer}>
                <Octicons name="person-add" color="#6297e0" size={24} style={{}}/>
                <Text style={styles.sectionText}>Personal Information</Text>
              </View>
              <Text style={{ color: "#3a7bd6" }}>Add +</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sectionItem} onPress={() => navigation.navigate('Education')}>
              <View style={styles.headindContainer}>
              <Octicons name="book" color="#6297e0" size={24} />
              <Text style={styles.sectionText}>Education Details</Text>
              </View>
              <Text style={{ color: "#3a7bd6" }}>Add +</Text>
              
              
            </TouchableOpacity>

            <TouchableOpacity style={styles.sectionItem} onPress={() => navigation.navigate('Skills')}>
              <View style={styles.headindContainer}>
              <Octicons name="file-badge" color="#6297e0" size={24} />
              <Text style={styles.sectionText}>Skills</Text>
              </View>
              <Text style={{ color: "#3a7bd6" }}>Add +</Text>
              
            </TouchableOpacity>

            <TouchableOpacity style={styles.sectionItem} onPress={() => navigation.navigate('Experience')}>
              <View style={styles.headindContainer}>
              <MaterialCommunityIcons name="hexagon-slice-3" color="#6297e0" size={24} />
              <Text style={styles.sectionText}>Experience</Text>
              </View>
              <Text style={{ color: "#3a7bd6" }}>Add +</Text>
              
            </TouchableOpacity>

            <TouchableOpacity style={styles.sectionItem} onPress={() => navigation.navigate('Projects')}>
              <View style={styles.headindContainer}>
              <Feather name="pie-chart" color="#6297e0" size={24} />
              <Text style={styles.sectionText}>Projects</Text>
              </View>
              <Text style={{ color: "#3a7bd6" }}>Add +</Text>
              
            </TouchableOpacity>
            <TouchableOpacity style={styles.sectionItem} onPress={() => navigation.navigate('Track Application')}>
              <View style={styles.headindContainer}>
              <Ionicons name="document-text" color="#6297e0" size={24} />
              <Text style={styles.sectionText}>Track Application</Text>
              </View>
              
              
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>

  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  profileSection: {marginVertical: 10, },
  profileImage: { width: 90, height: 90, borderRadius: 60,justifyContent:'center',alignItems:'center', backgroundColor: '#d5e1f2' },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 135,
    backgroundColor: '#000',
    borderRadius: 15,
    padding: 5,
  },
  sections: {
    marginTop: 30,
    gap: 15
  },
  sectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between', // pushes left and right sections apart
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderWidth: 1, // use number, not string
    borderColor: '#f0f5fc',
    borderRadius: 5,
    shadowColor:'#6297e0',
    shadowOpacity:0.2,
    shadowOffset:{
      width:2,
      height:2
    }
  },
  headindContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 10

  },
  sectionText: {
    fontSize: 14,
    color: '#3b4b5e',
    fontFamily:'Poppins-Bold',

  },
});
