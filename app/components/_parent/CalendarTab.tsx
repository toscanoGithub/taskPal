import { Animated, Modal, SafeAreaView, StyleSheet, TouchableOpacity, View, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Button, IndexPath, Text } from '@ui-kitten/components';
import { Calendar, DateData } from 'react-native-calendars';
import theme from "../../theme.json";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AddTaskForm from './AddTaskForm';
import { LinearGradient } from 'expo-linear-gradient';
import { useTaskContext } from '@/contexts/TaskContext';
import { Direction, MarkedDates } from 'react-native-calendars/src/types';
import Gradient from '../Gradient';
import { useUserContext } from '@/contexts/UserContext';
import ActionSheetAddButton from '../../components/_parent/action-sheet-add-button';
import { Alert } from 'react-native';
import AddFamilyMemberForm from './AddFamilyMemberForm';
import { FamilyMember } from '@/types/Entity';
import Popover from 'react-native-popover-view';
import * as Device from 'expo-device';



const CalendarTab = () => {
  // task context
  const { tasks } = useTaskContext();
  const { user } = useUserContext();

  const [modalIsVisible, setModalIsVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<DateData>();
  const [daysWithTasks, setDaysWithTasks] = useState<MarkedDates>({});
  const [selectedFamilyMember, setSelectedFamilyMember] = useState<string>();
  const [isPopoverContentVisible, setIsPopoverContentVisible] = useState(false);
  const [modalType, setModalType] = useState<string>()
  const {fetchTasks} = useTaskContext()

  const [isDialogVisible, setIsDialogVisible] = useState<boolean>(false);
  const isTablet = Device.deviceType === Device.DeviceType.TABLET;

  


  const memberSelected = (member: FamilyMember) => {
    if (member.name === selectedFamilyMember) {
      setIsPopoverContentVisible(false);
      return;
    }
    setDaysWithTasks({});
    setIsPopoverContentVisible(false);
    setSelectedFamilyMember(member.name);
  };

  // Handler for when a day is pressed
  const handleDayPress = (date: DateData) => {
    if (!selectedFamilyMember) {
      Alert.alert("You need to select a family member");
      return;
    }

    setModalType("ADD_TASK");
    // if (date.dateString < new Date().toLocaleDateString()) return;

    

    setSelectedDate(date);
    setModalIsVisible(!modalIsVisible);
  };

  // useEffect(() => { 
  //     if (user?.members && !selectedFamilyMember) {
  //       setSelectedFamilyMember(user!.members[0].name)
  //     }
  // }, [user]);

  useEffect(() => {
    const tasksDates = tasks.map(task => {
      return task.toFamilyMember === selectedFamilyMember ? task.date : null;
    }).filter((taskDate): taskDate is DateData => taskDate !== null); // Filter out null values
  
    // Initialize the daysWithTasks object
    const newDaysWithTasks: MarkedDates = {};
    
    tasksDates.forEach(td => {
      // Filter tasks for the given date and family member
      const taskItems = tasks.filter(task => task.date.dateString === td.dateString && task.toFamilyMember === selectedFamilyMember)[0]?.tasks;
      
      if (taskItems) {
        // Type assertion to specify taskItems as an array of objects with a `status` property
        const allCompleted = (taskItems as unknown as { status: string }[]).every((item) => item.status === 'Completed');
        newDaysWithTasks[td.dateString] = {
          selected: true,
          marked: true,
          selectedTextColor: "#14282F",
          dotColor: "#ff0000",
          selectedColor: allCompleted ? "green" : "#4A817730", // green for completed, transparent for incomplete
        };


      }
    });
  
    setDaysWithTasks(newDaysWithTasks);
  }, [tasks, selectedFamilyMember]);

  
  
 

  

  const dismissModal = () => {
    setModalIsVisible(false);
  };






  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={[styles.greetings, {fontSize: isTablet ? 30 : 18}]} category="h2">Welcome, </Text>
          <Text style={[styles.greetings, {fontSize: isTablet ? 30 : 18}]} category="h1">{user?.name}</Text>
        </View>
       {
        !selectedFamilyMember &&  <Text style={[styles.instructions, {fontSize: isTablet ? 30 : 18}]} category="s2">
        Please, select a family member .
      </Text>  
       }
      </View>

      {user?.members && (
        <View style={{ flexDirection: "row", width: "100%", paddingHorizontal: 10, justifyContent: "space-between", alignItems: "center" }}>
          
          <Text style={{fontSize: isTablet ? 50 : 18, color: theme['gradient-to']}} category='h6'>{selectedFamilyMember}</Text>
          <View style={{ marginLeft: "auto", marginVertical: 10 }}>
            <Popover
              isVisible={isPopoverContentVisible}
              popoverStyle={{ backgroundColor: theme["gradient-to"], backfaceVisibility: "hidden", width: 150 }}
              from={(
                <TouchableOpacity
                  disabled={user.members.length === 0}
                  style={{ borderWidth: 1, borderRadius: 5, borderColor: "#ffffff", padding: 10, marginRight: 10, marginBottom: 3, backgroundColor: theme['gradient-to'] }}
                  onPress={() => {
                    setIsPopoverContentVisible(!isPopoverContentVisible)
                  }}
                >
                  <Text category="h6" style={{ color: theme.secondary, fontSize: isTablet ? 30 : 12, fontWeight: 900 }}>
                    {user.members && user.members.length ? "Select a family member" : "No family members yet"}
                  </Text>
                </TouchableOpacity>
              )}
            >
              {user.members.map(member => (
                <Button style={{ width: 150 }} status="info" onPress={() => {
                  fetchTasks()
                  memberSelected(member)
                }} key={member.name}>
                  {evaProps => <Text style={{ color: "white", fontSize: isTablet ? 30 : 18, ...evaProps }}>{member.name}</Text>}
                </Button>
              ))}
            </Popover>
          </View>
        </View>
      )}

      {user?.members?.length ? (
        <View style={styles.calendarContainer}>
          <Calendar
          style={{ backgroundColor: "#ffffff", height: isTablet && 800 }}
            theme={{weekVerticalMargin: isTablet ? 50 : 5,  calendarBackground: "#ffffff", dayTextColor:"black", textDayFontWeight: 400, textDayFontSize: isTablet ? 24 : 18, textMonthFontSize: isTablet ? 30 : 18, textMonthFontWeight: 700, }}
            minDate={new Date().toISOString().split('T')[0]}
            maxDate={'2080-12-31'}
            date={new Date().toLocaleDateString()}
            
            onDayPress={handleDayPress}
            monthFormat={'yyyy MMM'}
            renderArrow={(direction: Direction) => (
              <View style={{ padding: 10 }}>
                {direction === 'left' ? <Text>◀</Text> : <Text>▶</Text>}
              </View>
            )}
            markedDates={daysWithTasks}
          />
        </View>
      ) : (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 50, marginTop: -50 }}>
          <Text style={{ textAlign: "center", color: theme['gradient-from'] }} category="h3">Please, Add Family Members</Text>
        </View>
      )}

      

      {/* Modal */}
      <Modal animationType="slide" transparent={true} visible={modalIsVisible}>
        <View style={styles.centeredView}>
          <View style={[styles.modalView, { height: "85%" }]}>
            <Gradient from={theme['gradient-from']} to={theme['gradient-to']} />
            <Button style={styles.closeBtn} onPress={() => dismissModal()}>
              <MaterialCommunityIcons name="close" size={isTablet ? 100 : 32} color="red" />
            </Button>
            {modalType === "ADD_MEMBER" ? (
               user && <AddFamilyMemberForm  dismiss={() => setModalIsVisible(!modalIsVisible)}  />
            ) : selectedFamilyMember && (
              <AddTaskForm toFamilyMember={selectedFamilyMember}  date={selectedDate} dismiss={() => setModalIsVisible(!modalIsVisible)} />
            )}
          </View>
        </View>
      </Modal>

      <ActionSheetAddButton
        type="ADD_MEMBER"
        onPress={() => {
          setModalType("ADD_MEMBER");
          setTimeout(() => {
            setModalIsVisible(true);
          }, 100);
        }}
        iconName={'user'}
      />
    </SafeAreaView>
  );
};

export default CalendarTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  greetings: {
    fontWeight: 700,
    
  },
  instructions: {
    
    fontWeight: 300,
    color: "#2B2B2B",
  },
  calendarContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginHorizontal: 10,
    boxShadow: "rgba(50, 50, 93, 0.25) 0px 50px 100px -10px, #4A8177 0px 30px 60px -30px",
  },
  centeredView: {
    flex: 1,
    position: "relative",
  },
  modalView: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#F6F6F6",
    borderTopLeftRadius: 30,
    overflow: "hidden",
    alignItems: 'center',
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "100%",
  },
  closeBtn: {
    position: "absolute",
    left: 0,
    top: 0,
    borderTopLeftRadius: 30,
    borderBottomRightRadius: 5,
    borderTopRightRadius: 0,
    borderWidth: 1,
    borderColor: "#DDCA8770",
    backgroundColor: "transparent",
  },

  
});

