import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import theme from "../../theme.json"
import * as Device from 'expo-device';

interface ActionButtonProps {
    onPress: () => void;
    iconName: string;
    type: string;
  }

const ActionSheetAddButton: React.FC<ActionButtonProps> = ({ onPress, iconName, type }) => {
  const isTablet = Device.deviceType === Device.DeviceType.TABLET;
  
  return (
    <TouchableOpacity style={styles.button} onPress={() => onPress()}>
      <View style={[styles.iconWrapper, {width: isTablet ? 100 : 50, height: isTablet ? 100: 50}]}>
        {/* <MaterialIcons name={iconName as string | any} size={30} color="white" /> */}
        <AntDesign name="adduser" size={isTablet ? 50 : 25} color={theme["secondary"]} />
      </View>
    </TouchableOpacity>
  )
}

export default ActionSheetAddButton

const styles = StyleSheet.create({
    button: {
        position: 'absolute',
        right: 20,
        bottom: 5,
        backgroundColor: theme["gradient-from"], // Tomato color
        
        borderRadius: "50%",
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 30, // Adds shadow on Android
        shadowColor: theme["gradient-to"], // Adds shadow on iOS
        shadowOpacity: 0.5,
        shadowRadius: 15,
        zIndex: 3000,
      },
      iconWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
      },
      type: {
        position: 'absolute',
        top: 65,
        fontSize: 12,
        color: '#000',
        textAlign: 'center',
      },
})