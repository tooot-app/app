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
import * as DropdownMenu from 'zeego/dropdown-menu'
import TabShared from './Shared'

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
              <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                  <HeaderCenter
                    dropdown={(lists?.length ?? 0) > 0}
                    content={
                      queryKey[1].page === 'List' && queryKey[1].list?.length
                        ? lists?.find(list => list.id === queryKey[1].list)?.title
                        : t('tabs.local.name')
                    }
                  />
                </DropdownMenu.Trigger>

                <DropdownMenu.Content>
                  {lists?.length
                    ? [
                        {
                          key: 'default',
                          item: {
                            onSelect: () => setQueryKey(['Timeline', { page: 'Following' }]),
                            disabled: queryKey[1].page === 'Following',
                            destructive: false,
                            hidden: false
                          },
                          title: t('tabs.local.name'),
                          icon: ''
                        },
                        ...lists?.map(list => ({
                          key: list.id,
                          item: {
                            onSelect: () =>
                              setQueryKey(['Timeline', { page: 'List', list: list.id }]),
                            disabled: queryKey[1].page === 'List' && queryKey[1].list === list.id,
                            destructive: false,
                            hidden: false
                          },
                          title: list.title,
                          icon: ''
                        }))
                      ].map(menu => (
                        <DropdownMenu.Item key={menu.key} {...menu.item}>
                          <DropdownMenu.ItemTitle children={menu.title} />
                          <DropdownMenu.ItemIcon iosIconName={menu.icon} />
                        </DropdownMenu.Item>
                      ))
                    : undefined}
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            ),
            headerRight: () => (
              <HeaderRight
                accessibilityLabel={t('common.search.accessibilityLabel')}
                accessibilityHint={t('common.search.accessibilityHint')}
                content='Search'
                onPress={() => navigation.navigate('Tab-Local', { screen: 'Tab-Shared-Search' })}
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
        {TabShared({ Stack })}
      </Stack.Navigator>
    )
  },
  () => true
)

export default TabLocal
