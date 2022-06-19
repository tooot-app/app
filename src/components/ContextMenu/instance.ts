import analytics from '@components/analytics'
import { displayMessage } from '@components/Message'
import {
  QueryKeyTimeline,
  useTimelineMutation
} from '@utils/queryHooks/timeline'
import { getInstanceUrl } from '@utils/slices/instancesSlice'
import { useTheme } from '@utils/styles/ThemeManager'
import { useTranslation } from 'react-i18next'
import { Alert, Platform } from 'react-native'
import { ContextMenuAction } from 'react-native-context-menu-view'
import { useQueryClient } from 'react-query'
import { useSelector } from 'react-redux'

export interface Props {
  actions: ContextMenuAction[]
  status: Mastodon.Status
  queryKey: QueryKeyTimeline
  rootQueryKey?: QueryKeyTimeline
}

const contextMenuInstance = ({
  actions,
  status,
  queryKey,
  rootQueryKey
}: Props) => {
  const { t } = useTranslation('componentContextMenu')
  const { theme } = useTheme()

  const currentInstance = useSelector(getInstanceUrl)
  const instance = status?.uri && status.uri.split(new RegExp(/\/\/(.*?)\//))[1]

  const queryClient = useQueryClient()
  const mutation = useTimelineMutation({
    onSettled: () => {
      displayMessage({
        theme,
        type: 'success',
        message: t('common:message.success.message', {
          function: t(`instance.block.action`, { instance })
        })
      })
      queryClient.invalidateQueries(queryKey)
      rootQueryKey && queryClient.invalidateQueries(rootQueryKey)
    }
  })

  if (currentInstance !== instance && instance) {
    switch (Platform.OS) {
      case 'ios':
        actions.push({
          id: 'instance',
          title: t('instance.title'),
          actions: [
            {
              id: 'instance-block',
              title: t('instance.block.action', { instance }),
              destructive: true
            }
          ]
        })
        break
      default:
        actions.push({
          id: 'instance-block',
          title: t('instance.block.action', { instance }),
          destructive: true
        })
        break
    }
  }

  return (index: number) => {
    if (
      actions[index].id === 'instance-block' ||
      (actions[index].id === 'instance' &&
        actions[index].actions?.[0].id === 'instance-block')
    ) {
      analytics('timeline_shared_headeractions_domain_block_press', {
        page: queryKey[1].page
      })
      Alert.alert(
        t('instance.block.alert.title', { instance }),
        t('instance.block.alert.message'),
        [
          {
            text: t('instance.block.alert.buttons.confirm'),
            style: 'destructive',
            onPress: () => {
              analytics('timeline_shared_headeractions_domain_block_confirm', {
                page: queryKey && queryKey[1].page
              })
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
      )
    }
  }
}

export default contextMenuInstance
