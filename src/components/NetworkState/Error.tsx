import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const NetworkStateError = () => {
  return (
    <View style={styles.base}>
      <Text>加载错误</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    // justifyContent: 'center',
    alignItems: 'center'
  }
})

export default NetworkStateError
