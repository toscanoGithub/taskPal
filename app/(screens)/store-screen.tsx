import { Dimensions, FlatList, Image, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { useUserContext } from '@/contexts/UserContext';
import { useRewardContext } from '@/contexts/StoreContext';

import { Text } from '@ui-kitten/components';
import RewardCard from '../components/RewardCard';
import { DeckSwiper } from 'expo-deck-swiper';
import * as Device from 'expo-device';
import theme from "../theme.json"

const StoreScreen = () => {
  const {user} = useUserContext()
  const [editMode, setEditMode] = useState(false)
  const {rewards, fetchRewards} = useRewardContext()
  const isTablet = Device.deviceType === Device.DeviceType.TABLET;

  // Get screen width
const screenWidth = Dimensions.get('window').width;

// Determine number of columns
const numColumns = screenWidth >= 768 ? 3 : 2; // Tablets usually >= 768px
  useEffect(() => {
    setEditMode(user?.isFamilyMember ?? true)
    if (user?.email) {
      fetchRewards(user.email)
      
    }
    console.log("rewards", rewards, editMode);
  }, [editMode])

  
 

  const mainContent = () => {
    return <View style={{flex: 1,}}>
       <View style={[styles.cardsList, {marginTop: !editMode ? 20 : 50}]}>
        {
          rewards.length > 0 ? <DeckSwiper
          renderAheadCount={rewards.length}
          data={rewards}
          renderCard={(item) => (
            <View style={{width:"100%", flex: 1, backgroundColor:"purple"}}>
              <RewardCard reward={item} />
            </View>
          )}
          onSwipeLeft={(item) => console.log('Swiped left:', item)}
          onSwipeRight={(item) => console.log('Swiped right:', item)}
        />  : <View style={{marginVertical: 150, }}>
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
      !editMode && <TouchableOpacity style={styles.addRewardBtn}>
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
  }
})