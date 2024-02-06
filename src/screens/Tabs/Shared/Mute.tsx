import ComponentAccount from '@components/Account'
import { HeaderLeft, HeaderRight } from '@components/Header'
import Icon from '@components/Icon'
import { displayMessage } from '@components/Message'
import { ModalScrollView } from '@components/ModalScrollView'
import Selections from '@components/Selections'
import CustomText from '@components/Text'
import { TabSharedStackScreenProps } from '@utils/navigation/navigators'
import { useTimelineMutation } from '@utils/queryHooks/timeline'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, View } from 'react-native'

const TabSharedMute: React.FC<TabSharedStackScreenProps<'Tab-Shared-Mute'>> = ({
  navigation,
  route: {
    params: { account }
  }
}) => {
  const { colors, theme } = useTheme()
  const { t } = useTranslation(['common', 'screenTabs'])

  const { mutateAsync, isLoading } = useTimelineMutation({
    onSuccess: () =>
      displayMessage({
        type: 'success',
        message: t('common:message.success.message', {
          function: t('componentContextMenu:account.mute.action', {
            defaultValue: 'false',
            context: 'false'
          })
        })
      })
  })

  const [durations, setDurations] = useState<{ selected: boolean; content: string }[]>(
    (['0', '1800', '3600', '86400', '604800'] as ['0', '1800', '3600', '86400', '604800']).map(
      duration => ({
        selected: duration === '0',
        content: t(`screenTabs:shared.mute.duration.${duration}`)
      })
    )
  )
  const [notification, setNotification] = useState(false)

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderRight
          type='text'
          content={t('screenTabs:shared.mute.mute')}
          destructive
          destructiveColor={colors.yellow}
          onPress={async () => {
            await mutateAsync({
              type: 'updateAccountProperty',
              id: account.id,
              payload: { property: 'mute', currentValue: false }
            })
            navigation.pop(1)
          }}
          loading={isLoading}
        />
      )
    })
  }, [theme, isLoading, durations, notification, account.id])

  return (
    <ModalScrollView>
      <View
        style={{
          margin: StyleConstants.Spacing.Global.PagePadding,
          borderWidth: 1,
          borderColor: colors.yellow,
          borderRadius: StyleConstants.BorderRadius
        }}
      >
        <ComponentAccount account={account} props={{}} />
      </View>
      <View
        style={{
          paddingHorizontal: StyleConstants.Spacing.Global.PagePadding
        }}
      >
        <CustomText
          fontStyle='M'
          style={{ color: colors.primaryDefault, marginBottom: StyleConstants.Spacing.M }}
        >
          {t('screenTabs:shared.mute.description')}
        </CustomText>

        <Selections
          title={t('screenTabs:shared.mute.duration.heading')}
          options={durations}
          setOptions={setDurations}
        />

        <Pressable
          style={{ flex: 1, flexDirection: 'row', marginTop: StyleConstants.Spacing.M }}
          onPress={() => setNotification(!notification)}
        >
          <Icon
            style={{
              marginTop: (StyleConstants.Font.LineHeight.M - StyleConstants.Font.Size.M) / 2,
              marginRight: StyleConstants.Spacing.S
            }}
            name={notification ? 'check-square' : 'square'}
            size={StyleConstants.Font.Size.M}
            color={colors.primaryDefault}
          />
          <CustomText fontStyle='M' style={{ color: colors.primaryDefault }}>
            {t('screenTabs:shared.mute.notification')}
          </CustomText>
        </Pressable>
      </View>
    </ModalScrollView>
  )
}

export default TabSharedMute
