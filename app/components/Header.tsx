import { StyleSheet, View } from 'react-native'
import React from 'react'
import theme from "../theme.json"
import { Text } from '@ui-kitten/components';
import { useUserContext } from '@/contexts/UserContext';




const Header = () => {
  const {user} = useUserContext();
    return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text category='h4'>{user?.name}</Text>
        <Text category='h4'>Exit btn</Text>
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
        justifyContent: "flex-end",
        alignItems: "center",
        paddingHorizontal: 10
    }
})