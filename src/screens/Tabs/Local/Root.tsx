import { HeaderRight } from '@components/Header'
import Icon from '@components/Icon'
import CustomText from '@components/Text'
import Timeline from '@components/Timeline'
import TimelineDefault from '@components/Timeline/Default'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { TabLocalStackParamList } from '@utils/navigation/navigators'
import { useListsQuery } from '@utils/queryHooks/lists'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { setAccountStorage, useAccountStorage } from '@utils/storage/actions'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import * as DropdownMenu from 'zeego/dropdown-menu'

const Root: React.FC<NativeStackScreenProps<TabLocalStackParamList, 'Tab-Local-Root'>> = ({
  navigation
}) => {
  const { colors, mode } = useTheme()
  const { t } = useTranslation('screenTabs')

  const { data: lists } = useListsQuery()

  const [pageLocal] = useAccountStorage.object('page_local')
  const [queryKey, setQueryKey] = useState<QueryKeyTimeline>([
    'Timeline',
    { page: 'Following', ...pageLocal }
  ])

  useEffect(() => {
    const page = queryKey[1]

    navigation.setOptions({
      headerTitle: () => (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {page.page === 'List' ? (
                <Icon
                  name='List'
                  size={StyleConstants.Font.Size.M}
                  color={colors.primaryDefault}
                  style={{ marginRight: StyleConstants.Spacing.S }}
                />
              ) : null}
              <CustomText
                style={{ color: colors.primaryDefault }}
                fontSize='L'
                fontWeight='Bold'
                numberOfLines={1}
                children={
                  page.page === 'List' && page.list?.length
                    ? lists?.find(list => list.id === page.list)?.title
                    : t('tabs.local.name')
                }
              />
              {page.page === 'Following' && !pageLocal.showBoosts ? (
                <Icon
                  name='Repeat'
                  size={StyleConstants.Font.Size.M}
                  color={colors.red}
                  style={{ marginLeft: StyleConstants.Spacing.S }}
                  crossOut
                />
              ) : null}
              {page.page === 'Following' && !pageLocal.showReplies ? (
                <Icon
                  name='MessageCircle'
                  size={StyleConstants.Font.Size.M}
                  color={colors.red}
                  style={{ marginLeft: StyleConstants.Spacing.S }}
                  crossOut
                />
              ) : null}
              <Icon
                name='ChevronDown'
                size={StyleConstants.Font.Size.M}
                color={colors.primaryDefault}
                style={{ marginLeft: StyleConstants.Spacing.S }}
              />
            </View>
          </DropdownMenu.Trigger>

          <DropdownMenu.Content>
            <DropdownMenu.Group>
              <DropdownMenu.Item
                key='default'
                onSelect={() => setQueryKey(['Timeline', { page: 'Following', ...pageLocal }])}
                disabled={page.page === 'Following'}
              >
                <DropdownMenu.ItemTitle children={t('tabs.local.name')} />
                <DropdownMenu.ItemIcon ios={{ name: 'house' }} />
              </DropdownMenu.Item>
              <DropdownMenu.CheckboxItem
                key='showBoosts'
                value={pageLocal.showBoosts ? 'on' : 'off'}
                onValueChange={() => {
                  setQueryKey([
                    'Timeline',
                    {
                      page: 'Following',
                      showBoosts: !pageLocal.showBoosts,
                      showReplies: pageLocal.showReplies
                    }
                  ])
                  setAccountStorage([
                    {
                      key: 'page_local',
                      value: { ...pageLocal, showBoosts: !pageLocal.showBoosts }
                    }
                  ])
                }}
              >
                <DropdownMenu.ItemIndicator />
                <DropdownMenu.ItemTitle children={t('tabs.local.options.showBoosts')} />
              </DropdownMenu.CheckboxItem>
              <DropdownMenu.CheckboxItem
                key='showReplies'
                value={pageLocal.showReplies ? 'on' : 'off'}
                onValueChange={() => {
                  setQueryKey([
                    'Timeline',
                    {
                      page: 'Following',
                      showBoosts: pageLocal.showBoosts,
                      showReplies: !pageLocal.showReplies
                    }
                  ])
                  setAccountStorage([
                    {
                      key: 'page_local',
                      value: { ...pageLocal, showReplies: !pageLocal.showReplies }
                    }
                  ])
                }}
              >
                <DropdownMenu.ItemTitle children={t('tabs.local.options.showReplies')} />
                <DropdownMenu.ItemIndicator />
              </DropdownMenu.CheckboxItem>
            </DropdownMenu.Group>

            <DropdownMenu.Group>
              {lists?.length
                ? [
                    ...lists?.map(list => ({
                      key: list.id,
                      item: {
                        onSelect: () => setQueryKey(['Timeline', { page: 'List', list: list.id }]),
                        disabled: page.page === 'List' && page.list === list.id,
                        destructive: false,
                        hidden: false
                      },
                      title: list.title,
                      icon: 'list.bullet'
                    }))
                  ].map(menu => (
                    <DropdownMenu.Item key={menu.key} {...menu.item}>
                      <DropdownMenu.ItemTitle children={menu.title} />
                      <DropdownMenu.ItemIcon ios={{ name: menu.icon }} />
                    </DropdownMenu.Item>
                  ))
                : undefined}
            </DropdownMenu.Group>
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
    navigation.setParams({ queryKey: queryKey })
  }, [mode, queryKey[1], pageLocal, lists])

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
