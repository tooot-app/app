import Button from '@components/Button'
import haptics from '@components/haptics'
import ComponentHashtag from '@components/Hashtag'
import { displayMessage } from '@components/Message'
import ComponentSeparator from '@components/Separator'
import { TabMeStackScreenProps } from '@utils/navigation/navigators'
import { useFollowedTagsQuery, useTagMutation } from '@utils/queryHooks/tags'
import { flattenPages } from '@utils/queryHooks/utils'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList } from 'react-native-gesture-handler'

const TabMeFollowedTags: React.FC<TabMeStackScreenProps<'Tab-Me-FollowedTags'>> = ({
  navigation
}) => {
  const { t } = useTranslation(['common', 'screenTabs', 'componentContextMenu'])

  const { data, fetchNextPage, refetch } = useFollowedTagsQuery()
  const flattenData = flattenPages(data)

  useEffect(() => {
    if (flattenData.length === 0) {
      navigation.goBack()
    }
  }, [flattenData.length])

  const mutation = useTagMutation({
    onSuccess: () => {
      haptics('Light')
      refetch()
    },
    onError: (err: any, { to }) => {
      displayMessage({
        type: 'error',
        message: t('common:message.error.message', {
          function: t('componentContextMenu:hashtag.follow.action', {
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

  return (
    <FlatList
      style={{ flex: 1 }}
      data={flattenData}
      renderItem={({ item }) => (
        <ComponentHashtag
          hashtag={item}
          children={
            <Button
              type='text'
              content={t('componentContextMenu:hashtag.follow.action', {
                defaultValue: 'fase',
                context: 'false'
              })}
              onPress={() => mutation.mutate({ tag_name: item.name, to: !item.following })}
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
