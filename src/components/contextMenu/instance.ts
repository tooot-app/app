import { displayMessage } from '@components/Message'
import { useQueryClient } from '@tanstack/react-query'
import { getHost } from '@utils/helpers/urlMatcher'
import { QueryKeyTimeline, useTimelineMutation } from '@utils/queryHooks/timeline'
import { getAccountStorage } from '@utils/storage/actions'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'

const menuInstance = ({
  status,
  queryKey,
  rootQueryKey
}: {
  status?: Mastodon.Status
  queryKey?: QueryKeyTimeline
  rootQueryKey?: QueryKeyTimeline
}): ContextMenu[][] => {
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
      rootQueryKey && queryClient.invalidateQueries(rootQueryKey)
    }
  })

  const menus: ContextMenu[][] = []

  const instance = getHost(status.uri)

  if (instance === getAccountStorage.string('auth.domain')) {
    menus.push([
      {
        key: 'instance-block',
        item: {
          onSelect: () =>
            Alert.alert(
              t('componentContextMenu:instance.block.alert.title', { instance }),
              t('componentContextMenu:instance.block.alert.message'),
              [
                {
                  text: t('common:buttons.confirm'),
                  style: 'destructive',
                  onPress: () => {
                    mutation.mutate({
                      type: 'domainBlock',
                      queryKey,
                      domain: instance
                    })
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
