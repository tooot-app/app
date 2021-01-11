import Button from '@components/Button'
import { RelationshipOutgoing } from '@components/Relationship'
import { useNavigation } from '@react-navigation/native'
import { useRelationshipQuery } from '@utils/queryHooks/relationship'
import { StyleConstants } from '@utils/styles/constants'
import React from 'react'
import { StyleSheet } from 'react-native'

export interface Props {
  account: Mastodon.Account | undefined
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
    <>
      <Conversation account={account} />
      <RelationshipOutgoing id={account.id} />
    </>
  ) : null
}

const styles = StyleSheet.create({
  actionConversation: { marginRight: StyleConstants.Spacing.S }
})

export default AccountInformationActions
