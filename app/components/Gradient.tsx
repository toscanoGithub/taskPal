import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import theme from "../theme.json"

const Gradient = () => {
  return <LinearGradient style={styles.gradient} colors={[theme["gradient-from"], theme["gradient-to"]]} />
}

export default Gradient

const styles = StyleSheet.create({
  gradient: {
    position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
  }
})