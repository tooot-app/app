import { useTheme } from '@utils/styles/ThemeManager'
import ComposeContext from '../../utils/createContext'
import React, { useContext } from 'react'
import { StyleSheet, View } from 'react-native'
import TimelineDefault from '@root/components/Timelines/Timeline/Default'

const ComposeReply: React.FC = () => {
  const {
    composeState: { replyToStatus }
  } = useContext(ComposeContext)
  const { theme } = useTheme()

  return (
    <View style={[styles.base, { borderTopColor: theme.border }]}>
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
