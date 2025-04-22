import { StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { DateData } from 'react-native-calendars'
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Button, Input, Text } from '@ui-kitten/components';
import theme from "../../theme.json"
import { useTaskContext } from '@/contexts/TaskContext';
import { Task } from '@/contexts/TaskContext';
import { useUserContext } from '@/contexts/UserContext';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import * as Device from 'expo-device';


interface AddTaskFormProps {
    date?: DateData;
    dismiss: () => void;
    toFamilyMember: string;
}


  const validationSchema = Yup.object().shape({
    description: Yup.string().required("Task description is required"),
  });

const AddTaskForm: React.FC<AddTaskFormProps> = ({date, dismiss, toFamilyMember}) => {
    const {tasks, addTaskToContext} = useTaskContext()
    const [currentDayTask, setCurrentDayTask] = useState<Task>()
    const {user} = useUserContext();
    const [tempTasks, setTempTasks] = useState<Task[]>([])
    const isTablet = Device.deviceType === Device.DeviceType.TABLET;

    useEffect(() => {
      const tasksInCurrentDay = tasks?.filter(task => task.id !== null && task.date.timestamp === date?.timestamp)
      setCurrentDayTask(tasksInCurrentDay[0])      
    }, [tasks])
    
    
  
    

  return (
    <View>
      {/* MODAL TITLE */}
      <Text category='h6' style={[styles.modalTitle, {fontSize: isTablet ? 50 : 18, textTransform: "capitalize"}]}>Add tasks to {toFamilyMember}</Text>
      <Text category='s1' style={[styles.selectedDate, {fontSize: isTablet ? 40 : 18}]}>{date?.dateString}</Text>
        {/* Form */}
        <Formik 
            initialValues={{
              description: "",
            }}
            validationSchema={validationSchema}
            
            onSubmit={values => {
                const task = { ...values, parent: { ...user }, date, isCompleted: false, toFamilyMember: toFamilyMember } as unknown as Task
                
                addTaskToContext(task);
                
                
            }}
        >
    {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue, resetForm }) => 
            
            <View style={styles.inputsWrapper}>
                    <View style={{width:"100%", flexDirection: "row", justifyContent:"space-between", alignItems:"center"}}>
                      {/* DESCRIPTION */}
                    <Input
                        autoCorrect={false}
                        textStyle={{ fontSize: isTablet ? 30 : 18, color: "white" }}
                        style={styles.input}
                        placeholder='Task description'
                        value={ values.description}
                        onChangeText={handleChange('description')}
                      onBlur={handleBlur('description')}
                      status={touched.description && errors.description ? 'danger' : 'basic'}
                    />

                    <TouchableOpacity onPress={() => {
                      handleSubmit()
                      setTimeout(() => {
                        resetForm()
                      }, 0);
                    }} style={{right: -10, top: isTablet ? 10 : 15, position: "absolute", zIndex: 1}}>
                    <EvilIcons style={{opacity: 0.7}} name="plus" size={isTablet ? 80 : 50} color={theme.secondary} />
                    </TouchableOpacity>
                    </View>
                     {touched.description && errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
            </View>
            
            }
            
          </Formik>

    </View>
  )
}

export default AddTaskForm

const styles = StyleSheet.create({
  modalTitle: {
    marginTop: 70,
    marginBottom:0,
    textAlign: 'center',
    color: theme.secondary,
  },
    selectedDate: {
        textAlign:"center",
        marginVertical: 5,
        color: theme.secondary,
        fontWeight: 200,
    },
    inputsWrapper: {
        flex: 1,
        width:"100%",
        marginTop: 50,
        alignItems:"center",
      },
    
      input: {
        width:"100%",
        paddingVertical: 15,
        backgroundColor: theme['btn-bg-color'],
        borderWidth: 1,
        borderColor: "#DDCA8750",
        borderRadius: 15,
        color: "white",
      },
    
      errorText: {
        color: 'red',
        marginTop: -15,
      },
    
      
})