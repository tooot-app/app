import { ParseHTML } from '@components/Parse'
import { StyleConstants } from '@utils/styles/constants'
import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'

export interface Props {
  account: Mastodon.Account | undefined
  myInfo?: boolean
}

const AccountInformationNote = React.memo(
  ({ account, myInfo }: Props) => {
    const [note, setNote] = useState(account?.source?.note)
    if (
      account?.suspended ||
      myInfo ||
      !account?.note ||
      account.note.length === 0 ||
      account.note === '<p></p>'
    ) {
      return null
    }

    return (
      <View style={styles.note}>
        <ParseHTML content={account.note!} size={'M'} emojis={account.emojis} selectable />
      </View>
    )
  },
  (_, next) => next.account === undefined
)

const styles = StyleSheet.create({
  note: {
    marginBottom: StyleConstants.Spacing.L
  }
})

export default AccountInformationNote
