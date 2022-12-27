import { storage } from '@root/store'
import * as Localization from 'expo-localization'
import { Platform } from 'react-native'

const getLanguage = (): string | undefined => {
  return Platform.OS === 'ios' ? Localization.locale : storage.global.getString('app.language')
}

export default getLanguage
