import TimelineDefault from '@components/Timeline/Default'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useContext } from 'react'
import { View } from 'react-native'
import ComposeContext from '../../utils/createContext'

const ComposeReply: React.FC = () => {
  const {
    composeState: { replyToStatus }
  } = useContext(ComposeContext)
  const { colors } = useTheme()

  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        borderWidth: 1,
        borderRadius: StyleConstants.Spacing.S,
        overflow: 'hidden',
        borderColor: colors.border,
        marginHorizontal: StyleConstants.Spacing.Global.PagePadding,
        marginTop: StyleConstants.Spacing.M
      }}
    >
      {replyToStatus ? (
        <TimelineDefault item={replyToStatus} disableDetails disableOnPress />
      ) : null}
    </View>
  )
}

export default ComposeReply
