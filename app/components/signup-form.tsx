import { StyleSheet, Switch, Text, View } from 'react-native'
import React, { useState } from 'react'
import { Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { Input, Button, Toggle } from '@ui-kitten/components';
import theme from "../theme.json"
import * as Device from 'expo-device';


// Firebase
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, Auth } from "firebase/auth";
import "../../firebase/firebase-config";

import { collection, addDoc, query, where, getDocs, doc } from "firebase/firestore"; 
import db from '../../firebase/firebase-config';
import { router } from 'expo-router';
import { useUserContext } from '@/contexts/UserContext';
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
          alert("Email is already in use")
        } else {
          alert("Something went wrong, try later or contact the developer")
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

<View style={styles.inputsWrapper}>


  
  {/* Name */}
  <Input
          textStyle={{ fontSize: isTablet ? 30 : 18 }}
          style={styles.input}
          placeholder='Your name'
          value={values.name}
          onChangeText={handleChange('name')}
          onBlur={handleBlur('name')}
          status={touched.name && errors.name ? 'danger' : 'basic'}
        />
        {touched.name && errors.name && <Text style={styles.errorText}>{errors.name}</Text>}


  {/* EMAIL */}
        <Input
          textStyle={{ fontSize: isTablet ? 30 : 18 }}
          style={styles.input}
          placeholder='Email'
          value={values.email}
          onChangeText={handleChange('email')}
          onBlur={handleBlur('email')}
          status={touched.email && errors.email ? 'danger' : 'basic'}
        />
        {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}


{/* PASSWORD */}
        <Input
          textStyle={{ fontSize: isTablet ? 30 : 18 }}
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
          textStyle={{ fontSize: isTablet ? 30 : 18 }}
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
                    }} style={[styles.registerBtn, {borderBottomWidth: registerBtnPressed ? 0 : 3}]} appearance='outline'  status='primary'>
                      {evaProps => <Text  {...evaProps} style={{color:"#ffffff", fontSize: isTablet ? 30 : 18}}>Register</Text>}</Button>
</View>

}

      </Formik>
  )
}

export default SignupForm

const styles = StyleSheet.create({
  inputsWrapper: {
    flex: 1,
    width:"100%",
    marginTop: 20,
  },

  input: {
    width:"100%",
        paddingVertical: 10,
        backgroundColor: "#F2F2F2",
        borderWidth: 1,
        borderColor: "#DDCA8750",
        color: "white"
  },

  errorText: {
    color: 'red',
    marginTop: -10,
    marginBottom: 10,
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