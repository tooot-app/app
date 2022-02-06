import Button from '@components/Button'
import haptics from '@components/haptics'
import ComponentSeparator from '@components/Separator'
import TimelineDefault from '@components/Timeline/Default'
import { TabMeStackScreenProps } from '@utils/navigation/navigators'
import {
  changeFontsize,
  getSettingsFontsize,
  SettingsState
} from '@utils/slices/settingsSlice'
import { StyleConstants } from '@utils/styles/constants'
import { adaptiveScale } from '@utils/styles/scaling'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { useDispatch, useSelector } from 'react-redux'

export const mapFontsizeToName = (size: SettingsState['fontsize']) => {
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

const TabMeSettingsFontsize: React.FC<
  TabMeStackScreenProps<'Tab-Me-Settings-Fontsize'>
> = () => {
  const { mode, theme } = useTheme()
  const { t } = useTranslation('screenTabs')
  const initialSize = useSelector(getSettingsFontsize)
  const dispatch = useDispatch()

  const item = {
    id: 'demo',
    uri: 'https://tooot.app',
    created_at: new Date(),
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
      avatar_static: 'https://avatars.githubusercontent.com/u/77554750?s=100'
    },
    media_attachments: [],
    mentions: []
  }

  const sizesDemo = useMemo(() => {
    return (
      <>
        {([-1, 0, 1, 2, 3] as [-1, 0, 1, 2, 3]).map(size => (
          <Text
            key={size}
            style={[
              styles.size,
              {
                fontSize: adaptiveScale(StyleConstants.Font.Size.M, size),
                lineHeight: adaptiveScale(
                  StyleConstants.Font.LineHeight.M,
                  size
                ),
                fontWeight:
                  initialSize === size
                    ? StyleConstants.Font.Weight.Bold
                    : undefined,
                color:
                  initialSize === size ? theme.primaryDefault : theme.secondary,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: theme.border
              }
            ]}
          >
            {t(`me.fontSize.sizes.${mapFontsizeToName(size)}`)}
          </Text>
        ))}
      </>
    )
  }, [mode, initialSize])

  return (
    <ScrollView scrollEnabled={false}>
      <Text style={[styles.header, { color: theme.primaryDefault }]}>
        {t('me.fontSize.showcase')}
      </Text>
      <View>
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
      <Text style={[styles.header, { color: theme.primaryDefault }]}>
        {t('me.fontSize.availableSizes')}
      </Text>
      <View style={styles.sizesDemo}>{sizesDemo}</View>
      <View style={styles.controls}>
        <Button
          onPress={() => {
            if (initialSize > -1) {
              haptics('Light')
              // @ts-ignore
              dispatch(changeFontsize(initialSize - 1))
            }
          }}
          type='icon'
          content='Minus'
          round
          disabled={initialSize <= -1}
          style={styles.control}
        />
        <Button
          onPress={() => {
            if (initialSize < 3) {
              haptics('Light')
              // @ts-ignore
              dispatch(changeFontsize(initialSize + 1))
            }
          }}
          type='icon'
          content='Plus'
          round
          disabled={initialSize >= 3}
          style={styles.control}
        />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  header: {
    ...StyleConstants.FontStyle.M,
    textAlign: 'center',
    marginTop: StyleConstants.Spacing.M,
    marginBottom: StyleConstants.Spacing.M
  },
  sizesDemo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  size: {
    marginHorizontal: StyleConstants.Spacing.XS,
    paddingHorizontal: StyleConstants.Spacing.XS,
    marginBottom: StyleConstants.Spacing.M
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  control: {
    marginHorizontal: StyleConstants.Spacing.S
  }
})

export default TabMeSettingsFontsize
