import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useSearchParams } from 'expo-router/build/hooks';

const StoreScreen = () => {
    const params = useSearchParams();
  return (
    <View>
      <Text>{params.get('points')?.toString()}</Text>
    </View>
  )
}

export default StoreScreen

const styles = StyleSheet.create({})