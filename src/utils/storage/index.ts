import createSecureStore from '@neverdull-agency/expo-unlimited-secure-store'
import { MMKV } from 'react-native-mmkv'

export const storage: { global: MMKV; account?: MMKV } = { global: new MMKV(), account: undefined }

export const secureStorage = createSecureStore()

export const GLOBAL: { connect?: boolean } = {
  connect: undefined
}
