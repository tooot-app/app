import analytics from '@components/analytics'
import { displayMessage } from '@components/Message'
import Clipboard from '@react-native-clipboard/clipboard'
import { useTheme } from '@utils/styles/ThemeManager'
import { useTranslation } from 'react-i18next'
import { Platform, Share } from 'react-native'
import { ContextMenuAction } from 'react-native-context-menu-view'

export interface Props {
  copiableContent?: React.MutableRefObject<{
    content?: string | undefined
    complete: boolean
  }>
  actions: ContextMenuAction[]
  type: 'status' | 'account'
  url: string
}

const contextMenuShare = ({ copiableContent, actions, type, url }: Props) => {
  const { theme } = useTheme()
  const { t } = useTranslation('componentContextMenu')

  actions.push({
    id: 'share',
    title: t(`share.${type}.action`),
    systemIcon: 'square.and.arrow.up'
  })
  Platform.OS !== 'android' &&
    type === 'status' &&
    actions.push({
      id: 'copy',
      title: t(`copy.action`),
      systemIcon: 'doc.on.doc',
      disabled: !copiableContent?.current.content?.length
    })

  return (index: number) => {
    if (typeof index !== 'number' || !actions[index]) {
      return // For Android
    }
    if (actions[index].id === 'copy') {
      analytics('timeline_shared_headeractions_copy_press')
      Clipboard.setString(copiableContent?.current.content || '')
      displayMessage({
        theme,
        type: 'success',
        message: t(`copy.succeed`)
      })
    }
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
