import { displayMessage } from '@components/Message'
import Clipboard from '@react-native-clipboard/clipboard'
import { useTranslation } from 'react-i18next'
import { Platform, Share } from 'react-native'

const menuShare = (
  params:
    | {
        visibility?: Mastodon.Status['visibility']
        rawContent?: React.MutableRefObject<string[]>
        type: 'status'
        url?: string
      }
    | {
        type: 'account'
        url: string
      }
): ContextMenu[][] => {
  if (params.type === 'status' && params.visibility === 'direct') return []

  const { t } = useTranslation('componentContextMenu')

  const menus: ContextMenu[][] = [[]]

  if (params.url) {
    const url = params.url
    menus[0].push({
      key: 'share',
      item: {
        onSelect: () => {
          switch (Platform.OS) {
            case 'ios':
              Share.share({ url })
              break
            case 'android':
              Share.share({ message: url })
              break
          }
        },
        disabled: false,
        destructive: false,
        hidden: false
      },
      title: t(`share.${params.type}.action`),
      icon: 'square.and.arrow.up'
    })
  }
  if (params.type === 'status')
    menus[0].push({
      key: 'copy',
      item: {
        onSelect: () => {
          Clipboard.setString(params.rawContent?.current.join(`\n\n`) || '')
          displayMessage({ type: 'success', message: t(`copy.succeed`) })
        },
        disabled: false,
        destructive: false,
        hidden: !params.rawContent?.current.length
      },
      title: t('copy.action'),
      icon: 'doc.on.doc'
    })

  return menus
}

export default menuShare
