import { useNavigation } from '@react-navigation/native'
import { ReadableAccountType, setAccount } from '@utils/storage/actions'
import { StyleConstants } from '@utils/styles/constants'
import React from 'react'
import Button from './Button'
import haptics from './haptics'

interface Props {
  account: ReadableAccountType
  additionalActions?: () => void
}

const AccountButton: React.FC<Props> = ({ account, additionalActions }) => {
  const navigation = useNavigation()

  return (
    <Button
      type='text'
      selected={account.active}
      style={{
        marginBottom: StyleConstants.Spacing.M,
        marginRight: StyleConstants.Spacing.M
      }}
      content={account.acct}
      onPress={() => {
        haptics('Light')
        setAccount(account.key)
        navigation.goBack()
        if (additionalActions) {
          additionalActions()
        }
      }}
    />
  )
}

export default AccountButton
