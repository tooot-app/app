import React from 'react'
import { useMutation, useQueryCache } from 'react-query'
import client from 'src/api/client'
import { MenuContainer, MenuHeader, MenuRow } from 'src/components/Menu'
import { toast } from 'src/components/toast'

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
        endpoint: `accounts/${id}/${type}`
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
        endpoint: `reports`,
        query: {
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
  queryKey: App.QueryKey
  accountId: string
  account: string
  setBottomSheetVisible: React.Dispatch<React.SetStateAction<boolean>>
}

const HeaderDefaultActionsAccount: React.FC<Props> = ({
  queryKey,
  accountId,
  account,
  setBottomSheetVisible
}) => {
  const queryCache = useQueryCache()
  const [mutateAction] = useMutation(fireMutation, {
    onMutate: () => {
      queryCache.cancelQueries(queryKey)
      const oldData = queryCache.getQueryData(queryKey)
      return oldData
    },
    onError: (err, _, oldData) => {
      toast({ type: 'error', content: '请重试', autoHide: false })
      queryCache.setQueryData(queryKey, oldData)
    },
    onSettled: () => {
      queryCache.invalidateQueries(queryKey)
    }
  })

  return (
    <MenuContainer>
      <MenuHeader heading='关于账户' />
      <MenuRow
        onPress={() => {
          setBottomSheetVisible(false)
          mutateAction({
            type: 'mute',
            id: accountId,
            stateKey: 'muting'
          })
        }}
        iconFront='eye-off'
        title={`隐藏 @${account} 的嘟嘟`}
      />
      <MenuRow
        onPress={() => {
          setBottomSheetVisible(false)
          mutateAction({
            type: 'block',
            id: accountId,
            stateKey: 'blocking'
          })
        }}
        iconFront='x-circle'
        title={`屏蔽用户 @${account}`}
      />
      <MenuRow
        onPress={() => {
          setBottomSheetVisible(false)
          mutateAction({
            type: 'reports',
            id: accountId
          })
        }}
        iconFront='alert-triangle'
        title={`举报 @${account}`}
      />
    </MenuContainer>
  )
}

export default HeaderDefaultActionsAccount
