import Button from '@components/Button'
import haptics from '@components/haptics'
import { displayMessage } from '@components/Message'
import {
  QueryKeyRelationship,
  useRelationshipMutation,
  useRelationshipQuery
} from '@utils/queryHooks/relationship'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { checkInstanceFeature } from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import { View } from 'react-native'
import { useRoute } from '@react-navigation/native'

export interface Props {
  id: Mastodon.Account['id']
}

const RelationshipOutgoing: React.FC<Props> = ({ id }: Props) => {
  const { theme } = useTheme()
  const { t } = useTranslation(['common', 'componentRelationship'])

  const canFollowNotify = useSelector(checkInstanceFeature('account_follow_notify'))

  const query = useRelationshipQuery({ id })

  const queryKeyRelationship: QueryKeyRelationship = ['Relationship', { id }]
  const queryClient = useQueryClient()
  const mutation = useRelationshipMutation({
    onSuccess: (res, { payload: { action } }) => {
      haptics('Success')
      queryClient.setQueryData<Mastodon.Relationship[]>(queryKeyRelationship, [res])
      if (action === 'block') {
        const queryKey = ['Timeline', { page: 'Following' }]
        queryClient.invalidateQueries({ queryKey, exact: false })
      }
    },
    onError: (err: any, { payload: { action } }) => {
      displayMessage({
        theme,
        type: 'error',
        message: t('common:message.error.message', {
          function: t(`componentRelationship:${action}.function` as any)
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

  let content: string
  let onPress: () => void

  if (query.isError) {
    content = t('componentRelationship:button.error')
    onPress = () => {}
  } else {
    if (query.data?.blocked_by) {
      content = t('componentRelationship:button.blocked_by')
      onPress = () => {}
    } else {
      if (query.data?.blocking) {
        content = t('componentRelationship:button.blocking')
        onPress = () => {
          mutation.mutate({
            id,
            type: 'outgoing',
            payload: {
              action: 'block',
              state: query.data?.blocking
            }
          })
        }
      } else {
        if (query.data?.following) {
          content = t('componentRelationship:button.following')
          onPress = () => {
            mutation.mutate({
              id,
              type: 'outgoing',
              payload: {
                action: 'follow',
                state: query.data?.following
              }
            })
          }
        } else {
          if (query.data?.requested) {
            content = t('componentRelationship:button.requested')
            onPress = () => {
              mutation.mutate({
                id,
                type: 'outgoing',
                payload: {
                  action: 'follow',
                  state: query.data?.requested
                }
              })
            }
          } else {
            content = t('componentRelationship:button.default')
            onPress = () => {
              mutation.mutate({
                id,
                type: 'outgoing',
                payload: {
                  action: 'follow',
                  state: false
                }
              })
            }
          }
        }
      }
    }
  }

  const { name } = useRoute()
  const isPageNotifications = name === 'Tab-Notifications-Root'

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {!isPageNotifications && canFollowNotify && query.data?.following ? (
        <Button
          type='icon'
          content={query.data.notifying ? 'BellOff' : 'Bell'}
          round
          onPress={() =>
            mutation.mutate({
              id,
              type: 'outgoing',
              payload: {
                action: 'follow',
                state: false,
                notify: !query.data.notifying
              }
            })
          }
          loading={query.isLoading || mutation.isLoading}
          style={{ marginRight: StyleConstants.Spacing.S }}
        />
      ) : null}
      <Button
        type='text'
        content={content}
        onPress={onPress}
        loading={query.isLoading || mutation.isLoading}
        disabled={query.isError || query.data?.blocked_by}
      />
    </View>
  )
}

export default RelationshipOutgoing
