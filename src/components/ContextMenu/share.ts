import analytics from '@components/analytics'
import { useTranslation } from 'react-i18next'
import { Platform, Share } from 'react-native'
import { ContextMenuAction } from 'react-native-context-menu-view'

export interface Props {
  actions: ContextMenuAction[]
  type: 'status' | 'account'
  url: string
}

const contextMenuShare = ({ actions, type, url }: Props) => {
  const { t } = useTranslation('componentContextMenu')

  actions.push({
    id: 'share',
    title: t(`share.${type}.action`),
    systemIcon: 'square.and.arrow.up'
  })

  return (index: number) => {
    if (actions[index].id === 'share') {
      analytics('timeline_shared_headeractions_share_press')
      switch (Platform.OS) {
        case 'ios':
          Share.share({ url })
          break
        case 'android':
          Share.share({ message: url })
          break
      }
    }
  }
}

export default contextMenuShare
