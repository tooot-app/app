import { useTheme } from '@utils/styles/ThemeManager'
import React, { useContext } from 'react'
import { Modal, View } from 'react-native'
import ComposeContext from './utils/createContext'

const ComposePosting = () => {
  const { composeState } = useContext(ComposeContext)
  const { colors } = useTheme()

  return (
    <Modal
      transparent
      animationType='fade'
      visible={composeState.posting}
      children={<View style={{ flex: 1, backgroundColor: colors.backgroundOverlayInvert }} />}
    />
  )
}

export default ComposePosting
