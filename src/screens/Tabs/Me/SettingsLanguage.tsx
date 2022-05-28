import analytics from '@components/analytics'
import haptics from '@components/haptics'
import { MenuContainer, MenuRow } from '@components/Menu'
import { LOCALES } from '@root/i18n/locales'
import { TabMeStackScreenProps } from '@utils/navigation/navigators'
import androidDefaults from '@utils/slices/instances/push/androidDefaults'
import { getInstances } from '@utils/slices/instancesSlice'
import { changeLanguage } from '@utils/slices/settingsSlice'
import * as Notifications from 'expo-notifications'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Platform } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

const TabMeSettingsLanguage: React.FC<
  TabMeStackScreenProps<'Tab-Me-Settings-Language'>
> = () => {
  const { i18n, t } = useTranslation('screenTabs')
  const languages = Object.entries(LOCALES)
  const instances = useSelector(getInstances)
  const dispatch = useDispatch()

  const change = (lang: string) => {
    analytics('settings_language_press', {
      current: i18n.language,
      new: lang
    })
    haptics('Success')

    dispatch(changeLanguage(lang))
    i18n.changeLanguage(lang)

    // Update Android notification channel language
    if (Platform.OS === 'android') {
      instances.forEach(instance => {
        const accountFull = `@${instance.account.acct}@${instance.uri}`
        if (instance.push.decode.value === false) {
          Notifications.setNotificationChannelAsync(`${accountFull}_default`, {
            groupId: accountFull,
            name: t('me.push.default.heading'),
            ...androidDefaults
          })
        } else {
          Notifications.setNotificationChannelAsync(`${accountFull}_follow`, {
            groupId: accountFull,
            name: t('me.push.follow.heading'),
            ...androidDefaults
          })
          Notifications.setNotificationChannelAsync(
            `${accountFull}_favourite`,
            {
              groupId: accountFull,
              name: t('me.push.favourite.heading'),
              ...androidDefaults
            }
          )
          Notifications.setNotificationChannelAsync(`${accountFull}_reblog`, {
            groupId: accountFull,
            name: t('me.push.reblog.heading'),
            ...androidDefaults
          })
          Notifications.setNotificationChannelAsync(`${accountFull}_mention`, {
            groupId: accountFull,
            name: t('me.push.mention.heading'),
            ...androidDefaults
          })
          Notifications.setNotificationChannelAsync(`${accountFull}_poll`, {
            groupId: accountFull,
            name: t('me.push.poll.heading'),
            ...androidDefaults
          })
        }
      })
    }
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
