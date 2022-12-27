import Button from '@components/Button'
import haptics from '@components/haptics'
import ComponentSeparator from '@components/Separator'
import CustomText from '@components/Text'
import TimelineDefault from '@components/Timeline/Default'
import { TabMeStackScreenProps } from '@utils/navigation/navigators'
import { useGlobalStorage } from '@utils/storage/actions'
import { StorageGlobal } from '@utils/storage/versions/global'
import { StyleConstants } from '@utils/styles/constants'
import { adaptiveScale } from '@utils/styles/scaling'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

export const mapFontsizeToName = (size: StorageGlobal['app.font_size']) => {
  switch (size) {
    case -1:
      return 'S'
    case 0:
      return 'M'
    case 1:
      return 'L'
    case 2:
      return 'XL'
    case 3:
      return 'XXL'
  }
}

const TabMeSettingsFontsize: React.FC<TabMeStackScreenProps<'Tab-Me-Settings-Fontsize'>> = () => {
  const { colors } = useTheme()
  const { t } = useTranslation('screenTabs')

  const [fontSize, setFontSize] = useGlobalStorage.number('app.font_size')

  const item = {
    id: 'demo',
    uri: 'https://tooot.app',
    created_at: new Date(2021, 4, 16),
    sensitive: false,
    visibility: 'public',
    replies_count: 0,
    reblogs_count: 0,
    favourites_count: 0,
    favourited: true,
    reblogged: false,
    muted: false,
    bookmarked: false,
    content: t('me.fontSize.demo'),
    reblog: null,
    application: {
      name: 'tooot',
      website: 'https://tooot.app'
    },
    account: {
      id: 'demo',
      url: 'https://tooot.app',
      username: 'tooot📱',
      acct: 'tooot@xmflsct.com',
      display_name: 'tooot📱',
      avatar: 'https://avatars.githubusercontent.com/u/77554750?s=100',
      avatar_static: 'https://avatars.githubusercontent.com/u/77554750?s=100'
    },
    media_attachments: [],
    mentions: []
  }

  return (
    <ScrollView>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: StyleConstants.Spacing.M
        }}
      >
        {([-1, 0, 1, 2, 3] as [-1, 0, 1, 2, 3]).map(size => (
          <CustomText
            key={size}
            style={{
              marginHorizontal: StyleConstants.Spacing.XS,
              paddingHorizontal: StyleConstants.Spacing.XS,
              marginBottom: StyleConstants.Spacing.M,
              fontSize: adaptiveScale(StyleConstants.Font.Size.M, size),
              lineHeight: adaptiveScale(StyleConstants.Font.LineHeight.M, size),
              color: fontSize === size ? colors.primaryDefault : colors.secondary,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.border
            }}
            fontWeight={fontSize === size ? 'Bold' : undefined}
          >
            {t(`me.fontSize.sizes.${mapFontsizeToName(size)}`)}
          </CustomText>
        ))}
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Button
          onPress={() => {
            if (fontSize > -1) {
              haptics('Light')
              // @ts-ignore
              setFontSize(fontSize - 1)
            }
          }}
          type='icon'
          content='Minus'
          round
          disabled={(fontSize || 0) <= -1}
          style={{ marginHorizontal: StyleConstants.Spacing.S }}
        />
        <Button
          onPress={() => {
            if (fontSize < 3) {
              haptics('Light')
              // @ts-ignore
              setFontSize(fontSize + 1)
            }
          }}
          type='icon'
          content='Plus'
          round
          disabled={(fontSize || 0) >= 3}
          style={{ marginHorizontal: StyleConstants.Spacing.S }}
        />
      </View>
      <View style={{ marginVertical: StyleConstants.Spacing.L }}>
        <ComponentSeparator
          extraMarginLeft={-StyleConstants.Spacing.Global.PagePadding}
          extraMarginRight={-StyleConstants.Spacing.Global.PagePadding}
        />
        <TimelineDefault
          // @ts-ignore
          item={item}
          disableDetails
          disableOnPress
        />
        <ComponentSeparator
          extraMarginLeft={-StyleConstants.Spacing.Global.PagePadding}
          extraMarginRight={-StyleConstants.Spacing.Global.PagePadding}
        />
      </View>
    </ScrollView>
  )
}

export default TabMeSettingsFontsize
