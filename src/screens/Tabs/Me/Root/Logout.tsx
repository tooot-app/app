import Button from '@components/Button'
import haptics from '@components/haptics'
import { removeAccount, useGlobalStorage } from '@utils/storage/actions'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'

const Logout: React.FC = () => {
  const { t } = useTranslation(['common', 'screenTabs'])

  const [accountActive] = useGlobalStorage.string('account.active')

  return (
    <Button
      type='text'
      content={t('screenTabs:me.root.logout.button')}
      destructive
      onPress={() =>
        Alert.alert(
          t('screenTabs:me.root.logout.alert.title'),
          t('screenTabs:me.root.logout.alert.message'),
          [
            {
              text: t('screenTabs:me.root.logout.alert.buttons.logout'),
              style: 'destructive',
              onPress: () => {
                if (accountActive) {
                  haptics('Light')
                  removeAccount(accountActive, false)
                }
              }
            },
            {
              text: t('common:buttons.cancel'),
              style: 'default'
            }
          ]
        )
      }
      style={{ flex: 1 }}
    />
  )
}

export default Logout
