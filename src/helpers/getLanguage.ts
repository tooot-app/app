import { store } from '@root/store'
import { getSettingsLanguage } from '@utils/slices/settingsSlice'
import * as Localization from 'expo-localization'
import { Platform } from "react-native"

const getLanguage = (): string => {
  return Platform.OS === 'ios'
    ? Localization.locale
    : getSettingsLanguage(store.getState())
}

export default getLanguage