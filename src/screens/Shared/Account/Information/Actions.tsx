import Button from '@components/Button'
import { RelationshipOutgoing } from '@components/Relationship'
import { useNavigation } from '@react-navigation/native'
import { useRelationshipQuery } from '@utils/queryHooks/relationship'
import { StyleConstants } from '@utils/styles/constants'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet } from 'react-native'

export interface Props {
  account: Mastodon.Account | undefined
}

const GoToMoved = ({ account }: { account: Mastodon.Account }) => {
  const { t } = useTranslation('sharedAccount')
  const navigation = useNavigation()
  const query = useRelationshipQuery({ id: account.id })

  return query.data && !query.data.blocked_by ? (
    <Button
      type='text'
      content={t('content.moved')}
      onPress={() =>
        navigation.push('Screen-Shared-Account', { account: account.moved })
      }
    />
  ) : null
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
      onPress={() =>
        navigation.navigate('Screen-Shared-Compose', {
          type: 'conversation',
          incomingStatus: { account }
        })
      }
    />
  ) : null
}

const AccountInformationActions: React.FC<Props> = ({ account }) => {
  return account && account.id ? (
    account.moved ? (
      <GoToMoved account={account} />
    ) : (
      <>
        <Conversation account={account} />
        <RelationshipOutgoing id={account.id} />
      </>
    )
  ) : null
}

const styles = StyleSheet.create({
  actionConversation: { marginRight: StyleConstants.Spacing.S }
})

export default AccountInformationActions
