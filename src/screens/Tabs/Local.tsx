import analytics from '@components/analytics'
import { HeaderCenter, HeaderRight } from '@components/Header'
import Icon from '@components/Icon'
import CustomText from '@components/Text'
import Timeline from '@components/Timeline'
import TimelineDefault from '@components/Timeline/Default'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import {
  ScreenTabsScreenProps,
  TabLocalStackParamList
} from '@utils/navigation/navigators'
import { useListsQuery } from '@utils/queryHooks/lists'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { StyleConstants } from '@utils/styles/constants'
import layoutAnimation from '@utils/styles/layoutAnimation'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import TabSharedRoot from './Shared/Root'

const Stack = createNativeStackNavigator<TabLocalStackParamList>()

const TabLocal = React.memo(
  ({ navigation }: ScreenTabsScreenProps<'Tab-Local'>) => {
    const { colors } = useTheme()
    const { t } = useTranslation('screenTabs')

    const { data: lists } = useListsQuery({})
    const [listsShown, setListsShown] = useState(false)
    useEffect(() => {
      layoutAnimation()
    }, [listsShown])

    const [queryKey, setQueryKey] = useState<QueryKeyTimeline>([
      'Timeline',
      { page: 'Following' }
    ])

    return (
      <Stack.Navigator screenOptions={{ headerShadowVisible: false }}>
        <Stack.Screen
          name='Tab-Local-Root'
          options={{
            headerTitle: () => (
              <HeaderCenter
                onPress={() => {
                  if (lists?.length) {
                    setListsShown(!listsShown)
                  }
                }}
                content={
                  <>
                    <Text>{t('tabs.local.name')}</Text>
                    {lists?.length ? (
                      <Icon
                        name='ChevronDown'
                        size={StyleConstants.Font.Size.M}
                        color={colors.primaryDefault}
                        style={{ marginLeft: StyleConstants.Spacing.S }}
                        strokeWidth={3}
                      />
                    ) : null}
                  </>
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
            <>
              <Timeline
                queryKey={queryKey}
                lookback='Following'
                customProps={{
                  renderItem: ({ item }) => (
                    <TimelineDefault item={item} queryKey={queryKey} />
                  )
                }}
              />
              {listsShown ? (
                <View
                  style={{
                    position: 'absolute',
                    backgroundColor: colors.backgroundDefault,
                    width: '100%',
                    paddingVertical: StyleConstants.Spacing.S
                  }}
                >
                  <Pressable
                    style={{
                      padding: StyleConstants.Spacing.S * 1.5,
                      borderColor: colors.border,
                      borderTopWidth: StyleSheet.hairlineWidth,
                      borderBottomWidth: StyleSheet.hairlineWidth
                    }}
                    onPress={() => {
                      setQueryKey(['Timeline', { page: 'Following' }])
                      setListsShown(!listsShown)
                    }}
                  >
                    <CustomText fontSize='M' style={{ textAlign: 'center' }}>
                      Default
                    </CustomText>
                  </Pressable>
                  {lists?.map(list => (
                    <Pressable
                      style={{
                        padding: StyleConstants.Spacing.S,
                        borderColor: colors.border,
                        borderBottomWidth: StyleSheet.hairlineWidth
                      }}
                      onPress={() => {
                        setQueryKey([
                          'Timeline',
                          { page: 'List', list: list.id }
                        ])
                        setListsShown(!listsShown)
                      }}
                    >
                      <CustomText
                        key={list.id}
                        fontSize='M'
                        style={{ textAlign: 'center' }}
                      >
                        {list.title}
                      </CustomText>
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </>
          )}
        />
        {TabSharedRoot({ Stack })}
      </Stack.Navigator>
    )
  },
  () => true
)

export default TabLocal
