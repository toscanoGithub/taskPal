import { StyleSheet, TouchableOpacity, View } from 'react-native'
import React from 'react'
import theme from "../theme.json"
import { Text } from '@ui-kitten/components';
import { useUserContext } from '@/contexts/UserContext';
import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';




const Header = () => {
  const auth = getAuth();
  const {user, setUser} = useUserContext()
  const router = useRouter()

  const handleSignout = () => {
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
    return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.username}  category='h4'>{user?.name}</Text>
        
        {/* SIGNOUT BUTTON */}
        <TouchableOpacity onPress={handleSignout} style={{marginLeft:"auto"}}>
          <Ionicons name="exit-outline" size={34} color={theme["secondary"]} />
        </TouchableOpacity>
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
        paddingHorizontal: 10
    },

    username: {
      color: theme.secondary,
      fontSize: 20,
      fontWeight: 200,
      letterSpacing: 1,

    }


})