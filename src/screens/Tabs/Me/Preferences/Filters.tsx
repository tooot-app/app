import { Filter } from '@components/Filter'
import { HeaderLeft, HeaderRight } from '@components/Header'
import { SwipeToActions } from '@components/SwipeToActions'
import apiInstance from '@utils/api/instance'
import { TabMePreferencesStackScreenProps } from '@utils/navigation/navigators'
import { useFiltersQuery } from '@utils/queryHooks/filters'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useEffect } from 'react'

const TabMePreferencesFilters: React.FC<
  TabMePreferencesStackScreenProps<'Tab-Me-Preferences-Filters'>
> = ({ navigation }) => {
  const { colors } = useTheme()

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
    <SwipeToActions
      actions={[
        {
          onPress: ({ item }) => {
            apiInstance({ method: 'delete', version: 'v2', url: `filters/${item.id}` }).then(() =>
              refetch()
            )
          },
          color: colors.red,
          icon: 'trash'
        }
      ]}
      data={data?.sort(filter =>
        filter.expires_at ? new Date().getTime() - new Date(filter.expires_at).getTime() : 1
      )}
      renderItem={({ item: filter }) => (
        <Filter
          style={{
            padding: StyleConstants.Spacing.Global.PagePadding,
            paddingVertical: StyleConstants.Spacing.M
          }}
          filter={filter}
          onPress={() => navigation.navigate('Tab-Me-Preferences-Filter', { type: 'edit', filter })}
        />
      )}
    />
  )
}

export default TabMePreferencesFilters
