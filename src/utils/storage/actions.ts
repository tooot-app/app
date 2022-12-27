import { storage } from '@root/store'
import {
  MMKV,
  useMMKVBoolean,
  useMMKVNumber,
  useMMKVObject,
  useMMKVString
} from 'react-native-mmkv'
import { StorageGlobal } from './versions/global'

export const useGlobalStorage = {
  string: <T extends keyof StorageGlobal>(key: T) =>
    useMMKVString(key, storage.global) as StorageGlobal[T] extends string
      ? [StorageGlobal[T], (valud: StorageGlobal[T]) => void]
      : never,
  number: <T extends keyof StorageGlobal>(key: T) =>
    useMMKVNumber(key, storage.global) as StorageGlobal[T] extends number
      ? [StorageGlobal[T], (valud: StorageGlobal[T]) => void]
      : never,
  boolean: <T extends keyof StorageGlobal>(key: T) =>
    useMMKVBoolean(key, storage.global) as StorageGlobal[T] extends boolean
      ? [StorageGlobal[T], (valud: StorageGlobal[T]) => void]
      : never,
  object: <T extends keyof StorageGlobal>(key: T) =>
    useMMKVObject(key, storage.global) as StorageGlobal[T] extends object
      ? [StorageGlobal[T], (valud: StorageGlobal[T]) => void]
      : never
}

export const removeAccount = (account: string) => {
  const valueAccounts = storage.global.getString('accounts')
  if (valueAccounts) {
    const accounts: string[] = JSON.parse(valueAccounts)
    storage.global.set('accounts', JSON.stringify(accounts.filter(a => a !== account)))

    const temp = new MMKV({ id: account })
    temp.clearAll()
  }
}
