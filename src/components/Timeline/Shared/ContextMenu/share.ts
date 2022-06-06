import analytics from '@components/analytics'
import { useTranslation } from 'react-i18next'
import { Platform, Share } from 'react-native'
import { ContextMenuAction } from 'react-native-context-menu-view'

export interface Props {
  menuItems: ContextMenuAction[]
  status: Mastodon.Status
}

const contextMenuShare = ({ menuItems, status }: Props) => {
  const { t } = useTranslation('componentContextMenu')

  if (status.visibility !== 'direct') {
    menuItems.push({
      id: 'share',
      title: t(`share.status.action`),
      systemIcon: 'square.and.arrow.up'
    })
  }

  return (id: string) => {
    const url = status.url || status.uri
    switch (id) {
      case 'share':
        analytics('timeline_shared_headeractions_share_press')
        switch (Platform.OS) {
          case 'ios':
            Share.share({ url })
            break
          case 'android':
            Share.share({ message: url })
            break
        }
        break
    }
  }
}

export default contextMenuShare
