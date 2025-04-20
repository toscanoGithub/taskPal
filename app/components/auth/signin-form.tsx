import { Platform, StyleSheet, Switch, View } from 'react-native';
import React, { useState } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Input, Button, Text } from '@ui-kitten/components';
import theme from '../../theme.json';
import * as Device from 'expo-device';

// Firebase
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import '../../../firebase/firebase-config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import db from '../../../firebase/firebase-config';

import { useUserContext } from '@/contexts/UserContext';
import { User } from '@/types/Entity';
import { useRouter } from 'expo-router';

interface SigninProp {
  dismissModal: () => void;
}

interface FormValues {
  email: string;
  password: string;
  name?: string;
}

const getValidationSchema = (isEnabled: boolean) =>
  Yup.object().shape({
    email: Yup.string().email('Not a valid email').required('Email is required'),
    password: isEnabled
      ? Yup.string()
      : Yup.string().required('Password is required').min(6, 'Password is too short'),
    name: isEnabled ? Yup.string().required('Your name is required') : Yup.string(),
  });

const SigninForm: React.FC<SigninProp> = ({ dismissModal }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(prev => !prev);

  const { setUser } = useUserContext();
  const auth = getAuth();
  const router = useRouter();
  const [loginBtnPressed, setLoginBtnPressed] = useState(false);
  const isTablet = Device.deviceType === Device.DeviceType.TABLET;

  const signin = async (values: FormValues) => {
    const { email, password, name } = values;
    const q = query(collection(db, 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      alert('No email found in our database');
      return;
    }

    const foundUsers: User[] = [];
    querySnapshot.forEach(doc => {
      foundUsers.push({ id: doc.id, ...doc.data() } as User);
    });

    const foundUser = foundUsers.pop() as User;
    setUser(foundUser);

    if (!isEnabled) {
      // Parent (Host)
      signInWithEmailAndPassword(auth, email, password)
        .then(() => {
          dismissModal();
          router.push('/(screens)/parent-screen');
        })
        .catch(err => {
          alert('Login failed. Check credentials.');
          console.error(err);
        });
    } else {
      // Family Member (Child)
      if (foundUser.members) {
        const member = foundUser.members.find(m => m.name === name);
        if (member) {
          setUser(prev => (prev ? { ...prev, name: member.name } : prev));
          dismissModal();
          router.push('/(screens)/child-screen');
        } else {
          alert('No family member with that name found.');
        }
      } else {
        alert('No family members found for this account.');
      }
    }
  };

  return (
    <Formik
      initialValues={{ email: '', password: '', name: '' }}
      validationSchema={getValidationSchema(isEnabled)}
      enableReinitialize
      onSubmit={values => signin(values)}
    >
      {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isValid }) => (
        <View style={[styles.inputsWrapper, { width: isTablet ? '80%' : '100%' }]}>
          {/* Switch */}
          <View style={styles.switchContainer}>
            <Switch
              trackColor={{ false: theme['gradient-to'], true: theme['gradient-to'] }}
              thumbColor={isEnabled ? theme['secondary'] : theme['gradient-to']}
              ios_backgroundColor="secondary"
              onValueChange={toggleSwitch}
              value={isEnabled}
            />
            <Text
              style={[
                styles.switchLabel,
                {
                  fontSize: isTablet ? 40 : 20,
                  color: isEnabled ? theme.secondary : theme['gradient-to'],
                },
              ]}
            >
              I'm a family member
            </Text>
          </View>

          {/* Email */}
          <Input
            textStyle={{ fontSize: isTablet ? 30 : 20, color: 'white' }}
            style={styles.input}
            placeholder={isEnabled ? "Your parent's email" : 'Your email'}
            value={values.email}
            onChangeText={handleChange('email')}
            onBlur={handleBlur('email')}
            status={touched.email && errors.email ? 'danger' : 'basic'}
          />
          {touched.email && errors.email && (
            <Text style={[styles.errorText, { fontSize: isTablet ? 30 : 18 }]}>
              {errors.email}
            </Text>
          )}

          {/* Password (Only for Parent) */}
          {!isEnabled && (
            <>
              <Input
                textStyle={{ fontSize: isTablet ? 30 : 20, color: 'white' }}
                style={styles.input}
                placeholder="Password"
                value={values.password}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                secureTextEntry
                status={touched.password && errors.password ? 'danger' : 'basic'}
              />
              {touched.password && errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </>
          )}

          {/* Name (Only for Family Member) */}
          {isEnabled && (
            <>
              <Input
                textStyle={{ fontSize: isTablet ? 30 : 20, color: 'white' }}
                style={styles.input}
                placeholder="Your name"
                value={values.name}
                onChangeText={handleChange('name')}
                onBlur={handleBlur('name')}
                status={touched.name && errors.name ? 'danger' : 'basic'}
              />
              {touched.name && errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}
            </>
          )}

          {/* Submit Button */}
          <Button
            onPress={() => {
              setLoginBtnPressed(true);
              setTimeout(() => setLoginBtnPressed(false), 450);
              handleSubmit();
            }}
            style={[
              styles.loginBtn,
              {
                borderBottomWidth: loginBtnPressed ? 0 : 3,
                marginTop: isTablet ? 70 : 60,
              },
            ]}
            appearance="outline"
            status="primary"
            disabled={!isValid}
          >
            {evaProps => (
              <Text {...evaProps} style={{ color: '#ffffff', fontSize: isTablet ? 30 : 18 }}>
                Login
              </Text>
            )}
          </Button>
        </View>
      )}
    </Formik>
  );
};

export default SigninForm;

const styles = StyleSheet.create({
  inputsWrapper: {
    flex: 1,
    marginTop: 20,
  },
  input: {
    width: '100%',
    paddingVertical: 15,
    backgroundColor: theme['btn-bg-color'],
    borderWidth: 1,
    borderColor: '#DDCA8750',
    borderRadius: 15,
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    marginTop: -10,
    marginBottom: 10,
  },
  loginBtn: {
    backgroundColor: theme['btn-bg-color'],
    borderColor: 'transparent',
    borderRadius: 30,
    borderBottomColor: theme.secondary,
  },
  switchContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 15,
  },
  switchLabel: {
    marginLeft: 10,
  },
});
