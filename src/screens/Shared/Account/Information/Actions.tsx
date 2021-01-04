import Button from '@components/Button'
import { RelationshipOutgoing } from '@components/Relationship'
import { useNavigation } from '@react-navigation/native'
import { relationshipFetch } from '@utils/fetches/relationshipFetch'
import { StyleConstants } from '@utils/styles/constants'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { useQuery } from 'react-query'

export interface Props {
  account: Mastodon.Account | undefined
}

const AccountInformationActions: React.FC<Props> = ({ account }) => {
  const navigation = useNavigation()
  const relationshipQueryKey = ['Relationship', { id: account?.id }]
  const query = useQuery(relationshipQueryKey, relationshipFetch)

  return (
    <View style={styles.actions}>
      {query.data && !query.data.blocked_by ? (
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
      ) : null}
      {account && account.id && <RelationshipOutgoing id={account.id} />}
    </View>
  )
}

const styles = StyleSheet.create({
  actions: {
    alignSelf: 'flex-end',
    flexDirection: 'row'
  },
  actionConversation: { marginRight: StyleConstants.Spacing.S }
})

export default AccountInformationActions
