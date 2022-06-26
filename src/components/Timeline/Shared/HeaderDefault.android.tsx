import contextMenuAccount from '@components/ContextMenu/account'
import contextMenuInstance from '@components/ContextMenu/instance'
import contextMenuShare from '@components/ContextMenu/share'
import contextMenuStatus from '@components/ContextMenu/status'
import Icon from '@components/Icon'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, View } from 'react-native'
import ContextMenu, { ContextMenuAction } from 'react-native-context-menu-view'
import { ContextMenuContext } from './ContextMenu'
import HeaderSharedAccount from './HeaderShared/Account'
import HeaderSharedApplication from './HeaderShared/Application'
import HeaderSharedCreated from './HeaderShared/Created'
import HeaderSharedMuted from './HeaderShared/Muted'
import HeaderSharedVisibility from './HeaderShared/Visibility'

export interface Props {
  queryKey?: QueryKeyTimeline
  status: Mastodon.Status
  highlighted: boolean
}

const TimelineHeaderDefault = ({ queryKey, status, highlighted }: Props) => {
  if (!queryKey) return null

  const { t } = useTranslation('componentContextMenu')
  const { colors } = useTheme()

  const actions: ContextMenuAction[] = []

  const shareOnPress =
    status.visibility !== 'direct'
      ? contextMenuShare({
          actions,
          type: 'status',
          url: status.url || status.uri
        })
      : null
  const statusOnPress = contextMenuStatus({
    actions,
    status,
    queryKey
  })
  const accountOnPress = contextMenuAccount({
    actions,
    type: 'status',
    queryKey,
    id: status.account.id
  })
  const instanceOnPress = contextMenuInstance({
    actions,
    status,
    queryKey
  })

  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      <View style={{ flex: 7 }}>
        <HeaderSharedAccount account={status.account} />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: StyleConstants.Spacing.XS,
            marginBottom: StyleConstants.Spacing.S
          }}
        >
          <HeaderSharedCreated
            created_at={status.created_at}
            edited_at={status.edited_at}
            highlighted={highlighted}
          />
          <HeaderSharedVisibility visibility={status.visibility} />
          <HeaderSharedMuted muted={status.muted} />
          <HeaderSharedApplication application={status.application} />
        </View>
      </View>

      {queryKey ? (
        <Pressable
          accessibilityHint={t('accessibilityHint')}
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'center',
            marginBottom: StyleConstants.Spacing.L
          }}
        >
          <ContextMenu
            dropdownMenuMode
            actions={actions}
            onPress={({ nativeEvent: { index } }) => {
              console.log('index', index)
              for (const on of [
                shareOnPress,
                statusOnPress,
                accountOnPress,
                instanceOnPress
              ]) {
                on && on(index)
              }
            }}
            children={
              <Icon
                name='MoreHorizontal'
                color={colors.secondary}
                size={StyleConstants.Font.Size.L}
              />
            }
          />
        </Pressable>
      ) : null}
    </View>
  )
}

export default TimelineHeaderDefault
