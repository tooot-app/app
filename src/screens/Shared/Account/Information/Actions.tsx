import { useNavigation } from '@react-navigation/native'
import client from '@root/api/client'
import Button from '@root/components/Button'
import { toast } from '@root/components/toast'
import { relationshipFetch } from '@root/utils/fetches/relationshipFetch'
import getCurrentTab from '@root/utils/getCurrentTab'
import { StyleConstants } from '@root/utils/styles/constants'
import { useTheme } from '@root/utils/styles/ThemeManager'
import React, { useEffect, useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import { useMutation, useQuery, useQueryClient } from 'react-query'

export interface Props {
  account: Mastodon.Account | undefined
}

const fireMutation = async ({
  type,
  id,
  prevState
}: {
  type: 'follow' | 'block'
  id: string
  prevState: boolean
}) => {
  let res
  switch (type) {
    case 'follow':
    case 'block':
      res = await client({
        method: 'post',
        instance: 'local',
        url: `accounts/${id}/${prevState ? 'un' : ''}${type}`
      })

      if (res.body.id === id) {
        return Promise.resolve(res.body)
      } else {
        return Promise.reject()
      }
  }
}

const AccountInformationActions: React.FC<Props> = ({ account }) => {
  const { theme } = useTheme()
  const navigation = useNavigation()

  const relationshipQueryKey = ['Relationship', { id: account?.id }]
  const query = useQuery(relationshipQueryKey, relationshipFetch, {
    enabled: false
  })
  useEffect(() => {
    if (account?.id) {
      query.refetch()
    }
  }, [account])
  const queryClient = useQueryClient()
  const mutation = useMutation(fireMutation, {
    onSuccess: data => queryClient.setQueryData(relationshipQueryKey, data),
    onError: () => toast({ type: 'error', content: '关注失败，请重试' })
  })

  const mainAction = useMemo(() => {
    let content: string
    let onPress: () => void

    if (query.isError) {
      content = '读取错误'
      onPress = () => {}
    } else {
      if (query.data?.blocked_by) {
        content = '被用户屏蔽'
        onPress = () => null
      } else {
        if (query.data?.blocking) {
          content = '取消屏蔽'
          onPress = () =>
            mutation.mutate({
              type: 'block',
              id: account!.id,
              prevState: query.data?.blocking
            })
        } else {
          if (query.data?.following) {
            content = '取消关注'
            onPress = () =>
              mutation.mutate({
                type: 'follow',
                id: account!.id,
                prevState: query.data?.following
              })
          } else {
            if (query.data?.requested) {
              content = '取消关注请求'
              onPress = () =>
                mutation.mutate({
                  type: 'follow',
                  id: account!.id,
                  prevState: query.data?.requested
                })
            } else {
              content = '关注'
              onPress = () =>
                mutation.mutate({
                  type: 'follow',
                  id: account!.id,
                  prevState: false
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
  }, [theme, query, mutation])

  return (
    <View style={styles.actions}>
      {query.data && !query.data.blocked_by && (
        <Button
          type='icon'
          content='mail'
          round
          onPress={() =>
            navigation.navigate(getCurrentTab(navigation), {
              screen: 'Screen-Shared-Compose',
              params: {
                type: 'conversation',
                incomingStatus: { account }
              }
            })
          }
          style={styles.actionConversation}
        />
      )}
      {mainAction}
    </View>
  )
}

const styles = StyleSheet.create({
  actions: {
    alignSelf: 'flex-end',
    flexDirection: 'row'
  },
  actionConversation: { marginRight: StyleConstants.Spacing.S },
  error: {
    ...StyleConstants.FontStyle.S
  }
})

export default AccountInformationActions
