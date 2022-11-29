import MenuContainer from '@components/Menu/Container'
import MenuHeader from '@components/Menu/Header'
import MenuRow from '@components/Menu/Row'
import { displayMessage } from '@components/Message'
import { QueryKeyTimeline, useTimelineMutation } from '@utils/queryHooks/timeline'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'
import { useQueryClient } from 'react-query'

export interface Props {
  queryKey: QueryKeyTimeline
  rootQueryKey?: QueryKeyTimeline
  domain: string
  dismiss: () => void
}

const ActionsDomain: React.FC<Props> = ({ queryKey, rootQueryKey, domain, dismiss }) => {
  const { theme } = useTheme()
  const { t } = useTranslation('componentTimeline')
  const queryClient = useQueryClient()
  const mutation = useTimelineMutation({
    onSettled: () => {
      displayMessage({
        theme,
        type: 'success',
        message: t('common:message.success.message', {
          function: t(`shared.header.actions.domain.block.function`)
        })
      })
      queryClient.invalidateQueries(queryKey)
      rootQueryKey && queryClient.invalidateQueries(rootQueryKey)
    }
  })

  return (
    <MenuContainer>
      <MenuHeader heading={t(`shared.header.actions.domain.heading`)} />
      <MenuRow
        onPress={() =>
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
                  dismiss()
                  mutation.mutate({
                    type: 'domainBlock',
                    queryKey,
                    domain: domain
                  })
                }
              }
            ]
          )
        }
        iconFront='CloudOff'
        title={t(`shared.header.actions.domain.block.button`, {
          domain
        })}
      />
    </MenuContainer>
  )
}

export default ActionsDomain
