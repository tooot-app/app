import apiTooot from '@api/tooot'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { InstanceLatest } from '@utils/migrations/instances/migration'
import { getAccountDetails, getGlobalStorage } from '@utils/storage/actions'
import { Platform } from 'react-native'
import { setChannels } from './push/utils'

export const updateInstancePushDecode = createAsyncThunk(
  'instances/updatePushDecode',
  async (
    disable: boolean,
    { getState }
  ): Promise<{ disable: InstanceLatest['push']['decode'] }> => {
    const expoToken = getGlobalStorage.string('app.expo_token')
    if (!expoToken) {
      return Promise.reject()
    }

    const accountDetails = getAccountDetails(['auth.domain', 'auth.account.id', 'push'])
    if (
      !accountDetails?.['auth.domain'] ||
      !accountDetails['auth.account.id'] ||
      !accountDetails.push.key
    ) {
      return Promise.reject()
    }

    await apiTooot({
      method: 'put',
      url: `push/update-decode/${expoToken}/${accountDetails['auth.domain']}/${accountDetails['auth.account.id']}`,
      body: { auth: !disable ? null : accountDetails.push.key }
    })

    if (Platform.OS === 'android') {
      setChannels(true)
    }

    return Promise.resolve({ disable })
  }
)
