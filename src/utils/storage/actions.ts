import queryClient from '@utils/queryHooks'
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
    storage.global.getString(key) as NonNullable<StorageGlobal[T]> extends string
      ? StorageGlobal[T]
      : never,
  number: <T extends keyof StorageGlobal>(key: T) =>
    storage.global.getNumber(key) as NonNullable<StorageGlobal[T]> extends number
      ? StorageGlobal[T]
      : never,
  boolean: <T extends keyof StorageGlobal>(key: T) =>
    storage.global.getBoolean(key) as NonNullable<StorageGlobal[T]> extends boolean
      ? StorageGlobal[T]
      : never,
  object: <T extends keyof StorageGlobal>(key: T) => {
    const value = storage.global.getString(key)
    if (value?.length) {
      return JSON.parse(value) as NonNullable<StorageGlobal[T]> extends object
        ? StorageGlobal[T]
        : never
    } else {
      return undefined
    }
  }
}
export const useGlobalStorage = {
  string: <T extends keyof StorageGlobal>(key: T) =>
    useMMKVString(key, storage.global) as NonNullable<StorageGlobal[T]> extends string
      ? [StorageGlobal[T], (valud: StorageGlobal[T]) => void]
      : never,
  number: <T extends keyof StorageGlobal>(key: T) =>
    useMMKVNumber(key, storage.global) as NonNullable<StorageGlobal[T]> extends number
      ? [StorageGlobal[T], (valud: StorageGlobal[T]) => void]
      : never,
  boolean: <T extends keyof StorageGlobal>(key: T) =>
    useMMKVBoolean(key, storage.global) as NonNullable<StorageGlobal[T]> extends boolean
      ? [StorageGlobal[T], (valud: StorageGlobal[T]) => void]
      : never,
  object: <T extends keyof StorageGlobal>(key: T) =>
    useMMKVObject(key, storage.global) as NonNullable<StorageGlobal[T]> extends object
      ? [StorageGlobal[T], (valud: StorageGlobal[T]) => void]
      : never
}
export const setGlobalStorage = <T extends keyof StorageGlobal>(
  key: T,
  value: StorageGlobal[T]
) => {
  const checkValue = (): string | number | boolean => {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return value
    } else {
      return JSON.stringify(value)
    }
  }
  if (value !== undefined) {
    storage.global.set(key, checkValue())
  } else {
    storage.global.delete(key)
  }
}
export const useGlobalStorageListener = (key: keyof StorageGlobal, func: () => void) =>
  useMMKVListener(keyChanged => {
    if (keyChanged === key) func()
  })

export const getAccountStorage = {
  string: <T extends keyof StorageAccount>(key: T) =>
    storage.account?.getString(key) as NonNullable<StorageAccount[T]> extends string
      ? StorageAccount[T]
      : never,
  number: <T extends keyof StorageAccount>(key: T) =>
    storage.account?.getNumber(key) as NonNullable<StorageAccount[T]> extends number
      ? StorageAccount[T]
      : never,
  boolean: <T extends keyof StorageAccount>(key: T) =>
    storage.account?.getBoolean(key) as NonNullable<StorageAccount[T]> extends boolean
      ? StorageAccount[T]
      : never,
  object: <T extends keyof StorageAccount>(key: T) => {
    const value = storage.account?.getString(key)
    if (value?.length) {
      return JSON.parse(value) as NonNullable<StorageAccount[T]> extends object
        ? StorageAccount[T]
        : never
    } else {
      return undefined
    }
  }
}
export const useAccountStorage = {
  string: <T extends keyof StorageAccount>(key: T) =>
    useMMKVString(key, storage.account) as NonNullable<StorageAccount[T]> extends string
      ? [StorageAccount[T], (valud: StorageAccount[T]) => void]
      : never,
  number: <T extends keyof StorageAccount>(key: T) =>
    useMMKVNumber(key, storage.account) as NonNullable<StorageAccount[T]> extends number
      ? [StorageAccount[T], (valud: StorageAccount[T]) => void]
      : never,
  boolean: <T extends keyof StorageAccount>(key: T) =>
    useMMKVBoolean(key, storage.account) as NonNullable<StorageAccount[T]> extends boolean
      ? [StorageAccount[T], (valud: StorageAccount[T]) => void]
      : never,
  object: <T extends keyof StorageAccount>(key: T) =>
    useMMKVObject(key, storage.account) as NonNullable<StorageAccount[T]> extends object
      ? [StorageAccount[T], (valud: StorageAccount[T]) => void]
      : never
}
export const setAccountStorage = <T extends keyof StorageAccount>(
  kvs: { key: T; value: StorageAccount[T] }[],
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

  for (const { key, value } of kvs) {
    const checkValue = (): string | number | boolean => {
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        switch (key) {
          case 'version':
            return value.match(new RegExp(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/))?.[0] || '0'
          default:
            return value
        }
      } else {
        return JSON.stringify(value)
      }
    }
    if (value !== undefined) {
      temp.set(key, checkValue())
    } else {
      temp.delete(key)
    }
  }
}
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
      case 'auth.account.acct':
      case 'auth.account.domain':
      case 'auth.account.id':
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
        const value = temp.getString(key)
        if (value?.length) {
          // @ts-ignore
          result[key] = JSON.parse(value)
        } else {
          // @ts-ignore
          result[key] = undefined
        }
        break
    }
  }
  // @ts-ignore
  return result
}

export const generateAccountKey = ({
  domain,
  id
}: {
  domain: Mastodon.Instance<'v1'>['uri'] | Mastodon.Instance<'v2'>['domain']
  id: Mastodon.Account['id']
}) => `${domain}/${id}`

export const setAccount = async (account: string) => {
  storage.account = new MMKV({ id: account })
  setGlobalStorage('account.active', account)
  await queryClient.resetQueries()
}

export const removeAccount = async (account: string) => {
  const currAccounts: NonNullable<StorageGlobal['accounts']> = JSON.parse(
    storage.global.getString('accounts') || '[]'
  )
  const nextAccounts: NonNullable<StorageGlobal['accounts']> = currAccounts.filter(
    a => a !== account
  )

  storage.global.set('accounts', JSON.stringify(nextAccounts))

  if (nextAccounts.length) {
    await setAccount(nextAccounts[nextAccounts.length - 1])
  } else {
    storage.account = undefined
    setGlobalStorage('account.active', undefined)
    queryClient.clear()
  }

  const temp = new MMKV({ id: account })
  temp.clearAll()
}
