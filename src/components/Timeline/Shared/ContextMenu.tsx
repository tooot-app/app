import contextMenuAccount from '@components/ContextMenu/account'
import contextMenuInstance from '@components/ContextMenu/instance'
import contextMenuShare from '@components/ContextMenu/share'
import contextMenuStatus from '@components/ContextMenu/status'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import React from 'react'
import { createContext } from 'react'
import { Platform } from 'react-native'
import ContextMenu, { ContextMenuAction, ContextMenuProps } from 'react-native-context-menu-view'

export interface Props {
  copiableContent: React.MutableRefObject<{
    content: string
    complete: boolean
  }>
  status?: Mastodon.Status
  queryKey?: QueryKeyTimeline
  rootQueryKey?: QueryKeyTimeline
}

export const ContextMenuContext = createContext<ContextMenuAction[]>([])

const TimelineContextMenu: React.FC<Props & ContextMenuProps> = ({
  children,
  copiableContent,
  status,
  queryKey,
  rootQueryKey,
  ...props
}) => {
  if (!status || !queryKey || Platform.OS === 'android') {
    return <>{children}</>
  }

  const actions: ContextMenuAction[] = []

  const shareOnPress =
    status.visibility !== 'direct'
      ? contextMenuShare({
          copiableContent,
          actions,
          type: 'status',
          url: status.url || status.uri
        })
      : null
  const statusOnPress = contextMenuStatus({
    actions,
    status,
    queryKey,
    rootQueryKey
  })
  const accountOnPress = status?.account?.id
    ? contextMenuAccount({
        actions,
        type: 'status',
        queryKey,
        rootQueryKey,
        id: status.account.id
      })
    : null
  const instanceOnPress = contextMenuInstance({
    actions,
    status,
    queryKey,
    rootQueryKey
  })

  return (
    <ContextMenuContext.Provider value={actions}>
      <ContextMenu
        actions={actions}
        onPress={({ nativeEvent: { index } }) => {
          for (const on of [shareOnPress, statusOnPress, accountOnPress, instanceOnPress]) {
            on && on(index)
          }
        }}
        children={children}
        {...props}
      />
    </ContextMenuContext.Provider>
  )
}

export default TimelineContextMenu
