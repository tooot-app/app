import Button from '@components/Button'
import haptics from '@components/haptics'
import ComponentHashtag from '@components/Hashtag'
import { displayMessage } from '@components/Message'
import ComponentSeparator from '@components/Separator'
import { FlashList } from '@shopify/flash-list'
import { TabMeStackScreenProps } from '@utils/navigation/navigators'
import { useFollowedTagsQuery, useTagsMutation } from '@utils/queryHooks/tags'
import { flattenPages } from '@utils/queryHooks/utils'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const TabMeFollowedTags: React.FC<TabMeStackScreenProps<'Tab-Me-FollowedTags'>> = ({
  navigation
}) => {
  const { t } = useTranslation(['common', 'screenTabs'])

  const { data, fetchNextPage, refetch } = useFollowedTagsQuery()
  const flattenData = flattenPages(data)

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
    <FlashList
      estimatedItemSize={70}
      data={flattenData}
      renderItem={({ item }) => (
        <ComponentHashtag
          hashtag={item}
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
