import React from 'react'
import { useMutation, useQueryClient } from 'react-query'
import client from '@api/client'
import { MenuContainer, MenuHeader, MenuRow } from '@components/Menu'
import { toast } from '@components/toast'
import haptics from '@root/components/haptics'

const fireMutation = async ({
  type,
  id,
  stateKey
}: {
  type: 'mute' | 'block' | 'reports'
  id: string
  stateKey?: 'muting' | 'blocking'
}) => {
  let res
  switch (type) {
    case 'mute':
    case 'block':
      res = await client({
        method: 'post',
        instance: 'local',
        url: `accounts/${id}/${type}`
      })

      if (res.body[stateKey!] === true) {
        toast({ type: 'success', content: '功能成功' })
        return Promise.resolve()
      } else {
        toast({ type: 'error', content: '功能错误', autoHide: false })
        return Promise.reject()
      }
      break
    case 'reports':
      res = await client({
        method: 'post',
        instance: 'local',
        url: `reports`,
        params: {
          account_id: id!
        }
      })
      if (!res.body.error) {
        toast({ type: 'success', content: '举报账户成功' })
        return Promise.resolve()
      } else {
        toast({
          type: 'error',
          content: '举报账户失败，请重试',
          autoHide: false
        })
        return Promise.reject()
      }
      break
  }
}

export interface Props {
  queryKey?: QueryKey.Timeline
  account: Pick<Mastodon.Account, 'id' | 'username' | 'acct' | 'url'>
  setBottomSheetVisible: React.Dispatch<React.SetStateAction<boolean>>
}

const HeaderDefaultActionsAccount: React.FC<Props> = ({
  queryKey,
  account,
  setBottomSheetVisible
}) => {
  const queryClient = useQueryClient()
  const { mutate } = useMutation(fireMutation, {
    onSettled: () => {
      haptics('Success')
      queryKey && queryClient.invalidateQueries(queryKey)
    }
  })

  return (
    <MenuContainer>
      <MenuHeader heading='关于账户' />
      <MenuRow
        onPress={() => {
          setBottomSheetVisible(false)
          mutate({
            type: 'mute',
            id: account.id,
            stateKey: 'muting'
          })
        }}
        iconFront='eye-off'
        title={`隐藏 @${account.acct} 的嘟嘟`}
      />
      <MenuRow
        onPress={() => {
          setBottomSheetVisible(false)
          mutate({
            type: 'block',
            id: account.id,
            stateKey: 'blocking'
          })
        }}
        iconFront='x-circle'
        title={`屏蔽用户 @${account.acct}`}
      />
      <MenuRow
        onPress={() => {
          setBottomSheetVisible(false)
          mutate({
            type: 'reports',
            id: account.id
          })
        }}
        iconFront='flag'
        title={`举报 @${account.acct}`}
      />
    </MenuContainer>
  )
}

export default HeaderDefaultActionsAccount
