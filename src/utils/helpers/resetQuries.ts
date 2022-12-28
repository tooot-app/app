import queryClient from '@utils/helpers/queryClient'
import { storage } from '@utils/storage'
import { MMKV } from 'react-native-mmkv'
import { setGlobalStorage } from '../storage/actions'

const initQuery = async (account: string) => {
  setGlobalStorage('account.active', account)
  storage.account = new MMKV({ id: account })
  await queryClient.resetQueries()
}

export default initQuery
