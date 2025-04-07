import { StyleSheet, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Button, Input, Text } from '@ui-kitten/components';
import { FamilyMember } from '@/types/Entity';
import { useUserContext } from '@/contexts/UserContext';
import theme from "../../theme.json"

interface AddFamilyMemberFormProps {
  dismiss: () => void;
}

interface FormValues {
  name: string;
  passcode: string;
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  passcode: Yup.string().required("Passcode is required"),
});

const AddFamilyMemberForm: React.FC<AddFamilyMemberFormProps> = ({ dismiss }) => {
  const { user, updateUser } = useUserContext();

  useEffect(() => {
    // Any side effects to manage
  }, []);

  return (
    <View>
      {/* MODAL TITLE */}
      <Text category="h4" style={styles.modalTitle}>
        Add Family Member
      </Text>

      {/* Form */}
      <Formik
        initialValues={{
          name: "",
          passcode: ""
        }}
        validationSchema={validationSchema}
        onSubmit={values => {
          const { name, passcode } = values;

         

          // Ensure email is a valid string (defaults to empty string if undefined)
          const email = user?.email || '';

          // Build the new member object
          const newMember: FamilyMember = {
            email,
            name,
            passcode,
          };

          // Call updateUser to add the new member
          updateUser({name, passcode});
          dismiss();
        }}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View style={styles.inputsWrapper}>
            {/* FULL NAME */}
            <Input
              style={styles.input}
              placeholder="Enter name"
              value={values.name}
              onChangeText={handleChange('name')}
              onBlur={handleBlur('name')}
              status={touched.name && errors.name ? 'danger' : 'basic'}
            />
            {touched.name && errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

            {/* PASSCODE */}
            <Input
              style={styles.input}
              placeholder="Enter a Passcode | Keep it simple..."
              value={values.passcode}
              onChangeText={handleChange('passcode')}
              onBlur={handleBlur('passcode')}
              status={touched.passcode && errors.passcode ? 'danger' : 'basic'}
            />
            {touched.passcode && errors.passcode && <Text style={styles.errorText}>{errors.passcode}</Text>}

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
                Add new family member
              </Text>}
            </Button>
          </View>
        )}
      </Formik>
    </View>
  );
};

export default AddFamilyMemberForm;

const styles = StyleSheet.create({
  modalTitle: {
    marginTop: 40,
    marginBottom: 0,
    textAlign: 'center',
    color: theme['btn-bg-color'],
    fontSize: 24,
    lineHeight: 36,
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
    marginTop: 20,
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
