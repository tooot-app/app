import { displayMessage } from '@components/Message'
import i18n from '@i18n/index'
import apiGeneral from '@utils/api/general'
import navigationRef from '@utils/navigation/navigationRef'
import { queryClient } from '@utils/queryHooks'
import log from '@utils/startup/log'
import { storage } from '@utils/storage'
import { Platform } from 'react-native'
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
      try {
        return JSON.parse(value) as NonNullable<StorageGlobal[T]> extends object
          ? StorageGlobal[T]
          : never
      } catch {
        return undefined
      }
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
  number: <T extends keyof StorageGlobal>(key: T) => {
    if (Platform.OS === 'ios') {
      return useMMKVNumber(key, storage.global) as NonNullable<StorageGlobal[T]> extends number
        ? [StorageGlobal[T], (valud: StorageGlobal[T]) => void]
        : never
    } else {
      const [num, setNum] = useMMKVString(key, storage.global)
      // @ts-ignore
      return [parseInt(num), v => setNum(v.toString())] as NonNullable<
        StorageGlobal[T]
      > extends number
        ? [StorageGlobal[T], (valud: StorageGlobal[T]) => void]
        : never
    }
  },
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
      try {
        return JSON.parse(value) as NonNullable<StorageAccount[T]> extends object
          ? StorageAccount[T]
          : never
      } catch {
        return undefined
      }
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
  const temp = new MMKV({ id: account })
  const token = temp.getString('auth.token')
  const domain = temp.getString('auth.domain')

  if (!token || !domain) {
    await removeAccount(account)
    return
  }

  await apiGeneral<Mastodon.Account>({
    method: 'get',
    domain,
    url: 'api/v1/accounts/verify_credentials',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(res => res.body)
    .then(async a => {
      temp.set('auth.account.acct', a.acct)
      temp.set('auth.account.avatar_static', a.avatar_static)

      log('log', 'setAccount', `binding storage of ${account}`)
      await queryClient.resetQueries()
      queryClient.clear()

      storage.account = temp
      setGlobalStorage('account.active', account)
    })
    .catch(async error => {
      if (error?.status && error.status == 401) {
        log('log', 'setAccount', `unauthorised ${account}`)
        await removeAccount(account)
      }
    })
}

export const removeAccount = async (account: string, warning: boolean = true) => {
  const temp = new MMKV({ id: account })

  if (warning) {
    const acct = temp.getString('auth.account.acct')
    const domain = temp.getString('auth.account.domain')
    displayMessage({
      message: i18n.t('screens:localCorrupt.message'),
      ...(acct && domain && { description: `@${acct}@${domain}` }),
      type: 'danger'
    })
  }
  // @ts-ignore
  navigationRef.navigate('Screen-Tabs', { screen: 'Tab-Me' })

  const revokeDetails = {
    domain: temp.getString('auth.domain'),
    client_id: temp.getString('auth.clientId'),
    client_secret: temp.getString('auth.clientSecret'),
    token: temp.getString('auth.token')
  }
  if (
    revokeDetails.domain &&
    revokeDetails.client_id &&
    revokeDetails.client_secret &&
    revokeDetails.token
  ) {
    apiGeneral({
      method: 'post',
      domain: revokeDetails.domain,
      url: '/oauth/revoke',
      body: revokeDetails
    })
  }

  const currAccounts: NonNullable<StorageGlobal['accounts']> =
    getGlobalStorage.object('accounts') || []
  const nextAccounts: NonNullable<StorageGlobal['accounts']> = currAccounts.filter(
    a => a !== account
  )

  storage.global.set('accounts', JSON.stringify(nextAccounts))

  if (nextAccounts.length) {
    log('log', 'removeAccount', `trying next account ${nextAccounts[nextAccounts.length - 1]}`)
    await setAccount(nextAccounts[nextAccounts.length - 1])
  } else {
    log('log', 'removeAccount', 'setting to undefined')
    await queryClient.resetQueries()
    queryClient.clear()

    storage.account = undefined
    setGlobalStorage('account.active', undefined)
  }

  new MMKV({ id: account }).clearAll()
}

export type ReadableAccountType = {
  avatar_static: string
  acct: string
  key: string
  active: boolean
}
export const getReadableAccounts = (): ReadableAccountType[] => {
  const accountActive = getGlobalStorage.string('account.active')
  const accounts = getGlobalStorage.object('accounts')

  return (
    accounts?.map(account => {
      const details = getAccountDetails(
        [
          'auth.account.avatar_static',
          'auth.account.acct',
          'auth.account.domain',
          'auth.domain',
          'auth.account.id'
        ],
        account
      )
      if (details) {
        return {
          avatar_static: details['auth.account.avatar_static'],
          acct: `@${details['auth.account.acct']}@${details['auth.account.domain']}`,
          key: generateAccountKey({
            domain: details['auth.domain'],
            id: details['auth.account.id']
          }),
          active: account === accountActive
        }
      } else {
        return { avatar_static: '', acct: '', key: '', active: false }
      }
    }) || []
  ).filter(a => a.acct.length)
}
