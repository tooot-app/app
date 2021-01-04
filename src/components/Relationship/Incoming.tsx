import client from '@api/client'
import Button from '@components/Button'
import haptics from '@components/haptics'
import { toast } from '@components/toast'
import { StyleConstants } from '@utils/styles/constants'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { useMutation, useQueryClient } from 'react-query'

export interface Props {
  id: Mastodon.Account['id']
}

const RelationshipIncoming: React.FC<Props> = ({ id }) => {
  const { t } = useTranslation()

  const relationshipQueryKey: QueryKey.Relationship = ['Relationship', { id }]

  const queryClient = useQueryClient()
  const fireMutation = useCallback(
    ({ type }: { type: 'authorize' | 'reject' }) => {
      return client({
        method: 'post',
        instance: 'local',
        url: `follow_requests/${id}/${type}`
      })
    },
    []
  )
  const mutation = useMutation(fireMutation, {
    onSuccess: ({ body }) => {
      haptics('Success')
      queryClient.setQueryData(relationshipQueryKey, body)
      queryClient.refetchQueries(['Notifications'])
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

  return (
    <View style={styles.base}>
      <Button
        round
        type='icon'
        content='X'
        loading={mutation.isLoading}
        onPress={() => mutation.mutate({ type: 'reject' })}
      />
      <Button
        round
        type='icon'
        content='Check'
        loading={mutation.isLoading}
        onPress={() => mutation.mutate({ type: 'authorize' })}
        style={styles.approve}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    flexShrink: 1,
    flexDirection: 'row'
  },
  approve: {
    marginLeft: StyleConstants.Spacing.M
  }
})

export default RelationshipIncoming
