import { Filter } from '@components/Filter'
import { HeaderLeft, HeaderRight } from '@components/Header'
import Icon from '@components/Icon'
import ComponentSeparator from '@components/Separator'
import apiInstance from '@utils/api/instance'
import { TabMePreferencesStackScreenProps } from '@utils/navigation/navigators'
import { useFiltersQuery } from '@utils/queryHooks/filters'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, View } from 'react-native'
import { SwipeListView } from 'react-native-swipe-list-view'

const TabMePreferencesFilters: React.FC<
  TabMePreferencesStackScreenProps<'Tab-Me-Preferences-Filters'>
> = ({ navigation }) => {
  const { colors } = useTheme()
  const { t } = useTranslation(['common', 'screenTabs'])

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <HeaderLeft
          content='chevron-left'
          onPress={() => navigation.navigate('Tab-Me-Preferences-Root')}
        />
      ),
      headerRight: () => (
        <HeaderRight
          content='plus'
          onPress={() => navigation.navigate('Tab-Me-Preferences-Filter', { type: 'add' })}
        />
      )
    })
  }, [])

  const { data, refetch } = useFiltersQuery<'v2'>({ version: 'v2' })

  return (
    <SwipeListView
      contentContainerStyle={{ padding: StyleConstants.Spacing.Global.PagePadding }}
      renderHiddenItem={({ item }) => (
        <Pressable
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'flex-end',
            backgroundColor: colors.red
          }}
          onPress={() => {
            apiInstance({ method: 'delete', version: 'v2', url: `filters/${item.id}` }).then(() =>
              refetch()
            )
          }}
        >
          <View style={{ paddingHorizontal: StyleConstants.Spacing.L }}>
            <Icon name='trash' color='white' size={StyleConstants.Font.Size.L} />
          </View>
        </Pressable>
      )}
      rightOpenValue={-(StyleConstants.Spacing.L * 2 + StyleConstants.Font.Size.L)}
      disableRightSwipe
      closeOnRowPress
      data={data?.sort(filter =>
        filter.expires_at ? new Date().getTime() - new Date(filter.expires_at).getTime() : 1
      )}
      renderItem={({ item: filter }) => (
        <Filter
          filter={filter}
          onPress={() => navigation.navigate('Tab-Me-Preferences-Filter', { type: 'edit', filter })}
        />
      )}
      ItemSeparatorComponent={ComponentSeparator}
    />
  )
}

export default TabMePreferencesFilters
