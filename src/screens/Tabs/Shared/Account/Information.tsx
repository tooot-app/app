import { useRoute } from '@react-navigation/native'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useCallback } from 'react'
import { StyleSheet, View } from 'react-native'
import { Placeholder, Fade } from 'rn-placeholder'
import AccountInformationAccount from './Information/Account'
import AccountInformationActions from './Information/Actions'
import AccountInformationAvatar from './Information/Avatar'
import AccountInformationCreated from './Information/Created'
import AccountInformationFields from './Information/Fields'
import AccountInformationName from './Information/Name'
import AccountInformationNote from './Information/Note'
import AccountInformationStats from './Information/Stats'

export interface Props {
  account: Mastodon.Account | undefined
}

const AccountInformation = React.memo(
  ({ account }: Props) => {
    const { mode, theme } = useTheme()

    const { name } = useRoute()
    const myInfo = name !== 'Tab-Shared-Account'

    const animation = useCallback(
      props => (
        <Fade {...props} style={{ backgroundColor: theme.shimmerHighlight }} />
      ),
      [mode]
    )

    return (
      <View style={styles.base}>
        <Placeholder Animation={animation}>
          <View style={styles.avatarAndActions}>
            <AccountInformationAvatar account={account} myInfo={myInfo} />
            <AccountInformationActions account={account} myInfo={myInfo} />
          </View>

          <AccountInformationName account={account} />

          <AccountInformationAccount account={account} localInstance={myInfo} />

          <AccountInformationFields account={account} myInfo={myInfo} />

          <AccountInformationNote account={account} myInfo={myInfo} />

          <AccountInformationCreated account={account} hidden={myInfo} />

          <AccountInformationStats account={account} myInfo={myInfo} />
        </Placeholder>
      </View>
    )
  },
  (prev, next) => {
    let skipUpdate = true
    if (prev.account?.id !== next.account?.id) {
      skipUpdate = false
    }
    if (prev.account?.acct === next.account?.acct) {
      skipUpdate = false
    }
    return skipUpdate
  }
)

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
