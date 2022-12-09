import haptics from '@components/haptics'
import { MenuContainer, MenuRow } from '@components/Menu'
import { LOCALES } from '@root/i18n/locales'
import { TabMeStackScreenProps } from '@utils/navigation/navigators'
import { useProfileQuery } from '@utils/queryHooks/profile'
import androidDefaults from '@utils/slices/instances/push/androidDefaults'
import { getInstances } from '@utils/slices/instancesSlice'
import { changeLanguage } from '@utils/slices/settingsSlice'
import * as Notifications from 'expo-notifications'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Platform } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { checkPushAdminPermission, PUSH_ADMIN, PUSH_DEFAULT } from './Push'

const TabMeSettingsLanguage: React.FC<TabMeStackScreenProps<'Tab-Me-Settings-Language'>> = ({
  navigation
}) => {
  const { i18n, t } = useTranslation('screenTabs')
  const languages = Object.entries(LOCALES)
  const instances = useSelector(getInstances)
  const dispatch = useDispatch()

  const profileQuery = useProfileQuery({ options: { enabled: Platform.OS === 'android' } })

  const change = (lang: string) => {
    haptics('Success')

    dispatch(changeLanguage(lang))
    i18n.changeLanguage(lang)

    // Update Android notification channel language
    if (Platform.OS === 'android') {
      instances.forEach(instance => {
        const accountFull = `@${instance.account.acct}@${instance.uri}`
        if (instance.push.decode === false) {
          Notifications.setNotificationChannelAsync(`${accountFull}_default`, {
            groupId: accountFull,
            name: t('me.push.default.heading'),
            ...androidDefaults
          })
        } else {
          for (const push of PUSH_DEFAULT) {
            Notifications.setNotificationChannelAsync(`${accountFull}_${push}`, {
              groupId: accountFull,
              name: t(`me.push.${push}.heading`),
              ...androidDefaults
            })
          }
          for (const { type, permission } of PUSH_ADMIN) {
            if (checkPushAdminPermission(permission, profileQuery.data?.role?.permissions)) {
              Notifications.setNotificationChannelAsync(`${accountFull}_${type}`, {
                groupId: accountFull,
                name: t(`me.push.${type}.heading`),
                ...androidDefaults
              })
            }
          }
        }
      })
    }

    navigation.pop(1)
  }

  return (
    <MenuContainer>
      <FlatList
        data={languages}
        renderItem={({ item }) => {
          return (
            <MenuRow
              key={item[0]}
              title={item[1]}
              iconBack={item[0] === i18n.language ? 'Check' : undefined}
              iconBackColor={'blue'}
              onPress={() => item[0] !== i18n.language && change(item[0])}
            />
          )
        }}
      />
    </MenuContainer>
  )
}

export default TabMeSettingsLanguage
