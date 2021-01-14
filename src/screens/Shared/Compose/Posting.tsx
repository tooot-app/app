import React, { useContext } from 'react'
import { Modal, StyleSheet, View } from 'react-native'
import { useTheme } from '@utils/styles/ThemeManager'
import ComposeContext from './utils/createContext'
import { Chase } from 'react-native-animated-spinkit'
import { StyleConstants } from '@utils/styles/constants'

const ComposePosting = React.memo(
  () => {
    const { composeState } = useContext(ComposeContext)
    const { theme } = useTheme()

    return (
      <Modal
        transparent
        animationType='fade'
        visible={composeState.posting}
        children={
          <View
            style={[styles.base, { backgroundColor: theme.backgroundOverlay }]}
            children={
              <Chase
                size={StyleConstants.Font.Size.L * 2}
                color={theme.primaryOverlay}
              />
            }
          />
        }
      />
    )
  },
  () => true
)

const styles = StyleSheet.create({
  base: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})

export default ComposePosting
