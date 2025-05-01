import { Dimensions, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Button, Input, Text } from '@ui-kitten/components';
import { useTaskContext } from '@/contexts/TaskContext';
import { FamilyMember, Reward, Task } from '@/types/Entity';
import { useUserContext } from '@/contexts/UserContext';
import Gradient from '../Gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import theme from "../../theme.json"
import * as Device from 'expo-device';
import { useRewardContext } from '@/contexts/StoreContext';

interface AddRewardFormProps {
  dismiss: () => void;
  
}



const validationSchema = Yup.object().shape({
  title: Yup.string().required("Reward title is required"),
  cost: Yup.string().required("Reward value is required"),
  
});

const AddRewardForm: React.FC<AddRewardFormProps> = ({ dismiss}) => {
  const { createReward } = useRewardContext();
  const {user} = useUserContext()
  const isTablet = Device.deviceType === Device.DeviceType.TABLET;


  return (
    <View>
      {/* MODAL TITLE */}
      <Text category="h4" style={styles.modalTitle}>
        Add Reward
      </Text>

      {/* Form */}
      <Formik
        initialValues={{
          title: "",
          cost: "",
        }}
        validationSchema={validationSchema}
        onSubmit={values => {
          const { title, cost } = values;
          const newReward = {title, cost: parseInt(cost), redeemed: false, familyEmail: user?.email} as Reward
          createReward({...newReward})
          // ADD REWARD
          
          dismiss();
        }}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View style={styles.inputsWrapper}>
            {/* REWARD TITLE */}
            <Input
              textStyle={{ fontSize: isTablet ? 30 : 20, color: 'white' }}
              autoCorrect={false}
              style={styles.input}
              placeholder="Reward title"
              value={values.title}
              onChangeText={handleChange('title')}
              onBlur={handleBlur('title')}
              status={touched.title && errors.title ? 'danger' : 'basic'}
            />
            {touched.title && errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

            {/* REWARD VALUE */}
            <Input
              textStyle={{ fontSize: isTablet ? 30 : 20, color: 'white' }}
              autoCorrect={false}
              style={styles.input}
              placeholder="Reward value"
              value={values.cost}
              onChangeText={handleChange('cost')}
              onBlur={handleBlur('cost')}
              status={touched.cost && errors.cost ? 'danger' : 'basic'}
              keyboardType="numeric"
            />
            {touched.cost && errors.cost && <Text style={styles.errorText}>{errors.cost}</Text>}


            
            {/* Submit Button */}
            <Button
              appearance="outline"
              onPress={() => {
                handleSubmit();
              }}
              style={styles.submitBtn}
              status="primary"
            >
              {evaProps => <Text style={{ ...evaProps, color: "#EDB232", fontSize: 20 }}>
                Add new reward
              </Text>}
            </Button>
          </View>
        )}
      </Formik>

      
    </View>
  );
};

export default AddRewardForm;

const styles = StyleSheet.create({
  modalTitle: {
    marginTop: 30,
    marginBottom: 0,
    textAlign: 'center',
    color: "#EDB232"
  },
  selectedDate: {
    textAlign: "center",
    marginVertical: 5,
    color: "#DDCA87",
    fontSize: 18,
    fontWeight: 100,
  },
  inputsWrapper: {
    flex: 1,
    width: "100%",
    marginTop: 30,
  },
  input: {
    width: "100%",
    paddingVertical: 15,
    backgroundColor: "#3A7174",
    borderWidth: 1,
    borderColor: "#DDCA8750",
    color: "white"
  },
  errorText: {
    color: 'red',
    marginTop: -10,
    marginBottom: 10,
  },
  submitBtn: {
    marginTop: 15,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#DDCA8750"
  },

  
});
