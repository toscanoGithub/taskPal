import { StyleSheet, View } from 'react-native'
import React from 'react'
import { Text } from '@ui-kitten/components'
import theme from '../theme.json'
import * as Device from 'expo-device';

const CalendarLegend = () => {
    const isTablet = Device.deviceType === Device.DeviceType.TABLET;
    
  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <View style={[styles.taskStatus, {backgroundColor: theme.secondary}]}/>
        <Text style={[styles.text, {fontSize: isTablet ? 24 : 16}]} category='title'>Waiting tasks</Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <View style={[styles.taskStatus, {backgroundColor: theme['gradient-to']}]}/>
        <Text style={[styles.text, {fontSize: isTablet ? 24 : 16}]} category='title'>Completed tasks</Text>
      </View>
    </View>
  )
}

export default CalendarLegend

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        marginTop: 20,
        paddingHorizontal: 15

    },

    taskStatus: {
        width: 20,
        height: 20,
        borderRadius: 5,
        marginRight: 10,
    },

    text: {
        fontSize: 22,
        fontWeight: '500',
        color: "#2B2B2B",
    },
    
})