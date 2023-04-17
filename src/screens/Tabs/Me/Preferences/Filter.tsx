import Button from '@components/Button'
import haptics from '@components/haptics'
import { HeaderLeft, HeaderRight } from '@components/Header'
import Hr from '@components/Hr'
import ComponentInput from '@components/Input'
import { MenuRow } from '@components/Menu'
import { ModalScrollView } from '@components/ModalScrollView'
import Selections from '@components/Selections'
import CustomText from '@components/Text'
import { useActionSheet } from '@expo/react-native-action-sheet'
import apiInstance from '@utils/api/instance'
import { androidActionSheetStyles } from '@utils/helpers/androidActionSheetStyles'
import browserPackage from '@utils/helpers/browserPackage'
import { TabMePreferencesStackScreenProps } from '@utils/navigation/navigators'
import { queryClient } from '@utils/queryHooks'
import { QueryKeyFilters } from '@utils/queryHooks/filters'
import { getAccountStorage } from '@utils/storage/actions'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import * as WebBrowser from 'expo-web-browser'
import React, { RefObject, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, View } from 'react-native'
import FlashMessage from 'react-native-flash-message'

const TabMePreferencesFilter: React.FC<
  TabMePreferencesStackScreenProps<'Tab-Me-Preferences-Filter'> & {
    messageRef: RefObject<FlashMessage>
  }
> = ({ navigation, route: { params } }) => {
  const { colors } = useTheme()
  const { t } = useTranslation(['common', 'screenTabs'])

  const { showActionSheetWithOptions } = useActionSheet()

  useEffect(() => {
    navigation.setOptions({
      title:
        params.type === 'add'
          ? t('screenTabs:me.stacks.preferencesFilterAdd.name')
          : t('screenTabs:me.stacks.preferencesFilterEdit.name'),
      headerLeft: () => (
        <HeaderLeft
          content='chevron-left'
          onPress={() => navigation.navigate('Tab-Me-Preferences-Filters')}
        />
      )
    })
  }, [])

  const titleState = useState(params.type === 'edit' ? params.filter.title : '')

  const expirations = ['0', '1800', '3600', '43200', '86400', '604800', '18144000'] as const
  const [expiration, setExpiration] = useState<typeof expirations[number]>('0')

  const [contexts, setContexts] = useState<
    {
      selected: boolean
      content: string
      type: 'home' | 'notifications' | 'public' | 'thread' | 'account'
    }[]
  >([
    {
      selected: params.type === 'edit' ? params.filter.context.includes('home') : true,
      content: t('screenTabs:me.preferencesFilter.contexts.home'),
      type: 'home'
    },
    {
      selected: params.type === 'edit' ? params.filter.context.includes('notifications') : false,
      content: t('screenTabs:me.preferencesFilter.contexts.notifications'),
      type: 'notifications'
    },
    {
      selected: params.type === 'edit' ? params.filter.context.includes('public') : false,
      content: t('screenTabs:me.preferencesFilter.contexts.public'),
      type: 'public'
    },
    {
      selected: params.type === 'edit' ? params.filter.context.includes('thread') : false,
      content: t('screenTabs:me.preferencesFilter.contexts.thread'),
      type: 'thread'
    },
    {
      selected: params.type === 'edit' ? params.filter.context.includes('account') : false,
      content: t('screenTabs:me.preferencesFilter.contexts.account'),
      type: 'account'
    }
  ])

  const [actions, setActions] = useState<
    { selected: boolean; content: string; type: 'warn' | 'hide' }[]
  >([
    {
      selected: params.type === 'edit' ? params.filter.filter_action === 'warn' : true,
      content: t('screenTabs:me.preferencesFilter.actions.warn'),
      type: 'warn'
    },
    {
      selected: params.type === 'edit' ? params.filter.filter_action === 'hide' : false,
      content: t('screenTabs:me.preferencesFilter.actions.hide'),
      type: 'hide'
    }
  ])

  const [keywords, setKeywords] = useState<string[]>(
    params.type === 'edit'
      ? params.filter.keywords.length
        ? params.filter.keywords.map(({ keyword }) => keyword)
        : ['']
      : ['']
  )

  useEffect(() => {
    let isLoading = false
    navigation.setOptions({
      headerRight: () => (
        <HeaderRight
          content='save'
          loading={isLoading}
          onPress={async () => {
            if (!titleState[0].length || !contexts.filter(context => context.selected).length)
              return

            switch (params.type) {
              case 'add':
                isLoading = true
                await apiInstance({
                  method: 'post',
                  version: 'v2',
                  url: 'filters',
                  body: {
                    title: titleState[0],
                    context: contexts
                      .filter(context => context.selected)
                      .map(context => context.type),
                    filter_action: actions.filter(
                      action => action.type === 'hide' && action.selected
                    ).length
                      ? 'hide'
                      : 'warn',
                    ...(parseInt(expiration) && { expires_in: parseInt(expiration) }),
                    ...(keywords.filter(keyword => keyword.length).length && {
                      keywords_attributes: keywords
                        .filter(keyword => keyword.length)
                        .map(keyword => ({ keyword, whole_word: true }))
                    })
                  }
                })
                  .then(() => {
                    isLoading = false
                    const queryKey: QueryKeyFilters = ['Filters', { version: 'v2' }]
                    queryClient.refetchQueries(queryKey)
                    navigation.navigate('Tab-Me-Preferences-Filters')
                  })
                  .catch(() => {
                    isLoading = false
                    haptics('Error')
                  })
                break
              case 'edit':
                isLoading = true
                await apiInstance({
                  method: 'put',
                  version: 'v2',
                  url: `filters/${params.filter.id}`,
                  body: {
                    title: titleState[0],
                    context: contexts
                      .filter(context => context.selected)
                      .map(context => context.type),
                    filter_action: actions.filter(
                      action => action.type === 'hide' && action.selected
                    ).length
                      ? 'hide'
                      : 'warn',
                    ...(parseInt(expiration) && {
                      expires_in: parseInt(expiration)
                    }),
                    keywords_attributes: keywords.map((keyword, index) =>
                      !!params.filter.keywords[index]
                        ? {
                            id: params.filter.keywords[index].id,
                            ...(keyword.length ? { keyword, whole_word: true } : { _destroy: true })
                          }
                        : { keyword, whole_word: true }
                    )
                  }
                })
                  .then(() => {
                    isLoading = false
                    const queryKey: QueryKeyFilters = ['Filters', { version: 'v2' }]
                    queryClient.refetchQueries(queryKey)
                    navigation.navigate('Tab-Me-Preferences-Filters')
                  })
                  .catch(() => {
                    isLoading = false
                    haptics('Error')
                  })
                break
            }
          }}
        />
      )
    })
  }, [titleState[0], expiration, contexts, actions, keywords])

  const scrollViewRef = useRef<ScrollView>(null)

  return (
    <ModalScrollView ref={scrollViewRef}>
      <ComponentInput title={t('screenTabs:me.preferencesFilter.name')} value={titleState} />
      <MenuRow
        title={t('screenTabs:me.preferencesFilter.expiration')}
        content={t(`screenTabs:me.preferencesFilter.expirationOptions.${expiration}`)}
        iconBack='chevron-right'
        onPress={() =>
          showActionSheetWithOptions(
            {
              title: t('screenTabs:me.preferencesFilter.expiration'),
              options: [
                ...expirations.map(opt =>
                  t(`screenTabs:me.preferencesFilter.expirationOptions.${opt}`)
                ),
                t('common:buttons.cancel')
              ],
              cancelButtonIndex: expirations.length,
              ...androidActionSheetStyles(colors)
            },
            (selectedIndex: number) => {
              selectedIndex < expirations.length && setExpiration(expirations[selectedIndex])
            }
          )
        }
      />
      <Hr />

      <Selections
        title={t('screenTabs:me.preferencesFilter.context')}
        multiple
        invalid={!contexts.filter(context => context.selected).length}
        options={contexts}
        setOptions={setContexts}
      />
      <Selections
        title={t('screenTabs:me.preferencesFilter.action')}
        options={actions}
        setOptions={setActions}
      />
      <Hr style={{ marginVertical: StyleConstants.Spacing.M }} />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <CustomText
          fontStyle='M'
          children={t('screenTabs:me.preferencesFilter.keywords')}
          style={{ color: colors.primaryDefault }}
        />
        <CustomText
          style={{ marginHorizontal: StyleConstants.Spacing.M, color: colors.secondary }}
          children={t('screenTabs:me.preferencesFilters.keywords', { count: keywords.length })}
        />
      </View>
      <View
        style={{
          marginTop: StyleConstants.Spacing.M,
          marginBottom: StyleConstants.Spacing.S
        }}
      >
        {[...Array(keywords.length)].map((_, i) => (
          <ComponentInput
            key={i}
            title={t('screenTabs:me.preferencesFilter.keyword')}
            value={[
              keywords[i],
              k => setKeywords(keywords.map((curr, ii) => (i === ii ? k : curr)))
            ]}
          />
        ))}
      </View>
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
          marginRight: StyleConstants.Spacing.M
        }}
      >
        <Button
          onPress={() => setKeywords(keywords.slice(0, keywords.length - 1))}
          type='icon'
          content='minus'
          round
          disabled={keywords.length < 1}
          style={{ marginRight: StyleConstants.Spacing.M }}
        />
        <Button
          onPress={() => {
            setKeywords([...keywords, ''])
            setTimeout(() => scrollViewRef.current?.scrollToEnd(), 50)
          }}
          type='icon'
          content='plus'
          round
        />
      </View>

      {params.type === 'edit' && params.filter.statuses?.length ? (
        <>
          <Hr style={{ marginVertical: StyleConstants.Spacing.M }} />
          <MenuRow
            title={t('screenTabs:me.preferencesFilter.statuses')}
            content={t('screenTabs:me.preferencesFilters.statuses', {
              count: params.filter.statuses.length
            })}
            iconBack='external-link'
            onPress={async () =>
              WebBrowser.openAuthSessionAsync(
                `https://${getAccountStorage.string('auth.domain')}/filters/${
                  params.filter.id
                }/statuses`,
                'tooot://tooot',
                {
                  ...(await browserPackage()),
                  dismissButtonStyle: 'done',
                  readerMode: false
                }
              )
            }
          />
        </>
      ) : null}
    </ModalScrollView>
  )
}

export default TabMePreferencesFilter
