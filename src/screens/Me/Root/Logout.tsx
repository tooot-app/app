import React from 'react'
import { useDispatch } from 'react-redux'
import { resetLocal } from '@utils/slices/instancesSlice'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from 'react-query'
import Button from '@root/components/Button'
import { Alert } from 'react-native'
import { StyleConstants } from '@root/utils/styles/constants'

const Logout: React.FC = () => {
  const { t } = useTranslation('meRoot')
  const dispatch = useDispatch()
  const navigation = useNavigation()
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
                queryClient.clear()
                dispatch(resetLocal())
                navigation.navigate('Screen-Public', {
                  screen: 'Screen-Public-Root',
                  params: { publicTab: true }
                })
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
