import menuAccount from '@components/contextMenu/account'
import menuInstance from '@components/contextMenu/instance'
import menuShare from '@components/contextMenu/share'
import menuStatus from '@components/contextMenu/status'
import Icon from '@components/Icon'
import { RelationshipIncoming, RelationshipOutgoing } from '@components/Relationship'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useState } from 'react'
import { Platform, Pressable, View } from 'react-native'
import * as DropdownMenu from 'zeego/dropdown-menu'
import HeaderSharedAccount from './HeaderShared/Account'
import HeaderSharedApplication from './HeaderShared/Application'
import HeaderSharedCreated from './HeaderShared/Created'
import HeaderSharedMuted from './HeaderShared/Muted'
import HeaderSharedVisibility from './HeaderShared/Visibility'

export interface Props {
  queryKey: QueryKeyTimeline
  notification: Mastodon.Notification
}

const TimelineHeaderNotification = ({ queryKey, notification }: Props) => {
  const { colors } = useTheme()

  const [openChange, setOpenChange] = useState(false)
  const mShare = menuShare({
    visibility: notification.status?.visibility,
    type: 'status',
    url: notification.status?.url || notification.status?.uri
  })
  const mAccount = menuAccount({
    type: 'status',
    openChange,
    account: notification.status?.account,
    queryKey
  })
  const mStatus = menuStatus({ status: notification.status, queryKey })
  const mInstance = menuInstance({ status: notification.status, queryKey })

  const actions = () => {
    switch (notification.type) {
      case 'follow':
        return <RelationshipOutgoing id={notification.account.id} />
      case 'follow_request':
        return <RelationshipIncoming id={notification.account.id} />
      default:
        if (notification.status) {
          return (
            <Pressable
              style={{ flex: 1, alignItems: 'center' }}
              children={
                <DropdownMenu.Root onOpenChange={setOpenChange}>
                  <DropdownMenu.Trigger>
                    <Icon
                      name='MoreHorizontal'
                      color={colors.secondary}
                      size={StyleConstants.Font.Size.L}
                    />
                  </DropdownMenu.Trigger>

                  <DropdownMenu.Content>
                    {mShare.map((mGroup, index) => (
                      <DropdownMenu.Group key={index}>
                        {mGroup.map(menu => (
                          <DropdownMenu.Item key={menu.key} {...menu.item}>
                            <DropdownMenu.ItemTitle children={menu.title} />
                            <DropdownMenu.ItemIcon iosIconName={menu.icon} />
                          </DropdownMenu.Item>
                        ))}
                      </DropdownMenu.Group>
                    ))}

                    {mAccount.map((mGroup, index) => (
                      <DropdownMenu.Group key={index}>
                        {mGroup.map(menu => (
                          <DropdownMenu.Item key={menu.key} {...menu.item}>
                            <DropdownMenu.ItemTitle children={menu.title} />
                            <DropdownMenu.ItemIcon iosIconName={menu.icon} />
                          </DropdownMenu.Item>
                        ))}
                      </DropdownMenu.Group>
                    ))}

                    {mStatus.map((mGroup, index) => (
                      <DropdownMenu.Group key={index}>
                        {mGroup.map(menu => (
                          <DropdownMenu.Item key={menu.key} {...menu.item}>
                            <DropdownMenu.ItemTitle children={menu.title} />
                            <DropdownMenu.ItemIcon iosIconName={menu.icon} />
                          </DropdownMenu.Item>
                        ))}
                      </DropdownMenu.Group>
                    ))}

                    {mInstance.map((mGroup, index) => (
                      <DropdownMenu.Group key={index}>
                        {mGroup.map(menu => (
                          <DropdownMenu.Item key={menu.key} {...menu.item}>
                            <DropdownMenu.ItemTitle children={menu.title} />
                            <DropdownMenu.ItemIcon iosIconName={menu.icon} />
                          </DropdownMenu.Item>
                        ))}
                      </DropdownMenu.Group>
                    ))}
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              }
            />
          )
        }
    }
  }

  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      <View
        style={{
          flex: notification.type === 'follow' || notification.type === 'follow_request' ? 1 : 4
        }}
      >
        <HeaderSharedAccount
          account={notification.status ? notification.status.account : notification.account}
          {...((notification.type === 'follow' || notification.type === 'follow_request') && {
            withoutName: true
          })}
        />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: StyleConstants.Spacing.XS,
            marginBottom: StyleConstants.Spacing.S
          }}
        >
          <HeaderSharedCreated
            created_at={notification.status?.created_at || notification.created_at}
            edited_at={notification.status?.edited_at}
          />
          {notification.status?.visibility ? (
            <HeaderSharedVisibility visibility={notification.status.visibility} />
          ) : null}
          <HeaderSharedMuted muted={notification.status?.muted} />
          <HeaderSharedApplication application={notification.status?.application} />
        </View>
      </View>

      {Platform.OS !== 'android' ? (
        <View
          style={[
            { marginLeft: StyleConstants.Spacing.M },
            notification.type === 'follow' || notification.type === 'follow_request'
              ? { flexShrink: 1 }
              : { flex: 1 }
          ]}
          children={actions()}
        />
      ) : null}
    </View>
  )
}

export default TimelineHeaderNotification
