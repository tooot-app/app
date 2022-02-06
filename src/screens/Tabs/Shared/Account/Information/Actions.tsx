import analytics from '@components/analytics'
import Button from '@components/Button'
import { RelationshipOutgoing } from '@components/Relationship'
import { useNavigation } from '@react-navigation/native'
import { useRelationshipQuery } from '@utils/queryHooks/relationship'
import { getInstanceAccount } from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { useSelector } from 'react-redux'

export interface Props {
  account: Mastodon.Account | undefined
  myInfo?: boolean
}

const Conversation = ({ account }: { account: Mastodon.Account }) => {
  const navigation = useNavigation<any>()
  const query = useRelationshipQuery({ id: account.id })

  return query.data && !query.data.blocked_by ? (
    <Button
      round
      type='icon'
      content='Mail'
      style={styles.actionLeft}
      onPress={() => {
        analytics('account_DM_press')
        navigation.navigate('Screen-Compose', {
          type: 'conversation',
          accts: [account.acct]
        })
      }}
    />
  ) : null
}

const AccountInformationActions: React.FC<Props> = ({ account, myInfo }) => {
  if (!account) {
    return null
  }

  const { t } = useTranslation('screenTabs')
  const navigation = useNavigation<any>()

  if (account?.moved) {
    const accountMoved = account.moved
    return (
      <View style={styles.base}>
        <Button
          type='text'
          content={t('shared.account.moved')}
          onPress={() => {
            analytics('account_gotomoved_press')
            navigation.push('Tab-Shared-Account', { account: accountMoved })
          }}
        />
      </View>
    )
  }

  if (myInfo) {
    return (
      <View style={styles.base}>
        <Button
          type='text'
          disabled={account === undefined}
          content={t('me.stacks.profile.name')}
          onPress={() => navigation.navigate('Tab-Me-Profile')}
        />
      </View>
    )
  }

  const instanceAccount = useSelector(getInstanceAccount, () => true)
  const ownAccount =
    account?.id === instanceAccount?.id &&
    account?.acct === instanceAccount?.acct

  if (!ownAccount && account) {
    return (
      <View style={styles.base}>
        <Conversation account={account} />
        <RelationshipOutgoing id={account.id} />
      </View>
    )
  } else {
    return null
  }
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-end',
    flexDirection: 'row'
  },
  actionLeft: { marginRight: StyleConstants.Spacing.S }
})

export default AccountInformationActions
