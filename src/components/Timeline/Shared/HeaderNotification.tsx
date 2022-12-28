import Button from '@components/Button'
import menuAccount from '@components/contextMenu/account'
import menuInstance from '@components/contextMenu/instance'
import menuShare from '@components/contextMenu/share'
import menuStatus from '@components/contextMenu/status'
import Icon from '@components/Icon'
import { RelationshipIncoming, RelationshipOutgoing } from '@components/Relationship'
import browserPackage from '@utils/helpers/browserPackage'
import { getAccountStorage } from '@utils/storage/actions'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import * as WebBrowser from 'expo-web-browser'
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

export type Props = {
  notification: Mastodon.Notification
}

const TimelineHeaderNotification: React.FC<Props> = ({ notification }) => {
  const { t } = useTranslation('componentTimeline')
  const { queryKey, status } = useContext(StatusContext)

  const { colors } = useTheme()

  const [openChange, setOpenChange] = useState(false)
  const mShare = menuShare({
    visibility: status?.visibility,
    type: 'status',
    url: status?.url || status?.uri
  })
  const mAccount = menuAccount({
    type: 'status',
    openChange,
    account: status?.account,
    ...(status && { status }),
    queryKey
  })
  const mStatus = menuStatus({ status, queryKey })
  const mInstance = menuInstance({ status, queryKey })

  const actions = () => {
    switch (notification.type) {
      case 'follow':
        return <RelationshipOutgoing id={notification.account.id} />
      case 'follow_request':
        return <RelationshipIncoming id={notification.account.id} />
      case 'admin.report':
        return (
          <Button
            type='text'
            content={t('shared.actions.openReport')}
            onPress={async () =>
              WebBrowser.openAuthSessionAsync(
                `https://${getAccountStorage.string('auth.domain')}/admin/reports/${
                  notification.report.id
                }`,
                'tooot://tooot',
                {
                  ...(await browserPackage()),
                  dismissButtonStyle: 'done',
                  readerMode: false
                }
              )
            }
          />
        )
      default:
        if (status && Platform.OS !== 'android') {
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
                    {[mShare, mStatus, mAccount, mInstance].map((type, i) => (
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
          flex:
            notification.type === 'follow' ||
            notification.type === 'follow_request' ||
            notification.type === 'admin.report'
              ? 1
              : 4
        }}
      >
        <HeaderSharedAccount
          account={
            notification.type === 'admin.report'
              ? notification.report.target_account
              : notification.status
              ? notification.status.account
              : notification.account
          }
          {...((notification.type === 'follow' ||
            notification.type === 'follow_request' ||
            notification.type === 'admin.report') && {
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

      <View
        style={[
          { marginLeft: StyleConstants.Spacing.M },
          notification.type === 'follow' ||
          notification.type === 'follow_request' ||
          notification.type === 'admin.report'
            ? { flexShrink: 1 }
            : { flex: 1 }
        ]}
        children={actions()}
      />
    </View>
  )
}

export default TimelineHeaderNotification
