import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Fade, Placeholder } from 'rn-placeholder'
import AccountInformationAccount from './Information/Account'
import AccountInformationActions from './Information/Actions'
import AccountInformationAvatar from './Information/Avatar'
import AccountInformationCreated from './Information/Created'
import AccountInformationFields from './Information/Fields'
import AccountInformationName from './Information/Name'
import AccountInformationNote from './Information/Note'
import AccountInformationPrivateNote from './Information/PrivateNotes'
import AccountInformationStats from './Information/Stats'

const AccountInformation: React.FC = () => {
  const { colors } = useTheme()

  return (
    <View
      style={{
        marginTop: -StyleConstants.Avatar.L / 2,
        padding: StyleConstants.Spacing.Global.PagePadding
      }}
    >
      <Placeholder
        Animation={props => (
          <Fade {...props} style={{ backgroundColor: colors.shimmerHighlight }} />
        )}
      >
        <View style={styles.avatarAndActions}>
          <AccountInformationAvatar />
          <AccountInformationActions />
        </View>

        <AccountInformationName />

        <AccountInformationAccount />

        <AccountInformationPrivateNote />

        <AccountInformationFields />

        <AccountInformationNote />

        <AccountInformationCreated />

        <AccountInformationStats />
      </Placeholder>
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    marginTop: -StyleConstants.Avatar.L / 2,
    padding: StyleConstants.Spacing.Global.PagePadding
  },
  avatarAndActions: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  actions: {
    alignSelf: 'flex-end',
    flexDirection: 'row'
  }
})

export default AccountInformation
