import { FlatList, StyleSheet, View } from 'react-native'
import React, { useState } from 'react'
import { Text, Layout } from '@ui-kitten/components'
import theme from '../../theme.json'
import InputWithAutocomplete from './InputWithAutocomplete'
import { useUserContext } from '@/contexts/UserContext'
import { useTaskContext } from '@/contexts/TaskContext'

import Gradient from '../Gradient'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Device from 'expo-device';

const TasksTab = () => {
  const [term, setTerm] = useState<string>('')
  const { user } = useUserContext()
  const { tasks } = useTaskContext()
  const isTablet = Device.deviceType === Device.DeviceType.TABLET;

  const filteredTasks = term
    ? tasks.filter(task =>
        task.toFamilyMember.toLowerCase().includes(term.toLowerCase())
      )
    : tasks

  return (
    <View style={styles.container}>
      <InputWithAutocomplete
        getMemberNameValue={(memberName: string) => setTerm(memberName)}
        placeholder="Search a family member name"
      />

      {filteredTasks.length > 0 ? (
        <FlatList
          data={filteredTasks}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <Layout style={[styles.tasksCard, {minWidth: isTablet ? "80%" : "100%", paddingHorizontal: isTablet ? 15 : 8, paddingBottom: isTablet ? 40 : 15}]}>
              <Gradient from={theme['gradient-from']} to={theme['gradient-to']} />
              <Text category='h6' style={{ color: theme.secondary, fontSize: isTablet ? 30 : 18 }}>{item.toFamilyMember}</Text>
              <Text category='s2' style={{ color: theme.tertiary, fontWeight: '300', fontSize: isTablet ? 30 : 15 }}>{item.date.dateString}</Text>
              {
                item.tasks?.map((task, index) => {
                  const taskObj = typeof task === 'string' ? { description: task } : task;
                  return (
                    <Layout key={index} style={styles.taskDescription}>
                      <MaterialCommunityIcons name="hexagon-outline" size={isTablet ? 20 : 10} color={theme.tertiary} />
                      <Text style={{ color: "#ffffff70", fontSize: isTablet ? 40 : 18 }}>{taskObj.description}</Text>
                    </Layout>
                  );
                })
              }
            </Layout>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{flex: 1, paddingBottom: 120, }}
        />
      ) : (
        <Layout style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text category='h6'>No tasks found</Text>
        </Layout>
      )}
    </View>
  )
}
export default TasksTab

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  tasksCard: {
    padding: 10, 
    borderRadius: 15, 
    marginVertical: 5,
    

  },

  taskDescription: {
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme['btn-bg-color'],
    width: "100%",
    columnGap: 5,
    paddingVertical: 5,
    borderRadius: 5,
    marginTop: 10,
  }


})