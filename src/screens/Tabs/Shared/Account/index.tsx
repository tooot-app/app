import menuAccount from '@components/contextMenu/account'
import menuShare from '@components/contextMenu/share'
import { HeaderLeft, HeaderRight } from '@components/Header'
import Icon from '@components/Icon'
import CustomText from '@components/Text'
import Timeline from '@components/Timeline'
import { TabSharedStackScreenProps } from '@utils/navigation/navigators'
import { queryClient } from '@utils/queryHooks'
import { useAccountQuery } from '@utils/queryHooks/account'
import { useRelationshipQuery } from '@utils/queryHooks/relationship'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { useAccountStorage } from '@utils/storage/actions'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { Fragment, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, Text, View } from 'react-native'
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
  const { t } = useTranslation(['common', 'screenTabs'])
  const { colors, mode } = useTheme()

  const { data, dataUpdatedAt, isFetched } = useAccountQuery({
    account,
    _local: true,
    options: {
      placeholderData: (account._remote
        ? { ...account, id: undefined }
        : account) as Mastodon.Account,
      onError: () => navigation.goBack()
    }
  })
  const { data: dataRelationship } = useRelationshipQuery({
    id: data?.id,
    options: { enabled: account._remote ? isFetched : true }
  })
  const queryKeyDefault: QueryKeyTimeline = [
    'Timeline',
    {
      page: 'Account',
      type: 'default',
      id: data?.id,
      ...(account._remote && { remote_id: account.id, remote_domain: account._remote })
    }
  ]

  const mShare = menuShare({ type: 'account', url: data?.url })
  const mAccount = menuAccount({ type: 'account', openChange: true, account: data })
  useEffect(() => {
    navigation.setOptions({
      headerTransparent: true,
      headerStyle: { backgroundColor: `rgba(255, 255, 255, 0)` },
      title: '',
      headerLeft: () => <HeaderLeft onPress={() => navigation.goBack()} background />,
      headerRight: () => {
        return (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <HeaderRight
                accessibilityLabel={t('screenTabs:shared.account.actions.accessibilityLabel', {
                  user: account.acct
                })}
                accessibilityHint={t('screenTabs:shared.account.actions.accessibilityHint')}
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

  const scrollY = useSharedValue(0)

  const [timelineSettings, setTimelineSettings] = useAccountStorage.object('page_account_timeline')
  const ListHeaderComponent = useMemo(() => {
    return (
      <>
        <View style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <AccountHeader />
          <AccountInformation />
          <AccountAttachments
            {...(account._remote && { remote_id: account.id, remote_domain: account._remote })}
          />
        </View>
        {!data?.suspended ? (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Pressable
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: StyleConstants.Spacing.XS,
                  paddingVertical: StyleConstants.Spacing.S,
                  paddingHorizontal: StyleConstants.Spacing.Global.PagePadding
                }}
              >
                <View style={{ flex: 1 }} />
                <View
                  style={{ flex: 1 }}
                  children={
                    <CustomText
                      style={{ color: colors.secondary, alignSelf: 'center' }}
                      children={t('screenTabs:shared.account.summary.statuses_count', {
                        count: data?.statuses_count || 0
                      })}
                    />
                  }
                />
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-end'
                  }}
                >
                  <Icon name='filter' color={colors.secondary} size={StyleConstants.Font.Size.M} />
                </View>
              </Pressable>
            </DropdownMenu.Trigger>

            <DropdownMenu.Content>
              <DropdownMenu.Group>
                <DropdownMenu.CheckboxItem
                  key='showBoosts'
                  value={
                    (
                      typeof timelineSettings?.excludeBoosts === 'boolean'
                        ? timelineSettings.excludeBoosts
                        : true
                    )
                      ? 'off'
                      : 'on'
                  }
                  onValueChange={() => {
                    setTimelineSettings({
                      ...timelineSettings,
                      excludeBoosts: !timelineSettings?.excludeBoosts
                    })
                    queryClient.refetchQueries(queryKeyDefault)
                  }}
                >
                  <DropdownMenu.ItemIndicator />
                  <DropdownMenu.ItemTitle
                    children={t('screenTabs:tabs.local.options.showBoosts')}
                  />
                </DropdownMenu.CheckboxItem>
                <DropdownMenu.CheckboxItem
                  key='showReplies'
                  value={
                    (
                      typeof timelineSettings?.excludeReplies === 'boolean'
                        ? timelineSettings.excludeReplies
                        : true
                    )
                      ? 'off'
                      : 'on'
                  }
                  onValueChange={() => {
                    setTimelineSettings({
                      ...timelineSettings,
                      excludeReplies: !timelineSettings?.excludeReplies
                    })
                    queryClient.refetchQueries(queryKeyDefault)
                  }}
                >
                  <DropdownMenu.ItemTitle
                    children={t('screenTabs:tabs.local.options.showReplies')}
                  />
                  <DropdownMenu.ItemIndicator />
                </DropdownMenu.CheckboxItem>
              </DropdownMenu.Group>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
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
              {t('screenTabs:shared.account.suspended')}
            </Text>
          </View>
        ) : null}
      </>
    )
  }, [timelineSettings, dataUpdatedAt, mode])

  const [domain] = useAccountStorage.string('auth.account.domain')

  return (
    <AccountContext.Provider
      value={{
        account: data,
        relationship: dataRelationship,
        localInstance: account?.acct?.includes('@')
          ? account?.acct?.includes(`@${domain}`)
          : !account?._remote
      }}
    >
      <AccountNav scrollY={scrollY} />

      {data?.suspended ? (
        ListHeaderComponent
      ) : (
        <Timeline
          queryKey={queryKeyDefault}
          disableRefresh
          customProps={{
            keyboardShouldPersistTaps: 'always',
            onScroll: ({ nativeEvent }) => (scrollY.value = nativeEvent.contentOffset.y),
            ListHeaderComponent,
            refreshing: false,
            onRefresh: () => queryClient.refetchQueries(queryKeyDefault)
          }}
        />
      )}
    </AccountContext.Provider>
  )
}

export default TabSharedAccount
