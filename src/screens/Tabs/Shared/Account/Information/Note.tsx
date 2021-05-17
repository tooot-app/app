import Input from '@components/Input'
import { ParseHTML } from '@components/Parse'
import { StyleConstants } from '@utils/styles/constants'
import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'

export interface Props {
  account: Mastodon.Account | undefined
  myInfo?: boolean
  edit?: boolean
}

const AccountInformationNote = React.memo(
  ({ account, myInfo, edit }: Props) => {
    const [note, setNote] = useState(account?.source?.note)
    if (edit) {
      return <Input title='简介' value={note} setValue={setNote} multiline />
    }

    if (
      myInfo ||
      !account?.note ||
      account.note.length === 0 ||
      account.note === '<p></p>'
    ) {
      return null
    }

    return (
      <View style={styles.note}>
        <ParseHTML content={account.note!} size={'M'} emojis={account.emojis} />
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
