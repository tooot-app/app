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
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const mutation = useTimelineMutation({
    queryClient,
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
          Alert.alert(
            t('timeline:shared.header.default.actions.domain.alert.title'),
            t('timeline:shared.header.default.actions.domain.alert.message'),
            [
              { text: t('common:buttons.cancel'), style: 'cancel' },
              {
                text: t(
                  'timeline:shared.header.default.actions.domain.alert.confirm'
                ),
                style: 'destructive',
                onPress: () => {
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
        title={t(`timeline:shared.header.default.actions.domain.block.button`, {
          domain
        })}
      />
    </MenuContainer>
  )
}

export default HeaderActionsDomain
