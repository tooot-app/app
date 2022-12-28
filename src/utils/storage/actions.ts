import { storage } from '@utils/storage'
import {
  MMKV,
  useMMKVBoolean,
  useMMKVListener,
  useMMKVNumber,
  useMMKVObject,
  useMMKVString
} from 'react-native-mmkv'
import { StorageAccount } from './account'
import { StorageGlobal } from './global'

export const getGlobalStorage = {
  string: <T extends keyof StorageGlobal>(key: T) =>
    storage.global.getString(key) as StorageGlobal[T] extends string ? StorageGlobal[T] : never,
  number: <T extends keyof StorageGlobal>(key: T) =>
    storage.global.getNumber(key) as StorageGlobal[T] extends number ? StorageGlobal[T] : never,
  boolean: <T extends keyof StorageGlobal>(key: T) =>
    storage.global.getBoolean(key) as StorageGlobal[T] extends boolean ? StorageGlobal[T] : never,
  object: <T extends keyof StorageGlobal>(key: T) =>
    JSON.parse(storage.global.getString(key) || '') as StorageGlobal[T] extends object
      ? StorageGlobal[T]
      : never
}
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
export const setGlobalStorage = <T extends keyof StorageGlobal>(key: T, value: StorageGlobal[T]) =>
  storage.global.set(
    key,
    typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
      ? value
      : JSON.stringify(value)
  )
export const useGlobalStorageListener = (key: keyof StorageGlobal, func: () => void) =>
  useMMKVListener(keyChanged => {
    if (keyChanged === key) func()
  })

export const getAccountStorage = {
  string: <T extends keyof StorageAccount>(key: T) =>
    storage.account?.getString(key) as StorageAccount[T] extends string ? StorageAccount[T] : never,
  number: <T extends keyof StorageAccount>(key: T) =>
    storage.account?.getNumber(key) as StorageAccount[T] extends number ? StorageAccount[T] : never,
  boolean: <T extends keyof StorageAccount>(key: T) =>
    storage.account?.getBoolean(key) as StorageAccount[T] extends boolean
      ? StorageAccount[T]
      : never,
  object: <T extends keyof StorageAccount>(key: T) =>
    JSON.parse(storage.account?.getString(key) || '') as StorageAccount[T] extends object
      ? StorageAccount[T]
      : never
}
export const useAccountStorage = {
  string: <T extends keyof StorageAccount>(key: T) =>
    useMMKVString(key, storage.account) as StorageAccount[T] extends string
      ? [StorageAccount[T], (valud: StorageAccount[T]) => void]
      : never,
  number: <T extends keyof StorageAccount>(key: T) =>
    useMMKVNumber(key, storage.account) as StorageAccount[T] extends number
      ? [StorageAccount[T], (valud: StorageAccount[T]) => void]
      : never,
  boolean: <T extends keyof StorageAccount>(key: T) =>
    useMMKVBoolean(key, storage.account) as StorageAccount[T] extends boolean
      ? [StorageAccount[T], (valud: StorageAccount[T]) => void]
      : never,
  object: <T extends keyof StorageAccount>(key: T) =>
    useMMKVObject(key, storage.account) as StorageAccount[T] extends object
      ? [StorageAccount[T], (valud: StorageAccount[T]) => void]
      : never
}
export const setAccountStorage = <T extends keyof StorageAccount>(
  key: T,
  value: StorageAccount[T]
) =>
  storage.account?.set(
    key,
    typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
      ? value
      : JSON.stringify(value)
  )

export const generateAccountKey = ({
  domain,
  id
}: {
  domain: Mastodon.Instance<'v1'>['uri'] | Mastodon.Instance<'v2'>['domain']
  id: Mastodon.Account['id']
}) => `${domain}/${id}`

export const getAccountDetails = <T extends Array<keyof StorageAccount>>(
  keys: T,
  account?: string
): Pick<StorageAccount, T[number]> | null => {
  let temp: MMKV
  if (account) {
    temp = new MMKV({ id: account })
  } else {
    if (!storage.account) {
      return null
    }
    temp = storage.account
  }

  const result = {}
  for (const key of keys) {
    switch (key) {
      case 'auth.clientId':
      case 'auth.clientSecret':
      case 'auth.token':
      case 'auth.domain':
      case 'auth.account.id':
      case 'auth.account.acct':
      case 'auth.account.avatar_static':
        // @ts-ignore
        result[key] = temp.getString(key)
        break
      case 'preferences':
      case 'notifications':
      case 'push':
      case 'page_local':
      case 'page_me':
      case 'drafts':
      case 'emojis_frequent':
        // @ts-ignore
        result[key] = JSON.parse(temp.getString(key) || '')
        break
    }
  }
  // @ts-ignore
  return result
}
export const setAccountDetails = <T extends keyof StorageAccount>(
  key: T,
  value: StorageAccount[T],
  account?: string
) => {
  let temp: MMKV
  if (account) {
    temp = new MMKV({ id: account })
  } else {
    if (!storage.account) {
      return null
    }
    temp = storage.account
  }

  temp.set(
    key,
    typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
      ? value
      : JSON.stringify(value)
  )
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
