import menuAccount from '@components/contextMenu/account'
import menuShare from '@components/contextMenu/share'
import menuStatus from '@components/contextMenu/status'
import Icon from '@components/Icon'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { Fragment, useContext, useState } from 'react'
import { Platform, View } from 'react-native'
import * as DropdownMenu from 'zeego/dropdown-menu'
import StatusContext from './Context'

const TimelineHeaderAndroid: React.FC = () => {
  const { queryKey, rootQueryKey, status, disableDetails, disableOnPress, rawContent } =
    useContext(StatusContext)

  if (Platform.OS !== 'android' || !status || disableDetails || disableOnPress) return null

  const { colors } = useTheme()

  const [openChange, setOpenChange] = useState(false)
  const mShare = menuShare({
    visibility: status.visibility,
    type: 'status',
    url: status.url || status.uri,
    rawContent
  })
  const mAccount = menuAccount({
    type: 'status',
    openChange,
    account: status.account,
    ...(status && { status }),
    queryKey
  })
  const mStatus = menuStatus({ status, queryKey, rootQueryKey })

  return (
    <View style={{ position: 'absolute', top: 0, right: 0 }}>
      {queryKey ? (
        <DropdownMenu.Root onOpenChange={setOpenChange}>
          <DropdownMenu.Trigger>
            <View
              style={{
                padding: StyleConstants.Spacing.L,
                backgroundColor: colors.backgroundDefault
              }}
            >
              <Icon
                name='MoreHorizontal'
                color={colors.secondary}
                size={StyleConstants.Font.Size.L}
              />
            </View>
          </DropdownMenu.Trigger>

          <DropdownMenu.Content>
            {[mShare, mAccount, mStatus].map((type, i) => (
              <Fragment key={i}>
                {type.map((mGroup, index) => (
                  <DropdownMenu.Group key={index}>
                    {mGroup.map(menu => (
                      <DropdownMenu.Item key={menu.key} {...menu.item}>
                        <DropdownMenu.ItemTitle children={menu.title} />
                        <DropdownMenu.ItemIcon ios={{ name: menu.icon }} />
                      </DropdownMenu.Item>
                    ))}
                  </DropdownMenu.Group>
                ))}
              </Fragment>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      ) : null}
    </View>
  )
}

export default TimelineHeaderAndroid
