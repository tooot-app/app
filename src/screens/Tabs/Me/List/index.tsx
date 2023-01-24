import Icon from '@components/Icon'
import { displayMessage } from '@components/Message'
import Timeline from '@components/Timeline'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useQueryClient } from '@tanstack/react-query'
import { TabMeStackParamList } from '@utils/navigation/navigators'
import { QueryKeyLists, useListsMutation } from '@utils/queryHooks/lists'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import * as DropdownMenu from 'zeego/dropdown-menu'
import { menuListAccounts, menuListDelete, menuListEdit } from './menus'

const TabMeList: React.FC<NativeStackScreenProps<TabMeStackParamList, 'Tab-Me-List'>> = ({
  navigation,
  route: {
    key,
    params: { list }
  }
}) => {
  const { colors } = useTheme()
  const { t } = useTranslation(['common', 'screenTabs'])
  const queryKey: QueryKeyTimeline = ['Timeline', { page: 'List', list: list.id }]

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
    const listAccounts = menuListAccounts({ list })
    const listEdit = menuListEdit({ list, key })
    const listDelete = menuListDelete({ list, mutation })

    navigation.setOptions({
      headerRight: () => (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Icon
              name='more-horizontal'
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
    navigation.setParams({ queryKey })
  }, [list])

  return <Timeline queryKey={queryKey} />
}

export default TabMeList
