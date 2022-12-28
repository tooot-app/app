import { featureCheck } from '@helpers/featureCheck'
import {
  checkPermission,
  PERMISSION_MANAGE_REPORTS,
  PERMISSION_MANAGE_USERS
} from '@helpers/permissions'
import queryClient from '@helpers/queryClient'
import i18n from '@root/i18n/i18n'
import { QueryKeyProfile } from '@utils/queryHooks/profile'
import { getAccountDetails, getGlobalStorage } from '@utils/storage/actions'
import * as Notifications from 'expo-notifications'

export const PUSH_DEFAULT = [
  'follow',
  'follow_request',
  'favourite',
  'reblog',
  'mention',
  'poll',
  'update',
  'status'
].filter(type => {
  switch (type) {
    case 'status':
      return featureCheck('notification_type_status')
    case 'update':
      return featureCheck('notification_type_update')
    default:
      return true
  }
}) as ['follow', 'follow_request', 'favourite', 'reblog', 'mention', 'poll', 'update', 'status']

export const PUSH_ADMIN = [
  { type: 'admin.sign_up', permission: PERMISSION_MANAGE_USERS },
  { type: 'admin.report', permission: PERMISSION_MANAGE_REPORTS }
].filter(({ type, permission }) => {
  const queryKeyProfile: QueryKeyProfile = ['Profile']
  const permissions = queryClient.getQueryData<Mastodon.Account>(queryKeyProfile)?.role?.permissions
  switch (type) {
    case 'admin.sign_up':
      return (
        featureCheck('notification_type_admin_signup') && checkPermission(permission, permissions)
      )
    case 'admin.report':
      return (
        featureCheck('notification_type_admin_report') && checkPermission(permission, permissions)
      )
  }
}) as { type: 'admin.sign_up' | 'admin.report'; permission: number }[]

export const setChannels = async (reset: boolean | undefined = false, specificAccount?: string) => {
  const account = specificAccount || getGlobalStorage.string('account.active')
  const accountDetails = getAccountDetails(['version', 'push'])
  if (!accountDetails) return null

  const deleteChannel = async (type: string) =>
    Notifications.deleteNotificationChannelAsync(`${account}_${type}`)
  const setChannel = async (type: string) =>
    Notifications.setNotificationChannelAsync(`${account}_${type}`, {
      groupId: account,
      name: i18n.t(`screenTabs:me.push.${type}.heading` as any),
      importance: Notifications.AndroidImportance.DEFAULT,
      bypassDnd: false,
      showBadge: true,
      enableLights: true,
      enableVibrate: true
    })

  const channelGroup = await Notifications.getNotificationChannelGroupAsync(account)
  if (channelGroup && !reset) {
    return
  }
  if (!channelGroup) {
    await Notifications.setNotificationChannelGroupAsync(account, { name: account })
  }

  if (!accountDetails.push.decode) {
    await setChannel('default')
    for (const push of PUSH_DEFAULT) {
      await deleteChannel(push)
    }
    for (const { type } of PUSH_ADMIN) {
      await deleteChannel(type)
    }
  } else {
    await deleteChannel('default')
    for (const push of PUSH_DEFAULT) {
      await setChannel(push)
    }
    for (const { type } of PUSH_ADMIN) {
      await setChannel(type)
    }
  }
}
