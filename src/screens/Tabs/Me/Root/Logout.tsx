import Button from '@components/Button'
import haptics from '@components/haptics'
import { removeAccount, useGlobalStorage } from '@utils/storage/actions'
import { StyleConstants } from '@utils/styles/constants'
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
      style={{
        marginHorizontal: StyleConstants.Spacing.Global.PagePadding * 2,
        marginTop: StyleConstants.Spacing.Global.PagePadding,
        marginBottom: StyleConstants.Spacing.Global.PagePadding * 2
      }}
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
                  removeAccount(accountActive)
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
    />
  )
}

export default Logout
