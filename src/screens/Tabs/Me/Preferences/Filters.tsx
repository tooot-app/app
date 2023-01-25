import { HeaderLeft, HeaderRight } from '@components/Header'
import Icon from '@components/Icon'
import ComponentSeparator from '@components/Separator'
import CustomText from '@components/Text'
import apiInstance from '@utils/api/instance'
import { TabMePreferencesStackScreenProps } from '@utils/navigation/navigators'
import { useFiltersQuery } from '@utils/queryHooks/filters'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { Fragment, useEffect } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Pressable, TouchableNativeFeedback, View } from 'react-native'
import { SwipeListView } from 'react-native-swipe-list-view'

const TabMePreferencesFilters: React.FC<
  TabMePreferencesStackScreenProps<'Tab-Me-Preferences-Filters'>
> = ({ navigation }) => {
  const { colors } = useTheme()
  const { t } = useTranslation(['common', 'screenTabs'])

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <HeaderLeft
          content='chevron-left'
          onPress={() => navigation.navigate('Tab-Me-Preferences-Root')}
        />
      ),
      headerRight: () => (
        <HeaderRight
          content='plus'
          onPress={() => navigation.navigate('Tab-Me-Preferences-Filter', { type: 'add' })}
        />
      )
    })
  }, [])

  const { data, refetch } = useFiltersQuery<'v2'>({ version: 'v2' })

  return (
    <SwipeListView
      renderHiddenItem={({ item }) => (
        <Pressable
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'flex-end',
            backgroundColor: colors.red
          }}
          onPress={() => {
            apiInstance({ method: 'delete', version: 'v2', url: `filters/${item.id}` }).then(() =>
              refetch()
            )
          }}
        >
          <View style={{ paddingHorizontal: StyleConstants.Spacing.L }}>
            <Icon name='trash' color='white' size={StyleConstants.Font.Size.L} />
          </View>
        </Pressable>
      )}
      rightOpenValue={-(StyleConstants.Spacing.L * 2 + StyleConstants.Font.Size.L)}
      disableRightSwipe
      closeOnRowPress
      data={data?.sort(filter =>
        filter.expires_at ? new Date().getTime() - new Date(filter.expires_at).getTime() : 1
      )}
      renderItem={({ item: filter }) => (
        <TouchableNativeFeedback
          onPress={() => navigation.navigate('Tab-Me-Preferences-Filter', { type: 'edit', filter })}
        >
          <View
            style={{
              padding: StyleConstants.Spacing.Global.PagePadding,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.backgroundDefault
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
                              style={{
                                color: colors.secondary,
                                textDecorationColor: colors.disabled,
                                textDecorationLine: 'underline',
                                textDecorationStyle: 'solid'
                              }}
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
            <Icon
              name='chevron-right'
              size={StyleConstants.Font.Size.L}
              color={colors.primaryDefault}
              style={{ marginLeft: 8 }}
            />
          </View>
        </TouchableNativeFeedback>
      )}
      ItemSeparatorComponent={ComponentSeparator}
    />
  )
}

export default TabMePreferencesFilters
