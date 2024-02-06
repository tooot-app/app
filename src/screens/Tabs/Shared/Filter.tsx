import Button from '@components/Button'
import { Filter } from '@components/Filter'
import Hr from '@components/Hr'
import CustomText from '@components/Text'
import { featureCheck } from '@utils/helpers/featureCheck'
import { TabSharedStackScreenProps, useNavState } from '@utils/navigation/navigators'
import { useFilterMutation, useFiltersQuery } from '@utils/queryHooks/filters'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { SectionList, View } from 'react-native'

const TabSharedFilter: React.FC<TabSharedStackScreenProps<'Tab-Shared-Filter'>> = ({
  navigation,
  route: { params }
}) => {
  if (!featureCheck('filter_server_side')) {
    navigation.goBack()
    return null
  }

  const { colors } = useTheme()
  const { t } = useTranslation(['common', 'screenTabs'])

  const { data, isFetching, refetch } = useFiltersQuery<'v2'>({ version: 'v2' })
  const sections = [
    {
      id: 'add',
      data:
        data?.filter(filter => {
          switch (params.source) {
            case 'hashtag':
              return !filter.keywords.find(keyword => keyword.keyword === `#${params.tag_name}`)
            case 'status':
              return !filter.statuses.find(({ status_id }) => status_id === params.status.id)
          }
        }) || []
    },
    {
      id: 'remove',
      title: t('screenTabs:shared.filter.existed'),
      data:
        data?.filter(filter => {
          switch (params.source) {
            case 'hashtag':
              return !!filter.keywords.find(keyword => keyword.keyword === `#${params.tag_name}`)
            case 'status':
              return !!filter.statuses.find(({ status_id }) => status_id === params.status.id)
          }
        }) || []
    }
  ]

  const mutation = useFilterMutation()

  const navState = useNavState()

  return (
    <SectionList
      contentContainerStyle={{ padding: StyleConstants.Spacing.Global.PagePadding }}
      sections={sections}
      SectionSeparatorComponent={props =>
        props.leadingItem && props.trailingSection ? (
          <View style={{ height: StyleConstants.Spacing.XL }} />
        ) : null
      }
      renderSectionHeader={({ section: { title, data } }) =>
        title && data.length ? (
          <CustomText fontStyle='S' style={{ color: colors.secondary }} children={title} />
        ) : null
      }
      ItemSeparatorComponent={Hr}
      renderItem={({ item, section }) => (
        <Filter
          filter={item}
          button={
            <Button
              type='icon'
              content={section.id === 'add' ? 'plus' : 'minus'}
              round
              disabled={isFetching}
              onPress={() => {
                if (section.id === 'add' || section.id === 'remove') {
                  switch (params.source) {
                    case 'status':
                      mutation
                        .mutateAsync({
                          source: 'status',
                          filter: item,
                          action: section.id,
                          status: params.status
                        })
                        .then(() => refetch())
                      break
                    case 'hashtag':
                      mutation
                        .mutateAsync({
                          source: 'keyword',
                          filter: item,
                          action: section.id,
                          keyword: `#${params.tag_name}`
                        })
                        .then(() => refetch())
                      break
                  }
                }
              }}
            />
          }
          onPress={() => {}}
        />
      )}
    />
  )
}

export default TabSharedFilter
