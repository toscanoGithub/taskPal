import { Dimensions, Modal, SafeAreaView, StyleSheet, View } from 'react-native'
import React, { useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import theme from "../theme.json";
import { Button, Icon, IconElement, Text } from '@ui-kitten/components';
import SignupForm from '../components/auth/signup-form';
import SigninForm from '../components/auth/signin-form';
import Gradient from '../components/Gradient';
import { StatusBar } from 'expo-status-bar';
import * as Device from 'expo-device';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';


const closeIcon = (props: any): IconElement => (
  <Icon
    {...props}
    name="close"
    style={{width: 50, height: 50, opacity: 0.6}}
    fill="#ff0000"
  />
);


const AuthScreen = () => {
    const {height} = Dimensions.get('screen')
    const [modalIsVisible, setModalIsVisible] = useState(false)
    const [modalType, setModalType] = useState("SIGN IN")
    const [signinPressed, setSigninPressed] = useState(false)
    const [signupPressed, setSignupPressed] = useState(false)
    const isTablet = Device.deviceType === Device.DeviceType.TABLET;

    const dismissModal = () => {
        setModalIsVisible(!modalIsVisible)
      };

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      <Gradient from={theme['gradient-from']} to={theme['gradient-to']} />
      <View style={styles.buttonsRow}>
        {/* SIGN IN BUTTON */}
        <Button onPress={() => {
            setSigninPressed(true)
            setTimeout(() => {
              setSigninPressed(false)
            },450);
            setModalType("SIGN IN")
            setModalIsVisible(true)
        }} style={[styles.authBtn, {borderBottomWidth: signinPressed ? 0 : 3} ]} appearance='outline' 
         status='primary'>
          {evaProps => <Text  {...evaProps} style={{color:"#ffffff", fontSize: isTablet ? 30 : 18}}>SIGN IN</Text>}</Button>
        
        
       {/* SIGN UP BUTTON */}
       <Button onPress={() => {
          setSignupPressed(true)
          setTimeout(() => {
            setSignupPressed(false)
          }, 450);
          setModalType("SIGN UP")
          setModalIsVisible(true);
            }} style={[styles.authBtn, {borderBottomWidth: signupPressed ? 0 : 3}]} appearance='outline'  >
              {evaProps => <Text  {...evaProps} style={{color:"#ffffff", fontSize: isTablet ? 30 : 18}}>SIGN UP</Text>}</Button>

       
      </View>

      <View style={[styles.instructions, {minHeight: height * 0.9}]}>
        <Text category='h1' status='primary' style={[styles.instructionsText, {marginTop: -200}]}  >
          Step Inside,
        </Text>

        <Text style={styles.instructionsText} category='h1' status='primary'  >
          Finish Your Chores,
        </Text>

        <Text style={styles.instructionsText} category='h1' status='primary'  >
          Embrace Joy !
        </Text>
      </View>
      
      
      <Modal
          animationType="slide"
          transparent={true}
          visible={modalIsVisible}
          onRequestClose={() => {
            
            setModalIsVisible(!modalIsVisible);
          }}>
            
              <View style={styles.centeredView}>    

            <View style={styles.modalView}>
            
    <Gradient from={theme['gradient-from']} to={theme['gradient-to']}  />

    <TouchableOpacity style={[styles.closeBtn, {width: isTablet ? 120 : 60, height: isTablet ? 70 : 40, opacity: 0.7}]} onPress={() => dismissModal()}>
      <MaterialCommunityIcons name="close" size={isTablet ? 50 : 24} color={theme.secondary} />
    </TouchableOpacity>
    <Text category='h4' style={[styles.modalTitle, {fontSize: isTablet ? 60 : 30,  marginVertical: isTablet ? 40 : 10}]}>{modalType}</Text>
              
              {modalType === "SIGN UP" ? <SignupForm dismissModal={dismissModal} /> : <SigninForm dismissModal={dismissModal} />}
            </View>
          </View> 
        </Modal>  
    </View>
  )
}

export default AuthScreen

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 700,
  },

  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:theme['gradient-to']
  },

  buttonsRow: {
      flexDirection:"row",
      justifyContent:"center", 
      alignItems:"center",
      columnGap: 20,
      marginTop: 150
  },

 
  link: {
      paddingTop: 20,
      fontSize: 20,
      color:"white"
      },
  

  authBtn: {
       borderRadius: 30, 
       paddingHorizontal: 30, 
       backgroundColor: theme["btn-bg-color"], 
       borderColor: theme['gradient-from'],
       borderBottomColor: theme["secondary"],
       minWidth: 150,
  },

  instructions: {
      justifyContent:"center", alignItems:"flex-start", marginTop: 40, rowGap: 30
  },

  instructionsText: {
      fontSize: 30, lineHeight: 45, color: theme["title-text-color"]
  },


  // modal
  centeredView: {
      flex: 1,
    },
    modalView: {
      position:"absolute",
      bottom:0,
      left:0, right:0,
      // borderTopLeftRadius: 45,
      padding: 35,
      alignItems: 'center',
      paddingHorizontal: 10,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 1,
      elevation: 10,
      height:"80%",
      width:"100%",
      
      
    },
    button: {
      borderRadius: 20,
      padding: 10,
      elevation: 2,
    },
    
    textStyle: {
      color: 'white',
      fontWeight: 'bold',
      textAlign: 'center',
    },
    modalTitle: {
      textAlign: 'center',
      color: theme.secondary,
      
    },

    closeBtn: {
      position: "absolute",
      left: 0,
      top: -5,
      borderTopLeftRadius: 30,
      borderWidth: 2,
      borderColor: "#DDCA8740",
      backgroundColor: "transparent",
      justifyContent: "center",
      alignItems: "center",
    


    }
})

function setModalType(arg0: string) {
  throw new Error('Function not implemented.');
}
