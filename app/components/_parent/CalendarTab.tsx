import { Alert, Animated, ImageProps, Modal, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Text, Button,  Icon, IconElement, Layout, Spinner } from '@ui-kitten/components'
import theme from '../../theme.json'
import Gradient from '../Gradient'
import AddFamilyMemberForm from './AddFamilyMemberForm'
import { useUserContext } from '@/contexts/UserContext'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Popover from 'react-native-popover-view';
import { FamilyMember } from '@/types/Entity'
import { Calendar, DateData } from 'react-native-calendars';
import { Direction, MarkedDates } from 'react-native-calendars/src/types';
import AddTaskForm from './AddTaskForm'

const CalendarTab = () => {
    const [familyMembers, setFamilyMembers] = useState<any[]>([])
    const shakeIconRef = React.useRef<Icon<Partial<ImageProps>>>();
    const { user } = useUserContext();
    const [modalIsVisible, setModalIsVisible] = useState(false);
    const [isPopoverContentVisible, setIsPopoverContentVisible] = useState(false);
    const [selectedFamilyMember, setSelectedFamilyMember] = useState<string>();

    const [selectedDate, setSelectedDate] = useState<DateData>();
    const [daysWithTasks, setDaysWithTasks] = useState<MarkedDates>({});

    const [modalType, setModalType] = useState<string>()

    const memberSelected = (member: FamilyMember) => {
      if (member.name === selectedFamilyMember) {
        setIsPopoverContentVisible(false);
        return;
      }
      setIsPopoverContentVisible(false);
      setSelectedFamilyMember(member.name);
    };

    useEffect(() => { 
      if (user?.members && !selectedFamilyMember) {
        setSelectedFamilyMember(user!.members[0].name)
      }
  }, []);


    const renderShakeAddFamilyMemberIcon = (props: any): IconElement => (
      <Icon
        {...props}
        ref={shakeIconRef}
        animationConfig={{cycles: 20, duration: 20 }}
        animation='shake'
        name='person-add-outline'
        size="giant"
        fill={theme.secondary}
        style={styles.icon}
      />
    );
  
    useEffect(() => {
      if (shakeIconRef.current) {
        shakeIconRef.current.startAnimation();
      }
    }, [])

    const dismissModal = () => {
      setModalIsVisible(!modalIsVisible);
    }


    useEffect(() => {
      console.log("User: ", user);
      if(user?.members?.length === 0) return;
      user?.members?.forEach((element: any) => {
        setFamilyMembers((prev: any[]) => [...prev, element])
      });

      
    }, [user?.members?.length])
    

    // Handler for when a day is pressed
      const handleDayPress = (date: DateData) => {
        setModalType("ADD_TASK");
        if (date.dateString < new Date().toLocaleDateString()) return;
    
        if (!user?.members?.length) {
          Alert.alert("You need to add a child");
          return;
        }
    
        setSelectedDate(date);
        setModalIsVisible(!modalIsVisible);
      };


      const addFamilyMemberPressed = () => {
        setModalType("ADD_MEMBER");
        setModalIsVisible(!modalIsVisible);
      }
    
    return (
      <View style={styles.container}>
        {
          familyMembers.length === 0 ? 
          <View style={{flex:1, justifyContent: 'center', alignItems: 'center', width:"100%"}}>
            <Text category='s1'>Nothing to show, please add your family members</Text>
            
          </View> : 
          <View style={{flex:1, marginTop: 30,  width:"100%"}}>
          {/* Text instructions */}
          
          {/* Row selected member | select member */}
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width:"100%", paddingHorizontal: 10, paddingVertical: 0}}>
              <Text>{selectedFamilyMember || familyMembers[0].name}</Text>
          <View style={{ marginLeft: "auto" }}>
            <Popover
              isVisible={isPopoverContentVisible}
              
              popoverStyle={{  backgroundColor: theme["gradient-to"], backfaceVisibility: "hidden", width: 150 }}
              from={(
                <TouchableOpacity
                  disabled={user?.members?.length === 0}
                  style={{ borderWidth: 1, borderRadius: 5, borderColor: "#ffffff", padding: 10, marginRight: 10, marginBottom: 3, backgroundColor: theme['gradient-to'] }}
                  onPress={() => {
                    setIsPopoverContentVisible(!isPopoverContentVisible)
                  }}
                >
                  <Text category="h6" style={{ color: theme.secondary, fontSize: 12, fontWeight: 900 }}>
                  Select a family member                  
                  </Text>
                </TouchableOpacity>
              )}
            >
              {user?.members?.map(member => (
                <Button style={{ width: 150, backgroundColor: theme["gradient-to"], borderColor:"transparent" }} status="info" onPress={() => {
                  memberSelected(member)
                }} key={member.name}>
                  {evaProps => <Text style={{ color: "black", fontSize: 12, ...evaProps }}>{member.name}</Text>}
                </Button>
              ))}
            </Popover>
          </View>

          </View>
  
          {/* Calendar */}
          <View style={styles.calendarContainer}>
          <Calendar
            theme={{ calendarBackground: "#ffffff" , dayTextColor:"black"}}
            date={'2025-01-01'}
            minDate={new Date().toLocaleDateString()}
            maxDate={'2080-12-31'}
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
          </View>
        }

          <Button
            onPress={addFamilyMemberPressed}
              style={styles.addMembersBtn}
              status='danger'
              accessoryLeft={renderShakeAddFamilyMemberIcon}
          />
        {/* Modal */}
      <Modal animationType="slide" transparent={true} visible={modalIsVisible}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Gradient />
            <Button style={styles.closeBtn} onPress={() => dismissModal()}>
              <MaterialCommunityIcons name="close" size={32} color="red" />
            </Button>
            {modalType === "ADD_MEMBER" ? (
               user && <AddFamilyMemberForm dismiss={() => setModalIsVisible(!modalIsVisible)}  />
            ) : 
              <AddTaskForm toFamilyMember={selectedFamilyMember || familyMembers[0]?.name || ""} dismiss={() => setModalIsVisible(!modalIsVisible)} />
            }
          </View>
        </View>
      </Modal>
  
      </View>
    )
}

export default CalendarTab

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  addMembersBtn: {
    margin: 2,
    position: "absolute",
    right: 10,
    bottom: 10,
    width: 30,
    height: 30,
    borderRadius: "50%",
    borderColor: "transparent",
    backgroundColor:theme['btn-bg-color'],
    shadowColor: theme['gradient-from'],
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16,

    elevation: 24,
      },

    icon: {
      width: 25,
      height: 25,
      
    },

    // Modal
    centeredView: {
      flex: 1,
      position: "relative",
    },
    modalView: {
      height: "80%",
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.secondary,
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
      borderColor: theme.tertiary,
      backgroundColor: "transparent",
    },

    calendarContainer: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
      marginHorizontal: 10,
      marginVertical: 10,
      boxShadow: "rgba(50, 50, 93, 0.25) 0px 50px 100px -10px, #4A8177 0px 30px 60px -30px",
    },
})