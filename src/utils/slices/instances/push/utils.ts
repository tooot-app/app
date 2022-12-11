import {
  checkPermission,
  PERMISSION_MANAGE_REPORTS,
  PERMISSION_MANAGE_USERS
} from '@helpers/permissions'
import queryClient from '@helpers/queryClient'
import i18n from '@root/i18n/i18n'
import { InstanceLatest } from '@utils/migrations/instances/migration'
import { queryFunctionProfile, QueryKeyProfile } from '@utils/queryHooks/profile'
import * as Notifications from 'expo-notifications'

export const PUSH_DEFAULT: [
  'follow',
  'follow_request',
  'favourite',
  'reblog',
  'mention',
  'poll',
  'status'
] = ['follow', 'follow_request', 'favourite', 'reblog', 'mention', 'poll', 'status']

export const PUSH_ADMIN: { type: 'admin.sign_up' | 'admin.report'; permission: number }[] = [
  { type: 'admin.sign_up', permission: PERMISSION_MANAGE_USERS },
  { type: 'admin.report', permission: PERMISSION_MANAGE_REPORTS }
]

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

  if (!instance.push.decode) {
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
    for (const { type, permission } of PUSH_ADMIN) {
      if (checkPermission(permission, profileQuery.role?.permissions)) {
        await setChannel(type)
      }
    }
  }
}
