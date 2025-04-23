import React, { useEffect, useRef } from 'react';
import { StyleSheet, Modal, View, Animated, Easing, Dimensions } from 'react-native';
import { Button, Card, Text } from '@ui-kitten/components';
import theme from "../theme.json"
import * as Device from 'expo-device';

interface BoxMessageProps {
  visible: boolean;
  dismiss: () => void;
  message: string;
}

const BoxMessage: React.FC<BoxMessageProps> = ({ visible, dismiss, message }) => {
    const slideAnim = useRef(new Animated.Value(-300)).current; // Start above the screen
    const {height} = Dimensions.get('window');
    const isTablet = Device.deviceType === Device.DeviceType.TABLET;

    useEffect(() => {
        if (visible) {
          Animated.timing(slideAnim, {
            toValue: height / 2 - 100, // Center the card vertically
            duration: 500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }).start();
        } else {
          slideAnim.setValue(-300); // Reset position when hiding
        }
      }, [visible]);


    return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
    >
        <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
        <Card style={styles.card} disabled={true}>
          <Text style={[styles.message, {fontSize: isTablet ? 34 : 18}]}>
            {message}
          </Text>
          <Button appearance='outline'  onPress={dismiss} style={styles.button}>
            {evaProps => <Text style={{fontSize: isTablet ? 30 : 18, fontWeight: 700, color: theme.secondary, marginHorizontal:"auto"}}>Okay</Text>}
          </Button>
        </Card>
      </Animated.View>
    </Modal>
  );
};

export default BoxMessage;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  card: {
    justifyContent: 'center',
    alignItems: 'center',
    
    minHeight: 200,
    marginHorizontal:"auto",
    backgroundColor: theme['gradient-to'],
    borderRadius: 10,
    padding: 20,
    borderColor: theme['gradient-from'],
    borderWidth: 4,
    shadowColor: theme['btn-bg-color'],
    shadowOffset: {
      width: 0,
      height: 9,  
    }  
  },
  message: {
    textAlign: 'center',
    color: "white",
    marginBottom: 20,
    
  },
  button: {
    width:"40%",
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: "auto",
    marginTop: 10,
    backgroundColor: "transparent",
    borderColor: theme.secondary,
    
   
  },
});
