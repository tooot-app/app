import apiTooot from '@api/tooot'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from '@root/store'
import { InstanceLatest } from '@utils/migrations/instances/migration'
import { Platform } from 'react-native'
import { getInstance } from '../instancesSlice'
import { setChannels } from './push/utils'

export const updateInstancePushDecode = createAsyncThunk(
  'instances/updatePushDecode',
  async (
    disable: boolean,
    { getState }
  ): Promise<{ disable: InstanceLatest['push']['decode'] }> => {
    const state = getState() as RootState
    const instance = getInstance(state)
    if (!instance?.url || !instance.account.id || !instance.push.keys) {
      return Promise.reject()
    }

    const expoToken = state.app.expoToken
    if (!expoToken) {
      return Promise.reject()
    }

    await apiTooot({
      method: 'put',
      url: `push/update-decode/${expoToken}/${instance.url}/${instance.account.id}`,
      body: {
        auth: !disable ? null : instance.push.keys.auth
      }
    })

    if (Platform.OS === 'android') {
      setChannels(instance, true)
    }

    return Promise.resolve({ disable })
  }
)
