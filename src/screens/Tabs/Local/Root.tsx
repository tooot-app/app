import { HeaderCenter, HeaderRight } from '@components/Header'
import Timeline from '@components/Timeline'
import TimelineDefault from '@components/Timeline/Default'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { TabLocalStackParamList } from '@utils/navigation/navigators'
import usePopToTop from '@utils/navigation/usePopToTop'
import { useListsQuery } from '@utils/queryHooks/lists'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as DropdownMenu from 'zeego/dropdown-menu'

const Root: React.FC<NativeStackScreenProps<TabLocalStackParamList, 'Tab-Local-Root'>> = ({
  navigation
}) => {
  const { t } = useTranslation('screenTabs')

  const { data: lists } = useListsQuery()

  const [queryKey, setQueryKey] = useState<QueryKeyTimeline>(['Timeline', { page: 'Following' }])

  useEffect(() => {
    navigation.setOptions({
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
                      onSelect: () => setQueryKey(['Timeline', { page: 'List', list: list.id }]),
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
          onPress={() => navigation.navigate('Tab-Shared-Search')}
        />
      )
    })
  }, [])

  usePopToTop()

  return (
    <Timeline
      queryKey={queryKey}
      customProps={{
        renderItem: ({ item }) => <TimelineDefault item={item} queryKey={queryKey} />
      }}
    />
  )
}

export default Root
