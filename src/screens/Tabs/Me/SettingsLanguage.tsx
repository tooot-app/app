import haptics from '@components/haptics'
import { MenuRow } from '@components/Menu'
import { LOCALES } from '@i18n/locales'
import { FlashList } from '@shopify/flash-list'
import { TabMeStackScreenProps } from '@utils/navigation/navigators'
import { setChannels } from '@utils/push/constants'
import { getGlobalStorage, useGlobalStorage } from '@utils/storage/actions'
import { StyleConstants } from '@utils/styles/constants'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'

const TabMeSettingsLanguage: React.FC<TabMeStackScreenProps<'Tab-Me-Settings-Language'>> = ({
  navigation
}) => {
  const { i18n } = useTranslation('screenTabs')
  const languages = Object.entries(LOCALES)

  const [_, setLanguage] = useGlobalStorage.string('app.language')

  const change = (lang: string) => {
    haptics('Success')

    setLanguage(lang)
    i18n.changeLanguage(lang)

    // Update Android notification channel language
    if (Platform.OS === 'android') {
      const accounts = getGlobalStorage.object('accounts')
      accounts?.forEach(account => setChannels(true, account))
    }

    navigation.pop(1)
  }

  return (
    <FlashList
      style={{ flex: 1, paddingHorizontal: StyleConstants.Spacing.Global.PagePadding }}
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
  )
}

export default TabMeSettingsLanguage
