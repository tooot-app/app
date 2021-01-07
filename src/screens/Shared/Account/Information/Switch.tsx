import Button from '@components/Button'
import { useNavigation } from '@react-navigation/native'
import React from 'react'

const AccountInformationSwitch: React.FC = () => {
  const navigation = useNavigation()

  return (
    <Button
      type='text'
      content='切换账号'
      onPress={() => navigation.navigate('Screen-Me-Switch')}
    />
  )
}

export default AccountInformationSwitch
