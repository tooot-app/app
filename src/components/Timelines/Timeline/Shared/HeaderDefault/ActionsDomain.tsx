import React from 'react'
import { useMutation, useQueryCache } from 'react-query'
import client from 'src/api/client'
import MenuContainer from 'src/components/Menu/Container'
import MenuHeader from 'src/components/Menu/Header'
import MenuRow from 'src/components/Menu/Row'
import { toast } from 'src/components/toast'

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
  queryKey: App.QueryKey
  domain: string
  setBottomSheetVisible: React.Dispatch<React.SetStateAction<boolean>>
}

const HeaderDefaultActionsDomain: React.FC<Props> = ({
  queryKey,
  domain,
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
      <MenuHeader heading='关于域名' />
      <MenuRow
        onPress={() => {
          setBottomSheetVisible(false)
          mutateAction({ domain })
        }}
        iconFront='cloud-off'
        title={`屏蔽域名 ${domain}`}
      />
    </MenuContainer>
  )
}

export default HeaderDefaultActionsDomain
