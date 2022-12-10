import haptics from '@components/haptics'
import { MenuContainer, MenuRow } from '@components/Menu'
import { LOCALES } from '@root/i18n/locales'
import { TabMeStackScreenProps } from '@utils/navigation/navigators'
import { setChannels } from '@utils/slices/instances/push/utils'
import { getInstances } from '@utils/slices/instancesSlice'
import { changeLanguage } from '@utils/slices/settingsSlice'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Platform } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

const TabMeSettingsLanguage: React.FC<TabMeStackScreenProps<'Tab-Me-Settings-Language'>> = ({
  navigation
}) => {
  const { i18n } = useTranslation('screenTabs')
  const languages = Object.entries(LOCALES)
  const instances = useSelector(getInstances)
  const dispatch = useDispatch()

  const change = (lang: string) => {
    haptics('Success')

    dispatch(changeLanguage(lang))
    i18n.changeLanguage(lang)

    // Update Android notification channel language
    if (Platform.OS === 'android') {
      instances.forEach(setChannels)
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
