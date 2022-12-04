import { displayMessage } from '@components/Message'
import { QueryKeyTimeline, useTimelineMutation } from '@utils/queryHooks/timeline'
import { getInstanceUrl } from '@utils/slices/instancesSlice'
import { useTheme } from '@utils/styles/ThemeManager'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'
import { useQueryClient } from 'react-query'
import { useSelector } from 'react-redux'

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

  const { theme } = useTheme()
  const { t } = useTranslation('componentContextMenu')

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

  const menus: ContextMenu[][] = []

  const currentInstance = useSelector(getInstanceUrl)
  const instance = status.uri && status.uri.split(new RegExp(/\/\/(.*?)\//))[1]

  if (currentInstance !== instance && instance) {
    menus.push([
      {
        key: 'instance-block',
        item: {
          onSelect: () =>
            Alert.alert(
              t('instance.block.alert.title', { instance }),
              t('instance.block.alert.message'),
              [
                {
                  text: t('instance.block.alert.buttons.confirm'),
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
        title: t('instance.block.action', { instance }),
        icon: ''
      }
    ])
  }

  return menus
}

export default menuInstance
