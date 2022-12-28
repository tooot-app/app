import { getGlobalStorage } from '@utils/storage/actions'
import * as Localization from 'expo-localization'
import { Platform } from 'react-native'

const getLanguage = (): string | undefined => {
  return Platform.OS === 'ios' ? Localization.locale : getGlobalStorage.string('app.language')
}

export default getLanguage
