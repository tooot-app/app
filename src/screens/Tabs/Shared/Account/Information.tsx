import { useRoute } from '@react-navigation/native'
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
import AccountInformationStats from './Information/Stats'

const AccountInformation: React.FC = () => {
  const { colors } = useTheme()

  const { name } = useRoute()
  const myInfo = name !== 'Tab-Shared-Account'

  return (
    <View style={styles.base}>
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
