import Button from '@components/Button'
import { HeaderLeft, HeaderRight } from '@components/Header'
import Icon from '@components/Icon'
import CustomText from '@components/Text'
import Timeline from '@components/Timeline'
import SegmentedControl from '@react-native-segmented-control/segmented-control'
import { useScrollToTop } from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import apiGeneral from '@utils/api/general'
import { TabPublicStackParamList } from '@utils/navigation/navigators'
import { useInstanceQuery } from '@utils/queryHooks/instance'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { getGlobalStorage, setGlobalStorage, useGlobalStorage } from '@utils/storage/actions'
import { StorageGlobal } from '@utils/storage/global'
import { StyleConstants } from '@utils/styles/constants'
import layoutAnimation from '@utils/styles/layoutAnimation'
import { isLargeDevice } from '@utils/styles/scaling'
import { useTheme } from '@utils/styles/ThemeManager'
import { debounce } from 'lodash'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dimensions, FlatList, Platform, Pressable, TextInput, View } from 'react-native'
import { SceneMap, TabView } from 'react-native-tab-view'
import { Placeholder, PlaceholderLine } from 'rn-placeholder'
import * as DropdownMenu from 'zeego/dropdown-menu'

const Explore = ({ route: { key: page } }: { route: { key: 'Explore' } }) => {
  const { t } = useTranslation(['common', 'componentInstance', 'screenTabs'])
  const { colors, mode } = useTheme()

  const [addingRemote, setAddingRemote] = useState(false)
  const [domain, setDomain] = useState<string>('')
  const [domainValid, setDomainValid] = useState<boolean>()
  const instanceQuery = useInstanceQuery({
    domain,
    options: {
      enabled: false,
      retry: false,
      keepPreviousData: false,
      cacheTime: 1000 * 30,
      onSuccess: () =>
        apiGeneral<Mastodon.Status[]>({
          method: 'get',
          domain: domain,
          url: 'api/v1/timelines/public',
          params: { local: 'true', limit: 1 }
        })
          .then(({ body }) => {
            if (Array.isArray(body)) {
              setDomainValid(true)
            } else {
              setDomainValid(false)
            }
          })
          .catch(() => setDomainValid(false))
    }
  })
  const debounceFetch = useCallback(
    debounce(() => {
      instanceQuery.refetch()
    }, 1000),
    []
  )

  const [accountActive] = useGlobalStorage.string('account.active')
  const [remoteActive, setRemoteActive] = useGlobalStorage.string('remote.active')
  const [remotes, setRemotes] = useGlobalStorage.object('remotes')

  const flRef = useRef<FlatList>(null)
  const queryKey: QueryKeyTimeline = [
    'Timeline',
    { page, ...(remoteActive && { domain: remoteActive }) }
  ]

  const info = ({
    heading,
    content,
    lines,
    potentialWidth = 6
  }: {
    heading: string
    content?: string
    lines?: number
    potentialWidth?: number
  }) => (
    <View style={{ flex: 1, marginTop: StyleConstants.Spacing.M }} accessible>
      <CustomText
        fontStyle='S'
        style={{
          marginBottom: StyleConstants.Spacing.XS,
          color: colors.primaryDefault
        }}
        fontWeight='Bold'
        children={heading}
      />
      {content ? (
        <CustomText
          fontStyle='M'
          style={{ color: colors.primaryDefault }}
          children={content}
          numberOfLines={lines}
        />
      ) : (
        Array.from({ length: lines || 1 }).map((_, index) => (
          <PlaceholderLine
            key={index}
            width={potentialWidth ? potentialWidth * StyleConstants.Font.Size.M : undefined}
            height={StyleConstants.Font.LineHeight.M}
            color={colors.shimmerDefault}
            noMargin
            style={{ borderRadius: 0 }}
          />
        ))
      )}
    </View>
  )

  useScrollToTop(flRef)

  return (
    <Timeline
      flRef={flRef}
      queryKey={queryKey}
      disableRefresh={!remoteActive}
      refreshAutoRefetch={false}
      customProps={{
        stickyHeaderIndices: [0],
        stickyHeaderHiddenOnScroll: true,
        ListHeaderComponent: (
          <View
            style={{ backgroundColor: colors.backgroundDefault }}
            children={
              addingRemote ? (
                <View
                  style={{
                    paddingHorizontal: StyleConstants.Spacing.Global.PagePadding,
                    marginTop: StyleConstants.Spacing.S,
                    borderWidth: 1,
                    borderRadius: StyleConstants.BorderRadius,
                    marginHorizontal: StyleConstants.Spacing.Global.PagePadding,
                    borderColor: colors.border
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingVertical: StyleConstants.Spacing.XS
                    }}
                  >
                    <HeaderLeft
                      onPress={() => {
                        setDomain('')
                        setAddingRemote(false)
                        layoutAnimation().then(() =>
                          flRef.current?.scrollToOffset({ animated: true, offset: 0 })
                        )
                      }}
                    />
                    <CustomText
                      fontSize='M'
                      fontWeight='Bold'
                      style={{ color: colors.primaryDefault }}
                      children={t('screenTabs:tabs.public.exploring.followRemote')}
                    />
                    <HeaderRight type='text' content='' onPress={() => {}} />
                  </View>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}
                  >
                    <TextInput
                      accessible={false}
                      accessibilityRole='none'
                      style={{
                        borderBottomWidth: 1,
                        ...StyleConstants.FontStyle.M,
                        color: colors.primaryDefault,
                        borderBottomColor:
                          instanceQuery.isError ||
                          (!!domain.length && instanceQuery.isFetched && domainValid === false)
                            ? colors.red
                            : colors.border,
                        paddingVertical: StyleConstants.Spacing.S,
                        ...(Platform.OS === 'android' && { paddingRight: 0 })
                      }}
                      editable={false}
                      defaultValue='https://'
                    />
                    <TextInput
                      style={{
                        flex: 1,
                        borderBottomWidth: 1,
                        marginRight: StyleConstants.Spacing.M,
                        ...StyleConstants.FontStyle.M,
                        color: colors.primaryDefault,
                        borderBottomColor:
                          instanceQuery.isError ||
                          (!!domain.length && instanceQuery.isFetched && domainValid === false)
                            ? colors.red
                            : colors.border,
                        paddingVertical: StyleConstants.Spacing.S,
                        ...(Platform.OS === 'android' && { paddingLeft: 0 })
                      }}
                      value={domain}
                      onChangeText={text => {
                        setDomain(text.replace(/^http(s)?\:\/\//i, ''))
                        setDomainValid(undefined)
                        debounceFetch()
                      }}
                      autoCapitalize='none'
                      clearButtonMode='never'
                      keyboardType='url'
                      textContentType='URL'
                      onSubmitEditing={() => instanceQuery.refetch()}
                      placeholder={' ' + t('componentInstance:server.textInput.placeholder')}
                      placeholderTextColor={colors.secondary}
                      returnKeyType='go'
                      keyboardAppearance={mode}
                      autoCorrect={false}
                      spellCheck={false}
                      autoFocus
                    />
                    <Button
                      type='text'
                      content={t('common:buttons.add')}
                      loading={instanceQuery.isFetching}
                      disabled={
                        !!domain.length
                          ? domainValid === false ||
                            accountActive === domain ||
                            !!remotes?.find(r => r.domain === domain)
                          : true
                      }
                      onPress={() => {
                        setRemotes([
                          ...(remotes || []),
                          {
                            title:
                              instanceQuery.data?.title ||
                              t('screenTabs:tabs.public.exploring.noTitle'),
                            domain
                          }
                        ])
                        setRemoteActive(domain)
                        setAddingRemote(false)
                        layoutAnimation().then(() =>
                          flRef.current?.scrollToOffset({ animated: true, offset: 0 })
                        )
                      }}
                    />
                  </View>
                  <Placeholder style={{ marginBottom: StyleConstants.Spacing.M }}>
                    {info({
                      heading: t('componentInstance:server.information.name'),
                      content: !!domain.length ? instanceQuery.data?.title : undefined,
                      potentialWidth: 2
                    })}
                    {info({
                      heading: t('componentInstance:server.information.description'),
                      content: !!domain.length
                        ? (instanceQuery.data as Mastodon.Instance_V1)?.short_description ||
                          instanceQuery.data?.description
                        : undefined,
                      lines: isLargeDevice ? 1 : 2
                    })}
                  </Placeholder>
                </View>
              ) : (
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger>
                    <Pressable
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: StyleConstants.Spacing.XS,
                        paddingTop: StyleConstants.Spacing.S,
                        paddingBottom: StyleConstants.Spacing.M
                      }}
                    >
                      <CustomText
                        fontSize='S'
                        style={{ color: colors.secondary }}
                        children={t('screenTabs:tabs.public.exploring.heading')}
                      />
                      <CustomText
                        fontSize='S'
                        style={{ color: colors.primaryDefault }}
                        children={
                          !remoteActive
                            ? t('screenTabs:tabs.public.exploring.trending').toLocaleLowerCase()
                            : remotes?.find(r => r.domain === remoteActive)?.title
                        }
                      />
                      <Icon
                        name='chevron-down'
                        color={colors.primaryDefault}
                        size={StyleConstants.Font.Size.M}
                      />
                    </Pressable>
                  </DropdownMenu.Trigger>

                  <DropdownMenu.Content>
                    <DropdownMenu.Group>
                      <DropdownMenu.CheckboxItem
                        key={`explore_trending`}
                        value={!remoteActive ? 'on' : 'off'}
                        onValueChange={next => {
                          if (next === 'on') {
                            setRemoteActive(undefined)
                          }
                        }}
                      >
                        <DropdownMenu.ItemIndicator />
                        <DropdownMenu.ItemTitle
                          children={t('screenTabs:tabs.public.exploring.trending')}
                        />
                      </DropdownMenu.CheckboxItem>
                    </DropdownMenu.Group>
                    <DropdownMenu.Group>
                      {remotes?.map((item: NonNullable<StorageGlobal['remotes']>[0], index) => (
                        <DropdownMenu.CheckboxItem
                          key={`explore_${index}`}
                          value={
                            index === remotes?.findIndex(r => r.domain === remoteActive)
                              ? 'on'
                              : 'off'
                          }
                          onValueChange={next => {
                            if (next === 'on') {
                              setRemoteActive(item.domain)
                            } else if (next === 'off') {
                              const nextRemotes = remotes?.filter(r => r.domain !== item.domain)
                              setRemotes(nextRemotes)
                              setRemoteActive(nextRemotes.at(-1)?.domain)
                            }
                          }}
                        >
                          <DropdownMenu.ItemIndicator />
                          <DropdownMenu.ItemTitle children={item.title} />
                          <DropdownMenu.ItemSubtitle children={item.domain} />
                          {index === remotes?.findIndex(r => r.domain === remoteActive) ? (
                            <DropdownMenu.ItemIcon ios={{ name: 'trash' }} />
                          ) : null}
                        </DropdownMenu.CheckboxItem>
                      ))}
                      <DropdownMenu.Item
                        key='explore_add'
                        onSelect={() => {
                          setDomain('')
                          setAddingRemote(true)
                          layoutAnimation().then(() =>
                            flRef.current?.scrollToOffset({ animated: true, offset: 0 })
                          )
                        }}
                      >
                        <DropdownMenu.ItemTitle
                          children={t('screenTabs:tabs.public.exploring.followRemote')}
                        />
                        <DropdownMenu.ItemIcon ios={{ name: 'plus' }} />
                      </DropdownMenu.Item>
                    </DropdownMenu.Group>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              )
            }
          />
        )
      }}
    />
  )
}

const Route = ({ route: { key: page } }: { route: { key: any } }) => {
  const queryKey: QueryKeyTimeline = ['Timeline', { page }]
  return <Timeline queryKey={queryKey} />
}

const renderScene = SceneMap({
  Local: Route,
  LocalPublic: Route,
  Explore
})

const Root: React.FC<NativeStackScreenProps<TabPublicStackParamList, 'Tab-Public-Root'>> = ({
  navigation
}) => {
  const { mode } = useTheme()
  const { t } = useTranslation('screenTabs')

  const segments: StorageGlobal['app.prev_public_segment'][] = ['Local', 'LocalPublic', 'Explore']
  const [segment, setSegment] = useState<number>(
    Math.max(
      0,
      segments.findIndex(segment => segment === getGlobalStorage.string('app.prev_public_segment'))
    )
  )
  const [routes] = useState([
    { key: 'Local', title: t('tabs.public.segments.local') },
    { key: 'LocalPublic', title: t('tabs.public.segments.federated') },
    { key: 'Explore', title: t('tabs.public.segments.explore') }
  ])
  const [remoteActive] = useGlobalStorage.string('remote.active')
  useEffect(() => {
    const page = segments[segment]
    page &&
      navigation.setParams({
        queryKey: [
          'Timeline',
          { page, ...(page === 'Explore' && remoteActive && { domain: remoteActive }) }
        ]
      })
  }, [segment, remoteActive])

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        // @ts-ignore
        <SegmentedControl
          appearance={mode}
          values={routes.map(({ title }) => title)}
          selectedIndex={segment}
          onChange={({ nativeEvent }: any) => {
            setSegment(nativeEvent.selectedSegmentIndex)
            setGlobalStorage('app.prev_public_segment', segments[nativeEvent.selectedSegmentIndex])
          }}
          style={{ flexBasis: '65%' }}
        />
      ),
      headerRight: () => (
        <HeaderRight
          accessibilityLabel={t('common.search.accessibilityLabel')}
          accessibilityHint={t('common.search.accessibilityHint')}
          content='search'
          onPress={() => navigation.navigate('Tab-Shared-Search')}
        />
      )
    })
  }, [mode, segment])

  return (
    <TabView
      lazy
      swipeEnabled
      renderScene={renderScene}
      renderTabBar={() => null}
      onIndexChange={index => {
        setSegment(index)
        setGlobalStorage('app.prev_public_segment', segments[index])
      }}
      navigationState={{ index: segment, routes }}
      initialLayout={{ width: Dimensions.get('window').width }}
    />
  )
}

export default Root
