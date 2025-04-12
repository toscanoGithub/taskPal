import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import theme from "../theme.json"

interface GradientProps {
  from: string;
  to: string;
}
const Gradient: React.FC<GradientProps> = ({from, to}) => {
  return <LinearGradient style={styles.gradient} colors={[from, to]} />
}

export default Gradient

const styles = StyleSheet.create({
  gradient: {
    position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      borderRadius: 15,
  }
})