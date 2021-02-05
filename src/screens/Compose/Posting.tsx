import React, { useContext } from 'react'
import { Modal, View } from 'react-native'
import { useTheme } from '@utils/styles/ThemeManager'
import ComposeContext from './utils/createContext'

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
          <View style={{ flex: 1, backgroundColor: theme.backgroundOverlay }} />
        }
      />
    )
  },
  () => true
)

export default ComposePosting
