import Button from '@components/Button'
import haptics from '@components/haptics'
import { toast } from '@components/toast'
import {
  QueryKeyRelationship,
  useRelationshipMutation,
  useRelationshipQuery
} from '@utils/queryHooks/relationship'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from 'react-query'

export interface Props {
  id: Mastodon.Account['id']
}

const RelationshipOutgoing = React.memo(
  ({ id }: Props) => {
    const { t } = useTranslation('componentRelationship')

    const query = useRelationshipQuery({ id })

    const queryKeyRelationship: QueryKeyRelationship = ['Relationship', { id }]
    const queryClient = useQueryClient()
    const mutation = useRelationshipMutation({
      onSuccess: res => {
        haptics('Success')
        queryClient.setQueryData<Mastodon.Relationship[]>(
          queryKeyRelationship,
          [res]
        )
      },
      onError: (err: any, { payload: { action } }) => {
        haptics('Error')
        toast({
          type: 'error',
          message: t('common:toastMessage.error.message', {
            function: t(`button.${action}.function`)
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
        onPress = () => null
      } else {
        if (query.data?.blocking) {
          content = t('button.blocking')
          onPress = () =>
            mutation.mutate({
              id,
              type: 'outgoing',
              payload: {
                action: 'block',
                state: query.data?.blocking
              }
            })
        } else {
          if (query.data?.following) {
            content = t('button.following')
            onPress = () =>
              mutation.mutate({
                id,
                type: 'outgoing',
                payload: {
                  action: 'follow',
                  state: query.data?.following
                }
              })
          } else {
            if (query.data?.requested) {
              content = t('button.requested')
              onPress = () =>
                mutation.mutate({
                  id,
                  type: 'outgoing',
                  payload: {
                    action: 'follow',
                    state: query.data?.requested
                  }
                })
            } else {
              content = t('button.default')
              onPress = () =>
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
