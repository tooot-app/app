import Icon from '@components/Icon'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useContext, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, View } from 'react-native'
import ContextMenu from 'react-native-context-menu-view'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler'
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
  const { t } = useTranslation('componentContextMenu')
  const { colors } = useTheme()

  const contextMenuItems = useContext(ContextMenuContext)

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
            dropdownMenuMode={true}
            actions={contextMenuItems}
            // onPress={({ nativeEvent: { index, name } }) => {
            //   console.log('index', index)
            //   console.log('name', name)
            //   // shareOnPress(name)
            //   // statusOnPress(name)
            //   accountOnPress(name)
            //   // instanceOnPress(name)
            // }}
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
