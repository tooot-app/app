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
import AccountInformationNotes from './Information/Notes'
import AccountInformationStats from './Information/Stats'
import AccountInformationSwitch from './Information/Switch'

export interface Props {
  account: Mastodon.Account | undefined
  ownAccount?: boolean
}

const AccountInformation: React.FC<Props> = ({
  account,
  ownAccount = false
}) => {
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
          <AccountInformationAvatar account={account} />
          <View style={styles.actions}>
            {ownAccount ? (
              <AccountInformationSwitch />
            ) : (
              <AccountInformationActions account={account} />
            )}
          </View>
        </View>

        <AccountInformationName account={account} />

        <AccountInformationAccount account={account} ownAccount={ownAccount} />

        {!ownAccount ? (
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

        <AccountInformationStats account={account} ownAccount={ownAccount} />
      </Placeholder>
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    marginTop: -StyleConstants.Spacing.Global.PagePadding * 3,
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

export default React.memo(
  AccountInformation,
  (_, next) => next.account === undefined
)
