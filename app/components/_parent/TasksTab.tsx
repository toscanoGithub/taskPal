import { FlatList, StyleSheet, View } from 'react-native'
import React, { useState } from 'react'
import { Text, Layout } from '@ui-kitten/components'
import theme from '../../theme.json'
import InputWithAutocomplete from './InputWithAutocomplete'
import { useUserContext } from '@/contexts/UserContext'
import { useTaskContext } from '@/contexts/TaskContext'

import Gradient from '../Gradient'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const TasksTab = () => {
  const [term, setTerm] = useState<string>('')
  const { user } = useUserContext()
  const { tasks } = useTaskContext()

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
          keyExtractor={(item) => item.date.dateString}
          renderItem={({ item }) => (
            <Layout style={styles.tasksCard}>
              <Gradient from={theme['gradient-from']} to={theme['gradient-to']} />
              <Text category='h6' style={{ color: theme.secondary, fontSize: 15 }}>{item.toFamilyMember}</Text>
              <Text category='s2' style={{ color: theme.tertiary, fontWeight: '300' }}>{item.date.dateString}</Text>
              {
                item.tasks?.map((task, index) => {
                  const taskObj = typeof task === 'string' ? { description: task } : task;
                  return (
                    <Layout key={index} style={styles.taskDescription}>
                      <MaterialCommunityIcons name="hexagon-outline" size={10} color="black" />
                      <Text style={{ color: "#ffffff70" }}>{taskObj.description}</Text>
                    </Layout>
                  );
                })
              }
            </Layout>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
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
    borderRadius: 3,
    marginTop: 10,
  }


})