import AsyncStorage from '@react-native-async-storage/async-storage'
import log from '@utils/startup/log'
import { secureStorage, storage } from '@utils/storage'
import { MMKV } from 'react-native-mmkv'
import { LegacyApp } from './legacy/app'
import { LegacyContexts } from './legacy/contexts'
import { LegacyInstance } from './legacy/instance'
import { LegacySettings } from './legacy/settings'

export const versionStorageGlobal = storage.global.getNumber('version.global')

export async function migrateFromAsyncStorage(): Promise<void> {
  log('log', 'Migration', 'Migrating...')
  const start = global.performance.now()

  const unwrapPushData = (setting: { value: boolean } | boolean | undefined): boolean =>
    typeof setting === 'object' ? setting.value : typeof setting === 'boolean' ? setting : true

  const keys = ['persist:app', 'persist:contexts', 'persist:settings'] as [
    'persist:app',
    'persist:contexts',
    'persist:settings'
  ]
  for (const key of keys) {
    try {
      const value = await AsyncStorage.getItem(key)

      if (value != null) {
        switch (key) {
          case 'persist:app':
            const storeApp: LegacyApp = JSON.parse(value)
            if (storeApp.expoToken?.length) {
              storage.global.set('app.expo_token', storeApp.expoToken.replaceAll(`\"`, ``))
            }
            break
          case 'persist:contexts':
            const storeContexts: LegacyContexts = JSON.parse(value)
            if (storeContexts.storeReview.current) {
              storage.global.set(
                'app.count_till_store_review',
                storeContexts.storeReview.current || 0
              )
            }
            storage.global.set('app.prev_tab', storeContexts.previousTab.replaceAll(`\"`, ``))
            storage.global.set(
              'app.prev_public_segment',
              (storeContexts.previousSegment || 'Local').replaceAll(`\"`, ``)
            )
            break
          case 'persist:settings':
            const storeSettings: LegacySettings = JSON.parse(value)
            storage.global.set(
              'app.font_size',
              (typeof storeSettings.fontsize === 'string'
                ? storeSettings.fontsize.replaceAll(`\"`, ``)
                : storeSettings.fontsize) || 0
            )
            storage.global.set('app.language', storeSettings.language.replaceAll(`\"`, ``))
            storage.global.set('app.theme', storeSettings.theme.replaceAll(`\"`, ``))
            storage.global.set('app.theme.dark', storeSettings.darkTheme.replaceAll(`\"`, ``))
            storage.global.set('app.browser', storeSettings.browser.replaceAll(`\"`, ``))
            storage.global.set('app.auto_play_gifv', true)
            break
        }

        // AsyncStorage.removeItem(key)
      }
    } catch (error) {
      console.error(`Failed to migrate key "${key}" from AsyncStorage to MMKV!`, error)
      throw error
    }
  }

  try {
    const value = await secureStorage.getItem('persist:instances')

    if (value != null) {
      const storeInstances: { instances: string } = JSON.parse(value)
      const accounts: string[] = []

      let instance: LegacyInstance
      for (instance of JSON.parse(storeInstances.instances)) {
        const account = `${instance.url}/${instance.account.id}`

        const temp = new MMKV({ id: account })
        temp.set('auth.clientId', instance.appData.clientId)
        temp.set('auth.clientSecret', instance.appData.clientSecret)
        temp.set('auth.token', instance.token)
        temp.set('auth.domain', instance.url)

        temp.set('auth.account.acct', instance.account.acct)
        temp.set('auth.account.domain', instance.uri)
        temp.set('auth.account.id', instance.account.id)
        temp.set('auth.account.avatar_static', instance.account.avatarStatic)

        if (instance.account.preferences) {
          temp.set('preferences', JSON.stringify(instance.account.preferences))
        }
        temp.set(
          'notifications',
          JSON.stringify({
            ...instance.notifications_filter,
            status:
              typeof instance.notifications_filter.status === 'boolean'
                ? instance.notifications_filter.status
                : true,
            update:
              typeof instance.notifications_filter.update === 'boolean'
                ? instance.notifications_filter.update
                : true,
            'admin.sign_up':
              typeof instance.notifications_filter['admin.sign_up'] === 'boolean'
                ? instance.notifications_filter['admin.sign_up']
                : true,
            'admin.report':
              typeof instance.notifications_filter['admin.report'] === 'boolean'
                ? instance.notifications_filter['admin.report']
                : true
          })
        )
        temp.set(
          'push',
          JSON.stringify({
            global: unwrapPushData(instance.push.global),
            decode: unwrapPushData(instance.push.decode),
            alerts: {
              follow: unwrapPushData(instance.push.alerts.follow),
              follow_request: unwrapPushData(instance.push.alerts.follow_request),
              favourite: unwrapPushData(instance.push.alerts.favourite),
              reblog: unwrapPushData(instance.push.alerts.reblog),
              mention: unwrapPushData(instance.push.alerts.mention),
              poll: unwrapPushData(instance.push.alerts.poll),
              status: unwrapPushData(instance.push.alerts.status),
              update: unwrapPushData(instance.push.alerts.update),
              'admin.sign_up': unwrapPushData(instance.push.alerts['admin.sign_up']),
              'admin.report': unwrapPushData(instance.push.alerts['admin.report'])
            }
          })
        )
        temp.set(
          'page_local',
          JSON.stringify(
            instance.followingPage || {
              showBoosts: true,
              showReplies: true
            }
          )
        )
        temp.set(
          'page_me',
          JSON.stringify({
            ...instance.mePage,
            followedTags: instance.mePage.followedTags || { shown: false }
          })
        )
        temp.set('drafts', JSON.stringify(instance.drafts))
        temp.set('emojis_frequent', JSON.stringify(instance.frequentEmojis))
        temp.set('version', instance.version)

        if (instance.active) {
          storage.global.set('account.active', account)
          storage.account = temp
        }

        accounts.push(account)
      }

      storage.global.set('accounts', JSON.stringify(accounts))

      // AsyncStorage.removeItem(key)
    }
  } catch (error) {
    console.error('Failed to migrate instances from AsyncStorage to MMKV!', error)
    throw error
  }

  storage.global.set('version.global', 0)

  const end = global.performance.now()
  log('log', 'Migration', `Migrated in ${end - start}ms`)
}
