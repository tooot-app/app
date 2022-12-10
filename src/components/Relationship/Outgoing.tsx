import Button from '@components/Button'
import haptics from '@components/haptics'
import { displayMessage } from '@components/Message'
import {
  QueryKeyRelationship,
  useRelationshipMutation,
  useRelationshipQuery
} from '@utils/queryHooks/relationship'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'

export interface Props {
  id: Mastodon.Account['id']
}

const RelationshipOutgoing = React.memo(
  ({ id }: Props) => {
    const { theme } = useTheme()
    const { t } = useTranslation('componentRelationship')

    const query = useRelationshipQuery({ id })

    const queryKeyRelationship: QueryKeyRelationship = ['Relationship', { id }]
    const queryClient = useQueryClient()
    const mutation = useRelationshipMutation({
      onSuccess: (res, { payload: { action } }) => {
        haptics('Success')
        queryClient.setQueryData<Mastodon.Relationship[]>(queryKeyRelationship, [res])
        if (action === 'block') {
          const queryKey: QueryKeyTimeline = ['Timeline', { page: 'Following' }]
          queryClient.invalidateQueries(queryKey)
        }
      },
      onError: (err: any, { payload: { action } }) => {
        displayMessage({
          theme,
          type: 'error',
          message: t('common:message.error.message', {
            function: t(`${action}.function`)
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
      content = t('button.error')
      onPress = () => {}
    } else {
      if (query.data?.blocked_by) {
        content = t('button.blocked_by')
        onPress = () => {}
      } else {
        if (query.data?.blocking) {
          content = t('button.blocking')
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
            content = t('button.following')
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
              content = t('button.requested')
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
              content = t('button.default')
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

    return (
      <Button
        type='text'
        content={content}
        onPress={onPress}
        loading={query.isLoading || mutation.isLoading}
        disabled={query.isError || query.data?.blocked_by}
      />
    )
  },
  () => true
)

export default RelationshipOutgoing
