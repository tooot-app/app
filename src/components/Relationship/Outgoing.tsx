import client from '@api/client'
import Button from '@components/Button'
import haptics from '@components/haptics'
import { toast } from '@components/toast'
import { relationshipFetch } from '@utils/fetches/relationshipFetch'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from 'react-query'

export interface Props {
  id: Mastodon.Account['id']
}

const RelationshipOutgoing: React.FC<Props> = ({ id }) => {
  const { t } = useTranslation()

  const relationshipQueryKey = ['Relationship', { id }]
  const query = useQuery(relationshipQueryKey, relationshipFetch)

  const queryClient = useQueryClient()
  const fireMutation = useCallback(
    ({ type, state }: { type: 'follow' | 'block'; state: boolean }) => {
      return client({
        method: 'post',
        instance: 'local',
        url: `accounts/${id}/${state ? 'un' : ''}${type}`
      })
    },
    []
  )
  const mutation = useMutation(fireMutation, {
    onSuccess: ({ body }) => {
      haptics('Success')
      queryClient.setQueryData(relationshipQueryKey, body)
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
            type: 'block',
            state: query.data?.blocking
          })
      } else {
        if (query.data?.following) {
          content = t('relationship:button.following')
          onPress = () =>
            mutation.mutate({
              type: 'follow',
              state: query.data?.following
            })
        } else {
          if (query.data?.requested) {
            content = t('relationship:button.requested')
            onPress = () =>
              mutation.mutate({
                type: 'follow',
                state: query.data?.requested
              })
          } else {
            content = t('relationship:button.default')
            onPress = () =>
              mutation.mutate({
                type: 'follow',
                state: false
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
}

export default RelationshipOutgoing
