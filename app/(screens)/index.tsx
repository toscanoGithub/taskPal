import { Dimensions, Modal, SafeAreaView, StyleSheet, View } from 'react-native'
import React, { useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import theme from "../theme.json";
import { Button, Icon, IconElement, Text } from '@ui-kitten/components';
import SignupForm from '../components/signup-form';
import SigninForm from '../components/signin-form';
import Gradient from '../components/Gradient';


const closeIcon = (props: any): IconElement => (
  <Icon
    {...props}
    name="close-circle"
    style={{width: 30, height: 30}}
    fill="#EDB23270"
  />
);


const AuthScreen = () => {
  const {height} = Dimensions.get('screen')
    const [modalIsVisible, setModalIsVisible] = useState(false)
    const [modalType, setModalType] = useState("SIGN IN")
    const [signinPressed, setSigninPressed] = useState(false)
    const [signupPressed, setSignupPressed] = useState(false)

    const dismissModal = () => {
        setModalIsVisible(!modalIsVisible)
      };

  return (
    <SafeAreaView style={styles.container}>
      <Gradient />
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
          {evaProps => <Text  {...evaProps} style={{color:"#ffffff"}}>SIGN IN</Text>}</Button>
        
        
       {/* SIGN UP BUTTON */}
       <Button onPress={() => {
          setSignupPressed(true)
          setTimeout(() => {
            setSignupPressed(false)
          }, 450);
          setModalType("SIGN UP")
          setModalIsVisible(true);
            }} style={[styles.authBtn, {borderBottomWidth: signupPressed ? 0 : 3}]} appearance='outline'  status='primary'>
              {evaProps => <Text  {...evaProps} style={{color:"#ffffff"}}>SIGN UP</Text>}</Button>

       
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
            

              <Button onPress={() => setModalIsVisible(!modalIsVisible)}  appearance="ghost"  style={styles.closeBtn}  accessoryLeft={closeIcon} />
              <Text category='h4' style={styles.modalTitle}>{modalType}</Text>
              
              {modalType === "SIGN UP" ? <SignupForm dismissModal={dismissModal} /> : <SigninForm dismissModal={dismissModal} />}
            </View>
          </View> 
        </Modal>  
    </SafeAreaView>
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
  },

  buttonsRow: {
      flexDirection:"row",
      justifyContent:"center", 
      alignItems:"center",
      columnGap: 20,
      marginTop: 100
  },

 
  link: {
      paddingTop: 20,
      fontSize: 20,
      color:"white"
      },
  

  authBtn: {
       borderRadius: 30, paddingHorizontal: 30, 
       backgroundColor: theme["btn-bg-color"], 
       borderColor: "transparent",
       borderBottomColor: theme.secondary,
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
      backgroundColor: theme['gradient-from'],
      borderTopLeftRadius: 45,
      // padding: 35,
      alignItems: 'center',
      paddingHorizontal: 10,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
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
      marginTop: 20,
      marginBottom:0,
      textAlign: 'center',
      color: theme.secondary
    },

    closeBtn: {
      position: "absolute",
      left: 0,
      top:0,

    }
})

function setModalType(arg0: string) {
  throw new Error('Function not implemented.');
}
