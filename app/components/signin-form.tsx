import { Platform, StyleSheet, Switch, View } from 'react-native'
import React, { useState } from 'react'
import { Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { Input, Button, Text } from '@ui-kitten/components';
import theme from "../theme.json"
import * as Device from 'expo-device';

// Firebase
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, Auth } from "firebase/auth";
import "../../firebase/firebase-config";

import { collection, addDoc, query, where, getDocs, doc } from "firebase/firestore"; 
import db from '../../firebase/firebase-config';
import { router } from 'expo-router';
import { useUserContext } from '@/contexts/UserContext';
import { AuthUser, User } from '@/types/Entity';
import { useRouter } from 'expo-router';
import Gradient from './Gradient';


interface SigninProp {
  dismissModal: () => void;  // Defining the function prop type
}


interface FormValues {
  email: string;
  password: string;
  name?: string;
}

const validationSchema = Yup.object().shape({
  email: Yup.string().email("Not a valid email").required('Email is required'),
  password: Yup.string().required('Password is required').min(6, 'Password is too short'),
});

const SigninForm: React.FC<SigninProp> = ({ dismissModal }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);
  const {setUser, user} = useUserContext()
  const auth = getAuth();
  const router = useRouter();
  const [loginBtnPressed, setLoginBtnPressed] = useState(false)
  const isTablet = Device.deviceType === Device.DeviceType.TABLET;

  // REGISTER LOGIC
  const signin = async (values: FormValues) => {
    if(isEnabled && values.name === "") {
      alert("Please enter your name")
      return;
    }

  /*query the email
      if success >> check if isFamilyMember.
      if not  >> normal signInWithEmailAndPassword
      else >> check the name if it matches doc.data().toFamilyMember
      match means grant access and pusch screen to child-screen */

      const {email, password, name} = values;
      const q = query(collection(db, "users"), where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if(querySnapshot.empty) {
        alert("No email found in our database")
      } else {
        const foundUsers: User[] = []
        querySnapshot.forEach((doc) => {
          foundUsers.push({id: doc.id, ...doc.data()} as User)         
        });
        const foundUser = foundUsers.pop() as User;
        setUser(foundUser)
        if(!isEnabled) { // Host
          
          signInWithEmailAndPassword(auth, email, password) // signin parent
          .then(userCredentials => {
            dismissModal();
            router.push("/(screens)/parent-screen")
          })
        } else {
          // pick the name from familyMember just grant access to the child
          
          if(foundUser.members) {
            const member = foundUser.members.filter(m => m.name === name)
            setUser((prev) => {
              if (prev && member.length > 0) {
                return { ...prev, name: member[0].name};
              }
              return prev; // Or return null, depending on your logic
            });
            
          }
          
          dismissModal();
          router.push("/(screens)/child-screen")
        }
        

        // dismissModal();
        // router.push("/(screens)/parent-screen")
        
      }
  
}

  return (
    <>
    {/* <Gradient from={theme['gradient-from']} to={theme['gradient-to']}  /> */}
      
    <Formik 
        initialValues={{
          email: 'jdoe@task.pal',
          password: 'qwerty',
          name: ""
        }}
        validationSchema={validationSchema}
        onSubmit={values => signin(values)}
      
      >

{({ handleChange, handleBlur, handleSubmit, values, errors, touched, resetForm }) => 

<View style={[styles.inputsWrapper, {width: isTablet ? "80%" : "100%"}]}>
<View style={{flexDirection:"row", width:"100%", justifyContent:"flex-start", alignItems:"center",  marginBottom: 15}}>
    <Switch
      trackColor={{false: theme["gradient-to"], true: theme["gradient-to"]}}
      thumbColor={isEnabled ? theme["secondary"] : theme["gradient-to"]}
      ios_backgroundColor="secondary"
      onValueChange={toggleSwitch}
      value={isEnabled}
    /> 
    <Text category='title'  style={{fontSize: isTablet ? 40 : 20, marginLeft: 10,  color: `${isEnabled ? theme.secondary : theme["gradient-to"]}`}}>I'm a family member</Text>
  </View>
  {/* EMAIL */}
        <Input
          textStyle={{ fontSize: isTablet ? 30 : 20, color: "white" }}
          style={styles.input}
          placeholder={isEnabled ? "Your parent's email" : "Your email"}
          value={values.email}
          onChangeText={handleChange('email')}
          onBlur={handleBlur('email')}
          status={touched.email && errors.email ? 'danger' : 'basic'}
        />
        {touched.email && errors.email && <Text style={[styles.errorText, {marginBottom: isTablet ? 15 : 0, fontSize: isTablet ? 30 : 18}]}>{errors.email}</Text>}


{/* PASSWORD */}
        {
          !isEnabled && <><Input
          textStyle={{ fontSize: isTablet ? 30 : 20, color: "white" }}
          style={styles.input}
          placeholder='Password'
          value={values.password}
          onChangeText={handleChange('password')}
          onBlur={handleBlur('password')}
          status={touched.password && errors.password ? 'danger' : 'basic'}
        />
        {touched.password && errors.password && <Text style={styles.errorText}>{errors.password}</Text>}</>
        }

{/* Name */}
        {
          isEnabled && <><Input
          textStyle={{ fontSize: isTablet ? 30 : 20, color: "white" }}
          style={styles.input}
          placeholder='Your name'
          value={values.name}
          onChangeText={handleChange('name')}
          onBlur={handleBlur('name')}
          status={touched.name && errors.name ? 'danger' : 'basic'}
        />
         {touched.name && errors.name && <Text style={styles.errorText}>{errors.name}</Text>}</>
        }




        <Button onPress={() => {
                        setLoginBtnPressed(true)
                        setTimeout(() => {
                        setLoginBtnPressed(false)
                        }, 450);
                        handleSubmit();
                            }} style={[styles.loginBtn, {borderBottomWidth: loginBtnPressed ? 0 : 3, marginTop: isTablet ? 70 : 60}]} appearance='outline'  status='primary'>
                              {evaProps => <Text  {...evaProps} style={{color:"#ffffff", fontSize: isTablet ? 30 : 18}}>Login</Text>}</Button>
</View>

}

      </Formik>
    </>
  )
}

export default SigninForm

const styles = StyleSheet.create({
  inputsWrapper: {
    flex: 1,
    marginTop: 20,
    
  },

  input: {
    width:"100%",
        paddingVertical: 15,
        backgroundColor: theme['btn-bg-color'],
        borderWidth: 1,
        borderColor: "#DDCA8750",
        borderRadius: 15,
  },

  errorText: {
    color: 'red',
    marginTop: -15,
  },


  loginBtn: {
      backgroundColor: theme["btn-bg-color"],
      borderColor: "transparent",
      borderRadius: 30,
      borderBottomColor: theme.secondary,
    },

  button: {
    width: "100%",
    height: 50,
    borderRadius: 30,
  },
  buttonPressed: {
    opacity: 0.5,  // Change the opacity when button is pressed
  },
})



