import { StyleSheet, View } from 'react-native'
import React from 'react'
import { Text } from '@ui-kitten/components'
import theme from "../theme.json"
import Gradient from './Gradient';


interface SignupFormProps {
    dismissModal: () => void;
  }
  
const SignupForm: React.FC<SignupFormProps> = ({ dismissModal }) => {
  return (
    <View style={styles.container}>
      
    </View>
  )
}

export default SignupForm

const styles = StyleSheet.create({
    container: {
    }
})