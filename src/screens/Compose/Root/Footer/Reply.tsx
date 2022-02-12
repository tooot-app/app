import TimelineDefault from '@components/Timeline/Default'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useContext } from 'react'
import { StyleSheet, View } from 'react-native'
import ComposeContext from '../../utils/createContext'

const ComposeReply: React.FC = () => {
  const {
    composeState: { replyToStatus }
  } = useContext(ComposeContext)
  const { colors } = useTheme()

  return (
    <View style={[styles.base, { borderTopColor: colors.border }]}>
      <TimelineDefault item={replyToStatus!} disableDetails disableOnPress />
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    borderTopWidth: StyleSheet.hairlineWidth
  }
})

export default React.memo(ComposeReply, () => true)
