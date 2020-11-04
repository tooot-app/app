import React, { useEffect, useRef } from 'react'
import { Animated, StyleSheet, Text, View } from 'react-native'

export interface Props {
  message?: string
}

const Success: React.FC<Props> = ({ message }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  useEffect(() => {
    // console.log(message)
    if (message !== undefined) {
      fadeIn()
    } else {
      fadeOut()
    }
  }, [message])

  const fadeIn = () => {
    // Will change fadeAnim value to 1 in 5 seconds
    Animated.timing(fadeAnim, {
      useNativeDriver: false,
      toValue: 300,
      duration: 1000
    }).start()
  }

  const fadeOut = () => {
    // Will change fadeAnim value to 0 in 5 seconds
    Animated.timing(fadeAnim, {
      useNativeDriver: false,
      toValue: 400,
      duration: 1000
    }).start()
  }

  return (
    <Animated.View
      style={[
        styles.success,
        {
          top: fadeAnim
        }
      ]}
    >
      <Text>{message}</Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  success: {
    width: '80%',
    height: 25,
    position: 'absolute',
    top: 400,
    backgroundColor: 'red',
    zIndex: 50
  }
})

export default Success
