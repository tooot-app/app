import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { Fragment } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Pressable, View, ViewStyle } from 'react-native'
import Icon from './Icon'
import CustomText from './Text'

export type Props = {
  onPress: () => void
  filter: Mastodon.Filter<'v2'>
  button?: React.ReactNode
  style?: ViewStyle
}

export const Filter: React.FC<Props> = ({ onPress, filter, button, style }) => {
  const { t } = useTranslation(['common', 'screenTabs'])
  const { colors } = useTheme()

  return (
    <Pressable onPress={onPress}>
      <View
        style={{
          paddingVertical: StyleConstants.Spacing.S,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.backgroundDefault,
          ...style
        }}
      >
        <View style={{ flex: 1 }}>
          <CustomText
            fontStyle='M'
            children={filter.title}
            style={{ color: colors.primaryDefault }}
            numberOfLines={1}
          />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: StyleConstants.Spacing.XS
            }}
          >
            {filter.expires_at && new Date() > new Date(filter.expires_at) ? (
              <CustomText
                fontStyle='S'
                fontWeight='Bold'
                children={t('screenTabs:me.preferencesFilters.expired')}
                style={{ color: colors.red, marginRight: StyleConstants.Spacing.M }}
              />
            ) : null}
            {filter.keywords?.length ? (
              <CustomText
                children={t('screenTabs:me.preferencesFilters.keywords', {
                  count: filter.keywords.length
                })}
                style={{ color: colors.primaryDefault }}
              />
            ) : null}
            {filter.keywords?.length && filter.statuses?.length ? (
              <CustomText
                children={t('common:separator')}
                style={{ color: colors.primaryDefault }}
              />
            ) : null}
            {filter.statuses?.length ? (
              <CustomText
                children={t('screenTabs:me.preferencesFilters.statuses', {
                  count: filter.statuses.length
                })}
                style={{ color: colors.primaryDefault }}
              />
            ) : null}
          </View>
          <CustomText
            style={{ color: colors.secondary }}
            children={
              <Trans
                ns='screenTabs'
                i18nKey='me.preferencesFilters.context'
                components={[
                  <>
                    {filter.context.map((c, index) => (
                      <Fragment key={index}>
                        <CustomText
                          style={{ color: colors.secondary }}
                          children={t(`screenTabs:me.preferencesFilters.contexts.${c}`)}
                        />
                        <CustomText children={t('common:separator')} />
                      </Fragment>
                    ))}
                  </>
                ]}
              />
            }
          />
        </View>
        {button || (
          <Icon
            name='chevron-right'
            size={StyleConstants.Font.Size.L}
            color={colors.primaryDefault}
            style={{ marginLeft: 8 }}
          />
        )}
      </View>
    </Pressable>
  )
}
