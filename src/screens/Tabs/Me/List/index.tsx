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
import { useQueryClient } from 'react-query'
import * as DropdownMenu from 'zeego/dropdown-menu'
import { menuListAccounts, menuListDelete, menuListEdit } from './menus'

const TabMeList: React.FC<TabMeStackScreenProps<'Tab-Me-List'>> = ({
  navigation,
  route: { key, params }
}) => {
  const { colors } = useTheme()
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
        type: 'danger',
        message: t('common:message.error.message', {
          function: t('me.listDelete.heading')
        })
      })
    }
  })

  useEffect(() => {
    const listAccounts = menuListAccounts({ params })
    const listEdit = menuListEdit({ params, key })
    const listDelete = menuListDelete({ params, mutation })

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
            <DropdownMenu.Group>
              <DropdownMenu.Item key={listAccounts.key} onSelect={listAccounts.onSelect}>
                <DropdownMenu.ItemTitle children={listAccounts.title} />
                <DropdownMenu.ItemIcon iosIconName={listAccounts.icon} />
              </DropdownMenu.Item>
            </DropdownMenu.Group>

            <DropdownMenu.Group>
              <DropdownMenu.Item key={listEdit.key} onSelect={listEdit.onSelect}>
                <DropdownMenu.ItemTitle children={listEdit.title} />
                <DropdownMenu.ItemIcon iosIconName={listEdit.icon} />
              </DropdownMenu.Item>

              <DropdownMenu.Item key={listDelete.key} destructive onSelect={listDelete.onSelect}>
                <DropdownMenu.ItemTitle children={listDelete.title} />
                <DropdownMenu.ItemIcon iosIconName={listDelete.icon} />
              </DropdownMenu.Item>
            </DropdownMenu.Group>
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
