import analytics from '@components/analytics'
import { HeaderCenter, HeaderRight } from '@components/Header'
import Timeline from '@components/Timeline'
import TimelineDefault from '@components/Timeline/Default'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ScreenTabsScreenProps, TabLocalStackParamList } from '@utils/navigation/navigators'
import usePopToTop from '@utils/navigation/usePopToTop'
import { useListsQuery } from '@utils/queryHooks/lists'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import layoutAnimation from '@utils/styles/layoutAnimation'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import ContextMenu from 'react-native-context-menu-view'
import TabSharedRoot from './Shared/Root'

const Stack = createNativeStackNavigator<TabLocalStackParamList>()

const TabLocal = React.memo(
  ({ navigation }: ScreenTabsScreenProps<'Tab-Local'>) => {
    const { t } = useTranslation('screenTabs')

    const { data: lists } = useListsQuery({})
    useEffect(() => {
      layoutAnimation()
    }, [lists?.length])

    const [queryKey, setQueryKey] = useState<QueryKeyTimeline>(['Timeline', { page: 'Following' }])

    usePopToTop()

    return (
      <Stack.Navigator screenOptions={{ headerShadowVisible: false }}>
        <Stack.Screen
          name='Tab-Local-Root'
          options={{
            headerTitle: () => (
              <ContextMenu
                dropdownMenuMode
                style={{ maxWidth: '80%', flex: Platform.OS === 'android' ? 1 : undefined }}
                actions={
                  lists?.length
                    ? [
                        {
                          id: '',
                          title: t('tabs.local.name'),
                          disabled: queryKey[1].page === 'Following'
                        },
                        ...lists?.map(list => ({
                          id: list.id,
                          title: list.title,
                          disabled: queryKey[1].page === 'List' && queryKey[1].list === list.id
                        }))
                      ]
                    : undefined
                }
                onPress={({ nativeEvent: { index } }) => {
                  lists && index
                    ? setQueryKey(['Timeline', { page: 'List', list: lists[index - 1].id }])
                    : setQueryKey(['Timeline', { page: 'Following' }])
                }}
                children={
                  <HeaderCenter
                    dropdown={(lists?.length ?? 0) > 0}
                    content={
                      queryKey[1].page === 'List' && queryKey[1].list?.length
                        ? lists?.find(list => list.id === queryKey[1].list)?.title
                        : t('tabs.local.name')
                    }
                  />
                }
              />
            ),
            headerRight: () => (
              <HeaderRight
                accessibilityLabel={t('common.search.accessibilityLabel')}
                accessibilityHint={t('common.search.accessibilityHint')}
                content='Search'
                onPress={() => {
                  analytics('search_tap', { page: 'Local' })
                  navigation.navigate('Tab-Local', {
                    screen: 'Tab-Shared-Search',
                    params: { text: undefined }
                  })
                }}
              />
            )
          }}
          children={() => (
            <Timeline
              queryKey={queryKey}
              lookback='Following'
              customProps={{
                renderItem: ({ item }) => <TimelineDefault item={item} queryKey={queryKey} />
              }}
            />
          )}
        />
        {TabSharedRoot({ Stack })}
      </Stack.Navigator>
    )
  },
  () => true
)

export default TabLocal
