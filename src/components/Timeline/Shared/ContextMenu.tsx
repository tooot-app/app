import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { createContext } from 'react'
import ContextMenu, { ContextMenuAction } from 'react-native-context-menu-view'
import contextMenuAccount from './ContextMenu/account'
import contextMenuInstance from './ContextMenu/instance'
import contextMenuShare from './ContextMenu/share'
import contextMenuStatus from './ContextMenu/status'

export interface Props {
  status: Mastodon.Status
  queryKey?: QueryKeyTimeline
  rootQueryKey?: QueryKeyTimeline
}

export const ContextMenuContext = createContext<ContextMenuAction[]>([])

const TimelineContextMenu: React.FC<Props> = ({
  children,
  status,
  queryKey,
  rootQueryKey
}) => {
  if (!queryKey) {
    return <>{children}</>
  }

  const menuItems: ContextMenuAction[] = []

  const shareOnPress = contextMenuShare({ menuItems, status })
  const statusOnPress = contextMenuStatus({
    menuItems,
    status,
    queryKey,
    rootQueryKey
  })
  const accountOnPress = contextMenuAccount({
    menuItems,
    status,
    queryKey,
    rootQueryKey
  })
  const instanceOnPress = contextMenuInstance({
    menuItems,
    status,
    queryKey,
    rootQueryKey
  })

  return (
    <ContextMenuContext.Provider value={menuItems}>
      <ContextMenu
        actions={menuItems}
        onPress={({ nativeEvent: { id } }) => {
          shareOnPress(id)
          statusOnPress(id)
          accountOnPress(id)
          instanceOnPress(id)
        }}
        children={children}
      />
    </ContextMenuContext.Provider>
  )
}

export default TimelineContextMenu
