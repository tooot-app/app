import { getInstanceAccount } from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useCallback } from 'react'
import { StyleSheet, View } from 'react-native'
import { useSelector } from 'react-redux'
import { Placeholder, Fade } from 'rn-placeholder'
import AccountInformationAccount from './Information/Account'
import AccountInformationActions from './Information/Actions'
import AccountInformationAvatar from './Information/Avatar'
import AccountInformationCreated from './Information/Created'
import AccountInformationFields from './Information/Fields'
import AccountInformationName from './Information/Name'
import AccountInformationNotes from './Information/Notes'
import AccountInformationStats from './Information/Stats'
import AccountInformationSwitch from './Information/Switch'

export interface Props {
  account: Mastodon.Account | undefined
  myInfo?: boolean // Showing from my info page
}

const AccountInformation: React.FC<Props> = ({ account, myInfo = false }) => {
  const ownAccount =
    account?.id ===
    useSelector(getInstanceAccount, (prev, next) => prev?.id === next?.id)?.id
  const { mode, theme } = useTheme()

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
          <View style={styles.actions}>
            {myInfo ? (
              <AccountInformationSwitch />
            ) : (
              <AccountInformationActions
                account={account}
                ownAccount={ownAccount}
              />
            )}
          </View>
        </View>

        <AccountInformationName account={account} />

        <AccountInformationAccount account={account} myInfo={myInfo} />

        {!myInfo ? (
          <>
            {account?.fields && account.fields.length > 0 ? (
              <AccountInformationFields account={account} />
            ) : null}
            {account?.note &&
            account.note.length > 0 &&
            account.note !== '<p></p>' ? (
              // Empty notes might generate empty p tag
              <AccountInformationNotes account={account} />
            ) : null}
            <AccountInformationCreated account={account} />
          </>
        ) : null}

        <AccountInformationStats account={account} myInfo={myInfo} />
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

export default React.memo(AccountInformation, (prev, next) => {
  let skipUpdate = true
  if (prev.account?.id !== next.account?.id) {
    skipUpdate = false
  }
  if (prev.account?.acct === next.account?.acct) {
    skipUpdate = false
  }
  return skipUpdate
})
