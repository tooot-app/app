import { MenuContainer, MenuRow } from '@components/Menu'
import { getVersionUpdate } from '@utils/slices/appSlice'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, Platform } from 'react-native'
import { useSelector } from 'react-redux'

const Update: React.FC = () => {
  const { t } = useTranslation('screenTabs')

  const versionUpdate = useSelector(getVersionUpdate)

  return versionUpdate ? (
    <MenuContainer>
      <MenuRow
        iconFront='ChevronsUp'
        iconBack='ExternalLink'
        title={t('me.root.update.title')}
        badge
        onPress={() => {
          if (Platform.OS === 'ios') {
            Linking.openURL('itms-appss://itunes.apple.com/app/id1549772269')
          } else {
            Linking.openURL('https://tooot.app')
          }
        }}
      />
    </MenuContainer>
  ) : null
}

export default Update
