import { HeaderRight } from '@components/Header'
import Icon from '@components/Icon'
import CustomText from '@components/Text'
import Timeline from '@components/Timeline'
import TimelineDefault from '@components/Timeline/Default'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { TabLocalStackParamList } from '@utils/navigation/navigators'
import usePopToTop from '@utils/navigation/usePopToTop'
import { useListsQuery } from '@utils/queryHooks/lists'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { getInstanceFollowingPage, updateInstanceFollowingPage } from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import * as DropdownMenu from 'zeego/dropdown-menu'

const Root: React.FC<NativeStackScreenProps<TabLocalStackParamList, 'Tab-Local-Root'>> = ({
  navigation
}) => {
  const { colors, mode } = useTheme()
  const { t } = useTranslation('screenTabs')

  const { data: lists } = useListsQuery()

  const dispatch = useDispatch()
  const instanceFollowingPage = useSelector(getInstanceFollowingPage)
  const [queryKey, setQueryKey] = useState<QueryKeyTimeline>([
    'Timeline',
    { page: 'Following', ...instanceFollowingPage }
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
              {page.page === 'Following' && !instanceFollowingPage.showBoosts ? (
                <Icon
                  name='MessageCircle'
                  size={StyleConstants.Font.Size.M}
                  color={colors.red}
                  style={{ marginLeft: StyleConstants.Spacing.S }}
                  crossOut
                />
              ) : null}
              {page.page === 'Following' && !instanceFollowingPage.showReplies ? (
                <Icon
                  name='Repeat'
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
                onSelect={() =>
                  setQueryKey(['Timeline', { page: 'Following', ...instanceFollowingPage }])
                }
                disabled={page.page === 'Following'}
              >
                <DropdownMenu.ItemTitle children={t('tabs.local.name')} />
                <DropdownMenu.ItemIcon iosIconName='house' />
              </DropdownMenu.Item>
              <DropdownMenu.CheckboxItem
                key='showBoosts'
                value={instanceFollowingPage.showBoosts ? 'on' : 'mixed'}
                onValueChange={() => {
                  setQueryKey([
                    'Timeline',
                    {
                      page: 'Following',
                      showBoosts: !instanceFollowingPage.showBoosts,
                      showReplies: instanceFollowingPage.showReplies
                    }
                  ])
                  dispatch(
                    updateInstanceFollowingPage({ showBoosts: !instanceFollowingPage.showBoosts })
                  )
                }}
              >
                <DropdownMenu.ItemIndicator />
                <DropdownMenu.ItemTitle children={t('tabs.local.options.showBoosts')} />
              </DropdownMenu.CheckboxItem>
              <DropdownMenu.CheckboxItem
                key='showReplies'
                value={instanceFollowingPage.showReplies ? 'on' : 'mixed'}
                onValueChange={() => {
                  setQueryKey([
                    'Timeline',
                    {
                      page: 'Following',
                      showBoosts: instanceFollowingPage.showBoosts,
                      showReplies: !instanceFollowingPage.showReplies
                    }
                  ])
                  dispatch(
                    updateInstanceFollowingPage({ showReplies: !instanceFollowingPage.showReplies })
                  )
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
                      <DropdownMenu.ItemIcon iosIconName={menu.icon} />
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
  }, [mode, queryKey[1], instanceFollowingPage])

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
