import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

interface AddTaskFormProps {
  dismiss: () => void;
  toFamilyMember: string;
}
const AddTaskForm: React.FC<AddTaskFormProps> = ({ dismiss, toFamilyMember }) => {
  return (
    <View>
      <Text>AddTaskForm to {toFamilyMember}</Text>
    </View>
  )
}

export default AddTaskForm

const styles = StyleSheet.create({})