import haptics from '@components/haptics'
import { HeaderLeft, HeaderRight } from '@components/Header'
import { displayMessage } from '@components/Message'
import Timeline from '@components/Timeline'
import TimelineDefault from '@components/Timeline/Default'
import { TabSharedStackScreenProps } from '@utils/navigation/navigators'
import { useTagsMutation, useTagsQuery } from '@utils/queryHooks/tags'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { checkInstanceFeature } from '@utils/slices/instancesSlice'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

const TabSharedHashtag: React.FC<TabSharedStackScreenProps<'Tab-Shared-Hashtag'>> = ({
  navigation,
  route: {
    params: { hashtag }
  }
}) => {
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => <HeaderLeft onPress={() => navigation.goBack()} />,
      title: `#${decodeURIComponent(hashtag)}`
    })
  }, [])

  const queryKey: QueryKeyTimeline = ['Timeline', { page: 'Hashtag', hashtag }]

  const { theme } = useTheme()
  const { t } = useTranslation('screenTabs')

  const canFollowTags = useSelector(checkInstanceFeature('follow_tags'))
  const { data, isFetching, refetch } = useTagsQuery({
    tag: hashtag,
    options: { enabled: canFollowTags }
  })
  const mutation = useTagsMutation({
    onSuccess: () => {
      haptics('Success')
      refetch()
    },
    onError: (err: any, { to }) => {
      displayMessage({
        theme,
        type: 'error',
        message: t('common:message.error.message', {
          function: to ? t('shared.hashtag.follow') : t('shared.hashtag.unfollow')
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
  useEffect(() => {
    if (!canFollowTags) return

    navigation.setOptions({
      headerRight: () => (
        <HeaderRight
          loading={isFetching || mutation.isLoading}
          type='text'
          content={data?.following ? t('shared.hashtag.unfollow') : t('shared.hashtag.follow')}
          onPress={() =>
            typeof data?.following === 'boolean' &&
            mutation.mutate({ tag: hashtag, type: 'follow', to: !data.following })
          }
        />
      )
    })
  }, [canFollowTags, data?.following, isFetching])

  return (
    <Timeline
      queryKey={queryKey}
      customProps={{
        renderItem: ({ item }) => <TimelineDefault item={item} queryKey={queryKey} />
      }}
    />
  )
}

export default TabSharedHashtag
