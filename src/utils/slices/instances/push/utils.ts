import features from '@helpers/features'
import {
  checkPermission,
  PERMISSION_MANAGE_REPORTS,
  PERMISSION_MANAGE_USERS
} from '@helpers/permissions'
import queryClient from '@helpers/queryClient'
import i18n from '@root/i18n/i18n'
import { InstanceLatest } from '@utils/migrations/instances/migration'
import { queryFunctionProfile, QueryKeyProfile } from '@utils/queryHooks/profile'
import { checkInstanceFeature } from '@utils/slices/instancesSlice'
import * as Notifications from 'expo-notifications'
import { useSelector } from 'react-redux'

export const usePushFeatures = () => {
  const hasTypeStatus = useSelector(checkInstanceFeature('notification_type_status'))
  const hasTypeUpdate = useSelector(checkInstanceFeature('notification_type_update'))
  const hasTypeAdminSignup = useSelector(checkInstanceFeature('notification_type_admin_signup'))
  const hasTypeAdminReport = useSelector(checkInstanceFeature('notification_type_admin_report'))
  return { hasTypeStatus, hasTypeUpdate, hasTypeAdminSignup, hasTypeAdminReport }
}

export const PUSH_DEFAULT = ({
  hasTypeUpdate,
  hasTypeStatus
}: {
  hasTypeUpdate: boolean
  hasTypeStatus: boolean
}) =>
  ['follow', 'follow_request', 'favourite', 'reblog', 'mention', 'poll', 'update', 'status'].filter(
    type => {
      switch (type) {
        case 'status':
          return hasTypeStatus
        case 'update':
          return hasTypeUpdate
        default:
          return true
      }
    }
  ) as ['follow', 'follow_request', 'favourite', 'reblog', 'mention', 'poll', 'update', 'status']

export const PUSH_ADMIN = (
  {
    hasTypeAdminSignup,
    hasTypeAdminReport
  }: {
    hasTypeAdminSignup: boolean
    hasTypeAdminReport: boolean
  },
  permissions?: string | number | undefined
) =>
  [
    { type: 'admin.sign_up', permission: PERMISSION_MANAGE_USERS },
    { type: 'admin.report', permission: PERMISSION_MANAGE_REPORTS }
  ].filter(({ type, permission }) => {
    switch (type) {
      case 'admin.sign_up':
        return hasTypeAdminSignup && checkPermission(permission, permissions)
      case 'admin.report':
        return hasTypeAdminReport && checkPermission(permission, permissions)
    }
  }) as { type: 'admin.sign_up' | 'admin.report'; permission: number }[]

export const setChannels = async (instance: InstanceLatest) => {
  const account = `@${instance.account.acct}@${instance.uri}`

  const deleteChannel = async (type: string) =>
    Notifications.deleteNotificationChannelAsync(`${account}_${type}`)
  const setChannel = async (type: string) =>
    Notifications.setNotificationChannelAsync(`${account}_${type}`, {
      groupId: account,
      name: i18n.t(`screenTabs:me.push.${type}.heading`),
      importance: Notifications.AndroidImportance.DEFAULT,
      bypassDnd: false,
      showBadge: true,
      enableLights: true,
      enableVibrate: true
    })

  const queryKey: QueryKeyProfile = ['Profile']
  const profileQuery = await queryClient.fetchQuery(queryKey, queryFunctionProfile)

  const channelGroup = await Notifications.getNotificationChannelGroupAsync(account)
  if (!channelGroup) {
    await Notifications.setNotificationChannelGroupAsync(account, { name: account })
  }

  const checkFeature = (feature: string) =>
    features
      .filter(f => f.feature === feature)
      .filter(f => parseFloat(instance.version) >= f.version)?.length > 0
  const checkFeatures = {
    hasTypeStatus: checkFeature('notification_type_status'),
    hasTypeUpdate: checkFeature('notification_type_update'),
    hasTypeAdminSignup: checkFeature('notification_type_admin_signup'),
    hasTypeAdminReport: checkFeature('notification_type_admin_report')
  }

  if (!instance.push.decode) {
    await setChannel('default')
    for (const push of PUSH_DEFAULT(checkFeatures)) {
      await deleteChannel(push)
    }
    for (const { type } of PUSH_ADMIN(checkFeatures, profileQuery.role?.permissions)) {
      await deleteChannel(type)
    }
  } else {
    await deleteChannel('default')
    for (const push of PUSH_DEFAULT(checkFeatures)) {
      await setChannel(push)
    }
    for (const { type } of PUSH_ADMIN(checkFeatures, profileQuery.role?.permissions)) {
      await setChannel(type)
    }
  }
}
