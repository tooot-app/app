import analytics from '@components/analytics'
import Button from '@components/Button'
import { RelationshipOutgoing } from '@components/Relationship'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { useRelationshipQuery } from '@utils/queryHooks/relationship'
import { StyleConstants } from '@utils/styles/constants'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet } from 'react-native'

export interface Props {
  account: Mastodon.Account | undefined
  ownAccount: boolean
}

const GoToMoved = ({ accountMoved }: { accountMoved: Mastodon.Account }) => {
  const { t } = useTranslation('sharedAccount')
  const navigation = useNavigation<
    StackNavigationProp<Nav.TabLocalStackParamList>
  >()

  return (
    <Button
      type='text'
      content={t('content.moved')}
      onPress={() => {
        analytics('account_gotomoved_press')
        navigation.push('Tab-Shared-Account', { account: accountMoved })
      }}
    />
  )
}

const Conversation = ({ account }: { account: Mastodon.Account }) => {
  const navigation = useNavigation()
  const query = useRelationshipQuery({ id: account.id })

  return query.data && !query.data.blocked_by ? (
    <Button
      round
      type='icon'
      content='Mail'
      style={styles.actionConversation}
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

const AccountInformationActions: React.FC<Props> = ({
  account,
  ownAccount
}) => {
  return account && account.id ? (
    account.moved ? (
      <GoToMoved accountMoved={account.moved} />
    ) : !ownAccount ? (
      <>
        <Conversation account={account} />
        <RelationshipOutgoing id={account.id} />
      </>
    ) : null
  ) : null
}

const styles = StyleSheet.create({
  actionConversation: { marginRight: StyleConstants.Spacing.S }
})

export default AccountInformationActions
