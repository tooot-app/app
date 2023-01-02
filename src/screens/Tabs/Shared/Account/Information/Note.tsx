import { ParseHTML } from '@components/Parse'
import { StyleConstants } from '@utils/styles/constants'
import React, { useContext } from 'react'
import { View } from 'react-native'
import AccountContext from '../Context'

const AccountInformationNote: React.FC = () => {
  const { account, pageMe } = useContext(AccountContext)

  if (
    account?.suspended ||
    pageMe ||
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
