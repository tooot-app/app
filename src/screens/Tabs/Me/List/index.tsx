import Icon from '@components/Icon'
import { displayMessage } from '@components/Message'
import Timeline from '@components/Timeline'
import TimelineDefault from '@components/Timeline/Default'
import { useQueryClient } from '@tanstack/react-query'
import { TabMeStackScreenProps } from '@utils/navigation/navigators'
import { QueryKeyLists, useListsMutation } from '@utils/queryHooks/lists'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import * as DropdownMenu from 'zeego/dropdown-menu'
import { menuListAccounts, menuListDelete, menuListEdit } from './menus'

const TabMeList: React.FC<TabMeStackScreenProps<'Tab-Me-List'>> = ({
  navigation,
  route: { key, params }
}) => {
  const { colors } = useTheme()
  const { t } = useTranslation(['common', 'screenTabs'])
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
          function: t('screenTabs:me.listDelete.heading')
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
            {[listAccounts, listEdit, listDelete].map((menu, index) => (
              <DropdownMenu.Group key={index}>
                <DropdownMenu.Item key={menu.key} onSelect={menu.onSelect}>
                  <DropdownMenu.ItemTitle children={menu.title} />
                  <DropdownMenu.ItemIcon ios={{ name: menu.icon }} />
                </DropdownMenu.Item>
              </DropdownMenu.Group>
            ))}
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
