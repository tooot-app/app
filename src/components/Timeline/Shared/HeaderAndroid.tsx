import menuAccount from '@components/contextMenu/account'
import menuInstance from '@components/contextMenu/instance'
import menuShare from '@components/contextMenu/share'
import menuStatus from '@components/contextMenu/status'
import Icon from '@components/Icon'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useState } from 'react'
import { Platform, View } from 'react-native'
import * as DropdownMenu from 'zeego/dropdown-menu'

export interface Props {
  queryKey?: QueryKeyTimeline
  rootQueryKey?: QueryKeyTimeline
  status?: Mastodon.Status
}

const TimelineHeaderAndroid: React.FC<Props> = ({ queryKey, rootQueryKey, status }) => {
  if (Platform.OS !== 'android' || !status) return null

  const { colors } = useTheme()

  const [openChange, setOpenChange] = useState(false)
  const mShare = menuShare({
    visibility: status.visibility,
    type: 'status',
    url: status.url || status.uri
  })
  const mAccount = menuAccount({
    openChange,
    id: status.account.id,
    queryKey
  })
  const mStatus = menuStatus({ status, queryKey, rootQueryKey })
  const mInstance = menuInstance({ status, queryKey, rootQueryKey })

  return (
    <View style={{ position: 'absolute', top: 0, right: 0 }}>
      {queryKey ? (
        <DropdownMenu.Root onOpenChange={setOpenChange}>
          <DropdownMenu.Trigger>
            <View style={{ padding: StyleConstants.Spacing.L }}>
              <Icon
                name='MoreHorizontal'
                color={colors.secondary}
                size={StyleConstants.Font.Size.L}
              />
            </View>
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
      ) : null}
    </View>
  )
}

export default TimelineHeaderAndroid
