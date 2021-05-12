import Button from '@components/Button'
import { useNavigation } from '@react-navigation/native'
import { StyleConstants } from '@utils/styles/constants'
import React from 'react'
import { useTranslation } from 'react-i18next'

const AccountInformationSwitch: React.FC = () => {
  const navigation = useNavigation()
  const { t } = useTranslation('screenTabs')

  return (
    <Button
      type='text'
      content={t('me.stacks.switch.name')}
      style={{
        marginHorizontal: StyleConstants.Spacing.Global.PagePadding * 2,
        marginTop: StyleConstants.Spacing.Global.PagePadding
      }}
      onPress={() => navigation.navigate('Tab-Me-Switch')}
    />
  )
}

export default AccountInformationSwitch
