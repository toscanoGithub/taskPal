import { ImageProps, SafeAreaView, StyleSheet, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Text, Button,  Icon, IconElement, Layout, Spinner, TabBar, Tab } from '@ui-kitten/components'
import theme from '../theme.json'
import CalendarTab from '../components/_parent/CalendarTab'
import TasksTab from '../components/_parent/TasksTab'


const ParentScreen = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);

 
  
  return (
    <View style={styles.container}>
      <TabBar style={{backgroundColor: "#ffffff"}} indicatorStyle={{backgroundColor: theme['gradient-to'], height: 4}} selectedIndex={selectedIndex} onSelect={index => setSelectedIndex(index)}>
        <Tab title={evaProps => <Text category='s2'   {...evaProps} style={{color: selectedIndex === 0 ? theme['gradient-from'] : "gray", fontSize: 16}}>Calendar</Text>} />
        <Tab title={evaProps => <Text category='s2'   {...evaProps} style={{color: selectedIndex === 1 ? theme['gradient-from'] : "gray", fontSize: 16}}>Tasks</Text>} />
      </TabBar>

      <View style={styles.tabContent}>
        {selectedIndex === 0 ? (
          <CalendarTab  />
        ) : (
          <TasksTab />
        )}
      </View>

    </View>
  )
}

export default ParentScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f8fc",
  },
  tabContent: {
    flex: 1,
    padding: 0,
  },
})