import ParseContent from '@root/components/ParseContent'
import { StyleConstants } from '@root/utils/styles/constants'
import React from 'react'
import { StyleSheet, View } from 'react-native'

export interface Props {
  account: Mastodon.Account
}

const AccountInformationNotes: React.FC<Props> = ({ account }) => {
  return (
    <View style={styles.note}>
      <ParseContent
        content={account.note!}
        size={'M'}
        emojis={account.emojis}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  note: {
    marginBottom: StyleConstants.Spacing.L
  }
})

export default AccountInformationNotes
