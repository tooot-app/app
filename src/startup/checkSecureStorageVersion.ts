import AsyncStorage from '@react-native-async-storage/async-storage'
import { persistor } from '@root/store'
import log from './log'

// Used to upgrade/invalidate secure storage

const dataKey = '@mastodon_app_database_version'
const currentVersion = '20210105'

const checkSecureStorageVersion = async (): Promise<any> => {
  log(
    'log',
    'checkSecureStorageVersion',
    'Start checking secure storage version'
  )
  try {
    const value = await AsyncStorage.getItem(dataKey)
    if (value !== currentVersion) {
      log(
        'warn',
        'checkSecureStorageVersion',
        `Version does not match. Prev: ${value}. Current: ${currentVersion}.`
      )
      persistor.purge()
      try {
        await AsyncStorage.setItem(dataKey, currentVersion)
      } catch (e) {
        log('error', 'checkSecureStorageVersion', 'Storing storage data error')
        return Promise.reject()
      }
    } else {
      log('log', 'checkSecureStorageVersion', 'Storing storage version matched')
    }
    return Promise.resolve()
  } catch (e) {
    log('error', 'checkSecureStorageVersion', 'Getting storage data error')
    return Promise.reject()
  }
}

export default checkSecureStorageVersion
