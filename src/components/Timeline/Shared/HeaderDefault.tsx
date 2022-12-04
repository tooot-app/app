import menuAccount from '@components/contextMenu/account'
import menuInstance from '@components/contextMenu/instance'
import menuShare from '@components/contextMenu/share'
import menuStatus from '@components/contextMenu/status'
import Icon from '@components/Icon'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useContext, useState } from 'react'
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
  const { queryKey, rootQueryKey, status, copiableContent, highlighted, disableDetails } =
    useContext(StatusContext)
  if (!status) return null

  const { colors } = useTheme()
  const { t } = useTranslation('componentContextMenu')

  const [openChange, setOpenChange] = useState(false)
  const mShare = menuShare({
    visibility: status.visibility,
    type: 'status',
    url: status.url || status.uri,
    copiableContent
  })
  const mAccount = menuAccount({
    type: 'status',
    openChange,
    account: status.account,
    queryKey
  })
  const mStatus = menuStatus({ status, queryKey, rootQueryKey })
  const mInstance = menuInstance({ status, queryKey, rootQueryKey })

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
        </Pressable>
      ) : null}
    </View>
  )
}

export default TimelineHeaderDefault
