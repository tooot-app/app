import Button from '@components/Button'
import { useNavigation } from '@react-navigation/native'
import React from 'react'
import { useTranslation } from 'react-i18next'

const AccountInformationSwitch: React.FC = () => {
  const navigation = useNavigation()
  const { t } = useTranslation()

  return (
    <Button
      type='text'
      content={t('meSwitch:heading')}
      onPress={() => navigation.navigate('Tab-Me-Switch')}
    />
  )
}

export default AccountInformationSwitch
