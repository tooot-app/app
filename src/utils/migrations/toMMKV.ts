import AsyncStorage from '@react-native-async-storage/async-storage'
import log from '@root/startup/log'
import { secureStorage, storage } from '@root/store'
import { MMKV } from 'react-native-mmkv'
import { AppV0 } from './app/v0'
import { ContextsLatest } from './contexts/migration'
import { SettingsLatest } from './settings/migration'

export const hasMigratedFromAsyncStorage = storage.global.getBoolean('hasMigratedFromAsyncStorage')

export async function migrateFromAsyncStorage(): Promise<void> {
  log('log', 'Migration', 'Migrating...')
  const start = global.performance.now()

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
            const storeApp: AppV0 = JSON.parse(value)
            if (storeApp.expoToken) {
              storage.global.set('app.expo_token', storeApp.expoToken)
            }
            break
          case 'persist:contexts':
            const storeContexts: ContextsLatest = JSON.parse(value)
            if (storeContexts.storeReview.current) {
              storage.global.set('app.count_till_store_review', storeContexts.storeReview.current)
            }
            storage.global.set('app.prev_tab', storeContexts.previousTab)
            storage.global.set('app.prev_public_segment', storeContexts.previousSegment)
            break
          case 'persist:settings':
            const storeSettings: SettingsLatest = JSON.parse(value)
            storage.global.set('app.font_size', storeSettings.fontsize)
            storage.global.set('app.language', storeSettings.language)
            storage.global.set('app.theme', storeSettings.theme)
            storage.global.set('app.theme.dark', storeSettings.darkTheme)
            storage.global.set('app.browser', storeSettings.browser)
            storage.global.set('app.auto_play_gifv', storeSettings.autoplayGifv)
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

      for (const instance of JSON.parse(storeInstances.instances)) {
        const account = `${instance.uri}/${instance.account.id}`

        const temp = new MMKV({ id: account })
        temp.set('auth.clientId', instance.appData.clientId)
        temp.set('auth.clientSecret', instance.appData.clientSecret)
        temp.set('auth.token', instance.token)
        temp.set('auth.domain', instance.uri)
        temp.set('auth.account_id', instance.account.id)

        temp.set(
          'account',
          JSON.stringify({
            acct: instance.account.acct,
            avatar_static: instance.account.avatarStatic
          })
        )
        if (instance.account.preferences) {
          temp.set('preferences', JSON.stringify(instance.account.preferences))
        }
        temp.set('filters', JSON.stringify(instance.filters))
        temp.set('notifications', JSON.stringify(instance.notifications_filter))
        temp.set('push', JSON.stringify(instance.push))
        temp.set('page_local', JSON.stringify(instance.followingPage))
        temp.set('instance.mePage', JSON.stringify(instance.mePage))
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

  storage.global.set('hasMigratedFromAsyncStorage', true)

  const end = global.performance.now()
  log('log', 'Migration', `Migrated in ${end - start}ms`)
}
