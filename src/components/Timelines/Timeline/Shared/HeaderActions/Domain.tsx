import analytics from '@components/analytics'
import MenuContainer from '@components/Menu/Container'
import MenuHeader from '@components/Menu/Header'
import MenuRow from '@components/Menu/Row'
import { toast } from '@components/toast'
import {
  QueryKeyTimeline,
  useTimelineMutation
} from '@utils/queryHooks/timeline'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'
import { useQueryClient } from 'react-query'

export interface Props {
  queryKey: QueryKeyTimeline
  domain: string
  setBottomSheetVisible: React.Dispatch<React.SetStateAction<boolean>>
}

const HeaderActionsDomain: React.FC<Props> = ({
  queryKey,
  domain,
  setBottomSheetVisible
}) => {
  const { t } = useTranslation('componentTimeline')
  const queryClient = useQueryClient()
  const mutation = useTimelineMutation({
    queryClient,
    onSettled: () => {
      toast({
        type: 'success',
        message: t('common:toastMessage.success.message', {
          function: t(`shared.header.actions.domain.block.function`)
        })
      })
      queryClient.invalidateQueries(queryKey)
    }
  })

  return (
    <MenuContainer>
      <MenuHeader heading={t(`shared.header.actions.domain.heading`)} />
      <MenuRow
        onPress={() => {
          analytics('timeline_shared_headeractions_domain_block_press', {
            page: queryKey[1].page
          })
          Alert.alert(
            t('shared.header.actions.domain.alert.title', { domain }),
            t('shared.header.actions.domain.alert.message'),
            [
              {
                text: t('shared.header.actions.domain.alert.buttons.cancel'),
                style: 'cancel'
              },
              {
                text: t('shared.header.actions.domain.alert.buttons.confirm'),
                style: 'destructive',
                onPress: () => {
                  analytics(
                    'timeline_shared_headeractions_domain_block_confirm',
                    {
                      page: queryKey && queryKey[1].page
                    }
                  )
                  setBottomSheetVisible(false)
                  mutation.mutate({
                    type: 'domainBlock',
                    queryKey,
                    domain: domain
                  })
                }
              }
            ]
          )
        }}
        iconFront='CloudOff'
        title={t(`shared.header.actions.domain.block.button`, {
          domain
        })}
      />
    </MenuContainer>
  )
}

export default HeaderActionsDomain
