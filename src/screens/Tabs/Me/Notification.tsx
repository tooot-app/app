import { MenuContainer, MenuRow } from '@components/Menu'
import { usePushQuery } from '@utils/queryHooks/push'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView } from 'react-native-gesture-handler'
import { useDispatch } from 'react-redux'

const ScreenMeSettingsNotification: React.FC = () => {
  const { t } = useTranslation('meSettingsNotification')
  const dispatch = useDispatch()

  const { data, isLoading } = usePushQuery({})

  return (
    <ScrollView>
      <MenuContainer>
        <MenuRow
          title={t('content.global.heading')}
          description={t('content.global.description')}
          // switchValue={notification.enabled}
          // switchOnValueChange={() => dispatch(updateNotification(true))}
        />
      </MenuContainer>
      <MenuContainer>
        <MenuRow
          title={t('content.follow.heading')}
          loading={isLoading}
          // switchDisabled={!notification.enabled}
          // switchValue={notification.enabled ? data?.alerts.follow : false}
          // switchOnValueChange={() => dispatch(updateNotification(true))}
        />
      </MenuContainer>
    </ScrollView>
  )
}

export default ScreenMeSettingsNotification
