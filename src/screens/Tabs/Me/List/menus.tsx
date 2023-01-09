import { UseMutationResult } from '@tanstack/react-query'
import navigationRef from '@utils/navigation/navigationRef'
import i18next from 'i18next'
import { Alert } from 'react-native'

export const menuListAccounts = ({ list }: { list: Mastodon.List }) => ({
  key: 'list-accounts',
  onSelect: () => navigationRef.navigate<any>('Tab-Me-List-Accounts', list),
  title: i18next.t('screenTabs:me.listAccounts.heading'),
  icon: 'person.crop.circle.fill.badge.checkmark'
})

export const menuListEdit = ({ list, key }: { list: Mastodon.List; key: string }) => ({
  key: 'list-edit',
  onSelect: () =>
    navigationRef.navigate<any>('Tab-Me-List-Edit', {
      type: 'edit',
      payload: list,
      key
    }),
  title: i18next.t('screenTabs:me.listEdit.heading'),
  icon: 'square.and.pencil'
})

export const menuListDelete = ({
  list,
  mutation
}: {
  list: Mastodon.List
  mutation: UseMutationResult<any, any, unknown, unknown>
}) => ({
  key: 'list-delete',
  onSelect: () =>
    Alert.alert(
      i18next.t('screenTabs:me.listDelete.confirm.title', { list: list.title.slice(0, 20) }),
      i18next.t('screenTabs:me.listDelete.confirm.message'),
      [
        {
          text: i18next.t('common:buttons.delete'),
          style: 'destructive',
          onPress: () => mutation.mutate({ type: 'delete', payload: list })
        },
        { text: i18next.t('common:buttons.cancel') }
      ]
    ),
  title: i18next.t('screenTabs:me.listDelete.heading'),
  icon: 'trash'
})
