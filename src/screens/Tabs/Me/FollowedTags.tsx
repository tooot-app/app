import Button from '@components/Button'
import haptics from '@components/haptics'
import ComponentHashtag from '@components/Hashtag'
import { displayMessage } from '@components/Message'
import ComponentSeparator from '@components/Separator'
import { TabMeStackScreenProps } from '@utils/navigation/navigators'
import { useFollowedTagsQuery, useTagsMutation } from '@utils/queryHooks/tags'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList } from 'react-native-gesture-handler'

const TabMeFollowedTags: React.FC<TabMeStackScreenProps<'Tab-Me-FollowedTags'>> = ({
  navigation
}) => {
  const { t } = useTranslation(['common', 'screenTabs'])

  const { data, fetchNextPage, refetch } = useFollowedTagsQuery()
  const flattenData = data?.pages ? data.pages.flatMap(page => [...page.body]) : []
  useEffect(() => {
    if (flattenData.length === 0) {
      navigation.goBack()
    }
  }, [flattenData.length])

  const mutation = useTagsMutation({
    onSuccess: () => {
      haptics('Light')
      refetch()
    },
    onError: (err: any, { to }) => {
      displayMessage({
        type: 'error',
        message: t('common:message.error.message', {
          function: to
            ? t('screenTabs:shared.hashtag.follow')
            : t('screenTabs:shared.hashtag.unfollow')
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

  return (
    <FlatList
      style={{ flex: 1 }}
      data={flattenData}
      renderItem={({ item }) => (
        <ComponentHashtag
          hashtag={item}
          onPress={() => {}}
          children={
            <Button
              type='text'
              content={t('screenTabs:shared.hashtag.unfollow')}
              onPress={() => mutation.mutate({ tag: item.name, to: !item.following })}
            />
          }
        />
      )}
      onEndReached={() => fetchNextPage()}
      onEndReachedThreshold={0.5}
      ItemSeparatorComponent={ComponentSeparator}
    />
  )
}

export default TabMeFollowedTags
