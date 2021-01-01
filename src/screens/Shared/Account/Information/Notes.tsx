import { ParseHTML } from '@components/Parse'
import { StyleConstants } from '@utils/styles/constants'
import React from 'react'
import { StyleSheet, View } from 'react-native'

export interface Props {
  account: Mastodon.Account
}

const AccountInformationNotes: React.FC<Props> = ({ account }) => {
  return (
    <View style={styles.note}>
      <ParseHTML content={account.note!} size={'M'} emojis={account.emojis} />
    </View>
  )
}

const styles = StyleSheet.create({
  note: {
    marginBottom: StyleConstants.Spacing.L
  }
})

export default AccountInformationNotes
