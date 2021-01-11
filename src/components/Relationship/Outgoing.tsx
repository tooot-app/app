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
    const { t } = useTranslation()

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
      onError: (err: any, { type }) => {
        haptics('Error')
        toast({
          type: 'error',
          message: t('common:toastMessage.error.message', {
            function: t(`relationship:${type}.function`)
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
      content = t('relationship:button.error')
      onPress = () => {}
    } else {
      if (query.data?.blocked_by) {
        content = t('relationship:button.blocked_by')
        onPress = () => null
      } else {
        if (query.data?.blocking) {
          content = t('relationship:button.blocking')
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
            content = t('relationship:button.following')
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
              content = t('relationship:button.requested')
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
              content = t('relationship:button.default')
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
