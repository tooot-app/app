import { ParseHTML } from '@components/Parse'
import { StyleConstants } from '@utils/styles/constants'
import React from 'react'
import { View } from 'react-native'

export interface Props {
  account: Mastodon.Account | undefined
  myInfo?: boolean
}

const AccountInformationNote: React.FC<Props> = ({ account, myInfo }) => {
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
    <View style={{ marginBottom: StyleConstants.Spacing.L }}>
      <ParseHTML
        content={account.note!}
        size={'M'}
        emojis={account.emojis}
        selectable
        numberOfLines={999}
      />
    </View>
  )
}

export default AccountInformationNote
