import { FlatList, StyleSheet, View, TouchableOpacity } from 'react-native'
import React, { useMemo, useState, useEffect } from 'react'
import { Text, Layout } from '@ui-kitten/components'
import { Checkbox } from 'expo-checkbox'
import theme from '../../theme.json'
import InputWithAutocomplete from './InputWithAutocomplete'
import { useUserContext } from '@/contexts/UserContext'
import { useTaskContext } from '@/contexts/TaskContext'

import Gradient from '../Gradient'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import * as Device from 'expo-device'
import { Task } from '@/types/Entity'
import Ionicons from '@expo/vector-icons/Ionicons';
import BoxMessage from '../BoxMessage'

const calculatePoints = (tasks: Task['tasks']) =>
  tasks.reduce((total, task) => total + (task.status === 'Approved' ? +task.rewardValue || 0 : 0), 0)
interface Props {
  parentPushToken: string
}
const TasksTab:React.FC<Props> = ({parentPushToken}) => {
  const [term, setTerm] = useState<string>('')
  const { user } = useUserContext()
  const { tasks: contextTasks, updateTaskStatusInFirestore } = useTaskContext()
  const isTablet = Device.deviceType === Device.DeviceType.TABLET

  const [tasks, setTasks] = useState<Task[]>([])
  const [originalTasksOnLoad, setOriginalTasksOnLoad] = useState<Task[]>([])
  const [changedMembers, setChangedMembers] = useState<Set<string>>(new Set())
  const [modified, setModified] = useState(false)
  const [expoPushToken, setExpoPushToken] = useState('');
  const [showBoxMessage, setShowBoxMessage] = useState(false);

  useEffect(() => {
    setExpoPushToken(parentPushToken)
    if(!modified) return;

    const changedMembers = new Set<string>()
  
    tasks.forEach(taskGroup => {
      const originalGroup = originalTasksOnLoad.find(
        og => og.toFamilyMember === taskGroup.toFamilyMember
      )
  
      if (!originalGroup) return
  

      taskGroup.tasks.forEach((task, index) => {
        const originalTask = originalGroup.tasks[index]
        if (task?.status !== originalTask?.status) {
          changedMembers.add(taskGroup.toFamilyMember)
        }
      })


    })
    setChangedMembers(new Set(changedMembers))
    console.log('Changed family members:', Array.from(changedMembers))
  }, [tasks])
  


  useEffect(() => {
    setTasks(contextTasks)
    setOriginalTasksOnLoad(JSON.parse(JSON.stringify(contextTasks))) // Deep clone
  }, [])

  const filteredTasks = useMemo(() => {
    return tasks.filter(task =>
      task.parent.email === user?.email &&
      (term ? task.toFamilyMember.toLowerCase().includes(term.toLowerCase()) : true)
    )
  }, [term, tasks, user])

  const updateTaskStatus = (familyMember: string, taskId: string) => {
      setTasks(prevTasks => {
        const updatedTasks = prevTasks.map(taskGroup => {
          if (taskGroup.toFamilyMember === familyMember) {
            const updatedGroupTasks = taskGroup.tasks.map(task => {
              if (task.id === taskId) {
                return {
                  ...task,
                  status: task.status === "Approved" ? ("Pending Approval" as "Pending Approval") : ("Approved" as "Approved"),
                }
              }
              return task
            })

          // Firestore update
          updateTaskStatusInFirestore(familyMember, taskGroup.date, taskId)

          return {
            ...taskGroup,
            tasks: updatedGroupTasks,
            points: calculatePoints(updatedGroupTasks)
          }
        }

        setModified(true)
        return taskGroup
      })

      // Compare updatedTasks to originalTasksOnLoad to find changed family members
      const changedMembers = new Set<string>()

      updatedTasks.forEach(updatedGroup => {
        const originalGroup = originalTasksOnLoad.find(
          og => og.toFamilyMember === updatedGroup.toFamilyMember
        )

        if (!originalGroup) return

        updatedGroup.tasks.forEach(updatedTask => {
          const originalTask = originalGroup.tasks.find(t => t.id === updatedTask.id)
          if (originalTask && originalTask.status !== updatedTask.status) {
            changedMembers.add(updatedGroup.toFamilyMember)
          }
        })
      })

      console.log("Changed family members:", Array.from(changedMembers))
      return updatedTasks
    })
  }



  const getMemberPushToken = (memberName: string) => {

    const memberToken = user?.members?.find(member => member.name === memberName)?.memberPushToken;
    return memberToken  // Assuming member token is stored in user context
  };

  // Function to send notification for a single day when all tasks are Pending Approval
  const notifyAFamilyMemberWithApprovalTasks = async (memberName: string) => {
    
    
    const memberPushToken = getMemberPushToken(memberName);
    console.log("::::::::::::::", memberPushToken);
    
    if (memberPushToken && expoPushToken) {
      const message = {
        to: memberPushToken,
        sound: 'default',
        title: 'Tasks Approval!',
        body: `Your tasks are approved. Good job`,
        // data: { dateString, tasks: tasksForSelectedDay },
      };

      // Sending the notification
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      console.log("success...");
      
      setShowBoxMessage(true)
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ width: "100%" }}>
        <BoxMessage
          visible={showBoxMessage}
          dismiss={() => setShowBoxMessage(false)}
          message="Your tasks are approved. Congrats!"
        />
      </View>
      {/* Notifications button */}
      {
        changedMembers.size !== 0 && (<TouchableOpacity
          onPress={() => {
            changedMembers.forEach(member => {
              console.log(`Notify ${member}`)
              // You can trigger notifications here
              notifyAFamilyMemberWithApprovalTasks(member)
            })
          }}
          // disabled={changedMembers.size === 0}
          style={{
            position: 'absolute',
            right: 10,
            bottom:10,
            zIndex: 100,
            
            
          }}
        >
          {changedMembers.size !== 0 && <View style={{flexDirection:"row", justifyContent: "center", alignItems:"center", backgroundColor: theme['gradient-from'], padding: 3, borderRadius: 10}}><Text style={{color: theme.tertiary, }}>Notify family members</Text><Ionicons name="notifications-outline" size={30} color={theme.secondary} /></View> }
        </TouchableOpacity>)
      }

      <InputWithAutocomplete
        getMemberNameValue={(memberName: string) => setTerm(memberName)}
        placeholder="Search a family member name"
      />

      {filteredTasks.length > 0 ? (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item, index) => item.id || index.toString()}
          renderItem={({ item }) => (
            <Layout
              style={[
                styles.tasksCard,
                {
                  minWidth: isTablet ? '80%' : '100%',
                  paddingHorizontal: isTablet ? 15 : 8,
                  paddingBottom: isTablet ? 40 : 15,
                },
              ]}
            >
              <Gradient from={theme['gradient-from']} to={theme['gradient-to']} />
              <View style={styles.cardHeader}>
                <View>
                  <Text category="h6" style={[styles.cardTitle, { fontSize: isTablet ? 30 : 18 }]}>
                    {item.toFamilyMember}
                  </Text>
                  <Text category="s2" style={[styles.cardDate, { fontSize: isTablet ? 30 : 15 }]}>
                    {item.date.dateString}
                  </Text>
                </View>
                <Text category="s2" style={[styles.cardPoints, { fontSize: isTablet ? 30 : 15 }]}>
                  {calculatePoints(item.tasks)} points
                </Text>
              </View>

              {item.tasks.map((task, index) => {
                const isApproved = task.status === 'Approved'

                return (
                  <View key={`${item.toFamilyMember}-${task.id}`}>
                    <TouchableOpacity
                      disabled={isApproved}
                      onPress={() => updateTaskStatus(item.toFamilyMember, task.id)}
                      activeOpacity={0.8}
                    >
                      <Layout style={styles.taskDescription}>
                        <MaterialCommunityIcons
                          name="hexagon-outline"
                          size={isTablet ? 20 : 10}
                          color={theme.tertiary}
                        />

                        <View style={styles.checkboxContainer}>
                          <Checkbox
                          
                            style={[styles.checkbox, { opacity: isApproved ? 0.3 : 1, backgroundColor: isApproved ? theme['gradient-to'] : theme['gradient-from']}]}
                            value={isApproved}
                            color={isApproved ? theme['gradient-to'] : theme['gradient-from']}
                            
                          />
                        </View>

                        <Text style={[styles.taskText, { fontSize: isTablet ? 40 : 18 }]}>
                          {task.description}
                        </Text>
                      </Layout>
                    </TouchableOpacity>
                  </View>
                )
              })}
            </Layout>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      ) : (
        <Layout style={styles.emptyState}>
          <Text category="h6">No tasks found</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  tasksCard: {
    padding: 10,
    marginVertical: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    columnGap: 10,
  },
  cardTitle: {
    color: theme.secondary,
  },
  cardDate: {
    color: theme.tertiary,
    fontWeight: '300',
  },
  cardPoints: {
    color: theme.tertiary,
    fontWeight: '300',
  },
  taskDescription: {
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme['btn-bg-color'],
    width: '100%',
    columnGap: 5,
    paddingVertical: 5,
    borderRadius: 5,
    marginTop: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkbox: {
    transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
    borderRadius: 3,
    borderWidth: 1,
    justifyContent:"center",
    alignItems:"center",
    marginLeft: 5,
  },
  taskText: {
    color: '#ffffff70',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
})