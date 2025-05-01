import { Dimensions, FlatList, Image, Modal, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { useUserContext } from '@/contexts/UserContext';
import { useRewardContext } from '@/contexts/StoreContext';

import { Text } from '@ui-kitten/components';
import RewardCard from '../components/RewardCard';
import { DeckSwiper } from 'expo-deck-swiper';
import * as Device from 'expo-device';
import theme from "../theme.json"
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AddRewardForm from '../components/_parent/AddRewardForm';
import Gradient from '../components/Gradient';
import { Reward } from '@/types/Entity';

const StoreScreen = () => {
  const {user} = useUserContext()
  const [editMode, setEditMode] = useState(false)
  const {rewards, fetchRewards} = useRewardContext()
  const isTablet = Device.deviceType === Device.DeviceType.TABLET;
  const [modalIsVisible, setModalIsVisible] = useState(false);
  const {height} = Dimensions.get('screen');
  const [swiperKey, setSwiperKey] = useState(Date.now());
  const [prevRewardCount, setPrevRewardCount] = useState(0);
  const prevRewardsRef = useRef<Reward[]>([]);

  const dismissModal = () => {
    fetchRewards(user?.email ?? '').then(() => {
      // No need to update swiperKey here — effect will handle it
    });
    setModalIsVisible(false);
  };
  // Get screen width
const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    setEditMode(user?.isFamilyMember ?? true)
    if (user?.email) {
      fetchRewards(user.email ?? '')
      
    }
    console.log("rewards", rewards, editMode);
  }, [editMode])




  useEffect(() => {
    const prevIds = prevRewardsRef.current.map(r => r.id).sort();
  const currIds = rewards.map(r => r.id).sort();

  const changed = JSON.stringify(prevIds) !== JSON.stringify(currIds);

  if (changed) {
    prevRewardsRef.current = rewards;
    setSwiperKey(Date.now()); // Force DeckSwiper re-mount
  }
  }, [rewards])
  


  const mainContent = () => {
    return <View style={{flex: 1,}}>
       <View style={[styles.cardsList, {marginTop: !editMode ? 20 : 50}]}>
        {
          rewards.length > 0 ? 
           <DeckSwiper
            key={swiperKey}
            renderAheadCount={rewards.length}
            data={[...rewards].reverse()}
           renderCard={(item) => (
             <View style={{width:"100%", flex: 1, backgroundColor:"purple"}}>
               <RewardCard reward={item} />
             </View>
           )}
           onSwipeLeft={(item) => console.log('Swiped left:', item)}
           onSwipeRight={(item) => console.log('Swiped right:', item)}
   /> : 
            <View style={{marginVertical: 150, }}>
              <Text category='h3' style={{fontSize: 24, fontWeight: 700, color: theme['gradient-to'], textAlign:"center" }}>
              No rewards to show.
              </Text>
              {
                !editMode ? <Text category='h6' style={{textAlign:"center",  fontWeight: 300, color:"white", borderRadius: 3, backgroundColor: theme['gradient-to'], padding: 5}}>Please tap the button below</Text > : <Text category='h6' style={{textAlign:"center", fontWeight: 300, color:"white", borderRadius: 3, backgroundColor: theme['gradient-to'], padding: 5}}>Please, come back later!</Text>
              }
            </View>
        }
    </View> 
    {
      !editMode && <TouchableOpacity style={styles.addRewardBtn} onPress={() => setModalIsVisible(true)}>
        <Image style={styles.addRewardImage} source={require("../../assets/images/add_reward.png")} />
      </TouchableOpacity>
    }
    </View>
  }
  
  
  return (
    <SafeAreaView style={styles.container}>
      <Text category='h1' style={styles.title}>Task Pal Store</Text>
      {
        mainContent()
      }

      {/* Modal */}
                  <Modal animationType="slide" transparent={true} visible={modalIsVisible}>
                    <View style={styles.centeredView}>
                      <View style={[styles.modalView, { height: "85%" }]}>
                        <Gradient from={theme['gradient-from']} to={theme['gradient-to']} />
                        <TouchableOpacity style={[styles.closeBtn, {width: isTablet ? 120 : 60, height: isTablet ? 70 : 40, opacity: 0.7}]} onPress={() => dismissModal()}>
                              <MaterialCommunityIcons name="close" size={isTablet ? 50 : 24} color={theme.secondary} />
                            </TouchableOpacity>
                        
                          <AddRewardForm  dismiss={() => setModalIsVisible(!modalIsVisible)}  />
                        
                      </View>
                    </View>
                  </Modal>
      
    </SafeAreaView>
  )
}

export default StoreScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  title: {
    fontSize: 24, textAlign:"center", lineHeight: 36, marginTop: 20
  },

  cardsList: {
    justifyContent: "center", alignItems: "center",
    rowGap: 10,
    
  },

  addRewardBtn: {
    position: "absolute", bottom: 0, right: 10,
    width: 70, height: 70, justifyContent:"center", alignItems:"center"
  },

  addRewardImage: {
   width: "100%", height: "100%"
  },

  // Modal
  centeredView: {
    flex: 1,
    position: "relative",
  },
  modalView: {
    position: "absolute",
    bottom: -30,
    left: 0,
    right: 0,
    backgroundColor: "#F6F6F6",
    // borderTopLeftRadius: 30,
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
    top: -5,
    borderTopLeftRadius: 30,
    borderWidth: 3,
    borderColor: "#DDCA8740",
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
})