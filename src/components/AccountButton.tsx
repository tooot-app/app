import { useNavigation } from '@react-navigation/native'
import initQuery from '@utils/initQuery'
import { InstanceLatest } from '@utils/migrations/instances/migration'
import { StyleConstants } from '@utils/styles/constants'
import React from 'react'
import Button from './Button'
import haptics from './haptics'

interface Props {
  instance: InstanceLatest
  selected?: boolean
  additionalActions?: () => void
}

const AccountButton: React.FC<Props> = ({
  instance,
  selected = false,
  additionalActions
}) => {
  const navigation = useNavigation()

  return (
    <Button
      type='text'
      selected={selected}
      style={{
        marginBottom: StyleConstants.Spacing.M,
        marginRight: StyleConstants.Spacing.M
      }}
      content={`@${instance.account.acct}@${instance.uri}${
        selected ? ' ✓' : ''
      }`}
      onPress={() => {
        haptics('Light')
        initQuery({ instance, prefetch: { enabled: true } })
        navigation.goBack()
        if (additionalActions) {
          additionalActions()
        }
      }}
    />
  )
}

export default AccountButton
