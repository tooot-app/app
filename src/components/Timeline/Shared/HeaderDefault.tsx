import menuAccount from '@components/contextMenu/account'
import menuInstance from '@components/contextMenu/instance'
import menuShare from '@components/contextMenu/share'
import menuStatus from '@components/contextMenu/status'
import Icon from '@components/Icon'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { Fragment, useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, View } from 'react-native'
import * as DropdownMenu from 'zeego/dropdown-menu'
import StatusContext from './Context'
import HeaderSharedAccount from './HeaderShared/Account'
import HeaderSharedApplication from './HeaderShared/Application'
import HeaderSharedCreated from './HeaderShared/Created'
import HeaderSharedMuted from './HeaderShared/Muted'
import HeaderSharedReplies from './HeaderShared/Replies'
import HeaderSharedVisibility from './HeaderShared/Visibility'

const TimelineHeaderDefault: React.FC = () => {
  const { queryKey, status, disableDetails, rawContent, isRemote, highlighted } =
    useContext(StatusContext)
  if (!status) return null

  const { colors } = useTheme()
  const { t } = useTranslation('componentContextMenu')

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
  const mInstance = highlighted ? menuInstance({ status, queryKey }) : []

  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      <View
        style={{
          flex: 7,
          ...(disableDetails && { flexDirection: 'row' })
        }}
      >
        <HeaderSharedAccount account={status.account} />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            ...(disableDetails
              ? { marginLeft: StyleConstants.Spacing.S }
              : { marginTop: StyleConstants.Spacing.XS, marginBottom: StyleConstants.Spacing.S })
          }}
        >
          {isRemote ? (
            <Icon
              name='wifi'
              size={StyleConstants.Font.Size.M}
              color={colors.secondary}
              style={{ marginRight: StyleConstants.Spacing.S }}
            />
          ) : null}
          <HeaderSharedCreated />
          <HeaderSharedVisibility />
          <HeaderSharedMuted />
          <HeaderSharedReplies />
          <HeaderSharedApplication />
        </View>
      </View>

      {Platform.OS !== 'android' && !disableDetails ? (
        <Pressable
          accessibilityHint={t('accessibilityHint')}
          style={{ flex: 1, alignItems: 'center' }}
        >
          <DropdownMenu.Root onOpenChange={setOpenChange}>
            <DropdownMenu.Trigger>
              <Icon
                name='more-horizontal'
                color={colors.secondary}
                size={StyleConstants.Font.Size.L}
              />
            </DropdownMenu.Trigger>

            <DropdownMenu.Content>
              {[mShare, mAccount, mStatus, mInstance].map((menu, i) => (
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
                              // @ts-ignore
                              <DropdownMenu.Sub key={item.key}>
                                <DropdownMenu.SubTrigger
                                  key={item.trigger.key}
                                  {...item.trigger.props}
                                >
                                  <DropdownMenu.ItemTitle children={item.trigger.title} />
                                  {item.trigger.icon ? (
                                    <DropdownMenu.ItemIcon ios={{ name: item.trigger.icon }} />
                                  ) : null}
                                </DropdownMenu.SubTrigger>
                                <DropdownMenu.SubContent>
                                  {item.items.map(sub => (
                                    <DropdownMenu.Item key={sub.key} {...sub.props}>
                                      <DropdownMenu.ItemTitle children={sub.title} />
                                      {sub.icon ? (
                                        <DropdownMenu.ItemIcon ios={{ name: sub.icon }} />
                                      ) : null}
                                    </DropdownMenu.Item>
                                  ))}
                                </DropdownMenu.SubContent>
                              </DropdownMenu.Sub>
                            )
                        }
                      })}
                    </DropdownMenu.Group>
                  ))}
                </Fragment>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Pressable>
      ) : null}
    </View>
  )
}

export default TimelineHeaderDefault
