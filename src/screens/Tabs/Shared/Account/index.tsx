import menuAccount from '@components/contextMenu/account'
import menuShare from '@components/contextMenu/share'
import { HeaderLeft, HeaderRight } from '@components/Header'
import Timeline from '@components/Timeline'
import TimelineDefault from '@components/Timeline/Default'
import SegmentedControl from '@react-native-community/segmented-control'
import { useQueryClient } from '@tanstack/react-query'
import { TabSharedStackScreenProps } from '@utils/navigation/navigators'
import { useAccountQuery } from '@utils/queryHooks/account'
import { useRelationshipQuery } from '@utils/queryHooks/relationship'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { Fragment, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Text, View } from 'react-native'
import { useSharedValue } from 'react-native-reanimated'
import * as DropdownMenu from 'zeego/dropdown-menu'
import AccountAttachments from './Attachments'
import AccountContext from './Context'
import AccountHeader from './Header'
import AccountInformation from './Information'
import AccountNav from './Nav'

const TabSharedAccount: React.FC<TabSharedStackScreenProps<'Tab-Shared-Account'>> = ({
  navigation,
  route: {
    params: { account }
  }
}) => {
  const { t } = useTranslation('screenTabs')
  const { colors, mode } = useTheme()

  const { data, dataUpdatedAt } = useAccountQuery({
    account,
    _local: true,
    options: {
      onSuccess: a => {
        if (account._remote) {
          setQueryKey([
            queryKey[0],
            {
              ...queryKey[1],
              page: 'Account',
              id: a.id,
              exclude_reblogs: true,
              only_media: false
            }
          ])
        }
      },
      onError: () => navigation.goBack()
    }
  })
  const { data: dataRelationship } = useRelationshipQuery({
    id: account._remote ? data?.id : account.id,
    options: { enabled: account._remote ? !!data?.id : true }
  })

  const queryClient = useQueryClient()
  const [queryKey, setQueryKey] = useState<QueryKeyTimeline>([
    'Timeline',
    {
      page: 'Account',
      id: account._remote ? data?.id : account.id,
      exclude_reblogs: true,
      only_media: false
    }
  ])

  const mShare = menuShare({ type: 'account', url: data?.url })
  const mAccount = menuAccount({ type: 'account', openChange: true, account: data })
  useEffect(() => {
    navigation.setOptions({
      headerTransparent: true,
      headerStyle: {
        backgroundColor: `rgba(255, 255, 255, 0)`
      },
      title: '',
      headerLeft: () => <HeaderLeft onPress={() => navigation.goBack()} background />,
      headerRight: () => {
        return (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <HeaderRight
                accessibilityLabel={t('shared.account.actions.accessibilityLabel', {
                  user: account.acct
                })}
                accessibilityHint={t('shared.account.actions.accessibilityHint')}
                content='more-horizontal'
                onPress={() => {}}
                background
              />
            </DropdownMenu.Trigger>

            <DropdownMenu.Content>
              {[mShare, mAccount].map((menu, i) => (
                <Fragment key={i}>
                  {menu.map((group, index) => (
                    <DropdownMenu.Group key={index}>
                      {group.map(item => {
                        switch (item.type) {
                          case 'item':
                            return (
                              <DropdownMenu.Item key={item.key} {...item.props}>
                                <DropdownMenu.ItemTitle children={item.title} />
                                {item.icon ? (
                                  <DropdownMenu.ItemIcon ios={{ name: item.icon }} />
                                ) : null}
                              </DropdownMenu.Item>
                            )
                          case 'sub':
                            if (Platform.OS === 'ios') {
                              return (
                                // @ts-ignore
                                <DropdownMenu.Sub key={item.key}>
                                  <DropdownMenu.SubTrigger
                                    key={item.trigger.key}
                                    {...item.trigger.props}
                                  >
                                    <DropdownMenu.ItemTitle children={item.trigger.title} />
                                    {item.trigger.icon ? (
                                      <DropdownMenu.ItemIcon ios={{ name: item.trigger.icon }} />
                                    ) : null}
                                  </DropdownMenu.SubTrigger>
                                  <DropdownMenu.SubContent>
                                    {item.items.map(sub => (
                                      <DropdownMenu.Item key={sub.key} {...sub.props}>
                                        <DropdownMenu.ItemTitle children={sub.title} />
                                        {sub.icon ? (
                                          <DropdownMenu.ItemIcon ios={{ name: sub.icon }} />
                                        ) : null}
                                      </DropdownMenu.Item>
                                    ))}
                                  </DropdownMenu.SubContent>
                                </DropdownMenu.Sub>
                              )
                            } else {
                              return (
                                <Fragment key={item.key}>
                                  {item.items.map(sub => (
                                    <DropdownMenu.Item key={sub.key} {...sub.props}>
                                      <DropdownMenu.ItemTitle children={sub.title} />
                                      {sub.icon ? (
                                        <DropdownMenu.ItemIcon ios={{ name: sub.icon }} />
                                      ) : null}
                                    </DropdownMenu.Item>
                                  ))}
                                </Fragment>
                              )
                            }
                        }
                      })}
                    </DropdownMenu.Group>
                  ))}
                </Fragment>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        )
      }
    })
  }, [mAccount])
  useEffect(() => {
    navigation.setParams({ queryKey })
  }, [queryKey[1]])

  const scrollY = useSharedValue(0)

  const page = queryKey[1]

  const [segment, setSegment] = useState<number>(0)
  const ListHeaderComponent = useMemo(() => {
    return (
      <>
        <View style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <AccountHeader />
          <AccountInformation />
          <AccountAttachments />
        </View>
        {!data?.suspended ? (
          <SegmentedControl
            appearance={mode}
            values={[t('shared.account.toots.default'), t('shared.account.toots.all')]}
            selectedIndex={segment}
            onChange={({ nativeEvent }) => {
              setSegment(nativeEvent.selectedSegmentIndex)
              switch (nativeEvent.selectedSegmentIndex) {
                case 0:
                  setQueryKey([
                    queryKey[0],
                    {
                      ...page,
                      page: 'Account',
                      id: data?.id,
                      exclude_reblogs: true,
                      only_media: false
                    }
                  ])
                  break
                case 1:
                  setQueryKey([
                    queryKey[0],
                    {
                      ...page,
                      page: 'Account',
                      id: data?.id,
                      exclude_reblogs: false,
                      only_media: false
                    }
                  ])
                  break
              }
            }}
            style={{
              marginTop: StyleConstants.Spacing.M,
              marginHorizontal: StyleConstants.Spacing.Global.PagePadding
            }}
          />
        ) : null}
        {data?.suspended ? (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: StyleConstants.Spacing.Global.PagePadding
            }}
          >
            <Text
              style={{
                ...StyleConstants.FontStyle.M,
                color: colors.secondary,
                textAlign: 'center'
              }}
            >
              {t('shared.account.suspended')}
            </Text>
          </View>
        ) : null}
      </>
    )
  }, [segment, dataUpdatedAt, mode])

  return (
    <AccountContext.Provider value={{ account: data, relationship: dataRelationship }}>
      <AccountNav scrollY={scrollY} />

      {data?.suspended ? (
        ListHeaderComponent
      ) : (
        <Timeline
          queryKey={queryKey}
          disableRefresh
          queryOptions={{ enabled: account._remote ? !!data?.id : true }}
          customProps={{
            renderItem: ({ item }) => <TimelineDefault item={item} queryKey={queryKey} />,
            onScroll: ({ nativeEvent }) => (scrollY.value = nativeEvent.contentOffset.y),
            ListHeaderComponent,
            maintainVisibleContentPosition: undefined,
            onRefresh: () => queryClient.refetchQueries(queryKey),
            refreshing: false
          }}
        />
      )}
    </AccountContext.Provider>
  )
}

export default TabSharedAccount
