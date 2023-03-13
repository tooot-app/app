import { displayMessage } from '@components/Message'
import { useQueryClient } from '@tanstack/react-query'
import { QueryKeyTimeline, useTimelineMutation } from '@utils/queryHooks/timeline'
import { getAccountStorage } from '@utils/storage/actions'
import * as Linking from 'expo-linking'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'

const menuInstance = ({
  status,
  queryKey
}: {
  status?: Mastodon.Status
  queryKey?: QueryKeyTimeline
}): ContextMenu => {
  if (!status || !queryKey) return []

  const { t } = useTranslation(['common', 'componentContextMenu'])

  const queryClient = useQueryClient()
  const mutation = useTimelineMutation({
    onSettled: () => {
      displayMessage({
        type: 'success',
        message: t('common:message.success.message', {
          function: t(`componentContextMenu:instance.block.action`, { instance })
        })
      })
      queryClient.invalidateQueries(queryKey)
    }
  })

  const menus: ContextMenu = []

  const instance = Linking.parse(status.uri).hostname

  if (instance && instance !== getAccountStorage.string('auth.domain')) {
    menus.push([
      {
        type: 'item',
        key: 'instance-block',
        props: {
          onSelect: () =>
            Alert.alert(
              t('componentContextMenu:instance.block.alert.title', { instance }),
              t('componentContextMenu:instance.block.alert.message'),
              [
                {
                  text: t('common:buttons.confirm'),
                  style: 'destructive',
                  onPress: () => {
                    mutation.mutate({ type: 'domainBlock', domain: instance })
                  }
                },
                {
                  text: t('common:buttons.cancel')
                }
              ]
            ),
          disabled: false,
          destructive: true,
          hidden: false
        },
        title: t('componentContextMenu:instance.block.action', { instance }),
        icon: ''
      }
    ])
  }

  return menus
}

export default menuInstance
