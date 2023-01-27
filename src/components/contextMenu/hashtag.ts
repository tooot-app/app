import haptics from '@components/haptics'
import { displayMessage } from '@components/Message'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useQueryClient } from '@tanstack/react-query'
import { featureCheck } from '@utils/helpers/featureCheck'
import { TabSharedStackParamList } from '@utils/navigation/navigators'
import { QueryKeyFollowedTags, useTagMutation, useTagQuery } from '@utils/queryHooks/tags'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { useTranslation } from 'react-i18next'

const menuHashtag = ({
  tag_name,
  queryKey
}: {
  tag_name: Mastodon.Tag['name']
  queryKey?: QueryKeyTimeline
}): ContextMenu => {
  const navigation =
    useNavigation<NativeStackNavigationProp<TabSharedStackParamList, any, undefined>>()
  const { t } = useTranslation(['common', 'componentContextMenu'])

  const canFollowTags = featureCheck('follow_tags')

  const queryClient = useQueryClient()

  const {
    data,
    isFetching: tagIsFetching,
    refetch: tagRefetch
  } = useTagQuery({ tag_name, options: { enabled: canFollowTags } })
  const tagMutation = useTagMutation({
    onSuccess: () => {
      haptics('Light')
      tagRefetch()
      const queryKeyFollowedTags: QueryKeyFollowedTags = ['FollowedTags']
      queryClient.invalidateQueries({ queryKey: queryKeyFollowedTags })
    },
    onError: (err: any, { to }) => {
      displayMessage({
        type: 'error',
        message: t('common:message.error.message', {
          function: t('componentContextMenu:hashtag.follow', {
            defaultValue: 'false',
            context: to.toString()
          })
        }),
        ...(err.status &&
          typeof err.status === 'number' &&
          err.data &&
          err.data.error &&
          typeof err.data.error === 'string' && {
            description: err.data.error
          })
      })
    }
  })

  const menus: ContextMenu = []

  menus.push([
    {
      type: 'item',
      key: 'hashtag-follow',
      props: {
        onSelect: () =>
          typeof data?.following === 'boolean' &&
          tagMutation.mutate({ tag_name, to: !data.following }),
        disabled: tagIsFetching,
        destructive: false,
        hidden: !canFollowTags
      },
      title: t('componentContextMenu:hashtag.follow.action', {
        defaultValue: 'false',
        context: (data?.following || false).toString()
      }),
      icon: data?.following ? 'rectangle.stack.badge.minus' : 'rectangle.stack.badge.plus'
    },
    {
      type: 'item',
      key: 'hashtag-filter',
      props: {
        onSelect: () => navigation.navigate('Tab-Shared-Filter', { source: 'hashtag', tag_name }),
        disabled: false,
        destructive: false,
        hidden: !canFollowTags
      },
      title: t('componentContextMenu:hashtag.filter.action'),
      icon: 'line.3.horizontal.decrease'
    }
  ])

  return menus
}

export default menuHashtag
