import { HeaderRight } from '@components/Header'
import Timeline from '@components/Timeline'
import TimelineDefault from '@components/Timeline/Default'
import { TabMeStackScreenProps } from '@utils/navigation/navigators'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const TabMeList: React.FC<TabMeStackScreenProps<'Tab-Me-List'>> = ({
  navigation,
  route: { key, params }
}) => {
  const { t } = useTranslation('screenTabs')
  const queryKey: QueryKeyTimeline = ['Timeline', { page: 'List', list: params.id }]

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderRight
          accessibilityLabel={t('me.stacks.listEdit.name')}
          content='Edit'
          onPress={() =>
            navigation.navigate('Tab-Me-List-Edit', { type: 'edit', payload: params, key })
          }
        />
      )
    })
  }, [params])

  return (
    <Timeline
      queryKey={queryKey}
      customProps={{
        renderItem: ({ item }) => <TimelineDefault item={item} queryKey={queryKey} />
      }}
    />
  )
}

export default TabMeList
