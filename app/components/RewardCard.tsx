import { Dimensions, Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Reward, User } from '@/types/Entity';
import { Text } from '@ui-kitten/components';
import Gradient from './Gradient';
import theme from "../theme.json"
import BoxMessage from './BoxMessage';
import { useUserContext } from '@/contexts/UserContext';
import { useRewardContext } from '@/contexts/StoreContext';

interface RewardCardProps {
    reward: Reward;

}
const RewardCard: React.FC<RewardCardProps> = ({reward}) => {
    const {title, redeemed, cost} = reward;
    const {height} = Dimensions.get("window");
    const [showBoxMessage, setShowBoxMessage] = useState(false)
    const {user, updateUser, updatePointsforAFamilyMember} = useUserContext()
    const {updateReward} = useRewardContext()
    const [pointsRedeemed, setPointsRedeemed] = useState(false)
    const [editMode, setEditMode] = useState(false)
   
    useEffect(() => {
      setPointsRedeemed(redeemed)
    }, [redeemed])


     useEffect(() => {
        setEditMode(user?.isFamilyMember ?? true)
      }, [editMode])
    
    const handleRedeemPressed = (cost: number) => {
        if((user?.points ?? 0) < cost) {
            setShowBoxMessage(true)
            return;
        } 

        // UPDATE POINTS OF THE CURRENT USER
        const newPoints = (user?.points ?? 0) - cost;
    const value = {
        name: user?.name ?? '',
        points: newPoints ?? 0,
        passcode: user?.name ?? '', // Ensure passcode is included
        parentPushToken: user?.parentPushToken ?? ''
    };
    updatePointsforAFamilyMember(value);
    updateReward(reward.id!, {...reward, redeemed: true})
    setPointsRedeemed(true)
    
        
    }
  return (
    <View style={[styles.container, {minHeight: height*0.55}]}>
        <BoxMessage 
          visible={showBoxMessage} 
          dismiss={() => setShowBoxMessage(false)} 
          message="You don't have enough points to redeem. Complete more tasks amd come back later" 
        />
        <Gradient from={theme['gradient-from']} to={theme['gradient-to']} />
        {pointsRedeemed && <Image   width={100} height={100} style={{ position: "absolute", top: 0, right: 0,  zIndex: 100}} source={require("../../assets/images/redeemed.png")} />
    }
      <View style={styles.header}>
      <Text category='h3' style={styles.cost}>{cost}</Text>
      <Text category='s1' style={styles.points}>points</Text>
      </View>

      <View style={styles.titleWrapper}>
        <Text style={styles.rewardTitle} category='h1'>{title}</Text>
      </View>
      {
        editMode && <TouchableOpacity disabled={pointsRedeemed} style={styles.redeemBtn} onPress={() => handleRedeemPressed(cost)}>
        {
            pointsRedeemed ? <Text style={styles.redeemBtnTitle} category="h6">REDEEMED</Text> : <Text style={styles.redeemBtnTitle} category="h6">REDEEM</Text>
        }
      </TouchableOpacity>
      }
    </View>
  )
}

{/* <TouchableOpacity disabled={pointsRedeemed} style={styles.redeemBtn} onPress={() => handleRedeemPressed(cost)}>
        {
            !pointsRedeemed ? <Text style={styles.redeemBtnTitle} category="h6">REDEEMED</Text> : <Text style={styles.redeemBtnTitle} category="h6">REDEEM</Text>
        }
      </TouchableOpacity> */}

export default RewardCard

const styles = StyleSheet.create({
    container: {
        width: "90%",
        marginHorizontal: "auto",
    },

    header: {
        flexDirection: "row",
        justifyContent:"flex-start",
        alignItems:"baseline",
        columnGap: 2,
        padding: 5,
    },

    cost: {
        fontSize: 40,
        color: theme.secondary,
    },
    points: {
        fontSize: 12,
        lineHeight: 18, 
        color: theme.secondary,
    },

    redeemBtn: {
        position: "absolute",
        bottom: 0,
        alignSelf: "center",
        backgroundColor: theme.secondary,
        padding: 10,
        width:"100%",
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20
    },

    redeemBtnTitle: {
        textAlign: "center",

    },

    titleWrapper: {
        flex: 1, justifyContent:"center", alignItems:"center",
        marginTop: -40,
    },

    rewardTitle: {
        fontSize: 40,
        textAlign:"center",
        color:"white"
    }
})