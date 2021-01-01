import client from '@api/client'
import MenuContainer from '@components/Menu/Container'
import MenuHeader from '@components/Menu/Header'
import MenuRow from '@components/Menu/Row'
import { toast } from '@components/toast'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from 'react-query'

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
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const fireMutation = useCallback(() => {
    return client({
      method: 'post',
      instance: 'local',
      url: `domain_blocks`,
      params: {
        domain: domain!
      }
    })
  }, [])
  const { mutate } = useMutation(fireMutation, {
    onSettled: () => {
      toast({
        type: 'success',
        message: t('common:toastMessage.success.message', {
          function: t(
            `timeline:shared.header.default.actions.domain.block.function`
          )
        })
      })
      queryClient.invalidateQueries(queryKey)
    }
  })

  return (
    <MenuContainer>
      <MenuHeader
        heading={t(`timeline:shared.header.default.actions.domain.heading`)}
      />
      <MenuRow
        onPress={() => {
          setBottomSheetVisible(false)
          mutate()
        }}
        iconFront='cloud-off'
        title={t(`timeline:shared.header.default.actions.domain.block.button`, {
          domain
        })}
      />
    </MenuContainer>
  )
}

export default HeaderDefaultActionsDomain
