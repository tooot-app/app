import menuAccount from '@components/contextMenu/account'
import menuShare from '@components/contextMenu/share'
import { HeaderLeft, HeaderRight } from '@components/Header'
import Timeline from '@components/Timeline'
import TimelineDefault from '@components/Timeline/Default'
import SegmentedControl from '@react-native-community/segmented-control'
import { TabSharedStackScreenProps } from '@utils/navigation/navigators'
import { useAccountQuery } from '@utils/queryHooks/account'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { useSharedValue } from 'react-native-reanimated'
import { useIsFetching } from 'react-query'
import * as DropdownMenu from 'zeego/dropdown-menu'
import AccountAttachments from './Account/Attachments'
import AccountHeader from './Account/Header'
import AccountInformation from './Account/Information'
import AccountNav from './Account/Nav'

const TabSharedAccount: React.FC<TabSharedStackScreenProps<'Tab-Shared-Account'>> = ({
  navigation,
  route: {
    params: { account }
  }
}) => {
  const { t, i18n } = useTranslation('screenTabs')
  const { colors, mode } = useTheme()

  const mShare = menuShare({ type: 'account', url: account.url })
  const mAccount = menuAccount({ type: 'account', openChange: true, account })
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
                content='MoreHorizontal'
                onPress={() => {}}
                background
              />
            </DropdownMenu.Trigger>

            <DropdownMenu.Content>
              {mShare.map((mGroup, index) => (
                <DropdownMenu.Group key={index}>
                  {mGroup.map(menu => (
                    <DropdownMenu.Item key={menu.key} {...menu.item}>
                      <DropdownMenu.ItemTitle children={menu.title} />
                      <DropdownMenu.ItemIcon iosIconName={menu.icon} />
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Group>
              ))}

              {mAccount.map((mGroup, index) => (
                <DropdownMenu.Group key={index}>
                  {mGroup.map(menu => (
                    <DropdownMenu.Item key={menu.key} {...menu.item}>
                      <DropdownMenu.ItemTitle children={menu.title} />
                      <DropdownMenu.ItemIcon iosIconName={menu.icon} />
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Group>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        )
      }
    })
  }, [])

  const { data } = useAccountQuery({ id: account.id })

  const scrollY = useSharedValue(0)

  const [queryKey, setQueryKey] = useState<QueryKeyTimeline>([
    'Timeline',
    { page: 'Account_Default', account: account.id }
  ])
  const isFetchingTimeline = useIsFetching(queryKey)
  const fetchedTimeline = useRef(false)
  useEffect(() => {
    if (!isFetchingTimeline && !fetchedTimeline.current) {
      fetchedTimeline.current = true
    }
  }, [isFetchingTimeline, fetchedTimeline.current])

  const ListHeaderComponent = useMemo(() => {
    return (
      <>
        <View style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <AccountHeader account={data} />
          <AccountInformation account={data} />
          {!data?.suspended && fetchedTimeline.current ? (
            <AccountAttachments account={data} />
          ) : null}
        </View>
        {!data?.suspended ? (
          <SegmentedControl
            appearance={mode}
            values={[t('shared.account.toots.default'), t('shared.account.toots.all')]}
            selectedIndex={queryKey[1].page === 'Account_Default' ? 0 : 1}
            onChange={({ nativeEvent }) => {
              switch (nativeEvent.selectedSegmentIndex) {
                case 0:
                  setQueryKey([queryKey[0], { ...queryKey[1], page: 'Account_Default' }])
                  break
                case 1:
                  setQueryKey([queryKey[0], { ...queryKey[1], page: 'Account_All' }])
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
  }, [data, fetchedTimeline.current, queryKey[1].page, i18n.language, mode])

  return (
    <>
      <AccountNav scrollY={scrollY} account={data} />

      {data?.suspended ? (
        ListHeaderComponent
      ) : (
        <Timeline
          queryKey={queryKey}
          disableRefresh
          customProps={{
            renderItem: ({ item }) => <TimelineDefault item={item} queryKey={queryKey} />,
            onScroll: ({ nativeEvent }) => (scrollY.value = nativeEvent.contentOffset.y),
            ListHeaderComponent,
            maintainVisibleContentPosition: undefined
          }}
        />
      )}
    </>
  )
}

export default TabSharedAccount
