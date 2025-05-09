import { StyleSheet, Switch, Text, View } from 'react-native'
import React, { useState } from 'react'
import { Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { Input, Button, Toggle } from '@ui-kitten/components';
import theme from "../../theme.json"
import * as Device from 'expo-device';


// Firebase
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, Auth } from "firebase/auth";
import "../../../firebase/firebase-config";

import { collection, addDoc, query, where, getDocs, doc } from "firebase/firestore"; 
import db from '../../../firebase/firebase-config';
import { router } from 'expo-router';
import { useUserContext } from '@/contexts/UserContext';
import  BoxMessage  from '../BoxMessage';
interface signupProp {
  dismissModal: () => void;  // Defining the function prop type
}


interface FormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Not a valid email").required('Email is required'),
  password: Yup.string().required('Password is required').min(6, 'Password is too short'),
  confirmPassword: Yup.string()
    .required('Password confirmation is required')
    .oneOf([Yup.ref('password'), ""], "Passwords don't match"),
});

const SignupForm: React.FC<signupProp> = ({ dismissModal }) => {
  const {setUser} = useUserContext();
  const [registerBtnPressed, setRegisterBtnPressed] = useState(false)
  const isTablet = Device.deviceType === Device.DeviceType.TABLET;
  const [showBoxMessage, setShowBoxMessage] = useState(false)
  const [message, setMessage] = useState("");

  // REGISTER LOGIC
 const register = (values: FormValues) => {
      const {name, email, password, confirmPassword} = values;
      const auth = getAuth();
    if(confirmPassword === password) {
        createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        addMoreDataToUser(email, name)
      })
      .catch((error) => {
        console.log(error.message);
        if(error.message.split("-").includes("already")) {
          // alert("Email is already in use")
          setMessage("Email is already in use")
          setShowBoxMessage(true)
        } else {
          // alert("Something went wrong, try later or contact the developer")
          setMessage("Something went wrong, try later or contact the developer")
          setShowBoxMessage(true)
        }
      });
    }
}

const addMoreDataToUser = async (email: string, name: string) => {
try {
const docRef = await addDoc(collection(db, "users"), {
  email,
  name, 
  isFamilyMember: false 
});

setUser({id: docRef.id, email, name, isFamilyMember: false})  
dismissModal()
router.push("/(screens)/parent-screen")    
} catch (e) {
console.error("Error adding document: ", e);
}
}

  return (
      <>
      <BoxMessage
              visible={showBoxMessage}
              dismiss={() => setShowBoxMessage(false)}
              message={message}
              />
        <Formik 
        initialValues={{
          email: '',
          password: '',
          confirmPassword: '',
          name: '',
          isFamilyMember: false,
        }}
        validationSchema={validationSchema}
        onSubmit={values => register(values)}
      
      >

{({ handleChange, handleBlur, handleSubmit, values, errors, touched, resetForm }) => 

<View style={[styles.inputsWrapper, {width: isTablet ? "80%" : "100%"}]}>


  
  {/* Name */}
  <Input
          autoCorrect={false}
          textStyle={{ fontSize: isTablet ? 30 : 20, color: "white" }}
          style={styles.input}
          placeholder='Your name'
          value={values.name}
          onChangeText={handleChange('name')}
          onBlur={handleBlur('name')}
          status={touched.name && errors.name ? 'danger' : 'basic'}
        />
        {touched.name && errors.name && <Text style={styles.errorText}>{errors.name}</Text>}


  {/* EMAIL Keyboardtype */}
        <Input
          textStyle={{ fontSize: isTablet ? 30 : 20, color: "white" }}
          style={styles.input}
          placeholder='Email'
          value={values.email}
          onChangeText={handleChange('email')}
          onBlur={handleBlur('email')}
          status={touched.email && errors.email ? 'danger' : 'basic'}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="emailAddress"
          
        />
        {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}


{/* PASSWORD */}
        <Input
          autoCorrect={false}
          textStyle={{ fontSize: isTablet ? 30 : 20, color: "white" }}
          style={styles.input}
          placeholder='Password'
          value={values.password}
          onChangeText={handleChange('password')}
          onBlur={handleBlur('password')}
          status={touched.password && errors.password ? 'danger' : 'basic'}
        />
        {touched.password && errors.password && <Text style={styles.errorText}>{errors.password}</Text>}


{/* CONFIRM PASSWORD */}
        <Input
          autoCorrect={false}
          textStyle={{ fontSize: isTablet ? 30 : 20, color: "white" }}
          style={styles.input}
          placeholder='Confirm password'
          value={values.confirmPassword}
          onChangeText={handleChange('confirmPassword')}
          onBlur={handleBlur('confirmPassword')}
          status={touched.confirmPassword && errors.confirmPassword ? 'danger' : 'basic'}
        />
        {touched.confirmPassword && errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}


        <Button onPress={() => {
                setRegisterBtnPressed(true)
                setTimeout(() => {
                setRegisterBtnPressed(false)
                }, 450);
                handleSubmit();
              }} style={[styles.registerBtn, {borderBottomWidth: registerBtnPressed ? 0 : 3, marginTop: isTablet ? 70 : 40}]} appearance='outline'  status='primary'>
                      {evaProps => <Text  {...evaProps} style={{color:"#ffffff", fontSize: isTablet ? 30 : 18}}>Register</Text>}</Button>
</View>

}

      </Formik>
      </>
    
  )
}

export default SignupForm

const styles = StyleSheet.create({
  inputsWrapper: {
    flex: 1,
    marginTop: 20,
    marginHorizontal: "auto",
  },

  input: {
    width:"100%",
    paddingVertical: 15,
    backgroundColor: theme['btn-bg-color'],
    borderWidth: 1,
    borderColor: "#DDCA8750",
    borderRadius: 15,
    color: "white"
  },

  errorText: {
    color: 'red',
    marginTop: -15,
  },

  registerBtn: {
    marginTop: 15,
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