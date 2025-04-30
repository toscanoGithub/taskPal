import { StyleSheet, TouchableOpacity, View, Image } from 'react-native'
import React, { useEffect } from 'react'
import theme from "../theme.json"
import { Text } from '@ui-kitten/components';
import { useUserContext } from '@/contexts/UserContext';
import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Device from 'expo-device';




const Header = () => {
  const auth = getAuth();
  const {user, setUser} = useUserContext()
  const router = useRouter()
  const isTablet = Device.deviceType === Device.DeviceType.TABLET;

  const handleSignout = () => {
    console.log("::::::::::::::::", user?.points?.toString());
    
    if(!user?.isFamilyMember) {
      signOut(auth).then(() => {
        // Sign-out successful.
        setUser(null); // clear user
        router.push("/");
  
      }).catch((error) => {
        // An error happened.
        console.log("Error to sign you out", error);
      });
    } else {
      setUser(null)
      router.push("/")
    }
  }

  useEffect(() => {
    console.log("Header user ::::::::::::::", user?.points?.toString());
  }, [user])
  
  
    return (
    <View style={styles.container}>
      <View style={styles.row}>
          
          {
            user?.isFamilyMember === true ? (<TouchableOpacity style={styles.piggyWrapper} onPress={() => router.push("/(screens)/store-screen")}>

            <Image source={require('../../assets/images/wallet.png')} style={styles.image} />
            <Text style={{color: theme["secondary"], alignSelf:"flex-end", fontSize: isTablet ? 20 : 14, fontWeight: 700,}} category='s1'>{user?.points?.toString()}</Text>

          </TouchableOpacity>) : <Image source={require('../../assets/images/logo.png')} style={styles.logo} />

          }

<View>
<Text style={[styles.username, {fontSize: isTablet ? 30 : 16,}]}  category='h4'>{user?.name}</Text>
        {/* SIGNOUT BUTTON */}
        <TouchableOpacity onPress={handleSignout} style={{marginLeft:"auto"}}>
          <Ionicons name="exit-outline" size={isTablet ? 50 : 34} color={theme["secondary"]} />
        </TouchableOpacity>
</View>
        
      </View>
    </View>
  )
}

export default Header

const styles = StyleSheet.create({
    container: {
        height: 80,
        backgroundColor: theme["gradient-from"],
        justifyContent:"center",
    },

    row: {
        flexDirection:"row",
        width: "100%",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 10,
    },

    username: {
      color: theme.secondary,
      fontWeight: 700,
      textTransform: "capitalize"
    },

    piggyWrapper: {
      width: 50,
      height: 50,
      flexDirection: "row",
      justifyContent:"center",
      alignItems:"center",
    },

    image: {
      width: "100%",
      height: "100%",
      padding:0, margin:0
      
    },

    logo: {
      width: 70,
      height: 70,
      transform: [{ rotate: '30deg' }],
    }



})