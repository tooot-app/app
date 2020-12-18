import React from 'react'
import { useMutation, useQueryClient } from 'react-query'
import client from '@api/client'
import MenuContainer from '@components/Menu/Container'
import MenuHeader from '@components/Menu/Header'
import MenuRow from '@components/Menu/Row'
import { toast } from '@components/toast'

const fireMutation = async ({ domain }: { domain: string }) => {
  const res = await client({
    method: 'post',
    instance: 'local',
    url: `domain_blocks`,
    params: {
      domain: domain!
    }
  })

  if (!res.body.error) {
    toast({ type: 'success', content: '隐藏域名成功' })
    return Promise.resolve()
  } else {
    toast({
      type: 'error',
      content: '隐藏域名失败，请重试',
      autoHide: false
    })
    return Promise.reject()
  }
}

export interface Props {
  queryKey: QueryKey.Timeline
  domain: string
  setBottomSheetVisible: React.Dispatch<React.SetStateAction<boolean>>
}

const HeaderDefaultActionsDomain: React.FC<Props> = ({
  queryKey,
  domain,
  setBottomSheetVisible
}) => {
  const queryClient = useQueryClient()
  const { mutate } = useMutation(fireMutation, {
    onMutate: () => {
      queryClient.cancelQueries(queryKey)
      const oldData = queryClient.getQueryData(queryKey)
      return oldData
    },
    onError: (err, _, oldData) => {
      toast({ type: 'error', content: '请重试', autoHide: false })
      queryClient.setQueryData(queryKey, oldData)
    },
    onSettled: () => {
      queryClient.invalidateQueries(queryKey)
    }
  })

  return (
    <MenuContainer>
      <MenuHeader heading='关于域名' />
      <MenuRow
        onPress={() => {
          setBottomSheetVisible(false)
          mutate({ domain })
        }}
        iconFront='cloud-off'
        title={`屏蔽域名 ${domain}`}
      />
    </MenuContainer>
  )
}

export default HeaderDefaultActionsDomain
