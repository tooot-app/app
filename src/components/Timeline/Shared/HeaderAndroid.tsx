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
  const { queryKey, status, disableDetails, disableOnPress, rawContent } = useContext(StatusContext)

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
    ...(status && { status })
  })
  const mStatus = menuStatus({ status, queryKey })

  return (
    <View style={{ position: 'absolute', top: 0, right: 0 }}>
      {queryKey ? (
        <DropdownMenu.Root onOpenChange={setOpenChange}>
          <DropdownMenu.Trigger>
            <View
              style={{
                padding: StyleConstants.Spacing.L,
                paddingBottom: StyleConstants.Spacing.S,
                backgroundColor: colors.backgroundDefault
              }}
            >
              <Icon
                name='more-horizontal'
                color={colors.secondary}
                size={StyleConstants.Font.Size.L}
              />
            </View>
          </DropdownMenu.Trigger>

          <DropdownMenu.Content>
            {[mShare, mAccount, mStatus].map((menu, i) => (
              <Fragment key={i}>
                {menu.map((group, index) => (
                  <DropdownMenu.Group key={index}>
                    {group.map(item => {
                      switch (item.type) {
                        case 'item':
                          return (
                            <DropdownMenu.Item key={item.key} {...item.props}>
                              <DropdownMenu.ItemTitle children={item.title} />
                              {item.icon ? (
                                <DropdownMenu.ItemIcon ios={{ name: item.icon }} />
                              ) : null}
                            </DropdownMenu.Item>
                          )
                        case 'sub':
                          return (
                            <Fragment key={item.key}>
                              {item.items.map(sub => (
                                <DropdownMenu.Item key={sub.key} {...sub.props}>
                                  <DropdownMenu.ItemTitle children={sub.title} />
                                  {sub.icon ? (
                                    <DropdownMenu.ItemIcon ios={{ name: sub.icon }} />
                                  ) : null}
                                </DropdownMenu.Item>
                              ))}
                            </Fragment>
                          )
                      }
                    })}
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
