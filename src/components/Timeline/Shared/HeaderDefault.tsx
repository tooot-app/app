import menuAccount from '@components/contextMenu/account'
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
import HeaderSharedVisibility from './HeaderShared/Visibility'

const TimelineHeaderDefault: React.FC = () => {
  const { queryKey, rootQueryKey, status, highlighted, disableDetails, rawContent } =
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
    ...(status && { status }),
    queryKey
  })
  const mStatus = menuStatus({ status, queryKey, rootQueryKey })

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

      {Platform.OS !== 'android' && !disableDetails ? (
        <Pressable
          accessibilityHint={t('accessibilityHint')}
          style={{ flex: 1, alignItems: 'center' }}
        >
          <DropdownMenu.Root onOpenChange={setOpenChange}>
            <DropdownMenu.Trigger>
              <Icon
                name='MoreHorizontal'
                color={colors.secondary}
                size={StyleConstants.Font.Size.L}
              />
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
        </Pressable>
      ) : null}
    </View>
  )
}

export default TimelineHeaderDefault
