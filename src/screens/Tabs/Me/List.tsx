import Icon from '@components/Icon'
import { displayMessage } from '@components/Message'
import Timeline from '@components/Timeline'
import TimelineDefault from '@components/Timeline/Default'
import { TabMeStackScreenProps } from '@utils/navigation/navigators'
import { QueryKeyLists, useListsMutation } from '@utils/queryHooks/lists'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'
import { useQueryClient } from 'react-query'
import * as DropdownMenu from 'zeego/dropdown-menu'

const TabMeList: React.FC<TabMeStackScreenProps<'Tab-Me-List'>> = ({
  navigation,
  route: { key, params }
}) => {
  const { colors, theme } = useTheme()
  const { t } = useTranslation('screenTabs')
  const queryKey: QueryKeyTimeline = ['Timeline', { page: 'List', list: params.id }]

  const queryKeyLists: QueryKeyLists = ['Lists']
  const queryClient = useQueryClient()
  const mutation = useListsMutation({
    onSuccess: () => {
      queryClient.refetchQueries(queryKeyLists)
      navigation.pop(1)
    },
    onError: () => {
      displayMessage({
        theme,
        type: 'error',
        message: t('common:message.error.message', {
          function: t('me.listDelete.heading')
        })
      })
    }
  })

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Icon
              name='MoreHorizontal'
              size={StyleConstants.Spacing.M * 1.25}
              color={colors.primaryDefault}
            />
          </DropdownMenu.Trigger>

          <DropdownMenu.Content>
            <DropdownMenu.Item
              key='list-edit'
              onSelect={() =>
                navigation.navigate('Tab-Me-List-Edit', {
                  type: 'edit',
                  payload: params,
                  key
                })
              }
            >
              <DropdownMenu.ItemTitle children={t('me.stacks.listEdit.name')} />
              <DropdownMenu.ItemIcon iosIconName='square.and.pencil' />
            </DropdownMenu.Item>

            <DropdownMenu.Item
              key='list-delete'
              destructive
              onSelect={() =>
                Alert.alert(
                  t('me.listDelete.confirm.title', { list: params.title.slice(0, 6) }),
                  t('me.listDelete.confirm.message'),
                  [
                    {
                      text: t('common:buttons.delete'),
                      style: 'destructive',
                      onPress: () => mutation.mutate({ type: 'delete', payload: params })
                    },
                    { text: t('common:buttons.cancel') }
                  ]
                )
              }
            >
              <DropdownMenu.ItemTitle children={t('me.listDelete.heading')} />
              <DropdownMenu.ItemIcon iosIconName='trash' />
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
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
