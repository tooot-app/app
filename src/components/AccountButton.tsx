import { useNavigation } from '@react-navigation/native'
import { generateAccountKey, getAccountDetails, setAccount } from '@utils/storage/actions'
import { StorageGlobal } from '@utils/storage/global'
import { StyleConstants } from '@utils/styles/constants'
import React from 'react'
import Button from './Button'
import haptics from './haptics'

interface Props {
  account: NonNullable<StorageGlobal['accounts']>[number]
  selected?: boolean
  additionalActions?: () => void
}

const AccountButton: React.FC<Props> = ({ account, selected = false, additionalActions }) => {
  const navigation = useNavigation()
  const accountDetails = getAccountDetails(
    ['auth.account.acct', 'auth.domain', 'auth.account.id'],
    account
  )
  if (!accountDetails) return null

  return (
    <Button
      type='text'
      selected={selected}
      style={{
        marginBottom: StyleConstants.Spacing.M,
        marginRight: StyleConstants.Spacing.M
      }}
      content={`@${accountDetails['auth.account.acct']}@${accountDetails['auth.domain']}${
        selected ? ' ✓' : ''
      }`}
      onPress={() => {
        haptics('Light')
        setAccount(
          generateAccountKey({
            domain: accountDetails['auth.domain'],
            id: accountDetails['auth.account.id']
          })
        )
        navigation.goBack()
        if (additionalActions) {
          additionalActions()
        }
      }}
    />
  )
}

export default AccountButton
