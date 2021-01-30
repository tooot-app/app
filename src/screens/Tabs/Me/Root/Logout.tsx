import Button from '@components/Button'
import haptics from '@root/components/haptics'
import { localRemoveInstance } from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'
import { useQueryClient } from 'react-query'
import { useDispatch } from 'react-redux'

const Logout: React.FC = () => {
  const { t } = useTranslation('meRoot')
  const dispatch = useDispatch()
  const queryClient = useQueryClient()

  return (
    <Button
      type='text'
      content={t('content.logout.button')}
      style={{
        marginHorizontal: StyleConstants.Spacing.Global.PagePadding * 2,
        marginBottom: StyleConstants.Spacing.Global.PagePadding * 2
      }}
      destructive
      onPress={() =>
        Alert.alert(
          t('content.logout.alert.title'),
          t('content.logout.alert.message'),
          [
            {
              text: t('content.logout.alert.buttons.logout'),
              style: 'destructive' as const,
              onPress: () => {
                haptics('Success')
                queryClient.clear()
                dispatch(localRemoveInstance())
              }
            },
            {
              text: t('content.logout.alert.buttons.cancel'),
              style: 'cancel' as const
            }
          ]
        )
      }
    />
  )
}

export default Logout
