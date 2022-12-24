import Button from '@components/Button'
import haptics from '@root/components/haptics'
import { useAppDispatch } from '@root/store'
import removeInstance from '@utils/slices/instances/remove'
import { getInstance } from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'
import { useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'

const Logout: React.FC = () => {
  const { t } = useTranslation(['common', 'screenTabs'])
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()
  const instance = useSelector(getInstance)

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
                if (instance) {
                  haptics('Success')
                  queryClient.clear()
                  dispatch(removeInstance(instance))
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
