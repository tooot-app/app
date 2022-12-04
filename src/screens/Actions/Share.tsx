import MenuContainer from '@components/Menu/Container'
import MenuHeader from '@components/Menu/Header'
import MenuRow from '@components/Menu/Row'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Share } from 'react-native'

export interface Props {
  type: 'status' | 'account'
  url: string
  dismiss: () => void
}

const ActionsShare: React.FC<Props> = ({ type, url, dismiss }) => {
  const { t } = useTranslation('componentTimeline')

  return (
    <MenuContainer>
      <MenuHeader heading={t(`shared.header.actions.share.${type}.heading`)} />
      <MenuRow
        iconFront='Share2'
        title={t(`shared.header.actions.share.${type}.button`)}
        onPress={async () => {
          switch (Platform.OS) {
            case 'ios':
              await Share.share({
                url
              })
              break
            case 'android':
              await Share.share({
                message: url
              })
              break
          }
          dismiss()
        }}
      />
    </MenuContainer>
  )
}

export default ActionsShare
