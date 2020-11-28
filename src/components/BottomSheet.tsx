import React, { useEffect, useRef } from 'react'
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from 'src/utils/styles/ThemeManager'

import constants from 'src/utils/styles/constants'

export interface Props {
  children: React.ReactNode
  visible: boolean
  handleDismiss: () => void
}

const BottomSheet: React.FC<Props> = ({ children, visible, handleDismiss }) => {
  const { theme } = useTheme()
  const insets = useSafeAreaInsets()

  const panY = useRef(new Animated.Value(Dimensions.get('screen').height))
    .current
  const top = panY.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [0, 0, 1]
  })
  const resetModal = Animated.timing(panY, {
    toValue: 0,
    duration: 300,
    useNativeDriver: false
  })

  const closeModal = Animated.timing(panY, {
    toValue: Dimensions.get('screen').height,
    duration: 350,
    useNativeDriver: false
  })

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dy: panY }], {
        useNativeDriver: false
      }),
      onPanResponderRelease: (e, gs) => {
        if (gs.dy > 0 && gs.vy > 1) {
          return closeModal.start(() => handleDismiss())
        } else if (gs.dy === 0 && gs.vy === 0) {
          return closeModal.start(() => handleDismiss())
        }
        return resetModal.start()
      }
    })
  ).current

  useEffect(() => {
    if (visible) {
      resetModal.start()
    }
  }, [visible])

  return (
    <Modal animated animationType='fade' visible={visible} transparent>
      <View
        style={[styles.overlay, { backgroundColor: theme.border }]}
        {...panResponder.panHandlers}
      >
        <Animated.View
          style={[
            styles.container,
            {
              top,
              backgroundColor: theme.background,
              paddingBottom: insets.bottom
            }
          ]}
        >
          <View
            style={[styles.handle, { backgroundColor: theme.background }]}
          />
          {children}
          <Pressable
            onPress={() => closeModal.start(() => handleDismiss())}
            style={[styles.cancel, { borderColor: theme.primary }]}
          >
            <Text style={[styles.text, { color: theme.primary }]}>取消</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  container: {
    padding: constants.SPACING_L,
    paddingTop: constants.SPACING_M
  },
  handle: {
    alignSelf: 'center',
    width: constants.GLOBAL_SPACING_BASE * 8,
    height: constants.GLOBAL_SPACING_BASE / 2,
    borderRadius: 100,
    top: -constants.SPACING_M * 2
  },
  cancel: {
    padding: constants.SPACING_S,
    borderWidth: 1,
    borderRadius: 100
  },
  text: {
    fontSize: constants.FONT_SIZE_L,
    textAlign: 'center'
  }
})

export default BottomSheet
