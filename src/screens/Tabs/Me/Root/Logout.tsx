import Button from '@components/Button'
import haptics from '@root/components/haptics'
import { StyleConstants } from '@utils/styles/constants'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'
import { useQueryClient } from '@tanstack/react-query'
import { removeAccount, useGlobalStorage } from '@utils/storage/actions'

const Logout: React.FC = () => {
  const { t } = useTranslation(['common', 'screenTabs'])
  const queryClient = useQueryClient()

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
                  haptics('Success')
                  queryClient.clear()
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
